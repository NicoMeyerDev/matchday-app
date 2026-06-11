const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .hub-root {
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
    min-height: 100vh;
    background: #07070a;
  }

  .hub-topbar {
    padding: 16px 28px;
    border-bottom: 1px solid #141418;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hub-topbar-left .page-label {
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #3f3f46;
    text-transform: uppercase;
  }

  .hub-topbar-left .page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 0.05em;
    color: #fff;
    line-height: 1.1;
  }

  .hub-topbar-right { font-size: 13px; color: #3f3f46; }

  .hub-content { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }

  .middle-row { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }

  .section-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-weight: 500;
  }

  .quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

  .quick-tile {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 12px;
    padding: 28px 14px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s;
    border-top: 2px solid transparent;
  }

  .quick-tile:hover { transform: translateY(-2px); }
  .quick-tile.blue { border-top-color: #2563eb; }
  .quick-tile.blue:hover { border-color: #2563eb; }
  .quick-tile.green { border-top-color: #22c55e; }
  .quick-tile.green:hover { border-color: #22c55e; }
  .quick-tile.red { border-top-color: #dc2626; }
  .quick-tile.red:hover { border-color: #dc2626; }
  .quick-tile.gray { border-top-color: #3f3f46; opacity: 0.4; cursor: not-allowed; }
  .quick-tile.gray:hover { transform: none; }

  .qt-icon { font-size: 28px; margin-bottom: 12px; display: block; }
  .qt-label { font-size: 13px; color: #71717a; }
  .qt-soon { font-size: 10px; color: #2a2a35; margin-top: 4px; }

  .recent-card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 14px;
    padding: 20px;
  }

  .player-list { display: flex; flex-direction: column; gap: 6px; }

  .player-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .player-row:hover { background: #111116; }

  .player-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    color: #2a2a35;
    width: 24px;
    text-align: center;
  }

  .player-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: #141420;
    border: 1px solid #1e1e2e;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
  }

  .p-name { font-size: 13px; color: #d4d4d8; }
  .p-pos { font-size: 11px; color: #3f3f46; }
  .recent-empty { font-size: 12px; color: #2a2a35; font-style: italic; padding: 8px 0; }

  .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  .info-card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 14px;
    padding: 20px;
  }

  .coming-soon {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 20px; gap: 8px; opacity: 0.25;
  }
  .cs-icon { font-size: 24px; }
  .cs-text { font-size: 12px; color: #52525b; font-style: italic; text-align: center; }
`;

export default function Hub({ user, players, onNavigate }) {
  const recentPlayers = players ? players.slice(0, 4) : [];
  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <>
      <style>{S}</style>
      <div className="hub-root">
        <div className="hub-topbar">
          <div className="hub-topbar-left">
            <div className="page-label">Saison 2025/26</div>
            <div className="page-title">Hey, {user?.username || "Trainer"} 👋</div>
          </div>
          <div className="hub-topbar-right">{today}</div>
        </div>

        <div className="hub-content">
          <div className="middle-row">
            <div>
              <div className="section-label">Schnellzugriff</div>
              <div className="quick-grid">
                <div className="quick-tile blue" onClick={() => onNavigate("matchday")}>
                  <span className="qt-icon">🏟️</span>
                  <div className="qt-label">Matchday</div>
                </div>
                <div className="quick-tile green" onClick={() => onNavigate("preparation")}>
                  <span className="qt-icon">📋</span>
                  <div className="qt-label">Vorbereitung</div>
                </div>
                <div className="quick-tile red" onClick={() => onNavigate("postmatch")}>
                  <span className="qt-icon">📊</span>
                  <div className="qt-label">Post-Match</div>
                </div>
                <div className="quick-tile gray">
                  <span className="qt-icon">📈</span>
                  <div className="qt-label">Analyse</div>
                  <div className="qt-soon">Bald</div>
                </div>
              </div>
            </div>

            <div className="recent-card">
              <div className="section-label">Zuletzt angeschaut</div>
              {recentPlayers.length === 0 ? (
                <div className="recent-empty">Noch keine Spieler angeschaut</div>
              ) : (
                <div className="player-list">
                  {recentPlayers.map((p) => (
                    <div key={p.id} className="player-row">
                      <div className="player-num">{p.number || "—"}</div>
                      <div className="player-avatar">👤</div>
                      <div>
                        <div className="p-name">{p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim()}</div>
                        <div className="p-pos">{p.position || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bottom-row">
            <div className="info-card">
              <div className="section-label">Kaderstatus</div>
              <div className="coming-soon">
                <div className="cs-icon">🔒</div>
                <div className="cs-text">Verfügbar wenn Spielerdaten erweitert werden</div>
              </div>
            </div>
            <div className="info-card">
              <div className="section-label">Letzte Berichte</div>
              <div className="coming-soon">
                <div className="cs-icon">📋</div>
                <div className="cs-text">Verfügbar nach erstem Post-Match Bericht</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
