/**
 * CampusConnect - Theme Configuration & Visual Tokens
 * High-performance, accessible design tokens following HSL harmonious color principles.
 */

export const colors = {
  // Brand Accents
  primary: '#6366F1', // Indigo (core brand)
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  secondary: '#14B8A6', // Teal (productivity & positive actions)
  secondaryLight: '#2DD4BF',
  secondaryDark: '#0D9488',

  // System States
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Rose
  info: '#3B82F6', // Blue

  // Dark Mode Palette (Default Core Theme)
  dark: {
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    border: '#334155', // Slate 700
    text: '#F8FAFC', // Slate 50
    textMuted: '#94A3B8', // Slate 400
    textPlaceholder: '#64748B', // Slate 500
    accentBg: '#1E1B4B', // Translucent Indigo Dark
  },

  // Light Mode Palette
  light: {
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    border: '#E2E8F0', // Slate 200
    text: '#0F172A', // Slate 900
    textMuted: '#64748B', // Slate 500
    textPlaceholder: '#94A3B8', // Slate 400
    accentBg: '#EEF2FF', // Translucent Indigo Light
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 38,
    xxxl: 48,
  },
};
