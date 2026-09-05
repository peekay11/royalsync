import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface HoverableCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  disabled?: boolean;
}

export const HoverableCard: React.FC<HoverableCardProps> = ({
  children,
  onPress,
  style,
  hoverStyle,
  activeOpacity = 0.88,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isInteracted, setIsInteracted] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setIsInteracted(true)}
      onPressOut={() => setIsInteracted(false)}
      // Support for web pointer hover
      // @ts-ignore
      onMouseEnter={() => setIsInteracted(true)}
      // @ts-ignore
      onMouseLeave={() => setIsInteracted(false)}
      style={[
        styles.cardBase,
        {
          backgroundColor: isInteracted ? colors.hoverBackground : colors.card,
        },
        style,
        isInteracted && hoverStyle,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});
