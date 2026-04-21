import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container.jsx";
import { useCountUp } from "@/hooks/useCountUp.js";
import { useStats } from "@/hooks/useStats.js";
import { HeroEyebrow } from "./HeroEyebrow.jsx";
import { HeroStatsGrid } from "./HeroStatsGrid.jsx";

export function Hero({ t, direction }) {
  const over = direction === "over";
  const stats = useStats();
  const totalAnalyzed = stats.total;
  const detected = over ? stats.overperformers : stats.underperformers;
  // `goals_above_expected` só faz sentido pra over; pra under mostramos o
  // acumulado das diferenças negativas (mesmo valor, sinal invertido)
  const goalsDelta = Math.round(stats.goals_above_expected);

  const [inView, setInView] = useState(false);
  useEffect(() => {
    setInView(false);
    const id = setTimeout(() => setInView(true), 50);
    return () => clearTimeout(id);
  }, [direction]);

  const n1 = useCountUp(totalAnalyzed, 1200, inView);
  const n2 = useCountUp(detected, 1300, inView);
  const n3 = useCountUp(goalsDelta, 1500, inView);

  return (
    <Container as="section" style={{ padding: "72px 32px 48px" }}>
      <HeroEyebrow over={over} label={over ? t.hero_eyebrow_over : t.hero_eyebrow_under} />

      <h1
        style={{
          fontFamily: "var(--display)",
          fontWeight: 800,
          fontSize: "clamp(40px, 6.2vw, 84px)",
          lineHeight: 0.98,
          letterSpacing: "-0.035em",
          color: "var(--fg)",
          margin: 0,
          maxWidth: 1100,
          textWrap: "balance",
        }}
      >
        {over ? t.hero_over_title : t.hero_under_title}
      </h1>

      <p
        style={{
          fontFamily: "var(--body)",
          fontSize: 18,
          lineHeight: 1.55,
          color: "var(--fg-dim)",
          maxWidth: 640,
          marginTop: 24,
          textWrap: "pretty",
        }}
      >
        {t.hero_sub}
      </p>

      <HeroStatsGrid t={t} over={over} n1={n1} n2={n2} n3={n3} />
    </Container>
  );
}
