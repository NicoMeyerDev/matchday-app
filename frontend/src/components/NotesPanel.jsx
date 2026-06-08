/**
 * Seitlich einklappbarer Anweisungsbereich.
 * Hier werden kurze taktische Hinweise für Wechsel oder Spielphasen gepflegt.
 */
export default function NotesPanel({ notes, onChangeNotes, isOpen, onToggle }) {
  return (
    <section className={`side-drawer-panel notes-panel ${isOpen ? "open" : "closed"}`}>
      <button
        type="button"
        className="side-drawer-tab"
        onClick={onToggle}
        aria-label={isOpen ? "Anweisung einklappen" : "Anweisung ausklappen"}
        title={isOpen ? "Anweisung einklappen" : "Anweisung ausklappen"}
      >
        <span className="side-drawer-arrow">{isOpen ? "›" : "‹"}</span>
        <span className="side-drawer-label">Anweisung</span>
      </button>

      {isOpen && (
        <div className="side-drawer-content">
          <div className="section-title">
            <h2>Anweisung</h2>
            <p>Kurze taktische Hinweise für die Ansprache.</p>
          </div>

          <textarea
            value={notes}
            onChange={(event) => onChangeNotes(event.target.value)}
            placeholder="Beispiel: Nach Einwechslung rechts höher pressen, Außenbahn schließen..."
          />
        </div>
      )}
    </section>
  );
}
