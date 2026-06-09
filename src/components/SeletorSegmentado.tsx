import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/tema';

export interface OpcaoSegmentada<T extends string> {
  valor: T;
  label: string;
}

interface SeletorSegmentadoProps<T extends string> {
  label: string;
  opcoes: ReadonlyArray<OpcaoSegmentada<T>>;
  valor: T;
  onChange: (valor: T) => void;
}

export function SeletorSegmentado<T extends string>({
  label,
  opcoes,
  valor,
  onChange,
}: SeletorSegmentadoProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.opcoes}>
        {opcoes.map((opcao) => {
          const selecionado = opcao.valor === valor;
          return (
            <Pressable
              key={opcao.valor}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${opcao.label}`}
              accessibilityState={{ selected: selecionado }}
              onPress={() => onChange(opcao.valor)}
              style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
            >
              <Text style={[styles.opcaoTexto, selecionado && styles.opcaoTextoSelecionada]}>{opcao.label}</Text>
            </Pressable>
          );
        })}
      </View>
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
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  opcao: {
    minHeight: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  opcaoSelecionada: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  opcaoTexto: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  opcaoTextoSelecionada: {
    color: colors.white,
  },
});
