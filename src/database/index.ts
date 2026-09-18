import * as SQLite from 'expo-sqlite';
import { DailyRecord, Task, Goal, Setting } from '../models';
import { getToday } from '../utils/dateUtils';

const dbName = 'pcc_v3.db';

// Open the connection once and reuse it
const db = SQLite.openDatabaseSync(dbName);

export const getDb = () => {
  return db;
};

export const initializeDatabase = () => {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      aptitude_minutes INTEGER DEFAULT 0,
      dsa_minutes INTEGER DEFAULT 0,
      other_learning_minutes INTEGER DEFAULT 0,
      work_minutes INTEGER DEFAULT 0,
      income REAL DEFAULT 0,
      expenses REAL DEFAULT 0,
      workout_completed INTEGER DEFAULT 0,
      workout_minutes INTEGER DEFAULT 0,
      weight REAL DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      tasks_total INTEGER DEFAULT 0,
      daily_score REAL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      category TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT '',
      metric TEXT DEFAULT '',
      target REAL DEFAULT 0,
      period TEXT DEFAULT 'month',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
};

// --- Daily Records ---

export const createDailyRecord = (record: Partial<DailyRecord>): number => {
  const date = record.date || getToday();
  const now = new Date().toISOString();
  
  const result = db.runSync(
    `INSERT INTO daily_records (
      date, aptitude_minutes, dsa_minutes, other_learning_minutes, 
      work_minutes, income, expenses, workout_completed, 
      workout_minutes, weight, tasks_completed, 
      tasks_total, daily_score, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      date, record.aptitude_minutes || 0, record.dsa_minutes || 0, record.other_learning_minutes || 0,
      record.work_minutes || 0, record.income || 0, record.expenses || 0, record.workout_completed || 0,
      record.workout_minutes || 0, record.weight || 0, record.tasks_completed || 0, record.tasks_total || 0,
      record.daily_score || 0, record.notes || '', now, now
    ]
  );
  return result.lastInsertRowId;
};

export const getDailyRecord = (date: string): DailyRecord | null => {
  return db.getFirstSync<DailyRecord>('SELECT * FROM daily_records WHERE date = ?', [date]);
};

export const updateDailyRecord = (date: string, updates: Partial<DailyRecord>): void => {
  const now = new Date().toISOString();
  const validKeys = Object.keys(updates).filter(k => k !== 'id' && k !== 'date' && k !== 'created_at');
  
  if (validKeys.length === 0) return;
  
  const setString = validKeys.map(k => `${k} = ?`).join(', ');
  const values = validKeys.map(k => (updates as any)[k]);
  
  values.push(now, date);
  
  db.runSync(`UPDATE daily_records SET ${setString}, updated_at = ? WHERE date = ?`, values);
};

export const deleteDailyRecord = (date: string): void => {
  db.runSync('DELETE FROM daily_records WHERE date = ?', [date]);
};

export const getDailyRecords = (limit: number = 30): DailyRecord[] => {
  return db.getAllSync<DailyRecord>('SELECT * FROM daily_records ORDER BY date DESC LIMIT ?', [limit]);
};

export const getRecordsForDateRange = (startDate: string, endDate: string): DailyRecord[] => {
  return db.getAllSync<DailyRecord>(
    'SELECT * FROM daily_records WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startDate, endDate]
  );
};

// --- Tasks ---

export const createTask = (task: Partial<Task>): number => {
  const now = new Date().toISOString();
  const result = db.runSync(
    'INSERT INTO tasks (title, date, completed, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [task.title || '', task.date || getToday(), task.completed || 0, task.category || '', now, now]
  );
  return result.lastInsertRowId;
};

export const updateTask = (id: number, updates: Partial<Task>): void => {
  const now = new Date().toISOString();
  const validKeys = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at');
  
  if (validKeys.length === 0) return;
  
  const setString = validKeys.map(k => `${k} = ?`).join(', ');
  const values = validKeys.map(k => (updates as any)[k]);
  
  values.push(now, id);
  
  db.runSync(`UPDATE tasks SET ${setString}, updated_at = ? WHERE id = ?`, values);
};

export const deleteTask = (id: number): void => {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
};

export const getTasks = (date: string): Task[] => {
  return db.getAllSync<Task>('SELECT * FROM tasks WHERE date = ?', [date]);
};

// --- Goals ---

export const createGoal = (goal: Partial<Goal>): number => {
  const now = new Date().toISOString();
  const result = db.runSync(
    'INSERT INTO goals (title, category, metric, target, period, start_date, end_date, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      goal.title || '', goal.category || '', goal.metric || '', goal.target || 0, goal.period || 'month',
      goal.start_date || getToday(), goal.end_date || getToday(), goal.completed || 0, now, now
    ]
  );
  return result.lastInsertRowId;
};

export const updateGoal = (id: number, updates: Partial<Goal>): void => {
  const now = new Date().toISOString();
  const validKeys = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at');
  
  if (validKeys.length === 0) return;
  
  const setString = validKeys.map(k => `${k} = ?`).join(', ');
  const values = validKeys.map(k => (updates as any)[k]);
  
  values.push(now, id);
  
  db.runSync(`UPDATE goals SET ${setString}, updated_at = ? WHERE id = ?`, values);
};

export const deleteGoal = (id: number): void => {
  db.runSync('DELETE FROM goals WHERE id = ?', [id]);
};

export const getGoals = (): Goal[] => {
  return db.getAllSync<Goal>('SELECT * FROM goals ORDER BY start_date DESC');
};

// --- Settings ---

export const getSetting = (key: string): string | null => {
  const setting = db.getFirstSync<Setting>('SELECT * FROM settings WHERE key = ?', [key]);
  return setting ? setting.value : null;
};

export const setSetting = (key: string, value: string): void => {
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};
