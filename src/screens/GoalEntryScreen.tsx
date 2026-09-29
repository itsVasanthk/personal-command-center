import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { getToday, getEndOfWeek, getEndOfMonth } from '../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const GoalEntryScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const navigation = useNavigation();
  const addGoal = useStore(state => state.addGoal);

  const [form, setForm] = useState({
    title: '',
    category: 'Career',
    metric: 'aptitude_minutes',
    target: '',
    period: 'weekly',
    start_date: getToday(),
    end_date: getEndOfWeek(getToday())
  });

  const handlePeriodChange = (p: string) => {
    let end = form.end_date;
    if (p === 'weekly') end = getEndOfWeek(form.start_date);
    if (p === 'monthly') end = getEndOfMonth(form.start_date);
    
    setForm({ ...form, period: p, end_date: end });
  };

  const handleSave = () => {
    if (!form.title.trim()) return Alert.alert('Error', 'Please enter a goal name');
    if (!form.target || isNaN(Number(form.target))) return Alert.alert('Error', 'Target must be a valid number');

    addGoal({
      title: form.title,
      category: form.category,
      metric: form.metric,
      target: Math.max(0, Number(form.target)),
      period: form.period,
      start_date: form.start_date,
      end_date: form.end_date,
      completed: 0
    });
    
    navigation.goBack();
  };

  const renderInput = (label: string, field: keyof typeof form, keyboardType: 'default' | 'numeric' = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[field]}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
        keyboardType={keyboardType}
        placeholder={keyboardType === 'numeric' ? '0' : ''}
        placeholderTextColor={colors.border}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageHeader}>Create Goal</Text>
        
        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Details</Text>
          </View>
          {renderInput('Goal Name', 'title')}
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Metric</Text>
            <TextInput
              style={styles.input}
              value={form.metric}
              onChangeText={(text) => setForm({ ...form, metric: text })}
              placeholder="e.g. income"
              placeholderTextColor={colors.border}
            />
          </View>
          <Text style={styles.hint}>Options: aptitude_minutes, work_minutes, income, workout_minutes...</Text>

          {renderInput('Target Value', 'target', 'numeric')}
        </LinearGradient>

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Timeframe</Text>
          </View>
          <View style={styles.buttonRow}>
            {['weekly', 'monthly', 'custom'].map((p) => (
              <TouchableOpacity key={p} style={[styles.periodButton, form.period === p && styles.periodButtonActive]} onPress={() => handlePeriodChange(p)}>
                <Text style={[styles.periodText, form.period === p && styles.periodTextActive]}>{p.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderInput('Start Date', 'start_date')}
          {renderInput('End Date', 'end_date')}
        </LinearGradient>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.saveGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.saveText}>Save Goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m, paddingBottom: spacing.xxl },
  pageHeader: { ...typography.h1, textAlign: 'center', marginBottom: spacing.l, color: colors.text, textShadowColor: colors.primary, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } },
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
  input: { flex: 1, ...typography.body, color: colors.text, textAlign: 'right', padding: spacing.s, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.m, marginTop: -spacing.s },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.l },
  periodButton: { flex: 1, marginHorizontal: spacing.xs, padding: spacing.s, borderRadius: radius.s, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  periodButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { ...typography.caption, color: colors.textSecondary, fontWeight: 'bold' },
  periodTextActive: { color: '#FFF' },
  saveButton: { marginTop: spacing.m, marginBottom: spacing.xxl, borderRadius: radius.l, overflow: 'hidden', ...shadows.large },
  saveGradient: { paddingVertical: spacing.l, alignItems: 'center', justifyContent: 'center' },
  saveText: { ...typography.h3, color: '#FFF' }
});
