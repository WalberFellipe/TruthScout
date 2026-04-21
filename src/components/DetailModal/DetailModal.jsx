import { useEffect, useState } from "react";
import { POS_AVG } from "@/data/index.js";
import { generateAnalysis } from "@/utils/transformPlayer.js";
import { ClubBadge, PlayerAvatar } from "@/components/primitives/index.js";
import { AttrRow } from "./AttrRow.jsx";
import { GoalBreakdown } from "./GoalBreakdown.jsx";
import { KpiCard } from "./KpiCard.jsx";
import { LegendSwatch } from "./LegendSwatch.jsx";
import { MetaCell } from "./MetaCell.jsx";

const ATTR_KEYS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];

// Cor discreta derivada do nome do clube pro gradiente sutil de fundo.
// Quando tem logo real, o gradiente fica só decorativo.
function hashTint(str) {
  let h = 0;
  for (let i = 0; i < (str ?? "").length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 45%, 40%)`;
}

export function DetailModal({ player, onClose, t }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    setEntered(false);
    const id = setTimeout(() => setEntered(true), 20);
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [player, onClose]);

  if (!player) return null;
  const delta = +((player.real - player.exp).toFixed(1));
  const positive = delta >= 0;
  const pct = player.exp > 0.01 ? ((player.real - player.exp) / player.exp) * 100 : 0;
  const avg = POS_AVG[player.pos] || POS_AVG.FWD;
  const goals = player.breakdown || {};
  const blurb = generateAnalysis(player);
  const clubTint = hashTint(player.clubName);

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: entered ? "rgba(5, 8, 11, 0.75)" : "rgba(5, 8, 11, 0)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "64px 24px",
        overflow: "auto",
        transition: "background 250ms ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "var(--surface)",
          borderRadius: 24,
          border: "1px solid var(--line)",
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.6)",
          overflow: "hidden",
          transform: entered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
          opacity: entered ? 1 : 0,
          transition: "opacity 300ms ease, transform 400ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--line)",
            background: "var(--surface-2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--fg-dim)",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: positive ? "var(--pos)" : "var(--neg)",
              }}
            />
            {positive ? t.over_short : t.under_short}performance · UCL 21/22
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid var(--line)",
              background: "var(--surface)",
              width: 32,
              height: 32,
              borderRadius: 999,
              cursor: "pointer",
              color: "var(--fg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 0 }}>
          <div
            style={{
              padding: "32px 32px 28px",
              borderRight: "1px solid var(--line)",
              background: `linear-gradient(180deg, color-mix(in oklab, ${clubTint} 12%, var(--surface)) 0%, var(--surface) 70%)`,
            }}
          >
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <PlayerAvatar player={player} size={84} />
              <div>
                <h2
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 800,
                    fontSize: 30,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    margin: 0,
                    color: "var(--fg)",
                  }}
                >
                  {player.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <ClubBadge logoUrl={player.clubLogoUrl} name={player.clubName} code={player.club} size={18} />
                  <span style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--fg-dim)" }}>{player.clubName}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
                marginTop: 22,
                border: "1px solid var(--line)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <MetaCell label={t.position} value={player.pos} />
              <MetaCell label={t.age} value={player.age} borderLeft />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <KpiCard
                label={t.kpi_expected}
                value={player.exp.toFixed(1)}
                sub={player.expPerGame != null ? `${player.expPerGame.toFixed(2)} ${t.per_game}` : undefined}
              />
              <KpiCard
                label={t.kpi_real}
                value={String(player.real)}
                sub={player.realPerGame != null ? `${player.realPerGame.toFixed(2)} ${t.per_game}` : undefined}
              />
              <KpiCard
                label={t.kpi_delta}
                value={`${positive ? "+" : ""}${delta.toFixed(1)}`}
                accent={positive ? "var(--pos)" : "var(--neg)"}
                sub={
                  player.deltaPerGame != null
                    ? `${positive ? "+" : ""}${player.deltaPerGame.toFixed(2)} ${t.per_game}`
                    : undefined
                }
              />
              <KpiCard
                label={t.kpi_pct}
                value={`${positive ? "+" : ""}${pct.toFixed(0)}%`}
                accent={positive ? "var(--pos)" : "var(--neg)"}
                sub={`${player.matchesPlayed} ${t.matches}`}
              />
            </div>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--fg-dimmer)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                <span>{t.model_confidence}</span>
                <span>{Math.round(72 + Math.min(28, Math.abs(delta) * 4))}%</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${72 + Math.min(28, Math.abs(delta) * 4)}%`,
                    background: positive ? "var(--pos)" : "var(--neg)",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: "32px 32px 28px" }}>
            <h3
              style={{
                fontFamily: "var(--display)",
                fontSize: 13,
                fontWeight: 700,
                margin: 0,
                color: "var(--fg-dim)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {t.attrs}
            </h3>

            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              {ATTR_KEYS.map((k) => (
                <AttrRow key={k} attr={k} value={player.attrs[k]} avg={avg[k]} positive={positive} />
              ))}
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 14,
                borderTop: "1px solid var(--line)",
                display: "flex",
                gap: 18,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--fg-dimmer)",
                textTransform: "uppercase",
              }}
            >
              <LegendSwatch color={positive ? "var(--pos)" : "var(--neg)"} label={player.name.split(" ").slice(-1)[0]} />
              <LegendSwatch color="var(--fg-dimmer)" label={`${player.pos} ${t.sample.toLowerCase()}`} dashed />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "28px 32px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface-2)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--display)",
              fontSize: 13,
              fontWeight: 700,
              margin: 0,
              color: "var(--fg-dim)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {t.breakdown} · {player.real} {t.tab_goals}
          </h3>

          <GoalBreakdown goals={goals} t={t} positive={positive} />
        </div>

        <div style={{ padding: "24px 32px 32px" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: positive ? "var(--pos)" : "var(--neg)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {positive ? t.why_over : t.why_under}
          </div>
          <p
            style={{
              fontFamily: "var(--body)",
              fontSize: 17,
              lineHeight: 1.55,
              color: "var(--fg)",
              margin: 0,
              maxWidth: 720,
              textWrap: "pretty",
            }}
          >
            {blurb}
          </p>
        </div>
      </div>
    </div>
  );
}
