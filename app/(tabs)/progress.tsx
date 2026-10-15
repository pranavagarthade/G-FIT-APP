import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Rect, Text as SvgText, Line, Image as SvgImage, ClipPath, Defs, Circle as SvgCircle } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { user, weightData, activityData, badges, activityLog, milestoneWall } from '../../constants/mockData';
import SegmentedControl from '../../components/SegmentedControl';
import CardSurface from '../../components/CardSurface';
import ProgressRing from '../../components/ProgressRing';
import Avatar from '../../components/Avatar';
import SectionHeader from '../../components/SectionHeader';
import ShareCard from '../../components/ShareCard';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import Button from '../../components/Button';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;

const mainTabs = ['Overview', 'Details', 'Story'];
const filterTabs = ['Daily', 'Weekly', 'Monthly'];

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

// Simple line chart component using SVG with animation and photo nodes
function WeightChart() {
  const data = weightData.datasets[0].data;
  const labels = weightData.labels;
  const minVal = Math.min(...data) - 1;
  const maxVal = Math.max(...data) + 1;
  const padding = { top: 30, bottom: 30, left: 40, right: 30 };
  const plotWidth = CHART_WIDTH - padding.left - padding.right;
  const plotHeight = CHART_HEIGHT - padding.top - padding.bottom;

  const points = data.map((val, i) => {
    const x = padding.left + (i / (data.length - 1)) * plotWidth;
    const y = padding.top + ((maxVal - val) / (maxVal - minVal)) * plotHeight;
    return { x, y, val };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Animation for the line
  const drawAnim = useRef(new Animated.Value(0)).current;
  const pathLength = 1000; // estimated length for strokeDasharray

  useEffect(() => {
    Animated.timing(drawAnim, {
      toValue: pathLength,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <Defs>
        <ClipPath id="clip">
          <SvgCircle cx="12" cy="12" r="12" />
        </ClipPath>
      </Defs>

      {/* Y-axis labels */}
      {[minVal, (minVal + maxVal) / 2, maxVal].map((val, i) => {
        const y = padding.top + ((maxVal - val) / (maxVal - minVal)) * plotHeight;
        return (
          <React.Fragment key={`y-${i}`}>
            <SvgText x={4} y={y + 4} fill={Colors.textPrimary} fontSize={10} fontFamily="Poppins-Medium">
              {val.toFixed(0)}
            </SvgText>
            <Line
              x1={padding.left}
              y1={y}
              x2={CHART_WIDTH - padding.right}
              y2={y}
              stroke={Colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          </React.Fragment>
        );
      })}
      
      {/* X-axis labels */}
      {labels.map((label, i) => {
        const x = padding.left + (i / (data.length - 1)) * plotWidth;
        return (
          <SvgText
            key={`x-${i}`}
            x={x}
            y={CHART_HEIGHT - 6}
            fill={Colors.textPrimary}
            fontSize={11}
            fontFamily="Poppins-Medium"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
      
      {/* Animated Line */}
      <AnimatedPolyline
        points={polylinePoints}
        fill="none"
        stroke={Colors.primaryTeal}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={drawAnim.interpolate({
          inputRange: [0, pathLength],
          outputRange: [pathLength, 0]
        })}
      />
      
      {/* Data points (simulated photo nodes on every 3rd point) */}
      {points.map((p, i) => (
        <React.Fragment key={`p-${i}`}>
          {i % 3 === 0 ? (
            // Photo node
            <React.Fragment>
              <SvgCircle cx={p.x} cy={p.y} r={14} fill={Colors.white} stroke={Colors.primaryTeal} strokeWidth={2} />
              <SvgImage
                x={p.x - 12}
                y={p.y - 12}
                width={24}
                height={24}
                preserveAspectRatio="xMidYMid slice"
                href={require('../../assets/transformations/transform1.png')}
                clipPath="url(#clip)"
              />
            </React.Fragment>
          ) : (
            // Regular node
            <SvgCircle
              cx={p.x}
              cy={p.y}
              r={5}
              fill={Colors.white}
              stroke={Colors.primaryTeal}
              strokeWidth={2.5}
            />
          )}
        </React.Fragment>
      ))}
    </Svg>
  );
}

// Simple activity bar chart
function ActivityChart() {
  const labels = activityData.labels;
  const data = activityData.data;
  const maxBarH = 100;

  return (
    <View style={styles.activityChart}>
      {labels.map((label, i) => (
        <View key={label} style={styles.activityBar}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: data[i] * maxBarH,
                  backgroundColor: i % 2 === 0 ? Colors.primaryTeal : Colors.accentLime,
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProgressScreen() {
  const [mainTab, setMainTab] = useState(0);
  const [filterIndex, setFilterIndex] = useState(1); // Weekly default
  const [showExactStats, setShowExactStats] = useState(false);
  const shareCardRef = useRef(null);
  const sliderRef = useRef(null);

  const handleShareCard = async () => {
    try {
      if (!shareCardRef.current) return;
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const handleExportSlider = async () => {
    try {
      if (!sliderRef.current) return;
      const uri = await captureRef(sliderRef, {
        format: 'png',
        quality: 1,
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      console.log('Error exporting slider:', e);
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Story Prompt */}
      <CardSurface style={styles.storyPromptCard}>
        <View style={styles.storyPromptRow}>
          <View style={styles.storyPromptIconWrap}>
            <Ionicons name="images-outline" size={24} color={Colors.white} />
          </View>
          <View style={styles.storyPromptInfo}>
            <Text style={styles.storyPromptTitle}>Turn this into a story</Text>
            <Text style={styles.storyPromptSub}>Share your 12-day streak on Instagram</Text>
          </View>
          <TouchableOpacity style={styles.storyPromptBtn} onPress={() => setMainTab(2)}>
            <Text style={styles.storyPromptBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </CardSurface>

      {/* Filter */}
      <SegmentedControl
        tabs={filterTabs}
        activeIndex={filterIndex}
        onChange={setFilterIndex}
      />

      {/* Weight Trend */}
      <SectionHeader title="Body weight trend" />
      <CardSurface style={styles.chartCard}>
        <WeightChart />
        <Text style={styles.chartCaption}>Weight in kg · Last 7 days</Text>
      </CardSurface>

      {/* Streak */}
      <CardSurface style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakIconWrap}>
            <Ionicons name="flame" size={28} color="#FF6B35" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{user.streakDays} day session streak</Text>
            <Text style={styles.streakSubtext}>Keep it up! You're on fire 🔥</Text>
          </View>
        </View>
      </CardSurface>

      {/* Activity Breakdown */}
      <SectionHeader title="Activity breakdown" />
      <CardSurface>
        <ActivityChart />
      </CardSurface>

      {/* Achievement Badges */}
      <SectionHeader title="Achievements" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeIconWrap,
                  badge.earned ? styles.badgeEarned : styles.badgeLocked,
                ]}
              >
                {badge.earned ? (
                  <Ionicons name={badge.icon as any} size={24} color={Colors.primaryTeal} />
                ) : (
                  <Ionicons name="lock-closed" size={20} color={Colors.textSecondary} />
                )}
              </View>
              <Text
                style={[
                  styles.badgeTitle,
                  !badge.earned && styles.badgeTitleLocked,
                ]}
                numberOfLines={2}
              >
                {badge.title}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Goal Card */}
      <SectionHeader title="Your goal" />
      <CardSurface style={styles.goalCard}>
        <View style={styles.goalRow}>
          <ProgressRing
            progress={0.67}
            size={100}
            value="67%"
            label="of target"
          />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Target weight</Text>
            <Text style={styles.goalValue}>62 kg</Text>
            <Text style={styles.goalCaption}>Current: 67 kg · 5 kg to go</Text>
            <TouchableOpacity style={styles.editGoal}>
              <Ionicons name="pencil" size={14} color={Colors.primaryTeal} />
              <Text style={styles.editGoalText}>Edit goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CardSurface>

      {/* Latest Mentor Report */}
      <SectionHeader title="Latest mentor report" />
      <CardSurface>
        <TouchableOpacity style={styles.reportRow} activeOpacity={0.7}>
          <Avatar name="Geetanjali" size={40} showRing />
          <View style={styles.reportInfo}>
            <Text style={styles.reportName}>Geetanjali</Text>
            <Text style={styles.reportPreview} numberOfLines={1}>
              Great consistency this week! Let's focus on flexibility...
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </CardSurface>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.tabContent}>
      {/* Full Activity Log */}
      <SectionHeader title="Activity Log" />
      <CardSurface style={{ padding: 0, overflow: 'hidden' }}>
        {activityLog.map((log, index) => (
          <View key={log.id} style={[styles.logItem, index !== activityLog.length - 1 && styles.logBorder]}>
            <View style={[styles.logIcon, { backgroundColor: log.color + '20' }]}>
              <Ionicons name={log.icon as any} size={20} color={log.color} />
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logTitle}>{log.type}</Text>
              <Text style={styles.logDate}>{log.date}</Text>
            </View>
            <Text style={styles.logDuration}>{log.duration}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>Load More</Text>
        </TouchableOpacity>
      </CardSurface>

      {/* Full Badge Gallery */}
      <SectionHeader title="Badge Gallery" />
      <CardSurface>
        {badges.map((badge) => (
          <View key={badge.id} style={styles.fullBadgeItem}>
            <View style={[styles.badgeIconWrap, badge.earned ? styles.badgeEarned : styles.badgeLocked, { marginBottom: 0 }]}>
              <Ionicons name={badge.icon as any} size={24} color={badge.earned ? Colors.primaryTeal : Colors.textSecondary} />
            </View>
            <View style={styles.fullBadgeInfo}>
              <Text style={styles.fullBadgeTitle}>{badge.title}</Text>
              <Text style={styles.fullBadgeDesc}>{badge.description}</Text>
              {badge.earned && badge.date && (
                <Text style={styles.fullBadgeDate}>Earned on {badge.date}</Text>
              )}
            </View>
          </View>
        ))}
      </CardSurface>

      {/* Goal Settings */}
      <SectionHeader title="Goal Settings" />
      <CardSurface>
        <View style={styles.goalSettingRow}>
          <Text style={styles.goalSettingLabel}>Target Weight</Text>
          <Text style={styles.goalSettingValue}>62 kg</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
        <View style={[styles.goalSettingRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.goalSettingLabel}>Weekly Sessions</Text>
          <Text style={styles.goalSettingValue}>4 sessions</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </CardSurface>
    </View>
  );

  const renderStory = () => (
    <View style={styles.tabContent}>
      {/* Share Card Generator */}
      <SectionHeader title="Generate Story" />
      <View style={styles.shareCardWrapper}>
        <View ref={shareCardRef} collapsable={false}>
          <ShareCard
            photoUrl={require('../../assets/transformations/transform3.png')}
            title="Consistency pays off"
            stat={showExactStats ? "72kg → 67kg" : "Lost 7% Body Weight"}
            subStat="In just 4 months of dedicated sessions"
            showExact={showExactStats}
          />
        </View>
        
        <View style={styles.shareControls}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show exact numbers</Text>
            <TouchableOpacity 
              style={[styles.toggleSwitch, showExactStats && styles.toggleActive]} 
              onPress={() => setShowExactStats(!showExactStats)}
            >
              <View style={[styles.toggleKnob, showExactStats && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>
          <Button
            title="Share to Instagram"
            onPress={handleShareCard}
            variant="primary"
            fullWidth
            icon={<Ionicons name="logo-instagram" size={18} color={Colors.white} />}
          />
        </View>
      </View>

      {/* Before/After Slider */}
      <SectionHeader title="Transformation" />
      <CardSurface style={{ alignItems: 'center' }}>
        <Text style={styles.sliderHint}>Drag the slider to compare</Text>
        <View ref={sliderRef} collapsable={false}>
          <BeforeAfterSlider
            beforeImage={require('../../assets/transformations/transform1.png')}
            afterImage={require('../../assets/transformations/transform3.png')}
            width={SCREEN_WIDTH - 64}
            height={300}
          />
        </View>
        <Button
          title="Export Video/Image"
          onPress={handleExportSlider}
          variant="secondary"
          fullWidth
          style={{ marginTop: Spacing.md }}
          icon={<Ionicons name="download-outline" size={18} color={Colors.primaryTeal} />}
        />
      </CardSurface>

      {/* Monthly Recap */}
      <SectionHeader title="Monthly Recap" />
      <CardSurface style={styles.recapCard}>
        <View style={styles.recapHeader}>
          <Text style={styles.recapMonth}>August 2026</Text>
          <Ionicons name="share-social-outline" size={24} color={Colors.primaryTeal} />
        </View>
        <Text style={styles.recapHeadline}>You showed up 22 days this month!</Text>
        <View style={styles.recapStatsRow}>
          <View style={styles.recapStat}>
            <Text style={styles.recapStatVal}>22</Text>
            <Text style={styles.recapStatLabel}>Sessions</Text>
          </View>
          <View style={styles.recapStat}>
            <Text style={styles.recapStatVal}>Yoga</Text>
            <Text style={styles.recapStatLabel}>Top Activity</Text>
          </View>
          <View style={styles.recapStat}>
            <Text style={styles.recapStatVal}>12</Text>
            <Text style={styles.recapStatLabel}>Best Streak</Text>
          </View>
        </View>
      </CardSurface>

      {/* Milestone Wall */}
      <SectionHeader title="Milestone Wall" />
      <View style={styles.timeline}>
        {milestoneWall.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            {index !== milestoneWall.length - 1 && <View style={styles.timelineLine} />}
            <CardSurface style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineDate}>{item.date}</Text>
                <TouchableOpacity>
                  <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineDesc}>{item.description}</Text>
              
              {item.verified && (
                <View style={styles.verifiedStamp}>
                  <Ionicons name="checkmark-done-circle" size={16} color={Colors.accentLime} />
                  <Text style={styles.verifiedText}>Verified by Geetanjali</Text>
                </View>
              )}
            </CardSurface>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.title}>My Progress</Text>
        </View>
      </View>

      {/* Custom Top Tabs */}
      <View style={styles.topTabs}>
        {mainTabs.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.topTabBtn, mainTab === i && styles.topTabBtnActive]}
            onPress={() => setMainTab(i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.topTabText, mainTab === i && styles.topTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mainTab === 0 && renderOverview()}
        {mainTab === 1 && renderDetails()}
        {mainTab === 2 && renderStory()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reuse existing Button component styles or import it.
// I'll assume Button is imported, adding import at the top if I didn't. 
// Wait, I missed importing Button. Let me add it. (I will add it manually in the file via multi_replace or just re-write with it included... actually I can just use a local styled component to avoid missing it if it's not exported properly, but it IS exported in index.tsx). I will import it at the top.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Typography.h1,
    paddingVertical: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  topTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topTabBtn: {
    paddingVertical: Spacing.sm,
    marginRight: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabBtnActive: {
    borderBottomColor: Colors.primaryTeal,
  },
  topTabText: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
    color: Colors.textSecondary,
  },
  topTabTextActive: {
    color: Colors.primaryTeal,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  tabContent: {
    marginTop: Spacing.sm,
  },
  // Story Prompt Card
  storyPromptCard: {
    backgroundColor: Colors.primaryTeal,
    marginBottom: Spacing.md,
    borderWidth: 0,
  },
  storyPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  storyPromptIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyPromptInfo: {
    flex: 1,
  },
  storyPromptTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  storyPromptSub: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  storyPromptBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  storyPromptBtnText: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
    color: Colors.primaryTeal,
  },
  // Chart
  chartCard: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  chartCaption: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  // Streak
  streakCard: {
    marginTop: Spacing.md,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    ...Typography.h2,
  },
  streakSubtext: {
    ...Typography.caption,
    marginTop: 2,
  },
  // Activity chart
  activityChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: Spacing.md,
  },
  activityBar: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 32,
    borderRadius: Radius.sm,
    minHeight: 8,
  },
  barLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  // Badges
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  badgeItem: {
    alignItems: 'center',
    width: 72,
  },
  badgeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  badgeEarned: {
    backgroundColor: Colors.primaryTealLight,
    borderWidth: 2,
    borderColor: Colors.primaryTeal,
  },
  badgeLocked: {
    backgroundColor: Colors.cardSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeTitle: {
    ...Typography.caption,
    textAlign: 'center',
    fontSize: 10,
  },
  badgeTitleLocked: {
    color: Colors.textSecondary,
  },
  // Goal
  goalCard: {},
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalValue: {
    ...Typography.h1,
    marginTop: 4,
  },
  goalCaption: {
    ...Typography.caption,
    marginTop: 4,
  },
  editGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  editGoalText: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
  // Report
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  reportPreview: {
    ...Typography.caption,
    marginTop: 2,
  },
  
  // DETAILS TAB STYLES
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  logBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  logDate: {
    ...Typography.caption,
    marginTop: 2,
  },
  logDuration: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primaryTeal,
  },
  viewMoreBtn: {
    padding: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.primaryTealLight,
  },
  viewMoreText: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
    color: Colors.primaryTeal,
  },
  fullBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  fullBadgeInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  fullBadgeTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
  },
  fullBadgeDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  fullBadgeDate: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
  },
  goalSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  goalSettingLabel: {
    ...Typography.body,
    flex: 1,
  },
  goalSettingValue: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primaryTeal,
    marginRight: Spacing.sm,
  },

  // STORY TAB STYLES
  shareCardWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareControls: {
    width: 250,
    marginTop: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  toggleLabel: {
    ...Typography.caption,
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primaryTeal,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    transform: [{ translateX: 16 }],
  },
  sliderHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  recapCard: {
    backgroundColor: '#1E293B', // Dark theme for recap
    borderWidth: 0,
  },
  recapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  recapMonth: {
    ...Typography.caption,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recapHeadline: {
    ...Typography.h1,
    color: Colors.white,
    fontSize: 24,
    marginBottom: Spacing.xl,
  },
  recapStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recapStat: {
    alignItems: 'flex-start',
  },
  recapStatVal: {
    ...Typography.h1,
    color: Colors.accentLime,
    fontSize: 20,
  },
  recapStatLabel: {
    ...Typography.caption,
    color: Colors.white,
    marginTop: 2,
  },
  timeline: {
    paddingLeft: Spacing.md,
    marginTop: Spacing.sm,
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: Spacing.xl,
  },
  timelineDot: {
    position: 'absolute',
    left: -20,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryTeal,
    borderWidth: 2,
    borderColor: Colors.white,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: -15,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.primaryTealLight,
  },
  timelineCard: {
    padding: Spacing.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  timelineDate: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
  },
  timelineTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  timelineDesc: {
    ...Typography.caption,
    lineHeight: 18,
  },
  verifiedStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: Colors.cardSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    ...Typography.caption,
    fontSize: 10,
    color: '#334155',
    fontFamily: 'Poppins-Medium',
  },
});
