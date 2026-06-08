import { useEffect, useMemo, useState } from "react";
import { fetchFormations, fetchLineups, fetchPlayers } from "./api/client";
import Header from "./components/Header";
import FormationSelector from "./components/FormationSelector";
import PlayerList from "./components/PlayerList";
import Pitch from "./components/Pitch";
import Bench from "./components/Bench";
import NotesPanel from "./components/NotesPanel";
import { isPlayerOnBench, mapSlotsByPosition, removePlayerFromField } from "./utils/lineup";

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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Lädt die Startdaten aus dem Backend.
   * Wird genau einmal beim Öffnen der App ausgeführt.
   */
  useEffect(() => {
    async function loadData() {
      try {
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

    loadData();
  }, []);

  const selectedFormation = useMemo(
    () => formations.find((formation) => formation.id === selectedFormationId),
    [formations, selectedFormationId]
  );

  const selectedLineup = useMemo(
    () => lineups.find((lineup) => lineup.id === selectedLineupId),
    [lineups, selectedLineupId]
  );

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId),
    [players, selectedPlayerId]
  );

  /**
   * Übernimmt eine gespeicherte Aufstellung aus der API in den lokalen Frontend-Zustand.
   */
  function applyLineup(lineup) {
    setSelectedLineupId(lineup.id);
    setSelectedFormationId(lineup.formation);
    setAssignedSlots(mapSlotsByPosition(lineup.slots));
    setSubstitutes(lineup.substitutes || []);
    setNotes(lineup.general_notes || "");
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
  }

  /** Wählt eine gespeicherte Aufstellung aus und zeigt sie direkt auf dem Feld an. */
  function handleSelectLineup(lineupId) {
    const lineup = lineups.find((item) => item.id === lineupId);
    if (lineup) applyLineup(lineup);
  }

  /**
   * Setzt den ausgewählten Spieler auf eine Position.
   * Der Spieler wird vorher aus anderen Feldpositionen und von der Bank entfernt.
   */
  function handleAssignPlayer(position) {
    if (!selectedPlayer) return;

    setAssignedSlots((currentSlots) => {
      const cleanedSlots = removePlayerFromField(selectedPlayer.id, currentSlots);

      return {
        ...cleanedSlots,
        [position.id]: {
          id: `local-${position.id}`,
          position: position.id,
          position_detail: position,
          player: selectedPlayer.id,
          player_detail: selectedPlayer,
          instruction: "",
        },
      };
    });

    setSubstitutes((currentSubs) => currentSubs.filter((sub) => (sub.player_detail?.id || sub.id) !== selectedPlayer.id));
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
    setSubstitutes((currentSubs) => currentSubs.filter((sub) => (sub.player_detail?.id || sub.id) !== playerId));
  }

  if (isLoading) return <main className="status-page">Lade Matchday-Daten...</main>;

  return (
    <main className="app-shell">
      <Header selectedLineup={selectedLineup} />

      {error && <div className="error-box">{error}</div>}

      <FormationSelector
        formations={formations}
        lineups={lineups}
        selectedFormationId={selectedFormationId}
        selectedLineupId={selectedLineupId}
        onSelectFormation={handleSelectFormation}
        onSelectLineup={handleSelectLineup}
      />

      <div className="main-grid">
        <PlayerList
          players={players}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayer={setSelectedPlayerId}
          onAddToBench={handleAddToBench}
        />

        <Pitch
          formation={selectedFormation}
          assignedSlots={assignedSlots}
          selectedPlayer={selectedPlayer}
          onAssignPlayer={handleAssignPlayer}
          onClearPosition={handleClearPosition}
        />

        <aside className="side-stack">
          <Bench substitutes={substitutes} onRemoveFromBench={handleRemoveFromBench} />
          <NotesPanel notes={notes} onChangeNotes={setNotes} />
        </aside>
      </div>
    </main>
  );
}
