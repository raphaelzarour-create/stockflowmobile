import {
  aplicarAssociacaoEvento,
  aplicarDevolucaoEvento,
  aplicarMovimentacaoEstoque,
  calcularResumoEstoque,
  validarEvento,
  validarItemEstoque,
} from '@/services/regrasEstoque';
import type { Evento, EventoInput, ItemEstoque, ItemEstoqueInput } from '@/types/dominio';

function criarItem(overrides: Partial<ItemEstoque> = {}): ItemEstoque {
  return {
    id: 'item_1',
    nome: 'Refletor PAR LED',
    categoria: 'iluminacao',
    quantidadeTotal: 10,
    quantidadeDisponivel: 10,
    status: 'disponivel',
    observacao: '',
    dataCadastro: '2026-06-01T00:00:00.000Z',
    atualizadoEm: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function criarEvento(overrides: Partial<Evento> = {}): Evento {
  return {
    id: 'evt_1',
    nome: 'Casamento Jardim',
    cliente: 'Cliente teste',
    data: '2026-06-10',
    local: 'Espaco Jardim',
    descricao: '',
    status: 'planejado',
    criadoEm: '2026-06-01T00:00:00.000Z',
    atualizadoEm: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('regras de estoque', () => {
  it('valida campos obrigatorios e quantidades do cadastro de item', () => {
    const input: ItemEstoqueInput = {
      nome: '',
      categoria: 'cabos',
      quantidadeTotal: 2,
      quantidadeDisponivel: 3,
      status: 'disponivel',
      observacao: '',
    };

    expect(validarItemEstoque(input)).toEqual([
      'Informe o nome do item.',
      'A quantidade disponivel nao pode ser maior que a quantidade total.',
    ]);
  });

  it('registra entrada aumentando total e disponibilidade', () => {
    const item = criarItem({ quantidadeTotal: 5, quantidadeDisponivel: 2 });

    const atualizado = aplicarMovimentacaoEstoque(item, 'entrada', 3);

    expect(atualizado.quantidadeTotal).toBe(8);
    expect(atualizado.quantidadeDisponivel).toBe(5);
    expect(atualizado.status).toBe('disponivel');
  });

  it('registra saida sem permitir quantidade acima do disponivel', () => {
    const item = criarItem({ quantidadeTotal: 5, quantidadeDisponivel: 2 });

    expect(aplicarMovimentacaoEstoque(item, 'saida', 2).quantidadeDisponivel).toBe(0);
    expect(() => aplicarMovimentacaoEstoque(item, 'saida', 3)).toThrow(
      'Nao ha quantidade disponivel suficiente para registrar a saida.',
    );
  });

  it('valida criacao de evento com campos obrigatorios', () => {
    const input: EventoInput = {
      nome: '',
      cliente: '',
      data: '',
      local: '',
      descricao: '',
      status: 'planejado',
    };

    expect(validarEvento(input)).toEqual([
      'Informe o nome do evento.',
      'Informe o cliente do evento.',
      'Informe a data do evento.',
      'Informe o local do evento.',
    ]);
  });

  it('associa item ao evento reduzindo a disponibilidade', () => {
    const item = criarItem({ quantidadeTotal: 10, quantidadeDisponivel: 6 });

    const atualizado = aplicarAssociacaoEvento(item, 4);

    expect(atualizado.quantidadeDisponivel).toBe(2);
    expect(atualizado.status).toBe('disponivel');
  });

  it('devolve itens ao finalizar evento sem ultrapassar o total', () => {
    const item = criarItem({ quantidadeTotal: 10, quantidadeDisponivel: 8, status: 'em_uso' });

    const atualizado = aplicarDevolucaoEvento(item, 5);

    expect(atualizado.quantidadeDisponivel).toBe(10);
    expect(atualizado.status).toBe('disponivel');
  });

  it('calcula resumo do dashboard com alertas e proximos eventos', () => {
    const itens = [
      criarItem({ id: 'item_1', quantidadeTotal: 10, quantidadeDisponivel: 10 }),
      criarItem({ id: 'item_2', nome: 'Cabo XLR', quantidadeTotal: 10, quantidadeDisponivel: 1 }),
    ];
    const eventos = [
      criarEvento({ id: 'evt_1', data: '2999-01-10', status: 'planejado' }),
      criarEvento({ id: 'evt_2', data: '2999-02-10', status: 'concluido' }),
    ];

    const resumo = calcularResumoEstoque(itens, eventos);

    expect(resumo.totalItensCadastrados).toBe(2);
    expect(resumo.quantidadeTotal).toBe(20);
    expect(resumo.quantidadeDisponivel).toBe(11);
    expect(resumo.quantidadeEmUso).toBe(9);
    expect(resumo.alertasEstoqueBaixo).toHaveLength(1);
    expect(resumo.proximosEventos).toHaveLength(1);
  });
});
