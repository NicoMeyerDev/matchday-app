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

/**
 * Hauptkomponente des Frontends.
 * Hier werden Daten geladen, der zentrale Zustand verwaltet und die Unterkomponenten verbunden.
 */
export default function App() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("feld");
  /**
   * Lädt die Startdaten aus dem Backend.
   * Wird genau einmal beim Öffnen der App ausgeführt.
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Lädt Spieler, Formationen und gespeicherte Aufstellungen parallel aus dem Backend.
   * Diese Funktion wird auch nach Speichern/Löschen erneut genutzt.
   */
  async function loadData() {
    try {
      setError("");
      const [playersData, formationsData, lineupsData] = await Promise.all([
        fetchPlayers(),
        fetchFormations(),
        fetchLineups(),
      ]);

      setPlayers(playersData.filter((player) => player.is_active));
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

  const selectedFormation = useMemo(
    () => formations.find((formation) => formation.id === selectedFormationId),
    [formations, selectedFormationId]
  );

  const selectedLineup = useMemo(
    () => lineups.find((lineup) => lineup.id === selectedLineupId),
    [lineups, selectedLineupId]
  );

  const currentPlayerForActivePosition = useMemo(() => {
    if (!activePosition) return null;
    return assignedSlots[activePosition.id]?.player_detail || null;
  }, [activePosition, assignedSlots]);

  const matchingPlayersForActivePosition = useMemo(() => {
    if (!activePosition) return [];
    return players.filter((player) => playerMatchesPosition(player, activePosition.label));
  }, [activePosition, players]);

  const otherPlayersForActivePosition = useMemo(() => {
    if (!activePosition) return [];
    const matchingIds = new Set(matchingPlayersForActivePosition.map((player) => player.id));
    return players.filter((player) => !matchingIds.has(player.id));
  }, [activePosition, matchingPlayersForActivePosition, players]);

  /**
   * Übernimmt eine gespeicherte Aufstellung aus der API in den lokalen Frontend-Zustand.
   */
  function applyLineup(lineup) {
    setSelectedLineupId(lineup.id);
    setSelectedFormationId(lineup.formation);
    setAssignedSlots(mapSlotsByPosition(lineup.slots));
    setSubstitutes(lineup.substitutes || []);
    setNotes(lineup.general_notes || "");
    setLineupTitle(lineup.title || "MVP Testspiel");
    setOpponent(lineup.opponent || "Gegner offen");
  }

  /**
   * Wechselt die Formation und leert bewusst die Feldzuordnung.
   * Dadurch entstehen keine alten Positionsreste aus einer anderen Formation.
   */
  function handleSelectFormation(formationId) {
    setSelectedFormationId(formationId);
    setSelectedLineupId(null);
    setAssignedSlots({});
    setSubstitutes([]);
    setNotes("");
    setInfo("Neue Formation gewählt. Feld wurde geleert.");
  }

  /** Wählt eine gespeicherte Aufstellung aus und zeigt sie direkt auf dem Feld an. */
  function handleSelectLineup(lineupId) {
    const lineup = lineups.find((item) => item.id === lineupId);
    if (lineup) applyLineup(lineup);
  }

  /**
   * Öffnet die Spielerauswahl für eine konkrete Position.
   * Diese Bedienung ist touchfreundlicher als Drag & Drop.
   */
  function handleOpenPositionPicker(position) {
    setActivePosition(position);
  }

  /**
   * Setzt einen Spieler auf die aktuell gewählte Position.
   * Der Spieler wird vorher aus anderen Feldpositionen und von der Bank entfernt.
   */
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
    setSubstitutes((currentSubs) => currentSubs.filter((sub) => (sub.player_detail?.id || sub.player || sub.id) !== player.id));
    setActivePosition(null);
  }

  /** Entfernt eine Position vom Feld. */
  function handleClearPosition(positionId) {
    setAssignedSlots((currentSlots) => {
      const nextSlots = { ...currentSlots };
      delete nextSlots[positionId];
      return nextSlots;
    });
  }

  /**
   * Fügt einen Spieler zur Bank hinzu.
   * Doppelte Einträge auf der Bank werden verhindert.
   */
  function handleAddToBench(player) {
    if (isPlayerOnBench(player.id, substitutes)) return;

    setAssignedSlots((currentSlots) => removePlayerFromField(player.id, currentSlots));
    setSubstitutes((currentSubs) => [
      ...currentSubs,
      {
        id: `local-bench-${player.id}`,
        player: player.id,
        player_detail: player,
        note: "",
      },
    ]);
  }

  /** Entfernt einen Spieler von der Bank. */
  function handleRemoveFromBench(playerId) {
    setSubstitutes((currentSubs) => currentSubs.filter((sub) => (sub.player_detail?.id || sub.player || sub.id) !== playerId));
  }

  /**
   * Speichert eine neue Aufstellung im Backend.
   * Falls dein Backend verschachtelte Slots noch nicht akzeptiert, zeigt diese Funktion einen API-Fehler an.
   */
  async function handleCreateLineup() {
    if (!selectedFormationId) return;

    try {
      setIsSaving(true);
      setError("");
      const payload = buildLineupPayload({
        title: lineupTitle,
        opponent,
        formationId: selectedFormationId,
        assignedSlots,
        substitutes,
        generalNotes: notes,
      });
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

  /**
   * Aktualisiert die aktuell geladene Aufstellung.
   * Dafür muss das Backend PATCH inklusive Slots/Substitutes sauber verarbeiten.
   */
  async function handleUpdateLineup() {
    if (!selectedLineupId || !selectedFormationId) return;

    try {
      setIsSaving(true);
      setError("");
      const payload = buildLineupPayload({
        title: lineupTitle,
        opponent,
        formationId: selectedFormationId,
        assignedSlots,
        substitutes,
        generalNotes: notes,
      });
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

  /**
   * Löscht die aktuell geladene Aufstellung aus dem Backend.
   * Nach dem Löschen wird auf die erste übrige Aufstellung oder eine leere Formation gewechselt.
   */
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

  if (isLoading) return <main className="status-page">Lade Matchday-Daten...</main>;

  return (
    <main className="app-shell">
      <Header selectedLineup={selectedLineup} />

      {error && <div className="error-box">{error}</div>}
      {info && <div className="info-box">{info}</div>}
<div className="mobile-tabs">
  <button
    className={`mobile-tab ${mobileTab === "feld" ? "active" : ""}`}
    onClick={() => setMobileTab("feld")}
  >
    Feld
  </button>
  <button
    className={`mobile-tab ${mobileTab === "spieler" ? "active" : ""}`}
    onClick={() => setMobileTab("spieler")}
  >
    Spieler
  </button>
  <button
    className={`mobile-tab ${mobileTab === "bank" ? "active" : ""}`}
    onClick={() => setMobileTab("bank")}
  >
    Bank
  </button>
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
      onToggle={() => setIsPlayerDrawerOpen((currentState) => !currentState)}
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
      onToggle={() => setIsBenchOpen((currentState) => !currentState)}
    />
    <NotesPanel
      notes={notes}
      onChangeNotes={setNotes}
      isOpen={isNotesOpen}
      onToggle={() => setIsNotesOpen((currentState) => !currentState)}
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
        onClearPosition={(positionId) => {
          handleClearPosition(positionId);
          setActivePosition(null);
        }}
      />
      {isAddPlayerOpen && (          // ← hier
      <AddPlayerModal
        onClose={() => setIsAddPlayerOpen(false)}
        onPlayerCreated={(newPlayer) => setPlayers((current) => [...current, newPlayer])}
      />
    )}
    </main>
  );
}
