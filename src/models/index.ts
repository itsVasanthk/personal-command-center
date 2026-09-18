export interface DailyRecord {
  id: number;
  date: string;
  aptitude_minutes: number;
  dsa_minutes: number;
  other_learning_minutes: number;
  work_minutes: number;
  income: number;
  expenses: number;
  workout_completed: number; // 0 or 1
  workout_minutes: number;
  weight: number;
  tasks_completed: number;
  tasks_total: number;
  daily_score: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  date: string;
  completed: number; // 0 or 1
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  title: string;
  category: string;
  metric: string;
  target: number;
  period: string;
  start_date: string;
  end_date: string;
  completed: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
}
