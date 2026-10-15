import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'teal' | 'lime' | 'muted' | 'destructive';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function Badge({ label, variant = 'teal', size = 'sm', style }: BadgeProps) {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      size === 'md' && styles.md,
      style,
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text` as keyof typeof styles],
        size === 'md' && styles.mdText,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  teal: {
    backgroundColor: Colors.primaryTealLight,
  },
  lime: {
    backgroundColor: Colors.accentLimeLight,
  },
  muted: {
    backgroundColor: Colors.cardSurface,
  },
  destructive: {
    backgroundColor: Colors.destructiveLight,
  },
  text: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
  },
  tealText: {
    color: Colors.primaryTeal,
  },
  limeText: {
    color: '#5A8A1F',
  },
  mutedText: {
    color: Colors.textSecondary,
  },
  destructiveText: {
    color: Colors.destructive,
  },
  mdText: {
    fontSize: 13,
  },
});
