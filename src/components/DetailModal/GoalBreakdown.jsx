export function GoalBreakdown({ goals, t, positive }) {
  const entries = [
    ["rightFoot", t.goal_rightFoot],
    ["leftFoot", t.goal_leftFoot],
    ["header", t.goal_header],
    ["insideBox", t.goal_insideBox],
    ["outsideBox", t.goal_outsideBox],
    ["penalty", t.goal_penalty],
    ["other", t.goal_other],
  ];
  const max = Math.max(...entries.map(([k]) => goals[k] || 0), 1);
  const color = positive ? "var(--pos)" : "var(--neg)";
  return (
    <div
      style={{
        marginTop: 18,
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 8,
      }}
    >
      {entries.map(([k, label]) => {
        const v = goals[k] || 0;
        return (
          <div
            key={k}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "14px 10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              minHeight: 120,
              justifyContent: "flex-end",
            }}
          >
            <div style={{ height: 60, display: "flex", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${(v / max) * 100}%`,
                  background: v > 0 ? color : "var(--line)",
                  borderRadius: 6,
                  opacity: v > 0 ? 1 : 0.4,
                  transition: "height 700ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontWeight: 800,
                fontSize: 20,
                color: "var(--fg)",
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "var(--fg-dim)",
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
