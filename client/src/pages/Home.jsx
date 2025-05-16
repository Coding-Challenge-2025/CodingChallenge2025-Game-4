import { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm"; // We'll create this component
import socketService from "../services/socketService";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [authError, setAuthError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [canJoin, setCanJoin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.registerHandlers({
      gameStarted: () => {
        console.log("Game started");
        // Handle game started event
      },
      error: (error) => {
        setAuthError(error.message || "An error occurred");

        if (
          error.message &&
          error.message.includes("Host has not joined yet")
        ) {
          console.log("Host has not joined yet");
          setCanJoin(false);
        }
      },
    });

    return () => {
      socketService.clearHandlers();
    };
  });

  const handleLogin = async (username, password) => {
    try {
      const isHostAccount = username.toLowerCase() === "host";
      setIsHost(isHostAccount);

      const serverUrl = "http://localhost:3000";
      try {
        await socketService.connect(serverUrl, username, password);

        // Login successful
        setAuthError("");

        // Handle successful login
        if (isHostAccount) {
          console.log("Host logged in");
          navigate("/host-dashboard");
        } else {
          // check if can join
          if (canJoin) {
            navigate("/waiting-room", { state: { username } });
          } else {
            setAuthError("Host has not joined yet");
          }
        }
      } catch (error) {
        console.error("Socket connection error:", error);
        setAuthError(
          error.message ||
            "Authentication failed. Please check your credentials."
        );
        throw error;
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setAuthError(
        error.message || "Authentication failed. Please check your credentials."
      );
      throw error;
    }
  };

  return (
    <div className="App">
      <LoginForm onLogin={handleLogin} error={authError} />
    </div>
  );
}
