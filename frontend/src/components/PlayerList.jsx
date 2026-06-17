/**
 * Seitliches Spielerfenster.
 * Im ausgeklappten Zustand zeigt es die komplette Mannschaft;
 * im eingeklappten Zustand bleibt nur ein schmaler Griff sichtbar.
 */
export default function PlayerList({
  players,
  selectedPlayerId,
  isOpen,
  assignedSlots,      
  substitutes,
  onToggle,
  onSelectPlayer,
  onAddToBench,
  onAddPlayer,
}) {
  // Welche Spieler-IDs sind auf dem Feld?
  const onFieldIds = new Set(
    Object.values(assignedSlots).map((slot) => slot.player)
  );

  // Welche Spieler-IDs sind auf der Bank?
  const onBenchIds = new Set(
    substitutes.map((sub) => sub.player_detail?.id || sub.player)
  );
  // Verletzte und gesperrte Spieler werden in der Vorbereitung nicht zur Auswahl angezeigt.
  const visiblePlayers = players.filter(
    (p) => p.status !== "injured" && p.status !== "suspended"
  );
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
            <div className="section-header">
              <h2>Spieler</h2>
            </div>

            <p>
              Komplette Mannschaft. Spieler direkt wählen oder auf die Bank
              setzen.
            </p>
          </div>

          <div className="player-list">
  {visiblePlayers.map((player) => {
    const isSelected = selectedPlayerId === player.id;
    const isOnField = onFieldIds.has(player.id);
    const isOnBench = onBenchIds.has(player.id);

    return (
      <article
        key={player.id}
        className={`player-card ${isSelected ? "selected" : ""} ${isOnField || isOnBench ? "assigned" : ""}`}
      >
        <button
          type="button"
          className="player-main"
          onClick={() => onSelectPlayer(player.id)}
        >
          <span className="shirt">#{player.shirt_number}</span>
          <span>
            <strong>{player.name}</strong>
            <small>{player.preferred_positions || "Keine Position"}</small>
          </span>
          {isOnField && <span className="player-status-icon" title="Auf dem Feld">⚽</span>}
          {isOnBench && <span className="player-status-icon" title="Auf der Bank">🪑</span>}
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onAddToBench(player)}
        >
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