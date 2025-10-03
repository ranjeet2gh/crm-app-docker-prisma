const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const ApiResponse = require("./utils/apiResponse");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");
const { adminLimiter } = require("./middleware/rateLimiter");
const helmet = require("helmet");
dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

 
app.use("/api/admin", adminLimiter, require("./routes/admin"));
app.use("/api/auth", adminLimiter, require("./routes/auth"));

 
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json(ApiResponse.success("Server & DB healthy", { db: "connected" }));
  } catch (err) {
    res.status(500).json(ApiResponse.error("Database connection failed", 500));
  }
});

app.get("/", (req, res) =>
  res.send(`🚀 Backend is running on worker ${process.pid}`)
);

 
app.use((req, res) =>
  res.status(404).json(ApiResponse.error("Page Not Found!", 404))
);
app.use(errorHandler);

const server = http.createServer(app);

// Initialize Socket.IO (async init)
const { init } = require("./sockets");
(async () => {
  await init(server); // wait for Redis + socket setup
})();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(
    `✅ Worker ${process.pid} listening at http://localhost:${PORT}`
  )
);

 
process.on("SIGINT", async () => {
  console.log(`\n🔴 Worker ${process.pid} shutting down...`);
  await prisma.$disconnect();
  server.close(() => {
    console.log(`🟢 Worker ${process.pid} stopped.`);
    process.exit(0);
  });
});

const { getIO } = require("./sockets");
module.exports = { getIO };
