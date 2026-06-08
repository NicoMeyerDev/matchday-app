/**
 * Auswahlbereich für Formationen und gespeicherte Aufstellungen.
 * Die Komponente verändert nur den aktuellen Frontend-Zustand.
 */
export default function FormationSelector({ formations, lineups, selectedFormationId, selectedLineupId, onSelectFormation, onSelectLineup }) {
  return (
    <section className="panel compact-panel">
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
    </section>
  );
}
