// ========== STATE GLOBAL ========== //
window.gameState = {
  sessionId: null,
  round: 0,
  totalRounds: 5,
  items: [],
  selectedIds: [],
  budget: 0,
  totalPlayerScore: 0,
  totalDPScore: 0,
  gameHistory: [],
};

// ========== INISIALISASI GAME ========== //
async function initGame() {
  // Tampilkan tutorial di ronde pertama
  if (window.gameState.round === 0) {
    openPopup("popup-tutorial");
  }

  await startRound();
}

// ========== MULAI RONDE ========== //
async function startRound() {
  const state = window.gameState;

  // Reset pilihan
  state.selectedIds = [];

  // Render stage dots
  renderStageDots(state.round, state.totalRounds);

  // Tampilkan shimmer loading
  renderShimmer();

  // Reset DP visualizer
  document.getElementById("dp-status-badge").textContent = "Pilih barang untuk melihat DP";
  document.getElementById("dp-status-badge").className = "dp-badge";
  document.getElementById("dp-bars").innerHTML = "";
  document.getElementById("dp-table").innerHTML = "";
  document.getElementById("dp-traceback").innerHTML = "";
  document.getElementById("dp-simple-info").innerHTML =
    `<p class="dp-simple-text">Pilih barang untuk melihat analisis real-time.</p>`;
  document.getElementById("stat-dp").textContent = "???";

  // Fetch ronde baru dari server
  const result = await apiStartGame(state.sessionId, state.round);

  if (!result.success) {
    alert("Gagal memuat ronde: " + result.error);
    return;
  }

  const { sessionId, route, items } = result.data;

  // Simpan ke state
  state.sessionId = sessionId;
  state.items = items;
  state.budget = route.budget;

  // Render UI
  renderItems(items, state.selectedIds, state.budget);
  renderKeranjang(state.selectedIds, items);
  renderStatusBar(state.selectedIds, items, state.budget, state.totalPlayerScore);
  renderRouteInfo(route);

  // Tampilkan welcome message NPC
  setTimeout(() => {
    showNPCPopup("🧑‍🌾", route.name, route.welcome_message);
  }, 600);
}

// ========== HANDLE KLIK ITEM ========== //
async function handleItemClick(itemId) {
  const state = window.gameState;
  const item = state.items.find((i) => i.id === itemId);
  if (!item) return;

  const isSelected = state.selectedIds.includes(itemId);

  if (isSelected) {
    // Deselect item
    state.selectedIds = state.selectedIds.filter((id) => id !== itemId);
  } else {
    // Cek budget
    const spent = state.selectedIds.reduce((sum, id) => {
      const i = state.items.find((it) => it.id === id);
      return sum + (i ? i.cost : 0);
    }, 0);

    if (spent + item.cost > state.budget) return;

    // Select item
    state.selectedIds.push(itemId);

    // Fetch komentar NPC dari server
    const npcResult = await apiGetNPCComment(itemId);
    if (npcResult.success) {
      const { emoji, itemName, comment } = npcResult.data;
      showNPCPopup(emoji, itemName, comment);
    }
  }

  // Update semua UI
  renderItems(state.items, state.selectedIds, state.budget);
  renderKeranjang(state.selectedIds, state.items);
  renderStatusBar(
    state.selectedIds,
    state.items,
    state.budget,
    state.totalPlayerScore
  );

  // Update DP visualizer real-time
  await updateDPVisualizer(state.items, state.selectedIds, state.budget);
}

// ========== HANDLE HAPUS ITEM DARI KERANJANG ========== //
function handleRemoveItem(itemId) {
  const state = window.gameState;
  state.selectedIds = state.selectedIds.filter((id) => id !== itemId);

  renderItems(state.items, state.selectedIds, state.budget);
  renderKeranjang(state.selectedIds, state.items);
  renderStatusBar(
    state.selectedIds,
    state.items,
    state.budget,
    state.totalPlayerScore
  );

  updateDPVisualizer(state.items, state.selectedIds, state.budget);
}

// ========== HANDLE KLIK BERANGKAT ========== //
function handleBerangkat() {
  const state = window.gameState;
  if (state.selectedIds.length === 0) return;
  showKonfirmasi(state.selectedIds, state.items, state.budget);
}

// ========== HANDLE KONFIRMASI OK ========== //
async function handleKonfirmasiOK() {
  closePopup("popup-konfirmasi");

  const state = window.gameState;

  // Disable tombol saat loading
  const btn = document.getElementById("btn-berangkat");
  btn.disabled = true;
  btn.textContent = "Menghitung...";

  // Submit ke server
  const result = await apiSubmitGame(state.sessionId, state.selectedIds);

  btn.textContent = "Berangkat & Jual ➜";

  if (!result.success) {
    alert("Gagal submit: " + result.error);
    btn.disabled = false;
    return;
  }

  const data = result.data;

  // Update total skor
  state.totalPlayerScore += data.playerScore;
  state.totalDPScore += data.dpScore;

  // Simpan riwayat ronde
  state.gameHistory.push({
    round: state.round,
    playerScore: data.playerScore,
    dpScore: data.dpScore,
    outcome: data.outcome,
  });

  // Update stat DP
  document.getElementById("stat-dp").textContent = `+Rp ${data.dpScore}`;
  document.getElementById("stat-total").textContent =
    `+Rp ${state.totalPlayerScore}`;

  // Tampilkan hasil
  showHasil({
    ...data,
    items: state.items,
    round: state.round,
  });
}

// ========== HANDLE NEXT ROUND ========== //
async function handleNextRound() {
  closePopup("popup-hasil");

  window.gameState.round++;

  if (window.gameState.round >= window.gameState.totalRounds) {
    handleFinishGame();
    return;
  }

  await startRound();
}

// ========== HANDLE FINISH GAME ========== //
function handleFinishGame() {
  closePopup("popup-hasil");
  const state = window.gameState;
  showAkhir(state.gameHistory, state.totalPlayerScore, state.totalDPScore);
}

// ========== EVENT LISTENERS ========== //
document.addEventListener("DOMContentLoaded", () => {
  // Tombol header
  document.getElementById("btn-tutorial").addEventListener("click", () => {
    openPopup("popup-tutorial");
  });

  document.getElementById("btn-leaderboard").addEventListener("click", () => {
    showLeaderboard();
  });

  // Tombol game
  document.getElementById("btn-berangkat").addEventListener("click", handleBerangkat);

  document.getElementById("btn-reset").addEventListener("click", () => {
    window.gameState.selectedIds = [];
    const state = window.gameState;
    renderItems(state.items, state.selectedIds, state.budget);
    renderKeranjang(state.selectedIds, state.items);
    renderStatusBar(state.selectedIds, state.items, state.budget, state.totalPlayerScore);
    updateDPVisualizer(state.items, state.selectedIds, state.budget);
  });

  // Tombol konfirmasi
  document.getElementById("btn-konfirmasi-ok").addEventListener("click", handleKonfirmasiOK);

  // Tombol hasil ronde
  document.getElementById("btn-next-round").addEventListener("click", handleNextRound);
  document.getElementById("btn-finish-game").addEventListener("click", handleFinishGame);

  // Tombol akhir perjalanan
  document.getElementById("btn-save-score").addEventListener("click", handleSaveScore);
  document.getElementById("btn-open-leaderboard").addEventListener("click", () => {
    closePopup("popup-akhir");
    showLeaderboard();
  });

  // Mulai game
  initGame();
});