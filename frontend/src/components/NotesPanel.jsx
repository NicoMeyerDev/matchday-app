import { useState } from "react";
import { StickyNote } from "lucide-react";

/**
 * Anweisung-Bereich für taktische Notizen.
 * Fester Fußbereich unterhalb des Bank-Panels, immer sichtbar (unabhängig davon,
 * ob Bank gerade ein- oder ausgeklappt ist). Klick öffnet das Notizen-Modal.
 */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  /* Dezenter Fußbereich - passt sich per width:100% automatisch der Bank-Spaltenbreite an
     (320px offen / 72px eingeklappt), damit er optisch wie ein unterer Abschluss wirkt. */
  .notes-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 8px;
    border-radius: 12px;
    border: 1px solid #1e1e24;
    background: #111116;
    color: #71717a;
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .notes-trigger:hover { background: #1a1a24; color: #a1a1aa; }
  .notes-trigger span { overflow: hidden; text-overflow: ellipsis; }

  .notes-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.78);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 24px;
    font-family: 'DM Sans', sans-serif;
  }

  .notes-card {
    background: #0a0a0f;
    border: 1px solid #1e1e24;
    border-radius: 18px;
    width: 100%; max-width: 520px;
    overflow: hidden;
  }

  .notes-head {
    padding: 16px 22px;
    border-bottom: 1px solid #141418;
    display: flex; align-items: center; justify-content: space-between;
  }
  .notes-head-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.05em; color: #fff; }
  .notes-head-sub { font-size: 12px; color: #52525b; margin-top: 2px; }

  .notes-close {
    width: 32px; height: 32px; border-radius: 999px;
    border: 1px solid #1e1e24; background: #111116;
    color: #71717a; cursor: pointer; font-size: 16px;
  }
  .notes-close:hover { background: #1a1a24; }

  .notes-body { padding: 20px 22px; }
  .notes-body textarea {
    width: 100%; min-height: 220px; resize: vertical;
    background: #111116; border: 1px solid #1e1e24; border-radius: 12px;
    padding: 14px; color: #f5f5f5; font-family: 'DM Sans', sans-serif; font-size: 14px;
    box-sizing: border-box;
  }
  .notes-body textarea:focus { outline: none; border-color: #22c55e; }
`;

export default function NotesPanel({ notes, onChangeNotes }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <style>{STYLES}</style>

      <button type="button" className="notes-trigger" onClick={() => setIsModalOpen(true)}>
        <StickyNote size={14} />
        <span>Anweisung</span>
      </button>

      {isModalOpen && (
        <div className="notes-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="notes-card" onClick={(event) => event.stopPropagation()}>
            <div className="notes-head">
              <div>
                <div className="notes-head-title">Anweisung</div>
                <div className="notes-head-sub">Kurze taktische Hinweise für die Ansprache.</div>
              </div>
              <button type="button" className="notes-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="notes-body">
              <textarea
                value={notes}
                onChange={(event) => onChangeNotes(event.target.value)}
                placeholder="Beispiel: Nach Einwechslung rechts höher pressen, Außenbahn schließen..."
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
