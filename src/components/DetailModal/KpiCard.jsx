export function KpiCard({ label, value, accent, sub }) {
  return (
    <div
      style={{
        padding: "14px 14px",
        background: "var(--surface-2)",
        borderRadius: 12,
        border: "1px solid var(--line)",
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
          fontSize: 22,
          marginTop: 4,
          letterSpacing: "-0.02em",
          color: accent || "var(--fg)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            marginTop: 4,
            color: "var(--fg-dimmer)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.03em",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
