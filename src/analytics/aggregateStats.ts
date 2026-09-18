import { DailyRecord } from '../models';
import { calculateAverage, calculateTotal } from './mathUtils';
import { useStore } from '../store';
import * as db from '../database';
import { calculateDailyScore } from './calculateDailyScore';

export interface AggregateStats {
  daysRecorded: number;
  averageScore: number;
  totalStudyMinutes: number;
  totalAptitudeMinutes: number;
  totalDsaMinutes: number;
  totalOtherLearningMinutes: number;
  totalWorkMinutes: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  workoutCount: number;
  totalWorkoutMinutes: number;
  averageWorkoutDuration: number;
}

export const getAggregateStats = (records: DailyRecord[]): AggregateStats => {
  if (!records || records.length === 0) {
    return {
      daysRecorded: 0,
      averageScore: 0,
      totalStudyMinutes: 0,
      totalAptitudeMinutes: 0,
      totalDsaMinutes: 0,
      totalOtherLearningMinutes: 0,
      totalWorkMinutes: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      workoutCount: 0,
      totalWorkoutMinutes: 0,
      averageWorkoutDuration: 0,
    };
  }

  const daysRecorded = records.length;
  
  const { weights, targets, enabledMetrics } = useStore.getState();
  const averageScore = calculateAverage(records.map(r => {
    if (r.daily_score && r.daily_score > 0) return r.daily_score;
    const tasks = db.getTasks(r.date);
    return calculateDailyScore(r, tasks, weights, targets, enabledMetrics);
  }));

  const totalAptitudeMinutes = calculateTotal(records.map(r => r.aptitude_minutes || 0));
  const totalDsaMinutes = calculateTotal(records.map(r => r.dsa_minutes || 0));
  const totalOtherLearningMinutes = calculateTotal(records.map(r => r.other_learning_minutes || 0));
  const totalStudyMinutes = totalAptitudeMinutes + totalDsaMinutes + totalOtherLearningMinutes;

  const totalWorkMinutes = calculateTotal(records.map(r => r.work_minutes || 0));
  const totalIncome = calculateTotal(records.map(r => r.income || 0));
  const totalExpenses = calculateTotal(records.map(r => r.expenses || 0));
  const netIncome = totalIncome - totalExpenses;

  const workoutCount = records.filter(r => r.workout_completed === 1).length;
  const totalWorkoutMinutes = calculateTotal(records.map(r => r.workout_minutes || 0));
  const averageWorkoutDuration = workoutCount > 0 ? totalWorkoutMinutes / workoutCount : 0;

  return {
    daysRecorded,
    averageScore,
    totalStudyMinutes,
    totalAptitudeMinutes,
    totalDsaMinutes,
    totalOtherLearningMinutes,
    totalWorkMinutes,
    totalIncome,
    totalExpenses,
    netIncome,
    workoutCount,
    totalWorkoutMinutes,
    averageWorkoutDuration,
  };
};

export const calculateCareerStats = (records: DailyRecord[]) => {
  return {
    aptitude: calculateTotal(records.map(r => r.aptitude_minutes || 0)),
    dsa: calculateTotal(records.map(r => r.dsa_minutes || 0)),
    other: calculateTotal(records.map(r => r.other_learning_minutes || 0)),
  };
};

export const calculateFinancialStats = (records: DailyRecord[]) => {
  const totalIncome = calculateTotal(records.map(r => r.income || 0));
  const totalExpenses = calculateTotal(records.map(r => r.expenses || 0));
  const netIncome = totalIncome - totalExpenses;
  
  const totalWorkHours = calculateTotal(records.map(r => r.work_minutes || 0)) / 60;
  
  const averageIncomePerWorkHour = totalWorkHours > 0 ? totalIncome / totalWorkHours : 0;
  const averageNetIncomePerWorkHour = totalWorkHours > 0 ? netIncome / totalWorkHours : 0;

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    averageIncomePerWorkHour,
    averageNetIncomePerWorkHour,
  };
};

export const calculateFitnessStats = (records: DailyRecord[]) => {
  const workoutCount = records.filter(r => r.workout_completed === 1).length;
  const totalWorkoutMinutes = calculateTotal(records.map(r => r.workout_minutes || 0));
  
  const weights = records.map(r => r.weight).filter(w => w > 0);
  const averageWeight = weights.length > 0 ? calculateAverage(weights) : 0;

  return {
    workoutCount,
    totalWorkoutMinutes,
    averageWorkoutDuration: workoutCount > 0 ? totalWorkoutMinutes / workoutCount : 0,
    averageWeight,
  };
};
