import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useStore } from '../store';
import { colors, spacing, typography } from '../theme';

export const GoalsScreen = () => {
  const goals = useStore(state => state.goals);
  const currentTheme = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Goals</Text>
      
      {goals.length === 0 ? (
        <Text style={[styles.empty, { color: currentTheme.secondary }]}>No goals yet</Text>
      ) : (
        <Text style={{ color: currentTheme.text }}>You have {goals.length} goals.</Text>
      )}

      <Button title="Add Goal" onPress={() => {}} />
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
  empty: {
    ...typography.body,
    marginBottom: spacing.m,
  }
});
