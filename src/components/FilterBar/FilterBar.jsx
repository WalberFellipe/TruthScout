import { Container } from "@/components/layout/Container.jsx";
import { Dropdown } from "./Dropdown.jsx";

// Só atacantes e meias ofensivos — o modelo não foi treinado com DEF/GK
// (eles enviesavam a distribuição pra zero), então nem aparecem no dataset.
const POSITIONS = ["ALL", "FWD", "MID"];

export function FilterBar({ t, filters, setFilters, direction, clubs = [] }) {
  const posLabel = (p) => (p === "ALL" ? t.filter_all : p);
  return (
    <Container as="section" style={{ marginTop: 16 }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: 14,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--surface-2)",
            padding: 4,
            borderRadius: 12,
            border: "1px solid var(--line)",
          }}
        >
          {POSITIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilters({ ...filters, pos: p })}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "8px 14px",
                borderRadius: 8,
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                background: filters.pos === p ? "var(--fg)" : "transparent",
                color: filters.pos === p ? "var(--bg)" : "var(--fg-dim)",
                transition: "all 160ms ease",
              }}
            >
              {posLabel(p)}
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--fg-dimmer)",
            }}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="17" y1="17" x2="21" y2="21" />
          </svg>
          <input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder={t.search}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "10px 14px 10px 38px",
              fontFamily: "var(--body)",
              fontSize: 13,
              color: "var(--fg)",
              outline: "none",
            }}
          />
        </div>

        <Dropdown
          label={t.filter_club}
          value={filters.club}
          onChange={(v) => setFilters({ ...filters, club: v })}
          options={[
            { value: "ALL", label: t.filter_club_all },
            ...clubs.map((c) => ({ value: c.code, label: c.name })),
          ]}
        />

        <Dropdown
          label={t.filter_sort}
          value={filters.sort}
          onChange={(v) => setFilters({ ...filters, sort: v })}
          options={[
            { value: "abs", label: t.sort_abs },
            { value: "pct", label: direction === "over" ? t.sort_pct : t.sort_pct_neg },
            { value: "alpha", label: t.sort_alpha },
          ]}
        />
      </div>
    </Container>
  );
}
