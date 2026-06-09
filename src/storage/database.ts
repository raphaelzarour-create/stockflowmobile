import * as SQLite from 'expo-sqlite';

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

    CREATE INDEX IF NOT EXISTS idx_itens_nome ON itens(nome);
    CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data);
    CREATE INDEX IF NOT EXISTS idx_itens_evento_evento ON itens_evento(evento_id);
    CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes(data);
  `);
}
