import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Animation } from '../../constants/theme';
import { user, coach, testimonials, weeklyChallenge } from '../../constants/mockData';
import { communityPosts } from '../../constants/communityData';
import CardSurface from '../../components/CardSurface';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import SectionHeader from '../../components/SectionHeader';
import CommunityPost from '../../components/CommunityPost';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ────────────────────── Success Story Card ────────────────────── */
function SuccessStoryCard({
  item,
  index,
}: {
  item: (typeof testimonials)[0];
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.storyCard,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {/* Transformation Image */}
        <View style={styles.storyImageWrap}>
          <Image source={item.image} style={styles.storyImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.storyGradient}
          />
          {/* Transformation badge */}
          <View style={styles.transformBadge}>
            <Ionicons name="sparkles" size={12} color="#FFD700" />
            <Text style={styles.transformBadgeText}>{item.transformation}</Text>
          </View>
          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={11} color={Colors.white} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.storyInfo}>
          <View style={styles.storyNameRow}>
            <Avatar name={item.name} size={32} showRing />
            <View style={styles.storyNameCol}>
              <Text style={styles.storyName}>{item.name}</Text>
              <View style={styles.storyRating}>
                {[...Array(item.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={10} color="#FFB800" />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.storyQuote} numberOfLines={2}>
            "{item.quote}"
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ────────────────────── Home Screen ────────────────────── */
export default function HomeScreen() {
  const [showPulseSheet, setShowPulseSheet] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Staggered section entrance
  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openPulseSheet = () => {
    setShowPulseSheet(true);
    Animated.spring(fabAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  const closePulseSheet = () => {
    Animated.timing(fabAnim, {
      toValue: 0,
      duration: Animation.fast,
      useNativeDriver: true,
    }).start(() => setShowPulseSheet(false));
  };

  const pulseActions = [
    { label: 'Start a Discussion', icon: 'chatbubbles-outline' },
    { label: 'Post an Update', icon: 'create-outline' },
    { label: 'Post your Transformation', icon: 'sparkles-outline' },
    { label: 'Add a Recipe', icon: 'restaurant-outline' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Logo */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          </View>
          <Avatar name={user.name} size={44} />
        </Animated.View>

        {/* Find your coach card */}
        <CardSurface style={styles.coachCard}>
          <View style={styles.coachContent}>
            <Avatar name={coach.name} size={56} showRing />
            <View style={styles.coachInfo}>
              <Text style={styles.coachLabel}>Find your coach</Text>
              <Text style={styles.coachName}>{coach.name}</Text>
              <Text style={styles.coachSubtext}>{coach.experience} experience</Text>
            </View>
          </View>
          <Button
            title="Book now"
            onPress={() => router.push('/(tabs)/coach')}
            variant="primary"
            size="sm"
            style={{ marginTop: Spacing.md }}
            fullWidth
          />
        </CardSurface>

        {/* Ask us anything (RAG chatbot entry) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/chatbot')}
        >
          <CardSurface style={styles.chatCard}>
            <View style={styles.chatContent}>
              <View style={styles.chatIconWrap}>
                <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primaryTeal} />
              </View>
              <View style={styles.chatTextWrap}>
                <Text style={styles.chatTitle}>Ask us anything</Text>
                <Text style={styles.chatSubtext}>
                  Nutrition, classes, batches, fees, sessions...
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </CardSurface>
        </TouchableOpacity>

        {/* ────── Success Stories with Transformation Images ────── */}
        <SectionHeader
          title="Success stories"
          rightElement={
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          }
        />
        <FlatList
          horizontal
          data={testimonials}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH * 0.72 + Spacing.md}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: Spacing.md }}
          renderItem={({ item, index }) => (
            <SuccessStoryCard item={item} index={index} />
          )}
        />

        {/* Weekly Challenge */}
        <SectionHeader title="Weekly challenge" />
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }
          ] 
        }}>
          <TouchableOpacity activeOpacity={0.85}>
            <CardSurface style={styles.challengeCard}>
              <Image source={require('../../assets/sugar_detox.png')} style={styles.challengeBg} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(14, 124, 134, 0.4)', 'rgba(14, 124, 134, 0.95)']}
                style={styles.challengeGradient}
              />
              <View style={styles.challengeTopRow}>
                <View style={styles.challengeBadge}>
                  <Ionicons name="time-outline" size={14} color={Colors.white} />
                  <Text style={styles.challengeBadgeText}>
                    {weeklyChallenge.daysLeft} days left
                  </Text>
                </View>
                <View style={styles.enrolledBadge}>
                  <Ionicons name="people" size={14} color={Colors.white} />
                  <Text style={styles.challengeBadgeText}>
                    {weeklyChallenge.enrolled.toLocaleString()} enrolled
                  </Text>
                </View>
              </View>
              <Text style={styles.challengeTitle}>{weeklyChallenge.title}</Text>
            </CardSurface>
          </TouchableOpacity>
        </Animated.View>

        {/* ────── Community Feed ────── */}
        <SectionHeader
          title="Community"
          rightElement={
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          }
        />

        {/* Active members strip */}
        <View style={styles.communityIntro}>
          <View style={styles.communityAvatars}>
            {['Priya', 'Sneha', 'Kunal', 'Rupal', 'Meera'].map((name, i) => (
              <View key={name} style={[styles.stackedAvatar, { left: i * 24 }]}>
                <Avatar name={name} size={30} />
              </View>
            ))}
          </View>
          <Text style={styles.communityCount}>
            234+ members active today
          </Text>
        </View>

        {/* Community Posts */}
        {communityPosts.slice(0, 3).map((post, idx) => (
          <CommunityPost key={post.id} post={post} animDelay={idx * 120} />
        ))}

        {/* Load more */}
        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.7}>
          <Text style={styles.loadMoreText}>View more posts</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.primaryTeal} />
        </TouchableOpacity>

        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
      </ScrollView>

      {/* Pulse FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openPulseSheet}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Pulse Bottom Action Sheet */}
      <Modal
        visible={showPulseSheet}
        transparent
        animationType="none"
        onRequestClose={closePulseSheet}
      >
        <Pressable style={styles.sheetBackdrop} onPress={closePulseSheet}>
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                transform: [
                  {
                    translateY: fabAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [400, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Pulse</Text>
              {pulseActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.sheetAction}
                  activeOpacity={0.7}
                  onPress={closePulseSheet}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={22}
                    color={Colors.primaryTeal}
                  />
                  <Text style={styles.sheetActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.sheetAction, styles.cancelAction]}
                onPress={closePulseSheet}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
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
  },
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  greeting: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  userName: {
    ...Typography.h1,
    fontSize: 18,
    marginTop: 1,
  },
  /* See all link */
  seeAllText: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  /* Coach card */
  coachCard: {
    marginTop: Spacing.sm,
  },
  coachContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  coachInfo: {
    flex: 1,
  },
  coachLabel: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  coachName: {
    ...Typography.h2,
  },
  coachSubtext: {
    ...Typography.caption,
    marginTop: 2,
  },
  /* Chat entry card */
  chatCard: {
    marginTop: Spacing.md,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTextWrap: {
    flex: 1,
  },
  chatTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  chatSubtext: {
    ...Typography.caption,
    marginTop: 2,
  },
  /* ────── Success Stories ────── */
  storyCard: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  storyImageWrap: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  transformBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  transformBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: Colors.white,
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryTeal,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  durationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: Colors.white,
  },
  storyInfo: {
    padding: Spacing.sm + 2,
  },
  storyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  storyNameCol: {
    flex: 1,
  },
  storyName: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  storyRating: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 1,
  },
  storyQuote: {
    ...Typography.caption,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  /* Challenge */
  challengeCard: {
    backgroundColor: Colors.primaryTeal,
    borderColor: 'transparent',
    overflow: 'hidden',
    padding: Spacing.md,
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  challengeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  challengeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  challengeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  challengeBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  challengeTitle: {
    ...Typography.h1,
    color: Colors.white,
    fontSize: 20,
    marginTop: Spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  /* ────── Community Section ────── */
  communityIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.primaryTealLight,
    borderRadius: Radius.lg,
  },
  communityAvatars: {
    flexDirection: 'row',
    position: 'relative',
    height: 30,
    width: 5 * 24 + 8,
  },
  stackedAvatar: {
    position: 'absolute',
  },
  communityCount: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
    color: Colors.primaryTeal,
    marginLeft: 5 * 24 + 16 - (5 * 24 + 8),
    flex: 1,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadMoreText: {
    ...Typography.body,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  /* FAB */
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 76,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryTeal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  /* Bottom sheet */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 16,
    paddingTop: Spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetActionText: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  cancelAction: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: Spacing.sm,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontFamily: 'Poppins-Medium',
  },
});
