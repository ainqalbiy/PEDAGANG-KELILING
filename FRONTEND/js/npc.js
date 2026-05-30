// ══════════════════════════════════════
//   NPC & SHOP SYSTEM
// ══════════════════════════════════════

let activeShop = null;

// ══════════════════════════════════════
//   DISTRIBUSI ITEM KE TOKO
// ══════════════════════════════════════
function initShopItems(allItems, mapDef) {
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  window.shopItemsMap = {};
  window.takenItems   = {};

  let idx = 0;
  mapDef.shops.forEach(shop => {
    window.shopItemsMap[shop.id] = [];
    const count = shop.itemCount || 2;
    for (let i = 0; i < count && idx < shuffled.length; i++) {
      window.shopItemsMap[shop.id].push(shuffled[idx++]);
    }
  });
}

function getShopItems(shop) {
  return window.shopItemsMap?.[shop.id] || [];
}

// ══════════════════════════════════════
//   BUKA TOKO
// ══════════════════════════════════════
function openShop(shop) {
  activeShop = shop;
  setInputEnabled(false);

  // Sapa dengan dialog dulu
  Dialog.npcGreet(shop, () => {
    // Setelah dialog, buka UI toko
    showShopUI(shop);
  });
}

// ══════════════════════════════════════
//   SHOW SHOP UI — popup tengah layar
// ══════════════════════════════════════
function showShopUI(shop) {
  // Buat popup toko dinamis
  let popup = document.getElementById('popup-shop-dynamic');
  if (!popup) {
    popup = document.createElement('div');
    popup.id        = 'popup-shop-dynamic';
    popup.className = 'popup-overlay';
    document.body.appendChild(popup);
  }

  const state    = window.gameState;
  const items    = getShopItems(shop);
  const dpResult = clientKnapsack(state.items, state.budget);

  popup.innerHTML = buildShopHTML(shop, items, state, dpResult);
  popup.classList.add('show');

  // Event listener tombol
  popup.querySelectorAll('.shop-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = parseInt(btn.dataset.id);
      handleShopBuy(itemId, shop, popup);
    });
  });

  document.getElementById('btn-close-shop')?.addEventListener('click', () => {
    closeShop(popup);
  });
}

// ══════════════════════════════════════
//   BUILD SHOP HTML
// ══════════════════════════════════════
function buildShopHTML(shop, items, state, dpResult) {
  const spent = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.cost : 0);
  }, 0);
  const remaining = state.budget - spent;
  const c = SHOP_COLORS[shop.colorIdx % SHOP_COLORS.length];

  const itemsHTML = items.map(item => {
    const isSel     = state.selectedIds.includes(item.id);
    const isTaken   = window.takenItems?.[item.id] && !isSel;
    const canAfford = item.cost <= remaining || isSel;
    const isOpt     = dpResult.chosenIds.includes(item.id);
    const ratio     = (item.profit / item.cost).toFixed(2);
    const rClass    = ratio >= 1.8 ? 'high' : ratio >= 1.3 ? 'med' : 'low';

    let borderColor = c.roof;
    if (isSel)  borderColor = '#48d858';
    if (isTaken) borderColor = '#404050';

    return `
      <div class="shop-item-card ${isSel ? 'selected' : ''} ${isTaken ? 'taken' : ''}"
           style="border-color:${borderColor}">
        <div class="shop-item-top">
          <span class="shop-item-emoji">${item.emoji}</span>
          ${isOpt && !isTaken ? `<span class="dp-opt-badge">✦DP</span>` : ''}
          ${isTaken ? `<span class="taken-badge">✕HABIS</span>` : ''}
          ${isSel   ? `<span class="sel-badge">✓</span>` : ''}
        </div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-stats">
          <span class="shop-cost">Rp ${item.cost}</span>
          <span class="shop-profit">+${item.profit}</span>
        </div>
        <div class="shop-ratio ${rClass}">Rasio: ${ratio}x ${rClass === 'high' ? '⭐' : ''}</div>
        <button class="shop-item-btn poke-btn ${isSel ? 'red' : 'green'}"
                data-id="${item.id}"
                ${(isTaken || (!canAfford && !isSel)) ? 'disabled' : ''}>
          ${isTaken ? 'HABIS' : isSel ? '✕ BATAL' : '▶ BELI'}
        </button>
      </div>
    `;
  }).join('');

  const dpHint = buildDPHint(state, dpResult);

  return `
    <div class="popup-box popup-shop-box" style="
      border-color: ${c.roof};
      box-shadow: 8px 8px 0 rgba(0,0,0,0.6),
                  0 0 30px ${c.roof}40;
    ">
      <div class="popup-header" style="border-color:${c.roof}">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:28px">${shop.npcEmoji}</span>
          <div>
            <div class="popup-title" style="color:${c.roof}">${shop.npcName}</div>
            <div style="font-size:8px;color:var(--muted);margin-top:2px">${shop.npcSub} — ${shop.label}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:8px;color:var(--muted)">MODAL TERSISA</div>
          <div style="font-size:14px;color:var(--gold)">Rp ${remaining}</div>
        </div>
      </div>

      <div class="popup-body">
        <div class="shop-items-grid">${itemsHTML}</div>
        <div class="shop-dp-hint">${dpHint}</div>
      </div>

      <div class="popup-footer">
        <button class="poke-btn secondary" id="btn-close-shop">✕ TUTUP TOKO</button>
        <button class="poke-btn" id="btn-done-shop">✓ SELESAI BELANJA</button>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════
//   BUILD DP HINT
// ══════════════════════════════════════
function buildDPHint(state, dpResult) {
  const playerProfit = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);

  const diff = dpResult.maxProfit - playerProfit;
  const eff  = dpResult.maxProfit > 0
    ? ((playerProfit / dpResult.maxProfit) * 100).toFixed(1) : 100;

  if (state.selectedIds.length === 0) {
    return `💡 Item dengan badge <span style="color:var(--gold)">✦DP</span> adalah pilihan optimal Knapsack untuk budget Rp ${state.budget}.`;
  }

  if (diff === 0) {
    return `✅ <span style="color:var(--green)">OPTIMAL!</span> Pilihanmu = dp[${state.items.length}][${state.budget}] = <strong>${dpResult.maxProfit}</strong>`;
  }

  return `📊 Efisiensi: <span style="color:var(--gold)">${eff}%</span> — dp[n][W] = <strong style="color:var(--gold)">${dpResult.maxProfit}</strong>, kamu = <span style="color:var(--green)">${playerProfit}</span>, selisih = <span style="color:var(--red)">-${diff}</span><br>
    <span style="color:var(--muted);font-size:8px">dp[i][w] = max(dp[i-1][w], dp[i-1][w-cost]+profit)</span>`;
}

// ══════════════════════════════════════
//   HANDLE BUY ITEM
// ══════════════════════════════════════
function handleShopBuy(itemId, shop, popup) {
  const state = window.gameState;
  const item  = state.items.find(i => i.id === itemId);
  if (!item) return;

  const isSel = state.selectedIds.includes(itemId);

  if (isSel) {
    // Deselect
    state.selectedIds = state.selectedIds.filter(id => id !== itemId);
    if (window.takenItems?.[itemId] === 'player') {
      delete window.takenItems[itemId];
    }
    SFX.cancel();
    spawnFloatText(`-${item.name}`, 'negative');
  } else {
    // Cek sudah diambil AI
    if (window.takenItems?.[itemId] === 'ai') {
      showToast('Item sudah diambil AI!', 'red');
      SFX.cancel();
      return;
    }

    // Cek budget
    const spent = state.selectedIds.reduce((s, id) => {
      const it = state.items.find(i => i.id === id);
      return s + (it ? it.cost : 0);
    }, 0);

    if (spent + item.cost > state.budget) {
      showToast('Modal tidak cukup!', 'red');
      screenFlash('#ff0000', 150);
      SFX.cancel();
      return;
    }

    // Beli
    state.selectedIds.push(itemId);
    if (!window.takenItems) window.takenItems = {};
    window.takenItems[itemId] = 'player';

    SFX.buy();
    screenFlash('#48d858', 100);
    spawnEffect(playerState.wx, playerState.wy, `+${item.profit}`, '#48d858');
    spawnFloatText(`+${item.profit}`, 'positive');

    // NPC comment dari server
    apiGetNPCComment(itemId).then(result => {
      if (result.success) {
        Dialog.npcAfterBuy(item, result.data.comment, null);
      }
    });
  }

  // Re-render shop
  const dpResult = clientKnapsack(state.items, state.budget);
  popup.querySelector('.popup-box').outerHTML; // force update
  const newHTML = buildShopHTML(shop, getShopItems(shop), state, dpResult);
  popup.innerHTML = newHTML;

  // Re-attach listeners
  popup.querySelectorAll('.shop-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleShopBuy(parseInt(btn.dataset.id), shop, popup);
    });
  });

  document.getElementById('btn-close-shop')?.addEventListener('click', () => closeShop(popup));
  document.getElementById('btn-done-shop')?.addEventListener('click',  () => closeShop(popup));

  // Update HUD
  updateHUD();
  updateDPLiveBars();
}

// ══════════════════════════════════════
//   CLOSE SHOP
// ══════════════════════════════════════
function closeShop(popup) {
  popup?.classList.remove('show');
  activeShop = null;
  setInputEnabled(true);
  SFX.cancel();

  // Tandai toko sudah dikunjungi di renderer
  if (activeShop) {
    renderState.visitedShops?.add(activeShop.id);
  }

  updateHUD();
  updateDPLiveBars();
}

// ══════════════════════════════════════
//   UPDATE HUD
// ══════════════════════════════════════
function updateHUD() {
  const state = window.gameState;
  if (!state) return;

  const spent = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.cost : 0);
  }, 0);

  const profit = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);

  const budgetEl = document.getElementById('hud-budget');
  const scoreEl  = document.getElementById('hud-score');

  if (budgetEl) budgetEl.textContent = `Rp ${state.budget - spent}`;
  if (scoreEl)  scoreEl.textContent  = `+${state.totalPlayerScore + profit}`;
}

// ══════════════════════════════════════
//   UPDATE DP LIVE BARS
// ══════════════════════════════════════
function updateDPLiveBars() {
  const state = window.gameState;
  if (!state?.items?.length) return;

  const dp       = clientKnapsack(state.items, state.budget);
  const dpMax    = dp.maxProfit;
  const player   = state.selectedIds.reduce((s, id) => {
    const it = state.items.find(i => i.id === id);
    return s + (it ? it.profit : 0);
  }, 0);
  const ai       = aiState.totalProfit;
  const maxVal   = Math.max(dpMax, player, ai, 1);

  const bars = {
    'dp-bar-opt':    { val: dpMax,  el: 'dp-val-opt'    },
    'dp-bar-player': { val: player, el: 'dp-val-player' },
    'dp-bar-ai':     { val: ai,     el: 'dp-val-ai'     },
  };

  Object.entries(bars).forEach(([barId, data]) => {
    const bar = document.getElementById(barId);
    const val = document.getElementById(data.el);
    if (bar) bar.style.width = `${(data.val / maxVal * 100).toFixed(1)}%`;
    if (val) val.textContent = data.val;
  });

  const eff    = dpMax > 0 ? ((player / dpMax) * 100).toFixed(1) : 100;
  const effEl  = document.getElementById('dp-efficiency-txt');
  if (effEl) {
    effEl.textContent = player === 0
      ? 'Pilih barang untuk analisis'
      : player >= dpMax ? '✅ OPTIMAL! 100%'
      : `Efisiensi: ${eff}%`;
  }
}

// ══════════════════════════════════════
//   CSS TOKO (inject sekali)
// ══════════════════════════════════════
(function injectShopCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .popup-shop-box {
      max-width: 680px;
      background: var(--dark2);
      border: 3px solid;
    }

    .shop-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }

    .shop-item-card {
      background: var(--dark3);
      border: 2px solid var(--border);
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: all 0.12s;
      position: relative;
    }

    .shop-item-card:hover:not(.taken) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .shop-item-card.selected {
      background: rgba(72,216,88,0.08);
    }

    .shop-item-card.taken {
      opacity: 0.35;
    }

    .shop-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .shop-item-emoji { font-size: 24px; }

    .dp-opt-badge {
      font-size: 6px; padding: 2px 4px;
      background: rgba(248,208,48,0.15);
      border: 1px solid var(--gold);
      color: var(--gold);
    }

    .taken-badge {
      font-size: 6px; padding: 2px 4px;
      color: var(--red); border: 1px solid var(--red);
    }

    .sel-badge {
      font-size: 10px; color: var(--green);
      font-weight: bold;
    }

    .shop-item-name {
      font-size: 7px; color: var(--text);
      letter-spacing: 0.04em; line-height: 1.6;
    }

    .shop-item-stats {
      display: flex; justify-content: space-between;
    }

    .shop-cost   { font-size: 9px; color: var(--red); }
    .shop-profit { font-size: 9px; color: var(--green); }

    .shop-ratio      { font-size: 8px; color: var(--muted); }
    .shop-ratio.high { color: var(--gold); }
    .shop-ratio.med  { color: var(--cyan); }
    .shop-ratio.low  { color: var(--red);  }

    .shop-item-btn {
      font-size: 7px; padding: 6px 4px;
      text-align: center; margin-top: 2px;
    }

    .shop-item-btn:disabled {
      opacity: 0.3; cursor: not-allowed;
    }

    .shop-dp-hint {
      font-size: 9px; color: var(--muted);
      background: var(--dark);
      border: 1px solid var(--border);
      border-left: 3px solid var(--gold);
      padding: 8px 12px; line-height: 1.8;
    }
  `;
  document.head.appendChild(style);
})();