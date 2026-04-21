export function StatCell({ value, label, accent }) {
  return (
    <div style={{ background: "var(--surface)", padding: "32px 28px" }}>
      <div
        style={{
          fontFamily: "var(--display)",
          fontWeight: 800,
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: accent || "var(--fg)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--body)",
          fontSize: 14,
          color: "var(--fg-dim)",
          marginTop: 12,
          letterSpacing: "0.005em",
        }}
      >
        {label}
      </div>
    </div>
  );
}
