import React from 'react';
import { View, ActivityIndicator } from 'react-native';
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
import { AuthProvider } from './src/lib/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/lib/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

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

