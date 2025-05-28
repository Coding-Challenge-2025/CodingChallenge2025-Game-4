import { spawn } from "child_process";
import fs from "fs/promises"; // Using promises API
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import { encriptMatrix, parseOutputToMatrix } from "./helperFunc.js";

const TEMP_DIR_PREFIX = "voxelcode";
const PYTHON_FILENAME = "code.py";
const DEFAULT_PYTHON_COMMAND = "py"; 
const DEFAULT_EXECUTION_TIMEOUT_MS = 5000; 

/**
 * Creates a temporary directory and Python file path.
 * @returns {Promise<{tempDir: string, pythonFilePath: string}>}
 */
async function createTemporaryPythonFileStructure() {
  const tempDir = path.join(os.tmpdir(), TEMP_DIR_PREFIX, uuidv4());
  await fs.mkdir(tempDir, { recursive: true });
  const pythonFilePath = path.join(tempDir, PYTHON_FILENAME);
  return { tempDir, pythonFilePath };
}

/**
 * Runs a Python script and captures its stdout/stderr.
 * @param {string} filePath - Path to the Python script.
 * @param {string} pythonCommand - The command to execute Python (e.g., 'python', 'py', 'python3').
 * @param {number} timeoutMs - Execution timeout in milliseconds.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function runPythonProcess(filePath, pythonCommand, timeoutMs) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonCommand, [filePath]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      pythonProcess.kill("SIGTERM"); // Send SIGTERM first
      // Wait a moment before rejecting, to allow stderr to be captured if process logs on kill
      setTimeout(() => reject(new Error("Python execution timed out")), 100);
    }, timeoutMs);

    pythonProcess.on("close", (code) => {
      clearTimeout(timeoutId);
      if (code !== 0) {
        resolve({
          stdout,
          stderr: stderr || `Python process exited with code ${code}`,
        });
      } else {
        resolve({ stdout, stderr });
      }
    });

    pythonProcess.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(
        new Error(`Python process failed to start or crashed: ${err.message}`)
      );
    });
  });
}

/**
 * Executes Python code, parses its output into a matrix, and applies XOR transformation.
 * @param {string} code - The Python code to execute.
 * @param {string} [pythonCommand=DEFAULT_PYTHON_COMMAND] - The Python interpreter command.
 * @param {number} [timeoutMs=DEFAULT_EXECUTION_TIMEOUT_MS] - Execution timeout in milliseconds.
 * @returns {Promise<{output: number[][], error: string, executionTime: number}>}
 */
const executePython = async (
  code,
  pythonCommand = DEFAULT_PYTHON_COMMAND,
  timeoutMs = DEFAULT_EXECUTION_TIMEOUT_MS
) => {
  let filePaths = null;
  try {
    filePaths = await createTemporaryPythonFileStructure();
    const { tempDir, pythonFilePath } = filePaths;

    await fs.writeFile(pythonFilePath, code);

    const startTime = Date.now();
    const result = await runPythonProcess(
      pythonFilePath,
      pythonCommand,
      timeoutMs
    );
    const executionTime = Date.now() - startTime;
    const matrix = parseOutputToMatrix(result.stdout);

    return {
      output: encriptMatrix(matrix),
      error: result.stderr.trim(), // Python script's stderr
      executionTime,
    };
  } catch (error) {
    throw new Error(`Python execution pipeline failed: ${error.message}`);
  } finally {
    if (filePaths && filePaths.tempDir) {
      try {
        await fs.rm(filePaths.tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error(
          "Error cleaning up temporary Python files:",
          cleanupError
        );
      }
    }
  }
};

export default {
  executePython,
};
