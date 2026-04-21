import { TruthScoutLogo } from "@/components/primitives/index.js";

export function Footer({ t }) {
  return (
    <footer
      style={{
        marginTop: 80,
        padding: "48px 32px 36px",
        borderTop: "1px solid var(--line)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        <div>
          <TruthScoutLogo />
          <p
            style={{
              fontFamily: "var(--body)",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              marginTop: 16,
              maxWidth: 500,
            }}
          >
            {t.footer_credits}
          </p>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--fg-dimmer)",
              marginTop: 12,
              textTransform: "uppercase",
            }}
          >
            {t.footer_disclaimer}
          </p>
        </div>
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid var(--line)",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--fg-dim)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--pos)",
              boxShadow: "0 0 8px var(--pos)",
            }}
          />
          {t.footer_powered}
        </div>
      </div>
    </footer>
  );
}
