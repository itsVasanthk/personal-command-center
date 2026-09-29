import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// @ts-ignore
import ConfettiCannon from 'react-native-confetti-cannon';

import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { formatDate, getToday } from '../utils/dateUtils';
import { formatMinutes } from '../utils/timeUtils';
import { Card } from '../components/Card';
import { HeroScore } from '../components/HeroScore';
import { ProgressBar } from '../components/ProgressBar';
import { StatItem } from '../components/StatItem';
import { BottomSheet } from '../components/BottomSheet';
import { calculateDailyScore } from '../analytics/calculateDailyScore';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export const TodayScreen = () => {
  const animValues = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    Animated.stagger(100, animValues.map(v => 
      Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: true })
    )).start();
  }, []);

  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const todayRecord = useStore(state => state.todayRecord);
  const tasks = useStore(state => state.tasks);
  const targets = useStore(state => state.targets);
  const weights = useStore(state => state.weights);
  const enabledMetrics = useStore(state => state.enabledMetrics);
  const currency = useStore(state => state.currency);
  const streaks = useStore(state => state.streaks);
  
  const addTask = useStore(state => state.addTask);
  const toggleTask = useStore(state => state.toggleTask);
  const deleteTask = useStore(state => state.deleteTask);
  
  const [newTask, setNewTask] = useState('');
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasTriggeredConfetti = useRef(false);

  const score = calculateDailyScore(todayRecord, tasks, weights, targets, enabledMetrics);

  useEffect(() => {
    if (score > 7.0 && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      setShowConfetti(true);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
      
      // Reset confetti so it can fire again if they re-trigger it
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } else if (score <= 7.0) {
      // Allow it to trigger again if score drops below 7 and comes back up
      hasTriggeredConfetti.current = false;
    }
  }, [score]);
  const netIncome = (todayRecord?.income || 0) - (todayRecord?.expenses || 0);
  
  const totalStudyMinutes = (todayRecord?.aptitude_minutes || 0) + 
                            (todayRecord?.dsa_minutes || 0) + 
                            (todayRecord?.other_learning_minutes || 0);

  const totalStudyTargetMinutes = targets.aptitude_minutes + targets.dsa_minutes + targets.other_learning_minutes;

  const openEntry = () => navigation.navigate('DailyEntry');

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
      setIsTaskSheetOpen(false);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <>
      <LinearGradient colors={[colors.background, colors.surface1]} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}>
          <View style={{ marginTop: spacing.xl, marginBottom: spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[typography.h3, { color: colors.textSecondary }]}>Good evening</Text>
              <Text style={[typography.display, { color: colors.text }]}>{formatDate(getToday())}</Text>
            </View>
            {streaks.currentStreak > 0 && (
              <View style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)', paddingHorizontal: spacing.m, paddingVertical: spacing.s, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 149, 0, 0.3)' }}>
                <Text style={{ ...typography.body, color: '#FF9500', fontWeight: 'bold' }}>🔥 {streaks.currentStreak} Day</Text>
              </View>
            )}
          </View>

          <HeroScore score={score} comparison="Live metric" />

          <Animated.View style={{ opacity: animValues[0], transform: [{ translateY: animValues[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <View style={{ marginBottom: spacing.l }}>
              <Text style={[typography.micro, { color: colors.textMuted, marginBottom: spacing.s }]}>TODAY'S PROGRESS</Text>
              <View style={{ backgroundColor: colors.surface1, padding: spacing.m, borderRadius: radius.m }}>
                {enabledMetrics.career && <ProgressBar progress={totalStudyMinutes / (totalStudyTargetMinutes || 1)} color={colors.accentCareer} />}
                {enabledMetrics.work && <View style={{marginTop: 8}}><ProgressBar progress={(todayRecord?.work_minutes || 0) / targets.work_minutes} color={colors.accentFinance} /></View>}
                {enabledMetrics.fitness && <View style={{marginTop: 8}}><ProgressBar progress={(todayRecord?.workout_minutes || 0) / targets.workout_minutes} color={colors.accentFitness} /></View>}
              </View>
            </View>
          </Animated.View>

          {enabledMetrics.career && (
            <Animated.View style={{ opacity: animValues[1], transform: [{ translateY: animValues[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <Card>
                <Text style={[typography.micro, { color: colors.accentCareer, marginBottom: spacing.m }]}>CAREER</Text>
                <StatItem label="Study" value={formatMinutes(totalStudyMinutes)} progress={totalStudyMinutes / (totalStudyTargetMinutes || 1)} onPress={openEntry} />
                <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.s }} />
                <StatItem label="Aptitude" value={formatMinutes(todayRecord?.aptitude_minutes || 0)} progress={(todayRecord?.aptitude_minutes || 0) / targets.aptitude_minutes} onPress={openEntry} />
                <StatItem label="DSA" value={formatMinutes(todayRecord?.dsa_minutes || 0)} progress={(todayRecord?.dsa_minutes || 0) / targets.dsa_minutes} onPress={openEntry} />
                <StatItem label="Other Learning" value={formatMinutes(todayRecord?.other_learning_minutes || 0)} progress={(todayRecord?.other_learning_minutes || 0) / targets.other_learning_minutes} onPress={openEntry} />
              </Card>
            </Animated.View>
          )}

          {enabledMetrics.work && (
            <Animated.View style={{ opacity: animValues[2], transform: [{ translateY: animValues[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <Card>
                <Text style={[typography.micro, { color: colors.accentFinance, marginBottom: spacing.m }]}>WORK & FINANCE</Text>
                <StatItem label="Work Time" value={formatMinutes(todayRecord?.work_minutes || 0)} progress={(todayRecord?.work_minutes || 0) / targets.work_minutes} onPress={openEntry} />
                <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.s }} />
                <StatItem label="Income" value={`${currency}${todayRecord?.income || 0}`} onPress={openEntry} />
                <StatItem label="Expenses" value={`${currency}${todayRecord?.expenses || 0}`} onPress={openEntry} inverse />
                <StatItem label="Net income" value={`${currency}${netIncome}`} onPress={openEntry} />
              </Card>
            </Animated.View>
          )}

          {enabledMetrics.fitness && (
            <Animated.View style={{ opacity: animValues[3], transform: [{ translateY: animValues[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <Card>
                <Text style={[typography.micro, { color: colors.accentFitness, marginBottom: spacing.m }]}>FITNESS</Text>
                <StatItem label="Workout" value={todayRecord?.workout_completed ? 'Completed' : 'Pending'} progress={todayRecord?.workout_completed ? 1 : 0} onPress={openEntry} />
                <StatItem label="Duration" value={formatMinutes(todayRecord?.workout_minutes || 0)} progress={(todayRecord?.workout_minutes || 0) / targets.workout_minutes} onPress={openEntry} />
                <StatItem label="Weight" value={`${todayRecord?.weight || 0} kg`} onPress={openEntry} />
              </Card>
            </Animated.View>
          )}

          <Animated.View style={{ opacity: animValues[4], transform: [{ translateY: animValues[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m }}>
                <Text style={[typography.micro, { color: colors.accentTasks }]}>TODAY'S TASKS ({completedTasks}/{tasks.length})</Text>
                <TouchableOpacity onPress={() => setIsTaskSheetOpen(true)}>
                  <Text style={[typography.caption, { color: colors.primary }]}>+ Add Task</Text>
                </TouchableOpacity>
              </View>
              {tasks.map(t => (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.s }}>
                  <TouchableOpacity onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const isCompleting = !t.completed;
                    toggleTask(t.id, t.completed ? 1 : 0);
                    
                    if (isCompleting) {
                      const completedCount = tasks.filter(x => x.completed).length + 1;
                      if (completedCount === tasks.length && tasks.length > 0) {
                        setTimeout(() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }, 300);
                      }
                    }
                  }} style={{ padding: spacing.xs }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: t.completed ? colors.success : colors.border, backgroundColor: t.completed ? colors.success : 'transparent' }} />
                  </TouchableOpacity>
                  <Text style={[typography.body, { flex: 1, marginLeft: spacing.s, color: t.completed ? colors.textMuted : colors.text, textDecorationLine: t.completed ? 'line-through' : 'none' }]}>{t.title}</Text>
                  <TouchableOpacity onPress={() => deleteTask(t.id)} style={{ padding: spacing.xs }}>
                    <Text style={{ color: colors.error }}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {tasks.length === 0 && <Text style={[typography.body, { color: colors.textMuted, fontStyle: 'italic' }]}>No tasks for today.</Text>}
            </Card>
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={{ position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 4 }}
        onPress={openEntry}
      >
        <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      <BottomSheet visible={isTaskSheetOpen} onDismiss={() => setIsTaskSheetOpen(false)}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.m }]}>Add New Task</Text>
        <TextInput
          style={{ backgroundColor: colors.surface2, color: colors.text, padding: spacing.m, borderRadius: radius.m, ...typography.body }}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.textMuted}
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleAddTask}
          autoFocus
        />
        <View style={{ marginTop: spacing.l }}>
          <Button title="Add Task" onPress={handleAddTask} color={colors.primary} />
        </View>
      </BottomSheet>
      
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon 
            count={120} 
            origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
            fallSpeed={3000}
            fadeOut={true}
          />
        </View>
      )}
    </>
  );
};


