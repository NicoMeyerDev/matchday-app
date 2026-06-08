import { useState } from "react";

/**
 * Steuerleiste für Formation, gespeicherte Aufstellungen und Speicheraktionen.
 * Der Bereich ist einklappbar, damit das Spielfeld im Alltag möglichst viel Platz bekommt.
 */
export default function FormationSelector({
  formations,
  lineups,
  selectedFormationId,
  selectedLineupId,
  isSaving,
  onSelectFormation,
  onSelectLineup,
  onCreateLineup,
  onUpdateLineup,
  onDeleteLineup,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <section className="panel control-panel compact-control-panel">
      <div className="control-header">
        <div>
          <h2>Aufstellung</h2>
          <p>Formation wählen, gespeicherte Aufstellung laden und Änderungen sichern.</p>
        </div>

        <button
          type="button"
          className="icon-collapse-button"
          onClick={() => setIsOpen((currentState) => !currentState)}
          aria-label={isOpen ? "Aufstellungsbereich einklappen" : "Aufstellungsbereich ausklappen"}
        >
          {isOpen ? "⌃" : "⌄"}
        </button>
      </div>

      {isOpen && (
        <div className="control-content">
          <label>
            Formation
            <select value={selectedFormationId || ""} onChange={(event) => onSelectFormation(Number(event.target.value))}>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>{formation.name}</option>
              ))}
            </select>
          </label>

          <label className="saved-lineup-field">
            Gespeicherte Aufstellung
            <div className="saved-lineup-row">
              <select value={selectedLineupId || ""} onChange={(event) => onSelectLineup(Number(event.target.value))}>
                <option value="">Keine wählen</option>
                {lineups.map((lineup) => (
                  <option key={lineup.id} value={lineup.id}>{lineup.title} · {lineup.formation_detail?.name}</option>
                ))}
              </select>

              <div className="settings-wrapper">
                <button
                  type="button"
                  className="gear-button"
                  onClick={() => setIsSettingsOpen((currentState) => !currentState)}
                  aria-label="Aufstellungsoptionen öffnen"
                >
                  ⚙
                </button>

                {isSettingsOpen && (
                  <div className="settings-menu">
                    <button type="button" onClick={onUpdateLineup} disabled={isSaving || !selectedLineupId}>
                      Aktualisieren
                    </button>
                    <button type="button" className="danger-text" onClick={onDeleteLineup} disabled={isSaving || !selectedLineupId}>
                      Löschen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </label>

          <div className="action-row save-row">
            <button type="button" className="primary-button" onClick={onCreateLineup} disabled={isSaving}>
              Speichern
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
