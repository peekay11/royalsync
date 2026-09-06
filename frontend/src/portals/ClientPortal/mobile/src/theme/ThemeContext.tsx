import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors, ThemeMode } from './colors';
import {
  FONT_FAMILY,
  FONT_SIZES,
  LINE_HEIGHTS,
  SPACING,
  RADIUS,
  TOUCH_TARGET,
  TYPOGRAPHY,
} from './typography';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  easyMode: boolean;
  fontFamily: string | undefined;
  fontSizes: typeof FONT_SIZES;
  lineHeights: typeof LINE_HEIGHTS;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  touchTarget: typeof TOUCH_TARGET;
  typography: typeof TYPOGRAPHY;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleEasyMode: () => void;
  setEasyMode: (enabled: boolean) => void;
  scaleFont: (baseSize: number) => number;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  colors: LIGHT_COLORS,
  easyMode: false,
  fontFamily: FONT_FAMILY,
  fontSizes: FONT_SIZES,
  lineHeights: LINE_HEIGHTS,
  spacing: SPACING,
  radius: RADIUS,
  touchTarget: TOUCH_TARGET,
  typography: TYPOGRAPHY,
  toggleTheme: () => {},
  setTheme: () => {},
  toggleEasyMode: () => {},
  setEasyMode: () => {},
  scaleFont: (size: number) => size,
});

export const ThemeProvider: React.FC<{ children: ReactNode; defaultTheme?: ThemeMode }> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [easyMode, setEasyModeState] = useState<boolean>(false);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleEasyMode = () => {
    setEasyModeState(prev => !prev);
  };

  const setEasyMode = (enabled: boolean) => {
    setEasyModeState(enabled);
  };

  const scaleFont = (baseSize: number) => {
    return easyMode ? Math.round(baseSize * 1.2) : baseSize;
  };

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        easyMode,
        fontFamily: FONT_FAMILY,
        fontSizes: FONT_SIZES,
        lineHeights: LINE_HEIGHTS,
        spacing: SPACING,
        radius: RADIUS,
        touchTarget: TOUCH_TARGET,
        typography: TYPOGRAPHY,
        toggleTheme,
        setTheme,
        toggleEasyMode,
        setEasyMode,
        scaleFont,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export * from './typography';

