import { useState, useEffect } from "react";

const baseURL =
  import.meta.env.VITE_ENV === "production"
    ? import.meta.env.VITE_PROD_BACKEND_HTTP
    : import.meta.env.VITE_BACKEND_HTTP ?? "http://localhost:3000";

const Leaderboard = () => {
  const [visiblePlayers, setVisiblePlayers] = useState({
    player1: false,
    player2: false,
    player3: false,
    player4: false,
  });

  const [playersData, setPlayersData] = useState([]);

  useEffect(() => {
    const fetchPlayersData = async () => {
      try {
        const response = await fetch(
          new URL("/api/audience/leaderboard", baseURL)
        );

        console.log(
          "Fetching leaderboard data from:",
          new URL("/api/audience/leaderboard", baseURL).toString()
        );

        if (!response.ok) {
          console.error("Failed to fetch leaderboard data");
          return;
        }
        const data = await response.json();

        console.log("Fetched leaderboard data:", data);
        setPlayersData(data || []);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return;
      }
    };

    fetchPlayersData();

    const handleKeyPress = (event) => {
      const key = event.key;
      if (["1", "2", "3", "4"].includes(key)) {
        const playerKey = `player${key}`;
        setVisiblePlayers((prev) => ({
          ...prev,
          [playerKey]: !prev[playerKey],
        }));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const getPlayerColor = (id) => {
    switch (id) {
      case 0:
        return "bg-pink-100 border-4 border-pink-500 text-pink-500";
      case 1:
        return "bg-red-100 text-red-500";
      case 2:
        return "bg-orange-100 text-orange-500";
      case 3:
        return "bg-yellow-100 text-yellow-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 bg-[url('background.png')] bg-cover bg-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-yellow-600 mb-4">
          🎮 VOXEL CODE LEADERBOARD
        </h2>

        <div className="space-y-2">
          {playersData.map((player, id) => {
            const playerKey = `player${id + 1}`;
            const colorClasses = getPlayerColor(id);

            return (
              visiblePlayers[playerKey] && (
                <div
                  key={player.playerName}
                  className={`p-3 rounded-md flex items-center justify-between ${colorClasses}`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🎮</span>
                    <div>
                      <div className="font-semibold">{player.playerName}</div>
                    </div>
                  </div>
                  <div className="font-bold">{player.score} points</div>
                </div>
              )
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
