import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TodayScreen } from '../screens/TodayScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DailyEntryScreen } from '../screens/DailyEntryScreen';
import { GoalEntryScreen } from '../screens/GoalEntryScreen';
import { DailyDetailScreen } from '../screens/DailyDetailScreen';
import { useAppTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
  Tabs: undefined;
  DailyEntry: { date?: string } | undefined;
  GoalEntry: undefined;
  DailyDetail: { date: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const { colors } = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Today') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Goals') iconName = focused ? 'flag' : 'flag-outline';
          else if (route.name === 'History') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface1,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { colors } = useAppTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface1 },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text }
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen 
          name="DailyEntry" 
          component={DailyEntryScreen} 
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Edit Today',
          }}
        />
        <Stack.Screen 
          name="GoalEntry" 
          component={GoalEntryScreen} 
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Create Goal',
          }}
        />
        <Stack.Screen 
          name="DailyDetail" 
          component={DailyDetailScreen} 
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
