import { useColorScheme } from '@/components/useColorScheme';
import { borderRadius, colors, spacing, typography } from '@/src/theme/colors';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  iconName?: keyof typeof Feather.glyphMap;
  rightIconName?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  iconName,
  rightIconName,
  onRightIconPress,
  containerStyle,
  inputStyle,
  ...props
}) => {
  const themeMode = useColorScheme() ?? 'dark';
  const [isFocused, setIsFocused] = useState(false);

  const activeColors = colors[themeMode];

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return activeColors.border;
  };

  const getLabelColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return activeColors.textMuted;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: getLabelColor() }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: activeColors.card,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {iconName && (
          <Feather
            name={iconName}
            size={20}
            color={error ? colors.error : isFocused ? colors.primary : activeColors.textPlaceholder}
            style={styles.leadingIcon}
          />
        )}

        <TextInput
          style={[
            styles.textInput,
            {
              color: activeColors.text,
            },
            inputStyle,
          ]}
          placeholderTextColor={activeColors.textPlaceholder}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {rightIconName && (
          <Pressable onPress={onRightIconPress} style={styles.rightIconPressable}>
            <Feather
              name={rightIconName}
              size={20}
              color={activeColors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: activeColors.textMuted }]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: typography.fontSizes.md,
  },
  rightIconPressable: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  helperText: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs,
  },
});
