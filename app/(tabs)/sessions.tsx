import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { user, upcomingSessions, liveSessions, pastSessions } from '../../constants/mockData';
import SegmentedControl from '../../components/SegmentedControl';
import SessionCard from '../../components/SessionCard';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import CardSurface from '../../components/CardSurface';

const tabs = ['Upcoming', 'Live now', 'Past'];

export default function SessionsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'submitted' | 'reviewed'>('idle');

  const renderUpcomingTab = () => (
    <View>
      {upcomingSessions.map((session) => (
        <SessionCard
          key={session.id}
          mentorName={session.mentorName}
          time={session.time}
          duration={session.duration}
          date={session.date}
          condition={session.condition}
          spotsJoined={session.spotsJoined}
          spotsTotal={session.spotsTotal}
          isLive={session.isLive}
          canJoin={session.canJoin}
        />
      ))}

      {/* Post-session upload prompt */}
      <CardSurface style={styles.uploadCard}>
        <View style={styles.uploadHeader}>
          <View style={styles.uploadIconWrap}>
            <Ionicons name="cloud-upload-outline" size={24} color={Colors.primaryTeal} />
          </View>
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadTitle}>Share your workout</Text>
            <Text style={styles.uploadSubtext}>Upload a photo or video from today's session</Text>
          </View>
        </View>
        {uploadStatus !== 'idle' && (
          <View style={styles.uploadProgress}>
            <View style={[styles.progressBar, { width: uploadStatus === 'uploading' ? '50%' : '100%' }]} />
          </View>
        )}
        <Text style={styles.uploadStatus}>
          {uploadStatus === 'idle' && 'Tap to upload'}
          {uploadStatus === 'uploading' && 'Uploading...'}
          {uploadStatus === 'submitted' && 'Submitted ✓'}
          {uploadStatus === 'reviewed' && 'Reviewed ✓✓'}
        </Text>
      </CardSurface>

      {/* Mentor feedback card */}
      <CardSurface style={styles.feedbackCard}>
        <View style={styles.feedbackRow}>
          <Avatar name="Geetanjali" size={36} showRing />
          <View style={styles.feedbackInfo}>
            <Text style={styles.feedbackLabel}>Your mentor left a note</Text>
            <Text style={styles.feedbackPreview} numberOfLines={2}>
              Great progress on your form today! Focus on holding the warrior pose for a few more seconds next time.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </View>
      </CardSurface>
    </View>
  );

  const renderLiveTab = () => (
    <View>
      {liveSessions.length > 0 ? (
        liveSessions.map((session) => (
          <SessionCard
            key={session.id}
            mentorName={session.mentorName}
            time={session.time}
            duration={session.duration}
            date={session.date}
            condition={session.condition}
            spotsJoined={session.spotsJoined}
            spotsTotal={session.spotsTotal}
            isLive
            canJoin={session.canJoin}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-off-outline" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>No live sessions right now</Text>
          <Text style={styles.emptySubtext}>Check back during session times</Text>
        </View>
      )}
    </View>
  );

  const renderPastTab = () => (
    <View>
      {pastSessions.map((session) => (
        <View key={session.id} style={styles.pastRow}>
          <View style={styles.pastInfo}>
            <Text style={styles.pastDate}>{session.date}</Text>
            <Text style={styles.pastMentor}>{session.mentorName} · {session.condition}</Text>
          </View>
          <Badge
            label={session.status}
            variant={session.status === 'Completed' ? 'lime' : 'destructive'}
            size="sm"
          />
        </View>
      ))}
      <Text style={styles.pastNote}>
        Note: Session recordings are available for mentor review only.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Screen title */}
        <View style={styles.titleRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.title}>Sessions</Text>
        </View>

        {/* Condition banner */}
        <View style={styles.conditionBanner}>
          <Ionicons name="fitness-outline" size={16} color={Colors.primaryTeal} />
          <Text style={styles.conditionText}>Your program: {user.condition}</Text>
        </View>

        {/* Tabs */}
        <SegmentedControl
          tabs={tabs}
          activeIndex={activeTab}
          onChange={setActiveTab}
        />

        <View style={styles.tabContent}>
          {activeTab === 0 && renderUpcomingTab()}
          {activeTab === 1 && renderLiveTab()}
          {activeTab === 2 && renderPastTab()}
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
  conditionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryTealLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  conditionText: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
  tabContent: {
    marginTop: Spacing.md,
  },
  // Upload card
  uploadCard: {
    marginBottom: Spacing.md,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  uploadSubtext: {
    ...Typography.caption,
    marginTop: 2,
  },
  uploadProgress: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primaryTeal,
    borderRadius: 2,
  },
  uploadStatus: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    marginTop: Spacing.sm,
  },
  // Feedback card
  feedbackCard: {
    marginBottom: Spacing.md,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  feedbackInfo: {
    flex: 1,
  },
  feedbackLabel: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
  feedbackPreview: {
    ...Typography.body,
    marginTop: 4,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
    marginTop: Spacing.md,
  },
  emptySubtext: {
    ...Typography.caption,
    marginTop: 4,
  },
  // Past sessions
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pastInfo: {
    flex: 1,
  },
  pastDate: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  pastMentor: {
    ...Typography.caption,
    marginTop: 2,
  },
  pastNote: {
    ...Typography.caption,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
