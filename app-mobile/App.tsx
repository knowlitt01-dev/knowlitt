import React, { useEffect } from 'react';
import { View, ActivityIndicator, Appearance } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/lib/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/lib/theme';

// Ensure appearance follows device theme rather than any locked mode
Appearance.setColorScheme?.('unspecified');

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    ...Ionicons.font,
  });

  useEffect(() => {
    Appearance.setColorScheme?.('unspecified');
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
