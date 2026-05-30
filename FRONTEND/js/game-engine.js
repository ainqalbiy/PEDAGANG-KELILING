// ══════════════════════════════════════
//   GAME ENGINE — state machine utama
// ══════════════════════════════════════

const Phase = {
  LOADING:   'loading',
  TITLE:     'title',
  NAME:      'name',
  COUNTDOWN: 'countdown',
  PLAYING:   'playing',
  KALKULASI: 'kalkulasi',
  HASIL:     'hasil',
  AKHIR:     'akhir',
};

let phase       = Phase.LOADING;
let rafId       = null;
let lastTs      = 0;
let timerSec    = 60;
let timerInt    = null;
let timerWarnShown = false;
let parsedMap   = null;

// ══════════════════════════════════════
//   GAME STATE GLOBAL
// ══════════════════════════════════════
window.gameState = {
  playerName:       'PEDAGANG',
  round:            0,
  totalRounds:      5,
  sessionId:        null,
  items:            [],
  selectedIds:      [],
  budget:           0,
  totalPlayerScore: 0,
  totalDPScore:     0,
  gameHistory:      [],
};

// ══════════════════════════════════════
//   START GAME (dipanggil setelah nama)
// ══════════════════════════════════════
async function startGame() {
  showScreen('screen-game');
  await initRound(0);
}

// ══════════════════════════════════════
//   INIT RONDE
// ══════════════════════════════════════
async function initRound(round) {
  const state   = window.gameState;
  state.round   = round;
  state.selectedIds = [];
  state.sessionId   = null;

  // Reset taken items
  window.takenItems   = {};
  window.shopItemsMap = {};

  // Stop loop lama
  stopLoop();
  stopTimer();
  timerWarnShown = false;
  setVignette(false);

  // Load map
  const mapDef = MAPS[round];
  initPlayer(mapDef);
  parsedMap = loadMap(round);

  // Update HUD awal
  document.getElementById('hud-name').textContent = state.playerName;
  document.getElementById('hud-loc').textContent  = `📍 ${mapDef.name.toUpperCase()}`;
  document.getElementById('hud-day').textContent  = `HARI ${round + 1} / 5`;
  document.getElementById('hud-timer').textContent = mapDef.timerSec;
  document.getElementById('hud-timer').classList.remove('warn');

  // Fetch data server
  showToast('Memuat data pasar...', '');
  const result = await apiStartGame(state.sessionId, round);

  if (!result.success) {
    showToast('Gagal memuat: ' + result.error, 'red');
    return;
  }

  const { sessionId, route, items } = result.data;
  state.sessionId = sessionId;
  state.items     = items;
  state.budget    = route.budget;

  // ── FIX: initAI setelah budget tersedia ──
  initAI(mapDef, route.budget);

  // Distribusi item ke toko
  initShopItems(items, mapDef);

  // Update HUD budget
  document.getElementById('hud-budget').textContent = `Rp ${route.budget}`;
  document.getElementById('hud-score').textContent  = `+${state.totalPlayerScore}`;

  // Fade in
  await fadeFromBlack(300);

  // Phase overlay
  await showPhaseOverlay(`HARI ${round + 1}<br>${mapDef.name.toUpperCase()}`, 1800);

  // Countdown 3-2-1
  await runCountdown();

  // Welcome dialog
  await new Promise(resolve => {
    Dialog.roundWelcome(
      { name: mapDef.name, budget: route.budget,
        welcomeMsg: route.welcome_message },
      resolve
    );
  });

  // Mulai timer & loop
  // Mulai timer & loop
  timerSec = mapDef.timerSec;
  updateTimerDisplay(timerSec);
  phase = Phase.PLAYING;   // ← SET DULU
  startTimer();
  startLoop();             // ← BARU LOOP
}

// ══════════════════════════════════════
//   GAME LOOP
// ══════════════════════════════════════
function startLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTs = performance.now();

  function tick(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs   = ts;

    // Selalu render kalau phase PLAYING
    if (phase === Phase.PLAYING) {
      updatePlayer(
        parsedMap.collision, renderState.mapDef,
        parsedMap.shopCells, dt
      );
      updateAI(
        parsedMap.collision, renderState.mapDef,
        parsedMap.shopCells, window.gameState.items, dt
      );
      updateHUD();
    }

    // Render frame SELALU (supaya kelihatan)
    if (renderState.mapDef) {
      renderFrame(dt);
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
}

// ══════════════════════════════════════
//   TIMER
// ══════════════════════════════════════
function startTimer() {
  stopTimer();
  timerInt = setInterval(() => {
    timerSec--;
    updateTimerDisplay(timerSec);

    // Vignette merah mulai detik ke-15
    if (timerSec <= 15) setVignette(true);

    // Warning sekali di detik ke-10
    if (timerSec === 10 && !timerWarnShown) {
      timerWarnShown = true;
      showToast('⏱ 10 detik lagi!', 'red');
      screenFlash('#ff0000', 200);
      SFX.timerWarn();
    }

    if (timerSec <= 0) {
      stopTimer();
      handleTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInt) { clearInterval(timerInt); timerInt = null; }
}

// ══════════════════════════════════════
//   AI SELESAI DULUAN
// ══════════════════════════════════════
function handleAIDone() {
  if (phase !== Phase.PLAYING) return;
  phase = Phase.KALKULASI;
  stopLoop();
  stopTimer();

  Dialog.aiWon(async () => {
    await triggerKalkulasi();
  });
}

// ══════════════════════════════════════
//   WAKTU HABIS
// ══════════════════════════════════════
async function handleTimeUp() {
  if (phase !== Phase.PLAYING) return;
  phase = Phase.KALKULASI;
  stopLoop();

  screenShake();
  screenFlash('#ffffff', 300);

  Dialog.timeUp(async () => {
    await triggerKalkulasi();
  });
}

// ══════════════════════════════════════
//   HANDLE SELL (Space)
// ══════════════════════════════════════
async function handleSell() {
  if (phase !== Phase.PLAYING) return;

  const state = window.gameState;
  if (state.selectedIds.length === 0) {
    showToast('Pilih barang dulu!', 'red');
    SFX.cancel();
    return;
  }

  phase = Phase.KALKULASI;
  stopLoop();
  stopTimer();

  SFX.confirm();
  screenFlash('#f8d030', 180);

  Dialog.playerWon(async () => {
    await triggerKalkulasi();
  });
}

// ══════════════════════════════════════
//   TRIGGER KALKULASI
// ══════════════════════════════════════
async function triggerKalkulasi() {
  const state = window.gameState;

  // Fade to black — transisi dramatis
  await fadeToBlack(400);

  // Tampilkan kalkulasi screen
  const dpResult = await showKalkulasiScreen(
    state.items, state.selectedIds, state.budget
  );

  // Fade in ke kalkulasi
  await fadeFromBlack(300);

  // Tunggu user klik "Lihat Hasil"
  await new Promise(resolve => {
    window.pendingKalkDone = resolve;
  });

  // Submit ke server
  const result = await apiSubmitGame(state.sessionId, state.selectedIds);
  if (!result.success) {
    showToast('Gagal submit: ' + result.error, 'red');
    return;
  }

  const data = result.data;

  // Update skor
  state.totalPlayerScore += data.playerScore;
  state.totalDPScore     += data.dpScore;

  state.gameHistory.push({
    round:       state.round,
    playerScore: data.playerScore,
    dpScore:     data.dpScore,
    aiScore:     aiState.totalProfit,
    outcome:     data.outcome,
  });

  // Simpan untuk screen hasil
  window.pendingHasilData = { ...data, items: state.items, round: state.round };

  // Transition ke hasil
  await fadeToBlack(350);

  phase = Phase.HASIL;
  showHasilScreen(window.pendingHasilData, state.round);

  await fadeFromBlack(300);
}

// ══════════════════════════════════════
//   NEXT ROUND
// ══════════════════════════════════════
async function handleNextRound() {
  const state = window.gameState;
  state.round++;

  if (state.round >= state.totalRounds) {
    handleFinishGame();
    return;
  }

  await fadeToBlack(350);
  phase = Phase.PLAYING;
  await initRound(state.round);
}

// ══════════════════════════════════════
//   FINISH GAME
// ══════════════════════════════════════
function handleFinishGame() {
  phase = Phase.AKHIR;
  const state = window.gameState;
  showAkhirScreen(
    state.gameHistory,
    state.totalPlayerScore,
    state.totalDPScore
  );
}