import { useEffect, useState } from "react";

export function AttrRow({ attr, value, avg, positive }) {
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setAnimIn(true), 150);
    return () => clearTimeout(id);
  }, []);
  const valueColor = positive ? "var(--pos)" : "var(--neg)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "42px 1fr 56px", alignItems: "center", gap: 14 }}>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "var(--fg)",
        }}
      >
        {attr}
      </span>
      <div style={{ position: "relative", height: 18 }}>
        <div style={{ position: "absolute", inset: "6px 0 6px 0", background: "var(--surface-2)", borderRadius: 999 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 3,
            bottom: 3,
            width: animIn ? `${value}%` : "0%",
            background: valueColor,
            borderRadius: 999,
            transition: "width 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: `0 0 12px color-mix(in oklab, ${valueColor} 40%, transparent)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${avg}%`,
            top: -2,
            bottom: -2,
            width: 2,
            background: "var(--fg-dimmer)",
            borderRadius: 1,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--display)",
          fontWeight: 800,
          fontSize: 15,
          color: "var(--fg)",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}
