import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initAuth, initFirestore } from '../shared/services/firebaseInit.js';
import { useAuthStore } from './src/store/useAuthStore.js';
import { useSettingsStore } from './src/store/useSettingsStore.js';
import { initI18n } from './src/i18n/index.js';
import { COLORS } from '../shared/constants/index.js';

// Navigators
import AuthStack from './src/navigation/AuthStack.js';
import MainTabs from './src/navigation/MainTabs.js';

const Stack = createStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.card,
  },
};

export default function App() {
  const { initializeAuth, user, initialized, profile } = useAuthStore();
  const { loadSettings, settingsLoaded, syncFromProfile } = useSettingsStore();
  const [appReady, setAppReady] = useState(false);

  // Initialize App on mount
  useEffect(() => {
    const startApp = async () => {
      try {
        await initI18n(); // Init translation dictionary
        await initAuth(false);
        await initFirestore(false);
        await loadSettings();
        const unsubscribe = initializeAuth();
        setAppReady(true);
        return unsubscribe;
      } catch (e) {
        console.error('App start failure', e);
        setAppReady(true);
      }
    };

    let unsubscribeFn;
    startApp().then((unsub) => {
      unsubscribeFn = unsub;
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [initializeAuth, loadSettings]);

  // Sync settings when profile changes
  useEffect(() => {
    if (profile) {
      syncFromProfile(profile);
    }
  }, [profile, syncFromProfile]);

  if (!appReady || !initialized || !settingsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user && profile?.name && profile?.state ? (
            <Stack.Screen name="MainApp" component={MainTabs} />
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
