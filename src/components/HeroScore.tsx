import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HeroScoreProps {
  score: number;
  maxScore?: number;
  label?: string;
  comparison?: string;
}

export const HeroScore = ({ score, maxScore = 10, label = 'Daily score', comparison }: HeroScoreProps) => {
  const { colors, typography } = useAppTheme();
  
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const safeScore = Math.min(Math.max(score, 0), maxScore);
  const progress = safeScore / maxScore;
  
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [progress, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size + 40} height={size + 40} style={{ position: 'absolute', top: -20, left: -20 }}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={(size + 40) / 2}
            cy={(size + 40) / 2}
            r={radius}
            stroke={colors.surface3}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={(size + 40) / 2}
            cy={(size + 40) / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            originX={(size + 40) / 2}
            originY={(size + 40) / 2}
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text style={[typography.hero, { color: colors.text, textShadowColor: 'rgba(255, 255, 255, 0.2)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10 }]}>{score.toFixed(1)}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
          {comparison ? (
            <Text style={[typography.micro, { color: colors.textMuted, marginTop: 4 }]}>
              {comparison}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
