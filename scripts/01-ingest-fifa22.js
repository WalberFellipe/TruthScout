import xlsx from "xlsx";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { getDb, closeDb } from "../server/db/connection.js";
import { normalizeName, normalizeClub } from "./_lib/normalize.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XLSX_PATH = path.resolve(
  __dirname,
  "../datas/FIFA 22/Career Mode player datasets - FIFA 22.xlsx",
);

console.log("[ingest:fifa] lendo", XLSX_PATH);

if (!fs.existsSync(XLSX_PATH)) {
  console.error(
    `\n[ingest:fifa] ARQUIVO NÃO ENCONTRADO: ${XLSX_PATH}\n` +
      "Verifica se o xlsx tá em Truth Scout/datas/FIFA 22/",
  );
  process.exit(1);
}

const wb = xlsx.readFile(XLSX_PATH);
const sheetName = wb.SheetNames[0];
console.log(`[ingest:fifa] abrindo sheet "${sheetName}"`);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null });
console.log(`[ingest:fifa] ${rows.length} linhas lidas do xlsx`);

const db = getDb();

db.exec(`
  DROP TABLE IF EXISTS fifa22_players;

  CREATE TABLE fifa22_players (
    sofifa_id           INTEGER PRIMARY KEY,
    short_name          TEXT,
    long_name           TEXT,
    name_normalized     TEXT NOT NULL,
    short_name_norm     TEXT NOT NULL,
    player_positions    TEXT,
    primary_position    TEXT,
    overall             INTEGER,
    potential           INTEGER,
    value_eur           INTEGER,
    wage_eur            INTEGER,
    age                 INTEGER,
    dob                 TEXT,
    height_cm           INTEGER,
    weight_kg           INTEGER,

    club_name           TEXT,
    club_name_norm      TEXT,
    league_name         TEXT,
    club_position       TEXT,
    club_jersey_number  INTEGER,
    nationality_name    TEXT,
    preferred_foot      TEXT,
    weak_foot           INTEGER,
    skill_moves         INTEGER,
    work_rate           TEXT,

    -- 6 stats compostas
    pace                INTEGER,
    shooting            INTEGER,
    passing             INTEGER,
    dribbling           INTEGER,
    defending           INTEGER,
    physic              INTEGER,

    -- atacking detalhado
    attacking_crossing         INTEGER,
    attacking_finishing        INTEGER,
    attacking_heading_accuracy INTEGER,
    attacking_short_passing    INTEGER,
    attacking_volleys          INTEGER,

    -- skill detalhado
    skill_dribbling     INTEGER,
    skill_curve         INTEGER,
    skill_fk_accuracy   INTEGER,
    skill_long_passing  INTEGER,
    skill_ball_control  INTEGER,

    -- movement
    movement_acceleration INTEGER,
    movement_sprint_speed INTEGER,
    movement_agility      INTEGER,
    movement_reactions    INTEGER,
    movement_balance      INTEGER,

    -- power
    power_shot_power INTEGER,
    power_jumping    INTEGER,
    power_stamina    INTEGER,
    power_strength   INTEGER,
    power_long_shots INTEGER,

    -- mentality
    mentality_aggression   INTEGER,
    mentality_interceptions INTEGER,
    mentality_positioning  INTEGER,
    mentality_vision       INTEGER,
    mentality_penalties    INTEGER,
    mentality_composure    INTEGER,

    -- assets
    player_face_url TEXT,
    club_logo_url   TEXT,
    club_flag_url   TEXT,
    nation_flag_url TEXT
  );

  CREATE INDEX idx_fifa22_name_norm ON fifa22_players(name_normalized);
  CREATE INDEX idx_fifa22_short_norm ON fifa22_players(short_name_norm);
  CREATE INDEX idx_fifa22_club_norm ON fifa22_players(club_name_norm);
`);

const insert = db.prepare(`
  INSERT INTO fifa22_players VALUES (
    @sofifa_id, @short_name, @long_name, @name_normalized, @short_name_norm,
    @player_positions, @primary_position,
    @overall, @potential, @value_eur, @wage_eur, @age, @dob,
    @height_cm, @weight_kg,
    @club_name, @club_name_norm, @league_name, @club_position, @club_jersey_number,
    @nationality_name, @preferred_foot, @weak_foot, @skill_moves, @work_rate,
    @pace, @shooting, @passing, @dribbling, @defending, @physic,
    @attacking_crossing, @attacking_finishing, @attacking_heading_accuracy,
    @attacking_short_passing, @attacking_volleys,
    @skill_dribbling, @skill_curve, @skill_fk_accuracy, @skill_long_passing, @skill_ball_control,
    @movement_acceleration, @movement_sprint_speed, @movement_agility, @movement_reactions, @movement_balance,
    @power_shot_power, @power_jumping, @power_stamina, @power_strength, @power_long_shots,
    @mentality_aggression, @mentality_interceptions, @mentality_positioning,
    @mentality_vision, @mentality_penalties, @mentality_composure,
    @player_face_url, @club_logo_url, @club_flag_url, @nation_flag_url
  )
`);

const insertMany = db.transaction((batch) => {
  let ok = 0;
  let skipped = 0;
  for (const row of batch) {
    if (!row.sofifa_id || !row.long_name) {
      skipped++;
      continue;
    }
    const positions = typeof row.player_positions === "string" ? row.player_positions : "";
    const primary = positions.split(",")[0]?.trim() || null;

    insert.run({
      sofifa_id: Number(row.sofifa_id),
      short_name: row.short_name ?? null,
      long_name: row.long_name,
      name_normalized: normalizeName(row.long_name),
      short_name_norm: normalizeName(row.short_name),
      player_positions: positions || null,
      primary_position: primary,
      overall: row.overall ?? null,
      potential: row.potential ?? null,
      value_eur: row.value_eur ?? null,
      wage_eur: row.wage_eur ?? null,
      age: row.age ?? null,
      dob: row.dob ?? null,
      height_cm: row.height_cm ?? null,
      weight_kg: row.weight_kg ?? null,
      club_name: row.club_name ?? null,
      club_name_norm: normalizeClub(row.club_name),
      league_name: row.league_name ?? null,
      club_position: row.club_position ?? null,
      club_jersey_number: row.club_jersey_number ?? null,
      nationality_name: row.nationality_name ?? null,
      preferred_foot: row.preferred_foot ?? null,
      weak_foot: row.weak_foot ?? null,
      skill_moves: row.skill_moves ?? null,
      work_rate: row.work_rate ?? null,
      pace: row.pace ?? null,
      shooting: row.shooting ?? null,
      passing: row.passing ?? null,
      dribbling: row.dribbling ?? null,
      defending: row.defending ?? null,
      physic: row.physic ?? null,
      attacking_crossing: row.attacking_crossing ?? null,
      attacking_finishing: row.attacking_finishing ?? null,
      attacking_heading_accuracy: row.attacking_heading_accuracy ?? null,
      attacking_short_passing: row.attacking_short_passing ?? null,
      attacking_volleys: row.attacking_volleys ?? null,
      skill_dribbling: row.skill_dribbling ?? null,
      skill_curve: row.skill_curve ?? null,
      skill_fk_accuracy: row.skill_fk_accuracy ?? null,
      skill_long_passing: row.skill_long_passing ?? null,
      skill_ball_control: row.skill_ball_control ?? null,
      movement_acceleration: row.movement_acceleration ?? null,
      movement_sprint_speed: row.movement_sprint_speed ?? null,
      movement_agility: row.movement_agility ?? null,
      movement_reactions: row.movement_reactions ?? null,
      movement_balance: row.movement_balance ?? null,
      power_shot_power: row.power_shot_power ?? null,
      power_jumping: row.power_jumping ?? null,
      power_stamina: row.power_stamina ?? null,
      power_strength: row.power_strength ?? null,
      power_long_shots: row.power_long_shots ?? null,
      mentality_aggression: row.mentality_aggression ?? null,
      mentality_interceptions: row.mentality_interceptions ?? null,
      mentality_positioning: row.mentality_positioning ?? null,
      mentality_vision: row.mentality_vision ?? null,
      mentality_penalties: row.mentality_penalties ?? null,
      mentality_composure: row.mentality_composure ?? null,
      player_face_url: row.player_face_url ?? null,
      club_logo_url: row.club_logo_url ?? null,
      club_flag_url: row.club_flag_url ?? null,
      nation_flag_url: row.nation_flag_url ?? null,
    });
    ok++;
  }
  return { ok, skipped };
});

const t0 = Date.now();
const { ok, skipped } = insertMany(rows);
const ms = Date.now() - t0;

console.log(`[ingest:fifa] inseridos: ${ok} | pulados: ${skipped} | ${ms}ms`);

const count = db.prepare("SELECT COUNT(*) AS n FROM fifa22_players").get().n;
const sample = db
  .prepare(
    "SELECT sofifa_id, short_name, club_name, overall FROM fifa22_players ORDER BY overall DESC LIMIT 5",
  )
  .all();
console.log(`[ingest:fifa] total na tabela: ${count}`);
console.log("[ingest:fifa] top 5 por overall:");
console.table(sample);

closeDb();
