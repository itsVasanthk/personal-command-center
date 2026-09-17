import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const HistoryScreen = () => {
  const currentTheme = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>History</Text>
      
      <View style={[styles.placeholder, { backgroundColor: currentTheme.card }]}>
        <Text style={{ color: currentTheme.secondary }}>Calendar/history placeholder</Text>
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});
