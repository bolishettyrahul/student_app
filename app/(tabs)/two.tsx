import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing, typography, borderRadius } from '@/src/theme/colors';
import { Button } from '@/src/components/common/Button';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const displayEmail = user?.email || 'No email';

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Feather name="user" size={36} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Feather name="calendar" size={18} color={colors.dark.textMuted} />
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </Text>
        </View>
        <View style={styles.infoSeparator} />
        <View style={styles.infoRow}>
          <Feather name="shield" size={18} color={colors.dark.textMuted} />
          <Text style={styles.infoLabel}>Auth Provider</Text>
          <Text style={styles.infoValue}>
            {user?.app_metadata?.provider || 'email'}
          </Text>
        </View>
        <View style={styles.infoSeparator} />
        <View style={styles.infoRow}>
          <Feather name="check-circle" size={18} color={colors.success} />
          <Text style={styles.infoLabel}>Email Verified</Text>
          <Text
            style={[
              styles.infoValue,
              { color: user?.email_confirmed_at ? colors.success : colors.warning },
            ]}
          >
            {user?.email_confirmed_at ? 'Yes' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          loading={loading}
          style={styles.signOutButton}
          textStyle={styles.signOutText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '50',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '700',
    color: colors.dark.text,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    marginLeft: spacing.md,
  },
  infoValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.text,
    fontWeight: '600',
  },
  infoSeparator: {
    height: 1,
    backgroundColor: colors.dark.border,
    marginVertical: spacing.xs,
  },
  signOutSection: {
    marginTop: spacing.xl,
  },
  signOutButton: {
    borderColor: colors.error + '60',
  },
  signOutText: {
    color: colors.error,
  },
});
