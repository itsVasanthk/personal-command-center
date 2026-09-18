import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme';

interface CalendarProps {
  currentMonth: string; // YYYY-MM-DD
  recordedDates: string[]; // ['2023-10-01']
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  disableNext?: boolean;
}

export const Calendar = ({ 
  currentMonth, 
  recordedDates, 
  onSelectDate, 
  onPrevMonth, 
  onNextMonth, 
  disableNext = false 
}: CalendarProps) => {
  const { colors, spacing, typography, radius, shadows } = useAppTheme();
  const styles = makeStyles(colors, spacing, typography, radius, shadows);
  const d = new Date(currentMonth);
  const year = d.getFullYear();
  const month = d.getMonth();
  
  const monthName = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Get first day of month (0 = Sun, 1 = Mon...)
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const renderCells = () => {
    const cells = [];
    
    // Empty cells before start of month
    for (let i = 0; i < startOffset; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.cell} />);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasRecord = recordedDates.includes(dateStr);
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = todayStr === dateStr;
      const isFuture = dateStr > todayStr;

      cells.push(
        <TouchableOpacity 
          key={dateStr} 
          style={[styles.cell, isToday && styles.todayCell]} 
          onPress={() => onSelectDate(dateStr)}
          disabled={isFuture}
        >
          <Text style={[styles.dayText, isToday && styles.todayText, isFuture && { opacity: 0.3 }]}>{i}</Text>
          {hasRecord && <View style={styles.indicator} />}
        </TouchableOpacity>
      );
    }

    // Fill remaining cells
    const remaining = (cells.length % 7 === 0) ? 0 : 7 - (cells.length % 7);
    for (let i = 0; i < remaining; i++) {
      cells.push(<View key={`empty-end-${i}`} style={styles.cell} />);
    }

    // Group into rows
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {cells.slice(i, i + 7)}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>{'< Prev'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navBtn} disabled={disableNext}>
          <Text style={[styles.navText, disableNext && styles.disabledText]}>{'Next >'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysHeader}>
        {daysOfWeek.map((day, idx) => (
          <Text key={idx} style={styles.dayOfWeekText}>{day}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {renderCells()}
      </View>
    </View>
  );
};

const makeStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    borderRadius: 8,
    padding: spacing.m,
    marginVertical: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  monthText: {
    ...typography.h3,
    color: colors.text,
  },
  navBtn: { padding: spacing.xs },
  navText: { ...typography.body, color: colors.primary, fontWeight: 'bold' },
  disabledText: { color: colors.textSecondary },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  grid: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayText: {
    ...typography.body,
    color: colors.text,
  },
  todayText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  }
});
