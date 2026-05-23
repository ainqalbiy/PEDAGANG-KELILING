const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const ITEMS = require("../data/items");
const ROUTES = require("../data/routes");
const { solveKnapsack, calculatePlayerScore, compareResults } = require("../logic/knapsack");
const { run, query } = require("../database/db");

// Simpan session aktif di memory
const activeSessions = {};

// -----------------------------------------------
// POST /api/game/start
// Mulai ronde baru — kirim 8 item acak + info rute
// -----------------------------------------------
router.post("/start", (req, res) => {
  try {
    const { sessionId, round } = req.body;

    // Validasi round
    if (round < 0 || round >= ROUTES.length) {
      return res.status(400).json({ error: "Nomor ronde tidak valid." });
    }

    // Gunakan sessionId yang ada atau buat baru
    const sid = sessionId || uuidv4();
    const route = ROUTES[round];

    // Acak 8 item dari 16 item yang tersedia
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, 8);

    // Simpan session ke memory
    activeSessions[sid] = {
      sessionId: sid,
      round,
      route,
      items: selectedItems,
      startedAt: new Date().toISOString(),
    };

    res.json({
      sessionId: sid,
      round,
      route: {
        id: route.id,
        name: route.name,
        location: route.location,
        budget: route.budget,
        emoji: route.emoji,
        description: route.description,
        welcome_message: route.welcome_message,
      },
      items: selectedItems.map((item) => ({
        id: item.id,
        emoji: item.emoji,
        name: item.name,
        cost: item.cost,
        profit: item.profit,
        description: item.description,
      })),
    });
  } catch (err) {
    console.error("Error /start:", err);
    res.status(500).json({ error: "Gagal memulai ronde." });
  }
});

// -----------------------------------------------
// POST /api/game/submit
// User submit pilihan — hitung DP, bandingkan, simpan
// -----------------------------------------------
router.post("/submit", (req, res) => {
  try {
    const { sessionId, selectedIds } = req.body;

    // Validasi session
    if (!activeSessions[sessionId]) {
      return res.status(404).json({ error: "Session tidak ditemukan." });
    }

    // Validasi selectedIds
    if (!Array.isArray(selectedIds)) {
      return res.status(400).json({ error: "selectedIds harus berupa array." });
    }

    const session = activeSessions[sessionId];
    const { items, route, round } = session;

    // Hitung skor user
    const playerResult = calculatePlayerScore(selectedIds, items);

    // Validasi budget tidak terlampaui
    if (playerResult.totalCost > route.budget) {
      return res.status(400).json({ error: "Total cost melebihi budget!" });
    }

    // Jalankan algoritma DP
    const dpResult = solveKnapsack(items, route.budget);

    // Bandingkan hasil
    const comparison = compareResults(playerResult, dpResult);

    // Ambil komentar NPC acak untuk item yang dipilih user
    const npcComments = [];
    for (const item of playerResult.selectedItems) {
      const fullItem = ITEMS.find((i) => i.id === item.id);
      if (fullItem && fullItem.npc_comment) {
        const randomComment =
          fullItem.npc_comment[
            Math.floor(Math.random() * fullItem.npc_comment.length)
          ];
        npcComments.push({
          itemName: item.name,
          emoji: item.emoji,
          comment: randomComment,
        });
      }
    }

    // Simpan riwayat ronde ke database
    run(
      `INSERT INTO round_history 
        (session_id, round, player_score, dp_score, items_chosen) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        sessionId,
        round,
        playerResult.totalProfit,
        dpResult.maxProfit,
        JSON.stringify(selectedIds),
      ]
    );

    // Tentukan pesan hasil
    const resultMessage = {
      win: route.win_message,
      tie: `Sempurna! Kamu menyamai algoritma di ${route.name}!`,
      close: `Hampir! Selisih hanya Rp ${comparison.diff} dari optimal.`,
      lose: route.lose_message,
    }[comparison.outcome];

    // Hapus session setelah submit
    delete activeSessions[sessionId];

    res.json({
      // Hasil player
      playerScore: playerResult.totalProfit,
      playerCost: playerResult.totalCost,
      playerItems: playerResult.selectedItems,

      // Hasil DP
      dpScore: dpResult.maxProfit,
      dpChosenIds: dpResult.chosenIds,
      tracebackPath: dpResult.tracebackPath,

      // Tabel DP untuk visualisasi
      dpTable: dpResult.table,
      dpColumns: dpResult.columns,

      // Perbandingan
      outcome: comparison.outcome,
      efficiency: comparison.efficiency,
      diff: comparison.diff,
      resultMessage,

      // NPC comments
      npcComments,

      // Info ronde
      round,
      routeName: route.name,
    });
  } catch (err) {
    console.error("Error /submit:", err);
    res.status(500).json({ error: "Gagal memproses submission." });
  }
});

// -----------------------------------------------
// POST /api/game/npc-comment
// Ambil komentar NPC saat user klik item (real-time)
// -----------------------------------------------
router.post("/npc-comment", (req, res) => {
  try {
    const { itemId } = req.body;

    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item tidak ditemukan." });
    }

    const randomComment =
      item.npc_comment[Math.floor(Math.random() * item.npc_comment.length)];

    res.json({
      itemId,
      itemName: item.name,
      emoji: item.emoji,
      comment: randomComment,
    });
  } catch (err) {
    console.error("Error /npc-comment:", err);
    res.status(500).json({ error: "Gagal mengambil komentar NPC." });
  }
});

module.exports = router;