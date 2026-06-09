export const categoriasItem = [
  "iluminacao",
  "cabos",
  "paineis_led",
  "estruturas",
  "som",
  "acessorios",
  "outros",
] as const;

export type CategoriaItem = (typeof categoriasItem)[number];

export const statusItem = [
  "disponivel",
  "em_uso",
  "manutencao",
  "danificado",
] as const;

export type StatusItem = (typeof statusItem)[number];

export const statusEvento = [
  "planejado",
  "em_andamento",
  "concluido",
  "cancelado",
] as const;

export type StatusEvento = (typeof statusEvento)[number];

export const tiposMovimentacao = [
  "entrada",
  "saida",
  "devolucao",
  "manutencao",
  "danificado",
] as const;

export type TipoMovimentacao = (typeof tiposMovimentacao)[number];

export interface ItemEstoque {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  status: StatusItem;
  observacao: string;
  dataCadastro: string;
  atualizadoEm: string;
}

export interface ItemEstoqueInput {
  nome: string;
  categoria: CategoriaItem;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  status: StatusItem;
  observacao: string;
}

export interface Evento {
  id: string;
  nome: string;
  cliente: string;
  data: string;
  local: string;
  descricao: string;
  status: StatusEvento;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EventoInput {
  nome: string;
  cliente: string;
  data: string;
  local: string;
  descricao: string;
  status: StatusEvento;
}

export interface ItemEvento {
  id: string;
  eventoId: string;
  itemId: string;
  itemNome: string;
  quantidade: number;
  devolvido: boolean;
  dataVinculo: string;
}

export interface MovimentacaoEstoque {
  id: string;
  itemId: string | null;
  itemNome: string;
  eventoId: string | null;
  eventoNome: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string;
  data: string;
}

export interface ResumoEstoque {
  totalItensCadastrados: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  quantidadeEmUso: number;
  alertasEstoqueBaixo: ItemEstoque[];
  proximosEventos: Evento[];
  eventosAtivos: number;
}

export interface StockFlowData {
  itens: ItemEstoque[];
  eventos: Evento[];
  itensEvento: ItemEvento[];
  movimentacoes: MovimentacaoEstoque[];
}
