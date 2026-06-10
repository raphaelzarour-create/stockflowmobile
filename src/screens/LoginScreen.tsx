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
import type { AuthController } from '@/hooks/useAuth';

interface LoginScreenProps {
  auth: AuthController;
}

type LoginModo = 'entrar' | 'cadastro';

export function LoginScreen({ auth }: LoginScreenProps) {
  const [modo, setModo] = useState<LoginModo>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function enviar() {
    if (modo === 'cadastro') {
      await auth.cadastrar(email, senha);
      return;
    }

    await auth.entrar(email, senha);
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
            <Text style={styles.heroTexto}>Controle de estoque e eventos da {appConfig.empresa}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tituloLinha}>
              <View style={styles.iconeBox}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.titulo}>{modo === 'entrar' ? 'Entrar no aplicativo' : 'Criar acesso'}</Text>
                <Text style={styles.subtitulo}>Autenticacao real com Supabase Auth.</Text>
              </View>
            </View>

            {!auth.configurado ? (
              <View style={styles.erroBox}>
                <Text style={styles.erroTexto}>
                  Banco real nao configurado. Crie o .env com a URL e a chave publica do Supabase.
                </Text>
              </View>
            ) : null}

            {auth.erro ? (
              <View style={styles.erroBox}>
                <Text style={styles.erroTexto}>{auth.erro}</Text>
              </View>
            ) : null}

            {auth.sucesso ? (
              <View style={styles.sucessoBox}>
                <Text style={styles.sucessoTexto}>{auth.sucesso}</Text>
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
            <Botao
              titulo={modo === 'entrar' ? 'Entrar' : 'Criar conta'}
              icone={modo === 'entrar' ? 'log-in-outline' : 'person-add-outline'}
              onPress={() => void enviar()}
              desabilitado={auth.salvando || !auth.configurado}
            />
            {appConfig.cadastroHabilitado ? (
              <Botao
                titulo={modo === 'entrar' ? 'Criar uma conta' : 'Ja tenho conta'}
                icone={modo === 'entrar' ? 'person-add-outline' : 'arrow-back-outline'}
                variante="fantasma"
                onPress={() => {
                  auth.limparMensagens();
                  setModo((atual) => (atual === 'entrar' ? 'cadastro' : 'entrar'));
                }}
                desabilitado={auth.salvando || !auth.configurado}
              />
            ) : null}
          </View>

          <Text style={styles.aviso}>
            Use o login da equipe para acessar o banco compartilhado da empresa.
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
  sucessoBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#DCFCE7',
    padding: spacing.md,
  },
  sucessoTexto: {
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
