// ══════════════════════════════════════
//   UI — semua screen non-canvas
// ══════════════════════════════════════

// ══════════════════════════════════════
//   SHOW SCREEN
// ══════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ══════════════════════════════════════
//   UPDATE HUD GAME
// ══════════════════════════════════════
function updateGameHUD(round, routeName, budget, totalScore, playerName) {
  const el = id => document.getElementById(id);
  if (el('hud-name')) el('hud-name').textContent = (playerName || 'PEDAGANG').toUpperCase();
  if (el('hud-loc'))  el('hud-loc').textContent  = `📍 ${routeName.toUpperCase()}`;
  if (el('hud-day'))  el('hud-day').textContent  = `HARI ${round + 1} / 5`;
  updateHUD();
}

// ══════════════════════════════════════
//   KALKULASI SCREEN
// ══════════════════════════════════════
async function showKalkulasiScreen(items, selectedIds, budget) {
  showScreen('screen-kalk');
  setKalkMode('simple');

  const dpResult = clientKnapsack(items, budget);

  // Reset
  document.getElementById('kalk-basket').innerHTML  = '';
  document.getElementById('kalk-steps').innerHTML   = '';
  document.getElementById('kalk-scoreboard').innerHTML = '';
  document.getElementById('kalk-announce').textContent = '';

  // Announce
  await typeAnnounce('⚙ MENGHITUNG HASIL...', 40);
  await sleep(300);

  // Step 1 — Item masuk keranjang satu per satu
  await showKalkBasket(items, selectedIds);

  // Step 2 — Penjelasan DP bertahap
  await showKalkSteps(items, selectedIds, dpResult, budget);

  // Step 3 — Scoreboard
  await showKalkScoreboard(items, selectedIds, dpResult);

  // Render tabel detail
  renderKalkTable(items, dpResult);
  renderKalkTraceback(dpResult.tracebackPath, items);

  return dpResult;
}

// ── Typewriter announce ──
function typeAnnounce(text, speed = 35) {
  return new Promise(resolve => {
    const el = document.getElementById('kalk-announce');
    el.textContent = '';
    let i = 0;
    function next() {
      if (i >= text.length) { resolve(); return; }
      el.textContent += text[i++];
      SFX.tick();
      setTimeout(next, speed);
    }
    next();
  });
}

// ── Item masuk keranjang ──
async function showKalkBasket(items, selectedIds) {
  const el = document.getElementById('kalk-basket');

  for (const id of selectedIds) {
    const item = items.find(i => i.id === id);
    if (!item) continue;

    const row = document.createElement('div');
    row.className = 'kalk-basket-item';
    row.innerHTML = `
      <span class="kalk-item-emoji">${item.emoji}</span>
      <span class="kalk-item-name">${item.name}</span>
      <span class="kalk-item-profit">+Rp ${item.profit}</span>
    `;
    el.appendChild(row);

    await sleep(80);
    row.classList.add('revealed');
    SFX.coin();
    await sleep(220);
  }

  if (selectedIds.length === 0) {
    el.innerHTML = `<div style="color:var(--muted);font-size:9px;text-align:center;padding:10px">Tidak ada barang dipilih</div>`;
  }
}

// ── Steps DP fade-in ──
async function showKalkSteps(items, selectedIds, dpResult, budget) {
  const el = document.getElementById('kalk-steps');
  const playerProfit = selectedIds.reduce((s, id) => {
    const it = items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);
  const aiProfit  = aiState.totalProfit;
  const dpMax     = dpResult.maxProfit;
  const playerEff = dpMax > 0 ? ((playerProfit / dpMax) * 100).toFixed(1) : 100;
  const aiEff     = dpMax > 0 ? ((aiProfit     / dpMax) * 100).toFixed(1) : 0;

  const steps = [
    {
      label: 'APA ITU KNAPSACK 0/1?',
      html: `Algoritma mencari kombinasi item yang <strong>memaksimalkan profit</strong>
             dalam batas budget Rp ${budget}.
             Ia mengecek <strong style="color:var(--gold)">
             ${Math.pow(2, items.length).toLocaleString()} kemungkinan</strong>
             untuk ${items.length} item.`,
    },
    {
      label: 'RUMUS REKURENS',
      html: `<code style="color:var(--gold)">dp[i][w] = max( dp[i-1][w] , dp[i-1][w-cost[i]] + profit[i] )</code><br>
             Pilih nilai terbesar: <span style="color:var(--cyan)">lewati item</span> atau
             <span style="color:var(--green)">ambil jika muat di budget</span>.`,
    },
    {
      label: 'HASIL OPTIMAL DP',
      html: `<code style="color:var(--gold)">dp[${items.length}][${budget}] = <strong>${dpMax}</strong></code>
             adalah profit maksimum yang bisa dicapai.<br>
             Item terpilih DP: <strong style="color:var(--gold)">
             ${dpResult.chosenIds.map(id => {
               const it = items.find(i => i.id === id);
               return it ? `${it.emoji} ${it.name}` : '';
             }).filter(Boolean).join(', ') || '(tidak ada)'}
             </strong>`,
    },
    {
      label: 'TRACEBACK',
      html: `Berjalan mundur dari <code>dp[${items.length}][${budget}]</code>.
             Jika <code>dp[i][w] ≠ dp[i-1][w]</code> → item
             <span style="color:var(--green)">DIAMBIL</span>,
             budget dikurangi <code>cost[i]</code>.
             Jika sama → item <span style="color:var(--red)">DILEWATI</span>.`,
    },
    {
      label: 'PERBANDINGAN AKHIR',
      html: `Kamu: <span style="color:var(--green)">+${playerProfit}</span>
             (${playerEff}% optimal) &nbsp;|&nbsp;
             AI Greedy: <span style="color:var(--red)">+${aiProfit}</span>
             (${aiEff}% optimal) &nbsp;|&nbsp;
             DP: <span style="color:var(--gold)">+${dpMax}</span> (100%)<br>
             <span style="color:var(--muted);font-size:8px">
             AI hanya melihat rasio terbaik saat ini — tidak memeriksa semua kombinasi.</span>`,
    },
  ];

  for (const step of steps) {
    const div = document.createElement('div');
    div.className = 'kalk-step';
    div.innerHTML = `
      <div class="kalk-step-label">${step.label}</div>
      <div class="kalk-step-text">${step.html}</div>
    `;
    el.appendChild(div);
    await sleep(400);
    div.classList.add('visible');
    SFX.dpTrace();
    await sleep(500);
  }
}

// ── Scoreboard kalkulasi ──
async function showKalkScoreboard(items, selectedIds, dpResult) {
  const el = document.getElementById('kalk-scoreboard');
  const playerProfit = selectedIds.reduce((s, id) => {
    const it = items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);
  const aiProfit = aiState.totalProfit;
  const dpMax    = dpResult.maxProfit;

  const playerEff = dpMax > 0 ? ((playerProfit / dpMax) * 100).toFixed(1) : 100;
  const aiEff     = dpMax > 0 ? ((aiProfit     / dpMax) * 100).toFixed(1) : 0;

  const maxVal = Math.max(dpMax, playerProfit, aiProfit, 1);

  const isPlayerBest = playerProfit >= aiProfit && playerProfit >= dpMax;

  el.innerHTML = `
    <div class="kalk-score-col ${dpMax >= playerProfit && dpMax >= aiProfit ? 'winner' : ''}">
      <div class="kalk-score-who">DP OPTIMAL</div>
      <span class="kalk-score-num gold">+${dpMax}</span>
      <div class="kalk-bar-wrap">
        <div class="kalk-bar" style="width:0%;background:var(--gold)" id="kbar-dp"></div>
      </div>
      <div class="kalk-score-eff">100% optimal</div>
    </div>
    <div class="kalk-score-col ${playerProfit >= aiProfit ? 'winner' : ''}">
      <div class="kalk-score-who">KAMU</div>
      <span class="kalk-score-num green">+${playerProfit}</span>
      <div class="kalk-bar-wrap">
        <div class="kalk-bar" style="width:0%;background:var(--green)" id="kbar-player"></div>
      </div>
      <div class="kalk-score-eff">${playerEff}% optimal</div>
    </div>
    <div class="kalk-score-col">
      <div class="kalk-score-who">AI GREEDY</div>
      <span class="kalk-score-num red">+${aiProfit}</span>
      <div class="kalk-bar-wrap">
        <div class="kalk-bar" style="width:0%;background:var(--red)" id="kbar-ai"></div>
      </div>
      <div class="kalk-score-eff">${aiEff}% optimal</div>
    </div>
  `;

  // Inject bar CSS jika belum ada
  if (!document.getElementById('kbar-style')) {
    const s = document.createElement('style');
    s.id = 'kbar-style';
    s.textContent = `
      .kalk-bar-wrap {
        height: 10px; background: var(--dark);
        border: 1px solid var(--border); margin: 6px 0; overflow: hidden;
      }
      .kalk-bar {
        height: 100%; width: 0%;
        transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
      }
    `;
    document.head.appendChild(s);
  }

  await sleep(300);

  // Animasi bar naik
  setTimeout(() => {
    const dp = document.getElementById('kbar-dp');
    const pl = document.getElementById('kbar-player');
    const ai = document.getElementById('kbar-ai');
    if (dp) dp.style.width = `${(dpMax / maxVal * 100).toFixed(1)}%`;
    setTimeout(() => { if (pl) pl.style.width = `${(playerProfit / maxVal * 100).toFixed(1)}%`; SFX.coin(); }, 300);
    setTimeout(() => { if (ai) ai.style.width = `${(aiProfit / maxVal * 100).toFixed(1)}%`; }, 600);
  }, 100);

  await sleep(800);
}

// ══════════════════════════════════════
//   KALK TABLE & TRACEBACK
// ══════════════════════════════════════
function renderKalkTable(items, dpResult) {
  const table = document.getElementById('kalk-table');
  if (!table || !dpResult.table) return;

  const { table: dpTable, columns } = dpResult;

  let html = `<thead><tr>
    <th>ITEM</th><th>COST</th><th>PROFIT</th>
    ${columns.map(w => `<th>W=${w}</th>`).join('')}
  </tr></thead><tbody>`;

  dpTable.forEach((row, ri) => {
    html += `<tr>
      <td style="text-align:left;white-space:nowrap;color:var(--text)">
        ${row.itemEmoji} ${row.itemName}
      </td>
      <td style="color:var(--red)">${ri === 0 ? '—' : row.itemCost}</td>
      <td style="color:var(--green)">${ri === 0 ? '—' : '+' + row.itemProfit}</td>
      ${row.values.map(cell => {
        let cls = '';
        if (cell.isTraceback) cls = 'trace';
        else if (cell.value > 0) cls = 'active';
        return `<td class="${cls}">${cell.value}</td>`;
      }).join('')}
    </tr>`;
  });

  html += '</tbody>';
  table.innerHTML = html;

  // Animasi baris per baris
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row, i) => {
    setTimeout(() => {
      row.querySelectorAll('td').forEach(cell => {
        cell.style.animation = 'none';
        void cell.offsetWidth;
        cell.style.animation = '';
        cell.classList.add('filling');
        SFX.dpTick();
        setTimeout(() => cell.classList.remove('filling'), 350);
      });
    }, i * 140);
  });
}

function renderKalkTraceback(tracebackPath, items) {
  const el = document.getElementById('kalk-traceback');
  if (!el || !tracebackPath) return;

  el.innerHTML = tracebackPath.map((step, i) => {
    const item    = items.find(it => it.id === step.itemId);
    const isAmbil = step.action === 'DIAMBIL';
    return `
      <div class="trace-step" style="animation-delay:${i * 0.08}s">
        <span class="trace-action ${isAmbil ? 'ambil' : 'lewat'}">
          ${isAmbil ? 'AMBIL' : 'LEWAT'}
        </span>
        <span class="trace-item">
          ${item ? item.emoji : ''} ${step.itemName}
          <span style="color:var(--muted);font-size:7px">
            (cost:${step.itemCost} +${step.itemProfit})
          </span>
        </span>
        <span class="trace-budget">W:${step.budgetBefore}→${step.budgetAfter}</span>
      </div>
    `;
  }).join('');
}

// ══════════════════════════════════════
//   HASIL SCREEN
// ══════════════════════════════════════
function showHasilScreen(data, round) {
  showScreen('screen-hasil');

  const ROUTE_NAMES = [
    'Pasar Makassar','Pelabuhan Pare-Pare',
    'Pekan Toraja','Pasar Bone','Pasar Palopo',
  ];

  const { playerScore, dpScore, outcome, efficiency,
          diff, resultMessage, dpChosenIds, playerItems } = data;
  const items = data.items || window.gameState.items;

  // Verdict
  const titles = {
    win:'🏆 MENANG!', tie:'⚖️ IMBANG!',
    close:'📈 HAMPIR!', lose:'🧮 KALAH!',
  };
  const verdictEl = document.getElementById('hasil-verdict');
  verdictEl.textContent = titles[outcome] || 'HASIL';
  verdictEl.className   = `hasil-verdict ${outcome === 'win' || outcome === 'tie' ? 'win' : outcome === 'close' ? 'tie' : 'lose'}`;

  document.getElementById('hasil-loc').textContent = ROUTE_NAMES[round] || '';

  // Scores 3 kolom
  const aiProfit  = aiState.totalProfit;
  const playerEff = dpScore > 0 ? ((playerScore / dpScore) * 100).toFixed(1) : 100;
  const aiEff     = dpScore > 0 ? ((aiProfit    / dpScore) * 100).toFixed(1) : 0;

  const playerBest = playerScore >= aiProfit;

  document.getElementById('hasil-scores').innerHTML = `
    <div class="hasil-score-col">
      <div class="hasil-score-who">DP OPTIMAL</div>
      <span class="hasil-score-num gold">+${dpScore}</span>
      <div class="hasil-score-eff">100% optimal</div>
    </div>
    <div class="hasil-score-col ${playerBest ? 'best' : ''}">
      <div class="hasil-score-who">KAMU</div>
      <span class="hasil-score-num green">+${playerScore}</span>
      <div class="hasil-score-eff">${playerEff}% optimal</div>
    </div>
    <div class="hasil-score-col">
      <div class="hasil-score-who">AI GREEDY</div>
      <span class="hasil-score-num red">+${aiProfit}</span>
      <div class="hasil-score-eff">${aiEff}% optimal</div>
    </div>
  `;

  document.getElementById('hasil-verdict-msg').textContent = resultMessage || '';

  // Analysis items — fade in bertahap
  renderAnalysisItems(items, playerItems, dpChosenIds);

  // Tombol
  const isLast = round === 4;
  const btnNext   = document.getElementById('btn-next-round');
  const btnFinish = document.getElementById('btn-finish');
  if (btnNext)   btnNext.classList.toggle('hidden', isLast);
  if (btnFinish) btnFinish.classList.toggle('hidden', !isLast);

  // Efek visual
  if (outcome === 'win' || outcome === 'tie') {
    spawnConfetti(60);
    SFX.win();
  } else {
    screenShake();
    SFX.lose();
  }
}

// ── Analysis items ──
function renderAnalysisItems(items, playerItems, dpChosenIds) {
  const el = document.getElementById('hasil-analysis-items');
  if (!el) return;

  const playerIds = (playerItems || []).map(i => i.id);
  let html = '';

  items.forEach(item => {
    const inP = playerIds.includes(item.id);
    const inD = dpChosenIds.includes(item.id);

    if (inP && inD) {
      html += `
        <div class="analysis-item ok">
          <span class="analysis-icon">✅</span>
          <span class="analysis-name">${item.emoji} ${item.name}
            <span class="analysis-reason">Pilihan tepat — DP juga memilih ini (+${item.profit})</span>
          </span>
        </div>`;
    } else if (inD && !inP) {
      html += `
        <div class="analysis-item miss">
          <span class="analysis-icon">❌</span>
          <span class="analysis-name">${item.emoji} ${item.name}
            <span class="analysis-reason">Terlewat — DP pilih ini, profit +${item.profit}, rasio ${(item.profit/item.cost).toFixed(2)}x</span>
          </span>
        </div>`;
    } else if (inP && !inD) {
      html += `
        <div class="analysis-item extra">
          <span class="analysis-icon">⚠️</span>
          <span class="analysis-name">${item.emoji} ${item.name}
            <span class="analysis-reason">Kamu ambil tapi bukan pilihan DP — modal Rp ${item.cost} bisa lebih optimal</span>
          </span>
        </div>`;
    }
  });

  el.innerHTML = html || `<div style="color:var(--muted);font-size:9px;padding:8px">Tidak ada item dipilih.</div>`;

  // Fade in bertahap
  setTimeout(() => {
    el.querySelectorAll('.analysis-item').forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('show');
        SFX.dpTick();
      }, i * 200);
    });
  }, 400);
}

// ══════════════════════════════════════
//   AKHIR SCREEN
// ══════════════════════════════════════
function showAkhirScreen(gameHistory, totalPlayer, totalDP) {
  showScreen('screen-akhir');

  const wins = gameHistory.filter(r => r.outcome === 'win').length;
  const ties = gameHistory.filter(r => r.outcome === 'tie').length;
  const eff  = totalDP > 0 ? ((totalPlayer / totalDP) * 100).toFixed(1) : 100;

  let title = '';
  if (wins >= 4)      title = '👑 PEDAGANG LEGENDARIS';
  else if (wins >= 3) title = '⭐ PEDAGANG ULUNG';
  else if (wins >= 2) title = '👍 PEDAGANG HANDAL';
  else if (wins >= 1) title = '📚 PEDAGANG PEMULA';
  else                title = '🌱 TERUS BELAJAR!';

  document.getElementById('akhir-title').textContent = title;

  document.getElementById('akhir-scores').innerHTML = `
    <div class="akhir-stat">
      <div class="akhir-stat-label">TOTAL SKOR</div>
      <div class="akhir-stat-val green">+${totalPlayer}</div>
    </div>
    <div class="akhir-stat">
      <div class="akhir-stat-label">DP OPTIMAL</div>
      <div class="akhir-stat-val gold">+${totalDP}</div>
    </div>
    <div class="akhir-stat">
      <div class="akhir-stat-label">EFISIENSI</div>
      <div class="akhir-stat-val">${eff}%</div>
    </div>
    <div class="akhir-stat">
      <div class="akhir-stat-label">MENANG</div>
      <div class="akhir-stat-val">${wins + ties}/5</div>
    </div>
  `;

  const ROUTE_NAMES = ['Makassar','Pare-Pare','Toraja','Bone','Palopo'];
  document.getElementById('akhir-history').innerHTML = `
    <div class="akhir-history-title">RIWAYAT PERJALANAN</div>
    ${gameHistory.map((r, i) => `
      <div class="akhir-row">
        <span class="akhir-row-name">HARI ${i+1} — ${ROUTE_NAMES[i]}</span>
        <span class="akhir-row-badge ${r.outcome}">${r.outcome.toUpperCase()}</span>
        <span class="akhir-row-score">+${r.playerScore} / +${r.dpScore}</span>
      </div>
    `).join('')}
  `;

  const eff2 = parseFloat(eff);
  if (eff2 >= 70) spawnConfetti(40);
  SFX.chest();
}

// ══════════════════════════════════════
//   LEADERBOARD
// ══════════════════════════════════════
async function showLeaderboard() {
  openPopup('popup-lb');
  document.getElementById('lb-list').innerHTML = `<div class="lb-loading">⏳ Memuat...</div>`;

  const result = await apiGetLeaderboard();
  if (result.success) {
    renderLeaderboard(result.data.leaderboard);
  } else {
    document.getElementById('lb-list').innerHTML =
      `<div class="lb-empty">Gagal memuat.<br>${result.error}</div>`;
  }
}

function renderLeaderboard(data) {
  const el = document.getElementById('lb-list');
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="lb-empty">Belum ada skor.<br>Jadilah yang pertama!</div>`;
    return;
  }
  const medals = ['🥇','🥈','🥉'];
  el.innerHTML = data.map((row, i) => `
    <div class="lb-row">
      <span class="lb-rank">${medals[i] || '#' + row.rank}</span>
      <span class="lb-name">${row.name}</span>
      <span class="lb-eff">${row.efficiency}%</span>
      <span class="lb-score">+${row.score}</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════
//   SAVE SCORE
// ══════════════════════════════════════
async function handleSaveScore() {
  const nameEl = document.getElementById('input-save-name');
  const msgEl  = document.getElementById('save-msg');
  const name   = nameEl?.value.trim();

  if (!name) {
    msgEl.textContent = 'Masukkan namamu!';
    msgEl.className   = 'err';
    return;
  }

  const state = window.gameState;
  const wins  = state.gameHistory.filter(r => r.outcome === 'win').length;
  const eff   = state.totalDPScore > 0
    ? parseFloat(((state.totalPlayerScore / state.totalDPScore) * 100).toFixed(1)) : 100;

  msgEl.textContent = 'Menyimpan...';
  msgEl.className   = '';

  const result = await apiSaveScore(name, state.totalPlayerScore, eff, wins);
  if (result.success) {
    msgEl.textContent = result.data.updated ? '✅ Skor diperbarui!' : '✅ Tersimpan!';
    msgEl.className   = 'ok';
    if (nameEl) nameEl.disabled = true;

    const rank = await apiGetRank(state.totalPlayerScore);
    if (rank.success) msgEl.textContent += ` ${rank.data.message}`;
  } else {
    msgEl.textContent = `❌ ${result.error}`;
    msgEl.className   = 'err';
  }
}

// ══════════════════════════════════════
//   POPUP HELPERS
// ══════════════════════════════════════
function openPopup(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// ══════════════════════════════════════
//   DP PANEL MODE
// ══════════════════════════════════════
function setDPMode(mode) {
  ['simple','detail'].forEach(m => {
    document.getElementById(`dp-${m}-view`)?.classList.toggle('hidden', m !== mode);
    document.getElementById(`dp-btn-${m}`)?.classList.toggle('active', m === mode);
  });

  const state = window.gameState;
  if (state?.items?.length > 0) {
    updateDPVisualizer(state.items, state.selectedIds, state.budget);
  }
}

function setKalkMode(mode) {
  ['simple','detail'].forEach(m => {
    document.getElementById(`kalk-${m}`)?.classList.toggle('hidden', m !== mode);
    document.getElementById(`kalk-btn-${m}`)?.classList.toggle('active', m === mode);
  });
}

// ══════════════════════════════════════
//   SLEEP HELPER
// ══════════════════════════════════════
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}