import { StyleSheet, Text, View } from 'react-native';

import { CampoTexto } from '@/components/CampoTexto';
import { EmptyState } from '@/components/EmptyState';
import { SeletorSegmentado } from '@/components/SeletorSegmentado';
import { tipoMovimentacaoLabels } from '@/constants/opcoes';
import { colors, radius, spacing } from '@/constants/tema';
import type { StockFlowController } from '@/hooks/useStockFlow';
import { tiposMovimentacao } from '@/types/dominio';
import type { TipoMovimentacao } from '@/types/dominio';
import { formatarDataHora, normalizarTexto } from '@/utils/formatadores';
import { useMemo, useState } from 'react';

type TipoFiltro = TipoMovimentacao | 'todos';

interface HistoricoScreenProps {
  controller: StockFlowController;
}

export function HistoricoScreen({ controller }: HistoricoScreenProps) {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos');

  const movimentacoes = useMemo(() => {
    const termo = normalizarTexto(busca);

    return controller.dados.movimentacoes.filter((movimentacao) => {
      const atendeTipo = tipoFiltro === 'todos' || movimentacao.tipo === tipoFiltro;
      const textoBusca = normalizarTexto(
        `${movimentacao.itemNome} ${movimentacao.eventoNome} ${movimentacao.observacao}`,
      );
      const atendeBusca = termo.length === 0 || textoBusca.includes(termo);
      return atendeTipo && atendeBusca;
    });
  }, [busca, controller.dados.movimentacoes, tipoFiltro]);

  return (
    <View style={styles.tela}>
      <View style={styles.topoTexto}>
        <Text style={styles.titulo}>Historico</Text>
        <Text style={styles.subtitulo}>Acompanhe entradas, saidas, devolucoes e manutencoes.</Text>
      </View>

      <View style={styles.cardBusca}>
        <CampoTexto
          label="Buscar movimentacao"
          value={busca}
          onChangeText={setBusca}
          placeholder="Item, evento ou observacao"
          returnKeyType="search"
        />
        <SeletorSegmentado
          label="Tipo"
          valor={tipoFiltro}
          onChange={setTipoFiltro}
          opcoes={[
            { valor: 'todos', label: 'Todos' },
            ...tiposMovimentacao.map((tipo) => ({ valor: tipo, label: tipoMovimentacaoLabels[tipo] })),
          ]}
        />
      </View>

      <View style={styles.lista}>
        <View style={styles.linhaSecao}>
          <Text style={styles.secaoTitulo}>Movimentacoes</Text>
          <Text style={styles.contador}>{movimentacoes.length}</Text>
        </View>

        {movimentacoes.length === 0 ? (
          <EmptyState
            titulo="Sem movimentacoes"
            descricao="As alteracoes de estoque serao registradas automaticamente aqui."
            icone="time-outline"
          />
        ) : (
          movimentacoes.map((movimentacao) => (
            <View key={movimentacao.id} style={styles.movimentacaoCard}>
              <View style={styles.cardTopo}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitulo}>{movimentacao.itemNome}</Text>
                  <Text style={styles.cardDescricao}>
                    {tipoMovimentacaoLabels[movimentacao.tipo]} de {movimentacao.quantidade} unidade(s)
                  </Text>
                </View>
                <Text style={styles.tipoChip}>{tipoMovimentacaoLabels[movimentacao.tipo]}</Text>
              </View>
              {movimentacao.eventoNome ? (
                <Text style={styles.cardDescricao}>Evento: {movimentacao.eventoNome}</Text>
              ) : null}
              {movimentacao.observacao ? <Text style={styles.observacao}>{movimentacao.observacao}</Text> : null}
              <Text style={styles.dataPequena}>{formatarDataHora(movimentacao.data)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    gap: spacing.lg,
  },
  topoTexto: {
    gap: spacing.xs,
  },
  titulo: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardBusca: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  lista: {
    gap: spacing.md,
  },
  linhaSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secaoTitulo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  contador: {
    minWidth: 36,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  movimentacaoCard: {
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  cardTitulo: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cardDescricao: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  observacao: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  tipoChip: {
    overflow: 'hidden',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dataPequena: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
