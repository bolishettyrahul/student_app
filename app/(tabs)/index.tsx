import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAssignments } from '@/src/hooks/useAssignments';
import { useSubjects } from '@/src/hooks/useSubjects';
import { colors, spacing, typography, borderRadius } from '@/src/theme/colors';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function DashboardScreen() {
  const router = useRouter();
  const { assignments, loading: assignmentsLoading, error: assignmentsError } = useAssignments();
  const { subjects, loading: subjectsLoading } = useSubjects();

  const isInitialLoading = (assignmentsLoading || subjectsLoading) && assignments.length === 0;

  // 1. Calculate Analytics
  const analytics = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const todayStr = new Date().toDateString();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    let dueToday = 0;
    let dueThisWeek = 0;
    const urgentTasks: typeof assignments = [];

    assignments.forEach((a) => {
      if (a.status === 'completed') return;

      const dueDate = new Date(a.due_date);
      const dueDateStr = dueDate.toDateString();

      // Due Today
      if (dueDateStr === todayStr) {
        dueToday++;
        urgentTasks.push(a);
      }
      // Due within 7 days
      else if (dueDate > new Date() && dueDate <= oneWeekFromNow) {
        dueThisWeek++;
        // If due tomorrow, also flag as urgent
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (dueDateStr === tomorrow.toDateString()) {
          urgentTasks.push(a);
        }
      }
    });

    // Subject Progress Analytics
    const subjectProgress = subjects.map((sub) => {
      const subAssignments = assignments.filter((a) => a.subject_id === sub.id);
      const subTotal = subAssignments.length;
      const subCompleted = subAssignments.filter((a) => a.status === 'completed').length;
      const progress = subTotal > 0 ? subCompleted / subTotal : 0;

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        color: sub.color,
        total: subTotal,
        completed: subCompleted,
        progress,
      };
    });

    return {
      dueToday,
      dueThisWeek,
      completionRate,
      urgentTasks: urgentTasks.slice(0, 3), // max 3 urgent reminders
      subjectProgress,
    };
  }, [assignments, subjects]);

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />

      {assignmentsError && (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={16} color="#FFFFFF" style={styles.bannerIcon} />
          <Text style={styles.errorText}>Connection offline. Showing offline cached tasks.</Text>
        </View>
      )}

      {/* Hero Analytics Card */}
      <View style={styles.heroSection}>
        <View style={styles.heroMainRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>Academic Dashboard</Text>
            <Text style={styles.heroSubtitle}>Track your homework & courses</Text>
          </View>
          <View style={styles.progressRingWrapper}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{analytics.completionRate}%</Text>
              <Text style={styles.progressLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.error + '20' }]}>
              <Feather name="alert-circle" size={16} color={colors.error} />
            </View>
            <View>
              <Text style={styles.statNum}>{analytics.dueToday}</Text>
              <Text style={styles.statLabel}>Due Today</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Feather name="clock" size={16} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.statNum}>{analytics.dueThisWeek}</Text>
              <Text style={styles.statLabel}>Due This Week</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Feather name="check-square" size={16} color={colors.success} />
            </View>
            <View>
              <Text style={styles.statNum}>
                {assignments.filter((a) => a.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Total Solved</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Urgent Reminders Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Urgent Reminders</Text>
        {analytics.urgentTasks.length === 0 ? (
          <View style={styles.urgentSuccessCard}>
            <View style={styles.successIconOuter}>
              <Feather name="smile" size={20} color={colors.success} />
            </View>
            <Text style={styles.successMessage}>
              All caught up! No urgent assignments due in 24 hours.
            </Text>
          </View>
        ) : (
          analytics.urgentTasks.map((task) => (
            <Pressable
              key={task.id}
              style={({ pressed }) => [styles.reminderCard, pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/assignments')}
            >
              <View
                style={[
                  styles.reminderPriorityBar,
                  { backgroundColor: task.priority === 'high' ? colors.error : colors.warning },
                ]}
              />
              <View style={styles.reminderDetails}>
                <Text style={styles.reminderTitle}>{task.title}</Text>
                <View style={styles.reminderMetadata}>
                  {task.subject && (
                    <Text style={[styles.reminderSubject, { color: task.subject.color }]}>
                      {task.subject.name}
                    </Text>
                  )}
                  <Text style={styles.reminderDate}>
                    • Due{' '}
                    {new Date(task.due_date).toDateString() === new Date().toDateString()
                      ? 'Today'
                      : 'Tomorrow'}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={colors.dark.textMuted} />
            </Pressable>
          ))
        )}
      </View>

      {/* Course Completion Progress Rings */}
      <View style={[styles.sectionContainer, styles.progressSection]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Course Progress</Text>
          <Pressable onPress={() => router.push('/subjects')}>
            <Text style={styles.sectionLink}>Manage Classes</Text>
          </Pressable>
        </View>

        {subjects.length === 0 ? (
          <View style={styles.noCoursesCard}>
            <Feather name="book" size={24} color={colors.dark.textPlaceholder} style={styles.noCoursesIcon} />
            <Text style={styles.noCoursesText}>No active subjects registered.</Text>
            <Pressable onPress={() => router.push('/subjects')}>
              <Text style={styles.noCoursesLink}>Add Course Subject</Text>
            </Pressable>
          </View>
        ) : (
          analytics.subjectProgress.map((sub) => (
            <View key={sub.subjectId} style={styles.progressRowCard}>
              <View style={styles.progressRowHeader}>
                <View style={styles.progressNameRow}>
                  <View style={[styles.courseColorIndicator, { backgroundColor: sub.color }]} />
                  <Text style={styles.courseNameText}>{sub.subjectName}</Text>
                </View>
                <Text style={styles.progressRatioText}>
                  {sub.completed} / {sub.total} Tasks ({Math.round(sub.progress * 100)}%)
                </Text>
              </View>

              {/* Progress Track */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: sub.color,
                      width: `${sub.progress * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    marginRight: spacing.xs,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
  },
  heroSection: {
    backgroundColor: colors.dark.card,
    margin: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  heroMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '800',
    color: colors.dark.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    marginTop: 4,
  },
  progressRingWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark.accentBg,
  },
  progressCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  progressLabel: {
    fontSize: 9,
    color: colors.dark.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  statNum: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.dark.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.dark.textMuted,
    fontWeight: '500',
  },
  sectionContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.md,
  },
  urgentSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  successIconOuter: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  successMessage: {
    color: colors.dark.textMuted,
    fontSize: typography.fontSizes.sm,
    flex: 1,
    lineHeight: 18,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
    overflow: 'hidden',
    height: 64,
  },
  reminderPriorityBar: {
    width: 4,
    height: '100%',
  },
  reminderDetails: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  reminderTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
    color: colors.dark.text,
  },
  reminderMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.xs,
  },
  reminderSubject: {
    fontSize: 11,
    fontWeight: '700',
  },
  reminderDate: {
    fontSize: 11,
    color: colors.dark.textMuted,
  },
  progressSection: {
    marginBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLink: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  noCoursesCard: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  noCoursesIcon: {
    marginBottom: spacing.sm,
  },
  noCoursesText: {
    color: colors.dark.textMuted,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
  },
  noCoursesLink: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: typography.fontSizes.sm,
    textDecorationLine: 'underline',
  },
  progressRowCard: {
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  progressRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseColorIndicator: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  courseNameText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700',
    color: colors.dark.text,
  },
  progressRatioText: {
    fontSize: 11,
    color: colors.dark.textMuted,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.dark.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
