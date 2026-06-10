import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { colors, radius, spacing } from '@/constants/tema';

type Icone = ComponentProps<typeof Ionicons>['name'];

interface ConfiguracoesScreenProps {
  usuarioEmail: string;
  onSair: () => void;
}

export function ConfiguracoesScreen({ usuarioEmail, onSair }: ConfiguracoesScreenProps) {
  return (
    <View style={styles.tela}>
      <View style={styles.topoTexto}>
        <Text style={styles.titulo}>Informacoes</Text>
        <Text style={styles.subtitulo}>Dados essenciais do projeto StockFlow e da empresa parceira.</Text>
      </View>

      <CardInfo icone="business-outline" titulo="Empresa parceira">
        <LinhaInfo label="Nome" valor="4K Leds e Eventos" />
        <LinhaInfo label="Uso principal" valor="Controle operacional de estoque e eventos" />
        <LinhaInfo label="Perfil" valor="Equipe operacional e gerencial usando celular durante a rotina" />
      </CardInfo>

      <CardInfo icone="school-outline" titulo="Projeto de extensao">
        <LinhaInfo label="Aplicativo" valor="StockFlow" />
        <LinhaInfo label="Curso" valor="Analise e Desenvolvimento de Sistemas" />
        <LinhaInfo label="Foco" valor="Mobile-first, simples, acessivel e funcional para Android" />
      </CardInfo>

      <CardInfo icone="phone-portrait-outline" titulo="Criterios de usabilidade mobile">
        <ChecklistItem texto="Botoes grandes e com area de toque confortavel." />
        <ChecklistItem texto="Formularios curtos, com poucos campos por etapa." />
        <ChecklistItem texto="Listas em cards, sem tabelas extensas." />
        <ChecklistItem texto="Feedback visual apos salvar, excluir ou movimentar estoque." />
        <ChecklistItem texto="Fluxos principais funcionando apenas por toque." />
      </CardInfo>

      <CardInfo icone="server-outline" titulo="Banco de dados real">
        <Text style={styles.textoLongo}>
          Esta versao usa Supabase Auth e Postgres para manter itens, eventos, vinculos e historico em um banco
          compartilhado. As regras de acesso ficam protegidas por Row Level Security.
        </Text>
      </CardInfo>

      <CardInfo icone="person-circle-outline" titulo="Sessao">
        <LinhaInfo label="Usuario conectado" valor={usuarioEmail} />
        <Botao titulo="Sair" icone="log-out-outline" variante="fantasma" onPress={onSair} />
      </CardInfo>
    </View>
  );
}

function CardInfo({ icone, titulo, children }: { icone: Icone; titulo: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconeBox}>
          <Ionicons name={icone} size={20} color={colors.primary} />
        </View>
        <Text style={styles.cardTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function LinhaInfo({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.linhaInfo}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

function ChecklistItem({ texto }: { texto: string }) {
  return (
    <View style={styles.checkLinha}>
      <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} />
      <Text style={styles.checkTexto}>{texto}</Text>
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
  card: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconeBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  cardTitulo: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  linhaInfo: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  valor: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  textoLongo: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  checkLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkTexto: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
