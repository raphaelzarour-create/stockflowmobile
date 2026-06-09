import type { ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/constants/tema';

interface CampoTextoProps extends ComponentProps<typeof TextInput> {
  label: string;
  containerStyle?: ViewStyle;
}

export function CampoTexto({ label, style, containerStyle, ...props }: CampoTextoProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
});
