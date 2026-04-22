// Exporta a tabela predictions + um relatório completo do pipeline pra
// arquivos JSON estáticos em public/api/. Isso torna o app deployável em
// qualquer host estático (Vercel, Netlify, GitHub Pages) sem precisar
// do Express em runtime.
//
// Além do players.json e stats.json, gera pipeline.json — um snapshot
// de tudo que aconteceu no pipeline (datasets, matching, training),
// que é renderizado no modal de Metodologia pra auditoria pública.
//
// Uso: npm run export:json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "../server/db/connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/api");
const META_PATH = path.resolve(__dirname, "../db/training-meta.json");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const db = getDb();

// === players.json — todos os jogadores com predição ===
const players = db
  .prepare(`SELECT * FROM predictions ORDER BY delta DESC`)
  .all();

const playersPath = path.join(OUT_DIR, "players.json");
fs.writeFileSync(playersPath, JSON.stringify(players));
console.log(`[export] ${players.length} jogadores → ${playersPath}`);

// === stats.json — contadores agregados pro Hero ===
const stats = db
  .prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN delta > 0 THEN 1 ELSE 0 END) AS overperformers,
       SUM(CASE WHEN delta < 0 THEN 1 ELSE 0 END) AS underperformers,
       ROUND(SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END), 1) AS goals_above_expected
     FROM predictions`,
  )
  .get();

const statsPath = path.join(OUT_DIR, "stats.json");
fs.writeFileSync(statsPath, JSON.stringify(stats));
console.log(`[export] stats → ${statsPath}`);

// === pipeline.json — relatório completo pra transparência pública ===
// Qualquer pessoa que abrir o modal de Metodologia vê exatamente o que
// aconteceu: quantos jogadores entraram no pipeline, quantos casaram,
// distribuição da confiança do matching, métricas do treino.

const fifaCount = db.prepare("SELECT COUNT(*) AS n FROM fifa22_players").get().n;
const uclCount = db.prepare("SELECT COUNT(*) AS n FROM ucl_players").get().n;
const matchedCount = db.prepare("SELECT COUNT(*) AS n FROM player_matches").get().n;

// Buckets de confiança do matching — mostra a qualidade agregada
const confRow = db
  .prepare(
    `SELECT
       SUM(CASE WHEN confidence = 1 THEN 1 ELSE 0 END) AS exact,
       SUM(CASE WHEN confidence >= 0.9 AND confidence < 1 THEN 1 ELSE 0 END) AS high,
       SUM(CASE WHEN confidence >= 0.7 AND confidence < 0.9 THEN 1 ELSE 0 END) AS good,
       SUM(CASE WHEN confidence >= 0.5 AND confidence < 0.7 THEN 1 ELSE 0 END) AS medium,
       SUM(CASE WHEN confidence >= 0.3 AND confidence < 0.5 THEN 1 ELSE 0 END) AS low,
       SUM(CASE WHEN confidence < 0.3 THEN 1 ELSE 0 END) AS very_low
     FROM player_matches`,
  )
  .get();

// Top 5 artilheiros REAIS do UCL (não predições) — fonte de confiança
const topScorersReal = db
  .prepare(
    `SELECT player_name, club, position, goals, matches_played
       FROM ucl_players
      WHERE goals IS NOT NULL
      ORDER BY goals DESC
      LIMIT 5`,
  )
  .all();

// Meta de treino (gravado pelo script 04)
let trainingMeta = null;
if (fs.existsSync(META_PATH)) {
  trainingMeta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
} else {
  console.warn(`[export] aviso: ${META_PATH} não existe — rode npm run train antes`);
}

const pipeline = {
  generatedAt: new Date().toISOString(),
  datasets: {
    fifaSource: fifaCount,
    uclSource: uclCount,
  },
  matching: {
    total: uclCount,
    matched: matchedCount,
    unmatched: uclCount - matchedCount,
    rate: Number((matchedCount / uclCount).toFixed(4)),
    confidenceBuckets: {
      exact: confRow.exact ?? 0,
      high: confRow.high ?? 0,
      good: confRow.good ?? 0,
      medium: confRow.medium ?? 0,
      low: confRow.low ?? 0,
      veryLow: confRow.very_low ?? 0,
    },
  },
  training: trainingMeta,
  predictions: {
    count: players.length,
    overperformers: stats.overperformers,
    underperformers: stats.underperformers,
    goalsAboveExpected: stats.goals_above_expected,
  },
  topScorersReal,
};

const pipelinePath = path.join(OUT_DIR, "pipeline.json");
fs.writeFileSync(pipelinePath, JSON.stringify(pipeline, null, 2));
console.log(`[export] pipeline report → ${pipelinePath}`);

// Resumo pro log
const sizeKB = (p) => (fs.statSync(p).size / 1024).toFixed(1);
console.log(
  `[export] tamanhos: players.json=${sizeKB(playersPath)}KB  stats.json=${sizeKB(statsPath)}KB  pipeline.json=${sizeKB(pipelinePath)}KB`,
);

closeDb();
