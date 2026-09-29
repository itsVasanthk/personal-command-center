import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import * as db from '../database';
import { getToday } from '../utils/dateUtils';
import { DailyRecord } from '../models';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

  // Helper to init state without 0s
  const getHours = (mins: number) => {
    const h = Math.floor((mins || 0) / 60);
    return h === 0 ? '' : h.toString();
  };
  const getMins = (mins: number) => {
    const m = (mins || 0) % 60;
    return m === 0 ? '' : m.toString();
  };
  const getVal = (val: number | undefined) => (val && val !== 0) ? val.toString() : '';

  const [form, setForm] = useState({
    aptitude_hours: '', aptitude_mins: '',
    dsa_hours: '', dsa_mins: '',
    other_learning_hours: '', other_learning_mins: '',
    work_hours: '', work_mins: '',
    income: '', expenses: '',
    workout_completed: false,
    workout_hours: '', workout_mins: '',
    weight: '', notes: ''
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
        income: getVal(sourceRecord.income), expenses: getVal(sourceRecord.expenses),
        workout_completed: sourceRecord.workout_completed === 1,
        workout_hours: getHours(sourceRecord.workout_minutes), workout_mins: getMins(sourceRecord.workout_minutes),
        weight: getVal(sourceRecord.weight), notes: sourceRecord.notes || ''
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
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timeInputRow}>
        <TextInput 
          style={styles.timeInput} 
          value={form[hourField] as string} 
          onChangeText={(text) => setForm({ ...form, [hourField]: text })} 
          keyboardType="numeric" 
          placeholder="0" 
          placeholderTextColor={colors.border}
        />
        <Text style={styles.timeLabel}>h</Text>
        <TextInput 
          style={styles.timeInput} 
          value={form[minField] as string} 
          onChangeText={(text) => setForm({ ...form, [minField]: text })} 
          keyboardType="numeric" 
          placeholder="0" 
          placeholderTextColor={colors.border}
        />
        <Text style={styles.timeLabel}>m</Text>
      </View>
    </View>
  );

  const renderInput = (label: string, field: keyof typeof form, keyboardType: 'numeric' | 'default' = 'numeric', prefix = '') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.singleInputWrapper}>
        {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
        <TextInput 
          style={styles.input} 
          value={form[field] as string} 
          onChangeText={(text) => setForm({ ...form, [field]: text })} 
          keyboardType={keyboardType} 
          placeholder={keyboardType === 'numeric' ? '0' : 'Optional notes...'}
          placeholderTextColor={colors.border}
        />
      </View>
    </View>
  );

  const enabledMetrics = useStore(state => state.enabledMetrics);
  const currency = useStore(state => state.currency);

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dateHeader}>{targetDate}</Text>
        
        {enabledMetrics.career && (
          <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Career</Text>
            </View>
            {renderTimeInput('Aptitude', 'aptitude_hours', 'aptitude_mins')}
            {renderTimeInput('DSA', 'dsa_hours', 'dsa_mins')}
            {renderTimeInput('Other Learning', 'other_learning_hours', 'other_learning_mins')}
          </LinearGradient>
        )}

        {enabledMetrics.work && (
          <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Work & Finance</Text>
            </View>
            {renderTimeInput('Work Time', 'work_hours', 'work_mins')}
            {renderInput('Income', 'income', 'numeric', currency)}
            {renderInput('Expenses', 'expenses', 'numeric', currency)}
          </LinearGradient>
        )}

        {enabledMetrics.fitness && (
          <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="barbell" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Fitness</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Workout Completed</Text>
              <Switch 
                value={form.workout_completed} 
                onValueChange={(val) => setForm({ ...form, workout_completed: val })}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            {renderTimeInput('Workout Duration', 'workout_hours', 'workout_mins')}
            {renderInput('Weight', 'weight', 'numeric', 'kg')}
          </LinearGradient>
        )}

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          {renderInput('Summary', 'notes', 'default')}
        </LinearGradient>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.saveGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.saveText}>Save Entry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m, paddingBottom: spacing.xxl },
  dateHeader: { ...typography.h1, textAlign: 'center', marginBottom: spacing.l, color: colors.text, textShadowColor: colors.primary, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } },
  card: {
    borderRadius: radius.l,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: { ...typography.h2, color: colors.primary, marginLeft: spacing.s },
  fieldContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
  label: { ...typography.body, flex: 1, color: colors.textSecondary },
  singleInputWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  inputPrefix: { ...typography.body, color: colors.textSecondary, marginRight: spacing.s },
  input: { flex: 0.8, ...typography.body, color: colors.text, textAlign: 'right', padding: spacing.s, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  timeInputRow: { flexDirection: 'row', alignItems: 'center' },
  timeLabel: { ...typography.body, marginHorizontal: spacing.xs, color: colors.textSecondary },
  timeInput: { width: 55, ...typography.body, color: colors.text, textAlign: 'center', padding: spacing.m, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  saveButton: { marginTop: spacing.m, marginBottom: spacing.xxl, borderRadius: radius.l, overflow: 'hidden', ...shadows.large },
  saveGradient: { paddingVertical: spacing.l, alignItems: 'center', justifyContent: 'center' },
  saveText: { ...typography.h3, color: '#FFF' }
});
