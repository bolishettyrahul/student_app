import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/src/theme/colors';
import { Feather } from '@expo/vector-icons';

export default function GroupsPlaceholderScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="message-square" size={40} color={colors.secondary} />
        </View>
        <Text style={styles.title}>Study Groups & Chat</Text>
        <Text style={styles.subtitle}>
          Collaborate with classmates in real time. Create subject channels, share study materials, and build active learning communities.
        </Text>
        <View style={styles.badge}>
          <Feather name="lock" size={14} color={colors.secondary} style={styles.lockIcon} />
          <Text style={styles.badgeText}>COMING IN PHASE 4</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    textAlign: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryDark + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '40',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeights.md,
    marginBottom: spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryDark + '30',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  lockIcon: {
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
    color: colors.secondaryLight,
    letterSpacing: 0.5,
  },
});
