// ========== BUKA / TUTUP POPUP ========== //
function openPopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('show');
  const anyOpen = document.querySelector('.popup-overlay.show');
  if (!anyOpen) document.body.style.overflow = '';
}

// ========== TUTUP SAAT KLIK LUAR ========== //
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target !== overlay) return;
      // Jangan tutup popup wajib
      const noClose = ['popup-nama', 'popup-kalkulasi'];
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
    const noClose = ['popup-nama', 'popup-kalkulasi'];
    if (noClose.includes(open.id)) return;
    SFX.cancel();
    closePopup(open.id);
  });

  // ── Tombol selesai belanja ──
  const btnDone = document.getElementById('btn-done-shopping');
  if (btnDone) {
    btnDone.addEventListener('click', handleDoneShopping);
  }

  // ── Tombol lihat hasil dari kalkulasi ──
  // ── FIX #2: HANYA di sini, tidak di main.js ──
  const btnLihat = document.getElementById('btn-lihat-hasil');
  if (btnLihat) {
    btnLihat.addEventListener('click', () => {
      closePopup('popup-kalkulasi');
      showHasilPopup(); // ← pakai fungsi dari game-engine.js
    });
  }

  // ── Tombol next day ──
  const btnNext = document.getElementById('btn-next-day');
  if (btnNext) {
    btnNext.addEventListener('click', handleNextRound);
  }

  // ── Tombol finish journey ──
  const btnFinish = document.getElementById('btn-finish-journey');
  if (btnFinish) {
    btnFinish.addEventListener('click', handleFinishGame);
  }

  // ── Tombol show / close DP panel ──
  const btnShowDP = document.getElementById('btn-show-dp');
  if (btnShowDP) {
    btnShowDP.addEventListener('click', () => {
      SFX.confirm();
      toggleDPPanel();
    });
  }

  const btnCloseDP = document.getElementById('btn-close-dp');
  if (btnCloseDP) {
    btnCloseDP.addEventListener('click', () => {
      SFX.cancel();
      closeDPPanel();
    });
  }

  // ── Tombol leaderboard dari akhir ──
  const btnAkhirLb = document.getElementById('btn-akhir-leaderboard');
  if (btnAkhirLb) {
    btnAkhirLb.addEventListener('click', () => {
      closePopup('popup-akhir');
      showLeaderboard();
    });
  }

  // ── Tombol save score ──
  const btnSave = document.getElementById('btn-save-akhir');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      handleSaveScore('input-nama-akhir', 'save-msg');
    });
  }

  // ── Tombol title leaderboard ──
  const btnTitleLb = document.getElementById('btn-title-leaderboard');
  if (btnTitleLb) {
    btnTitleLb.addEventListener('click', showLeaderboard);
  }
});

// ========== POPUP LEADERBOARD ========== //
async function showLeaderboard() {
  openPopup('popup-leaderboard');
  SFX.confirm();

  document.getElementById('lb-list').innerHTML =
    `<div class="lb-loading">⏳ Memuat data...</div>`;

  const result = await apiGetLeaderboard();
  if (result.success) {
    renderLeaderboard(result.data.leaderboard);
  } else {
    document.getElementById('lb-list').innerHTML =
      `<div class="lb-empty">Gagal memuat.<br>${result.error}</div>`;
  }
}

// ========== POPUP AKHIR ========== //
function showAkhir(gameHistory, totalPlayer, totalDP) {
  renderAkhir(gameHistory, totalPlayer, totalDP);
  openPopup('popup-akhir');
}