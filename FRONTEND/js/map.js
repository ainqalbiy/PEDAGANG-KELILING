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

const TILE_SIZE = 48; // pixel per tile

// ========== DEFINISI 5 PETA PASAR ========== //
const MAPS = [
  // ── PETA 0: Pasar Makassar ──
  {
    name: 'Pasar Makassar',
    cols: 16,
    rows: 10,
    bgColor: '#1a2a1a',
    grid: [
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
      'GD,TR,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,TR,GD,GD',
      'GD,G ,S1,S1,PH,PH,PH,PH,PH,S2,S2,G ,G ,G ,GD,GD',
      'GD,G ,S1,S1,PH,PH,PH,PH,PH,S2,S2,G ,G ,G ,GD,GD',
      'GD,G ,PV,PV,P ,P ,P ,P ,P ,PV,PV,G ,G ,TR,GD,GD',
      'GD,G ,PV,PV,P ,P ,P ,P ,P ,PV,PV,G ,G ,G ,GD,GD',
      'GD,G ,S3,S3,PH,PH,PH,PH,PH,S4,S4,G ,G ,G ,GD,GD',
      'GD,G ,S3,S3,PH,PH,PH,PH,PH,S4,S4,G ,TR,G ,GD,GD',
      'GD,TR,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,GD,GD',
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
    ],
    // Posisi toko [col, row] dan NPC info
    shops: [
      { id: 'shop1', col: 2, row: 2, span: 2, label: 'REMPAH', npcName: 'Pak Hasan', npcAvatar: '🧑‍🌾', npcSub: 'Pedagang Rempah', itemCount: 2 },
      { id: 'shop2', col: 9, row: 2, span: 2, label: 'KAIN',   npcName: 'Bu Sari',   npcAvatar: '👩‍🌾', npcSub: 'Pedagang Kain',   itemCount: 2 },
      { id: 'shop3', col: 2, row: 6, span: 2, label: 'PANGAN', npcName: 'Pak Budi',  npcAvatar: '🧓',   npcSub: 'Pedagang Pangan', itemCount: 2 },
      { id: 'shop4', col: 9, row: 6, span: 2, label: 'MINYAK', npcName: 'Bu Ani',    npcAvatar: '👵',   npcSub: 'Pedagang Minyak', itemCount: 2 },
    ],
    playerStart: { col: 6, row: 4 },
    aiStart:     { col: 8, row: 4 },
  },

  // ── PETA 1: Pelabuhan Pare-Pare ──
  {
    name: 'Pelabuhan Pare-Pare',
    cols: 16,
    rows: 10,
    bgColor: '#1a1a2a',
    grid: [
      'W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ',
      'W ,SN,SN,SN,PH,PH,PH,PH,PH,PH,SN,SN,SN,W ,W ,W ',
      'W ,SN,S1,S1,PH,PH,PH,PH,PH,PH,S2,S2,SN,W ,W ,W ',
      'W ,SN,S1,S1,PH,PH,PH,PH,PH,PH,S2,S2,SN,W ,W ,W ',
      'W ,SN,PV,PV,P ,P ,P ,P ,P ,P ,PV,PV,SN,W ,W ,W ',
      'W ,SN,PV,PV,P ,P ,P ,P ,P ,P ,PV,PV,SN,W ,W ,W ',
      'W ,SN,S3,S3,PH,PH,PH,PH,PH,PH,S4,S4,SN,W ,W ,W ',
      'W ,SN,S3,S3,PH,PH,PH,PH,PH,PH,S4,S4,SN,W ,W ,W ',
      'W ,SN,SN,SN,PH,PH,PH,PH,PH,PH,SN,SN,SN,W ,W ,W ',
      'W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ,W ',
    ],
    shops: [
      { id: 'shop1', col: 2, row: 2, span: 2, label: 'IKAN',    npcName: 'Bang Ali',  npcAvatar: '🧑‍🦱', npcSub: 'Nelayan Lokal',  itemCount: 2 },
      { id: 'shop2', col: 10, row: 2, span: 2, label: 'REMPAH', npcName: 'Pak Daud',  npcAvatar: '🧔',   npcSub: 'Pedagang Rempah', itemCount: 2 },
      { id: 'shop3', col: 2, row: 6, span: 2, label: 'KAIN',   npcName: 'Bu Fatima', npcAvatar: '👩',   npcSub: 'Pedagang Kain',   itemCount: 2 },
      { id: 'shop4', col: 10, row: 6, span: 2, label: 'MADU',  npcName: 'Pak Rauf',  npcAvatar: '🧓',   npcSub: 'Penjual Madu',   itemCount: 2 },
    ],
    playerStart: { col: 6, row: 4 },
    aiStart:     { col: 8, row: 5 },
  },

  // ── PETA 2: Pekan Toraja ──
  {
    name: 'Pekan Toraja',
    cols: 16,
    rows: 10,
    bgColor: '#2a1a0a',
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
      { id: 'shop1', col: 4,  row: 1, span: 2, label: 'KERAJINAN', npcName: 'Nenek Tiku', npcAvatar: '👵', npcSub: 'Pengrajin Toraja', itemCount: 1 },
      { id: 'shop2', col: 7,  row: 1, span: 2, label: 'KOPI',      npcName: 'Pak Rante',  npcAvatar: '🧓', npcSub: 'Petani Kopi',     itemCount: 2 },
      { id: 'shop3', col: 10, row: 1, span: 2, label: 'BAMBU',     npcName: 'Bu Sarce',   npcAvatar: '👩', npcSub: 'Pengrajin Bambu', itemCount: 1 },
      { id: 'shop4', col: 4,  row: 6, span: 2, label: 'HERBAL',    npcName: 'Datu Lolo',  npcAvatar: '🧙', npcSub: 'Tabib Toraja',    itemCount: 1 },
      { id: 'shop5', col: 7,  row: 6, span: 2, label: 'TENUN',     npcName: 'Ibu Ratna',  npcAvatar: '👩‍🦳', npcSub: 'Penenun Toraja', itemCount: 2 },
      { id: 'shop6', col: 10, row: 6, span: 2, label: 'MADU',      npcName: 'Pak Yosef',  npcAvatar: '🧔', npcSub: 'Peternak Lebah', itemCount: 1 },
    ],
    playerStart: { col: 6, row: 3 },
    aiStart:     { col: 8, row: 3 },
  },

  // ── PETA 3: Pasar Bone ──
  {
    name: 'Pasar Bone',
    cols: 16,
    rows: 10,
    bgColor: '#0a1a2a',
    grid: [
      'G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ',
      'G ,TR,G ,S1,S1,PH,PH,PH,PH,S2,S2,G ,TR,G ,G ,G ',
      'G ,G ,G ,S1,S1,PH,PH,PH,PH,S2,S2,G ,G ,G ,G ,G ',
      'G ,G ,G ,PV,PV,P ,P ,P ,P ,PV,PV,G ,G ,G ,G ,G ',
      'G ,TR,G ,PV,PV,P ,P ,P ,P ,PV,PV,G ,TR,G ,G ,G ',
      'G ,G ,G ,PV,PV,P ,P ,P ,P ,PV,PV,G ,G ,G ,G ,G ',
      'G ,G ,G ,S3,S3,PH,PH,PH,PH,S4,S4,G ,G ,G ,G ,G ',
      'G ,TR,G ,S3,S3,PH,PH,PH,PH,S4,S4,G ,TR,G ,G ,G ',
      'G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ',
      'G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ',
    ],
    shops: [
      { id: 'shop1', col: 3, row: 1, span: 2, label: 'SUTERA', npcName: 'Andi Mira',  npcAvatar: '👸', npcSub: 'Pedagang Sutera', itemCount: 2 },
      { id: 'shop2', col: 9, row: 1, span: 2, label: 'BERAS',  npcName: 'Pak Umar',   npcAvatar: '👨', npcSub: 'Petani Bone',     itemCount: 2 },
      { id: 'shop3', col: 3, row: 6, span: 2, label: 'EMAS',   npcName: 'Haji Saleh', npcAvatar: '🧔', npcSub: 'Pedagang Emas',   itemCount: 2 },
      { id: 'shop4', col: 9, row: 6, span: 2, label: 'MINYAK', npcName: 'Bu Rohani',  npcAvatar: '👩‍🦳', npcSub: 'Pedagang Minyak', itemCount: 2 },
    ],
    playerStart: { col: 6, row: 4 },
    aiStart:     { col: 7, row: 4 },
  },

  // ── PETA 4: Pasar Palopo ──
  {
    name: 'Pasar Palopo',
    cols: 18,
    rows: 11,
    bgColor: '#1a0a2a',
    grid: [
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
      'GD,TR,G ,G ,S1,S1,PH,PH,PH,PH,S2,S2,PH,S3,S3,G ,TR,GD',
      'GD,G ,G ,G ,S1,S1,PH,PH,PH,PH,S2,S2,PH,S3,S3,G ,G ,GD',
      'GD,G ,G ,G ,PV,PV,P ,P ,P ,P ,PV,PV,P ,PV,PV,G ,G ,GD',
      'GD,TR,G ,G ,PV,PV,P ,P ,P ,P ,PV,PV,P ,PV,PV,G ,TR,GD',
      'GD,G ,G ,G ,PV,PV,P ,P ,P ,P ,PV,PV,P ,PV,PV,G ,G ,GD',
      'GD,G ,G ,G ,S4,S4,PH,PH,PH,PH,S5,S5,PH,S6,S6,G ,G ,GD',
      'GD,TR,G ,G ,S4,S4,PH,PH,PH,PH,S5,S5,PH,S6,S6,G ,TR,GD',
      'GD,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,GD',
      'GD,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,G ,GD',
      'GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD,GD',
    ],
    shops: [
      { id: 'shop1', col: 4,  row: 1, span: 2, label: 'SUTERA',    npcName: 'Ratu Sima',  npcAvatar: '👑', npcSub: 'Saudagar Sutera', itemCount: 2 },
      { id: 'shop2', col: 10, row: 1, span: 2, label: 'REMPAH',    npcName: 'Pak Jabir',  npcAvatar: '🧔', npcSub: 'Saudagar Rempah', itemCount: 2 },
      { id: 'shop3', col: 13, row: 1, span: 2, label: 'KERAJINAN', npcName: 'Bu Citra',   npcAvatar: '👩‍🎨', npcSub: 'Perajin Palopo', itemCount: 1 },
      { id: 'shop4', col: 4,  row: 6, span: 2, label: 'KOPI',      npcName: 'Pak Latif',  npcAvatar: '☕', npcSub: 'Petani Kopi',    itemCount: 2 },
      { id: 'shop5', col: 10, row: 6, span: 2, label: 'MADU',      npcName: 'Nenek Sari', npcAvatar: '🍯', npcSub: 'Penjual Madu',   itemCount: 1 },
      { id: 'shop6', col: 13, row: 6, span: 2, label: 'EMAS',      npcName: 'Haji Amir',  npcAvatar: '💰', npcSub: 'Saudagar Emas',  itemCount: 2 },
    ],
    playerStart: { col: 7,  row: 4 },
    aiStart:     { col: 9,  row: 4 },
  },
];

// ========== DECODE TILE CODE ========== //
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
// true = bisa dilewati, false = tidak bisa
function buildCollisionMap(mapData) {
  const collision = [];
  mapData.grid.forEach((rowStr, r) => {
    const cols = rowStr.split(',');
    collision[r] = [];
    cols.forEach((code, c) => {
      const t = code.trim();
      const walkable = !['TR', 'W ', 'BL'].includes(t);
      collision[r][c] = walkable;
    });
  });
  return collision;
}

// ========== SHOP COLLISION MAP ========== //
// Posisi tile yang merupakan toko (untuk deteksi interaksi)
function buildShopMap(mapData) {
  const shopMap = {};
  mapData.grid.forEach((rowStr, r) => {
    const cols = rowStr.split(',');
    cols.forEach((code, c) => {
      const t = code.trim();
      if (['S1','S2','S3','S4','S5','S6'].includes(t)) {
        const shopIdx = parseInt(t[1]) - 1;
        const shop = mapData.shops[shopIdx];
        if (shop) shopMap[`${c},${r}`] = shop;
      }
    });
  });
  return shopMap;
}

// ========== RENDER TILE MAP ========== //
function renderMap(mapIndex) {
  const mapData = MAPS[mapIndex];
  const container = document.getElementById('tile-map');

  container.style.gridTemplateColumns = `repeat(${mapData.cols}, ${TILE_SIZE}px)`;
  container.style.gridTemplateRows    = `repeat(${mapData.rows}, ${TILE_SIZE}px)`;
  container.style.width  = `${mapData.cols * TILE_SIZE}px`;
  container.style.height = `${mapData.rows * TILE_SIZE}px`;

  document.getElementById('map-container').style.background = mapData.bgColor;

  container.innerHTML = '';

  mapData.grid.forEach((rowStr, r) => {
    const cols = rowStr.split(',');
    cols.forEach((code, c) => {
      const tileType = decodeTile(code);
      const el = document.createElement('div');
      el.className = `tile tile-${tileType}`;
      el.dataset.col = c;
      el.dataset.row = r;
      el.dataset.code = code.trim();

      // Pohon — tambah emoji
      if (tileType === TILE.TREE) {
        el.textContent = ['🌳','🌲','🌴'][Math.floor(Math.random() * 3)];
      }

      // Toko — tambah label & indikator NPC
      const tCode = code.trim();
      if (['S1','S2','S3','S4','S5','S6'].includes(tCode)) {
        const shopIdx = parseInt(tCode[1]) - 1;
        const shop = mapData.shops[shopIdx];
        if (shop && shop.col === c && shop.row === r) {
          // Label toko hanya di tile pertama (kiri atas)
          const label = document.createElement('div');
          label.className = 'tile-label';
          label.textContent = shop.label;
          el.appendChild(label);

          const indicator = document.createElement('div');
          indicator.className = 'tile-npc-indicator';
          indicator.id = `npc-indicator-${shop.id}`;
          el.appendChild(indicator);
        }
        el.id = `shop-tile-${tCode}-${c}-${r}`;
        el.classList.add('active-shop');
        // Tambah class warna berdasarkan label toko
        if (shop) {
          const shopColorMap = {
            'REMPAH': 'shop-rempah', 'KAIN': 'shop-kain', 'PANGAN': 'shop-pangan',
            'MINYAK': 'shop-minyak', 'IKAN': 'shop-ikan', 'MADU': 'shop-madu',
            'KOPI': 'shop-kopi', 'BAMBU': 'shop-bambu', 'HERBAL': 'shop-herbal',
            'TENUN': 'shop-tenun', 'SUTERA': 'shop-sutera', 'BERAS': 'shop-beras',
            'EMAS': 'shop-emas', 'KERAJINAN': 'shop-kerajinan',
          };
          const colorClass = shopColorMap[shop.label];
          if (colorClass) el.classList.add(colorClass);
        }
      }

      container.appendChild(el);
    });
  });

  return {
    mapData,
    collision: buildCollisionMap(mapData),
    shopMap: buildShopMap(mapData),
  };
}

// ========== CEK APAKAH TILE BISA DILEWATI ========== //
function isWalkable(collision, col, row, mapData) {
  if (row < 0 || row >= mapData.rows) return false;
  if (col < 0 || col >= mapData.cols) return false;
  return collision[row][col];
}

// ========== KONVERSI POSISI TILE ↔ PIXEL ========== //
function tileToPixel(col, row) {
  return {
    x: col * TILE_SIZE,
    y: row * TILE_SIZE,
  };
}

function pixelToTile(x, y) {
  return {
    col: Math.floor(x / TILE_SIZE),
    row: Math.floor(y / TILE_SIZE),
  };
}

// ========== CEK APAKAH KARAKTER DEKAT TOKO ========== //
function getNearbyShop(playerCol, playerRow, shopMap) {
  // Cek 8 arah sekitar + posisi sendiri
  const directions = [
    [0,0],[1,0],[-1,0],[0,1],[0,-1],
    [1,1],[-1,1],[1,-1],[-1,-1]
  ];
  for (const [dc, dr] of directions) {
    const key = `${playerCol + dc},${playerRow + dr}`;
    if (shopMap[key]) return shopMap[key];
  }
  return null;
}