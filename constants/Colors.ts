import { colors } from '@/src/theme/colors';

export default {
  light: {
    text: colors.light.text,
    background: colors.light.background,
    tint: colors.primary,
    tabIconDefault: colors.light.textMuted,
    tabIconSelected: colors.primary,
    card: colors.light.card,
    border: colors.light.border,
  },
  dark: {
    text: colors.dark.text,
    background: colors.dark.background,
    tint: colors.primaryLight,
    tabIconDefault: colors.dark.textMuted,
    tabIconSelected: colors.primaryLight,
    card: colors.dark.card,
    border: colors.dark.border,
  },
};
