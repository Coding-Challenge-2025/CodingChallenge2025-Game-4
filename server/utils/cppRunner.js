import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

const executeCpp = async (code) => {
  // Create a temporary directory for code execution
  const tempDir = path.join(os.tmpdir(), "voxelcode", uuidv4());
  fs.mkdirSync(tempDir, { recursive: true });

  // Create temporary files
  const cppFile = path.join(tempDir, "code.cpp");
  const exeFile = path.join(
    tempDir,
    os.platform() === "win32" ? "code.exe" : "code"
  );

  try {
    // Wrap the user code to capture the output
    fs.writeFileSync(cppFile, code);

    // Compile the C++ code
    await compileCpp(cppFile, exeFile);

    // Execute the compiled code
    const startTime = Date.now();
    const result = await runCppProcess(exeFile);
    const executionTime = Date.now() - startTime;

    // Parse the output to get the shape
    const rawOutput = result.stdout;

    console.log("C++ raw output:", rawOutput);

    const matrix = rawOutput
      .trim()
      .split(/\r?\n/)
      .map(line => line.trim().split(/\s+/).map(Number));

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        // Apply the XOR operation with 987654321
        matrix[i][j] ^= 987654321;
      }
    }

    return {
      output: matrix,
      error: result.stderr,
      executionTime,
    };
  } catch (error) {
    console.error("C++ execution error:", error);
    throw error;
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
      if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);
      fs.rmdirSync(tempDir, { recursive: true });
    } catch (err) {
      console.error("Error cleaning up temporary files:", err);
    }
  }
};

/**
 * Compile C++ code
 */
function compileCpp(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    const compiler = os.platform() === "win32" ? "g++" : "g++";
    const args = ["-std=c++17", "-O1", "-pipe", sourcePath, "-o", outputPath];

    const process = spawn(compiler, args);

    let stderr = "";

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Compilation failed with code ${code}: ${stderr}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Run a compiled C++ process and capture stdout/stderr
 */
function runCppProcess(exePath) {
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

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`C++ process exited with code ${code}: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });

    // Set a timeout to kill the process if it takes too long
    const timeout = setTimeout(() => {
      process.kill();
      reject(new Error("C++ execution timed out"));
    }, 5000); // 5 second timeout

    process.on("close", () => {
      clearTimeout(timeout);
    });
  });
}

export default {
  executeCpp,
};
