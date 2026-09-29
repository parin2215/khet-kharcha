import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/index.js';

// Screens & Stacks
import DashboardScreen from '../screens/dashboard/DashboardScreen.jsx';
import FarmStack from './FarmStack.js';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen.jsx';
import ReportsStack from './ReportsStack.js';
import SettingsStack from './SettingsStack.js';

const Tab = createBottomTabNavigator();

// Special floating center button for Add Expense
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.customBtnContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.customBtn}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FarmsTab') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'AddExpenseTab') {
            iconName = 'add';
            color = '#FFFFFF';
            size = 28;
          } else if (route.name === 'ReportsTab') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ tabBarLabel: t('navigation.dashboard') }}
      />
      <Tab.Screen 
        name="FarmsTab" 
        component={FarmStack} 
        options={{ tabBarLabel: t('navigation.farms') }}
      />
      <Tab.Screen 
        name="AddExpenseTab" 
        component={AddExpenseScreen} 
        options={{ 
          tabBarLabel: '',
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </CustomTabBarButton>
          )
        }}
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={ReportsStack} 
        options={{ tabBarLabel: t('navigation.reports') }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack} 
        options={{ tabBarLabel: t('settings.title') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  customBtnContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
