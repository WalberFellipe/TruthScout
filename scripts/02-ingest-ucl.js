import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import csv from "csv-parser";
import { getDb, closeDb } from "../server/db/connection.js";
import { normalizeName, normalizeClub } from "./_lib/normalize.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UCL_DIR = path.resolve(__dirname, "../datas/UCL-21-22");

/** @param {string} file */
function readCsv(file) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path.join(UCL_DIR, file))
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

console.log("[ingest:ucl] lendo 8 CSVs...");

const [attacking, attempts, defending, disciplinary, distribution, goalkeeping, goals, keyStats] =
  await Promise.all([
    readCsv("attacking.csv"),
    readCsv("attempts.csv"),
    readCsv("defending.csv"),
    readCsv("disciplinary.csv"),
    readCsv("distributon.csv"),
    readCsv("goalkeeping.csv"),
    readCsv("goals.csv"),
    readCsv("key_stats.csv"),
  ]);

console.log(
  `[ingest:ucl] atk=${attacking.length} atm=${attempts.length} def=${defending.length} ` +
    `dis=${disciplinary.length} dst=${distribution.length} gk=${goalkeeping.length} ` +
    `g=${goals.length} ks=${keyStats.length}`,
);

/** @type {Map<string, any>} */
const players = new Map();

function getOrInit(row) {
  const nameNorm = normalizeName(row.player_name);
  const clubNorm = normalizeClub(row.club);
  const key = `${nameNorm}::${clubNorm}`;
  let p = players.get(key);
  if (!p) {
    p = {
      key,
      player_name: row.player_name,
      name_normalized: nameNorm,
      club: row.club,
      club_normalized: clubNorm,
      position: row.position,
      matches_played: null,
      minutes_played: null,
      goals: null,
      right_foot: null,
      left_foot: null,
      headers: null,
      goals_others: null,
      inside_area: null,
      outside_area: null,
      penalties_scored: null,
      // attacking
      assists: null,
      corner_taken: null,
      offsides: null,
      dribbles: null,
      // attempts
      total_attempts: null,
      on_target: null,
      off_target: null,
      blocked: null,
      // defending
      balls_recovered: null,
      tackles: null,
      tackles_won: null,
      tackles_lost: null,
      clearance_attempted: null,
      // disciplinary
      fouls_committed: null,
      fouls_suffered: null,
      red_cards: null,
      yellow_cards: null,
      // distribution
      pass_accuracy: null,
      pass_attempted: null,
      pass_completed: null,
      cross_accuracy: null,
      cross_attempted: null,
      cross_completed: null,
      freekicks_taken: null,
      // goalkeeping
      saves: null,
      conceded: null,
      saved_penalties: null,
      cleansheets: null,
      punches_made: null,
      // key stats
      distance_covered: null,
    };
    players.set(key, p);
  }
  return p;
}

function keepMax(p, field, v) {
  const n = num(v);
  if (n === null) return;
  if (p[field] === null || n > p[field]) p[field] = n;
}

for (const r of attacking) {
  const p = getOrInit(r);
  p.assists = num(r.assists);
  p.corner_taken = num(r.corner_taken);
  p.offsides = num(r.offsides);
  p.dribbles = num(r.dribbles);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of attempts) {
  const p = getOrInit(r);
  p.total_attempts = num(r.total_attempts);
  p.on_target = num(r.on_target);
  p.off_target = num(r.off_target);
  p.blocked = num(r.blocked);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of defending) {
  const p = getOrInit(r);
  p.balls_recovered = num(r.balls_recoverd);
  p.tackles = num(r.tackles);
  p.tackles_won = num(r.t_won);
  p.tackles_lost = num(r.t_lost);
  p.clearance_attempted = num(r.clearance_attempted);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of disciplinary) {
  const p = getOrInit(r);
  p.fouls_committed = num(r.fouls_committed);
  p.fouls_suffered = num(r.fouls_suffered);
  p.red_cards = num(r.red);
  p.yellow_cards = num(r.yellow);
  keepMax(p, "minutes_played", r.minutes_played);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of distribution) {
  const p = getOrInit(r);
  p.pass_accuracy = num(r.pass_accuracy);
  p.pass_attempted = num(r.pass_attempted);
  p.pass_completed = num(r.pass_completed);
  p.cross_accuracy = num(r.cross_accuracy);
  p.cross_attempted = num(r.cross_attempted);
  p.cross_completed = num(r.cross_complted);
  p.freekicks_taken = num(r.freekicks_taken);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of goalkeeping) {
  const p = getOrInit(r);
  p.saves = num(r.saved);
  p.conceded = num(r.conceded);
  p.saved_penalties = num(r.saved_penalties);
  p.cleansheets = num(r.cleansheets);
  p.punches_made = num(r["punches made"]);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of goals) {
  const p = getOrInit(r);
  p.goals = num(r.goals);
  p.right_foot = num(r.right_foot);
  p.left_foot = num(r.left_foot);
  p.headers = num(r.headers);
  p.goals_others = num(r.others);
  p.inside_area = num(r.inside_area);
  p.outside_area = num(r.outside_areas);
  p.penalties_scored = num(r.penalties);
  keepMax(p, "matches_played", r.match_played);
}
for (const r of keyStats) {
  const p = getOrInit(r);
  if (p.goals === null) p.goals = num(r.goals);
  if (p.assists === null) p.assists = num(r.assists);
  p.distance_covered = num(r.distance_covered);
  keepMax(p, "matches_played", r.match_played);
  keepMax(p, "minutes_played", r.minutes_played);
}

console.log(`[ingest:ucl] ${players.size} jogadores únicos após merge`);

const db = getDb();

// Mesma razão do script 01: player_matches tem FK apontando pra cá,
// então o DROP falharia na segunda execução do pipeline com FK on.
db.pragma("foreign_keys = OFF");

db.exec(`
  DROP TABLE IF EXISTS ucl_players;
  CREATE TABLE ucl_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    name_normalized TEXT NOT NULL,
    club TEXT,
    club_normalized TEXT,
    position TEXT,
    matches_played INTEGER,
    minutes_played INTEGER,

    goals INTEGER,
    right_foot INTEGER,
    left_foot INTEGER,
    headers INTEGER,
    goals_others INTEGER,
    inside_area INTEGER,
    outside_area INTEGER,
    penalties_scored INTEGER,

    assists INTEGER,
    corner_taken INTEGER,
    offsides INTEGER,
    dribbles INTEGER,

    total_attempts INTEGER,
    on_target INTEGER,
    off_target INTEGER,
    blocked INTEGER,

    balls_recovered INTEGER,
    tackles INTEGER,
    tackles_won INTEGER,
    tackles_lost INTEGER,
    clearance_attempted INTEGER,

    fouls_committed INTEGER,
    fouls_suffered INTEGER,
    red_cards INTEGER,
    yellow_cards INTEGER,

    pass_accuracy REAL,
    pass_attempted INTEGER,
    pass_completed INTEGER,
    cross_accuracy REAL,
    cross_attempted INTEGER,
    cross_completed INTEGER,
    freekicks_taken INTEGER,

    saves INTEGER,
    conceded INTEGER,
    saved_penalties INTEGER,
    cleansheets INTEGER,
    punches_made INTEGER,

    distance_covered REAL,
    UNIQUE(name_normalized, club_normalized)
  );

  CREATE INDEX idx_ucl_name_norm ON ucl_players(name_normalized);
  CREATE INDEX idx_ucl_club_norm ON ucl_players(club_normalized);
`);

const insert = db.prepare(`
  INSERT INTO ucl_players (
    player_name, name_normalized, club, club_normalized, position,
    matches_played, minutes_played,
    goals, right_foot, left_foot, headers, goals_others, inside_area, outside_area, penalties_scored,
    assists, corner_taken, offsides, dribbles,
    total_attempts, on_target, off_target, blocked,
    balls_recovered, tackles, tackles_won, tackles_lost, clearance_attempted,
    fouls_committed, fouls_suffered, red_cards, yellow_cards,
    pass_accuracy, pass_attempted, pass_completed, cross_accuracy, cross_attempted, cross_completed, freekicks_taken,
    saves, conceded, saved_penalties, cleansheets, punches_made,
    distance_covered
  ) VALUES (
    @player_name, @name_normalized, @club, @club_normalized, @position,
    @matches_played, @minutes_played,
    @goals, @right_foot, @left_foot, @headers, @goals_others, @inside_area, @outside_area, @penalties_scored,
    @assists, @corner_taken, @offsides, @dribbles,
    @total_attempts, @on_target, @off_target, @blocked,
    @balls_recovered, @tackles, @tackles_won, @tackles_lost, @clearance_attempted,
    @fouls_committed, @fouls_suffered, @red_cards, @yellow_cards,
    @pass_accuracy, @pass_attempted, @pass_completed, @cross_accuracy, @cross_attempted, @cross_completed, @freekicks_taken,
    @saves, @conceded, @saved_penalties, @cleansheets, @punches_made,
    @distance_covered
  )
`);

const insertAll = db.transaction((list) => {
  for (const p of list) {
    const { key: _k, ...row } = p;
    insert.run(row);
  }
});

const t0 = Date.now();
insertAll([...players.values()]);
const ms = Date.now() - t0;

const count = db.prepare("SELECT COUNT(*) AS n FROM ucl_players").get().n;
console.log(`[ingest:ucl] inseridos: ${count} em ${ms}ms`);

// Sanity check — top 5 artilheiros
const top = db
  .prepare(
    `SELECT player_name, club, position, goals, matches_played FROM ucl_players
     WHERE goals IS NOT NULL ORDER BY goals DESC LIMIT 5`,
  )
  .all();
console.log("[ingest:ucl] top 5 artilheiros:");
console.table(top);

db.pragma("foreign_keys = ON");
closeDb();
