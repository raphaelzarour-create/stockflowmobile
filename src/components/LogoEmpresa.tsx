import { Image, StyleSheet, View } from 'react-native';

interface LogoEmpresaProps {
  compacto?: boolean;
}

const logoHorizontal = require('../../assets/brand-logo-horizontal-light.png');
const logoSimbolo = require('../../assets/brand-logo-symbol.png');

export function LogoEmpresa({ compacto = false }: LogoEmpresaProps) {
  return (
    <View
      accessible
      accessibilityLabel="Logo do StockFlow"
      style={[styles.container, compacto && styles.containerCompacto]}
    >
      <Image
        source={compacto ? logoSimbolo : logoHorizontal}
        resizeMode="contain"
        style={compacto ? styles.logoCompacto : styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerCompacto: {
    width: 42,
    height: 42,
  },
  logo: {
    width: 278,
    height: 76,
  },
  logoCompacto: {
    width: 42,
    height: 42,
  },
});
