export function NavTab({ active, onClick, label, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: "8px 16px",
        borderRadius: 999,
        fontFamily: "var(--display)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "-0.005em",
        background: active ? "var(--fg)" : "transparent",
        color: active ? "var(--bg)" : disabled ? "var(--fg-dimmer)" : "var(--fg-dim)",
        transition: "all 180ms ease",
      }}
    >
      {label}
    </button>
  );
}
