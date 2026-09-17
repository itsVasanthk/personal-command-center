export interface DailyRecord {
  id: number;
  date: string;
  study_hours: number;
  aptitude_questions: number;
  dsa_problems: number;
  python_hours: number;
  other_learning_hours: number;
  work_hours: number;
  income: number;
  expenses: number;
  workout_completed: number; // 0 or 1
  workout_minutes: number;
  weight: number;
  screen_time_minutes: number;
  sleep_hours: number;
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
