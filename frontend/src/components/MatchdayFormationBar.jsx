const S = `
  .mfbar {
    font-family: 'DM Sans', sans-serif;
    padding: 8px 16px;
    background: #0a0a0f;
    border-bottom: 1px solid #141418;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mfbar-label {
    font-size: 11px;
    color: #3f3f46;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .mfbar-select {
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #d4d4d8;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    flex: 1;
    max-width: 300px;
  }

  .mfbar-select:focus { border-color: #22c55e; }

  .mfbar-info {
    font-size: 12px;
    color: #3f3f46;
    white-space: nowrap;
  }
`;

export default function MatchdayFormationBar({ lineups, selectedLineupId, onSelectLineup }) {
  const selectedLineup = lineups.find(l => l.id === selectedLineupId);

  return (
    <>
      <style>{S}</style>
      <div className="mfbar">
        <span className="mfbar-label">Aufstellung</span>
        <select
          className="mfbar-select"
          value={selectedLineupId || ''}
          onChange={e => onSelectLineup(Number(e.target.value))}
        >
          <option value="">— Aufstellung wählen —</option>
          {lineups.map(l => (
            <option key={l.id} value={l.id}>{l.title} {l.opponent ? `vs ${l.opponent}` : ''}</option>
          ))}
        </select>
        {selectedLineup && (
          <span className="mfbar-info">{selectedLineup.formation_name || ''}</span>
        )}
      </div>
    </>
  );
}
