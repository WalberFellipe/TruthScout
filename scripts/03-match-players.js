import { distance } from "fastest-levenshtein";
import { getDb, closeDb } from "../server/db/connection.js";
import { lastNameOf } from "./_lib/normalize.js";

const db = getDb();

const clubTokens = (s) =>
  (s ?? "")
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

console.log("[match] carregando dados...");
const fifaAll = db
  .prepare(
    `SELECT sofifa_id, long_name, short_name, name_normalized, short_name_norm,
            club_name_norm, primary_position, overall
       FROM fifa22_players`,
  )
  .all();
const uclAll = db.prepare("SELECT * FROM ucl_players").all();
console.log(`[match] FIFA=${fifaAll.length}  UCL=${uclAll.length}`);

/** @type {Map<string, any[]>} */
const fifaIndex = new Map();
for (const p of fifaAll) {
  const tokens = clubTokens(p.club_name_norm);
  if (tokens.length === 0) continue;
  const lastLong = lastNameOf(p.name_normalized);
  const lastShort = lastNameOf(p.short_name_norm);
  const lasts = new Set();
  if (lastLong) lasts.add(lastLong);
  if (lastShort) lasts.add(lastShort);
  const keys = new Set();
  for (const last of lasts) {
    for (const tok of tokens) keys.add(`${last}|${tok}`);
  }
  for (const k of keys) {
    const arr = fifaIndex.get(k) ?? [];
    arr.push(p);
    fifaIndex.set(k, arr);
  }
}
console.log(`[match] índice FIFA: ${fifaIndex.size} chaves`);

function similarity(a, b) {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - distance(a, b) / maxLen;
}

const matches = [];
const unmatched = [];
const ambiguous = [];

for (const ucl of uclAll) {
  const uclLast = lastNameOf(ucl.name_normalized);
  const uclClubToks = clubTokens(ucl.club_normalized);
  const candSet = new Map();
  for (const tok of uclClubToks) {
    for (const c of fifaIndex.get(`${uclLast}|${tok}`) ?? []) {
      candSet.set(c.sofifa_id, c);
    }
  }
  const candidates = [...candSet.values()];

  if (candidates.length === 0) {
    unmatched.push(ucl);
    continue;
  }


  let best = null;
  let bestSim = 0;
  let strategy = "last+club";
  for (const c of candidates) {
    const s1 = similarity(ucl.name_normalized, c.name_normalized);
    const s2 = similarity(ucl.name_normalized, c.short_name_norm);
    const s = Math.max(s1, s2);
    if (s > bestSim) {
      bestSim = s;
      best = c;
      strategy = s1 >= s2 ? "long_name" : "short_name";
    }
  }

  if (bestSim < 0.3) {
    ambiguous.push({ ucl, best, bestSim });
  }

  matches.push({
    ucl_id: ucl.id,
    sofifa_id: best.sofifa_id,
    confidence: Number(bestSim.toFixed(3)),
    strategy,
  });
}

db.exec(`
  DROP TABLE IF EXISTS player_matches;
  CREATE TABLE player_matches (
    ucl_id INTEGER PRIMARY KEY,
    sofifa_id INTEGER NOT NULL,
    confidence REAL NOT NULL,
    strategy TEXT NOT NULL,
    FOREIGN KEY (ucl_id) REFERENCES ucl_players(id),
    FOREIGN KEY (sofifa_id) REFERENCES fifa22_players(sofifa_id)
  );
  CREATE INDEX idx_matches_sofifa ON player_matches(sofifa_id);
`);

const insert = db.prepare(
  `INSERT INTO player_matches (ucl_id, sofifa_id, confidence, strategy)
   VALUES (@ucl_id, @sofifa_id, @confidence, @strategy)`,
);
const insertAll = db.transaction((list) => list.forEach((m) => insert.run(m)));
insertAll(matches);

console.log("\n=== Resultado ===");
console.log(`Matched:   ${matches.length} / ${uclAll.length}`);
console.log(`Unmatched: ${unmatched.length}`);
console.log(`Ambíguos (confidence < 0.3): ${ambiguous.length}`);

const buckets = { "1.0": 0, ">=0.9": 0, ">=0.7": 0, ">=0.5": 0, ">=0.3": 0, "<0.3": 0 };
for (const m of matches) {
  if (m.confidence === 1) buckets["1.0"]++;
  else if (m.confidence >= 0.9) buckets[">=0.9"]++;
  else if (m.confidence >= 0.7) buckets[">=0.7"]++;
  else if (m.confidence >= 0.5) buckets[">=0.5"]++;
  else if (m.confidence >= 0.3) buckets[">=0.3"]++;
  else buckets["<0.3"]++;
}
console.log("\nDistribuição de confidence:");
console.table(buckets);

if (unmatched.length > 0) {
  console.log("\nAmostra de UCL não encontrados no FIFA (até 15):");
  console.table(
    unmatched.slice(0, 15).map((u) => ({
      name: u.player_name,
      club: u.club,
      pos: u.position,
      goals: u.goals,
    })),
  );
}

if (ambiguous.length > 0) {
  console.log("\nAmostra de matches com confidence baixa (até 10):");
  console.table(
    ambiguous.slice(0, 10).map((a) => ({
      ucl_name: a.ucl.player_name,
      ucl_club: a.ucl.club,
      fifa_long: a.best.long_name,
      fifa_short: a.best.short_name,
      fifa_club: a.best.club_name_norm,
      sim: a.bestSim.toFixed(2),
    })),
  );
}


const goodSample = db
  .prepare(
    `SELECT u.player_name AS ucl, u.club AS ucl_club, u.goals,
            f.long_name AS fifa, f.club_name AS fifa_club, f.overall, m.confidence
       FROM player_matches m
       JOIN ucl_players u ON u.id = m.ucl_id
       JOIN fifa22_players f ON f.sofifa_id = m.sofifa_id
       WHERE u.goals >= 3
       ORDER BY u.goals DESC LIMIT 10`,
  )
  .all();
console.log("\n=== Top artilheiros matched (validação manual) ===");
console.table(goodSample);

closeDb();
