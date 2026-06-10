import { getSupabaseClient } from '@/lib/supabase';
import {
  validarEvento,
  validarItemEstoque,
  validarQuantidade,
} from '@/services/regrasEstoque';
import type {
  CategoriaItem,
  Evento,
  EventoInput,
  ItemEstoque,
  ItemEstoqueInput,
  ItemEvento,
  MovimentacaoEstoque,
  StatusEvento,
  StatusItem,
  StockFlowData,
  TipoMovimentacao,
} from '@/types/dominio';

interface ItemRow {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  quantidade_total: number;
  quantidade_disponivel: number;
  status: StatusItem;
  observacao: string | null;
  data_cadastro: string;
  atualizado_em: string;
}

interface EventoRow {
  id: string;
  nome: string;
  cliente: string;
  data: string;
  local: string;
  descricao: string | null;
  status: StatusEvento;
  criado_em: string;
  atualizado_em: string;
}

interface ItemEventoRow {
  id: string;
  evento_id: string;
  item_id: string;
  item_nome: string;
  quantidade: number;
  devolvido: boolean;
  data_vinculo: string;
}

interface MovimentacaoRow {
  id: string;
  item_id: string | null;
  item_nome: string;
  evento_id: string | null;
  evento_nome: string | null;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string | null;
  data: string;
}

function mapItem(row: ItemRow): ItemEstoque {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    quantidadeTotal: row.quantidade_total,
    quantidadeDisponivel: row.quantidade_disponivel,
    status: row.status,
    observacao: row.observacao ?? '',
    dataCadastro: row.data_cadastro,
    atualizadoEm: row.atualizado_em,
  };
}

function mapEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    nome: row.nome,
    cliente: row.cliente,
    data: row.data,
    local: row.local,
    descricao: row.descricao ?? '',
    status: row.status,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function mapItemEvento(row: ItemEventoRow): ItemEvento {
  return {
    id: row.id,
    eventoId: row.evento_id,
    itemId: row.item_id,
    itemNome: row.item_nome,
    quantidade: row.quantidade,
    devolvido: row.devolvido,
    dataVinculo: row.data_vinculo,
  };
}

function mapMovimentacao(row: MovimentacaoRow): MovimentacaoEstoque {
  return {
    id: row.id,
    itemId: row.item_id,
    itemNome: row.item_nome,
    eventoId: row.evento_id,
    eventoNome: row.evento_nome ?? '',
    tipo: row.tipo,
    quantidade: row.quantidade,
    observacao: row.observacao ?? '',
    data: row.data,
  };
}

export async function carregarDados(): Promise<StockFlowData> {
  const client = getSupabaseClient();

  const [itens, eventos, itensEvento, movimentacoes] = await Promise.all([
    client.from('itens').select('*').order('nome', { ascending: true }),
    client.from('eventos').select('*').order('data', { ascending: true }).order('nome', { ascending: true }),
    client.from('itens_evento').select('*').order('data_vinculo', { ascending: false }),
    client.from('movimentacoes').select('*').order('data', { ascending: false }).limit(100),
  ]);

  garantirSucesso(itens.error);
  garantirSucesso(eventos.error);
  garantirSucesso(itensEvento.error);
  garantirSucesso(movimentacoes.error);

  return {
    itens: ((itens.data ?? []) as ItemRow[]).map(mapItem),
    eventos: ((eventos.data ?? []) as EventoRow[]).map(mapEvento),
    itensEvento: ((itensEvento.data ?? []) as ItemEventoRow[]).map(mapItemEvento),
    movimentacoes: ((movimentacoes.data ?? []) as MovimentacaoRow[]).map(mapMovimentacao),
  };
}

export async function salvarItem(input: ItemEstoqueInput, id?: string) {
  const erros = validarItemEstoque(input);
  if (erros.length > 0) {
    throw new Error(erros[0]);
  }

  const client = getSupabaseClient();
  const row = {
    nome: input.nome.trim(),
    categoria: input.categoria,
    quantidade_total: input.quantidadeTotal,
    quantidade_disponivel: input.quantidadeDisponivel,
    status: input.status,
    observacao: input.observacao.trim(),
    atualizado_em: new Date().toISOString(),
  };

  const { error } = id
    ? await client.from('itens').update(row).eq('id', id)
    : await client.from('itens').insert(row);

  garantirSucesso(error);
}

export async function excluirItem(id: string) {
  const client = getSupabaseClient();
  const { error } = await client.from('itens').delete().eq('id', id);
  garantirSucesso(error);
}

export async function registrarMovimentacaoManual(
  itemId: string,
  tipo: TipoMovimentacao,
  quantidade: number,
  observacao: string,
) {
  validarQuantidade(quantidade);
  const client = getSupabaseClient();
  const { error } = await client.rpc('stockflow_registrar_movimentacao_manual', {
    p_item_id: itemId,
    p_tipo: tipo,
    p_quantidade: quantidade,
    p_observacao: observacao.trim(),
  });
  garantirSucesso(error);
}

export async function salvarEvento(input: EventoInput, id?: string) {
  const erros = validarEvento(input);
  if (erros.length > 0) {
    throw new Error(erros[0]);
  }

  const client = getSupabaseClient();
  const row = {
    nome: input.nome.trim(),
    cliente: input.cliente.trim(),
    data: input.data,
    local: input.local.trim(),
    descricao: input.descricao.trim(),
    status: input.status,
    atualizado_em: new Date().toISOString(),
  };

  const { error } = id
    ? await client.from('eventos').update(row).eq('id', id)
    : await client.from('eventos').insert(row);

  garantirSucesso(error);
}

export async function excluirEvento(id: string) {
  const client = getSupabaseClient();
  const { error } = await client.rpc('stockflow_excluir_evento', {
    p_evento_id: id,
  });
  garantirSucesso(error);
}

export async function associarItemAoEvento(eventoId: string, itemId: string, quantidade: number) {
  validarQuantidade(quantidade);
  const client = getSupabaseClient();
  const { error } = await client.rpc('stockflow_associar_item_evento', {
    p_evento_id: eventoId,
    p_item_id: itemId,
    p_quantidade: quantidade,
  });
  garantirSucesso(error);
}

export async function finalizarEvento(eventoId: string) {
  const client = getSupabaseClient();
  const { error } = await client.rpc('stockflow_finalizar_evento', {
    p_evento_id: eventoId,
  });
  garantirSucesso(error);
}

export function assinarMudancasEstoque(onChange: () => void) {
  const client = getSupabaseClient();
  const channel = client
    .channel('stockflow-dados')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'itens' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'itens_evento' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'movimentacoes' }, onChange)
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

function garantirSucesso(error: { message: string } | null) {
  if (!error) {
    return;
  }

  throw new Error(traduzirErroBanco(error.message));
}

function traduzirErroBanco(mensagem: string) {
  if (mensagem.includes('JWT expired') || mensagem.includes('invalid claim')) {
    return 'Sessao expirada. Entre novamente.';
  }

  return mensagem || 'Nao foi possivel acessar o banco de dados.';
}
