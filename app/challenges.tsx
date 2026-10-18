import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Button from '../components/Button';
import CardSurface from '../components/CardSurface';
import { Colors, Radius, Shadows, Spacing, Typography } from '../constants/theme';
import { Challenge, joinChallenge, listChallenges, previewChallenges } from '../services/challengeApi';

const goalLabels: Record<string, string> = {
  daily_steps: 'steps every day',
  weekly_workouts: 'workouts per week',
  weight_loss: 'weight-loss goal',
};

function formatDeposit(challenge: Challenge): string {
  return `${challenge.currency} ${(challenge.deposit_amount_minor / 100).toFixed(0)}`;
}

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selected, setSelected] = useState<Challenge>();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [usingPreview, setUsingPreview] = useState(false);

  useEffect(() => {
    setChallenges(previewChallenges);
    setUsingPreview(true);
    setLoading(false);
    listChallenges()
      .then((liveChallenges) => {
        if (liveChallenges.length > 0) {
          setChallenges(liveChallenges);
          setUsingPreview(false);
        }
      })
      .catch(() => undefined);
  }, []);

  const selectedGoal = useMemo(() => {
    if (!selected) return '';
    const unit = goalLabels[selected.goal_type] || 'goal';
    return `${selected.goal_value} ${unit}`;
  }, [selected]);

  const handleJoin = async () => {
    if (!selected || !accepted) return;
    if (usingPreview) {
      Alert.alert('Preview mode', 'Connect the PostgreSQL backend and Razorpay keys to enable deposits.');
      return;
    }
    setJoining(true);
    try {
      await joinChallenge(selected.id, selected.terms_version);
      Alert.alert('Payment ready', 'Your challenge has been reserved. Razorpay checkout will open from the payment screen.');
    } catch (error) {
      Alert.alert('Unable to join', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>COMMITMENT CHALLENGES</Text>
            <Text style={styles.title}>Put your goals into action</Text>
          </View>
          <Ionicons name="trophy-outline" size={28} color={Colors.goldAccent} />
        </View>
        <Text style={styles.intro}>
          Complete the goal and your deposit comes back in full. Your progress is checked from verified activity where available.
        </Text>
        {usingPreview && (
          <View style={styles.previewNotice}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.goldAccent} />
            <Text style={styles.previewText}>Showing preview challenges. Connect the backend to join.</Text>
          </View>
        )}
        {loading ? (
          <ActivityIndicator color={Colors.primaryTeal} style={styles.loader} />
        ) : (
          challenges.map((challenge) => (
            <Pressable key={challenge.id} onPress={() => { setSelected(challenge); setAccepted(false); }} style={styles.challengePressable}>
              <CardSurface style={{
                ...styles.challengeCard,
                ...(selected?.id === challenge.id ? styles.challengeCardSelected : {}),
              }}>
                <View style={styles.cardIcon}>
                  <Ionicons name={challenge.goal_type === 'daily_steps' ? 'walk-outline' : 'barbell-outline'} size={24} color={Colors.primaryTeal} />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{challenge.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>{challenge.description}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{challenge.duration_days} days</Text>
                    <Text style={styles.meta}>Deposit {formatDeposit(challenge)}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </CardSurface>
            </Pressable>
          ))
        )}
        {selected && (
          <CardSurface style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>{selected.title}</Text>
            <Text style={styles.detailsDescription}>{selected.description}</Text>
            <View style={styles.detailGrid}>
              <Detail label="Goal" value={selectedGoal} />
              <Detail label="Duration" value={`${selected.duration_days} days`} />
              <Detail label="Deposit" value={formatDeposit(selected)} />
              <Detail label="Completion" value={`${selected.completion_threshold}% of days`} />
            </View>
            <View style={styles.refundBox}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primaryTeal} />
              <View style={styles.refundCopy}>
                <Text style={styles.refundTitle}>Full refund on completion</Text>
                <Text style={styles.refundText}>Missed days may be covered by {selected.grace_days} grace day{selected.grace_days === 1 ? '' : 's'}.</Text>
              </View>
            </View>
            <Pressable onPress={() => setAccepted(!accepted)} style={styles.termsRow}>
              <Ionicons name={accepted ? 'checkbox' : 'square-outline'} size={24} color={accepted ? Colors.primaryTeal : Colors.textSecondary} />
              <Text style={styles.termsText}>I accept the challenge terms, progress rules, and refund policy.</Text>
            </Pressable>
            <Button title={usingPreview ? 'Connect backend to join' : 'Continue to secure payment'} onPress={handleJoin} loading={joining} disabled={!accepted || usingPreview} fullWidth />
            <Text style={styles.paymentNote}>Payments use hosted Razorpay checkout. G-FIT never stores card details.</Text>
          </CardSurface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  backButton: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.cardSurface, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  eyebrow: { ...Typography.caption, color: Colors.primaryTeal, letterSpacing: 1 },
  title: { ...Typography.h1, marginTop: 2 },
  intro: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.md },
  previewNotice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FFF8E6', borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  previewText: { ...Typography.caption, color: '#8A6A16', flex: 1 },
  loader: { marginTop: Spacing.xl },
  challengePressable: { marginBottom: Spacing.sm },
  challengeCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  challengeCardSelected: { borderColor: Colors.primaryTeal, borderWidth: 1.5 },
  cardIcon: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.primaryTealLight, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  cardTitle: { ...Typography.h2 },
  cardDescription: { ...Typography.caption, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  meta: { ...Typography.caption, color: Colors.primaryTeal, fontFamily: 'Poppins-Medium' },
  detailsCard: { padding: Spacing.md, marginTop: Spacing.md, ...Shadows.elevated },
  detailsTitle: { ...Typography.h2, fontSize: 20 },
  detailsDescription: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.md },
  detail: { width: '50%', marginBottom: Spacing.md },
  detailLabel: { ...Typography.caption },
  detailValue: { ...Typography.body, fontFamily: 'Poppins-Medium', marginTop: 2 },
  refundBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.accentLimeLight, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  refundCopy: { flex: 1 },
  refundTitle: { ...Typography.body, fontFamily: 'Poppins-Medium', color: Colors.primaryTeal },
  refundText: { ...Typography.caption, marginTop: 2 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  termsText: { ...Typography.caption, flex: 1, color: Colors.textPrimary },
  paymentNote: { ...Typography.caption, textAlign: 'center', marginTop: Spacing.sm },
});
