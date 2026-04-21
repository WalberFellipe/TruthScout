// Converte a resposta da API (snake_case, achatada) pra shape que os
// componentes do front esperam (name, exp, real, attrs, breakdown, etc).
//
// Importante: mantém `player.club` como código pra o filtro funcionar,
// mas expõe `clubName` pra exibição.

/**
 * @param {object} api — linha da tabela predictions
 * @returns {object} player
 */
export function transformPlayer(api) {
  return {
    id: api.id,
    sofifaId: api.sofifa_id,
    name: api.name,
    longName: api.long_name,

    // Filtro usa código; display usa nome + logo
    club: api.club_code,
    clubName: api.club,
    clubLogoUrl: api.club_logo_url,
    clubFlagUrl: api.club_flag_url,

    nationFlagUrl: api.nation_flag_url,
    faceUrl: api.face_url,

    pos: api.pos,
    age: api.age,
    overall: api.overall,
    matchesPlayed: api.matches_played,

    // Dois nomes pro mesmo valor: o App.jsx já usa `exp`/`real`,
    // mantém compat.
    exp: api.expected_goals,
    real: api.real_goals,
    delta: api.delta,
    deltaPct: api.delta_pct,

    // Dupla representação — por jogo (taxa aprendida pelo modelo) e total
    // (taxa × matches_played). Torna explícito o que o modelo previu vs
    // o que significa no torneio.
    expPerGame: api.expected_per_game,
    realPerGame: api.real_per_game,
    deltaPerGame: api.delta_per_game,

    attrs: {
      PAC: api.pac,
      SHO: api.sho,
      PAS: api.pas,
      DRI: api.dri,
      DEF: api.def,
      PHY: api.phy,
    },

    // Breakdown de gols pro modal
    breakdown: {
      rightFoot: api.right_foot ?? 0,
      leftFoot: api.left_foot ?? 0,
      header: api.headers ?? 0,
      insideBox: api.inside_area ?? 0,
      outsideBox: api.outside_area ?? 0,
      penalty: api.penalties_scored ?? 0,
      other: api.goals_others ?? 0,
    },

    matchConfidence: api.match_confidence,
  };
}

/**
 * Extrai lista única de clubes dos jogadores carregados — alimenta o
 * dropdown do FilterBar. Ordenado alfabeticamente.
 */
export function deriveClubs(players) {
  const map = new Map();
  for (const p of players) {
    if (!p.club || map.has(p.club)) continue;
    map.set(p.club, {
      code: p.club,
      name: p.clubName,
      logoUrl: p.clubLogoUrl,
      flagUrl: p.clubFlagUrl,
    });
  }
  return [...map.values()].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
}

/**
 * Gera uma explicação curta derivada das stats — substitui o ANALYSIS
 * hardcoded do mock. Não é IA, é uma heurística que pega o atributo mais
 * relevante pra justificar o delta.
 */
export function generateAnalysis(player) {
  const { delta, attrs, pos, real, exp, matchesPlayed } = player;
  const positive = delta >= 0;
  const rate = matchesPlayed > 0 ? (real / matchesPlayed).toFixed(2) : "0";
  const expRate = matchesPlayed > 0 ? (exp / matchesPlayed).toFixed(2) : "0";

  if (positive) {
    const best = ["SHO", "DRI", "PAC", "PHY"].reduce((a, b) =>
      attrs[a] >= attrs[b] ? a : b,
    );
    const hint = {
      SHO: "finalização acima da linha esperada pelo modelo",
      DRI: "qualidade individual que virou gol com frequência",
      PAC: "velocidade abriu espaço em transições decisivas",
      PHY: "presença física dominante dentro da área",
    }[best];
    return `${player.name} marcou ${rate} gols/jogo (${real} em ${matchesPlayed}) quando o modelo previa ${expRate}. ${hint.charAt(0).toUpperCase() + hint.slice(1)}.`;
  }
  return `${player.name} marcou apenas ${rate} gols/jogo (${real} em ${matchesPlayed}) com o modelo esperando ${expRate}. Stats de ${pos} indicavam volume ofensivo que não se converteu.`;
}
