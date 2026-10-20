import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Animation } from '../../constants/theme';
import { user, settingsItems, toolItems, legalItems } from '../../constants/mockData';
import { fetchProfile } from '../../lib/gfitData';
import { getSupabaseUserId } from '../../lib/supabase';
import { resetPasswordForEmail, signOut, updatePassword } from '../../lib/auth';
import CardSurface from '../../components/CardSurface';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import SectionHeader from '../../components/SectionHeader';

/* ────────── Reset Password Modal ────────── */
function ResetPasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!isForgotMode) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New password and confirm password do not match');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      try {
        await updatePassword(newPassword);
        Alert.alert('Success', 'Password has been updated successfully!', [
          { text: 'OK', onPress: onClose },
        ]);
        resetState();
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Unable to update password right now.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await resetPasswordForEmail(forgotEmail);
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        `A password reset link has been sent to ${forgotEmail}. Please check your inbox and click the link to reset your password.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Unable to send the reset email right now.');
    }
  };

  const resetState = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotEmail('');
    setIsForgotMode(false);
    setEmailSent(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { resetState(); onClose(); }}>
      <Pressable style={styles.modalBackdrop} onPress={() => { resetState(); onClose(); }}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>
            {isForgotMode ? 'Forgot Password' : 'Reset Password'}
          </Text>

          {!isForgotMode ? (
            <>
              {/* Old Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Old Password</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter old password"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showOldPass}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                  />
                  <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                    <Ionicons
                      name={showOldPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showNewPass}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                    <Ionicons
                      name={showNewPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showConfirmPass}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                    <Ionicons
                      name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Update Password"
                onPress={handleResetPassword}
                variant="primary"
                fullWidth
                style={{ marginTop: Spacing.md }}
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => setIsForgotMode(true)}
              >
                <Text style={styles.forgotLinkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!emailSent ? (
                <>
                  <Text style={styles.forgotDesc}>
                    Enter your Gmail address and we'll send you a link to reset your password.
                  </Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="yourname@gmail.com"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                    />
                  </View>
                  <Button
                    title="Send Reset Link"
                    onPress={handleForgotPassword}
                    variant="primary"
                    fullWidth
                    style={{ marginTop: Spacing.md }}
                  />
                </>
              ) : (
                <View style={styles.emailSentWrap}>
                  <Ionicons name="mail-outline" size={48} color={Colors.primaryTeal} />
                  <Text style={styles.emailSentTitle}>Check your inbox</Text>
                  <Text style={styles.emailSentDesc}>
                    We've sent a password reset link to {forgotEmail}. Click the link in the email to update your password.
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => { setIsForgotMode(false); setEmailSent(false); }}
              >
                <Text style={styles.forgotLinkText}>← Back to Reset Password</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => { resetState(); onClose(); }}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ────────── Delete Account Modal ────────── */
function DeleteAccountModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHandle} />
          <View style={styles.deleteWarningIcon}>
            <Ionicons name="warning" size={32} color={Colors.destructive} />
          </View>
          <Text style={styles.deleteTitle}>Delete Account Permanently</Text>
          <Text style={styles.deleteDesc}>
            This action cannot be undone. All your data, progress, achievements, and community posts will be permanently deleted.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
            <TextInput
              style={styles.textInput}
              placeholder="DELETE"
              placeholderTextColor={Colors.textSecondary}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
            />
          </View>
          <Button
            title="Delete My Account"
            onPress={() => {
              if (confirmText === 'DELETE') {
                Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
                  { text: 'OK', onPress: onClose },
                ]);
              } else {
                Alert.alert('Error', 'Please type DELETE to confirm.');
              }
            }}
            variant="destructive"
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
          <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ────────── Settings Row ────────── */
function SettingsRow({
  icon,
  label,
  type,
  toggleValue,
  onToggle,
  onPress,
}: {
  icon: string;
  label: string;
  type: 'navigate' | 'toggle';
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      activeOpacity={type === 'toggle' ? 1 : 0.7}
      onPress={type === 'navigate' ? onPress : undefined}
    >
      <View style={styles.settingsIconWrap}>
        <Ionicons name={icon as any} size={20} color={Colors.primaryTeal} />
      </View>
      <Text style={styles.settingsLabel}>{label}</Text>
      {type === 'toggle' ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primaryTeal }}
          thumbColor={Colors.white}
          ios_backgroundColor={Colors.border}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

/* ────────── Me Screen ────────── */
export default function MeScreen() {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileName, setProfileName] = useState(user.name);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const userId = await getSupabaseUserId();
        if (!userId) return;

        const profile = await fetchProfile(userId);
        if (!active) return;

        setProfileName(profile?.full_name || user.name);
      } catch (error) {
        console.warn('Unable to load profile from Supabase:', error);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleSettingsPress = (id: string) => {
    switch (id) {
      case 'reset-password':
        setShowResetPassword(true);
        break;
      case 'dark-mode':
        // Handled by toggle
        break;
      case 'account-settings':
        setShowDeleteAccount(true);
        break;
      case 'push-notifications':
        // Handled by toggle
        break;
    }
  };

  const handleProfileEdit = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => {} },
        { text: 'Choose from Gallery', onPress: () => {} },
        { text: 'Remove Photo', onPress: () => {}, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login');
          } catch (error: any) {
            Alert.alert('Logout failed', error?.message || 'Unable to log out right now.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top bar — logo + rewards (NO settings gear) */}
        <View style={styles.topBar}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={{ flex: 1 }} />
          <View style={styles.rewardsBadge}>
            <Ionicons name="diamond" size={16} color={Colors.goldAccent} />
            <Text style={styles.rewardsText}>{user.rewardCoins}</Text>
          </View>
        </View>

        {/* Profile with Edit Option */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarEditWrap} activeOpacity={0.8} onPress={handleProfileEdit}>
            <Avatar name={profileName} size={80} />
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={12} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{profileName}</Text>
          <TouchableOpacity>
            <Text style={styles.seeProfile}>See profile</Text>
          </TouchableOpacity>
        </View>

        {/* Refer & Earn */}
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
              type={item.type}
              toggleValue={
                item.id === 'dark-mode' ? darkMode :
                item.id === 'push-notifications' ? pushNotifications :
                undefined
              }
              onToggle={
                item.id === 'dark-mode' ? setDarkMode :
                item.id === 'push-notifications' ? setPushNotifications :
                undefined
              }
              onPress={() => handleSettingsPress(item.id)}
            />
          ))}
        </View>

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
          onPress={handleLogout}
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

      {/* Modals */}
      <ResetPasswordModal
        visible={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
      <DeleteAccountModal
        visible={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
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
    width: 28,
    height: 28,
    borderRadius: 14,
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

  /* ────────── Modal Styles ────────── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + 16 : Spacing.xl,
    paddingTop: Spacing.md,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h1,
    fontSize: 20,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textInput: {
    backgroundColor: Colors.cardSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  forgotLink: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  forgotLinkText: {
    ...Typography.body,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
  },
  forgotDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 21,
  },
  emailSentWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  emailSentTitle: {
    ...Typography.h2,
  },
  emailSentDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  modalCancelBtn: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  modalCancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontFamily: 'Poppins-Medium',
  },
  /* ────────── Delete Account Modal ────────── */
  deleteWarningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.destructiveLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  deleteTitle: {
    ...Typography.h2,
    color: Colors.destructive,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  deleteDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
});
