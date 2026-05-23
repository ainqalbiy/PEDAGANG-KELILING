const express = require("express");
const router = express.Router();
const { run, query } = require("../database/db");

// -----------------------------------------------
// GET /api/leaderboard
// Ambil top 10 skor tertinggi
// -----------------------------------------------
router.get("/", (req, res) => {
  try {
    const rows = query(
      `SELECT 
        id,
        name,
        score,
        efficiency,
        rounds_won,
        created_at
       FROM leaderboard
       ORDER BY score DESC, efficiency DESC
       LIMIT 10`
    );

    // Tambah ranking ke setiap row
    const ranked = rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      score: row.score,
      efficiency: row.efficiency,
      roundsWon: row.rounds_won,
      createdAt: row.created_at,
    }));

    res.json({ leaderboard: ranked });
  } catch (err) {
    console.error("Error GET /leaderboard:", err);
    res.status(500).json({ error: "Gagal mengambil leaderboard." });
  }
});

// -----------------------------------------------
// POST /api/leaderboard
// Simpan skor akhir pemain
// -----------------------------------------------
router.post("/", (req, res) => {
  try {
    const { name, score, efficiency, roundsWon } = req.body;

    // Validasi input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Nama tidak boleh kosong." });
    }
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Skor tidak valid." });
    }

    const cleanName = name.trim().slice(0, 30);

    // Cek apakah nama sudah ada di leaderboard
    const existing = query(
      `SELECT id, score FROM leaderboard WHERE name = ? LIMIT 1`,
      [cleanName]
    );

    if (existing.length > 0) {
      // Kalau skor baru lebih tinggi, update
      if (score > existing[0].score) {
        run(
          `UPDATE leaderboard 
           SET score = ?, efficiency = ?, rounds_won = ?, created_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [score, efficiency || 0, roundsWon || 0, existing[0].id]
        );
        return res.json({
          message: "Skor diperbarui!",
          updated: true,
          name: cleanName,
          score,
        });
      } else {
        // Skor lama lebih tinggi, tidak perlu update
        return res.json({
          message: "Skor lamamu lebih tinggi, tetap dipertahankan.",
          updated: false,
          name: cleanName,
          score: existing[0].score,
        });
      }
    }

    // Nama baru — insert ke leaderboard
    run(
      `INSERT INTO leaderboard (name, score, efficiency, rounds_won)
       VALUES (?, ?, ?, ?)`,
      [cleanName, score, efficiency || 0, roundsWon || 0]
    );

    res.json({
      message: "Skor berhasil disimpan!",
      updated: false,
      name: cleanName,
      score,
    });
  } catch (err) {
    console.error("Error POST /leaderboard:", err);
    res.status(500).json({ error: "Gagal menyimpan skor." });
  }
});

// -----------------------------------------------
// GET /api/leaderboard/rank/:score
// Cek posisi ranking skor tertentu
// -----------------------------------------------
router.get("/rank/:score", (req, res) => {
  try {
    const score = parseInt(req.params.score);

    if (isNaN(score)) {
      return res.status(400).json({ error: "Skor tidak valid." });
    }

    const higher = query(
      `SELECT COUNT(*) as count FROM leaderboard WHERE score > ?`,
      [score]
    );

    const rank = higher[0].count + 1;
    const total = query(`SELECT COUNT(*) as count FROM leaderboard`);

    res.json({
      rank,
      total: total[0].count,
      message:
        rank === 1
          ? "Kamu di posisi teratas!"
          : `Kamu di posisi #${rank} dari ${total[0].count} pemain.`,
    });
  } catch (err) {
    console.error("Error GET /leaderboard/rank:", err);
    res.status(500).json({ error: "Gagal mengecek ranking." });
  }
});

module.exports = router;