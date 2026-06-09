import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/constants/tema';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma';
  icone?: IconName;
  desabilitado?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  desabilitado = false,
  style,
}: BotaoProps) {
  const estiloVariante = estilosPorVariante[variante];
  const corIcone = variante === 'primario' || variante === 'perigo' ? colors.white : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        estiloVariante.container,
        desabilitado && styles.desabilitado,
        pressed && !desabilitado && styles.pressionado,
        style,
      ]}
    >
      {icone ? <Ionicons name={icone} size={18} color={corIcone} /> : null}
      <Text style={[styles.texto, estiloVariante.texto]} numberOfLines={2}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilosPorVariante = {
  primario: StyleSheet.create({
    container: { backgroundColor: colors.primary, borderColor: colors.primary },
    texto: { color: colors.white },
  }),
  secundario: StyleSheet.create({
    container: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
    texto: { color: colors.primary },
  }),
  perigo: StyleSheet.create({
    container: { backgroundColor: colors.danger, borderColor: colors.danger },
    texto: { color: colors.white },
  }),
  fantasma: StyleSheet.create({
    container: { backgroundColor: colors.surface, borderColor: colors.border },
    texto: { color: colors.primary },
  }),
};

const styles = StyleSheet.create({
  botao: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  texto: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressionado: {
    opacity: 0.86,
  },
  desabilitado: {
    opacity: 0.45,
  },
});
