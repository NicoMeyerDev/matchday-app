import { useEffect, useRef, useState } from 'react';
import { recordPlayerView } from '../utils/recentlyViewed';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .players-root {
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
    min-height: 100vh;
    background: #07070a;
  }

  .players-topbar {
    padding: 16px 28px;
    border-bottom: 1px solid #141418;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .players-topbar-left .page-label {
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #3f3f46;
    text-transform: uppercase;
  }

  .players-topbar-left .page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 0.05em;
    color: #fff;
    line-height: 1.1;
  }

  .btn-primary {
    padding: 10px 20px;
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
  .btn-primary:hover { background: #16a34a; }

  .players-content { padding: 24px 28px; }

  /* POSITION GROUPS */
  .position-group { margin-bottom: 32px; }

  .position-group-title {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #141418;
    font-weight: 500;
  }

  .player-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
  }

  .player-card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s;
    border-left: 3px solid transparent;
  }

  .player-card:hover { border-color: #22c55e; transform: translateY(-1px); }
  .player-card.available { border-left-color: #22c55e; }
  .player-card.injured { border-left-color: #dc2626; }
  .player-card.doubtful { border-left-color: #fbbf24; }
  .player-card.suspended { border-left-color: #6366f1; }

  .player-card-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    color: #2a2a35;
    width: 32px;
    text-align: center;
    flex-shrink: 0;
  }

  .player-card-info { flex: 1; }
  .player-card-name { font-size: 14px; font-weight: 500; color: #e4e4e7; margin-bottom: 4px; }
  .player-card-meta { display: flex; gap: 8px; align-items: center; }

  .mini-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }

  .mini-badge.available { background: #0d2010; color: #22c55e; }
  .mini-badge.injured { background: #1f0a0a; color: #f87171; }
  .mini-badge.doubtful { background: #1f1a0a; color: #fbbf24; }
  .mini-badge.suspended { background: #0f0f1f; color: #818cf8; }

  .player-card-pos { font-size: 11px; color: #3f3f46; }

  .empty-group { font-size: 12px; color: #2a2a35; font-style: italic; padding: 8px 0; }

  /* PROFILE */
  .profile-root { padding: 24px 28px; }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #52525b;
    cursor: pointer;
    margin-bottom: 24px;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }
  .back-btn:hover { color: #22c55e; }

  .profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .profile-header-left { display: flex; align-items: center; gap: 20px; }

  .shirt-badge {
    width: 72px; height: 72px;
    background: #0d1f0e;
    border: 2px solid #22c55e44;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    color: #22c55e;
    flex-shrink: 0;
  }

  .profile-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    letter-spacing: 0.03em;
    color: #fff;
    line-height: 1;
    margin-bottom: 8px;
  }

  .profile-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  .badge {
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  .badge-green { background: #0d2010; border: 1px solid #22c55e44; color: #22c55e; }
  .badge-blue { background: #0d1a30; border: 1px solid #2563eb44; color: #60a5fa; }
  .badge-yellow { background: #1f1a0a; border: 1px solid #ca8a0444; color: #fbbf24; }
  .badge-red { background: #1f0a0a; border: 1px solid #dc262644; color: #f87171; }
  .badge-purple { background: #0f0f1f; border: 1px solid #6366f144; color: #818cf8; }

  .edit-btn {
    padding: 10px 24px;
    background: transparent;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    color: #71717a;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .edit-btn:hover { border-color: #22c55e; color: #22c55e; }
  .edit-btn.saving { background: #22c55e; color: #040f04; border-color: #22c55e; }

  .profile-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
  }

  .left-col { display: flex; flex-direction: column; gap: 16px; }
  .right-col { display: flex; flex-direction: column; gap: 16px; }

  .card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 14px;
    padding: 20px;
  }

  .card-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-weight: 500;
  }

  .mini-pitch {
    position: relative;
    width: 100%; height: 180px;
    background: linear-gradient(180deg, #1a5c2a 0%, #1e6b31 50%, #1a5c2a 100%);
    border-radius: 10px;
    border: 2px solid #0a1f0e;
    overflow: hidden;
  }
  .mini-pitch::before {
    content: '';
    position: absolute;
    left: 0; right: 0; top: 50%;
    height: 1px;
    background: rgba(255,255,255,0.3);
  }
  .mp-circle {
    position: absolute;
    left: 50%; top: 50%;
    width: 46px; height: 46px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .mp-box-top {
    position: absolute;
    top: 0; left: 25%; right: 25%;
    height: 32px;
    border: 1px solid rgba(255,255,255,0.3);
    border-top: none;
  }
  .mp-box-bottom {
    position: absolute;
    bottom: 0; left: 25%; right: 25%;
    height: 32px;
    border: 1px solid rgba(255,255,255,0.3);
    border-bottom: none;
  }
  .mp-dot {
    position: absolute;
    width: 12px; height: 12px;
    background: #22c55e;
    border-radius: 50%;
    border: 2px solid #fff;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 8px #22c55e88;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #0f0f14;
  }
  .info-row:last-child { border-bottom: none; }
  .info-key { font-size: 11px; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.1em; }
  .info-val { font-size: 13px; color: #d4d4d8; font-weight: 500; }

  .edit-input {
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    color: #d4d4d8;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    width: 140px;
    text-align: right;
  }
  .edit-input:focus { border-color: #22c55e; }

  .edit-select {
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    color: #d4d4d8;
    font-family: 'DM Sans', sans-serif;
    outline: none;
  }
  .edit-select:focus { border-color: #22c55e; }

  .notes-text { font-size: 13px; color: #52525b; line-height: 1.7; font-style: italic; }
  .notes-empty { font-size: 13px; color: #2a2a35; font-style: italic; }

  .edit-textarea {
    width: 100%;
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    padding: 12px;
    font-size: 13px;
    color: #d4d4d8;
    font-family: 'DM Sans', sans-serif;
    resize: vertical;
    min-height: 100px;
    outline: none;
    box-sizing: border-box;
  }
  .edit-textarea:focus { border-color: #22c55e; }

  .attr-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }

  .attr-category-title {
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #3f3f46;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #141418;
  }

  .attr-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid #0a0a0f;
  }

  .attr-name { font-size: 12px; color: #71717a; }

  .attr-placeholder {
    width: 28px; height: 28px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    color: #2a2a35;
    background: #111116;
    border: 1px solid #1a1a1a;
  }

  .dev-placeholder {
    height: 80px;
    display: flex; align-items: center; justify-content: center;
    color: #2a2a35; font-size: 13px; font-style: italic;
  }

  .error-box {
    padding: 12px 16px;
    background: #1f0f0f;
    border: 1px solid #3f1f1f;
    border-radius: 8px;
    font-size: 13px;
    color: #f87171;
    margin-bottom: 20px;
  }

  /* ADD PLAYER MODAL */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 24px;
  }

  .modal-card {
    background: #0f0f14;
    border: 1px solid #1e1e24;
    border-radius: 16px;
    padding: 28px;
    width: 100%;
    max-width: 480px;
  }

  .modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    color: #fff;
    margin-bottom: 20px;
    letter-spacing: 0.05em;
  }

  .modal-field { margin-bottom: 16px; }

  .modal-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: #3f3f46;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .modal-input {
    width: 100%;
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    color: #d4d4d8;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    box-sizing: border-box;
  }
  .modal-input:focus { border-color: #22c55e; }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
  }

  .modal-btn-cancel {
    padding: 10px 20px;
    background: transparent;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    color: #52525b;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
  }

  .modal-btn-save {
    padding: 10px 24px;
    background: #22c55e;
    color: #040f04;
    border: none;
    border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  .modal-btn-save:disabled { background: #0d2010; color: #1a3a1a; cursor: not-allowed; }
`;

const STATUS_LABELS = {
  available: { label: 'Verfügbar', cls: 'badge-green' },
  injured: { label: 'Verletzt', cls: 'badge-red' },
  doubtful: { label: 'Fraglich', cls: 'badge-yellow' },
  suspended: { label: 'Gesperrt', cls: 'badge-purple' },
};

const FOOT_LABELS = { left: 'Links', right: 'Rechts', both: 'Beidfüßig' };

const POSITION_DOTS = {
  TW: { x: 50, y: 88 },
  LV: { x: 18, y: 72 }, IVL: { x: 35, y: 72 }, IV: { x: 50, y: 75 }, IVM: { x: 50, y: 75 }, IVR: { x: 65, y: 72 }, RV: { x: 82, y: 72 },
  ZDM: { x: 50, y: 62 }, ZDML: { x: 35, y: 62 }, ZDMR: { x: 65, y: 62 }, DM: { x: 50, y: 62 }, DML: { x: 35, y: 62 }, DMR: { x: 65, y: 62 },
  LWB: { x: 10, y: 55 }, RWB: { x: 90, y: 55 },
  LM: { x: 15, y: 45 }, ZM: { x: 50, y: 45 }, ZML: { x: 35, y: 45 }, ZMR: { x: 65, y: 45 }, ZM1: { x: 35, y: 45 }, ZM2: { x: 65, y: 45 }, RM: { x: 85, y: 45 }, OM: { x: 50, y: 35 }, ZAM: { x: 50, y: 35 },
  LF: { x: 20, y: 25 }, RF: { x: 80, y: 25 }, ST: { x: 50, y: 15 }, STL: { x: 35, y: 18 }, STR: { x: 65, y: 18 },
};

const ATTRS = {
  technical: ['Dribbling', 'Passspiel', 'Schuss', 'Technik', 'Kopfball', 'Standards'],
  mental: ['Einsatz', 'Konzentration', 'Entscheidung', 'Führung', 'Teamwork', 'Pressing'],
  physical: ['Tempo', 'Ausdauer', 'Stärke', 'Agilität', 'Sprung', 'Balance'],
};

const POSITION_GROUPS = [
  { label: 'Tor', positions: ['TW'] },
  { label: 'Verteidigung', positions: ['LV', 'IVL', 'IV', 'IVR', 'RV', 'IVM'] },
  { label: 'Mittelfeld', positions: ['ZDM', 'ZDML', 'ZDMR', 'DM', 'DML', 'DMR', 'LWB', 'RWB', 'LM', 'ZM', 'ZML', 'ZMR', 'ZM1', 'ZM2', 'RM', 'OM', 'ZAM'] },
  { label: 'Angriff', positions: ['LF', 'RF', 'ST', 'STL', 'STR'] },
];

function getGroup(position) {
  if (!position) return 'Sonstige';
  const pos = position.toUpperCase().trim();
  for (const group of POSITION_GROUPS) {
    if (group.positions.some(p => pos === p || pos.includes(p))) return group.label;
  }
  return 'Sonstige';
}

function MiniPitch({ positions }) {
  const pos = positions ? positions.split(',').map(p => p.trim()).filter(p => POSITION_DOTS[p]) : [];
  return (
    <div className="mini-pitch">
      <div className="mp-circle" />
      <div className="mp-box-top" />
      <div className="mp-box-bottom" />
      {pos.map(p => (
        <div key={p}>
          <div className="mp-dot" style={{ left: `${POSITION_DOTS[p].x}%`, top: `${POSITION_DOTS[p].y}%` }} />
        </div>
      ))}
    </div>
  );
}

function AddPlayerModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', shirt_number: '', preferred_positions: '', foot: '', status: 'available' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!form.name.trim()) { setError('Name ist Pflichtfeld.'); return; }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/players/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Fehler beim Speichern');
      const player = await res.json();
      onSaved(player);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Neuer Spieler</div>

        {error && <div className="error-box">{error}</div>}

        <div className="modal-field">
          <label className="modal-label">Name *</label>
          <input className="modal-input" placeholder="z.B. Thomas Müller" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="modal-field">
          <label className="modal-label">Rückennummer</label>
          <input className="modal-input" type="number" placeholder="z.B. 9" value={form.shirt_number} onChange={e => setForm({ ...form, shirt_number: e.target.value })} />
        </div>
        <div className="modal-field">
          <label className="modal-label">Position</label>
          <input className="modal-input" placeholder="z.B. ST, LM" value={form.preferred_positions.toUpperCase()} onChange={e => setForm({ ...form, preferred_positions: e.target.value })} />
        </div>
        <div className="modal-field">
          <label className="modal-label">Fuß</label>
          <select className="modal-input" value={form.foot} onChange={e => setForm({ ...form, foot: e.target.value })}>
            <option value="">—</option>
            <option value="left">Links</option>
            <option value="right">Rechts</option>
            <option value="both">Beidfüßig</option>
          </select>
        </div>
        <div className="modal-field">
          <label className="modal-label">Status</label>
          <select className="modal-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="available">Verfügbar</option>
            <option value="injured">Verletzt</option>
            <option value="doubtful">Fraglich</option>
            <option value="suspended">Gesperrt</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>Abbrechen</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Wird gespeichert...' : 'Spieler anlegen'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerProfile({ player, onBack, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: player.name || '',
    shirt_number: player.shirt_number || '',
    preferred_positions: player.preferred_positions || '',
    foot: player.foot || '',
    status: player.status || 'available',
    notes: player.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
  setSaving(true);
  setError('');
  try {
    await onUpdate(player.id, {
      ...form,
      preferred_positions: form.preferred_positions.toUpperCase(),
    });
    setEditMode(false);
  } catch (e) {
    setError(e.message);
  } finally {
    setSaving(false);
  }
}

  const statusInfo = STATUS_LABELS[form.status] || STATUS_LABELS.available;

  return (
    <div className="profile-root">
      <button className="back-btn" onClick={onBack}>← Zurück zur Kaderliste</button>
      {error && <div className="error-box">{error}</div>}

      <div className="profile-header">
        <div className="profile-header-left">
          <div className="shirt-badge">#{form.shirt_number || '—'}</div>
          <div>
            {editMode ? (
              <input className="edit-input" style={{ width: '260px', fontSize: '24px', marginBottom: '8px', textAlign: 'left' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            ) : (
              <div className="profile-name">{form.name}</div>
            )}
            <div className="profile-meta">
              {editMode ? (
                <select className="edit-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Verfügbar</option>
                  <option value="injured">Verletzt</option>
                  <option value="doubtful">Fraglich</option>
                  <option value="suspended">Gesperrt</option>
                </select>
              ) : (
                <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
              )}
              {form.preferred_positions && <span className="badge badge-blue">{form.preferred_positions}</span>}
              {form.foot && <span className="badge badge-yellow">{FOOT_LABELS[form.foot] || form.foot}</span>}
            </div>
          </div>
        </div>
        <button className={`edit-btn ${saving ? 'saving' : ''}`} onClick={editMode ? handleSave : () => setEditMode(true)}>
          {saving ? 'Wird gespeichert...' : editMode ? '✅ Speichern' : '✏️ Bearbeiten'}
        </button>
      </div>

      <div className="profile-grid">
        <div className="left-col">
          <div className="card">
            <div className="card-label">Position auf dem Feld</div>
            <MiniPitch positions={form.preferred_positions} />
          </div>
          <div className="card">
            <div className="card-label">Spielerinfo</div>
            <div className="info-row">
              <span className="info-key">Rückennummer</span>
              {editMode ? <input className="edit-input" type="number" value={form.shirt_number} onChange={e => setForm({ ...form, shirt_number: e.target.value })} /> : <span className="info-val">#{form.shirt_number || '—'}</span>}
            </div>
            <div className="info-row">
              <span className="info-key">Position</span>
              {editMode ? <input className="edit-input" placeholder="z.B. ST, LM" value={form.preferred_positions} onChange={e => setForm({ ...form, preferred_positions: e.target.value })} /> : <span className="info-val">{form.preferred_positions || '—'}</span>}
            </div>
            <div className="info-row">
              <span className="info-key">Fuß</span>
              {editMode ? (
                <select className="edit-select" value={form.foot} onChange={e => setForm({ ...form, foot: e.target.value })}>
                  <option value="">—</option>
                  <option value="left">Links</option>
                  <option value="right">Rechts</option>
                  <option value="both">Beidfüßig</option>
                </select>
              ) : <span className="info-val">{FOOT_LABELS[form.foot] || '—'}</span>}
            </div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-label">Trainernotizen</div>
            {editMode ? (
              <textarea className="edit-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notizen zum Spieler..." />
            ) : form.notes ? <p className="notes-text">{form.notes}</p> : <p className="notes-empty">Noch keine Notizen.</p>}
          </div>
        </div>

        <div className="right-col">
          <div className="card">
            <div className="card-label">Attribute — Bewertung folgt</div>
            <div className="attr-grid">
              {Object.entries({ Technisch: ATTRS.technical, Mental: ATTRS.mental, Physisch: ATTRS.physical }).map(([cat, attrs]) => (
                <div key={cat}>
                  <div className="attr-category-title">{cat}</div>
                  {attrs.map(a => (
                    <div key={a} className="attr-item">
                      <span className="attr-name">{a}</span>
                      <span className="attr-placeholder">—</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ opacity: 0.4 }}>
            <div className="card-label">Entwicklung über Zeit</div>
            <div className="dev-placeholder">Verfügbar nach erster Bewertung</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Players({ initialPlayerId, onPlayersChanged } = {}) {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const consumedInitialPlayerRef = useRef(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/players/', {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setPlayers(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (initialPlayerId && !consumedInitialPlayerRef.current && players.length > 0) {
      const target = players.find(p => p.id === initialPlayerId);
      if (target) {
        setSelectedPlayer(target);
        recordPlayerView(target.id);
        consumedInitialPlayerRef.current = true;
      }
    }
  }, [initialPlayerId, players]);

  async function handleUpdate(id, data) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/players/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Fehler beim Speichern');
    const updated = await res.json();
    setPlayers(prev => prev.map(p => p.id === id ? updated : p));
    setSelectedPlayer(updated);
    onPlayersChanged?.();
  }

  // Spieler nach Positionsgruppen gruppieren
  const grouped = {};
  const groupOrder = ['Tor', 'Verteidigung', 'Mittelfeld', 'Angriff', 'Sonstige'];
  groupOrder.forEach(g => { grouped[g] = []; });
  players.forEach(p => {
    const group = getGroup(p.preferred_positions);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(p);
  });

  if (loading) return <div style={{ padding: 40, color: '#555' }}>Lade Kader...</div>;

  if (selectedPlayer) {
    return (
      <>
        <style>{S}</style>
        <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} onUpdate={handleUpdate} />
      </>
    );
  }

  return (
    <>
      <style>{S}</style>
      <div className="players-root">
        <div className="players-topbar">
          <div className="players-topbar-left">
            <div className="page-label">Saison 2025/26</div>
            <div className="page-title">Kader</div>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Spieler hinzufügen</button>
        </div>

        <div className="players-content">
          {error && <div className="error-box">{error}</div>}

          {players.length === 0 ? (
            <div style={{ color: '#2a2a35', fontStyle: 'italic', padding: '40px 0', textAlign: 'center' }}>
              Noch keine Spieler im Kader. Füge deinen ersten Spieler hinzu!
            </div>
          ) : (
            groupOrder.map(group => {
              const groupPlayers = grouped[group];
              if (groupPlayers.length === 0) return null;
              return (
                <div key={group} className="position-group">
                  <div className="position-group-title">{group} ({groupPlayers.length})</div>
                  <div className="player-grid">
                    {groupPlayers.map(p => {
                      const s = STATUS_LABELS[p.status] || STATUS_LABELS.available;
                      return (
                        <div key={p.id} className={`player-card ${p.status || 'available'}`} onClick={() => { recordPlayerView(p.id); setSelectedPlayer(p); }}>
                          <div className="player-card-num">{p.shirt_number || '—'}</div>
                          <div className="player-card-info">
                            <div className="player-card-name">{p.name}</div>
                            <div className="player-card-meta">
                              <span className={`mini-badge ${p.status || 'available'}`}>{s.label}</span>
                              {p.preferred_positions && <span className="player-card-pos">{p.preferred_positions}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onSaved={(newPlayer) => setPlayers(prev => [...prev, newPlayer])}
        />
      )}
    </>
  );
}
