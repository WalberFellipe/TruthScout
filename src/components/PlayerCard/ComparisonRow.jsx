// Agora mostra DOIS valores: total no torneio (destaque) e taxa por jogo
// (subtítulo). Deixa explícito que a predição do modelo é por-jogo e que
// o total vem de multiplicar pela minutagem real.
export function ComparisonRow({ label, value, perGame, pct, color, animIn, delay, perGameLabel }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "62px 1fr 64px", gap: 10, alignItems: "center" }}>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-dimmer)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          height: 6,
          background: "var(--surface-2)",
          borderRadius: 999,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: animIn ? `${pct}%` : "0%",
            background: color,
            borderRadius: 999,
            transition: `width 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
          }}
        />
      </div>
      <div style={{ textAlign: "right", lineHeight: 1 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontWeight: 800,
            fontSize: 14,
            color: "var(--fg)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value.toFixed(1)}
        </div>
        {perGame !== undefined && (
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              color: "var(--fg-dimmer)",
              fontVariantNumeric: "tabular-nums",
              marginTop: 3,
              letterSpacing: "0.04em",
            }}
          >
            {perGame.toFixed(2)}
            {perGameLabel ?? "/j"}
          </div>
        )}
      </div>
    </div>
  );
}
