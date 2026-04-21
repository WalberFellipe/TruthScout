import { useEffect, useRef, useState } from "react";
import { ClubBadge, DeltaChip, PlayerAvatar } from "@/components/primitives/index.js";
import { ComparisonRow } from "./ComparisonRow.jsx";

export function PlayerCard({ player, onOpen, t }) {
  const delta = +((player.real - player.exp).toFixed(1));
  const positive = delta >= 0;
  const expPct = Math.max(player.exp, player.real, 0.01);
  const [animIn, setAnimIn] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setAnimIn(true);
    }, { threshold: 0.2 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [player.id]);

  return (
    <article
      ref={cardRef}
      className="player-card"
      data-positive={positive}
      onClick={() => onOpen(player)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <PlayerAvatar player={player} size={64} />
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            fontFamily: "var(--mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--fg-dim)",
          }}
        >
          {player.pos}
        </span>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3
          style={{
            fontFamily: "var(--display)",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
            color: "var(--fg)",
            textWrap: "balance",
          }}
        >
          {player.name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <ClubBadge logoUrl={player.clubLogoUrl} name={player.clubName} code={player.club} size={16} />
          <span
            style={{
              fontFamily: "var(--body)",
              fontSize: 13,
              color: "var(--fg-dim)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            {player.clubName}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--fg-dimmer)",
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            {player.matchesPlayed} {t.matches}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <DeltaChip delta={delta} size="md" goalsLabel={t.tab_goals} />
      </div>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        <ComparisonRow
          label={t.expected}
          value={+player.exp.toFixed(1)}
          perGame={player.expPerGame}
          perGameLabel={t.per_game_short}
          pct={(player.exp / expPct) * 100}
          color="var(--fg-dimmer)"
          animIn={animIn}
          delay={0}
        />
        <ComparisonRow
          label={t.real}
          value={player.real}
          perGame={player.realPerGame}
          perGameLabel={t.per_game_short}
          pct={(player.real / expPct) * 100}
          color={positive ? "var(--pos)" : "var(--neg)"}
          animIn={animIn}
          delay={120}
        />
      </div>

      <div
        className="view-cta"
        style={{
          marginTop: 20,
          padding: "10px 12px",
          borderRadius: 10,
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          fontFamily: "var(--mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "var(--fg-dim)",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{t.view}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 6h6M6 3l3 3-3 3" />
        </svg>
      </div>
    </article>
  );
}
