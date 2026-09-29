import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../../../shared/constants/index.js';

import ReportsScreen from '../screens/reports/ReportsScreen.jsx';
import PartnerSettlementScreen from '../screens/partners/PartnerSettlementScreen.jsx';

const Stack = createStackNavigator();

export default function ReportsStack() {
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
        name="Reports" 
        component={ReportsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PartnerSettlement" 
        component={PartnerSettlementScreen} 
        options={{ title: 'Partner Settlement' }}
      />
    </Stack.Navigator>
  );
}
