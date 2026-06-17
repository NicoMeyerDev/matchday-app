import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500&display=swap');

  .timer-bar-root {
    font-family: 'DM Sans', sans-serif;
    background: #0a0a0f;
    border-bottom: 1px solid #141418;
    padding: 10px 16px;
  }

  .timer-bar-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .timer-bar-time {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    color: #22c55e;
    line-height: 1;
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
    min-width: 100px;
  }

  .timer-bar-half {
    background: #0d1f0e;
    border: 1px solid #22c55e33;
    border-radius: 6px;
    padding: 2px 10px;
    font-size: 10px;
    color: #22c55e;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .timer-bar-progress {
    flex: 1;
    height: 3px;
    background: #1a1a1a;
    border-radius: 2px;
    overflow: hidden;
    min-width: 60px;
  }

  .timer-bar-fill {
    height: 100%;
    background: #22c55e;
    border-radius: 2px;
    transition: width 1s linear;
  }

  .timer-bar-controls {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .tbar-btn {
    padding: 7px 14px;
    border-radius: 8px;
    border: 1px solid #1e1e24;
    background: #111116;
    color: #a1a1aa;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .tbar-btn:hover { background: #1a1a24; }
  .tbar-btn:active { transform: scale(0.97); }

  .tbar-btn.start { background: #0d2010; border-color: #22c55e44; color: #22c55e; }
  .tbar-btn.pause { background: #1f1a0a; border-color: #fbbf2444; color: #fbbf24; }
  .tbar-btn.tor { border-color: #22c55e33; color: #22c55e; }
  .tbar-btn.karte { border-color: #fbbf2433; color: #fbbf24; }

  .tbar-divider {
    width: 1px;
    height: 28px;
    background: #1e1e24;
    margin: 0 2px;
  }

  /* EREIGNIS POPUP */
  .tbar-popup {
    margin-top: 8px;
    background: #111116;
    border: 1px solid #1e1e24;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tbar-popup-title {
    font-size: 12px;
    color: #71717a;
    min-width: 80px;
  }

  .tbar-option {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid #1e1e24;
    background: #0a0a0f;
    color: #71717a;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tbar-option:hover { border-color: #3f3f46; color: #d4d4d8; }
  .tbar-option.sel-green { border-color: #22c55e; color: #22c55e; background: #0d1f0e; }
  .tbar-option.sel-red { border-color: #f87171; color: #f87171; background: #1f0a0a; }
  .tbar-option.sel-yellow { border-color: #fbbf24; color: #fbbf24; background: #1f1a0a; }

  .tbar-confirm {
    padding: 5px 16px;
    border-radius: 6px;
    border: none;
    background: #22c55e;
    color: #040f04;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 0.06em;
    cursor: pointer;
    margin-left: auto;
  }

  .tbar-confirm:disabled { background: #0d2010; color: #1a3a1a; cursor: not-allowed; }

  .tbar-cancel {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid #1e1e24;
    background: transparent;
    color: #52525b;
    font-size: 12px;
    cursor: pointer;
  }

  /* EREIGNIS LISTE */
  .tbar-events {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tbar-event-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    border: 1px solid #1a1a1a;
    background: #111116;
  }

  .tbar-event-min {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    color: #52525b;
  }

  .chip-tor-us { border-color: #22c55e44; color: #22c55e; }
  .chip-tor-them { border-color: #f8717144; color: #f87171; }
  .chip-yellow { border-color: #fbbf2444; color: #fbbf24; }
  .chip-yellow-red { border-color: #fb923c44; color: #fb923c; }
  .chip-red { border-color: #f8717144; color: #f87171; }
  .chip-wechsel { border-color: #60a5fa44; color: #60a5fa; }

  @media (max-height: 900px) {
    .timer-bar-root { padding: 6px 16px; }
    .timer-bar-time { font-size: 28px; min-width: 70px; }
    .timer-bar-half { font-size: 9px; padding: 1px 8px; }
    .tbar-btn { padding: 5px 10px; font-size: 11px; }
    .tbar-divider { height: 22px; }
  }
`;

const TOTAL = 45 * 60;

const MatchTimerBar = forwardRef(function MatchTimerBar({ onEventsUpdate, onMatchEnd, onLogEvent }, ref) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [half, setHalf] = useState(1);
  const [events, setEvents] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [torSide, setTorSide] = useState(null);
  const [cardType, setCardType] = useState(null);
  const intervalRef = useRef(null);
  const prevElapsedRef = useRef(0);
  const accumulatedRef = useRef(0);
  const startTimestampRef = useRef(null);

    // Zeitstempel-basiert statt Hochzählen: robust gegen setInterval-Drosselung beim
  // Sperren des Tablets. accumulatedRef hält Sekunden aus abgeschlossenen Lauf-
  // Abschnitten, startTimestampRef den Start des aktuell laufenden Abschnitts.
  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const secondsSinceStart = Math.floor((Date.now() - startTimestampRef.current) / 1000);
      const total = accumulatedRef.current + secondsSinceStart;
      if (total >= TOTAL) {
        accumulatedRef.current = TOTAL;
        setElapsed(TOTAL);
        setRunning(false);
        clearInterval(intervalRef.current);
      } else {
        setElapsed(total);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Sorgt dafür, dass die Anzeige sofort korrekt springt, sobald das Tablet
  // entsperrt wird, statt bis zum nächsten Interval-Tick zu warten.
  useEffect(() => {
    function handleVisibilityChange() {
      if (running && document.visibilityState === 'visible') {
        const secondsSinceStart = Math.floor((Date.now() - startTimestampRef.current) / 1000);
        const total = Math.min(accumulatedRef.current + secondsSinceStart, TOTAL);
        setElapsed(total);
        if (total >= TOTAL) {
          accumulatedRef.current = TOTAL;
          setRunning(false);
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [running]);

  useEffect(() => {
    if (onEventsUpdate) onEventsUpdate(events);
  }, [events]);

  useEffect(() => {
  if (prevElapsedRef.current < TOTAL && elapsed >= TOTAL) {
    if (onMatchEnd) onMatchEnd(events);
  }
  prevElapsedRef.current = elapsed;
}, [elapsed, events, onMatchEnd]);

  const pad = n => String(n).padStart(2, '0');
  const displayMinutes = (half === 2 ? 45 : 0) + Math.floor(elapsed / 60);
  const currentMinute = displayMinutes + 1;
  const minutes = displayMinutes;
  const seconds = elapsed % 60;
  const progress = (elapsed / TOTAL) * 100;

  function addEvent(type, details) {
    const event = { type, minute: currentMinute, ...details, id: Date.now() };
    setEvents(prev => [...prev, event]);
    setActiveModal(null);
    setTorSide(null);
    setCardType(null);
    if (onLogEvent) onLogEvent(event);
  }

  // Von außen aufrufbar (z.B. aus App.jsx beim Spielerwechsel):
  // loggt automatisch einen Wechsel-Eintrag auf der Timeline.
  useImperativeHandle(ref, () => ({
    logWechsel: (label) => {
      addEvent('wechsel', { for_us: true, label });
    },
  }));

  function handleStartPause() {
    if (running) {
      const secondsSinceStart = Math.floor((Date.now() - startTimestampRef.current) / 1000);
      accumulatedRef.current = Math.min(accumulatedRef.current + secondsSinceStart, TOTAL);
      setElapsed(accumulatedRef.current);
      setRunning(false);
    } else {
      startTimestampRef.current = Date.now();
      setRunning(true);
    }
  }

  function handleStop() {
  clearInterval(intervalRef.current);
  setRunning(false);
  if (onMatchEnd) onMatchEnd(events);
  setHalf(1);
  accumulatedRef.current = 0;
  setElapsed(0);
  setEvents([]);
  setActiveModal(null);
}

  function getChip(ev) {
    if (ev.type === 'tor') return ev.for_us
      ? { cls: 'chip-tor-us', label: '⚽ Tor' }
      : { cls: 'chip-tor-them', label: '⚽ Gegenteil' };
    if (ev.type === 'karte') {
      if (ev.card_type === 'yellow') return { cls: 'chip-yellow', label: '🟨 Gelb' };
      if (ev.card_type === 'yellow_red') return { cls: 'chip-yellow-red', label: '🟨🟥 G-R' };
      return { cls: 'chip-red', label: '🟥 Rot' };
    }
    return { cls: 'chip-wechsel', label: ev.label ? `↔ ${ev.label}` : '↔ Wechsel' };
  }

  return (
    <>
      <style>{S}</style>
      <div className="timer-bar-root">
        <div className="timer-bar-main">
          <div className="timer-bar-time">{pad(minutes)}:{pad(seconds)}</div>
          <span className="timer-bar-half">{half}. HZ</span>
          <div className="timer-bar-progress">
            <div className="timer-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="timer-bar-controls">
            <button
              className={`tbar-btn ${running ? 'pause' : 'start'}`}
              onClick={handleStartPause}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="tbar-btn" onClick={() => { clearInterval(intervalRef.current); setRunning(false); setHalf(2); accumulatedRef.current = 0; setElapsed(0); }}>↺ HZ</button>
            <button className="tbar-btn" onClick={handleStop}>■</button>
            <div className="tbar-divider" />
            <button className="tbar-btn tor" onClick={() => setActiveModal(activeModal === 'tor' ? null : 'tor')}>⚽ Tor</button>
            <button className="tbar-btn karte" onClick={() => setActiveModal(activeModal === 'karte' ? null : 'karte')}>🟨 Karte</button>
          </div>
        </div>

        {activeModal === 'tor' && (
          <div className="tbar-popup">
            <span className="tbar-popup-title">Tor — {currentMinute}'</span>
            <div className={`tbar-option ${torSide === true ? 'sel-green' : ''}`} onClick={() => setTorSide(true)}>⚽ Für uns</div>
            <div className={`tbar-option ${torSide === false ? 'sel-red' : ''}`} onClick={() => setTorSide(false)}>⚽ Gegenteil</div>
            <button className="tbar-cancel" onClick={() => { setActiveModal(null); setTorSide(null); }}>✕</button>
            <button className="tbar-confirm" disabled={torSide === null} onClick={() => addEvent('tor', { for_us: torSide })}>Eintragen</button>
          </div>
        )}

        {activeModal === 'karte' && (
          <div className="tbar-popup">
            <span className="tbar-popup-title">Karte — {currentMinute}'</span>
            <div className={`tbar-option ${cardType === 'yellow' ? 'sel-yellow' : ''}`} onClick={() => setCardType('yellow')}>🟨 Gelb</div>
            <div className={`tbar-option ${cardType === 'yellow_red' ? 'sel-yellow' : ''}`} onClick={() => setCardType('yellow_red')}>🟨🟥 Gelb-Rot</div>
            <div className={`tbar-option ${cardType === 'red' ? 'sel-red' : ''}`} onClick={() => setCardType('red')}>🟥 Rot</div>
            <button className="tbar-cancel" onClick={() => { setActiveModal(null); setCardType(null); }}>✕</button>
            <button className="tbar-confirm" disabled={!cardType} onClick={() => addEvent('karte', { card_type: cardType, for_us: true })}>Eintragen</button>
          </div>
        )}

        {events.length > 0 && (
          <div className="tbar-events">
            {events.map(ev => {
              const chip = getChip(ev);
              return (
                <div key={ev.id} className={`tbar-event-chip ${chip.cls}`}>
                  <span className="tbar-event-min">{ev.minute}'</span>
                  <span>{chip.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
});

export default MatchTimerBar;
