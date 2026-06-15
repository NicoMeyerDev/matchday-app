import { useEffect, useState } from "react";

/**
 * Wechsel-Briefing-Modal.
 * Poppt beim Spielerwechsel im Matchday auf.
 * Links: Mini-Spielfeld mit animiertem Laufweg (Spieler gleitet vom Start
 *        zur Zielposition, Endlosschleife, mit Geisterspur am Start).
 * Rechts: Rolle wählen (2 Buttons) + 3 Schlagworte aus Vorschlagsliste.
 */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');

  .brief-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.78);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 24px;
    font-family: 'DM Sans', sans-serif;
  }

  .brief-card {
    background: #0a0a0f;
    border: 1px solid #1e1e24;
    border-radius: 18px;
    width: 100%; max-width: 760px;
    overflow: hidden;
  }

  .brief-head {
    padding: 16px 22px;
    border-bottom: 1px solid #141418;
    display: flex; align-items: center; justify-content: space-between;
  }

  .brief-head-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: 0.05em; color: #fff;
  }
  .brief-head-sub { font-size: 12px; color: #52525b; margin-top: 2px; }

  .brief-close {
    width: 32px; height: 32px; border-radius: 999px;
    border: 1px solid #1e1e24; background: #111116;
    color: #71717a; cursor: pointer; font-size: 16px;
  }
  .brief-close:hover { background: #1a1a24; }

  .brief-body {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px;
  }

  @media (max-width: 640px) {
    .brief-body { grid-template-columns: 1fr; }
  }

  /* Spielfeld links */
  .brief-pitch {
    position: relative;
    aspect-ratio: 2 / 3;
    background: linear-gradient(180deg, #1a5c2a 0%, #1e6b31 50%, #1a5c2a 100%);
    border: 2px solid #0a1f0e; border-radius: 12px;
    overflow: hidden;
  }
  .brief-pitch::before {
    content: ''; position: absolute; left: 0; right: 0; top: 50%;
    height: 1px; background: rgba(255,255,255,0.3);
  }
  .brief-pitch-circle {
    position: absolute; left: 50%; top: 50%;
    width: 60px; height: 60px; border: 1px solid rgba(255,255,255,0.3);
    border-radius: 50%; transform: translate(-50%, -50%);
  }
  .brief-box-top {
    position: absolute; top: 0; left: 28%; right: 28%; height: 13%;
    border: 1px solid rgba(255,255,255,0.25); border-top: none;
  }
  .brief-box-bottom {
    position: absolute; bottom: 0; left: 28%; right: 28%; height: 13%;
    border: 1px solid rgba(255,255,255,0.25); border-bottom: none;
  }

  .brief-dot {
    position: absolute; transform: translate(-50%, -50%);
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    width: 56px;
  }
  .brief-dot-circle {
    width: 24px; height: 24px; border-radius: 50%;
    background: #22c55e; border: 2px solid #fff;
    box-shadow: 0 0 10px #22c55e88;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: #040f04;
  }
  .brief-dot-name {
    font-size: 9px; color: #fff; font-weight: 700;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8); text-align: center;
    line-height: 1.1; white-space: nowrap;
  }
  .brief-dot.neighbor { opacity: 0.5; }
  .brief-dot.neighbor .brief-dot-circle {
    background: #3b3b45; border-color: rgba(255,255,255,0.45); box-shadow: none; color: #d4d4d8;
  }
  .brief-dot.neighbor .brief-dot-name { color: rgba(255,255,255,0.75); }

  /* Geisterspur an der Startposition */
  .brief-ghost {
    position: absolute; transform: translate(-50%, -50%);
    width: 24px; height: 24px; border-radius: 50%;
    border: 2px dashed rgba(255,255,255,0.45);
    background: rgba(34,197,94,0.15);
  }

  /* Animierter aktiver Spieler */
  .brief-mover {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    animation-name: brief-run;
    animation-duration: 2.8s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  @keyframes brief-run {
    0%   { transform: translate(0, 0); }
    45%  { transform: translate(var(--dx, 0px), var(--dy, 0px)); }
    55%  { transform: translate(var(--dx, 0px), var(--dy, 0px)); }
    100% { transform: translate(0, 0); }
  }

  .brief-role-name { text-align: center; margin-top: 10px; font-size: 13px; color: #22c55e; font-weight: 700; }

  /* Rechte Seite */
  .brief-roles { display: flex; gap: 8px; margin-bottom: 16px; }
  .brief-role-btn {
    flex: 1; padding: 10px; border-radius: 10px;
    border: 1px solid #1e1e24; background: #111116;
    color: #a1a1aa; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .brief-role-btn:hover { border-color: #3f3f46; }
  .brief-role-btn.active { border-color: #22c55e; background: #0d1f0e; color: #22c55e; }

  .brief-section-label {
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
    color: #52525b; margin-bottom: 10px;
  }

  .brief-keywords { display: flex; flex-direction: column; gap: 8px; }
  .brief-keyword {
    padding: 10px 12px; border-radius: 8px; text-align: left;
    border: 1px solid #161619; background: #0a0a0e;
    color: #3a3a42; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 10px; transition: all 0.15s;
  }
  .brief-keyword:hover { color: #71717a; }
  .brief-keyword.selected { border-color: #22c55e; background: #0d1f0e; color: #22c55e; }
  .brief-keyword.disabled { cursor: not-allowed; }
  .brief-keyword-check {
    width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
    border: 1px solid #232328; display: flex; align-items: center; justify-content: center;
    font-size: 12px;
  }
  .brief-keyword.selected .brief-keyword-check { background: #22c55e; border-color: #22c55e; color: #040f04; }

  .brief-counter { font-size: 11px; color: #52525b; margin-top: 10px; }

  .brief-foot {
    padding: 16px 22px; border-top: 1px solid #141418;
    display: flex; justify-content: flex-end; gap: 10px;
  }
  .brief-btn-cancel {
    padding: 10px 18px; border-radius: 8px;
    border: 1px solid #1e1e24; background: transparent;
    color: #71717a; cursor: pointer; font-size: 14px; font-family: 'DM Sans', sans-serif;
  }
  .brief-btn-confirm {
    padding: 10px 24px; border-radius: 8px; border: none;
    background: #22c55e; color: #040f04; cursor: pointer;
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.06em;
  }
  .brief-btn-confirm:disabled { background: #0d2010; color: #1a3a1a; cursor: not-allowed; }
`;

// ---------------------------------------------------------------------
// Rollen-Bibliothek: pro Positionsgruppe 2 Rollen mit Bewegung + Schlagworten
// dx/dy = Bewegungs-Offset in px (relativ zur Start-Position).
// "side" = +1 wenn Position links vom Zentrum (x<50), -1 wenn rechts.
// ---------------------------------------------------------------------

function getPositionGroup(label = "") {
  const l = label.toUpperCase();
  if (l === "TW") return "tw";
  if (["LV", "RV", "IV", "IVL", "IVR", "IVM"].includes(l)) return "def";
  if (["LM", "RM", "LWB", "RWB", "LF", "RF"].includes(l)) return "wide";
  if (["ZM", "ZML", "ZMR", "ZM1", "ZM2", "ZDM", "ZDML", "ZDMR", "DM", "DML", "DMR", "OM", "ZAM"].includes(l)) return "mid";
  if (["ST", "STL", "STR"].includes(l)) return "st";
  return "mid";
}

function buildRoles(side) {
  return {
    tw: [
      {
        key: "aufbau",
        label: "Mitspielen / Aufbau",
        dx: 0, dy: -55,
        keywords: [
          "Bleib anspielbar",
          "Spiel schnell weiter",
          "Steh hoch hinter der Kette",
          "Ruhe am Ball",
          "Such den freien Mann",
        ],
      },
      {
        key: "linie",
        label: "Linie halten",
        dx: 0, dy: 18,
        keywords: [
          "Bleib auf der Linie",
          "Organisier die Abwehr",
          "Komm bei Flanken raus",
          "Gib Kommandos",
          "Konzentration bei langen Bällen",
        ],
      },
    ],
    def: [
      {
        key: "aufbauen",
        label: "Mit aufbauen",
        dx: 0, dy: -70,
        keywords: [
          "Trag den Ball nach vorne",
          "Such den vertikalen Pass",
          "Bleib ruhig im Aufbau",
          "Öffne die Seite",
          "Biete dich kurz an",
        ],
      },
      {
        key: "rausruecken",
        label: "Rausrücken / Pressing",
        dx: side * 35, dy: -55,
        keywords: [
          "Steig früh raus",
          "Lass ihn nicht drehen",
          "Attackier den ersten Kontakt",
          "Schieb die Kette hoch",
          "Sichere den Raum hinter dir ab",
        ],
      },
    ],
    wide: [
      {
        key: "fluegelverteidiger",
        label: "Flügelverteidiger",
        dx: 0, dy: -75,
        keywords: [
          "Bleib breit an der Linie",
          "Mach die Tiefe – hinter die Kette",
          "Sichere hinten ab bei Ballverlust",
          "Such die Flanke",
          "Gegenspieler eng stellen",
          "Tempo über außen machen",
        ],
      },
      {
        key: "inverser",
        label: "Inverser Flügelspieler",
        dx: side * 65, dy: -55,
        keywords: [
          "Zieh in den Halbraum",
          "Such den Abschluss",
          "Verbinde dich mit dem Zehner",
          "Lass den Außenverteidiger aufrücken",
          "Spiel zwischen den Linien",
          "Komm auf den zweiten Pfosten",
        ],
      },
    ],
    mid: [
      {
        key: "aufruecken",
        label: "Aufrücken (Achter)",
        dx: 0, dy: -80,
        keywords: [
          "Schieb in die Box nach",
          "Zweite Welle",
          "Such den Strafraum",
          "Spiel und geh",
          "Unterstütz den Stürmer",
        ],
      },
      {
        key: "absichern",
        label: "Absichern (Sechser)",
        dx: 0, dy: 55,
        keywords: [
          "Bleib vor der Abwehr",
          "Sichere die Konter ab",
          "Verteil die Bälle",
          "Halt die Position",
          "Wenig Risiko im Aufbau",
        ],
      },
    ],
    st: [
      {
        key: "stossstuermer",
        label: "Stoßstürmer",
        dx: 0, dy: -70,
        keywords: [
          "Lauf hinter die Kette",
          "Biete dich für den Steilpass an",
          "Zieh die Abwehr tief",
          "Pass aufs Abseits auf",
          "Sprint in die Tiefe bei Umschalten",
        ],
      },
      {
        key: "zielspieler",
        label: "Zielspieler",
        dx: 0, dy: 60,
        keywords: [
          "Mach die Bälle fest",
          "Warte im Rückraum",
          "Spiel als Wand ab",
          "Bind die Innenverteidiger",
          "Halt den Ball bis Unterstützung kommt",
        ],
      },
    ],
  };
}

export default function BriefingModal({ position, playerName, neighbors = [], onConfirm, onCancel }) {
  const [roleKey, setRoleKey] = useState(null);
  const [selected, setSelected] = useState([]);

  const x = position?.x ?? 50;
  const y = position?.y ?? 50;
  const side = x < 50 ? 1 : -1; // links (1) → Bewegung "innen" geht nach rechts, rechts (-1) → nach links

  const group = getPositionGroup(position?.label);
  const roles = buildRoles(side)[group] || buildRoles(side).mid;

  // Beim Öffnen / Positionswechsel: erste Rolle vorauswählen
  useEffect(() => {
    if (position) {
      setRoleKey(roles[0].key);
      setSelected([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.id]);

  if (!position) return null;

  const activeRole = roles.find((r) => r.key === roleKey) || roles[0];

  function toggleKeyword(kw) {
    setSelected((prev) => {
      if (prev.includes(kw)) return prev.filter((k) => k !== kw);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, kw];
    });
  }

  function selectRole(key) {
    setRoleKey(key);
    setSelected([]);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="brief-backdrop">
        <div className="brief-card">
          <div className="brief-head">
            <div>
              <div className="brief-head-title">Wechsel-Briefing</div>
              <div className="brief-head-sub">
                {position.label}{playerName ? ` · ${playerName}` : ""}
              </div>
            </div>
            <button className="brief-close" onClick={onCancel}>✕</button>
          </div>

          <div className="brief-body">
            {/* LINKS: Spielfeld mit Animation */}
            <div>
              <div className="brief-pitch">
                <div className="brief-pitch-circle" />
                <div className="brief-box-top" />
                <div className="brief-box-bottom" />

                {/* Nachbarn */}
                {neighbors.map((n) => (
                  <div key={n.label} className="brief-dot neighbor" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                    <div className="brief-dot-circle">{n.number ?? ""}</div>
                    <div className="brief-dot-name">{n.name ?? n.label}</div>
                  </div>
                ))}

                {/* Geisterspur an Startposition */}
                <div className="brief-ghost" style={{ left: `${x}%`, top: `${y}%` }} />

                {/* Aktiver Spieler – animiert */}
                <div className="brief-dot" style={{ left: `${x}%`, top: `${y}%` }}>
                  <div
                    className="brief-mover"
                    style={{ "--dx": `${activeRole.dx}px`, "--dy": `${activeRole.dy}px` }}
                  >
                    <div className="brief-dot-circle">{position.number ?? position.label}</div>
                    <div className="brief-dot-name">{playerName || position.label}</div>
                  </div>
                </div>
              </div>
              <div className="brief-role-name">{activeRole.label}</div>
            </div>

            {/* RECHTS: Rolle + Schlagworte */}
            <div>
              <div className="brief-roles">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    className={`brief-role-btn ${roleKey === r.key ? "active" : ""}`}
                    onClick={() => selectRole(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="brief-section-label">Aufgaben (max. 3 wählen)</div>
              <div className="brief-keywords">
                {activeRole.keywords.map((kw) => {
                  const isSelected = selected.includes(kw);
                  const isDisabled = !isSelected && selected.length >= 3;
                  return (
                    <button
                      key={kw}
                      className={`brief-keyword ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                      onClick={() => toggleKeyword(kw)}
                    >
                      <span className="brief-keyword-check">{isSelected ? "✓" : ""}</span>
                      {kw}
                    </button>
                  );
                })}
              </div>
              <div className="brief-counter">{selected.length} / 3 ausgewählt</div>
            </div>
          </div>

          <div className="brief-foot">
            <button className="brief-btn-cancel" onClick={onCancel}>Abbrechen</button>
            <button
              className="brief-btn-confirm"
              disabled={selected.length === 0}
              onClick={() => onConfirm({ role: activeRole.key, roleLabel: activeRole.label, keywords: selected, dx: activeRole.dx, dy: activeRole.dy })}
            >
              Verstanden – Wechsel!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
