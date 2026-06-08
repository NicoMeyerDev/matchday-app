import { useEffect, useMemo, useState } from "react";
import { createLineup, deleteLineup, fetchFormations, fetchLineups, fetchPlayers, updateLineup } from "./api/client";
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

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState("login");

  // App state
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

  // ALLE Hooks vor jedem return
  useEffect(() => {
    if (user) loadData();
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

  // Auth guard — nach allen Hooks
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

  if (isLoading) return <main className="status-page">Lade Matchday-Daten...</main>;

  async function loadData() {
    try {
      setError("");
      setIsLoading(true);
      const [playersData, formationsData, lineupsData] = await Promise.all([
        fetchPlayers(),
        fetchFormations(),
        fetchLineups(),
      ]);
      setPlayers(playersData.filter((p) => p.is_active));
      setFormations(formationsData);
      setLineups(lineupsData);
      const firstLineup = lineupsData[0];
      if (firstLineup) {
        applyLineup(firstLineup);
      } else if (formationsData[0]) {
        setSelectedFormationId(formationsData[0].id);
      }
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
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
    setInfo("Neue Formation gewählt. Feld wurde geleert.");
  }

  function handleSelectLineup(lineupId) {
    const lineup = lineups.find((item) => item.id === lineupId);
    if (lineup) applyLineup(lineup);
  }

  function handleOpenPositionPicker(position) {
    setActivePosition(position);
  }

  function handleAssignPlayerToActivePosition(player) {
    if (!activePosition || !player) return;
    setAssignedSlots((currentSlots) => {
      const cleanedSlots = removePlayerFromField(player.id, currentSlots);
      return {
        ...cleanedSlots,
        [activePosition.id]: {
          id: `local-${activePosition.id}`,
          position: activePosition.id,
          position_detail: activePosition,
          player: player.id,
          player_detail: player,
          instruction: "",
        },
      };
    });
    setSelectedPlayerId(player.id);
    setSubstitutes((s) => s.filter((sub) => (sub.player_detail?.id || sub.player || sub.id) !== player.id));
    setActivePosition(null);
  }

  function handleClearPosition(positionId) {
    setAssignedSlots((currentSlots) => {
      const nextSlots = { ...currentSlots };
      delete nextSlots[positionId];
      return nextSlots;
    });
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
      setError("");
      const payload = buildLineupPayload({ title: lineupTitle, opponent, formationId: selectedFormationId, assignedSlots, substitutes, generalNotes: notes });
      const createdLineup = await createLineup(payload);
      const freshLineups = await fetchLineups();
      setLineups(freshLineups);
      applyLineup(createdLineup);
      setInfo("Aufstellung wurde gespeichert.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateLineup() {
    if (!selectedLineupId || !selectedFormationId) return;
    try {
      setIsSaving(true);
      setError("");
      const payload = buildLineupPayload({ title: lineupTitle, opponent, formationId: selectedFormationId, assignedSlots, substitutes, generalNotes: notes });
      const updatedLineup = await updateLineup(selectedLineupId, payload);
      const freshLineups = await fetchLineups();
      setLineups(freshLineups);
      applyLineup(updatedLineup);
      setInfo("Aufstellung wurde aktualisiert.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteLineup() {
    if (!selectedLineupId) return;
    const shouldDelete = window.confirm("Diese Aufstellung wirklich löschen?");
    if (!shouldDelete) return;
    try {
      setIsSaving(true);
      setError("");
      await deleteLineup(selectedLineupId);
      const freshLineups = await fetchLineups();
      setLineups(freshLineups);
      if (freshLineups[0]) {
        applyLineup(freshLineups[0]);
      } else {
        setSelectedLineupId(null);
        setAssignedSlots({});
        setSubstitutes([]);
        setNotes("");
      }
      setInfo("Aufstellung wurde gelöscht.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("http://localhost:8000/api/auth/logout/", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  return (
    <main className="app-shell">
      <Header selectedLineup={selectedLineup} user={user} onLogout={handleLogout} />

      {error && <div className="error-box">{error}</div>}
      {info && <div className="info-box">{info}</div>}

      <div className="mobile-tabs">
        <button className={`mobile-tab ${mobileTab === "feld" ? "active" : ""}`} onClick={() => setMobileTab("feld")}>Feld</button>
        <button className={`mobile-tab ${mobileTab === "spieler" ? "active" : ""}`} onClick={() => setMobileTab("spieler")}>Spieler</button>
        <button className={`mobile-tab ${mobileTab === "bank" ? "active" : ""}`} onClick={() => setMobileTab("bank")}>Bank</button>
      </div>

      <FormationSelector
        formations={formations}
        lineups={lineups}
        selectedFormationId={selectedFormationId}
        selectedLineupId={selectedLineupId}
        isSaving={isSaving}
        onSelectFormation={handleSelectFormation}
        onSelectLineup={handleSelectLineup}
        onCreateLineup={handleCreateLineup}
        onUpdateLineup={handleUpdateLineup}
        onDeleteLineup={handleDeleteLineup}
      />

      <div className={`workspace ${isPlayerDrawerOpen ? "drawer-open" : "drawer-closed"} ${isBenchOpen || isNotesOpen ? "right-open" : "right-closed"}`}>
        <div className={mobileTab !== "spieler" ? "mobile-hidden" : ""}>
          <PlayerList
            players={players}
            selectedPlayerId={selectedPlayerId}
            isOpen={isPlayerDrawerOpen}
            assignedSlots={assignedSlots}
            substitutes={substitutes}
            onToggle={() => setIsPlayerDrawerOpen((s) => !s)}
            onSelectPlayer={setSelectedPlayerId}
            onAddToBench={handleAddToBench}
            onAddPlayer={() => setIsAddPlayerOpen(true)}
          />
        </div>

        <div className={mobileTab !== "feld" ? "mobile-hidden" : ""}>
          <Pitch
            formation={selectedFormation}
            assignedSlots={assignedSlots}
            onOpenPositionPicker={handleOpenPositionPicker}
            onClearPosition={handleClearPosition}
          />
        </div>

        <aside className={`side-stack ${mobileTab !== "bank" ? "mobile-hidden" : ""}`}>
          <Bench
            substitutes={substitutes}
            onRemoveFromBench={handleRemoveFromBench}
            isOpen={isBenchOpen}
            onToggle={() => setIsBenchOpen((s) => !s)}
          />
          <NotesPanel
            notes={notes}
            onChangeNotes={setNotes}
            isOpen={isNotesOpen}
            onToggle={() => setIsNotesOpen((s) => !s)}
          />
        </aside>
      </div>

      <PositionPlayerPicker
        position={activePosition}
        currentPlayer={currentPlayerForActivePosition}
        matchingPlayers={matchingPlayersForActivePosition}
        otherPlayers={otherPlayersForActivePosition}
        onClose={() => setActivePosition(null)}
        onSelectPlayer={handleAssignPlayerToActivePosition}
        onClearPosition={(positionId) => { handleClearPosition(positionId); setActivePosition(null); }}
      />

      {isAddPlayerOpen && (
        <AddPlayerModal
          onClose={() => setIsAddPlayerOpen(false)}
          onPlayerCreated={(newPlayer) => setPlayers((current) => [...current, newPlayer])}
        />
      )}
    </main>
  );
}
