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
