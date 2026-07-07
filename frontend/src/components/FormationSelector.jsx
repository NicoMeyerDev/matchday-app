import { useState } from "react";
import { ClipboardList } from "lucide-react";

export default function FormationSelector({
  formations,
  lineups,
  selectedFormationId,
  selectedLineupId,
  isSaving,
  lineupTitle,
  onLineupTitleChange,
  onSelectFormation,
  onSelectLineup,
  onCreateLineup,
  onUpdateLineup,
  onDeleteLineup,
  exportButton,
  showTaskOverlay,
  onToggleTaskOverlay,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <section className={`panel control-panel compact-control-panel ${isOpen ? "open" : "closed"}`}>
      <div className="control-header compact-strip-header">
        <div>
          <h2>Aufstellung</h2>
          {isOpen && <p>Formation wählen, gespeicherte Aufstellung laden und Änderungen sichern.</p>}
        </div>
        <button
          type="button"
          className="icon-collapse-button"
          onClick={() => setIsOpen((s) => !s)}
          aria-label={isOpen ? "Einklappen" : "Ausklappen"}
        >
          {isOpen ? "⌃" : "⌄"}
        </button>
      </div>

      {isOpen && (
        <div className="control-content">
          <label>
            Name der Aufstellung
            <input
              type="text"
              value={lineupTitle || ""}
              onChange={(e) => onLineupTitleChange && onLineupTitleChange(e.target.value)}
              placeholder="z.B. Heimspiel 4-2-3-1"
            />
          </label>

          <label>
            Formation
            <select value={selectedFormationId || ""} onChange={(e) => onSelectFormation(Number(e.target.value))}>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>

          <label className="saved-lineup-field">
            Gespeicherte Aufstellung
            <div className="saved-lineup-row">
              <select value={selectedLineupId || ""} onChange={(e) => onSelectLineup(Number(e.target.value))}>
                <option value="">Keine wählen</option>
                {lineups.map((l) => (
                  <option key={l.id} value={l.id}>{l.title} · {l.formation_detail?.name}</option>
                ))}
              </select>
              <div className="settings-wrapper">
                <button
                  type="button"
                  className="gear-button"
                  onClick={() => setIsSettingsOpen((s) => !s)}
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
              <button type="button" className="primary-button" onClick={onCreateLineup} disabled={isSaving}>
                Speichern
              </button>
              <button
                type="button"
                className={`task-overlay-toggle ${showTaskOverlay ? "active" : ""}`}
                onClick={onToggleTaskOverlay}
                title="Aufgaben-Icons auf dem Feld ein-/ausblenden"
              >
                <ClipboardList size={14} />
                Aufgaben
              </button>
              {exportButton}
            </div>
          </label>
        </div>
      )}
    </section>
  );
}
