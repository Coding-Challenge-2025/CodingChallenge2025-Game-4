import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiRoutes from "./routes/api.route.js";
import { Server } from "socket.io";
import setupSocketServer from "./socket/socketServer.js";
import http from "http";

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSocketServer(io);

// middleware
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(express.json());

// routes
app.use("/api", apiRoutes);

// health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "VoxelCode server is running",
  });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

server.listen(PORT, () => {
  console.log(`VoxelCode server is running on port ${PORT}`);
});
