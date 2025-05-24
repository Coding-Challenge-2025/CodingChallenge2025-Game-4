import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, options) {
    if (this.rooms.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`);
    }

    const room = {
      id: roomId,
      name: options.name || "Default Room",
      minPlayersToStart: options.minPlayersToStart || 2,
      maxPlayers: options.maxPlayers || 4,
      createdBy: options.createdBy,
      createdAt: Date.now(),
      players: [],
      gameDuration: options.gameDuration || 10,
      gameInProgress: false,
      gameStartTime: null,
      gameEndTime: null,
      timer: null,
      isActive: options.isActive !== undefined ? options.isActive : true,
      hostId: options.hostId || null,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomDetails(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    return {
      id: room.id,
      name: room.name,
      minPlayersToStart: room.minPlayersToStart,
      maxPlayers: room.maxPlayers,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      gameInProgress: room.gameInProgress,
      gameDuration: room.gameDuration,
      gameEndTime: room.gameEndTime,
      isActive: room.isActive,
      hostId: room.hostId,
      players: room.players,
    };
  }

  addPlayerToRoom(roomId, playerSocketId, playerData) {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    if (room.players.length > room.maxPlayers) {
      throw new Error(`Room ${roomId} is full`);
    }

    if (room.players.some((player) => player.socketId === playerSocketId)) {
      throw new Error(`Player ${playerId} is already in the room`);
    }

    room.players.push({
      ...playerData,
      socketId: playerSocketId,
    });
  }

  checkPlayerInRoom(roomId, playerId) {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    return room.players.some((player) => player.userId === playerId);
  }

  removePlayerFromRoom(roomId, playerSocketId) {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.players = room.players.filter(
      (player) => player.socketId !== playerSocketId
    );
  }

  updatePlayerInRoom(roomId, playerSocketId, playerData) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const playerIndex = room.players.findIndex(
      (player) => player.socketId === playerSocketId
    );
    if (playerIndex === -1) {
      throw new Error(`Player ${playerSocketId} not found in room ${roomId}`);
    }

    room.players[playerIndex] = {
      ...room.players[playerIndex],
      ...playerData,
    };

    return room.players[playerIndex];
  }

  findPlayerInRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    // print all players id in the room
    const playerIds = room.players.map((player) => player.userId);
    // console.log("Player IDs in room:", playerIds);

    const player = room.players.find((player) => player.userId === playerId);
    return player || null;
  }

  getPlayersInRoom(roomId) {
    const room = this.getRoom(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    return room.players;
  }

  startGame(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.gameInProgress = true;

    room.players.forEach((player) => {
      if (!player.isHost) {
        player.status = "playing";
      }
    });
  }

  endGame(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.gameInProgress = false;
    clearInterval(room.timer);
    room.timer = null;

    // change all players status to waiting (except the host)
    room.players.forEach((player) => {
      if (player.socketId !== room.hostId) {
        player.status = "waiting";
      }
    });
  }

  setRoomTimer(roomId, timer) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.timer = timer;
  }

  getRoomTimer(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    return room.timer;
  }

  clearRoomTimer(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.timer = null;
  }

  resetGame(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.roomEndTime = null;
    room.players.forEach((player) => {
      player.status = "waiting";
    });
  }

  resetAllScores(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.players.forEach((player) => {
      player.score = 0;
    });
  }

  resetAllPlayers(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.players.forEach((player) => {
      player.status = "waiting";
      player.score = 0;
      player.passedShapes = [];
    });

    room.gameInProgress = false;
    room.gameStartTime = null;
    room.gameEndTime = null;
    clearInterval(room.timer);
    room.timer = null;
  }

  updatePlayerScore(roomId, playerId, newScore) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    let player = room.players.find((player) => player.userId === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in room ${roomId}`);
    }

    player.score = newScore;
    return player;
  }

  assignHostToPlayer(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const player = room.players.find((p) => p.socketId === playerId);
    if (!player) return;

    // Remove host status from all players
    room.players.forEach((player) => (player.isHost = false));

    // Assign the host to the player
    player.isHost = true;
    room.createdBy = player.socketId;
    room.creatorName = player.username;
    room.hostId = player.userId;
  }

  updateRoomSettings(roomId, settings) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.name = settings.name;
    room.minPlayersToStart = settings.minPlayersToStart;
    room.maxPlayers = settings.maxPlayers;
    room.gameDuration = settings.gameDuration;

    return room;
  }

  checkShapePassed(roomId, playerId, shapeId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const player = room.players.find((p) => p.userId === playerId);
    if (!player.passedShapes) return true;

    if (!player) {
      throw new Error(`Player ${playerId} not found in room ${roomId}`);
    }

    console.log("Player passed shapes:", player.passedShapes);

    return !player.passedShapes.includes(shapeId);
  }

  addShapeToPassedShapes(roomId, playerId, shapeId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const player = room.players.find((p) => p.userId === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in room ${roomId}`);
    }

    if (!player.passedShapes) {
      player.passedShapes = [];
    }

    player.passedShapes.push(shapeId);
  }

  getGameResults(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    // if (!room.gameInProgress) {
    //   throw new Error(`Game in room ${roomId} is not in progress`);
    // }

    const playersResult = room.players.map((player) => ({
      userId: player.userId,
      username: player.username,
      score: player.score,
      passedShapes: player.passedShapes || [],
    }));

    return {
      roomId: room.id,
      gameEndTime: room.gameEndTime,
      players: playersResult,
    };
  }
}

export default GameManager;
