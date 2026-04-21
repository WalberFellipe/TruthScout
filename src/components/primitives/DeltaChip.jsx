export function DeltaChip({ delta, size = "md", goalsLabel = "goals" }) {
  const positive = delta >= 0;
  const sizes = {
    sm: { fs: 13, pad: "4px 8px", icon: 10 },
    md: { fs: 22, pad: "8px 14px", icon: 14 },
    lg: { fs: 34, pad: "12px 18px", icon: 18 },
  };
  const s = sizes[size];
  const fg = positive ? "var(--pos)" : "var(--neg)";
  const bg = positive
    ? "color-mix(in oklab, var(--pos) 9%, transparent)"
    : "color-mix(in oklab, var(--neg) 9%, transparent)";
  const border = positive
    ? "color-mix(in oklab, var(--pos) 25%, transparent)"
    : "color-mix(in oklab, var(--neg) 25%, transparent)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: s.pad,
        borderRadius: 10,
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        fontFamily: "var(--display)",
        fontWeight: 800,
        fontSize: s.fs,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      <svg width={s.icon} height={s.icon} viewBox="0 0 12 12" fill="none">
        <path d={positive ? "M6 1 L11 8 L1 8 Z" : "M6 11 L1 4 L11 4 Z"} fill={fg} />
      </svg>
      {positive ? "+" : ""}
      {delta.toFixed(1)}
      <span style={{ fontSize: s.fs * 0.55, fontWeight: 600, opacity: 0.75, marginLeft: 2 }}>{goalsLabel}</span>
    </span>
  );
}
