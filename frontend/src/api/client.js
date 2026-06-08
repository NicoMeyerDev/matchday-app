/**
 * Zentrale API-Datei.
 * Hier wird die Verbindung zum Django-Backend gebündelt.
 * Wenn sich die Backend-Adresse später ändert, muss nur API_BASE_URL angepasst werden.
 */
const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Führt einen HTTP-Request gegen das Backend aus.
 * Die Funktion kapselt Fehlerbehandlung und JSON-Parsing, damit Komponenten sauber bleiben.
 */
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API-Fehler ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

/** Lädt alle aktiven und angelegten Spieler aus dem Backend. */
export function fetchPlayers() {
  return request("/players/");
}

/** Lädt alle Formationen inklusive Positionskoordinaten. */
export function fetchFormations() {
  return request("/formations/");
}

/** Lädt gespeicherte Aufstellungen inklusive Slots und Ersatzspielern. */
export function fetchLineups() {
  return request("/lineups/");
}

/**
 * Erstellt eine neue Aufstellung.
 * Voraussetzung: Das Backend akzeptiert verschachtelte slots/substitutes im POST.
 */
export function createLineup(payload) {
  return request("/lineups/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Aktualisiert eine bestehende Aufstellung.
 * Voraussetzung: Das Backend erlaubt PATCH auf /lineups/{id}/ und verarbeitet slots/substitutes sauber.
 */
export function updateLineup(lineupId, payload) {
  return request(`/lineups/${lineupId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Löscht eine gespeicherte Aufstellung.
 * Voraussetzung: Das Backend erlaubt DELETE auf /lineups/{id}/.
 */
export function deleteLineup(lineupId) {
  return request(`/lineups/${lineupId}/`, {
    method: "DELETE",
  });
}
export function createPlayer(payload) {
  return request("/players/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
