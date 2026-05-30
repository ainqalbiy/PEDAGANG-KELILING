// ══════════════════════════════════════
//   POPUP SYSTEM
// ══════════════════════════════════════

// Tutup popup saat klik overlay
document.addEventListener('DOMContentLoaded', () => {

  // Klik luar popup
  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target !== overlay) return;
      const noClose = ['popup-shop-dynamic'];
      if (noClose.includes(overlay.id)) return;
      SFX.cancel();
      closePopup(overlay.id);
    });
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.popup-overlay.show');
    if (!open) return;
    const noClose = ['popup-shop-dynamic'];
    if (noClose.includes(open.id)) return;
    SFX.cancel();
    closePopup(open.id);
  });

  // ── Title screen buttons ──
  document.getElementById('btn-start')?.addEventListener('click', () => {
    SFX.confirm();
    showScreen('screen-name');
    setTimeout(() => document.getElementById('input-name')?.focus(), 300);
  });

  document.getElementById('btn-how')?.addEventListener('click', () => {
    SFX.confirm();
    openPopup('popup-tutorial');
  });

  document.getElementById('btn-lb-title')?.addEventListener('click', () => {
    SFX.confirm();
    showLeaderboard();
  });

  // Enter dari title
  document.addEventListener('keydown', e => {
    const titleScreen = document.getElementById('screen-title');
    if (e.key === 'Enter' && titleScreen?.classList.contains('active')) {
      SFX.confirm();
      showScreen('screen-name');
      setTimeout(() => document.getElementById('input-name')?.focus(), 300);
    }
  });

  // ── Name screen ──
  document.getElementById('btn-name-ok')?.addEventListener('click', () => {
    confirmName();
  });

  document.getElementById('input-name')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmName();
  });

  // ── Kalkulasi screen ──
  document.getElementById('btn-kalk-done')?.addEventListener('click', () => {
    SFX.confirm();
    if (window.pendingKalkDone) window.pendingKalkDone();
  });

  // ── Hasil screen ──
  document.getElementById('btn-next-round')?.addEventListener('click', () => {
    SFX.confirm();
    if (typeof handleNextRound === 'function') handleNextRound();
  });

  document.getElementById('btn-finish')?.addEventListener('click', () => {
    SFX.confirm();
    if (typeof handleFinishGame === 'function') handleFinishGame();
  });

  // ── Akhir screen ──
  document.getElementById('btn-save')?.addEventListener('click', () => {
    SFX.confirm();
    handleSaveScore();
  });

  document.getElementById('btn-akhir-lb')?.addEventListener('click', () => {
    SFX.confirm();
    showLeaderboard();
  });

  // ── DP Panel ──
  document.getElementById('dp-panel')?.addEventListener('click', e => {
    // Jangan tutup saat klik dalam panel
    e.stopPropagation();
  });

});

// ══════════════════════════════════════
//   CONFIRM NAME
// ══════════════════════════════════════
function confirmName() {
  const input = document.getElementById('input-name');
  const name  = input?.value.trim() || 'PEDAGANG';

  window.gameState.playerName = name.toUpperCase().slice(0, 10);
  SFX.confirm();

  // Mulai game
  if (typeof startGame === 'function') startGame();
}