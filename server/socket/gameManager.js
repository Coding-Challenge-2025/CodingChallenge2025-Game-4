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
            currentRound: 0, 
            currentShape: null,
            roundStartTime: null,
            roundEndTime: null,
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
            currentRound: room.currentRound,
            currentShape: room.currentShape,
            roundEndTime: room.roundEndTime,
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
        room.currentRound = 1;

        room.players.forEach((player) => {
            player.score = 0;
            player.status = 'playing';
            player.currentShape = null;
            player.roundScores = [];
        })
    }

    generateShapeForRoom(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        // If a specific shape was selected by the host, use that
        if (room.nextShapeId) {
            try {
                const shapeId = room.nextShapeId
                const shapePath = path.join(__dirname, `../data/shapes/shape${shapeId}.txt`)

                if (fs.existsSync(shapePath)) {
                const content = fs.readFileSync(shapePath, "utf8").trim().split("\n")
                const matrix = content.slice(1).map((line) => line.trim().split(/\s+/).map(Number))
                room.currentShape = matrix
                room.nextShapeId = null // Reset for next time
                return matrix
                }
            } catch (error) {
                console.error("Error loading selected shape file:", error)
            }
        }

        try {
            const shapeId = (room.currentRound % 5) + 1;
            const shapePath = path.join(__dirname, `../data/shapes/shape${shapeId}.txt`);

            if (fs.existsSync(shapePath)) {
                const content = fs.readFileSync(shapePath, "utf8").trim().split("\n");
                const matrix = content.slice(1).map((line) => line.trim().split(/\s+/).map(Number));
                room.currentShape = matrix;

                return matrix;
            }
        } catch (error) {
            console.error(`Error reading shape file: ${error.message}`);
            throw new Error("Failed to generate shape due to file error");
        }
    }

    setRoundTimer(roomId, endTime) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.roundEndTime = endTime;
    }

    setRoundStartTime(roomId, startTime) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.roundStartTime = startTime;
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

    allPlayersSubmitted(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        return room.players.every(player => player.status === "summitted");
    }

    endRound(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.players.forEach((player) => {
            player.roundScores = player.roundScores || [];
            player.roundScores.push({
                round: room.currentRound,
                score: player.score || 0
            })

            player.status = "waiting";
        })

        if (room.timer) {
            clearInterval(room.timer);
            room.timer = null;
        }
    }

    getRoundResults(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

        return {
            round: room.currentRound, 
            players: sortedPlayers.map((player) => ({
                id: player.id, 
                userId: player.userId,
                username: player.username,
                score: player.score || 0,
                shape: player.currentShape,
            })),
            targetShape: room.currentShape,
        }
    }

    resetRound(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} does not exist`);
        }

        room.currentRound += 1;
        room.currentShape = null;
        room.roundEndTime = null;
        room.players.forEach((player) => {
            player.status = "playing";
            player.currentShape = null;
            player.completionTime = null;
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