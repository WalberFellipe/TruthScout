// Cliente HTTP com dois modos:
//
// DEV: bate no Express (localhost:3001 via proxy do Vite em /api/*).
//      Permite testar o backend real, iterar sem rebuild.
//
// PROD: consome arquivos JSON estáticos gerados pelo pipeline em
//       /api/players.json e /api/stats.json. Zero backend em runtime —
//       deploy em Vercel/Netlify/Pages como site 100% estático.
//
// A interface pública (api.over, api.under, api.stats, api.player) é
// idêntica nos dois modos, então nenhum componente precisa saber qual
// ambiente tá rodando.

const IS_DEV = import.meta.env.DEV;

async function request(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

// Em prod, carrega o JSON completo uma vez e cacheia — as 216 linhas
// (~160KB) cabem sem problema na memória e as filtragens posteriores
// são instantâneas.
let _allCache = null;
let _statsCache = null;

async function getAllPlayers() {
  if (_allCache) return _allCache;
  _allCache = await request("/api/players.json");
  return _allCache;
}

async function getStats() {
  if (_statsCache) return _statsCache;
  _statsCache = await request("/api/stats.json");
  return _statsCache;
}

// Seleciona over/under do dataset carregado. O App.jsx aplica os
// demais filtros (pos, club, q, sort) via useMemo, então aqui só
// importa o sinal do delta e o limite.
function pickDirection(all, direction, limit = 500) {
  const list = all.filter((p) =>
    direction === "over" ? p.delta > 0 : p.delta < 0,
  );
  list.sort((a, b) =>
    direction === "over" ? b.delta - a.delta : a.delta - b.delta,
  );
  return list.slice(0, limit);
}

function qs(obj) {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}

export const api = {
  stats: () => (IS_DEV ? request("/api/players/stats") : getStats()),

  over: (params = {}) =>
    IS_DEV
      ? request(`/api/players/over${qs(params)}`)
      : getAllPlayers().then((all) => pickDirection(all, "over", params.limit)),

  under: (params = {}) =>
    IS_DEV
      ? request(`/api/players/under${qs(params)}`)
      : getAllPlayers().then((all) => pickDirection(all, "under", params.limit)),

  player: (id) =>
    IS_DEV
      ? request(`/api/players/${encodeURIComponent(id)}`)
      : getAllPlayers().then((all) => all.find((p) => p.id === id)),
};
