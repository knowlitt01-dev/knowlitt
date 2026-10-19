import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  AccessibilityInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import OnboardingSlide from '../components/OnboardingSlide';
import { editorialTheme } from '../lib/theme';
import { setHasCompletedOnboarding } from '../lib/onboardingStorage';

interface SlideData {
  id: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  imageSource: any;
}

const SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    titleLine1: 'So many books.',
    titleLine2: 'So little time.',
    subtitle: 'Turn the books you’ve been meaning to read into small moments of discovery.',
    imageSource: require('../../assets/illustrations/onboarding-1.jpg'),
  },
  {
    id: 'slide-2',
    titleLine1: 'Big ideas.',
    titleLine2: 'Little by little.',
    subtitle: 'Discover the key ideas, lessons, and questions that make every chapter count.',
    imageSource: require('../../assets/illustrations/onboarding-2.jpg'),
  },
  {
    id: 'slide-3',
    titleLine1: 'A reading plan that',
    titleLine2: 'fits your life.',
    subtitle: 'Choose your pace, set your schedule, and make steady progress every day.',
    imageSource: require('../../assets/illustrations/onboarding-3.jpg'),
  },
  {
    id: 'slide-4',
    titleLine1: 'Make knowledge',
    titleLine2: 'stay with you.',
    subtitle: 'Revisit important ideas with smart flashcards and build a learning habit that lasts.',
    imageSource: require('../../assets/illustrations/onboarding-4.jpg'),
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();

  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const flatListRef = useRef<FlatList<SlideData>>(null);

  const themeColors = isDark ? editorialTheme.colors.dark : editorialTheme.colors.light;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const handleFinish = async (targetRoute: 'Login' | 'Signup') => {
    await setHasCompletedOnboarding(true);
    navigation.replace(targetRoute);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
      flatListRef.current?.scrollToIndex({
        index,
        animated: !reduceMotion,
      });
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.root, { backgroundColor: themeColors.canvas }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        {/* Brand Label & Theme Switcher */}
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
            onPress={() => setIsDark((prev) => !prev)}
            accessibilityLabel="Toggle visual theme"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.brandText,
              {
                color: themeColors.secondaryText,
                fontFamily: editorialTheme.fonts.sansMedium,
              },
            ]}
          >
            BOOKTUTOR
          </Text>
        </View>

        {/* Skip Action */}
        {!isLastSlide ? (
          <TouchableOpacity
            onPress={() => handleFinish('Login')}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.skipText,
                {
                  color: themeColors.secondaryText,
                  fontFamily: editorialTheme.fonts.sansMedium,
                },
              ]}
            >
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* Carousel Track */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={({ item }) => (
          <OnboardingSlide
            titleLine1={item.titleLine1}
            titleLine2={item.titleLine2}
            subtitle={item.subtitle}
            imageSource={item.imageSource}
            isDark={isDark}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={styles.carousel}
      />

      {/* Bottom Progress & Action Controls */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom + 12, 24),
          },
        ]}
      >
        {/* Stepper Progress Indicator */}
        <View style={styles.stepperRow} accessibilityLabel={`Slide ${currentIndex + 1} of ${SLIDES.length}`}>
          {SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <TouchableOpacity
                key={slide.id}
                onPress={() => goToSlide(index)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1}`}
                style={[
                  styles.stepDot,
                  {
                    width: isActive ? 26 : 6,
                    backgroundColor: isActive
                      ? themeColors.stepperActive
                      : themeColors.stepperInactive,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Slides 1-3 Controls */}
        {!isLastSlide ? (
          <View style={styles.standardNavRow}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => goToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
              style={[
                styles.circleNavBtn,
                {
                  borderColor: themeColors.border,
                  opacity: currentIndex === 0 ? 0 : 1,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.chevronLeft,
                  { borderColor: themeColors.primaryText },
                ]}
              />
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              onPress={() => goToSlide(currentIndex + 1)}
              accessibilityRole="button"
              accessibilityLabel="Next slide"
              style={[
                styles.circleNavBtnFilled,
                {
                  backgroundColor: themeColors.buttonPrimary,
                },
              ]}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.chevronRight,
                  { borderColor: themeColors.buttonPrimaryText },
                ]}
              />
            </TouchableOpacity>
          </View>
        ) : (
          /* Slide 4 Call-to-Actions */
          <View style={styles.finalNavBlock}>
            {/* Primary 'Get Started' Button */}
            <TouchableOpacity
              onPress={() => handleFinish('Signup')}
              accessibilityRole="button"
              accessibilityLabel="Get started"
              style={[
                styles.primaryPillBtn,
                {
                  backgroundColor: themeColors.buttonPrimary,
                },
              ]}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.primaryPillBtnText,
                  {
                    color: themeColors.buttonPrimaryText,
                    fontFamily: editorialTheme.fonts.sansSemiBold,
                  },
                ]}
              >
                Get started
              </Text>
              <Text style={styles.amberArrow}>➔</Text>
            </TouchableOpacity>

            {/* Secondary 'I already have an account' Text Link */}
            <TouchableOpacity
              onPress={() => handleFinish('Login')}
              accessibilityRole="button"
              accessibilityLabel="I already have an account"
              style={styles.secondaryLinkBtn}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.secondaryLinkText,
                  {
                    color: themeColors.secondaryText,
                    fontFamily: editorialTheme.fonts.sansMedium,
                  },
                ]}
              >
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ambient bottom home indicator safe bar */}
        <View
          style={[
            styles.homeIndicatorBar,
            { backgroundColor: themeColors.indicatorBar },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandText: {
    fontSize: 12,
    letterSpacing: 1.6,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  skipText: {
    fontSize: 13,
  },
  skipPlaceholder: {
    width: 48,
    height: 24,
  },
  carousel: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 12,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3.5,
  },
  standardNavRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    height: 58,
  },
  circleNavBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNavBtnFilled: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  chevronLeft: {
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginRight: -2,
  },
  chevronRight: {
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginLeft: -2,
  },
  finalNavBlock: {
    width: '100%',
    alignItems: 'center',
  },
  primaryPillBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  primaryPillBtnText: {
    fontSize: 15,
    marginRight: 8,
    letterSpacing: 0.2,
  },
  amberArrow: {
    fontSize: 16,
    color: '#F5A623',
    fontWeight: '700',
  },
  secondaryLinkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  secondaryLinkText: {
    fontSize: 13,
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    marginTop: 14,
  },
});
