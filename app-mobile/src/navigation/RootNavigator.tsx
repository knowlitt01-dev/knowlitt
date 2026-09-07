import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../lib/AuthContext';
import { colors, spacing, radius } from '../lib/theme';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Tab Screens
import DashboardScreen from '../screens/DashboardScreen';
import BooksScreen from '../screens/BooksScreen';
import ReviewScreen from '../screens/ReviewScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Nested stack screens
import BookSetupScreen from '../screens/BookSetupScreen';
import ConnectorsScreen from '../screens/ConnectorsScreen';
import PlansScreen from '../screens/PlansScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string, focused: boolean }) {
  return (
    <View style={{
      width: 44,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: focused ? colors.primarySurface : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 16, opacity: focused ? 1.0 : 0.6 }}>{emoji}</Text>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={DashboardScreen} 
        options={{ 
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />
        }} 
      />
      <Tab.Screen 
        name="BooksTab" 
        component={BooksScreen} 
        options={{ 
          title: 'Books',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="📘" focused={focused} />
        }} 
      />
      <Tab.Screen 
        name="ReviewTab" 
        component={ReviewScreen} 
        options={{ 
          title: 'Review',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗂️" focused={focused} />
        }} 
      />
      <Tab.Screen 
        name="DiscoverTab" 
        component={DiscoverScreen} 
        options={{ 
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />
        }} 
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 }
      }}
    >
      {/* Tab bar containing main screens */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      
      {/* Stack pages accessed from tabs */}
      <Stack.Screen name="BookSetup" component={BookSetupScreen} options={{ title: 'Book Onboarding' }} />
      <Stack.Screen name="Connectors" component={ConnectorsScreen} options={{ title: 'Connect Integrations' }} />
      <Stack.Screen name="Plans" component={PlansScreen} options={{ title: 'Subscription Plans' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
