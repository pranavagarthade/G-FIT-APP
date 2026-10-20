import React, { useState } from 'react';
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
import { signInWithEmail, signUpWithEmail } from '../lib/auth';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'signup' && !fullName)) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'signup') {
        await signUpWithEmail({ email, password, fullName });
        Alert.alert('Success', 'Account created. Please check your inbox for email confirmation if required.');
      } else {
        await signInWithEmail({ email, password });
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Authentication failed', error?.message || 'Unable to continue.');
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
        <Text style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in to continue your G Fit journey.'
            : 'Create your member account to unlock your wellness plan.'}
        </Text>

        {mode === 'signup' && (
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>{loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
          </Text>
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
    paddingVertical: Spacing.xl,
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
  secondaryBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...Typography.caption,
    color: Colors.primaryTeal,
    fontFamily: 'Poppins-Medium',
  },
});
