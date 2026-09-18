import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Button, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import * as db from '../database';
import { getToday } from '../utils/dateUtils';
import { DailyRecord } from '../models';

export const DailyEntryScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  const targetDate = route.params?.date || getToday();
  const isToday = targetDate === getToday();

  const todayRecord = useStore(state => state.todayRecord);
  const updateTodayRecord = useStore(state => state.updateTodayRecord);

  const [loading, setLoading] = useState(!isToday);

  // Helper to init state
  const getHours = (mins: number) => Math.floor((mins || 0) / 60).toString();
  const getMins = (mins: number) => ((mins || 0) % 60).toString();

  const [form, setForm] = useState({
    aptitude_hours: '0', aptitude_mins: '0',
    dsa_hours: '0', dsa_mins: '0',
    other_learning_hours: '0', other_learning_mins: '0',
    work_hours: '0', work_mins: '0',
    income: '0', expenses: '0',
    workout_completed: false,
    workout_hours: '0', workout_mins: '0',
    weight: '0', notes: ''
  });

  useEffect(() => {
    let sourceRecord: DailyRecord | null = null;
    if (isToday) {
      sourceRecord = todayRecord as DailyRecord;
    } else {
      sourceRecord = db.getDailyRecord(targetDate);
    }

    if (sourceRecord) {
      setForm({
        aptitude_hours: getHours(sourceRecord.aptitude_minutes), aptitude_mins: getMins(sourceRecord.aptitude_minutes),
        dsa_hours: getHours(sourceRecord.dsa_minutes), dsa_mins: getMins(sourceRecord.dsa_minutes),
        other_learning_hours: getHours(sourceRecord.other_learning_minutes), other_learning_mins: getMins(sourceRecord.other_learning_minutes),
        work_hours: getHours(sourceRecord.work_minutes), work_mins: getMins(sourceRecord.work_minutes),
        income: sourceRecord.income?.toString() || '0', expenses: sourceRecord.expenses?.toString() || '0',
        workout_completed: sourceRecord.workout_completed === 1,
        workout_hours: getHours(sourceRecord.workout_minutes), workout_mins: getMins(sourceRecord.workout_minutes),
        weight: sourceRecord.weight?.toString() || '0', notes: sourceRecord.notes || ''
      });
    }
    setLoading(false);
  }, [targetDate, isToday, todayRecord]);

  const parseTime = (hoursStr: string, minsStr: string) => {
    const h = parseInt(hoursStr, 10) || 0;
    const m = parseInt(minsStr, 10) || 0;
    return (h * 60) + m;
  };

  const handleSave = () => {
    const updates = {
      aptitude_minutes: parseTime(form.aptitude_hours, form.aptitude_mins),
      dsa_minutes: parseTime(form.dsa_hours, form.dsa_mins),
      other_learning_minutes: parseTime(form.other_learning_hours, form.other_learning_mins),
      work_minutes: parseTime(form.work_hours, form.work_mins),
      income: Math.max(0, parseFloat(form.income) || 0),
      expenses: Math.max(0, parseFloat(form.expenses) || 0),
      workout_completed: form.workout_completed ? 1 : 0,
      workout_minutes: parseTime(form.workout_hours, form.workout_mins),
      weight: Math.max(0, parseFloat(form.weight) || 0),
      notes: form.notes
    };

    if (isToday) {
      updateTodayRecord(updates);
    } else {
      const existing = db.getDailyRecord(targetDate);
      if (existing) {
        db.updateDailyRecord(targetDate, updates);
      } else {
        db.createDailyRecord({ ...updates, date: targetDate });
      }
    }
    
    navigation.goBack();
  };

  const renderTimeInput = (label: string, hourField: keyof typeof form, minField: keyof typeof form) => (
    <View style={styles.timeFieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timeInputRow}>
        <TextInput style={styles.timeInput} value={String(form[hourField])} onChangeText={(text) => setForm({ ...form, [hourField]: text })} keyboardType="numeric" placeholder="h" />
        <Text style={styles.timeLabel}>h</Text>
        <TextInput style={styles.timeInput} value={String(form[minField])} onChangeText={(text) => setForm({ ...form, [minField]: text })} keyboardType="numeric" placeholder="m" />
        <Text style={styles.timeLabel}>m</Text>
      </View>
    </View>
  );

  const renderInput = (label: string, field: keyof typeof form, keyboardType: 'numeric' | 'default' = 'numeric') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={String(form[field])} onChangeText={(text) => setForm({ ...form, [field]: text })} keyboardType={keyboardType} />
    </View>
  );

  const enabledMetrics = useStore(state => state.enabledMetrics);
  const currency = useStore(state => state.currency);

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dateHeader}>{targetDate}</Text>
        
        {enabledMetrics.career && (
          <>
            <Text style={styles.sectionTitle}>Career</Text>
            {renderTimeInput('Aptitude', 'aptitude_hours', 'aptitude_mins')}
            {renderTimeInput('DSA', 'dsa_hours', 'dsa_mins')}
            {renderTimeInput('Other Learning', 'other_learning_hours', 'other_learning_mins')}
          </>
        )}

        {enabledMetrics.work && (
          <>
            <Text style={styles.sectionTitle}>Work</Text>
            {renderTimeInput('Work Time', 'work_hours', 'work_mins')}
            {renderInput(`Income (${currency})`, 'income')}
            {renderInput(`Expenses (${currency})`, 'expenses')}
          </>
        )}

        {enabledMetrics.fitness && (
          <>
            <Text style={styles.sectionTitle}>Fitness</Text>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Workout Completed</Text>
              <Switch value={form.workout_completed} onValueChange={(val) => setForm({ ...form, workout_completed: val })} />
            </View>
            {renderTimeInput('Workout Duration', 'workout_hours', 'workout_mins')}
            {renderInput('Weight (kg)', 'weight')}
          </>
        )}

        <Text style={styles.sectionTitle}>Notes</Text>
        {renderInput('Notes', 'notes', 'default')}
        
        <View style={styles.buttonContainer}>
          <Button title="Save Data" onPress={handleSave} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  dateHeader: { ...typography.h2, textAlign: 'center', marginBottom: spacing.m, color: colors.text },
  sectionTitle: { ...typography.h2, marginTop: spacing.l, marginBottom: spacing.m, color: colors.primary },
  fieldContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m, paddingBottom: spacing.s, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  timeFieldContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m, paddingBottom: spacing.s, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  timeInputRow: { flexDirection: 'row', alignItems: 'center' },
  label: { ...typography.body, flex: 1, color: colors.textSecondary },
  timeLabel: { ...typography.body, marginHorizontal: spacing.xs, color: colors.textSecondary },
  input: { flex: 1, ...typography.body, color: colors.text, textAlign: 'right', padding: spacing.s, backgroundColor: colors.surface1, borderRadius: 4 },
  timeInput: { width: 50, ...typography.body, color: colors.text, textAlign: 'center', padding: spacing.s, backgroundColor: colors.surface1, borderRadius: 4 },
  buttonContainer: { marginTop: spacing.xl, marginBottom: spacing.xxl }
});
