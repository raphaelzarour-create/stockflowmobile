import { StyleSheet, Text, View } from 'react-native';

import { statusEventoLabels, statusItemLabels } from '@/constants/opcoes';
import { colors, radius, spacing } from '@/constants/tema';
import type { StatusEvento, StatusItem } from '@/types/dominio';

interface StatusBadgeProps {
  tipo: 'item' | 'evento';
  status: StatusItem | StatusEvento;
}

export function StatusBadge({ tipo, status }: StatusBadgeProps) {
  const label = tipo === 'item' ? statusItemLabels[status as StatusItem] : statusEventoLabels[status as StatusEvento];
  const cor = coresStatus[status] ?? colors.primary;

  return (
    <View style={[styles.container, { borderColor: cor, backgroundColor: `${cor}14` }]}>
      <Text style={[styles.text, { color: cor }]}>{label}</Text>
    </View>
  );
}

const coresStatus: Record<string, string> = {
  disponivel: colors.accent,
  em_uso: colors.warning,
  manutencao: colors.primary,
  danificado: colors.danger,
  planejado: colors.primary,
  em_andamento: colors.warning,
  concluido: colors.accent,
  cancelado: colors.danger,
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
