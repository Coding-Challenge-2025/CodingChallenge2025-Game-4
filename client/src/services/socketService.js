import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = {};
    this.globalHandlers = {}; // Add global handlers that persist across registerHandlers calls
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
  }

  connect(serverUrl, username, password) {
    return new Promise((resolve, reject) => {
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      console.log(
        `Authenticate with username: ${username} and password: ${password}`
      );
      this.connectionAttempts += 1;

      // Connect to socket server with auth
      this.socket = io(serverUrl, {
        auth: {
          username,
          password,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000, // 10 second connection timeout
      });

      // Handle connection events
      this.socket.on("connect", () => {
        console.log("Connected to socket server");
        this.connectionAttempts = 0;
        this.registerSocketEvents();
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);

        // Check if the error is about waiting for host
        if (error.message && error.message.includes("waiting for host")) {
          // Special error for waiting for host
          reject(new Error("Waiting for host to join"));
        } else if (this.connectionAttempts >= this.maxConnectionAttempts) {
          reject(
            new Error(
              `Connection failed after ${this.connectionAttempts} attempts: ${error.message}`
            )
          );
        } else {
          reject(error);
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  registerSocketEvents() {
    // Room events
    this.socket.on("room_joined", (data) => {
      console.log("Room joined event received:", data);
      if (this.handlers.roomJoined) {
        this.handlers.roomJoined(data);
      }
      if (this.globalHandlers.roomJoined) {
        this.globalHandlers.roomJoined(data);
      }
    });

    this.socket.on("player_joined", (data) => {
      if (this.handlers.playerJoined) {
        this.handlers.playerJoined(data);
      }
      if (this.globalHandlers.playerJoined) {
        this.globalHandlers.playerJoined(data);
      }
    });

    this.socket.on("player_left", (data) => {
      if (this.handlers.playerLeft) {
        this.handlers.playerLeft(data);
      }
      if (this.globalHandlers.playerLeft) {
        this.globalHandlers.playerLeft(data);
      }
    });

    this.socket.on("new_host", (data) => {
      if (this.handlers.newHost) {
        this.handlers.newHost(data);
      }
      if (this.globalHandlers.newHost) {
        this.globalHandlers.newHost(data);
      }
    });

    this.socket.on("host_left", (data) => {
      console.log("Host left event received:", data);
      if (this.handlers.host_left) {
        this.handlers.host_left(data);
      }
      if (this.globalHandlers.host_left) {
        this.globalHandlers.host_left(data);
      }
    });

    this.socket.on("kicked", (data) => {
      if (this.handlers.kicked) {
        this.handlers.kicked(data);
      }
      if (this.globalHandlers.kicked) {
        this.globalHandlers.kicked(data);
      }
    });

    this.socket.on("player_kicked", (data) => {
      if (this.handlers.player_kicked) {
        this.handlers.player_kicked(data);
      }
      if (this.globalHandlers.player_kicked) {
        this.globalHandlers.player_kicked(data);
      }
    });

    // Game events
    this.socket.on("game_started", (data) => {
      console.log("Game started event received:", data);
      if (this.handlers.gameStarted) {
        this.handlers.gameStarted(data);
      }
      if (this.globalHandlers.gameStarted) {
        this.globalHandlers.gameStarted(data);
      }
    });

    this.socket.on("time_update", (data) => {
      if (this.handlers.timeUpdate) {
        this.handlers.timeUpdate(data);
      }
      if (this.globalHandlers.timeUpdate) {
        this.globalHandlers.timeUpdate(data);
      }
    });

    this.socket.on("solution_result", (data) => {
      if (this.handlers.solutionResult) {
        this.handlers.solutionResult(data);
      }
      if (this.globalHandlers.solutionResult) {
        this.globalHandlers.solutionResult(data);
      }
    });

    this.socket.on("scores_updated", (data) => {
      if (this.handlers.scoresUpdated) {
        this.handlers.scoresUpdated(data);
      }
      if (this.globalHandlers.scoresUpdated) {
        this.globalHandlers.scoresUpdated(data);
      }
    });

    this.socket.on("round_ended", (data) => {
      if (this.handlers.roundEnded) {
        this.handlers.roundEnded(data);
      }
      if (this.globalHandlers.roundEnded) {
        this.globalHandlers.roundEnded(data);
      }
    });

    this.socket.on("new_round_started", (data) => {
      if (this.handlers.newRoundStarted) {
        this.handlers.newRoundStarted(data);
      }
      if (this.globalHandlers.newRoundStarted) {
        this.globalHandlers.newRoundStarted(data);
      }
    });

    this.socket.on("scores_reset", (data) => {
      if (this.handlers.scores_reset) {
        this.handlers.scores_reset(data);
      }
      if (this.globalHandlers.scores_reset) {
        this.globalHandlers.scores_reset(data);
      }
    });

    this.socket.on("settings_updated", (data) => {
      if (this.handlers.settings_updated) {
        this.handlers.settings_updated(data);
      }
      if (this.globalHandlers.settings_updated) {
        this.globalHandlers.settings_updated(data);
      }
    });

    // Chat events
    this.socket.on("new_message", (data) => {
      if (this.handlers.newMessage) {
        this.handlers.newMessage(data);
      }
      if (this.globalHandlers.newMessage) {
        this.globalHandlers.newMessage(data);
      }
    });

    // Leaderboard events
    this.socket.on("leaderboard_data", (data) => {
      if (this.handlers.leaderboard_data) {
        this.handlers.leaderboard_data(data);
      }
      if (this.globalHandlers.leaderboard_data) {
        this.globalHandlers.leaderboard_data(data);
      }
    });

    // Shape events
    this.socket.on("available_shapes", (data) => {
      if (this.handlers.available_shapes) {
        this.handlers.available_shapes(data);
      }
      if (this.globalHandlers.available_shapes) {
        this.globalHandlers.available_shapes(data);
      }
    });

    // Error events
    this.socket.on("error", (error) => {
      console.error("Socket server error:", error);
      if (this.handlers.error) {
        this.handlers.error(error);
      }
      if (this.globalHandlers.error) {
        this.globalHandlers.error(error);
      }
    });

    // Disconnect event
    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      if (this.handlers.disconnect) {
        this.handlers.disconnect(reason);
      }
      if (this.globalHandlers.disconnect) {
        this.globalHandlers.disconnect(reason);
      }
    });
  }

  registerHandlers(handlers) {
    this.handlers = handlers;
  }

  // Register global handlers that persist across registerHandlers calls
  registerGlobalHandlers(handlers) {
    this.globalHandlers = handlers;
  }

  // Clear all handlers
  clearHandlers() {
    this.handlers = {};
  }

  // Game actions
  startGame() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("start_game");
    } else {
      console.error("Cannot start game: Socket not connected");
    }
  }

  submitSolution(code, language) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("submit_solution", { code, language });
    } else {
      console.error("Cannot submit solution: Socket not connected");
    }
  }

  startNewRound() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("start_new_round");
    } else {
      console.error("Cannot start new round: Socket not connected");
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("send_message", { message });
    } else {
      console.error("Cannot send message: Socket not connected");
    }
  }

  // Host dashboard actions
  adminCommand(command, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("admin_command", { command, data });
    } else {
      console.error(
        `Cannot execute admin command ${command}: Socket not connected`
      );
    }
  }

  requestLeaderboard() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("request_leaderboard");
    } else {
      console.error("Cannot request leaderboard: Socket not connected");
    }
  }

  requestAvailableShapes() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("request_available_shapes");
    } else {
      console.error("Cannot request available shapes: Socket not connected");
    }
  }

  sendSystemMessage(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("send_system_message", { message });
    } else {
      console.error("Cannot send system message: Socket not connected");
    }
  }

  get connected() {
    return this.socket && this.socket.connected;
  }

  get isHost() {
    return this.socket && this.socket.auth && this.socket.auth.isHost;
  }

  // Add a method to check if the current user is a host
  isUserHost() {
    return (
      this.socket && this.socket.auth && this.socket.auth.username === "host"
    );
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
