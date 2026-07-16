import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCurrentUser,createLineup, deleteLineup, fetchFormations, fetchLineups, fetchPlayers, updateLineup, fetchMatchReports, createMatchReport, createMatchEvent, finalizeMatchReport  } from "./api/client";
import Header from "./components/Header";
import FormationSelector from "./components/FormationSelector";
import PlayerList from "./components/PlayerList";
import Pitch from "./components/Pitch";
import Bench from "./components/Bench";
import NotesPanel from "./components/NotesPanel";
import PositionPlayerPicker from "./components/PositionPlayerPicker";
import { buildLineupPayload, isPlayerOnBench, mapSlotsByPosition, playerMatchesPosition, removePlayerFromField } from "./utils/lineup";
import AddPlayerModal from "./components/AddPlayerModal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hub from "./pages/Hub";
import PostMatch from "./pages/PostMatch";
import Layout from "./components/Layout";
import PlayersPage from "./pages/Players";
import Onboarding from "./pages/Onboarding";
import Verein from "./pages/Verein";
import InviteAccept from "./pages/InviteAccept";
import MatchTimerBar from "./components/MatchTimerBar";
import MatchdayFormationBar from "./components/MatchdayFormationBar";
import BriefingModal, { parseInstructionText } from "./components/BriefingModal";
import LineupExportButton from "./components/LineupExportButton";
import { useAutoDismiss } from "./hooks/useAutoDismiss";
import TrainingsHub from "./pages/TrainingsHub";

const INVITE_TOKEN_STORAGE_KEY = "pending_invite_token";

// Liest den Einladungs-Token entweder aus der aktuellen URL (/invite/<token>)
// oder - falls der Nutzer zwischendurch zum Login/Registrieren musste und die
// Seite neu geladen wurde - aus dem Session-Storage.
function getInitialInviteToken() {
  const match = /^\/invite\/([^/]+)\/?$/.exec(window.location.pathname);
  if (match) {
    sessionStorage.setItem(INVITE_TOKEN_STORAGE_KEY, match[1]);
    return match[1];
  }
  return sessionStorage.getItem(INVITE_TOKEN_STORAGE_KEY) || null;
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "1px solid #27272a",
        color: "#a1a1aa",
        borderRadius: "8px",
        padding: "8px 14px",
        fontSize: "13px",
        cursor: "pointer",
        marginBottom: "16px",
      }}
    >
      ← Zurück zum Hub
    </button>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState("login");
  const [currentPage, setCurrentPage] = useState("hub");
  const [players, setPlayers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [selectedFormationId, setSelectedFormationId] = useState(null);
  const [selectedLineupId, setSelectedLineupId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [assignedSlots, setAssignedSlots] = useState({});
  const [substitutes, setSubstitutes] = useState([]);
  const [notes, setNotes] = useState("");
  const [lineupTitle, setLineupTitle] = useState("MVP Testspiel");
  const [opponent, setOpponent] = useState("Gegner noch nicht eingetragen");
  const [activePosition, setActivePosition] = useState(null);
  const [isPlayerDrawerOpen, setIsPlayerDrawerOpen] = useState(true);
  const [isBenchOpen, setIsBenchOpen] = useState(true);
  const [error, setError] = useAutoDismiss("", 5000);
  const [info, setInfo] = useAutoDismiss("", 4000);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("feld");
  const [club, setClub] = useState(null);
  const [clubLoaded, setClubLoaded] = useState(false);
  const [matchReports, setMatchReports] = useState([]);
  const [matchEvents, setMatchEvents] = useState([]);
  const [hubPlayerTarget, setHubPlayerTarget] = useState(null);
  const [hubReportTarget, setHubReportTarget] = useState(null);
  const [pendingInviteToken, setPendingInviteToken] = useState(getInitialInviteToken);

  // Wechsel-Briefing (Matchday): aktuell angezeigtes Briefing oder null
  const [briefing, setBriefing] = useState(null);
  // Bestätigte Briefings pro Position (Rolle + Aufgaben), Key = position.id
  const [playerBriefings, setPlayerBriefings] = useState({});
  // Aufgaben-Overlay (Matchday + Vorbereitung): zeigt Icon/Kürzel der zugewiesenen Aufgabe pro Spieler
  const [showTaskOverlay, setShowTaskOverlay] = useState(false);
  // Referenz auf die MatchTimerBar, um Wechsel automatisch zu loggen
  const timerBarRef = useRef(null);

  // Hält die ID des Spielberichts, der ab dem ersten Ereignis im Matchday automatisch
  // angelegt wird, damit Ereignisse sofort einzeln gespeichert werden (Crash-Schutz).
  const [activeMatchReportId, setActiveMatchReportId] = useState(null);
  const matchReportCreationRef = useRef(null);


  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }
    fetchCurrentUser()
      .then((userData) => setUser(userData))
      .catch(() => {
      // Token ungültig/abgelaufen, request() in client.js übernimmt forceLogout() bereits
    })
    .finally(() => setIsCheckingAuth(false));
}, []);

  // TODO: loadClub() macht einen direkten fetch() statt über api/client.js zu laufen.
  // Dadurch profitiert dieser Call NICHT vom automatischen Token-Refresh.
  // Aktuell unkritisch (wird nur einmal beim Login aufgerufen), aber falls hier später
  // mehr direkte fetch()-Aufrufe entstehen, müssen die durch request() aus client.js ersetzt werden.
  useEffect(() => {
    if (user) {
      loadData();
      loadClub();
    }
  }, [user]);

  useEffect(() => {
  function handleAuthExpired() {
    setUser(null);
  }
  window.addEventListener('auth:expired', handleAuthExpired);
  return () => window.removeEventListener('auth:expired', handleAuthExpired);
}, []);

  async function refreshMatchReports() {
  const fresh = await fetchMatchReports();
  setMatchReports(fresh);
  }
  async function refreshPlayers() {
  const fresh = await fetchPlayers();
  setPlayers(fresh.filter((p) => p.is_active));
  }

  const selectedFormation = useMemo(
    () => formations.find((f) => f.id === selectedFormationId),
    [formations, selectedFormationId]
  );
  const selectedLineup = useMemo(
    () => lineups.find((l) => l.id === selectedLineupId),
    [lineups, selectedLineupId]
  );
  const currentPlayerForActivePosition = useMemo(() => {
    if (!activePosition) return null;
    return assignedSlots[activePosition.id]?.player_detail || null;
  }, [activePosition, assignedSlots]);
  const matchingPlayersForActivePosition = useMemo(() => {
    if (!activePosition) return [];
    return players
    .filter((p) => p.status !== "injured" && p.status !== "suspended")
    .filter((p) => playerMatchesPosition(p, activePosition.label));
  }, [activePosition, players]);
  const otherPlayersForActivePosition = useMemo(() => {
    if (!activePosition) return [];
    const matchingIds = new Set(matchingPlayersForActivePosition.map((p) => p.id));
    return players
    .filter((p) => p.status !== "injured" && p.status !== "suspended")
    .filter((p) => !matchingIds.has(p.id));
  }, [activePosition, matchingPlayersForActivePosition, players]);

  if (isCheckingAuth) {
    return (
      <main className="loading-screen">
        <div className="spinner" />
        <span>Sitzung wird geladen…</span>
      </main>
    );
  }

  if (!user) {
    if (authPage === "register") {
      return <Register onGoToLogin={() => setAuthPage("login")} />;
    }
    return (
      <Login
        onLoginSuccess={(userData) => setUser(userData)}
        onGoToRegister={() => setAuthPage("register")}
      />
    );
  }

  if (pendingInviteToken) {
    return (
      <InviteAccept
        token={pendingInviteToken}
        onDone={(acceptedClub) => {
          sessionStorage.removeItem(INVITE_TOKEN_STORAGE_KEY);
          window.history.replaceState(null, "", "/");
          if (acceptedClub) setClub(acceptedClub);
          setPendingInviteToken(null);
        }}
      />
    );
  }

  if (isLoading) return (
    <main className="loading-screen">
      <div className="spinner" />
      <span>Daten werden geladen…</span>
    </main>
  );

  if (clubLoaded && !club) {
    return <Onboarding user={user} onClubCreated={(c) => setClub(c)} />;
  }

  async function loadData() {
    try {
      setError("");
      setIsLoading(true);
      const [playersData, formationsData, lineupsData, reportsData] = await Promise.all([
        fetchPlayers(), fetchFormations(), fetchLineups(), fetchMatchReports(),
      ]);
      setPlayers(playersData.filter((p) => p.is_active));
      setFormations(formationsData);
      setLineups(lineupsData);
      setMatchReports(reportsData);
      const firstLineup = lineupsData[0];
      if (firstLineup) applyLineup(firstLineup);
      else if (formationsData[0]) setSelectedFormationId(formationsData[0].id);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadClub() {
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/clubs/', {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await res.json();
    setClub(data[0] || null);
    setClubLoaded(true);
  }

  function applyLineup(lineup) {
    setSelectedLineupId(lineup.id);
    setSelectedFormationId(lineup.formation);
    setAssignedSlots(mapSlotsByPosition(lineup.slots));
    setSubstitutes(lineup.substitutes || []);
    setNotes(lineup.general_notes || "");
    setLineupTitle(lineup.title || "MVP Testspiel");
    setOpponent(lineup.opponent || "Gegner noch nicht eingetragen");

    // Rolle/Aufgabe pro Spieler aus dem gespeicherten instruction-String zurückgewinnen,
    // damit das BriefingModal beim erneuten Öffnen eines Slots wieder vorausgewählt ist.
    const briefings = {};
    (lineup.slots || []).forEach((slot) => {
      const playerId = slot.player_detail?.id || slot.player;
      const parsed = parseInstructionText(slot.instruction);
      if (playerId && parsed) briefings[playerId] = parsed;
    });
    setPlayerBriefings(briefings);
  }

  function handleSelectFormation(formationId) {
    setSelectedFormationId(formationId);
    setSelectedLineupId(null);
    setAssignedSlots({});
    setSubstitutes([]);
    setNotes("");
    setInfo("Neue Formation gewählt.");
  }

  function handleSelectLineup(lineupId) {
    const lineup = lineups.find((item) => item.id === lineupId);
    if (lineup) applyLineup(lineup);
  }

  function handleAssignPlayerToActivePosition(player) {
    if (!activePosition || !player) return;
    setAssignedSlots((s) => {
      const cleaned = removePlayerFromField(player.id, s);
      return { ...cleaned, [activePosition.id]: { id: `local-${activePosition.id}`, position: activePosition.id, position_detail: activePosition, player: player.id, player_detail: player, instruction: "" } };
    });
    setSelectedPlayerId(player.id);
    setSubstitutes((s) => s.filter((sub) => (sub.player_detail?.id || sub.player || sub.id) !== player.id));
    setActivePosition(null);
  }

    // Gibt alle anderen Positionen zurück (für die Spielfeld-Anzeige im Briefing)
  function getNeighbors(position) {
    if (!selectedFormation) return [];
    return selectedFormation.positions
      .filter((p) => p.id !== position.id)
      .map((p) => {
        const player = assignedSlots[p.id]?.player_detail;
        return {
          label: p.label,
          x: p.x,
          y: p.y,
          number: player?.shirt_number,
          name: player?.name,
        };
      });
  }
  

  function isPlayerOnField(playerId) {
  return Object.values(assignedSlots).some((slot) => slot.player === playerId);
  }

  // Vorbereitung: öffnet das Rolle/Aufgabe-Modal nur bei echter Neuplatzierung
  // (Spieler kommt aus Liste/Bank UND der Ziel-Slot war vorher leer). Beim
  // Verschieben/Tauschen innerhalb der Aufstellung bleibt das Modal zu.
  function handlePreparationSelectPlayer(player) {
    const position = activePosition;
    if (!position || !player) return;

    const wasOnField = isPlayerOnField(player.id);
    const wasSlotEmpty = !assignedSlots[position.id];

    handleAssignPlayerToActivePosition(player);

    if (wasOnField || !wasSlotEmpty) return;

    setBriefing({
      position,
      player,
      playerName: `#${player.shirt_number ?? "?"} ${player.name}`,
      neighbors: getNeighbors(position),
      mode: "assign",
    });
  }

  // Vorbereitung: öffnet das Rolle/Aufgabe-Modal für einen bereits aufgestellten
  // Spieler zum Anpassen (Klick auf die Spielerkarte). Nicht in Matchday genutzt.
  function handleEditPlayerTask(position, player) {
    setBriefing({
      position,
      player,
      playerName: `#${player.shirt_number ?? "?"} ${player.name}`,
      neighbors: getNeighbors(position),
      mode: "assign",
    });
  }

  // Im Matchday: unterscheidet zwischen echtem Wechsel (Spieler kommt von der Bank)
  // und reinem Positionstausch (Spieler steht schon auf dem Feld) - nur ersteres
  // öffnet das Briefing-Modal und loggt ein Wechsel-Event.
  function handleAssignPlayerToActivePosition(player) {
    if (!activePosition || !player) return;

    // Wer stand vorher auf der Ziel-Position? Und stand der gewählte Spieler
    // selbst schon auf dem Feld (dann ist sourceSlotId gesetzt)?
    const displacedPlayer = assignedSlots[activePosition.id]?.player_detail || null;
    const sourceSlotId = Object.keys(assignedSlots).find(
      (slotId) => assignedSlots[slotId].player === player.id
    );
    const isSwap = !!(displacedPlayer && sourceSlotId && Number(sourceSlotId) !== activePosition.id);

    setAssignedSlots((s) => {
      const cleaned = removePlayerFromField(player.id, s);
      const updated = {
        ...cleaned,
        [activePosition.id]: {
          id: `local-${activePosition.id}`,
          position: activePosition.id,
          position_detail: activePosition,
          player: player.id,
          player_detail: player,
          instruction: "",
        },
      };
      // Echter Tausch: verdrängter Spieler bekommt die alte Position des gewählten Spielers
      if (isSwap) {
        updated[sourceSlotId] = {
          ...s[sourceSlotId],
          player: displacedPlayer.id,
          player_detail: displacedPlayer,
        };
    }
      return updated;
  });

  setSelectedPlayerId(player.id);

  setSubstitutes((s) => {
    const withoutNewPlayer = s.filter(
      (sub) => (sub.player_detail?.id || sub.player || sub.id) !== player.id
    );
    // Kam der neue Spieler von der Bank und hat jemanden vom Feld verdrängt?
    // Dann wandert der Verdrängte auf die Bank, statt zu verschwinden.
    if (displacedPlayer && !isSwap) {
      return [
        ...withoutNewPlayer,
        { id: `local-bench-${displacedPlayer.id}`, player: displacedPlayer.id, player_detail: displacedPlayer, note: "" },
      ];
    }
    return withoutNewPlayer;
  });

  setActivePosition(null);
}

  // Gibt alle anderen Positionen zurück (für die Spielfeld-Anzeige im Briefing)
function getNeighbors(position) {
  if (!selectedFormation) return [];
  return selectedFormation.positions
    .filter((p) => p.id !== position.id)
    .map((p) => {
      const player = assignedSlots[p.id]?.player_detail;
      return {
        label: p.label,
        x: p.x,
        y: p.y,
        number: player?.shirt_number,
        name: player?.name,
      };
    });
}

// Im Matchday: unterscheidet zwischen echtem Wechsel (Spieler kommt von der Bank)
// und reinem Positionstausch (Spieler steht schon auf dem Feld) - nur ersteres
// öffnet das Briefing-Modal und loggt ein Wechsel-Event.
function handleMatchdaySelectPlayer(player) {
  const position = activePosition;
  if (!position || !player) return;

  const wasOnField = isPlayerOnField(player.id);

  handleAssignPlayerToActivePosition(player);

  if (wasOnField) {
    // Reiner Positionstausch - kein Wechsel-Event, kein Briefing
    return;
  }

  const neighbors = getNeighbors(position);
  setBriefing({
    position,
    player,
    playerName: `#${player.shirt_number ?? "?"} ${player.name}`,
    neighbors,
  });

  if (timerBarRef.current) {
    timerBarRef.current.logWechsel(`${position.label}: ${player.name}`);
  }
}

  function handleClearPosition(positionId) {
    const removedPlayerId = assignedSlots[positionId]?.player_detail?.id || assignedSlots[positionId]?.player;
    setAssignedSlots((s) => { const n = { ...s }; delete n[positionId]; return n; });
    if (removedPlayerId != null) {
      setPlayerBriefings((s) => { const n = { ...s }; delete n[removedPlayerId]; return n; });
    }
  }

  function handleAddToBench(player) {
    if (isPlayerOnBench(player.id, substitutes)) return;
    setAssignedSlots((s) => removePlayerFromField(player.id, s));
    setSubstitutes((s) => [...s, { id: `local-bench-${player.id}`, player: player.id, player_detail: player, note: "" }]);
  }

  function handleRemoveFromBench(playerId) {
    setSubstitutes((s) => s.filter((sub) => (sub.player_detail?.id || sub.player || sub.id) !== playerId));
  }

  async function handleCreateLineup() {
    if (!selectedFormationId) return;
    try {
      setIsSaving(true);
      const payload = buildLineupPayload({ title: lineupTitle, opponent, formationId: selectedFormationId, assignedSlots, substitutes, generalNotes: notes, playerBriefings });
      const created = await createLineup(payload);
      const fresh = await fetchLineups();
      setLineups(fresh);
      applyLineup(created);
      setInfo("Aufstellung gespeichert.");
    } catch (e) { setError(e.message); } finally { setIsSaving(false); }
  }

  async function handleUpdateLineup() {
    if (!selectedLineupId || !selectedFormationId) return;
    try {
      setIsSaving(true);
      const payload = buildLineupPayload({ title: lineupTitle, opponent, formationId: selectedFormationId, assignedSlots, substitutes, generalNotes: notes, playerBriefings });
      const updated = await updateLineup(selectedLineupId, payload);
      const fresh = await fetchLineups();
      setLineups(fresh);
      applyLineup(updated);
      setInfo("Aufstellung aktualisiert.");
    } catch (e) { setError(e.message); } finally { setIsSaving(false); }
  }

  async function handleDeleteLineup() {
    if (!selectedLineupId) return;
    if (!window.confirm("Aufstellung löschen?")) return;
    try {
      setIsSaving(true);
      await deleteLineup(selectedLineupId);
      const fresh = await fetchLineups();
      setLineups(fresh);
      if (fresh[0]) applyLineup(fresh[0]);
      else { setSelectedLineupId(null); setAssignedSlots({}); setSubstitutes([]); setNotes(""); }
      setInfo("Aufstellung gelöscht.");
    } catch (e) { setError(e.message); } finally { setIsSaving(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout/", { method: "POST", credentials: "include" });
    setUser(null);
  }

  // Legt beim ersten Ereignis automatisch einen Spielbericht an (falls noch keiner existiert).
// Der Ref verhindert, dass bei zwei schnell aufeinanderfolgenden Ereignissen versehentlich
// zwei Berichte gleichzeitig erstellt werden.
async function ensureMatchReport() {
  if (activeMatchReportId) return activeMatchReportId;
  if (!matchReportCreationRef.current) {
    matchReportCreationRef.current = createMatchReport({
      lineup: selectedLineupId,
      opponent: opponent || "",
      result: "",
      notes: "",
    }).then((report) => {
      setActiveMatchReportId(report.id);
      return report.id;
    }).finally(() => {
      matchReportCreationRef.current = null;
    });
  }
  return matchReportCreationRef.current;
}

// Wird bei JEDEM Ereignis (Tor, Karte, Wechsel) sofort aufgerufen, statt erst am Spielende.
async function handleLogEvent(event) {
  if (!selectedLineupId) {
    setError("Keine Aufstellung ausgewählt – Ereignis konnte nicht gespeichert werden.");
    return;
  }
  try {
    const reportId = await ensureMatchReport();
    await createMatchEvent({
      match_report: reportId,
      minute: event.minute,
      event_type: event.type,
      for_us: event.for_us ?? true,
      card_type: event.card_type || "",
      description: event.label || "",
    });
  } catch (e) {
    setError("Ereignis konnte nicht gespeichert werden: " + e.message);
  }
}

  async function handleMatchEnd(events) {
  const hadReport = !!activeMatchReportId;
  if (hadReport) {
    try {
      await finalizeMatchReport(activeMatchReportId);
    } catch (e) {
      // Ergebnis konnte nicht automatisch gesetzt werden — kein harter Fehler
    }
  }
  setMatchEvents([]);
  setActiveMatchReportId(null);
  setInfo(
    hadReport
      ? "Spielbericht gespeichert – Ergebnis automatisch eingetragen."
      : "Keine Ereignisse erfasst, es wurde kein Bericht erstellt."
  );
  setCurrentPage("postmatch");
  await refreshMatchReports();
}
  const renderPage = () => {
    const toast = (
      <>
        {error && <div className="toast-overlay"><div className="toast-error">{error}</div></div>}
        {info  && <div className="toast-overlay"><div className="toast-info">{info}</div></div>}
      </>
    );

    switch (currentPage) {
      case "hub":
        return (
          <Layout user={user} club={club} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage}>
            <Hub
              user={user}
              players={players}
              reports={matchReports}
              onNavigate={setCurrentPage}
              onSelectPlayer={(id) => { setHubPlayerTarget(id); setCurrentPage("players"); }}
              onSelectReport={(id) => { setHubReportTarget(id); setCurrentPage("postmatch"); }}
           />
        </Layout>
        );
      case "postmatch":
        return (
          <main className="app-shell">
          <BackButton onClick={() => setCurrentPage("hub")} />
          <PostMatch matchEvents={matchEvents} initialReportId={hubReportTarget} onReportsChanged={refreshMatchReports} />
          </main>
      );
      case "players":
        return (
          <Layout user={user} club={club} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage}>
            <main className="app-shell">
              <BackButton onClick={() => setCurrentPage("hub")} />
              <PlayersPage initialPlayerId={hubPlayerTarget} onPlayersChanged={refreshPlayers} />
            </main>
          </Layout>
        );
      case "training":
        return (
          <Layout user={user} club={club} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage}>
            <TrainingsHub onBack={() => setCurrentPage("hub")} />
          </Layout>
        );
      case "verein":
        return (
          <Layout user={user} club={club} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage}>
            <main className="app-shell">
              <BackButton onClick={() => setCurrentPage("hub")} />
              <Verein club={club} />
            </main>
          </Layout>
        );
      case "preparation":
        return (
          <main className="app-shell page-fade-in">
            {toast}
            <BackButton onClick={() => setCurrentPage("hub")} />
            <Header title="Vorbereitung" selectedLineup={selectedLineup} user={user} onLogout={handleLogout} />
            <FormationSelector
              formations={formations}
              lineups={lineups}
              selectedFormationId={selectedFormationId}
              selectedLineupId={selectedLineupId}
              isSaving={isSaving}
              lineupTitle={lineupTitle}
              opponent={opponent}
              onLineupTitleChange={setLineupTitle}
              onOpponentChange={setOpponent}
              onSelectFormation={handleSelectFormation}
              onSelectLineup={handleSelectLineup}
              onCreateLineup={handleCreateLineup}
              onUpdateLineup={handleUpdateLineup}
              onDeleteLineup={handleDeleteLineup}
              showTaskOverlay={showTaskOverlay}
              onToggleTaskOverlay={() => setShowTaskOverlay((s) => !s)}
              exportButton={<LineupExportButton formation={selectedFormation} assignedSlots={assignedSlots} club={club} lineupTitle={lineupTitle} opponent={opponent} />}
            />
            <div className={`workspace ${isPlayerDrawerOpen ? "drawer-open" : "drawer-closed"} ${isBenchOpen ? "right-open" : "right-closed"}`}>
              <div className={mobileTab !== "spieler" ? "mobile-hidden" : ""}>
                <PlayerList players={players} selectedPlayerId={selectedPlayerId} isOpen={isPlayerDrawerOpen} assignedSlots={assignedSlots} substitutes={substitutes} onToggle={() => setIsPlayerDrawerOpen((s) => !s)} onSelectPlayer={setSelectedPlayerId} onAddToBench={handleAddToBench} onAddPlayer={() => setIsAddPlayerOpen(true)} />
              </div>
              <div className={mobileTab !== "feld" ? "mobile-hidden" : ""}>
                <Pitch formation={selectedFormation} assignedSlots={assignedSlots} onOpenPositionPicker={setActivePosition} onClearPosition={handleClearPosition} playerBriefings={playerBriefings} showTaskOverlay={showTaskOverlay} onEditTask={handleEditPlayerTask} />
              </div>
              <aside className={`side-stack ${mobileTab !== "bank" ? "mobile-hidden" : ""}`}>
                <Bench substitutes={substitutes} onRemoveFromBench={handleRemoveFromBench} isOpen={isBenchOpen} onToggle={() => setIsBenchOpen((s) => !s)} />
                <NotesPanel notes={notes} onChangeNotes={setNotes} />
              </aside>
            </div>
            <PositionPlayerPicker position={activePosition} currentPlayer={currentPlayerForActivePosition} matchingPlayers={matchingPlayersForActivePosition} otherPlayers={otherPlayersForActivePosition} onClose={() => setActivePosition(null)} onSelectPlayer={handlePreparationSelectPlayer} onClearPosition={(id) => { handleClearPosition(id); setActivePosition(null); }} />
            {isAddPlayerOpen && <AddPlayerModal onClose={() => setIsAddPlayerOpen(false)} onPlayerCreated={(p) => setPlayers((s) => [...s, p])} />}
            {briefing && (
              <BriefingModal
                position={briefing.position}
                playerName={briefing.playerName}
                neighbors={briefing.neighbors}
                title={briefing.mode === "assign" ? "Rolle & Aufgabe zuweisen" : undefined}
                confirmLabel={briefing.mode === "assign" ? "Übernehmen" : undefined}
                initialRoleKey={playerBriefings[briefing.player?.id]?.role}
                initialTaskKey={playerBriefings[briefing.player?.id]?.aufgaben?.[0]}
                onConfirm={(result) => {
                  setPlayerBriefings((s) => ({ ...s, [briefing.player.id]: result }));
                  setBriefing(null);
                }}
                onCancel={() => setBriefing(null)}
              />
            )}
          </main>
        );
      case "matchday":
        return (
          <main className="app-shell page-fade-in">
            {toast}
            <BackButton onClick={() => setCurrentPage("hub")} />
            <Header title="Matchday" selectedLineup={selectedLineup} user={user} onLogout={handleLogout} />
            <MatchTimerBar ref={timerBarRef} onEventsUpdate={(e) => setMatchEvents(e)} onMatchEnd={handleMatchEnd} onLogEvent={handleLogEvent} />
            <MatchdayFormationBar
              lineups={lineups} selectedLineupId={selectedLineupId} onSelectLineup={handleSelectLineup}
              showTaskOverlay={showTaskOverlay} onToggleTaskOverlay={() => setShowTaskOverlay((s) => !s)} />
            <div className={`workspace no-drawer ${isBenchOpen ? "right-open" : "right-closed"}`}>
              <div className={mobileTab !== "feld" ? "mobile-hidden" : ""}>
                <Pitch formation={selectedFormation} assignedSlots={assignedSlots} onOpenPositionPicker={setActivePosition} onClearPosition={handleClearPosition} playerBriefings={playerBriefings} showTaskOverlay={showTaskOverlay} />
              </div>
              <aside className={`side-stack ${mobileTab !== "bank" ? "mobile-hidden" : ""}`}>
                <Bench substitutes={substitutes} onRemoveFromBench={handleRemoveFromBench} isOpen={isBenchOpen} onToggle={() => setIsBenchOpen((s) => !s)} />
                <NotesPanel notes={notes} onChangeNotes={setNotes} />
              </aside>
            </div>
            <PositionPlayerPicker position={activePosition} currentPlayer={currentPlayerForActivePosition} matchingPlayers={matchingPlayersForActivePosition} otherPlayers={otherPlayersForActivePosition} onClose={() => setActivePosition(null)} onSelectPlayer={handleMatchdaySelectPlayer} onClearPosition={(id) => { handleClearPosition(id); setActivePosition(null); }} />
            {briefing && (
              <BriefingModal
                position={briefing.position}
                playerName={briefing.playerName}
                neighbors={briefing.neighbors}
                initialRoleKey={playerBriefings[briefing.player?.id]?.role}
                initialTaskKey={playerBriefings[briefing.player?.id]?.aufgaben?.[0]}
                onConfirm={(result) => {
                  setPlayerBriefings((s) => ({ ...s, [briefing.player.id]: result }));
                  setBriefing(null);
                }}
                onCancel={() => setBriefing(null)}
              />
            )}
          </main>
        );
      default:
        return (
          <Layout user={user} club={club} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage}>
            <Hub user={user} players={players} onNavigate={setCurrentPage} />
          </Layout>
        );
    }
  };

  return renderPage();
}