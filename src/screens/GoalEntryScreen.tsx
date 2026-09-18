import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { getToday, getEndOfWeek, getEndOfMonth } from '../utils/dateUtils';

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
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionTitle}>Goal Details</Text>
        {renderInput('Goal Name', 'title')}
        
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Metric</Text>
          <TextInput
            style={styles.input}
            value={form.metric}
            onChangeText={(text) => setForm({ ...form, metric: text })}
            placeholder="e.g. aptitude_minutes, income"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <Text style={styles.hint}>Valid metrics: aptitude_minutes, dsa_minutes, other_learning_minutes, work_minutes, income, workout_minutes, workout_completed</Text>

        {renderInput('Target Value', 'target', 'numeric')}
        
        <Text style={styles.sectionTitle}>Timeframe</Text>
        <View style={styles.buttonRow}>
          <Button title="Weekly" color={form.period === 'weekly' ? colors.primary : colors.textSecondary} onPress={() => handlePeriodChange('weekly')} />
          <Button title="Monthly" color={form.period === 'monthly' ? colors.primary : colors.textSecondary} onPress={() => handlePeriodChange('monthly')} />
          <Button title="Custom" color={form.period === 'custom' ? colors.primary : colors.textSecondary} onPress={() => handlePeriodChange('custom')} />
        </View>

        {renderInput('Start Date (YYYY-MM-DD)', 'start_date')}
        {renderInput('End Date (YYYY-MM-DD)', 'end_date')}
        
        <View style={styles.buttonContainer}>
          <Button title="Save Goal" onPress={handleSave} />
        </View>
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  sectionTitle: { ...typography.h2, marginTop: spacing.l, marginBottom: spacing.m, color: colors.primary },
  fieldContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.m, paddingBottom: spacing.s, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  label: { ...typography.body, flex: 1, color: colors.text },
  input: { flex: 1, ...typography.body, color: colors.text, textAlign: 'right', padding: spacing.s, backgroundColor: colors.surface1, borderRadius: 4 },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.m, marginTop: -spacing.s },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.l },
  buttonContainer: { marginTop: spacing.xl, marginBottom: spacing.xxl }
});
