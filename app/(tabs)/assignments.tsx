import { Button } from '@/src/components/common/Button';
import { EmptyState } from '@/src/components/common/EmptyState';
import { Input } from '@/src/components/common/Input';
import { Skeleton } from '@/src/components/common/Skeleton';
import { useAssignments } from '@/src/hooks/useAssignments';
import { useSubjects } from '@/src/hooks/useSubjects';
import { borderRadius, colors, spacing, typography } from '@/src/theme/colors';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

type PriorityType = 'low' | 'medium' | 'high';

export default function AssignmentsScreen() {
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    addAssignment,
    toggleAssignmentStatus,
    deleteAssignment,
    refresh,
  } = useAssignments();

  const { subjects, loading: subjectsLoading } = useSubjects();

  // Filters State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'completed'>('pending');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityType>('medium');
  
  // Date Presets State
  const [customDate, setCustomDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'tomorrow' | '3days' | 'nextweek' | 'custom'>('tomorrow');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Resolve Date based on selection
  const getResolvedDate = (): string => {
    const d = new Date();
    d.setHours(23, 59, 59, 999); // Due by end of day
    
    switch (selectedPreset) {
      case 'today':
        return d.toISOString();
      case '3days':
        d.setDate(d.getDate() + 3);
        return d.toISOString();
      case 'nextweek':
        d.setDate(d.getDate() + 7);
        return d.toISOString();
      case 'custom':
        if (customDate) {
          const customParsed = new Date(customDate);
          if (!isNaN(customParsed.getTime())) {
            return customParsed.toISOString();
          }
        }
        // Fallback to tomorrow if custom invalid
        d.setDate(d.getDate() + 1);
        return d.toISOString();
      case 'tomorrow':
      default:
        d.setDate(d.getDate() + 1);
        return d.toISOString();
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }
    
    if (selectedPreset === 'custom' && !customDate.trim()) {
      setFormError('Please enter a custom date');
      return;
    }

    if (selectedPreset === 'custom' && isNaN(new Date(customDate).getTime())) {
      setFormError('Please enter a valid YYYY-MM-DD format');
      return;
    }

    setFormError('');
    setSubmitting(true);

    const resolvedDate = getResolvedDate();
    const result = await addAssignment(
      title.trim(),
      description.trim() || null,
      resolvedDate,
      priority,
      subjectId
    );

    setSubmitting(false);
    if (result.success) {
      setTitle('');
      setDescription('');
      setSubjectId(null);
      setPriority('medium');
      setSelectedPreset('tomorrow');
      setCustomDate('');
      setModalVisible(false);
    } else {
      Alert.alert('Error', result.error || 'Failed to create assignment');
    }
  };

  const handleDelete = (id: string, taskTitle: string) => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${taskTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteAssignment(id);
          if (!result.success) {
            Alert.alert('Error', result.error || 'Failed to delete assignment');
          }
        },
      },
    ]);
  };

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchStatus = item.status === selectedStatus;
      const matchSubject = !selectedSubjectId || item.subject_id === selectedSubjectId;
      const matchPriority = !selectedPriority || item.priority === selectedPriority;
      return matchStatus && matchSubject && matchPriority;
    });
  }, [assignments, selectedStatus, selectedSubjectId, selectedPriority]);

  const formatDateLabel = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Due Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Due Tomorrow';

    return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
      default:
        return colors.info;
    }
  };

  if ((assignmentsLoading || subjectsLoading) && assignments.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.filterSection}>
          <Skeleton height={40} borderRadius={20} />
          <View style={{height: spacing.sm}}/>
          <Skeleton height={32} borderRadius={16} />
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ marginBottom: spacing.md }}>
              <Skeleton height={140} borderRadius={borderRadius.lg} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {assignmentsError && (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={16} color="#FFFFFF" style={styles.bannerIcon} />
          <Text style={styles.errorText}>{assignmentsError}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Filter Row Section */}
      <View style={styles.filterSection}>
        {/* Status Tab Switcher */}
        <View style={styles.statusTabs}>
          <Pressable
            style={[styles.statusTab, selectedStatus === 'pending' && styles.statusTabActive]}
            onPress={() => setSelectedStatus('pending')}
          >
            <Text
              style={[
                styles.statusTabText,
                selectedStatus === 'pending' && styles.statusTabTextActive,
              ]}
            >
              Pending Tasks
            </Text>
          </Pressable>
          <Pressable
            style={[styles.statusTab, selectedStatus === 'completed' && styles.statusTabActive]}
            onPress={() => setSelectedStatus('completed')}
          >
            <Text
              style={[
                styles.statusTabText,
                selectedStatus === 'completed' && styles.statusTabTextActive,
              ]}
            >
              Completed
            </Text>
          </Pressable>
        </View>

        {/* Subjects Filter Pill Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          <Pressable
            style={[styles.pill, !selectedSubjectId && styles.pillActive]}
            onPress={() => setSelectedSubjectId(null)}
          >
            <Text style={[styles.pillText, !selectedSubjectId && styles.pillTextActive]}>
              All Classes
            </Text>
          </Pressable>
          {subjects.map((sub) => (
            <Pressable
              key={sub.id}
              style={[
                styles.pill,
                selectedSubjectId === sub.id && [
                  styles.pillActive,
                  { borderColor: sub.color, backgroundColor: sub.color + '20' },
                ],
              ]}
              onPress={() => setSelectedSubjectId(sub.id)}
            >
              <View style={[styles.pillDot, { backgroundColor: sub.color }]} />
              <Text
                style={[
                  styles.pillText,
                  selectedSubjectId === sub.id && { color: sub.color, fontWeight: '700' },
                ]}
              >
                {sub.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Priority Filter Pill Row */}
        <View style={styles.priorityFilters}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['low', 'medium', 'high'].map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.priorityPill,
                  selectedPriority === p && {
                    borderColor: getPriorityColor(p),
                    backgroundColor: getPriorityColor(p) + '15',
                  },
                ]}
                onPress={() => setSelectedPriority(selectedPriority === p ? null : p)}
              >
                <Text
                  style={[
                    styles.priorityPillText,
                    selectedPriority === p && { color: getPriorityColor(p), fontWeight: '700' },
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Task Checklist View */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          iconName={selectedStatus === 'completed' ? 'check-circle' : 'file-text'}
          title={selectedStatus === 'completed' ? 'No Tasks Finished' : 'No Tasks Pending'}
          description={
            selectedStatus === 'completed'
              ? 'Completed tasks will be recorded here for study progress analytics.'
              : 'Add coursework assignments to start checking them off your productive schedule.'
          }
          actionTitle={selectedStatus === 'pending' ? 'Add Assignment' : undefined}
          onAction={selectedStatus === 'pending' ? () => setModalVisible(true) : undefined}
        />
      ) : (
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.taskCard, item.status === 'completed' && styles.taskCardCompleted]}>
              {/* Checkbox Trigger */}
              <Pressable
                style={[
                  styles.checkbox,
                  item.status === 'completed' && {
                    backgroundColor: colors.success,
                    borderColor: colors.success,
                  },
                ]}
                onPress={() => toggleAssignmentStatus(item.id, item.status)}
              >
                {item.status === 'completed' && (
                  <Feather name="check" size={14} color="#FFFFFF" />
                )}
              </Pressable>

              {/* Details Column */}
              <View style={styles.taskDetails}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.status === 'completed' && styles.taskTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {item.description && (
                  <Text style={styles.taskDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.taskMetadataRow}>
                  {/* Subject Tag */}
                  {item.subject ? (
                    <View
                      style={[
                        styles.subjectBadge,
                        { borderColor: item.subject.color, backgroundColor: item.subject.color + '15' },
                      ]}
                    >
                      <Text style={[styles.subjectBadgeText, { color: item.subject.color }]}>
                        {item.subject.name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.generalBadge}>
                      <Text style={styles.generalBadgeText}>General</Text>
                    </View>
                  )}

                  {/* Due Date Indicator */}
                  <View style={styles.dueRow}>
                    <Feather name="clock" size={12} color={colors.dark.textMuted} style={styles.dueIcon} />
                    <Text style={styles.dueLabelText}>{formatDateLabel(item.due_date)}</Text>
                  </View>

                  {/* Priority indicator badge */}
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(item.priority) + '15' },
                    ]}
                  >
                    <Text style={[styles.priorityBadgeText, { color: getPriorityColor(item.priority) }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Delete Button */}
              <Pressable
                onPress={() => handleDelete(item.id, item.title)}
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
              >
                <Feather name="trash-2" size={16} color={colors.error} />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Adding Fab Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Creation Modal Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalWrapper}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Assignment</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="x" size={20} color={colors.dark.textMuted} />
                </Pressable>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Input
                  label="Assignment Title"
                  placeholder="e.g. Midterm Lab Project"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (text.trim()) setFormError('');
                  }}
                  error={formError}
                  autoCapitalize="sentences"
                />

                <Input
                  label="Description (Optional)"
                  placeholder="e.g. Review requirements from lecture 5..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  inputStyle={styles.descInput}
                  autoCapitalize="sentences"
                />

                {/* Class Link Picker */}
                <Text style={styles.sectionLabel}>Link Academic Course</Text>
                {subjects.length === 0 ? (
                  <View style={styles.warningContainer}>
                    <Feather name="alert-circle" size={16} color={colors.warning} style={styles.warningIcon} />
                    <Text style={styles.warningText}>No classes created. Automatically logging as General.</Text>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalSubjectScroll}
                  >
                    <Pressable
                      style={[styles.subjectSelectPill, !subjectId && styles.subjectSelectPillActive]}
                      onPress={() => setSubjectId(null)}
                    >
                      <Text style={[styles.subjectSelectText, !subjectId && styles.subjectSelectTextActive]}>
                        No Subject
                      </Text>
                    </Pressable>
                    {subjects.map((sub) => (
                      <Pressable
                        key={sub.id}
                        style={[
                          styles.subjectSelectPill,
                          subjectId === sub.id && [
                            styles.subjectSelectPillActive,
                            { borderColor: sub.color, backgroundColor: sub.color + '20' },
                          ],
                        ]}
                        onPress={() => setSubjectId(sub.id)}
                      >
                        <View style={[styles.pillDot, { backgroundColor: sub.color }]} />
                        <Text
                          style={[
                            styles.subjectSelectText,
                            subjectId === sub.id && { color: sub.color, fontWeight: '700' },
                          ]}
                        >
                          {sub.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}

                {/* Due Date Preset Panels */}
                <Text style={styles.sectionLabel}>Set Target Due Date</Text>
                <View style={styles.presetGrid}>
                  <Pressable
                    style={[styles.presetBtn, selectedPreset === 'today' && styles.presetBtnActive]}
                    onPress={() => {
                      setSelectedPreset('today');
                      setFormError('');
                    }}
                  >
                    <Text style={[styles.presetText, selectedPreset === 'today' && styles.presetTextActive]}>
                      Today
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.presetBtn, selectedPreset === 'tomorrow' && styles.presetBtnActive]}
                    onPress={() => {
                      setSelectedPreset('tomorrow');
                      setFormError('');
                    }}
                  >
                    <Text style={[styles.presetText, selectedPreset === 'tomorrow' && styles.presetTextActive]}>
                      Tomorrow
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.presetBtn, selectedPreset === '3days' && styles.presetBtnActive]}
                    onPress={() => {
                      setSelectedPreset('3days');
                      setFormError('');
                    }}
                  >
                    <Text style={[styles.presetText, selectedPreset === '3days' && styles.presetTextActive]}>
                      In 3 Days
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.presetBtn, selectedPreset === 'nextweek' && styles.presetBtnActive]}
                    onPress={() => {
                      setSelectedPreset('nextweek');
                      setFormError('');
                    }}
                  >
                    <Text style={[styles.presetText, selectedPreset === 'nextweek' && styles.presetTextActive]}>
                      Next Week
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.presetBtn, selectedPreset === 'custom' && styles.presetBtnActive]}
                    onPress={() => setSelectedPreset('custom')}
                  >
                    <Text style={[styles.presetText, selectedPreset === 'custom' && styles.presetTextActive]}>
                      Custom YYYY-MM-DD
                    </Text>
                  </Pressable>
                </View>

                {selectedPreset === 'custom' && (
                  <Input
                    placeholder="YYYY-MM-DD (e.g. 2026-12-25)"
                    value={customDate}
                    onChangeText={(text) => {
                      setCustomDate(text);
                      if (text.trim()) setFormError('');
                    }}
                    keyboardType="numeric"
                  />
                )}

                {/* Priority Selection Row */}
                <Text style={styles.sectionLabel}>Select Task Priority</Text>
                <View style={styles.prioritySelectRow}>
                  {(['low', 'medium', 'high'] as PriorityType[]).map((p) => (
                    <Pressable
                      key={p}
                      style={[
                        styles.prioritySelectBtn,
                        priority === p && [
                          styles.prioritySelectBtnActive,
                          { borderColor: getPriorityColor(p), backgroundColor: getPriorityColor(p) + '15' },
                        ],
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.prioritySelectText,
                          priority === p && { color: getPriorityColor(p), fontWeight: '700' },
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Button
                  title="Create Assignment"
                  onPress={handleCreate}
                  loading={submitting}
                  style={styles.createBtn}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
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
    backgroundColor: colors.error,
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
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: typography.fontSizes.sm,
    textDecorationLine: 'underline',
  },
  filterSection: {
    padding: spacing.md,
    backgroundColor: colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: colors.dark.background,
    borderRadius: borderRadius.md,
    padding: 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  statusTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  statusTabActive: {
    backgroundColor: colors.dark.card,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statusTabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    fontWeight: '600',
  },
  statusTabTextActive: {
    color: colors.dark.text,
  },
  pillsScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.dark.accentBg,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  pillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
    color: colors.dark.textMuted,
  },
  pillTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  priorityFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  priorityLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textMuted,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  priorityPill: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginRight: spacing.xs,
    backgroundColor: colors.dark.background,
  },
  priorityPillText: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeights.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyButton: {
    width: 'auto',
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  taskCard: {
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  taskCardCompleted: {
    opacity: 0.65,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.dark.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'underline',
  },
  taskDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  taskMetadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  subjectBadge: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  subjectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  generalBadge: {
    backgroundColor: colors.dark.border,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  generalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.dark.textMuted,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueIcon: {
    marginRight: 4,
  },
  dueLabelText: {
    fontSize: 11,
    color: colors.dark.textMuted,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
    opacity: 0.9,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.dark.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.dark.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  descInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    color: colors.dark.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    marginBottom: spacing.md,
  },
  warningIcon: {
    marginRight: spacing.xs,
  },
  warningText: {
    color: colors.warning,
    fontSize: typography.fontSizes.xs,
    fontWeight: '500',
  },
  modalSubjectScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  subjectSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
  },
  subjectSelectPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.dark.accentBg,
  },
  subjectSelectText: {
    fontSize: typography.fontSizes.sm,
    color: colors.dark.textMuted,
    fontWeight: '600',
  },
  subjectSelectTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetBtn: {
    flex: 1,
    minWidth: '28%',
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.dark.background,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.dark.accentBg,
  },
  presetText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
    color: colors.dark.textMuted,
  },
  presetTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  prioritySelectRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  prioritySelectBtn: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.background,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prioritySelectBtnActive: {
    borderWidth: 2,
  },
  prioritySelectText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
    color: colors.dark.textMuted,
  },
  createBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
