import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// O proxy /api → Express só é aplicado em `vite dev`. Em `vite preview`
// e `vite build` a gente quer o comportamento 100% estático, servindo
// /api/*.json direto de public/ (ou do dist/ depois de buildar).
export default defineConfig(({ command, isPreview }) => {
  const isDevServer = command === "serve" && !isPreview;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: isDevServer
      ? {
          proxy: {
            "/api": "http://localhost:3001",
          },
        }
      : undefined,
  };
});
