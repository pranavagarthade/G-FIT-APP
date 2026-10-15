import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface FlaggedPlaceholderProps {
  title: string;
  description: string;
  icon?: string;
  ctaText?: string;
}

export default function FlaggedPlaceholder({
  title,
  description,
  icon = 'lock-closed-outline',
  ctaText,
}: FlaggedPlaceholderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={28} color={Colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {ctaText && (
        <View style={styles.ctaBadge}>
          <Ionicons name="arrow-forward" size={14} color={Colors.primaryTeal} />
          <Text style={styles.ctaText}>{ctaText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    ...Typography.caption,
    textAlign: 'center',
    maxWidth: 260,
  },
  ctaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryTealLight,
  },
  ctaText: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
});
