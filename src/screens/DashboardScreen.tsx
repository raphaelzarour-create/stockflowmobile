import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { categoriaLabels, tipoMovimentacaoLabels } from '@/constants/opcoes';
import { colors, radius, spacing } from '@/constants/tema';
import type { StockFlowController } from '@/hooks/useStockFlow';
import { formatarData, formatarDataHora } from '@/utils/formatadores';

type Icone = ComponentProps<typeof Ionicons>['name'];

interface DashboardScreenProps {
  controller: StockFlowController;
}

export function DashboardScreen({ controller }: DashboardScreenProps) {
  const { resumo, dados } = controller;

  return (
    <View style={styles.tela}>
      <View style={styles.blocoHero}>
        <Text style={styles.heroTitulo}>Controle rapido do estoque</Text>
        <Text style={styles.heroTexto}>
          Consulte disponibilidade, eventos e alertas antes de separar os equipamentos.
        </Text>
        <Botao
          titulo="Carregar dados de exemplo"
          icone="sparkles-outline"
          variante="secundario"
          onPress={controller.popularDadosExemplo}
          desabilitado={controller.salvando || dados.itens.length > 0}
        />
      </View>

      <View style={styles.metricGrid}>
        <CardMetrica
          icone="cube-outline"
          label="Itens"
          valor={String(resumo.totalItensCadastrados)}
          detalhe={`${resumo.quantidadeTotal} unidades`}
        />
        <CardMetrica
          icone="checkmark-circle-outline"
          label="Disponiveis"
          valor={String(resumo.quantidadeDisponivel)}
          detalhe="prontos para uso"
        />
        <CardMetrica
          icone="construct-outline"
          label="Em uso"
          valor={String(resumo.quantidadeEmUso)}
          detalhe="separados ou fora"
        />
        <CardMetrica
          icone="calendar-outline"
          label="Eventos"
          valor={String(resumo.eventosAtivos)}
          detalhe="ativos"
        />
      </View>

      <Secao titulo="Proximos eventos" icone="calendar-number-outline">
        {resumo.proximosEventos.length === 0 ? (
          <EmptyState
            titulo="Nenhum evento proximo"
            descricao="Crie eventos para planejar os equipamentos antes da montagem."
            icone="calendar-outline"
          />
        ) : (
          resumo.proximosEventos.map((evento) => (
            <View key={evento.id} style={styles.card}>
              <View style={styles.cardTopo}>
                <View style={styles.cardTexto}>
                  <Text style={styles.cardTitulo}>{evento.nome}</Text>
                  <Text style={styles.cardDescricao}>
                    {formatarData(evento.data)} - {evento.local}
                  </Text>
                  <Text style={styles.cardDescricao}>Cliente: {evento.cliente}</Text>
                </View>
                <StatusBadge tipo="evento" status={evento.status} />
              </View>
            </View>
          ))
        )}
      </Secao>

      <Secao titulo="Alertas de estoque" icone="warning-outline">
        {resumo.alertasEstoqueBaixo.length === 0 ? (
          <EmptyState
            titulo="Sem alertas"
            descricao="Os itens cadastrados possuem quantidade suficiente no momento."
            icone="shield-checkmark-outline"
          />
        ) : (
          resumo.alertasEstoqueBaixo.slice(0, 4).map((item) => (
            <View key={item.id} style={styles.alertaCard}>
              <View style={styles.alertaIcone}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
              </View>
              <View style={styles.cardTexto}>
                <Text style={styles.cardTitulo}>{item.nome}</Text>
                <Text style={styles.cardDescricao}>
                  {categoriaLabels[item.categoria]} - {item.quantidadeDisponivel}/{item.quantidadeTotal} disponiveis
                </Text>
              </View>
            </View>
          ))
        )}
      </Secao>

      <Secao titulo="Ultimas movimentacoes" icone="time-outline">
        {dados.movimentacoes.length === 0 ? (
          <EmptyState
            titulo="Historico vazio"
            descricao="As entradas, saidas e devolucoes aparecem aqui automaticamente."
            icone="reader-outline"
          />
        ) : (
          dados.movimentacoes.slice(0, 5).map((movimentacao) => (
            <View key={movimentacao.id} style={styles.card}>
              <Text style={styles.cardTitulo}>{movimentacao.itemNome}</Text>
              <Text style={styles.cardDescricao}>
                {tipoMovimentacaoLabels[movimentacao.tipo]} de {movimentacao.quantidade} unidade(s)
              </Text>
              <Text style={styles.dataPequena}>{formatarDataHora(movimentacao.data)}</Text>
            </View>
          ))
        )}
      </Secao>
    </View>
  );
}

function CardMetrica({
  icone,
  label,
  valor,
  detalhe,
}: {
  icone: Icone;
  label: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <View style={styles.metricaCard}>
      <View style={styles.metricaIcone}>
        <Ionicons name={icone} size={20} color={colors.primary} />
      </View>
      <Text style={styles.metricaValor}>{valor}</Text>
      <Text style={styles.metricaLabel}>{label}</Text>
      <Text style={styles.metricaDetalhe}>{detalhe}</Text>
    </View>
  );
}

function Secao({ titulo, icone, children }: { titulo: string; icone: Icone; children: ReactNode }) {
  return (
    <View style={styles.secao}>
      <View style={styles.secaoTituloLinha}>
        <Ionicons name={icone} size={19} color={colors.primary} />
        <Text style={styles.secaoTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    gap: spacing.lg,
  },
  blocoHero: {
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  heroTitulo: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  heroTexto: {
    color: '#D9E7F2',
    fontSize: 15,
    lineHeight: 21,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricaCard: {
    width: '47%',
    minHeight: 142,
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  metricaIcone: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  metricaValor: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  metricaLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  metricaDetalhe: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  secao: {
    gap: spacing.md,
  },
  secaoTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secaoTitulo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  card: {
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
  cardTexto: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitulo: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  cardDescricao: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  alertaCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F8D7A4',
    backgroundColor: '#FFF8ED',
    padding: spacing.md,
  },
  alertaIcone: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: '#FEF3C7',
  },
  dataPequena: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
