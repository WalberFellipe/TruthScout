import { SUPPORTED_LANGS } from "@/i18n/index.js";
import { TweakFieldset } from "./TweakFieldset.jsx";

/**
 * Painel opcional quando o host ativa o modo edição (iframe / preview).
 */
export function TweaksPanel({ t, theme, setTheme, lang, setLang, direction, setDirection, onPersist }) {
  const persist = (patch) => {
    onPersist(patch);
  };
  return (
    <div className="tweaks">
      <h4>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--pos)",
            boxShadow: "0 0 8px var(--pos)",
          }}
        />
        Tweaks
      </h4>

      <TweakFieldset label={t.tweaks_theme}>
        <button type="button" data-active={theme === "dark"} onClick={() => { setTheme("dark"); persist({ theme: "dark" }); }}>
          DARK
        </button>
        <button type="button" data-active={theme === "light"} onClick={() => { setTheme("light"); persist({ theme: "light" }); }}>
          LIGHT
        </button>
      </TweakFieldset>

      <TweakFieldset label={t.tweaks_lang}>
        {SUPPORTED_LANGS.map((l) => (
          <button
            key={l}
            type="button"
            data-active={lang === l}
            onClick={() => {
              setLang(l);
              persist({ lang: l });
            }}
          >
            {l.split("-")[0]}
          </button>
        ))}
      </TweakFieldset>

      <TweakFieldset label={t.tweaks_dir}>
        <button
          type="button"
          data-active={direction === "over"}
          onClick={() => {
            setDirection("over");
            persist({ direction: "over" });
          }}
        >
          OVER
        </button>
        <button
          type="button"
          data-active={direction === "under"}
          onClick={() => {
            setDirection("under");
            persist({ direction: "under" });
          }}
        >
          UNDER
        </button>
      </TweakFieldset>
    </div>
  );
}
