import { useEffect, useMemo, useState } from "react";
import { UI_DEFAULTS } from "@/config/defaults.js";
import { usePlayers } from "@/hooks/usePlayers.js";
import { deriveClubs } from "@/utils/transformPlayer.js";
import {
  DetailModal,
  FilterBar,
  Footer,
  Header,
  Hero,
  MethodologyModal,
  PlayerListSection,
  TweaksPanel,
} from "@/components/index.js";
import { getMessages } from "@/i18n/index.js";

export default function App() {
  const [theme, setTheme] = useState(UI_DEFAULTS.theme);
  const [lang, setLang] = useState(UI_DEFAULTS.lang);
  const [direction, setDirection] = useState(UI_DEFAULTS.direction);
  const [filters, setFilters] = useState({ pos: "ALL", club: "ALL", sort: "abs", q: "" });
  const [selected, setSelected] = useState(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const t = getMessages(lang);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    setFilters((f) => ({ ...f, q: "", club: "ALL" }));
  }, [direction]);

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const persist = (patch) => {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
  };

  const { players: base, loading, error } = usePlayers(direction);
  const clubs = useMemo(() => deriveClubs(base), [base]);

  const players = useMemo(() => {
    let list = base.filter((p) => {
      if (filters.pos !== "ALL" && p.pos !== filters.pos) return false;
      if (filters.club !== "ALL" && p.club !== filters.club) return false;
      if (filters.q && !p.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
      return true;
    });
    if (filters.sort === "abs") {
      list.sort((a, b) => Math.abs(b.real - b.exp) - Math.abs(a.real - a.exp));
    } else if (filters.sort === "pct") {
      // Evita divisão por zero: joga expected < 0.01 pro fim
      const pct = (p) => (p.exp > 0.01 ? Math.abs((p.real - p.exp) / p.exp) : -1);
      list.sort((a, b) => pct(b) - pct(a));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [base, filters]);

  return (
    <div>
      <Header
        t={t}
        lang={lang}
        setLang={(l) => {
          setLang(l);
          persist({ lang: l });
        }}
        theme={theme}
        setTheme={(th) => {
          setTheme(th);
          persist({ theme: th });
        }}
        direction={direction}
        setDirection={(d) => {
          setDirection(d);
          persist({ direction: d });
        }}
        onOpenMethod={() => setMethodOpen(true)}
      />

      <main key={`${direction}-${lang}`} className="fade-key">
        <Hero t={t} direction={direction} />
        <FilterBar
          t={t}
          filters={filters}
          setFilters={setFilters}
          direction={direction}
          clubs={clubs}
        />

        {error ? (
          <div
            style={{
              padding: "40px 32px",
              textAlign: "center",
              color: "var(--neg)",
              fontFamily: "var(--mono)",
              fontSize: 13,
            }}
          >
            Erro ao carregar dados: {error.message}. Verifica se o servidor tá rodando (npm run server).
          </div>
        ) : loading ? (
          <div
            style={{
              padding: "80px 32px",
              textAlign: "center",
              color: "var(--fg-dim)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Carregando predições…
          </div>
        ) : (
          <PlayerListSection
            direction={direction}
            t={t}
            players={players}
            baseLength={base.length}
            sortKey={filters.sort}
            onOpenPlayer={setSelected}
          />
        )}

        <Footer t={t} />
      </main>

      {selected && <DetailModal player={selected} onClose={() => setSelected(null)} t={t} />}

      {methodOpen && <MethodologyModal onClose={() => setMethodOpen(false)} t={t} />}

      {tweaksOpen && (
        <TweaksPanel
          t={t}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
          direction={direction}
          setDirection={setDirection}
          onPersist={persist}
        />
      )}
    </div>
  );
}
