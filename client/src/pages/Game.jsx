import { useState, useEffect, useRef } from "react";
import GameHeader from "../components/GameHeader";
import CodeEditor from "../components/CodeEditor";
import GridComponent from "../components/GridComponent";
import socketService from "../services/socketService";
import { getCodeTemplate } from "../utils/code-template";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [codeStore, setCodeStore] = useState(new Map());
  const [targetShape, setTargetShape] = useState([]);
  const [outputShape, setOutputShape] = useState([]);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState("idle");
  const [challengeId, setChallengeId] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  // Add refs to track if events have been handled
  const gameEndedHandled = useRef(false);
  const kickedHandled = useRef(false);

  // For shape selection button
  const [shapeOptions, setShapeOptions] = useState([
    { id: 1, name: "Hình 1" },
    { id: 2, name: "Hình 2" },
    { id: 3, name: "Hình 3" },
    { id: 4, name: "Hình 4" },
  ]);

  // Load code from localStorage based on language and challengeId
  const loadCodeFromStorage = (lang, id) => {
    console.log(`Loading ${lang} code of shape ${id}`);
    const key = `code_${lang}_${id}`;
    const storedCode = localStorage.getItem(key);
    return storedCode || getCodeTemplate(lang);
  };

  // Save code to localStorage and update codeStore
  const saveCodeToStorage = (lang, id, newCode) => {
    console.log(`Saving code of ${id} in ${lang} to localStorage:`);
    const key = `code_${lang}_${id}`;
    localStorage.setItem(key, newCode);
    setCodeStore((prev) => {
      const newStore = new Map(prev);
      newStore.set(`${lang}_${id}`, newCode);
      return newStore;
    });
  };

  const getShapeById = async (id) => {
    console.log("Fetching shape with ID:", id);
    const response = await fetch(
      new URL(`/api/shape/${id}`, import.meta.env.VITE_PROD_BACKEND_HTTP)
    );
    if (!response.ok) {
      throw new Error("Failed to fetch shape");
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to fetch shape");
    }

    const result = data.shape.matrix;
    console.log("Fetched shape:", result);
    return result;
  };

  // Load random target shape and code template based on language
  useEffect(() => {
    // Prevent page refresh during gameplay
    let alertShown = false;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to refresh? Your game progress may be disrupted.";
      return "Are you sure you want to refresh? Your game progress may be disrupted.";
    };

    const handleKeyDown = (event) => {
      if (
        (event.key === "F5" ||
          (event.ctrlKey && event.key === "r") ||
          (event.metaKey && event.key === "r")) &&
        !alertShown
      ) {
        event.preventDefault();
        alertShown = true;
        alert(
          'Refreshing is disabled during gameplay. Use the "Leave Game" button to exit safely.'
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);

    // Register socket handlers with duplicate prevention
    socketService.registerHandlers({
      kicked: (data) => {
        if (kickedHandled.current) return; // Prevent duplicate handling
        kickedHandled.current = true;

        console.log("You have been kicked:", data);
        alert("You have been kicked from the game. Reason: " + data.reason);
        socketService.disconnect();
        localStorage.removeItem("user");
        navigate("/");
      },
      playerKicked: (data) => {
        if (kickedHandled.current) return; // Prevent duplicate handling

        console.log("Player kicked:", data);
        setPlayers(data.players);
        alert("Annoucement: " + data.message);
      },
      gameEnded: (data) => {
        if (gameEndedHandled.current) return; // Prevent duplicate handling
        gameEndedHandled.current = true;

        console.log("Game ended:", data);
        alert("Game has ended by the host. Redirecting...");
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          navigate("/waiting-room", { state: { username: user.username } });
        } else {
          alert("You have been logged out. Please log in again.");
          localStorage.removeItem("user");
          navigate("/");
        }
      },
      roomUpdated: (data) => {
        console.log("Room updated:", data);

        // check if game is in progress
        if (data.room) {
          if (!data.room.gameInProgress) {
            navigate("/waiting-room", { state: { username: data.username } });
          }

          setPlayers(data.room.players);

          // Update the game status based on the room data
          const currentPlayer = JSON.parse(localStorage.getItem("user"));
          const player = data.room.players.find(
            (player) => player.username === currentPlayer.username
          );
          if (player) {
            setScore(player.score);
          }
        }
      },
      scoresUpdated: (data) => {
        const currentPlayer = JSON.parse(localStorage.getItem("user"));
        const player = data.players.find(
          (player) => player.username === currentPlayer.username
        );
        if (player) {
          setScore(player.score);
        }

        setPlayers(data.players);
      },
      scoresReset: (data) => {
        const currentPlayer = JSON.parse(localStorage.getItem("user"));
        const player = data.players.find(
          (player) => player.username === currentPlayer.username
        );
        if (player) {
          setScore(player.score);
        }
        alert("Scores have been reset by the host.");

        setPlayers(data.players);
      },

      timeUpdate: (data) => {
        setTimeLeft(data.timeLeft);
        // Handle time update logic here
      },
      error: (error) => {
        console.error("Socket error:", error);
        alert("An error occurred: " + error.message);
      },
    });

    socketService.requestRoomDetails();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      socketService.clearHandlers();
      gameEndedHandled.current = false;
      kickedHandled.current = false;
    };
  }, [navigate]);

  // Update code template when language changes
  useEffect(() => {
    setCode(loadCodeFromStorage(language, challengeId));
    setOutputShape([]);
    setScore(0);
    setGameStatus("idle");
  }, [language, challengeId]);

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage !== language) {
      const confirmChange = window.confirm(
        "Changing the language will reset your code. Do you want to continue?"
      );
      if (confirmChange) {
        setLanguage(newLanguage);
        setCode(loadCodeFromStorage(newLanguage, challengeId));
      }
    }
  };

  // useEffect(() => {
  //   if (code) {
  //     saveCodeToStorage(language, challengeId, code);
  //   }
  // }, [code, language, challengeId]);

  const runCode = async () => {
    setIsRunning(true);
    setGameStatus("running");

    try {
      const response = await fetch(
        new URL("/api/code/execute", import.meta.env.VITE_BACKEND_HTTP),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetId: 1, // adjust if needed
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (data.success && Array.isArray(data.output)) {
        setOutputShape(data.output);
        setScore(data.similarity); // assuming similarity is a number between 0–100

        if (data.similarity === 100) {
          setGameStatus("success");
        } else {
          setGameStatus("failed");
        }
      } else {
        console.warn("Invalid output from server:", data.message);
        setGameStatus("error");
      }
    } catch (error) {
      console.error("Code execution failed:", error);
      setGameStatus("error");
    }

    setIsRunning(false);
  };

  // Generate a new target shape
  const newChallenge = async (nextId) => {
    saveCodeToStorage(language, challengeId, code);
    console.log("Next challenge ID:", nextId);
    setChallengeId(nextId);

    try {
      const newShape = await getShapeById(nextId);
      setTargetShape(newShape); // ✅ set actual resolved value
      setCode(loadCodeFromStorage(language, nextId));
    } catch (error) {
      console.error("Failed to fetch new shape:", error);
    }

    setOutputShape([]);
    setScore(0);
    setGameStatus("idle");
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-1 container mx-auto p-2 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Code Editor */}
          <div className="lg:col-span-5 space-y-4">
            <GameHeader
              timeLeft={timeLeft}
              playerScore={score}
              contestants={convertPlayersToContestants(players)}
            />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Code Editor</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    language === "cpp" ? "bg-blue-600" : "bg-gray-700"
                  }`}
                  onClick={() => handleLanguageChange("cpp")}
                >
                  C++
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    language === "python" ? "bg-blue-600" : "bg-gray-700"
                  }`}
                  onClick={() => handleLanguageChange("python")}
                >
                  Python
                </button>
              </div>
            </div>

            <CodeEditor code={code} setCode={setCode} language={language} />

            <div className="grid grid-cols-3 space-x-3">
              <button
                className="col-span-2 flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium disabled:opacity-50 text-sm"
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning ? "Đang xử lý..." : "Chạy code"}
              </button>
              <select
                name="shape"
                id="shape"
                className="bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-sm p-1"
                onChange={(e) => {
                  newChallenge(e.target.value);
                }}
              >
                {shapeOptions.map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right column - Voxel Displays */}
          <div className="lg:col-span-7 space-y-1 h-screen flex flex-col">
            {/* Results bar - moved above the voxel displays */}
            <div className="bg-gray-800 p-1 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="font-bold">{score}%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        score === 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${score}` }}
                    ></div>
                  </div>
                </div>
                <div>
                  {gameStatus === "success" && (
                    <span className="px-3 py-1 text-sm bg-green-600 rounded-md">
                      Perfect Match!
                    </span>
                  )}
                  {gameStatus === "failed" && score > 0 && (
                    <span className="px-3 py-1 text-sm bg-yellow-600 rounded-md">
                      Close!
                    </span>
                  )}
                  {gameStatus === "failed" && score === 0 && (
                    <span className="px-3 py-1 text-sm bg-red-600 rounded-md">
                      Try Again
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 grid-rows-2 gap-1 h-full bg-emerald-800">
              <div className="relative">
                <h2 className="text-xl text-black font-bold mb-3 absolute top-0 left-1 z-30">
                  Target Shape
                </h2>
                <div className="bg-gray-800 rounded-lg h-full overflow-hidden">
                  {/* <VoxelRenderer shape={targetShape} /> */}
                  <GridComponent grid={targetShape} showPalette />
                </div>
              </div>

              <div className="relative">
                <h2 className="text-xl text-black font-bold mb-3 absolute top-0 left-1 z-30">
                  Your Output
                </h2>
                <div className="bg-gray-800 rounded-lg h-full overflow-hidden">
                  {outputShape.length > 0 ? (
                    // <VoxelRenderer shape={outputShape} />
                    <GridComponent grid={outputShape} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Chạy code để thấy kết quả
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function convertPlayersToContestants(players) {
  // Filter out players who are not currently playing
  const activePlayers = players.filter((p) => p.status === "playing");

  // Sort by score descending
  activePlayers.sort((a, b) => b.score - a.score);

  // Assign ranks (ties get same rank)
  let rank = 1;
  let previousScore = null;
  let skip = 0;

  const contestants = activePlayers.map((player, index) => {
    if (player.score !== previousScore) {
      rank = index + 1;
      rank += skip;
      skip = 0;
    } else {
      skip++;
    }

    previousScore = player.score;

    return {
      id: player.userId,
      name: player.username,
      score: player.score,
      rank: rank,
    };
  });

  return contestants;
}
