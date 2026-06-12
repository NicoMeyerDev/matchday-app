import { useEffect, useMemo, useState } from "react";
import { createLineup, deleteLineup, fetchFormations, fetchLineups, fetchPlayers, updateLineup, fetchMatchReports } from "./api/client";
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
import MatchTimerBar from "./components/MatchTimerBar";
import MatchdayFormationBar from "./components/MatchdayFormationBar";

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
  const [opponent, setOpponent] = useState("Gegner offen");
  const [activePosition, setActivePosition] = useState(null);
  const [isPlayerDrawerOpen, setIsPlayerDrawerOpen] = useState(true);
  const [isBenchOpen, setIsBenchOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("feld");
  const [club, setClub] = useState(null);
  const [clubLoaded, setClubLoaded] = useState(false);
  const [matchReports, setMatchReports] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
      loadClub();
    }
  }, [user]);

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
    return players.filter((p) => playerMatchesPosition(p, activePosition.label));
  }, [activePosition, players]);
  const otherPlayersForActivePosition = useMemo(() => {
    if (!activePosition) return [];
    const matchingIds = new Set(matchingPlayersForActivePosition.map((p) => p.id));
    return players.filter((p) => !matchingIds.has(p.id));
  }, [activePosition, matchingPlayersForActivePosition, players]);

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

  if (isLoading) return <main style={{ color: "#fff", padding: 40, background: "#07070a", minHeight: "100vh" }}>Lade Daten...</main>;

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
    setOpponent(lineup.opponent || "Gegner offen");
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

  function handleClearPosition(positionId) {
    setAssignedSlots((s) => { const n = { ...s }; delete n[positionId]; return n; });
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
      const payload = buildLineupPayload({ title: lineupTitle, opponent, formationId: selectedFormationId, assignedSlots, substitutes, generalNotes: notes });
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
      const payload = buildLineupPayload({ title: lineupTitle, opponent, formationId: selectedFormationId, assignedSlots, substitutes, generalNotes: notes });
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
    await fetch("http://localhost:8000/api/auth/logout/", { method: "POST", credentials: "include" });
    setUser(null);
  }

  const renderPage = () => {
    switch (currentPage) {
      case "hub":
        return <Hub user={user} players={players} reports={matchReports} onNavigate={setCurrentPage} />;
      case "postmatch":
        return <PostMatch />;
      case "players":
        return <PlayersPage />;
      case "preparation":
        return (
          <main className="app-shell">
            <Header selectedLineup={selectedLineup} user={user} onLogout={handleLogout} />
            {error && <div className="error-box">{error}</div>}
            {info && <div className="info-box">{info}</div>}
            <FormationSelector formations={formations} lineups={lineups} selectedFormationId={selectedFormationId} selectedLineupId={selectedLineupId} isSaving={isSaving} lineupTitle={lineupTitle} opponent={opponent} onLineupTitleChange={setLineupTitle} onOpponentChange={setOpponent} onSelectFormation={handleSelectFormation} onSelectLineup={handleSelectLineup} onCreateLineup={handleCreateLineup} onUpdateLineup={handleUpdateLineup} onDeleteLineup={handleDeleteLineup} />
            <div className={`workspace ${isPlayerDrawerOpen ? "drawer-open" : "drawer-closed"} ${isBenchOpen || isNotesOpen ? "right-open" : "right-closed"}`}>
              <div className={mobileTab !== "spieler" ? "mobile-hidden" : ""}>
                <PlayerList players={players} selectedPlayerId={selectedPlayerId} isOpen={isPlayerDrawerOpen} assignedSlots={assignedSlots} substitutes={substitutes} onToggle={() => setIsPlayerDrawerOpen((s) => !s)} onSelectPlayer={setSelectedPlayerId} onAddToBench={handleAddToBench} onAddPlayer={() => setIsAddPlayerOpen(true)} />
              </div>
              <div className={mobileTab !== "feld" ? "mobile-hidden" : ""}>
                <Pitch formation={selectedFormation} assignedSlots={assignedSlots} onOpenPositionPicker={setActivePosition} onClearPosition={handleClearPosition} />
              </div>
              <aside className={`side-stack ${mobileTab !== "bank" ? "mobile-hidden" : ""}`}>
                <Bench substitutes={substitutes} onRemoveFromBench={handleRemoveFromBench} isOpen={isBenchOpen} onToggle={() => setIsBenchOpen((s) => !s)} />
                <NotesPanel notes={notes} onChangeNotes={setNotes} isOpen={isNotesOpen} onToggle={() => setIsNotesOpen((s) => !s)} />
              </aside>
            </div>
            <PositionPlayerPicker position={activePosition} currentPlayer={currentPlayerForActivePosition} matchingPlayers={matchingPlayersForActivePosition} otherPlayers={otherPlayersForActivePosition} onClose={() => setActivePosition(null)} onSelectPlayer={handleAssignPlayerToActivePosition} onClearPosition={(id) => { handleClearPosition(id); setActivePosition(null); }} />
            {isAddPlayerOpen && <AddPlayerModal onClose={() => setIsAddPlayerOpen(false)} onPlayerCreated={(p) => setPlayers((s) => [...s, p])} />}
          </main>
        );
      case "matchday":
        return (
          <main className="app-shell">
            <Header selectedLineup={selectedLineup} user={user} onLogout={handleLogout} />
            {error && <div className="error-box">{error}</div>}
            {info && <div className="info-box">{info}</div>}
            <MatchTimerBar onEventsUpdate={(e) => console.log(e)} />
            <MatchdayFormationBar
              lineups={lineups}selectedLineupId={selectedLineupId}onSelectLineup={handleSelectLineup}/>
            <div className={`workspace no-drawer ${isBenchOpen || isNotesOpen ? "right-open" : "right-closed"}`}>
              <div className={mobileTab !== "feld" ? "mobile-hidden" : ""}>
                <Pitch formation={selectedFormation} assignedSlots={assignedSlots} onOpenPositionPicker={setActivePosition} onClearPosition={handleClearPosition} />
              </div>
              <aside className={`side-stack ${mobileTab !== "bank" ? "mobile-hidden" : ""}`}>
                <Bench substitutes={substitutes} onRemoveFromBench={handleRemoveFromBench} isOpen={isBenchOpen} onToggle={() => setIsBenchOpen((s) => !s)} />
                <NotesPanel notes={notes} onChangeNotes={setNotes} isOpen={isNotesOpen} onToggle={() => setIsNotesOpen((s) => !s)} />
              </aside>
            </div>
            <PositionPlayerPicker position={activePosition} currentPlayer={currentPlayerForActivePosition} matchingPlayers={matchingPlayersForActivePosition} otherPlayers={otherPlayersForActivePosition} onClose={() => setActivePosition(null)} onSelectPlayer={handleAssignPlayerToActivePosition} onClearPosition={(id) => { handleClearPosition(id); setActivePosition(null); }} />
          </main>
        );
      default:
        return <Hub user={user} players={players} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout user={user} onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
