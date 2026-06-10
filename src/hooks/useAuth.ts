import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { appConfig } from '@/constants/app';
import { getSupabaseClient, supabase, supabaseConfigurado } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    if (!supabase) {
      setCarregando(false);
      return;
    }

    let ativo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!ativo) {
        return;
      }

      if (error) {
        setErro(traduzirErroAuth(error.message));
      }
      setSession(data.session ?? null);
      setUsuario(data.session?.user ?? null);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, novaSession) => {
      setSession(novaSession);
      setUsuario(novaSession?.user ?? null);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function entrar(email: string, senha: string) {
    return executar(async () => {
      const client = getSupabaseClient();
      const emailNormalizado = validarCredenciais(email, senha);
      const { error } = await client.auth.signInWithPassword({
        email: emailNormalizado,
        password: senha,
      });

      if (error) {
        throw new Error(traduzirErroAuth(error.message));
      }

      setSucesso('Login realizado com sucesso.');
    });
  }

  async function cadastrar(email: string, senha: string) {
    return executar(async () => {
      if (!appConfig.cadastroHabilitado) {
        throw new Error('Cadastro desativado. Peça ao gestor para criar seu acesso.');
      }

      const client = getSupabaseClient();
      const emailNormalizado = validarCredenciais(email, senha);
      const { data, error } = await client.auth.signUp({
        email: emailNormalizado,
        password: senha,
        options: {
          data: {
            empresa: appConfig.empresa,
            aplicativo: appConfig.nome,
          },
        },
      });

      if (error) {
        throw new Error(traduzirErroAuth(error.message));
      }

      if (!data.session) {
        setSucesso('Conta criada. Confirme o e-mail antes de entrar.');
        return;
      }

      setSucesso('Conta criada e login realizado.');
    });
  }

  async function sair() {
    return executar(async () => {
      const client = getSupabaseClient();
      const { error } = await client.auth.signOut();
      if (error) {
        throw new Error(traduzirErroAuth(error.message));
      }
      setSession(null);
      setUsuario(null);
      setSucesso('');
    });
  }

  async function executar(acao: () => Promise<void>) {
    setSalvando(true);
    setErro('');
    setSucesso('');
    try {
      await acao();
      return true;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel concluir a autenticacao.');
      return false;
    } finally {
      setSalvando(false);
    }
  }

  return {
    session,
    usuario,
    configurado: supabaseConfigurado,
    carregando,
    salvando,
    erro,
    sucesso,
    entrar,
    cadastrar,
    sair,
    limparMensagens: () => {
      setErro('');
      setSucesso('');
    },
  };
}

function validarCredenciais(email: string, senha: string) {
  const emailNormalizado = email.trim().toLowerCase();
  if (!emailNormalizado || !senha.trim()) {
    throw new Error('Informe e-mail e senha.');
  }

  if (!emailNormalizado.includes('@')) {
    throw new Error('Informe um e-mail valido.');
  }

  if (senha.length < 6) {
    throw new Error('A senha precisa ter pelo menos 6 caracteres.');
  }

  return emailNormalizado;
}

function traduzirErroAuth(mensagem: string) {
  const normalizada = mensagem.toLowerCase();

  if (normalizada.includes('invalid login credentials')) {
    return 'E-mail ou senha invalidos.';
  }

  if (normalizada.includes('email not confirmed')) {
    return 'Confirme o e-mail antes de entrar.';
  }

  if (normalizada.includes('already registered') || normalizada.includes('already exists')) {
    return 'Este e-mail ja possui cadastro.';
  }

  return mensagem || 'Nao foi possivel autenticar.';
}

export type AuthController = ReturnType<typeof useAuth>;
