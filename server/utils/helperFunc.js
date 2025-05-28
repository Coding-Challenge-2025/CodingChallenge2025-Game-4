export const XOR_KEY = 987654321;

/*
 * Encrypts or decrypts a matrix using XOR operation with a predefined key.
 */
export function encriptMatrix(matrix) {
  if (!Array.isArray(matrix) || !matrix.length || !Array.isArray(matrix[0])) {
    throw new Error("Invalid matrix format");
  }

  return matrix.map((row) => row.map((value) => value ^ XOR_KEY));
};

/*
 * Decrypts a matrix that was encrypted using XOR operation with a predefined key.
 */
export function decriptMatrix(matrix) {
  if (!Array.isArray(matrix) || !matrix.length || !Array.isArray(matrix[0])) {
    throw new Error("Invalid matrix format");
  }

  return matrix.map((row) => row.map((value) => value ^ XOR_KEY));
};

/*
 * Parses a string output into a matrix format.
 * The output is expected to be a string with rows separated by newlines
 * and values in each row separated by whitespace.
 */
export function parseOutputToMatrix(output) {
  if (typeof output !== "string") {
    throw new Error("Output must be a string");
  }

  const lines = output.trim().split("\n");
  return lines.map((line) => line.trim().split(/\s+/).map(Number));
};

/**
 * Formats milliseconds to a MM:SS string.
 * @param {number} ms - Milliseconds.
 * @returns {string} Formatted time string.
 */
export function formatTime(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Safely parses JSON.
 * @param {string} jsonString The JSON string to parse.
 * @param {any} [defaultValue=null] Value to return on parse error.
 * @returns {any} Parsed object or default value.
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("JSON Parse error:", e.message); // Warn instead of error for non-critical parse
    return defaultValue;
  }
}
