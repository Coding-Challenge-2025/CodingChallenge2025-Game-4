import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getShapeById = async (req, res) => {
  const { patternId } = req.params;
  const filePath = path.join(__dirname, "../data/shapes/shape" + patternId + ".txt");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: true, message: "Shape not found" });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8").trim().split("\n");

    const [n, m, k] = content[0].split(" ").map(Number);

    const matrix = content
      .slice(1)
      .map((line) => line.trim().split(/\s+/).map(Number));

    res.json({
      success: true,
      shape: {
        size: `${n}x${m}`,
        difficulty: k,
        matrix,
      },
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Error parsing shape file" });
  }
};

const getAllShapes = async (req, res) => {
  const shapesDir = path.join(__dirname, "../data/shapes");

  try {
    const files = fs
      .readdirSync(shapesDir)
      .filter((file) => /^shape\d+\.txt$/.test(file));

    const shapes = files.map((filename) => {
      const content = fs
        .readFileSync(path.join(shapesDir, filename), "utf8")
        .trim()
        .split("\n");
      const [n, m, k] = content[0].split(" ").map(Number);

      const matrix = content
        .slice(1)
        .map((line) => line.trim().split(/\s+/).map(Number));

      return {
        id: filename.match(/\d+/)?.[0] ?? null,
        size: `${n}x${m}`,
        difficulty: k,
        matrix,
      };
    });

    res.json({
      success: true,
      count: shapes.length,
      shapes,
    });
  } catch (error) {
    console.error("Error reading shapes:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to read shapes directory" });
  }
};

function getMatrixById(id) {
  const filePath = path.join(__dirname, "../data/shapes/shape" + id + ".txt");

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8").trim().split("\n");
  const matrix = content.slice(1).map((line) => line.trim().split(/\s+/).map(Number));
  return matrix;
}

export default { 
  getShapeById, 
  getAllShapes, 
  getMatrixById
};
