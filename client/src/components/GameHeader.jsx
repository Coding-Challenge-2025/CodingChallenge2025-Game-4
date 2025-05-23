"use client";

import { useState } from "react";

export default function GameHeader({ timeLeft, playerScore, contestants }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
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
            <div className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {formatTime(timeLeft)}
            </div>

            <div className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-4"></path>
              </svg>
              {playerScore} P
            </div>

            <div className="relative">
              <button
                className={`px-4 py-2 ${
                  showLeaderboard
                    ? "bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600"
                } rounded-md flex items-center`}
                onClick={toggleLeaderboard}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-yellow-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 6l4-4 4 4"></path>
                  <path d="M12 2v10.3"></path>
                  <rect x="4" y="12" width="16" height="10" rx="2"></rect>
                  <path d="M8 16h.01"></path>
                  <path d="M12 16h.01"></path>
                  <path d="M16 16h.01"></path>
                </svg>
                Leaderboard
              </button>

              {showLeaderboard && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-900 rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="w-full grid grid-cols-12 rounded-t-md gap-1 bg-gray-800 p-2 font-medium text-xs">
                    <div className="col-span-2 text-center">RANK</div>
                    <div className="col-span-7 text-center">NAME</div>
                    <div className="col-span-3 text-center">SCORE</div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {contestants.map((contestant) => (
                      <div
                        className="w-full grid grid-cols-12 gap-1 p-2 hover:bg-gray-800 transition-colors text-sm border-t border-gray-800"
                        key={contestant.id}
                      >
                        <div className="col-span-2 text-center font-medium">
                          {contestant.rank === 1 ? (
                            <span className="text-yellow-400 flex justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path>
                                <path d="M5 20h14"></path>
                              </svg>
                            </span>
                          ) : (
                            contestant.rank
                          )}
                        </div>
                        <div className="col-span-7 text-center truncate">
                          {contestant.name}
                        </div>
                        <div className="col-span-3 text-center font-medium">
                          {contestant.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function formatTime(ms) {
  if (ms === undefined) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
