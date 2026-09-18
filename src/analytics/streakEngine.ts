
import { DailyRecord } from '../models';

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  perfectDays: number;
}

export const calculateStreaks = (records: DailyRecord[], threshold: number = 7.0): StreakStats => {
  if (!records || records.length === 0) {
    return { currentStreak: 0, bestStreak: 0, perfectDays: 0 };
  }

  // Sort by date descending (newest first)
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  let bestStreak = 0;
  let perfectDays = 0;

  let tempStreak = 0;
  let lastDate: Date | null = null;

  // Calculate best streak and perfect days
  sorted.forEach(r => {
    if ((r.daily_score || 0) >= 9.9) perfectDays++;
  });

  // Calculate Best Streak (requires chronological forward iteration)
  const ascending = [...sorted].reverse();
  ascending.forEach(r => {
    const score = r.daily_score || 0;
    
    if (score >= threshold) {
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const currDate = new Date(r.date);
        const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1; // broken streak
        }
      }
      lastDate = new Date(r.date);
    } else {
      tempStreak = 0;
      lastDate = null;
    }
    
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  });

  // Calculate Current Streak
  currentStreak = 0;
  
  // To handle grace period, we check today and yesterday
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate = new Date(todayStr);
  
  // If today is logged and < threshold, streak is 0.
  const todayRecord = sorted.find(r => r.date === todayStr);
  if (todayRecord && (todayRecord.daily_score || 0) < threshold) {
    currentStreak = 0;
  } else {
    // Start tracing backwards from today
    let traceDate = todayStr;
    // If today has no record, we allow grace period and start trace from yesterday
    if (!todayRecord) {
      traceDate = yesterdayStr;
    }

    let active = true;
    let traceIndex = 0;
    
    // We will simulate a backward trace
    let currentTraceDate = new Date(traceDate);
    
    while (active && traceIndex < 365) {
      const dStr = currentTraceDate.toISOString().split('T')[0];
      const rec = sorted.find(r => r.date === dStr);
      
      if (rec && (rec.daily_score || 0) >= threshold) {
        currentStreak++;
        currentTraceDate.setDate(currentTraceDate.getDate() - 1); // move back 1 day
        traceIndex++;
      } else {
        active = false;
      }
    }
  }

  // Edge case: if current is somehow higher than best (e.g. today computed but not in ascending loop?)
  if (currentStreak > bestStreak) bestStreak = currentStreak;

  return {
    currentStreak,
    bestStreak,
    perfectDays
  };
};

