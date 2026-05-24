// ========== RENDER HUD ========== //
function renderHUD(round, routeName, budget, totalScore) {
  const state = window.gameState;

  document.getElementById('hud-player-name').textContent =
    state.playerName || 'PEDAGANG';
  document.getElementById('hud-location').textContent =
    `📍 ${routeName.toUpperCase()}`;
  document.getElementById('hud-day').textContent =
    `HARI ${round + 1} / 5`;
  document.getElementById('hud-budget').textContent =
    `Rp ${budget}`;
  document.getElementById('hud-score').textContent =
    `+${totalScore}`;

  // Hearts — 5 hearts, berkurang tiap kalah
  const wins = state.gameHistory
    ? state.gameHistory.filter(r => r.outcome === 'win' || r.outcome === 'tie').length
    : 0;
  const hearts = '❤️'.repeat(5);
  document.getElementById('hud-hearts').textContent = hearts;
}

// ========== RENDER STAGE DOTS ========== //
function renderStageDots(currentRound, totalRounds) {
  // Stage dots tidak ada di versi baru (ada di HUD)
  // Tapi tetap update hud-day
  document.getElementById('hud-day').textContent =
    `HARI ${currentRound + 1} / ${totalRounds}`;
}

// ========== RENDER HASIL RONDE ========== //
function renderHasil(data) {
  const {
    playerScore, dpScore, outcome,
    efficiency, diff, resultMessage,
    dpChosenIds, tracebackPath, items,
    playerItems, round,
  } = data;

  const ROUTES_NAME = [
    'Pasar Makassar', 'Pelabuhan Pare-Pare',
    'Pekan Toraja',   'Pasar Bone', 'Pasar Palopo',
  ];

  // Title & lokasi
  const titles = {
    win:   '🏆 MENANG!',
    tie:   '⚖️ IMBANG!',
    close: '📈 HAMPIR!',
    lose:  '🧮 KALAH!',
  };
  document.getElementById('hasil-title').textContent    = titles[outcome] || 'HASIL';
  document.getElementById('hasil-location').textContent = ROUTES_NAME[round] || '';

  // Skor 3 kolom
  document.getElementById('hasil-player').textContent = `+${playerScore}`;
  document.getElementById('hasil-dp').textContent     = `+${dpScore}`;
  document.getElementById('hasil-ai').textContent     = `+${aiState.totalProfit}`;

  const playerEff = dpScore > 0
    ? ((playerScore / dpScore) * 100).toFixed(1) : 100;
  const aiEff = dpScore > 0
    ? ((aiState.totalProfit / dpScore) * 100).toFixed(1) : 0;

  document.getElementById('hasil-player-eff').textContent = `${playerEff}% efisiensi`;
  document.getElementById('hasil-ai-eff').textContent     = `${aiEff}% efisiensi`;

  // Verdict
  const verdictEl = document.getElementById('hasil-verdict');
  verdictEl.textContent  = resultMessage;
  verdictEl.style.color  = {
    win: 'var(--green)', tie: 'var(--cyan)',
    close: 'var(--gold)', lose: 'var(--red)',
  }[outcome] || 'var(--text)';

  // Bedah keputusan — item per item
  renderAnalysisItems(items, playerItems, dpChosenIds);

  // Traceback di popup kalkulasi sudah ditampilkan sebelumnya
  // Tombol next/finish
  const isLast = round === 4;
  document.getElementById('btn-next-day').style.display      = isLast ? 'none'  : 'block';
  document.getElementById('btn-finish-journey').style.display = isLast ? 'block' : 'none';
}

// ========== RENDER ANALYSIS ITEMS ========== //
function renderAnalysisItems(items, playerItems, dpChosenIds) {
  const el = document.getElementById('analysis-items');
  if (!el || !items) return;

  const playerIds = (playerItems || []).map(i => i.id);
  let html = '';

  items.forEach(item => {
    const inPlayer  = playerIds.includes(item.id);
    const inDP      = dpChosenIds.includes(item.id);

    if (inPlayer && inDP) {
      html += `
        <div class="analysis-item correct">
          <span class="analysis-icon">✅</span>
          <span class="analysis-name">
            ${item.emoji} ${item.name}
            <span class="analysis-reason">
              Pilihan tepat — DP juga memilih ini (+${item.profit})
            </span>
          </span>
        </div>`;
    } else if (inDP && !inPlayer) {
      html += `
        <div class="analysis-item missed">
          <span class="analysis-icon">❌</span>
          <span class="analysis-name">
            ${item.emoji} ${item.name}
            <span class="analysis-reason">
              Terlewat — DP memilih ini, hasilnya +${item.profit}
              dengan modal Rp ${item.cost} (rasio ${(item.profit/item.cost).toFixed(2)}x)
            </span>
          </span>
        </div>`;
    } else if (inPlayer && !inDP) {
      html += `
        <div class="analysis-item extra">
          <span class="analysis-icon">⚠️</span>
          <span class="analysis-name">
            ${item.emoji} ${item.name}
            <span class="analysis-reason">
              Kamu ambil tapi bukan pilihan DP — modal Rp ${item.cost}
              bisa dipakai untuk kombinasi yang lebih baik
            </span>
          </span>
        </div>`;
    }
  });

  if (!html) {
    html = `<div style="color:var(--text3); font-family:var(--vt-font); font-size:14px">
      Tidak ada item yang dipilih.
    </div>`;
  }

  el.innerHTML = html;
}

// ========== RENDER AKHIR PERJALANAN ========== //
function renderAkhir(gameHistory, totalPlayer, totalDP) {
  const wins = gameHistory.filter(
    r => r.outcome === 'win'
  ).length;
  const ties = gameHistory.filter(
    r => r.outcome === 'tie'
  ).length;
  const eff  = totalDP > 0
    ? ((totalPlayer / totalDP) * 100).toFixed(1) : 100;

  // Judul
  let title = '';
  if (wins >= 4)      title = '👑 PEDAGANG LEGENDARIS';
  else if (wins >= 3) title = '⭐ PEDAGANG ULUNG';
  else if (wins >= 2) title = '👍 PEDAGANG HANDAL';
  else if (wins >= 1) title = '📚 PEDAGANG PEMULA';
  else                title = '🌱 TERUS BELAJAR!';

  document.getElementById('akhir-title').textContent         = title;
  document.getElementById('akhir-total-player').textContent  = `+${totalPlayer}`;
  document.getElementById('akhir-total-dp').textContent      = `+${totalDP}`;
  document.getElementById('akhir-efficiency').textContent    = `${eff}%`;
  document.getElementById('akhir-wins').textContent          = `${wins + ties}/5`;

  // Riwayat per ronde
  const ROUTES_NAME = [
    'Makassar', 'Pare-Pare', 'Toraja', 'Bone', 'Palopo',
  ];

  const histEl = document.getElementById('akhir-history');
  histEl.innerHTML = `
    <div class="akhir-history-title">RIWAYAT PERJALANAN</div>
    ${gameHistory.map((r, i) => `
      <div class="akhir-round-row">
        <span class="akhir-round-name">
          HARI ${i+1} — ${ROUTES_NAME[i]}
        </span>
        <span class="akhir-round-badge ${r.outcome}">
          ${r.outcome.toUpperCase()}
        </span>
        <span class="akhir-round-score">
          +${r.playerScore} / +${r.dpScore}
        </span>
      </div>
    `).join('')}
  `;
}

// ========== RENDER LEADERBOARD ========== //
function renderLeaderboard(data) {
  const el = document.getElementById('lb-list');
  if (!data || data.length === 0) {
    el.innerHTML = `
      <div class="lb-empty">
        Belum ada skor.<br>Jadilah yang pertama!
      </div>`;
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  el.innerHTML = data.map((row, i) => `
    <div class="lb-row">
      <span class="lb-rank">${medals[i] || '#' + row.rank}</span>
      <span class="lb-name">${row.name}</span>
      <span class="lb-eff">${row.efficiency}%</span>
      <span class="lb-score">+${row.score}</span>
    </div>
  `).join('');
}

// ========== PHASE OVERLAY ========== //
function showPhaseOverlay(text, duration = 1800) {
  return new Promise(resolve => {
    const existing = document.querySelector('.phase-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'phase-overlay';
    overlay.innerHTML = `<div class="phase-text">${text}</div>`;

    document.getElementById('game-screen').appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      resolve();
    }, duration);
  });
}

// ========== TIMER DISPLAY ========== //
function updateTimerDisplay(seconds) {
  const el = document.getElementById('hud-timer');
  el.textContent = seconds;

  if (seconds <= 10) {
    el.classList.add('warning');
  } else {
    el.classList.remove('warning');
  }
}

// ========== POPUP OPEN / CLOSE ========== //
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

// ========== LEADERBOARD POPUP ========== //
async function showLeaderboard() {
  openPopup('popup-leaderboard');
  document.getElementById('lb-list').innerHTML =
    `<div class="lb-loading">
      <div style="animation:spin 1s linear infinite;
        display:inline-block;font-size:20px">⏳</div>
    </div>`;

  const result = await apiGetLeaderboard();
  if (result.success) {
    renderLeaderboard(result.data.leaderboard);
  } else {
    document.getElementById('lb-list').innerHTML =
      `<div class="lb-empty">Gagal memuat.<br>${result.error}</div>`;
  }
}

// ========== SAVE SCORE ========== //
async function handleSaveScore(inputId, msgId) {
  const nameInput = document.getElementById(inputId);
  const msgEl     = document.getElementById(msgId);
  const name      = nameInput.value.trim();

  if (!name) {
    msgEl.textContent = 'Masukkan namamu dulu!';
    msgEl.className   = 'save-msg err';
    nameInput.focus();
    return;
  }

  const state      = window.gameState;
  const wins       = state.gameHistory.filter(r => r.outcome === 'win').length;
  const efficiency = state.totalDPScore > 0
    ? parseFloat(((state.totalPlayerScore / state.totalDPScore) * 100).toFixed(1))
    : 100;

  msgEl.textContent = 'Menyimpan...';
  msgEl.className   = 'save-msg';

  const result = await apiSaveScore(
    name, state.totalPlayerScore, efficiency, wins
  );

  if (result.success) {
    msgEl.textContent = result.data.updated
      ? `✅ Skor diperbarui!`
      : `✅ Tersimpan!`;
    msgEl.className   = 'save-msg ok';
    nameInput.disabled = true;

    const rankResult = await apiGetRank(state.totalPlayerScore);
    if (rankResult.success) {
      msgEl.textContent += ` ${rankResult.data.message}`;
    }
  } else {
    msgEl.textContent = `❌ ${result.error}`;
    msgEl.className   = 'save-msg err';
  }
}