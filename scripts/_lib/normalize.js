/**
 * Remove acentos, caixa baixa, tira pontuação e colapsa espaços.
 * @param {string | null | undefined} s
 * @returns {string}
 */
export function normalizeName(s) {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacríticos
    .toLowerCase()
    .replace(/[.'`’]/g, "") // pontuação
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrai "último nome" razoável — útil como tiebreaker.
 * Ex: "cristiano ronaldo dos santos aveiro" → "aveiro"
 *     "c ronaldo" → "ronaldo"
 *     "ronaldo" → "ronaldo"
 * @param {string} normalized
 */
export function lastNameOf(normalized) {
  const parts = normalized.split(" ").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * Pega todos os "tokens" >1 char — pra comparar interseção.
 * Remove a inicial de 1 char ("C." normalizado vira "c") pra não poluir.
 */
export function tokensOf(normalized) {
  return normalized.split(" ").filter((t) => t.length > 1);
}

/**
 * Normaliza nome de clube. FIFA usa nomes longos ("FC Bayern München",
 * "Manchester United", "Paris Saint-Germain"). UCL usa curtos
 * ("Bayern", "Man. United", "Paris"). Esse cara remove prefixos/sufixos
 * comuns (FC, AFC, CF, SC, "1.", etc.) e abreviações.
 */
export function normalizeClub(s) {
  if (!s) return "";
  let n = normalizeName(s);
  // remove abreviações e prefixos comuns
  n = n
    .replace(/\bfc\b/g, "")
    .replace(/\bafc\b/g, "")
    .replace(/\bcf\b/g, "")
    .replace(/\bsc\b/g, "")
    .replace(/\bac\b/g, "")
    .replace(/\bas\b/g, "")
    .replace(/\brc\b/g, "")
    .replace(/\b1\b/g, "")
    .replace(/\bmanchester\b/g, "man")
    .replace(/\bparis saint germain\b/g, "paris")
    .replace(/\bparis saint-germain\b/g, "paris")
    .replace(/\s+/g, " ")
    .trim();
  return n;
}
