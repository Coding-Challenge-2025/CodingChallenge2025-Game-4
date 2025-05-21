import { useState, useEffect } from "react";
import socketService from "../services/socketService";
import DashBoardHeader from "../components/host-dashboard/DashBoardHeader";
import GameStatusCard from "../components/host-dashboard/GameStatusCard";
import PlayersTable from "../components/host-dashboard/PlayersTable";
import SettingsPanel from "../components/host-dashboard/SettingsPanel";
import KickPlayerModal from "../components/host-dashboard/KickPlayerModal";
import LoadingScreen from "../components/host-dashboard/LoadingScreen";
import ErrorScreen from "../components/host-dashboard/ErrorScreen";

export default function HostDashboard() {
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [kickReason, setKickReason] = useState("");
  const [showKickModal, setShowKickModal] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    name: "VoxelCode Arena",
    maxPlayers: 4,
    roundDuration: 3,
    minPlayersToStart: 2,
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  useEffect(() => {
    socketService.registerHandlers({
      roomJoined: (data) => {
        setRoom(data.room);
        setPlayers(data.room.players);
        setIsLoading(false);
      },
      playerJoined: (data) => {
        setPlayers(data.room.players);
        setRoom(data.room);
      },
      playerDisconnected: (data) => {
        setPlayers(data.room.players);
        setRoom(data.room);
      },
      gameStarted: (data) => {
        setRoom(data.room);
        setPlayers(data.room.players);
      },
      gameEnded: (data) => {
        setRoom(data.room);
        setPlayers(data.room.players);
      },
      scoresUpdated: (data) => {
        setPlayers(data.players);
      },
      settings_updated: (data) => {
        setRoomSettings(data.settings);
        setRoom(data.room);
      },
      playerKicked: (data) => {
        setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
      },
      scores_reset: (data) => {
        setPlayers(data.players);
      },
      error: (error) => {
        setLoadingError(error.message);
        setIsLoading(false);
      },
    });

    // socketService.requestRoomDetails();
    socketService.requestLeaderboard();
    socketService.requestAvailableShapes();

    return () => {
      setIsLoading(false);
      socketService.clearHandlers();
    };
  }, [isLoading, room]);

  const handleStartGame = () => {
    socketService.startGame();
  };

  const handleResetScores = () => {
    if (window.confirm("Are you sure you want to reset all player scores?")) {
      socketService.adminCommand("reset_scores", {});
    }
  };

  const handleKickPlayer = (player) => {
    setSelectedPlayer(player);
    setShowKickModal(true);
  };

  const confirmKickPlayer = () => {
    if (selectedPlayer) {
      socketService.adminCommand("kick_player", {
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.username,
        reason: kickReason || "Kicked by host",
      });
      setShowKickModal(false);
      setSelectedPlayer(null);
      setKickReason("");
    }
  };

  const handleSaveSettings = () => {
    socketService.adminCommand("change_settings", {
      settings: roomSettings,
    });
    setIsEditingSettings(false);
  };

  const handleEndGame = () => {
    if (
      window.confirm("Are you sure you want to end the current game?")
    ) {
      socketService.adminCommand("end_game", {});
    }
  };

  const logOut = () => {
    localStorage.removeItem("user");

    socketService.disconnect();
    window.location.href = "/";
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (loadingError) {
    return <ErrorScreen error={loadingError} onLogOut={logOut} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashBoardHeader onLogOut={logOut} />

      <div className="container mx-auto px-4 py-4">
        <GameStatusCard
          room={room}
          players={players}
          roomSettings={roomSettings}
          onStartGame={handleStartGame}
          onEndGame={handleEndGame}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlayersTable
            players={players}
            onKickPlayer={handleKickPlayer}
            onResetScores={handleResetScores}
          />

          <SettingsPanel
            roomSettings={roomSettings}
            setRoomSettings={setRoomSettings}
            isEditingSettings={isEditingSettings}
            setIsEditingSettings={setIsEditingSettings}
            onSaveSettings={handleSaveSettings}
          />
        </div>
      </div>

      {showKickModal && (
        <KickPlayerModal
          player={selectedPlayer}
          reason={kickReason}
          setReason={setKickReason}
          onConfirm={confirmKickPlayer}
          onCancel={() => setShowKickModal(false)}
        />
      )}
    </div>
  );
}
