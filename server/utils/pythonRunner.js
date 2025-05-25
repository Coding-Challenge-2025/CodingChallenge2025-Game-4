import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

const executePython = async (code) => {
  // Create a temporary directory for code execution
  const tempDir = path.join(os.tmpdir(), "voxelcode", uuidv4());
  fs.mkdirSync(tempDir, { recursive: true });

  // Create a temporary Python file
  const pythonFile = path.join(tempDir, "code.py");

  try {
    // Wrap the user code to capture the output
    fs.writeFileSync(pythonFile, code);

    // Execute the Python code
    const startTime = Date.now();
    const result = await runPythonProcess(pythonFile);
    const executionTime = Date.now() - startTime;

    // Parse the output to get the shape
    const rawOutput = result.stdout;
    const matrix = rawOutput
      .trim()
      .split(/\r?\n/)
      .map(line => line.trim().split(/\s+/).map(Number));

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        matrix[i][j] ^= 987654321;
      }
    }

    return {
      output: matrix,
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

function runPythonProcess(filePath) {
  return new Promise((resolve, reject) => {
    const python = spawn("py", [filePath]);

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

export default {
  executePython,
};
