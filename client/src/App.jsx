import "./App.css";
import { useState, useEffect } from "react";
import VoxelRenderer from "./components/VoxelRenderer";
import GameHeader from "./components/GameHeader";
import CodeEditor from "./components/CodeEditor";
import { generateTargetShape } from "./utils/shape-generator";
import { getCodeTemplate } from "./utils/code-template";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [targetShape, setTargetShape] = useState([]);
  const [outputShape, setOutputShape] = useState([]);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState("idle");

  // Load random target shape and code template based on language
  useEffect(() => {
    const shape = generateTargetShape();
    setTargetShape(shape);
    setCode(getCodeTemplate(language));
  }, []);

  // Update code template when language changes
  useEffect(() => {
    setCode(getCodeTemplate(language));
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

    setTimeout(() => {
      try {
        const simulatedOutput = simulateCodeExecution(code, language);
        setOutputShape(simulatedOutput);

        // Compare and calculate score
        const calculatedScore = calculateScore(targetShape, simulatedOutput);
        setScore(calculatedScore);

        setGameStatus(calculatedScore === 100 ? "success" : "failed");
        setIsRunning(false);
      } catch (error) {
        console.error("Error executing code:", error);
        setGameStatus("error");
        setIsRunning(false);
      }
    }, 1500);
  };

  // Simulate code execution (placeholder for actual execution)
  const simulateCodeExecution = (code, language) => {
    // In a real implementation, this would execute the code or send it to a backend
    // For this demo, we'll return a simplified shape based on the example code
    if (code.includes("grid[3][3] = 1") && code.includes("grid[3][4] = 2")) {
      // If the example code is present, return a shape similar to it
      return [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 3, 4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];
    } else {
      // Return a random shape if the example code is not present
      return generateTargetShape();
    }
  };

  // Calculate score by comparing shapes
  const calculateScore = (target, output) => {
    // In a real implementation, this would do a detailed comparison
    // For this demo, we'll return a random score
    return Math.floor(Math.random() * 101);
  };

  // Generate a new target shape
  const newChallenge = () => {
    const shape = generateTargetShape();
    setTargetShape(shape);
    setOutputShape([]);
    setScore(0);
    setGameStatus("idle");
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <GameHeader />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Code Editor */}
          <div className="lg:col-span-5 space-y-4">
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

            <div className="flex space-x-3">
              <button
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium disabled:opacity-50 text-sm"
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <button
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-sm"
                onClick={newChallenge}
              >
                New Challenge
              </button>
            </div>
          </div>

          {/* Right column - Voxel Displays */}
          <div className="lg:col-span-7 space-y-4">
            {/* Results bar - moved above the voxel displays */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold">{score}%</div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-3">Target Shape</h2>
                <div className="bg-gray-800 p-4 rounded-lg h-80">
                  <VoxelRenderer shape={targetShape} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Your Output</h2>
                <div className="bg-gray-800 p-4 rounded-lg h-80">
                  {outputShape.length > 0 ? (
                    <VoxelRenderer shape={outputShape} />
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

export default App;
