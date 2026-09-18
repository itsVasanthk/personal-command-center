import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { Card } from '../components/Card';
import { StatItem } from '../components/StatItem';
import { formatMinutes } from '../utils/timeUtils';
import * as db from '../database';
import { DailyRecord } from '../models';

export const DailyDetailScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const date = route.params?.date;

  const [record, setRecord] = useState<DailyRecord | null>(null);
  const enabledMetrics = useStore(state => state.enabledMetrics);
  const currency = useStore(state => state.currency);

  useFocusEffect(
    useCallback(() => {
      if (date) {
        const data = db.getDailyRecord(date);
        setRecord(data);
      }
    }, [date])
  );

  if (!record) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Record Found</Text>
        <Text style={styles.emptySub}>There is no data for {date}.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DailyEntry', { date })}>
          <Text style={styles.buttonText}>Create Record</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            const prevDate = d.toISOString().split('T')[0];
            const prevRecord = db.getDailyRecord(prevDate);
            if (prevRecord) {
              const clone = { ...prevRecord, date };
              db.createDailyRecord(clone);
              setRecord(db.getDailyRecord(date));
              Alert.alert('Success', `Duplicated record from ${prevDate}`);
            } else {
              Alert.alert('Error', `No record found on ${prevDate} to duplicate.`);
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>Duplicate Previous Day</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this record? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        db.deleteDailyRecord(date);
        navigation.goBack();
      }}
    ]);
  };

  const handleDuplicate = () => {
    // Prompting for text input isn't fully supported natively in standard Alert for both platforms cleanly,
    // so we duplicate to today if they are looking at history, or to tomorrow.
    // For simplicity per prompt "copy the previous record into a new selected date" 
    // actually, if they are viewing a record, maybe duplicate to "Today"?
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      Alert.alert('Already Today', 'You are already viewing today.');
      return;
    }
    
    Alert.alert('Duplicate to Today', `Copy this record to ${today}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Copy', onPress: () => {
        const clone = { ...record, date: today };
        const existing = db.getDailyRecord(today);
        if (existing) {
          db.updateDailyRecord(today, clone);
        } else {
          db.createDailyRecord(clone);
        }
        useStore.getState().updateTodayRecord({});
        Alert.alert('Success', 'Copied to Today!');
      }}
    ]);
  };

  const studyMins = record.aptitude_minutes + record.dsa_minutes + record.other_learning_minutes;
  const netIncome = record.income - record.expenses;

  return (
    <LinearGradient colors={[colors.background, colors.surface1]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{date}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DailyEntry', { date })} style={styles.navBtn}>
          <Text style={styles.navText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: spacing.m }]}>OVERVIEW</Text>
          <StatItem label="Productivity Score" value={`${record.daily_score.toFixed(1)} / 10`} />
        </Card>

        {enabledMetrics.career && (
          <Card>
            <Text style={[typography.micro, { color: colors.accentCareer, marginBottom: spacing.m }]}>CAREER & LEARNING</Text>
            <StatItem label="Total Study" value={formatMinutes(studyMins)} />
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.s }} />
            <StatItem label="Aptitude" value={formatMinutes(record.aptitude_minutes)} />
            <StatItem label="DSA" value={formatMinutes(record.dsa_minutes)} />
            <StatItem label="Other Learning" value={formatMinutes(record.other_learning_minutes)} />
          </Card>
        )}

        {enabledMetrics.work && (
          <Card>
            <Text style={[typography.micro, { color: colors.accentFinance, marginBottom: spacing.m }]}>WORK & FINANCE</Text>
            <StatItem label="Work Duration" value={formatMinutes(record.work_minutes)} />
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.s }} />
            <StatItem label="Income" value={`${currency}${record.income}`} />
            <StatItem label="Expenses" value={`${currency}${record.expenses}`} inverse />
            <StatItem label="Net Income" value={`${currency}${netIncome}`} />
          </Card>
        )}

        {enabledMetrics.fitness && (
          <Card>
            <Text style={[typography.micro, { color: colors.accentFitness, marginBottom: spacing.m }]}>FITNESS</Text>
            <StatItem label="Workout" value={record.workout_completed ? 'Yes' : 'No'} />
            <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.s }} />
            <StatItem label="Duration" value={formatMinutes(record.workout_minutes)} />
            <StatItem label="Weight" value={record.weight ? `${record.weight} kg` : '-'} />
          </Card>
        )}

        {record.notes ? (
          <Card>
            <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: spacing.m }]}>NOTES</Text>
            <Text style={styles.notes}>{record.notes}</Text>
          </Card>
        ) : null}

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleDuplicate}>
            <Text style={styles.secondaryButtonText}>Duplicate to Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Record</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  emptySub: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.m, paddingBottom: spacing.m, backgroundColor: colors.surface1, borderBottomWidth: 1, borderBottomColor: colors.border },
  navBtn: { padding: spacing.s },
  navText: { ...typography.body, color: colors.primary, fontWeight: 'bold' },
  headerTitle: { ...typography.h2, color: colors.text },
  scroll: { padding: spacing.m },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.m },
  notes: { ...typography.body, color: colors.textSecondary },
  actionContainer: { marginTop: spacing.xl, gap: spacing.m },
  button: { backgroundColor: colors.primary, padding: spacing.m, borderRadius: 8, alignItems: 'center', width: '100%', marginBottom: spacing.m },
  buttonText: { color: '#FFF', ...typography.body, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.primary, padding: spacing.m, borderRadius: 8, alignItems: 'center', width: '100%' },
  secondaryButtonText: { color: colors.primary, ...typography.body, fontWeight: 'bold' },
  deleteButton: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.error, padding: spacing.m, borderRadius: 8, alignItems: 'center' },
  deleteButtonText: { color: colors.error, ...typography.body, fontWeight: 'bold' },
  backButton: { marginTop: spacing.xl },
  backButtonText: { color: colors.textSecondary, ...typography.body }
});
