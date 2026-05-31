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
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/src/services/supabase';
import { colors, spacing, typography, borderRadius } from '@/src/theme/colors';
import { Button } from '@/src/components/common/Button';
import { Input } from '@/src/components/common/Input';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
      }
    } catch (err) {
      console.error('Login unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Feather name="book-open" size={32} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.appName}>CampusConnect</Text>
          <Text style={styles.tagline}>Your academic hub, simplified.</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to continue your journey</Text>

          <Input
            label="Email"
            placeholder="you@university.edu"
            iconName="mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            iconName="lock"
            rightIconName={showPassword ? 'eye' : 'eye-off'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <Link href="/forgot" style={styles.forgotLink}>
            <Text style={styles.forgotLinkText}>Forgot Password?</Text>
          </Link>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.signInButton}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create an Account"
            onPress={() => {}}
            variant="outline"
          />
          <Link href="/register" style={styles.createAccountLink}>
            <Text style={styles.createAccountLinkText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.createAccountHighlight}>Sign Up</Text>
            </Text>
          </Link>
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
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  appName: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: '700',
    color: colors.dark.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.fontSizes.md,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  formTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    marginBottom: spacing.lg,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  forgotLinkText: {
    color: colors.primaryLight,
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dark.border,
  },
  dividerText: {
    color: colors.dark.textMuted,
    fontSize: typography.fontSizes.sm,
    marginHorizontal: spacing.md,
  },
  createAccountLink: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  createAccountLinkText: {
    color: colors.dark.textMuted,
    fontSize: typography.fontSizes.sm,
  },
  createAccountHighlight: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
