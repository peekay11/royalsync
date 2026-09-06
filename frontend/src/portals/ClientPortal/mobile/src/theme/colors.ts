export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  backgroundDark: string;
  backgroundElevated: string;
  card: string;
  cardBorder: string;
  cardHover: string;

  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryAlpha: string;
  primaryBorder: string;

  hoverBackground: string;
  hoverBorder: string;
  hoverAlpha: string;

  royalPurple: string;
  royalPurpleAlpha: string;

  gold: string;
  goldAlpha: string;
  goldBorder: string;

  success: string;
  successAlpha: string;
  successBorder: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textSubtle: string;

  white: string;
  black: string;
  divider: string;
  inputBackground: string;
  inputBorder: string;
}

export const DARK_COLORS: ThemeColors = {
  background: '#141214',
  backgroundDark: '#0e0c0e',
  backgroundElevated: '#1e1a20',
  card: '#221e24',
  cardBorder: 'transparent',
  cardHover: 'rgba(217, 40, 32, 0.10)',

  primary: '#D92820', // King Price Poppy Red
  primaryDark: '#B81B14',
  primaryLight: '#EA3B33',
  primaryAlpha: 'rgba(217, 40, 32, 0.14)',
  primaryBorder: '#D92820',

  hoverBackground: 'rgba(217, 40, 32, 0.12)',
  hoverBorder: '#D92820',
  hoverAlpha: 'rgba(217, 40, 32, 0.15)',

  royalPurple: '#8E28A0', // King Price Royal Purple (accent)
  royalPurpleAlpha: 'rgba(142, 40, 160, 0.15)',

  gold: '#FCC200', // King Price Crown Gold
  goldAlpha: 'rgba(252, 194, 0, 0.14)',
  goldBorder: 'transparent',

  success: '#00A859', // King Price Green
  successAlpha: 'rgba(0, 168, 89, 0.14)',
  successBorder: 'transparent',

  text: '#F7F7F8',
  textSecondary: '#A8A4A8',
  textMuted: '#7E7A80',
  textSubtle: '#5A565C',

  white: '#ffffff',
  black: '#000000',
  divider: '#2A242C',
  inputBackground: '#1e1a20',
  inputBorder: '#332b38',
};

export const LIGHT_COLORS: ThemeColors = {
  background: '#FFFFFF',
  backgroundDark: '#F7F8FA',
  backgroundElevated: '#F2F4F7',
  card: '#F4F5F8',
  cardBorder: 'transparent',
  cardHover: 'rgba(217, 40, 32, 0.05)',

  primary: '#D92820', // King Price Poppy Red
  primaryDark: '#B81B14',
  primaryLight: '#EA3B33',
  primaryAlpha: 'rgba(217, 40, 32, 0.08)',
  primaryBorder: '#D92820',

  hoverBackground: 'rgba(217, 40, 32, 0.06)',
  hoverBorder: '#D92820',
  hoverAlpha: 'rgba(217, 40, 32, 0.10)',

  royalPurple: '#651D71', // King Price Royal Purple
  royalPurpleAlpha: 'rgba(101, 29, 113, 0.08)',

  gold: '#FCC200', // King Price Crown Gold
  goldAlpha: 'rgba(252, 194, 0, 0.12)',
  goldBorder: 'transparent',

  success: '#00A859', // King Price Green
  successAlpha: 'rgba(0, 168, 89, 0.10)',
  successBorder: 'transparent',

  text: '#1D1D1B', // King Price Signature Charcoal
  textSecondary: '#575756',
  textMuted: '#7C7C7B',
  textSubtle: '#9A9A99',

  white: '#ffffff',
  black: '#000000',
  divider: '#EEEEF0',
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
};

// Default export fallback for backward compatibility
export const COLORS = LIGHT_COLORS;


