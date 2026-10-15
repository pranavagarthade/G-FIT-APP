import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import Badge from './Badge';
import Avatar from './Avatar';
import Button from './Button';

interface SessionCardProps {
  mentorName: string;
  time: string;
  duration: string;
  date: string;
  condition: string;
  spotsJoined: number;
  spotsTotal: number;
  isLive?: boolean;
  canJoin: boolean;
  onStart?: () => void;
  onKnowMore?: () => void;
}

export default function SessionCard({
  mentorName,
  time,
  duration,
  date,
  condition,
  spotsJoined,
  spotsTotal,
  isLive = false,
  canJoin,
  onStart,
  onKnowMore,
}: SessionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Avatar name={mentorName} size={44} showRing />
        <View style={styles.info}>
          <Text style={styles.mentorName}>{mentorName}</Text>
          <Text style={styles.time}>
            {date} · {time} · {duration}
          </Text>
        </View>
        {isLive && <Badge label="● LIVE" variant="destructive" />}
      </View>
      <View style={styles.metaRow}>
        <Badge label={condition} variant="teal" />
        <Text style={styles.spots}>
          <Ionicons name="people-outline" size={13} color={Colors.textSecondary} />{' '}
          {spotsJoined}/{spotsTotal} joined
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <Button
          title={canJoin ? 'Start' : 'Start'}
          onPress={onStart || (() => {})}
          variant="primary"
          size="sm"
          disabled={!canJoin}
          style={styles.btn}
        />
        <Button
          title="Know more"
          onPress={onKnowMore || (() => {})}
          variant="secondary"
          size="sm"
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
  },
  mentorName: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  time: {
    ...Typography.caption,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  spots: {
    ...Typography.caption,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  btn: {
    flex: 1,
  },
});
