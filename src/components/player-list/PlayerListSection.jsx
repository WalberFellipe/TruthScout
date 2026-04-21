import { PlayerCard } from "@/components/PlayerCard/PlayerCard.jsx";
import { Container } from "@/components/layout/Container.jsx";
import { EmptyPlayerList } from "./EmptyPlayerList.jsx";
import { ListSectionHeader } from "./ListSectionHeader.jsx";

export function PlayerListSection({ direction, t, players, baseLength, sortKey, onOpenPlayer }) {
  const title = direction === "over" ? t.nav_over : t.nav_under;

  return (
    <Container as="section" style={{ marginTop: 28 }}>
      <ListSectionHeader
        title={title}
        count={players.length}
        total={baseLength}
        ofLabel={t.of}
        sortKey={sortKey}
        rankedLabel={t.ranked}
      />

      {players.length > 0 ? (
        <div className="player-grid">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} onOpen={onOpenPlayer} t={t} />
          ))}
        </div>
      ) : (
        <EmptyPlayerList message={t.no_results} />
      )}
    </Container>
  );
}
