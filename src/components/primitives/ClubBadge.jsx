import { useState } from "react";

// Agora recebe dados diretos do jogador em vez de fazer lookup em CLUBS.
// Se tiver logoUrl, mostra o logo real; senão cai pro código de 3 letras
// colorido por hash estável do nome.
function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 60%, 50%)`;
}

export function ClubBadge({ logoUrl, name, code, size = 18 }) {
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={name ?? ""}
        // Mesmo motivo do PlayerAvatar — sofifa bloqueia hotlink
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
    );
  }

  const tint = hashColor(name ?? code ?? "?");
  const short = (code ?? name ?? "?").slice(0, 3).toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: tint,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--mono)",
        fontSize: size * 0.42,
        fontWeight: 700,
        letterSpacing: "0.02em",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
      }}
    >
      {short}
    </span>
  );
}
