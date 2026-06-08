import CollapsiblePanel from "./CollapsiblePanel";

/**
 * Notizbereich für allgemeine Spiel- oder Wechselhinweise.
 * Aktuell wird die Notiz lokal gehalten; für dauerhaftes Speichern braucht das Backend PATCH/PUT-Unterstützung.
 */
export default function NotesPanel({ notes, onChangeNotes }) {
  return (
    <CollapsiblePanel
      title="Anweisung"
      description="Kurze taktische Hinweise für die Ansprache."
      className="notes-panel"
      defaultOpen={true}
    >
      <textarea
        value={notes}
        onChange={(event) => onChangeNotes(event.target.value)}
        placeholder="Beispiel: Nach Einwechslung rechts höher pressen, Außenbahn schließen..."
      />
    </CollapsiblePanel>
  );
}
