import { useEffect, useState } from "react";
import { api } from "@/api/client.js";

/**
 * Estatísticas globais pro Hero (contadores animados).
 * Fetch uma única vez por montagem — os números não mudam em runtime.
 */
export function useStats() {
  const [stats, setStats] = useState({
    total: 0,
    overperformers: 0,
    underperformers: 0,
    goals_above_expected: 0,
  });

  useEffect(() => {
    let cancelled = false;
    api
      .stats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        // Mantém zeros — UI renderiza mesmo sem API (modo offline degradado)
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
