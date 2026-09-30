import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useStore } from '../store';
import { useAppTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as db from '../database';
import { BottomSheet } from './BottomSheet';

const { width } = Dimensions.get('window');

type Trophy = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
};

export const TrophyRoom = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  
  const streaks = useStore(state => state.streaks);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  useEffect(() => {
    // Calculate achievements
    const allRecords = db.getDailyRecords(9999);
    
    let totalLearningMins = 0;
    let perfectDays = 0;
    let hasLogged = allRecords.length > 0;

    allRecords.forEach(r => {
      totalLearningMins += (r.aptitude_minutes || 0) + (r.dsa_minutes || 0) + (r.other_learning_minutes || 0);
      
      // Simple heuristic for "perfect day": they logged at least 3 things and got some work done.
      // (Since exact score calculation needs the whole store state, we approximate or just rely on a decent amount of minutes)
      const totalMins = (r.aptitude_minutes || 0) + (r.dsa_minutes || 0) + (r.work_minutes || 0) + (r.workout_minutes || 0);
      if (totalMins > 120 && (r.workout_completed || r.workout_minutes > 0)) {
        perfectDays++;
      }
    });

    const totalLearningHours = totalLearningMins / 60;

    const computedTrophies: Trophy[] = [
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Logged your very first day of data.',
        icon: 'footsteps',
        color: '#10B981',
        unlocked: hasLogged
      },
      {
        id: 'streak_3',
        title: 'Momentum',
        description: 'Hit a 3-day streak.',
        icon: 'flame',
        color: '#F59E0B',
        unlocked: streaks.bestStreak >= 3
      },
      {
        id: 'streak_7',
        title: 'Unstoppable',
        description: 'Maintained a 7-day streak.',
        icon: 'bonfire',
        color: '#EF4444',
        unlocked: streaks.bestStreak >= 7
      },
      {
        id: 'deep_thinker',
        title: 'Deep Thinker',
        description: 'Accumulated 50 hours of learning.',
        icon: 'school',
        color: '#8B5CF6',
        unlocked: totalLearningHours >= 50
      },
      {
        id: 'perfect_10',
        title: 'Flawless',
        description: 'Achieved a massive productivity day.',
        icon: 'diamond',
        color: '#3B82F6',
        unlocked: perfectDays >= 1
      },
    ];

    setTrophies(computedTrophies);
  }, [streaks.bestStreak]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="trophy" size={24} color={colors.accentFinance} />
        <Text style={styles.header}>Trophy Room</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {trophies.map(t => (
          <TouchableOpacity 
            key={t.id} 
            style={[styles.trophyCard, !t.unlocked && styles.lockedCard]}
            onPress={() => setSelectedTrophy(t)}
            activeOpacity={0.7}
          >
            <LinearGradient 
              colors={t.unlocked ? [t.color, `${t.color}80`] : [colors.surface2, colors.surface1]} 
              style={styles.iconContainer}
            >
              <Ionicons name={t.icon as any} size={32} color={t.unlocked ? '#FFF' : colors.textMuted} />
            </LinearGradient>
            <Text style={styles.title} numberOfLines={1}>{t.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{t.unlocked ? t.description : 'Keep grinding to unlock.'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomSheet visible={!!selectedTrophy} onDismiss={() => setSelectedTrophy(null)}>
        {selectedTrophy && (
          <View style={styles.modalContent}>
            <LinearGradient 
              colors={selectedTrophy.unlocked ? [selectedTrophy.color, `${selectedTrophy.color}80`] : [colors.surface2, colors.surface1]} 
              style={styles.modalIconContainer}
            >
              <Ionicons name={selectedTrophy.icon as any} size={64} color={selectedTrophy.unlocked ? '#FFF' : colors.textMuted} />
            </LinearGradient>
            
            <Text style={styles.modalTitle}>{selectedTrophy.title}</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: selectedTrophy.unlocked ? `${colors.success}20` : 'rgba(255,255,255,0.05)' }]}>
              <Ionicons name={selectedTrophy.unlocked ? "checkmark-circle" : "lock-closed"} size={16} color={selectedTrophy.unlocked ? colors.success : colors.textMuted} />
              <Text style={[styles.statusText, { color: selectedTrophy.unlocked ? colors.success : colors.textMuted }]}>
                {selectedTrophy.unlocked ? 'Unlocked' : 'Locked'}
              </Text>
            </View>

            <Text style={styles.modalDescription}>{selectedTrophy.description}</Text>
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.m,
  },
  header: {
    ...typography.h2,
    color: colors.text,
    marginLeft: spacing.s,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    gap: spacing.m,
  },
  trophyCard: {
    width: 140,
    backgroundColor: colors.surface1,
    padding: spacing.m,
    borderRadius: radius.l,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...shadows.medium,
  },
  lockedCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    ...shadows.large,
  },
  title: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: spacing.l,
  },
  modalIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    ...shadows.large,
  },
  modalTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    marginBottom: spacing.l,
  },
  statusText: {
    ...typography.body,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  }
});
