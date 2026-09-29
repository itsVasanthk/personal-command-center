import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { useAppTheme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...rest }: CardProps) => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  
  return (
    <LinearGradient 
      colors={[colors.surface1, colors.background]}
      style={[styles.card, style]} 
      {...rest}
    >
      {children}
    </LinearGradient>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  card: {
    padding: spacing.m,
    borderRadius: radius.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...shadows.medium,
  }
});
