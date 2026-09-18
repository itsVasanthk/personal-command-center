import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme';
import { ProgressBar } from './ProgressBar';

interface StatItemProps {
  label: string;
  value: string;
  progress?: number;
  onPress?: () => void;
  inverse?: boolean;
}

export const StatItem = ({ label, value, progress, onPress, inverse }: StatItemProps) => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      </View>
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={inverse ? colors.error : colors.primary} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: '500',
  },
  value: {
    ...typography.body,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 2,
  }
});
