/**
 * Zentrale API-Datei.
 * Hier wird die Verbindung zum Django-Backend gebündelt.
 */
const API_BASE_URL = "/api";

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          return data.access;
        }
        return null;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function forceLogout() {
  localStorage.removeItem('access_token');
  window.dispatchEvent(new Event('auth:expired'));
}

async function request(endpoint, options = {}, isRetry = false) {
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

  if (response.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request(endpoint, options, true);
    }
    forceLogout();
    throw new Error("Sitzung abgelaufen. Bitte erneut einloggen.");
  }

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

export function finalizeMatchReport(id) {
  return request(`/matchreports/${id}/finalize/`, { method: "POST" });
}

// ── MatchEvent ──
export function createMatchEvent(payload) {
  return request("/matchreports/events/", { method: "POST", body: JSON.stringify(payload) });
}  

// ── Auth ──
export function fetchCurrentUser() { return request("/auth/current-user/"); }

// ── Club-Einladung ──
export function createClubInvite(email) {
  return request("/auth/club-invite/", { method: "POST", body: JSON.stringify({ email }) });
}

export function acceptClubInvite(token) {
  return request(`/auth/accept-invite/${token}/`, { method: "POST" });
}

export function fetchClubs() { return request("/clubs/"); }

// ── Training ──
export function fetchTrainings() { return request("/training/trainings/"); }

export function createTraining(payload) {
  return request("/training/trainings/", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTraining(id, payload) {
  return request(`/training/trainings/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteTraining(id) {
  return request(`/training/trainings/${id}/`, { method: "DELETE" });
}

export function fetchTrainingBlocks(trainingId) {
  return request(`/training/training-blocks/?training=${trainingId}`);
}

export function updateTrainingBlock(id, payload) {
  return request(`/training/training-blocks/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function createTrainingBlock(payload) {
  return request("/training/training-blocks/", { method: "POST", body: JSON.stringify(payload) });
}

// ── Übungen ──
export function fetchUebungen() { return request("/training/uebungen/"); }

export function createUebung(payload) {
  return request("/training/uebungen/", { method: "POST", body: JSON.stringify(payload) });
}

export function updateUebung(id, payload) {
  return request(`/training/uebungen/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteUebung(id) {
  return request(`/training/uebungen/${id}/`, { method: "DELETE" });
}

// ── Kategorien ──
export function fetchCategories() { return request("/training/categories/"); }