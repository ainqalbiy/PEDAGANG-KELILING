// ========== STATE GLOBAL ========== //
window.gameState = {
  sessionId:        null,
  round:            0,
  totalRounds:      5,
  items:            [],
  selectedIds:      [],
  budget:           0,
  playerName:       'PEDAGANG',
  totalPlayerScore: 0,
  totalDPScore:     0,
  gameHistory:      [],
};

// ========== LOADING SCREEN ========== //
async function runLoadingScreen() {
  const tips = [
    'Memuat peta pasar...',
    'Menyiapkan algoritma DP...',
    'Menghitung kombinasi optimal...',
    'Melatih AI Greedy rival...',
    'Siap berdagang!',
  ];

  const tipEl = document.getElementById('loading-tip');
  const bar   = document.getElementById('loading-bar');

  // Animasi tips
  let i = 0;
  const tipInterval = setInterval(() => {
    tipEl.textContent = tips[i % tips.length];
    i++;
  }, 500);

  // Tunggu loading bar selesai (2.5 detik dari CSS)
  await new Promise(resolve => setTimeout(resolve, 2800));
  clearInterval(tipInterval);

  // Sembunyikan loading, tampilkan title
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('title-screen').style.display   = 'flex';
  setPhase(GamePhase.TITLE);
}

// ========== TITLE SCREEN ========== //
function initTitleScreen() {
  // Tombol menu
  document.getElementById('btn-new-game').addEventListener('click', startNewGame);
  document.getElementById('btn-how-to-play').addEventListener('click', () => {
    openPopup('popup-tutorial');
  });
  document.getElementById('btn-title-leaderboard').addEventListener('click', () => {
    showLeaderboard();
  });

  // Enter key
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && currentPhase === GamePhase.TITLE) {
      startNewGame();
    }
  });
}

// ========== MULAI GAME BARU ========== //
function startNewGame() {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game-screen').style.display  = 'flex';
  setPhase(GamePhase.NAMA);
  openPopup('popup-nama');

  // Focus input nama
  setTimeout(() => {
    document.getElementById('input-nama-player').focus();
  }, 300);
}

// ========== KONFIRMASI NAMA ========== //
function handleConfirmNama() {
  const input = document.getElementById('input-nama-player');
  const name  = input.value.trim() || 'PEDAGANG';

  window.gameState.playerName = name.toUpperCase().slice(0, 10);
  closePopup('popup-nama');

  // Mulai ronde pertama
  initInput();
  initRound(0);
}

// ========== TOMBOL SELL ========== //
function initGameButtons() {
  // Tombol jual
  document.getElementById('btn-sell').addEventListener('click', handleSell);

  // Tombol next day dari popup hasil
  document.getElementById('btn-next-day').addEventListener('click', handleNextRound);

  // Tombol finish journey
  document.getElementById('btn-finish-journey').addEventListener('click', handleFinishGame);

  // Tombol konfirmasi nama
  document.getElementById('btn-confirm-nama').addEventListener('click', handleConfirmNama);

  // Enter di input nama
  document.getElementById('input-nama-player').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleConfirmNama();
  });

  // Tombol lihat hasil dari kalkulasi — sudah di popup.js
  // Tombol show DP
  document.getElementById('btn-show-dp').addEventListener('click', toggleDPPanel);
  document.getElementById('btn-close-dp').addEventListener('click', closeDPPanel);
}

// ========== ENTRY POINT ========== //
document.addEventListener('DOMContentLoaded', async () => {
  // Init tombol game
  initGameButtons();

  // Mulai loading screen
  await runLoadingScreen();

  // Init title screen
  initTitleScreen();
});