import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/tema';

interface EmptyStateProps {
  titulo: string;
  descricao: string;
  icone?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({ titulo, descricao, icone = 'file-tray-outline' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icone} size={28} color={colors.textMuted} />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  titulo: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  descricao: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
