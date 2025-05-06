import pythonRunner from "../utils/pythonRunner.js"
import cppRunner from "../utils/cppRunner.js"

const executeCode = async (req, res, next) => {
  try {
    const { code, language } = req.body

    if (!code) {
      return res.status(400).json({ error: true, message: "Code is required" })
    }

    if (!language || !["python", "cpp"].includes(language.toLowerCase())) {
      return res.status(400).json({ error: true, message: "Valid language (python or cpp) is required" })
    }

    let result

    // Execute code based on language
    if (language.toLowerCase() === "python") {
      result = await pythonRunner.executePython(code)
    } else {
      result = await cppRunner.executeCpp(code)
    }

    // Check if result is valid
    if (!result || !result.output) {
      return res.status(400).json({
        error: true,
        message: "Code execution did not produce a valid shape",
        output: result.output || "No output",
      })
    }

    res.json({
      success: true,
      shape: result.shape,
      output: result.output,
      executionTime: result.executionTime,
    })
  } catch (error) {
    console.error("Code execution error:", error)
    res.status(500).json({
      error: true,
      message: "Error executing code",
      details: error.message,
    })
  }
}

export default {
  executeCode,
}
