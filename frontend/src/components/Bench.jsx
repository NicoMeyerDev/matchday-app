/**
 * Seitlich einklappbarer Bankbereich.
 * Im eingeklappten Zustand bleibt die Beschriftung sichtbar, damit die Oberfläche klar bleibt.
 */
export default function Bench({ substitutes, onRemoveFromBench, isOpen, onToggle }) {
  return (
    <section className={`side-drawer-panel bench-panel ${isOpen ? "open" : "closed"}`}>
      <button
        type="button"
        className="side-drawer-tab"
        onClick={onToggle}
        aria-label={isOpen ? "Bank einklappen" : "Bank ausklappen"}
        title={isOpen ? "Bank einklappen" : "Bank ausklappen"}
      >
        <span className="side-drawer-arrow">{isOpen ? "›" : "‹"}</span>
        <span className="side-drawer-label">Bank</span>
      </button>

      {isOpen && (
        <div className="side-drawer-content">
          <div className="section-title">
            <h2>Bank</h2>
            <p>Ersatzspieler für Wechsel vorbereiten.</p>
          </div>

          {substitutes.length === 0 ? (
            <p className="muted">Noch keine Spieler auf der Bank.</p>
          ) : (
            <div className="bench-list">
              {substitutes.map((sub) => {
                const player = sub.player_detail || sub;
                return (
                  <article key={`${player.id}-${sub.id || "local"}`} className="bench-card">
                    <span className="shirt">#{player.shirt_number}</span>
                    <div>
                      <strong>{player.name}</strong>
                      <small>{player.preferred_positions}</small>
                    </div>
                    <button type="button" className="ghost-button" onClick={() => onRemoveFromBench(player.id)}>
                      Entfernen
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
