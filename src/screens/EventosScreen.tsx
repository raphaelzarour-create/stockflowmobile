import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { EmptyState } from '@/components/EmptyState';
import { SeletorSegmentado } from '@/components/SeletorSegmentado';
import { StatusBadge } from '@/components/StatusBadge';
import { statusEventoLabels } from '@/constants/opcoes';
import { colors, radius, spacing } from '@/constants/tema';
import type { StockFlowController } from '@/hooks/useStockFlow';
import { statusEvento } from '@/types/dominio';
import type { Evento, EventoInput, ItemEstoque, ItemEvento, StatusEvento } from '@/types/dominio';
import { formatarData, hojeIso, normalizarTexto } from '@/utils/formatadores';

type StatusEventoFiltro = StatusEvento | 'todos';

interface EventosScreenProps {
  controller: StockFlowController;
}

interface EventoFormState {
  nome: string;
  cliente: string;
  data: string;
  local: string;
  descricao: string;
  status: StatusEvento;
}

function criarEventoFormInicial(): EventoFormState {
  return {
    nome: '',
    cliente: '',
    data: hojeIso(),
    local: '',
    descricao: '',
    status: 'planejado',
  };
}

export function EventosScreen({ controller }: EventosScreenProps) {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusEventoFiltro>('todos');
  const [formAberto, setFormAberto] = useState(false);
  const [eventoEditandoId, setEventoEditandoId] = useState<string | undefined>();
  const [form, setForm] = useState<EventoFormState>(criarEventoFormInicial);
  const [eventoAssociacaoId, setEventoAssociacaoId] = useState('');
  const [itemAssociacaoId, setItemAssociacaoId] = useState('');
  const [quantidadeAssociacao, setQuantidadeAssociacao] = useState('1');

  const eventosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return controller.dados.eventos.filter((evento) => {
      const textoBusca = normalizarTexto(`${evento.nome} ${evento.cliente} ${evento.local} ${evento.data}`);
      const atendeBusca = termo.length === 0 || textoBusca.includes(termo);
      const atendeStatus = statusFiltro === 'todos' || evento.status === statusFiltro;
      return atendeBusca && atendeStatus;
    });
  }, [busca, controller.dados.eventos, statusFiltro]);

  const vinculosPorEvento = useMemo(() => {
    return controller.dados.itensEvento.reduce<Record<string, ItemEvento[]>>((acc, vinculo) => {
      acc[vinculo.eventoId] = [...(acc[vinculo.eventoId] ?? []), vinculo];
      return acc;
    }, {});
  }, [controller.dados.itensEvento]);

  const itensDisponiveis = controller.dados.itens.filter((item) => item.quantidadeDisponivel > 0);
  const eventoAssociacao = controller.dados.eventos.find((evento) => evento.id === eventoAssociacaoId);

  function abrirNovoEvento() {
    setForm(criarEventoFormInicial());
    setEventoEditandoId(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(evento: Evento) {
    setForm({
      nome: evento.nome,
      cliente: evento.cliente,
      data: evento.data,
      local: evento.local,
      descricao: evento.descricao,
      status: evento.status,
    });
    setEventoEditandoId(evento.id);
    setFormAberto(true);
  }

  async function salvarFormulario() {
    const input: EventoInput = {
      nome: form.nome,
      cliente: form.cliente,
      data: form.data,
      local: form.local,
      descricao: form.descricao,
      status: form.status,
    };

    const sucesso = await controller.salvarEvento(input, eventoEditandoId);
    if (sucesso) {
      setForm(criarEventoFormInicial());
      setEventoEditandoId(undefined);
      setFormAberto(false);
    }
  }

  function confirmarExclusao(evento: Evento) {
    Alert.alert('Excluir evento', `Deseja excluir "${evento.nome}"? Itens pendentes serao devolvidos.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void controller.excluirEvento(evento.id);
        },
      },
    ]);
  }

  function confirmarFinalizacao(evento: Evento) {
    Alert.alert('Finalizar evento', `Finalizar "${evento.nome}" e devolver os itens ao estoque?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: () => {
          void controller.finalizarEvento(evento.id);
        },
      },
    ]);
  }

  function abrirAssociacao(evento: Evento) {
    setEventoAssociacaoId(evento.id);
    setItemAssociacaoId(itensDisponiveis[0]?.id ?? '');
    setQuantidadeAssociacao('1');
  }

  async function associarItem() {
    if (!eventoAssociacaoId || !itemAssociacaoId) {
      return;
    }

    const sucesso = await controller.associarItemAoEvento(
      eventoAssociacaoId,
      itemAssociacaoId,
      lerQuantidade(quantidadeAssociacao),
    );

    if (sucesso) {
      setEventoAssociacaoId('');
      setItemAssociacaoId('');
      setQuantidadeAssociacao('1');
    }
  }

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <View style={styles.topoTexto}>
          <Text style={styles.titulo}>Eventos</Text>
          <Text style={styles.subtitulo}>Planeje eventos e reserve equipamentos disponiveis.</Text>
        </View>
        <Botao titulo="Novo" icone="add-outline" onPress={abrirNovoEvento} style={styles.botaoNovo} />
      </View>

      <View style={styles.cardBusca}>
        <CampoTexto
          label="Buscar evento"
          value={busca}
          onChangeText={setBusca}
          placeholder="Nome, cliente, local ou data"
          returnKeyType="search"
        />
        <SeletorSegmentado
          label="Status"
          valor={statusFiltro}
          onChange={setStatusFiltro}
          opcoes={[
            { valor: 'todos', label: 'Todos' },
            ...statusEvento.map((status) => ({ valor: status, label: statusEventoLabels[status] })),
          ]}
        />
      </View>

      {formAberto ? (
        <View style={styles.formCard}>
          <View style={styles.linhaTituloCard}>
            <Text style={styles.cardTitulo}>{eventoEditandoId ? 'Editar evento' : 'Novo evento'}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar formulario de evento"
              onPress={() => setFormAberto(false)}
              style={styles.iconeBotao}
            >
              <Ionicons name="close-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <CampoTexto
            label="Nome do evento"
            value={form.nome}
            onChangeText={(nome) => setForm((atual) => ({ ...atual, nome }))}
            placeholder="Ex: Casamento Jardim"
          />
          <CampoTexto
            label="Cliente"
            value={form.cliente}
            onChangeText={(cliente) => setForm((atual) => ({ ...atual, cliente }))}
            placeholder="Nome do cliente"
          />
          <View style={styles.duasColunas}>
            <CampoTexto
              label="Data"
              value={form.data}
              onChangeText={(data) => setForm((atual) => ({ ...atual, data }))}
              placeholder="AAAA-MM-DD"
              containerStyle={styles.campoFlex}
            />
            <CampoTexto
              label="Local"
              value={form.local}
              onChangeText={(local) => setForm((atual) => ({ ...atual, local }))}
              placeholder="Local"
              containerStyle={styles.campoFlex}
            />
          </View>
          <SeletorSegmentado
            label="Status"
            valor={form.status}
            onChange={(status) => setForm((atual) => ({ ...atual, status }))}
            opcoes={statusEvento.map((status) => ({ valor: status, label: statusEventoLabels[status] }))}
          />
          <CampoTexto
            label="Descricao"
            value={form.descricao}
            onChangeText={(descricao) => setForm((atual) => ({ ...atual, descricao }))}
            placeholder="Resumo rapido do evento"
            multiline
            style={styles.textArea}
          />
          <Botao
            titulo={eventoEditandoId ? 'Salvar alteracoes' : 'Criar evento'}
            icone="save-outline"
            onPress={() => void salvarFormulario()}
            desabilitado={controller.salvando}
          />
        </View>
      ) : null}

      {eventoAssociacao ? (
        <View style={styles.formCard}>
          <View style={styles.linhaTituloCard}>
            <View style={styles.flex}>
              <Text style={styles.cardTitulo}>Associar item</Text>
              <Text style={styles.cardDescricao}>{eventoAssociacao.nome}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar associacao de item"
              onPress={() => setEventoAssociacaoId('')}
              style={styles.iconeBotao}
            >
              <Ionicons name="close-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>

          {itensDisponiveis.length === 0 ? (
            <EmptyState
              titulo="Sem itens disponiveis"
              descricao="Cadastre ou devolva itens ao estoque antes de reservar equipamentos."
              icone="cube-outline"
            />
          ) : (
            <>
              <View style={styles.listaItensSelecao}>
                {itensDisponiveis.map((item) => (
                  <ItemSelecao
                    key={item.id}
                    item={item}
                    selecionado={item.id === itemAssociacaoId}
                    onPress={() => setItemAssociacaoId(item.id)}
                  />
                ))}
              </View>
              <CampoTexto
                label="Quantidade"
                value={quantidadeAssociacao}
                onChangeText={(quantidade) => setQuantidadeAssociacao(apenasDigitos(quantidade))}
                keyboardType="number-pad"
                placeholder="1"
              />
              <Botao
                titulo="Reservar para evento"
                icone="link-outline"
                onPress={() => void associarItem()}
                desabilitado={controller.salvando || !itemAssociacaoId}
              />
            </>
          )}
        </View>
      ) : null}

      <View style={styles.lista}>
        <View style={styles.linhaSecao}>
          <Text style={styles.secaoTitulo}>Eventos cadastrados</Text>
          <Text style={styles.contador}>{eventosFiltrados.length}</Text>
        </View>
        {eventosFiltrados.length === 0 ? (
          <EmptyState
            titulo="Nenhum evento encontrado"
            descricao="Crie um evento ou ajuste os filtros para ver a agenda."
            icone="calendar-outline"
          />
        ) : (
          eventosFiltrados.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              vinculos={vinculosPorEvento[evento.id] ?? []}
              onEditar={() => abrirEdicao(evento)}
              onExcluir={() => confirmarExclusao(evento)}
              onAssociar={() => abrirAssociacao(evento)}
              onFinalizar={() => confirmarFinalizacao(evento)}
            />
          ))
        )}
      </View>
    </View>
  );
}

function EventoCard({
  evento,
  vinculos,
  onEditar,
  onExcluir,
  onAssociar,
  onFinalizar,
}: {
  evento: Evento;
  vinculos: ItemEvento[];
  onEditar: () => void;
  onExcluir: () => void;
  onAssociar: () => void;
  onFinalizar: () => void;
}) {
  const podeAlterar = evento.status !== 'concluido' && evento.status !== 'cancelado';

  return (
    <View style={styles.eventoCard}>
      <View style={styles.cardTopo}>
        <View style={styles.flex}>
          <Text style={styles.cardTitulo}>{evento.nome}</Text>
          <Text style={styles.cardDescricao}>
            {formatarData(evento.data)} - {evento.local}
          </Text>
          <Text style={styles.cardDescricao}>Cliente: {evento.cliente}</Text>
        </View>
        <StatusBadge tipo="evento" status={evento.status} />
      </View>

      {evento.descricao ? <Text style={styles.observacao}>{evento.descricao}</Text> : null}

      <View style={styles.vinculosBox}>
        <Text style={styles.labelPequena}>Itens vinculados</Text>
        {vinculos.length === 0 ? (
          <Text style={styles.cardDescricao}>Nenhum item reservado ainda.</Text>
        ) : (
          vinculos.map((vinculo) => (
            <View key={vinculo.id} style={styles.vinculoLinha}>
              <Text style={styles.vinculoTexto}>{vinculo.itemNome}</Text>
              <Text style={styles.vinculoQuantidade}>
                {vinculo.quantidade}x {vinculo.devolvido ? 'devolvido' : 'reservado'}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.acoesLinha}>
        <Botao
          titulo="Itens"
          icone="link-outline"
          variante="secundario"
          onPress={onAssociar}
          desabilitado={!podeAlterar}
        />
        <Botao titulo="Editar" icone="create-outline" variante="fantasma" onPress={onEditar} />
        <Botao
          titulo="Finalizar"
          icone="checkmark-done-outline"
          variante="secundario"
          onPress={onFinalizar}
          desabilitado={!podeAlterar}
        />
        <Botao titulo="Excluir" icone="trash-outline" variante="perigo" onPress={onExcluir} />
      </View>
    </View>
  );
}

function ItemSelecao({ item, selecionado, onPress }: { item: ItemEstoque; selecionado: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Selecionar ${item.nome}`}
      accessibilityState={{ selected: selecionado }}
      onPress={onPress}
      style={[styles.itemSelecao, selecionado && styles.itemSelecaoAtivo]}
    >
      <Text style={[styles.itemSelecaoNome, selecionado && styles.itemSelecaoTextoAtivo]}>{item.nome}</Text>
      <Text style={[styles.itemSelecaoQtd, selecionado && styles.itemSelecaoTextoAtivo]}>
        {item.quantidadeDisponivel} disponiveis
      </Text>
    </Pressable>
  );
}

function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

function lerQuantidade(valor: string) {
  if (!valor.trim()) {
    return -1;
  }

  return Number.parseInt(valor, 10);
}

const styles = StyleSheet.create({
  tela: {
    gap: spacing.lg,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topoTexto: {
    flex: 1,
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
  botaoNovo: {
    minWidth: 96,
  },
  cardBusca: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  formCard: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  linhaTituloCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  iconeBotao: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  duasColunas: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  campoFlex: {
    flex: 1,
  },
  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
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
  eventoCard: {
    gap: spacing.md,
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
  vinculosBox: {
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  labelPequena: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  vinculoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  vinculoTexto: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  vinculoQuantidade: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  acoesLinha: {
    gap: spacing.sm,
  },
  listaItensSelecao: {
    gap: spacing.sm,
  },
  itemSelecao: {
    minHeight: 56,
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  itemSelecaoAtivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  itemSelecaoNome: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  itemSelecaoQtd: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  itemSelecaoTextoAtivo: {
    color: colors.white,
  },
});
