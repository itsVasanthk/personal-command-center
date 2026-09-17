import { create } from 'zustand';
import { DailyRecord, Task, Goal } from '../models';
import * as db from '../database';
import { getToday } from '../utils/dateUtils';

interface AppState {
  todayRecord: DailyRecord | null;
  tasks: Task[];
  goals: Goal[];
  isInitialized: boolean;
  theme: string;
  
  initializeStore: () => Promise<void>;
  loadTodayData: () => void;
  loadGoals: () => void;
  addTestRecord: () => void;
  setTheme: (theme: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  todayRecord: null,
  tasks: [],
  goals: [],
  isInitialized: false,
  theme: 'system',

  initializeStore: async () => {
    try {
      db.initializeDatabase();
      const savedTheme = db.getSetting('theme');
      if (savedTheme) {
        set({ theme: savedTheme });
      }
      get().loadTodayData();
      get().loadGoals();
      set({ isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize DB', error);
    }
  },

  loadTodayData: () => {
    const today = getToday();
    const record = db.getDailyRecord(today);
    const todayTasks = db.getTasks(today);
    set({ todayRecord: record, tasks: todayTasks });
  },

  loadGoals: () => {
    const goals = db.getGoals();
    set({ goals });
  },

  addTestRecord: () => {
    const today = getToday();
    let record = db.getDailyRecord(today);
    if (!record) {
      db.createDailyRecord({
        date: today,
        study_hours: 2,
        notes: 'Test record created via dev tools'
      });
    } else {
      db.updateDailyRecord(today, {
        study_hours: record.study_hours + 1
      });
    }
    get().loadTodayData();
  },

  setTheme: (theme: string) => {
    db.setSetting('theme', theme);
    set({ theme });
  }
}));
