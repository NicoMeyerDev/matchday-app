/**
 * Visuelles Spielfeld.
 * Positionen kommen direkt aus der Formation-API und werden über x/y-Koordinaten platziert.
 */
export default function Pitch({ formation, assignedSlots, selectedPlayer, onAssignPlayer, onClearPosition }) {
  if (!formation) {
    return <section className="pitch empty">Keine Formation ausgewählt.</section>;
  }

  return (
    <section className="pitch-wrap">
      <div className="pitch">
        <div className="center-circle" />
        <div className="box box-top" />
        <div className="box box-bottom" />

        {formation.positions.map((position) => {
          const slot = assignedSlots[position.id];
          const player = slot?.player_detail;

          return (
            <button
              key={position.id}
              type="button"
              className={`position-dot ${player ? "filled" : ""}`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={() => onAssignPlayer(position)}
              onDoubleClick={() => onClearPosition(position.id)}
              title="Klick: Spieler setzen · Doppelklick: Position leeren"
            >
              <span className="position-label">{position.label}</span>
              {player ? (
                <span className="player-on-pitch">#{player.shirt_number} {player.name}</span>
              ) : (
                <span className="empty-slot">frei</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pitch-hint">
        {selectedPlayer ? `Ausgewählt: #${selectedPlayer.shirt_number} ${selectedPlayer.name}` : "Kein Spieler ausgewählt"}
      </div>
    </section>
  );
}
