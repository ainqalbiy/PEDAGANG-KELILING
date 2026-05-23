// ========== RENDER ITEMS GRID ========== //
function renderItems(items, selectedIds, budget) {
  const grid = document.getElementById("items-grid");
  const spent = getSpentFromIds(selectedIds, items);
  const remaining = budget - spent;

  grid.innerHTML = items
    .map((item) => {
      const isSelected = selectedIds.includes(item.id);
      const canAfford = item.cost <= remaining;
      const ratio = (item.profit / item.cost).toFixed(2);

      let cls = "item-card";
      if (isSelected) cls += " selected";
      else if (!canAfford) cls += " disabled";

      return `
        <div class="${cls}" data-id="${item.id}" onclick="handleItemClick(${item.id})">
          <div class="item-check">✓</div>
          <span class="item-emoji">${item.emoji}</span>
          <div class="item-name">${item.name}</div>
          <div class="item-stats">
            <span class="item-cost">Rp ${item.cost}</span>
            <span class="item-profit">+${item.profit}</span>
          </div>
          <div class="item-ratio">Rasio: ${ratio}x</div>
        </div>
      `;
    })
    .join("");
}

// ========== RENDER KERANJANG ========== //
function renderKeranjang(selectedIds, items) {
  const list = document.getElementById("keranjang-list");
  const totalEl = document.getElementById("keranjang-total");
  const profitEl = document.getElementById("keranjang-profit");

  if (selectedIds.length === 0) {
    list.innerHTML = `<p class="keranjang-empty">Belum ada barang dipilih</p>`;
    totalEl.style.display = "none";
    return;
  }

  let totalProfit = 0;
  let html = "";

  selectedIds.forEach((id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    totalProfit += item.profit;
    html += `
      <div class="keranjang-item anim-slide-right">
        <span class="ki-emoji">${item.emoji}</span>
        <span class="ki-name">${item.name}</span>
        <span class="ki-profit">+${item.profit}</span>
        <button class="ki-remove" onclick="handleRemoveItem(${item.id})" title="Hapus">✕</button>
      </div>
    `;
  });

  list.innerHTML = html;
  totalEl.style.display = "flex";
  profitEl.textContent = `+Rp ${totalProfit}`;
}

// ========== RENDER STATUS BAR ========== //
function renderStatusBar(selectedIds, items, budget, totalScore) {
  const spent = getSpentFromIds(selectedIds, items);
  const remaining = budget - spent;
  const profit = getProfitFromIds(selectedIds, items);
  const pct = Math.max(0, (remaining / budget) * 100);

  // Budget
  document.getElementById("stat-budget").textContent = `Rp ${remaining}`;
  const fill = document.getElementById("budget-fill");
  fill.style.width = pct + "%";

  if (pct < 20) {
    fill.classList.add("danger");
  } else {
    fill.classList.remove("danger");
  }

  // Profit
  const profitEl = document.getElementById("stat-profit");
  profitEl.textContent = `+Rp ${profit}`;
  profitEl.classList.remove("updated");
  void profitEl.offsetWidth; // trigger reflow untuk restart animasi
  profitEl.classList.add("updated");

  // Total skor
  document.getElementById("stat-total").textContent = `+Rp ${totalScore}`;

  // Tombol berangkat
  document.getElementById("btn-berangkat").disabled = selectedIds.length === 0;
}

// ========== RENDER STAGE DOTS ========== //
function renderStageDots(currentRound, totalRounds) {
  const dots = document.getElementById("stage-dots");
  const label = document.getElementById("stage-label");

  dots.innerHTML = Array.from({ length: totalRounds })
    .map((_, i) => {
      let cls = "stage-dot";
      if (i < currentRound) cls += " done";
      else if (i === currentRound) cls += " current";
      return `<div class="${cls}" title="Ronde ${i + 1}"></div>`;
    })
    .join("");

  label.textContent = `Ronde ${currentRound + 1} dari ${totalRounds}`;
}

// ========== RENDER ROUTE INFO ========== //
function renderRouteInfo(route) {
  document.getElementById("route-emoji").textContent = route.emoji;
  document.getElementById("route-name").textContent = route.name;
  document.getElementById("route-location").textContent = route.location;
  document.getElementById("route-desc").textContent = route.description;
}

// ========== RENDER HASIL RONDE ========== //
function renderHasil(data) {
  const {
    playerScore,
    dpScore,
    outcome,
    efficiency,
    diff,
    resultMessage,
    dpChosenIds,
    tracebackPath,
    items,
  } = data;

  // Title popup
  const titles = {
    win:   "🏆 Kamu Mengalahkan Algoritma!",
    tie:   "⚖️ Imbang Sempurna!",
    close: "📈 Hampir Optimal!",
    lose:  "🧮 Algoritma Lebih Unggul",
  };
  document.getElementById("hasil-title").textContent = titles[outcome];

  // Skor
  document.getElementById("hasil-player-score").textContent = `+${playerScore}`;
  document.getElementById("hasil-dp-score").textContent = `+${dpScore}`;

  // Pesan & efisiensi
  const msgEl = document.getElementById("hasil-message");
  msgEl.textContent = resultMessage;
  msgEl.className = `hasil-message ${outcome}`;

  document.getElementById("hasil-efficiency").textContent =
    `Efisiensi: ${efficiency}% dari optimal${diff > 0 ? ` (selisih Rp ${diff})` : ""}`;

  // Pilihan optimal DP
  const optimalEl = document.getElementById("dp-optimal-items");
  optimalEl.innerHTML = data.dpChosenIds
    .map((id) => {
      const item = data.items.find((i) => i.id === id);
      if (!item) return "";
      const matched = data.playerItems.some((pi) => pi.id === id);
      return `
        <div class="dp-item-chip ${matched ? "matched" : ""}">
          ${item.emoji} ${item.name}
          <span class="chip-profit">+${item.profit}</span>
        </div>
      `;
    })
    .join("");

  // Traceback steps
  renderTracebackSteps(tracebackPath);

  // Tombol next/finish
  const isLast = data.round === 4;
  document.getElementById("btn-next-round").style.display = isLast ? "none" : "block";
  document.getElementById("btn-finish-game").style.display = isLast ? "block" : "none";
}

// ========== RENDER TRACEBACK STEPS ========== //
function renderTracebackSteps(tracebackPath) {
  const el = document.getElementById("traceback-steps");
  el.innerHTML = tracebackPath
    .map((step, i) => `
      <div class="traceback-step delay-${Math.min(i + 1, 8)}">
        <span class="traceback-action ${step.action === "DIAMBIL" ? "diambil" : "dilewati"}">
          ${step.action}
        </span>
        <span style="flex:1; color:var(--paper2);">
          ${step.itemName}
        </span>
        <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--muted);">
          budget ${step.budgetBefore} → ${step.budgetAfter}
        </span>
      </div>
    `)
    .join("");
}

// ========== RENDER AKHIR PERJALANAN ========== //
function renderAkhir(gameHistory, totalPlayer, totalDP) {
  const wins   = gameHistory.filter((r) => r.outcome === "win").length;
  const ties   = gameHistory.filter((r) => r.outcome === "tie").length;
  const efficiency = totalDP > 0
    ? ((totalPlayer / totalDP) * 100).toFixed(1)
    : 100;

  // Judul
  let title = "";
  if (wins >= 4)      title = "🏆 Pedagang Legendaris!";
  else if (wins >= 3) title = "⭐ Pedagang Ulung!";
  else if (wins >= 2) title = "👍 Pedagang Handal";
  else if (wins >= 1) title = "📚 Pedagang Pemula";
  else                title = "🌱 Terus Belajar!";

  document.getElementById("akhir-title").textContent = title;
  document.getElementById("akhir-player-total").textContent = `+${totalPlayer}`;
  document.getElementById("akhir-dp-total").textContent = `+${totalDP}`;

  // Stats
  document.getElementById("akhir-stats").innerHTML = `
    <div class="akhir-stat-box">
      <div class="akhir-stat-label">Ronde Menang</div>
      <div class="akhir-stat-value" style="color:var(--green2)">${wins}</div>
    </div>
    <div class="akhir-stat-box">
      <div class="akhir-stat-label">Efisiensi</div>
      <div class="akhir-stat-value">${efficiency}%</div>
    </div>
    <div class="akhir-stat-box">
      <div class="akhir-stat-label">Selisih DP</div>
      <div class="akhir-stat-value" style="color:#e05a45">-${totalDP - totalPlayer}</div>
    </div>
  `;

  // Riwayat per ronde
  const ROUTES_NAME = [
    "Pasar Makassar",
    "Pelabuhan Pare-Pare",
    "Pekan Toraja",
    "Pasar Bone",
    "Pasar Palopo",
  ];

  document.getElementById("akhir-history").innerHTML = `
    <p class="akhir-history-title">Riwayat Perjalanan</p>
    ${gameHistory
      .map((r, i) => `
        <div class="akhir-round-row">
          <span class="akhir-round-name">${ROUTES_NAME[i]}</span>
          <span class="akhir-round-badge ${r.outcome}">${r.outcome.toUpperCase()}</span>
          <span class="akhir-round-score">+${r.playerScore} / +${r.dpScore}</span>
        </div>
      `)
      .join("")}
  `;
}

// ========== RENDER LEADERBOARD ========== //
function renderLeaderboard(data) {
  const el = document.getElementById("leaderboard-list");

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="lb-empty">Belum ada skor tersimpan.<br>Jadilah yang pertama!</div>`;
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  el.innerHTML = data
    .map((row, i) => `
      <div class="lb-row">
        <span class="lb-rank">${medals[i] || row.rank}</span>
        <span class="lb-name">${row.name}</span>
        <span class="lb-efficiency">${row.efficiency}%</span>
        <span class="lb-score">+${row.score}</span>
      </div>
    `)
    .join("");
}

// ========== RENDER SHIMMER LOADING ========== //
function renderShimmer() {
  const grid = document.getElementById("items-grid");
  grid.innerHTML = Array(8)
    .fill(`<div class="shimmer shimmer-card"></div>`)
    .join("");
}

// ========== HELPER FUNCTIONS ========== //
function getSpentFromIds(ids, items) {
  return ids.reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.cost : 0);
  }, 0);
}

function getProfitFromIds(ids, items) {
  return ids.reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);
}