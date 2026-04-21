export function TruthScoutLogo({
  size = 28,
  tone = "var(--fg)",
  accent = "var(--pos)",
  withWordmark = true,
}) {
  const strokeStyle = { stroke: tone, fill: "none", strokeWidth: 1.6, strokeLinecap: "round" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-label="Truth Scout logo">
        <circle cx="16" cy="16" r="13" {...strokeStyle} />
        <circle cx="16" cy="16" r="8" {...strokeStyle} />
        <line x1="16" y1="1" x2="16" y2="5" {...strokeStyle} />
        <line x1="16" y1="27" x2="16" y2="31" {...strokeStyle} />
        <line x1="1" y1="16" x2="5" y2="16" {...strokeStyle} />
        <line x1="27" y1="16" x2="31" y2="16" {...strokeStyle} />
        <circle cx="16" cy="16" r="2.6" fill={accent} />
        <circle cx="16" cy="16" r="2.6" fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="4" />
      </svg>
      {withWordmark && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "var(--display)",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
            }}
          >
            Truth Scout
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "var(--fg-dim)",
              marginTop: 3,
              textTransform: "uppercase",
            }}
          >
            Overperformance · UCL 21/22
          </span>
        </div>
      )}
    </div>
  );
}
