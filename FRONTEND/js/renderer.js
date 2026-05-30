// ══════════════════════════════════════
//   RENDERER — Canvas game loop utama
// ══════════════════════════════════════

let canvas, ctx;
let CAM = { x: 0, y: 0, targetX: 0, targetY: 0 }; // kamera

// State render
let renderState = {
  mapDef:      null,
  parsedMap:   null,
  frame:       0,       // frame counter (untuk animasi)
  walkFrame:   0,       // 0 atau 1 untuk walk cycle
  walkTimer:   0,
  effects:     [],      // pickup effects
  shopBobs:    {},      // animasi NPC bob per shop
  exclaimAnim: 0,       // counter animasi !
  nearShop:    null,    // toko terdekat dari player
  eBlinkTimer: 0,
  visitedShops: new Set(),
};

// ══════════════════════════════════════
//   INIT CANVAS
// ══════════════════════════════════════
function initCanvas() {
  canvas = document.getElementById('game-canvas');
  ctx    = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap) return;

  // Paksa ukuran sesuai viewport
  const hudH    = document.getElementById('hud')?.offsetHeight       || 46;
  const hudBotH = document.getElementById('hud-bottom')?.offsetHeight || 32;

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight - hudH - hudBotH;

  // Pastikan canvas-wrap punya ukuran
  wrap.style.width  = canvas.width  + 'px';
  wrap.style.height = canvas.height + 'px';

  ctx.imageSmoothingEnabled = false;

  console.log('[Canvas] Size:', canvas.width, 'x', canvas.height);
}

// ══════════════════════════════════════
//   LOAD MAP KE RENDERER
// ══════════════════════════════════════
function loadMap(mapIndex) {
  const mapDef  = MAPS[mapIndex];
  const parsed  = parseMapData(mapDef);

  console.log('[Map] Loaded:', mapDef.name,
    '| Grid rows:', parsed.grid.length,
    '| Shops:', Object.keys(parsed.shopCells).length);

  renderState.mapDef      = mapDef;
  renderState.parsedMap   = parsed;
  renderState.effects     = [];
  renderState.shopBobs    = {};
  renderState.visitedShops = new Set();
  renderState.nearShop    = null;

  mapDef.shops.forEach(shop => {
    renderState.shopBobs[shop.id] = Math.random() * Math.PI * 2;
  });

  const ts    = TILE_SIZE * SCALE;
  CAM.x     = playerState.wx - canvas.width  / 2 + (SPR_W * SCALE) / 2;
  CAM.y     = playerState.wy - canvas.height / 2 + (SPR_H * SCALE) / 2;
  CAM.targetX = CAM.x;
  CAM.targetY = CAM.y;

  return parsed;
}

// ══════════════════════════════════════
//   MAIN RENDER LOOP
// ══════════════════════════════════════
function renderFrame(dt) {
  if (!ctx || !renderState.mapDef) return;

  const rs = renderState;
  rs.frame++;
  rs.eBlinkTimer++;
  rs.exclaimAnim += dt * 3;

  // Walk animation
  rs.walkTimer += dt;
  if (rs.walkTimer > 0.18) {
    rs.walkTimer  = 0;
    rs.walkFrame  = 1 - rs.walkFrame;
  }

  // Bob NPC
  Object.keys(rs.shopBobs).forEach(id => {
    rs.shopBobs[id] += dt * 2.2;
  });

  // Update kamera — smooth follow player
  const halfW = canvas.width  / 2;
  const halfH = canvas.height / 2;
  CAM.targetX = playerState.wx - halfW + (SPR_W * SCALE) / 2;
  CAM.targetY = playerState.wy - halfH + (SPR_H * SCALE) / 2;

  // Clamp kamera ke batas peta
  const mapW = rs.mapDef.cols * TILE_SIZE * SCALE;
  const mapH = rs.mapDef.rows * TILE_SIZE * SCALE;
  CAM.targetX = Math.max(0, Math.min(CAM.targetX, mapW - canvas.width));
  CAM.targetY = Math.max(0, Math.min(CAM.targetY, mapH - canvas.height));

  // Lerp kamera
  CAM.x += (CAM.targetX - CAM.x) * 0.12;
  CAM.y += (CAM.targetY - CAM.y) * 0.12;

  // Deteksi toko terdekat
  rs.nearShop = getNearbyShop(
    playerState.col, playerState.row,
    rs.parsedMap.shopCells
  );

  // ── Mulai render ──
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = rs.mapDef.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-Math.floor(CAM.x), -Math.floor(CAM.y));

  // 1. Tilemap
  drawTilemapLayer();

  // 2. Bayangan karakter (sebelum sprite)
  drawCharShadows();

  // 3. NPC di toko
  drawAllNPCs();

  // 4. AI sprite
  const aiWalking = aiState.walking;
  drawAI(
    ctx, aiState.wx, aiState.wy, SCALE,
    aiState.dir, aiWalking, rs.walkFrame
  );
  drawCharLabel(ctx, aiState.wx, aiState.wy, SCALE, 'AI', '#f03030', '#200808');

  // 5. Player sprite
  const plWalking = playerState.walking;
  drawPlayer(
    ctx, playerState.wx, playerState.wy, SCALE,
    playerState.dir, plWalking, rs.walkFrame
  );
  drawCharLabel(
    ctx, playerState.wx, playerState.wy, SCALE,
    window.gameState?.playerName?.slice(0,6) || 'YOU',
    '#48d858', '#081808'
  );

  // 6. E prompt jika dekat toko
  if (rs.nearShop && !document.getElementById('dialog-box').classList.contains('hidden')) {
    // Dialog sudah terbuka, tidak perlu prompt
  } else if (rs.nearShop) {
    drawEPrompt(
      ctx, playerState.wx, playerState.wy,
      SCALE, rs.eBlinkTimer
    );
  }

  // 7. Tanda ! di atas NPC
  drawAllExclaims();

  // 8. Label toko
  drawShopLabels();

  // 9. Efek pickup
  drawAllEffects(dt);

  ctx.restore();

  // 10. CRT scanline overlay
  drawScanlines();
}

// ══════════════════════════════════════
//   DRAW TILEMAP
// ══════════════════════════════════════
function drawTilemapLayer() {
  const rs      = renderState;
  const { grid, shopCells } = rs.parsedMap;
  const mapDef  = rs.mapDef;
  const ts      = TILE_SIZE * SCALE;

  // Hitung tile yang visible saja (culling)
  const startCol = Math.max(0, Math.floor(CAM.x / ts) - 1);
  const startRow = Math.max(0, Math.floor(CAM.y / ts) - 1);
  const endCol   = Math.min(mapDef.cols, Math.ceil((CAM.x + canvas.width)  / ts) + 1);
  const endRow   = Math.min(mapDef.rows, Math.ceil((CAM.y + canvas.height) / ts) + 1);

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const tileId = grid[r]?.[c] ?? T.DARK;
      const px     = c * ts;
      const py     = r * ts;

      if (tileId === T.SHOP) {
        // Cari shop di cell ini
        const shop = shopCells[`${c},${r}`];
        const cidx = shop ? shop.colorIdx : 0;
        // Toko yang sudah dikunjungi sedikit redup
        if (rs.visitedShops.has(shop?.id)) {
          ctx.save();
          ctx.globalAlpha = 0.6;
          drawTile(ctx, tileId, px, py, cidx, rs.frame);
          ctx.restore();
        } else {
          drawTile(ctx, tileId, px, py, cidx, rs.frame);
        }
      } else {
        drawTile(ctx, tileId, px, py, 0, rs.frame);
      }
    }
  }
}

// ══════════════════════════════════════
//   DRAW BAYANGAN KARAKTER
// ══════════════════════════════════════
function drawCharShadows() {
  // Sudah dihandle di drawPlayer/drawAI
}

// ══════════════════════════════════════
//   DRAW SEMUA NPC
// ══════════════════════════════════════
function drawAllNPCs() {
  const rs     = renderState;
  const mapDef = rs.mapDef;
  const ts     = TILE_SIZE * SCALE;

  mapDef.shops.forEach(shop => {
    const px  = shop.col * ts;
    const py  = shop.row * ts;
    const bob = Math.sin(rs.shopBobs[shop.id]) * 3;

    // Posisi NPC di depan pintu toko
    const npcX = px + ts * 0.5 - SPR_W * SCALE * 0.5;
    const npcY = py + ts - 4 + bob;

    drawNPC(ctx, npcX, npcY, SCALE, shop.colorIdx, 0);
  });
}

// ══════════════════════════════════════
//   DRAW TANDA SERU
// ══════════════════════════════════════
function drawAllExclaims() {
  const rs     = renderState;
  const mapDef = rs.mapDef;
  const ts     = TILE_SIZE * SCALE;

  mapDef.shops.forEach(shop => {
    if (rs.visitedShops.has(shop.id)) return;

    const px  = shop.col * ts;
    const py  = shop.row * ts;
    const npcX = px + ts * 0.5 - SPR_W * SCALE * 0.5;
    const npcY = py + ts - 4;

    drawExclaim(ctx, npcX, npcY, SCALE, rs.exclaimAnim);
  });
}

// ══════════════════════════════════════
//   DRAW LABEL TOKO
// ══════════════════════════════════════
function drawShopLabels() {
  const rs     = renderState;
  const mapDef = rs.mapDef;
  const ts     = TILE_SIZE * SCALE;

  // Track toko yang sudah digambar labelnya
  const drawn = new Set();

  mapDef.shops.forEach(shop => {
    if (drawn.has(shop.id)) return;
    drawn.add(shop.id);

    const px = shop.col * ts;
    const py = shop.row * ts;

    drawShopLabel(ctx, px, py, SCALE, shop.label, shop.colorIdx);
  });
}

// ══════════════════════════════════════
//   EFEK PICKUP
// ══════════════════════════════════════
function spawnEffect(wx, wy, text, color) {
  renderState.effects.push({
    wx, wy, text, color,
    life: 1.0, // 0-1, berkurang tiap frame
    vy: -60,   // pixel per detik ke atas
  });
}

function drawAllEffects(dt) {
  renderState.effects = renderState.effects.filter(ef => ef.life > 0);

  renderState.effects.forEach(ef => {
    ef.wy   += ef.vy * dt;
    ef.life -= dt * 1.2;
    drawPickupText(ctx, ef.wx + SPR_W * SCALE / 2, ef.wy, ef.text, ef.color, ef.life);
  });
}

// ══════════════════════════════════════
//   CRT SCANLINES
// ══════════════════════════════════════
function drawScanlines() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < canvas.height; y += 3) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
  ctx.restore();
}

// ══════════════════════════════════════
//   SCREEN EFFECTS
// ══════════════════════════════════════
function screenFlash(color = '#ffffff', duration = 120) {
  const el = document.getElementById('screen-flash');
  if (!el) return;
  el.style.background = color;
  el.style.opacity    = '0.45';
  setTimeout(() => { el.style.opacity = '0'; }, duration);
}

function screenShake(duration = 350) {
  const gs = document.getElementById('screen-game');
  if (!gs) return;
  gs.classList.remove('shake');
  void gs.offsetWidth;
  gs.classList.add('shake');
  SFX.thud();
  setTimeout(() => gs.classList.remove('shake'), duration);
}

function setVignette(active) {
  const el = document.getElementById('screen-vignette');
  if (!el) return;
  if (active) el.classList.add('danger');
  else        el.classList.remove('danger');
}

// ══════════════════════════════════════
//   CONFETTI
// ══════════════════════════════════════
function spawnConfetti(count = 50) {
  const colors = ['#f8d030','#48d858','#38a8f8','#f03030','#d060f8','#38e8e8','#ffffff'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -12px;
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.6}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4500);
    }, i * 40);
  }
}

// ══════════════════════════════════════
//   FLOAT TEXT (HTML overlay)
// ══════════════════════════════════════
function spawnFloatText(text, cls = 'positive') {
  // Posisi relatif canvas wrap
  const wrap = document.getElementById('canvas-wrap');
  const wRect = wrap.getBoundingClientRect();

  // Konversi world coords ke screen coords
  const screenX = playerState.wx - CAM.x + SPR_W * SCALE / 2;
  const screenY = playerState.wy - CAM.y - 10;

  const el = document.createElement('div');
  el.className   = `float-text ${cls}`;
  el.textContent = text;
  el.style.left  = screenX + 'px';
  el.style.top   = screenY + 'px';

  document.getElementById('float-container').appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ══════════════════════════════════════
//   PHASE OVERLAY
// ══════════════════════════════════════
function showPhaseOverlay(html, duration = 1800) {
  return new Promise(resolve => {
    const overlay = document.getElementById('phase-overlay');
    const text    = document.getElementById('phase-text');

    text.innerHTML = html;
    overlay.classList.remove('hidden');

    setTimeout(() => {
      overlay.classList.add('hidden');
      resolve();
    }, duration);
  });
}

// ══════════════════════════════════════
//   COUNTDOWN (3, 2, 1, MULAI!)
// ══════════════════════════════════════
function runCountdown() {
  return new Promise(resolve => {
    const overlay = document.getElementById('countdown-overlay');
    const num     = document.getElementById('countdown-num');
    const steps   = ['3','2','1','MULAI!'];
    let i = 0;

    overlay.classList.remove('hidden');

    function next() {
      if (i >= steps.length) {
        overlay.classList.add('hidden');
        resolve();
        return;
      }
      num.textContent = steps[i];
      // Reset animasi
      num.style.animation = 'none';
      void num.offsetWidth;
      num.style.animation = '';

      SFX.tick();
      if (i === steps.length - 1) SFX.confirm();

      i++;
      setTimeout(next, i === steps.length ? 600 : 800);
    }

    next();
  });
}

// ══════════════════════════════════════
//   SCREEN TRANSITION — Pokemon style
// ══════════════════════════════════════
function fadeToBlack(duration = 400) {
  return new Promise(resolve => {
    const el = document.getElementById('screen-flash');
    el.style.background  = '#000';
    el.style.transition  = `opacity ${duration}ms ease`;
    el.style.opacity     = '1';
    setTimeout(resolve, duration);
  });
}

function fadeFromBlack(duration = 400) {
  return new Promise(resolve => {
    const el = document.getElementById('screen-flash');
    el.style.transition  = `opacity ${duration}ms ease`;
    el.style.opacity     = '0';
    setTimeout(() => {
      el.style.transition = '';
      resolve();
    }, duration);
  });
}

// ══════════════════════════════════════
//   TIMER DISPLAY
// ══════════════════════════════════════
function updateTimerDisplay(seconds) {
  const el = document.getElementById('hud-timer');
  if (!el) return;
  el.textContent = seconds;
  if (seconds <= 10) el.classList.add('warn');
  else               el.classList.remove('warn');
}

// ══════════════════════════════════════
//   TOAST
// ══════════════════════════════════════
function showToast(msg, type = '') {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const el = document.createElement('div');
  el.className = `toast ${type ? 'toast-' + type : ''}`;
  el.style.cssText = `
    position: fixed; top: 58px; left: 50%;
    transform: translateX(-50%);
    background: #0a0a12; border: 2px solid #f8d030;
    color: #f8d030; font-family: var(--pf);
    font-size: 7px; padding: 8px 18px;
    z-index: 600; pointer-events: none;
    white-space: nowrap; letter-spacing: 0.06em;
    box-shadow: 0 0 14px rgba(248,208,48,0.35), 0 4px 20px rgba(0,0,0,0.8);
    animation: fadeIn 0.2s ease;
  `;
  if (type === 'red') {
    el.style.borderColor = '#f03030';
    el.style.color       = '#f03030';
    el.style.boxShadow   = '0 0 14px rgba(240,48,48,0.35)';
  }
  if (type === 'green') {
    el.style.borderColor = '#48d858';
    el.style.color       = '#48d858';
    el.style.boxShadow   = '0 0 14px rgba(72,216,88,0.35)';
  }
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}