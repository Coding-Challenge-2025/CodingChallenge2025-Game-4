import gameManager from "./gameManager.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  writePlayerDataToFile,
  writeStartTimeToFile,
  writeCurrentShapeToFile,
  writeOutputShapeToFile,
  saveGameResultsToFile,
  saveLeaderboardToFile,
  updateRoomSettingsFile,
  getGlobalRoomSettingsFromFile,
} from "../utils/fileIO.js";
import { formatTime } from "../utils/helperFunc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GLOBAL_ROOM_ID = "123456";

export default function setupSocketServer(io) {
  // create global room on
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

    try {
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
          console.log(
            "Updating player socket ID:",
            oldSocketId,
            "to",
            socket.id
          );
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
    } catch (error) {
      // console.error("Error during connection:", error);
      socket.emit("error", error.message);
      return;
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

        handleStartGame(room);
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("end_game", () => {
      try {
        const room = gameManager.getRoom(GLOBAL_ROOM_ID);

        if (!socket.user.isHost) {
          console.error("Only the host can end the game");
          throw new Error("Only the host can end the game");
        }

        handleEndgame(room);
      } catch (error) {
        console.error("Error ending game:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("submit_solution", ({ shapeId, data }) => {
      handleSubmitSolution(socket, shapeId, data);
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
              message: `Player ${data.playerName} has been kicked`,
              players: gameManager.getPlayersInRoom(GLOBAL_ROOM_ID),
            });
          }

          break;

        case "reset_scores":
          gameManager.resetAllScores(GLOBAL_ROOM_ID);
          const players = gameManager.getPlayersInRoom(GLOBAL_ROOM_ID);

          for (const player of players) {
            writePlayerDataToFile(player.userId, player);
          }

          io.to(GLOBAL_ROOM_ID).emit("scores_reset", {
            message: "Scores have been reset",
            players,
          });

          break;

        case "reset_players":
          gameManager.resetAllPlayers(GLOBAL_ROOM_ID);
          const resetPlayers = gameManager.getPlayersInRoom(GLOBAL_ROOM_ID);

          for (const player of resetPlayers) {
            writePlayerDataToFile(player.userId, player);
          }

          io.to(GLOBAL_ROOM_ID).emit("players_reset", {
            message: "Players have been reset",
            players: resetPlayers,
          });

          break;

        case "update_score":
          console.log(
            `Updating score for player: ${data.playerId} to ${data.score}`
          );
          if (data.playerId && data.score) {
            let updatedPlayer = gameManager.updatePlayerScore(
              GLOBAL_ROOM_ID,
              data.playerId,
              data.score
            );

            writePlayerDataToFile(data.playerId, updatedPlayer);
            socket.emit("score_updated", {
              message: "Score updated successfully",
              score: updatedPlayer.score,
              totalScore: updatedPlayer.score,
            });
            io.to(GLOBAL_ROOM_ID).emit("scores_updated", {
              message: "Scores have been updated",
              players: gameManager.getPlayersInRoom(GLOBAL_ROOM_ID),
            });
          }

          break;

        case "change_settings":
          if (data.settings) {
            console.log("Updating room settings:", data.settings);
            gameManager.updateRoomSettings(GLOBAL_ROOM_ID, data.settings);
            updateRoomSettingsFile(data.settings);

            io.to(GLOBAL_ROOM_ID).emit("settings_changed", {
              settings: data.settings,
              room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
            });
          }

          break;

        default:
          socket.emit("error", { message: "Unknown command" });
          break;
      }
    });

    socket.on("request_roomdetails", () => {
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
    console.log("Starting game in room:", room.id);
    // check for existing timer
    const existingTimer = gameManager.getRoomTimer(GLOBAL_ROOM_ID);
    if (existingTimer) {
      clearInterval(existingTimer);
      gameManager.clearInterval(GLOBAL_ROOM_ID);
    }

    // start the game
    gameManager.startGame(GLOBAL_ROOM_ID);
    for (const player of room.players) {
      writePlayerDataToFile(player.userId, player);
      writeStartTimeToFile();
    }

    const gameDuration = room.gameDuration * 60 * 1000;
    const endTime = Date.now() + gameDuration;

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

        // end game
        // Auto-end the game when timer expires
        gameManager.endGame(GLOBAL_ROOM_ID);
        io.to(GLOBAL_ROOM_ID).emit("game_ended", {
          message: "Time's up! The game has ended.",
          room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
        });
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
  }

  function handleEndgame(room) {
    console.log("Ending game in room:", room.id);
    // Clear the timer before ending the game
    const existingTimer = gameManager.getRoomTimer(GLOBAL_ROOM_ID);
    if (existingTimer) {
      clearInterval(existingTimer);
      gameManager.clearRoomTimer(GLOBAL_ROOM_ID);
    }

    gameManager.endGame(GLOBAL_ROOM_ID);
    saveGameResultsToFile(
      GLOBAL_ROOM_ID,
      gameManager.getGameResults(GLOBAL_ROOM_ID)
    );

    const leaderboard = gameManager.getGameLeaderboard(GLOBAL_ROOM_ID);
    saveLeaderboardToFile(leaderboard);

    // update all players in file
    const players = gameManager.getPlayersInRoom(GLOBAL_ROOM_ID);
    for (const player of players) {
      writePlayerDataToFile(player.userId, player);
    }

    io.to(GLOBAL_ROOM_ID).emit("game_ended", {
      message: "The game has ended by the host",
      room: gameManager.getRoomDetails(GLOBAL_ROOM_ID),
    });
  }

  function handleSubmitSolution(socket, shapeId, data) {
    // check if shape is passed
    const isShapePassed = gameManager.checkShapePassed(
      GLOBAL_ROOM_ID,
      socket.user.id,
      shapeId
    );

    // write the current shape to file --> update audience view
    writeCurrentShapeToFile(socket.user.id, shapeId, data.output);

    if (data.similarity === 100) {
      if (!isShapePassed) {
        gameManager.addShapeToPassedShapes(
          GLOBAL_ROOM_ID,
          socket.user.id,
          shapeId
        );
        // store the latest shape (or passed shape) in the output folder
        writeOutputShapeToFile(socket.user.id, shapeId, data.output);

        const player = gameManager.findPlayerInRoom(
          GLOBAL_ROOM_ID,
          socket.user.id
        );

        if (player) {
          console.log(
            `Player ${player.username} passed shape ${shapeId} and got ${data.score} points`
          );

          player.score += data.score;
          writePlayerDataToFile(player.userId, player);
        }

        socket.emit("score_updated", {
          message: `You passed the shape ${shapeId} and got ${data.score} points`,
          playerId: socket.user.id,
          playerName: player.username,
          score: data.score,
          totalScore: player.score,
        });

        io.to(GLOBAL_ROOM_ID).emit("scores_updated", {
          message: "Scores have been updated",
          playerId: socket.user.id,
          playerName: player.username,
          score: data.score,
          players: gameManager.getPlayersInRoom(GLOBAL_ROOM_ID),
        });
      }
    } else {
      if (!isShapePassed) {
        console.log(
          `Player ${socket.user.username} (${socket.user.id}) submitted solution for shape ${shapeId} with similarity ${data.similarity}`
        );

        // write the output shape to file
        writeOutputShapeToFile(socket.user.id, shapeId, data.output);
      } else {
        socket.emit("error", {
          message: `You cannot resubmit a solution for shape ${shapeId} as you have already passed it`,
        });
      }
    }
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
        (user) => user.authname.toLowerCase() === username.toLowerCase()
      );

      if (user && user.password.toString() === password.toString()) {
        const isHost = user.authname.toLowerCase() === "admin";
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
    const globalRoomConfig = getGlobalRoomSettingsFromFile();
    gameManager.createRoom(GLOBAL_ROOM_ID, {
      ...globalRoomConfig,
      createdBy: "system",
      creatorName: "system",
      hostId: "000",
      isActive: true,
    });
  } catch (error) {
    console.error("Error creating global room:", error);
  }
}
