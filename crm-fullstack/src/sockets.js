 const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

let ioInstance;

async function init(server) {
  ioInstance = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
  });

  // Redis adapter setup
  try {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    ioInstance.adapter(createAdapter(pubClient, subClient)); // ✅ correct
    console.log("✅ Redis connected for Socket.IO");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }

  // Auth middleware
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    try {
      const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.join(decoded.userId);
      console.log(`✅ Socket connected: ${decoded.email}, joined room: ${decoded.userId}`);
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  ioInstance.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.user.email}`);

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.email}`);
    });

    socket.on("pingServer", (msg) => {
      socket.emit("pongClient", "Pong! Server is alive 🚀");
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) throw new Error("Socket.IO not initialized!");
  return ioInstance;
}

module.exports = { init, getIO };
