import { useState, useEffect } from "react";
import { fetchTrainings, createTraining, deleteTraining, fetchTrainingBlocks, updateTrainingBlock } from "../api/client";

const COLORS = {
  bg: "#07070a",
  surface: "#111318",
  surfaceHover: "#181c24",
  border: "#1e2530",
  borderLight: "#252d3a",
  green: "#4CAF50",
  greenDim: "#4CAF5018",
  greenMid: "#4CAF5033",
  blue: "#3b82f6",
  blueDim: "#3b82f618",
  orange: "#f59e0b",
  orangeDim: "#f59e0b18",
  red: "#ef4444",
  text: "#e4e4e7",
  textMuted: "#6b7280",
  textDim: "#374151",
};

const mockUebungen = [
  { id: 1, name: "Passstafette 4v2", beschreibung: "Ballbesitz im Quadrat, 2 Verfolger", kategorie: "Passspiel", spieler: "4v2", schwerpunkt: "Technik", dauer: "15 min" },
  { id: 2, name: "Abschluss nach Kombination", beschreibung: "Flügelspiel mit Abschluss über Mitte", kategorie: "Abschluss", spieler: "Gruppe", schwerpunkt: "Technik", dauer: "20 min" },
  { id: 3, name: "Pressing 6v6", beschreibung: "Kompaktes Mittelfeldpressing mit Auslöser", kategorie: "Pressing", spieler: "6v6", schwerpunkt: "Taktik", dauer: "25 min" },
  { id: 4, name: "1v1 Defensiv", beschreibung: "Stellung halten, Gegner lenken", kategorie: "Zweikampf", spieler: "1v1", schwerpunkt: "Defensiv", dauer: "10 min" },
  { id: 5, name: "Rondo 5v2", beschreibung: "Kurze Pässe unter Druck", kategorie: "Passspiel", spieler: "5v2", schwerpunkt: "Technik", dauer: "12 min" },
  { id: 6, name: "Torabschluss nach Dribbling", beschreibung: "Gegenspieler umspielen, Abschluss", kategorie: "Abschluss", spieler: "Einzeln", schwerpunkt: "Technik", dauer: "15 min" },
];

const TABS = ["Übersicht", "Training anlegen", "Übungsdatenbank"];
const KATEGORIEN = ["Alle", "Passspiel", "Abschluss", "Pressing", "Zweikampf"];

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  const weekday = d.toLocaleDateString("de-DE", { weekday: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday}, ${day}.${month}.`;
}

function Badge({ label, color = COLORS.green, dim }) {
  return (
    <span style={{
      fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600,
      background: dim || color + "22", color,
      display: "inline-block", letterSpacing: 0.3
    }}>{label}</span>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: 18,
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.15s, background 0.15s",
      ...style
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.background = COLORS.surfaceHover; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.surface; } }}
    >
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "10px 14px",
  color: COLORS.text,
  fontSize: 14,
  boxSizing: "border-box",
  colorScheme: "dark",
};

const BLOCK_LABELS = {
  aktivierung: "Aktivierung / Erwärmung",
  spielform_1: "Spielform 1",
  zwischenblock: "Zwischenblock",
  spielform_2: "Spielform 2",
};

const BLOCK_COLORS = {
  aktivierung: COLORS.blue,
  spielform_1: COLORS.green,
  zwischenblock: COLORS.orange,
  spielform_2: COLORS.green,
};

export default function TrainingsHub({ onBack }) {
  const [activeTab, setActiveTab] = useState("Übersicht");
  const [filterKat, setFilterKat] = useState("Alle");
  const [trainingsTyp, setTrainingsTyp] = useState(null);

  // API state
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Detail view
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blockNotes, setBlockNotes] = useState({});

  // Form state
  const [formThema, setFormThema] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("18:00");
  const [formSpieler, setFormSpieler] = useState("");
  const [formSieger, setFormSieger] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { loadTrainings(); }, []);

  async function openTraining(training) {
    setSelectedTraining(training);
    setBlocksLoading(true);
    try {
      const data = await fetchTrainingBlocks(training.id);
      const sorted = [...data].sort((a, b) => a.reihenfolge - b.reihenfolge);
      setBlocks(sorted);
      const notes = {};
      sorted.forEach(b => { notes[b.id] = b.notes || ""; });
      setBlockNotes(notes);
    } catch (e) {
      setBlocks([]);
    } finally {
      setBlocksLoading(false);
    }
  }

  async function handleDeleteTraining(id, e) {
    e.stopPropagation();
    if (!confirm("Training wirklich löschen?")) return;
    try {
      await deleteTraining(id);
      setTrainings(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveBlockNotes(blockId) {
    try {
      await updateTrainingBlock(blockId, { notes: blockNotes[blockId] });
    } catch (e) {
      // silently ignore — user can retry
    }
  }

  async function loadTrainings() {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchTrainings();
      setTrainings(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formThema.trim() || !formDate) {
      setFormError("Bitte Thema und Datum angeben.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const notesParts = [];
      if (formSpieler) notesParts.push(`Spieler: ${formSpieler}`);
      if (formSieger) notesParts.push(`Sieger: ${formSieger}`);
      await createTraining({
        name: formThema.trim(),
        trainingsart: trainingsTyp === "Klassisch" ? "klassisch" : "frei",
        date: formDate,
        time: formTime + ":00",
        notes: notesParts.join(" | "),
      });
      await loadTrainings();
      setActiveTab("Übersicht");
      setTrainingsTyp(null);
      setFormThema("");
      setFormDate("");
      setFormTime("18:00");
      setFormSpieler("");
      setFormSieger("");
    } catch (e) {
      setFormError(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Derived stats
  const today = new Date().toISOString().slice(0, 10);
  const sortedTrainings = [...trainings].sort((a, b) => b.date.localeCompare(a.date));
  const nextTraining = [...trainings]
    .filter(t => t.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextLabel = nextTraining
    ? new Date(nextTraining.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short" })
    : "–";

  // Beteiligung chart: placeholder until player-count lands in model
  const chartValues = [11, 14, 12, 15, 13, 14, 12];
  const chartDates = sortedTrainings.slice(0, 7).reverse().map(t => {
    const d = new Date(t.date + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const chartDatesDisplay = chartDates.length >= 7 ? chartDates : ["–", "–", "–", "–", "–", "–", "–"].map((v, i) => chartDates[i] || v);
  const maxChart = Math.max(...chartValues);

  const filteredUebungen = filterKat === "Alle" ? mockUebungen : mockUebungen.filter(u => u.kategorie === filterKat);

  // ── Detail-Ansicht ──────────────────────────────────────────────────
  if (selectedTraining) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "Inter, -apple-system, sans-serif", padding: 24 }}>
        <div
          onClick={() => setSelectedTraining(null)}
          style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 16, cursor: "pointer" }}
        >
          ← Zurück zur Übersicht
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>{selectedTraining.name}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>
              {formatDate(selectedTraining.date)} · {selectedTraining.time?.slice(0, 5)} Uhr
            </div>
          </div>
          <Badge
            label={selectedTraining.trainingsart === "klassisch" ? "Klassisch" : "Frei"}
            color={selectedTraining.trainingsart === "klassisch" ? COLORS.green : COLORS.orange}
          />
        </div>

        {selectedTraining.notes && (
          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notizen</div>
            <div style={{ fontSize: 13, color: COLORS.text }}>{selectedTraining.notes}</div>
          </Card>
        )}

        <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Trainingsblöcke
        </div>

        {blocksLoading && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Lade Blöcke…</div>}
        {!blocksLoading && blocks.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Keine Blöcke vorhanden.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {blocks.map(block => {
            const color = BLOCK_COLORS[block.trainingstyp] || COLORS.green;
            return (
              <Card key={block.id} style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 32, background: color, borderRadius: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{block.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                      {BLOCK_LABELS[block.trainingstyp] || block.trainingstyp}
                      {block.start_time && block.end_time && ` · ${block.start_time.slice(0, 5)} – ${block.end_time.slice(0, 5)}`}
                    </div>
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Notizen zu diesem Block…"
                  value={blockNotes[block.id] ?? ""}
                  onChange={e => setBlockNotes(prev => ({ ...prev, [block.id]: e.target.value }))}
                  onBlur={() => saveBlockNotes(block.id)}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                />
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "Inter, -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "18px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div
            onClick={onBack}
            style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 4, cursor: "pointer" }}
          >
            ← Zurück zum Hub
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Trainingshub</div>
        </div>
        <button
          onClick={() => setActiveTab("Training anlegen")}
          style={{
            background: COLORS.green, color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}
        >+ Training anlegen</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, marginTop: 18, paddingLeft: 24 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: "none", border: "none",
            color: activeTab === tab ? COLORS.green : COLORS.textMuted,
            borderBottom: activeTab === tab ? `2px solid ${COLORS.green}` : "2px solid transparent",
            padding: "10px 18px", cursor: "pointer",
            fontWeight: activeTab === tab ? 700 : 400,
            fontSize: 13, transition: "all 0.15s",
            marginBottom: -1
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: "24px" }}>

        {/* Global error */}
        {error && (
          <div style={{ background: COLORS.red + "22", border: `1px solid ${COLORS.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: COLORS.red, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* ─── ÜBERSICHT ─── */}
        {activeTab === "Übersicht" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Linke Spalte */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Stats-Kacheln */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Trainings Saison", value: isLoading ? "…" : String(trainings.length), icon: "📅", color: COLORS.green },
                  { label: "Ø Beteiligung", value: "–", icon: "👥", color: COLORS.blue },
                  { label: "Übungen in DB", value: String(mockUebungen.length), icon: "📚", color: COLORS.orange },
                  { label: "Nächstes Training", value: isLoading ? "…" : nextLabel, icon: "⏰", color: COLORS.green },
                ].map(k => (
                  <Card key={k.label} style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 20 }}>{k.icon}</div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{k.label}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Beteiligungschart */}
              <Card style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                  Beteiligung — letzte 7 Einheiten
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
                  {chartValues.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 11, color: COLORS.green, fontWeight: 700 }}>{v}</div>
                      <div style={{
                        width: "100%",
                        height: (v / maxChart) * 52,
                        background: i === chartValues.length - 1
                          ? `linear-gradient(180deg, ${COLORS.green}, #2d7a3a)`
                          : COLORS.greenMid,
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.3s"
                      }} />
                      <div style={{ fontSize: 9, color: COLORS.textMuted }}>{chartDatesDisplay[i]}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Rechte Spalte — letzte Trainings */}
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                Letzte Trainingseinheiten
              </div>

              {isLoading && (
                <div style={{ color: COLORS.textMuted, fontSize: 13, padding: "20px 0" }}>Lade Trainings…</div>
              )}

              {!isLoading && sortedTrainings.length === 0 && (
                <div style={{ color: COLORS.textMuted, fontSize: 13, padding: "20px 0" }}>Noch keine Trainings vorhanden.</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sortedTrainings.slice(0, 8).map(t => (
                  <Card key={t.id} onClick={() => openTraining(t)} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                          {formatDate(t.date)}{t.time ? ` · ${t.time.slice(0, 5)} Uhr` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <Badge
                          label={t.trainingsart === "klassisch" ? "Klassisch" : "Frei"}
                          color={t.trainingsart === "klassisch" ? COLORS.green : COLORS.orange}
                        />
                        <button
                          onClick={e => handleDeleteTraining(t.id, e)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: COLORS.textMuted, fontSize: 16, lineHeight: 1, padding: "2px 4px",
                            borderRadius: 4,
                          }}
                          title="Training löschen"
                        >✕</button>
                      </div>
                    </div>
                    {t.notes && t.notes.includes("Sieger:") && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 12 }}>🏆</span>
                        <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                          Abschlussspiel: <span style={{ color: COLORS.green, fontWeight: 600 }}>
                            {t.notes.match(/Sieger:\s*([^|]+)/)?.[1]?.trim()}
                          </span>
                        </span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TRAINING ANLEGEN ─── */}
        {activeTab === "Training anlegen" && (
          <div style={{ maxWidth: 640 }}>

            {!trainingsTyp ? (
              <>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                  Trainingstyp wählen
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                  {[
                    {
                      typ: "Klassisch", icon: "📋", color: COLORS.green,
                      desc: "Nach DFB-Philosophie strukturiert",
                      phasen: ["Aktivierung 15'", "Spielen 30'", "Zwischenblock 15'", "Spielen 30'"]
                    },
                    {
                      typ: "Frei", icon: "✏️", color: COLORS.orange,
                      desc: "Eigene Struktur, freie Gestaltung",
                      phasen: ["Übungen frei wählen", "Reihenfolge anpassen", "Dauer selbst bestimmen"]
                    },
                  ].map(t => (
                    <Card key={t.typ} onClick={() => setTrainingsTyp(t.typ)} style={{
                      border: `2px solid ${t.color}33`, padding: 22, cursor: "pointer"
                    }}>
                      <div style={{ fontSize: 30, marginBottom: 12 }}>{t.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: t.color, marginBottom: 6 }}>{t.typ}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 14 }}>{t.desc}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {t.phasen.map((p, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color + "88" }} />
                            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => { setTrainingsTyp(null); setFormError(""); }} style={{
                    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, padding: "7px 14px", color: COLORS.textMuted, cursor: "pointer", fontSize: 13
                  }}>← Zurück</button>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    Training anlegen — <span style={{ color: trainingsTyp === "Klassisch" ? COLORS.green : COLORS.orange }}>{trainingsTyp}</span>
                  </div>
                </div>

                {/* Basis-Infos */}
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Allgemein</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Thema / Schwerpunkt</div>
                      <input
                        style={inputStyle}
                        placeholder="z.B. Pressing & Gegenpressing"
                        value={formThema}
                        onChange={e => setFormThema(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Datum</div>
                        <input
                          type="date"
                          style={inputStyle}
                          value={formDate}
                          onChange={e => setFormDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Uhrzeit</div>
                        <input
                          type="time"
                          style={inputStyle}
                          value={formTime}
                          onChange={e => setFormTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* DFB Phasen wenn Klassisch */}
                {trainingsTyp === "Klassisch" && (
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>DFB-Struktur</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { phase: "Aktivierung / Erwärmung", dauer: "15 min", color: COLORS.blue },
                        { phase: "Spielen", dauer: "30 min", color: COLORS.green },
                        { phase: "Zwischenblock", dauer: "15 min", color: COLORS.orange },
                        { phase: "Spielen", dauer: "30 min", color: COLORS.green },
                      ].map((p, i) => (
                        <div key={i} style={{
                          background: COLORS.bg, border: `1px solid ${p.color}33`,
                          borderRadius: 8, padding: "11px 14px",
                          display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 3, height: 28, background: p.color, borderRadius: 4 }} />
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{p.phase}</span>
                          </div>
                          <Badge label={p.dauer} color={p.color} />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Beteiligung */}
                <Card style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Trainingsbeteiligung</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Anzahl Spieler</div>
                      <input
                        style={{ ...inputStyle, padding: "9px 12px" }}
                        placeholder="z.B. 14"
                        value={formSpieler}
                        onChange={e => setFormSpieler(e.target.value)}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Abschlussspiel Sieger</div>
                      <input
                        style={{ ...inputStyle, padding: "9px 12px" }}
                        placeholder="z.B. Team Rot"
                        value={formSieger}
                        onChange={e => setFormSieger(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Auffällige Spieler</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["👍 Positiv aufgefallen", "👎 Negativ aufgefallen"].map(tag => (
                      <div key={tag} style={{
                        background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                        borderRadius: 20, padding: "6px 14px",
                        fontSize: 12, cursor: "pointer", color: COLORS.textMuted
                      }}>{tag}</div>
                    ))}
                  </div>
                </Card>

                {formError && (
                  <div style={{ background: COLORS.red + "22", border: `1px solid ${COLORS.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: COLORS.red, fontSize: 13 }}>
                    {formError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  style={{
                    width: "100%", background: isSaving ? COLORS.textDim : COLORS.green, color: "#fff", border: "none",
                    borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer"
                  }}
                >
                  {isSaving ? "Wird gespeichert…" : "Training speichern"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ─── ÜBUNGSDATENBANK ─── */}
        {activeTab === "Übungsdatenbank" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <input style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "8px 14px", color: COLORS.text, fontSize: 13,
                width: 220
              }} placeholder="🔍  Übung suchen..." />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {KATEGORIEN.map(k => (
                  <button key={k} onClick={() => setFilterKat(k)} style={{
                    background: filterKat === k ? COLORS.green : COLORS.surface,
                    border: `1px solid ${filterKat === k ? COLORS.green : COLORS.border}`,
                    borderRadius: 20, padding: "7px 14px",
                    color: filterKat === k ? "#fff" : COLORS.textMuted,
                    cursor: "pointer", fontSize: 12, fontWeight: filterKat === k ? 600 : 400
                  }}>{k}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {filteredUebungen.map(u => (
                <Card key={u.id} onClick={() => {}} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, flex: 1, marginRight: 8 }}>{u.name}</div>
                    <Badge label={u.spieler} color={COLORS.green} />
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12, lineHeight: 1.5 }}>{u.beschreibung}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge label={u.kategorie} color={COLORS.blue} />
                      <Badge label={u.schwerpunkt} color={COLORS.orange} />
                    </div>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>⏱ {u.dauer}</span>
                  </div>
                </Card>
              ))}

              <div onClick={() => {}} style={{
                background: "transparent",
                border: `2px dashed ${COLORS.border}`,
                borderRadius: 12, padding: 16,
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                gap: 10, color: COLORS.textMuted,
                transition: "border-color 0.15s, color 0.15s",
                minHeight: 120
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.green; e.currentTarget.style.color = COLORS.green; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}
              >
                <span style={{ fontSize: 22 }}>+</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Übung anlegen</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
