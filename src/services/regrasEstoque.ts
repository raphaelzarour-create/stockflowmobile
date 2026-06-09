import type {
  Evento,
  EventoInput,
  ItemEstoque,
  ItemEstoqueInput,
  ResumoEstoque,
  TipoMovimentacao,
} from '@/types/dominio';
import { hojeIso } from '@/utils/formatadores';

const ESTOQUE_BAIXO_ABSOLUTO = 2;
const ESTOQUE_BAIXO_PERCENTUAL = 0.2;

export function validarItemEstoque(input: ItemEstoqueInput) {
  const erros: string[] = [];

  if (!input.nome.trim()) {
    erros.push('Informe o nome do item.');
  }

  if (!Number.isInteger(input.quantidadeTotal) || input.quantidadeTotal < 0) {
    erros.push('A quantidade total deve ser um numero inteiro maior ou igual a zero.');
  }

  if (!Number.isInteger(input.quantidadeDisponivel) || input.quantidadeDisponivel < 0) {
    erros.push('A quantidade disponivel deve ser um numero inteiro maior ou igual a zero.');
  }

  if (input.quantidadeDisponivel > input.quantidadeTotal) {
    erros.push('A quantidade disponivel nao pode ser maior que a quantidade total.');
  }

  return erros;
}

export function validarEvento(input: EventoInput) {
  const erros: string[] = [];

  if (!input.nome.trim()) {
    erros.push('Informe o nome do evento.');
  }

  if (!input.cliente.trim()) {
    erros.push('Informe o cliente do evento.');
  }

  if (!input.data.trim()) {
    erros.push('Informe a data do evento.');
  }

  if (!input.local.trim()) {
    erros.push('Informe o local do evento.');
  }

  return erros;
}

export function validarQuantidade(quantidade: number) {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error('Informe uma quantidade inteira maior que zero.');
  }
}

export function resolverStatusPorDisponibilidade(
  quantidadeTotal: number,
  quantidadeDisponivel: number,
  tipo?: TipoMovimentacao,
) {
  if (tipo === 'manutencao') {
    return 'manutencao' as const;
  }

  if (tipo === 'danificado') {
    return 'danificado' as const;
  }

  if (quantidadeTotal > 0 && quantidadeDisponivel <= 0) {
    return 'em_uso' as const;
  }

  return 'disponivel' as const;
}

export function aplicarMovimentacaoEstoque(
  item: ItemEstoque,
  tipo: TipoMovimentacao,
  quantidade: number,
): ItemEstoque {
  validarQuantidade(quantidade);

  let quantidadeTotal = item.quantidadeTotal;
  let quantidadeDisponivel = item.quantidadeDisponivel;

  if (tipo === 'entrada') {
    quantidadeTotal += quantidade;
    quantidadeDisponivel += quantidade;
  }

  if (tipo === 'saida') {
    if (quantidade > quantidadeDisponivel) {
      throw new Error('Nao ha quantidade disponivel suficiente para registrar a saida.');
    }
    quantidadeDisponivel -= quantidade;
  }

  if (tipo === 'devolucao') {
    quantidadeDisponivel = Math.min(quantidadeTotal, quantidadeDisponivel + quantidade);
  }

  if (tipo === 'manutencao' || tipo === 'danificado') {
    if (quantidade > quantidadeDisponivel) {
      throw new Error('Nao ha quantidade disponivel suficiente para alterar o status.');
    }
    quantidadeDisponivel -= quantidade;
  }

  return {
    ...item,
    quantidadeTotal,
    quantidadeDisponivel,
    status: resolverStatusPorDisponibilidade(quantidadeTotal, quantidadeDisponivel, tipo),
    atualizadoEm: new Date().toISOString(),
  };
}

export function aplicarAssociacaoEvento(item: ItemEstoque, quantidade: number): ItemEstoque {
  validarQuantidade(quantidade);

  if (quantidade > item.quantidadeDisponivel) {
    throw new Error('O item selecionado nao possui quantidade disponivel suficiente.');
  }

  const quantidadeDisponivel = item.quantidadeDisponivel - quantidade;

  return {
    ...item,
    quantidadeDisponivel,
    status: resolverStatusPorDisponibilidade(item.quantidadeTotal, quantidadeDisponivel, 'saida'),
    atualizadoEm: new Date().toISOString(),
  };
}

export function aplicarDevolucaoEvento(item: ItemEstoque, quantidade: number): ItemEstoque {
  validarQuantidade(quantidade);

  const quantidadeDisponivel = Math.min(item.quantidadeTotal, item.quantidadeDisponivel + quantidade);

  return {
    ...item,
    quantidadeDisponivel,
    status: resolverStatusPorDisponibilidade(item.quantidadeTotal, quantidadeDisponivel, 'devolucao'),
    atualizadoEm: new Date().toISOString(),
  };
}

export function calcularResumoEstoque(itens: ItemEstoque[], eventos: Evento[]): ResumoEstoque {
  const hoje = hojeIso();
  const totalItensCadastrados = itens.length;
  const quantidadeTotal = itens.reduce((total, item) => total + item.quantidadeTotal, 0);
  const quantidadeDisponivel = itens.reduce((total, item) => total + item.quantidadeDisponivel, 0);
  const quantidadeEmUso = Math.max(0, quantidadeTotal - quantidadeDisponivel);

  const alertasEstoqueBaixo = itens.filter((item) => {
    if (item.quantidadeTotal === 0) {
      return true;
    }

    const percentual = item.quantidadeDisponivel / item.quantidadeTotal;
    return item.quantidadeDisponivel <= ESTOQUE_BAIXO_ABSOLUTO || percentual <= ESTOQUE_BAIXO_PERCENTUAL;
  });

  const proximosEventos = eventos
    .filter((evento) => evento.data >= hoje && evento.status !== 'concluido' && evento.status !== 'cancelado')
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3);

  const eventosAtivos = eventos.filter((evento) => evento.status === 'planejado' || evento.status === 'em_andamento')
    .length;

  return {
    totalItensCadastrados,
    quantidadeTotal,
    quantidadeDisponivel,
    quantidadeEmUso,
    alertasEstoqueBaixo,
    proximosEventos,
    eventosAtivos,
  };
}
