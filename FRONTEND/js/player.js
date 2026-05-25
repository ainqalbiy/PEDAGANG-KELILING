// ========== STATE PLAYER & AI ========== //
const playerState = {
  col: 6, row: 4,
  x: 0, y: 0,
  dir: 'down',
  walking: false,
  moving: false,
  nearShop: null,
  ePromptEl: null,
};

const aiState = {
  col: 8, row: 4,
  x: 0, y: 0,
  dir: 'down',
  walking: false,
  moving: false,
  targetShop: null,
  visited: [],
  thinkTimer: 0,
  buyTimer: 0,
  budget: 0,
  inventory: [],
  totalProfit: 0,
};

// Input keys yang sedang ditekan
const keysDown = {};

// ========== INISIALISASI PLAYER ========== //
function initPlayer(mapData) {
  const start = mapData.playerStart;
  playerState.col = start.col;
  playerState.row = start.row;

  const px = tileToPixel(start.col, start.row);
  playerState.x = px.x;
  playerState.y = px.y;

  const el = document.getElementById('player');
  el.style.left = playerState.x + 'px';
  el.style.top  = playerState.y + 'px';
  el.className  = 'character player-char facing-down';

  // Buat E prompt
  if (!playerState.ePromptEl) {
    const prompt = document.createElement('div');
    prompt.className = 'e-prompt';
    prompt.textContent = '[E] MASUK TOKO';
    prompt.style.display = 'none';
    el.appendChild(prompt);
    playerState.ePromptEl = prompt;
  }
}

// ========== INISIALISASI AI ========== //
function initAI(mapData, budget) {
  const start = mapData.aiStart;
  aiState.col = start.col;
  aiState.row = start.row;
  aiState.budget = budget;
  aiState.inventory = [];
  aiState.totalProfit = 0;
  aiState.visited = [];
  aiState.targetShop = null;
  aiState.thinkTimer = 0;
  aiState.buyTimer = 0;

  const px = tileToPixel(start.col, start.row);
  aiState.x = px.x;
  aiState.y = px.y;

  const el = document.getElementById('ai-rival');
  el.style.left = aiState.x + 'px';
  el.style.top  = aiState.y + 'px';
  el.className  = 'character ai-char facing-down';
}

// ========== INPUT HANDLER ========== //
function initInput() {
  document.addEventListener('keydown', (e) => {
    keysDown[e.key] = true;

    // E = interaksi toko
    if (e.key === 'e' || e.key === 'E') {
      handleInteract();
    }

    // TAB = toggle tabel DP
    if (e.key === 'Tab') {
      e.preventDefault();
      toggleDPPanel();
    }

    // ESC = tutup panel/popup
    if (e.key === 'Escape') {
      const dpPanel = document.getElementById('dp-table-panel');
      if (dpPanel.classList.contains('open')) {
        closeDPPanel();
      } else {
        const open = document.querySelector('.popup-overlay.show');
        if (open) closePopup(open.id);
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    keysDown[e.key] = false;
  });

  // Pixel cursor
  const cursor = document.createElement('div');
  cursor.className = 'pixel-cursor';
  cursor.id = 'pixel-cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
}

// ========== UPDATE PLAYER (dipanggil tiap frame) ========== //
function updatePlayer(collision, mapData, shopMap, dt) {
  const speed = 4; // tile per detik
  const TILE_S = TILE_SIZE;

  let dx = 0, dy = 0;
  let newDir = playerState.dir;

  if (keysDown['ArrowUp']    || keysDown['w'] || keysDown['W']) { dy = -1; newDir = 'up'; }
  if (keysDown['ArrowDown']  || keysDown['s'] || keysDown['S']) { dy =  1; newDir = 'down'; }
  if (keysDown['ArrowLeft']  || keysDown['a'] || keysDown['A']) { dx = -1; newDir = 'left'; }
  if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D']) { dx =  1; newDir = 'right'; }

  const moving = dx !== 0 || dy !== 0;
  playerState.dir = newDir;

  if (moving) {
    // Hitung posisi target dalam pixel
    const targetX = playerState.x + dx * speed * dt * TILE_S;
    const targetY = playerState.y + dy * speed * dt * TILE_S;

    // Cek collision berdasarkan tile
    const targetCol = Math.floor((targetX + TILE_S * 0.5) / TILE_S);
    const targetRow = Math.floor((targetY + TILE_S * 0.5) / TILE_S);

    if (isWalkable(collision, targetCol, targetRow, mapData)) {
      playerState.x = targetX;
      playerState.y = targetY;
      playerState.col = Math.floor((playerState.x + TILE_S * 0.3) / TILE_S);
      playerState.row = Math.floor((playerState.y + TILE_S * 0.3) / TILE_S);
    }
  }

  playerState.walking = moving;

  // Update DOM
  const el = document.getElementById('player');
  el.style.left = playerState.x + 'px';
  el.style.top  = playerState.y + 'px';

  // Update class arah
  let cls = 'character player-char';
  if (moving) {
    cls += ` walking-${newDir}`;
  } else {
    cls += ` facing-${newDir}`;
  }

  // Cek apakah dekat toko
  const nearShop = getNearbyShop(playerState.col, playerState.row, shopMap);
  playerState.nearShop = nearShop;

  if (nearShop) {
    cls += ' in-range';
    if (playerState.ePromptEl) {
      playerState.ePromptEl.style.display = 'block';
    }
  } else {
    if (playerState.ePromptEl) {
      playerState.ePromptEl.style.display = 'none';
    }
  }

  el.className = cls;

  // Update tooltip item
  updateItemTooltip(playerState.col, playerState.row);
}

// ========== UPDATE AI (Greedy Algorithm) ========== //
function updateAI(collision, mapData, shopMap, items, dt) {
  aiState.thinkTimer -= dt;

  if (aiState.thinkTimer > 0) {
    // Bergerak menuju target
    if (aiState.targetShop) {
      moveAIToward(
        aiState.targetShop.col + 1,
        aiState.targetShop.row + 1,
        collision, mapData, dt
      );
    }
    return;
  }

  // AI "berpikir" — pilih toko berikutnya
  aiState.thinkTimer = 1.5 + Math.random() * 1;

  // Cek apakah AI sudah di dekat toko target
  if (aiState.targetShop) {
    const dist = Math.abs(aiState.col - aiState.targetShop.col) +
                 Math.abs(aiState.row - aiState.targetShop.row);

    if (dist <= 2) {
      // AI sampai di toko — beli dengan greedy
      aiGreedyBuy(aiState.targetShop, items);
      aiState.visited.push(aiState.targetShop.id);
      aiState.targetShop = null;
      aiState.buyTimer = 0.8;
    }
  }

  // Pilih toko berikutnya yang belum dikunjungi
  const unvisited = mapData.shops.filter(
    (s) => !aiState.visited.includes(s.id)
  );

  if (unvisited.length > 0 && aiState.budget > 0) {
    // AI greedy: pilih toko yang punya item dengan rasio terbaik
    aiState.targetShop = unvisited[Math.floor(Math.random() * unvisited.length)];
  }
}

// ========== AI GREEDY BUY ========== //
function aiGreedyBuy(shop, allItems) {
  if (!shop || !allItems || allItems.length === 0) return;

  // Ambil item yang tersedia di toko ini (belum diambil player)
  const shopItems = getShopItems(shop, allItems);
  if (!shopItems || shopItems.length === 0) return;

  // Urutkan by rasio profit/cost DESC (greedy)
  const sorted = [...shopItems].sort((a, b) =>
    (b.profit / b.cost) - (a.profit / a.cost)
  );

  for (const item of sorted) {
    if (aiState.budget >= item.cost && !isItemTaken(item.id)) {
      aiState.budget -= item.cost;
      aiState.totalProfit += item.profit;
      aiState.inventory.push(item);
      markItemTaken(item.id, 'ai');

      // Tampilkan efek pickup AI
      showPickupEffect(
        aiState.x, aiState.y,
        `+${item.profit}`, 'ai-pick'
      );

      // Tampilkan bubble komentar AI
      showAIBubble(item);

      // Update DP live bar
      updateDPLiveBars();
      break; // greedy ambil satu per satu
    }
  }
}

// ========== GERAK AI TOWARD TARGET ========== //
function moveAIToward(targetCol, targetRow, collision, mapData, dt) {
  const speed = 2.5;
  const TILE_S = TILE_SIZE;

  const targetX = targetCol * TILE_S;
  const targetY = targetRow * TILE_S;

  const dx = targetX - aiState.x;
  const dy = targetY - aiState.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 4) return;

  const nx = dx / dist;
  const ny = dy / dist;

  const newX = aiState.x + nx * speed * dt * TILE_S;
  const newY = aiState.y + ny * speed * dt * TILE_S;

  const newCol = Math.floor((newX + TILE_S * 0.5) / TILE_S);
  const newRow = Math.floor((newY + TILE_S * 0.5) / TILE_S);

  if (isWalkable(collision, newCol, newRow, mapData)) {
    aiState.x = newX;
    aiState.y = newY;
    aiState.col = newCol;
    aiState.row = newRow;
  }

  // Tentukan arah
  if (Math.abs(dx) > Math.abs(dy)) {
    aiState.dir = dx > 0 ? 'right' : 'left';
  } else {
    aiState.dir = dy > 0 ? 'down' : 'up';
  }

  aiState.walking = true;

  // Update DOM AI
  const el = document.getElementById('ai-rival');
  el.style.left = aiState.x + 'px';
  el.style.top  = aiState.y + 'px';
  el.className  = `character ai-char walking-${aiState.dir}`;
}

// ========== ITEM TOOLTIP ========== //
function updateItemTooltip(col, row) {
  // Tooltip muncul saat dekat toko
  const tooltip = document.getElementById('item-tooltip');
  const shop = playerState.nearShop;

  if (!shop) {
    tooltip.style.display = 'none';
    return;
  }

  // Posisi tooltip di atas player
  const px = tileToPixel(col, row);
  tooltip.style.left = (px.x - 20) + 'px';
  tooltip.style.top  = (px.y - 90) + 'px';
  tooltip.style.display = 'block';

  document.getElementById('tooltip-name').textContent =
    `🏪 ${shop.label} — ${shop.npcName}`;
  document.getElementById('tooltip-cost').textContent = `Tekan E`;
  document.getElementById('tooltip-profit').textContent = `untuk masuk`;
  document.getElementById('tooltip-ratio').textContent =
    `${shop.npcSub}`;
}

// ========== AI BUBBLE ========== //
function showAIBubble(item) {
  const comments = [
    `Ambil ${item.emoji} ${item.name}! Rasio ${(item.profit/item.cost).toFixed(1)}x`,
    `${item.emoji} ini menguntungkan!`,
    `Greedy pilih ${item.name} dulu!`,
    `Rasio tertinggi: ${item.emoji}!`,
  ];

  const bubble = document.getElementById('ai-bubble');
  const text   = document.getElementById('ai-bubble-text');

  text.textContent = comments[Math.floor(Math.random() * comments.length)];
  bubble.style.display = 'block';

  clearTimeout(window.aiBubbleTimer);
  window.aiBubbleTimer = setTimeout(() => {
    bubble.style.display = 'none';
  }, 2500);
}

// ========== PICKUP EFFECT ========== //
function showPickupEffect(x, y, text, cls = '') {
  const mapContainer = document.getElementById('map-container');
  const el = document.createElement('div');
  el.className = `pickup-effect ${cls}`;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  mapContainer.appendChild(el);
  setTimeout(() => el.remove(), 1000);

  // Tambah partikel koin & bintang
  const particles = ['💰','⭐','✨','💫','🪙'];
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 6;
    const dist  = 30 + Math.random() * 40;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist - 20;
    p.className = 'particle particle-coin';
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    p.style.left = (x + 16) + 'px';
    p.style.top  = (y + 16) + 'px';
    p.style.setProperty('--px', px + 'px');
    p.style.setProperty('--py', py + 'px');
    p.style.animationDelay = (i * 0.05) + 's';
    mapContainer.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }

  // Ripple di posisi player
  const ripple = document.createElement('div');
  ripple.className = 'shop-enter-ripple';
  ripple.style.left = (x + 8) + 'px';
  ripple.style.top  = (y + 8) + 'px';
  mapContainer.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ========== ITEM TAKEN TRACKING ========== //
const takenItems = {};

function isItemTaken(itemId) {
  return !!takenItems[itemId];
}

function markItemTaken(itemId, by = 'player') {
  takenItems[itemId] = by;
}

function resetTakenItems() {
  Object.keys(takenItems).forEach(k => delete takenItems[k]);
}

// ========== HANDLE INTERAKSI (E KEY) ========== //
function handleInteract() {
  const shop = playerState.nearShop;
  if (!shop) return;

  // Cek apakah ada popup yang terbuka
  const open = document.querySelector('.popup-overlay.show');
  if (open) return;

  openShop(shop);
}

// ========== TOGGLE DP PANEL ========== //
function toggleDPPanel() {
  const panel = document.getElementById('dp-table-panel');
  if (panel.classList.contains('open')) {
    closeDPPanel();
  } else {
    openDPPanel();
  }
}

function openDPPanel() {
  const panel = document.getElementById('dp-table-panel');
  panel.classList.add('open');

  // Update visualisasi dengan data saat ini
  const state = window.gameState;
  if (state && state.items && state.items.length > 0) {
    updateDPVisualizer(state.items, state.selectedIds, state.budget);
  }
}

function closeDPPanel() {
  document.getElementById('dp-table-panel').classList.remove('open');
}