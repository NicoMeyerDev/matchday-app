/**
 * Auswahlfenster für eine konkrete Position.
 * Es zeigt zuerst passende Spieler an und darunter optional alle weiteren Spieler.
 */
export default function PositionPlayerPicker({ position, matchingPlayers, otherPlayers, currentPlayer, onClose, onSelectPlayer, onClearPosition }) {
  if (!position) return null;

  /**
   * Rendert einen auswählbaren Spieler.
   * Die Funktion verhindert doppelte JSX-Struktur für passende und weitere Spieler.
   */
  function renderPlayerButton(player) {
    return (
      <button key={player.id} type="button" className="picker-player" onClick={() => onSelectPlayer(player)}>
        <span className="shirt">#{player.shirt_number}</span>
        <span>
          <strong>{player.name}</strong>
          <small>{player.preferred_positions || "Keine Position"}</small>
        </span>
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="position-picker" onClick={(event) => event.stopPropagation()}>
        <div className="picker-header">
          <div>
            <p className="eyebrow">Position besetzen</p>
            <h2>{position.label}</h2>
            {currentPlayer && <p>Aktuell: #{currentPlayer.shirt_number} {currentPlayer.name}</p>}
          </div>
          <button type="button" className="icon-collapse-button" onClick={onClose} aria-label="Fenster schließen">×</button>
        </div>

        <div className="picker-section">
          <h3>Passende Spieler</h3>
          {matchingPlayers.length === 0 ? (
            <p className="muted">Keine passenden Spieler für diese Position gefunden.</p>
          ) : (
            <div className="picker-list">{matchingPlayers.map(renderPlayerButton)}</div>
          )}
        </div>

        <div className="picker-section">
          <h3>Weitere Spieler</h3>
          {otherPlayers.length === 0 ? (
            <p className="muted">Keine weiteren Spieler verfügbar.</p>
          ) : (
            <div className="picker-list compact">{otherPlayers.map(renderPlayerButton)}</div>
          )}
        </div>

        <div className="picker-actions">
          <button type="button" className="ghost-button danger" onClick={() => onClearPosition(position.id)}>
            Position leeren
          </button>
          <button type="button" className="primary-button" onClick={onClose}>Fertig</button>
        </div>
      </section>
    </div>
  );
}
