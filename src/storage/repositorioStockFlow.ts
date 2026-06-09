import { getDatabase, inicializarBanco } from '@/storage/database';
import {
  aplicarAssociacaoEvento,
  aplicarDevolucaoEvento,
  aplicarMovimentacaoEstoque,
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
import { gerarId } from '@/utils/id';

interface ItemRow {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  quantidade_total: number;
  quantidade_disponivel: number;
  status: StatusItem;
  observacao: string;
  data_cadastro: string;
  atualizado_em: string;
}

interface EventoRow {
  id: string;
  nome: string;
  cliente: string;
  data: string;
  local: string;
  descricao: string;
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
  devolvido: number;
  data_vinculo: string;
}

interface MovimentacaoRow {
  id: string;
  item_id: string | null;
  item_nome: string;
  evento_id: string | null;
  evento_nome: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string;
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
    observacao: row.observacao,
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
    descricao: row.descricao,
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
    devolvido: row.devolvido === 1,
    dataVinculo: row.data_vinculo,
  };
}

function mapMovimentacao(row: MovimentacaoRow): MovimentacaoEstoque {
  return {
    id: row.id,
    itemId: row.item_id,
    itemNome: row.item_nome,
    eventoId: row.evento_id,
    eventoNome: row.evento_nome,
    tipo: row.tipo,
    quantidade: row.quantidade,
    observacao: row.observacao,
    data: row.data,
  };
}

async function buscarItemObrigatorio(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM itens WHERE id = ?', id);

  if (!row) {
    throw new Error('Item nao encontrado.');
  }

  return mapItem(row);
}

async function buscarEventoObrigatorio(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<EventoRow>('SELECT * FROM eventos WHERE id = ?', id);

  if (!row) {
    throw new Error('Evento nao encontrado.');
  }

  return mapEvento(row);
}

async function atualizarItem(item: ItemEstoque) {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE itens
       SET nome = ?, categoria = ?, quantidade_total = ?, quantidade_disponivel = ?,
           status = ?, observacao = ?, atualizado_em = ?
     WHERE id = ?`,
    item.nome,
    item.categoria,
    item.quantidadeTotal,
    item.quantidadeDisponivel,
    item.status,
    item.observacao,
    item.atualizadoEm,
    item.id,
  );
}

async function registrarMovimentacao(params: {
  item: ItemEstoque;
  evento?: Evento | null;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string;
}) {
  const db = await getDatabase();
  const agora = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO movimentacoes
      (id, item_id, item_nome, evento_id, evento_nome, tipo, quantidade, observacao, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    gerarId('mov'),
    params.item.id,
    params.item.nome,
    params.evento?.id ?? null,
    params.evento?.nome ?? '',
    params.tipo,
    params.quantidade,
    params.observacao,
    agora,
  );
}

export async function carregarDados(): Promise<StockFlowData> {
  await inicializarBanco();
  const db = await getDatabase();

  const itensRows = await db.getAllAsync<ItemRow>('SELECT * FROM itens ORDER BY nome COLLATE NOCASE ASC');
  const eventosRows = await db.getAllAsync<EventoRow>('SELECT * FROM eventos ORDER BY data ASC, nome ASC');
  const itensEventoRows = await db.getAllAsync<ItemEventoRow>(`
    SELECT itens_evento.*, itens.nome AS item_nome
      FROM itens_evento
      JOIN itens ON itens.id = itens_evento.item_id
     ORDER BY itens_evento.data_vinculo DESC
  `);
  const movimentacoesRows = await db.getAllAsync<MovimentacaoRow>(
    'SELECT * FROM movimentacoes ORDER BY data DESC LIMIT 100',
  );

  return {
    itens: itensRows.map(mapItem),
    eventos: eventosRows.map(mapEvento),
    itensEvento: itensEventoRows.map(mapItemEvento),
    movimentacoes: movimentacoesRows.map(mapMovimentacao),
  };
}

export async function salvarItem(input: ItemEstoqueInput, id?: string) {
  const erros = validarItemEstoque(input);
  if (erros.length > 0) {
    throw new Error(erros[0]);
  }

  await inicializarBanco();
  const db = await getDatabase();
  const agora = new Date().toISOString();

  if (id) {
    const itemAtual = await buscarItemObrigatorio(id);
    const itemAtualizado: ItemEstoque = {
      ...itemAtual,
      ...input,
      atualizadoEm: agora,
    };

    await atualizarItem(itemAtualizado);
    return;
  }

  await db.runAsync(
    `INSERT INTO itens
      (id, nome, categoria, quantidade_total, quantidade_disponivel, status, observacao, data_cadastro, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    gerarId('item'),
    input.nome.trim(),
    input.categoria,
    input.quantidadeTotal,
    input.quantidadeDisponivel,
    input.status,
    input.observacao.trim(),
    agora,
    agora,
  );
}

export async function excluirItem(id: string) {
  await inicializarBanco();
  const db = await getDatabase();
  await db.runAsync('DELETE FROM itens WHERE id = ?', id);
}

export async function registrarMovimentacaoManual(
  itemId: string,
  tipo: TipoMovimentacao,
  quantidade: number,
  observacao: string,
) {
  await inicializarBanco();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const item = await buscarItemObrigatorio(itemId);
    const itemAtualizado = aplicarMovimentacaoEstoque(item, tipo, quantidade);
    await atualizarItem(itemAtualizado);
    await registrarMovimentacao({
      item,
      tipo,
      quantidade,
      observacao: observacao.trim() || 'Movimentacao manual de estoque',
    });
  });
}

export async function salvarEvento(input: EventoInput, id?: string) {
  const erros = validarEvento(input);
  if (erros.length > 0) {
    throw new Error(erros[0]);
  }

  await inicializarBanco();
  const db = await getDatabase();
  const agora = new Date().toISOString();

  if (id) {
    await buscarEventoObrigatorio(id);
    await db.runAsync(
      `UPDATE eventos
         SET nome = ?, cliente = ?, data = ?, local = ?, descricao = ?, status = ?, atualizado_em = ?
       WHERE id = ?`,
      input.nome.trim(),
      input.cliente.trim(),
      input.data,
      input.local.trim(),
      input.descricao.trim(),
      input.status,
      agora,
      id,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO eventos
      (id, nome, cliente, data, local, descricao, status, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    gerarId('evt'),
    input.nome.trim(),
    input.cliente.trim(),
    input.data,
    input.local.trim(),
    input.descricao.trim(),
    input.status,
    agora,
    agora,
  );
}

export async function excluirEvento(id: string) {
  await inicializarBanco();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await devolverItensPendentesDoEvento(id);
    await db.runAsync('DELETE FROM eventos WHERE id = ?', id);
  });
}

export async function associarItemAoEvento(eventoId: string, itemId: string, quantidade: number) {
  validarQuantidade(quantidade);
  await inicializarBanco();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const evento = await buscarEventoObrigatorio(eventoId);
    if (evento.status === 'concluido' || evento.status === 'cancelado') {
      throw new Error('Nao e possivel associar itens a eventos finalizados ou cancelados.');
    }

    const item = await buscarItemObrigatorio(itemId);
    const itemAtualizado = aplicarAssociacaoEvento(item, quantidade);

    await atualizarItem(itemAtualizado);
    await db.runAsync(
      `INSERT INTO itens_evento
        (id, evento_id, item_id, quantidade, devolvido, data_vinculo)
       VALUES (?, ?, ?, ?, 0, ?)`,
      gerarId('iev'),
      evento.id,
      item.id,
      quantidade,
      new Date().toISOString(),
    );
    await registrarMovimentacao({
      item,
      evento,
      tipo: 'saida',
      quantidade,
      observacao: `Saida vinculada ao evento ${evento.nome}`,
    });
  });
}

async function devolverItensPendentesDoEvento(eventoId: string) {
  const db = await getDatabase();
  const evento = await buscarEventoObrigatorio(eventoId);
  const vinculos = await db.getAllAsync<ItemEventoRow>(
    `SELECT itens_evento.*, itens.nome AS item_nome
       FROM itens_evento
       JOIN itens ON itens.id = itens_evento.item_id
      WHERE evento_id = ? AND devolvido = 0`,
    eventoId,
  );

  for (const vinculo of vinculos) {
    const item = await buscarItemObrigatorio(vinculo.item_id);
    const itemAtualizado = aplicarDevolucaoEvento(item, vinculo.quantidade);
    await atualizarItem(itemAtualizado);
    await db.runAsync('UPDATE itens_evento SET devolvido = 1 WHERE id = ?', vinculo.id);
    await registrarMovimentacao({
      item,
      evento,
      tipo: 'devolucao',
      quantidade: vinculo.quantidade,
      observacao: `Devolucao do evento ${evento.nome}`,
    });
  }
}

export async function finalizarEvento(eventoId: string) {
  await inicializarBanco();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await devolverItensPendentesDoEvento(eventoId);
    await db.runAsync(
      'UPDATE eventos SET status = ?, atualizado_em = ? WHERE id = ?',
      'concluido',
      new Date().toISOString(),
      eventoId,
    );
  });
}

export async function popularDadosExemplo() {
  await inicializarBanco();
  const db = await getDatabase();

  const existente = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM itens');
  if ((existente?.total ?? 0) > 0) {
    throw new Error('Os dados de exemplo so podem ser carregados com o estoque vazio.');
  }

  const itens: ItemEstoqueInput[] = [
    {
      nome: 'Refletor PAR LED',
      categoria: 'iluminacao',
      quantidadeTotal: 12,
      quantidadeDisponivel: 12,
      status: 'disponivel',
      observacao: 'Equipamento principal para iluminacao de palco.',
    },
    {
      nome: 'Cabo XLR 10m',
      categoria: 'cabos',
      quantidadeTotal: 20,
      quantidadeDisponivel: 20,
      status: 'disponivel',
      observacao: 'Cabos revisados para eventos.',
    },
    {
      nome: 'Painel de LED P3',
      categoria: 'paineis_led',
      quantidadeTotal: 6,
      quantidadeDisponivel: 5,
      status: 'disponivel',
      observacao: 'Um modulo reservado para manutencao preventiva.',
    },
    {
      nome: 'Trave de aluminio',
      categoria: 'estruturas',
      quantidadeTotal: 4,
      quantidadeDisponivel: 2,
      status: 'em_uso',
      observacao: 'Estrutura para montagem de palco.',
    },
  ];

  const eventos: EventoInput[] = [
    {
      nome: 'Casamento Jardim',
      cliente: 'Cliente demonstracao',
      data: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
      local: 'Espaco Jardim',
      descricao: 'Evento social com iluminacao e painel de LED.',
      status: 'planejado',
    },
    {
      nome: 'Show Corporativo',
      cliente: 'Empresa parceira',
      data: new Date(Date.now() + 86400000 * 12).toISOString().slice(0, 10),
      local: 'Centro de convencoes',
      descricao: 'Montagem completa de palco e estruturas.',
      status: 'planejado',
    },
  ];

  for (const item of itens) {
    await salvarItem(item);
  }

  for (const evento of eventos) {
    await salvarEvento(evento);
  }
}
