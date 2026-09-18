import { DailyRecord, Task } from '../models';
import { Weights, Targets, EnabledMetrics } from '../store';

export const calculateDailyScore = (
  record: DailyRecord | null,
  tasks: Task[],
  weights: Weights,
  targets: Targets,
  enabled: EnabledMetrics
): number => {
  if (!record) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  // 1. Career
  if (enabled.career) {
    const aptitudeScore = targets.aptitude_minutes > 0 ? Math.min(1, record.aptitude_minutes / targets.aptitude_minutes) : 0;
    const dsaScore = targets.dsa_minutes > 0 ? Math.min(1, record.dsa_minutes / targets.dsa_minutes) : 0;
    const otherScore = targets.other_learning_minutes > 0 ? Math.min(1, record.other_learning_minutes / targets.other_learning_minutes) : 0;
    
    // Average of 3 components
    const activeTargets = (targets.aptitude_minutes > 0 ? 1 : 0) + (targets.dsa_minutes > 0 ? 1 : 0) + (targets.other_learning_minutes > 0 ? 1 : 0);
    const careerProgress = activeTargets > 0 ? (aptitudeScore + dsaScore + otherScore) / activeTargets : 0;
    
    totalScore += careerProgress * weights.career;
    totalWeight += weights.career;
  }

  // 2. Work
  if (enabled.work) {
    const workProgress = targets.work_minutes > 0 ? Math.min(1, record.work_minutes / targets.work_minutes) : 0;
    totalScore += workProgress * weights.work;
    totalWeight += weights.work;
  }

  // 3. Fitness
  if (enabled.fitness) {
    let workoutProgress = targets.workout_minutes > 0 ? Math.min(1, record.workout_minutes / targets.workout_minutes) : 0;
    if (record.workout_completed === 1) workoutProgress = 1; // Auto 100% if marked complete
    
    totalScore += workoutProgress * weights.fitness;
    totalWeight += weights.fitness;
  }

  // 4. Tasks (Always enabled)
  const completedTasks = tasks.filter(t => t.completed === 1).length;
  const taskProgress = tasks.length > 0 ? completedTasks / tasks.length : 0;
  
  if (tasks.length > 0) {
    totalScore += taskProgress * weights.tasks;
    totalWeight += weights.tasks;
  }

  if (totalWeight === 0) return 0;

  // Final Score scaled to 0-10 based on active weights
  const score = (totalScore / totalWeight) * 10;
  return Math.min(10.0, Math.round(score * 10) / 10);
};
