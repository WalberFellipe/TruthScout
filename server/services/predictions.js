// Camada de acesso a dados. Isola SQL do resto do backend.
// Os scripts de pipeline populam as tabelas; aqui só LEMOS.

import { getDb } from "../db/connection.js";

/**
 * Retorna jogadores com delta > 0 (real > esperado) ou delta < 0 (real < esperado)
 * @param {"over" | "under"} direction
 * @param {{ pos?: string, club?: string, q?: string, limit?: number }} opts
 */
export function getPlayersByDirection(direction, opts = {}) {
  const db = getDb();
  const { pos, club, q, limit = 50 } = opts;

  // Filtro pelo sinal do delta
  const deltaFilter = direction === "over" ? "delta > 0" : "delta < 0";
  const order = direction === "over" ? "delta DESC" : "delta ASC";

  const wheres = [deltaFilter];
  const params = {};
  if (pos) {
    wheres.push("pos = @pos");
    params.pos = pos;
  }
  if (club) {
    wheres.push("club_code = @club");
    params.club = club;
  }
  if (q) {
    wheres.push("(name LIKE @q OR long_name LIKE @q)");
    params.q = `%${q}%`;
  }

  const sql = `
    SELECT *
    FROM predictions
    WHERE ${wheres.join(" AND ")}
    ORDER BY ${order}
    LIMIT @limit
  `;
  return db.prepare(sql).all({ ...params, limit });
}

export function getPlayerById(id) {
  const db = getDb();
  return db.prepare("SELECT * FROM predictions WHERE id = ?").get(id);
}

export function getStats() {
  const db = getDb();
  // Contadores para o Hero: total analisado, overperformers, total de gols a mais
  try {
    return db
      .prepare(
        `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN delta > 0 THEN 1 ELSE 0 END) AS overperformers,
          SUM(CASE WHEN delta < 0 THEN 1 ELSE 0 END) AS underperformers,
          ROUND(SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END), 1) AS goals_above_expected
        FROM predictions
      `,
      )
      .get();
  } catch (err) {
    // Se a tabela ainda não existe (pipeline não rodou), retorna zeros
    if (err.message.includes("no such table")) {
      return { total: 0, overperformers: 0, underperformers: 0, goals_above_expected: 0 };
    }
    throw err;
  }
}
