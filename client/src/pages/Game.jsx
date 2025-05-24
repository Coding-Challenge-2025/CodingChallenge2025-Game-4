import { useState, useEffect, useRef } from "react";
import GameHeader from "../components/GameHeader";
import CodeEditor from "../components/CodeEditor";
import GridComponent from "../components/GridComponent";
import socketService from "../services/socketService";
import { getCodeTemplate } from "../utils/code-template";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

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
  const [shapeResults, setShapeResults] = useState(new Map());
  const [similarity, setSimilarity] = useState(0);
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState("");

  // Add refs to track if events have been handled
  const gameEndedHandled = useRef(false);
  const kickedHandled = useRef(false);
  const toastedHandled = useRef(false);

  // For shape selection button
  const [shapeOptions, setShapeOptions] = useState([
    { id: 1, name: "Hình 1" },
    { id: 2, name: "Hình 2" },
    { id: 3, name: "Hình 3" },
    { id: 4, name: "Hình 4" },
  ]);

  // Load shape results from localStorage
  const loadShapeResultsFromStorage = () => {
    const storedResults = localStorage.getItem("shapeResults");
    if (storedResults) {
      try {
        const resultsObj = JSON.parse(storedResults);
        const resultsMap = new Map(Object.entries(resultsObj));
        setShapeResults(resultsMap);
        return resultsMap;
      } catch (error) {
        console.error("Failed to load shape results from localStorage:", error);
      }
    }
    return new Map();
  };

  // Save shape results to localStorage
  const saveShapeResultsToStorage = (resultsMap) => {
    try {
      const resultsObj = Object.fromEntries(resultsMap);
      localStorage.setItem("shapeResults", JSON.stringify(resultsObj));
    } catch (error) {
      console.error("Failed to save shape results to localStorage:", error);
    }
  };

  // Update result for a specific shape
  const updateShapeResult = (shapeId, passed, attempts = null) => {
    setShapeResults((prev) => {
      const newResults = new Map(prev);
      const currentResult = newResults.get(shapeId.toString()) || {
        passed: false,
        attempts: 0,
      };

      const updatedResult = {
        passed: passed || currentResult.passed, // Once passed, always passed
        attempts: attempts !== null ? attempts : currentResult.attempts + 1,
        lastAttempt: new Date().toISOString(),
      };

      newResults.set(shapeId.toString(), updatedResult);
      saveShapeResultsToStorage(newResults);
      return newResults;
    });
  };

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

  const baseURL =
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_PROD_BACKEND_HTTP
      : import.meta.env.VITE_BACKEND_HTTP ?? "http://localhost:3000";

  const getShapeById = async (id) => {
    console.log("Fetching shape with ID:", id);
    const response = await fetch(new URL(`/api/shape/${id}`, baseURL));
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
    // Load shape results on component mount
    loadShapeResultsFromStorage();

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
      scoreUpdated: (data) => {
        if (toastedHandled.current) return;
        toastedHandled.current = true;

        // console.log("Score updated:", data);
        toast.success(`Your gained ${data.score} points!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClose: () => {
            toastedHandled.current = false;
          },
        });
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
        toast.info("Scores have been reset!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

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
      toastedHandled.current = false;
    };
  }, [navigate]);

  // Update code template when language changes
  useEffect(() => {
    setCode(loadCodeFromStorage(language, challengeId));
    setOutputShape([]);
    setGameStatus("idle");
  }, [language, challengeId]);

  // Set first target shape
  useEffect(() => {
    const fetchInitialShape = async () => {
      try {
        const initialShape = await getShapeById(challengeId);
        setTargetShape(initialShape);
      } catch (error) {
        console.error("Failed to fetch initial shape:", error);
      }
    };
    fetchInitialShape();
  }, []);

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

  const submitPassedStatus = (score) => {
    socketService.submitPassedStatus(challengeId, score);
    console.log("Shape passed status submitted:", {
      shapeId: challengeId,
      passed: true,
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setGameStatus("running");
    setErrorDetails(""); // Clear previous error details

    const baseURL =
      import.meta.env.VITE_ENV === "production"
        ? import.meta.env.VITE_PROD_BACKEND_HTTP
        : import.meta.env.VITE_BACKEND_HTTP ?? "http://localhost:3000";

    try {
      const response = await fetch(
        new URL("/api/code/execute", baseURL),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetId: challengeId,
            language,
            code,
          }),
        }
      );

      const data = await response.json();
      console.log("Code execution response:", data);

      if (data.success && Array.isArray(data.output)) {
        setOutputShape(data.output);
        setSimilarity(data.similarity);

        // emit event to server
        socketService.submitSolution(challengeId, data.output);

        const isPassed = data.similarity === 100;
        if (isPassed) {
          setGameStatus("success");
          updateShapeResult(challengeId, true);
          submitPassedStatus(data.score);
        } else {
          setGameStatus("failed");
          updateShapeResult(challengeId, false);
        }
      } else {
        console.warn("Invalid output from server:", data.message);
        setGameStatus("error");
        updateShapeResult(challengeId, false);

        // Handle code compilation or execution errors
        if (data.details) {
          setErrorDetails(data.details);
          toast.error(`Code Error: ${data.details}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else if (data.message) {
          setErrorDetails(data.message);
          toast.error(`Execution failed: ${data.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          setErrorDetails("Unknown error occurred");
          toast.error(
            "Code execution failed. Please check your code and try again.",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }
      }
    } catch (error) {
      console.error("Code execution failed:", error);
      setGameStatus("error");
      updateShapeResult(challengeId, false);
    }

    setIsRunning(false);
  };

  // Generate a new target shape
  const newChallenge = async (nextId) => {
    saveCodeToStorage(language, challengeId, code);
    console.log("Next challenge ID:", nextId);
    setChallengeId(Number.parseInt(nextId));

    try {
      const newShape = await getShapeById(nextId);
      setTargetShape(newShape);
      setCode(loadCodeFromStorage(language, nextId));
    } catch (error) {
      console.error("Failed to fetch new shape:", error);
    }

    setOutputShape([]);
    setGameStatus("idle");
  };

  // Get current shape result
  const getCurrentShapeResult = () => {
    return (
      shapeResults.get(challengeId.toString()) || { passed: false, attempts: 0 }
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-1 container mx-auto p-2 flex flex-col">
        <ToastContainer />
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
                value={challengeId}
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

            {/* Shape Progress Overview */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Shape Progress</h3>
              <div className="grid grid-cols-2 gap-2">
                {shapeOptions.map((shape) => {
                  const result = shapeResults.get(shape.id.toString()) || {
                    passed: false,
                    attempts: 0,
                  };
                  return (
                    <div
                      key={shape.id}
                      className={`p-3 rounded-lg border-2 ${
                        result.passed
                          ? "border-green-500 bg-green-900/30"
                          : result.attempts > 0
                          ? "border-red-500 bg-red-900/30"
                          : "border-gray-600 bg-gray-700"
                      } ${
                        challengeId === shape.id ? "ring-2 ring-blue-400" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{shape.name}</span>
                        <div className="flex items-center space-x-2">
                          {result.passed ? (
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          ) : result.attempts > 0 ? (
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          ) : (
                            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {result.passed ? (
                          <span className="text-green-400">✓ Passed</span>
                        ) : result.attempts > 0 ? (
                          <span className="text-red-400">
                            ✗ Failed ({result.attempts} attempts)
                          </span>
                        ) : (
                          <span>Not attempted</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column - Voxel Displays */}
          <div className="lg:col-span-7 space-y-1 h-screen flex flex-col">
            {/* Results display - replaced progress bar */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold">Current Result:</div>
                  {gameStatus === "success" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="px-3 py-1 text-sm bg-green-600 rounded-md font-medium">
                        ✓ PASSED
                      </span>
                    </div>
                  )}
                  {gameStatus === "failed" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="px-3 py-1 text-sm bg-red-600 rounded-md font-medium">
                        ✗ FAILED
                      </span>
                    </div>
                  )}
                  {gameStatus === "error" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="px-3 py-1 text-sm bg-red-600 rounded-md font-medium">
                        ⚠ ERROR
                      </span>
                    </div>
                  )}
                  {gameStatus === "idle" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                      <span className="px-3 py-1 text-sm bg-gray-600 rounded-md font-medium">
                        Ready to test
                      </span>
                    </div>
                  )}
                  {gameStatus === "running" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="px-3 py-1 text-sm bg-blue-600 rounded-md font-medium">
                        Running...
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {getCurrentShapeResult().attempts > 0 && (
                      <span>Attempts: {getCurrentShapeResult().attempts}</span>
                    )}
                  </div>
                  {similarity > 0 && similarity < 100 && (
                    <div className="text-sm text-yellow-400">
                      Similarity: {similarity}%
                    </div>
                  )}
                </div>
              </div>

              {/* Error details display */}
              {gameStatus === "error" && errorDetails && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-500 rounded-lg">
                  <div className="text-sm font-medium text-red-400 mb-1">
                    Error Details:
                  </div>
                  <div className="text-sm text-red-300 font-mono whitespace-pre-wrap">
                    {errorDetails}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 grid-rows-2 gap-1 h-full bg-emerald-800">
              <div className="relative">
                <h2 className="text-xl text-black font-bold mb-3 absolute top-0 left-1 z-30">
                  Target Shape
                </h2>
                <div className="bg-gray-800 rounded-lg h-full overflow-hidden">
                  <GridComponent grid={targetShape} showPalette />
                </div>
              </div>

              <div className="relative">
                <h2 className="text-xl text-black font-bold mb-3 absolute top-0 left-1 z-30">
                  Your Output
                </h2>
                <div className="bg-gray-800 rounded-lg h-full overflow-hidden">
                  {outputShape.length > 0 ? (
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
