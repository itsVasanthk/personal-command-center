import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Alert } from 'react-native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const METRICS = [
  { id: 'aptitude_minutes', label: 'Aptitude', icon: 'bulb', color: '#8B5CF6' },
  { id: 'dsa_minutes', label: 'DSA', icon: 'code-slash', color: '#EC4899' },
  { id: 'other_learning_minutes', label: 'Other', icon: 'book', color: '#10B981' },
  { id: 'work_minutes', label: 'Work', icon: 'briefcase', color: '#3B82F6' },
  { id: 'workout_minutes', label: 'Workout', icon: 'barbell', color: '#F59E0B' },
];

export const FocusScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const todayRecord = useStore(state => state.todayRecord);
  const updateTodayRecord = useStore(state => state.updateTodayRecord);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isRunning) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      accumulatedTimeRef.current = elapsedSeconds;
      setIsRunning(false);
    } else {
      // Start
      const now = Date.now();
      startTimeRef.current = now - (accumulatedTimeRef.current * 1000);
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        const timeNow = Date.now();
        if (startTimeRef.current) {
          setElapsedSeconds(Math.floor((timeNow - startTimeRef.current) / 1000));
        }
      }, 1000);
    }
  };

  const stopAndSave = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    
    const minutesToLog = Math.floor(elapsedSeconds / 60);
    
    if (minutesToLog < 1) {
      Alert.alert("Too short", "Focus session must be at least 1 minute to save.", [
        { text: "Keep Going", onPress: () => toggleTimer() },
        { text: "Reset", onPress: () => resetTimer(), style: "destructive" }
      ]);
      return;
    }

    Alert.alert(
      "Log Session",
      `Are you sure you want to log ${minutesToLog} minutes to ${selectedMetric.label}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: () => {
            const currentVal = todayRecord?.[selectedMetric.id as keyof typeof todayRecord] as number || 0;
            updateTodayRecord({ [selectedMetric.id]: currentVal + minutesToLog });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            resetTimer();
          }
        }
      ]
    );
  };

  const resetTimer = () => {
    setElapsedSeconds(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Action Mode</Text>
      
      <View style={styles.metricsSelector}>
        {METRICS.map(m => {
          const isSelected = selectedMetric.id === m.id;
          return (
            <TouchableOpacity 
              key={m.id} 
              disabled={isRunning}
              style={[styles.metricChip, isSelected && { borderColor: m.color, backgroundColor: `${m.color}20` }]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedMetric(m);
              }}
            >
              <Ionicons name={m.icon as any} size={16} color={isSelected ? m.color : colors.textMuted} />
              <Text style={[styles.metricText, isSelected && { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.timerContainer}>
        <Animated.View style={[styles.timerRing, { transform: [{ scale: pulseAnim }], borderColor: selectedMetric.color, shadowColor: selectedMetric.color }]}>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.timerSubText}>{selectedMetric.label} Session</Text>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.mainButton} onPress={toggleTimer}>
          <LinearGradient colors={isRunning ? ['#EF4444', '#DC2626'] : ['#3B82F6', '#2563EB']} style={styles.buttonGradient}>
            <Ionicons name={isRunning ? "pause" : "play"} size={32} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        {elapsedSeconds > 0 && !isRunning && (
          <TouchableOpacity style={styles.stopButton} onPress={stopAndSave}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.buttonGradient}>
              <Ionicons name="checkmark-done" size={32} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {elapsedSeconds > 0 && !isRunning && (
          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
             <Ionicons name="refresh" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m, paddingTop: 60, alignItems: 'center' },
  header: { ...typography.h1, color: colors.text, marginBottom: spacing.xl, textShadowColor: colors.primary, textShadowRadius: 10 },
  metricsSelector: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40, gap: spacing.s },
  metricChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s, paddingHorizontal: spacing.m, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  metricText: { ...typography.caption, marginLeft: spacing.xs, color: colors.textMuted, fontWeight: 'bold' },
  timerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  timerRing: { width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface1, elevation: 10, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.5, shadowRadius: 20 },
  timerText: { fontSize: 64, fontWeight: '200', color: colors.text, fontVariant: ['tabular-nums'] },
  timerSubText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.s },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 120, gap: spacing.l, marginBottom: 40 },
  mainButton: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', ...shadows.large },
  stopButton: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', ...shadows.large },
  buttonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resetButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }
});
