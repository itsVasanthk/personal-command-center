import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const AnalyticsScreen = () => {
  const currentTheme = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Analytics</Text>
      
      <View style={styles.tabs}>
        <Text style={[styles.tab, { color: currentTheme.primary }]}>Today</Text>
        <Text style={[styles.tab, { color: currentTheme.secondary }]}>Week</Text>
        <Text style={[styles.tab, { color: currentTheme.secondary }]}>Month</Text>
        <Text style={[styles.tab, { color: currentTheme.secondary }]}>90 Days</Text>
      </View>
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
    marginBottom: spacing.m,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: spacing.s,
  },
  tab: {
    ...typography.body,
    fontWeight: 'bold',
  }
});
