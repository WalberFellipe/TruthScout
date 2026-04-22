import { useEffect, useState } from "react";

/**
 * Carrega o snapshot do pipeline (public/api/pipeline.json) gerado
 * pelo script `npm run export:json`. Contém datasets, matching,
 * training meta e top artilheiros reais do UCL. Renderizado no
 * modal de Metodologia como relatório público de transparência.
 */
export function usePipelineReport() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pipeline.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch(() => {
        // Sem report disponível → modal renderiza versão reduzida
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return report;
}
