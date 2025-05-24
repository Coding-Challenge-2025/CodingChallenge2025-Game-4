"use client";
import { useState } from "react";

export default function PlayersTable({
  players,
  onKickPlayer,
  onResetScores,
  onEditScore,
}) {
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editedScore, setEditedScore] = useState("");

  const handleEditClick = (player) => {
    setEditingPlayerId(player.id);
    setEditedScore(player.score || "0");
  };

  const handleSaveScore = (player) => {
    const newScore = Number.parseInt(editedScore);
    if (!isNaN(newScore)) {
      onEditScore(player.userId, newScore);
      setEditingPlayerId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg lg:col-span-2">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Players & Leaderboard
          </h2>
          <button
            onClick={onResetScores}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6"></path>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Reset Scores
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-700 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 rounded-tl-md">Rank</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 rounded-tr-md">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {players
                .filter((player) => !player.isHost)
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((player, index) => (
                  <tr key={player.id} className="hover:bg-gray-700">
                    <td className="px-3 py-2">#{index + 1}</td>
                    <td className="px-3 py-2 flex items-center gap-1">
                      {player.username}
                    </td>
                    <td className="px-3 py-2">
                      {editingPlayerId === player.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editedScore}
                            onChange={(e) => setEditedScore(e.target.value)}
                            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveScore(player)}
                            className="p-1 bg-green-600 hover:bg-green-700 rounded"
                            title="Save"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
                            title="Cancel"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>{player.score || 0}</span>
                          <button
                            onClick={() => handleEditClick(player)}
                            className="p-1 bg-blue-600 hover:bg-blue-700 rounded opacity-70 hover:opacity-100"
                            title="Edit Score"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          player.status === "playing"
                            ? "bg-blue-900 text-blue-300"
                            : player.status === "submitted"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {player.status || "waiting"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onKickPlayer(player)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                          title="Kick Player"
                        >
                          Kick
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {players.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    No players have joined yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
