// Conexão singleton com o SQLite.
// better-sqlite3 é síncrono — ideal pros scripts de pipeline (mais simples)
// e rápido o bastante pra API de leitura.

import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../db/truth-scout.db");

// Garante que a pasta existe antes do driver tentar abrir o arquivo
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db = null;

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL"); // melhor concorrência leitura/escrita
    _db.pragma("foreign_keys = ON");
  }
  return _db;
}

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
