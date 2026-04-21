// Entry do backend Express. Porta 3001 por padrão.
// Convive com o dev server do Vite (porta 5173) via CORS liberado em dev.

import express from "express";
import cors from "cors";
import playersRouter from "./routes/players.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check — útil pro front detectar se a API tá no ar
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/players", playersRouter);

// 404 JSON (melhor que HTML default do Express)
app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

// Handler genérico — loga o erro mas não vaza stack pro cliente
app.use((err, _req, res, _next) => {
  console.error("[api error]", err);
  res.status(500).json({ error: "internal error" });
});

app.listen(PORT, () => {
  console.log(`[api] rodando em http://localhost:${PORT}`);
});
