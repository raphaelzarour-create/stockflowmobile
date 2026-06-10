import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/tema';

interface LogoEmpresaProps {
  compacto?: boolean;
}

export function LogoEmpresa({ compacto = false }: LogoEmpresaProps) {
  return (
    <View
      accessible
      accessibilityLabel="Logo da 4K Leds"
      style={[styles.container, compacto && styles.containerCompacto]}
    >
      <View style={[styles.marca, compacto && styles.marcaCompacta]}>
        <Text style={[styles.numero, compacto && styles.numeroCompacto]}>4K</Text>
        <View style={styles.led} />
      </View>
      {!compacto ? (
        <View style={styles.textoBox}>
          <Text style={styles.nome}>4K Leds</Text>
          <Text style={styles.subtitulo}>Eventos</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  containerCompacto: {
    gap: 0,
  },
  marca: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#31536E',
    backgroundColor: '#081F36',
  },
  marcaCompacta: {
    width: 42,
    height: 42,
  },
  numero: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  numeroCompacto: {
    fontSize: 16,
  },
  led: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  textoBox: {
    gap: spacing.xs,
  },
  nome: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitulo: {
    color: '#C9D7E3',
    fontSize: 13,
    fontWeight: '700',
  },
});
