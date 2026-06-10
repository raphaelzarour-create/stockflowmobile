import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { EmptyState } from '@/components/EmptyState';
import { SeletorSegmentado } from '@/components/SeletorSegmentado';
import { StatusBadge } from '@/components/StatusBadge';
import { categoriaLabels, statusItemLabels, tipoMovimentacaoLabels } from '@/constants/opcoes';
import { colors, radius, spacing } from '@/constants/tema';
import type { StockFlowController } from '@/hooks/useStockFlow';
import { categoriasItem, statusItem, tiposMovimentacao } from '@/types/dominio';
import type { CategoriaItem, ItemEstoque, ItemEstoqueInput, StatusItem, TipoMovimentacao } from '@/types/dominio';
import { formatarData, normalizarTexto } from '@/utils/formatadores';

type CategoriaFiltro = CategoriaItem | 'todas';
type StatusFiltro = StatusItem | 'todos';

interface EstoqueScreenProps {
  controller: StockFlowController;
  abrirCadastroToken?: number;
}

interface ItemFormState {
  nome: string;
  categoria: CategoriaItem;
  quantidadeTotal: string;
  quantidadeDisponivel: string;
  status: StatusItem;
  observacao: string;
}

const itemFormInicial: ItemFormState = {
  nome: '',
  categoria: 'iluminacao',
  quantidadeTotal: '',
  quantidadeDisponivel: '',
  status: 'disponivel',
  observacao: '',
};

export function EstoqueScreen({ controller, abrirCadastroToken = 0 }: EstoqueScreenProps) {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaFiltro>('todas');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');
  const [formAberto, setFormAberto] = useState(false);
  const [itemEditandoId, setItemEditandoId] = useState<string | undefined>();
  const [form, setForm] = useState<ItemFormState>(itemFormInicial);
  const [movimentoItemId, setMovimentoItemId] = useState('');
  const [movimentoTipo, setMovimentoTipo] = useState<TipoMovimentacao>('saida');
  const [movimentoQuantidade, setMovimentoQuantidade] = useState('1');
  const [movimentoObservacao, setMovimentoObservacao] = useState('');

  const itensFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return controller.dados.itens.filter((item) => {
      const atendeBusca = termo.length === 0 || normalizarTexto(item.nome).includes(termo);
      const atendeCategoria = categoriaFiltro === 'todas' || item.categoria === categoriaFiltro;
      const atendeStatus = statusFiltro === 'todos' || item.status === statusFiltro;
      return atendeBusca && atendeCategoria && atendeStatus;
    });
  }, [busca, categoriaFiltro, controller.dados.itens, statusFiltro]);

  const itemMovimento = controller.dados.itens.find((item) => item.id === movimentoItemId);

  useEffect(() => {
    if (abrirCadastroToken > 0) {
      abrirNovoItem();
    }
  }, [abrirCadastroToken]);

  function abrirNovoItem() {
    setForm(itemFormInicial);
    setItemEditandoId(undefined);
    setFormAberto(true);
  }

  function abrirEdicao(item: ItemEstoque) {
    setForm({
      nome: item.nome,
      categoria: item.categoria,
      quantidadeTotal: String(item.quantidadeTotal),
      quantidadeDisponivel: String(item.quantidadeDisponivel),
      status: item.status,
      observacao: item.observacao,
    });
    setItemEditandoId(item.id);
    setFormAberto(true);
  }

  async function salvarFormulario() {
    const input: ItemEstoqueInput = {
      nome: form.nome,
      categoria: form.categoria,
      quantidadeTotal: lerQuantidade(form.quantidadeTotal),
      quantidadeDisponivel: lerQuantidade(form.quantidadeDisponivel),
      status: form.status,
      observacao: form.observacao,
    };

    const sucesso = await controller.salvarItem(input, itemEditandoId);
    if (sucesso) {
      setForm(itemFormInicial);
      setItemEditandoId(undefined);
      setFormAberto(false);
    }
  }

  function confirmarExclusao(item: ItemEstoque) {
    Alert.alert('Excluir item', `Deseja excluir "${item.nome}" do estoque?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void controller.excluirItem(item.id);
        },
      },
    ]);
  }

  function abrirMovimentacao(item: ItemEstoque) {
    setMovimentoItemId(item.id);
    setMovimentoTipo('saida');
    setMovimentoQuantidade('1');
    setMovimentoObservacao('');
  }

  async function registrarMovimentacao() {
    if (!movimentoItemId) {
      return;
    }

    const sucesso = await controller.registrarMovimentacao(
      movimentoItemId,
      movimentoTipo,
      lerQuantidade(movimentoQuantidade),
      movimentoObservacao,
    );

    if (sucesso) {
      setMovimentoItemId('');
      setMovimentoQuantidade('1');
      setMovimentoObservacao('');
    }
  }

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <View style={styles.topoTexto}>
          <Text style={styles.titulo}>Produtos</Text>
          <Text style={styles.subtitulo}>Cadastre produtos e equipamentos usados nos eventos.</Text>
        </View>
        <Botao titulo="Cadastrar" icone="add-outline" onPress={abrirNovoItem} style={styles.botaoNovo} />
      </View>

      <View style={styles.cardBusca}>
        <CampoTexto
          label="Buscar produto"
          value={busca}
          onChangeText={setBusca}
          placeholder="Ex: refletor, cabo, painel"
          returnKeyType="search"
        />
        <SeletorSegmentado
          label="Categoria"
          valor={categoriaFiltro}
          onChange={setCategoriaFiltro}
          opcoes={[
            { valor: 'todas', label: 'Todas' },
            ...categoriasItem.map((categoria) => ({ valor: categoria, label: categoriaLabels[categoria] })),
          ]}
        />
        <SeletorSegmentado
          label="Status"
          valor={statusFiltro}
          onChange={setStatusFiltro}
          opcoes={[
            { valor: 'todos', label: 'Todos' },
            ...statusItem.map((status) => ({ valor: status, label: statusItemLabels[status] })),
          ]}
        />
      </View>

      {formAberto ? (
        <View style={styles.formCard}>
          <View style={styles.linhaTituloCard}>
            <Text style={styles.cardTitulo}>{itemEditandoId ? 'Editar produto' : 'Novo produto'}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar formulario de item"
              onPress={() => setFormAberto(false)}
              style={styles.iconeBotao}
            >
              <Ionicons name="close-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <CampoTexto
            label="Nome do produto"
            value={form.nome}
            onChangeText={(nome) => setForm((atual) => ({ ...atual, nome }))}
            placeholder="Ex: Refletor PAR LED"
          />
          <SeletorSegmentado
            label="Categoria"
            valor={form.categoria}
            onChange={(categoria) => setForm((atual) => ({ ...atual, categoria }))}
            opcoes={categoriasItem.map((categoria) => ({ valor: categoria, label: categoriaLabels[categoria] }))}
          />
          <View style={styles.duasColunas}>
            <CampoTexto
              label="Quantidade total"
              value={form.quantidadeTotal}
              onChangeText={(quantidadeTotal) =>
                setForm((atual) => ({ ...atual, quantidadeTotal: apenasDigitos(quantidadeTotal) }))
              }
              keyboardType="number-pad"
              placeholder="0"
              containerStyle={styles.campoFlex}
            />
            <CampoTexto
              label="Disponível"
              value={form.quantidadeDisponivel}
              onChangeText={(quantidadeDisponivel) =>
                setForm((atual) => ({ ...atual, quantidadeDisponivel: apenasDigitos(quantidadeDisponivel) }))
              }
              keyboardType="number-pad"
              placeholder="0"
              containerStyle={styles.campoFlex}
            />
          </View>
          <SeletorSegmentado
            label="Estado"
            valor={form.status}
            onChange={(status) => setForm((atual) => ({ ...atual, status }))}
            opcoes={statusItem.map((status) => ({ valor: status, label: statusItemLabels[status] }))}
          />
          <CampoTexto
            label="Observacao"
            value={form.observacao}
            onChangeText={(observacao) => setForm((atual) => ({ ...atual, observacao }))}
            placeholder="Observações rápidas para a equipe"
            multiline
            style={styles.textArea}
          />
          <Botao
            titulo={itemEditandoId ? 'Salvar alterações' : 'Cadastrar produto'}
            icone="save-outline"
            onPress={() => void salvarFormulario()}
            desabilitado={controller.salvando}
          />
        </View>
      ) : null}

      {itemMovimento ? (
        <View style={styles.formCard}>
          <View style={styles.linhaTituloCard}>
            <View style={styles.flex}>
              <Text style={styles.cardTitulo}>Movimentar estoque</Text>
              <Text style={styles.cardDescricao}>{itemMovimento.nome}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar movimentacao"
              onPress={() => setMovimentoItemId('')}
              style={styles.iconeBotao}
            >
              <Ionicons name="close-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <SeletorSegmentado
            label="Tipo"
            valor={movimentoTipo}
            onChange={setMovimentoTipo}
            opcoes={tiposMovimentacao.map((tipo) => ({ valor: tipo, label: tipoMovimentacaoLabels[tipo] }))}
          />
          <CampoTexto
            label="Quantidade"
            value={movimentoQuantidade}
            onChangeText={(quantidade) => setMovimentoQuantidade(apenasDigitos(quantidade))}
            keyboardType="number-pad"
            placeholder="1"
          />
          <CampoTexto
            label="Observacao"
            value={movimentoObservacao}
            onChangeText={setMovimentoObservacao}
            placeholder="Ex: saiu para manutencao"
          />
          <Botao
            titulo="Registrar movimentacao"
            icone="swap-horizontal-outline"
            onPress={() => void registrarMovimentacao()}
            desabilitado={controller.salvando}
          />
        </View>
      ) : null}

      <View style={styles.lista}>
        <View style={styles.linhaSecao}>
          <Text style={styles.secaoTitulo}>Produtos cadastrados</Text>
          <Text style={styles.contador}>{itensFiltrados.length}</Text>
        </View>
        {itensFiltrados.length === 0 ? (
          <EmptyState
            titulo="Nenhum produto encontrado"
            descricao="Cadastre um produto ou limpe os filtros para visualizar o estoque."
            icone="cube-outline"
          />
        ) : (
          itensFiltrados.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEditar={() => abrirEdicao(item)}
              onExcluir={() => confirmarExclusao(item)}
              onMovimentar={() => abrirMovimentacao(item)}
            />
          ))
        )}
      </View>
    </View>
  );
}

function ItemCard({
  item,
  onEditar,
  onExcluir,
  onMovimentar,
}: {
  item: ItemEstoque;
  onEditar: () => void;
  onExcluir: () => void;
  onMovimentar: () => void;
}) {
  const percentual = item.quantidadeTotal <= 0 ? 0 : item.quantidadeDisponivel / item.quantidadeTotal;

  return (
    <View style={styles.itemCard}>
      <View style={styles.cardTopo}>
        <View style={styles.flex}>
          <Text style={styles.cardTitulo}>{item.nome}</Text>
          <Text style={styles.cardDescricao}>{categoriaLabels[item.categoria]}</Text>
        </View>
        <StatusBadge tipo="item" status={item.status} />
      </View>

      <View style={styles.disponibilidadeBox}>
        <View style={styles.disponibilidadeLinha}>
          <Text style={styles.disponibilidadeTexto}>Disponível</Text>
          <Text style={styles.disponibilidadeNumero}>
            {item.quantidadeDisponivel}/{item.quantidadeTotal}
          </Text>
        </View>
        <View style={styles.barraFundo}>
          <View style={[styles.barraValor, { width: `${Math.max(0, Math.min(1, percentual)) * 100}%` }]} />
        </View>
      </View>

      {item.observacao ? <Text style={styles.observacao}>{item.observacao}</Text> : null}
      <Text style={styles.dataPequena}>Cadastro: {formatarData(item.dataCadastro)}</Text>

      <View style={styles.acoesLinha}>
        <Botao titulo="Movimentar" icone="swap-horizontal-outline" variante="secundario" onPress={onMovimentar} />
        <Botao titulo="Editar" icone="create-outline" variante="fantasma" onPress={onEditar} />
        <Botao titulo="Excluir" icone="trash-outline" variante="perigo" onPress={onExcluir} />
      </View>
    </View>
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
  itemCard: {
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
  disponibilidadeBox: {
    gap: spacing.sm,
  },
  disponibilidadeLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  disponibilidadeTexto: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  disponibilidadeNumero: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  barraFundo: {
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  barraValor: {
    height: '100%',
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  observacao: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  dataPequena: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  acoesLinha: {
    gap: spacing.sm,
  },
});
