import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { ApiError } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
        
        {/* Logo and Brand Title */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.title}>BookTutor</Text>
          <Text style={styles.subtitle}>Your daily lessons from the books you own</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email input */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. read@booktutor.com"
            placeholderTextColor={colors.subtext}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          {/* Password input */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => { /* stub forgot */ }}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor={colors.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {/* Submit btn */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google OAuth Button placeholder */}
          <TouchableOpacity style={styles.googleButton} onPress={() => { /* OAuth */ }}>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign-up link */}
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.link}>Sign up free</Text>
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
    marginBottom: spacing.xl2,
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
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
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadows.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.subtext,
    fontSize: 12,
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
