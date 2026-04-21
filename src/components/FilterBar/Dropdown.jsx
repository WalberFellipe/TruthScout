import { useEffect, useRef, useState } from "react";

export function Dropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--body)",
          fontSize: 13,
          color: "var(--fg)",
          cursor: "pointer",
          minWidth: 180,
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              color: "var(--fg-dimmer)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
          <span>{current.label}</span>
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 6,
            minWidth: 220,
            zIndex: 30,
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                background: value === o.value ? "var(--surface-2)" : "transparent",
                padding: "9px 12px",
                borderRadius: 8,
                fontFamily: "var(--body)",
                fontSize: 13,
                color: "var(--fg)",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
