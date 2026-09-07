import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { ApiError } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationPermDismissed, setLocationPermDismissed] = useState(false);
  const { signup } = useAuth();

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start reading smarter today</Text>
        </View>

        {/* Location prompt card */}
        {!locationPermDismissed && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeaderRow}>
              <Text style={styles.locationTitle}>📍 Timezone Reminders</Text>
              <TouchableOpacity onPress={() => setLocationPermDismissed(true)}>
                <Text style={styles.locationClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.locationText}>
              We request location permissions to set your correct local timezone so reminders arrive at your requested times.
            </Text>
            <View style={styles.locationButtonRow}>
              <TouchableOpacity 
                style={styles.locationButtonPrimary}
                onPress={() => setLocationPermDismissed(true)}
              >
                <Text style={styles.locationButtonPrimaryText}>Enable Location</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.locationButtonSecondary}
                onPress={() => setLocationPermDismissed(true)}
              >
                <Text style={styles.locationButtonSecondaryText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Card Form */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="yourname@domain.com"
            placeholderTextColor={colors.subtext}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          {/* Password */}
          <Text style={styles.label}>Password (min 8 characters)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {/* Submit */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign up free</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link Row */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.link}>Sign in</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.primary,
  },
  logoText: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    fontSize: 13,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily,
  },
  locationCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.lg,
    padding: spacing.md2,
    marginBottom: spacing.md2,
    borderWidth: 1,
    borderColor: '#D3CCFF',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  locationClose: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    padding: spacing.xs,
  },
  locationText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  locationButtonRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  locationButtonPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  locationButtonPrimaryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  locationButtonSecondary: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  locationButtonSecondaryText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fff',
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD3D3',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  linkRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: colors.subtext,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
