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
