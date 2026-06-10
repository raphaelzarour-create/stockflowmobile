export const appConfig = {
  nome: process.env.EXPO_PUBLIC_APP_NAME ?? 'StockFlow',
  empresa: process.env.EXPO_PUBLIC_COMPANY_NAME ?? '4K Leds e Eventos',
  loginDominioSugerido: '4kleds.com.br',
  cadastroHabilitado: process.env.EXPO_PUBLIC_ENABLE_SIGNUP !== 'false',
};
