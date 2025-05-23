import { useState } from "react";
import { Menubar } from "radix-ui";

export default function GameHeader({ timeLeft, playerScore }) {
  const [contestants, setContestants] = useState([]);

  const getContestants = async () => {
    try {
      setContestants([
        { id: 1, name: "Player 1", score: 15, rank: 1 },
        { id: 2, name: "Player 2", score: 12, rank: 2 },
        { id: 3, name: "Player 3", score: 10, rank: 3 },
        { id: 4, name: "Player 4", score: 8, rank: 4 },
        { id: 5, name: "Player 5", score: 8, rank: 4 },
      ]);
    } catch (error) {
      console.error("Error fetching contestants:", error);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center md-4 md:mb-0">
            <div className="mr-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">VoxelCode</h1>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md">
              {formatTime(timeLeft)}
            </div>

            <div className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md">
              Score: {playerScore}
            </div> 


            <Menubar.Root>
              <Menubar.Menu>
                <Menubar.Trigger>
                  <div
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
                    onClick={getContestants}
                  >
                    Leaderboard
                  </div>
                </Menubar.Trigger>
                <Menubar.Portal>
                  <Menubar.Content>
                    <Menubar.Label />
                    <Menubar.Item>
                      <div className="w-72 h-max bg-gray-900 rounded-md p-1 text-white z-40">
                        <div className="w-full grid grid-cols-12 rounded-md gap-1 bg-gray-800">
                          <div className="col-span-2 text-center">Rank</div>
                          <div className="col-span-7 text-center">Name</div>
                          <div className="col-span-3 text-center">Point</div>
                        </div>

                        {contestants.map((contestant) => (
                          <div
                            className="w-full grid grid-cols-12 gap-1"
                            key={contestant.id}
                          >
                            <div className="col-span-2 text-center">
                              {contestant.rank}
                            </div>
                            <div className="col-span-7 text-center">
                              {contestant.name}
                            </div>
                            <div className="col-span-3 text-center">
                              {contestant.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Menubar.Item>
                  </Menubar.Content>
                </Menubar.Portal>
              </Menubar.Menu>
            </Menubar.Root>
          </div>
        </div>
      </div>
    </header>
  );
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
