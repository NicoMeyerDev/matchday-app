/**
 * Baut aus einer gespeicherten Lineup-Struktur ein schnelles Mapping.
 * Ergebnis: { positionId: slot }
 */
export function mapSlotsByPosition(slots = []) {
  return slots.reduce((acc, slot) => {
    acc[slot.position] = slot;
    return acc;
  }, {});
}

/** Prüft, ob ein Spieler bereits auf dem Feld steht. */
export function isPlayerOnField(playerId, assignedSlots) {
  return Object.values(assignedSlots).some((slot) => slot?.player_detail?.id === playerId || slot?.player === playerId);
}

/** Prüft, ob ein Spieler bereits auf der Bank steht. */
export function isPlayerOnBench(playerId, substitutes) {
  return substitutes.some((sub) => sub?.player_detail?.id === playerId || sub?.player === playerId || sub?.id === playerId);
}

/**
 * Entfernt einen Spieler aus allen Feldpositionen.
 * Dadurch verhindert das Frontend doppelte Feld-Zuordnungen.
 */
export function removePlayerFromField(playerId, assignedSlots) {
  const nextSlots = { ...assignedSlots };

  Object.entries(nextSlots).forEach(([positionId, slot]) => {
    if (slot?.player_detail?.id === playerId || slot?.player === playerId) {
      delete nextSlots[positionId];
    }
  });

  return nextSlots;
}

/**
 * Normalisiert Positionsnamen für den Vergleich.
 * Aus IVL/IVR wird IV, aus ZM1/ZM2 wird ZM, damit Spieler besser gefunden werden.
 */
export function normalizePositionLabel(label = "") {
  return label
    .toUpperCase()
    .trim()
    .replace(/[0-9]/g, "")
    .replace(/L$|R$/g, "");
}

/**
 * Prüft, ob ein Spieler laut Positionsangabe zu einer Position passt.
 * Das Backend liefert preferred_positions aktuell als String, deshalb wird hier robust verglichen.
 */
export function playerMatchesPosition(player, positionLabel) {
  const normalizedPosition = normalizePositionLabel(positionLabel);
  const preferredPositions = String(player.preferred_positions || "")
    .split(",")
    .map((item) => normalizePositionLabel(item));

  return preferredPositions.includes(normalizedPosition);
}

/**
 * Baut aus Rolle + Aufgabe (BriefingModal-Auswahl, siehe playerBriefings in App.jsx)
 * einen maschinenlesbaren instruction-String (JSON mit roleKey + aufgaben-Keys).
 * Labels werden bewusst NICHT mitgespeichert, sondern beim Laden live über
 * parseInstructionText (BriefingModal.jsx) aus der Rolle/Aufgaben-Definitionsliste
 * nachgeschlagen — so bleibt eine gespeicherte Aufstellung auch nach Label-
 * Umbenennungen korrekt und roleKey/aufgaben-Keys lassen sich verlustfrei zurückgewinnen.
 */
function buildInstructionText(briefing) {
  if (!briefing?.role) return "";
  return JSON.stringify({ role: briefing.role, aufgaben: briefing.aufgaben || [] });
}

/**
 * Baut aus dem lokalen Frontend-Zustand einen Payload für spätere Speicherfunktionen.
 * Das Backend muss verschachtelte slots/substitutes akzeptieren, damit dieser Payload direkt speicherbar ist.
 * playerBriefings (Key = Spieler-ID) liefert die im BriefingModal gewählte Rolle/Aufgabe,
 * daraus wird der instruction-Text pro Slot abgeleitet.
 */
export function buildLineupPayload({ title, opponent, formationId, assignedSlots, substitutes, generalNotes, playerBriefings = {} }) {
  return {
    title,
    opponent,
    formation: formationId,
    general_notes: generalNotes,
    slots: Object.values(assignedSlots).map((slot) => {
      const playerId = slot.player_detail?.id || slot.player;
      return {
        position: slot.position,
        player: playerId,
        instruction: buildInstructionText(playerBriefings[playerId]),
      };
    }),
    substitutes: substitutes.map((sub) => ({
      player: sub.player_detail?.id || sub.player || sub.id,
      note: sub.note || "",
    })),
  };
}
