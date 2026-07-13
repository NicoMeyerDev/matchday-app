import { useEffect, useState } from "react";
import { acceptClubInvite, fetchClubs } from "../api/client";

// Einladungsannahme: nimmt eine Vereinseinladung per Token automatisch entgegen,
// sobald der Nutzer eingeloggt ist, und meldet das Ergebnis an App zurück.
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .invite-root {
    min-height: 100vh;
    background: #07070a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
    padding: 24px;
  }

  .invite-card {
    width: 100%;
    max-width: 420px;
    text-align: center;
  }

  .invite-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 0.25em;
    color: #22c55e;
    margin-bottom: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .invite-logo::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
  }

  .invite-spinner {
    width: 36px;
    height: 36px;
    margin: 0 auto 24px;
    border: 3px solid #1e1e24;
    border-top-color: #22c55e;
    border-radius: 50%;
    animation: invite-spin 0.8s linear infinite;
  }

  @keyframes invite-spin { to { transform: rotate(360deg); } }

  .invite-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    color: #fff;
    letter-spacing: 0.03em;
    margin: 0 0 8px;
  }

  .invite-text {
    font-size: 14px;
    color: #71717a;
    line-height: 1.6;
    margin: 0;
  }

  .invite-success .invite-heading { color: #22c55e; }

  .invite-error-box {
    margin-top: 20px;
    padding: 14px 16px;
    background: #1f0f0f;
    border: 1px solid #3f1f1f;
    border-radius: 8px;
    font-size: 13px;
    color: #f87171;
  }

  .invite-btn {
    margin-top: 24px;
    padding: 12px 24px;
    background: #22c55e;
    color: #040f04;
    border: none;
    border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 15px;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.2s;
  }
  .invite-btn:hover { background: #16a34a; }
`;

// Extrahiert die Fehlermeldung aus der von client.js geworfenen Exception
// ("API-Fehler 400: {\"detail\": \"...\"}") und fällt auf den Rohtext zurück.
function extractErrorMessage(error) {
  const match = /^API-Fehler \d+: ([\s\S]*)$/.exec(error.message || "");
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.detail) return parsed.detail;
    } catch {
      // Antwort war kein JSON - Rohtext unten verwenden
    }
  }
  return error.message || "Einladung konnte nicht angenommen werden.";
}

export default function InviteAccept({ token, onDone }) {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [clubName, setClubName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function accept() {
      try {
        await acceptClubInvite(token);
        let club = null;
        try {
          const clubs = await fetchClubs();
          club = clubs[0] || null;
        } catch {
          // Vereinsname konnte nicht nachgeladen werden - kein harter Fehler
        }
        if (cancelled) return;
        setClubName(club?.name || "");
        setStatus("success");
        setTimeout(() => { if (!cancelled) onDone(club); }, 1800);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(extractErrorMessage(error));
        setStatus("error");
      }
    }

    accept();
    return () => { cancelled = true; };
    // onDone bewusst nicht als Dependency: App übergibt bei jedem Render eine neue
    // Funktionsreferenz, das würde sonst den Accept-Request mehrfach auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="invite-root">
      <style>{S}</style>
      <div className={`invite-card ${status === "success" ? "invite-success" : ""}`}>
        <div className="invite-logo">TAKTIX</div>

        {status === "loading" && (
          <>
            <div className="invite-spinner" />
            <h1 className="invite-heading">Einladung wird geprüft…</h1>
            <p className="invite-text">Einen Moment, wir ordnen dich deinem Verein zu.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="invite-heading">Willkommen an Bord!</h1>
            <p className="invite-text">
              {clubName
                ? `Du bist jetzt Teil von ${clubName}. Du wirst weitergeleitet…`
                : "Die Einladung wurde angenommen. Du wirst weitergeleitet…"}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="invite-heading">Einladung konnte nicht angenommen werden</h1>
            <p className="invite-text">Bitte prüfe den Link oder frage nach einer neuen Einladung.</p>
            <div className="invite-error-box">{errorMessage}</div>
            <button className="invite-btn" onClick={() => onDone(null)}>
              Zum Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
