import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Typography, Spacing } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export default function SectionHeader({ title, rightElement }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  title: {
    ...Typography.h2,
  },
});
