/**
 * Seitliches Spielerfenster.
 * Im ausgeklappten Zustand zeigt es die komplette Mannschaft; im eingeklappten Zustand bleibt nur ein schmaler Griff sichtbar.
 */
export default function PlayerList({ players, selectedPlayerId, isOpen, onToggle, onSelectPlayer, onAddToBench }) {
  return (
    <aside className={`player-drawer ${isOpen ? "open" : "closed"}`}>
      <button
        type="button"
        className="drawer-toggle"
        onClick={onToggle}
        aria-label={isOpen ? "Spieler einklappen" : "Spieler ausklappen"}
        title={isOpen ? "Spieler einklappen" : "Spieler ausklappen"}
      >
        {isOpen ? "‹" : "›"}
      </button>

      {isOpen && (
        <div className="player-drawer-content">
          <div className="section-title">
            <h2>Spieler</h2>
            <p>Komplette Mannschaft. Spieler direkt wählen oder auf die Bank setzen.</p>
          </div>

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
        </div>
      )}
    </aside>
  );
}
