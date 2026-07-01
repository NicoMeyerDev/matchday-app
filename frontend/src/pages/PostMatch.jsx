import { useEffect, useRef, useState } from "react";
import {
  fetchMatchReports,
  createMatchReport,
  updateMatchReport,
  deleteMatchReport,
  fetchLineups,
  createMatchEvent,
} from "../api/client";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .pm-root {
    min-height: 100vh;
    background: #07070a;
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
    padding: 32px 28px;
  }

  .pm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .pm-title-label { font-size: 11px; letter-spacing: 0.18em; color: #22c55e; text-transform: uppercase; margin-bottom: 4px; }
  .pm-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 0.04em; color: #fff; line-height: 1; }

  .pm-btn-new {
    padding: 12px 24px; background: #22c55e; color: #040f04; border: none;
    border-radius: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 16px;
    letter-spacing: 0.08em; cursor: pointer;
  }
  .pm-btn-new:hover { background: #16a34a; }

  .pm-form-card {
    background: #0a0a0f; border: 1px solid #1a2e1a; border-radius: 14px;
    padding: 28px; margin-bottom: 28px; position: relative;
  }
  .pm-form-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #22c55e, transparent); border-radius: 14px 14px 0 0;
  }
  .pm-form-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.05em; color: #fff; margin-bottom: 20px; }
  .pm-form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .pm-field label { display: block; font-size: 10px; letter-spacing: 0.15em; color: #3f3f46; text-transform: uppercase; margin-bottom: 6px; }
  .pm-field input, .pm-field select, .pm-field textarea {
    width: 100%; background: #111116; border: 1px solid #1e1e24; border-radius: 8px;
    padding: 12px 14px; font-size: 14px; color: #e4e4e7; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .pm-field input:focus, .pm-field select:focus, .pm-field textarea:focus { border-color: #22c55e; }
  .pm-field textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
  .pm-form-actions { display: flex; gap: 12px; margin-top: 20px; justify-content: flex-end; }
  .pm-btn-save {
    padding: 12px 28px; background: #22c55e; color: #040f04; border: none;
    border-radius: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 16px;
    letter-spacing: 0.08em; cursor: pointer;
  }
  .pm-btn-save:hover { background: #16a34a; }
  .pm-btn-save:disabled { background: #1a3a1a; color: #2d5a2d; cursor: not-allowed; }
  .pm-btn-cancel {
    padding: 12px 20px; background: transparent; border: 1px solid #1e1e24;
    border-radius: 8px; color: #52525b; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer;
  }
  .pm-btn-cancel:hover { border-color: #3f3f46; color: #a1a1aa; }

  .pm-section-label { font-size: 10px; letter-spacing: 0.18em; color: #22c55e; text-transform: uppercase; margin-bottom: 16px; }
  .pm-empty { background: #0a0a0f; border: 1px dashed #1e1e24; border-radius: 14px; padding: 48px; text-align: center; color: #3f3f46; font-size: 14px; }
  .pm-empty .pm-empty-icon { font-size: 32px; margin-bottom: 12px; display: block; }
  .pm-list { display: flex; flex-direction: column; gap: 12px; }

  .pm-report-card {
    background: #0a0a0f; border: 1px solid #141418; border-radius: 12px;
    padding: 20px 24px; cursor: pointer; transition: border-color 0.2s;
  }
  .pm-report-card:hover { border-color: #22c55e33; }

  .pm-report-top { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; }
  .pm-report-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .pm-report-opponent { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.05em; color: #fff; }
  .pm-report-result { background: #0d2010; border: 1px solid #22c55e33; border-radius: 6px; padding: 3px 10px; font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #22c55e; }
  .pm-report-date { font-size: 11px; color: #3f3f46; }
  .pm-report-lineup { font-size: 12px; color: #52525b; margin-bottom: 10px; }
  .pm-report-notes { font-size: 13px; color: #71717a; line-height: 1.6; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pm-report-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .pm-btn-icon { width: 44px; height: 44px; border-radius: 8px; border: 1px solid #1e1e24; background: transparent; color: #52525b; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s, color 0.2s; flex-shrink: 0; }
  .pm-btn-icon:hover { border-color: #3f3f46; color: #a1a1aa; }
  .pm-btn-icon.danger:hover { border-color: #7f1d1d; color: #f87171; }

  /* DETAIL */
  .pm-detail-card {
    background: #0a0a0f; border: 1px solid #141418; border-radius: 14px;
    padding: 24px; margin-top: 12px;
  }
  .pm-detail-label { font-size: 10px; letter-spacing: 0.18em; color: #22c55e; text-transform: uppercase; margin-bottom: 14px; font-weight: 500; }
  .pm-events-list { display: flex; flex-direction: column; gap: 8px; }
  .pm-event-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #111116; border-radius: 8px; border: 1px solid #1a1a1a; }
  .pm-event-minute { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #3f3f46; width: 36px; flex-shrink: 0; }
  .pm-event-badge { padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 500; flex-shrink: 0; }
  .badge-tor-us { background: #0d2010; color: #22c55e; }
  .badge-tor-them { background: #1f0a0a; color: #f87171; }
  .badge-yellow { background: #1f1a0a; color: #fbbf24; }
  .badge-yellow-red { background: #1f100a; color: #fb923c; }
  .badge-red { background: #1f0a0a; color: #f87171; }
  .badge-wechsel { background: #0d1a30; color: #60a5fa; }
  .pm-no-events { font-size: 12px; color: #2a2a35; font-style: italic; }

  .pm-error { padding: 12px 16px; background: #1f0f0f; border: 1px solid #3f1f1f; border-radius: 8px; font-size: 13px; color: #f87171; margin-bottom: 20px; }
`;

const EMPTY_FORM = { lineup: "", opponent: "", result: "", notes: "" };

function getEventBadge(ev) {
  if (ev.event_type === 'tor') return ev.for_us ? { cls: 'badge-tor-us', label: '⚽ Tor für uns' } : { cls: 'badge-tor-them', label: '⚽ Gegentor' };
  if (ev.event_type === 'karte') {
    if (ev.card_type === 'yellow') return { cls: 'badge-yellow', label: '🟨 Gelb' };
    if (ev.card_type === 'yellow_red') return { cls: 'badge-yellow-red', label: '🟨🟥 Gelb-Rot' };
    return { cls: 'badge-red', label: '🟥 Rot' };
  }
  return { cls: 'badge-wechsel', label: '↔ Wechsel' };
}

export default function PostMatch({ matchEvents = [], initialReportId = null, onReportsChanged }) {
  const [reports, setReports] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const consumedInitialReportRef = useRef(false);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
  if (initialReportId && !consumedInitialReportRef.current && reports.length > 0) {
    const target = reports.find(r => r.id === initialReportId);
    if (target) {
      setExpandedId(target.id);
      consumedInitialReportRef.current = true;
      setTimeout(() => {
        document.getElementById(`report-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }
}, [initialReportId, reports]);

  async function loadAll() {
    try {
      const [r, l] = await Promise.all([fetchMatchReports(), fetchLineups()]);
      setReports(r);
      setLineups(l);
    } catch (e) { setError(e.message); }
  }

  function handleNew() { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError(""); }

  function handleEdit(e, report) {
    e.stopPropagation();
    setForm({ lineup: report.lineup, opponent: report.opponent || "", result: report.result || "", notes: report.notes || "" });
    setEditId(report.id);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setError(""); }

  async function handleSave() {
    if (!form.lineup) { setError("Bitte eine Aufstellung auswählen."); return; }
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await updateMatchReport(editId, form);
      } else {
        const report = await createMatchReport(form);
        if (matchEvents && matchEvents.length > 0) {
          await Promise.all(matchEvents.map(ev => createMatchEvent({
            match_report: report.id,
            minute: ev.minute,
            event_type: ev.type,
            for_us: ev.for_us ?? true,
            card_type: ev.card_type || '',
            description: '',
          })));
        }
      }
      await loadAll();
      handleCancel();
      onReportsChanged?.();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Bericht wirklich löschen?")) return;
    try {
      await deleteMatchReport(id);
      setReports((r) => r.filter((x) => x.id !== id));
      onReportsChanged?.();
    } catch (e) { setError(e.message); }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <>
      <style>{S}</style>
      <div className="pm-root page-fade-in">
        <div className="pm-header">
          <div>
            <div className="pm-title-label">Saison 2025/26</div>
            <div className="pm-title">Post-Match</div>
          </div>
          {!showForm && (
            <button className="pm-btn-new" onClick={handleNew}>+ Neuen Bericht</button>
          )}
        </div>

        {error && <div className="pm-error">{error}</div>}

        {showForm && (
          <div className="pm-form-card">
            <div className="pm-form-title">{editId ? "Bericht bearbeiten" : "Neuer Spielbericht"}</div>
            <div className="pm-form-grid">
              <div className="pm-field">
                <label>Aufstellung</label>
                <select value={form.lineup} onChange={(e) => setForm({ ...form, lineup: e.target.value })}>
                  <option value="">— Aufstellung wählen —</option>
                  {lineups.map((l) => <option key={l.id} value={l.id}>{l.title || `Aufstellung #${l.id}`}</option>)}
                </select>
              </div>
              <div className="pm-field">
                <label>Gegner</label>
                <input type="text" placeholder="z.B. FC Musterstadt" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
              </div>
              <div className="pm-field">
                <label>Ergebnis</label>
                <input type="text" placeholder="z.B. 2:1" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />
              </div>
            </div>
            {matchEvents.length > 0 && !editId && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#0d1f0e', border: '1px solid #22c55e33', borderRadius: 8, fontSize: 12, color: '#22c55e' }}>
                ✅ {matchEvents.length} Spielereignisse werden automatisch gespeichert
              </div>
            )}
            <div className="pm-field">
              <label>Notizen</label>
              <textarea placeholder="Gutes Pressing in der ersten Halbzeit..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="pm-form-actions">
              <button className="pm-btn-cancel" onClick={handleCancel}>Abbrechen</button>
              <button className="pm-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Wird gespeichert..." : editId ? "Aktualisieren" : "Bericht speichern"}
              </button>
            </div>
          </div>
        )}

        <div className="pm-section-label">Alle Berichte ({reports.length})</div>

        {reports.length === 0 ? (
          <div className="pm-empty">
            <span className="pm-empty-icon">📋</span>
            Noch kein Spielbericht vorhanden.<br />Lege deinen ersten Bericht nach dem nächsten Spiel an.
            <br />
            <button className="pm-btn-new" style={{ marginTop: 16, fontSize: 14 }} onClick={handleNew}>
              Ersten Bericht anlegen
            </button>
          </div>
        ) : (
          <div className="pm-list">
            {reports.map((r) => (
              <div key={r.id} id={`report-${r.id}`} className="pm-report-card" onClick={() => toggleExpand(r.id)}>
                <div className="pm-report-top">
                  <div>
                    <div className="pm-report-meta">
                      <div className="pm-report-opponent">{r.opponent || "Gegner noch nicht eingetragen"}</div>
                      {r.result && <div className="pm-report-result">{r.result}</div>}
                      <div className="pm-report-date">{formatDate(r.created_at)}</div>
                    </div>
                    {r.lineup_detail && <div className="pm-report-lineup">Aufstellung: {r.lineup_detail.title || `#${r.lineup}`}</div>}
                    {r.notes && <div className="pm-report-notes">{r.notes}</div>}
                  </div>
                  <div className="pm-report-actions">
                    <button className="pm-btn-icon" onClick={(e) => handleEdit(e, r)}>✏️</button>
                    <button className="pm-btn-icon danger" onClick={(e) => handleDelete(e, r.id)}>🗑️</button>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="pm-detail-card" onClick={e => e.stopPropagation()}>
                    <div className="pm-detail-label">Spielereignisse</div>
                    {!r.events || r.events.length === 0 ? (
                      <div className="pm-no-events">Keine Ereignisse für dieses Spiel gespeichert.</div>
                    ) : (
                      <div className="pm-events-list">
                        {r.events.sort((a, b) => a.minute - b.minute).map(ev => {
                          const badge = getEventBadge(ev);
                          return (
                            <div key={ev.id} className="pm-event-item">
                              <div className="pm-event-minute">{ev.minute}'</div>
                              <span className={`pm-event-badge ${badge.cls}`}>{badge.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
