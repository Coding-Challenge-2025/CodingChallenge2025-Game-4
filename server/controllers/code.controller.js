import pythonRunner from "../utils/pythonRunner.js";
import cppRunner from "../utils/cppRunner.js";
import shapeController from "./shape.controller.js";
import scoreController from "./score.controller.js";

const executeCode = async (req, res, next) => {
  try {
    const { code, language, targetId } = req.body;

    if (!code || !language || !targetId) {
      return res.status(400).json({
        error: true,
        message: "Code, language, and targetId are required",
      });
    }

    // execute the code based on the language
    let result;
    if (language.toLowerCase() === "python") {
      result = await pythonRunner.executePython(code);
    } else {
      result = await cppRunner.executeCpp(code);
    }

    // Check if result is valid
    if (!result || !result.output) {
      return res.status(400).json({
        error: true,
        message: "Code execution failed",
        output: result.output || "No output",
      });
    }

    // calculate the similarity score
    const { matrix: targetShape, score } = await shapeController.getMatrixById(
      targetId
    );

    if (!targetShape) {
      return res.status(404).json({
        error: true,
        message: "Target shape not found",
      });
    }

    const outputShape = result.output;

    // check if two shapes are valid
    const isValid = scoreController.checkShapesValidity(
      targetShape,
      outputShape
    );

    let similarity = 0;
    if (isValid) {
      similarity = scoreController.calculateSimilarity(
        targetShape,
        outputShape
      );
    }

    res.json({
      success: true,
      message: isValid ? "Code executed successfully" : "Invalid shape",
      output: result.output,
      similarity: parseFloat(similarity.toFixed(2)),
      score: score,
      executionTime: result.executionTime,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    res.status(500).json({
      error: true,
      message: "Error executing code",
      details: error.message,
    });
  }
};

export default {
  executeCode,
};
