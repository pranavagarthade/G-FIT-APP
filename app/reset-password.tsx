import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { updatePassword } from '../lib/auth';

export default function ResetPasswordAppScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This can be expanded later to read auth hash/token from the deep link if required.
  }, []);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing info', 'Please enter both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'The new passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(newPassword);
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Set new password</Text>
        <Text style={styles.subtitle}>Choose a password for your G Fit account.</Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>New password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryBtnText}>{loading ? 'Updating...' : 'Update password'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  fieldWrap: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    marginBottom: 6,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: Colors.primaryTeal,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  primaryBtnText: {
    ...Typography.body,
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
  },
});
