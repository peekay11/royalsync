import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AnalyticsIcon, NotificationIcon, CarIcon } from '../components/GrommetIcons';
import { RoyalSquareLogo } from '../components/RoyalSquareLogo';

interface OnboardScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const { width } = Dimensions.get('window');

export const OnboardScreen: React.FC<OnboardScreenProps> = ({ onLogin, onRegister }) => {
  const { colors, isDark } = useTheme();

  const slides = [
    {
      renderIcon: () => <AnalyticsIcon color={colors.primary} size={42} strokeWidth={2.2} />,
      title: 'Your Wealth,\nOne View',
      body: 'Real-time net worth, goal progress, and portfolio performance — all in one place.',
    },
    {
      renderIcon: () => <NotificationIcon color={colors.primary} size={42} strokeWidth={2.2} />,
      title: 'Never Miss\na Deadline',
      body: 'Automated reminders for renewals, reviews, licences, and compliance tasks.',
    },
    {
      renderIcon: () => <CarIcon color={colors.primary} size={42} strokeWidth={2.2} />,
      title: 'Claims Made\nSimple',
      body: 'Report an accident, upload documents, and track your claim status in minutes.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main slide content */}
      <View style={styles.slideContainer}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isDark ? '#1a1a1a' : colors.card,
              borderColor: isDark ? '#2a2a2a' : colors.cardBorder,
              shadowColor: '#000000',
            },
          ]}
        >
          {slides[currentIndex].renderIcon()}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{slides[currentIndex].title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{slides[currentIndex].body}</Text>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.dotActive, { backgroundColor: colors.primary }]
                  : [styles.dotInactive, { backgroundColor: isDark ? '#333333' : '#d0d5dd' }],
              ]}
            />
          ))}
        </View>
      </View>

      {/* Brand signature */}
      <View style={styles.brandRow}>
        <RoyalSquareLogo size={20} secondaryColor={isDark ? '#f0ede8' : '#1e1e1e'} />
        <Text style={[styles.brandText, { color: colors.textMuted }]}>ROYAL SQUARE FINANCIAL</Text>
      </View>

      {/* CTA action buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onRegister}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.cardBorder,
              backgroundColor: colors.card,
            },
          ]}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 14,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
  },
  dotInactive: {
    width: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    opacity: 0.75,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  ctaContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
