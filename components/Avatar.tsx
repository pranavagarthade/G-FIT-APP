import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  imageUri?: string | null;
  showRing?: boolean;
  style?: ViewStyle;
}

export default function Avatar({
  name,
  size = 44,
  imageUri,
  showRing = false,
  style,
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fontSize = size * 0.38;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        showRing && styles.ring,
        showRing && { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: showRing ? size - 2 : size,
            height: showRing ? size - 2 : size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    borderWidth: 2,
    borderColor: Colors.primaryTeal,
    padding: 1,
  },
  inner: {
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-SemiBold',
  },
});
