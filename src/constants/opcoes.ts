import type { CategoriaItem, StatusEvento, StatusItem, TipoMovimentacao } from '@/types/dominio';

export const categoriaLabels: Record<CategoriaItem, string> = {
  iluminacao: 'Iluminação',
  cabos: 'Cabos',
  paineis_led: 'Painéis de LED',
  estruturas: 'Estruturas',
  som: 'Som',
  acessorios: 'Acessórios',
  outros: 'Outros',
};

export const statusItemLabels: Record<StatusItem, string> = {
  disponivel: 'Disponível',
  em_uso: 'Em uso',
  manutencao: 'Manutenção',
  danificado: 'Danificado',
};

export const statusEventoLabels: Record<StatusEvento, string> = {
  planejado: 'Planejado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const tipoMovimentacaoLabels: Record<TipoMovimentacao, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  devolucao: 'Devolução',
  manutencao: 'Manutenção',
  danificado: 'Danificado',
};
