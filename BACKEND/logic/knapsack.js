function solveKnapsack(items, budget) {
  const n = items.length;
  const W = budget;

  // Buat tabel DP berukuran (n+1) x (W+1) diisi 0 semua
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  // Isi tabel DP baris per baris
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      // Pilihan 1: tidak ambil item ini
      dp[i][w] = dp[i - 1][w];

      // Pilihan 2: ambil item ini (kalau muat)
      if (item.cost <= w) {
        const withItem = dp[i - 1][w - item.cost] + item.profit;
        if (withItem > dp[i][w]) {
          dp[i][w] = withItem;
        }
      }
    }
  }

  // Traceback — cari item mana yang terpilih
  const chosenIds = [];
  const tracebackPath = [];
  let w = W;

  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      // Item ini diambil
      chosenIds.push(items[i - 1].id);
      tracebackPath.push({
        step: n - i + 1,
        itemId: items[i - 1].id,
        itemName: items[i - 1].name,
        itemCost: items[i - 1].cost,
        itemProfit: items[i - 1].profit,
        budgetBefore: w,
        budgetAfter: w - items[i - 1].cost,
        dpValue: dp[i][w],
        action: "DIAMBIL",
      });
      w -= items[i - 1].cost;
    } else {
      // Item ini tidak diambil
      tracebackPath.push({
        step: n - i + 1,
        itemId: items[i - 1].id,
        itemName: items[i - 1].name,
        itemCost: items[i - 1].cost,
        itemProfit: items[i - 1].profit,
        budgetBefore: w,
        budgetAfter: w,
        dpValue: dp[i][w],
        action: "DILEWATI",
      });
    }
  }

  // Kompres tabel DP untuk dikirim ke frontend
  // Hanya ambil kolom per kelipatan tertentu agar tidak terlalu besar
  const step = Math.max(1, Math.floor(W / 20));
  const columns = [];
  for (let w = 0; w <= W; w += step) {
    columns.push(w);
  }
  if (columns[columns.length - 1] !== W) {
    columns.push(W);
  }

  const compressedTable = dp.map((row, i) => ({
    itemIndex: i,
    itemName: i === 0 ? "—" : items[i - 1].name,
    itemEmoji: i === 0 ? "" : items[i - 1].emoji,
    itemCost: i === 0 ? 0 : items[i - 1].cost,
    itemProfit: i === 0 ? 0 : items[i - 1].profit,
    values: columns.map((w) => ({
      w,
      value: row[w],
      isTraceback: tracebackPath.some(
        (t) => t.itemId === (i > 0 ? items[i - 1].id : -1) && t.action === "DIAMBIL" && t.budgetBefore === w
      ),
    })),
  }));

  return {
    maxProfit: dp[n][W],
    chosenIds,
    tracebackPath: tracebackPath.reverse(),
    table: compressedTable,
    columns,
    totalItems: n,
    budget: W,
  };
}

// Hitung skor user dari item yang dipilih
function calculatePlayerScore(selectedIds, items) {
  let totalCost = 0;
  let totalProfit = 0;
  const selectedItems = [];

  for (const id of selectedIds) {
    const item = items.find((i) => i.id === id);
    if (item) {
      totalCost += item.cost;
      totalProfit += item.profit;
      selectedItems.push(item);
    }
  }

  return { totalCost, totalProfit, selectedItems };
}

// Bandingkan pilihan user vs pilihan DP
function compareResults(playerResult, dpResult) {
  const diff = dpResult.maxProfit - playerResult.totalProfit;
  const efficiency =
    dpResult.maxProfit > 0
      ? ((playerResult.totalProfit / dpResult.maxProfit) * 100).toFixed(1)
      : 100;

  let outcome;
  if (playerResult.totalProfit > dpResult.maxProfit) {
    outcome = "win";
  } else if (playerResult.totalProfit === dpResult.maxProfit) {
    outcome = "tie";
  } else if (diff <= dpResult.maxProfit * 0.1) {
    outcome = "close";
  } else {
    outcome = "lose";
  }

  return { diff, efficiency, outcome };
}

module.exports = { solveKnapsack, calculatePlayerScore, compareResults };