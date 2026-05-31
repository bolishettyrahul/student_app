import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/src/services/supabase';
import { colors, spacing, typography, borderRadius } from '@/src/theme/colors';
import { Button } from '@/src/components/common/Button';
import { Input } from '@/src/components/common/Input';
import { Feather } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (resetError) {
        Alert.alert('Error', resetError.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.successContent}>
          <View style={styles.successIconCircle}>
            <Feather name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We&apos;ve sent password reset instructions to{'\n'}
            <Text style={styles.emailHighlight}>{email.trim()}</Text>
          </Text>
          <Text style={styles.successHint}>
            Didn&apos;t receive the email? Check your spam folder or try again.
          </Text>

          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/login')}
            style={styles.backButton}
          />

          <Button
            title="Try Another Email"
            onPress={() => {
              setSubmitted(false);
              setEmail('');
            }}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoCircle}>
            <Feather name="key" size={28} color={colors.warning} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we&apos;ll send you reset instructions.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            label="Email Address"
            placeholder="you@university.edu"
            iconName="mail"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Button
            title="Send Reset Link"
            onPress={handleReset}
            loading={loading}
            style={styles.resetButton}
          />

          <Button
            title="Back to Sign In"
            onPress={() => router.back()}
            variant="link"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '40',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '700',
    color: colors.dark.text,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: typography.lineHeights.sm,
    paddingHorizontal: spacing.md,
  },
  formCard: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  resetButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // Success State
  successContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '30',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '700',
    color: colors.dark.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: typography.fontSizes.md,
    color: colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeights.md,
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  successHint: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textPlaceholder,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
});
