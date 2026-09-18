import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

export const ProgressBar = ({ progress, color, height = 6 }: ProgressBarProps) => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  const activeColor = color || colors.primary;
  
  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${safeProgress * 100}%`,
            backgroundColor: activeColor
          }
        ]} 
      />
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: radius.s,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.s,
  }
});
