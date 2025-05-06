import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

/**
 * Execute Python code and return the result
 * @param {string} code - Python code to execute
 * @returns {Promise<Object>} Result object with shape and output
 */
const executePython = async (code) => {
  // Create a temporary directory for code execution
  const tempDir = path.join(os.tmpdir(), "voxelcode", uuidv4());
  fs.mkdirSync(tempDir, { recursive: true });

  // Create a temporary Python file
  const pythonFile = path.join(tempDir, "code.py");

  try {
    // Wrap the user code to capture the output
    const wrappedCode = code;
    fs.writeFileSync(pythonFile, wrappedCode);

    // Execute the Python code
    const startTime = Date.now();
    const result = await runPythonProcess(pythonFile);
    const executionTime = Date.now() - startTime;

    // Parse the output to get the shape
    const shape = parsePythonOutput(result.stdout);

    return {
      shape,
      output: result.stdout,
      error: result.stderr,
      executionTime,
    };
  } catch (error) {
    console.error("Python execution error:", error);
    throw error;
  } finally {
    // Clean up temporary files
    try {
      fs.unlinkSync(pythonFile);
      fs.rmdirSync(tempDir, { recursive: true });
    } catch (err) {
      console.error("Error cleaning up temporary files:", err);
    }
  }
};

/**
 * Run a Python process and capture stdout/stderr
 */
function runPythonProcess(filePath) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [filePath]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    // Set a timeout to kill the process if it takes too long
    const timeout = setTimeout(() => {
      python.kill();
      reject(new Error("Python execution timed out"));
    }, 5000); // 5 second timeout

    python.on("close", () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Parse Python output to extract the shape
 */
function parsePythonOutput(output) {
  try {
    const resultMatch = output.match(
      /VOXELCODE_RESULT_BEGIN\n([\s\S]*?)\nVOXELCODE_RESULT_END/
    );

    if (resultMatch && resultMatch[1]) {
      return JSON.parse(resultMatch[1]);
    }

    throw new Error("Could not parse Python output");
  } catch (error) {
    console.error("Error parsing Python output:", error);
    throw new Error(`Failed to parse Python output: ${error.message}`);
  }
}

export default {
  executePython,
};
