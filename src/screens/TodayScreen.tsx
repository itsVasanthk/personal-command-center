import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useStore } from '../store';
import { colors, spacing, typography } from '../theme';
import { formatDate, getToday } from '../utils/dateUtils';

export const TodayScreen = () => {
  const todayRecord = useStore(state => state.todayRecord);
  const addTestRecord = useStore(state => state.addTestRecord);
  const themeMode = useStore(state => state.theme);
  // Defaulting to light for simplicity in this phase, you can expand this with a proper hook
  const currentTheme = colors.light; 

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Personal Command Center</Text>
      <Text style={[styles.date, { color: currentTheme.secondary }]}>{formatDate(getToday())}</Text>
      
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.status, { color: currentTheme.text }]}>
          Today's data status: {todayRecord ? 'Data exists' : 'No data'}
        </Text>
        {todayRecord && (
          <Text style={{ color: currentTheme.text, marginTop: spacing.s }}>
            Study Hours: {todayRecord.study_hours}
          </Text>
        )}
      </View>

      <Button title="Add today's data (Test)" onPress={addTestRecord} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.body,
    marginBottom: spacing.l,
  },
  card: {
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.m,
  },
  status: {
    ...typography.h3,
  },
});
