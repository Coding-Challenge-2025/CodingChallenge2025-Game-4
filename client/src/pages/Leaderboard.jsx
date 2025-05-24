import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

const Leaderboard = () => {
  const [visiblePlayers, setVisiblePlayers] = useState({
    player2: false,
    player4: false,
    player1: false,
    player3: false,
  });

  const playersData = [
    { name: "NHMinh", points: 22135, key: "1" },
    { name: "NCChuong", points: 21340, key: "2" },
    { name: "HDVu", points: 16952, key: "3" },
    { name: "NHMTam", points: 12890, key: "4" },
  ];

  useEffect(() => {
    const handleKeyPress = (event) => {
      const playerKey = event.key;
      if (playersData.some((player) => player.key === playerKey)) {
        setVisiblePlayers((prev) => ({
          ...prev,
          [playerKey === "1"
            ? "player1"
            : playerKey === "2"
            ? "player2"
            : playerKey === "3"
            ? "player3"
            : "player4"]:
            !prev[
              playerKey === "1"
                ? "player1"
                : playerKey === "2"
                ? "player2"
                : playerKey === "3"
                ? "player3"
                : "player4"
            ],
        }));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const rowVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4 bg-[url('background.png')] bg-cover bg-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-yellow-600 mb-4 flex items-center justify-center">
          <span className="mr-2"></span>VOXEL CODE LEADERBOARD{" "}
          <span className="ml-2"></span>
        </h2>
        <div className="space-y-2">
          <AnimatePresence>
            {playersData.map(
              (player) =>
                visiblePlayers[
                  player.key === "1"
                    ? "player1"
                    : player.key === "2"
                    ? "player2"
                    : player.key === "3"
                    ? "player3"
                    : "player4"
                ] && (
                  <motion.div
                    key={player.key}
                    className={`p-3 rounded-md flex items-center justify-between ${
                      player.key === "2"
                        ? "bg-red-100"
                        : player.key === "4"
                        ? "bg-yellow-100"
                        : player.key === "1"
                        ? "bg-pink-100 border-4 border-pink-500"
                        : "bg-orange-100"
                    }`}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={rowVariants}
                  >
                    <div className="flex items-center">
                      <span
                        className={`text-2xl mr-2 ${
                          player.key === "2"
                            ? "text-red-500"
                            : player.key === "4"
                            ? "text-yellow-500"
                            : player.key === "1"
                            ? "text-pink-500"
                            : "text-orange-500"
                        }`}
                      >
                        🎮
                      </span>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        {/* <div className="text-sm text-gray-600">
                          Level {player.level} Lines: {player.lines}
                        </div> */}
                      </div>
                    </div>
                    <div className="font-bold">{player.points} points</div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-center">
          <h3 className="font-semibold text-blue-600">Controls</h3>
          <div className="text-sm text-gray-700">
            Player 1st: 1
            <br />
            Player 2nd: 2
            <br />
            Player 3rd: 3
            <br />
            Player 4th: 4
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
