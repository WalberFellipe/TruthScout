/** Mistura hexadecimal simples (gradientes de avatar) */
export function mix(hex1, hex2, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex1);
  const b = p(hex2);
  const r = a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));
  return `#${r.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
