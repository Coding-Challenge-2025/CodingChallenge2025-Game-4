import GameManger from "./gameManager.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gameManager = new GameManger();
const GLOBAL_ROOM_ID = "123456";

export default function setupSocketServer(io) {
  // create global room on server start
  createGlobalRoom();

  // middleware
  io.use((socket, next) => {
    const { username, password } = socket.handshake.auth;

    try {
      const user = authenticateUser(username, password);
      socket.user = user;
      next();
    } catch (error) {
      console.error("Authentication failed:", error.message);
      return next(new Error(error.message));
    }
  });

  io.on("connection", (socket) => {
    // Check if the user is already in a room
    console.log(
      "User connected:",
      socket.user.username,
      socket.user.id,
      socket.id
    );

    const globalRoom = gameManager.getRoom(GLOBAL_ROOM_ID);
    if (!globalRoom) {
      socket.emit("error", "Global room not found");
      return;
    }

    let player = checkPlayerExists(socket.id, socket.user);
    socket.join(GLOBAL_ROOM_ID);

    const playerInRoom = gameManager.checkPlayerInRoom(
      GLOBAL_ROOM_ID,
      socket.user.id
    );
    if (!playerInRoom) {
      // Add the player to the global room
      gameManager.addPlayerToRoom(GLOBAL_ROOM_ID, socket.id, player);
      writePlayerDataToFile(socket.user.id, player);
    } else {
      // Update the player socket ID
      const oldSocketId = player.socketId;

      console.log(`Reconnecting player: ${player}`);

      // Update the socket ID in the global room
      if (oldSocketId !== socket.id) {
        console.log("Updating player socket ID:", oldSocketId, "to", socket.id);
        const updatedPlayer = gameManager.updatePlayerInRoom(
          GLOBAL_ROOM_ID,
          oldSocketId,
          {
            ...player,
            socketId: socket.id,
          }
        );

        // Update JSON file for user
        writePlayerDataToFile(socket.user.id, updatedPlayer);

        socket.emit("reconnected", {
          roomId: GLOBAL_ROOM_ID,
          playerId: socket.user.id,
        });
      }
    }

    // Emit event to the client
    socket.emit("room_joined", {
      roomId: GLOBAL_ROOM_ID,
      playerId: socket.user.id,
      playerName: socket.user.username,
      isHost: socket.user.isHost,
    });

    io.to(GLOBAL_ROOM_ID).emit("player_joined", {
      player: {
        id: socket.id,
        userId: socket.user.id,
        username: socket.username,
        isHost: socket.isHost || false,
      },
      room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
    });

    socket.on("start_game", () => {
      try {
        const room = gameManager.getRoom(GLOBAL_ROOM_ID);

        if (!socket.user.isHost) {
          throw new Error("Only the host can start the game");
        }

        const minPlayers = room.minPlayers;
        if (room.players.length < minPlayers) {
          throw new Error(
            `Not enough players to start the game. Minimum required: ${minPlayers}`
          );
        }

        console.log("Starting game...")
        handleStartGame(room);
        console.log("Game started: ", gameManager.getRoomDetails(GLOBAL_ROOM_ID));
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("end_game", () => {
      try {
        if (!socket.user.isHost) {
          console.error("Only the host can end the game");
          throw new Error("Only the host can end the game");
        }

        console.log("Ending game...");
        gameManager.endGame(GLOBAL_ROOM_ID);
        console.log("Game ended: ", gameManager.getRoomDetails(GLOBAL_ROOM_ID));
        io.to(GLOBAL_ROOM_ID).emit("game_ended", {
          message: "The game has ended by the host",
          room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
        });
      } catch (error) {
        console.error("Error ending game:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("admin_command", ({ command, data }) => {
      if (!socket.user.isHost) {
        socket.emit("error", {
          message: "Only the host can execute admin commands",
        });
        return;
      }

      switch (command) {
        case "kick_player":
          if (data.playerId) {
            const playerSocket = io.sockets.sockets.get(data.playerId);
            if (playerSocket) {
              let player = gameManager.findPlayerInRoom(
                GLOBAL_ROOM_ID,
                data.playerId
              );
              if (player) {
                player = {
                  ...player,
                  status: "waiting",
                };
                writePlayerDataToFile(player.userId, player);
              }

              playerSocket.emit("kicked", {
                reason: data.reason || "You have been kicked by the host",
              });
              playerSocket.disconnect(true);
            }

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

    socket.on("request_roomdetails", () => {
      // console.log(
      //   "Requesting room details: ",
      //   gameManager.getRoomDetails(GLOBAL_ROOM_ID)
      // );

      socket.emit("room_updated", {
        message: "Successfully get room details",
        room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const player = gameManager
        .getPlayersInRoom(GLOBAL_ROOM_ID)
        .find((player) => player.socketId === socket.id);

      if (!player) {
        console.log("Player not found in the room");
        return;
      }

      gameManager.removePlayerFromRoom(GLOBAL_ROOM_ID, socket.id);
      writePlayerDataToFile(player.userId, {
        ...player,
        socketId: null,
      });

      // notify all players in the room about the disconnection
      io.to(GLOBAL_ROOM_ID).emit("player_disconnected", {
        playerId: socket.id,
        playerName: socket.username,
        room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
      });
    });
  });

  function handleStartGame(room) {
    // start the game
    gameManager.startGame(GLOBAL_ROOM_ID);
    for (const player of room.players) {
      writePlayerDataToFile(player.userId, player);
    }

    const roundDuration = room.gameDuration * 60 * 1000;
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

        // handle game end
      } else {
        // send time updates every second
        if (timeLeft % 1000 < 100) {
          io.to(GLOBAL_ROOM_ID).emit("time_update", {
            timeLeft,
            // formattedTime: formatTime(timeLeft),
          });
        }
      }
    }, 100);

    // store the timer reference
    gameManager.setRoomTimer(GLOBAL_ROOM_ID, timer);
  }
}

function checkPlayerExists(socketId, player) {
  // check if there is any <playerId>.json file in the session folder
  const playerPath = path.join(
    __dirname,
    "../data/session",
    `${player.id}.json`
  );

  if (fs.existsSync(playerPath)) {
    const data = JSON.parse(fs.readFileSync(playerPath, "utf8"));
    return {
      ...data,
      socketId: socketId,
    };
  }

  return {
    socketId: socketId,
    userId: player.id,
    username: player.username,
    score: 0,
    isHost: player.isHost,
    status: player.isHost ? "controlling" : "waiting",
  };
}

function authenticateUser(username, password) {
  try {
    const accountsPath = path.join(__dirname, "../data/accounts.json");

    if (fs.existsSync(accountsPath)) {
      const data = JSON.parse(fs.readFileSync(accountsPath, "utf8"));
      let user = data.users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      );

      if (user && user.password.toString() === password.toString()) {
        const isHost = user.username.toLowerCase() === "admin";
        user = {
          ...user,
          isHost,
        };

        return user;
      } else {
        throw new Error("Invalid username or password");
      }
    } else {
      throw new Error("Accounts file not found");
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

function createGlobalRoom() {
  try {
    const globalRoomConfig = getGlobalRoomSettings();

    const room = gameManager.createRoom(GLOBAL_ROOM_ID, {
      ...globalRoomConfig,
      createdBy: "system",
      creatorName: "system",
      hostId: "000",
      isActive: true,
    });

    console.log("Global room created successfully: ", room);
  } catch (error) {
    console.error("Error creating global room:", error);
  }
}

function getGlobalRoomSettings() {
  try {
    const settingsPath = path.join(__dirname, "../data/room_settings.json");
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      return data.settings;
    } else {
      throw new Error("Global room settings file not found");
    }
  } catch (error) {
    console.error("Error reading global room settings file:", error);
    throw new Error("Failed to load global room settings");
  }
}

function writePlayerDataToFile(playerId, data) {
  const playerPath = path.join(
    __dirname,
    "../data/session",
    `${playerId}.json`
  );

  try {
    fs.writeFileSync(playerPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing player data to file:", error);
    throw new Error("Failed to write player data");
  }
}
