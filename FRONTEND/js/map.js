// ========== KONSTANTA TILE ========== //
const TILE = {
  GRASS:      'grass',
  GRASS_DARK: 'grass-dark',
  PATH:       'path',
  PATH_H:     'path-h',
  PATH_V:     'path-v',
  WALL:       'wall',
  WATER:      'water',
  SAND:       'sand',
  FLOOR:      'floor',
  TREE:       'tree',
  SHOP:       'shop',
  BUILDING:   'building',
  DECO:       'decoration',
};

const TILE_SIZE = 48;

// Warna unik per toko (index 0 = shop ke-1)
const SHOP_COLORS = [
  'shop-color-1', // Oranye — Rempah
  'shop-color-2', // Biru   — Kain
  'shop-color-3', // Hijau  — Pangan
  'shop-color-4', // Ungu   — Minyak
  'shop-color-5', // Teal   — Ikan / Kerajinan
  'shop-color-6', // Emas   — Madu / Emas
];

// Emoji NPC per toko (bervariasi tiap peta)
const NPC_EMOJIS = [
  '🧑‍🌾', '👩‍🌾', '🧓', '👵', '🧔', '👸',
  '🧙', '👨', '👩', '🧑‍🦱', '☕', '💰',
];

// ========== DEFINISI 5 PETA ========== //
const MAPS = [
  // ── PETA 0: Pasar Makassar ──
  {
    name: 'Pasar Makassar',
    cols: 14,
    rows: 9,
    bgColor: '#1a3d0a',
    grid: [
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
      'GD,TR,G ,G ,G ,G ,G ,G ,G ,G ,G ,TR,GD,GD',
      'GD,G ,S1,S1,PH,PH,PH,PH,PH,S2,S2,G ,GD,GD',
      'GD,G ,S1,S1,PH,PH,PH,PH,PH,S2,S2,G ,GD,GD',
      'GD,G ,PV,PV,P ,P ,P ,P ,P ,PV,PV,G ,TR,GD',
      'GD,G ,PV,PV,P ,P ,P ,P ,P ,PV,PV,G ,G ,GD',
      'GD,G ,S3,S3,PH,PH,PH,PH,PH,S4,S4,G ,GD,GD',
      'GD,TR,S3,S3,PH,PH,PH,PH,PH,S4,S4,TR,GD,GD',
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
    ],
    shops: [
      { id: 'shop1', col: 2, row: 2, label: 'REMPAH',  npcName: 'Pak Hasan',  npcAvatar: '🧑‍🌾', npcSub: 'Pedagang Rempah', itemCount: 2, colorIdx: 0, npcEmoji: '🧑‍🌾' },
      { id: 'shop2', col: 9, row: 2, label: 'KAIN',    npcName: 'Bu Sari',    npcAvatar: '👩‍🌾', npcSub: 'Pedagang Kain',   itemCount: 2, colorIdx: 1, npcEmoji: '👩‍🌾' },
      { id: 'shop3', col: 2, row: 6, label: 'PANGAN',  npcName: 'Pak Budi',   npcAvatar: '🧓',   npcSub: 'Pedagang Pangan', itemCount: 2, colorIdx: 2, npcEmoji: '🧓'   },
      { id: 'shop4', col: 9, row: 6, label: 'MINYAK',  npcName: 'Bu Ani',     npcAvatar: '👵',   npcSub: 'Pedagang Minyak', itemCount: 2, colorIdx: 3, npcEmoji: '👵'   },
    ],
    playerStart: { col: 6, row: 4 },
    aiStart:     { col: 7, row: 4 },
  },

  // ── PETA 1: Pelabuhan Pare-Pare ──
  {
    name: 'Pelabuhan Pare-Pare',
    cols: 14,
    rows: 9,
    bgColor: '#0a1a2e',
    grid: [
      'W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ',
      'W ,SN,SN,SN,PH,PH,PH,PH,PH,SN,SN,SN,W ,W ',
      'W ,SN,S1,S1,PH,PH,PH,PH,PH,S2,S2,SN,W ,W ',
      'W ,SN,S1,S1,PH,PH,PH,PH,PH,S2,S2,SN,W ,W ',
      'W ,SN,PV,PV,P ,P ,P ,P ,P ,PV,PV,SN,W ,W ',
      'W ,SN,PV,PV,P ,P ,P ,P ,P ,PV,PV,SN,W ,W ',
      'W ,SN,S3,S3,PH,PH,PH,PH,PH,S4,S4,SN,W ,W ',
      'W ,SN,S3,S3,PH,PH,PH,PH,PH,S4,S4,SN,W ,W ',
      'W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ',
    ],
    shops: [
      { id: 'shop1', col: 2, row: 2, label: 'IKAN',    npcName: 'Bang Ali',   npcAvatar: '🧑‍🦱', npcSub: 'Nelayan Lokal',  itemCount: 2, colorIdx: 4, npcEmoji: '🧑‍🦱' },
      { id: 'shop2', col: 9, row: 2, label: 'REMPAH',  npcName: 'Pak Daud',   npcAvatar: '🧔',   npcSub: 'Pedagang Rempah', itemCount: 2, colorIdx: 0, npcEmoji: '🧔'  },
      { id: 'shop3', col: 2, row: 6, label: 'KAIN',    npcName: 'Bu Fatima',  npcAvatar: '👩',   npcSub: 'Pedagang Kain',   itemCount: 2, colorIdx: 1, npcEmoji: '👩'   },
      { id: 'shop4', col: 9, row: 6, label: 'MADU',    npcName: 'Pak Rauf',   npcAvatar: '🧓',   npcSub: 'Penjual Madu',    itemCount: 2, colorIdx: 5, npcEmoji: '🧓'   },
    ],
    playerStart: { col: 6, row: 4 },
    aiStart:     { col: 7, row: 4 },
  },

  // ── PETA 2: Pekan Toraja ──
  {
    name: 'Pekan Toraja',
    cols: 16,
    rows: 10,
    bgColor: '#1a0e04',
    grid: [
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
      'GD,TR,G ,G ,S1,S1,PH,S2,S2,PH,S3,S3,G ,TR,GD,GD',
      'GD,G ,G ,G ,S1,S1,PH,S2,S2,PH,S3,S3,G ,G ,GD,GD',
      'GD,G ,G ,G ,PV,PV,P ,PV,PV,P ,PV,PV,G ,G ,GD,GD',
      'GD,TR,G ,G ,PV,PV,P ,PV,PV,P ,PV,PV,G ,TR,GD,GD',
      'GD,G ,G ,G ,PV,PV,P ,PV,PV,P ,PV,PV,G ,G ,GD,GD',
      'GD,G ,G ,G ,S4,S4,PH,S5,S5,PH,S6,S6,G ,G ,GD,GD',
      'GD,TR,G ,G ,S4,S4,PH,S5,S5,PH,S6,S6,G ,TR,GD,GD',
      'GD,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,GD,GD',
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
    ],
    shops: [
      { id: 'shop1', col: 4,  row: 1, label: 'KERAJINAN', npcName: 'Nenek Tiku', npcAvatar: '👵', npcSub: 'Pengrajin Toraja', itemCount: 1, colorIdx: 4, npcEmoji: '👵' },
      { id: 'shop2', col: 7,  row: 1, label: 'KOPI',      npcName: 'Pak Rante',  npcAvatar: '🧓', npcSub: 'Petani Kopi',      itemCount: 2, colorIdx: 2, npcEmoji: '🧓' },
      { id: 'shop3', col: 10, row: 1, label: 'BAMBU',     npcName: 'Bu Sarce',   npcAvatar: '👩', npcSub: 'Pengrajin Bambu',  itemCount: 1, colorIdx: 3, npcEmoji: '👩' },
      { id: 'shop4', col: 4,  row: 6, label: 'HERBAL',    npcName: 'Datu Lolo',  npcAvatar: '🧙', npcSub: 'Tabib Toraja',     itemCount: 1, colorIdx: 0, npcEmoji: '🧙' },
      { id: 'shop5', col: 7,  row: 6, label: 'TENUN',     npcName: 'Ibu Ratna',  npcAvatar: '👩‍🦳', npcSub: 'Penenun Toraja', itemCount: 2, colorIdx: 1, npcEmoji: '👩‍🦳' },
      { id: 'shop6', col: 10, row: 6, label: 'MADU',      npcName: 'Pak Yosef',  npcAvatar: '🧔', npcSub: 'Peternak Lebah',   itemCount: 1, colorIdx: 5, npcEmoji: '🧔' },
    ],
    playerStart: { col: 7,  row: 4 },
    aiStart:     { col: 8,  row: 4 },
  },

  // ── PETA 3: Pasar Bone ──
  {
    name: 'Pasar Bone',
    cols: 14,
    rows: 9,
    bgColor: '#040e1a',
    grid: [
      'G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ',
      'G ,TR,G ,S1,S1,PH,PH,PH,S2,S2,G ,TR,G ,G ',
      'G ,G ,G ,S1,S1,PH,PH,PH,S2,S2,G ,G ,G ,G ',
      'G ,G ,G ,PV,PV,P ,P ,P ,PV,PV,G ,G ,G ,G ',
      'G ,TR,G ,PV,PV,P ,P ,P ,PV,PV,G ,TR,G ,G ',
      'G ,G ,G ,PV,PV,P ,P ,P ,PV,PV,G ,G ,G ,G ',
      'G ,G ,G ,S3,S3,PH,PH,PH,S4,S4,G ,G ,G ,G ',
      'G ,TR,G ,S3,S3,PH,PH,PH,S4,S4,G ,TR,G ,G ',
      'G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ',
    ],
    shops: [
      { id: 'shop1', col: 3, row: 1, label: 'SUTERA', npcName: 'Andi Mira',  npcAvatar: '👸', npcSub: 'Pedagang Sutera', itemCount: 2, colorIdx: 1, npcEmoji: '👸' },
      { id: 'shop2', col: 8, row: 1, label: 'BERAS',  npcName: 'Pak Umar',   npcAvatar: '👨', npcSub: 'Petani Bone',     itemCount: 2, colorIdx: 2, npcEmoji: '👨' },
      { id: 'shop3', col: 3, row: 6, label: 'EMAS',   npcName: 'Haji Saleh', npcAvatar: '🧔', npcSub: 'Pedagang Emas',   itemCount: 2, colorIdx: 5, npcEmoji: '🧔' },
      { id: 'shop4', col: 8, row: 6, label: 'MINYAK', npcName: 'Bu Rohani',  npcAvatar: '👩‍🦳', npcSub: 'Pedagang Minyak', itemCount: 2, colorIdx: 3, npcEmoji: '👩‍🦳' },
    ],
    playerStart: { col: 6, row: 4 },
    aiStart:     { col: 7, row: 4 },
  },

  // ── PETA 4: Pasar Palopo ──
  {
    name: 'Pasar Palopo',
    cols: 16,
    rows: 10,
    bgColor: '#0e0420',
    grid: [
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
      'GD,TR,G ,S1,S1,PH,PH,S2,S2,PH,PH,S3,S3,G ,TR,GD',
      'GD,G ,G ,S1,S1,PH,PH,S2,S2,PH,PH,S3,S3,G ,G ,GD',
      'GD,G ,G ,PV,PV,P ,P ,PV,PV,P ,P ,PV,PV,G ,G ,GD',
      'GD,TR,G ,PV,PV,P ,P ,PV,PV,P ,P ,PV,PV,G ,TR,GD',
      'GD,G ,G ,PV,PV,P ,P ,PV,PV,P ,P ,PV,PV,G ,G ,GD',
      'GD,G ,G ,S4,S4,PH,PH,S5,S5,PH,PH,S6,S6,G ,G ,GD',
      'GD,TR,G ,S4,S4,PH,PH,S5,S5,PH,PH,S6,S6,G ,TR,GD',
      'GD,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,GD',
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
    ],
    shops: [
      { id: 'shop1', col: 3,  row: 1, label: 'SUTERA',    npcName: 'Ratu Sima',  npcAvatar: '👑', npcSub: 'Saudagar Sutera',  itemCount: 2, colorIdx: 1, npcEmoji: '👑' },
      { id: 'shop2', col: 7,  row: 1, label: 'REMPAH',    npcName: 'Pak Jabir',  npcAvatar: '🧔', npcSub: 'Saudagar Rempah',  itemCount: 2, colorIdx: 0, npcEmoji: '🧔' },
      { id: 'shop3', col: 11, row: 1, label: 'KERAJINAN', npcName: 'Bu Citra',   npcAvatar: '👩‍🎨', npcSub: 'Perajin Palopo', itemCount: 1, colorIdx: 4, npcEmoji: '👩‍🎨' },
      { id: 'shop4', col: 3,  row: 6, label: 'KOPI',      npcName: 'Pak Latif',  npcAvatar: '☕', npcSub: 'Petani Kopi',      itemCount: 2, colorIdx: 2, npcEmoji: '☕' },
      { id: 'shop5', col: 7,  row: 6, label: 'MADU',      npcName: 'Nenek Sari', npcAvatar: '🍯', npcSub: 'Penjual Madu',     itemCount: 1, colorIdx: 5, npcEmoji: '🍯' },
      { id: 'shop6', col: 11, row: 6, label: 'EMAS',      npcName: 'Haji Amir',  npcAvatar: '💰', npcSub: 'Saudagar Emas',    itemCount: 2, colorIdx: 3, npcEmoji: '💰' },
    ],
    playerStart: { col: 7,  row: 4 },
    aiStart:     { col: 8,  row: 4 },
  },
];

// ========== DECODE TILE ========== //
function decodeTile(code) {
  const map = {
    'G ' : TILE.GRASS,
    'GD' : TILE.GRASS_DARK,
    'P ' : TILE.PATH,
    'PH' : TILE.PATH_H,
    'PV' : TILE.PATH_V,
    'W ' : TILE.WATER,
    'SN' : TILE.SAND,
    'FL' : TILE.FLOOR,
    'TR' : TILE.TREE,
    'S1' : TILE.SHOP,
    'S2' : TILE.SHOP,
    'S3' : TILE.SHOP,
    'S4' : TILE.SHOP,
    'S5' : TILE.SHOP,
    'S6' : TILE.SHOP,
    'BL' : TILE.BUILDING,
    'DC' : TILE.DECO,
  };
  return map[code.trim()] || TILE.GRASS;
}

// ========== COLLISION MAP ========== //
function buildCollisionMap(mapData) {
  const collision = [];
  mapData.grid.forEach((rowStr, r) => {
    collision[r] = [];
    rowStr.split(',').forEach((code, c) => {
      const t = code.trim();
      collision[r][c] = !['TR', 'W ', 'BL'].includes(t);
    });
  });
  return collision;
}

// ========== SHOP MAP ========== //
function buildShopMap(mapData) {
  const shopMap = {};
  mapData.grid.forEach((rowStr, r) => {
    rowStr.split(',').forEach((code, c) => {
      const t = code.trim();
      if (['S1','S2','S3','S4','S5','S6'].includes(t)) {
        const idx  = parseInt(t[1]) - 1;
        const shop = mapData.shops[idx];
        if (shop) shopMap[`${c},${r}`] = shop;
      }
    });
  });
  return shopMap;
}

// ========== RENDER MAP ========== //
function renderMap(mapIndex) {
  const mapData   = MAPS[mapIndex];
  const container = document.getElementById('tile-map');

  // Set grid CSS
  container.style.gridTemplateColumns = `repeat(${mapData.cols}, ${TILE_SIZE}px)`;
  container.style.gridTemplateRows    = `repeat(${mapData.rows}, ${TILE_SIZE}px)`;
  container.style.width  = `${mapData.cols * TILE_SIZE}px`;
  container.style.height = `${mapData.rows * TILE_SIZE}px`;

  document.getElementById('map-container').style.background = mapData.bgColor;

  container.innerHTML = '';

  // Set untuk track tile mana yang sudah dapat label
  const shopLabelSet = new Set();

  mapData.grid.forEach((rowStr, r) => {
    rowStr.split(',').forEach((code, c) => {
      const trimmed  = code.trim();
      const tileType = decodeTile(trimmed);
      const el       = document.createElement('div');
      el.className   = `tile tile-${tileType}`;
      el.dataset.col  = c;
      el.dataset.row  = r;
      el.dataset.code = trimmed;

      // ── Pohon ──
      if (tileType === TILE.TREE) {
        const trees = ['🌳','🌲','🌴','🎋'];
        el.textContent = trees[Math.floor(Math.random() * trees.length)];
      }

      // ── Toko ──
      if (['S1','S2','S3','S4','S5','S6'].includes(trimmed)) {
        const shopIdx = parseInt(trimmed[1]) - 1;
        const shop    = mapData.shops[shopIdx];

        if (shop) {
          // Warna unik per toko
          el.classList.add(SHOP_COLORS[shop.colorIdx] || 'shop-color-1');
          el.classList.add('active-shop');
          el.id = `shop-tile-${shop.id}-${c}-${r}`;

          // Label + NPC hanya di tile pojok kiri atas toko
          const labelKey = shop.id;
          if (!shopLabelSet.has(labelKey) && c === shop.col && r === shop.row) {
            shopLabelSet.add(labelKey);

            // Papan nama
            const label = document.createElement('div');
            label.className   = 'tile-label';
            label.textContent = shop.label;
            el.appendChild(label);

            // NPC emoji
            const npc = document.createElement('div');
            npc.className   = 'tile-npc-indicator';
            npc.id          = `npc-indicator-${shop.id}`;
            npc.textContent = shop.npcEmoji || '🧑‍🌾';
            el.appendChild(npc);
          }
        }
      }

      container.appendChild(el);
    });
  });

  return {
    mapData,
    collision: buildCollisionMap(mapData),
    shopMap:   buildShopMap(mapData),
  };
}

// ========== HELPER FUNCTIONS ========== //
function isWalkable(collision, col, row, mapData) {
  if (row < 0 || row >= mapData.rows) return false;
  if (col < 0 || col >= mapData.cols) return false;
  return !!collision[row]?.[col];
}

function tileToPixel(col, row) {
  return { x: col * TILE_SIZE, y: row * TILE_SIZE };
}

function pixelToTile(x, y) {
  return {
    col: Math.floor(x / TILE_SIZE),
    row: Math.floor(y / TILE_SIZE),
  };
}

function getNearbyShop(playerCol, playerRow, shopMap) {
  const dirs = [
    [0,0],[1,0],[-1,0],[0,1],[0,-1],
    [1,1],[-1,1],[1,-1],[-1,-1],
    [2,0],[-2,0],[0,2],[0,-2],
  ];
  for (const [dc, dr] of dirs) {
    const key = `${playerCol+dc},${playerRow+dr}`;
    if (shopMap[key]) return shopMap[key];
  }
  return null;
}