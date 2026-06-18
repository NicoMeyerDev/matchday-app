import { getRecentlyViewedIds } from "../utils/recentlyViewed";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .hub-root { font-family: 'DM Sans', sans-serif; color: #d4d4d8; min-height: 100vh; background: #07070a; }

  .hub-topbar { padding: 16px 28px; border-bottom: 1px solid #141418; display: flex; align-items: center; justify-content: space-between; }
  .hub-topbar-left .page-label { font-size: 11px; letter-spacing: 0.15em; color: #3f3f46; text-transform: uppercase; }
  .hub-topbar-left .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 0.05em; color: #fff; line-height: 1.1; }
  .hub-topbar-right { font-size: 13px; color: #3f3f46; }

  .hub-content { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }

  .section-label { font-size: 10px; letter-spacing: 0.18em; color: #22c55e; text-transform: uppercase; margin-bottom: 14px; font-weight: 500; }

  /* SCHNELLZUGRIFF */
  .quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .quick-tile { background: #0a0a0f; border: 1px solid #141418; border-radius: 12px; padding: 28px 14px; text-align: center; cursor: pointer; transition: border-color 0.2s, transform 0.15s; }
  .quick-tile:hover { transform: translateY(-2px); border-color: #22c55e; }
  .quick-tile.gray { opacity: 0.4; cursor: not-allowed; }
  .quick-tile.gray:hover { transform: none; border-color: #141418; }
  .qt-icon { font-size: 28px; margin-bottom: 12px; display: block; }
  .qt-label { font-size: 13px; color: #71717a; }
  .qt-soon { font-size: 10px; color: #2a2a35; margin-top: 4px; }

  /* BOTTOM LAYOUT */
  .bottom-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: stretch; }

  /* KADERSTATUS */
  .kader-card { background: #0a0a0f; border: 1px solid #141418; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; }
  .kader-total-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0 16px; border-bottom: 1px solid #141418; margin-bottom: 16px; }
  .kader-total-label { font-size: 12px; color: #52525b; }
  .kader-total-num { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: #d4d4d8; line-height: 1; }
  .kader-status-list { display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .kader-status-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; background: #111116; border-radius: 10px; border: 1px solid #1a1a1a; flex: 1; }
  .kader-status-left { display: flex; align-items: center; gap: 12px; }
  .kader-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .kader-dot.available { background: #22c55e; }
  .kader-dot.injured { background: #f87171; }
  .kader-dot.doubtful { background: #fbbf24; }
  .kader-dot.suspended { background: #818cf8; }
  .kader-status-name { font-size: 14px; color: #71717a; }
  .kader-status-num { font-family: 'Bebas Neue', sans-serif; font-size: 32px; line-height: 1; }
  .kader-status-num.available { color: #22c55e; }
  .kader-status-num.injured { color: #f87171; }
  .kader-status-num.doubtful { color: #fbbf24; }
  .kader-status-num.suspended { color: #818cf8; }

  /* RECHTE SPALTE */
  .right-col { display: flex; flex-direction: column; gap: 16px; }
  .right-col .info-card { flex: 1; }

  .info-card { background: #0a0a0f; border: 1px solid #141418; border-radius: 14px; padding: 20px; }

  /* BERICHTE */
  .report-item { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid #0f0f14; }
  .report-item:last-child { border-bottom: none; }
  .report-result { background: #0d2010; border: 1px solid #22c55e33; border-radius: 6px; padding: 3px 10px; font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: #22c55e; flex-shrink: 0; }
  .report-opponent { font-size: 13px; color: #d4d4d8; font-weight: 500; }
  .report-date { font-size: 11px; color: #3f3f46; margin-top: 2px; }
  .report-empty { font-size: 12px; color: #2a2a35; font-style: italic; padding: 8px 0; }

  /* SPIELER */
  .player-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #0f0f14; cursor: pointer; transition: background 0.15s; border-radius: 6px; padding: 8px 6px; }
  .player-row:last-child { border-bottom: none; }
  .player-row:hover { background: #111116; }
  .player-num { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #2a2a35; width: 24px; text-align: center; }
  .player-avatar { width: 30px; height: 30px; border-radius: 50%; background: #141420; border: 1px solid #1e1e2e; display: flex; align-items: center; justify-content: center; font-size: 13px; }
  .p-name { font-size: 13px; color: #d4d4d8; }
  .p-pos { font-size: 11px; color: #3f3f46; }
  .recent-empty { font-size: 12px; color: #2a2a35; font-style: italic; padding: 8px 0; }
`;

export default function Hub({ user, players, reports, onNavigate, onSelectPlayer, onSelectReport }) {
  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });

  const recentIds = getRecentlyViewedIds();
  const recentPlayers = players
    ? recentIds.map(id => players.find(p => p.id === id)).filter(Boolean).slice(0, 4)
    : [];
  const recentReports = reports ? reports.slice(0, 3) : [];

  const count = (status) => players ? players.filter(p => p.status === status).length : 0;
  const available = players ? players.filter(p => !p.status || p.status === 'available').length : 0;

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

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

          {/* SCHNELLZUGRIFF */}
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

          {/* BOTTOM */}
          <div className="bottom-layout">

            {/* KADERSTATUS links */}
            <div className="kader-card">
              <div className="section-label">Kaderstatus</div>
              <div className="kader-total-row">
                <span className="kader-total-label">Spieler im Kader</span>
                <span className="kader-total-num">{players ? players.length : 0}</span>
              </div>
              <div className="kader-status-list">
                <div className="kader-status-item">
                  <div className="kader-status-left"><div className="kader-dot available"></div><span className="kader-status-name">Verfügbar</span></div>
                  <span className="kader-status-num available">{available}</span>
                </div>
                <div className="kader-status-item">
                  <div className="kader-status-left"><div className="kader-dot injured"></div><span className="kader-status-name">Verletzt</span></div>
                  <span className="kader-status-num injured">{count('injured')}</span>
                </div>
                <div className="kader-status-item">
                  <div className="kader-status-left"><div className="kader-dot doubtful"></div><span className="kader-status-name">Fraglich</span></div>
                  <span className="kader-status-num doubtful">{count('doubtful')}</span>
                </div>
                <div className="kader-status-item">
                  <div className="kader-status-left"><div className="kader-dot suspended"></div><span className="kader-status-name">Gesperrt</span></div>
                  <span className="kader-status-num suspended">{count('suspended')}</span>
                </div>
              </div>
            </div>

            {/* RECHTS: Berichte + Spieler */}
            <div className="right-col">
              <div className="info-card">
                <div className="section-label">Letzte Berichte</div>
                {recentReports.length === 0 ? (
                  <div className="report-empty">Noch keine Berichte vorhanden.</div>
                ) : (
                  recentReports.map(r => (
                    <div key={r.id} className="report-item" onClick={() => onSelectReport(r.id)} style={{cursor:'pointer'}}>
                      {r.result && <div className="report-result">{r.result}</div>}
                      <div>
                        <div className="report-opponent">{r.opponent || 'Gegner noch nicht eingetragen'}</div>
                        <div className="report-date">{formatDate(r.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="info-card">
                <div className="section-label">Zuletzt angeschaut</div>
                {recentPlayers.length === 0 ? (
                  <div className="recent-empty">Noch keine Spieler angeschaut.</div>
                ) : (
                  recentPlayers.map(p => (
                    <div key={p.id} className="player-row" onClick={() => onSelectPlayer(p.id)}>
                      <div className="player-num">{p.shirt_number || '—'}</div>
                      <div className="player-avatar">👤</div>
                      <div>
                        <div className="p-name">{p.name}</div>
                        <div className="p-pos">{p.preferred_positions || '—'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
