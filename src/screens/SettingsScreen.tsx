import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const SettingsScreen = () => {
  const currentTheme = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Settings</Text>
      
      <View style={styles.list}>
        <Text style={[styles.item, { color: currentTheme.text, borderBottomColor: currentTheme.border }]}>Theme</Text>
        <Text style={[styles.item, { color: currentTheme.text, borderBottomColor: currentTheme.border }]}>Currency</Text>
        <Text style={[styles.item, { color: currentTheme.text, borderBottomColor: currentTheme.border }]}>Daily targets</Text>
        <Text style={[styles.item, { color: currentTheme.text, borderBottomColor: currentTheme.border }]}>Data export</Text>
        <Text style={[styles.item, { color: currentTheme.text, borderBottomColor: currentTheme.border }]}>Data import</Text>
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
  list: {
    marginTop: spacing.m,
  },
  item: {
    ...typography.body,
    paddingVertical: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});
