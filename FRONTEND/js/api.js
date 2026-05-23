// ========== KONFIGURASI ========== //
const API_BASE = "http://localhost:3000/api";

// ========== HELPER FETCH ========== //
async function fetchAPI(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Terjadi kesalahan pada server.");
    }

    return { success: true, data };
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err);
    return { success: false, error: err.message };
  }
}

// ========== GAME API ========== //

// Mulai ronde baru
async function apiStartGame(sessionId, round) {
  return await fetchAPI("/game/start", "POST", { sessionId, round });
}

// Submit pilihan user
async function apiSubmitGame(sessionId, selectedIds) {
  return await fetchAPI("/game/submit", "POST", { sessionId, selectedIds });
}

// Ambil komentar NPC saat user klik item
async function apiGetNPCComment(itemId) {
  return await fetchAPI("/game/npc-comment", "POST", { itemId });
}

// ========== LEADERBOARD API ========== //

// Ambil top 10 leaderboard
async function apiGetLeaderboard() {
  return await fetchAPI("/leaderboard", "GET");
}

// Simpan skor akhir
async function apiSaveScore(name, score, efficiency, roundsWon) {
  return await fetchAPI("/leaderboard", "POST", {
    name,
    score,
    efficiency,
    roundsWon,
  });
}

// Cek posisi ranking skor tertentu
async function apiGetRank(score) {
  return await fetchAPI(`/leaderboard/rank/${score}`, "GET");
}