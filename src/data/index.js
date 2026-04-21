// Mocks históricos (pré-API) — mantidos só como fallback.
// Em runtime, o `usePlayers` hook busca de /api/players e substitui esses.
// POS_AVG continua relevante: é a linha de base pros radar charts.
export { POS_AVG } from "@/data/stats.js";
