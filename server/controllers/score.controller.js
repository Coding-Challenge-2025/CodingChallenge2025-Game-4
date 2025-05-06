const compareShapes = async (req, res) => {
  const { targetShape, outputShape } = req.body;

  if (!Array.isArray(targetShape) || !Array.isArray(outputShape)) {
    return res
      .status(400)
      .json({ error: true, message: "Both shapes must be 2D arrays." });
  }

  if (!checkShapesValidity(targetShape, outputShape)) {
    return res.status(400).json({
      error: true,
      message: "Both shapes must be of the same dimensions.",
    });
  }

  const similarity = calculateSimilarity(targetShape, outputShape);

  res.json({
    success: true,
    similarity: parseFloat(similarity.toFixed(2)), // e.g., 87.50
    totalCells: total,
    matchedCells: matchCount,
  });
};

function checkShapesValidity(targetShape, outputShape) {
  if (!Array.isArray(targetShape) || !Array.isArray(outputShape)) {
    return false;
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
    return false;
  }

  return true;
}

function calculateSimilarity(targetShape, outputShape) {
  let matchCount = 0;
  let total = targetShape.length * targetShape[0].length;

  for (let i = 0; i < targetShape.length; i++) {
    for (let j = 0; j < targetShape[i].length; j++) {
      if (targetShape[i][j] === outputShape[i][j]) {
        matchCount++;
      }
    }
  }

  return (matchCount / total) * 100;
}

export default {
  compareShapes,
  calculateSimilarity,
  checkShapesValidity,
};
