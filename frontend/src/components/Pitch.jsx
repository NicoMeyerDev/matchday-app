import * as LucideIcons from "lucide-react";
import { TASK_MOVEMENTS } from "./BriefingModal";

/**
 * Visuelles Spielfeld.
 * Positionen kommen direkt aus der Formation-API und werden über x/y-Koordinaten platziert.
 * Aufgaben-Overlay (showTaskOverlay): zeigt Icon + Kürzel der zugewiesenen Aufgabe
 * (aus playerBriefings, Key = player.id — hängt am Spieler, nicht am Slot) als
 * Badge oben rechts neben der Spielerkarte.
 * onEditTask (optional, nur Vorbereitung): schaltet zusammen mit showTaskOverlay den
 * Interaktions-Modus der ganzen Karte um ("aufgabe" statt "wechsel") - EIN Klick-Handler
 * pro Karte, keine konkurrierenden Handler. In Matchday fehlt der Prop -> Karte bleibt
 * immer im Wechsel-Modus, Badges sind rein read-only.
 */
export default function Pitch({ formation, assignedSlots, onOpenPositionPicker, onClearPosition, playerBriefings = {}, showTaskOverlay = false, onEditTask }) {
  if (!formation) {
    return <section className="pitch empty">Keine Formation ausgewählt.</section>;
  }

  const interactionMode = onEditTask && showTaskOverlay ? "aufgabe" : "wechsel";

  return (
    <section className="pitch-wrap">
      <div className="pitch">
        <div className="center-circle" />
        <div className="box box-top" />
        <div className="box box-bottom" />

        {formation.positions.map((position) => {
          const slot = assignedSlots[position.id];
          const player = slot?.player_detail;

          const taskKey = player ? playerBriefings[player.id]?.aufgaben?.[0] : null;
          const task = taskKey ? TASK_MOVEMENTS[taskKey] : null;
          const TaskIcon = task ? LucideIcons[task.icon] : null;

          return (
            <button
              key={position.id}
              type="button"
              className={`position-dot ${player ? "filled" : ""}`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={() => {
                if (interactionMode === "aufgabe" && player) {
                  onEditTask(position, player);
                } else {
                  onOpenPositionPicker(position);
                }
              }}
              onDoubleClick={() => onClearPosition(position.id)}
              title={interactionMode === "aufgabe" && player ? "Tippen: Rolle & Aufgabe bearbeiten" : "Tippen: Spieler wählen · Doppeltippen: Position leeren"}
            >
              <span className="position-label">{position.label}</span>
              {player ? (
                <span className="player-on-pitch">{player.shirt_number} {player.name}</span>
              ) : (
                <span className="empty-slot">frei</span>
              )}
              {showTaskOverlay && player && task && (
                <span className="task-badge">
                  {TaskIcon && <TaskIcon size={15} />}
                  <span className="task-badge-abbr">{task.abbr}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
