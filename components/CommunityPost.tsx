import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Animation } from '../constants/theme';
import Avatar from './Avatar';
import type { CommunityPostData } from '../constants/communityData';

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Achievement: { bg: '#E8F5E9', text: '#2E7D32' },
  Transformation: { bg: '#E3F2FD', text: '#1565C0' },
  Recipe: { bg: '#FFF3E0', text: '#E65100' },
  Motivation: { bg: '#F3E5F5', text: '#7B1FA2' },
  Milestone: { bg: '#FFF8E1', text: '#F9A825' },
};

interface CommunityPostProps {
  post: CommunityPostData;
  animDelay?: number;
}

export default function CommunityPost({ post, animDelay = 0 }: CommunityPostProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  // Heart animation
  const heartScale = useRef(new Animated.Value(1)).current;
  // Card entrance animation
  const entranceAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 500,
      delay: animDelay,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    // Bounce animation
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        useNativeDriver: true,
        tension: 200,
        friction: 5,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start();
  };

  const tagColor = TAG_COLORS[post.tag] || TAG_COLORS.Achievement;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: entranceAnim,
          transform: [
            {
              translateY: entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={post.userName} size={40} />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: tagColor.bg }]}>
          <Text style={[styles.tagText, { color: tagColor.text }]}>{post.tag}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Engagement Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {likeCount} likes • {post.comments.length} comments • {post.shares} shares
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#E53935' : Colors.textSecondary}
            />
          </Animated.View>
          <Text style={[styles.actionText, liked && { color: '#E53935' }]}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowComments(!showComments)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Preview */}
      {(showComments || post.comments.length > 0) && (
        <View style={styles.commentsSection}>
          {post.comments.slice(0, showComments ? post.comments.length : 1).map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <Avatar name={comment.userName} size={28} />
              <View style={styles.commentBubble}>
                <Text style={styles.commentUser}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentTime}>{comment.timeAgo}</Text>
              </View>
            </View>
          ))}
          {!showComments && post.comments.length > 1 && (
            <TouchableOpacity onPress={() => setShowComments(true)}>
              <Text style={styles.viewMoreComments}>
                View {post.comments.length - 1} more comment{post.comments.length > 2 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  userName: {
    ...Typography.body,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  timeAgo: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 1,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  content: {
    ...Typography.body,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    marginBottom: Spacing.xs,
  },
  statsText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    ...Typography.caption,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.textSecondary,
  },
  commentsSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
  },
  commentUser: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: Colors.textPrimary,
    marginBottom: 1,
  },
  commentText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  commentTime: {
    ...Typography.caption,
    fontSize: 10,
    marginTop: 3,
  },
  viewMoreComments: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    paddingVertical: 4,
  },
});
