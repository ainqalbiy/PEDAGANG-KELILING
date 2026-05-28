// ========== STATE TOKO ========== //
let activeShop     = null;
let globalShopItems = {};
let twTimer        = null; // typewriter timer

// ========== TYPEWRITER EFFECT ========== //
function typewriter(el, text, speed = 28, onDone = null) {
  clearTimeout(twTimer);
  el.innerHTML = '';
  let i = 0;

  function next() {
    if (i >= text.length) {
      // Tambah cursor berkedip di akhir
      el.innerHTML = text + '<span class="tw-cursor"></span>';
      if (onDone) onDone();
      return;
    }
    el.textContent = text.slice(0, i + 1);
    SFX.tick();
    i++;
    twTimer = setTimeout(next, speed);
  }

  next();
}

// ========== DISTRIBUSI ITEM KE TOKO ========== //
function distributeItemsToShops(allItems, mapData) {
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  const result   = {};
  let idx = 0;

  mapData.shops.forEach(shop => {
    result[shop.id] = [];
    const count = shop.itemCount || 2;
    for (let i = 0; i < count && idx < shuffled.length; i++) {
      result[shop.id].push(shuffled[idx++]);
    }
  });

  return result;
}

function initShopItems(allItems, mapData) {
  globalShopItems = distributeItemsToShops(allItems, mapData);

  // Spawn partikel uang dari toko yang punya item
  mapData.shops.forEach(shop => {
    scheduleShopParticles(shop);
  });
}

function getShopItems(shop) {
  return globalShopItems[shop.id] || [];
}

// ========== PARTIKEL UANG DI TOKO ========== //
function scheduleShopParticles(shop) {
  const el = document.getElementById(`npc-indicator-${shop.id}`);
  if (!el) return;

  setInterval(() => {
    if (Math.random() > 0.4) return; // tidak selalu muncul
    spawnShopParticle(el);
  }, 1800 + Math.random() * 1200);
}

function spawnShopParticle(anchorEl) {
  const rect   = anchorEl.getBoundingClientRect();
  const map    = document.getElementById('map-container').getBoundingClientRect();
  const particles = ['💰', '✨', '⭐', '🪙'];

  const p = document.createElement('div');
  p.className   = 'shop-particle';
  p.textContent = particles[Math.floor(Math.random() * particles.length)];
  p.style.left  = (rect.left - map.left + Math.random() * 20 - 10) + 'px';
  p.style.top   = (rect.top  - map.top) + 'px';

  document.getElementById('map-container').appendChild(p);
  setTimeout(() => p.remove(), 2000);
}

// ========== TANDA SERU DI TOKO ========== //
function showShopExclaim(shopId) {
  const tileEl = document.querySelector(`[id^="shop-tile-"][id*="${shopId}"]`);
  if (!tileEl) return;

  const existing = tileEl.querySelector('.shop-exclaim');
  if (existing) return;

  const ex = document.createElement('div');
  ex.className   = 'shop-exclaim';
  ex.textContent = '!';
  tileEl.appendChild(ex);
}

function hideShopExclaim(shopId) {
  document.querySelectorAll('.shop-exclaim').forEach(el => el.remove());
}

// ========== BUKA TOKO ========== //
function openShop(shop) {
  activeShop = shop;
  SFX.confirm();

  // Header NPC
  document.getElementById('shop-npc-avatar').textContent = shop.npcAvatar;
  document.getElementById('shop-npc-name').textContent   = shop.npcName.toUpperCase();
  document.getElementById('shop-npc-sub').textContent    = shop.npcSub;

  // Dialog NPC — typewriter
  const dialogs = [
    `Selamat datang di toko ${shop.label}! Pilih yang terbaik!`,
    `Ada barang bagus hari ini! Jangan lewatkan!`,
    `Pedagang hebat selalu pilih dengan cermat.`,
    `Modal terbatas? Gunakan strategi yang tepat!`,
    `Perhatikan rasio profit/modal sebelum memilih!`,
  ];

  const dialogEl = document.getElementById('npc-dialog-text');
  const msg      = dialogs[Math.floor(Math.random() * dialogs.length)];
  typewriter(dialogEl, `"${msg}"`, 24);

  // Render item
  renderShopItems(shop);
  updateShopDPHint();

  // Tandai toko sudah dikunjungi
  markShopVisited(shop.id);

  openPopup('popup-shop');
}

// ========== TANDAI TOKO DIKUNJUNGI ========== //
function markShopVisited(shopId) {
  document.querySelectorAll('.tile-shop').forEach(tile => {
    const code = tile.dataset.code;
    if (!code) return;
    const idx   = parseInt(code[1]) - 1;
    const shops = window.currentMapData?.shops;
    if (shops && shops[idx]?.id === shopId) {
      tile.classList.add('visited');
    }
  });
  hideShopExclaim(shopId);
}

// ========== RENDER ITEM DI TOKO ========== //
function renderShopItems(shop) {
  const container = document.getElementById('shop-items');
  const state     = window.gameState;
  const items     = getShopItems(shop);
  const budget    = state.budget;
  const selected  = state.selectedIds;

  const spent = selected.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.cost : 0);
  }, 0);
  const remaining = budget - spent;

  const dpResult = clientKnapsack(state.items, budget);

  container.innerHTML = items.map(item => {
    const isSel      = selected.includes(item.id);
    const isTaken    = isItemTaken(item.id) && !isSel;
    const canAfford  = item.cost <= remaining || isSel;
    const isOptimal  = dpResult.chosenIds.includes(item.id);
    const ratio      = (item.profit / item.cost).toFixed(2);
    const ratioClass = ratio >= 1.8 ? 'high' : ratio >= 1.3 ? 'med' : 'low';

    let cls = 'shop-item';
    if (isSel)    cls += ' selected';
    if (isTaken)  cls += ' unavailable';
    else if (!canAfford && !isSel) cls += ' unavailable';
    if (isOptimal && !isTaken) cls += ' dp-optimal';

    return `
      <div class="${cls}" data-id="${item.id}" onclick="handleShopItemClick(${item.id})">
        <div class="shop-item-check">✓</div>
        <span class="shop-emoji">${item.emoji}</span>
        <div class="shop-name">${item.name}</div>
        <div class="shop-row">
          <span class="shop-cost">Rp ${item.cost}</span>
          <span class="shop-profit">+${item.profit}</span>
        </div>
        <div class="shop-ratio ${ratioClass}">
          Rasio: ${ratio}x ${ratioClass === 'high' ? '⭐' : ''}
        </div>
        ${isOptimal && !isTaken
          ? `<div class="shop-dp-badge">✦ DP OPTIMAL</div>`
          : ''}
        ${isTaken
          ? `<div class="shop-dp-badge" style="color:var(--red2);border-color:var(--red)">✕ DIAMBIL</div>`
          : ''}
      </div>
    `;
  }).join('');
}

// ========== HANDLE KLIK ITEM ========== //
function handleShopItemClick(itemId) {
  const state = window.gameState;
  const item  = state.items.find(i => i.id === itemId);
  if (!item) return;

  if (isItemTaken(itemId) && !state.selectedIds.includes(itemId)) {
    showToast('Item sudah diambil!', 'red');
    SFX.cancel();
    return;
  }

  const isSel = state.selectedIds.includes(itemId);

  if (isSel) {
    state.selectedIds = state.selectedIds.filter(id => id !== itemId);
    markItemTaken(itemId, null);
    SFX.cancel();
  } else {
    const spent = state.selectedIds.reduce((s, id) => {
      const it = state.items.find(i => i.id === id);
      return s + (it ? it.cost : 0);
    }, 0);

    if (spent + item.cost > state.budget) {
      showToast('Modal tidak cukup!', 'red');
      SFX.cancel();
      return;
    }

    state.selectedIds.push(itemId);
    markItemTaken(itemId, 'player');
    SFX.buy();

    // Efek pickup
    showPickupEffect(playerState.x, playerState.y, `+${item.profit}`, 'player-pick');

    // NPC komentar dari server — typewriter
    apiGetNPCComment(itemId).then(result => {
      if (result.success) {
        const dialogEl = document.getElementById('npc-dialog-text');
        typewriter(dialogEl, `"${result.data.comment}"`, 22);
      }
    });
  }

  renderShopItems(activeShop);
  updateShopDPHint();
  updateAllUI();
}

// ========== UPDATE DP HINT DI TOKO ========== //
function updateShopDPHint() {
  const state    = window.gameState;
  const dpResult = clientKnapsack(state.items, state.budget);
  const hint     = document.getElementById('shop-dp-hint');

  const playerProfit = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);

  const diff = dpResult.maxProfit - playerProfit;
  const eff  = dpResult.maxProfit > 0
    ? ((playerProfit / dpResult.maxProfit) * 100).toFixed(1) : 100;

  if (state.selectedIds.length === 0) {
    hint.innerHTML = `💡 <strong>Tips DP:</strong> Item dengan badge
      <span style="color:var(--gold)">✦ DP OPTIMAL</span>
      adalah pilihan terbaik algoritma untuk budget Rp ${state.budget}.
      Perhatikan <strong>rasio profit/modal</strong> tiap item!`;
    return;
  }

  if (diff === 0) {
    hint.innerHTML = `✅ <span style="color:var(--green)">
      Pilihanmu sudah optimal!</span>
      Efisiensi 100% — sama dengan
      <code style="color:var(--gold)">dp[${state.items.length}][${state.budget}] = ${dpResult.maxProfit}</code>`;
    return;
  }

  hint.innerHTML = `📊 Efisiensi: <strong style="color:var(--gold)">${eff}%</strong>
    — <code style="color:var(--gold)">dp[n][W] = ${dpResult.maxProfit}</code>,
    pilihanmu = <span style="color:var(--green)">${playerProfit}</span>,
    selisih = <span style="color:var(--red)">-${diff}</span>
    <br><span style="color:var(--text3); font-size:12px">
    dp[i][w] = max(dp[i-1][w], dp[i-1][w-cost]+profit)</span>`;
}

// ========== SELESAI BELANJA ========== //
function handleDoneShopping() {
  closePopup('popup-shop');
  SFX.confirm();
  activeShop = null;
  updateAllUI();
}

// ========== UPDATE SEMUA UI ========== //
function updateAllUI() {
  const state = window.gameState;
  renderInventory(state.selectedIds, state.items);
  updateDPLiveBars();
  updateHUDBudget();
  document.getElementById('btn-sell').disabled = state.selectedIds.length === 0;
}

// ========== RENDER INVENTORY ========== //
function renderInventory(selectedIds, items) {
  const list     = document.getElementById('inventory-list');
  const totalEl  = document.getElementById('inventory-total');
  const profitEl = document.getElementById('inventory-profit');

  if (!selectedIds || selectedIds.length === 0) {
    list.innerHTML = `<div class="inventory-empty">Belum ada barang</div>`;
    if (totalEl) totalEl.style.display = 'none';
    return;
  }

  let total = 0;
  list.innerHTML = selectedIds.map(id => {
    const item = items.find(i => i.id === id);
    if (!item) return '';
    total += item.profit;
    return `
      <div class="inventory-item">
        <span class="inv-emoji">${item.emoji}</span>
        <span class="inv-name">${item.name}</span>
        <span class="inv-profit">+${item.profit}</span>
      </div>
    `;
  }).join('');

  if (totalEl) {
    totalEl.style.display = 'flex';
    profitEl.textContent  = `+Rp ${total}`;
  }
}

// ========== UPDATE HUD BUDGET ========== //
function updateHUDBudget() {
  const state = window.gameState;
  const spent = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.cost : 0);
  }, 0);

  document.getElementById('hud-budget').textContent = `Rp ${state.budget - spent}`;

  const profit = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);
  document.getElementById('hud-score').textContent = `+${state.totalPlayerScore + profit}`;
}

// ========== UPDATE DP LIVE BARS ========== //
function updateDPLiveBars() {
  const state = window.gameState;
  if (!state.items || state.items.length === 0) return;

  const dp       = clientKnapsack(state.items, state.budget);
  const dpMax    = dp.maxProfit;
  const player   = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);
  const ai       = aiState.totalProfit;
  const maxVal   = Math.max(dpMax, player, ai, 1);

  document.getElementById('dp-bar-optimal').style.width = `${(dpMax  / maxVal * 100).toFixed(1)}%`;
  document.getElementById('dp-bar-player').style.width  = `${(player / maxVal * 100).toFixed(1)}%`;
  document.getElementById('dp-bar-ai').style.width      = `${(ai     / maxVal * 100).toFixed(1)}%`;

  document.getElementById('dp-val-optimal').textContent = dpMax;
  document.getElementById('dp-val-player').textContent  = player;
  document.getElementById('dp-val-ai').textContent      = ai;

  const eff    = dpMax > 0 ? ((player / dpMax) * 100).toFixed(1) : 100;
  const effEl  = document.getElementById('dp-efficiency');

  if (player === 0) {
    effEl.textContent = 'Pilih barang untuk analisis';
    effEl.style.color = 'var(--text3)';
  } else if (player >= dpMax) {
    effEl.textContent = '✅ OPTIMAL! 100%';
    effEl.style.color = 'var(--green)';
  } else {
    effEl.textContent = `Efisiensi: ${eff}%`;
    effEl.style.color = parseFloat(eff) >= 80 ? 'var(--gold)' : 'var(--text2)';
  }
}

// ========== SHOW TOAST ========== //
function showToast(msg, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className   = `toast ${type ? 'toast-' + type : ''}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}