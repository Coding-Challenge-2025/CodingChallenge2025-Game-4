import { useState, useEffect } from "react";
import socketService from "../services/socketService";
import VoxelRenderer from "./VoxelRenderer";
import { Tab } from "@headlessui/react";

export default function HostDashboard({ onBack, onSwitchToGame }) {
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [currentShape, setCurrentShape] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [roundHistory, setRoundHistory] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [kickReason, setKickReason] = useState("");
  const [showKickModal, setShowKickModal] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    name: "VoxelCode Arena",
    maxPlayers: 20,
    roundDuration: 3,
    minPlayersToStart: 2,
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [systemMessage, setSystemMessage] = useState("");
  const [availableShapes, setAvailableShapes] = useState([1, 2, 3]);
  const [selectedShapeId, setSelectedShapeId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");

  useEffect(() => {
    console.log("Host dashboard mounted");

    // Register socket handlers for host dashboard
    socketService.registerHandlers({
      roomJoined: (data) => {
        console.log("Host dashboard received room joined event:", data);
        setRoom(data.room);
        setPlayers(data.room.players);
        setCurrentShape(data.room.currentShape || []);
        setIsLoading(false);
      },
      playerJoined: (data) => {
        setPlayers(data.room.players);
        setRoom(data.room);
      },
      playerLeft: (data) => {
        setPlayers(data.room.players);
        setRoom(data.room);
      },
      newHost: (data) => {
        // Update room with new host
        setRoom(data.room);
        setPlayers(data.room.players);
      },
      gameStarted: (data) => {
        setRoom(data.room);
        setCurrentShape(data.shape);
        // Add new round to history
        setRoundHistory((prev) => [
          ...prev,
          {
            round: data.room.currentRound,
            startTime: new Date(),
            shape: data.shape,
            players: data.room.players.map((p) => ({ ...p })),
          },
        ]);
      },
      scoresUpdated: (data) => {
        setPlayers(data.players);
        // Update leaderboard
        updateLeaderboard(data.players);
      },
      roundEnded: (data) => {
        setRoom((prev) => ({ ...prev, gameInProgress: false }));
        // Update round history
        setRoundHistory((prev) => {
          const updated = [...prev];
          const lastRound = updated[updated.length - 1];
          if (lastRound) {
            lastRound.endTime = new Date();
            lastRound.results = data.results;
          }
          return updated;
        });
      },
      newRoundStarted: (data) => {
        setRoom(data.room);
        setCurrentShape(data.shape);
        // Add new round to history
        setRoundHistory((prev) => [
          ...prev,
          {
            round: data.room.currentRound,
            startTime: new Date(),
            shape: data.shape,
            players: data.room.players.map((p) => ({ ...p })),
          },
        ]);
      },
      settings_updated: (data) => {
        setRoomSettings(data.settings);
        setRoom(data.room);
      },
      player_kicked: (data) => {
        // Remove player from list
        setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
      },
      scores_reset: (data) => {
        setPlayers(data.players);
        updateLeaderboard(data.players);
      },
      error: (error) => {
        console.error("Socket error:", error);
        setLoadingError(error.message);
        setIsLoading(false);
      },
      leaderboard_data: (data) => {
        setLeaderboard(data.leaderboard);
      },
      available_shapes: (data) => {
        setAvailableShapes(data.shapes);
      },
    });

    // Request initial data
    socketService.requestLeaderboard();
    socketService.requestAvailableShapes();

    return () => {
      console.log("Host dashboard unmounted");
      setIsLoading(false);
    };
  }, [isLoading, room]);

  // Update leaderboard when player scores change
  const updateLeaderboard = (players) => {
    const updatedLeaderboard = [...players]
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        username: player.username,
        score: player.score || 0,
        isHost: player.isHost,
      }));

    setLeaderboard(updatedLeaderboard);
  };

  const handleStartGame = () => {
    socketService.startGame();
  };

  const handleStartNewRound = () => {
    socketService.startNewRound();
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

  const handleSendSystemMessage = () => {
    if (systemMessage.trim()) {
      socketService.sendSystemMessage(systemMessage);
      setSystemMessage("");
    }
  };

  const handleSelectShape = (shapeId) => {
    setSelectedShapeId(shapeId);
    socketService.adminCommand("select_shape", { shapeId });
  };

  const handleEndCurrentRound = () => {
    if (
      window.confirm("Are you sure you want to end the current round early?")
    ) {
      socketService.adminCommand("end_round", {});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading host dashboard...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="mb-6 text-red-400">{loadingError}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
            >
              Sign Out
            </button>
            {onSwitchToGame && (
              <button
                onClick={onSwitchToGame}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Try Game View
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">H</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Host Dashboard</h1>
                <p className="text-sm text-gray-400">
                  VoxelCode Arena Management
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {/* Add button to switch to game view */}
              {onSwitchToGame && (
                <button
                  onClick={onSwitchToGame}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  View Game
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Room Status Overview */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-400">Room Status</h3>
              <p className="text-xl font-bold">
                {room?.gameInProgress ? (
                  <span className="text-green-500">In Progress</span>
                ) : (
                  <span className="text-yellow-500">Waiting</span>
                )}
              </p>
            </div>
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-400">
                Current Round
              </h3>
              <p className="text-xl font-bold">{room?.currentRound || 0}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-400">Players</h3>
              <p className="text-xl font-bold">
                {players.length} / {roomSettings.maxPlayers}
              </p>
            </div>
            <div className="bg-gray-700 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-400">Actions</h3>
              <div className="flex space-x-2 mt-1">
                {!room?.gameInProgress &&
                  players.length >= roomSettings.minPlayersToStart && (
                    <button
                      onClick={handleStartGame}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Start Game
                    </button>
                  )}
                {room?.gameInProgress && (
                  <button
                    onClick={handleEndCurrentRound}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    End Round
                  </button>
                )}
                {!room?.gameInProgress && room?.currentRound > 0 && (
                  <button
                    onClick={handleStartNewRound}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Next Round
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-800 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
              }
            >
              Players
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
              }
            >
              Game Management
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
              }
            >
              Leaderboard
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
              }
            >
              Settings
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Players Tab */}
            <Tab.Panel className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Player Management</h2>
                <button
                  onClick={handleResetScores}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                >
                  Reset All Scores
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 rounded-tl-md">Username</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Score</th>
                      <th className="px-4 py-2">Joined</th>
                      <th className="px-4 py-2 rounded-tr-md">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                player.status === "playing"
                                  ? "bg-blue-500"
                                  : player.status === "submitted"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }`}
                            ></span>
                            <span>
                              {player.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {player.status || "waiting"}
                        </td>
                        <td className="px-4 py-3">{player.score || 0}%</td>
                        <td className="px-4 py-3">
                          {new Date(
                            player.joinedAt || Date.now()
                          ).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3">
                          {!player.isHost && (
                            <button
                              onClick={() => handleKickPlayer(player)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                            >
                              Kick
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {players.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-3 text-center text-gray-400"
                        >
                          No players have joined yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>

            {/* Game Management Tab */}
            <Tab.Panel className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Game Management</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Shape */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Current Shape</h3>
                  <div className="bg-gray-700 p-4 rounded-lg h-80">
                    {currentShape && currentShape.length > 0 ? (
                      <VoxelRenderer shape={currentShape} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No shape selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Round Management */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Round Management</h3>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">
                        Select Shape for Next Round
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {availableShapes.map((shapeId) => (
                          <button
                            key={shapeId}
                            onClick={() => handleSelectShape(shapeId)}
                            className={`p-2 rounded ${
                              selectedShapeId === shapeId
                                ? "bg-blue-600"
                                : "bg-gray-600 hover:bg-gray-500"
                            }`}
                          >
                            Shape {shapeId}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">System Message</h4>
                      <div className="flex">
                        <input
                          type="text"
                          value={systemMessage}
                          onChange={(e) => setSystemMessage(e.target.value)}
                          placeholder="Enter system message..."
                          className="flex-1 bg-gray-800 border border-gray-600 rounded-l-md px-3 py-2"
                        />
                        <button
                          onClick={handleSendSystemMessage}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r-md"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Round History</h4>
                      <div className="max-h-40 overflow-y-auto">
                        {roundHistory.length > 0 ? (
                          <div className="space-y-2">
                            {roundHistory.map((round, index) => (
                              <div
                                key={index}
                                className="bg-gray-800 p-2 rounded text-sm"
                              >
                                <div className="flex justify-between">
                                  <span>Round {round.round}</span>
                                  <span>
                                    {round.endTime
                                      ? `Completed`
                                      : `In Progress`}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {round.startTime.toLocaleTimeString()}
                                  {round.endTime &&
                                    ` - ${round.endTime.toLocaleTimeString()}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center py-4">
                            No rounds played yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Leaderboard Tab */}
            <Tab.Panel className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Global Leaderboard</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 rounded-tl-md">Rank</th>
                      <th className="px-4 py-2">Username</th>
                      <th className="px-4 py-2 rounded-tr-md">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {leaderboard.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-3">#{entry.rank}</td>
                        <td className="px-4 py-3">
                          {entry.username} {entry.isHost && "(Host)"}
                        </td>
                        <td className="px-4 py-3 font-mono">{entry.score}%</td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-center text-gray-400"
                        >
                          No leaderboard data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>

            {/* Settings Tab */}
            <Tab.Panel className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Room Settings</h2>
                {isEditingSettings ? (
                  <div className="space-x-2">
                    <button
                      onClick={handleSaveSettings}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingSettings(false)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingSettings(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Room Name
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="text"
                        value={roomSettings.name}
                        onChange={(e) =>
                          setRoomSettings({
                            ...roomSettings,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                      />
                    ) : (
                      <div className="bg-gray-700 px-3 py-2 rounded-md">
                        {roomSettings.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Max Players
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="number"
                        min="2"
                        max="50"
                        value={roomSettings.maxPlayers}
                        onChange={(e) =>
                          setRoomSettings({
                            ...roomSettings,
                            maxPlayers: Number.parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                      />
                    ) : (
                      <div className="bg-gray-700 px-3 py-2 rounded-md">
                        {roomSettings.maxPlayers}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Round Duration (minutes)
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={roomSettings.roundDuration}
                        onChange={(e) =>
                          setRoomSettings({
                            ...roomSettings,
                            roundDuration: Number.parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                      />
                    ) : (
                      <div className="bg-gray-700 px-3 py-2 rounded-md">
                        {roomSettings.roundDuration}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Min Players to Start
                    </label>
                    {isEditingSettings ? (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={roomSettings.minPlayersToStart}
                        onChange={(e) =>
                          setRoomSettings({
                            ...roomSettings,
                            minPlayersToStart: Number.parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                      />
                    ) : (
                      <div className="bg-gray-700 px-3 py-2 rounded-md">
                        {roomSettings.minPlayersToStart}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Kick Player Modal */}
      {showKickModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Kick Player</h3>
            <p className="mb-4">
              Are you sure you want to kick{" "}
              <span className="font-bold">{selectedPlayer?.username}</span>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Reason (optional)
              </label>
              <input
                type="text"
                value={kickReason}
                onChange={(e) => setKickReason(e.target.value)}
                placeholder="Enter reason for kicking..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowKickModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmKickPlayer}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                Kick Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
