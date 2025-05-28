import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { safeJsonParse } from "../utils/helperFunc.js";

// --- Constants & Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data Paths
export const DATA_DIR = path.join(__dirname, "../data");
export const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
export const SESSION_DIR = path.join(DATA_DIR, "session");

const ROOM_SETTINGS_FILE = path.join(DATA_DIR, "room_settings.json");
const GAME_START_TIME_FILE = path.join(DATA_DIR, "gameStartTime.json");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");

const CURRENT_SHAPE_DIR = path.join(DATA_DIR, "currentShape");
const OUTPUT_SHAPE_DIR = path.join(DATA_DIR, "outputShape");
const GAME_RESULTS_DIR = path.join(DATA_DIR, "gameResults");

export async function readJsonFile(filePath, defaultValue = null) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return safeJsonParse(data, defaultValue);
  } catch (error) {
    if (error.code === "ENOENT") {
      return defaultValue; // File not found is not necessarily an error here
    }
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw error; // Re-throw other critical errors
  }
}

export async function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error;
  }
}

export async function getGlobalRoomSettingsFromFile() {
  const data = await readJsonFile(ROOM_SETTINGS_FILE);
  if (!data || !data.settings) {
    console.error(
      "Global room settings not found or invalid in file:",
      ROOM_SETTINGS_FILE
    );
    throw new Error("Failed to load critical global room settings.");
  }
  return data.settings;
}

export async function writeCurrentShapeToFile(playerId, shapeId, currentShape) {
  const filePath = path.join(CURRENT_SHAPE_DIR, `${playerId}.json`);
  await writeJsonFile(filePath, {
    playerId,
    shapeId,
    currentShape,
    timestamp: new Date().toISOString(),
  });
}

export async function writeOutputShapeToFile(playerId, shapeId, outputShape) {
  const shapeDir = path.join(OUTPUT_SHAPE_DIR, `shape${shapeId}`);
  const filePath = path.join(shapeDir, `${playerId}.json`);
  await writeJsonFile(filePath, {
    playerId,
    shapeId,
    outputShape,
    timestamp: new Date().toISOString(),
  });
}

export async function writePlayerDataToFile(playerId, playerData) {
  const filePath = path.join(SESSION_DIR, `${playerId}.json`);
  await writeJsonFile(filePath, playerData);
}

export async function writeStartTimeToFile() {
  await writeJsonFile(GAME_START_TIME_FILE, { startTime: Date.now() });
}

export async function updateRoomSettingsFile(newSettings) {
  const currentData = await readJsonFile(ROOM_SETTINGS_FILE, { settings: {} });
  currentData.settings = { ...currentData.settings, ...newSettings };
  await writeJsonFile(ROOM_SETTINGS_FILE, currentData);
}

export async function saveGameResultsToFile(roomId, results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsTimestampDir = path.join(GAME_RESULTS_DIR, timestamp);
  const filePath = path.join(resultsTimestampDir, `${roomId}.json`);
  await writeJsonFile(filePath, results);
}

export async function saveLeaderboardToFile(leaderboardData) {
  await writeJsonFile(LEADERBOARD_FILE, leaderboardData);
}
