// ========== TUTUP POPUP KLIK LUAR ========== //
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        // Jangan tutup popup yang tidak punya tombol close
        const noClose = ['popup-nama', 'popup-kalkulasi'];
        if (!noClose.includes(overlay.id)) {
          closePopup(overlay.id);
        }
      }
    });
  });
});

// ========== POPUP HASIL — WIN/LOSE ANIMASI ========== //
function showHasil(data) {
  renderHasil(data);

  const overlay = document.getElementById('popup-hasil');
  overlay.classList.add('show');

  // Tambah class animasi win/lose
  overlay.classList.remove('win-anim', 'lose-anim');
  if (data.outcome === 'win' || data.outcome === 'tie') {
    overlay.classList.add('win-anim');
  } else {
    overlay.classList.add('lose-anim');
  }

  document.body.style.overflow = 'hidden';
}

// ========== POPUP AKHIR PERJALANAN ========== //
function showAkhir(gameHistory, totalPlayer, totalDP) {
  renderAkhir(gameHistory, totalPlayer, totalDP);
  openPopup('popup-akhir');
}

// ========== POPUP LEADERBOARD DARI AKHIR ========== //
document.addEventListener('DOMContentLoaded', () => {
  const btnAkhirLb = document.getElementById('btn-akhir-leaderboard');
  if (btnAkhirLb) {
    btnAkhirLb.addEventListener('click', () => {
      closePopup('popup-akhir');
      showLeaderboard();
    });
  }

  // Save score dari popup akhir
  const btnSaveAkhir = document.getElementById('btn-save-akhir');
  if (btnSaveAkhir) {
    btnSaveAkhir.addEventListener('click', () => {
      handleSaveScore('input-nama-akhir', 'save-msg');
    });
  }

  // Tombol show dp panel
  const btnShowDp = document.getElementById('btn-show-dp');
  if (btnShowDp) {
    btnShowDp.addEventListener('click', () => {
      toggleDPPanel();
    });
  }

  // Tombol close dp panel
  const btnCloseDp = document.getElementById('btn-close-dp');
  if (btnCloseDp) {
    btnCloseDp.addEventListener('click', () => {
      closeDPPanel();
    });
  }

  // Tombol selesai belanja
  const btnDone = document.getElementById('btn-done-shopping');
  if (btnDone) {
    btnDone.addEventListener('click', () => {
      handleDoneShopping();
    });
  }

  // Tombol lihat hasil dari popup kalkulasi
  const btnLihatHasil = document.getElementById('btn-lihat-hasil');
  if (btnLihatHasil) {
    btnLihatHasil.addEventListener('click', () => {
      closePopup('popup-kalkulasi');
      openPopup('popup-hasil');
    });
  }
});