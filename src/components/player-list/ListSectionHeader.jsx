export function ListSectionHeader({ title, count, total, ofLabel, sortKey, rankedLabel }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--display)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--fg-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {title} ·
        <span
          style={{
            color: "var(--fg)",
            fontVariantNumeric: "tabular-nums",
            marginLeft: 8,
          }}
        >
          {count}
        </span>
        <span style={{ color: "var(--fg-dimmer)" }}>
          {" "}
          {ofLabel} {total}
        </span>
      </h2>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--fg-dimmer)",
          textTransform: "uppercase",
        }}
      >
        {rankedLabel} · {sortKey}
      </div>
    </div>
  );
}
