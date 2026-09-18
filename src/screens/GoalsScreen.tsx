import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { calculateGoalProgress } from '../analytics/goalProgress';
import * as db from '../database';

export const GoalsScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const navigation = useNavigation<any>();
  const goals = useStore(state => state.goals);
  const loadGoals = useStore(state => state.loadGoals);
  const removeGoal = useStore(state => state.removeGoal);

  // We need to calculate progress whenever screen focuses
  const [goalProgresses, setGoalProgresses] = useState<Record<number, any>>({});

  useFocusEffect(
    useCallback(() => {
      loadGoals();
      
      // Calculate progress for each goal dynamically
      const progresses: Record<number, any> = {};
      
      goals.forEach(g => {
        const records = db.getRecordsForDateRange(g.start_date, g.end_date);
        progresses[g.id] = calculateGoalProgress(g, records);
      });
      
      setGoalProgresses(progresses);
    }, [goals.length, loadGoals]) // re-run if length changes, or we can just fetch on mount.
  );

  // Force a re-calculation if records changed (e.g. going back from DailyEntry)
  useFocusEffect(
    useCallback(() => {
      const progresses: Record<number, any> = {};
      goals.forEach(g => {
        const records = db.getRecordsForDateRange(g.start_date, g.end_date);
        progresses[g.id] = calculateGoalProgress(g, records);
      });
      setGoalProgresses(progresses);
    }, [goals])
  );

  const activeGoals = goals.filter(g => {
    const prog = goalProgresses[g.id];
    return prog ? prog.current < prog.target : true;
  });

  const completedGoals = goals.filter(g => {
    const prog = goalProgresses[g.id];
    return prog ? prog.current >= prog.target : false;
  });

  const renderGoal = (g: any) => {
    const prog = goalProgresses[g.id];
    if (!prog) return null;

    // Cap visual progress at 100%, but show actual numbers (e.g., 200%)
    const visualProgress = Math.min(100, prog.progressPercentage);

    return (
      <Card key={g.id}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{g.title}</Text>
          <TouchableOpacity onPress={() => removeGoal(g.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.goalMeta}>{g.period.toUpperCase()} • Ends {g.end_date}</Text>
        
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {prog.current} / {prog.target}
          </Text>
          <Text style={styles.progressText}>
            {prog.progressPercentage}%
          </Text>
        </View>
        <ProgressBar progress={visualProgress / 100} color={colors.primary} />
        
        {prog.remaining > 0 ? (
          <Text style={styles.remainingText}>{prog.remaining} remaining</Text>
        ) : (
          <Text style={styles.completedText}>Goal reached!</Text>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>My Goals</Text>
          <Button title="+ New Goal" onPress={() => navigation.navigate('GoalEntry')} />
        </View>

        <Text style={styles.sectionTitle}>Active Goals</Text>
        {activeGoals.length === 0 ? (
          <Text style={styles.emptyText}>No active goals right now.</Text>
        ) : (
          activeGoals.map(renderGoal)
        )}

        <Text style={styles.sectionTitle}>Completed</Text>
        {completedGoals.length === 0 ? (
          <Text style={styles.emptyText}>No completed goals yet.</Text>
        ) : (
          completedGoals.map(renderGoal)
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  screenTitle: { ...typography.h1, color: colors.text },
  sectionTitle: { ...typography.h2, color: colors.primary, marginTop: spacing.l, marginBottom: spacing.s },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  goalTitle: { ...typography.h3, color: colors.text },
  deleteText: { ...typography.caption, color: colors.error },
  goalMeta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.m },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  progressText: { ...typography.body, fontWeight: '600', color: colors.text },
  remainingText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.s, textAlign: 'right' },
  completedText: { ...typography.caption, color: colors.success, marginTop: spacing.s, textAlign: 'right', fontWeight: 'bold' },
  emptyText: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic', marginVertical: spacing.m }
});
