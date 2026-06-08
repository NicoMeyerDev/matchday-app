import CollapsiblePanel from "./CollapsiblePanel";

/**
 * Spielerliste für Auswahl und Bankverwaltung.
 * Ein Klick auf einen Spieler markiert ihn für die nächste Feldposition.
 */
export default function PlayerList({ players, selectedPlayerId, onSelectPlayer, onAddToBench }) {
  return (
    <CollapsiblePanel
      title="Spieler"
      description="Spieler anklicken, danach Position auf dem Feld wählen."
      className="player-panel"
      defaultOpen={true}
    >
      <div className="player-list">
        {players.map((player) => {
          const isSelected = selectedPlayerId === player.id;

          return (
            <article key={player.id} className={`player-card ${isSelected ? "selected" : ""}`}>
              <button type="button" className="player-main" onClick={() => onSelectPlayer(player.id)}>
                <span className="shirt">#{player.shirt_number}</span>
                <span>
                  <strong>{player.name}</strong>
                  <small>{player.preferred_positions || "Keine Position"}</small>
                </span>
              </button>
              <button type="button" className="ghost-button" onClick={() => onAddToBench(player)}>
                Bank
              </button>
            </article>
          );
        })}
      </div>
    </CollapsiblePanel>
  );
}
