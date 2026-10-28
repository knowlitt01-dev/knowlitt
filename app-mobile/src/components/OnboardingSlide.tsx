import React from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { editorialTheme } from '../lib/theme';

export interface OnboardingSlideProps {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  imageAlt?: string;
  isDark: boolean;
}

export default function OnboardingSlide({
  titleLine1,
  titleLine2,
  subtitle,
  imageSource,
  isDark,
}: OnboardingSlideProps) {
  const { width, height } = useWindowDimensions();
  const themeColors = isDark ? editorialTheme.colors.dark : editorialTheme.colors.light;

  // Responsive sizing based on viewport
  const cardSize = Math.min(width - 56, Math.max(260, Math.floor(height * 0.38)));
  const isSmallScreen = height < 700;

  return (
    <View style={[styles.container, { width }]}>
      {/* Editorial Artwork Frame */}
      <View
        style={[
          styles.artworkFrame,
          {
            width: cardSize,
            height: cardSize,
            backgroundColor: themeColors.illustrationBg,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Image
          source={imageSource}
          style={styles.illustration}
          resizeMode="cover"
          accessibilityLabel={`${titleLine1} ${titleLine2}`}
        />
      </View>

      {/* Typography Content */}
      <View style={[styles.textBlock, { marginTop: isSmallScreen ? 16 : 28 }]}>
        <Text
          style={[
            styles.titleLine1,
            {
              color: themeColors.primaryText,
              fontSize: isSmallScreen ? 24 : 28,
              lineHeight: isSmallScreen ? 30 : 34,
            },
          ]}
        >
          {titleLine1}
        </Text>
        <Text
          style={[
            styles.titleLine2,
            {
              color: themeColors.primaryText,
              fontSize: isSmallScreen ? 24 : 28,
              lineHeight: isSmallScreen ? 30 : 34,
            },
          ]}
        >
          {titleLine2}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: themeColors.secondaryText,
              fontSize: isSmallScreen ? 13 : 14,
              lineHeight: isSmallScreen ? 18 : 21,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  artworkFrame: {
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  titleLine1: {
    fontFamily: editorialTheme.fonts.serifSemiBold,
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
  },
  titleLine2: {
    fontFamily: editorialTheme.fonts.serifItalic,
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    paddingHorizontal: 4,
  },
  subtitle: {
    fontFamily: editorialTheme.fonts.sansRegular,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 295,
  },
});
