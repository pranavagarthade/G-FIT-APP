import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Animation } from '../../constants/theme';
import { user, settingsItems, toolItems, legalItems } from '../../constants/mockData';
import CardSurface from '../../components/CardSurface';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import FlaggedPlaceholder from '../../components/FlaggedPlaceholder';
import SectionHeader from '../../components/SectionHeader';

function SettingsRow({
  icon,
  label,
  flagged,
  onPress,
}: {
  icon: string;
  label: string;
  flagged?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.settingsIconWrap}>
        <Ionicons name={icon as any} size={20} color={Colors.primaryTeal} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
      {flagged && (
        <View style={styles.flaggedBadge}>
          <Text style={styles.flaggedText}>Not connected</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function MeScreen() {
  const gearAnim = useRef(new Animated.Value(0)).current;

  const handleGearPress = () => {
    Animated.sequence([
      Animated.timing(gearAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(gearAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const gearRotate = gearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top bar — logo + rewards + settings */}
        <View style={styles.topBar}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={{ flex: 1 }} />
          <View style={styles.rewardsBadge}>
            <Ionicons name="diamond" size={16} color={Colors.goldAccent} />
            <Text style={styles.rewardsText}>{user.rewardCoins}</Text>
          </View>
          <TouchableOpacity onPress={handleGearPress}>
            <Animated.View style={{ transform: [{ rotate: gearRotate }] }}>
              <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarEditWrap}>
            <Avatar name={user.name} size={80} />
            <View style={styles.editOverlay}>
              <Ionicons name="pencil" size={12} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <TouchableOpacity>
            <Text style={styles.seeProfile}>See profile</Text>
          </TouchableOpacity>
        </View>

        {/* Biological Age — FLAGGED */}
        <FlaggedPlaceholder
          title="Biological Age & Speed of Aging"
          description="Complete your health profile to unlock this insight"
          icon="lock-closed-outline"
          ctaText="Complete Health Profile"
        />

        {/* Refer & Earn — FLAGGED */}
        <CardSurface style={styles.referCard}>
          <View style={styles.referContent}>
            <View style={styles.referIcon}>
              <Ionicons name="gift-outline" size={32} color={Colors.primaryTeal} />
            </View>
            <View style={styles.referInfo}>
              <Text style={styles.referTitle}>Refer. Earn. Repeat.</Text>
              <Text style={styles.referSubtext}>
                Invite friends to G Fit and earn rewards together
              </Text>
            </View>
          </View>
          <Button
            title="Refer Now"
            onPress={() => {}}
            variant="secondary"
            size="sm"
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
          <Text style={styles.flagNote}>
            Referral tracking coming soon
          </Text>
        </CardSurface>

        {/* Tools */}
        <SectionHeader title="Tools" />
        <View style={styles.toolsGrid}>
          {toolItems.map((tool) => (
            <TouchableOpacity key={tool.id} style={styles.toolItem} activeOpacity={0.7}>
              <View style={styles.toolIconWrap}>
                <Ionicons name={tool.icon as any} size={24} color={Colors.primaryTeal} />
              </View>
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <SectionHeader title="Settings" />
        <View style={styles.settingsList}>
          {settingsItems.map((item) => (
            <SettingsRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              flagged={item.flagged}
            />
          ))}
        </View>

        {/* Learn */}
        <SectionHeader title="Learn" />
        <CardSurface>
          <View style={styles.learnContent}>
            <View style={styles.learnIconWrap}>
              <Ionicons name="book-outline" size={28} color={Colors.primaryTeal} />
            </View>
            <View style={styles.learnInfo}>
              <Text style={styles.learnTitle}>Learn with G Fit</Text>
              <Text style={styles.learnDesc}>
                Articles, tips, and guides on yoga, fitness & nutrition
              </Text>
            </View>
          </View>
          <Button
            title="See More"
            onPress={() => {}}
            variant="tertiary"
            size="sm"
            style={{ alignSelf: 'flex-start', marginTop: Spacing.sm }}
          />
        </CardSurface>

        {/* Help & Review */}
        <View style={styles.helpRow}>
          <Button
            title="Help and Support"
            onPress={() => {}}
            variant="secondary"
            size="md"
            style={{ flex: 1 }}
          />
          <Button
            title="Review Us"
            onPress={() => {}}
            variant="secondary"
            size="md"
            style={{ flex: 1 }}
          />
        </View>

        {/* Legal */}
        <SectionHeader title="Legal" />
        {legalItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.legalRow} activeOpacity={0.7}>
            <Text style={styles.legalText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <Button
          title="Logout"
          onPress={() => {}}
          variant="destructive"
          size="lg"
          fullWidth
          style={{ marginTop: Spacing.lg }}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>G Fit v1.0.0</Text>
          <Text style={styles.footerLegal}>
            © 2026 Geetanjali Yoga & Fitness Zone. All rights reserved.
          </Text>
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
    paddingBottom: Spacing.xxxl + 20,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  rewardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E8',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F0E0B8',
  },
  rewardsText: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
    color: Colors.goldAccent,
  },
  // Profile
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarEditWrap: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryTeal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    ...Typography.h1,
    marginBottom: 4,
  },
  seeProfile: {
    ...Typography.body,
    color: Colors.primaryTeal,
    textDecorationLine: 'underline',
  },
  // Refer card
  referCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryTealLight,
    borderColor: Colors.primaryTeal + '30',
  },
  referContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  referIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referInfo: {
    flex: 1,
  },
  referTitle: {
    ...Typography.h2,
  },
  referSubtext: {
    ...Typography.caption,
    marginTop: 2,
  },
  flagNote: {
    ...Typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
  },
  // Tools
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toolItem: {
    width: '48%',
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    flexGrow: 1,
    flexBasis: '46%',
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  toolLabel: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  // Settings
  settingsList: {
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  settingsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    ...Typography.body,
    flex: 1,
  },
  flaggedBadge: {
    backgroundColor: Colors.destructiveLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  flaggedText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.destructive,
  },
  // Learn
  learnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  learnIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryTealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnInfo: {
    flex: 1,
  },
  learnTitle: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
  },
  learnDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  // Help row
  helpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  // Legal
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legalText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  footerVersion: {
    ...Typography.caption,
    marginBottom: 4,
  },
  footerLegal: {
    ...Typography.caption,
    fontSize: 10,
    textAlign: 'center',
  },
});
