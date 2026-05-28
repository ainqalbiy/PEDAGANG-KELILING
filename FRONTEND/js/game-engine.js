// ========== STATE MESIN GAME ========== //
const GamePhase = {
  LOADING:   'loading',
  TITLE:     'title',
  NAMA:      'nama',
  PLAYING:   'playing',
  KALKULASI: 'kalkulasi',
  HASIL:     'hasil',
  AKHIR:     'akhir',
};

let currentPhase   = GamePhase.LOADING;
let currentMap     = null;
let collision      = null;
let shopMap        = null;
let gameLoop       = null;
let lastTime       = 0;
let timerSeconds   = 60;
let timerInterval  = null;
let timerWarnShown = false; // ← FIX #3: flag supaya toast timer tidak spam

// ========== GANTI FASE ========== //
function setPhase(phase) {
  currentPhase = phase;
}

// ========== SCREEN EFFECTS ========== //
function initScreenEffects() {
  // Flash overlay
  if (!document.getElementById('screen-flash')) {
    const flash = document.createElement('div');
    flash.id = 'screen-flash';
    document.body.appendChild(flash);
  }

  // Vignette overlay
  if (!document.getElementById('screen-vignette')) {
    const vig = document.createElement('div');
    vig.id = 'screen-vignette';
    document.body.appendChild(vig);
  }
}

function screenFlash(color = '#ffffff', duration = 120) {
  const el = document.getElementById('screen-flash');
  if (!el) return;
  el.style.background = color;
  el.style.opacity    = '0.35';
  setTimeout(() => { el.style.opacity = '0'; }, duration);
}

function screenShake() {
  const el = document.getElementById('game-screen');
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // reflow
  el.classList.add('shake');
  SFX.thud();
  setTimeout(() => el.classList.remove('shake'), 400);
}

function setVignette(active) {
  const el = document.getElementById('screen-vignette');
  if (!el) return;
  if (active) el.classList.add('danger');
  else        el.classList.remove('danger');
}

// ========== CONFETTI (WIN) ========== //
function spawnConfetti() {
  const colors = ['#f5c842','#4ecb71','#7ec8e3','#e05555','#9b6dff','#fff'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left            = Math.random() * 100 + 'vw';
      el.style.top             = '-10px';
      el.style.background      = colors[Math.floor(Math.random() * colors.length)];
      el.style.width           = (6 + Math.random() * 6) + 'px';
      el.style.height          = (6 + Math.random() * 6) + 'px';
      el.style.animationDuration = (2 + Math.random() * 2) + 's';
      el.style.animationDelay  = Math.random() * 0.5 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 50);
  }
}

// ========== INISIALISASI RONDE ========== //
async function initRound(round) {
  const state = window.gameState;

  // Stop timer lama
  stopTimer();
  timerWarnShown = false;

  // Reset state ronde
  state.selectedIds = [];
  state.sessionId   = null;
  resetTakenItems();

  // Reset AI state
  aiState.inventory    = [];
  aiState.totalProfit  = 0;
  aiState.visited      = [];
  aiState.targetShop   = null;
  aiState.thinkTimer   = 0;

  // Render peta
  const mapResult = renderMap(round);
  currentMap      = mapResult.mapData;
  collision       = mapResult.collision;
  shopMap         = mapResult.shopMap;

  // Simpan mapData global untuk npc.js
  window.currentMapData = currentMap;

  // Fetch data dari server DULU sebelum init AI
  showToast('Memuat data pasar...', '');
  const result = await apiStartGame(state.sessionId, round);

  if (!result.success) {
    showToast('Gagal memuat: ' + result.error, 'red');
    return;
  }

  const { sessionId, route, items } = result.data;

  // Simpan ke state
  state.sessionId = sessionId;
  state.items     = items;
  state.budget    = route.budget;

  // ── FIX #1: initAI dipanggil SETELAH budget tersedia dari server ──
  initPlayer(currentMap);
  initAI(currentMap, route.budget); // ← pakai route.budget, bukan hardcode

  // Distribusi item ke toko
  initShopItems(items, currentMap);

  // Tampilkan NPC exclaim di semua toko
  currentMap.shops.forEach(shop => showShopExclaim(shop.id));

  // Update HUD
  renderHUD(round, route.name, route.budget, state.totalPlayerScore);
  renderStageDots(round, state.totalRounds);

  // Phase overlay
  await showPhaseOverlay(`HARI ${round + 1}<br>${route.name.toUpperCase()}`, 2000);

  // Welcome toast
  setTimeout(() => showToast(route.welcome_message, ''), 400);

  // Mulai timer
  timerSeconds = Math.max(30, 65 - round * 5);
  startTimer();

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

  updatePlayer(collision, currentMap, shopMap, dt);
  updateAI(collision, currentMap, shopMap, state.items, dt);

  gameLoop = requestAnimationFrame(gameLoopTick);
}

// ========== TIMER ========== //
function startTimer() {
  stopTimer();
  updateTimerDisplay(timerSeconds);
  setVignette(false);

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay(timerSeconds);

    // Vignette merah mulai detik ke-15
    if (timerSeconds <= 15) {
      setVignette(true);
      SFX.timerWarn();
    }

    // ── FIX #3: toast timer hanya muncul SEKALI ──
    if (timerSeconds === 10 && !timerWarnShown) {
      timerWarnShown = true;
      showToast('⏱ 10 detik tersisa!', 'red');
      screenFlash('#ff0000', 200);
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
  setVignette(false);
}

// ========== WAKTU HABIS ========== //
async function handleTimeUp() {
  setPhase(GamePhase.KALKULASI);
  stopGameLoop();

  screenShake();
  screenFlash('#ffffff', 300);
  await delay(400);

  await showPhaseOverlay('WAKTU HABIS!<br>FASE KALKULASI...', 1600);
  await handleSubmit();
}

// ========== HANDLE JUAL ========== //
async function handleSell() {
  if (currentPhase !== GamePhase.PLAYING) return;

  if (window.gameState.selectedIds.length === 0) {
    showToast('Pilih barang dulu!', 'red');
    SFX.cancel();
    return;
  }

  setPhase(GamePhase.KALKULASI);
  stopGameLoop();
  stopTimer();

  screenFlash('#f5c842', 200);
  SFX.confirm();
  await delay(300);

  await showPhaseOverlay('FASE KALKULASI!', 1400);
  await handleSubmit();
}

// ========== SUBMIT KE SERVER ========== //
async function handleSubmit() {
  const state = window.gameState;

  // Tampilkan visualisasi kalkulasi
  await showKalkulasiPhase(
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

  // Simpan data untuk popup hasil
  window.pendingHasilData = {
    ...data,
    items: state.items,
    round: state.round,
  };

  setPhase(GamePhase.HASIL);
}

// ========== TAMPILKAN HASIL ========== //
function showHasilPopup() {
  const data = window.pendingHasilData;
  if (!data) return;

  // Glow warna sesuai outcome
  const popup = document.querySelector('#popup-hasil .popup-box');
  if (popup) {
    popup.classList.remove('glow-green', 'glow-red');
    if (data.outcome === 'win' || data.outcome === 'tie') {
      popup.classList.add('glow-green');
      spawnConfetti();
      SFX.win();
    } else {
      popup.classList.add('glow-red');
      screenShake();
      SFX.lose();
    }
  }

  // Render & buka popup
  renderHasil(data);
  openPopup('popup-hasil');

  // Fade-in analysis items bertahap
  setTimeout(() => revealAnalysisItems(), 600);
}

// ========== REVEAL ANALYSIS ITEMS BERTAHAP ========== //
function revealAnalysisItems() {
  const items = document.querySelectorAll('#analysis-items .analysis-item');
  items.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('revealed');
      SFX.dpTick();
    }, i * 220);
  });
}

// ========== NEXT ROUND ========== //
async function handleNextRound() {
  closePopup('popup-hasil');

  // Reset glow
  const popup = document.querySelector('#popup-hasil .popup-box');
  if (popup) popup.classList.remove('glow-green', 'glow-red');

  window.gameState.round++;

  if (window.gameState.round >= window.gameState.totalRounds) {
    handleFinishGame();
    return;
  }

  setPhase(GamePhase.PLAYING);
  await initRound(window.gameState.round);
}

// ========== FINISH GAME ========== //
function handleFinishGame() {
  closePopup('popup-hasil');
  setPhase(GamePhase.AKHIR);

  const state = window.gameState;

  // Confetti kalau efisiensi bagus
  const eff = state.totalDPScore > 0
    ? (state.totalPlayerScore / state.totalDPScore * 100) : 0;
  if (eff >= 70) spawnConfetti();

  SFX.chest();

  showAkhir(
    state.gameHistory,
    state.totalPlayerScore,
    state.totalDPScore
  );
}