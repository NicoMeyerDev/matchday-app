import { useEffect, useState } from "react";

/**
 * Wechsel-Briefing-Modal.
 * Poppt beim Spielerwechsel im Matchday auf.
 * Links: Mini-Spielfeld mit Zone der gewählten Rolle + animiertem Laufweg
 *        der gewählten Aufgabe (Spieler gleitet vom Start zum Ziel, Endlosschleife,
 *        mit Geisterspur am Start).
 * Rechts: Rolle wählen (bestimmt NUR die Zone) + Aufgabe wählen (bestimmt NUR die Bewegung).
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

  /* Zone-Darstellung für Rolle (Rechteck, % relativ zum Feld) */
  .brief-zone {
    position: absolute;
    background: rgba(34,197,94,0.16);
    border: 1px dashed rgba(34,197,94,0.55);
    border-radius: 8px;
  }

  /* Animierter aktiver Spieler auf %-Basis (Rolle→Zone / Aufgabe→Bewegung Modell).
     animation-name/-duration werden pro Aufgabe inline gesetzt (siehe buildRunAnimation),
     da die Anzahl Wegpunkte je Aufgabe variiert. */
  .brief-mover-pct {
    position: absolute;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    transform: translate(-50%, -50%);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  .brief-role-name { text-align: center; margin-top: 10px; font-size: 13px; color: #22c55e; font-weight: 700; }

  /* Rechte Seite */
  .brief-roles { display: flex; gap: 8px; margin-bottom: 16px; }
  .brief-tasks { display: flex; gap: 8px; margin-bottom: 16px; }
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
// Rolle → Zone (wo darf sich der Spieler bewegen) und
// Aufgabe → Bewegungspfad (wie sieht die Laufbewegung aus) sind zwei
// getrennte, unabhängig kombinierbare Zuordnungen. Koordinaten in %
// relativ zum Pitch-Container (kein px), damit sie mit dem Tablet-Layout
// mitskalieren. "side" = +1 wenn Position links vom Zentrum (x<50), -1 rechts.
// ---------------------------------------------------------------------

function getPositionGroup(label = "") {
  const l = label.toUpperCase();
  if (l === "TW") return "tw";
  if (["LV", "RV"].includes(l)) return "av";
  if (["IV", "IVL", "IVR", "IVM"].includes(l)) return "iv";
  if (["LM", "RM", "LWB", "RWB", "LF", "RF"].includes(l)) return "fluegel";
  if (["OM", "ZAM"].includes(l)) return "om";
  if (["ZM", "ZML", "ZMR", "ZM1", "ZM2"].includes(l)) return "zm";
  if (["ZDM", "ZDML", "ZDMR", "DM", "DML", "DMR"].includes(l)) return "zdm";
  if (["ST", "STL", "STR"].includes(l)) return "sturm";
  return "zm";
}

// === A) Rolle → Zone ===================================================
// group = Positionsgruppe (siehe getPositionGroup). zone = Rechteck in %,
// für die linke Feldseite definiert, wird bei side === -1 an x=50 gespiegelt.
// Neue Rolle ergänzen: einfach neuen Eintrag hinzufügen, nichts anfassen.
export const ROLE_ZONES = {
  // --- Sturm ---
  stossstuermer: {
    label: "Stoßstürmer",
    group: "sturm",
    zone: { xMin: 32, xMax: 68, yMin: 2, yMax: 33 }, // Zentrum, Angriffsdrittel
  },
  zielspieler: {
    label: "Zielspieler",
    group: "sturm",
    zone: { xMin: 30, xMax: 70, yMin: 12, yMax: 32 }, // OM-Bereich, Rückraum 16er
  },

  // --- Flügel ---
  fluegelstuermer: {
    label: "Flügelstürmer",
    group: "fluegel",
    zone: { xMin: 3, xMax: 20, yMin: 15, yMax: 80 }, // Außenbahn
  },
  inverser_fluegelstuermer: {
    label: "Inverser Flügelstürmer",
    group: "fluegel",
    zone: { xMin: 15, xMax: 35, yMin: 12, yMax: 35 }, // Halbraum, Außenkante 16er
  },

  // --- Zentrum ---
  om: {
    label: "OM",
    group: "om",
    zone: { xMin: 30, xMax: 70, yMin: 20, yMax: 40 }, // vor dem 16er, 16er-Kante
  },
  zm: {
    label: "ZM",
    group: "zm",
    zone: { xMin: 25, xMax: 75, yMin: 35, yMax: 65 }, // komplettes Zentrum
  },
  zdm: {
    label: "ZDM",
    group: "zdm",
    zone: { xMin: 30, xMax: 70, yMin: 55, yMax: 70 }, // vor der Abwehr
  },

  // --- Verteidigung ---
  av: {
    label: "Außenverteidiger",
    group: "av",
    zone: { xMin: 2, xMax: 22, yMin: 45, yMax: 85 }, // Außenbahn bis Mittelfeldlinie
  },
  iv: {
    label: "Innenverteidiger",
    group: "iv",
    zone: { xMin: 30, xMax: 70, yMin: 65, yMax: 88 }, // Zentrum, Verteidigungsdrittel
  },

  // --- Torwart ---
  linientorwart: {
    label: "Linientorwart",
    group: "tw",
    zone: { xMin: 35, xMax: 65, yMin: 85, yMax: 98 }, // 16er, torraumnah
  },
  ballspielender_torwart: {
    label: "Ballspielender Torwart",
    group: "tw",
    zone: { xMin: 25, xMax: 75, yMin: 70, yMax: 98 }, // 16er + erweiterte Aufbauzone
  },
};

function mirrorZone(zone, side) {
  if (side === 1) return zone;
  return { xMin: 100 - zone.xMax, xMax: 100 - zone.xMin, yMin: zone.yMin, yMax: zone.yMax };
}

// === B) Aufgabe → Bewegungspfad ========================================
// role = welche Rolle bietet diese Aufgabe an (reine UI-Zugehörigkeit,
// bestimmt NICHT die Zone). path = Wegpunkte in %-Offset von der Start-
// position, nacheinander abgefahren. mirror: true → alle dx-Werte des
// Pfads werden mit "side" multipliziert. Nach dem letzten Wegpunkt hält
// die Figur ~1s (siehe buildRunAnimation), dann Sprung zurück zum Start.
// Neue Aufgabe ergänzen: einfach neuen Eintrag hinzufügen, nichts anfassen.
// icon = Identifier eines lucide-react Icons (Auflösung erfolgt in Pitch.jsx),
// abbr = 4-6 Zeichen Kürzel fürs Aufgaben-Overlay auf dem Spielfeld.
export const TASK_MOVEMENTS = {
  // --- Stoßstürmer ---
  stossstuermer_tiefenlauf: {
    label: "Tiefenlauf", role: "stossstuermer", mirror: false,
    icon: "ArrowUp", abbr: "Tief",
    path: [{ dx: 0, dy: -40 }], // läuft bis zur gegnerischen Grundlinie durch (Clamp stoppt am Feldrand)
  },
  stossstuermer_ausweichen: {
    label: "Ausweichen", role: "stossstuermer", mirror: false,
    icon: "ArrowLeftRight", abbr: "Ausw",
    path: [{ dx: -18, dy: -3 }, { dx: 18, dy: -3 }, { dx: 0, dy: 0 }], // Pendel, endet mittig
  },

  // --- Zielspieler ---
  zielspieler_festmachen: {
    label: "Festmachen", role: "zielspieler", mirror: false,
    icon: "Anchor", abbr: "Fest",
    path: [{ dx: 0, dy: 12 }],
  },
  zielspieler_lauern: {
    label: "Lauern", role: "zielspieler", mirror: false,
    icon: "Eye", abbr: "Lauer",
    path: [{ dx: -12, dy: 3 }, { dx: 12, dy: 3 }, { dx: 0, dy: 3 }], // Pendel an der 16er-Kante
  },

  // --- Flügelstürmer ---
  fluegelstuermer_breit: {
    label: "Breit machen", role: "fluegelstuermer", mirror: true,
    icon: "Expand", abbr: "Breit",
    path: [
      { dx: -14, dy: 0 },   // zur Außenlinie
      { dx: -14, dy: -12 }, // Dribbling-Welle entlang der Linie
      { dx: -11, dy: -24 },
      { dx: -14, dy: -36 },
    ],
  },
  fluegelstuermer_flanke: {
    label: "Flanke", role: "fluegelstuermer", mirror: true,
    icon: "Send", abbr: "Flanke",
    path: [{ dx: 0, dy: -90 }, { dx: 10, dy: -90 }], // läuft bis zur Grundlinie durch, dann Ausholimpuls nach innen
  },

  // --- Inverser Flügelstürmer ---
  inverser_einruecken: {
    label: "Einrücken", role: "inverser_fluegelstuermer", mirror: true,
    icon: "GitMerge", abbr: "Einr",
    path: [{ dx: 22, dy: -14 }], // diagonal ins Zentrum, Höhe erstes Drittel (nicht in den Strafraum)
  },

  // --- OM ---
  om_verteilen: {
    label: "Verteilen", role: "om", mirror: false,
    icon: "Share2", abbr: "Vert",
    path: [{ dx: -16, dy: 0 }, { dx: 16, dy: 0 }, { dx: 0, dy: 0 }], // Pendel vor dem 16er
  },
  om_abschluss: {
    label: "Abschluss", role: "om", mirror: false,
    icon: "Target", abbr: "Absch",
    path: [{ dx: 0, dy: -16 }],
  },

  // --- ZM ---
  zm_spielverteilung: {
    label: "Spielverteilung", role: "zm", mirror: false,
    icon: "Network", abbr: "SpVer",
    path: [{ dx: -16, dy: 0 }, { dx: 16, dy: 0 }, { dx: 0, dy: 0 }],
  },
  zm_nachruecken: {
    label: "Nachrücken", role: "zm", mirror: false,
    icon: "ArrowUpRight", abbr: "Nachr",
    path: [{ dx: 0, dy: -16 }],
  },
  zm_pressing: {
    label: "Pressing", role: "zm", mirror: false,
    icon: "Flame", abbr: "Press",
    path: [{ dx: 0, dy: -18 }, { dx: 0, dy: 0 }], // vor zum Gegner, danach zurück in die Zone
  },

  // --- ZDM ---
  zdm_aufbauen: {
    label: "Aufbauen", role: "zdm", mirror: false,
    icon: "Layers", abbr: "Aufb",
    path: [{ dx: -14, dy: 8 }, { dx: 14, dy: 8 }, { dx: 0, dy: 8 }], // diagonales Pendel
  },
  zdm_absichern: {
    label: "Absichern", role: "zdm", mirror: false,
    icon: "Shield", abbr: "Absi",
    path: [{ dx: -14, dy: 0 }, { dx: 14, dy: 0 }, { dx: 0, dy: 0 }],
  },

  // --- Außenverteidiger ---
  av_ueberlaufen: {
    label: "Überlaufen", role: "av", mirror: true,
    icon: "ChevronsUp", abbr: "Überl",
    path: [{ dx: -4, dy: -38 }], // zieht am Flügelspieler vorbei, bis zur Grundlinie
  },
  av_absichern: {
    label: "Absichern Außen", role: "av", mirror: true,
    icon: "Shield", abbr: "AbsiA",
    path: [{ dx: 8, dy: 10 }],
  },

  // --- Innenverteidiger ---
  iv_aufbauen: {
    label: "Aufbauen", role: "iv", mirror: true,
    icon: "Layers", abbr: "Aufb",
    path: [{ dx: -12, dy: -8 }],
  },
  iv_verteidigen: {
    label: "Verteidigen", role: "iv", mirror: false,
    icon: "Shield", abbr: "Vertd",
    path: [{ dx: 0, dy: -15 }],
  },
  iv_kompakt: {
    label: "Kompakt halten", role: "iv", mirror: false,
    icon: "Minimize2", abbr: "Komp",
    path: [{ dx: -6, dy: 0 }, { dx: 6, dy: 0 }, { dx: 0, dy: 0 }], // minimale Amplitude
  },

  // --- Torwart (unverändert) ---
  linientorwart_absichern: {
    label: "Absichern Linie", role: "linientorwart", mirror: false,
    icon: "Shield", abbr: "Absi",
    path: [{ dx: 0, dy: 3 }],
  },
  ballspielender_verteilen: {
    label: "Verteilen", role: "ballspielender_torwart", mirror: false,
    icon: "Send", abbr: "Vert",
    path: [{ dx: 0, dy: -15 }],
  },
};

// === Rückwandlung: instruction-String -> playerBriefings-Eintrag ======
// buildInstructionText (utils/lineup.js) speichert nur roleKey + aufgaben-Keys
// als JSON im instruction-Feld. Labels werden hier IMMER live aus ROLE_ZONES/
// TASK_MOVEMENTS nachgeschlagen (nicht aus dem Text geraten), damit spätere
// Label-Umbenennungen automatisch übernommen werden.

/**
 * Parst den instruction-String eines Slots zurück in einen playerBriefings-Eintrag
 * ({ role, roleLabel, aufgaben, aufgabenLabels }). Gibt null zurück bei leerem,
 * fremdem oder altem (rein menschenlesbarem) instruction-Text.
 */
export function parseInstructionText(instruction) {
  if (!instruction) return null;
  let parsed;
  try {
    parsed = JSON.parse(instruction);
  } catch {
    return null;
  }
  const roleKey = parsed?.role;
  const role = roleKey ? ROLE_ZONES[roleKey] : null;
  if (!role) return null;

  const aufgaben = Array.isArray(parsed.aufgaben) ? parsed.aufgaben.filter((key) => TASK_MOVEMENTS[key]) : [];
  return {
    role: roleKey,
    roleLabel: role.label,
    aufgaben,
    aufgabenLabels: aufgaben.map((key) => TASK_MOVEMENTS[key].label),
  };
}

/**
 * Baut aus einem instruction-String einen lesbaren Anzeige-Text (z.B. für Tooltips
 * oder Listen), unabhängig vom internen Key-Format. Fällt bei altem Freitext-Format
 * auf den Rohtext zurück.
 */
export function getInstructionDisplayText(instruction) {
  const parsed = parseInstructionText(instruction);
  if (!parsed) return instruction || "";
  return [parsed.roleLabel, parsed.aufgabenLabels.join(", ")].filter(Boolean).join(" – ");
}

// === Generische Bewegungs-Engine =======================================
// Berechnet aus path.length die Keyframe-Zeitpunkte, sodass die Halte-
// Zeit an der Endposition IMMER ~HOLD_SECONDS beträgt, egal wie viele
// Wegpunkte eine Aufgabe hat. Kein Sonderfall-Code pro Rolle/Aufgabe.
const PER_LEG_SECONDS = 0.7;
const HOLD_SECONDS = 1;
const HOLD_STOP_PCT = 99.5; // kurz vor 100%, damit der Rücksprung zum Start fast unsichtbar bleibt

function buildRunAnimation(path, side, mirror, startX, startY) {
  const legs = path.length;
  const totalDuration = legs * PER_LEG_SECONDS + HOLD_SECONDS;
  const clamp = (v) => Math.max(0, Math.min(100, v)); // Spieler darf den sichtbaren Feldbereich nie verlassen

  const points = [
    { x: startX, y: startY },
    ...path.map((p) => ({
      x: clamp(startX + (mirror ? p.dx * side : p.dx)),
      y: clamp(startY + p.dy),
    })),
  ];

  const vars = {};
  points.forEach((pt, i) => {
    vars[`--p${i}-x`] = `${pt.x}%`;
    vars[`--p${i}-y`] = `${pt.y}%`;
  });

  const lastIndex = points.length - 1;
  const lines = points.map((_, i) => {
    const pct = ((i * PER_LEG_SECONDS) / totalDuration) * 100;
    return `${pct.toFixed(2)}% { left: var(--p${i}-x); top: var(--p${i}-y); }`;
  });
  lines.push(`${HOLD_STOP_PCT}% { left: var(--p${lastIndex}-x); top: var(--p${lastIndex}-y); }`);
  lines.push(`100% { left: var(--p0-x); top: var(--p0-y); }`);

  return {
    vars,
    css: `@keyframes brief-run-path { ${lines.join(" ")} }`,
    totalDuration,
  };
}

export default function BriefingModal({ position, playerName, neighbors = [], onConfirm, onCancel, title = "Wechsel-Briefing", confirmLabel = "Verstanden – Wechsel!", initialRoleKey = null, initialTaskKey = null }) {
  const [roleKey, setRoleKey] = useState(null);
  const [taskKey, setTaskKey] = useState(null);

  const x = position?.x ?? 50;
  const y = position?.y ?? 50;
  const side = x < 50 ? 1 : -1; // links (1) → Bewegung "innen" geht nach rechts, rechts (-1) → nach links

  const group = getPositionGroup(position?.label);
  const roleOptions = Object.entries(ROLE_ZONES)
    .filter(([, r]) => r.group === group)
    .map(([key, r]) => ({ key, ...r }));

  // Beim Öffnen / Positionswechsel: vorherige Rolle+Aufgabe des Spielers vorbefüllen
  // (falls vorhanden), sonst erste Rolle vorauswählen und Aufgabe zurücksetzen.
  useEffect(() => {
    if (position) {
      setRoleKey(initialRoleKey ?? roleOptions[0]?.key ?? null);
      setTaskKey(initialTaskKey ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.id]);

  if (!position) return null;

  const activeRole = ROLE_ZONES[roleKey];
  const activeZone = activeRole ? mirrorZone(activeRole.zone, side) : null;

  const taskOptions = Object.entries(TASK_MOVEMENTS)
    .filter(([, t]) => t.role === roleKey)
    .map(([key, t]) => ({ key, ...t }));

  const activeTask = TASK_MOVEMENTS[taskKey];
  const runAnimation = activeTask ? buildRunAnimation(activeTask.path, side, activeTask.mirror, x, y) : null;
  const canConfirm = Boolean(roleKey && taskKey);

  function selectRole(key) {
    setRoleKey(key);
    setTaskKey(null); // Aufgabe hängt von der Rolle ab -> zurücksetzen
  }

  function selectTask(key) {
    setTaskKey(key);
  }

  function handleConfirm() {
    const task = TASK_MOVEMENTS[taskKey];
    onConfirm({
      role: roleKey,
      roleLabel: activeRole?.label,
      aufgaben: taskKey ? [taskKey] : [],
      aufgabenLabels: task ? [task.label] : [],
    });
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="brief-backdrop">
        <div className="brief-card">
          <div className="brief-head">
            <div>
              <div className="brief-head-title">{title}</div>
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

                {/* Zone der gewählten Rolle */}
                {activeZone && (
                  <div
                    className="brief-zone"
                    style={{
                      left: `${activeZone.xMin}%`,
                      top: `${activeZone.yMin}%`,
                      width: `${activeZone.xMax - activeZone.xMin}%`,
                      height: `${activeZone.yMax - activeZone.yMin}%`,
                    }}
                  />
                )}

                {/* Geisterspur an Startposition */}
                <div className="brief-ghost" style={{ left: `${x}%`, top: `${y}%` }} />

                {/* Aktiver Spieler – animiert entlang der gewählten Aufgabe */}
                <div
                  key={taskKey || "idle"}
                  className="brief-mover-pct"
                  style={
                    runAnimation
                      ? {
                          ...runAnimation.vars,
                          animationName: "brief-run-path",
                          animationDuration: `${runAnimation.totalDuration}s`,
                        }
                      : { left: `${x}%`, top: `${y}%` }
                  }
                >
                  <div className="brief-dot-circle">{position.number ?? position.label}</div>
                  <div className="brief-dot-name">{playerName || position.label}</div>
                </div>
                {runAnimation && <style>{runAnimation.css}</style>}
              </div>
              <div className="brief-role-name">{activeRole?.label || ""}</div>
            </div>

            {/* RECHTS: Rolle (bestimmt Zone) + Aufgabe (bestimmt Bewegung) */}
            <div>
              <div className="brief-section-label">Rolle</div>
              <div className="brief-roles">
                {roleOptions.map((r) => (
                  <button
                    key={r.key}
                    className={`brief-role-btn ${roleKey === r.key ? "active" : ""}`}
                    onClick={() => selectRole(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="brief-section-label">Aufgabe (Bewegung)</div>
              <div className="brief-tasks">
                {taskOptions.map((t) => (
                  <button
                    key={t.key}
                    className={`brief-role-btn ${taskKey === t.key ? "active" : ""}`}
                    onClick={() => selectTask(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="brief-foot">
            <button className="brief-btn-cancel" onClick={onCancel}>Abbrechen</button>
            <button
              className="brief-btn-confirm"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
