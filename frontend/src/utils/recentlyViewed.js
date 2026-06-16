const KEY = 'recently_viewed_players';
const MAX_ENTRIES = 8;

export function recordPlayerView(playerId) {
  if (!playerId) return;
  let ids = getRecentlyViewedIds();
  ids = ids.filter(id => id !== playerId);
  ids.unshift(playerId);
  ids = ids.slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function getRecentlyViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}