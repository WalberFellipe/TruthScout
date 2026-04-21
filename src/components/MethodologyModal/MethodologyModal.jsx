import { useEffect, useState } from "react";

// Modal que documenta tudo que a app faz: ingestão, matching, features,
// modelo e limitações. Mesma estética de overlay do DetailModal.

export function MethodologyModal({ onClose, t }) {
  const m = t.methodology;
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
  }, [onClose]);

  if (!m) return null;

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
          maxWidth: 860,
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
        {/* Eyebrow + Close */}
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
                background: "var(--fg-dim)",
              }}
            />
            {m.eyebrow}
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
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>

        {/* Intro */}
        <div style={{ padding: "36px 36px 0" }}>
          <h2
            style={{
              fontFamily: "var(--display)",
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
              color: "var(--fg)",
            }}
          >
            {m.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--body)",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              marginTop: 16,
              marginBottom: 0,
              maxWidth: 720,
              textWrap: "pretty",
            }}
          >
            {m.intro}
          </p>
        </div>

        {/* Pipeline */}
        <Section eyebrow={m.pipeline_title}>
          <div style={{ display: "grid", gap: 12 }}>
            {m.pipeline_steps.map((step, i) => (
              <PipelineStep key={i} n={i + 1} title={step.title} body={step.body} />
            ))}
          </div>
        </Section>

        {/* Model */}
        <Section eyebrow={m.model_title}>
          <p
            style={{
              fontFamily: "var(--body)",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--fg)",
              margin: 0,
              textWrap: "pretty",
            }}
          >
            {m.model_body}
          </p>
        </Section>

        {/* Metrics */}
        <Section eyebrow={m.metrics_title}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${m.metrics.length}, 1fr)`,
              gap: 1,
              background: "var(--line)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {m.metrics.map((kpi, i) => (
              <div
                key={i}
                style={{
                  background: "var(--surface)",
                  padding: "18px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    color: "var(--fg-dimmer)",
                    textTransform: "uppercase",
                  }}
                >
                  {kpi.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 800,
                    fontSize: 22,
                    marginTop: 4,
                    letterSpacing: "-0.02em",
                    color: "var(--fg)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Limits */}
        <Section eyebrow={m.limits_title}>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 10,
            }}
          >
            {m.limits.map((lim, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "var(--body)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--fg-dim)",
                  paddingLeft: 22,
                  position: "relative",
                  textWrap: "pretty",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 9,
                    width: 8,
                    height: 2,
                    background: "var(--neg)",
                    opacity: 0.7,
                    borderRadius: 1,
                  }}
                />
                {lim}
              </li>
            ))}
          </ul>
        </Section>

        {/* Stack */}
        <div
          style={{
            padding: "24px 36px 36px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface-2)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--fg-dimmer)",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {m.stack_title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {m.stack_items.map((item, i) => (
              <span
                key={i}
                style={{
                  padding: "8px 14px",
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  background: "var(--surface)",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: "var(--fg-dim)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ eyebrow, children }) {
  return (
    <div style={{ padding: "32px 36px 0" }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--fg-dim)",
          textTransform: "uppercase",
          marginBottom: 16,
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </div>
      {children}
    </div>
  );
}

function PipelineStep({ n, title, body }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "42px 1fr",
        gap: 16,
        padding: "16px 18px",
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--display)",
          fontWeight: 800,
          fontSize: 14,
          color: "var(--fg)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontFamily: "var(--body)",
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "var(--fg-dim)",
            margin: "6px 0 0",
            textWrap: "pretty",
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
