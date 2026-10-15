import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { programs } from '../../constants/programs';
import ProgramCard from '../../components/ProgramCard';

export default function CoachScreen() {
  // Build rows of 2 for the grid
  const rows: (typeof programs[0])[][] = [];
  for (let i = 0; i < programs.length; i += 2) {
    rows.push(programs.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.title}>Choose your program</Text>
        </View>
        <Text style={styles.subtitle}>
          Personalized yoga & fitness coaching for your specific health condition
        </Text>

        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((program) => (
                <ProgramCard
                  key={program.id}
                  title={program.shortTitle}
                  description={program.description}
                  icon={program.icon}
                  onPress={() => router.push(`/program/${program.id}`)}
                />
              ))}
              {row.length === 1 && <View style={{ flex: 1, margin: 4 }} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  grid: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
  },
});
