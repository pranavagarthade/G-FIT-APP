import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Radius, Spacing } from '../constants/theme';

interface ShareCardProps {
  photoUrl: any;
  title: string;
  stat: string;
  subStat: string;
  showExact: boolean;
}

export default function ShareCard({ photoUrl, title, stat, subStat, showExact }: ShareCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [showExact]); // Re-animate when toggle changes to highlight the change

  return (
    <Animated.View style={[
      styles.card, 
      { 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }] 
      }
    ]}>
      {/* Background with slight tint for text readability */}
      <Image source={photoUrl} style={styles.backgroundImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(14, 124, 134, 0.8)']} // Teal gradient
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.topLogo}>
          <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.brandText}>G Fit</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.mainStat}>{stat}</Text>
          <Text style={styles.subStat}>{subStat}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    height: 444, // roughly 9:16 ratio
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cardSurface,
    position: 'relative',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  topLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  brandText: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.caption,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  mainStat: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.accentLime,
    textAlign: 'center',
    marginBottom: 4,
  },
  subStat: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
  },
});
