import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/constants/tema';

interface PillProps<T extends string> {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (value: T) => void;
}

export function Pill<T extends string>({ label, value, selected, onSelect }: PillProps<T>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onSelect(value)}
      style={[styles.container, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.white,
  },
});
