// Cliente HTTP fino sobre fetch. Usa caminho relativo /api — o Vite
// faz proxy pro Express em dev, e em prod Express serve o build.

async function request(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export const api = {
  stats: () => request("/api/players/stats"),
  over: (params = {}) => request(`/api/players/over${qs(params)}`),
  under: (params = {}) => request(`/api/players/under${qs(params)}`),
  player: (id) => request(`/api/players/${encodeURIComponent(id)}`),
};

function qs(obj) {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}
