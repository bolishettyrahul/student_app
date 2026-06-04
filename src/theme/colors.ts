/**
 * CampusConnect - Theme Configuration & Visual Tokens
 * High-performance, accessible design tokens following HSL harmonious color principles.
 */

export const colors = {
  // Brand Accents derived from Google Stitch Design
  primary: '#b4e8ff',
  primaryDark: '#0c6780', // inverse-primary

  secondary: '#c9bfff',
  secondaryDark: '#4720ca',

  tertiary: '#76f4eb',
  tertiaryDark: '#005b56',

  // System States
  success: '#56d7ce', 
  warning: '#F59E0B', 
  error: '#ffdad6', // on-error-container
  errorBg: '#93000a',

  // Dark Mode Palette (Primary focus as per UI)
  dark: {
    background: '#0b1229',
    card: '#222941', // surface-container-high
    border: '#3f484c', // outline-variant
    text: '#dce1ff', // on-background
    textMuted: '#bfc8cd', // on-surface-variant
    textPlaceholder: '#899297', // outline
    accentBg: '#060d24', // surface-container-lowest
  },

  // Light Mode Palette (Generated contrast equivalents)
  light: {
    background: '#f8f9ff',
    card: '#ffffff',
    border: '#c2c7ce',
    text: '#191c20',
    textMuted: '#43474e',
    textPlaceholder: '#73777f',
    accentBg: '#e0e2ec',
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
