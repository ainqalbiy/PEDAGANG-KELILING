// ══════════════════════════════════════
//   PLAYER & AI — movement di Canvas
// ══════════════════════════════════════

// ── State player ──
const playerState = {
  col: 6, row: 4,
  wx: 0, wy: 0,       // world pixel position
  dir: DIR.DOWN,
  walking: false,
  nearShop: null,
};

// ── State AI ──
const aiState = {
  col: 7, row: 4,
  wx: 0, wy: 0,
  dir: DIR.DOWN,
  walking: false,
  budget: 150,
  inventory: [],
  totalProfit: 0,
  selectedIds: [],
  visited: new Set(),
  targetShop: null,
  thinkTimer: 0,
  moveTimer: 0,
  phase: 'seek',   // seek | buy | done
  done: false,
};

// ── Input ──
const keys = {};
let inputEnabled = true;

// ══════════════════════════════════════
//   INIT PLAYER
// ══════════════════════════════════════
function initPlayer(mapDef) {
  const s      = mapDef.playerStart;
  const ts     = TILE_SIZE * SCALE;

  playerState.col     = s.col;
  playerState.row     = s.row;
  playerState.wx      = s.col * ts;
  playerState.wy      = s.row * ts;
  playerState.dir     = DIR.DOWN;
  playerState.walking = false;
  playerState.nearShop = null;
}

// ══════════════════════════════════════
//   INIT AI
// ══════════════════════════════════════
function initAI(mapDef, budget) {
  const s  = mapDef.aiStart;
  const ts = TILE_SIZE * SCALE;

  aiState.col        = s.col;
  aiState.row        = s.row;
  aiState.wx         = s.col * ts;
  aiState.wy         = s.row * ts;
  aiState.dir        = DIR.DOWN;
  aiState.walking    = false;
  aiState.budget     = budget;
  aiState.inventory  = [];
  aiState.totalProfit = 0;
  aiState.selectedIds = [];
  aiState.visited    = new Set();
  aiState.targetShop = null;
  aiState.thinkTimer = 0;
  aiState.moveTimer  = 0;
  aiState.phase      = 'seek';
  aiState.done       = false;
}

// ══════════════════════════════════════
//   INPUT
// ══════════════════════════════════════
function initInput() {
  document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;

    // E — interaksi
    if ((e.key === 'e' || e.key === 'E') && inputEnabled) {
      if (!Dialog.isOpen()) handleInteract();
    }

    // F — toggle DP panel
    if (e.key === 'f' || e.key === 'F') {
      toggleDPPanel();
    }

    // Space — jual
    if (e.key === ' ' && inputEnabled) {
      e.preventDefault();
      handleSell();
    }

    // ESC
    if (e.key === 'Escape') {
      const dpPanel = document.getElementById('dp-panel');
      if (!dpPanel.classList.contains('hidden')) {
        dpPanel.classList.add('hidden');
      }
    }
  });

  document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });

  // Pixel cursor
  const cursor = document.createElement('div');
  cursor.id = 'px-cursor';
  cursor.style.cssText = `
    position:fixed; width:8px; height:8px;
    background:#f8d030; pointer-events:none;
    z-index:9999; image-rendering:pixelated;
    box-shadow: 0 0 4px rgba(248,208,48,0.7);
    transition: transform 0.05s;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'scale(1.8)';
    cursor.style.background = '#fff';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'scale(1)';
    cursor.style.background = '#f8d030';
  });
}

function setInputEnabled(v) { inputEnabled = v; }

// ══════════════════════════════════════
//   UPDATE PLAYER (dipanggil tiap frame)
// ══════════════════════════════════════
function updatePlayer(collision, mapDef, shopCells, dt) {
  if (!inputEnabled || Dialog.isOpen()) {
    playerState.walking = false;
    return;
  }

  const speed = 90 * SCALE; // pixel per detik
  const ts    = TILE_SIZE * SCALE;

  let dx = 0, dy = 0;
  let newDir = playerState.dir;

  if (keys['arrowup']    || keys['w']) { dy = -1; newDir = DIR.UP; }
  if (keys['arrowdown']  || keys['s']) { dy =  1; newDir = DIR.DOWN; }
  if (keys['arrowleft']  || keys['a']) { dx = -1; newDir = DIR.LEFT; }
  if (keys['arrowright'] || keys['d']) { dx =  1; newDir = DIR.RIGHT; }

  // Normalisasi diagonal
  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

  const moving = dx !== 0 || dy !== 0;
  playerState.dir     = newDir;
  playerState.walking = moving;

  if (moving) {
    const newWX = playerState.wx + dx * speed * dt;
    const newWY = playerState.wy + dy * speed * dt;

    // Collision check — cek 4 sudut sprite
    const sprW = SPR_W * SCALE * 0.6;
    const sprH = 8; // hanya cek bagian bawah sprite (kaki)

    const checkX = newWX + SPR_W * SCALE * 0.2;
    const checkY = playerState.wy + SPR_H * SCALE - sprH;

    const colX = Math.floor((checkX + sprW * (dx > 0 ? 1 : 0)) / ts);
    const rowY = Math.floor((checkY + sprH * (dy > 0 ? 1 : 0)) / ts);

    const canMoveX = isWalkable(collision, Math.floor((newWX + SPR_W * SCALE * 0.2 + (dx > 0 ? sprW : 0)) / ts), Math.floor((playerState.wy + SPR_H * SCALE - 4) / ts));
    const canMoveY = isWalkable(collision, Math.floor((playerState.wx + SPR_W * SCALE * 0.2 + sprW * 0.5) / ts), Math.floor((newWY + SPR_H * SCALE - 4) / ts));

    if (canMoveX) playerState.wx = newWX;
    if (canMoveY) playerState.wy = newWY;

    // Update tile position
    playerState.col = Math.floor((playerState.wx + SPR_W * SCALE * 0.5) / ts);
    playerState.row = Math.floor((playerState.wy + SPR_H * SCALE - 8) / ts);

    // Clamp ke batas peta
    const maxWX = (mapDef.cols - 1) * ts;
    const maxWY = (mapDef.rows - 1) * ts;
    playerState.wx = Math.max(0, Math.min(playerState.wx, maxWX));
    playerState.wy = Math.max(0, Math.min(playerState.wy, maxWY));
  }

  // Update nearby shop
  playerState.nearShop = getNearbyShop(
    playerState.col, playerState.row, shopCells
  );
}

// ══════════════════════════════════════
//   UPDATE AI — Greedy + agresif
// ══════════════════════════════════════
function updateAI(collision, mapDef, shopCells, allItems, dt) {
  if (aiState.done) return;

  const ts    = TILE_SIZE * SCALE;
  const speed = 78 * SCALE; // sedikit lebih lambat dari player

  aiState.thinkTimer -= dt;

  // ── Phase: SEEK — cari toko target ──
  if (aiState.phase === 'seek') {
    if (!aiState.targetShop) {
      aiPickTarget(mapDef, allItems);
    }

    if (aiState.targetShop) {
      const target = aiState.targetShop;
      const targetWX = target.col * ts + ts * 0.5;
      const targetWY = target.row * ts + ts;

      const dx = targetWX - (aiState.wx + SPR_W * SCALE * 0.5);
      const dy = targetWY - (aiState.wy + SPR_H * SCALE * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ts * 1.5) {
        // Sampai di toko
        aiState.phase = 'buy';
        aiState.thinkTimer = 0.4; // delay sebentar sebelum beli
        aiState.walking = false;
      } else {
        // Gerak ke target
        aiMoveToward(targetWX, targetWY, speed, dt, collision, mapDef, ts);
      }
    }
  }

  // ── Phase: BUY — beli dengan greedy ──
  else if (aiState.phase === 'buy') {
    if (aiState.thinkTimer > 0) return;

    const shop = aiState.targetShop;
    if (shop) {
      aiBuyGreedy(shop, allItems);
      aiState.visited.add(shop.id);
      renderState.visitedShops?.add(shop.id);

      // AI comment
      const aiProfit = aiState.totalProfit;
      const comments = [
        `+${aiProfit} total! Greedy terus!`,
        `Rasio terbaik sudah aku ambil!`,
        `Pedagang lambat akan kalah!`,
      ];
      setTimeout(() => {
        Dialog.aiComment(comments[Math.floor(Math.random() * comments.length)]);
      }, 200);
    }

    // Cek apakah AI sudah done (semua toko dikunjungi atau budget habis)
    const unvisited = mapDef.shops.filter(s => !aiState.visited.has(s.id));
    if (unvisited.length === 0 || aiState.budget <= 0) {
      aiState.phase  = 'done';
      aiState.done   = true;
      aiState.walking = false;
      // AI selesai duluan — trigger game end
      setTimeout(() => onAIDone(), 600);
    } else {
      aiState.targetShop = null;
      aiState.phase      = 'seek';
    }
  }
}

// ══════════════════════════════════════
//   AI PICK TARGET — pilih toko terbaik
// ══════════════════════════════════════
function aiPickTarget(mapDef, allItems) {
  const unvisited = mapDef.shops.filter(s => !aiState.visited.has(s.id));
  if (unvisited.length === 0) return;

  // Greedy: pilih toko yang punya item rasio terbaik yang belum diambil
  let bestShop  = null;
  let bestScore = -1;

  unvisited.forEach(shop => {
    const items = getShopItemsForAI(shop, allItems);
    const score = items.reduce((max, item) => {
      if (aiState.budget >= item.cost && !aiState.selectedIds.includes(item.id)) {
        return Math.max(max, item.profit / item.cost);
      }
      return max;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestShop  = shop;
    }
  });

  // Kalau tidak ada yang terjangkau, pilih random
  aiState.targetShop = bestShop || unvisited[Math.floor(Math.random() * unvisited.length)];
}

// ══════════════════════════════════════
//   AI MOVE TOWARD TARGET
// ══════════════════════════════════════
function aiMoveToward(targetWX, targetWY, speed, dt, collision, mapDef, ts) {
  const dx   = targetWX - (aiState.wx + SPR_W * SCALE * 0.5);
  const dy   = targetWY - (aiState.wy + SPR_H * SCALE * 0.5);
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 2) return;

  const nx = dx / dist;
  const ny = dy / dist;

  const newWX = aiState.wx + nx * speed * dt;
  const newWY = aiState.wy + ny * speed * dt;

  // Collision
  const canX = isWalkable(
    collision,
    Math.floor((newWX + SPR_W * SCALE * 0.5) / ts),
    Math.floor((aiState.wy + SPR_H * SCALE - 8) / ts)
  );
  const canY = isWalkable(
    collision,
    Math.floor((aiState.wx + SPR_W * SCALE * 0.5) / ts),
    Math.floor((newWY + SPR_H * SCALE - 8) / ts)
  );

  if (canX) aiState.wx = newWX;
  if (canY) aiState.wy = newWY;

  // Clamp
  const maxWX = (mapDef.cols - 1) * ts;
  const maxWY = (mapDef.rows - 1) * ts;
  aiState.wx = Math.max(0, Math.min(aiState.wx, maxWX));
  aiState.wy = Math.max(0, Math.min(aiState.wy, maxWY));

  // Update tile pos & dir
  aiState.col = Math.floor((aiState.wx + SPR_W * SCALE * 0.5) / ts);
  aiState.row = Math.floor((aiState.wy + SPR_H * SCALE - 8) / ts);

  if (Math.abs(dx) > Math.abs(dy)) {
    aiState.dir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
  } else {
    aiState.dir = dy > 0 ? DIR.DOWN : DIR.UP;
  }

  aiState.walking = true;
}

// ══════════════════════════════════════
//   AI GREEDY BUY
// ══════════════════════════════════════
function aiBuyGreedy(shop, allItems) {
  const items  = getShopItemsForAI(shop, allItems);
  const sorted = [...items].sort((a, b) =>
    (b.profit / b.cost) - (a.profit / a.cost)
  );

  for (const item of sorted) {
    if (
      aiState.budget >= item.cost &&
      !aiState.selectedIds.includes(item.id) &&
      !window.takenItems?.[item.id]
    ) {
      aiState.budget      -= item.cost;
      aiState.totalProfit += item.profit;
      aiState.inventory.push(item);
      aiState.selectedIds.push(item.id);

      // Tandai item diambil AI
      if (!window.takenItems) window.takenItems = {};
      window.takenItems[item.id] = 'ai';

      // Efek visual
      spawnEffect(aiState.wx, aiState.wy, `+${item.profit}`, '#f03030');
      spawnFloatTextAt(aiState.wx, aiState.wy, `-${item.name}`, 'negative');
      SFX.aiPickup();

      break; // greedy ambil satu per satu
    }
  }
}

// ══════════════════════════════════════
//   GET SHOP ITEMS FOR AI
// ══════════════════════════════════════
function getShopItemsForAI(shop, allItems) {
  return window.shopItemsMap?.[shop.id] || [];
}

// ══════════════════════════════════════
//   HANDLE INTERACT (E key)
// ══════════════════════════════════════
function handleInteract() {
  const shop = playerState.nearShop;
  if (!shop) return;
  if (Dialog.isOpen()) return;

  SFX.confirm();
  openShop(shop);
}

// ══════════════════════════════════════
//   TOGGLE DP PANEL
// ══════════════════════════════════════
function toggleDPPanel() {
  const panel = document.getElementById('dp-panel');
  const isHidden = panel.classList.contains('hidden');

  if (isHidden) {
    panel.classList.remove('hidden');
    SFX.confirm();
    const state = window.gameState;
    if (state?.items?.length > 0) {
      updateDPVisualizer(state.items, state.selectedIds, state.budget);
    }
  } else {
    panel.classList.add('hidden');
    SFX.cancel();
  }
}

// ══════════════════════════════════════
//   SPAWN FLOAT TEXT AT WORLD POS
// ══════════════════════════════════════
function spawnFloatTextAt(wx, wy, text, cls) {
  const screenX = wx - CAM.x + SPR_W * SCALE / 2;
  const screenY = wy - CAM.y - 10;

  const el = document.createElement('div');
  el.className   = `float-text ${cls}`;
  el.textContent = text;
  el.style.left  = screenX + 'px';
  el.style.top   = screenY + 'px';

  document.getElementById('float-container')?.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ══════════════════════════════════════
//   ON AI DONE — dipanggil saat AI selesai
// ══════════════════════════════════════
function onAIDone() {
  // Akan di-override oleh game-engine.js
  if (typeof handleAIDone === 'function') handleAIDone();
}