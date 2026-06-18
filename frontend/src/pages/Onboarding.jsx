import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .ob-root {
    min-height: 100vh;
    background: #07070a;
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle pitch lines in background */
  .ob-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .ob-card {
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
  }

  .ob-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 0.25em;
    color: #22c55e;
    margin-bottom: 52px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ob-logo::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
  }

  .ob-eyebrow {
    font-size: 11px;
    letter-spacing: 0.2em;
    color: #3f3f46;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .ob-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px;
    color: #fff;
    line-height: 1;
    margin: 0 0 8px;
    letter-spacing: 0.02em;
  }

  .ob-heading span {
    color: #22c55e;
  }

  .ob-sub {
    font-size: 14px;
    color: #52525b;
    margin: 0 0 40px;
    line-height: 1.6;
  }

  .ob-divider {
    height: 1px;
    background: #141418;
    margin-bottom: 32px;
  }

  .ob-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #3f3f46;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .ob-input {
    width: 100%;
    background: #0f0f14;
    border: 1px solid #1e1e24;
    border-radius: 10px;
    padding: 16px 18px;
    font-size: 16px;
    color: #f5f5f5;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    margin-bottom: 24px;
  }

  .ob-input:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
  }

  .ob-input::placeholder { color: #2a2a35; }

  .ob-btn {
  width: 100%;
  padding: 18px;
  background: #4ade80;
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

  .ob-btn:hover { background: #86efac; }
  .ob-btn:active { transform: scale(0.99); }
  .ob-btn:disabled {
  background: #1a2e1a;
  color: #2d5a2d;
  cursor: not-allowed;
}

  .ob-error {
    margin-top: 16px;
    padding: 12px 16px;
    background: #1f0f0f;
    border: 1px solid #3f1f1f;
    border-radius: 8px;
    font-size: 13px;
    color: #f87171;
  }

  .ob-hint {
    margin-top: 20px;
    font-size: 12px;
    color: #2a2a35;
    text-align: center;
    line-height: 1.6;
  }
`;

export default function Onboarding({ user, onClubCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Bitte einen Vereinsnamen eingeben."); return; }
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/clubs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error('Verein konnte nicht erstellt werden.');
      const club = await res.json();
      onClubCreated(club);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{S}</style>
      <div className="ob-root">
        <div className="ob-card">
          <div className="ob-logo">Matchday Coaching</div>

          <div className="ob-eyebrow">Willkommen, {user?.username}</div>
          <h1 className="ob-heading">Dein <span>Verein</span> fehlt noch.</h1>
          <p className="ob-sub">
            Lege deinen Verein an — dann kannst du deinen Kader verwalten,
            Aufstellungen planen und Spieltage vorbereiten.
          </p>

          <div className="ob-divider" />

          <form onSubmit={handleCreate}>
            <label className="ob-label">Name des Vereins</label>
            <input
              className="ob-input"
              type="text"
              placeholder="z.B. SG Musterstadt"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />

            <button className="ob-btn" type="submit" disabled={loading || !name.trim()}>
              {loading ? "Wird erstellt..." : "Verein anlegen"}
            </button>
          </form>

          {error && <div className="ob-error">{error}</div>}

          <p className="ob-hint">
            Du kannst später weitere Trainer einladen und<br />
            den Vereinsnamen jederzeit ändern.
          </p>
        </div>
      </div>
    </>
  );
}
