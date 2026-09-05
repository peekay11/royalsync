import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: false,
      }),
    ]).start();

    // Transition out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => onDone());
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onDone]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: '#ffffff',
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <RoyalSquareLogo size={96} />
      </Animated.View>

      {/* Brand title */}
      <Text style={[styles.brandTitle, { color: '#111111' }]}>ROYAL SQUARE</Text>
      <Text style={[styles.brandSubtitle, { color: colors.primary }]}>FINANCIAL</Text>

      {/* Footer loading dots indicator */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.35 }]} />
        <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.7 }]} />
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 6,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 48,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
