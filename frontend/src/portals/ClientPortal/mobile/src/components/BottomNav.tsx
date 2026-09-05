import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen } from '../types';
import { useTheme } from '../theme/ThemeContext';
import {
  HomeIcon,
  ShieldIcon,
  TargetIcon,
  DocumentTextIcon,
  UserIcon,
} from './GrommetIcons';

interface BottomNavProps {
  active: Screen;
  onSelect: (s: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onSelect }) => {
  const { colors, easyMode, scaleFont } = useTheme();

  const iconSize = easyMode ? 24 : 20;

  const tabs: { id: Screen; label: string; renderIcon: (active: boolean) => React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      renderIcon: isActive => (
        <HomeIcon color={isActive ? colors.primary : colors.textMuted} size={iconSize} />
      ),
    },
    {
      id: 'portfolio',
      label: 'Policies',
      renderIcon: isActive => (
        <ShieldIcon color={isActive ? colors.primary : colors.textMuted} size={iconSize} />
      ),
    },
    {
      id: 'goals',
      label: 'Goals',
      renderIcon: isActive => (
        <TargetIcon color={isActive ? colors.primary : colors.textMuted} size={iconSize} />
      ),
    },
    {
      id: 'claims',
      label: 'Claims',
      renderIcon: isActive => (
        <DocumentTextIcon color={isActive ? colors.primary : colors.textMuted} size={iconSize} />
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      renderIcon: isActive => (
        <UserIcon color={isActive ? colors.primary : colors.textMuted} size={iconSize} />
      ),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundElevated,
        },
      ]}
    >
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={styles.tabButton}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && {
                  backgroundColor: colors.hoverBackground,
                },
              ]}
            >
              {tab.renderIcon(isActive)}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontSize: scaleFont(11),
                },
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 6,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 52,
  },
  iconWrapper: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

