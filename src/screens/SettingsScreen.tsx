import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { exportData, importData, deleteAllData } from '../utils/backupUtils';

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

  const renderSectionTitle = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderInputRow = (label: string, value: string, onChange: (val: string) => void, isNumeric = false) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={isNumeric ? 'numeric' : 'default'}
      />
    </View>
  );

  const renderSwitchRow = (label: string, value: boolean, onChange: (val: boolean) => void) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );

  const renderThemeSelector = () => (
    <View style={styles.row}>
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
                backgroundColor: theme === t ? colors.primary : colors.surface2,
                borderRadius: radius.s
              }}
            >
              <Text style={{ 
                ...typography.caption, 
                color: theme === t ? '#FFF' : colors.text, 
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
        <Text style={styles.headerTitle}>Settings</Text>

        {renderSectionTitle('Appearance')}
        {renderThemeSelector()}
        {renderInputRow('Currency Symbol', currency, setCurrency)}

        {renderSectionTitle('Daily Targets (Minutes)')}
        {renderInputRow('Aptitude', String(targets.aptitude_minutes), val => setTargets({ ...targets, aptitude_minutes: Number(val) || 0 }), true)}
        {renderInputRow('DSA', String(targets.dsa_minutes), val => setTargets({ ...targets, dsa_minutes: Number(val) || 0 }), true)}
        {renderInputRow('Other Learning', String(targets.other_learning_minutes), val => setTargets({ ...targets, other_learning_minutes: Number(val) || 0 }), true)}
        {renderInputRow('Work', String(targets.work_minutes), val => setTargets({ ...targets, work_minutes: Number(val) || 0 }), true)}
        {renderInputRow('Workout', String(targets.workout_minutes), val => setTargets({ ...targets, workout_minutes: Number(val) || 0 }), true)}

        {renderSectionTitle('Score Weighting (%)')}
        {renderInputRow('Career', String(weights.career), val => setWeights({ ...weights, career: Number(val) || 0 }), true)}
        {renderInputRow('Work', String(weights.work), val => setWeights({ ...weights, work: Number(val) || 0 }), true)}
        {renderInputRow('Fitness', String(weights.fitness), val => setWeights({ ...weights, fitness: Number(val) || 0 }), true)}
        {renderInputRow('Tasks', String(weights.tasks), val => setWeights({ ...weights, tasks: Number(val) || 0 }), true)}
        <Text style={styles.hint}>Total must equal 100%.</Text>

        {renderSectionTitle('Enabled Modules')}
        {renderSwitchRow('Career', enabledMetrics.career, val => setEnabledMetrics({ ...enabledMetrics, career: val }))}
        {renderSwitchRow('Work', enabledMetrics.work, val => setEnabledMetrics({ ...enabledMetrics, work: val }))}
        {renderSwitchRow('Fitness', enabledMetrics.fitness, val => setEnabledMetrics({ ...enabledMetrics, fitness: val }))}

        <View style={styles.saveContainer}>
          <Button title="Save Settings" onPress={handleSave} color={colors.primary} />
        </View>

        {renderSectionTitle('Data Ownership')}
        <View style={styles.dataButtons}>
          <Button title="Export Backup (JSON)" onPress={exportData} />
          <View style={{ height: spacing.m }} />
          <Button title="Import Backup (JSON)" onPress={() => importData(store.initializeStore)} />
          <View style={{ height: spacing.xl }} />
          <Button title="WIPE ALL DATA" color={colors.error} onPress={() => deleteAllData(store.initializeStore)} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  headerTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.l },
  sectionTitle: { ...typography.h2, color: colors.primary, marginTop: spacing.l, marginBottom: spacing.m },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m, paddingBottom: spacing.s, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  label: { ...typography.body, color: colors.text, flex: 1 },
  input: { flex: 1, ...typography.body, color: colors.text, textAlign: 'right', padding: spacing.s, backgroundColor: colors.surface1, borderRadius: 4 },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: -spacing.s },
  saveContainer: { marginVertical: spacing.xl },
  dataButtons: { marginTop: spacing.m }
});
