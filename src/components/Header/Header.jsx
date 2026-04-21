import { TruthScoutLogo } from "@/components/primitives/index.js";
import { NavTab } from "./NavTab.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";

const LANGS = ["EN-US", "PT-BR", "ES"];
const LANG_LABEL = { "EN-US": "EN", "PT-BR": "PT", ES: "ES" };

export function Header({ t, lang, setLang, theme, setTheme, direction, setDirection, onOpenMethod }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in oklab, var(--bg) 85%, transparent)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "18px 32px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div>
          <TruthScoutLogo />
        </div>

        <nav
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            borderRadius: 999,
          }}
        >
          <NavTab active={direction === "over"} onClick={() => setDirection("over")} label={t.nav_over} />
          <NavTab active={direction === "under"} onClick={() => setDirection("under")} label={t.nav_under} />
          <NavTab active={false} onClick={onOpenMethod} label={t.nav_method} />
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              gap: 2,
              padding: 3,
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: 999,
            }}
          >
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  background: lang === l ? "var(--fg)" : "transparent",
                  color: lang === l ? "var(--bg)" : "var(--fg-dim)",
                  transition: "all 160ms ease",
                }}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}
