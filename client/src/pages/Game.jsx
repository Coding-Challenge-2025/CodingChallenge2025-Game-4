import { useState, useEffect } from "react";
import VoxelRenderer from "../components/VoxelRenderer";
import GameHeader from "../components/GameHeader";
import CodeEditor from "../components/CodeEditor";
import { getCodeTemplate } from "../utils/code-template";
import GridComponent from "../components/GridComponent";
import "./../App.css";

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
  const [submittable, setSubmittable] = useState(false);

  // For shape selection button
  const [shapeOptions, setShapeOptions] = useState([
    { id: 1, name: "Shape 1" },
    { id: 2, name: "Shape 2" },
    { id: 3, name: "Shape 3" },
    { id: 4, name: "Shape 4" },
  ]);

  const getShapeById = async (id) => {
    console.log("Fetching shape with ID:", import.meta.env.VITE_PROD_BACKEND_HTTP);
    const response = await fetch(new URL(`/api/shape/${id}`, import.meta.env.VITE_PROD_BACKEND_HTTP));
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
    // Immediately Invoked Async Function Expression (IIFE)
    (async () => {
      try {
        const shape = await getShapeById(challengeId); // ✅ await the shape
        setTargetShape(shape);
      } catch (error) {
        console.error("Failed to fetch initial shape:", error);
      }
    })();

    setCode(getCodeTemplate(language));
  }, []);

  // Update code template when language changes
  useEffect(() => {
    setCode(getCodeTemplate(language));
    setOutputShape([]);
    setScore(0);
    setGameStatus("idle");
    setSubmittable(false);
  }, [language]);

  useEffect(() => {
    const stored = localStorage.getItem("codeStore");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCodeStore(parsed);

      const initialCode = parsed?.[language]?.[shapeId] || "";
      setCode(initialCode);
    }
  }, [language]);

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage !== language) {
      const confirmChange = window.confirm(
        "Changing the language will reset your code. Do you want to continue?"
      );
      if (confirmChange) {
        setLanguage(newLanguage);
      }
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setGameStatus("running");

    try {
      const response = await fetch(new URL("/api/code/execute", import.meta.env.VITE_PROD_BACKEND_HTTP), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId: 1, // adjust if needed
          language,
          code,
        }),
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.output)) {
        setOutputShape(data.output);
        setScore(data.similarity); // assuming similarity is a number between 0–100

        if (data.similarity === 100) {
          setGameStatus("success");
          setSubmittable(true);
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
  const newChallenge = async () => {
    const nextId = challengeId === 4 ? 1 : challengeId + 1;
    setChallengeId(nextId);

    try {
      const newShape = await getShapeById(nextId); // ✅ await the Promise
      setTargetShape(newShape); // ✅ set actual resolved value
    } catch (error) {
      console.error("Failed to fetch new shape:", error);
    }

    setOutputShape([]);
    setScore(0);
    setGameStatus("idle");
  };

  // return (<GridComponent/>);

  return (
    <main className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-1 container mx-auto p-2 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Code Editor */}
          <div className="lg:col-span-5 space-y-4">
            <GameHeader submittable={submittable} />
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
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <select
                name="shape"
                id="shape"
                className="bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-sm"
                onChange={(e) => {
                  setChallengeId(e.target.value);
                  newChallenge();
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
                      style={{ width: `${score}%` }}
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
                      Run your code to see output
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
