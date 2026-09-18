import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';

interface TrendIndicatorProps {
  current: number;
  previous: number;
  inverse?: boolean; // If true, negative change is good (e.g. expenses)
}

export const TrendIndicator = ({ current, previous, inverse = false }: TrendIndicatorProps) => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  if (previous === 0) {
    return null;
  }

  const change = ((current - previous) / previous) * 100;
  const roundedChange = Math.round(change);
  
  if (roundedChange === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.neutralText}>0% change</Text>
      </View>
    );
  }

  const isPositive = roundedChange > 0;
  // If inverse is true, a positive change is bad (red), negative is good (green)
  const isGood = inverse ? !isPositive : isPositive;
  
  const textColor = isGood ? colors.success : colors.error;
  const prefix = isPositive ? '+' : '';

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: textColor }]}>
        {prefix}{roundedChange}%
      </Text>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    paddingVertical: 2,
    paddingHorizontal: spacing.s,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  text: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  neutralText: {
    ...typography.caption,
    color: colors.textSecondary,
  }
});
