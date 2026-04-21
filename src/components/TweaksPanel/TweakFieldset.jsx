const labelStyle = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  color: "var(--fg-dim)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export function TweakFieldset({ label, children }) {
  return (
    <>
      <div style={labelStyle}>{label}</div>
      <div className="seg">{children}</div>
    </>
  );
}
