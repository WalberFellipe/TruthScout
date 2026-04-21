export function MetaCell({ label, value, borderLeft }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderLeft: borderLeft ? "1px solid var(--line)" : "none",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 9,
          letterSpacing: "0.16em",
          color: "var(--fg-dimmer)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--fg)",
          marginTop: 4,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
