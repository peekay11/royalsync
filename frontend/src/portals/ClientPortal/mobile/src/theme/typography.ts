import { Platform, TextStyle } from 'react-native';

/**
 * Standard iOS (Human Interface Guidelines) & Android (Material Design 3) 
 * Typography and Layout Specifications for Royal Square Mobile
 */

export const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const FONT_SIZES = {
  display: 28,
  title1: 22,
  title2: 18,
  headline: 16,
  body: 14,
  subhead: 13,
  footnote: 12,
  caption: 11,
  meta: 10,
};

export const LINE_HEIGHTS = {
  display: 34,
  title1: 28,
  title2: 24,
  headline: 22,
  body: 20,
  subhead: 18,
  footnote: 16,
  caption: 14,
  meta: 12,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16, // standard screen horizontal padding / gutter
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // standard mobile card radius
  xl: 20,
  pill: 9999,
};

export const TOUCH_TARGET = {
  minHeight: 48, // standard mobile accessible touch height
  buttonHeight: 48,
  inputHeight: 48,
  iconButtonSize: 44,
};

export const TYPOGRAPHY: Record<string, TextStyle> = {
  display: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.display,
    lineHeight: LINE_HEIGHTS.display,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title1: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.title1,
    lineHeight: LINE_HEIGHTS.title1,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  title2: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.title2,
    lineHeight: LINE_HEIGHTS.title2,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headline: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.headline,
    lineHeight: LINE_HEIGHTS.headline,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    fontWeight: '500',
  },
  bodyBold: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.body,
    lineHeight: LINE_HEIGHTS.body,
    fontWeight: '700',
  },
  subhead: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.subhead,
    lineHeight: LINE_HEIGHTS.subhead,
    fontWeight: '500',
  },
  footnote: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.footnote,
    lineHeight: LINE_HEIGHTS.footnote,
    fontWeight: '400',
  },
  footnoteMedium: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.footnote,
    lineHeight: LINE_HEIGHTS.footnote,
    fontWeight: '600',
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
    fontWeight: '500',
  },
  meta: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES.meta,
    lineHeight: LINE_HEIGHTS.meta,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};
