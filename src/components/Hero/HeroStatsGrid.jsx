import { StatCell } from "./StatCell.jsx";

export function HeroStatsGrid({ t, over, n1, n2, n3 }) {
  return (
    <div
      style={{
        marginTop: 56,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        background: "var(--line)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <StatCell value={Math.round(n1)} label={t.stat_1} />
      <StatCell
        value={Math.round(n2)}
        label={over ? t.stat_2_over : t.stat_2_under}
        accent={over ? "var(--pos)" : "var(--neg)"}
      />
      <StatCell
        value={`${over ? "+" : "−"}${Math.round(n3)}`}
        label={over ? t.stat_3_over : t.stat_3_under}
        accent={over ? "var(--pos)" : "var(--neg)"}
      />
    </div>
  );
}
