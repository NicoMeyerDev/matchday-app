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
  return Object.values(assignedSlots).some((slot) => slot?.player_detail?.id === playerId);
}

/** Prüft, ob ein Spieler bereits auf der Bank steht. */
export function isPlayerOnBench(playerId, substitutes) {
  return substitutes.some((sub) => sub?.player_detail?.id === playerId || sub?.player === playerId);
}

/**
 * Entfernt einen Spieler aus allen Feldpositionen.
 * Dadurch verhindert das Frontend doppelte Feld-Zuordnungen.
 */
export function removePlayerFromField(playerId, assignedSlots) {
  const nextSlots = { ...assignedSlots };

  Object.entries(nextSlots).forEach(([positionId, slot]) => {
    if (slot?.player_detail?.id === playerId) {
      delete nextSlots[positionId];
    }
  });

  return nextSlots;
}
