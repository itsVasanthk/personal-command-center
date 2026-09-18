import { create } from 'zustand';
import { DailyRecord, Task, Goal } from '../models';
import * as db from '../database';
import { calculateDailyScore } from '../analytics/calculateDailyScore';
import { calculateStreaks, StreakStats } from '../analytics/streakEngine';
import { getToday } from '../utils/dateUtils';

export interface Targets {
  aptitude_minutes: number;
  dsa_minutes: number;
  other_learning_minutes: number;
  work_minutes: number;
  workout_minutes: number;
}

export interface Weights {
  career: number;
  work: number;
  fitness: number;
  tasks: number;
}

export interface EnabledMetrics {
  career: boolean;
  work: boolean;
  fitness: boolean;
}

const DEFAULT_TARGETS: Targets = {
  aptitude_minutes: 60,
  dsa_minutes: 60,
  other_learning_minutes: 60,
  work_minutes: 480, // 8 hours
  workout_minutes: 45,
};

const DEFAULT_WEIGHTS: Weights = {
  career: 40,
  work: 20,
  fitness: 20,
  tasks: 20,
};

const DEFAULT_ENABLED: EnabledMetrics = {
  career: true,
  work: true,
  fitness: true,
};

interface AppState {
  todayRecord: DailyRecord | null;
  tasks: Task[];
  goals: Goal[];
  targets: Targets;
  weights: Weights;
  enabledMetrics: EnabledMetrics;
  streaks: StreakStats;
  isInitialized: boolean;
  theme: string;
  currency: string;
  
  initializeStore: () => Promise<void>;
  loadTodayData: () => void;
  loadGoals: () => void;
  setTheme: (theme: string) => void;
  setCurrency: (currency: string) => void;
  setTargets: (targets: Targets) => void;
  setWeights: (weights: Weights) => void;
  setEnabledMetrics: (enabled: EnabledMetrics) => void;
  
  updateTodayRecord: (updates: Partial<DailyRecord>) => void;
  addTask: (title: string) => void;
  toggleTask: (id: number, currentStatus: number) => void;
  deleteTask: (id: number) => void;
  
  addGoal: (goal: Partial<Goal>) => void;
  editGoal: (id: number, updates: Partial<Goal>) => void;
  removeGoal: (id: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  todayRecord: null,
  tasks: [],
  goals: [],
  targets: DEFAULT_TARGETS,
  weights: DEFAULT_WEIGHTS,
  enabledMetrics: DEFAULT_ENABLED,
  streaks: { currentStreak: 0, bestStreak: 0, perfectDays: 0 },
  isInitialized: false,
  theme: 'system',
  currency: '₹',

  initializeStore: async () => {
    try {
      db.initializeDatabase();
      const savedTheme = db.getSetting('theme');
      if (savedTheme) set({ theme: savedTheme });
      
      const savedCurrency = db.getSetting('currency');
      if (savedCurrency) set({ currency: savedCurrency });
      
      const savedTargets = db.getSetting('targets');
      if (savedTargets) {
        set({ targets: { ...DEFAULT_TARGETS, ...JSON.parse(savedTargets) } });
      } else {
        db.setSetting('targets', JSON.stringify(DEFAULT_TARGETS));
      }

      const savedWeights = db.getSetting('weights');
      if (savedWeights) {
        set({ weights: { ...DEFAULT_WEIGHTS, ...JSON.parse(savedWeights) } });
      } else {
        db.setSetting('weights', JSON.stringify(DEFAULT_WEIGHTS));
      }

      const savedEnabled = db.getSetting('enabled_metrics');
      if (savedEnabled) {
        set({ enabledMetrics: { ...DEFAULT_ENABLED, ...JSON.parse(savedEnabled) } });
      } else {
        db.setSetting('enabled_metrics', JSON.stringify(DEFAULT_ENABLED));
      }

      get().loadTodayData();
      get().loadGoals();
      
      // MIGRATION: Backfill any existing 0 scores in the DB (for old records before the dynamic fix)
      const allRecords = db.getDailyRecords(365);
      const { weights: cw, targets: ct, enabledMetrics: ce } = get();
      allRecords.forEach(r => {
        if (!r.daily_score || r.daily_score === 0) {
          const pastTasks = db.getTasks(r.date);
          const computed = calculateDailyScore(r, pastTasks, cw, ct, ce);
          if (computed > 0) {
            db.updateDailyRecord(r.date, { daily_score: computed });
          }
        }
      });

      // Recalculate streaks
      const finalRecords = db.getDailyRecords(365);
      const computedStreaks = calculateStreaks(finalRecords, 7.0);

      set({ 
        isInitialized: true,
        streaks: computedStreaks
      });
    } catch (error) {
      console.error('Failed to initialize DB', error);
    }
  },

  loadTodayData: () => {
    const today = getToday();
    const record = db.getDailyRecord(today);
    const todayTasks = db.getTasks(today);
    
    const allRecords = db.getDailyRecords(365);
    const computedStreaks = calculateStreaks(allRecords, 7.0);
    
    set({ todayRecord: record, tasks: todayTasks, streaks: computedStreaks });
  },

  loadGoals: () => {
    const goals = db.getGoals();
    set({ goals });
  },

  setTheme: (theme: string) => {
    db.setSetting('theme', theme);
    set({ theme });
  },

  setCurrency: (currency: string) => {
    db.setSetting('currency', currency);
    set({ currency });
  },

  setTargets: (targets: Targets) => {
    db.setSetting('targets', JSON.stringify(targets));
    set({ targets });
  },

  setWeights: (weights: Weights) => {
    db.setSetting('weights', JSON.stringify(weights));
    set({ weights });
  },

  setEnabledMetrics: (enabledMetrics: EnabledMetrics) => {
    db.setSetting('enabled_metrics', JSON.stringify(enabledMetrics));
    set({ enabledMetrics });
  },

  updateTodayRecord: (updates: Partial<DailyRecord>) => {
    const today = getToday();
    let record = db.getDailyRecord(today);
    if (!record) {
      db.createDailyRecord({ date: today, ...updates });
    } else {
      db.updateDailyRecord(today, updates);
    }
    
    // Update tasks completion stats & SCORE
    const updatedRecord = db.getDailyRecord(today);
    if (updatedRecord) {
      const todayTasks = db.getTasks(today);
      const { weights, targets, enabledMetrics } = get();
      
      // We must calculate the score on the fly to persist it for analytics
      const newScore = calculateDailyScore(updatedRecord, todayTasks, weights, targets, enabledMetrics);
      
      db.updateDailyRecord(today, {
        tasks_total: todayTasks.length,
        tasks_completed: todayTasks.filter(t => t.completed === 1).length,
        daily_score: newScore
      });
    }

    get().loadTodayData();
  },

  addTask: (title: string) => {
    const today = getToday();
    db.createTask({ title, date: today, completed: 0 });
    get().loadTodayData();
    get().updateTodayRecord({});
  },

  toggleTask: (id: number, currentStatus: number) => {
    db.updateTask(id, { completed: currentStatus === 1 ? 0 : 1 });
    get().loadTodayData();
    get().updateTodayRecord({});
  },

  deleteTask: (id: number) => {
    db.deleteTask(id);
    get().loadTodayData();
    get().updateTodayRecord({});
  },

  addGoal: (goal: Partial<Goal>) => {
    db.createGoal(goal);
    get().loadGoals();
  },

  editGoal: (id: number, updates: Partial<Goal>) => {
    db.updateGoal(id, updates);
    get().loadGoals();
  },

  removeGoal: (id: number) => {
    db.deleteGoal(id);
    get().loadGoals();
  }
}));
