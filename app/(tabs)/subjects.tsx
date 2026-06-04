import { Button } from '@/src/components/common/Button';
import { EmptyState } from '@/src/components/common/EmptyState';
import { Input } from '@/src/components/common/Input';
import { Skeleton } from '@/src/components/common/Skeleton';
import { useSubjects } from '@/src/hooks/useSubjects';
import { borderRadius, colors, spacing, typography } from '@/src/theme/colors';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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

const COLOR_PALETTE = [
  '#6366F1', // Indigo (Primary)
  '#14B8A6', // Teal (Secondary)
  '#EF4444', // Rose (Error/High)
  '#F59E0B', // Amber (Warning/Med)
  '#10B981', // Emerald (Success)
  '#3B82F6', // Blue (Info/Low)
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export default function SubjectsScreen() {
  const { subjects, loading, error, addSubject, deleteSubject, refresh } = useSubjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setFormError('Subject name is required');
      return;
    }
    setFormError('');
    setSubmitting(true);
    
    const result = await addSubject(name.trim(), code.trim() || null, selectedColor);
    
    setSubmitting(false);
    if (result.success) {
      setName('');
      setCode('');
      setSelectedColor(COLOR_PALETTE[0]);
      setModalVisible(false);
    } else {
      Alert.alert('Error', result.error || 'Failed to create subject');
    }
  };

  const handleDelete = (id: string, subjectName: string) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete "${subjectName}"? This will delete all associated assignments too.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteSubject(id);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete subject');
            }
          },
        },
      ]
    );
  };

  if (loading && subjects.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ marginBottom: spacing.md }}>
              <Skeleton height={80} borderRadius={borderRadius.lg} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {error && (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={16} color="#FFFFFF" style={styles.bannerIcon} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {subjects.length === 0 ? (
        <EmptyState
          iconName="book"
          title="No Subjects Added"
          description="Add academic subjects to start organizing your tasks and assignments color-code styled."
          actionTitle="Add First Subject"
          onAction={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.cardColorBar, { backgroundColor: item.color }]} />
              <View style={styles.cardDetails}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Pressable
                    onPress={() => handleDelete(item.id, item.name)}
                    style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
                  >
                    <Feather name="trash-2" size={18} color={colors.error} />
                  </Pressable>
                </View>
                {item.code && (
                  <View style={styles.codeRow}>
                    <Feather name="hash" size={12} color={colors.dark.textMuted} style={styles.codeIcon} />
                    <Text style={styles.cardCode}>{item.code}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      {subjects.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Creation Modal */}
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
                <Text style={styles.modalTitle}>New Subject</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="x" size={20} color={colors.dark.textMuted} />
                </Pressable>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Input
                  label="Subject Name"
                  placeholder="e.g. Computer Science"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (text.trim()) setFormError('');
                  }}
                  error={formError}
                  autoCapitalize="words"
                />

                <Input
                  label="Subject Code (Optional)"
                  placeholder="e.g. CS-101"
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                />

                {/* Color Selector */}
                <Text style={styles.colorLabel}>Select Badge Color</Text>
                <View style={styles.colorGrid}>
                  {COLOR_PALETTE.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.colorBall,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorBallSelected,
                      ]}
                    >
                      {selectedColor === color && (
                        <Feather name="check" size={16} color="#FFFFFF" />
                      )}
                    </Pressable>
                  ))}
                </View>

                <Button
                  title="Create Subject"
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
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
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
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
    height: 80,
  },
  cardColorBar: {
    width: 6,
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.dark.text,
    flex: 1,
    marginRight: spacing.md,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  codeIcon: {
    marginRight: 4,
  },
  cardCode: {
    fontSize: typography.fontSizes.xs,
    color: colors.dark.textMuted,
    fontWeight: '600',
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
  // Modal Styles
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
  colorLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    color: colors.dark.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  colorBall: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBallSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  createBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
