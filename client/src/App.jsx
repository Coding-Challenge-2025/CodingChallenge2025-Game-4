import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import socketService from "./services/socketService";
import WaitingRoom from "./components/WaitingRoom"; // We'll create this component
import HostDashboard from "./components/HostDashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [canJoin, setCanJoin] = useState(true);

  useEffect(() => {
    socketService.registerHandlers({
      gameStarted: () => {
        console.log("Game started");
        // Handle game started event
      },
      error: (error) => {
        console.error("Socket error:", error);
        setAuthError(error.message || "An error occurred");

        if (error.message && error.message.includes("Host has not joined yet")) {
          setCanJoin(false);
        }
      },
    });

    return () => {
      socketService.clearHandlers();
    };
  })

  const handleLogin = async (username, password) => {
    try {
      const isHostAccount = username.toLowerCase() === "host";
      setIsHost(isHostAccount);
      setCanJoin(true);

      const serverUrl = "http://localhost:3000";
      try {
        await socketService.connect(serverUrl, username, password);

        setUsername(username);
        setIsAuthenticated(true);
        setAuthError("");
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

  const handleLogout = () => {
    socketService.disconnect();
    setIsAuthenticated(false);
    setUsername("");
    setIsHost(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} error={authError} />
      ) : isHost ? (
        // If authenticated as host, show host dashboard directly
        <HostDashboard onBack={handleLogout} onSwitchToGame={() => {}} />
      ) : canJoin ? (
        // If authenticated as a player, show waiting room or game
        <WaitingRoom
          username={username}
          onStartGame={() => {}}
          onBack={handleLogout}
        />
      ) : <LoginForm onLogin={handleLogin} error="Host has not joined yet" />}
    }
    </div>
  );
}

export default App;
