import * as SQLite from 'expo-sqlite';

const CHAVE_LIMPEZA_DADOS_EXEMPLO = 'cleanup_dados_exemplo_v1';
const NOMES_ITENS_EXEMPLO = ['Refletor PAR LED', 'Cabo XLR 10m', 'Painel de LED P3', 'Trave de aluminio'];
const NOMES_EVENTOS_EXEMPLO = ['Casamento Jardim', 'Show Corporativo'];

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!database) {
    database = await SQLite.openDatabaseAsync('stockflow.db');
  }

  return database;
}

export async function inicializarBanco() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS itens (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      quantidade_total INTEGER NOT NULL,
      quantidade_disponivel INTEGER NOT NULL,
      status TEXT NOT NULL,
      observacao TEXT NOT NULL DEFAULT '',
      data_cadastro TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      cliente TEXT NOT NULL,
      data TEXT NOT NULL,
      local TEXT NOT NULL,
      descricao TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS itens_evento (
      id TEXT PRIMARY KEY NOT NULL,
      evento_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      devolvido INTEGER NOT NULL DEFAULT 0,
      data_vinculo TEXT NOT NULL,
      FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS movimentacoes (
      id TEXT PRIMARY KEY NOT NULL,
      item_id TEXT,
      item_nome TEXT NOT NULL,
      evento_id TEXT,
      evento_nome TEXT NOT NULL DEFAULT '',
      tipo TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      observacao TEXT NOT NULL DEFAULT '',
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      chave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_itens_nome ON itens(nome);
    CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data);
    CREATE INDEX IF NOT EXISTS idx_itens_evento_evento ON itens_evento(evento_id);
    CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes(data);
  `);

  await removerDadosExemploLegados(db);
}

async function removerDadosExemploLegados(db: SQLite.SQLiteDatabase) {
  const limpezaAplicada = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM app_meta WHERE chave = ?',
    CHAVE_LIMPEZA_DADOS_EXEMPLO,
  );

  if (limpezaAplicada) {
    return;
  }

  const totalItensExemplo = await contarMarcadores(db, 'itens', 'nome', NOMES_ITENS_EXEMPLO);
  const totalEventosExemplo = await contarMarcadores(db, 'eventos', 'nome', NOMES_EVENTOS_EXEMPLO);
  const pareceBaseDeExemplo = totalItensExemplo >= 3 || totalEventosExemplo >= 2;

  if (pareceBaseDeExemplo) {
    await db.withTransactionAsync(async () => {
      await excluirComLista(db, 'movimentacoes', 'item_nome', NOMES_ITENS_EXEMPLO);
      await excluirComLista(db, 'movimentacoes', 'evento_nome', NOMES_EVENTOS_EXEMPLO);
      await excluirVinculosDeExemplo(db);
      await excluirComLista(db, 'itens', 'nome', NOMES_ITENS_EXEMPLO);
      await excluirComLista(db, 'eventos', 'nome', NOMES_EVENTOS_EXEMPLO);
    });
  }

  await db.runAsync(
    'INSERT OR REPLACE INTO app_meta (chave, valor) VALUES (?, ?)',
    CHAVE_LIMPEZA_DADOS_EXEMPLO,
    new Date().toISOString(),
  );
}

async function contarMarcadores(
  db: SQLite.SQLiteDatabase,
  tabela: 'itens' | 'eventos',
  coluna: 'nome',
  valores: string[],
) {
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ${tabela} WHERE ${coluna} IN (${placeholders(valores)})`,
    ...valores,
  );

  return row?.total ?? 0;
}

async function excluirVinculosDeExemplo(db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    `DELETE FROM itens_evento
      WHERE item_id IN (SELECT id FROM itens WHERE nome IN (${placeholders(NOMES_ITENS_EXEMPLO)}))
         OR evento_id IN (SELECT id FROM eventos WHERE nome IN (${placeholders(NOMES_EVENTOS_EXEMPLO)}))`,
    ...NOMES_ITENS_EXEMPLO,
    ...NOMES_EVENTOS_EXEMPLO,
  );
}

async function excluirComLista(
  db: SQLite.SQLiteDatabase,
  tabela: 'itens' | 'eventos' | 'movimentacoes',
  coluna: 'nome' | 'item_nome' | 'evento_nome',
  valores: string[],
) {
  await db.runAsync(`DELETE FROM ${tabela} WHERE ${coluna} IN (${placeholders(valores)})`, ...valores);
}

function placeholders(valores: string[]) {
  return valores.map(() => '?').join(', ');
}
