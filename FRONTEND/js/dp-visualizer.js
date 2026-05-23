// ========== STATE VISUALIZER ========== //
let dvMode = "simple"; // 'simple' | 'detail'
let dvAnimating = false;
let dvAnimationQueue = [];

// ========== SET MODE ========== //
function setDPMode(mode) {
  dvMode = mode;

  document.getElementById("btn-mode-simple").classList.toggle("active", mode === "simple");
  document.getElementById("btn-mode-detail").classList.toggle("active", mode === "detail");
  document.getElementById("dp-simple-view").style.display = mode === "simple" ? "block" : "none";
  document.getElementById("dp-detail-view").style.display = mode === "detail" ? "block" : "none";
}

// ========== UPDATE VISUALIZER (dipanggil setiap user klik item) ========== //
async function updateDPVisualizer(items, selectedIds, budget) {
  if (items.length === 0) return;

  // Update badge status
  const badge = document.getElementById("dp-status-badge");
  badge.textContent = "Menghitung...";
  badge.className = "dp-badge running anim-pulse";

  // Hitung DP di sisi client (untuk real-time preview)
  const result = clientKnapsack(items, budget);

  // Update sesuai mode
  if (dvMode === "simple") {
    updateSimpleView(items, selectedIds, result, budget);
  } else {
    await updateDetailView(items, selectedIds, result, budget);
  }

  badge.textContent = `Optimal: +Rp ${result.maxProfit}`;
  badge.className = "dp-badge done";
}

// ========== MODE SIMPEL ========== //
function updateSimpleView(items, selectedIds, dpResult, budget) {
  const infoEl = document.getElementById("dp-simple-info");
  const barsEl = document.getElementById("dp-bars");

  const playerProfit = selectedIds.reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);

  const diff = dpResult.maxProfit - playerProfit;
  const efficiency = dpResult.maxProfit > 0
    ? ((playerProfit / dpResult.maxProfit) * 100).toFixed(1)
    : 100;

  // Info teks
  if (selectedIds.length === 0) {
    infoEl.innerHTML = `<p class="dp-simple-text">Pilih barang untuk melihat analisis real-time.</p>`;
  } else if (diff === 0) {
    infoEl.innerHTML = `<p class="dp-simple-text" style="color:var(--green2)">✅ Pilihan kamu sudah optimal! Efisiensi 100%</p>`;
  } else {
    infoEl.innerHTML = `
      <p class="dp-simple-text">
        Efisiensi kamu: <strong style="color:var(--gold2)">${efficiency}%</strong>
        dari optimal. Masih kurang <strong style="color:#e05a45">Rp ${diff}</strong>.
      </p>
    `;
  }

  // Bar chart per item
  const maxProfit = Math.max(...items.map((i) => i.profit));
  barsEl.innerHTML = items
    .map((item) => {
      const isSelected = selectedIds.includes(item.id);
      const isOptimal = dpResult.chosenIds.includes(item.id);
      const barPct = ((item.profit / maxProfit) * 100).toFixed(0);

      let barClass = "dp-bar-fill";
      let labelSuffix = "";

      if (isSelected && isOptimal) {
        barClass += " both";
        labelSuffix = " ✓DP";
      } else if (isOptimal) {
        barClass += " optimal";
        labelSuffix = " DP";
      } else if (isSelected) {
        barClass += " player";
        labelSuffix = " ✓";
      } else {
        barClass += " optimal";
      }

      return `
        <div class="dp-bar-item">
          <span class="dp-bar-label">${item.emoji} ${item.name}${labelSuffix}</span>
          <div class="dp-bar-track">
            <div class="${barClass}" style="width:${isSelected || isOptimal ? barPct : 20}%"></div>
          </div>
          <span class="dp-bar-val">+${item.profit}</span>
        </div>
      `;
    })
    .join("");
}

// ========== MODE DETAIL ========== //
async function updateDetailView(items, selectedIds, dpResult, budget) {
  renderDPTable(items, dpResult, budget);
  renderDetailTraceback(dpResult.tracebackPath, items);
}

// ========== RENDER TABEL DP ========== //
function renderDPTable(items, dpResult, budget) {
  const table = document.getElementById("dp-table");
  const { table: dpTable, columns } = dpResult;

  if (!dpTable || dpTable.length === 0) return;

  // Header row
  let html = `<thead><tr>
    <th>Item</th>
    <th>Cost</th>
    ${columns.map((w) => `<th>W=${w}</th>`).join("")}
  </tr></thead>`;

  // Body rows
  html += "<tbody>";
  dpTable.forEach((row, rowIdx) => {
    const isHeader = rowIdx === 0;
    html += `<tr class="${isHeader ? "" : "item-row"}">
      <td style="text-align:left; white-space:nowrap;">
        ${row.itemEmoji} ${row.itemName}
      </td>
      <td>${isHeader ? "—" : row.itemCost}</td>
      ${row.values
        .map((cell) => {
          let cls = "";
          if (cell.isTraceback) cls = "traceback";
          else if (cell.value > 0) cls = "highlight";
          return `<td class="${cls}" data-row="${rowIdx}" data-w="${cell.w}">${cell.value}</td>`;
        })
        .join("")}
    </tr>`;
  });
  html += "</tbody>";

  table.innerHTML = html;

  // Animasi sel per baris dengan delay
  if (!dvAnimating) {
    animateTableRows(table);
  }
}

// ========== ANIMASI TABEL ROW PER ROW ========== //
function animateTableRows(table) {
  dvAnimating = true;
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row, i) => {
    setTimeout(() => {
      row.querySelectorAll("td").forEach((cell) => {
        cell.classList.add("cell-filling");
        setTimeout(() => cell.classList.remove("cell-filling"), 400);
      });

      if (i === rows.length - 1) {
        dvAnimating = false;
      }
    }, i * 120);
  });
}

// ========== RENDER TRACEBACK DETAIL ========== //
function renderDetailTraceback(tracebackPath, items) {
  const el = document.getElementById("dp-traceback");
  if (!tracebackPath || tracebackPath.length === 0) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    <p class="traceback-title">🔍 Jalur Traceback</p>
    ${tracebackPath
      .map((step, i) => {
        const item = items.find((it) => it.id === step.itemId);
        return `
          <div class="traceback-step anim-slide-right delay-${Math.min(i + 1, 8)}">
            <span class="traceback-action ${step.action === "DIAMBIL" ? "diambil" : "dilewati"}">
              ${step.action}
            </span>
            <span style="flex:1; color:var(--paper2); font-size:0.8rem;">
              ${item ? item.emoji : ""} ${step.itemName}
              <span style="color:var(--muted); font-size:0.72rem;">
                (modal ${step.itemCost}, untung +${step.itemProfit})
              </span>
            </span>
            <span style="font-family:var(--font-mono); font-size:0.68rem; color:var(--muted);">
              W: ${step.budgetBefore}→${step.budgetAfter}
            </span>
          </div>
        `;
      })
      .join("")}
  `;
}

// ========== CLIENT-SIDE KNAPSACK (untuk real-time preview) ========== //
// Versi ringan — tidak kirim ke server, langsung hitung di browser
function clientKnapsack(items, budget) {
  const n = items.length;
  const W = budget;

  // Buat tabel DP
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w];
      if (item.cost <= w) {
        const withItem = dp[i - 1][w - item.cost] + item.profit;
        if (withItem > dp[i][w]) {
          dp[i][w] = withItem;
        }
      }
    }
  }

  // Traceback
  const chosenIds = [];
  const tracebackPath = [];
  let w = W;

  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosenIds.push(items[i - 1].id);
      tracebackPath.push({
        step: n - i + 1,
        itemId: items[i - 1].id,
        itemName: items[i - 1].name,
        itemCost: items[i - 1].cost,
        itemProfit: items[i - 1].profit,
        budgetBefore: w,
        budgetAfter: w - items[i - 1].cost,
        action: "DIAMBIL",
      });
      w -= items[i - 1].cost;
    } else {
      tracebackPath.push({
        step: n - i + 1,
        itemId: items[i - 1].id,
        itemName: items[i - 1].name,
        itemCost: items[i - 1].cost,
        itemProfit: items[i - 1].profit,
        budgetBefore: w,
        budgetAfter: w,
        action: "DILEWATI",
      });
    }
  }

  // Kompres tabel untuk ditampilkan
  const step = Math.max(1, Math.floor(W / 20));
  const columns = [];
  for (let col = 0; col <= W; col += step) columns.push(col);
  if (columns[columns.length - 1] !== W) columns.push(W);

  const table = dp.map((row, i) => ({
    itemIndex: i,
    itemName: i === 0 ? "—" : items[i - 1].name,
    itemEmoji: i === 0 ? "" : items[i - 1].emoji,
    itemCost: i === 0 ? 0 : items[i - 1].cost,
    itemProfit: i === 0 ? 0 : items[i - 1].profit,
    values: columns.map((w) => ({
      w,
      value: row[w],
      isTraceback: tracebackPath.some(
        (t) =>
          t.itemId === (i > 0 ? items[i - 1].id : -1) &&
          t.action === "DIAMBIL" &&
          t.budgetBefore === w
      ),
    })),
  }));

  return {
    maxProfit: dp[n][W],
    chosenIds,
    tracebackPath: tracebackPath.reverse(),
    table,
    columns,
  };
}