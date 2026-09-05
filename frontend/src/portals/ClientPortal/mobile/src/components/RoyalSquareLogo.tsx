import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface RoyalSquareLogoProps {
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  secondaryColor?: string; // Kept for API compatibility
  primaryColor?: string;
}

/**
 * Royal Square Financial official emblem.
 * Uses the authentic brand logo asset with transparent background.
 */
export const RoyalSquareLogo: React.FC<RoyalSquareLogoProps> = ({
  size = 48,
  width,
  height,
  style,
}) => {
  const finalWidth = width || size;
  // Aspect ratio is 603 / 538 (~1.12)
  const finalHeight = height || Math.round(finalWidth * (538 / 603));

  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[
        {
          width: finalWidth,
          height: finalHeight,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};
