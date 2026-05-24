// ========== STATE VISUALIZER ========== //
let dvMode = 'simple';
let kalkMode = 'simple';

// ========== SET MODE DP PANEL ========== //
function setDPMode(mode) {
  dvMode = mode;
  document.getElementById('dp-mode-simple').classList.toggle('active', mode === 'simple');
  document.getElementById('dp-mode-detail').classList.toggle('active', mode === 'detail');
  document.getElementById('dp-simple-panel').style.display = mode === 'simple' ? 'block' : 'none';
  document.getElementById('dp-detail-panel').style.display = mode === 'detail' ? 'block' : 'none';

  // Refresh dengan data saat ini
  const state = window.gameState;
  if (state && state.items && state.items.length > 0) {
    updateDPVisualizer(state.items, state.selectedIds, state.budget);
  }
}

// ========== SET MODE KALKULASI ========== //
function setKalkMode(mode) {
  kalkMode = mode;
  document.getElementById('kalk-mode-simple').classList.toggle('active', mode === 'simple');
  document.getElementById('kalk-mode-detail').classList.toggle('active', mode === 'detail');
  document.getElementById('kalk-simple').style.display = mode === 'simple' ? 'block' : 'none';
  document.getElementById('kalk-detail').style.display  = mode === 'detail' ? 'block' : 'none';
}

// ========== UPDATE DP VISUALIZER (dipanggil saat item dipilih) ========== //
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

  const playerProfit = selectedIds.reduce((sum, id) => {
    const item = items.find(i => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);

  const diff = dpResult.maxProfit - playerProfit;
  const eff  = dpResult.maxProfit > 0
    ? ((playerProfit / dpResult.maxProfit) * 100).toFixed(1)
    : 100;

  // Konsep teks
  if (selectedIds.length === 0) {
    conceptEl.textContent = 'Pilih barang untuk melihat analisis DP real-time.';
  } else if (diff === 0) {
    conceptEl.innerHTML =
      `<span style="color:var(--green)">✅ OPTIMAL!</span> ` +
      `Pilihanmu sama dengan hasil dp[${items.length}][${budget}] = ${dpResult.maxProfit}`;
  } else {
    conceptEl.innerHTML =
      `Efisiensi: <span style="color:var(--gold)">${eff}%</span> — ` +
      `dp[${items.length}][${budget}] = <span style="color:var(--gold)">${dpResult.maxProfit}</span>, ` +
      `pilihanmu = <span style="color:var(--green)">${playerProfit}</span>, ` +
      `selisih = <span style="color:var(--red)">-${diff}</span>`;
  }

  // Bar chart per item
  const maxProfit = Math.max(...items.map(i => i.profit), 1);
  barsEl.innerHTML = items.map(item => {
    const isSelected = selectedIds.includes(item.id);
    const isOptimal  = dpResult.chosenIds.includes(item.id);
    const pct = ((item.profit / maxProfit) * 100).toFixed(0);

    let fillClass = 'dp-bar-fill is-none';
    let suffix    = '';
    if (isSelected && isOptimal) { fillClass = 'dp-bar-fill is-both';    suffix = ' ✓+DP'; }
    else if (isOptimal)          { fillClass = 'dp-bar-fill is-optimal'; suffix = ' DP';   }
    else if (isSelected)         { fillClass = 'dp-bar-fill is-player';  suffix = ' ✓';    }

    return `
      <div class="dp-bar-row">
        <span class="dp-bar-name">${item.emoji} ${item.name}${suffix}</span>
        <div class="dp-bar-track">
          <div class="${fillClass}" style="width:${pct}%"></div>
        </div>
        <span class="dp-bar-val">+${item.profit}</span>
      </div>
    `;
  }).join('');

  // Greedy note — bandingkan AI vs DP
  const aiProfit = aiState.totalProfit;
  if (aiProfit > 0) {
    const aiEff = dpResult.maxProfit > 0
      ? ((aiProfit / dpResult.maxProfit) * 100).toFixed(1)
      : 0;
    greedyEl.innerHTML =
      `🤖 AI Greedy: +${aiProfit} (${aiEff}% dari optimal)<br>` +
      `<span style="color:var(--text3);font-size:12px">` +
      `Greedy selalu ambil rasio tertinggi — tapi tidak selalu optimal!</span>`;
  } else {
    greedyEl.textContent = '';
  }
}

// ========== MODE DETAIL ========== //
function updateDetailPanel(items, selectedIds, dpResult, budget) {
  renderDPGridTable('dp-grid', items, dpResult, budget);
  renderTracebackList('dp-traceback-list', dpResult.tracebackPath, items);
}

// ========== RENDER TABEL DP GRID ========== //
function renderDPGridTable(tableId, items, dpResult, budget) {
  const table = document.getElementById(tableId);
  if (!table || !dpResult.table) return;

  const { table: dpTable, columns } = dpResult;

  // Header
  let html = `<thead><tr>
    <th>ITEM</th>
    <th>COST</th>
    <th>PROFIT</th>
    ${columns.map(w => `<th>W=${w}</th>`).join('')}
  </tr></thead><tbody>`;

  // Rows
  dpTable.forEach((row, rowIdx) => {
    html += `<tr>
      <td style="text-align:left; white-space:nowrap; color:var(--text)">
        ${row.itemEmoji} ${row.itemName}
      </td>
      <td style="color:var(--red2)">${rowIdx === 0 ? '—' : row.itemCost}</td>
      <td style="color:var(--green)">${rowIdx === 0 ? '—' : '+' + row.itemProfit}</td>
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

  // Animasi baris per baris
  animateTableRows(table);
}

// ========== ANIMASI TABEL BARIS PER BARIS ========== //
function animateTableRows(table) {
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row, i) => {
    setTimeout(() => {
      row.querySelectorAll('td').forEach(cell => {
        cell.classList.add('cell-filling');
        setTimeout(() => cell.classList.remove('cell-filling'), 350);
      });
    }, i * 150);
  });
}

// ========== RENDER TRACEBACK LIST ========== //
function renderTracebackList(elId, tracebackPath, items) {
  const el = document.getElementById(elId);
  if (!el || !tracebackPath) return;

  el.innerHTML = tracebackPath.map((step, i) => {
    const item = items.find(it => it.id === step.itemId);
    const isAmbil = step.action === 'DIAMBIL';
    return `
      <div class="traceback-step delay-${Math.min(i+1, 8)}">
        <span class="traceback-action ${isAmbil ? 'ambil' : 'lewat'}">
          ${isAmbil ? 'AMBIL' : 'LEWAT'}
        </span>
        <span class="traceback-item">
          ${item ? item.emoji : ''} ${step.itemName}
          <span style="color:var(--text3); font-size:11px">
            (cost:${step.itemCost} profit:+${step.itemProfit})
          </span>
        </span>
        <span class="traceback-budget">
          W:${step.budgetBefore}→${step.budgetAfter}
        </span>
      </div>
    `;
  }).join('');
}

// ========== TAMPILKAN FASE KALKULASI ========== //
async function showKalkulasiPhase(items, selectedIds, budget) {
  const dpResult = clientKnapsack(items, budget);

  // Render mode simpel kalkulasi
  renderKalkulasiSimple(items, selectedIds, dpResult, budget);

  // Render mode detail kalkulasi
  renderDPGridTable('kalk-dp-grid', items, dpResult, budget);
  renderTracebackList('kalk-traceback-list', dpResult.tracebackPath, items);

  openPopup('popup-kalkulasi');

  return dpResult;
}

// ========== RENDER KALKULASI SIMPEL ========== //
function renderKalkulasiSimple(items, selectedIds, dpResult, budget) {
  const barsEl   = document.getElementById('kalk-bars');
  const conceptEl = document.getElementById('kalk-concept');

  const playerProfit = selectedIds.reduce((sum, id) => {
    const item = items.find(i => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);

  const aiProfit = aiState.totalProfit;
  const dpMax    = dpResult.maxProfit;
  const maxVal   = Math.max(dpMax, playerProfit, aiProfit, 1);

  barsEl.innerHTML = `
    <div class="kalk-bar-row">
      <span class="kalk-bar-label gold">DP OPTIMAL</span>
      <div class="kalk-bar-track">
        <div class="kalk-bar-fill gold-fill"
             style="width:${(dpMax/maxVal*100).toFixed(0)}%"></div>
      </div>
      <span class="kalk-bar-val gold">+${dpMax}</span>
    </div>
    <div class="kalk-bar-row">
      <span class="kalk-bar-label green">KAMU</span>
      <div class="kalk-bar-track">
        <div class="kalk-bar-fill green-fill"
             style="width:${(playerProfit/maxVal*100).toFixed(0)}%"></div>
      </div>
      <span class="kalk-bar-val green">+${playerProfit}</span>
    </div>
    <div class="kalk-bar-row">
      <span class="kalk-bar-label red">AI GREEDY</span>
      <div class="kalk-bar-track">
        <div class="kalk-bar-fill red-fill"
             style="width:${(aiProfit/maxVal*100).toFixed(0)}%"></div>
      </div>
      <span class="kalk-bar-val red">+${aiProfit}</span>
    </div>
  `;

  // Konsep penjelasan
  const playerEff = dpMax > 0
    ? ((playerProfit / dpMax) * 100).toFixed(1) : 100;
  const aiEff = dpMax > 0
    ? ((aiProfit / dpMax) * 100).toFixed(1) : 0;

  conceptEl.innerHTML = `
    <strong style="color:var(--gold)">Cara DP Knapsack bekerja:</strong><br>
    Algoritma mengecek SEMUA kombinasi ${Math.pow(2, items.length).toLocaleString()}
    kemungkinan untuk ${items.length} item.<br><br>
    Rumus: <span style="color:var(--gold2)">dp[i][w] = max(dp[i-1][w], dp[i-1][w-cost]+profit)</span><br><br>
    Hasilnya: <span style="color:var(--gold)">Rp ${dpMax}</span> adalah nilai
    <strong>maksimum yang bisa dicapai</strong> dengan budget Rp ${budget}.<br><br>
    Kamu mencapai <span style="color:var(--green)">${playerEff}%</span> dari optimal.
    AI Greedy mencapai <span style="color:var(--red)">${aiEff}%</span> dari optimal.
    ${parseFloat(playerEff) > parseFloat(aiEff)
      ? `<br><span style="color:var(--green)">✅ Kamu mengalahkan AI Greedy!</span>`
      : parseFloat(playerEff) === parseFloat(aiEff)
      ? `<br><span style="color:var(--cyan)">⚖️ Kamu seri dengan AI Greedy.</span>`
      : `<br><span style="color:var(--red)">❌ AI Greedy mengalahkanmu kali ini.</span>`
    }
  `;
}

// ========== CLIENT KNAPSACK (real-time, tanpa server) ========== //
function clientKnapsack(items, budget) {
  const n = items.length;
  const W = budget;

  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w];
      if (item.cost <= w) {
        const withItem = dp[i - 1][w - item.cost] + item.profit;
        if (withItem > dp[i][w]) dp[i][w] = withItem;
      }
    }
  }

  // Traceback
  const chosenIds     = [];
  const tracebackPath = [];
  let w = W;

  for (let i = n; i >= 1; i--) {
    const item   = items[i - 1];
    const taken  = dp[i][w] !== dp[i - 1][w];
    tracebackPath.push({
      step:        n - i + 1,
      itemId:      item.id,
      itemName:    item.name,
      itemCost:    item.cost,
      itemProfit:  item.profit,
      budgetBefore: w,
      budgetAfter:  taken ? w - item.cost : w,
      action:       taken ? 'DIAMBIL' : 'DILEWATI',
    });
    if (taken) {
      chosenIds.push(item.id);
      w -= item.cost;
    }
  }

  // Kompres tabel
  const step    = Math.max(1, Math.floor(W / 20));
  const columns = [];
  for (let col = 0; col <= W; col += step) columns.push(col);
  if (columns[columns.length - 1] !== W) columns.push(W);

  const table = dp.map((row, i) => ({
    itemIndex:  i,
    itemName:   i === 0 ? '—'  : items[i-1].name,
    itemEmoji:  i === 0 ? ''   : items[i-1].emoji,
    itemCost:   i === 0 ? 0    : items[i-1].cost,
    itemProfit: i === 0 ? 0    : items[i-1].profit,
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
    maxProfit:     dp[n][W],
    chosenIds,
    tracebackPath: tracebackPath.reverse(),
    table,
    columns,
  };
}