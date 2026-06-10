import { useCallback, useEffect, useMemo, useState } from 'react';

import { calcularResumoEstoque } from '@/services/regrasEstoque';
import {
  associarItemAoEvento,
  carregarDados,
  excluirEvento,
  excluirItem,
  finalizarEvento,
  registrarMovimentacaoManual,
  salvarEvento,
  salvarItem,
} from '@/storage/repositorioStockFlow';
import type {
  EventoInput,
  ItemEstoqueInput,
  StockFlowData,
  TipoMovimentacao,
} from '@/types/dominio';

const dadosIniciais: StockFlowData = {
  itens: [],
  eventos: [],
  itensEvento: [],
  movimentacoes: [],
};

export function useStockFlow() {
  const [dados, setDados] = useState<StockFlowData>(dadosIniciais);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dadosAtualizados = await carregarDados();
      setDados(dadosAtualizados);
      setErro('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar os dados.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const executar = useCallback(
    async (acao: () => Promise<void>, mensagemSucesso: string) => {
      setSalvando(true);
      setErro('');
      setSucesso('');
      try {
        await acao();
        await recarregar();
        setSucesso(mensagemSucesso);
        return true;
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Nao foi possivel concluir a operacao.');
        return false;
      } finally {
        setSalvando(false);
      }
    },
    [recarregar],
  );

  const resumo = useMemo(() => calcularResumoEstoque(dados.itens, dados.eventos), [dados.eventos, dados.itens]);

  return {
    dados,
    resumo,
    carregando,
    salvando,
    erro,
    sucesso,
    limparMensagens: () => {
      setErro('');
      setSucesso('');
    },
    recarregar,
    salvarItem: (input: ItemEstoqueInput, id?: string) =>
      executar(() => salvarItem(input, id), id ? 'Item atualizado com sucesso.' : 'Item cadastrado com sucesso.'),
    excluirItem: (id: string) => executar(() => excluirItem(id), 'Item excluido com sucesso.'),
    registrarMovimentacao: (itemId: string, tipo: TipoMovimentacao, quantidade: number, observacao: string) =>
      executar(
        () => registrarMovimentacaoManual(itemId, tipo, quantidade, observacao),
        'Movimentacao registrada com sucesso.',
      ),
    salvarEvento: (input: EventoInput, id?: string) =>
      executar(() => salvarEvento(input, id), id ? 'Evento atualizado com sucesso.' : 'Evento criado com sucesso.'),
    excluirEvento: (id: string) => executar(() => excluirEvento(id), 'Evento excluido com sucesso.'),
    associarItemAoEvento: (eventoId: string, itemId: string, quantidade: number) =>
      executar(() => associarItemAoEvento(eventoId, itemId, quantidade), 'Item associado ao evento.'),
    finalizarEvento: (eventoId: string) =>
      executar(() => finalizarEvento(eventoId), 'Evento finalizado e itens devolvidos ao estoque.'),
  };
}

export type StockFlowController = ReturnType<typeof useStockFlow>;
