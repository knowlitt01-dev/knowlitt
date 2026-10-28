/**
 * BookTutor Design Tokens — single source of truth for both web and mobile.
 * Primary: #4A36DE  |  Accent: #FA9E33
 */

export const colors = {
  // Core brand
  primary:        '#4A36DE',
  primaryLight:   '#7868F8',
  primaryDark:    '#3827C5',
  primarySurface: '#EDEAFF',

  accent:         '#FA9E33',
  accentLight:    '#FFD394',
  accentDark:     '#E08820',
  accentSurface:  '#FFF5E8',

  // Semantic
  background: '#FAFAFC',
  card:       '#FFFFFF',
  border:     '#E5E5EE',
  text:       '#171720',
  subtext:    '#74757F',
  success:    '#29A666',
  successBg:  '#E8F8EF',
  error:      '#CC3333',
  errorBg:    '#FFEAEA',
  warning:    '#E08820',
  warningBg:  '#FFF5E8',

  // Neutrals
  gray50:  '#FAFAFC',
  gray100: '#F0F0F5',
  gray200: '#E5E5EE',
  gray300: '#D0D0DB',
  gray400: '#A0A0AD',
  gray500: '#74757F',
  gray600: '#505060',
  gray700: '#35354A',
  gray900: '#171720',

  // Legacy aliases (used by existing components)
  brand50:  '#EDEAFF',
  brand100: '#DDD9FF',
  brand400: '#7868F8',
  brand500: '#5B47E8',
  brand600: '#4A36DE',
  brand700: '#3827C5',
  gray200_old: '#E5E5EE',
  red600:   '#CC3333',
  red700:   '#A82929',
  green600: '#29A666',
  amber500: '#FA9E33',
};

/** Spacing scale: 4, 8, 10, 12, 14, 16, 18, 20, 24 */
export const spacing = {
  xs:  4,
  sm:  8,
  sm2: 10,
  md:  12,
  md2: 14,
  lg:  16,
  lg2: 18,
  xl:  20,
  xl2: 24,
  // Legacy aliases
  '2xl': 32,
};

/** Radius scale: 10, 12, 14, 16, 18, 20 */
export const radius = {
  sm:  10,
  md:  12,
  md2: 14,
  lg:  16,
  lg2: 18,
  xl:  20,
  xl2: 24,
  full: 9999,
};

export const typography = {
  fontFamily: 'Inter',
  sizes: {
    xs:   11,
    sm:   12,
    base: 14,
    md:   15,
    lg:   16,
    xl:   18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
  },
};

export const shadows = {
  card: {
    shadowColor: '#171720',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#4A36DE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  primary: {
    shadowColor: '#4A36DE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

/**
 * Stitch Design System Foundation: "Literary Minimalist"
 * High-contrast editorial serif paired with neutral modern sans-serif.
 * Preserves legacy design tokens above for full backwards compatibility.
 */
export const editorialTheme = {
  fonts: {
    serifSemiBold: 'PlayfairDisplay_600SemiBold',
    serifMedium: 'PlayfairDisplay_500Medium',
    serifRegular: 'PlayfairDisplay_400Regular',
    serifItalic: 'PlayfairDisplay_400Regular_Italic',
    sansRegular: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
  },
  colors: {
    light: {
      canvas: '#FBFBFA',
      card: '#FFFFFF',
      illustrationBg: '#FBFBFC',
      border: '#E6E6E3',
      borderSubtle: '#F0F0EC',
      primaryText: '#111111',
      secondaryText: '#6A6A6D',
      mutedText: '#8E8E93',
      accent: '#E59819',
      accentHover: '#D48812',
      accentSoft: 'rgba(229, 152, 25, 0.14)',
      accentLight: '#FDF6E2',
      buttonPrimary: '#111111',
      buttonPrimaryText: '#FFFFFF',
      buttonSecondary: '#F4F4F5',
      buttonSecondaryText: '#27272A',
      inputBg: '#FFFFFF',
      inputBorder: '#D8D8D4',
      inputBorderFocus: '#111111',
      inputPlaceholder: '#A1A1A6',
      tagBg: '#F3F3F0',
      tagBorder: '#E4E4DF',
      tagText: '#555558',
      errorBg: '#FEF2F2',
      errorBorder: '#FECACA',
      errorText: '#DC2626',
      stepperInactive: '#D4D4D8',
      stepperActive: '#E59819',
      indicatorBar: '#E4E4E7',
    },
    dark: {
      canvas: '#131316',
      card: '#1C1C22',
      illustrationBg: '#22222A',
      border: '#2C2C35',
      borderSubtle: '#222229',
      primaryText: '#F4F4F6',
      secondaryText: '#A1A1AA',
      mutedText: '#71717A',
      accent: '#E59819',
      accentHover: '#F5A623',
      accentSoft: 'rgba(229, 152, 25, 0.18)',
      accentLight: '#241E14',
      buttonPrimary: '#F4F4F6',
      buttonPrimaryText: '#111111',
      buttonSecondary: '#26262F',
      buttonSecondaryText: '#F4F4F6',
      inputBg: '#18181D',
      inputBorder: '#2F2F38',
      inputBorderFocus: '#F4F4F6',
      inputPlaceholder: '#5A5A62',
      tagBg: '#1E1E25',
      tagBorder: '#2E2E39',
      tagText: '#A1A1AA',
      errorBg: 'rgba(239, 68, 68, 0.12)',
      errorBorder: 'rgba(239, 68, 68, 0.28)',
      errorText: '#FCA5A5',
      stepperInactive: '#3E3E46',
      stepperActive: '#E59819',
      indicatorBar: '#2C2C35',
    },
  },
  spacing: {
    margin: 20,
    spaceXs: 4,
    spaceSm: 8,
    spaceMd: 16,
    spaceLg: 24,
    spaceXl: 36,
  },
  radius: {
    card: 24,
    pill: 9999,
    book: 8,
  },
};

