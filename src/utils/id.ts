export function gerarId(prefixo: string) {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefixo}_${Date.now().toString(36)}_${random}`;
}
