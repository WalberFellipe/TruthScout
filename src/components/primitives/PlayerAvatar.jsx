import { useState } from "react";
import { mix } from "@/utils/mixColor.js";

// Gera cor estável a partir do nome — usado só quando não tem foto.
// Mantém a estética da grade (cada jogador com uma cor consistente)
// sem precisar de CLUBS hardcoded.
function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

export function PlayerAvatar({ player, size = 72 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = player?.faceUrl && !imgFailed;

  if (showImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: "var(--surface-2)",
          flexShrink: 0,
          boxShadow: "inset 0 -2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <img
          src={player.faceUrl}
          alt={player.name}
          // sofifa CDN retorna 403 quando o Referer é de outro domínio
          // (proteção contra hotlink). no-referrer omite o header,
          // fazendo o CDN tratar como acesso direto.
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
            display: "block",
          }}
        />
      </div>
    );
  }

  // Fallback: gradiente colorido + iniciais
  const tint = hashColor(player?.name ?? "?");
  const initials = (player?.name ?? "?")
    .split(" ")
    .filter((w) => !/^(jr\.?|de|da|do|dos|van|von)$/i.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 25%, ${mix(tint, "#ffffff", 0.2)} 0%, ${tint} 60%, ${mix(tint, "#000000", 0.25)} 100%)`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--display)",
        fontWeight: 800,
        fontSize: size * 0.38,
        letterSpacing: "-0.02em",
        boxShadow: "inset 0 -2px 8px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.3)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
