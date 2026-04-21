import * as tf from "@tensorflow/tfjs";
import { getDb, closeDb } from "../server/db/connection.js";

const db = getDb();

const FEATURE_COLS = [
  "overall",
  "potential",
  "age",
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physic",
  "attacking_crossing",
  "attacking_finishing",
  "attacking_heading_accuracy",
  "attacking_short_passing",
  "attacking_volleys",
  "skill_dribbling",
  "skill_curve",
  "skill_fk_accuracy",
  "skill_long_passing",
  "skill_ball_control",
  "movement_acceleration",
  "movement_sprint_speed",
  "movement_agility",
  "movement_reactions",
  "movement_balance",
  "power_shot_power",
  "power_stamina",
  "power_strength",
  "power_long_shots",
  "mentality_aggression",
  "mentality_positioning",
  "mentality_vision",
  "mentality_penalties",
  "mentality_composure",
];

const MIN_MATCHES = 2;
const ATTACKING_POSITIONS = [
  // Atacantes
  "ST", "CF", "LS", "RS", "LF", "RF",
  // Pontas
  "LW", "RW",
  // Meias ofensivos
  "CAM", "LAM", "RAM",
  // Meias de lado (costumam chegar ao ataque)
  "LM", "RM",
];

const posList = ATTACKING_POSITIONS.map((p) => `'${p}'`).join(", ");

const joinSql = `
  SELECT
    m.ucl_id,
    m.sofifa_id,
    m.confidence,
    u.player_name, u.club AS ucl_club, u.position AS ucl_pos, u.matches_played,
    u.goals, u.right_foot, u.left_foot, u.headers, u.goals_others,
    u.inside_area, u.outside_area, u.penalties_scored, u.minutes_played,
    f.long_name, f.short_name, f.primary_position,
    f.club_name, f.club_logo_url, f.club_flag_url, f.nation_flag_url, f.player_face_url,
    ${FEATURE_COLS.map((c) => `f.${c}`).join(", ")}
  FROM player_matches m
  JOIN ucl_players u ON u.id = m.ucl_id
  JOIN fifa22_players f ON f.sofifa_id = m.sofifa_id
  WHERE u.matches_played >= ${MIN_MATCHES}
    AND f.primary_position IN (${posList})
`;

const rows = db.prepare(joinSql).all();
console.log(`[train] dataset: ${rows.length} linhas (≥ ${MIN_MATCHES} partidas)`);

const clean = rows.filter((r) => {
  if (r.goals === null || r.matches_played === null) return false;
  return FEATURE_COLS.every((c) => r[c] !== null && r[c] !== undefined);
});
console.log(`[train] após limpeza de nulls: ${clean.length} linhas`);

if (clean.length < 50) {
  console.error("[train] dataset muito pequeno, abortando");
  process.exit(1);
}

// === NORMALIZAÇÃO DE FEATURES ===
// Z-score: (x - mean) / std. Guarda mean/std pra re-usar na inferência.
const means = {};
const stds = {};
for (const col of FEATURE_COLS) {
  const vals = clean.map((r) => r[col]);
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  const v = vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length;
  means[col] = m;
  stds[col] = Math.sqrt(v) || 1; // evita /0 se coluna constante
}

const featureVec = (row) => FEATURE_COLS.map((c) => (row[c] - means[c]) / stds[c]);

// === TARGET ===
// goals / matches_played. Jogador com 10g em 10j = 1.0, 3g em 6j = 0.5.
const targetVal = (row) => row.goals / row.matches_played;

// === TRAIN/VAL SPLIT ===
// Embaralha determinístico pra resultados reproduzíveis entre runs
function seededShuffle(arr, seed = 42) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const shuffled = seededShuffle(clean);
const splitIdx = Math.floor(shuffled.length * 0.8);
const train = shuffled.slice(0, splitIdx);
const val = shuffled.slice(splitIdx);
console.log(`[train] split: treino=${train.length}  validação=${val.length}`);

const xTrain = tf.tensor2d(train.map(featureVec));
const yTrain = tf.tensor2d(train.map((r) => [targetVal(r)]));
const xVal = tf.tensor2d(val.map(featureVec));
const yVal = tf.tensor2d(val.map((r) => [targetVal(r)]));

// === MODELO ===
// MLP raso 
// Dropout + L2 pra não overfitar as 500 amostras.
const model = tf.sequential({
  layers: [
    tf.layers.dense({
      inputShape: [FEATURE_COLS.length],
      units: 32,
      activation: "relu",
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
    }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({
      units: 16,
      activation: "relu",
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
    }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 1, activation: "linear" }),
  ],
});

model.compile({
  optimizer: tf.train.adam(0.003),
  loss: "meanSquaredError",
  metrics: ["mae"],
});

console.log("[train] arquitetura:");
model.summary();

// === FIT ===
console.log("\n[train] treinando...");
const history = await model.fit(xTrain, yTrain, {
  epochs: 200,
  batchSize: 32,
  validationData: [xVal, yVal],
  shuffle: true,
  verbose: 0,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      if (epoch % 20 === 0 || epoch === 199) {
        console.log(
          `  epoch ${String(epoch).padStart(3)}: ` +
            `loss=${logs.loss.toFixed(4)} mae=${logs.mae.toFixed(4)} ` +
            `val_loss=${logs.val_loss.toFixed(4)} val_mae=${logs.val_mae.toFixed(4)}`,
        );
      }
    },
  },
});

// MAE em gols/jogo na validação
const finalValMae = history.history.val_mae[history.history.val_mae.length - 1];
console.log(
  `\n[train] MAE final na validação: ${finalValMae.toFixed(3)} gols/jogo ` +
    `(≈ ${(finalValMae * 6).toFixed(2)} gols numa fase de grupos de 6 jogos)`,
);

// === PREDIÇÕES PRA TODOS ===
// Dedupe por sofifa_id — pode acontecer de dois nomes UCL diferentes matchem
// no mesmo FIFA (falso positivo no matching). Mantém o de maior confidence
// e, em empate, o que tem mais partidas jogadas (mais sinal).
console.log("\n[train] gerando predições pra todos os matches...");
const bySofifa = new Map();
for (const r of clean) {
  const prev = bySofifa.get(r.sofifa_id);
  if (
    !prev ||
    r.confidence > prev.confidence ||
    (r.confidence === prev.confidence && r.matches_played > prev.matches_played)
  ) {
    bySofifa.set(r.sofifa_id, r);
  }
}
const allRows = [...bySofifa.values()];
const dropped = clean.length - allRows.length;
if (dropped > 0) {
  console.log(`[train] ${dropped} linhas descartadas (sofifa_id duplicado no match)`);
}
const xAll = tf.tensor2d(allRows.map(featureVec));
const yPred = model.predict(xAll);
const predArr = (await yPred.array()).map((a) => a[0]);
tf.dispose([xAll, yPred, xTrain, yTrain, xVal, yVal]);

// === PERSISTE ===
db.exec(`
  DROP TABLE IF EXISTS predictions;
  CREATE TABLE predictions (
    id              TEXT PRIMARY KEY,       -- sofifa_id como string (compat com front)
    sofifa_id       INTEGER NOT NULL,
    ucl_id          INTEGER NOT NULL,
    name            TEXT NOT NULL,
    long_name       TEXT,
    club            TEXT,
    club_code       TEXT,                   -- 3 letras derivadas, pro filtro
    club_logo_url   TEXT,
    club_flag_url   TEXT,
    nation_flag_url TEXT,
    face_url        TEXT,
    pos             TEXT NOT NULL,          -- FWD|MID|DEF|GK
    age             INTEGER,
    overall         INTEGER,
    matches_played  INTEGER,

    -- 6 stats compostas pro radar do modal
    pac INTEGER, sho INTEGER, pas INTEGER,
    dri INTEGER, def INTEGER, phy INTEGER,

    -- alvo + predição (dupla representação: por jogo e total no torneio)
    real_goals        INTEGER NOT NULL,
    real_per_game     REAL NOT NULL,         -- real_goals / matches_played
    expected_goals    REAL NOT NULL,         -- per_game × matches_played
    expected_per_game REAL NOT NULL,         -- saída crua do modelo (clamped ≥0)
    delta             REAL NOT NULL,         -- real - expected (total)
    delta_per_game    REAL NOT NULL,         -- real_per_game - expected_per_game
    delta_pct         REAL,                  -- (real-expected)/expected*100

    -- breakdown de gols pro modal
    right_foot       INTEGER,
    left_foot        INTEGER,
    headers          INTEGER,
    goals_others     INTEGER,
    inside_area      INTEGER,
    outside_area     INTEGER,
    penalties_scored INTEGER,

    -- metadata
    match_confidence REAL
  );

  CREATE INDEX idx_predictions_delta ON predictions(delta);
  CREATE INDEX idx_predictions_pos ON predictions(pos);
  CREATE INDEX idx_predictions_club ON predictions(club_code);
`);

// Map de posição UCL → FWD/MID/DEF/GK (curto pra UI)
const shortPos = (ucl, fifa) => {
  const p = (ucl || fifa || "").toLowerCase();
  if (p.includes("forward")) return "FWD";
  if (p.includes("midfield")) return "MID";
  if (p.includes("defend") || p.includes("back")) return "DEF";
  if (p.includes("keeper") || p === "gk") return "GK";
  // fallback pelo primary_position do FIFA
  const f = (fifa || "").toUpperCase();
  if (["ST", "CF", "LW", "RW", "LF", "RF", "LS", "RS"].includes(f)) return "FWD";
  if (["CM", "CAM", "CDM", "LM", "RM", "LAM", "RAM", "LDM", "RDM"].includes(f)) return "MID";
  if (["CB", "LB", "RB", "LWB", "RWB", "LCB", "RCB"].includes(f)) return "DEF";
  if (f === "GK") return "GK";
  return "MID";
};

// Codinome de 3 letras pro filtro por clube (igual ao mock do front)
const clubCode = (name) => {
  if (!name) return "???";
  const n = name.replace(/[.'-]/g, "").split(/\s+/).filter(Boolean);
  if (n.length === 0) return "???";
  if (n.length === 1) return n[0].slice(0, 3).toUpperCase();
  return (n[0][0] + (n[1]?.[0] ?? "") + (n[2]?.[0] ?? n[1]?.[1] ?? "")).toUpperCase();
};

const insert = db.prepare(`
  INSERT INTO predictions VALUES (
    @id, @sofifa_id, @ucl_id, @name, @long_name, @club, @club_code,
    @club_logo_url, @club_flag_url, @nation_flag_url, @face_url,
    @pos, @age, @overall, @matches_played,
    @pac, @sho, @pas, @dri, @def, @phy,
    @real_goals, @real_per_game, @expected_goals, @expected_per_game,
    @delta, @delta_per_game, @delta_pct,
    @right_foot, @left_foot, @headers, @goals_others,
    @inside_area, @outside_area, @penalties_scored,
    @match_confidence
  )
`);

const insertAll = db.transaction(() => {
  for (let i = 0; i < allRows.length; i++) {
    const r = allRows[i];
    const perGamePred = Math.max(0, predArr[i]); // clamp negativo → 0
    const realPerGame = r.goals / r.matches_played;
    const expected = perGamePred * r.matches_played;
    const delta = r.goals - expected;
    const deltaPerGame = realPerGame - perGamePred;
    const deltaPct = expected > 0.01 ? (delta / expected) * 100 : 0;
    insert.run({
      id: String(r.sofifa_id),
      sofifa_id: r.sofifa_id,
      ucl_id: r.ucl_id,
      name: r.short_name || r.long_name,
      long_name: r.long_name,
      club: r.club_name,
      club_code: clubCode(r.club_name),
      club_logo_url: r.club_logo_url,
      club_flag_url: r.club_flag_url,
      nation_flag_url: r.nation_flag_url,
      face_url: r.player_face_url,
      pos: shortPos(r.ucl_pos, r.primary_position),
      age: r.age,
      overall: r.overall,
      matches_played: r.matches_played,
      pac: r.pace,
      sho: r.shooting,
      pas: r.passing,
      dri: r.dribbling,
      def: r.defending,
      phy: r.physic,
      real_goals: r.goals,
      real_per_game: Number(realPerGame.toFixed(3)),
      expected_goals: Number(expected.toFixed(2)),
      expected_per_game: Number(perGamePred.toFixed(3)),
      delta: Number(delta.toFixed(2)),
      delta_per_game: Number(deltaPerGame.toFixed(3)),
      delta_pct: Number(deltaPct.toFixed(1)),
      right_foot: r.right_foot,
      left_foot: r.left_foot,
      headers: r.headers,
      goals_others: r.goals_others,
      inside_area: r.inside_area,
      outside_area: r.outside_area,
      penalties_scored: r.penalties_scored,
      match_confidence: r.confidence,
    });
  }
});
insertAll();

const count = db.prepare("SELECT COUNT(*) AS n FROM predictions").get().n;
console.log(`\n[train] predições gravadas: ${count}`);

// === REPORT ===
const topOver = db
  .prepare(
    `SELECT name, club, pos, real_goals, real_per_game, expected_goals, expected_per_game, delta
       FROM predictions ORDER BY delta DESC LIMIT 10`,
  )
  .all();
console.log("\n=== TOP 10 OVERPERFORMERS ===");
console.table(topOver);

const topUnder = db
  .prepare(
    `SELECT name, club, pos, real_goals, real_per_game, expected_goals, expected_per_game, delta
       FROM predictions ORDER BY delta ASC LIMIT 10`,
  )
  .all();
console.log("\n=== TOP 10 UNDERPERFORMERS ===");
console.table(topUnder);

closeDb();
