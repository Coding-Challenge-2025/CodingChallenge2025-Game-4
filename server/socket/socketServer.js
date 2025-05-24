import GameManger from "./gameManager.js";
import codeController from "../controllers/code.controller.js";
import scoreController from "../controllers/score.controller.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gameManager = new GameManger();
const GLOBAL_ROOM_ID = "123456";

// host account information
let hostAccount = null;
let roomSettings = null;
let hostJoined = false;

function loadHostAccount() {
  try {
    const hostAccountPath = path.join(__dirname, "../data/accounts/host.json");

    if (!fs.existsSync(hostAccountPath)) {
      console.error("Host account file not found:", hostAccountPath);
      return null;
    }

    const data = JSON.parse(fs.readFileSync(hostAccountPath, "utf8"));
    hostAccount = data.host;
    roomSettings = data.roomSettings;
  } catch (error) {
    console.error("Error reading host account file:", error);
    return null;
  }
}

// Load the host account and room settings on server startup
loadHostAccount();

// Create the global room if it doesn't exist (but it's not active until the host joins)
gameManager.createRoom(GLOBAL_ROOM_ID, {
  name: roomSettings.name || "VoxelCode Arena",
  isPrivate: false,
  maxPlayers: roomSettings.maxPlayers || 5,
  createdBy: "system",
  creatorName: hostAccount.username || "System",
  hostId: hostAccount?.id || "111",
  isActive: false,
});

console.log(
  `Global room created: ${GLOBAL_ROOM_ID} - ${roomSettings.name} (Max Players: ${roomSettings.maxPlayers})`
);

function setupSocketServer(io) {
  // middleware for authentication with username
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const password = socket.handshake.auth.password;

    console.log("Authentication attempt:", username, password);

    if (!username || !password) {
      return next(
        new Error("Authentication error: Username and password required")
      );
    }

    // check if this is the host account
    if (
      hostAccount &&
      username.toLowerCase() === hostAccount.username.toLowerCase()
    ) {
      if (Number(password) === hostAccount.password) {
        socket.username = hostAccount.username;
        socket.userId = hostAccount.id;
        socket.isHost = true;
        socket.userScore = -1; // Host account score is not tracked

        return next();
      }
    }

    // regular user authentication
    try {
      const user = authenticateUser(username, password);
      if (!user) {
        return next(
          new Error("Authentication error: Invalid username or password")
        );
      }

      // check if the host has joined
      if (!hostJoined) {
        return next(
          new Error("Authentication error: waiting for host to join")
        );
      }

      socket.username = user.username;
      socket.userId = user.id;
      socket.userScore = user.score || 0;
      socket.isHost = false;

      next();
    } catch (error) {
      return next(new Error("Authentication error: " + error.message));
    }
  });

  // connection handler
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // check if this is the host
    if (socket.isHost) {
      hostJoined = true;
      const room = gameManager.getRoom(GLOBAL_ROOM_ID);
      if (room) {
        gameManager.assignHostToPlayer(GLOBAL_ROOM_ID, socket.id);
        console.log(
          `Host joined: ${socket.username} (${socket.userId}) - room is now active`
        );
      }
    } else if (!hostJoined) {
      socket.emit("error", {
        message: "Cannot join room: Host has not joined yet",
      });
      socket.disconnect(true);

      return;
    }

    // automatically join the global room
    socket.join(GLOBAL_ROOM_ID);

    // add player to the global room
    gameManager.addPlayerToRoom(GLOBAL_ROOM_ID, socket.id, {
      id: socket.id,
      username: socket.username,
      userId: socket.userId,
      score: socket.userScore,
      isHost: socket.isHost || false,
      status: "waiting",
    });

    // if this is the host, send welcome message
    if (socket.isHost && roomSettings.welcomeMessage) {
      setTimeout(() => {
        io.to(GLOBAL_ROOM_ID).emit("new_message", {
          sender: socket.username,
          senderId: socket.id,
          message: roomSettings.welcomeMessage,
          timestamp: Date.now(),
          isSystem: true,
          isHost: true,
        });
      }, 1000);
    }

    // notify client that they have joined the room
    socket.emit("room_joined", {
      roomId: GLOBAL_ROOM_ID,
      room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
      isHost: socket.isHost || false,
    });

    // notify all players in the room about the new player
    io.to(GLOBAL_ROOM_ID).emit("player_joined", {
      player: {
        id: socket.id,
        username: socket.username,
        isHost: socket.isHost || false,
      },
      room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
    });

    socket.on("admin_command", ({ command, data }) => {
      if (!socket.isHost) {
        socket.emit("error", {
          message: "Only the host can execute admin commands",
        });
        return;
      }

      switch (command) {
        case "kick_player":
          if (data.playerId) {
            console.log(
              `Player kicked: ${data.playerName} (${data.playerId}) - Reason: ${data.reason}`
            );

            io.to(GLOBAL_ROOM_ID).emit("player_kicked", {
              playerId: data.playerId,
              playerName: data.playerName,
              reasion: data.reason || "You have been kicked by the host",
            });
          }

          break;

        case "reset_scores":
          gameManager.resetAllScores(GLOBAL_ROOM_ID);
          io.to(GLOBAL_ROOM_ID).emit("scores_reset", {
            players: gameManager.getPlayersInRoom(GLOBAL_ROOM_ID),
          });

          break;

        case "change_settings":
          if (data.settings) {
            if (data.settings.name)
              gameManager.updateRoomName(GLOBAL_ROOM_ID, data.settings.name);
            if (data.settings.maxPlayers)
              gameManager.updateMaxPlayers(
                GLOBAL_ROOM_ID,
                data.settings.maxPlayers
              );

            updateRoomSettings(data.settings);

            io.to(GLOBAL_ROOM_ID).emit("settings_changed", {
              settings: data.settings,
              room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
            });
          }

          break;

        case "end_game":
          gameManager.endGame(GLOBAL_ROOM_ID);
          io.to(GLOBAL_ROOM_ID).emit("game_ended", {
            message: "The game has ended by the host",
            room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
          });

          break;

        default:
          socket.emit("error", { message: "Unknown command" });
          break;
      }
    });

    socket.on("start_game", () => {
      try {
        const room = gameManager.getRoom(GLOBAL_ROOM_ID);

        if (!socket.isHost) {
          throw new Error("Only the host can start the game");
        }

        // check if there are enough players to start the game
        const minPlayers = roomSettings.minPlayersToStart || 2; // Minimum players to start the game
        if (room.players.length < minPlayers) {
          throw new Error(
            `Not enough players to start the game. Minimum required: ${minPlayers}`
          );
        }

        // start the game
        gameManager.startGame(GLOBAL_ROOM_ID);
        const roundDuration = (roomSettings.roundDuration || 3) * 60 * 1000;
        const endTime = Date.now() + roundDuration;

        // notify all players in the room
        io.to(GLOBAL_ROOM_ID).emit("game_started", {
          room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
          endTime,
        });

        const timer = setInterval(() => {
          const timeLeft = endTime - Date.now();

          if (timeLeft <= 0) {
            // stop the round
            clearInterval(timer);
            // gameManager.endRound(GLOBAL_ROOM_ID);

            // handle round end
            // const results = gameManager.getRoundResults(GLOBAL_ROOM_ID);
            // updatePlayerScores(results.players);
          } else {
            // send time updates every second
            if (timeLeft % 1000 < 100) {
              io.to(GLOBAL_ROOM_ID).emit("time_update", {
                timeLeft,
                formattedTime: formatTime(timeLeft),
              });
            }
          }
        }, 100);

        // store the timer reference
        gameManager.setRoomTimer(GLOBAL_ROOM_ID, timer);
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("end_game", () => {
      try {
        if (!socket.isHost) {
          throw new Error("Only the host can end the game");
        }

        gameManager.endGame(GLOBAL_ROOM_ID);
        io.to(GLOBAL_ROOM_ID).emit("game_ended", {
          message: "The game has ended by the host",
          room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
        });
      } catch (error) {
        console.error("Error ending game:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("submit_solution", async ({ code, language }) => {
      try {
        const room = gameManager.getRoom(GLOBAL_ROOM_ID);

        if (!room) {
          throw new Error("Room not found");
        }

        if (!room.gameInProgress) {
          throw new Error("Game is not in progress");
        }

        const result = await codeController.executeCode(code, language);

        if (!result.success) {
          throw new Error("Code execution failed: " + result.message);
        }

        const score = await scoreController.calculateSimilarity(
          result.output,
          room.currentShape
        );
        gameManager.updatePlayerScore(
          GLOBAL_ROOM_ID,
          socket.id,
          score.score,
          result.shape
        );

        // notify the result to the player
        socket.emit("solution_submitted", {
          success: true,
          score: score.score,
          shape: result.shape,
        });

        // notify all players in the room about the score update
        io.to(GLOBAL_ROOM_ID).emit("scores_updated", {
          players: gameManager.getPlayersInRoom(GLOBAL_ROOM_ID),
        });

        if (
          score.score === 100 ||
          gameManager.allPlayersSubmitted(GLOBAL_ROOM_ID)
        ) {
          clearInterval(room.timer);
          gameManager.endRound(GLOBAL_ROOM_ID);

          // handle round end
          const results = gameManager.getRoundResults(GLOBAL_ROOM_ID);
          updatePlayerScores(results.players);

          io.to(GLOBAL_ROOM_ID).emit("round_ended", {
            results,
            room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
          });
        }
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("send_message", ({ message }) => {
      if (!message.trim()) {
        throw new Error("Message cannot be empty");
      }

      io.to(GLOBAL_ROOM_ID).emit("new_message", {
        sender: socket.username,
        senderId: socket.id,
        message,
        timeStamp: Date.now(),
        isHost: socket.isHost || false,
      });
    });

    // Request available shapes
    socket.on("request_available_shapes", () => {
      // Only host can request shapes
      if (!socket.isHost) {
        socket.emit("error", {
          message: "Unauthorized: Host privileges required",
        });
        return;
      }

      try {
        // Get available shapes from the shapes directory
        const shapesDir = path.join(__dirname, "../data/shapes");

        const shapeFiles = fs
          .readdirSync(shapesDir)
          .filter((file) => file.startsWith("shape") && file.endsWith(".txt"))
          .map((file) =>
            Number.parseInt(file.replace("shape", "").replace(".txt", ""))
          )
          .sort((a, b) => a - b);

        socket.emit("available_shapes", { shapes: shapeFiles });
      } catch (error) {
        socket.emit("error", { message: "Error fetching available shapes" });
      }
    });

    // Send system message
    socket.on("send_system_message", ({ message }) => {
      // Only host can send system messages
      if (!socket.isHost) {
        socket.emit("error", {
          message: "Unauthorized: Host privileges required",
        });
        return;
      }

      if (!message.trim()) return;

      io.to(GLOBAL_ROOM_ID).emit("new_message", {
        sender: "System",
        senderId: "system",
        message,
        timestamp: Date.now(),
        isSystem: true,
        isHost: true,
      });
    });

    socket.on("disconnect", () => {
      // console.log(`User disconnected: ${socket.username} (${socket.userId})`);
      gameManager.removePlayerFromRoom(GLOBAL_ROOM_ID, socket.id);

      // notify all players in the room about the disconnection
      io.to(GLOBAL_ROOM_ID).emit("player_disconnected", {
        playerId: socket.id,
        playerName: socket.username,
        room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
      });

      // if the host disconnects, end the game
      if (socket.isHost) {
        hostJoined = false;
        const room = gameManager.getRoom(GLOBAL_ROOM_ID);
        if (room) {
          io.to(GLOBAL_ROOM_ID).emit("host_left", {
            message: "The host has left the game. The game has ended.",
            room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
          });

          // disconnect all players
          io.in(GLOBAL_ROOM_ID).disconnectSockets(true);
        }
      }
    });

    socket.on("request_roomdetails", () => {
      socket.emit("room_updated", {
        message: "Successfully get room details",
        room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
      });
    });
  });
}

function handleNewRound(roomId) {
  const room = gameManager.getRoom(roomId);
  if (!room) {
    throw new Error(`Room ${roomId} does not exist`);
  }

  const shape = gameManager.generateShapeForRoom(roomId);
  const duration = (roomSettings.roundDuration || 3) * 60 * 1000; // Default round duration in milliseconds
  const endTime = Date.now() + duration;

  gameManager.setGameTimer(roomId, endTime);

  // notify all players in the room
  io.to(roomId).emit("new_round_started", {
    room: gameManager.getRoomDetails(roomId),
    shape,
    endTime,
  });

  const timer = setInterval(() => {
    const timeLeft = endTime - Date.now();

    if (timeLeft <= 0) {
      // stop the round
      clearInterval(timer);
      gameManager.endRound(roomId);

      // handle round end
      const results = gameManager.getRoundResults(roomId);
      updatePlayerScores(results.players);

      // notify all players in the room that the round has ended
      io.to(roomId).emit("round_ended", {
        results,
        room: gameManager.getRoomDetails(roomId),
      });
    } else {
      // send time updates every second
      if (timeLeft % 1000 < 100) {
        io.to(roomId).emit("time_update", {
          timeLeft,
          formattedTime: formatTime(timeLeft),
        });
      }
    }
  }, 100);

  // store the timer reference
  gameManager.setRoomTimer(roomId, timer);
}

// update room settings in host.json
function updateRoomSettings(newSettings) {
  try {
    const hostAccountPath = path.join(__dirname, "../data/accounts/host.json");

    if (!fs.existsSync(hostAccountPath)) {
      console.error("Host account file not found:", hostAccountPath);
      return;
    }

    const hostData = JSON.parse(fs.readFileSync(hostAccountPath, "utf8"));

    hostData.roomSettings = {
      ...hostData.roomSettings,
      ...newSettings,
    };

    fs.writeFileSync(
      hostAccountPath,
      JSON.stringify(hostData, null, 2),
      "utf8"
    );

    roomSettings = hostData.roomSettings; // Update the in-memory settings
  } catch (error) {
    console.error("Error updating room settings:", error);
  }
}

function authenticateUser(username, password) {
  try {
    const accountsPath = path.join(__dirname, "../data/accounts/accounts.json");

    if (!fs.existsSync(accountsPath)) {
      console.error("Accounts file not found:", accountsPath);

      return null;
    }

    const data = JSON.parse(fs.readFileSync(accountsPath, "utf8"));
    const user = data.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!user || user.password != password) {
      console.error("Invalid username or password:", username);
      return null; // Invalid username or password
    }

    return user;
  } catch (error) {
    console.error("Error reading accounts file:", error);
    return null;
  }
}

function updatePlayerScores(players) {
  try {
    const accountsPath = path.join(__dirname, "../data/accounts/accounts.json");
    const data = JSON.parse(fs.readFileSync(accountsPath, "utf8"));

    let updated = false;
    players.forEach((player) => {
      if (!player.userId) return;

      const user = data.users.find((user) => (user.id = player.userId));
      if (user) {
        if (!user.score || player.score > user.score) {
          user.score = player.score;
          updated = true;
        }
      }
    });

    if (updated) {
      fs.writeFileSync(accountsPath, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Error updating player scores:", error);
  }
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default setupSocketServer;
