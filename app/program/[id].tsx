import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { programs } from '../../constants/programs';
import { testimonials, coach } from '../../constants/mockData';
import CardSurface from '../../components/CardSurface';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import FAQAccordion from '../../components/FAQAccordion';
import SectionHeader from '../../components/SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = programs.find((p) => p.id === id);

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Program not found</Text>
      </SafeAreaView>
    );
  }

  const handleTalkToExpert = () => {
    Linking.openURL(
      'https://wa.me/918898476506?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20the%20' +
        encodeURIComponent(program.title) +
        '%20program.'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleTalkToExpert} style={styles.expertPill}>
            <Ionicons name="headset-outline" size={16} color={Colors.primaryTeal} />
            <Text style={styles.expertText}>Talk to an expert</Text>
          </TouchableOpacity>
        </View>

        {/* Success Stories Avatars */}
        <SectionHeader title="SUCCESS STORIES" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.avatarRow}>
            {testimonials.map((t) => (
              <Avatar key={t.id} name={t.name} size={48} showRing />
            ))}
          </View>
        </ScrollView>

        {/* Headline */}
        <Text style={styles.headline}>Manage {program.shortTitle} with Us!</Text>
        <Text style={styles.subheadline}>
          Expert-guided yoga, nutrition & lifestyle coaching tailored to your needs
        </Text>

        {/* Hero Card */}
        <CardSurface style={styles.heroCard} variant="outlined">
          <Badge label="Recommended" variant="teal" style={styles.recBadge} />

          <View style={styles.heroIconWrap}>
            <Ionicons name={program.icon as any} size={40} color={Colors.primaryTeal} />
          </View>

          {program.benefits.map((benefit, i) => (
            <View key={i} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.accentLime} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}

          <View style={styles.heroButtons}>
            <Button
              title="Know More"
              onPress={handleTalkToExpert}
              variant="secondary"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title="Book with Geetanjali"
              onPress={handleTalkToExpert}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </CardSurface>

        {/* Testimonials */}
        <SectionHeader title="What people are saying" />
        <FlatList
          horizontal
          data={testimonials}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH * 0.75 + Spacing.md}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: Spacing.md }}
          scrollEnabled
          renderItem={({ item }) => (
            <CardSurface style={styles.testimonialCard} variant="outlined">
              <View style={styles.testimonialHeader}>
                <Avatar name={item.name} size={36} />
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialName}>{item.name}</Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={12}
                        color={s <= item.rating ? Colors.goldAccent : Colors.border}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.testimonialQuote} numberOfLines={3}>
                "{item.quote}"
              </Text>
            </CardSurface>
          )}
        />

        {/* FAQs */}
        <SectionHeader title="FAQs" />
        <FAQAccordion items={program.faqs} />

        <TouchableOpacity style={styles.allFaqLink}>
          <Text style={styles.allFaqText}>View all FAQs about membership & pricing →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.md,
  },
  expertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryTealLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  expertText: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  headline: {
    ...Typography.h1,
    marginTop: Spacing.lg,
  },
  subheadline: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  // Hero card
  heroCard: {
    position: 'relative',
    paddingTop: Spacing.xl,
  },
  recBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  benefitText: {
    ...Typography.body,
    flex: 1,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  // Testimonials
  testimonialCard: {
    width: SCREEN_WIDTH * 0.75,
    marginRight: Spacing.md,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  testimonialQuote: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // FAQ link
  allFaqLink: {
    paddingVertical: Spacing.md,
  },
  allFaqText: {
    ...Typography.body,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
});
