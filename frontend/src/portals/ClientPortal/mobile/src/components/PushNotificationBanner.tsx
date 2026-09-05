import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RoyalSquareLogo } from './RoyalSquareLogo';
import { AppNotification } from '../types';
import {
  CarIcon,
  ShieldIcon,
  DocumentTextIcon,
  AlertIcon,
  CheckmarkIcon,
} from './GrommetIcons';

interface PushNotificationBannerProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onPressAction?: (notification: AppNotification) => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  notification,
  onDismiss,
  onPressAction,
}) => {
  const { colors, isDark } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (notification) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }).start();

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-120);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  const renderIcon = () => {
    switch (notification.category) {
      case 'claim':
        return <CarIcon color={colors.primary} size={18} />;
      case 'policy':
        return <ShieldIcon color={colors.gold} size={18} />;
      case 'document':
        return <AlertIcon color={colors.primary} size={18} />;
      default:
        return <DocumentTextIcon color={colors.primary} size={18} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.bannerCard,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa',
            shadowColor: '#000000',
            shadowOpacity: isDark ? 0.3 : 0.1,
          },
        ]}
        onPress={() => {
          if (onPressAction) onPressAction(notification);
          handleDismiss();
        }}
        activeOpacity={0.92}
      >
        {/* Top Mini Header */}
        <View style={styles.topRow}>
          <View style={styles.brandGroup}>
            <RoyalSquareLogo size={18} />
            <Text style={[styles.appName, { color: colors.textSecondary }]}>ROYAL SQUARE ALERT</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>{notification.timestamp}</Text>
          </View>

          <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.closeX, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View style={styles.bodyRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryAlpha }]}>
            {renderIcon()}
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {notification.title}
              </Text>
              {notification.badgeText && (
                <View style={[styles.badge, { backgroundColor: colors.primaryAlpha, borderColor: colors.primaryBorder }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{notification.badgeText}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        </View>

        {/* Action Prompt */}
        <View style={[styles.actionRow, { borderTopColor: isDark ? '#262626' : colors.divider }]}>
          <Text style={[styles.actionText, { color: colors.primary }]}>Tap to open update details →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    zIndex: 9999,
  },
  bannerCard: {
    borderRadius: 20,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dot: {
    fontSize: 10,
  },
  timeText: {
    fontSize: 10,
  },
  closeX: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  message: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  actionRow: {
    paddingTop: 6,
    alignItems: 'flex-end',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
