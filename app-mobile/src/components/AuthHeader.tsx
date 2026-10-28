import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { editorialTheme } from '../lib/theme';

interface AuthHeaderProps {
  isDark: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

const lightLogo = require('../../assets/icons/KnowLittLogoHorizantalLight.png');
const darkLogo = require('../../assets/icons/KnowLittLogoHorizantalDark.png');

/**
 * Universal Auth Header adhering strictly to KnowLitt brand specifications:
 * - Approved horizontal logo from assets/icons/
 * - Consistent left alignment across Login, Sign Up, and Forgot Password
 * - Arrow-only back button (no "Back" text) on the left with logo immediately to its right
 * - On screens without a back action, maintains identical left alignment and vertical baseline
 * - Light-theme logo on light surfaces, dark-theme logo on dark surfaces
 * - Aspect ratio strictly preserved with resizeMode="contain"
 */
export default function AuthHeader({
  isDark,
  onBack,
  rightElement,
  style,
}: AuthHeaderProps) {
  const themeColors = isDark ? editorialTheme.colors.dark : editorialTheme.colors.light;

  return (
    <View style={[styles.headerContainer, style]}>
      {/* Left-aligned brand & back action grouping */}
      <View style={styles.leftGroup}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.secondaryText} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.logoWrapper}>
          <Image
            source={isDark ? darkLogo : lightLogo}
            style={isDark ? styles.logoDark : styles.logoLight}
            resizeMode="contain"
            accessibilityLabel="KnowLitt Logo"
            accessibilityRole="image"
          />
        </View>
      </View>

      {/* Optional right-aligned element (e.g. Help link or Theme toggle) */}
      {rightElement ? (
        <View style={styles.rightGroup}>{rightElement}</View>
      ) : (
        <View style={styles.rightGroupPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    minHeight: 52,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: -4,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Optically tuned sizes so the KnowLitt wordmark and emblem align exactly across both themes
  logoLight: {
    width: 120,
    height: 30,
  },
  logoDark: {
    width: 120,
    height: 30,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rightGroupPlaceholder: {
    width: 1,
    height: 1,
  },
});
