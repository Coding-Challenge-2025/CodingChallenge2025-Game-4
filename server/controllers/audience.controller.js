import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getCurrentShapeByUserId = async (req, res) => {
  const { playerId } = req.params;

  const filePath = path.join(
    __dirname,
    "../data/currentShape/" + playerId + ".json"
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: true, message: "Shape not found" });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

    res.json(content);
  } catch (error) {
    res.status(500).json({ error: true, message: "Error parsing shape file" });
  }
};

const getGameStartTime = async (req, res) => {
  const filePath = path.join(__dirname, "../data/gameStartTime.json");

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: true, message: "Game start time not found" });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json({ startTime: content.startTime });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Error parsing game start time file" });
  }
};

const getShowcaseShapes = async (req, res) => {
  const { userId, shapeId } = req.query;
  if (!userId || !shapeId) {
    return res
      .status(400)
      .json({ error: true, message: "Missing userId or shapeId" });
  }

  const filePath = path.join(
    __dirname,
    `../data/outputShape/shape${shapeId}/${userId}.json`
  );

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: true, message: "Showcase shapes not found" });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Error parsing showcase shapes file" });
  }
};

const getLeaderboard = async (req, res) => {
  const filePath = path.join(__dirname, "../data/leaderboard.json");

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: true, message: "Leaderboard not found" });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(content);
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Error parsing leaderboard file" });
  }
};

export default {
  getCurrentShapeByUserId,
  getGameStartTime,
  getShowcaseShapes,
  getLeaderboard,
};
