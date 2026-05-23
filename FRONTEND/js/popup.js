// ========== BUKA / TUTUP POPUP ========== //
function openPopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("show");

  // Kembalikan scroll kalau tidak ada popup lain yang terbuka
  const anyOpen = document.querySelector(".popup-overlay.show");
  if (!anyOpen) document.body.style.overflow = "";
}

// Tutup popup kalau klik di luar box
document.querySelectorAll(".popup-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopup(overlay.id);
    }
  });
});

// Tutup popup dengan tombol Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const open = document.querySelector(".popup-overlay.show");
    if (open) closePopup(open.id);
  }
});

// ========== POPUP NPC ========== //
let npcTimeout = null;

function showNPCPopup(emoji, itemName, comment) {
  const popup = document.getElementById("popup-npc");
  const emojiEl = document.getElementById("npc-emoji");
  const bubbleEl = document.getElementById("npc-bubble");

  // Reset animasi
  popup.classList.remove("show", "hide");
  void popup.offsetWidth;

  emojiEl.textContent = emoji;
  bubbleEl.innerHTML = `
    <div class="npc-item-name">${itemName}</div>
    ${comment}
  `;

  popup.classList.add("show");

  // Auto hide setelah 3 detik
  clearTimeout(npcTimeout);
  npcTimeout = setTimeout(() => hideNPCPopup(), 3000);
}

function hideNPCPopup() {
  const popup = document.getElementById("popup-npc");
  popup.classList.remove("show");
  popup.classList.add("hide");
  setTimeout(() => popup.classList.remove("hide"), 200);
}

// ========== POPUP KONFIRMASI ========== //
function showKonfirmasi(selectedIds, items, budget) {
  const spent = selectedIds.reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.cost : 0);
  }, 0);

  const profit = selectedIds.reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);

  const itemNames = selectedIds
    .map((id) => {
      const item = items.find((i) => i.id === id);
      return item ? `${item.emoji} ${item.name}` : "";
    })
    .filter(Boolean)
    .join(", ");

  document.getElementById("konfirmasi-summary").innerHTML = `
    Kamu akan membawa <strong>${selectedIds.length} barang</strong>:<br>
    <span style="color:var(--muted); font-size:0.85rem;">${itemNames}</span><br><br>
    Modal dipakai: <strong style="color:#e05a45">Rp ${spent}</strong> dari Rp ${budget}<br>
    Estimasi keuntungan: <strong style="color:var(--green2)">+Rp ${profit}</strong>
  `;

  openPopup("popup-konfirmasi");
}

// ========== POPUP HASIL RONDE ========== //
function showHasil(data) {
  // Render data hasil ke popup
  renderHasil(data);
  openPopup("popup-hasil");

  // Animasi skor muncul
  setTimeout(() => {
    const playerScoreEl = document.getElementById("hasil-player-score");
    const dpScoreEl = document.getElementById("hasil-dp-score");
    playerScoreEl.classList.add("anim-count-up");
    dpScoreEl.classList.add("anim-count-up");
  }, 200);

  // Animasi win/lose pada popup box
  setTimeout(() => {
    const box = document.querySelector("#popup-hasil .popup-box");
    if (data.outcome === "win" || data.outcome === "tie") {
      box.classList.add("anim-win");
      setTimeout(() => box.classList.remove("anim-win"), 800);
    } else {
      box.classList.add("anim-lose");
      setTimeout(() => box.classList.remove("anim-lose"), 500);
    }
  }, 300);
}

// ========== POPUP AKHIR PERJALANAN ========== //
function showAkhir(gameHistory, totalPlayer, totalDP) {
  renderAkhir(gameHistory, totalPlayer, totalDP);
  openPopup("popup-akhir");
}

// ========== POPUP LEADERBOARD ========== //
async function showLeaderboard() {
  openPopup("popup-leaderboard");

  // Tampilkan loading dulu
  document.getElementById("leaderboard-list").innerHTML = `
    <div class="lb-loading">
      <div class="loading-spinner"></div>
    </div>
  `;

  // Fetch dari server
  const result = await apiGetLeaderboard();
  if (result.success) {
    renderLeaderboard(result.data.leaderboard);
  } else {
    document.getElementById("leaderboard-list").innerHTML = `
      <div class="lb-empty">Gagal memuat leaderboard.<br>${result.error}</div>
    `;
  }
}

// ========== SAVE SCORE ========== //
async function handleSaveScore() {
  const nameInput = document.getElementById("input-nama");
  const msgEl = document.getElementById("save-score-msg");
  const btn = document.getElementById("btn-save-score");

  const name = nameInput.value.trim();
  if (!name) {
    msgEl.textContent = "Masukkan namamu dulu!";
    msgEl.className = "save-score-msg error";
    nameInput.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Menyimpan...";
  msgEl.textContent = "";

  const { totalPlayerScore, totalDPScore, gameHistory } = window.gameState;
  const wins = gameHistory.filter((r) => r.outcome === "win").length;
  const efficiency = totalDPScore > 0
    ? parseFloat(((totalPlayerScore / totalDPScore) * 100).toFixed(1))
    : 100;

  const result = await apiSaveScore(name, totalPlayerScore, efficiency, wins);

  if (result.success) {
    msgEl.textContent = result.data.updated
      ? `✅ Skor diperbarui! (${result.data.score})`
      : `✅ ${result.data.message}`;
    msgEl.className = "save-score-msg success";
    btn.textContent = "Tersimpan!";
    nameInput.disabled = true;

    // Cek ranking
    const rankResult = await apiGetRank(totalPlayerScore);
    if (rankResult.success) {
      msgEl.textContent += ` — ${rankResult.data.message}`;
    }
  } else {
    msgEl.textContent = `❌ ${result.error}`;
    msgEl.className = "save-score-msg error";
    btn.disabled = false;
    btn.textContent = "Simpan Skor";
  }
}