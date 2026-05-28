// ========== STATE ========== //
let dvMode   = 'simple';
let kalkMode = 'simple';
let dpAnimating = false;

// ========== SET MODE DP PANEL ========== //
function setDPMode(mode) {
  dvMode = mode;
  document.getElementById('dp-mode-simple').classList.toggle('active', mode === 'simple');
  document.getElementById('dp-mode-detail').classList.toggle('active', mode === 'detail');
  document.getElementById('dp-simple-panel').style.display = mode === 'simple' ? 'block' : 'none';
  document.getElementById('dp-detail-panel').style.display = mode === 'detail' ? 'block' : 'none';

  const state = window.gameState;
  if (state?.items?.length > 0) {
    updateDPVisualizer(state.items, state.selectedIds, state.budget);
  }
}

// ========== SET MODE KALKULASI ========== //
function setKalkMode(mode) {
  kalkMode = mode;
  document.getElementById('kalk-mode-simple').classList.toggle('active', mode === 'simple');
  document.getElementById('kalk-mode-detail').classList.toggle('active', mode === 'detail');
  document.getElementById('kalk-simple').style.display = mode === 'simple' ? 'block' : 'none';
  document.getElementById('kalk-detail').style.display = mode === 'detail' ? 'block' : 'none';
}

// ========== UPDATE VISUALIZER REALTIME ========== //
function updateDPVisualizer(items, selectedIds, budget) {
  if (!items || items.length === 0) return;
  const result = clientKnapsack(items, budget);

  if (dvMode === 'simple') {
    updateSimplePanel(items, selectedIds, result, budget);
  } else {
    updateDetailPanel(items, selectedIds, result, budget);
  }
}

// ========== MODE SIMPEL ========== //
function updateSimplePanel(items, selectedIds, dpResult, budget) {
  const conceptEl = document.getElementById('dp-concept-text');
  const barsEl    = document.getElementById('dp-bars-container');
  const greedyEl  = document.getElementById('dp-greedy-note');

  const playerProfit = selectedIds.reduce((s, id) => {
    const it = items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);

  const diff = dpResult.maxProfit - playerProfit;
  const eff  = dpResult.maxProfit > 0
    ? ((playerProfit / dpResult.maxProfit) * 100).toFixed(1) : 100;

  // Teks konsep
  if (selectedIds.length === 0) {
    conceptEl.textContent = 'Pilih barang untuk melihat analisis DP real-time.';
  } else if (diff === 0) {
    conceptEl.innerHTML =
      `<span style="color:var(--green)">✅ OPTIMAL!</span> ` +
      `Pilihanmu sama dengan <code style="color:var(--gold)">` +
      `dp[${items.length}][${budget}] = ${dpResult.maxProfit}</code>`;
  } else {
    conceptEl.innerHTML =
      `Efisiensi: <span style="color:var(--gold)">${eff}%</span> — ` +
      `<code style="color:var(--gold)">dp[${items.length}][${budget}] = ${dpResult.maxProfit}</code>, ` +
      `pilihanmu = <span style="color:var(--green)">${playerProfit}</span>, ` +
      `selisih = <span style="color:var(--red)">-${diff}</span>`;
  }

  // Bar chart
  const maxP = Math.max(...items.map(i => i.profit), 1);
  barsEl.innerHTML = items.map(item => {
    const isSel     = selectedIds.includes(item.id);
    const isOpt     = dpResult.chosenIds.includes(item.id);
    const pct       = ((item.profit / maxP) * 100).toFixed(0);
    let fillClass   = 'dp-bar-fill is-none';
    let suffix      = '';
    if (isSel && isOpt) { fillClass = 'dp-bar-fill is-both';    suffix = ' ✓+DP'; }
    else if (isOpt)     { fillClass = 'dp-bar-fill is-optimal'; suffix = ' DP'; }
    else if (isSel)     { fillClass = 'dp-bar-fill is-player';  suffix = ' ✓'; }

    return `
      <div class="dp-bar-row">
        <span class="dp-bar-name">${item.emoji} ${item.name}${suffix}</span>
        <div class="dp-bar-track">
          <div class="${fillClass}" style="width:${pct}%"></div>
        </div>
        <span class="dp-bar-val">+${item.profit}</span>
      </div>`;
  }).join('');

  // Greedy note
  const aiP = aiState.totalProfit;
  if (aiP > 0) {
    const aiEff = dpResult.maxProfit > 0
      ? ((aiP / dpResult.maxProfit) * 100).toFixed(1) : 0;
    greedyEl.innerHTML =
      `🤖 AI Greedy: +${aiP} (${aiEff}% dari optimal)<br>` +
      `<span style="color:var(--text3);font-size:12px">` +
      `Greedy selalu ambil rasio tertinggi — tidak selalu optimal!</span>`;
  } else {
    greedyEl.textContent = '';
  }
}

// ========== MODE DETAIL ========== //
function updateDetailPanel(items, selectedIds, dpResult, budget) {
  renderDPGridTable('dp-grid', items, dpResult);
  renderTracebackList('dp-traceback-list', dpResult.tracebackPath, items);
}

// ========== RENDER TABEL DP ========== //
function renderDPGridTable(tableId, items, dpResult) {
  const table = document.getElementById(tableId);
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
      <td style="color:var(--red2)">${ri === 0 ? '—' : row.itemCost}</td>
      <td style="color:var(--green)">${ri === 0 ? '—' : '+' + row.itemProfit}</td>
      ${row.values.map(cell => {
        let cls = '';
        if (cell.isTraceback) cls = 'cell-traceback';
        else if (cell.value > 0) cls = 'cell-active';
        return `<td class="${cls}">${cell.value}</td>`;
      }).join('')}
    </tr>`;
  });

  html += '</tbody>';
  table.innerHTML = html;
  if (!dpAnimating) animateTableRows(table);
}

// ========== ANIMASI TABEL ROW PER ROW ========== //
function animateTableRows(table) {
  dpAnimating = true;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row, i) => {
    setTimeout(() => {
      row.querySelectorAll('td').forEach(cell => {
        cell.classList.add('cell-filling');
        SFX.dpTick();
        setTimeout(() => cell.classList.remove('cell-filling'), 350);
      });
      if (i === rows.length - 1) dpAnimating = false;
    }, i * 140);
  });
}

// ========== RENDER TRACEBACK ========== //
function renderTracebackList(elId, tracebackPath, items) {
  const el = document.getElementById(elId);
  if (!el || !tracebackPath) return;

  el.innerHTML = tracebackPath.map((step, i) => {
    const item   = items.find(it => it.id === step.itemId);
    const isAmbil = step.action === 'DIAMBIL';
    return `
      <div class="traceback-step delay-${Math.min(i+1,8)}">
        <span class="traceback-action ${isAmbil ? 'ambil' : 'lewat'}">
          ${isAmbil ? 'AMBIL' : 'LEWAT'}
        </span>
        <span class="traceback-item">
          ${item ? item.emoji : ''} ${step.itemName}
          <span style="color:var(--text3);font-size:11px">
            (cost:${step.itemCost} profit:+${step.itemProfit})
          </span>
        </span>
        <span class="traceback-budget">W:${step.budgetBefore}→${step.budgetAfter}</span>
      </div>`;
  }).join('');
}

// ========================================
//   FASE KALKULASI — FADE-IN BERTAHAP
// ========================================

async function showKalkulasiPhase(items, selectedIds, budget) {
  const dpResult = clientKnapsack(items, budget);

  // Reset mode ke simpel dulu
  setKalkMode('simple');

  // Render konten kedua mode
  renderKalkulasiSimple(items, selectedIds, dpResult, budget);
  renderDPGridTable('kalk-dp-grid', items, dpResult);
  renderTracebackList('kalk-traceback-list', dpResult.tracebackPath, items);

  // Buka popup
  openPopup('popup-kalkulasi');

  // Jalankan fade-in bertahap setelah popup terbuka
  await delay(300);
  await runKalkulasiSteps(items, selectedIds, dpResult, budget);

  return dpResult;
}

// ========== LANGKAH-LANGKAH KALKULASI — FADE-IN ========== //
async function runKalkulasiSteps(items, selectedIds, dpResult, budget) {
  const playerProfit = selectedIds.reduce((s, id) => {
    const it = items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);
  const aiProfit  = aiState.totalProfit;
  const dpMax     = dpResult.maxProfit;
  const playerEff = dpMax > 0 ? ((playerProfit / dpMax) * 100).toFixed(1) : 100;
  const aiEff     = dpMax > 0 ? ((aiProfit     / dpMax) * 100).toFixed(1) : 0;

  // Step 1 — Pengantar
  await showDPStep('step-intro',
    'APA ITU DP KNAPSACK?',
    `Algoritma <strong>0/1 Knapsack</strong> mencari kombinasi item yang
    memaksimalkan keuntungan dalam batas budget Rp ${budget}.
    Ia mengecek <strong style="color:var(--gold)">
    ${Math.pow(2, items.length).toLocaleString()} kemungkinan kombinasi</strong>
    untuk ${items.length} item — sesuatu yang mustahil dilakukan secara manual!`
  , 0);

  // Step 2 — Rumus
  await showDPStep('step-rumus',
    'RUMUS REKURENS',
    `Untuk setiap item ke-<code>i</code> dan budget <code>w</code>:<br>
    <code style="color:var(--gold);font-size:15px">
      dp[i][w] = max( dp[i-1][w] ,  dp[i-1][w - cost[i]] + profit[i] )
    </code><br>
    Artinya: pilih nilai terbesar antara
    <span style="color:var(--cyan)">tidak mengambil item ini</span> atau
    <span style="color:var(--green)">mengambilnya jika muat di budget</span>.`
  , 500);

  // Step 3 — Hasil DP
  await showDPStep('step-hasil',
    'HASIL OPTIMAL',
    `Nilai <code style="color:var(--gold)">dp[${items.length}][${budget}] =
    <strong>${dpMax}</strong></code> adalah keuntungan maksimum yang bisa dicapai.
    Item yang dipilih DP:
    <strong style="color:var(--gold)">
      ${dpResult.chosenIds.map(id => {
        const it = items.find(i => i.id === id);
        return it ? `${it.emoji} ${it.name}` : '';
      }).filter(Boolean).join(', ')}
    </strong>`
  , 500);

  // Step 4 — Traceback
  await showDPStep('step-traceback',
    'TRACEBACK — BAGAIMANA ITEM DIPILIH?',
    `Algoritma berjalan mundur dari <code>dp[${items.length}][${budget}]</code>.
    Jika <code>dp[i][w] ≠ dp[i-1][w]</code> → item ke-i <span style="color:var(--green)">DIAMBIL</span>
    dan budget dikurangi <code>cost[i]</code>.
    Jika sama → item ke-i <span style="color:var(--red)">DILEWATI</span>.`
  , 500);

  // Step 5 — Perbandingan skor + bar animasi
  await showDPStep('step-compare',
    'PERBANDINGAN SKOR',
    `Kamu: <span style="color:var(--green)">+${playerProfit}</span>
    (${playerEff}% dari optimal) &nbsp;|&nbsp;
    AI Greedy: <span style="color:var(--red)">+${aiProfit}</span>
    (${aiEff}% dari optimal) &nbsp;|&nbsp;
    DP: <span style="color:var(--gold)">+${dpMax}</span> (100%)<br>
    <span style="color:var(--text3);font-size:12px">
    AI hanya melihat rasio terbaik saat ini — tidak mempertimbangkan kombinasi lain.</span>`
  , 500);

  // Animasi bar setelah step 5 muncul
  await delay(300);
  animateKalkBars(playerProfit, aiProfit, dpMax);
}

// ========== SHOW SATU STEP DENGAN FADE-IN ========== //
async function showDPStep(id, label, html, delayMs = 400) {
  // Buat elemen step kalau belum ada
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id        = id;
    el.className = 'dp-step';
    el.innerHTML = `
      <div class="dp-step-label">${label}</div>
      <div class="dp-step-text">${html}</div>
    `;
    document.getElementById('kalk-concept').appendChild(el);
  } else {
    el.querySelector('.dp-step-label').textContent = label;
    el.querySelector('.dp-step-text').innerHTML    = html;
  }

  await delay(delayMs);

  // Fade-in
  el.classList.add('visible');

  // Suara subtle
  SFX.dpTrace();

  // Tunggu animasi selesai
  await delay(450);
}

// ========== ANIMASI KALK BARS ========== //
function animateKalkBars(player, ai, dp) {
  const maxVal = Math.max(dp, player, ai, 1);

  const barsEl = document.getElementById('kalk-bars');
  barsEl.innerHTML = `
    <div class="kalk-bar-row">
      <span class="kalk-bar-label gold">DP OPTIMAL</span>
      <div class="kalk-bar-track">
        <div class="kalk-bar-fill gold-fill" id="kbar-dp" style="width:0%"></div>
      </div>
      <span class="kalk-bar-val gold">+${dp}</span>
    </div>
    <div class="kalk-bar-row">
      <span class="kalk-bar-label green">KAMU</span>
      <div class="kalk-bar-track">
        <div class="kalk-bar-fill green-fill" id="kbar-player" style="width:0%"></div>
      </div>
      <span class="kalk-bar-val green">+${player}</span>
    </div>
    <div class="kalk-bar-row">
      <span class="kalk-bar-label red">AI GREEDY</span>
      <div class="kalk-bar-track">
        <div class="kalk-bar-fill red-fill" id="kbar-ai" style="width:0%"></div>
      </div>
      <span class="kalk-bar-val red">+${ai}</span>
    </div>
  `;

  // Animasi bar dengan delay
  setTimeout(() => {
    document.getElementById('kbar-dp').style.width =
      `${(dp / maxVal * 100).toFixed(1)}%`;
  }, 100);
  setTimeout(() => {
    document.getElementById('kbar-player').style.width =
      `${(player / maxVal * 100).toFixed(1)}%`;
    SFX.coin();
  }, 400);
  setTimeout(() => {
    document.getElementById('kbar-ai').style.width =
      `${(ai / maxVal * 100).toFixed(1)}%`;
  }, 700);
}

// ========== RENDER KALKULASI SIMPEL (container) ========== //
function renderKalkulasiSimple(items, selectedIds, dpResult, budget) {
  // Reset steps lama
  const conceptEl = document.getElementById('kalk-concept');
  conceptEl.innerHTML = '';

  // Bar container — diisi oleh animateKalkBars nanti
  const barsEl = document.getElementById('kalk-bars');
  barsEl.innerHTML = '';
}

// ========== DELAY HELPER ========== //
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== CLIENT KNAPSACK ========== //
function clientKnapsack(items, budget) {
  const n  = items.length;
  const W  = budget;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w];
      if (item.cost <= w) {
        const v = dp[i - 1][w - item.cost] + item.profit;
        if (v > dp[i][w]) dp[i][w] = v;
      }
    }
  }

  // Traceback
  const chosenIds      = [];
  const tracebackPath  = [];
  let w = W;

  for (let i = n; i >= 1; i--) {
    const item  = items[i - 1];
    const taken = dp[i][w] !== dp[i - 1][w];
    tracebackPath.push({
      step:         n - i + 1,
      itemId:       item.id,
      itemName:     item.name,
      itemCost:     item.cost,
      itemProfit:   item.profit,
      budgetBefore: w,
      budgetAfter:  taken ? w - item.cost : w,
      action:       taken ? 'DIAMBIL' : 'DILEWATI',
    });
    if (taken) { chosenIds.push(item.id); w -= item.cost; }
  }

  // Kompres tabel
  const step    = Math.max(1, Math.floor(W / 20));
  const columns = [];
  for (let c = 0; c <= W; c += step) columns.push(c);
  if (columns[columns.length - 1] !== W) columns.push(W);

  const table = dp.map((row, i) => ({
    itemIndex:  i,
    itemName:   i === 0 ? '—' : items[i-1].name,
    itemEmoji:  i === 0 ? ''  : items[i-1].emoji,
    itemCost:   i === 0 ? 0   : items[i-1].cost,
    itemProfit: i === 0 ? 0   : items[i-1].profit,
    values: columns.map(w => ({
      w,
      value: row[w],
      isTraceback: tracebackPath.some(
        t => t.itemId === (i > 0 ? items[i-1].id : -1) &&
             t.action === 'DIAMBIL' &&
             t.budgetBefore === w
      ),
    })),
  }));

  return {
    maxProfit:    dp[n][W],
    chosenIds,
    tracebackPath: tracebackPath.reverse(),
    table,
    columns,
  };
}