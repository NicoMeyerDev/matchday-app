import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
  }

  .auth-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 0.25em;
    color: #4ade80;
    margin-bottom: 48px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auth-logo::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
  }

  .auth-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px;
    color: #f5f5f5;
    line-height: 1;
    margin: 0 0 8px;
    letter-spacing: 0.02em;
  }

  .auth-sub {
    font-size: 14px;
    color: #555;
    margin: 0 0 40px;
  }

  .auth-field {
    margin-bottom: 16px;
  }

  .auth-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #555;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .auth-input {
    width: 100%;
    background: #141414;
    border: 1px solid #222;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 15px;
    color: #f5f5f5;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .auth-input:focus {
    border-color: #4ade80;
  }

  .auth-input::placeholder {
    color: #333;
  }

  .auth-btn {
    width: 100%;
    margin-top: 24px;
    padding: 16px;
    background: #4ade80;
    color: #0a0a0a;
    border: none;
    border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  .auth-btn:hover {
    background: #86efac;
  }

  .auth-btn:active {
    transform: scale(0.99);
  }

  .auth-btn:disabled {
    background: #1a2e1a;
    color: #2d5a2d;
    cursor: not-allowed;
  }

  .auth-error {
    margin-top: 16px;
    padding: 12px 16px;
    background: #1f0f0f;
    border: 1px solid #3f1f1f;
    border-radius: 8px;
    font-size: 13px;
    color: #f87171;
  }

  .auth-success {
    margin-top: 16px;
    padding: 12px 16px;
    background: #0f1f0f;
    border: 1px solid #1f3f1f;
    border-radius: 8px;
    font-size: 13px;
    color: #4ade80;
  }

  .auth-footer {
    margin-top: 28px;
    font-size: 13px;
    color: #444;
    text-align: center;
  }

  .auth-footer a {
    color: #4ade80;
    text-decoration: none;
    cursor: pointer;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }

  .auth-divider {
    height: 1px;
    background: #1a1a1a;
    margin: 32px 0;
  }
`;

export default function Register({ onGoToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmedPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmed_password: confirmedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
        return;
      }

      setSuccess("Konto erstellt! Du kannst dich jetzt einloggen.");
      setTimeout(() => onGoToLogin && onGoToLogin(), 1500);
    } catch {
      setError("Server nicht erreichbar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-logo">Matchday Coaching</div>

          <h1 className="auth-heading">Registrieren</h1>
          <p className="auth-sub">Erstelle dein Trainer-Konto.</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Benutzername</label>
              <input
                className="auth-input"
                type="text"
                placeholder="dein_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">E-Mail</label>
              <input
                className="auth-input"
                type="email"
                placeholder="trainer@verein.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Passwort</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Passwort bestätigen</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Wird erstellt..." : "Konto erstellen"}
            </button>
          </form>

          <div className="auth-divider" />

          <div className="auth-footer">
            Bereits ein Konto?{" "}
            <a onClick={onGoToLogin}>Einloggen</a>
          </div>
        </div>
      </div>
    </>
  );
}
