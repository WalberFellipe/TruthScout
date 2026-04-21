// Rotas HTTP. Fica fino — delega a lógica pra services/predictions.js.

import { Router } from "express";
import {
  getPlayersByDirection,
  getPlayerById,
  getStats,
} from "../services/predictions.js";

const router = Router();

// GET /api/players/stats — números do Hero
router.get("/stats", (_req, res) => {
  res.json(getStats());
});

// GET /api/players/over?pos=FWD&club=BAY&q=lew
router.get("/over", (req, res) => {
  const { pos, club, q, limit } = req.query;
  res.json(
    getPlayersByDirection("over", {
      pos,
      club,
      q,
      limit: limit ? Number(limit) : undefined,
    }),
  );
});

// GET /api/players/under?...
router.get("/under", (req, res) => {
  const { pos, club, q, limit } = req.query;
  res.json(
    getPlayersByDirection("under", {
      pos,
      club,
      q,
      limit: limit ? Number(limit) : undefined,
    }),
  );
});

// GET /api/players/:id — detalhe pro modal
router.get("/:id", (req, res) => {
  const player = getPlayerById(req.params.id);
  if (!player) return res.status(404).json({ error: "player not found" });
  res.json(player);
});

export default router;
