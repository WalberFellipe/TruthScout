import { useEffect, useState } from "react";
import { api } from "@/api/client.js";
import { transformPlayer } from "@/utils/transformPlayer.js";

/**
 * Carrega jogadores por direção (over/under). Retorna { players, loading, error }.
 * Limite alto pra pegar todos — frontend filtra/ordena localmente.
 */
export function usePlayers(direction) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fetcher = direction === "over" ? api.over : api.under;
    fetcher({ limit: 500 })
      .then((raw) => {
        if (cancelled) return;
        setPlayers(raw.map(transformPlayer));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [direction]);

  return { players, loading, error };
}
