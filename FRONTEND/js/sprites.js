// ══════════════════════════════════════
//   SPRITES — pixel art di Canvas
// ══════════════════════════════════════

const SPR_W = 16; // sprite width  (pixel)
const SPR_H = 20; // sprite height (pixel)

// ── Arah ──
const DIR = { DOWN:0, LEFT:1, RIGHT:2, UP:3 };

// ══════════════════════════════════════
//   PLAYER SPRITE — pedagang biru
//   Format: array pixel 16×20
//   Setiap elemen = [x, y, color]
// ══════════════════════════════════════
const PLAYER_PIXELS = {
  body: [
    // Topi coklat
    [4,0,'#8B4513'],[5,0,'#8B4513'],[6,0,'#8B4513'],[7,0,'#8B4513'],[8,0,'#8B4513'],[9,0,'#8B4513'],[10,0,'#8B4513'],[11,0,'#8B4513'],
    [3,1,'#A0522D'],[4,1,'#A0522D'],[5,1,'#A0522D'],[6,1,'#A0522D'],[7,1,'#A0522D'],[8,1,'#A0522D'],[9,1,'#A0522D'],[10,1,'#A0522D'],[11,1,'#A0522D'],[12,1,'#A0522D'],
    [4,2,'#8B4513'],[5,2,'#8B4513'],[6,2,'#8B4513'],[7,2,'#8B4513'],[8,2,'#8B4513'],[9,2,'#8B4513'],[10,2,'#8B4513'],[11,2,'#8B4513'],
    // Kepala
    [4,3,'#FDBCB4'],[5,3,'#FDBCB4'],[6,3,'#FDBCB4'],[7,3,'#FDBCB4'],[8,3,'#FDBCB4'],[9,3,'#FDBCB4'],[10,3,'#FDBCB4'],[11,3,'#FDBCB4'],
    [4,4,'#FDBCB4'],[5,4,'#FDBCB4'],[6,4,'#1a1a1a'],[7,4,'#FDBCB4'],[8,4,'#FDBCB4'],[9,4,'#1a1a1a'],[10,4,'#FDBCB4'],[11,4,'#FDBCB4'],
    [4,5,'#FDBCB4'],[5,5,'#FDBCB4'],[6,5,'#FDBCB4'],[7,5,'#cc5533'],[8,5,'#cc5533'],[9,5,'#FDBCB4'],[10,5,'#FDBCB4'],[11,5,'#FDBCB4'],
    [5,6,'#FDBCB4'],[6,6,'#FDBCB4'],[7,6,'#FDBCB4'],[8,6,'#FDBCB4'],[9,6,'#FDBCB4'],[10,6,'#FDBCB4'],
    // Badan biru
    [4,7,'#3a7fb0'],[5,7,'#4a9fc8'],[6,7,'#4a9fc8'],[7,7,'#4a9fc8'],[8,7,'#4a9fc8'],[9,7,'#4a9fc8'],[10,7,'#4a9fc8'],[11,7,'#3a7fb0'],
    [3,8,'#3a7fb0'],[4,8,'#4a9fc8'],[5,8,'#5ab0d8'],[6,8,'#5ab0d8'],[7,8,'#5ab0d8'],[8,8,'#5ab0d8'],[9,8,'#5ab0d8'],[10,8,'#4a9fc8'],[11,8,'#3a7fb0'],
    [3,9,'#3a7fb0'],[4,9,'#4a9fc8'],[5,9,'#5ab0d8'],[6,9,'#5ab0d8'],[7,9,'#5ab0d8'],[8,9,'#5ab0d8'],[9,9,'#5ab0d8'],[10,9,'#4a9fc8'],[11,9,'#3a7fb0'],
    [3,10,'#3a7fb0'],[4,10,'#4a9fc8'],[5,10,'#4a9fc8'],[6,10,'#4a9fc8'],[7,10,'#4a9fc8'],[8,10,'#4a9fc8'],[9,10,'#4a9fc8'],[10,10,'#3a7fb0'],
    // Celana
    [4,11,'#2c3e50'],[5,11,'#2c3e50'],[6,11,'#2c3e50'],[7,11,'#2c3e50'],[8,11,'#2c3e50'],[9,11,'#2c3e50'],[10,11,'#2c3e50'],[11,11,'#2c3e50'],
    [4,12,'#2c3e50'],[5,12,'#2c3e50'],[6,12,'#2c3e50'],[9,12,'#2c3e50'],[10,12,'#2c3e50'],[11,12,'#2c3e50'],
    // Sepatu
    [4,13,'#8B4513'],[5,13,'#8B4513'],[6,13,'#8B4513'],[9,13,'#8B4513'],[10,13,'#8B4513'],[11,13,'#8B4513'],
  ],
  // Kaki - frame 0 (idle/step A)
  legsA: [
    [5,11,'#2c3e50'],[6,11,'#2c3e50'],[7,11,'#2c3e50'],[8,11,'#2c3e50'],[9,11,'#2c3e50'],[10,11,'#2c3e50'],
    [5,12,'#2c3e50'],[6,12,'#2c3e50'],[9,12,'#2c3e50'],[10,12,'#2c3e50'],
    [5,13,'#6b3010'],[6,13,'#6b3010'],[9,13,'#6b3010'],[10,13,'#6b3010'],
  ],
  // Kaki - frame 1 (step B - jalan)
  legsB: [
    [4,11,'#2c3e50'],[5,11,'#2c3e50'],[6,11,'#2c3e50'],[7,11,'#2c3e50'],[8,11,'#2c3e50'],[9,11,'#2c3e50'],[10,11,'#2c3e50'],[11,11,'#2c3e50'],
    [4,12,'#2c3e50'],[5,12,'#2c3e50'],[10,12,'#2c3e50'],[11,12,'#2c3e50'],
    [4,13,'#6b3010'],[5,13,'#6b3010'],[10,13,'#6b3010'],[11,13,'#6b3010'],
  ],
};

// ══════════════════════════════════════
//   AI SPRITE — pedagang merah
// ══════════════════════════════════════
const AI_PIXELS = {
  body: [
    // Helm merah
    [4,0,'#cc2222'],[5,0,'#cc2222'],[6,0,'#cc2222'],[7,0,'#cc2222'],[8,0,'#cc2222'],[9,0,'#cc2222'],[10,0,'#cc2222'],[11,0,'#cc2222'],
    [3,1,'#aa1111'],[4,1,'#dd3333'],[5,1,'#dd3333'],[6,1,'#dd3333'],[7,1,'#dd3333'],[8,1,'#dd3333'],[9,1,'#dd3333'],[10,1,'#dd3333'],[11,1,'#dd3333'],[12,1,'#aa1111'],
    [4,2,'#cc2222'],[5,2,'#cc2222'],[6,2,'#cc2222'],[7,2,'#cc2222'],[8,2,'#cc2222'],[9,2,'#cc2222'],[10,2,'#cc2222'],[11,2,'#cc2222'],
    // Kepala
    [4,3,'#FDBCB4'],[5,3,'#FDBCB4'],[6,3,'#FDBCB4'],[7,3,'#FDBCB4'],[8,3,'#FDBCB4'],[9,3,'#FDBCB4'],[10,3,'#FDBCB4'],[11,3,'#FDBCB4'],
    [4,4,'#FDBCB4'],[5,4,'#FDBCB4'],[6,4,'#cc2222'],[7,4,'#FDBCB4'],[8,4,'#FDBCB4'],[9,4,'#cc2222'],[10,4,'#FDBCB4'],[11,4,'#FDBCB4'],
    [4,5,'#FDBCB4'],[5,5,'#FDBCB4'],[6,5,'#FDBCB4'],[7,5,'#FDBCB4'],[8,5,'#FDBCB4'],[9,5,'#FDBCB4'],[10,5,'#FDBCB4'],[11,5,'#FDBCB4'],
    [5,6,'#FDBCB4'],[6,6,'#FDBCB4'],[7,6,'#FDBCB4'],[8,6,'#FDBCB4'],[9,6,'#FDBCB4'],[10,6,'#FDBCB4'],
    // Badan merah
    [4,7,'#8B0000'],[5,7,'#aa1010'],[6,7,'#aa1010'],[7,7,'#aa1010'],[8,7,'#aa1010'],[9,7,'#aa1010'],[10,7,'#aa1010'],[11,7,'#8B0000'],
    [3,8,'#8B0000'],[4,8,'#aa1010'],[5,8,'#bb2020'],[6,8,'#bb2020'],[7,8,'#bb2020'],[8,8,'#bb2020'],[9,8,'#bb2020'],[10,8,'#aa1010'],[11,8,'#8B0000'],
    [3,9,'#8B0000'],[4,9,'#aa1010'],[5,9,'#bb2020'],[6,9,'#bb2020'],[7,9,'#bb2020'],[8,9,'#bb2020'],[9,9,'#bb2020'],[10,9,'#aa1010'],[11,9,'#8B0000'],
    [3,10,'#8B0000'],[4,10,'#aa1010'],[5,10,'#aa1010'],[6,10,'#aa1010'],[7,10,'#aa1010'],[8,10,'#aa1010'],[9,10,'#aa1010'],[10,10,'#8B0000'],
    // Celana hitam
    [4,11,'#1a1a2e'],[5,11,'#1a1a2e'],[6,11,'#1a1a2e'],[7,11,'#1a1a2e'],[8,11,'#1a1a2e'],[9,11,'#1a1a2e'],[10,11,'#1a1a2e'],[11,11,'#1a1a2e'],
    [4,12,'#1a1a2e'],[5,12,'#1a1a2e'],[6,12,'#1a1a2e'],[9,12,'#1a1a2e'],[10,12,'#1a1a2e'],[11,12,'#1a1a2e'],
    [4,13,'#cc2222'],[5,13,'#cc2222'],[6,13,'#cc2222'],[9,13,'#cc2222'],[10,13,'#cc2222'],[11,13,'#cc2222'],
  ],
  legsA: [
    [5,11,'#1a1a2e'],[6,11,'#1a1a2e'],[7,11,'#1a1a2e'],[8,11,'#1a1a2e'],[9,11,'#1a1a2e'],[10,11,'#1a1a2e'],
    [5,12,'#1a1a2e'],[6,12,'#1a1a2e'],[9,12,'#1a1a2e'],[10,12,'#1a1a2e'],
    [5,13,'#cc2222'],[6,13,'#cc2222'],[9,13,'#cc2222'],[10,13,'#cc2222'],
  ],
  legsB: [
    [4,11,'#1a1a2e'],[5,11,'#1a1a2e'],[6,11,'#1a1a2e'],[7,11,'#1a1a2e'],[8,11,'#1a1a2e'],[9,11,'#1a1a2e'],[10,11,'#1a1a2e'],[11,11,'#1a1a2e'],
    [4,12,'#1a1a2e'],[5,12,'#1a1a2e'],[10,12,'#1a1a2e'],[11,12,'#1a1a2e'],
    [4,13,'#cc2222'],[5,13,'#cc2222'],[10,13,'#cc2222'],[11,13,'#cc2222'],
  ],
};

// ══════════════════════════════════════
//   NPC SPRITES — penjaga toko
// ══════════════════════════════════════
const NPC_COLORS = [
  '#f8a030', // oranye
  '#38a8f8', // biru
  '#48d858', // hijau
  '#d060f8', // ungu
  '#38e8e8', // teal
  '#f8d030', // emas
];

// ══════════════════════════════════════
//   DRAW SPRITE KE CANVAS
// ══════════════════════════════════════
function drawSprite(ctx, pixels, x, y, scale, flipX = false, legFrame = 0) {
  const ps = scale; // pixel size

  ctx.save();

  if (flipX) {
    ctx.translate(x + SPR_W * ps, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }

  // Draw body pixels
  for (const [px, py, color] of pixels.body) {
    ctx.fillStyle = color;
    ctx.fillRect(px * ps, py * ps, ps, ps);
  }

  // Draw leg frame
  const legs = legFrame === 0 ? pixels.legsA : pixels.legsB;
  for (const [px, py, color] of legs) {
    ctx.fillStyle = color;
    ctx.fillRect(px * ps, py * ps, ps, ps);
  }

  ctx.restore();
}

// ── Draw player ──
function drawPlayer(ctx, wx, wy, scale, dir, walking, walkFrame) {
  const flipX = dir === DIR.LEFT;
  const lf    = walking ? walkFrame : 0;
  drawSprite(ctx, PLAYER_PIXELS, wx, wy, scale, flipX, lf);

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle   = '#000';
  ctx.beginPath();
  ctx.ellipse(
    wx + SPR_W * scale / 2,
    wy + SPR_H * scale - 2,
    SPR_W * scale * 0.35, 4, 0, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

// ── Draw AI rival ──
function drawAI(ctx, wx, wy, scale, dir, walking, walkFrame) {
  const flipX = dir === DIR.LEFT;
  const lf    = walking ? walkFrame : 0;
  drawSprite(ctx, AI_PIXELS, wx, wy, scale, flipX, lf);

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle   = '#f00';
  ctx.beginPath();
  ctx.ellipse(
    wx + SPR_W * scale / 2,
    wy + SPR_H * scale - 2,
    SPR_W * scale * 0.35, 4, 0, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

// ── Draw NPC di depan toko ──
function drawNPC(ctx, wx, wy, scale, colorIdx, bobOffset) {
  const c  = NPC_COLORS[colorIdx % NPC_COLORS.length];
  const ps = scale;
  const bx = wx;
  const by = wy + bobOffset;

  ctx.save();
  ctx.translate(bx, by);

  // Body NPC sederhana
  // Kepala
  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(5*ps, 0,    6*ps, 6*ps);
  // Mata
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(6*ps, 2*ps, ps, ps);
  ctx.fillRect(9*ps, 2*ps, ps, ps);
  // Badan berwarna
  ctx.fillStyle = c;
  ctx.fillRect(4*ps, 6*ps,  8*ps, 7*ps);
  // Highlight badan
  ctx.fillStyle = lighten(c, 40);
  ctx.fillRect(4*ps, 6*ps,  8*ps, 2*ps);
  // Celana
  ctx.fillStyle = darken(c, 30);
  ctx.fillRect(4*ps, 13*ps, 3*ps, 4*ps);
  ctx.fillRect(9*ps, 13*ps, 3*ps, 4*ps);
  // Sepatu
  ctx.fillStyle = '#3a2a10';
  ctx.fillRect(4*ps, 17*ps, 4*ps, 2*ps);
  ctx.fillRect(8*ps, 17*ps, 4*ps, 2*ps);

  // Shadow
  ctx.globalAlpha = 0.15;
  ctx.fillStyle   = '#000';
  ctx.beginPath();
  ctx.ellipse(8*ps, 19*ps, 5*ps, 2, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ── Draw label nama di atas karakter ──
function drawCharLabel(ctx, wx, wy, scale, text, color, bgColor) {
  const cx  = wx + SPR_W * scale / 2;
  const cy  = wy - 8;
  const pad = 4;

  ctx.font      = `bold ${scale * 3}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';

  const tw = ctx.measureText(text).width;

  // Background label
  ctx.fillStyle = bgColor;
  ctx.fillRect(cx - tw/2 - pad, cy - scale*3 - 2, tw + pad*2, scale*3 + 4);

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1;
  ctx.strokeRect(cx - tw/2 - pad, cy - scale*3 - 2, tw + pad*2, scale*3 + 4);

  // Teks
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);
  ctx.textAlign = 'left';
}

// ── Draw tanda "!" di atas NPC ──
function drawExclaim(ctx, wx, wy, scale, bounce) {
  const cx = wx + SPR_W * scale / 2;
  const cy = wy - 14 - Math.abs(Math.sin(bounce)) * 5;

  ctx.font      = `bold ${scale * 4}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8d030';
  ctx.fillText('!', cx, cy);

  // Glow
  ctx.shadowColor = '#f8d030';
  ctx.shadowBlur  = 8;
  ctx.fillText('!', cx, cy);
  ctx.shadowBlur  = 0;
  ctx.textAlign   = 'left';
}

// ── Draw label toko di atas bangunan ──
function drawShopLabel(ctx, wx, wy, scale, text, colorIdx) {
  const c   = SHOP_COLORS[colorIdx % SHOP_COLORS.length];
  const cx  = wx + TILE_SIZE * scale;
  const cy  = wy - 6;
  const pad = 5;

  ctx.font      = `bold ${scale * 2.5}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';

  const tw = ctx.measureText(text).width;
  const bw = tw + pad * 2;
  const bh = scale * 3 + 6;

  // Background
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(cx - bw/2, cy - bh + 2, bw, bh);

  // Border warna toko
  ctx.strokeStyle = c.roof;
  ctx.lineWidth   = 2;
  ctx.strokeRect(cx - bw/2, cy - bh + 2, bw, bh);

  // Teks
  ctx.fillStyle = c.roof;
  ctx.fillText(text, cx, cy);

  // Panah ke bawah
  ctx.fillStyle = c.roof;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 2);
  ctx.lineTo(cx + 4, cy + 2);
  ctx.lineTo(cx, cy + 7);
  ctx.fill();

  ctx.textAlign = 'left';
}

// ── Draw efek pickup teks ──
function drawPickupText(ctx, wx, wy, text, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font        = `bold 9px "Press Start 2P", monospace`;
  ctx.fillStyle   = color;
  ctx.textAlign   = 'center';
  ctx.shadowColor = color;
  ctx.shadowBlur  = 6;
  ctx.fillText(text, wx, wy);
  ctx.shadowBlur  = 0;
  ctx.textAlign   = 'left';
  ctx.restore();
}

// ── Draw E prompt ──
function drawEPrompt(ctx, wx, wy, scale, blink) {
  if (blink % 60 < 30) return; // kedip
  const cx  = wx + SPR_W * scale / 2;
  const cy  = wy - 22;
  const pad = 4;
  const txt = '[E]';

  ctx.font      = `bold ${scale * 2.5}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  const tw = ctx.measureText(txt).width;

  ctx.fillStyle = '#f8d030';
  ctx.fillRect(cx - tw/2 - pad, cy - scale*3, tw + pad*2, scale*3 + 4);

  ctx.fillStyle = '#101018';
  ctx.fillText(txt, cx, cy);
  ctx.textAlign = 'left';
}