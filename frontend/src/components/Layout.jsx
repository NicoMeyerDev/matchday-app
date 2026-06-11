const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .layout-root {
    display: flex;
    min-height: 100vh;
    background: #07070a;
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
  }

  /* SIDEBAR */
  .sidebar {
    width: 220px;
    min-height: 100vh;
    background: #0a0a0f;
    border-right: 1px solid #141418;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
  }

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid #141418;
  }

  .sidebar-logo .app-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 0.08em;
    color: #fff;
    line-height: 1;
  }

  .sidebar-logo .app-sub {
    font-size: 10px;
    color: #22c55e;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .sidebar-club {
    padding: 16px 20px;
    border-bottom: 1px solid #141418;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .club-badge {
    width: 34px;
    height: 34px;
    background: #0f1f10;
    border: 1px solid #22c55e33;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .club-name { font-size: 13px; font-weight: 500; color: #e4e4e7; }
  .club-team { font-size: 11px; color: #444; }

  .nav {
    padding: 16px 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    color: #52525b;
    font-size: 14px;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
  }

  .nav-item:hover { background: #111116; color: #a1a1aa; }
  .nav-item.active { background: #0d1f0e; color: #22c55e; }
  .nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-item .nav-soon {
    margin-left: auto;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #2a2a35;
    text-transform: uppercase;
  }

  .sidebar-bottom {
    padding: 16px 20px;
    border-top: 1px solid #141418;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    width: 34px;
    height: 34px;
    background: #1a1a2e;
    border: 1px solid #2563eb44;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #2563eb;
    font-weight: 500;
    flex-shrink: 0;
  }

  .user-name { font-size: 13px; color: #e4e4e7; font-weight: 500; }
  .user-role { font-size: 11px; color: #444; }

  .btn-logout {
    margin-left: auto;
    background: transparent;
    border: none;
    color: #3f3f46;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    transition: color 0.2s;
  }
  .btn-logout:hover { color: #f87171; }

  /* MAIN CONTENT */
  .layout-main {
    margin-left: 220px;
    flex: 1;
    min-height: 100vh;
  }
`;

export default function Layout({ user, onLogout, currentPage, onNavigate, children }) {
  const navItems = [
    { id: "hub", icon: "🏠", label: "Dashboard" },
    { id: "players", icon: "👥", label: "Kader" },
    { id: "preparation", icon: "📋", label: "Vorbereitung" },
    { id: "matchday", icon: "🏟️", label: "Matchday" },
    { id: "postmatch", icon: "📊", label: "Post-Match" },
    { id: "analyse", icon: "📈", label: "Analyse", soon: true },
    
  ];

  return (
    <>
      <style>{S}</style>
      <div className="layout-root">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="app-name">Matchday</div>
            <div className="app-sub">Coaching App</div>
          </div>

          <div className="sidebar-club">
            <div className="club-badge">⚽</div>
            <div>
              <div className="club-name">Mein Verein</div>
              <div className="club-team">1. Herren</div>
            </div>
          </div>

          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                onClick={() => !item.soon && onNavigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.soon && <span className="nav-soon">Bald</span>}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || "T"}</div>
            <div>
              <div className="user-name">{user?.username || "Trainer"}</div>
              <div className="user-role">Trainer</div>
            </div>
            <button className="btn-logout" onClick={onLogout} title="Abmelden">⏻</button>
          </div>
        </aside>

        <main className="layout-main">
          {children}
        </main>
      </div>
    </>
  );
}
