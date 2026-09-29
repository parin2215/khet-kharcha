import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../../../shared/constants/index.js';

import FarmListScreen from '../screens/farms/FarmListScreen.jsx';
import FarmDetailScreen from '../screens/farms/FarmDetailScreen.jsx';
import AddEditFarmScreen from '../screens/farms/AddEditFarmScreen.jsx';
import HarvestEntryScreen from '../screens/farms/HarvestEntryScreen.jsx';

const Stack = createStackNavigator();

export default function FarmStack() {
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
        name="FarmList" 
        component={FarmListScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FarmDetail" 
        component={FarmDetailScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddEditFarm" 
        component={AddEditFarmScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HarvestEntry" 
        component={HarvestEntryScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
