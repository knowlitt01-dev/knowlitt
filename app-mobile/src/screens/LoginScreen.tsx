import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../lib/AuthContext';
import { ApiError } from '../lib/api';
import { editorialTheme } from '../lib/theme';
import AuthHeader from '../components/AuthHeader';
import { ArrowRightIcon, EyeIcon, AmberDot } from '../components/AuthIcons';

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const themeColors = isDark ? editorialTheme.colors.dark : editorialTheme.colors.light;

  const handleNeedHelp = () => {
    Alert.alert(
      'KnowLitt Support',
      'Need help signing in? You can reset your password or reach our team at support@knowlitt.com',
      [
        { text: 'Reset Password', onPress: () => navigation.navigate('ForgotPassword') },
        { text: 'Dismiss', style: 'cancel' },
      ]
    );
  };

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(trimmedEmail, password);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'Incorrect email or password. Please verify your credentials or reset your password.');
    } finally {
      setLoading(false);
    }
  }

  const canGoBack = navigation.canGoBack?.() ?? false;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.canvas, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Brand Header — Consistent Left-Aligned Horizontal Logo */}
      <AuthHeader
        isDark={isDark}
        onBack={canGoBack ? () => navigation.goBack() : undefined}
        rightElement={
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              onPress={() => setIsDark(!isDark)}
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: themeColors.border,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Toggle Theme"
            >
              <Text style={{ fontSize: 13 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNeedHelp}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.helpLinkText,
                  {
                    color: themeColors.secondaryText,
                    fontFamily: editorialTheme.fonts.sansMedium,
                  },
                ]}
              >
                Need help?
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Editorial Form Area */}
          <View style={styles.formSection}>
            {/* Editorial Chapter Badge & Heading */}
            <View style={styles.heroTextGroup}>
              <View
                style={[
                  styles.chapterPill,
                  {
                    backgroundColor: themeColors.tagBg,
                    borderColor: themeColors.tagBorder,
                  },
                ]}
              >
                <AmberDot size={5} />
                <Text
                  style={[
                    styles.chapterPillText,
                    {
                      color: themeColors.tagText,
                      fontFamily: editorialTheme.fonts.sansMedium,
                    },
                  ]}
                >
                  Chapter 01 · Return
                </Text>
              </View>

              <Text
                style={[
                  styles.headline,
                  {
                    color: themeColors.primaryText,
                    fontFamily: editorialTheme.fonts.serifSemiBold,
                  },
                ]}
              >
                Welcome back to your{'\n'}
                <Text
                  style={[
                    styles.headlineItalic,
                    { fontFamily: editorialTheme.fonts.serifItalic },
                  ]}
                >
                  next chapter.
                </Text>
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: themeColors.secondaryText,
                    fontFamily: editorialTheme.fonts.sansRegular,
                  },
                ]}
              >
                Pick up where you left off. Your summaries, flashcards, and reading roadmap await.
              </Text>
            </View>

            {/* Error Banner */}
            {error ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: themeColors.errorBg,
                    borderColor: themeColors.errorBorder,
                  },
                ]}
              >
                <Text style={[styles.errorIconText, { color: themeColors.errorText }]}>⚠️</Text>
                <Text
                  style={[
                    styles.errorBannerText,
                    {
                      color: themeColors.errorText,
                      fontFamily: editorialTheme.fonts.sansRegular,
                    },
                  ]}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.fieldsContainer}>
              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    {
                      color: themeColors.primaryText,
                      fontFamily: editorialTheme.fonts.sansMedium,
                    },
                  ]}
                >
                  Email address
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: themeColors.inputBg,
                      borderColor: emailFocused
                        ? themeColors.inputBorderFocus
                        : themeColors.inputBorder,
                      color: themeColors.primaryText,
                      fontFamily: editorialTheme.fonts.sansRegular,
                    },
                  ]}
                  placeholder="name@example.com"
                  placeholderTextColor={themeColors.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text
                    style={[
                      styles.inputLabel,
                      {
                        color: themeColors.primaryText,
                        fontFamily: editorialTheme.fonts.sansMedium,
                      },
                    ]}
                  >
                    Password
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.forgotPasswordText,
                        {
                          color: themeColors.secondaryText,
                          fontFamily: editorialTheme.fonts.sansMedium,
                        },
                      ]}
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.passwordInput,
                      {
                        backgroundColor: themeColors.inputBg,
                        borderColor: passwordFocused
                          ? themeColors.inputBorderFocus
                          : themeColors.inputBorder,
                        color: themeColors.primaryText,
                        fontFamily: editorialTheme.fonts.sansRegular,
                      },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={themeColors.inputPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                  >
                    <EyeIcon
                      visible={showPassword}
                      color={themeColors.secondaryText}
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Action */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.88}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: themeColors.buttonPrimary,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Log in"
              >
                {loading ? (
                  <ActivityIndicator color={themeColors.buttonPrimaryText} size="small" />
                ) : (
                  <View style={styles.buttonContentRow}>
                    <Text
                      style={[
                        styles.submitButtonText,
                        {
                          color: themeColors.buttonPrimaryText,
                          fontFamily: editorialTheme.fonts.sansSemiBold,
                        },
                      ]}
                    >
                      Log in
                    </Text>
                    <ArrowRightIcon color={themeColors.buttonPrimaryText} size={15} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Temporary Dev Button: Navigate to Onboarding */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Onboarding')}
                style={[
                  styles.devButton,
                  {
                    backgroundColor: isDark ? 'rgba(250, 158, 51, 0.12)' : '#FFF7ED',
                    borderColor: isDark ? 'rgba(250, 158, 51, 0.35)' : '#FDBA74',
                  },
                ]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Navigate to onboarding (dev mode)"
              >
                <Text
                  style={[
                    styles.devButtonText,
                    {
                      color: isDark ? '#FFA726' : '#C2410C',
                      fontFamily: editorialTheme.fonts.sansMedium,
                    },
                  ]}
                >
                  🛠️ [Dev] View Onboarding Flow
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Footer Navigation */}
          <View
            style={[
              styles.footerContainer,
              {
                borderTopColor: themeColors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.footerText,
                {
                  color: themeColors.secondaryText,
                  fontFamily: editorialTheme.fonts.sansRegular,
                },
              ]}
            >
              New to KnowLitt?{' '}
              <Text
                onPress={() => navigation.navigate('Signup')}
                style={[
                  styles.footerLinkBold,
                  {
                    color: themeColors.primaryText,
                    fontFamily: editorialTheme.fonts.sansSemiBold,
                  },
                ]}
              >
                Create an account
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpLinkText: {
    fontSize: 12.5,
  },
  formSection: {
    paddingTop: 8,
  },
  heroTextGroup: {
    marginBottom: 28,
  },
  chapterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
    borderWidth: 0.75,
    marginBottom: 14,
  },
  chapterPillText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  headline: {
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -0.5,
  },
  headlineItalic: {
    fontWeight: 'normal',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13.5,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 0.75,
    marginBottom: 20,
    gap: 10,
  },
  errorIconText: {
    fontSize: 14,
    marginTop: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  fieldsContainer: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 12,
  },
  textInput: {
    height: 50,
    borderRadius: 13,
    borderWidth: 0.75,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  passwordInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  devButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  devButtonText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  footerContainer: {
    marginTop: 32,
    paddingTop: 18,
    borderTopWidth: 0.75,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12.5,
  },
  footerLinkBold: {
    fontWeight: '600',
  },
});
