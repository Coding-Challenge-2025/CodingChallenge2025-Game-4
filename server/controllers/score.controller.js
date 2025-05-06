const compareShapes = async (req, res) => {
  const { targetShape, outputShape } = req.body;

  if (!Array.isArray(targetShape) || !Array.isArray(outputShape)) {
    return res
      .status(400)
      .json({ error: true, message: "Both shapes must be 2D arrays." });
  }

  const rows = targetShape.length;
  const cols = targetShape[0]?.length;

  if (
    rows !== outputShape.length ||
    cols !== outputShape[0]?.length ||
    !targetShape.every(
      (row, i) => Array.isArray(row) && row.length === outputShape[i]?.length
    )
  ) {
    return res
      .status(400)
      .json({ error: true, message: "Shapes must have the same dimensions." });
  }

  let matchCount = 0;
  let total = rows * cols;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (targetShape[i][j] === outputShape[i][j]) {
        matchCount++;
      }
    }
  }

  const similarity = (matchCount / total) * 100;

  res.json({
    success: true,
    similarity: parseFloat(similarity.toFixed(2)), // e.g., 87.50
    totalCells: total,
    matchedCells: matchCount,
  });
};

export default {
  compareShapes,
};
