import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import { encriptMatrix, parseOutputToMatrix } from "./helperFunc.js"; 

const TEMP_DIR_PREFIX = "voxelcode";
const CPP_FILENAME = "code.cpp";
const COMPILER_COMMAND = "g++"; 
const DEFAULT_EXECUTION_TIMEOUT_MS = 5000; 

/**
 * Creates a temporary directory and necessary file paths for C++ execution.
 * @returns {Promise<{tempDir: string, cppFilePath: string, exeFilePath: string}>}
 */
async function createTemporaryFilesStructure() {
  const tempDir = path.join(os.tmpdir(), TEMP_DIR_PREFIX, uuidv4());
  await fs.mkdir(tempDir, { recursive: true });

  const cppFilePath = path.join(tempDir, CPP_FILENAME);
  const exeFileName = os.platform() === "win32" ? "code.exe" : "code";
  const exeFilePath = path.join(tempDir, exeFileName);

  return { tempDir, cppFilePath, exeFilePath };
}

/**
 * Compiles C++ source code to an executable.
 * @param {string} sourcePath - Path to the C++ source file.
 * @param {string} outputPath - Path for the output executable file.
 * @returns {Promise<void>}
 */
function compileCpp(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = ["-std=c++17", "-O1", "-pipe", sourcePath, "-o", outputPath];
    const compilerProcess = spawn(COMPILER_COMMAND, args);

    let stderr = "";
    compilerProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    compilerProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Compilation failed with code ${code}: ${stderr.trim()}`)
        );
      } else {
        resolve();
      }
    });

    compilerProcess.on("error", (err) => {
      reject(new Error(`Compiler process failed to start: ${err.message}`));
    });
  });
}

/**
 * Runs a compiled C++ process and captures its stdout/stderr.
 * @param {string} exePath - Path to the executable file.
 * @param {number} timeoutMs - Execution timeout in milliseconds.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function runCppProcess(exePath, timeoutMs) {
  return new Promise((resolve, reject) => {
    const process = spawn(exePath);

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      process.kill("SIGTERM"); 
      // Wait a moment before rejecting, to allow stderr to be captured if process logs on kill
      setTimeout(() => reject(new Error("C++ execution timed out")), 100);
    }, timeoutMs);

    process.on("close", (code) => {
      clearTimeout(timeoutId);
      if (code !== 0) {
        // Non-zero exit code can be an application error, not necessarily a process spawn error
        // So we resolve, but the caller can check stderr or decide based on the code
        resolve({
          stdout,
          stderr: stderr || `C++ process exited with code ${code}`,
        });
      } else {
        resolve({ stdout, stderr });
      }
    });

    process.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(
        new Error(`C++ process failed to start or crashed: ${err.message}`)
      );
    });
  });
}

/**
 * Executes C++ code and returns the output as an encrypted matrix.
 * @param {string} code - The C++ code to execute.
 * @param {number} [timeoutMs=DEFAULT_EXECUTION_TIMEOUT_MS] - Execution timeout.
 * @returns {Promise<{output: any, error: string, executionTime: number}>}
 */
const executeCpp = async (code, timeoutMs = DEFAULT_EXECUTION_TIMEOUT_MS) => {
  let filePaths = null;
  try {
    filePaths = await createTemporaryFilesStructure();
    const { tempDir, cppFilePath, exeFilePath } = filePaths;

    await fs.writeFile(cppFilePath, code);
    await compileCpp(cppFilePath, exeFilePath);

    const startTime = Date.now();
    const result = await runCppProcess(exeFilePath, timeoutMs);
    const executionTime = Date.now() - startTime;
    const matrix = parseOutputToMatrix(result.stdout);

    return {
      output: encriptMatrix(matrix), 
      error: result.stderr.trim(), 
      executionTime,
    };
  } catch (error) {
    // Re-throw a more specific error or the original error with context
    throw new Error(`C++ execution pipeline failed: ${error.message}`);
  } finally {
    if (filePaths && filePaths.tempDir) {
      try {
        await fs.rm(filePaths.tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Error cleaning up temporary files:", cleanupError);
      }
    }
  }
};

export default {
  executeCpp,
};
