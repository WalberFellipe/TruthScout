// Relatório público do pipeline — renderizado dentro do modal de
// Metodologia. Puxa public/api/pipeline.json (gerado pelo script
// `npm run export:json`) e mostra os NÚMEROS REAIS da última execução:
// datasets, matching, training, top artilheiros ground-truth.
//
// Serve como transparência pra quem está auditando como o modelo
// chegou nas predições que vê no dashboard.

export function PipelineReport({ t, report }) {
  if (!report) return null;
  const r = t.methodology.report;

  const matchPct = Math.round(report.matching.rate * 100);
  const date = new Date(report.generatedAt);
  const dateStr = date.toLocaleDateString() + " · " + date.toLocaleTimeString();

  return (
    <div style={{ padding: "32px 36px 0" }}>
      {/* Section eyebrow e subtítulo */}
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--fg-dim)",
          textTransform: "uppercase",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {r.title}
      </div>
      <p
        style={{
          fontFamily: "var(--body)",
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--fg-dim)",
          margin: "0 0 6px",
        }}
      >
        {r.subtitle}
      </p>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "var(--fg-dimmer)",
          letterSpacing: "0.1em",
        }}
      >
        {r.generated_at}: {dateStr}
      </div>

      {/* Datasets */}
      <SubGroup title={r.datasets_title}>
        <KpiGrid cols={2}>
          <Kpi label={r.fifa_source} value={report.datasets.fifaSource.toLocaleString()} />
          <Kpi label={r.ucl_source} value={report.datasets.uclSource.toLocaleString()} />
        </KpiGrid>
      </SubGroup>

      {/* Matching + histogram de confiança */}
      <SubGroup title={r.matching_title}>
        <KpiGrid cols={3}>
          <Kpi label={r.matched_auto} value={report.matching.matched.toLocaleString()} />
          <Kpi label={r.match_rate} value={`${matchPct}%`} accent="var(--pos)" />
          <Kpi label={r.unmatched} value={report.matching.unmatched.toLocaleString()} />
        </KpiGrid>
        <ConfidenceHistogram buckets={report.matching.confidenceBuckets} labels={r} />
      </SubGroup>

      {/* Training meta */}
      {report.training && (
        <SubGroup title={r.training_title}>
          <KpiGrid cols={4}>
            <Kpi label={r.train_size} value={report.training.trainSize} />
            <Kpi label={r.val_size} value={report.training.valSize} />
            <Kpi
              label={r.val_mae}
              value={report.training.finalValMae.toFixed(3)}
              accent="var(--pos)"
            />
            <Kpi label={r.parameters} value={report.training.totalParameters.toLocaleString()} />
          </KpiGrid>
          <KpiGrid cols={3} tight>
            <Kpi label={r.features_label} value={report.training.featureCount} muted />
            <Kpi label={r.epochs_label} value={report.training.epochs} muted />
            <Kpi label={r.train_mae} value={report.training.finalTrainMae.toFixed(3)} muted />
          </KpiGrid>
        </SubGroup>
      )}

      {/* Top artilheiros ground-truth */}
      <SubGroup title={r.top_scorers_title}>
        <p
          style={{
            fontFamily: "var(--body)",
            fontSize: 13,
            color: "var(--fg-dim)",
            margin: "0 0 14px",
            lineHeight: 1.5,
          }}
        >
          {r.top_scorers_sub}
        </p>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: 8,
          }}
        >
          {report.topScorersReal.map((s, i) => (
            <li
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--fg-dimmer)",
                  letterSpacing: "0.08em",
                }}
              >
                #{i + 1}
              </div>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 14, fontWeight: 700 }}>
                  {s.player_name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--body)",
                    fontSize: 12,
                    color: "var(--fg-dim)",
                    marginTop: 2,
                  }}
                >
                  {s.club}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--fg)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.goals}{" "}
                <span
                  style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-dimmer)" }}
                >
                  {r.goals_label} · {r.in_matches} {s.matches_played}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </SubGroup>
    </div>
  );
}

// ---------- Sub-componentes ----------

function SubGroup({ title, children }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--fg-dimmer)",
          textTransform: "uppercase",
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function KpiGrid({ cols = 3, tight = false, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 1,
        background: "var(--line)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        overflow: "hidden",
        marginTop: tight ? 8 : 0,
      }}
    >
      {children}
    </div>
  );
}

function Kpi({ label, value, accent, muted }) {
  return (
    <div
      style={{
        background: muted ? "var(--surface-2)" : "var(--surface)",
        padding: muted ? "12px 12px" : "16px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 9,
          letterSpacing: "0.14em",
          color: "var(--fg-dimmer)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontWeight: 800,
          fontSize: muted ? 16 : 20,
          marginTop: 3,
          letterSpacing: "-0.02em",
          color: accent || "var(--fg)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ConfidenceHistogram({ buckets, labels }) {
  const rows = [
    { key: "exact", label: labels.conf_exact, n: buckets.exact },
    { key: "high", label: labels.conf_high, n: buckets.high },
    { key: "good", label: labels.conf_good, n: buckets.good },
    { key: "medium", label: labels.conf_medium, n: buckets.medium },
    { key: "low", label: labels.conf_low, n: buckets.low },
  ];
  const max = Math.max(...rows.map((r) => r.n), 1);

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
      {rows.map((row) => (
        <div
          key={row.key}
          style={{
            display: "grid",
            gridTemplateColumns: "130px 1fr 40px",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--fg-dim)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {row.label}
          </div>
          <div
            style={{
              height: 8,
              background: "var(--surface-2)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(row.n / max) * 100}%`,
                background:
                  row.key === "exact"
                    ? "var(--pos)"
                    : row.key === "low"
                      ? "var(--fg-dimmer)"
                      : "var(--fg-dim)",
                borderRadius: 999,
                transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--display)",
              fontWeight: 800,
              fontSize: 13,
              color: "var(--fg)",
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {row.n}
          </div>
        </div>
      ))}
    </div>
  );
}
