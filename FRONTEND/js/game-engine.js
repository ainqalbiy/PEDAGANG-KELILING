// ========== STATE MESIN GAME ========== //
const GamePhase = {
  LOADING:    'loading',
  TITLE:      'title',
  NAMA:       'nama',
  PLAYING:    'playing',
  KALKULASI:  'kalkulasi',
  HASIL:      'hasil',
  AKHIR:      'akhir',
};

let currentPhase = GamePhase.LOADING;
let currentMap   = null;
let collision    = null;
let shopMap      = null;
let gameLoop     = null;
let lastTime     = 0;
let timerSeconds = 60;
let timerInterval = null;

// ========== GANTI FASE ========== //
function setPhase(phase) {
  currentPhase = phase;
  console.log(`[Game] Phase: ${phase}`);
}

// ========== INISIALISASI RONDE ========== //
async function initRound(round) {
  const state = window.gameState;

  // Stop timer lama
  stopTimer();

  // Reset state ronde
  state.selectedIds   = [];
  state.sessionId     = null;
  resetTakenItems();

  // Render peta
  const mapResult = renderMap(round);
  currentMap = mapResult.mapData;
  collision  = mapResult.collision;
  shopMap    = mapResult.shopMap;

  // Inisialisasi player & AI
  initPlayer(currentMap);
  initAI(currentMap, currentMap.budget || 150);

  // Fetch data dari server
  showToast('Memuat data pasar...', '');
  const result = await apiStartGame(state.sessionId, round);

  if (!result.success) {
    showToast('Gagal memuat ronde: ' + result.error, 'red');
    return;
  }

  const { sessionId, route, items } = result.data;

  // Simpan ke state
  state.sessionId = sessionId;
  state.items     = items;
  state.budget    = route.budget;

  // Distribusi item ke toko
  initShopItems(items, currentMap);

  // Update HUD
  renderHUD(round, route.name, route.budget, state.totalPlayerScore);
  renderStageDots(round, state.totalRounds);

  // Update AI budget
  aiState.budget = route.budget;

  // Tampilkan phase overlay
  await showPhaseOverlay(`HARI ${round + 1}<br>${route.name.toUpperCase()}`, 2000);

  // Welcome NPC toast
  setTimeout(() => {
    showToast(route.welcome_message, '');
  }, 500);

  // Mulai timer
  timerSeconds = 60 - (round * 5); // Makin lama makin cepat
  timerSeconds = Math.max(timerSeconds, 30);
  startTimer();

  // Mulai game loop
  setPhase(GamePhase.PLAYING);
  startGameLoop();
}

// ========== GAME LOOP ========== //
function startGameLoop() {
  if (gameLoop) cancelAnimationFrame(gameLoop);
  lastTime = performance.now();
  gameLoop = requestAnimationFrame(gameLoopTick);
}

function stopGameLoop() {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
    gameLoop = null;
  }
}

function gameLoopTick(timestamp) {
  if (currentPhase !== GamePhase.PLAYING) return;

  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  const state = window.gameState;

  // Update player
  updatePlayer(collision, currentMap, shopMap, dt);

  // Update AI
  updateAI(collision, currentMap, shopMap, state.items, dt);

  // Lanjut loop
  gameLoop = requestAnimationFrame(gameLoopTick);
}

// ========== TIMER ========== //
function startTimer() {
  stopTimer();
  updateTimerDisplay(timerSeconds);

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay(timerSeconds);

    if (timerSeconds <= 10) {
      showToast(`⏱ ${timerSeconds} detik tersisa!`, 'red');
    }

    if (timerSeconds <= 0) {
      stopTimer();
      handleTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ========== WAKTU HABIS ========== //
async function handleTimeUp() {
  setPhase(GamePhase.KALKULASI);
  stopGameLoop();

  await showPhaseOverlay('WAKTU HABIS!<br>FASE KALKULASI', 1500);

  await handleSubmit();
}

// ========== HANDLE JUAL (tombol atau waktu habis) ========== //
async function handleSell() {
  if (currentPhase !== GamePhase.PLAYING) return;
  if (window.gameState.selectedIds.length === 0) {
    showToast('Pilih barang dulu!', 'red');
    return;
  }

  setPhase(GamePhase.KALKULASI);
  stopGameLoop();
  stopTimer();

  await showPhaseOverlay('FASE KALKULASI!', 1500);
  await handleSubmit();
}

// ========== SUBMIT KE SERVER ========== //
async function handleSubmit() {
  const state = window.gameState;

  // Tampilkan fase kalkulasi dengan visualisasi DP
  const dpResult = await showKalkulasiPhase(
    state.items,
    state.selectedIds,
    state.budget
  );

  // Submit ke server
  const result = await apiSubmitGame(state.sessionId, state.selectedIds);

  if (!result.success) {
    showToast('Gagal submit: ' + result.error, 'red');
    return;
  }

  const data = result.data;

  // Update total skor
  state.totalPlayerScore += data.playerScore;
  state.totalDPScore     += data.dpScore;

  // Simpan riwayat
  state.gameHistory.push({
    round:       state.round,
    playerScore: data.playerScore,
    dpScore:     data.dpScore,
    aiScore:     aiState.totalProfit,
    outcome:     data.outcome,
  });

  // Siapkan data hasil
  window.pendingHasilData = {
    ...data,
    items: state.items,
    round: state.round,
  };

  setPhase(GamePhase.HASIL);
}

// ========== NEXT ROUND ========== //
async function handleNextRound() {
  closePopup('popup-hasil');

  const state = window.gameState;
  state.round++;

  if (state.round >= state.totalRounds) {
    handleFinishGame();
    return;
  }

  setPhase(GamePhase.PLAYING);
  await initRound(state.round);
}

// ========== FINISH GAME ========== //
function handleFinishGame() {
  closePopup('popup-hasil');
  setPhase(GamePhase.AKHIR);

  const state = window.gameState;
  showAkhir(
    state.gameHistory,
    state.totalPlayerScore,
    state.totalDPScore
  );
}