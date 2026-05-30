// ══════════════════════════════════════
//   TILEMAP — data peta + Canvas drawing
// ══════════════════════════════════════

const TILE_SIZE = 16; // pixel per tile di canvas
const SCALE     = 3;  // scale factor → tile tampil 48x48px

// ── Tile ID ──
const T = {
  GRASS:  0,
  DARK:   1,
  PATH:   2,
  PATH_H: 3,
  PATH_V: 4,
  WATER:  5,
  SAND:   6,
  TREE:   7,
  SHOP:   8,
  WALL:   9,
  FLOWER: 10,
};

// ── Warna palette per tile (pixel art) ──
const TILE_PALETTE = {
  [T.GRASS]:  { base:'#3a8c1e', shade:'#2d6b14', hi:'#4aac2e', border:null },
  [T.DARK]:   { base:'#1e5c0c', shade:'#163f08', hi:'#2a7010', border:null },
  [T.PATH]:   { base:'#b08030', shade:'#8a6018', hi:'#c89040', border:'#6a4010' },
  [T.PATH_H]: { base:'#b08030', shade:'#8a6018', hi:'#c89040', border:'#6a4010' },
  [T.PATH_V]: { base:'#b08030', shade:'#8a6018', hi:'#c89040', border:'#6a4010' },
  [T.WATER]:  { base:'#1868b0', shade:'#0c4880', hi:'#2888d0', border:null },
  [T.SAND]:   { base:'#d0a040', shade:'#b08020', hi:'#e0b850', border:null },
  [T.TREE]:   { base:'#1e5c0c', shade:'#163f08', hi:'#2a7010', border:null },
  [T.SHOP]:   { base:'#2a1a3e', shade:'#180e28', hi:'#3a2a58', border:null },
  [T.WALL]:   { base:'#3a3a58', shade:'#282838', hi:'#4a4a68', border:'#222230' },
  [T.FLOWER]: { base:'#3a8c1e', shade:'#2d6b14', hi:'#4aac2e', border:null },
};

// Warna unik per toko
const SHOP_COLORS = [
  { wall:'#8b3a00', roof:'#ff7a2a', door:'#5a1800', window:'#ffd080' }, // oranye
  { wall:'#0a2a6a', roof:'#4a8af5', door:'#060e30', window:'#a0c8ff' }, // biru
  { wall:'#0a4a1a', roof:'#4acb6a', door:'#062c0c', window:'#a0ffb0' }, // hijau
  { wall:'#3a0a6a', roof:'#9b5af5', door:'#20063a', window:'#d0a0ff' }, // ungu
  { wall:'#0a4a4a', roof:'#2acbcb', door:'#062c2c', window:'#a0ffff' }, // teal
  { wall:'#6a4a00', roof:'#f5c842', door:'#3e2c00', window:'#ffe080' }, // emas
];

// ══════════════════════════════════════
//   DATA PETA
// ══════════════════════════════════════
const MAPS = [
  {
    id: 0,
    name: 'Pasar Makassar',
    bgColor: '#1a3d0a',
    cols: 20, rows: 15,
    budget: 150,
    timerSec: 60,
    // G=grass D=dark P=path H=pathH V=pathV W=water S=sand T=tree 1-6=shop F=flower
    data: [
      'DDDDDDDDDDDDDDDDDDDD',
      'DTTGGGGGGGGGGGGTTDDD',
      'DTGGGG1122GGG3344GDD',
      'DGGGG1122GGGGG3344GD',
      'DGGGGHHPPPPPPPHHGGDD',
      'DGGGVVPPPPPPPVVGGGDD',
      'DGGGGHHPPPPPPPHHGGDD',
      'DGGGG5566GGG7788GGDD',
      'DTGG5566GGGGG7788GDD',
      'DTTGGGGGGGGGGGGTTDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
    ],
    shops: [
      { id:'s1', col:4,  row:2, colorIdx:0, label:'REMPAH',  npcName:'PAK HASAN',  npcEmoji:'🧑‍🌾', npcSub:'Pedagang Rempah', itemCount:2 },
      { id:'s2', col:9,  row:2, colorIdx:1, label:'KAIN',    npcName:'BU SARI',    npcEmoji:'👩‍🌾', npcSub:'Pedagang Kain',   itemCount:2 },
      { id:'s3', col:13, row:6, colorIdx:2, label:'PANGAN',  npcName:'PAK BUDI',   npcEmoji:'🧓',   npcSub:'Pedagang Pangan', itemCount:2 },
      { id:'s4', col:4,  row:6, colorIdx:3, label:'MINYAK',  npcName:'BU ANI',     npcEmoji:'👵',   npcSub:'Pedagang Minyak', itemCount:2 },
    ],
    playerStart: { col:9,  row:5 },
    aiStart:     { col:10, row:5 },
  },
  {
    id: 1,
    name: 'Pelabuhan Pare-Pare',
    bgColor: '#0a1a2e',
    cols: 20, rows: 15,
    budget: 200,
    timerSec: 55,
    data: [
      'WWWWWWWWWWWWWWWWWWWW',
      'WSSSSSSSSSSSSSSSSSWW',
      'WS1122HPPPPPH3344SSW',
      'WS1122HPPPPPH3344SSW',
      'WSSSVVPPPPPPPVVSSSSWW',
      'WSSSVVPPPPPPPVVSSSSWW',
      'WS5566HPPPPPH7788SSW',
      'WS5566HPPPPPH7788SSW',
      'WSSSSSSSSSSSSSSSSSWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
    ],
    shops: [
      { id:'s1', col:2,  row:2, colorIdx:4, label:'IKAN',   npcName:'BANG ALI',  npcEmoji:'🧑‍🦱', npcSub:'Nelayan Lokal',  itemCount:2 },
      { id:'s2', col:12, row:2, colorIdx:0, label:'REMPAH', npcName:'PAK DAUD',  npcEmoji:'🧔',   npcSub:'Pedagang Rempah', itemCount:2 },
      { id:'s3', col:2,  row:6, colorIdx:1, label:'KAIN',   npcName:'BU FATIMA', npcEmoji:'👩',   npcSub:'Pedagang Kain',   itemCount:2 },
      { id:'s4', col:12, row:6, colorIdx:5, label:'MADU',   npcName:'PAK RAUF',  npcEmoji:'🧓',   npcSub:'Penjual Madu',    itemCount:2 },
    ],
    playerStart: { col:8, row:4 },
    aiStart:     { col:9, row:4 },
  },
  {
    id: 2,
    name: 'Pekan Toraja',
    bgColor: '#1a0e04',
    cols: 20, rows: 15,
    budget: 120,
    timerSec: 50,
    data: [
      'DDDDDDDDDDDDDDDDDDDD',
      'DTGGG11GG22GG33GTDDD',
      'DGGG11GGG22GGG33GGDD',
      'DGGGGVGGGVGGGVGGGGDD',
      'DGGGPPPPPPPPPPPGGGDD',
      'DGGGGVGGGVGGGVGGGGDD',
      'DGGG44GGG55GGG66GGDD',
      'DTGGG44GG55GG66GTDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
    ],
    shops: [
      { id:'s1', col:4,  row:1, colorIdx:4, label:'KERAJINAN', npcName:'NENEK TIKU', npcEmoji:'👵', npcSub:'Pengrajin Toraja', itemCount:1 },
      { id:'s2', col:8,  row:1, colorIdx:2, label:'KOPI',      npcName:'PAK RANTE',  npcEmoji:'🧓', npcSub:'Petani Kopi',      itemCount:2 },
      { id:'s3', col:12, row:1, colorIdx:3, label:'BAMBU',     npcName:'BU SARCE',   npcEmoji:'👩', npcSub:'Pengrajin Bambu',  itemCount:1 },
      { id:'s4', col:4,  row:6, colorIdx:0, label:'HERBAL',    npcName:'DATU LOLO',  npcEmoji:'🧙', npcSub:'Tabib Toraja',     itemCount:1 },
      { id:'s5', col:8,  row:6, colorIdx:1, label:'TENUN',     npcName:'IBU RATNA',  npcEmoji:'👩‍🦳', npcSub:'Penenun Toraja', itemCount:2 },
      { id:'s6', col:12, row:6, colorIdx:5, label:'MADU',      npcName:'PAK YOSEF',  npcEmoji:'🧔', npcSub:'Peternak Lebah',   itemCount:1 },
    ],
    playerStart: { col:8, row:3 },
    aiStart:     { col:9, row:3 },
  },
  {
    id: 3,
    name: 'Pasar Bone',
    bgColor: '#040e1a',
    cols: 20, rows: 15,
    budget: 180,
    timerSec: 45,
    data: [
      'GGGGGGGGGGGGGGGGGGGG',
      'GTGG1122HPPPH3344TGG',
      'GGG1122GGGGGGG3344GG',
      'GGGGGVGGGPGGGVGGGGGG',
      'GGGGPPPPPPPPPPPGGGGG',
      'GGGGGVGGGPGGGVGGGGGG',
      'GGG5566GGGGGGG7788GG',
      'GTGG5566HPPPH7788TGG',
      'GGGGGGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGGGGGG',
    ],
    shops: [
      { id:'s1', col:3,  row:1, colorIdx:1, label:'SUTERA', npcName:'ANDI MIRA',  npcEmoji:'👸', npcSub:'Pedagang Sutera', itemCount:2 },
      { id:'s2', col:11, row:1, colorIdx:2, label:'BERAS',  npcName:'PAK UMAR',   npcEmoji:'👨', npcSub:'Petani Bone',     itemCount:2 },
      { id:'s3', col:3,  row:6, colorIdx:5, label:'EMAS',   npcName:'HAJI SALEH', npcEmoji:'🧔', npcSub:'Pedagang Emas',   itemCount:2 },
      { id:'s4', col:11, row:6, colorIdx:3, label:'MINYAK', npcName:'BU ROHANI',  npcEmoji:'👩‍🦳', npcSub:'Pedagang Minyak', itemCount:2 },
    ],
    playerStart: { col:8, row:4 },
    aiStart:     { col:9, row:4 },
  },
  {
    id: 4,
    name: 'Pasar Palopo',
    bgColor: '#0e0420',
    cols: 20, rows: 15,
    budget: 250,
    timerSec: 40,
    data: [
      'DDDDDDDDDDDDDDDDDDDD',
      'DT11GG22GGG33GG44TDD',
      'DG11GGG22GGG33GGG44GD',
      'DGGVGGGVGGGVGGGVGGDD',
      'DGPPPPPPPPPPPPPPPGDD',
      'DGGVGGGVGGGVGGGVGGDD',
      'DG55GGG66GGG77GGG88GD',
      'DT55GG66GGG77GG88TDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDDDDDD',
    ],
    shops: [
      { id:'s1', col:2,  row:1, colorIdx:1, label:'SUTERA',    npcName:'RATU SIMA',  npcEmoji:'👑', npcSub:'Saudagar Sutera',  itemCount:2 },
      { id:'s2', col:6,  row:1, colorIdx:0, label:'REMPAH',    npcName:'PAK JABIR',  npcEmoji:'🧔', npcSub:'Saudagar Rempah',  itemCount:2 },
      { id:'s3', col:11, row:1, colorIdx:4, label:'KERAJINAN', npcName:'BU CITRA',   npcEmoji:'👩‍🎨', npcSub:'Perajin Palopo', itemCount:1 },
      { id:'s4', col:2,  row:6, colorIdx:2, label:'KOPI',      npcName:'PAK LATIF',  npcEmoji:'☕', npcSub:'Petani Kopi',      itemCount:2 },
      { id:'s5', col:6,  row:6, colorIdx:5, label:'MADU',      npcName:'NENEK SARI', npcEmoji:'🍯', npcSub:'Penjual Madu',     itemCount:1 },
      { id:'s6', col:11, row:6, colorIdx:3, label:'EMAS',      npcName:'HAJI AMIR',  npcEmoji:'💰', npcSub:'Saudagar Emas',    itemCount:2 },
    ],
    playerStart: { col:9,  row:4 },
    aiStart:     { col:10, row:4 },
  },
];

// ══════════════════════════════════════
//   PARSE MAP STRING → 2D ARRAY
// ══════════════════════════════════════
function parseMapData(mapDef) {
  const grid      = [];
  const shopCells = {};

  const charMap = {
    'G': T.GRASS, 'D': T.DARK,  'P': T.PATH,
    'H': T.PATH_H,'V': T.PATH_V,'W': T.WATER,
    'S': T.SAND,  'T': T.TREE,  'F': T.FLOWER,
  };

  mapDef.data.forEach((rowStr, r) => {
    grid[r] = [];
    let c    = 0;
    let i    = 0;

    while (i < rowStr.length && c < mapDef.cols) {
      const ch = rowStr[i];

      if (ch >= '1' && ch <= '8') {
        const shopIdx = parseInt(ch) - 1;
        const shop    = mapDef.shops[shopIdx];
        grid[r][c]    = T.SHOP;

      // ── FIX: hanya tile kiri-atas toko yang masuk shopCells ──
      if (shop && c === shop.col && r === shop.row) {
        shopCells[`${c},${r}`] = shop;
        // Tambah juga tile sekitarnya untuk deteksi proximity
        for (let dr = 0; dr <= 1; dr++) {
          for (let dc = 0; dc <= 1; dc++) {
            shopCells[`${c+dc},${r+dr}`] = shop;
          }
        }
      }

        c++; i++;
      }

    // Pad baris yang kurang
    while (grid[r].length < mapDef.cols) grid[r].push(T.DARK);
  });

  // Collision
  const collision = grid.map(row =>
    row.map(t => t !== T.TREE && t !== T.WALL && t !== T.WATER)
  );

  return { grid, collision, shopCells };
}

// ══════════════════════════════════════
//   DRAW SATU TILE KE CANVAS
// ══════════════════════════════════════
function drawTile(ctx, tileId, px, py, shopColorIdx = 0, frame = 0) {
  const s  = TILE_SIZE * SCALE;
  const ts = TILE_SIZE;

  ctx.save();
  ctx.translate(px, py);

  switch (tileId) {

    case T.GRASS:
    case T.DARK: {
      const p = TILE_PALETTE[tileId];
      ctx.fillStyle = p.base;
      ctx.fillRect(0, 0, s, s);
      // Noise detail
      ctx.fillStyle = p.shade;
      ctx.fillRect(4, 6, 4, 4);
      ctx.fillRect(s-10, s-8, 3, 3);
      ctx.fillStyle = p.hi;
      ctx.fillRect(s-6, 4, 3, 3);
      break;
    }

    case T.FLOWER: {
      // Grass dengan bunga
      ctx.fillStyle = '#3a8c1e';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#ff6090';
      ctx.fillRect(6, 8, 6, 6);
      ctx.fillStyle = '#ffff60';
      ctx.fillRect(9, 11, 3, 3);
      ctx.fillStyle = '#ff90b0';
      ctx.fillRect(s-14, s-16, 6, 6);
      ctx.fillStyle = '#ffff60';
      ctx.fillRect(s-11, s-13, 3, 3);
      break;
    }

    case T.PATH:
    case T.PATH_H:
    case T.PATH_V: {
      // Jalan coklat hangat
      ctx.fillStyle = '#b08030';
      ctx.fillRect(0, 0, s, s);
      // Highlight atas
      ctx.fillStyle = '#c89040';
      ctx.fillRect(0, 0, s, 4);
      // Shadow bawah
      ctx.fillStyle = '#8a6018';
      ctx.fillRect(0, s-4, s, 4);
      // Border tepi
      if (tileId === T.PATH_H) {
        ctx.fillStyle = '#6a4010';
        ctx.fillRect(0, 0, s, 4);
        ctx.fillRect(0, s-4, s, 4);
      } else if (tileId === T.PATH_V) {
        ctx.fillStyle = '#6a4010';
        ctx.fillRect(0, 0, 4, s);
        ctx.fillRect(s-4, 0, 4, s);
      }
      // Batu kerikil
      ctx.fillStyle = '#a07028';
      ctx.fillRect(s/2-3, s/2-3, 6, 6);
      ctx.fillRect(8, s-10, 4, 4);
      ctx.fillRect(s-12, 6, 4, 4);
      break;
    }

    case T.WATER: {
      // Animasi air
      const waveOff = (frame * 0.5) % s;
      ctx.fillStyle = '#1868b0';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#2888d0';
      for (let wx = -s + waveOff; wx < s; wx += 12) {
        ctx.fillRect(wx, s*0.3, 8, 3);
        ctx.fillRect(wx + 6, s*0.6, 8, 3);
      }
      ctx.fillStyle = '#4aa8e8';
      ctx.fillRect(4, 6, 6, 2);
      ctx.fillRect(s-10, s-10, 6, 2);
      break;
    }

    case T.SAND: {
      ctx.fillStyle = '#d0a040';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#b08020';
      ctx.fillRect(6, 8, 3, 3);
      ctx.fillRect(s-9, s-10, 3, 3);
      ctx.fillStyle = '#e0b850';
      ctx.fillRect(s-7, 6, 3, 3);
      break;
    }

    case T.TREE: {
      // Rumput gelap
      ctx.fillStyle = '#1e5c0c';
      ctx.fillRect(0, 0, s, s);
      // Batang pohon
      ctx.fillStyle = '#6b3a10';
      ctx.fillRect(s/2-4, s/2, 8, s/2);
      // Daun
      const leafColors = ['#2a8c10','#3aac18','#1e6c08','#48cc20'];
      ctx.fillStyle = leafColors[0];
      ctx.fillRect(s/2-14, s/2-8, 28, 22);
      ctx.fillStyle = leafColors[1];
      ctx.fillRect(s/2-10, s/2-16, 20, 14);
      ctx.fillStyle = leafColors[2];
      ctx.fillRect(s/2-8, s/2-4, 16, 18);
      ctx.fillStyle = leafColors[3];
      ctx.fillRect(s/2-6, s/2-12, 12, 10);
      // Top pixel
      ctx.fillStyle = '#4acc18';
      ctx.fillRect(s/2-3, s/2-18, 6, 4);
      break;
    }

    case T.SHOP: {
      drawShopTile(ctx, shopColorIdx, s);
      break;
    }

    case T.WALL: {
      ctx.fillStyle = '#3a3a58';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#282838';
      for (let bx = 0; bx < s; bx += 12) ctx.fillRect(bx, 0, 1, s);
      for (let by = 0; by < s; by += 12) ctx.fillRect(0, by, s, 1);
      ctx.fillStyle = '#4a4a68';
      ctx.fillRect(0, 0, s, 3);
      break;
    }
  }

  ctx.restore();
}

// ── Draw bangunan toko (2×2 tile, dipanggil di tile kiri-atas) ──
function drawShopTile(ctx, colorIdx, s) {
  const c = SHOP_COLORS[colorIdx % SHOP_COLORS.length];

  // Dinding
  ctx.fillStyle = c.wall;
  ctx.fillRect(0, 0, s, s);

  // Highlight dinding atas
  ctx.fillStyle = lighten(c.wall, 40);
  ctx.fillRect(0, 0, s, 4);

  // Shadow bawah
  ctx.fillStyle = darken(c.wall, 40);
  ctx.fillRect(0, s-4, s, 4);

  // Bata pattern
  ctx.fillStyle = darken(c.wall, 20);
  for (let bx = 0; bx < s; bx += 12) ctx.fillRect(bx, 0, 1, s);
  for (let by = 0; by < s; by += 8)  ctx.fillRect(0, by, s, 1);

  // Atap strip
  ctx.fillStyle = c.roof;
  ctx.fillRect(0, 0, s, 10);
  ctx.fillStyle = lighten(c.roof, 30);
  ctx.fillRect(0, 0, s, 3);

  // Jendela
  ctx.fillStyle = c.window;
  ctx.fillRect(4, 14, 10, 8);
  ctx.fillRect(s-14, 14, 10, 8);
  // Bingkai jendela
  ctx.fillStyle = darken(c.wall, 30);
  ctx.fillRect(3, 13, 12, 1);
  ctx.fillRect(3, 22, 12, 1);
  ctx.fillRect(3, 13, 1, 10);
  ctx.fillRect(14, 13, 1, 10);
  ctx.fillRect(s-15, 13, 12, 1);
  ctx.fillRect(s-15, 22, 12, 1);
  ctx.fillRect(s-15, 13, 1, 10);
  ctx.fillRect(s-4, 13, 1, 10);

  // Pintu (tengah bawah)
  ctx.fillStyle = c.door;
  ctx.fillRect(s/2-6, s-18, 12, 18);
  ctx.fillStyle = lighten(c.door, 20);
  ctx.fillRect(s/2-5, s-17, 5, 16);
  // Gagang pintu
  ctx.fillStyle = c.roof;
  ctx.fillRect(s/2+2, s-10, 3, 3);

  // Border luar
  ctx.strokeStyle = c.roof;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, s-2, s-2);
}

// ══════════════════════════════════════
//   HELPER WARNA
// ══════════════════════════════════════
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => Math.min(255,Math.max(0,v))
    .toString(16).padStart(2,'0')).join('');
}

function lighten(hex, amt) {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(r+amt, g+amt, b+amt);
}

function darken(hex, amt) {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(r-amt, g-amt, b-amt);
}

// ══════════════════════════════════════
//   GET SHOP DI DEKAT POSISI
// ══════════════════════════════════════
function getNearbyShop(col, row, shopCells, radius = 2) {
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const key = `${col+dc},${row+dr}`;
      if (shopCells[key]) return shopCells[key];
    }
  }
  return null;
}

function isWalkable(collision, col, row) {
  if (!collision || row < 0 || col < 0) return false;
  if (row >= collision.length) return false;
  if (col >= (collision[row]?.length ?? 0)) return false;
  return !!collision[row][col];
}