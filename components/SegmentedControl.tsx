import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface SegmentedControlProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function SegmentedControl({ tabs, activeIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onChange(index)}
          style={[
            styles.tab,
            activeIndex === index && styles.activeTab,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeIndex === index && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderRadius: Radius.md - 2,
  },
  activeTab: {
    backgroundColor: Colors.primaryTeal,
  },
  tabText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
});
