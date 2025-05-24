import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getCurrentShapeByUserId = async (req, res) => {
  const { playerId } = req.params;

  const filePath = path.join(
    __dirname,
    "../data/currentShape/" + playerId + "_output.json"
  );
  
  console.log("filePath", filePath);

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

export default {
  getCurrentShapeByUserId,
};
