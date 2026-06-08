/**
 * Auswahlbereich für Formation, gespeicherte Aufstellung und Speicheraktionen.
 * Die Buttons setzen voraus, dass das Backend POST/PATCH/DELETE auf Lineups unterstützt.
 */
export default function FormationSelector({
  formations,
  lineups,
  selectedFormationId,
  selectedLineupId,
  lineupTitle,
  opponent,
  isSaving,
  onChangeTitle,
  onChangeOpponent,
  onSelectFormation,
  onSelectLineup,
  onCreateLineup,
  onUpdateLineup,
  onDeleteLineup,
}) {
  return (
    <section className="panel control-panel">
      <label>
        Formation
        <select value={selectedFormationId || ""} onChange={(event) => onSelectFormation(Number(event.target.value))}>
          {formations.map((formation) => (
            <option key={formation.id} value={formation.id}>{formation.name}</option>
          ))}
        </select>
      </label>

      <label>
        Gespeicherte Aufstellung
        <select value={selectedLineupId || ""} onChange={(event) => onSelectLineup(Number(event.target.value))}>
          <option value="">Keine wählen</option>
          {lineups.map((lineup) => (
            <option key={lineup.id} value={lineup.id}>{lineup.title} · {lineup.formation_detail?.name}</option>
          ))}
        </select>
      </label>

      <label>
        Titel
        <input value={lineupTitle} onChange={(event) => onChangeTitle(event.target.value)} placeholder="z. B. Testspiel Herren" />
      </label>

      <label>
        Gegner
        <input value={opponent} onChange={(event) => onChangeOpponent(event.target.value)} placeholder="z. B. SV Beispiel" />
      </label>

      <div className="action-row">
        <button type="button" className="primary-button" onClick={onCreateLineup} disabled={isSaving}>
          Neu speichern
        </button>
        <button type="button" className="ghost-button" onClick={onUpdateLineup} disabled={isSaving || !selectedLineupId}>
          Aktualisieren
        </button>
        <button type="button" className="ghost-button danger" onClick={onDeleteLineup} disabled={isSaving || !selectedLineupId}>
          Löschen
        </button>
      </div>
    </section>
  );
}
