import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import socketService from "../services/socketService";
import DashBoardHeader from "../components/host-dashboard/DashBoardHeader";
import GameStatusCard from "../components/host-dashboard/GameStatusCard";
import PlayersTable from "../components/host-dashboard/PlayersTable";
import SettingsPanel from "../components/host-dashboard/SettingsPanel";
import KickPlayerModal from "../components/host-dashboard/KickPlayerModal";
import LoadingScreen from "../components/host-dashboard/LoadingScreen";
import ErrorScreen from "../components/host-dashboard/ErrorScreen";

const defaultRoomSettings = {
  name: "Coding Challenge 2025",
  maxPlayers: 4,
  minPlayersToStart: 1,
  gameDuration: 10,
};

export default function HostDashboard() {
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [kickReason, setKickReason] = useState("");
  const [showKickModal, setShowKickModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roomSettings, setRoomSettings] = useState(defaultRoomSettings);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  const toastedHandled = useRef(false);

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
      roomUpdated: (data) => {
        console.log("Room updated:", data.room);

        setRoom(data.room);
        setRoomSettings(getRoomSettings(data.room));
        setPlayers(data.room.players);
      },
      gameStarted: (data) => {
        setRoom(data.room);
        setPlayers(data.room.players);
      },
      gameEnded: (data) => {
        setRoom(data.room);
        setPlayers(data.room.players);
      },
      timeUpdate: (data) => {
        setTimeLeft(data.timeLeft);
      },
      scoresUpdated: (data) => {
        setPlayers(data.players);

        console.log("Scores updated:", data.players);
        if (data.score) {
          toast.success(`${data.playerName} has scored ${data.score} points!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
          });
        }
      },
      playersReset: (data) => {
        if (toastedHandled.current) return;
        toastedHandled.current = true;

        setPlayers(data.players);
        toast.info("All players have been reset.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          onClose: () => {
            toastedHandled.current = false;
          },
        });
      },
      settings_updated: (data) => {
        setRoomSettings(data.settings);
        setRoom(data.room);
      },
      playerKicked: (data) => {
        setPlayers(data.room.players);
        setShowKickModal(false);
      },
      scores_reset: (data) => {
        setPlayers(data.players);
      },
      error: (error) => {
        setLoadingError(error.message);
        setIsLoading(false);
      },
    });

    socketService.requestRoomDetails();
    socketService.requestLeaderboard();

    return () => {
      setIsLoading(false);
      socketService.clearHandlers();
      toastedHandled.current = false;
    };
  }, [isLoading]);

  const handleStartGame = () => {
    socketService.startGame();
  };

  const handleResetPlayers = () => {
    if (window.confirm("Are you sure you want to reset all players?")) {
      socketService.adminCommand("reset_players", {});
    }
  };

  const handleEditScore = (playerId, newScore) => {
    socketService.adminCommand("update_score", {
      playerId,
      score: newScore,
    });
  };

  const handleKickPlayer = (player) => {
    setSelectedPlayer(player);
    setShowKickModal(true);
  };

  const confirmKickPlayer = () => {
    if (selectedPlayer) {
      socketService.adminCommand("kick_player", {
        playerId: selectedPlayer.socketId,
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
    if (window.confirm("Are you sure you want to end the current game?")) {
      socketService.endGame();
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
      />

      <div className="container mx-auto px-4 py-4">
        <GameStatusCard
          room={room}
          players={players}
          roomSettings={roomSettings}
          timeLeft={timeLeft}
          onStartGame={handleStartGame}
          onEndGame={handleEndGame}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlayersTable
            players={players}
            onKickPlayer={handleKickPlayer}
            onResetPlayers={handleResetPlayers}
            onEditScore={handleEditScore}
            canResetPlayers={!room?.gameInProgress}
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

function getRoomSettings(room) {
  return {
    name: room.name,
    maxPlayers: room.maxPlayers,
    minPlayersToStart: room.minPlayersToStart,
    gameDuration: room.gameDuration,
  };
}
