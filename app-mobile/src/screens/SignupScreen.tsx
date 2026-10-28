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

export default function SignupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const themeColors = isDark ? editorialTheme.colors.dark : editorialTheme.colors.light;

  // Real-time password criteria
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please fill in your email and password');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signup(trimmedEmail, password);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'An account with this email already exists or registration could not be completed.');
    } finally {
      setLoading(false);
    }
  }

  const showTerms = () => {
    Alert.alert(
      'Terms & Privacy',
      'By joining KnowLitt, your summaries and reading notes are kept private and encrypted. Terms of Service and Privacy Policy apply.'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.canvas, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Brand Header — Arrow-only back button on the left, horizontal KnowLitt logo immediately to its right */}
      <AuthHeader
        isDark={isDark}
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Login');
          }
        }}
        rightElement={
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
            {/* Badge & Heading */}
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
                  Begin · Membership
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
                Make room for{'\n'}
                <Text
                  style={[
                    styles.headlineItalic,
                    { fontFamily: editorialTheme.fonts.serifItalic },
                  ]}
                >
                  more ideas.
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
                Turn your reading list into daily 5-minute insights and lasting knowledge retention.
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
              {/* Full Name */}
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
                  Full name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: themeColors.inputBg,
                      borderColor: nameFocused
                        ? themeColors.inputBorderFocus
                        : themeColors.inputBorder,
                      color: themeColors.primaryText,
                      fontFamily: editorialTheme.fonts.sansRegular,
                    },
                  ]}
                  placeholder="Elena Rostova"
                  placeholderTextColor={themeColors.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!loading}
                />
              </View>

              {/* Email Address */}
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
                  placeholder="elena@example.com"
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

              {/* Password */}
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
                  Create password
                </Text>

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
                    placeholder="At least 8 characters"
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

                {/* Password Strength & Real-Time Guidelines Indicators */}
                <View style={styles.strengthRow}>
                  {/* Indicator 1: 8+ chars */}
                  <View style={styles.indicatorPill}>
                    <View
                      style={[
                        styles.indicatorDot,
                        {
                          backgroundColor: hasMinLength
                            ? themeColors.accent
                            : themeColors.stepperInactive,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.indicatorText,
                        {
                          color: hasMinLength
                            ? themeColors.primaryText
                            : themeColors.mutedText,
                          fontFamily: editorialTheme.fonts.sansMedium,
                        },
                      ]}
                    >
                      8+ chars
                    </Text>
                  </View>

                  {/* Indicator 2: 1 number */}
                  <View style={styles.indicatorPill}>
                    <View
                      style={[
                        styles.indicatorDot,
                        {
                          backgroundColor: hasNumber
                            ? themeColors.accent
                            : themeColors.stepperInactive,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.indicatorText,
                        {
                          color: hasNumber
                            ? themeColors.primaryText
                            : themeColors.mutedText,
                          fontFamily: editorialTheme.fonts.sansMedium,
                        },
                      ]}
                    >
                      1 number
                    </Text>
                  </View>

                  {/* Indicator 3: Upper & lower */}
                  <View style={styles.indicatorPill}>
                    <View
                      style={[
                        styles.indicatorDot,
                        {
                          backgroundColor: hasMixedCase
                            ? themeColors.accent
                            : themeColors.stepperInactive,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.indicatorText,
                        {
                          color: hasMixedCase
                            ? themeColors.primaryText
                            : themeColors.mutedText,
                          fontFamily: editorialTheme.fonts.sansMedium,
                        },
                      ]}
                    >
                      Upper & lower
                    </Text>
                  </View>
                </View>
              </View>

              {/* Restrained Terms Notice */}
              <Text
                style={[
                  styles.termsText,
                  {
                    color: themeColors.secondaryText,
                    fontFamily: editorialTheme.fonts.sansRegular,
                  },
                ]}
              >
                By creating an account, you agree to KnowLitt's{' '}
                <Text
                  onPress={showTerms}
                  style={[styles.termsLink, { color: themeColors.primaryText }]}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  onPress={showTerms}
                  style={[styles.termsLink, { color: themeColors.primaryText }]}
                >
                  Privacy Policy
                </Text>
                .
              </Text>

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
                accessibilityLabel="Create account"
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
                      Create account
                    </Text>
                    <ArrowRightIcon color={themeColors.buttonPrimaryText} size={15} />
                  </View>
                )}
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
              Already have an account?{' '}
              <Text
                onPress={() => navigation.navigate('Login')}
                style={[
                  styles.footerLinkBold,
                  {
                    color: themeColors.primaryText,
                    fontFamily: editorialTheme.fonts.sansSemiBold,
                  },
                ]}
              >
                Log in
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
  themeToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    paddingTop: 8,
  },
  heroTextGroup: {
    marginBottom: 24,
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
    marginBottom: 18,
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
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  textInput: {
    height: 48,
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
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorText: {
    fontSize: 11,
  },
  termsText: {
    fontSize: 11.5,
    lineHeight: 17,
    paddingTop: 2,
  },
  termsLink: {
    textDecorationLine: 'underline',
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
  footerContainer: {
    marginTop: 28,
    paddingTop: 16,
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
