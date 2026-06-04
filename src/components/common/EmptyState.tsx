import { useColorScheme } from '@/components/useColorScheme';
import { colors, spacing, typography } from '@/src/theme/colors';
import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  iconName?: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'inbox',
  title,
  description,
  actionTitle,
  onAction,
}) => {
  const themeMode = useColorScheme() ?? 'dark';
  const activeColors = colors[themeMode];
  const styles = useMemo(() => createStyles(activeColors), [activeColors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name={iconName} size={48} color={activeColors.textMuted} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionTitle && onAction && (
        <Button 
          title={actionTitle} 
          onPress={onAction} 
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const createStyles = (themeColors: typeof colors.dark) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: themeColors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSizes.md,
    color: themeColors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.md,
  },
  actionButton: {
    minWidth: 200,
  },
});
