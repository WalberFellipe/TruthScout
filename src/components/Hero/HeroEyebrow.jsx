export function HeroEyebrow({ over, label }) {
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.22em",
        color: over ? "var(--pos)" : "var(--neg)",
        textTransform: "uppercase",
        marginBottom: 22,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: over ? "var(--pos)" : "var(--neg)",
          boxShadow: `0 0 14px ${over ? "var(--pos)" : "var(--neg)"}`,
        }}
      />
      {label}
    </div>
  );
}
