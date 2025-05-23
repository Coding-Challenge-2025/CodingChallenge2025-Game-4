"use client";

export default function GameStatusCard({
  room,
  players,
  roomSettings,
  timeLeft,
  playerScore,
  onStartGame,
  onEndGame,
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Status</span>
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                  room?.gameInProgress
                    ? "bg-green-900 text-green-300"
                    : "bg-yellow-900 text-yellow-300"
                }`}
              >
                {room?.gameInProgress ? "In Progress" : "Waiting"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Players</span>
              <span className="text-sm font-bold mt-1">
                {players.length - 1 > 0 ? players.length - 1 : 0} /{" "}
                {roomSettings.maxPlayers}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Room</span>
              <span className="text-sm font-bold mt-1">
                {roomSettings.name}
              </span>
            </div>
            {playerScore !== undefined && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Your Score</span>
                <span className="text-sm font-bold mt-1 text-blue-300">
                  {playerScore}%
                </span>
              </div>
            )}
            {room?.gameInProgress && timeLeft !== undefined && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Time Left</span>
                <span className="text-sm font-bold mt-1">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!room?.gameInProgress &&
              players.length > roomSettings.minPlayersToStart && (
                <button
                  onClick={onStartGame}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Start Game
                </button>
              )}
            {room?.gameInProgress && (
              <button
                onClick={onEndGame}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                End Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(ms) {
  if (ms === undefined) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
