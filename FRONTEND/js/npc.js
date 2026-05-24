// ========== STATE TOKO AKTIF ========== //
let activeShop = null;
let shopSelectedIds = [];

// ========== DISTRIBUSI ITEM KE TOKO ========== //
// Setiap toko mendapat sebagian item dari pool global
function distributeItemsToShops(allItems, mapData) {
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  const shopItems = {};
  let itemIndex = 0;

  mapData.shops.forEach((shop) => {
    shopItems[shop.id] = [];
    const count = shop.itemCount || 2;
    for (let i = 0; i < count && itemIndex < shuffled.length; i++) {
      shopItems[shop.id].push(shuffled[itemIndex]);
      itemIndex++;
    }
  });

  return shopItems;
}

// ========== AMBIL ITEM TOKO ========== //
let globalShopItems = {};

function getShopItems(shop, allItems) {
  return globalShopItems[shop.id] || [];
}

function initShopItems(allItems, mapData) {
  globalShopItems = distributeItemsToShops(allItems, mapData);
}

// ========== BUKA TOKO ========== //
function openShop(shop) {
  activeShop = shop;
  shopSelectedIds = [...(window.gameState.selectedIds || [])];

  // Isi header NPC
  document.getElementById('shop-npc-avatar').textContent = shop.npcAvatar;
  document.getElementById('shop-npc-name').textContent   = shop.npcName.toUpperCase();
  document.getElementById('shop-npc-sub').textContent    = shop.npcSub;

  // Dialog NPC acak
  const dialogs = [
    `"Selamat datang di toko ${shop.label}! Pilih yang terbaik!"`,
    `"Harga special hari ini! Jangan lewatkan!"`,
    `"Pedagang hebat selalu pilih dengan cermat."`,
    `"Modal terbatas? Gunakan strategi yang tepat!"`,
    `"Lihat rasio profit/modal sebelum memilih!"`,
  ];
  document.getElementById('npc-dialog-text').textContent =
    dialogs[Math.floor(Math.random() * dialogs.length)];

  // Render item toko
  renderShopItems(shop);
  updateShopDPHint();

  openPopup('popup-shop');
}

// ========== RENDER ITEM DI TOKO ========== //
function renderShopItems(shop) {
  const container  = document.getElementById('shop-items');
  const items      = getShopItems(shop, window.gameState.items);
  const state      = window.gameState;
  const budget     = state.budget;
  const allSelected = state.selectedIds;

  // Hitung budget tersisa
  const spent = allSelected.reduce((sum, id) => {
    const item = state.items.find(i => i.id === id);
    return sum + (item ? item.cost : 0);
  }, 0);
  const remaining = budget - spent;

  // Hitung DP optimal untuk hint
  const dpResult = clientKnapsack(state.items, budget);

  container.innerHTML = items.map(item => {
    const isSelected  = allSelected.includes(item.id);
    const isTaken     = isItemTaken(item.id) && !isSelected;
    const canAfford   = item.cost <= remaining || isSelected;
    const isOptimal   = dpResult.chosenIds.includes(item.id);
    const ratio       = (item.profit / item.cost).toFixed(2);
    const ratioClass  = ratio >= 1.8 ? 'high' : ratio >= 1.3 ? 'med' : 'low';

    let cls = 'shop-item';
    if (isSelected)  cls += ' selected';
    if (isTaken)     cls += ' unavailable';
    if (!canAfford && !isSelected) cls += ' unavailable';
    if (isOptimal && !isTaken)    cls += ' dp-optimal';

    return `
      <div class="${cls}" onclick="handleShopItemClick(${item.id})">
        <div class="shop-item-check">✓</div>
        <span class="shop-emoji">${item.emoji}</span>
        <div class="shop-name">${item.name}</div>
        <div class="shop-row">
          <span class="shop-cost">Rp ${item.cost}</span>
          <span class="shop-profit">+${item.profit}</span>
        </div>
        <div class="shop-ratio tooltip-ratio ${ratioClass}">
          Rasio: ${ratio}x
          ${ratioClass === 'high' ? '⭐' : ''}
        </div>
        ${isOptimal && !isTaken
          ? `<div class="shop-dp-badge">✦ DP OPTIMAL</div>`
          : ''}
        ${isTaken
          ? `<div class="shop-dp-badge" style="color:var(--red);border-color:var(--red)">✕ HABIS</div>`
          : ''}
      </div>
    `;
  }).join('');
}

// ========== HANDLE KLIK ITEM DI TOKO ========== //
function handleShopItemClick(itemId) {
  const state   = window.gameState;
  const item    = state.items.find(i => i.id === itemId);
  if (!item) return;

  // Kalau item sudah diambil orang lain
  if (isItemTaken(itemId) && !state.selectedIds.includes(itemId)) {
    showToast('Item sudah diambil!', 'red');
    return;
  }

  const isSelected = state.selectedIds.includes(itemId);

  if (isSelected) {
    // Deselect
    state.selectedIds = state.selectedIds.filter(id => id !== itemId);
    markItemTaken(itemId, null);
  } else {
    // Cek budget
    const spent = state.selectedIds.reduce((sum, id) => {
      const i = state.items.find(it => it.id === id);
      return sum + (i ? i.cost : 0);
    }, 0);

    if (spent + item.cost > state.budget) {
      showToast('Modal tidak cukup!', 'red');
      return;
    }

    // Beli item
    state.selectedIds.push(itemId);
    markItemTaken(itemId, 'player');

    // Efek pickup
    showPickupEffect(
      playerState.x, playerState.y,
      `+${item.profit}`, ''
    );

    // Fetch komentar NPC dari server
    apiGetNPCComment(itemId).then(result => {
      if (result.success) {
        const d = result.data;
        document.getElementById('npc-dialog-text').textContent =
          `"${d.comment}"`;
      }
    });
  }

  // Re-render toko
  renderShopItems(activeShop);
  updateShopDPHint();

  // Update UI global
  updateAllUI();
}

// ========== UPDATE DP HINT DI TOKO ========== //
function updateShopDPHint() {
  const state    = window.gameState;
  const dpResult = clientKnapsack(state.items, state.budget);
  const hint     = document.getElementById('shop-dp-hint');

  const playerProfit = state.selectedIds.reduce((sum, id) => {
    const item = state.items.find(i => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);

  const diff = dpResult.maxProfit - playerProfit;
  const eff  = dpResult.maxProfit > 0
    ? ((playerProfit / dpResult.maxProfit) * 100).toFixed(1)
    : 100;

  if (state.selectedIds.length === 0) {
    hint.innerHTML = `
      💡 <strong>Tips DP:</strong> Perhatikan badge
      <span style="color:var(--gold)">✦ DP OPTIMAL</span>
      — item bertanda itu adalah pilihan terbaik algoritma
      untuk budget Rp ${state.budget}.
    `;
    return;
  }

  if (diff === 0) {
    hint.innerHTML = `
      ✅ <span style="color:var(--green)">Pilihanmu sudah optimal!</span>
      Efisiensi 100% — sama dengan algoritma DP Knapsack.
    `;
    return;
  }

  hint.innerHTML = `
    📊 Efisiensimu: <strong style="color:var(--gold)">${eff}%</strong>
    dari optimal. Selisih <strong style="color:var(--red)">Rp ${diff}</strong>
    dari skor DP (Rp ${dpResult.maxProfit}).
    <br>
    <span style="color:var(--text3); font-size:12px">
      dp[i][w] = max(dp[i-1][w], dp[i-1][w-cost]+profit)
    </span>
  `;
}

// ========== SELESAI BELANJA ========== //
function handleDoneShopping() {
  closePopup('popup-shop');
  activeShop = null;
  updateAllUI();
}

// ========== UPDATE SEMUA UI ========== //
function updateAllUI() {
  const state = window.gameState;
  renderInventory(state.selectedIds, state.items);
  updateDPLiveBars();
  updateHUDBudget();

  // Update btn sell
  document.getElementById('btn-sell').disabled =
    state.selectedIds.length === 0;
}

// ========== RENDER INVENTORY (keranjang di HUD) ========== //
function renderInventory(selectedIds, items) {
  const list    = document.getElementById('inventory-list');
  const totalEl = document.getElementById('inventory-total');
  const profitEl = document.getElementById('inventory-profit');

  if (selectedIds.length === 0) {
    list.innerHTML = `<div class="inventory-empty">Belum ada barang</div>`;
    totalEl.style.display = 'none';
    return;
  }

  let totalProfit = 0;
  list.innerHTML = selectedIds.map(id => {
    const item = items.find(i => i.id === id);
    if (!item) return '';
    totalProfit += item.profit;
    return `
      <div class="inventory-item">
        <span class="inv-emoji">${item.emoji}</span>
        <span class="inv-name">${item.name}</span>
        <span class="inv-profit">+${item.profit}</span>
      </div>
    `;
  }).join('');

  totalEl.style.display = 'flex';
  profitEl.textContent  = `+Rp ${totalProfit}`;
}

// ========== UPDATE HUD BUDGET ========== //
function updateHUDBudget() {
  const state = window.gameState;
  const spent = state.selectedIds.reduce((sum, id) => {
    const item = state.items.find(i => i.id === id);
    return sum + (item ? item.cost : 0);
  }, 0);
  const remaining = state.budget - spent;

  document.getElementById('hud-budget').textContent = `Rp ${remaining}`;

  const profitEl = document.getElementById('hud-score');
  const profit   = state.selectedIds.reduce((sum, id) => {
    const item = state.items.find(i => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);
  profitEl.textContent = `+${state.totalPlayerScore + profit}`;
}

// ========== UPDATE DP LIVE BARS ========== //
function updateDPLiveBars() {
  const state    = window.gameState;
  if (!state.items || state.items.length === 0) return;

  const dpResult = clientKnapsack(state.items, state.budget);
  const dpMax    = dpResult.maxProfit;

  const playerProfit = state.selectedIds.reduce((sum, id) => {
    const item = state.items.find(i => i.id === id);
    return sum + (item ? item.profit : 0);
  }, 0);

  const aiProfit = aiState.totalProfit;

  const maxVal = Math.max(dpMax, playerProfit, aiProfit, 1);

  // Update bars
  document.getElementById('dp-bar-optimal').style.width =
    `${(dpMax / maxVal * 100).toFixed(1)}%`;
  document.getElementById('dp-bar-player').style.width  =
    `${(playerProfit / maxVal * 100).toFixed(1)}%`;
  document.getElementById('dp-bar-ai').style.width      =
    `${(aiProfit / maxVal * 100).toFixed(1)}%`;

  document.getElementById('dp-val-optimal').textContent = dpMax;
  document.getElementById('dp-val-player').textContent  = playerProfit;
  document.getElementById('dp-val-ai').textContent      = aiProfit;

  // Efficiency text
  const eff = dpMax > 0
    ? ((playerProfit / dpMax) * 100).toFixed(1)
    : 100;

  const effEl = document.getElementById('dp-efficiency');
  if (playerProfit === 0) {
    effEl.textContent = 'Pilih barang untuk analisis';
  } else if (playerProfit >= dpMax) {
    effEl.textContent = '✅ Optimal! 100%';
    effEl.style.color = 'var(--green)';
  } else {
    effEl.textContent = `Efisiensi: ${eff}%`;
    effEl.style.color = eff >= 80 ? 'var(--gold)' : 'var(--text2)';
  }
}

// ========== SHOW TOAST ========== //
function showToast(msg, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type ? 'toast-' + type : ''}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}