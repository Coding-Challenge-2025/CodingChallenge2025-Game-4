import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = {}; // Single handlers object
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.waitingForHost = true;
    this.sessionInfo = null;
  }

  saveSession(username, password, isHost) {
    const sessionInfo = { username, password, isHost };
    localStorage.setItem("voxelcode_session", JSON.stringify(sessionInfo));
    this.sessionInfo = sessionInfo;
  }

  getSession() {
    if (this.sessionInfo) return this.sessionInfo;

    try {
      const sessionData = localStorage.getItem("voxelcode_session");
      if (sessionData) {
        this.sessionInfo = JSON.parse(sessionData);
        return this.sessionInfo;
      }
    } catch (error) {
      console.error("Error retrieving session:", error);
    }
    return null;
  }

  clearSession() {
    localStorage.removeItem("voxelcode_session");
    this.sessionInfo = null;
  }

  hasSession() {
    return !!this.getSession();
  }

  async reconnect() {
    const session = this.getSession();
    if (!session) {
      throw new Error("No stored session found");
    }

    const serverUrl = "http://localhost:3000";
    return this.connect(serverUrl, session.username, session.password);
  }

  connect(serverUrl, username, password) {
    return new Promise((resolve, reject) => {
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

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

        // save session info
        const isHost = username.toLowerCase() === "host";
        this.saveSession(username, password, isHost);

        if (isHost && this.waitingForHost) {
          this.waitingForHost = false;
        }

        resolve(this.socket);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);

        // Check if the error is about waiting for host
        if (error.message && error.message.includes("waiting for host")) {
          this.waitingForHost = true;
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
      this.clearSession();
    }
  }

  registerSocketEvents() {
    // Room events
    this.socket.on("room_joined", (data) => {
      if (this.handlers.roomJoined) {
        this.handlers.roomJoined(data);
      }
    });

    this.socket.on("player_joined", (data) => {
      if (this.handlers.playerJoined) {
        this.handlers.playerJoined(data);
      }
    });

    this.socket.on("player_kicked", (data) => {
      if (this.handlers.playerKicked) {
        this.handlers.playerKicked(data);
      }
    });

    this.socket.on("host_joined", (data) => {
      if (this.handlers.hostJoined) {
        this.handlers.hostJoined(data);
      }
    });

    this.socket.on("player_disconnected", (data) => {
      if (this.handlers.playerDisconnected) {
        this.handlers.playerDisconnected(data);
      }
    });

    this.socket.on("kicked", (data) => {
      // this.clearSession();
      console.log("Kicked event received:", data);

      if (this.handlers.kicked) {
        this.handlers.kicked(data);
      }
    });

    this.socket.on("room_updated", (data) => {
      if (this.handlers.roomUpdated) {
        this.handlers.roomUpdated(data);
      }
    });

    // Game events
    this.socket.on("game_started", (data) => {
      console.log("Game started event received:", data);
      if (this.handlers.gameStarted) {
        this.handlers.gameStarted(data);
      }
    });

    this.socket.on("game_ended", (data) => {
      console.log("Game ended event received:", data);
      if (this.handlers.gameEnded) {
        this.handlers.gameEnded(data);
      }
    });

    this.socket.on("time_update", (data) => {
      if (this.handlers.timeUpdate) {
        this.handlers.timeUpdate(data);
      }
    });

    this.socket.on("solution_result", (data) => {
      if (this.handlers.solutionResult) {
        this.handlers.solutionResult(data);
      }
    });

    this.socket.on("scores_updated", (data) => {
      if (this.handlers.scoresUpdated) {
        this.handlers.scoresUpdated(data);
      }
    });

    this.socket.on("scores_reset", (data) => {
      if (this.handlers.scores_reset) {
        this.handlers.scores_reset(data);
      }
    });

    this.socket.on("settings_updated", (data) => {
      if (this.handlers.settings_updated) {
        this.handlers.settings_updated(data);
      }
    });

    // Chat events
    this.socket.on("new_message", (data) => {
      if (this.handlers.newMessage) {
        this.handlers.newMessage(data);
      }
    });

    // Leaderboard events
    this.socket.on("leaderboard_data", (data) => {
      if (this.handlers.leaderboard_data) {
        this.handlers.leaderboard_data(data);
      }
    });

    // Shape events
    this.socket.on("available_shapes", (data) => {
      if (this.handlers.available_shapes) {
        this.handlers.available_shapes(data);
      }
    });

    // Error events
    this.socket.on("error", (error) => {
      console.error("Socket server error:", error);
      if (this.handlers.error) {
        this.handlers.error(error);
      }
    });

    // Disconnect event
    this.socket.on("disconnect", (reason) => {
      if (this.handlers.disconnect) {
        this.handlers.disconnect(reason);
      }
    });
  }

  registerHandlers(handlers) {
    // Merge new handlers with existing ones
    this.handlers = { ...this.handlers, ...handlers };

    // Re-register socket listeners to ensure all handlers are active
    if (this.socket && this.socket.connected) {
      Object.keys(this.handlers).forEach((event) => {
        this.socket.off(event); // Remove existing listener to prevent duplicates
        this.socket.on(event, (data) => {
          if (this.handlers[event]) {
            this.handlers[event](data);
          }
        });
      });
    }
  }

  removeHandlers(eventNames) {
    if (Array.isArray(eventNames)) {
      eventNames.forEach((name) => {
        if (this.socket) {
          this.socket.off(name); // Remove socket listener
        }
        delete this.handlers[name];
      });
    } else if (typeof eventNames === "string") {
      if (this.socket) {
        this.socket.off(eventNames);
      }
      delete this.handlers[eventNames];
    }
  }

  clearHandlers() {
    if (this.socket) {
      Object.keys(this.handlers).forEach((event) => {
        this.socket.off(event); // Remove all socket listeners
      });
    }
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

  endGame() {
    if (this.socket && this.socket.connected) {
      console.log("Ending game...");
      this.socket.emit("end_game");
    } else {
      console.error("Cannot end game: Socket not connected");
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

  requestRoomDetails() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("request_roomdetails");
    } else {
      console.error("Cannot request room details: Socket not connected");
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
    const session = this.getSession();
    return session && session.isHost;
  }

  // Add a method to check if the current user is a host
  isUserHost() {
    const session = this.getSession();
    return session && session.username.toLowerCase === "host";
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Add a new method to explicitly join room after handlers are set up
  joinRoom() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_room");
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
