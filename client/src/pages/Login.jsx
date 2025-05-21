import { useEffect, useState } from "react";
import socketService from "../services/socketService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const [authError, setAuthError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [canJoin, setCanJoin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHostLogin, setIsHostLogin] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    socketService.registerHandlers({
      gameStarted: () => {
        console.log("Game started");
      },
      error: (error) => {
        setAuthError(error.message || "An error occurred");
        if (error.message?.includes("Host has not joined yet")) {
          console.log("Host has not joined yet");
          setCanJoin(false);
        }
      },
    });

    return () => {
      socketService.clearHandlers();
    };
  }, []);

  const checkIfHost = (value) => {
    setUsername(value);
    setIsHostLogin(value.toLowerCase() === "host");
    setIsHost(value.toLowerCase() === "host");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setErrorMessage("Username is required");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setAuthError("");

    try {
      const serverUrl = "http://localhost:3000";
      await socketService.connect(serverUrl, username, password);

      // Simulate user data (adjust based on your backend response)
      const userData = {
        username,
        password,
        isHost: isHostLogin,
        userId: username, 
      };

      login(userData); // Update auth context

      // Navigate based on user role
      if (isHostLogin) {
        navigate("/host-dashboard");
      } else {
        navigate("/waiting-room", { state: { username } });
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setErrorMessage(
        error.message || "Authentication failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div
        className={`p-8 rounded-lg shadow-lg w-full max-w-md ${
          isHostLogin ? "bg-gray-800 border-2 border-yellow-500" : "bg-gray-800"
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            VoxelCode Arena
          </h1>
          <p className="text-gray-400">
            {isHostLogin ? "Host Login" : "Sign in to continue"}
          </p>
          {isHostLogin && (
            <div className="mt-2 text-yellow-400 text-sm">
              Logging in as Game Host
            </div>
          )}
        </div>

        {(errorMessage || authError) && (
          <div className="bg-red-900/50 border border-red-800 text-white p-4 rounded-md mb-6">
            {errorMessage || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => checkIfHost(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                isHostLogin
                  ? "border-yellow-500 focus:ring-yellow-500"
                  : "border-gray-600 focus:ring-blue-500"
              }`}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 ${
                isHostLogin
                  ? "border-yellow-500 focus:ring-yellow-500"
                  : "border-gray-600 focus:ring-blue-500"
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 ${
              isHostLogin
                ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading
              ? "Signing in..."
              : isHostLogin
              ? "Sign In as Host"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Contact an administrator if you need an account.</p>
        </div>
      </div>
    </div>
  );
}
