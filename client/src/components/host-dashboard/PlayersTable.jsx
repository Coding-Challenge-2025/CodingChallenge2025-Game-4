export default function PlayersTable({ players, onKickPlayer, onResetScores }) {
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
                      {index === 0 && players.length > 1 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-yellow-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
                        </svg>
                      )}
                    </td>
                    <td className="px-3 py-2">{player.score || 0}%</td>
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
                      <button
                        onClick={() => onKickPlayer(player)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        Kick
                      </button>
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
