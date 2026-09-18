import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useAppTheme } from '../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...rest }: CardProps) => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  
  return (
    <View 
      style={[
        styles.card, 
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  card: {
    padding: spacing.m,
    borderRadius: radius.m,
    marginBottom: spacing.m,
    backgroundColor: colors.surface1,
    ...shadows.md,
  }
});
