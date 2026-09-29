import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { exportData, importData, deleteAllData } from '../utils/backupUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const SettingsScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const store = useStore();

  const [theme, setTheme] = useState(store.theme);
  const [currency, setCurrency] = useState(store.currency);
  const [targets, setTargets] = useState(store.targets);
  const [weights, setWeights] = useState(store.weights);
  const [enabledMetrics, setEnabledMetrics] = useState(store.enabledMetrics);

  useEffect(() => {
    setTheme(store.theme);
    setCurrency(store.currency);
    setTargets(store.targets);
    setWeights(store.weights);
    setEnabledMetrics(store.enabledMetrics);
  }, [store.theme, store.currency, store.targets, store.weights, store.enabledMetrics]);

  const handleSave = () => {
    const totalWeight = weights.career + weights.work + weights.fitness + weights.tasks;
    if (totalWeight !== 100) {
      Alert.alert('Validation Error', `Score weights must total exactly 100%. Current total: ${totalWeight}%`);
      return;
    }

    store.setTheme(theme);
    store.setCurrency(currency);
    store.setTargets(targets);
    store.setWeights(weights);
    store.setEnabledMetrics(enabledMetrics);

    Alert.alert('Success', 'Settings saved successfully!');
  };

  const renderInputRow = (label: string, value: string, onChange: (val: string) => void, isNumeric = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={isNumeric ? 'numeric' : 'default'}
        placeholderTextColor={colors.border}
      />
    </View>
  );

  const renderSwitchRow = (label: string, value: boolean, onChange: (val: boolean) => void) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onChange} 
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );

  const renderThemeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Theme</Text>
      <View style={{ flexDirection: 'row' }}>
        {['system', 'light', 'dark'].map((t, i) => (
          <React.Fragment key={t}>
            {i > 0 && <View style={{ width: spacing.s }} />}
            <TouchableOpacity
              onPress={() => {
                setTheme(t as any);
                store.setTheme(t as any);
              }}
              style={{
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                backgroundColor: theme === t ? colors.primary : 'rgba(255,255,255,0.05)',
                borderRadius: radius.s,
                borderWidth: 1,
                borderColor: theme === t ? colors.primary : 'rgba(255,255,255,0.1)'
              }}
            >
              <Text style={{ 
                ...typography.caption, 
                color: theme === t ? '#FFF' : colors.textSecondary, 
                textTransform: 'capitalize',
                fontWeight: theme === t ? 'bold' : 'normal'
              }}>
                {t}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageHeader}>Settings</Text>

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          {renderThemeSelector()}
          {renderInputRow('Currency Symbol', currency, setCurrency)}
        </LinearGradient>

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stopwatch" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Daily Targets (Minutes)</Text>
          </View>
          {renderInputRow('Aptitude', String(targets.aptitude_minutes), val => setTargets({ ...targets, aptitude_minutes: Number(val) || 0 }), true)}
          {renderInputRow('DSA', String(targets.dsa_minutes), val => setTargets({ ...targets, dsa_minutes: Number(val) || 0 }), true)}
          {renderInputRow('Other Learning', String(targets.other_learning_minutes), val => setTargets({ ...targets, other_learning_minutes: Number(val) || 0 }), true)}
          {renderInputRow('Work', String(targets.work_minutes), val => setTargets({ ...targets, work_minutes: Number(val) || 0 }), true)}
          {renderInputRow('Workout', String(targets.workout_minutes), val => setTargets({ ...targets, workout_minutes: Number(val) || 0 }), true)}
        </LinearGradient>

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="pie-chart" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Score Weighting (%)</Text>
          </View>
          {renderInputRow('Career', String(weights.career), val => setWeights({ ...weights, career: Number(val) || 0 }), true)}
          {renderInputRow('Work', String(weights.work), val => setWeights({ ...weights, work: Number(val) || 0 }), true)}
          {renderInputRow('Fitness', String(weights.fitness), val => setWeights({ ...weights, fitness: Number(val) || 0 }), true)}
          {renderInputRow('Tasks', String(weights.tasks), val => setWeights({ ...weights, tasks: Number(val) || 0 }), true)}
          <Text style={styles.hint}>Total must equal 100%.</Text>
        </LinearGradient>

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="toggle" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Enabled Modules</Text>
          </View>
          {renderSwitchRow('Career', enabledMetrics.career, val => setEnabledMetrics({ ...enabledMetrics, career: val }))}
          {renderSwitchRow('Work', enabledMetrics.work, val => setEnabledMetrics({ ...enabledMetrics, work: val }))}
          {renderSwitchRow('Fitness', enabledMetrics.fitness, val => setEnabledMetrics({ ...enabledMetrics, fitness: val }))}
        </LinearGradient>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.saveGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.saveText}>Save Settings</Text>
          </LinearGradient>
        </TouchableOpacity>

        <LinearGradient colors={[colors.surface1, colors.background]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="server" size={20} color={colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.error }]}>Data & Backups</Text>
          </View>
          <TouchableOpacity style={[styles.dataButton, { borderColor: colors.primary }]} onPress={exportData}>
            <Text style={[styles.dataButtonText, { color: colors.primary }]}>Export Backup (JSON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dataButton, { borderColor: colors.primary }]} onPress={() => importData(store.initializeStore)}>
            <Text style={[styles.dataButtonText, { color: colors.primary }]}>Import Backup (JSON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dataButton, { borderColor: colors.error, backgroundColor: 'rgba(239,68,68,0.1)' }]} onPress={() => deleteAllData(store.initializeStore)}>
            <Text style={[styles.dataButtonText, { color: colors.error }]}>WIPE ALL DATA</Text>
          </TouchableOpacity>
        </LinearGradient>
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
  input: { flex: 0.8, ...typography.body, color: colors.text, textAlign: 'right', padding: spacing.s, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  hint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.m, marginTop: -spacing.s },
  saveButton: { marginTop: spacing.m, marginBottom: spacing.xl, borderRadius: radius.l, overflow: 'hidden', ...shadows.large },
  saveGradient: { paddingVertical: spacing.l, alignItems: 'center', justifyContent: 'center' },
  saveText: { ...typography.h3, color: '#FFF' },
  dataButton: { padding: spacing.m, borderRadius: radius.m, borderWidth: 1, alignItems: 'center', marginBottom: spacing.m },
  dataButtonText: { ...typography.body, fontWeight: 'bold' }
});
