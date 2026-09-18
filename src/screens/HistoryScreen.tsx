import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Calendar } from '../components/Calendar';
import { useAppTheme } from '../theme';
import { getStartOfMonth, getEndOfMonth, getPreviousMonth, getNextMonth, getToday } from '../utils/dateUtils';
import * as db from '../database';

export const HistoryScreen = () => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const navigation = useNavigation<any>();
  const [currentMonth, setCurrentMonth] = useState(getStartOfMonth(getToday()));
  const [recordedDates, setRecordedDates] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const start = currentMonth;
      const end = getEndOfMonth(currentMonth);
      const records = db.getRecordsForDateRange(start, end);
      setRecordedDates(records.map(r => r.date));
    }, [currentMonth])
  );

  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth));
  };

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth));
  };

  const handleSelectDate = (date: string) => {
    navigation.navigate('DailyDetail', { date });
  };

  const isCurrentMonth = currentMonth === getStartOfMonth(getToday());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Calendar 
          currentMonth={currentMonth}
          recordedDates={recordedDates}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          disableNext={isCurrentMonth}
        />
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.m,
  }
});
