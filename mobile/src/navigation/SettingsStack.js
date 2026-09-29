import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../../../shared/constants/index.js';

import SettingsScreen from '../screens/settings/SettingsScreen.jsx';
import BillsScreen from '../screens/bills/BillsScreen.jsx';
import RemindersScreen from '../screens/reminders/RemindersScreen.jsx';

const Stack = createStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Bills" 
        component={BillsScreen} 
        options={{ title: 'Bills Tracker' }}
      />
      <Stack.Screen 
        name="Reminders" 
        component={RemindersScreen} 
        options={{ title: 'Reminders' }}
      />
    </Stack.Navigator>
  );
}
