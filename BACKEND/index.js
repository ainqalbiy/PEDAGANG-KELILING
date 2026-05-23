const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDatabase } = require("./database/db");

const gameRoutes = require("./routes/game");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();
const PORT = 3000;

// -----------------------------------------------
// Middleware
// -----------------------------------------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------
// Routes
// -----------------------------------------------
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// -----------------------------------------------
// Health check — cek apakah server jalan
// -----------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server Pedagang Keliling berjalan!",
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------
// Serve frontend (opsional)
// Aktifkan kalau frontend dan backend digabung
// -----------------------------------------------
// app.use(express.static(path.join(__dirname, "../frontend")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/index.html"));
// });

// -----------------------------------------------
// Error handler global
// -----------------------------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

// -----------------------------------------------
// Start server — inisialisasi DB dulu baru listen
// -----------------------------------------------
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log("========================================");
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📦 Database SQLite siap`);
      console.log(`🎮 Game Pedagang Keliling siap dimainkan!`);
      console.log("========================================");
      console.log("Endpoints tersedia:");
      console.log(`  GET  http://localhost:${PORT}/api/health`);
      console.log(`  POST http://localhost:${PORT}/api/game/start`);
      console.log(`  POST http://localhost:${PORT}/api/game/submit`);
      console.log(`  POST http://localhost:${PORT}/api/game/npc-comment`);
      console.log(`  GET  http://localhost:${PORT}/api/leaderboard`);
      console.log(`  POST http://localhost:${PORT}/api/leaderboard`);
      console.log(`  GET  http://localhost:${PORT}/api/leaderboard/rank/:score`);
      console.log("========================================");
    });
  } catch (err) {
    console.error("❌ Gagal menjalankan server:", err);
    process.exit(1);
  }
}

startServer();