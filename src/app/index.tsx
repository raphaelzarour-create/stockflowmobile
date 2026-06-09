import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/tema';
import { useStockFlow } from '@/hooks/useStockFlow';
import { abasPrincipais, type AbaId } from '@/navigation/abas';
import { ConfiguracoesScreen } from '@/screens/ConfiguracoesScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { EstoqueScreen } from '@/screens/EstoqueScreen';
import { EventosScreen } from '@/screens/EventosScreen';
import { HistoricoScreen } from '@/screens/HistoricoScreen';

export default function Home() {
  const controller = useStockFlow();
  const [abaAtual, setAbaAtual] = useState<AbaId>('inicio');

  const Conteudo = {
    inicio: <DashboardScreen controller={controller} />,
    estoque: <EstoqueScreen controller={controller} />,
    eventos: <EventosScreen controller={controller} />,
    historico: <HistoricoScreen controller={controller} />,
    configuracoes: <ConfiguracoesScreen controller={controller} />,
  }[abaAtual];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>StockFlow</Text>
          <Text style={styles.subtitle}>4K Leds e Eventos</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recarregar dados"
          onPress={controller.recarregar}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={20} color={colors.white} />
        </Pressable>
      </View>

      {controller.erro ? (
        <Pressable accessibilityRole="button" onPress={controller.limparMensagens} style={styles.messageError}>
          <Text style={styles.messageText}>{controller.erro}</Text>
        </Pressable>
      ) : null}
      {controller.sucesso ? (
        <Pressable accessibilityRole="button" onPress={controller.limparMensagens} style={styles.messageSuccess}>
          <Text style={styles.messageText}>{controller.sucesso}</Text>
        </Pressable>
      ) : null}

      {controller.carregando && controller.dados.itens.length === 0 && controller.dados.eventos.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Carregando dados locais...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {Conteudo}
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        {abasPrincipais.map((aba) => {
          const selected = aba.id === abaAtual;
          return (
            <Pressable
              key={aba.id}
              accessibilityRole="tab"
              accessibilityLabel={`Abrir aba ${aba.titulo}`}
              accessibilityState={{ selected }}
              onPress={() => setAbaAtual(aba.id)}
              style={[styles.tabButton, selected && styles.tabButtonSelected]}
            >
              <Ionicons name={aba.icone} size={21} color={selected ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabText, selected && styles.tabTextSelected]} numberOfLines={1}>
                {aba.titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 88,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#C9D7E3',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#31536E',
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabButton: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
  },
  tabButtonSelected: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  tabTextSelected: {
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  messageError: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  messageSuccess: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
