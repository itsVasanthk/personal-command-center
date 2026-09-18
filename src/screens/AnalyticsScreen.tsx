import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { 
  getStartOfWeek, 
  getEndOfWeek, 
  getPreviousWeek, 
  getNextWeek,
  getStartOfMonth,
  getEndOfMonth,
  getPreviousMonth,
  getNextMonth,
  getLast90Days,
  formatDateShort,
  formatMonthYear,
  getDaysInDateRange,
  getToday
} from '../utils/dateUtils';
import { formatMinutes } from '../utils/timeUtils';
import * as db from '../database';
import { calculateDailyScore } from '../analytics/calculateDailyScore';
import { 
  getAggregateStats, 
  calculateCareerStats, 
  calculateFinancialStats, 
  calculateFitnessStats 
} from '../analytics/aggregateStats';
import { TrendIndicator } from '../components/TrendIndicator';
import { Card } from '../components/Card';
import { DailyRecord } from '../models';

type Tab = 'Today' | 'Week' | 'Month' | '90Days';

export const AnalyticsScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const [activeTab, setActiveTab] = useState<Tab>('Week');
  
  const [weekStart, setWeekStart] = useState(getStartOfWeek());
  const [monthStart, setMonthStart] = useState(getStartOfMonth());
  const [ninetyDayEnd, setNinetyDayEnd] = useState(getToday());

  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [prevRecords, setPrevRecords] = useState<DailyRecord[]>([]);

  const fetchData = useCallback(() => {
    let start = '';
    let end = '';
    let prevStart = '';
    let prevEnd = '';

    if (activeTab === 'Today') {
      start = getToday();
      end = getToday();
      const d = new Date();
      d.setDate(d.getDate() - 1);
      prevStart = d.toISOString().split('T')[0];
      prevEnd = prevStart;
    } else if (activeTab === 'Week') {
      start = weekStart;
      end = getEndOfWeek(weekStart);
      prevStart = getPreviousWeek(weekStart);
      prevEnd = getEndOfWeek(prevStart);
    } else if (activeTab === 'Month') {
      start = monthStart;
      end = getEndOfMonth(monthStart);
      prevStart = getPreviousMonth(monthStart);
      prevEnd = getEndOfMonth(prevStart);
    } else if (activeTab === '90Days') {
      start = getLast90Days(ninetyDayEnd);
      end = ninetyDayEnd;
      // For 90 days, we might compare with previous 90 days
      prevStart = getLast90Days(start);
      const d = new Date(start);
      d.setDate(d.getDate() - 1);
      prevEnd = d.toISOString().split('T')[0];
    }

    const currentRecords = db.getRecordsForDateRange(start, end);
    const previousRecords = db.getRecordsForDateRange(prevStart, prevEnd);

    setRecords(currentRecords);
    setPrevRecords(previousRecords);
  }, [activeTab, weekStart, monthStart, ninetyDayEnd]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handlePrev = () => {
    if (activeTab === 'Week') setWeekStart(getPreviousWeek(weekStart));
    if (activeTab === 'Month') setMonthStart(getPreviousMonth(monthStart));
  };

  const handleNext = () => {
    if (activeTab === 'Week') {
      const next = getNextWeek(weekStart);
      if (new Date(next) <= new Date(getStartOfWeek(getToday()))) setWeekStart(next);
    }
    if (activeTab === 'Month') {
      const next = getNextMonth(monthStart);
      if (new Date(next) <= new Date(getStartOfMonth(getToday()))) setMonthStart(next);
    }
  };

  const isNextDisabled = () => {
    if (activeTab === 'Week') return weekStart === getStartOfWeek(getToday());
    if (activeTab === 'Month') return monthStart === getStartOfMonth(getToday());
    return true; // 90 days and Today don't have next in this basic view
  };

  const renderNav = () => {
    if (activeTab === 'Today' || activeTab === '90Days') {
      const text = activeTab === 'Today' ? formatDateShort(getToday()) : `${formatDateShort(getLast90Days(ninetyDayEnd))} - ${formatDateShort(ninetyDayEnd)}`;
      return (
        <View style={styles.header}>
          <Text style={styles.weekText}>{text}</Text>
        </View>
      );
    }

    const titleText = activeTab === 'Week' 
      ? `${formatDateShort(weekStart)} - ${formatDateShort(getEndOfWeek(weekStart))}` 
      : formatMonthYear(monthStart);

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'< Prev'}</Text>
        </TouchableOpacity>
        <Text style={styles.weekText}>{titleText}</Text>
        <TouchableOpacity 
          onPress={handleNext} 
          style={[styles.navButton, isNextDisabled() && styles.navButtonDisabled]}
          disabled={isNextDisabled()}
        >
          <Text style={[styles.navButtonText, isNextDisabled() && styles.navButtonDisabledText]}>{'Next >'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCharts = () => {
    if (activeTab === '90Days') return render90DayCharts();
    if (activeTab === 'Month') return renderMonthCharts();
    if (activeTab === 'Week') return renderWeekCharts();
    return null;
  };

    const getScore = (r: any) => { if (!r) return 0; if (r.daily_score && r.daily_score > 0) return r.daily_score; const tasks = db.getTasks(r.date); return calculateDailyScore(r, tasks, weights, targets, enabledMetrics); };

  const renderWeekCharts = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const prodChartData: any[] = [];
    const studyChartData: any[] = [];
  
    const baseDate = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const record = records.find(r => r.date === dateStr);
      
      if (record) {
        prodChartData.push({ value: getScore(record), label: daysOfWeek[i] });
      } else {
        prodChartData.push({ value: 0, label: daysOfWeek[i], hideDataPoint: true });
      }
      
      const studyMins = record ? (record.aptitude_minutes + record.dsa_minutes + record.other_learning_minutes) : 0;
      studyChartData.push({ value: parseFloat((studyMins / 60).toFixed(1)), label: daysOfWeek[i] });
    }

    return (
      <>
        <Card>
          <Text style={styles.sectionTitle}>Productivity Trend</Text>
          <LineChart curved areaChart startFillColor={colors.primary} endFillColor={colors.background} startOpacity={0.4} endOpacity={0.05} isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  data={prodChartData} width={300} height={200} maxValue={10} color={colors.primary} thickness={3} />
        </Card>
        <Card>
          <Text style={styles.sectionTitle}>Study Hours</Text>
          <BarChart isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  data={studyChartData} width={300} height={200} frontColor={colors.primary} />
        </Card>
      </>
    );
  };

  const renderMonthCharts = () => {
    const days = getDaysInDateRange(monthStart, getEndOfMonth(monthStart));
    const studyData: any[] = [];
    const prodData: any[] = [];
    
    days.forEach((dateStr, index) => {
      const record = records.find(r => r.date === dateStr);
      const label = (index + 1) % 5 === 0 ? String(index + 1) : ''; // stagger labels
      
      if (record) {
        prodData.push({ value: getScore(record), label });
        const studyMins = record.aptitude_minutes + record.dsa_minutes + record.other_learning_minutes;
        studyData.push({ value: parseFloat((studyMins / 60).toFixed(1)), label });
      } else {
        prodData.push({ value: 0, label, hideDataPoint: true });
        studyData.push({ value: 0, label });
      }
    });

    return (
      <>
        <Card>
          <Text style={styles.sectionTitle}>Monthly Productivity</Text>
          <LineChart curved areaChart startFillColor={colors.primary} endFillColor={colors.background} startOpacity={0.4} endOpacity={0.05} isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  data={prodData} width={300} height={200} maxValue={10} color={colors.primary} thickness={2} hideDataPoints />
        </Card>
        <Card>
          <Text style={styles.sectionTitle}>Monthly Study Hours</Text>
          <BarChart isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  data={studyData} width={300} height={200} frontColor={colors.primary} />
        </Card>
      </>
    );
  };

  const render90DayCharts = () => {
    // 90 days chunked by week
    const weeksData: { weekLabel: string; records: DailyRecord[] }[] = [];
    let currStart = new Date(getLast90Days(ninetyDayEnd));
    let weekCount = 1;
    
    while (currStart <= new Date(ninetyDayEnd)) {
      const wEnd = new Date(currStart);
      wEnd.setDate(wEnd.getDate() + 6);
      
      const chunk = records.filter(r => {
        const d = new Date(r.date);
        return d >= currStart && d <= wEnd;
      });
      
      weeksData.push({ weekLabel: `W${weekCount}`, records: chunk });
      
      currStart.setDate(currStart.getDate() + 7);
      weekCount++;
    }

    const prodData: any[] = [];
    const studyData: any[] = [];

    weeksData.forEach(w => {
      const stats = getAggregateStats(w.records);
      prodData.push({ value: stats.averageScore, label: w.weekLabel });
      studyData.push({ value: parseFloat((stats.totalStudyMinutes / 60).toFixed(1)), label: w.weekLabel });
    });

    return (
      <>
        <Card>
          <Text style={styles.sectionTitle}>Productivity Trend (By Week)</Text>
          <LineChart curved areaChart startFillColor={colors.primary} endFillColor={colors.background} startOpacity={0.4} endOpacity={0.05} isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  data={prodData} width={300} height={200} maxValue={10} color={colors.primary} thickness={3} />
        </Card>
        <Card>
          <Text style={styles.sectionTitle}>Study Hours (By Week)</Text>
          <BarChart isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  data={studyData} width={300} height={200} frontColor={colors.primary} />
        </Card>
      </>
    );
  };

  const enabledMetrics = useStore(state => state.enabledMetrics);
  const weights = useStore(state => state.weights);
  const targets = useStore(state => state.targets);
  const currency = useStore(state => state.currency);
  const streaks = useStore(state => state.streaks);

  const stats = getAggregateStats(records);
  const prevStats = getAggregateStats(prevRecords);
  
  const career = calculateCareerStats(records);
  const prevCareer = calculateCareerStats(prevRecords);
  
  const financial = calculateFinancialStats(records);
  const prevFinancial = calculateFinancialStats(prevRecords);
  
  const fitness = calculateFitnessStats(records);
  const prevFitness = calculateFitnessStats(prevRecords);

  const financialChartData = [
    { value: financial.totalIncome, label: 'Income', frontColor: colors.success },
    { value: financial.totalExpenses, label: 'Expenses', frontColor: colors.error },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(['Today', 'Week', 'Month', '90Days'] as Tab[]).map(t => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tabButton, activeTab === t && styles.tabButtonActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderNav()}

      <ScrollView contentContainerStyle={styles.scroll}>
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Not enough data yet</Text>
            <Text style={styles.emptySub}>0 days recorded in this period.</Text>
          </View>
        ) : (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Average Score</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.value}>{stats.averageScore.toFixed(1)} / 10</Text>
                  <TrendIndicator current={stats.averageScore} previous={prevStats.averageScore} />
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Days Recorded</Text>
                <Text style={styles.value}>{stats.daysRecorded}</Text>
              </View>
            </Card>

            {/* Gamification / Trophy Room */}
            <Card>
              <Text style={styles.sectionTitle}>Trophy Room 🏆</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.l }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 32 }}>🔥</Text>
                  <Text style={[typography.h2, { color: colors.text, marginTop: spacing.xs }]}>{streaks.currentStreak}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Current Streak</Text>
                </View>
                <View style={{ width: 1, backgroundColor: colors.borderSubtle || colors.border, marginVertical: spacing.s }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 32 }}>👑</Text>
                  <Text style={[typography.h2, { color: colors.text, marginTop: spacing.xs }]}>{streaks.bestStreak}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Best Streak</Text>
                </View>
                <View style={{ width: 1, backgroundColor: colors.borderSubtle || colors.border, marginVertical: spacing.s }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 32 }}>💎</Text>
                  <Text style={[typography.h2, { color: colors.text, marginTop: spacing.xs }]}>{streaks.perfectDays}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Perfect Days</Text>
                </View>
              </View>

              <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: spacing.m }]}>ACHIEVEMENTS</Text>
              <View style={{ gap: spacing.m }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', opacity: streaks.bestStreak >= 3 ? 1 : 0.4 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: streaks.bestStreak >= 3 ? 'rgba(255, 149, 0, 0.2)' : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{streaks.bestStreak >= 3 ? '⚡' : '🔒'}</Text>
                  </View>
                  <View style={{ marginLeft: spacing.m }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: 'bold' }]}>Momentum</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Reach a 3-Day Streak</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', opacity: streaks.bestStreak >= 7 ? 1 : 0.4 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: streaks.bestStreak >= 7 ? 'rgba(255, 45, 85, 0.2)' : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{streaks.bestStreak >= 7 ? '🦾' : '🔒'}</Text>
                  </View>
                  <View style={{ marginLeft: spacing.m }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: 'bold' }]}>Ironman</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Reach a 7-Day Streak</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', opacity: streaks.perfectDays >= 1 ? 1 : 0.4 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: streaks.perfectDays >= 1 ? 'rgba(94, 92, 230, 0.2)' : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{streaks.perfectDays >= 1 ? '✨' : '🔒'}</Text>
                  </View>
                  <View style={{ marginLeft: spacing.m }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: 'bold' }]}>Flawless</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Achieve your first 10/10 score</Text>
                  </View>
                </View>
              </View>
            </Card>

            {renderCharts()}

            {enabledMetrics.career && (
              <Card>
                <Text style={styles.sectionTitle}>Career Metrics</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Total Study</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{formatMinutes(stats.totalStudyMinutes)}</Text>
                    <TrendIndicator current={stats.totalStudyMinutes} previous={prevStats.totalStudyMinutes} />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Aptitude</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{formatMinutes(career.aptitude)}</Text>
                    <TrendIndicator current={career.aptitude} previous={prevCareer.aptitude} />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>DSA</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{formatMinutes(career.dsa)}</Text>
                    <TrendIndicator current={career.dsa} previous={prevCareer.dsa} />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Other Learning</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{formatMinutes(career.other)}</Text>
                    <TrendIndicator current={career.other} previous={prevCareer.other} />
                  </View>
                </View>
              </Card>
            )}

            {enabledMetrics.work && (
              <Card>
                <Text style={styles.sectionTitle}>Financials</Text>
                <BarChart isAnimated animationDuration={1200}    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }} yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }} rulesColor={colors.border} xAxisColor={colors.border} yAxisColor={colors.border}  
                  data={financialChartData}
                  width={300}
                  height={200}
                  noOfSections={4}
                />
                <View style={styles.row}>
                  <Text style={styles.label}>Total Income</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{currency}{financial.totalIncome}</Text>
                    <TrendIndicator current={financial.totalIncome} previous={prevFinancial.totalIncome} />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Total Expenses</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{currency}{financial.totalExpenses}</Text>
                    <TrendIndicator current={financial.totalExpenses} previous={prevFinancial.totalExpenses} inverse />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Net Income</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{currency}{financial.netIncome}</Text>
                    <TrendIndicator current={financial.netIncome} previous={prevFinancial.netIncome} />
                  </View>
                </View>
              </Card>
            )}

            {enabledMetrics.fitness && (
              <Card>
                <Text style={styles.sectionTitle}>Fitness</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Workout Sessions</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{fitness.workoutCount}</Text>
                    <TrendIndicator current={fitness.workoutCount} previous={prevFitness.workoutCount} />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Total Mins</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{formatMinutes(fitness.totalWorkoutMinutes)}</Text>
                    <TrendIndicator current={fitness.totalWorkoutMinutes} previous={prevFitness.totalWorkoutMinutes} />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Avg Duration</Text>
                  <Text style={styles.value}>{formatMinutes(fitness.averageWorkoutDuration)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Avg Weight</Text>
                  <Text style={styles.value}>{fitness.averageWeight ? `${fitness.averageWeight.toFixed(1)} kg` : 'N/A'}</Text>
                </View>
              </Card>
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: { padding: spacing.s },
  navButtonText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  navButtonDisabled: { opacity: 0.5 },
  navButtonDisabledText: { color: colors.textSecondary },
  weekText: { ...typography.h3, color: colors.text },
  scroll: { padding: spacing.m },
  emptyState: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.s },
  emptySub: { ...typography.body, color: colors.textSecondary },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.m },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.s, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { ...typography.body, color: colors.text },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  value: { ...typography.body, fontWeight: 'bold', color: colors.primary }
});
