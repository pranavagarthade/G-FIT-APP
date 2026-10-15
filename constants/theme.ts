/**
 * G Fit Design System
 * Brand: Geetanjali Yoga & Fitness Zone
 * 
 * All design tokens are centralized here. Every screen and component
 * references these values — never hardcode colors, spacing, or type sizes.
 */

export const Colors = {
  primaryTeal: '#0E7C86',
  primaryTealLight: '#0E7C8620', // 12% opacity for backgrounds
  primaryTealMedium: '#0E7C8640', // 25% opacity for hover states
  accentLime: '#8BC53F',
  accentLimeLight: '#8BC53F20',
  background: '#FFFFFF',
  cardSurface: '#F4F9F8',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E9E8',
  destructive: '#E64C3D',
  destructiveLight: '#E64C3D15',
  goldAccent: '#D4A843', // rewards/coin — deliberate palette exception
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const Typography = {
  h1: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 22 * 1.4,
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 17,
    fontFamily: 'Poppins-Medium',
    lineHeight: 17 * 1.4,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 14 * 1.4,
    color: Colors.textPrimary,
  },
  button: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    lineHeight: 14 * 1.4,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 12 * 1.4,
    color: Colors.textSecondary,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Shadows = {
  // Extremely soft — per spec, use hairline borders primarily
  card: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  elevated: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const Animation = {
  fast: 200,
  standard: 250,
  slow: 300,
  buttonScale: 0.97,
} as const;
