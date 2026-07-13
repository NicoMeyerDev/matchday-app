import { useState } from "react";
import { createClubInvite } from "../api/client";

// Vereinsseite: zeigt den Vereinsnamen und erlaubt das Einladen weiterer Trainer per Link.
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .verein-root { font-family: 'DM Sans', sans-serif; color: #d4d4d8; }

  .verein-topbar { padding: 4px 0 24px; }
  .verein-topbar .page-label { font-size: 11px; letter-spacing: 0.15em; color: #3f3f46; text-transform: uppercase; }
  .verein-topbar .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 0.05em; color: #fff; line-height: 1.1; }

  .verein-card { background: #0a0a0f; border: 1px solid #141418; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
  .verein-card h2 { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.05em; color: #e4e4e7; margin: 0 0 10px; }
  .verein-club-name { font-size: 22px; font-weight: 600; color: #22c55e; }

  .verein-invite-form { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
  .verein-invite-form input {
    flex: 1; min-width: 220px; border: 1px solid #1e1e24; border-radius: 8px;
    padding: 10px 12px; background: #0f0f14; color: #d4d4d8;
  }
  .verein-invite-form input:focus { outline: none; border-color: #22c55e; }
  .verein-invite-form input:disabled { opacity: .6; }

  .verein-btn {
    padding: 10px 20px; background: #22c55e; color: #040f04; border: none; border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 0.08em;
    cursor: pointer; transition: background 0.2s; white-space: nowrap;
  }
  .verein-btn:hover:not(:disabled) { background: #16a34a; }
  .verein-btn:disabled { background: #1a2e1a; color: #2d5a2d; cursor: not-allowed; }

  .verein-link-box {
    margin-top: 16px; display: flex; align-items: center; gap: 10px;
    background: #0f1f10; border: 1px solid #22c55e33; border-radius: 8px; padding: 10px 14px;
  }
  .verein-link-box code { flex: 1; overflow-x: auto; white-space: nowrap; color: #86efac; font-size: 13px; }

  .verein-copy-btn {
    padding: 8px 14px; border: 1px solid #22c55e55; background: transparent; color: #22c55e;
    border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap;
  }
  .verein-copy-btn:hover { background: #163d25; }
`;

export default function Verein({ club }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copyLabel, setCopyLabel] = useState("Link kopieren");

  async function handleCreateInvite(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      const result = await createClubInvite(email.trim());
      setInviteLink(result.invite_link);
      setInfo("Einladung wurde erstellt.");
      setEmail("");
      setCopyLabel("Link kopieren");
    } catch (apiError) {
      setError(apiError.message || "Einladung konnte nicht erstellt werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyLabel("Kopiert!");
      setTimeout(() => setCopyLabel("Link kopieren"), 2000);
    } catch {
      setError("Link konnte nicht in die Zwischenablage kopiert werden.");
    }
  }

  return (
    <div className="verein-root">
      <style>{S}</style>

      <div className="verein-topbar">
        <div className="page-label">Vereinsverwaltung</div>
        <div className="page-title">Mein Verein</div>
      </div>

      <div className="verein-card">
        <h2>Verein</h2>
        <div className="verein-club-name">{club?.name || "Kein Verein hinterlegt"}</div>
      </div>

      <div className="verein-card">
        <h2>Trainer einladen</h2>
        {error && <div className="error-box">{error}</div>}
        {info && <div className="info-box">{info}</div>}

        <form className="verein-invite-form" onSubmit={handleCreateInvite}>
          <input
            type="email"
            placeholder="email@verein.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <button type="submit" className="verein-btn" disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? "Wird erstellt…" : "Einladung erstellen"}
          </button>
        </form>

        {inviteLink && (
          <div className="verein-link-box">
            <code>{inviteLink}</code>
            <button type="button" className="verein-copy-btn" onClick={handleCopyLink}>
              {copyLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
