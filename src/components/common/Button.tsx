import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, colors, spacing, typography } from '@/src/theme/colors';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const themeMode = useColorScheme() ?? 'dark';

  const getButtonStyles = (pressed: boolean): StyleProp<ViewStyle>[] => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
      transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
    };

    let variantStyle: ViewStyle = {};

    switch (variant) {
      case 'secondary':
        variantStyle = {
          backgroundColor: colors.secondary,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: themeMode === 'dark' ? colors.dark.border : colors.light.border,
        };
        break;
      case 'link':
        variantStyle = {
          backgroundColor: 'transparent',
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.xs,
          alignSelf: 'center',
        };
        break;
      case 'primary':
      default:
        variantStyle = {
          backgroundColor: colors.primary,
        };
        break;
    }

    return [baseStyle, variantStyle, style as ViewStyle];
  };

  const getTextStyle = (): StyleProp<TextStyle>[] => {
    let variantTextStyle: TextStyle = {};

    switch (variant) {
      case 'outline':
        variantTextStyle = {
          color: themeMode === 'dark' ? colors.dark.text : colors.light.text,
        };
        break;
      case 'link':
        variantTextStyle = {
          color: colors.primaryLight,
          textDecorationLine: 'underline',
          fontSize: typography.fontSizes.sm,
        };
        break;
      case 'secondary':
        variantTextStyle = {
          color: '#FFFFFF',
        };
        break;
      case 'primary':
      default:
        variantTextStyle = {
          color: '#FFFFFF',
        };
        break;
    }

    return [styles.text, variantTextStyle, textStyle as TextStyle];
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => getButtonStyles(pressed)}
      android_ripple={{ color: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? (themeMode === 'dark' ? colors.dark.text : colors.light.text) : '#FFFFFF'}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  text: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
