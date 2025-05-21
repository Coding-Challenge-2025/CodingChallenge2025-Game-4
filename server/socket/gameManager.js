import fs from 'fs';
import path from 'path';
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
            isPrivate: options.isPrivate || false,
            maxPlayers: options.maxPlayers || 4,
            createdBy: options.createdBy,
            creatorName: options.creatorName,
            createdAt: Date.now(),
            players: [],
            gameInProgress: false,
            gameStartTime: null,
            gameEndTime: null,
            timer: null,
            chat: [],
            isActive: options.isActive !== undefined ? options.isActive : true,
            hostId: options.hostId || null
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
            isPrivate: room.isPrivate,
            maxPlayers: room.maxPlayers,
            createdBy: room.createdBy,
            creatorName: room.creatorName,
            createdAt: room.createdAt,
            players: room.players,
            gameInProgress: room.gameInProgress,
            gameEndTime: room.gameEndTime,
            isActive: room.isActive,
            hostId: room.hostId,
        };
    }

    addPlayerToRoom(roomId, playerId, playerData) {
        const room = this.getRoom(roomId);

        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        if (room.players.length >= room.maxPlayers) {
            throw new Error(`Room ${roomId} is full`);
        }

        if (room.players.some(player => player.id === playerId)) {
            throw new Error(`Player ${playerId} is already in the room`);
        }

        room.players.push(playerData);
    }

    removePlayerFromRoom(roomId, playerId) {
        const room = this.getRoom(roomId);

        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.players = room.players.filter(player => player.id !== playerId);
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
            player.score = 0;
            player.status = 'playing';
            player.currentShape = null;
            player.roundScores = [];
        })
    }

    endGame(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.gameInProgress = false;
        
        room.players.forEach((player) => {
            player.status = 'waiting';
            player.currentShape = null;
            player.roundScores = [];
            player.completionTime = null;
        })
    }

    setRoomTimer(roomId, timer) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.timer = timer;
    }

    udpatePlayerScore(roomId, playerId, score, shape) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        const player = room.players.find(player => player.id === playerId);
        if (!player) {
            throw new Error(`Player ${playerId} not found in room ${roomId}`);
        }

        player.score = score;
        player.status = "summitted";
        player.currentShape = shape;
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
            player.roundScores = [];
        })
    }

    assignHostToPlayer(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        const player = room.players.find((p) => p.id === playerId);
        if (!player) return;

        // Remove host status from all players
        room.players.forEach((player) => (p.isHost = false));

        // Assign the host to the player
        player.isHost = true;
        room.createdBy = player.id;
        room.creatorName = player.username;
        room.hostId = player.userId;
    }

    updateRoomName(roomId, name) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.name = name;
    }

    updateMaxPlayers(roomId, maxPlayers) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.maxPlayers = maxPlayers;
    }
}

export default GameManager;