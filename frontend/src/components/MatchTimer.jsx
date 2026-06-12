import { useState, useEffect, useRef } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .timer-root {
    font-family: 'DM Sans', sans-serif;
    color: #d4d4d8;
  }

  .timer-card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 12px;
  }

  .timer-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .half-badge {
    background: #0d1f0e;
    border: 1px solid #22c55e33;
    border-radius: 6px;
    padding: 2px 10px;
    font-size: 10px;
    color: #22c55e;
    letter-spacing: 0.1em;
  }

  .timer-display {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 72px;
    color: #22c55e;
    letter-spacing: 0.05em;
    line-height: 1;
    margin-bottom: 16px;
    font-variant-numeric: tabular-nums;
  }

  .timer-progress {
    height: 3px;
    background: #1a1a1a;
    border-radius: 2px;
    margin-bottom: 16px;
    overflow: hidden;
  }

  .timer-bar {
    height: 100%;
    background: #22c55e;
    border-radius: 2px;
    transition: width 1s linear;
  }

  .timer-btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  .timer-btn {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #1e1e24;
    background: #111116;
    color: #a1a1aa;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s, border-color 0.15s;
  }

  .timer-btn:hover { background: #1a1a24; border-color: #2a2a35; }
  .timer-btn:active { transform: scale(0.98); }

  .timer-btn.start { background: #0d2010; border-color: #22c55e44; color: #22c55e; }
  .timer-btn.start:hover { background: #0f2812; }
  .timer-btn.pause { background: #1f1a0a; border-color: #fbbf2444; color: #fbbf24; }
  .timer-btn.pause:hover { background: #241f0c; }

  /* EREIGNISSE */
  .events-card {
    background: #0a0a0f;
    border: 1px solid #141418;
    border-radius: 14px;
    padding: 20px;
  }

  .events-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #22c55e;
    text-transform: uppercase;
    margin-bottom: 14px;
    font-weight: 500;
  }

  .event-btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 16px;
  }

  .event-btn {
    padding: 10px 8px;
    border-radius: 8px;
    border: 1px solid #1e1e24;
    background: #111116;
    color: #a1a1aa;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    cursor: pointer;
    text-align: center;
    transition: background 0.15s;
  }

  .event-btn:hover { background: #1a1a24; }
  .event-btn.tor { border-color: #22c55e44; color: #22c55e; }
  .event-btn.karte { border-color: #fbbf2444; color: #fbbf24; }
  .event-btn.wechsel { border-color: #60a5fa44; color: #60a5fa; }

  /* EVENT MODAL */
  .event-modal {
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .event-modal-title {
    font-size: 13px;
    font-weight: 500;
    color: #e4e4e7;
    margin-bottom: 12px;
  }

  .event-modal-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .event-option {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid #1e1e24;
    background: #0a0a0f;
    color: #71717a;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .event-option:hover { border-color: #3f3f46; color: #d4d4d8; }
  .event-option.selected { border-color: #22c55e; color: #22c55e; background: #0d1f0e; }
  .event-option.selected-yellow { border-color: #fbbf24; color: #fbbf24; background: #1f1a0a; }
  .event-option.selected-red { border-color: #f87171; color: #f87171; background: #1f0a0a; }
  .event-option.selected-blue { border-color: #60a5fa; color: #60a5fa; background: #0d1a30; }

  .event-confirm-btn {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: none;
    background: #22c55e;
    color: #040f04;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 15px;
    letter-spacing: 0.08em;
    cursor: pointer;
    margin-top: 8px;
  }

  .event-cancel-btn {
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #1e1e24;
    background: transparent;
    color: #52525b;
    font-size: 13px;
    cursor: pointer;
    margin-top: 6px;
  }

  /* EREIGNIS LISTE */
  .event-list { display: flex; flex-direction: column; gap: 6px; }

  .event-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: #111116;
    border-radius: 8px;
    border: 1px solid #1a1a1a;
    font-size: 12px;
  }

  .event-minute {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    color: #52525b;
    width: 32px;
    flex-shrink: 0;
  }

  .event-type-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .badge-tor-us { background: #0d2010; color: #22c55e; }
  .badge-tor-them { background: #1f0a0a; color: #f87171; }
  .badge-yellow { background: #1f1a0a; color: #fbbf24; }
  .badge-yellow-red { background: #1f100a; color: #fb923c; }
  .badge-red { background: #1f0a0a; color: #f87171; }
  .badge-wechsel { background: #0d1a30; color: #60a5fa; }

  .event-desc { font-size: 12px; color: #71717a; flex: 1; }
  .event-empty { font-size: 12px; color: #2a2a35; font-style: italic; padding: 8px 0; }
`;

const TOTAL = 45 * 60;

export default function MatchTimer({ onEventsUpdate }) {
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [half, setHalf] = useState(1);
  const [events, setEvents] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'tor' | 'karte' | 'wechsel'
  const [torSide, setTorSide] = useState(null);
  const [cardType, setCardType] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 0) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (onEventsUpdate) onEventsUpdate(events);
  }, [events]);

  const pad = (n) => String(n).padStart(2, '0');
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const elapsed = TOTAL - remaining;
  const currentMinute = Math.floor(elapsed / 60);
  const progress = (remaining / TOTAL) * 100;

  function handleHalfTime() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setHalf(2);
    setRemaining(TOTAL);
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setHalf(1);
    setRemaining(TOTAL);
    setEvents([]);
    setActiveModal(null);
  }

  function addEvent(type, details) {
    const newEvent = { type, minute: currentMinute, ...details, id: Date.now() };
    setEvents(prev => [...prev, newEvent]);
    setActiveModal(null);
    setTorSide(null);
    setCardType(null);
  }

  function getEventBadge(ev) {
    if (ev.type === 'tor') return ev.for_us ? { cls: 'badge-tor-us', label: 'Tor für uns' } : { cls: 'badge-tor-them', label: 'Gegenteil' };
    if (ev.type === 'karte') {
      if (ev.card_type === 'yellow') return { cls: 'badge-yellow', label: 'Gelb' };
      if (ev.card_type === 'yellow_red') return { cls: 'badge-yellow-red', label: 'Gelb-Rot' };
      return { cls: 'badge-red', label: 'Rot' };
    }
    return { cls: 'badge-wechsel', label: 'Wechsel' };
  }

  return (
    <>
      <style>{S}</style>
      <div className="timer-root">
        <div className="timer-card">
          <div className="timer-label">
            Spielzeit
            <span className="half-badge">{half}. Halbzeit</span>
          </div>
          <div className="timer-display">{pad(minutes)}:{pad(seconds)}</div>
          <div className="timer-progress">
            <div className="timer-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="timer-btn-row">
            <button
              className={`timer-btn ${running ? 'pause' : 'start'}`}
              onClick={() => setRunning(r => !r)}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="timer-btn" onClick={handleHalfTime}>
              ↺ Halbzeit
            </button>
            <button className="timer-btn" onClick={handleReset}>
              ■ Reset
            </button>
          </div>
        </div>

        <div className="events-card">
          <div className="events-label">Spielereignisse</div>

          <div className="event-btn-row">
            <button className="event-btn tor" onClick={() => setActiveModal('tor')}>⚽ Tor</button>
            <button className="event-btn karte" onClick={() => setActiveModal('karte')}>🟨 Karte</button>
            <button className="event-btn wechsel" onClick={() => setActiveModal('wechsel')}>↔ Wechsel</button>
          </div>

          {activeModal === 'tor' && (
            <div className="event-modal">
              <div className="event-modal-title">Tor — {currentMinute}'</div>
              <div className="event-modal-row">
                <div
                  className={`event-option ${torSide === true ? 'selected' : ''}`}
                  onClick={() => setTorSide(true)}
                >⚽ Für uns</div>
                <div
                  className={`event-option ${torSide === false ? 'selected-red' : ''}`}
                  onClick={() => setTorSide(false)}
                >⚽ Gegenteil</div>
              </div>
              <button
                className="event-confirm-btn"
                disabled={torSide === null}
                onClick={() => addEvent('tor', { for_us: torSide })}
              >Eintragen</button>
              <button className="event-cancel-btn" onClick={() => { setActiveModal(null); setTorSide(null); }}>Abbrechen</button>
            </div>
          )}

          {activeModal === 'karte' && (
            <div className="event-modal">
              <div className="event-modal-title">Karte — {currentMinute}'</div>
              <div className="event-modal-row">
                <div className={`event-option ${cardType === 'yellow' ? 'selected-yellow' : ''}`} onClick={() => setCardType('yellow')}>🟨 Gelb</div>
                <div className={`event-option ${cardType === 'yellow_red' ? 'selected-yellow' : ''}`} onClick={() => setCardType('yellow_red')}>🟨🟥 Gelb-Rot</div>
                <div className={`event-option ${cardType === 'red' ? 'selected-red' : ''}`} onClick={() => setCardType('red')}>🟥 Rot</div>
              </div>
              <button
                className="event-confirm-btn"
                disabled={!cardType}
                onClick={() => addEvent('karte', { card_type: cardType, for_us: true })}
              >Eintragen</button>
              <button className="event-cancel-btn" onClick={() => { setActiveModal(null); setCardType(null); }}>Abbrechen</button>
            </div>
          )}

          {activeModal === 'wechsel' && (
            <div className="event-modal">
              <div className="event-modal-title">Wechsel — {currentMinute}'</div>
              <button className="event-confirm-btn" onClick={() => addEvent('wechsel', { for_us: true })}>Eintragen</button>
              <button className="event-cancel-btn" onClick={() => setActiveModal(null)}>Abbrechen</button>
            </div>
          )}

          {events.length === 0 ? (
            <div className="event-empty">Noch keine Ereignisse</div>
          ) : (
            <div className="event-list">
              {events.map(ev => {
                const badge = getEventBadge(ev);
                return (
                  <div key={ev.id} className="event-item">
                    <div className="event-minute">{ev.minute}'</div>
                    <span className={`event-type-badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
