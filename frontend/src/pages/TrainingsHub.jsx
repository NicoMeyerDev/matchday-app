// Trainingshub: Kalender, Übungsdatenbank und Trainingsplanung
import { useState, useEffect } from "react";
import {
  fetchTrainings, createTraining, updateTraining, deleteTraining,
  fetchTrainingBlocks, updateTrainingBlock, createTrainingBlock,
  fetchUebungen, createUebung, updateUebung, deleteUebung, fetchCategories,
} from "../api/client";

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
  orange: "#f59e0b",
  red: "#ef4444",
  text: "#e4e4e7",
  textMuted: "#6b7280",
  textDim: "#374151",
};

const BLOCK_TYPES = ["aktivierung", "spielform_1", "zwischenblock", "spielform_2"];
const BLOCK_LABELS = { aktivierung: "Aktivierung / Erwärmung", spielform_1: "Spielform 1", zwischenblock: "Zwischenblock", spielform_2: "Spielform 2" };

// Filtert Übungen pro Blocktyp nach der Kategorie "Aufwärmen"
const BLOCK_EXERCISE_FILTER = {
  aktivierung: u => u.categories?.some(c => c.name === "Aufwärmen"),
  spielform_1: u => !u.categories?.some(c => c.name === "Aufwärmen"),
  zwischenblock: u => !u.categories?.some(c => c.name === "Aufwärmen"),
  spielform_2: u => !u.categories?.some(c => c.name === "Aufwärmen"),
};

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_NAMES = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const CARD_OPACITIES = [1, 1, 0.5, 0.25];

// Liest Übungs-IDs und Freitext aus den Block-Notizen
function parseBlockNotes(raw, uebungen) {
  if (!raw) return { exercises: [], text: "" };
  const nl = raw.indexOf("\n");
  const firstLine = nl === -1 ? raw : raw.slice(0, nl);
  if (firstLine.startsWith("__ex__:")) {
    const ids = firstLine.slice(7).split(",").map(Number).filter(Boolean);
    return { exercises: uebungen.filter(u => ids.includes(u.id)), text: nl === -1 ? "" : raw.slice(nl + 1) };
  }
  return { exercises: [], text: raw };
}

// Serialisiert Übungs-IDs und Freitext in das Block-Notizen-Format
function buildBlockNotes(exercises, text) {
  if (exercises.length === 0) return text;
  return `__ex__:${exercises.map(e => e.id).join(",")}\n${text}`;
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return `${d.toLocaleDateString("de-DE", { weekday: "short" })}, ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
}

function getWeekDays(ref) {
  const d = new Date(ref);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x; });
}

function getMonthDays(ref) {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  let offset = new Date(year, month, 1).getDay();
  if (offset === 0) offset = 7;
  const days = [];
  for (let i = offset - 1; i > 0; i--) days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
  const last = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= last; i++) days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  let next = 1;
  while (days.length % 7 !== 0) days.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false });
  return days;
}

function Badge({ label, color = COLORS.green }) {
  return <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600, background: color + "22", color, display: "inline-block", letterSpacing: 0.3 }}>{label}</span>;
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, cursor: onClick ? "pointer" : "default", transition: "border-color 0.15s, background 0.15s", ...style }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.background = COLORS.surfaceHover; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.surface; } }}
    >{children}</div>
  );
}

const inputStyle = { width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14, boxSizing: "border-box", colorScheme: "dark" };

// Übungsauswahl für Trainingsblöcke
function ExercisePicker({ uebungen, selected, onToggle, onClose, filter = () => true }) {
  const [search, setSearch] = useState("");
  const filtered = uebungen.filter(filter).filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.categories?.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
        <input autoFocus style={{ ...inputStyle, padding: "7px 12px", fontSize: 13, flex: 1 }} placeholder="Übung suchen…" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>✕</button>
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {filtered.length === 0 && <div style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>Keine Übungen gefunden.</div>}
        {filtered.map(u => {
          const already = selected.some(x => x.id === u.id);
          const katLabel = u.categories?.[0]?.name ?? "Übung";
          return (
            <div key={u.id} onClick={() => onToggle(u)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${COLORS.border}`, background: already ? COLORS.greenDim : "transparent" }}
              onMouseEnter={e => { if (!already) e.currentTarget.style.background = COLORS.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = already ? COLORS.greenDim : "transparent"; }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: already ? 600 : 400, color: already ? COLORS.green : COLORS.text }}>{u.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{katLabel} · {u.duration} min</div>
              </div>
              {already && <span style={{ fontSize: 14, color: COLORS.green }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DB_TILE = (onClick) => (
  <div onClick={onClick} style={{ borderRadius: 10, border: "0.5px solid #1e1e1e", cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#22c55e44"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; }}
  >
    <svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
      <defs>
        <marker id="ah-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" /></marker>
        <marker id="ah-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#e05555" /></marker>
      </defs>
      <rect width="300" height="130" fill="#0c180c" />
      <rect x="18" y="12" width="264" height="106" fill="none" stroke="#1a3a1a" strokeWidth="1.5" />
      <line x1="150" y1="12" x2="150" y2="118" stroke="#1a3a1a" strokeWidth="1" />
      <circle cx="150" cy="65" r="22" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <circle cx="150" cy="65" r="1.5" fill="#1a3a1a" />
      <rect x="18" y="34" width="52" height="62" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <rect x="18" y="48" width="20" height="34" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <rect x="11" y="52" width="7" height="26" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <rect x="230" y="34" width="52" height="62" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <rect x="262" y="48" width="20" height="34" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <rect x="282" y="52" width="7" height="26" fill="none" stroke="#1a3a1a" strokeWidth="1" />
      <line x1="54" y1="65" x2="108" y2="65" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#ah-green)" />
      <line x1="88" y1="42" x2="122" y2="60" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#ah-green)" />
      <line x1="246" y1="65" x2="192" y2="65" stroke="#e05555" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#ah-red)" />
      <line x1="212" y1="42" x2="178" y2="60" stroke="#e05555" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#ah-red)" />
      <circle cx="48" cy="65" r="5" fill="#22c55e" />
      <circle cx="88" cy="38" r="5" fill="#22c55e" />
      <circle cx="88" cy="92" r="5" fill="#22c55e" />
      <circle cx="124" cy="65" r="5" fill="#22c55e" />
      <circle cx="252" cy="65" r="5" fill="#e05555" />
      <circle cx="212" cy="38" r="5" fill="#e05555" />
      <circle cx="212" cy="92" r="5" fill="#e05555" />
      <circle cx="176" cy="65" r="5" fill="#e05555" />
      <circle cx="150" cy="65" r="4" fill="#dddddd" />
      <polygon points="75,48 78,58 72,58" fill="#f59e0b" />
      <polygon points="75,78 78,88 72,88" fill="#f59e0b" />
      <polygon points="108,28 111,38 105,38" fill="#f59e0b" />
      <polygon points="192,28 195,38 189,38" fill="#f59e0b" />
      <polygon points="225,78 228,88 222,88" fill="#f59e0b" />
    </svg>
    <div style={{ background: COLORS.surface, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Übungsdatenbank</span>
      <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Alle ansehen →</span>
    </div>
  </div>
);

// Kategoriespezifische Feldskizze als SVG-Illustration
function UebungIllustration({ categoryName }) {
  const s = { width: "100%", height: 80, display: "block" };
  const F = "#0c180c", L = "#1a3a1a";

  switch (categoryName) {
    case "Passspiel":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <circle cx="150" cy="40" r="27" fill="none" stroke={L} strokeWidth="0.8" strokeDasharray="3,2"/>
          <line x1="177" y1="40" x2="136" y2="64" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4,2"/>
          <line x1="136" y1="64" x2="123" y2="40" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4,2"/>
          <line x1="164" y1="16" x2="177" y2="40" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4,2"/>
          <circle cx="177" cy="40" r="5" fill="#22c55e"/>
          <circle cx="164" cy="64" r="5" fill="#22c55e"/>
          <circle cx="136" cy="64" r="5" fill="#22c55e"/>
          <circle cx="123" cy="40" r="5" fill="#22c55e"/>
          <circle cx="136" cy="16" r="5" fill="#22c55e"/>
          <circle cx="164" cy="16" r="5" fill="#22c55e"/>
          <circle cx="143" cy="37" r="5" fill="#e05555"/>
          <circle cx="157" cy="43" r="5" fill="#e05555"/>
          <circle cx="150" cy="40" r="2.5" fill="#ddd"/>
        </svg>
      );
    case "Pressing":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <rect x="15" y="8" width="270" height="64" fill="none" stroke={L} strokeWidth="1"/>
          <line x1="15" y1="40" x2="285" y2="40" stroke={L} strokeWidth="0.5" strokeDasharray="4,2"/>
          {[50,90,130,170,210,250].map((x,i) => <circle key={i} cx={x} cy="22" r="5" fill="#e05555"/>)}
          {[50,90,130,170,210,250].map((x,i) => <circle key={i} cx={x} cy="56" r="5" fill="#22c55e"/>)}
          {[90,150,210].map((x,i) => <line key={i} x1={x} y1="50" x2={x} y2="30" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="3,2"/>)}
        </svg>
      );
    case "Abschluss":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <line x1="262" y1="20" x2="285" y2="20" stroke={L} strokeWidth="1.5"/>
          <line x1="262" y1="60" x2="285" y2="60" stroke={L} strokeWidth="1.5"/>
          <line x1="285" y1="20" x2="285" y2="60" stroke={L} strokeWidth="1.5"/>
          <circle cx="80" cy="40" r="6" fill="#22c55e"/>
          <circle cx="140" cy="20" r="5" fill="#22c55e"/>
          <line x1="140" y1="25" x2="90" y2="37" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4,2"/>
          <line x1="86" y1="40" x2="262" y2="38" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="5,2"/>
          <circle cx="160" cy="40" r="3" fill="#ddd"/>
          <circle cx="200" cy="44" r="5" fill="#e05555"/>
        </svg>
      );
    case "Zweikampf":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <circle cx="105" cy="40" r="7" fill="#22c55e"/>
          <circle cx="195" cy="40" r="7" fill="#e05555"/>
          <circle cx="150" cy="40" r="4" fill="#ddd"/>
          <polygon points="65,50 69,60 61,60" fill="#f59e0b"/>
          <polygon points="235,50 239,60 231,60" fill="#f59e0b"/>
          <line x1="112" y1="40" x2="146" y2="40" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4,2"/>
          <line x1="154" y1="40" x2="188" y2="40" stroke="#e05555" strokeWidth="0.8" strokeDasharray="4,2"/>
        </svg>
      );
    case "Aufwärmen":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <polygon points="50,53 54,63 46,63" fill="#f59e0b"/>
          <polygon points="100,23 104,33 96,33" fill="#f59e0b"/>
          <polygon points="150,53 154,63 146,63" fill="#f59e0b"/>
          <polygon points="200,23 204,33 196,33" fill="#f59e0b"/>
          <polygon points="250,53 254,63 246,63" fill="#f59e0b"/>
          <path d="M30,58 Q75,18 100,28 Q125,38 150,58 Q175,18 200,28 Q225,38 270,58" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="5,2"/>
          <circle cx="30" cy="55" r="5" fill="#22c55e"/>
        </svg>
      );
    case "Taktik":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <rect x="15" y="8" width="270" height="64" fill="none" stroke={L} strokeWidth="1"/>
          <line x1="150" y1="8" x2="150" y2="72" stroke={L} strokeWidth="0.5" strokeDasharray="3,2"/>
          <circle cx="30" cy="40" r="5" fill="#22c55e"/>
          {[20,33,47,60].map((y,i) => <circle key={i} cx="75" cy={y} r="4" fill="#22c55e"/>)}
          {[25,40,55].map((y,i) => <circle key={i} cx="140" cy={y} r="4" fill="#22c55e"/>)}
          {[20,40,60].map((y,i) => <circle key={i} cx="210" cy={y} r="4" fill="#22c55e"/>)}
          {[25,40,55].map((y,i) => <circle key={i} cx="245" cy={y} r="4" fill="#e05555"/>)}
          <line x1="140" y1="40" x2="208" y2="40" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4,2"/>
        </svg>
      );
    case "Technik":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <polygon points="80,23 84,33 76,33" fill="#f59e0b"/>
          <polygon points="120,53 124,63 116,63" fill="#f59e0b"/>
          <polygon points="160,23 164,33 156,33" fill="#f59e0b"/>
          <polygon points="200,53 204,63 196,63" fill="#f59e0b"/>
          <polygon points="240,23 244,33 236,33" fill="#f59e0b"/>
          <path d="M50,40 Q80,18 120,58 Q160,18 200,58 Q240,18 270,40" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="5,2"/>
          <circle cx="50" cy="40" r="6" fill="#22c55e"/>
          <circle cx="63" cy="40" r="2.5" fill="#ddd"/>
        </svg>
      );
    case "Standardsituation":
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <line x1="262" y1="20" x2="285" y2="20" stroke={L} strokeWidth="1.5"/>
          <line x1="262" y1="60" x2="285" y2="60" stroke={L} strokeWidth="1.5"/>
          <line x1="285" y1="20" x2="285" y2="60" stroke={L} strokeWidth="1.5"/>
          <circle cx="185" cy="27" r="5" fill="#e05555"/>
          <circle cx="185" cy="40" r="5" fill="#e05555"/>
          <circle cx="185" cy="53" r="5" fill="#e05555"/>
          <circle cx="175" cy="33" r="5" fill="#e05555"/>
          <circle cx="175" cy="47" r="5" fill="#e05555"/>
          <circle cx="80" cy="55" r="6" fill="#22c55e"/>
          <circle cx="110" cy="50" r="3.5" fill="#ddd"/>
          <path d="M110,50 Q148,14 185,18 Q220,24 262,38" fill="none" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="5,2"/>
          <circle cx="230" cy="26" r="5" fill="#22c55e"/>
          <circle cx="230" cy="52" r="5" fill="#22c55e"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 300 80" style={s}><rect width="300" height="80" fill={F}/>
          <rect x="15" y="8" width="270" height="64" fill="none" stroke={L} strokeWidth="1"/>
          <line x1="150" y1="8" x2="150" y2="72" stroke={L} strokeWidth="1"/>
          <circle cx="150" cy="40" r="18" fill="none" stroke={L} strokeWidth="1"/>
          <circle cx="150" cy="40" r="1.5" fill={L}/>
        </svg>
      );
  }
}

// Modal zum Anlegen und Bearbeiten einer Übung
function UebungModal({ categories, onSave, onClose, onDelete = null, initialData = null }) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [duration, setDuration] = useState(initialData?.duration ? String(initialData.duration) : "");
  const [playerCount, setPlayerCount] = useState(initialData?.player_count ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    initialData?.categories?.map(c => c.id) ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) { setError("Bitte einen Namen angeben."); return; }
    const dur = Number(duration);
    if (!duration || isNaN(dur) || dur <= 0) { setError("Bitte eine gültige Dauer angeben."); return; }
    setIsSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        duration: dur,
        player_count: playerCount.trim(),
        category_ids: selectedCategoryIds,
      });
    } catch (e) {
      setError(e.message);
      setIsSaving(false);
    }
  }

  function toggleCategory(id) {
    setSelectedCategoryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const isEdit = !!initialData;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 16, padding: 26, width: "100%", maxWidth: 480, boxSizing: "border-box", margin: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{isEdit ? "Übung bearbeiten" : "Übung anlegen"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Name *</div>
            <input autoFocus style={inputStyle} placeholder="z.B. Passstafette 4v2" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Beschreibung</div>
            <textarea style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} rows={3} placeholder="Ablauf der Übung beschreiben…" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Dauer (Minuten) *</div>
              <input style={inputStyle} type="number" min="1" placeholder="z.B. 15" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Format / Spieler</div>
              <input style={inputStyle} placeholder="z.B. 4v2" value={playerCount} onChange={e => setPlayerCount(e.target.value)} />
            </div>
          </div>
          {categories.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Kategorien</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {categories.map(c => {
                  const sel = selectedCategoryIds.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCategory(c.id)} style={{ background: sel ? COLORS.green : COLORS.bg, border: `1px solid ${sel ? COLORS.green : COLORS.borderLight}`, borderRadius: 20, padding: "6px 14px", color: sel ? "#fff" : COLORS.textMuted, cursor: "pointer", fontSize: 12, fontWeight: sel ? 600 : 400, transition: "background 0.1s, border-color 0.1s" }}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {error && <div style={{ background: COLORS.red + "22", border: `1px solid ${COLORS.red}44`, borderRadius: 8, padding: "10px 14px", marginTop: 14, color: COLORS.red, fontSize: 13 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, background: "none", color: COLORS.textMuted, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 13, fontSize: 14, cursor: "pointer" }}>Abbrechen</button>
          {isEdit && onDelete && (
            <button onClick={onDelete} style={{ flex: 1, background: COLORS.red + "22", color: COLORS.red, border: `1px solid ${COLORS.red}44`, borderRadius: 10, padding: 13, fontSize: 14, cursor: "pointer" }}>Löschen</button>
          )}
          <button onClick={handleSubmit} disabled={isSaving} style={{ flex: 2, background: isSaving ? COLORS.textDim : COLORS.green, color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer" }}>
            {isSaving ? "Wird gespeichert…" : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrainingsHub({ onBack }) {
  const todayDate = new Date();
  const todayStr = toISODate(todayDate);

  const [view, setView] = useState("dashboard"); // "dashboard" | "create" | "exercises"
  const [calendarMode, setCalendarMode] = useState("week");
  const [currentMonth, setCurrentMonth] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const [filterKat, setFilterKat] = useState("Alle");
  const [trainingsTyp, setTrainingsTyp] = useState(null);

  // API — Trainings
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // API — Übungen & Kategorien
  const [uebungen, setUebungen] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showUebungModal, setShowUebungModal] = useState(false);
  const [editingUebung, setEditingUebung] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Detail view
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blockNotes, setBlockNotes] = useState({});
  const [blockExercises, setBlockExercises] = useState({});
  const [collapsedBlocks, setCollapsedBlocks] = useState(new Set());
  const [detailSpieler, setDetailSpieler] = useState("");
  const [detailSieger, setDetailSieger] = useState("");

  // Create form
  const [formThema, setFormThema] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("18:00");
  const [formBlockExercises, setFormBlockExercises] = useState({});
  const [formFreeExercises, setFormFreeExercises] = useState([]);
  const [formPickerOpen, setFormPickerOpen] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { loadTrainings(); loadUebungenAndCategories(); }, []);

  async function loadTrainings() {
    setIsLoading(true);
    setError("");
    try { setTrainings(await fetchTrainings()); }
    catch (e) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  async function loadUebungenAndCategories() {
    try {
      const [ue, cats] = await Promise.all([fetchUebungen(), fetchCategories()]);
      setUebungen(ue);
      setCategories(cats);
    } catch {}
  }

  async function handleSaveUebung(payload, id) {
    if (id) {
      await updateUebung(id, payload);
    } else {
      await createUebung(payload);
    }
    const ue = await fetchUebungen();
    setUebungen(ue);
    setEditingUebung(null);
    setShowUebungModal(false);
  }

  async function handleDeleteUebung(id) {
    if (!confirm("Übung wirklich löschen?")) return;
    try {
      await deleteUebung(id);
      const ue = await fetchUebungen();
      setUebungen(ue);
      setEditingUebung(null);
    } catch (e) { setError(e.message); }
  }

  async function handleSubmit() {
    if (!formThema.trim() || !formDate) { setFormError("Bitte Thema und Datum angeben."); return; }
    setIsSaving(true); setFormError("");
    try {
      const created = await createTraining({ name: formThema.trim(), trainingsart: trainingsTyp === "Klassisch" ? "klassisch" : "frei", date: formDate, time: formTime + ":00", notes: "" });
      if (trainingsTyp === "Klassisch") {
        const blockData = await fetchTrainingBlocks(created.id);
        await Promise.all(blockData.map(b => { const exs = formBlockExercises[b.trainingstyp] || []; return exs.length ? updateTrainingBlock(b.id, { notes: buildBlockNotes(exs, "") }) : Promise.resolve(); }));
      } else if (formFreeExercises.length > 0) {
        await createTrainingBlock({ training: created.id, name: "Übungen", trainingstyp: "frei", reihenfolge: 1, notes: buildBlockNotes(formFreeExercises, "") });
      }
      await loadTrainings();
      setView("dashboard"); setTrainingsTyp(null); setFormThema(""); setFormDate(""); setFormTime("18:00"); setFormBlockExercises({}); setFormFreeExercises([]); setFormPickerOpen(null);
    } catch (e) { setFormError(e.message); }
    finally { setIsSaving(false); }
  }

  function toggleFormExercise(blockType, u) {
    setFormBlockExercises(prev => { const cur = prev[blockType] || []; const has = cur.some(x => x.id === u.id); return { ...prev, [blockType]: has ? cur.filter(x => x.id !== u.id) : [...cur, u] }; });
  }

  async function openTraining(training) {
    setSelectedTraining(training);
    setCollapsedBlocks(new Set());
    setDetailSpieler(training.notes?.match(/Spieler:\s*([^|]+)/)?.[1]?.trim() ?? "");
    setDetailSieger(training.notes?.match(/Sieger:\s*([^|]+)/)?.[1]?.trim() ?? "");
    setBlocksLoading(true);
    try {
      const sorted = [...(await fetchTrainingBlocks(training.id))].sort((a, b) => a.reihenfolge - b.reihenfolge);
      setBlocks(sorted);
      const nm = {}, em = {};
      sorted.forEach(b => { const p = parseBlockNotes(b.notes, uebungen); nm[b.id] = p.text; em[b.id] = p.exercises; });
      setBlockNotes(nm); setBlockExercises(em);
      setCollapsedBlocks(new Set(sorted.map(b => b.id)));
    } catch { setBlocks([]); }
    finally { setBlocksLoading(false); }
  }

  function toggleBlock(id) { setCollapsedBlocks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function saveBlockNotes(blockId) {
    try { await updateTrainingBlock(blockId, { notes: buildBlockNotes(blockExercises[blockId] || [], blockNotes[blockId] || "") }); } catch {}
  }

  async function saveBeteiligung() {
    const parts = [];
    if (detailSpieler.trim()) parts.push(`Spieler: ${detailSpieler.trim()}`);
    if (detailSieger.trim()) parts.push(`Sieger: ${detailSieger.trim()}`);
    try { const u = await updateTraining(selectedTraining.id, { notes: parts.join(" | ") }); setSelectedTraining(prev => ({ ...prev, notes: u.notes })); } catch {}
  }

  async function handleDeleteTraining(id, e) {
    e.stopPropagation();
    if (!confirm("Training wirklich löschen?")) return;
    try { await deleteTraining(id); setTrainings(prev => prev.filter(t => t.id !== id)); } catch (e) { setError(e.message); }
  }

  function openDayForCreate(dateStr) {
    setFormDate(dateStr);
    setTrainingsTyp(null);
    setFormThema("");
    setFormTime("18:00");
    setFormBlockExercises({});
    setFormFreeExercises([]);
    setFormPickerOpen(null);
    setFormError("");
    setView("create");
  }

  // ── Detail-Ansicht ─────────────────────────────────────────────────
  if (selectedTraining) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "Inter, -apple-system, sans-serif", padding: 24 }}>
        <div onClick={() => setSelectedTraining(null)} style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 16, cursor: "pointer" }}>← Zurück</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>{selectedTraining.name}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{formatDate(selectedTraining.date)} · {selectedTraining.time?.slice(0, 5)} Uhr</div>
          </div>
          <Badge label={selectedTraining.trainingsart === "klassisch" ? "Klassisch" : "Frei"} color={selectedTraining.trainingsart === "klassisch" ? COLORS.green : COLORS.orange} />
        </div>
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Trainingsbeteiligung</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Anzahl Spieler</div><input style={{ ...inputStyle, padding: "9px 12px" }} placeholder="z.B. 14" value={detailSpieler} onChange={e => setDetailSpieler(e.target.value)} onBlur={saveBeteiligung} /></div>
            <div><div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Abschlussspiel Sieger</div><input style={{ ...inputStyle, padding: "9px 12px" }} placeholder="z.B. Team Rot" value={detailSieger} onChange={e => setDetailSieger(e.target.value)} onBlur={saveBeteiligung} /></div>
          </div>
        </Card>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Trainingsblöcke</div>
        {blocksLoading && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Lade Blöcke…</div>}
        {!blocksLoading && blocks.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Keine Blöcke vorhanden.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {blocks.map((block, idx) => {
            const isCollapsed = collapsedBlocks.has(block.id);
            const exs = blockExercises[block.id] || [];
            return (
              <div key={block.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div onClick={() => toggleBlock(block.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", cursor: "pointer", userSelect: "none", borderBottom: isCollapsed ? "none" : `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, minWidth: 18 }}>{idx + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{block.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>{BLOCK_LABELS[block.trainingstyp] || block.trainingstyp}{exs.length > 0 && ` · ${exs.length} Übung${exs.length > 1 ? "en" : ""}`}</div>
                    </div>
                  </div>
                  <span style={{ color: COLORS.textMuted, fontSize: 12, display: "inline-block", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>▾</span>
                </div>
                {!isCollapsed && (
                  <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {exs.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, marginBottom: 8 }}>Übungen</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {exs.map(u => <div key={u.id} style={{ background: COLORS.bg, border: `1px solid ${COLORS.borderLight}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}><span>{u.name}</span><span style={{ color: COLORS.textMuted, fontSize: 10 }}>{u.duration} min</span></div>)}
                        </div>
                      </div>
                    ) : <div style={{ fontSize: 12, color: COLORS.textDim, fontStyle: "italic" }}>Keine Übungen geplant</div>}
                    <textarea rows={2} placeholder="Notizen zu diesem Block…" value={blockNotes[block.id] ?? ""} onChange={e => setBlockNotes(prev => ({ ...prev, [block.id]: e.target.value }))} onBlur={() => saveBlockNotes(block.id)} style={{ ...inputStyle, resize: "vertical", fontSize: 13, lineHeight: 1.5 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Training anlegen ───────────────────────────────────────────────
  if (view === "create") {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "Inter, -apple-system, sans-serif", padding: 24 }}>
        <div onClick={() => { if (trainingsTyp) { setTrainingsTyp(null); setFormBlockExercises({}); setFormFreeExercises([]); setFormPickerOpen(null); setFormError(""); } else { setView("dashboard"); } }} style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 20, cursor: "pointer" }}>← Zurück</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Training anlegen{trainingsTyp && <span style={{ color: trainingsTyp === "Klassisch" ? COLORS.green : COLORS.orange, fontWeight: 400, fontSize: 16, marginLeft: 10 }}>— {trainingsTyp}</span>}</div>
        <div style={{ maxWidth: 640 }}>
          {!trainingsTyp ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { typ: "Klassisch", icon: "📋", color: COLORS.green, desc: "Nach DFB-Philosophie strukturiert", phasen: ["Aktivierung 15'", "Spielen 30'", "Zwischenblock 15'", "Spielen 30'"] },
                { typ: "Frei", icon: "✏️", color: COLORS.orange, desc: "Eigene Struktur, freie Gestaltung", phasen: ["Übungen frei wählen", "Reihenfolge anpassen", "Dauer selbst bestimmen"] },
              ].map(t => (
                <Card key={t.typ} onClick={() => setTrainingsTyp(t.typ)} style={{ border: `2px solid ${t.color}33`, padding: 22 }}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>{t.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: t.color, marginBottom: 6 }}>{t.typ}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 14 }}>{t.desc}</div>
                  {t.phasen.map((p, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: t.color + "88" }} /><span style={{ fontSize: 12, color: COLORS.textMuted }}>{p}</span></div>)}
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Allgemein</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div><div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Thema / Schwerpunkt</div><input style={inputStyle} placeholder="z.B. Pressing & Gegenpressing" value={formThema} onChange={e => setFormThema(e.target.value)} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Datum</div><input type="date" style={inputStyle} value={formDate} onChange={e => setFormDate(e.target.value)} /></div>
                    <div><div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Uhrzeit</div><input type="time" style={inputStyle} value={formTime} onChange={e => setFormTime(e.target.value)} /></div>
                  </div>
                </div>
              </Card>

              {trainingsTyp === "Klassisch" && (
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Übungen pro Phase</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {BLOCK_TYPES.map((typ, idx) => {
                      const selected = formBlockExercises[typ] || [];
                      const pickerOpen = formPickerOpen === typ;
                      return (
                        <div key={typ}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, minWidth: 16 }}>{idx + 1}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{BLOCK_LABELS[typ]}</span></div>
                            <button onClick={() => setFormPickerOpen(pickerOpen ? null : typ)} style={{ background: "none", border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "4px 10px", color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>+ Übung</button>
                          </div>
                          {selected.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: pickerOpen ? 8 : 0 }}>
                              {selected.map(u => <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.bg, border: `1px solid ${COLORS.borderLight}`, borderRadius: 20, padding: "4px 10px 4px 12px", fontSize: 12, color: COLORS.text }}><span>{u.name}</span><span style={{ color: COLORS.textMuted, fontSize: 10 }}>{u.duration} min</span><button onClick={() => toggleFormExercise(typ, u)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 13, lineHeight: 1, padding: "0 0 0 2px" }}>✕</button></div>)}
                            </div>
                          )}
                          {pickerOpen && <ExercisePicker uebungen={uebungen} selected={selected} filter={BLOCK_EXERCISE_FILTER[typ] || (() => true)} onToggle={u => toggleFormExercise(typ, u)} onClose={() => setFormPickerOpen(null)} />}
                          {idx < BLOCK_TYPES.length - 1 && <div style={{ borderBottom: `1px solid ${COLORS.border}`, marginTop: 14 }} />}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {trainingsTyp === "Frei" && (
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Übungen</div>
                    <button onClick={() => setFormPickerOpen(formPickerOpen === "frei" ? null : "frei")} style={{ background: "none", border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "4px 10px", color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>+ Übung</button>
                  </div>
                  {formFreeExercises.length === 0 && formPickerOpen !== "frei" && <div style={{ fontSize: 13, color: COLORS.textDim, fontStyle: "italic" }}>Noch keine Übungen gewählt.</div>}
                  {formFreeExercises.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: formPickerOpen === "frei" ? 10 : 0 }}>{formFreeExercises.map(u => <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.bg, border: `1px solid ${COLORS.borderLight}`, borderRadius: 20, padding: "4px 10px 4px 12px", fontSize: 12, color: COLORS.text }}><span>{u.name}</span><span style={{ color: COLORS.textMuted, fontSize: 10 }}>{u.duration} min</span><button onClick={() => setFormFreeExercises(prev => prev.filter(x => x.id !== u.id))} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 13, lineHeight: 1, padding: "0 0 0 2px" }}>✕</button></div>)}</div>}
                  {formPickerOpen === "frei" && <ExercisePicker uebungen={uebungen} selected={formFreeExercises} filter={() => true} onToggle={u => setFormFreeExercises(prev => prev.some(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u])} onClose={() => setFormPickerOpen(null)} />}
                </Card>
              )}

              {formError && <div style={{ background: COLORS.red + "22", border: `1px solid ${COLORS.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: COLORS.red, fontSize: 13 }}>{formError}</div>}
              <button onClick={handleSubmit} disabled={isSaving} style={{ width: "100%", background: isSaving ? COLORS.textDim : COLORS.green, color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer" }}>
                {isSaving ? "Wird gespeichert…" : "Training speichern"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Übungsdatenbank ────────────────────────────────────────────────
  if (view === "exercises") {
    const kategorienList = ["Alle", ...categories.map(c => c.name)];
    const filteredUebungen = uebungen.filter(u => {
      const matchesKat = filterKat === "Alle" || u.categories?.some(c => c.name === filterKat);
      const matchesSearch = !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesKat && matchesSearch;
    });

    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "Inter, -apple-system, sans-serif", padding: 24 }}>
        <div onClick={() => { setView("dashboard"); setSearchQuery(""); setFilterKat("Alle"); }} style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 20, cursor: "pointer" }}>← Zurück</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Übungsdatenbank</div>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>{uebungen.length} Übung{uebungen.length !== 1 ? "en" : ""}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 14px", color: COLORS.text, fontSize: 13, width: 220 }}
            placeholder="🔍  Übung suchen…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {kategorienList.map(k => (
              <button key={k} onClick={() => setFilterKat(k)} style={{ background: filterKat === k ? COLORS.green : COLORS.surface, border: `1px solid ${filterKat === k ? COLORS.green : COLORS.border}`, borderRadius: 20, padding: "7px 14px", color: filterKat === k ? "#fff" : COLORS.textMuted, cursor: "pointer", fontSize: 12, fontWeight: filterKat === k ? 600 : 400 }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {filteredUebungen.map(u => (
            <div
              key={u.id}
              onClick={() => setEditingUebung(u)}
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, cursor: "pointer", transition: "border-color 0.15s", display: "flex", flexDirection: "column", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#22c55e44"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}
            >
              <UebungIllustration categoryName={u.categories?.[0]?.name} />
              <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, flex: 1, marginRight: 8 }}>{u.name}</div>
                  {u.player_count && <Badge label={u.player_count} />}
                </div>
                {u.description && (
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {u.description}
                  </div>
                )}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {u.categories?.map(c => <Badge key={c.id} label={c.name} color={COLORS.blue} />)}
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.textMuted, flexShrink: 0, whiteSpace: "nowrap" }}>⏱ {u.duration} min</span>
                </div>
              </div>
            </div>
          ))}

          {/* Neue Übung anlegen */}
          <div
            onClick={() => setShowUebungModal(true)}
            style={{ background: "transparent", border: `2px dashed ${COLORS.border}`, borderRadius: 12, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: COLORS.textMuted, minHeight: 120 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.green; e.currentTarget.style.color = COLORS.green; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}
          >
            <span style={{ fontSize: 22 }}>+</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Übung anlegen</span>
          </div>
        </div>

        {showUebungModal && (
          <UebungModal
            categories={categories}
            onSave={payload => handleSaveUebung(payload, null)}
            onClose={() => setShowUebungModal(false)}
          />
        )}
        {editingUebung && (
          <UebungModal
            categories={categories}
            initialData={editingUebung}
            onSave={payload => handleSaveUebung(payload, editingUebung.id)}
            onDelete={() => handleDeleteUebung(editingUebung.id)}
            onClose={() => setEditingUebung(null)}
          />
        )}
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────
  const sortedTrainings = [...trainings].sort((a, b) => b.date.localeCompare(a.date));
  const trainingsByDate = new Map();
  trainings.forEach(t => { const list = trainingsByDate.get(t.date) || []; list.push(t); trainingsByDate.set(t.date, list); });
  const weekDays = getWeekDays(todayDate);
  const monthDays = getMonthDays(currentMonth);

  return (
    <div style={{ position: "relative", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "Inter, -apple-system, sans-serif" }}>

      {/* Topbar */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Trainingshub</div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: 20, padding: 24 }}>

        {/* ── LINKE SPALTE ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Kalender */}
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              {calendarMode === "month" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>‹</button>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
                  <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>›</button>
                </div>
              ) : (
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {`${weekDays[0].getDate()}. – ${weekDays[6].getDate()}. ${MONTH_NAMES[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`}
                </div>
              )}
              <button onClick={() => setCalendarMode(m => m === "week" ? "month" : "week")} style={{ background: "none", border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "4px 10px", color: COLORS.textMuted, fontSize: 11, cursor: "pointer" }}>
                {calendarMode === "week" ? "Monat ansehen ↓" : "Woche ansehen ↑"}
              </button>
            </div>

            {calendarMode === "week" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {weekDays.map((day, i) => {
                  const ds = toISODate(day);
                  const isToday = ds === todayStr;
                  const dayTrainings = trainingsByDate.get(ds) || [];
                  const hasTraining = dayTrainings.length > 0;
                  return (
                    <div key={i}
                      onClick={() => hasTraining ? openTraining(dayTrainings[0]) : openDayForCreate(ds)}
                      style={{ background: COLORS.bg, border: `1px solid ${isToday ? COLORS.green + "44" : COLORS.border}`, borderRadius: 8, padding: "8px 6px", minHeight: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", transition: "background 0.12s, border-color 0.12s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = hasTraining ? COLORS.bg : "#1a1a1a"; e.currentTarget.style.borderColor = hasTraining ? COLORS.green : COLORS.borderLight; }}
                      onMouseLeave={e => { e.currentTarget.style.background = COLORS.bg; e.currentTarget.style.borderColor = isToday ? COLORS.green + "44" : COLORS.border; }}
                    >
                      <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{WEEKDAY_LABELS[i]}</div>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: isToday ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : COLORS.text }}>{day.getDate()}</span>
                      </div>
                      {dayTrainings.slice(0, 2).map(t => (
                        <div key={t.id} onClick={e => { e.stopPropagation(); openTraining(t); }} style={{ width: "100%", background: "#0d1f0d", borderRadius: 4, padding: "3px 5px", cursor: "pointer" }}>
                          <div style={{ fontSize: 9, color: "#4ade80", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                          {t.time && <div style={{ fontSize: 9, color: "#4ade8099" }}>{t.time.slice(0, 5)}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                  {WEEKDAY_LABELS.map(l => <div key={l} style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {monthDays.map(({ date, isCurrentMonth }, i) => {
                    const ds = toISODate(date);
                    const isToday = ds === todayStr;
                    const dayTrainings = isCurrentMonth ? (trainingsByDate.get(ds) || []) : [];
                    const hasTraining = dayTrainings.length > 0;
                    return (
                      <div key={i}
                        onClick={() => isCurrentMonth && (hasTraining ? openTraining(dayTrainings[0]) : openDayForCreate(ds))}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 2px", borderRadius: 6, cursor: isCurrentMonth ? "pointer" : "default", transition: "background 0.12s", opacity: isCurrentMonth ? 1 : 0.25 }}
                        onMouseEnter={e => { if (isCurrentMonth) e.currentTarget.style.background = hasTraining ? "#0d1f0d" : "#1a1a1a"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : COLORS.text }}>{date.getDate()}</span>
                        </div>
                        {hasTraining && (
                          <div onClick={e => { e.stopPropagation(); openTraining(dayTrainings[0]); }} style={{ background: "#0d1f0d", borderRadius: 3, padding: "2px 4px", cursor: "pointer", maxWidth: "100%" }}>
                            <div style={{ fontSize: 8, color: "#4ade80", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dayTrainings[0].name}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>

          {/* DB Tile */}
          {DB_TILE(() => setView("exercises"))}
        </div>

        {/* ── RECHTE SPALTE ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Letzte Trainings</div>

          {isLoading && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Lade…</div>}
          {!isLoading && sortedTrainings.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Noch keine Trainings vorhanden.</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedTrainings.slice(0, 4).map((t, i) => {
              const spieler = t.notes?.match(/Spieler:\s*([^|]+)/)?.[1]?.trim();
              return (
                <div key={t.id} onClick={() => openTraining(t)} style={{ opacity: CARD_OPACITIES[i], background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "13px 15px", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.background = COLORS.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.surface; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, flex: 1, marginRight: 8, lineHeight: 1.3 }}>{t.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <Badge label={t.trainingsart === "klassisch" ? "Klassisch" : "Frei"} color={t.trainingsart === "klassisch" ? COLORS.green : COLORS.orange} />
                      <button onClick={e => handleDeleteTraining(t.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 14, lineHeight: 1, padding: "0 2px" }}>✕</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: spieler ? 8 : 0 }}>
                    {formatDate(t.date)}{t.time ? ` · ${t.time.slice(0, 5)} Uhr` : ""}
                  </div>
                  {spieler && (
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>👥 {spieler} Spieler</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => setView("create")} style={{ position: "fixed", bottom: 24, right: 24, width: 52, height: 52, borderRadius: "50%", background: COLORS.green, color: "#fff", border: "none", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", zIndex: 100 }}>+</button>
    </div>
  );
}
