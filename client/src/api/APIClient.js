const API_URL = new URL("/api", import.meta.env.VITE_PROD_BACKEND_HTTP)

export const executeCode = async (code, language) => {
  try {
    const response = await fetch(`${API_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error executing code");
    }

    return await response.json();
  } catch (error) {
    console.error("API error executing code:", error);
    throw error;
  }
};

export const generateShape = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (options.size) queryParams.append("size", options.size);
    if (options.complexity)
      queryParams.append("complexity", options.complexity);

    const response = await fetch(
      `${API_URL}/shape/generate?${queryParams.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error generating shape");
    }

    return await response.json();
  } catch (error) {
    console.error("API error generating shape:", error);
    throw error;
  }
};

export const getPatterns = async () => {
  try {
    const response = await fetch(`${API_URL}/shape/patterns`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error getting patterns");
    }

    return await response.json();
  } catch (error) {
    console.error("API error getting patterns:", error);
    throw error;
  }
};

export const calculateScore = async (targetShape, outputShape) => {
  try {
    const response = await fetch(`${API_URL}/score/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetShape, outputShape }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error calculating score");
    }

    return await response.json();
  } catch (error) {
    console.error("API error calculating score:", error);
    throw error;
  }
};

export const startSession = async () => {
  try {
    const response = await fetch(`${API_URL}/session/start`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error starting session");
    }

    return await response.json();
  } catch (error) {
    console.error("API error starting session:", error);
    throw error;
  }
};
