import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { LogoEmpresa } from '@/components/LogoEmpresa';
import { appConfig } from '@/constants/app';
import { colors, radius, spacing } from '@/constants/tema';

interface LoginScreenProps {
  onEntrar: (usuario: { nome: string; email: string }) => void;
}

export function LoginScreen({ onEntrar }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function entrar() {
    const emailNormalizado = email.trim().toLowerCase();
    if (!emailNormalizado || !senha.trim()) {
      setErro('Informe e-mail e senha para acessar o StockFlow.');
      return;
    }

    if (!emailNormalizado.includes('@')) {
      setErro('Informe um e-mail valido.');
      return;
    }

    setErro('');
    onEntrar({
      nome: emailNormalizado.split('@')[0],
      email: emailNormalizado,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <LogoEmpresa />
            <Text style={styles.appName}>{appConfig.nome}</Text>
            <Text style={styles.heroTexto}>Controle de estoque e eventos da {appConfig.empresa}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tituloLinha}>
              <View style={styles.iconeBox}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.titulo}>Entrar no aplicativo</Text>
                <Text style={styles.subtitulo}>Acesso local para colaboradores da empresa.</Text>
              </View>
            </View>

            {erro ? (
              <View style={styles.erroBox}>
                <Text style={styles.erroTexto}>{erro}</Text>
              </View>
            ) : null}

            <CampoTexto
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder={`usuario@${appConfig.loginDominioSugerido}`}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
            />
            <CampoTexto
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite sua senha"
              secureTextEntry
              textContentType="password"
            />
            <Botao titulo="Entrar" icone="log-in-outline" onPress={entrar} />
          </View>

          <Text style={styles.aviso}>
            Use o login da equipe para abrir o app. A sincronizacao em nuvem pode ser conectada futuramente.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.lg,
  },
  hero: {
    gap: spacing.md,
  },
  appName: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '900',
  },
  heroTexto: {
    color: '#D9E7F2',
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },
  card: {
    gap: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconeBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  titulo: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  erroBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
  },
  erroTexto: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  aviso: {
    color: '#D9E7F2',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
