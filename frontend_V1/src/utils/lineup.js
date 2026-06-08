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
 * Baut aus dem lokalen Frontend-Zustand einen Payload für spätere Speicherfunktionen.
 * Das Backend muss verschachtelte slots/substitutes akzeptieren, damit dieser Payload direkt speicherbar ist.
 */
export function buildLineupPayload({ title, opponent, formationId, assignedSlots, substitutes, generalNotes }) {
  return {
    title,
    opponent,
    formation: formationId,
    general_notes: generalNotes,
    slots: Object.values(assignedSlots).map((slot) => ({
      position: slot.position,
      player: slot.player_detail?.id || slot.player,
      instruction: slot.instruction || "",
    })),
    substitutes: substitutes.map((sub) => ({
      player: sub.player_detail?.id || sub.player || sub.id,
      note: sub.note || "",
    })),
  };
}
