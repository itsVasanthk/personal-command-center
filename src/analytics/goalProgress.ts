import { Goal, DailyRecord } from '../models';

export interface GoalProgressResult {
  current: number;
  target: number;
  progressPercentage: number;
  remaining: number;
}

export const calculateGoalProgress = (goal: Goal, records: DailyRecord[]): GoalProgressResult => {
  let current = 0;

  // Aggregate based on the requested metric
  records.forEach(record => {
    switch (goal.metric) {
      case 'aptitude_minutes':
        current += record.aptitude_minutes || 0;
        break;
      case 'dsa_minutes':
        current += record.dsa_minutes || 0;
        break;
      case 'other_learning_minutes':
        current += record.other_learning_minutes || 0;
        break;
      case 'work_minutes':
        current += record.work_minutes || 0;
        break;
      case 'income':
        current += record.income || 0;
        break;
      case 'workout_minutes':
        current += record.workout_minutes || 0;
        break;
      case 'workout_completed':
        current += record.workout_completed ? 1 : 0;
        break;
      default:
        break;
    }
  });

  const target = goal.target || 1;
  const progressPercentage = Math.round((current / target) * 100);
  const remaining = Math.max(0, target - current);

  return {
    current,
    target,
    progressPercentage,
    remaining
  };
};
