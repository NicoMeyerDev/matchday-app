import { useEffect, useState } from "react";
import {
  fetchMatchReports,
  createMatchReport,
  updateMatchReport,
  deleteMatchReport,
  fetchLineups,
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

  .pm-title-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .pm-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    letter-spacing: 0.04em;
    color: #fff;
    line-height: 1;
  }

  .pm-btn-new {
    padding: 12px 24px;
    background: #22c55e;
    color: #040f04;
    border: none;
    border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.2s;
  }

  .pm-btn-new:hover { background: #16a34a; }

  /* FORM */
  .pm-form-card {
    background: #0a0a0f;
    border: 1px solid #1a2e1a;
    border-radius: 14px;
    padding: 28px;
    margin-bottom: 28px;
    position: relative;
  }

  .pm-form-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #22c55e, transparent);
    border-radius: 14px 14px 0 0;
  }

  .pm-form-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 0.05em;
    color: #fff;
    margin-bottom: 20px;
  }

  .pm-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .pm-field label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: #3f3f46;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .pm-field input,
  .pm-field select,
  .pm-field textarea {
    width: 100%;
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    color: #e4e4e7;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .pm-field input:focus,
  .pm-field select:focus,
  .pm-field textarea:focus {
    border-color: #22c55e;
  }

  .pm-field textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }

  .pm-field select option { background: #111116; }

  .pm-form-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: flex-end;
  }

  .pm-btn-save {
    padding: 12px 28px;
    background: #22c55e;
    color: #040f04;
    border: none;
    border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.2s;
  }

  .pm-btn-save:hover { background: #16a34a; }
  .pm-btn-save:disabled { background: #1a3a1a; color: #2d5a2d; cursor: not-allowed; }

  .pm-btn-cancel {
    padding: 12px 20px;
    background: transparent;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    color: #52525b;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .pm-btn-cancel:hover { border-color: #3f3f46; color: #a1a1aa; }

  /* LIST */
  .pm-section-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .pm-empty {
    background: #0a0a0f;
    border: 1px dashed #1e1e24;
    border-radius: 14px;
    padding: 48px;
    text-align: center;
    color: #3f3f46;
    font-size: 14px;
  }

  .pm-empty .pm-empty-icon { font-size: 32px; margin-bottom: 12px; display: block; }

  .pm-list { display: flex; flex-direction: column; gap: 12px; }

  .pm-report-card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 12px;
    padding: 20px 24px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: start;
    transition: border-color 0.2s;
  }

  .pm-report-card:hover { border-color: #1e2e1e; }

  .pm-report-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .pm-report-opponent {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 0.05em;
    color: #fff;
  }

  .pm-report-result {
    background: #0d2010;
    border: 1px solid #22c55e33;
    border-radius: 6px;
    padding: 3px 10px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    color: #22c55e;
    letter-spacing: 0.08em;
  }

  .pm-report-date {
    font-size: 11px;
    color: #3f3f46;
  }

  .pm-report-lineup {
    font-size: 12px;
    color: #52525b;
    margin-bottom: 10px;
  }

  .pm-report-notes {
    font-size: 13px;
    color: #71717a;
    line-height: 1.6;
    white-space: pre-wrap;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .pm-report-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .pm-btn-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid #1e1e24;
    background: transparent;
    color: #52525b;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, color 0.2s;
  }

  .pm-btn-icon:hover { border-color: #3f3f46; color: #a1a1aa; }
  .pm-btn-icon.danger:hover { border-color: #7f1d1d; color: #f87171; }

  .pm-error {
    padding: 12px 16px;
    background: #1f0f0f;
    border: 1px solid #3f1f1f;
    border-radius: 8px;
    font-size: 13px;
    color: #f87171;
    margin-bottom: 20px;
  }
`;

const EMPTY_FORM = { lineup: "", opponent: "", result: "", notes: "" };

export default function PostMatch() {
  const [reports, setReports] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [r, l] = await Promise.all([fetchMatchReports(), fetchLineups()]);
      setReports(r);
      setLineups(l);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleNew() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    setError("");
  }

  function handleEdit(report) {
    setForm({
      lineup: report.lineup,
      opponent: report.opponent || "",
      result: report.result || "",
      notes: report.notes || "",
    });
    setEditId(report.id);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSave() {
    if (!form.lineup) { setError("Bitte eine Aufstellung auswählen."); return; }
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await updateMatchReport(editId, form);
      } else {
        await createMatchReport(form);
      }
      await loadAll();
      handleCancel();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Bericht wirklich löschen?")) return;
    try {
      await deleteMatchReport(id);
      setReports((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <>
      <style>{S}</style>
      <div className="pm-root">

        <div className="pm-header">
          <div>
            <div className="pm-title-label">Saison 2025/26</div>
            <div className="pm-title">Post-Match</div>
          </div>
          {!showForm && (
            <button className="pm-btn-new" onClick={handleNew}>+ Neuer Bericht</button>
          )}
        </div>

        {error && <div className="pm-error">{error}</div>}

        {showForm && (
          <div className="pm-form-card">
            <div className="pm-form-title">{editId ? "Bericht bearbeiten" : "Neuer Spielbericht"}</div>

            <div className="pm-form-grid">
              <div className="pm-field">
                <label>Aufstellung</label>
                <select
                  value={form.lineup}
                  onChange={(e) => setForm({ ...form, lineup: e.target.value })}
                >
                  <option value="">— Aufstellung wählen —</option>
                  {lineups.map((l) => (
                    <option key={l.id} value={l.id}>{l.title || `Aufstellung #${l.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="pm-field">
                <label>Gegner</label>
                <input
                  type="text"
                  placeholder="z.B. FC Musterstadt"
                  value={form.opponent}
                  onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                />
              </div>
              <div className="pm-field">
                <label>Ergebnis</label>
                <input
                  type="text"
                  placeholder="z.B. 2:1"
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value })}
                />
              </div>
            </div>

            <div className="pm-field">
              <label>Notizen — was lief gut, was schlecht, was nimmst du mit?</label>
              <textarea
                placeholder="Gutes Pressing in der ersten Halbzeit. Defensiv noch Abstimmungsprobleme. Fürs Training: Umschaltspiel verbessern..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
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
            Noch kein Spielbericht vorhanden.<br />Erstelle deinen ersten Bericht nach dem nächsten Spiel.
          </div>
        ) : (
          <div className="pm-list">
            {reports.map((r) => (
              <div key={r.id} className="pm-report-card">
                <div>
                  <div className="pm-report-meta">
                    <div className="pm-report-opponent">{r.opponent || "Unbekannter Gegner"}</div>
                    {r.result && <div className="pm-report-result">{r.result}</div>}
                    <div className="pm-report-date">{formatDate(r.created_at)}</div>
                  </div>
                  {r.lineup_detail && (
                    <div className="pm-report-lineup">
                      Aufstellung: {r.lineup_detail.title || `#${r.lineup}`}
                    </div>
                  )}
                  {r.notes && <div className="pm-report-notes">{r.notes}</div>}
                </div>
                <div className="pm-report-actions">
                  <button className="pm-btn-icon" onClick={() => handleEdit(r)} title="Bearbeiten">✏️</button>
                  <button className="pm-btn-icon danger" onClick={() => handleDelete(r.id)} title="Löschen">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
