import CollapsiblePanel from "./CollapsiblePanel";

/**
 * Bankbereich.
 * Zeigt Ersatzspieler an und erlaubt das Entfernen von der Bank.
 */
export default function Bench({ substitutes, onRemoveFromBench }) {
  return (
    <CollapsiblePanel
      title="Bank"
      description="Ersatzspieler für Wechsel vorbereiten."
      className="bench-panel"
      defaultOpen={true}
    >
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
    </CollapsiblePanel>
  );
}
