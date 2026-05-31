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
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/src/services/supabase';
import { colors, spacing, typography, borderRadius } from '@/src/theme/colors';
import { Button } from '@/src/components/common/Button';
import { Input } from '@/src/components/common/Input';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert('Registration Failed', error.message);
      } else {
        Alert.alert(
          'Account Created!',
          'Please check your email to verify your account, then sign in.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    } catch (err) {
      console.error('Registration unexpected error:', err);
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
          <View style={styles.logoCircle}>
            <Feather name="user-plus" size={28} color={colors.secondary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the CampusConnect community</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            iconName="user"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoCapitalize="words"
            autoComplete="name"
          />

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
            placeholder="Min. 6 characters"
            iconName="lock"
            rightIconName={showPassword ? 'eye' : 'eye-off'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            iconName="shield"
            rightIconName={showConfirmPassword ? 'eye' : 'eye-off'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            variant="secondary"
            style={styles.registerButton}
          />

          <Link href="/login" style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginHighlight}>Sign In</Text>
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
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryDark + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '40',
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
  },
  formCard: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  loginLinkText: {
    color: colors.dark.textMuted,
    fontSize: typography.fontSizes.sm,
  },
  loginHighlight: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
