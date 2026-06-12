/**
 * Zentrale API-Datei.
 * Hier wird die Verbindung zum Django-Backend gebündelt.
 */
const API_BASE_URL = "/api";
 
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });
 
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API-Fehler ${response.status}: ${text}`);
  }
 
  if (response.status === 204) return null;
  return response.json();
}
 
export function fetchPlayers() { return request("/players/"); }
export function fetchFormations() { return request("/formations/"); }
export function fetchLineups() { return request("/lineups/"); }
 
export function createLineup(payload) {
  return request("/lineups/", { method: "POST", body: JSON.stringify(payload) });
}
 
export function updateLineup(lineupId, payload) {
  return request(`/lineups/${lineupId}/`, { method: "PATCH", body: JSON.stringify(payload) });
}
 
export function deleteLineup(lineupId) {
  return request(`/lineups/${lineupId}/`, { method: "DELETE" });
}
 
export function createPlayer(payload) {
  return request("/players/", { method: "POST", body: JSON.stringify(payload) });
}
 
// ── MatchReport ──
export function fetchMatchReports() { return request("/matchreports/"); }
 
export function createMatchReport(payload) {
  return request("/matchreports/", { method: "POST", body: JSON.stringify(payload) });
}
 
export function updateMatchReport(id, payload) {
  return request(`/matchreports/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}
 
export function deleteMatchReport(id) {
  return request(`/matchreports/${id}/`, { method: "DELETE" });
}

// ── MatchEvent ──
export function createMatchEvent(payload) {
  return request("/matchreports/events/", { method: "POST", body: JSON.stringify(payload) });
}