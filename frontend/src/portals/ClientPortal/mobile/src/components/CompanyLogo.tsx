import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const LOGODEV_TOKEN = 'pk_YATscD2-Rx6ItVMsD1ElFw';

// Mapping known South African financial & insurance institutions to primary domains for crisp logo matching
const DOMAIN_MAP: Record<string, string> = {
  'King Price': 'kingprice.co.za',
  'Sanlam': 'sanlam.co.za',
  'Discovery Health': 'discovery.co.za',
  'Discovery': 'discovery.co.za',
  'Santam': 'santam.co.za',
  'Liberty': 'liberty.co.za',
  'Old Mutual': 'oldmutual.co.za',
  'Momentum': 'momentum.co.za',
  'Allan Gray': 'allangray.co.za',
  'FNB': 'fnb.co.za',
  'First National Bank': 'fnb.co.za',
  'Royal Square': 'royalsquare.co.za',
};

interface CompanyLogoProps {
  name?: string;
  domain?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  rounded?: boolean;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name = 'Royal Square',
  domain,
  size = 36,
  style,
  rounded = true,
}) => {
  const { colors, isDark } = useTheme();
  const [hasError, setHasError] = useState(false);

  const safeName = (name && typeof name === 'string' && name.trim()) ? name.trim() : 'Royal Square';

  // Determine lookup path: domain or name
  const targetDomain = domain || DOMAIN_MAP[safeName];
  const url = targetDomain
    ? `https://img.logo.dev/${encodeURIComponent(targetDomain)}?token=${LOGODEV_TOKEN}&format=png&retina=true&theme=${isDark ? 'dark' : 'light'}`
    : `https://img.logo.dev/name/${encodeURIComponent(safeName)}?token=${LOGODEV_TOKEN}&format=png&retina=true&theme=${isDark ? 'dark' : 'light'}`;

  const monogram = safeName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'RS';

  const borderRadius = rounded ? size / 2 : 8;

  if (hasError) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: colors.primaryAlpha,
          },
          style as any,
        ]}
      >
        <Text style={[styles.fallbackText, { color: colors.primary, fontSize: size * 0.4 }]}>
          {monogram}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.logoWrapper,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: isDark ? '#262228' : '#ffffff',
        },
      ]}
    >
      <Image
        source={{ uri: url }}
        style={[
          {
            width: size * 0.78,
            height: size * 0.78,
            borderRadius: rounded ? (size * 0.78) / 2 : 4,
          },
          style,
        ]}
        resizeMode="contain"
        onError={() => setHasError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
