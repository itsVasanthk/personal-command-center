import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { TodayScreen } from '../screens/TodayScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.light.primary,
          tabBarInactiveTintColor: colors.light.secondary,
          headerStyle: {
            backgroundColor: colors.light.background,
          },
          headerTitleStyle: {
            color: colors.light.text,
          },
        }}
      >
        <Tab.Screen name="Today" component={TodayScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
