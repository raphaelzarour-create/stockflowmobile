export function formatarData(dataIso: string) {
  if (!dataIso) {
    return 'Sem data';
  }

  const data = dataIso.includes('T') ? new Date(dataIso) : new Date(`${dataIso}T00:00:00`);
  if (Number.isNaN(data.getTime())) {
    return dataIso;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

export function formatarDataHora(dataIso: string) {
  if (!dataIso) {
    return 'Sem data';
  }

  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) {
    return formatarData(dataIso);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizarTexto(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
