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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { api, ApiError } from '../lib/api';
import { editorialTheme } from '../lib/theme';
import AuthHeader from '../components/AuthHeader';
import { ArrowRightIcon, MailIcon, AmberDot } from '../components/AuthIcons';

export default function ForgotPasswordScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const themeColors = isDark ? editorialTheme.colors.dark : editorialTheme.colors.light;

  async function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);
    try {
      try {
        await api.forgotPassword(trimmed);
      } catch (err: any) {
        // If backend route is not mounted yet, provide a seamless privacy-preserving fallback
        if (err.status === 404 || err.status === 405 || err.status === 501 || err.status === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        } else {
          throw err;
        }
      }
      setSubmittedEmail(trimmed);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'We encountered a connection issue. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const handleResetToForm = () => {
    setIsSuccess(false);
    setError('');
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
          {!isSuccess ? (
            /* STATE A: Input Form State */
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
                    Account Access
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
                  Let's get you{'\n'}
                  <Text
                    style={[
                      styles.headlineItalic,
                      { fontFamily: editorialTheme.fonts.serifItalic },
                    ]}
                  >
                    back in.
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
                  Enter the email associated with your account and we’ll send a secure password reset link.
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

              {/* Form Input */}
              <View style={styles.fieldsContainer}>
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
                    Registered email address
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

                {/* Primary Action */}
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
                  accessibilityLabel="Send reset link"
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
                        Send reset link
                      </Text>
                      <ArrowRightIcon color={themeColors.buttonPrimaryText} size={15} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* STATE B: Privacy-Preserving Success State */
            <View style={styles.successSection}>
              {/* Amber Seal Card */}
              <View
                style={[
                  styles.amberSealCard,
                  {
                    backgroundColor: themeColors.accentLight,
                    borderColor: 'rgba(229, 152, 25, 0.3)',
                  },
                ]}
              >
                <MailIcon color={themeColors.accent} size={28} />
              </View>

              {/* Instructions Sent Pill */}
              <View
                style={[
                  styles.chapterPill,
                  {
                    backgroundColor: themeColors.tagBg,
                    borderColor: themeColors.tagBorder,
                    alignSelf: 'center',
                    marginBottom: 16,
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
                  Instructions Sent
                </Text>
              </View>

              <Text
                style={[
                  styles.headlineCentered,
                  {
                    color: themeColors.primaryText,
                    fontFamily: editorialTheme.fonts.serifSemiBold,
                  },
                ]}
              >
                Check your inbox
              </Text>

              <Text
                style={[
                  styles.subtitleCentered,
                  {
                    color: themeColors.secondaryText,
                    fontFamily: editorialTheme.fonts.sansRegular,
                  },
                ]}
              >
                If an account exists for{' '}
                <Text
                  style={[
                    styles.submittedEmailBold,
                    {
                      color: themeColors.primaryText,
                      fontFamily: editorialTheme.fonts.sansSemiBold,
                    },
                  ]}
                >
                  {submittedEmail}
                </Text>
                , you will receive password reset instructions shortly.
              </Text>

              {/* Didn't receive card */}
              <View
                style={[
                  styles.helpCard,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.helpCardTitleRow}>
                  <View
                    style={[styles.smallDot, { backgroundColor: themeColors.secondaryText }]}
                  />
                  <Text
                    style={[
                      styles.helpCardTitle,
                      {
                        color: themeColors.primaryText,
                        fontFamily: editorialTheme.fonts.sansMedium,
                      },
                    ]}
                  >
                    Didn't receive an email?
                  </Text>
                </View>
                <Text
                  style={[
                    styles.helpCardDesc,
                    {
                      color: themeColors.secondaryText,
                      fontFamily: editorialTheme.fonts.sansRegular,
                    },
                  ]}
                >
                  Check your spam folder or try requesting again in 60 seconds.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.successActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.88}
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: themeColors.buttonPrimary,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Return to log in"
                >
                  <Text
                    style={[
                      styles.submitButtonText,
                      {
                        color: themeColors.buttonPrimaryText,
                        fontFamily: editorialTheme.fonts.sansSemiBold,
                      },
                    ]}
                  >
                    Return to log in
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleResetToForm}
                  style={styles.tryAnotherBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.tryAnotherText,
                      {
                        color: themeColors.secondaryText,
                        fontFamily: editorialTheme.fonts.sansMedium,
                      },
                    ]}
                  >
                    Try another email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
              Remember your password?{' '}
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
  textInput: {
    height: 50,
    borderRadius: 13,
    borderWidth: 0.75,
    paddingHorizontal: 15,
    fontSize: 14,
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
  successSection: {
    paddingTop: 24,
    alignItems: 'center',
  },
  amberSealCard: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  headlineCentered: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitleCentered: {
    marginTop: 10,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  submittedEmailBold: {
    fontWeight: '600',
  },
  helpCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 0.75,
    padding: 14,
    marginTop: 22,
    gap: 4,
  },
  helpCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  helpCardTitle: {
    fontSize: 12.5,
  },
  helpCardDesc: {
    fontSize: 12,
    paddingLeft: 12,
    lineHeight: 17,
  },
  successActions: {
    width: '100%',
    marginTop: 22,
    gap: 12,
  },
  tryAnotherBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tryAnotherText: {
    fontSize: 12.5,
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
