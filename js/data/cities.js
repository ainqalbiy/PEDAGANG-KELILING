/* Cities (graph nodes) and Edges. Coordinates in canvas pixels. */
const CITIES = [
  { id: 'mawar',      name: 'Desa Mawar',         x: 90,  y: 320, type: 'village', region: 'Lembah Selatan', unlocked: true },
  { id: 'pasar',      name: 'Pasar Tengah',       x: 240, y: 270, type: 'market',  region: 'Lembah Selatan', unlocked: true },
  { id: 'melati',     name: 'Kota Melati',        x: 380, y: 180, type: 'town',    region: 'Lembah Selatan', unlocked: true },
  { id: 'anggrek',    name: 'Desa Anggrek',       x: 200, y: 450, type: 'village', region: 'Lembah Selatan', unlocked: true },
  { id: 'sawah',      name: 'Sawah Hijau',        x: 360, y: 380, type: 'farm',    region: 'Lembah Tengah',  unlocked: true },
  { id: 'biru',       name: 'Pelabuhan Biru',     x: 460, y: 460, type: 'port',    region: 'Pesisir Barat',  unlocked: true },
  { id: 'pinus',      name: 'Hutan Pinus',        x: 540, y: 290, type: 'village', region: 'Hutan Utara',    unlocked: true },
  { id: 'cendrawasih',name: 'Kota Cendrawasih',   x: 560, y: 150, type: 'town',    region: 'Hutan Utara',    unlocked: true },
  { id: 'emas',       name: 'Gunung Emas',        x: 700, y: 90,  type: 'mine',    region: 'Pegunungan',     unlocked: false },
  { id: 'perak',      name: 'Tambang Perak',      x: 800, y: 200, type: 'mine',    region: 'Pegunungan',     unlocked: false },
  { id: 'teh',        name: 'Perkebunan Teh',     x: 540, y: 500, type: 'farm',    region: 'Lembah Timur',   unlocked: false },
  { id: 'kotamawar',  name: 'Kota Mawar Agung',   x: 760, y: 370, type: 'town',    region: 'Lembah Timur',   unlocked: false },
  { id: 'selatan',    name: 'Pelabuhan Selatan',  x: 700, y: 520, type: 'port',    region: 'Pesisir Timur',  unlocked: false },
  { id: 'legenda',    name: 'Kota Legenda',       x: 880, y: 310, type: 'capital', region: 'Ibukota',        unlocked: false }
];

/* Edges: {a, b, cost, terrain} - cost ~ km/distance with terrain modifiers
   terrain: 'jalan', 'rusak', 'pintas', 'macet', 'gunung', 'sungai' */
const EDGES = [
  { a: 'mawar', b: 'pasar', cost: 15, terrain: 'jalan' },
  { a: 'mawar', b: 'anggrek', cost: 18, terrain: 'jalan' },
  { a: 'pasar', b: 'melati', cost: 20, terrain: 'jalan' },
  { a: 'pasar', b: 'anggrek', cost: 17, terrain: 'rusak' },
  { a: 'pasar', b: 'sawah', cost: 14, terrain: 'pintas' },
  { a: 'anggrek', b: 'sawah', cost: 16, terrain: 'jalan' },
  { a: 'anggrek', b: 'biru', cost: 25, terrain: 'sungai' },
  { a: 'sawah', b: 'biru', cost: 18, terrain: 'jalan' },
  { a: 'sawah', b: 'pinus', cost: 22, terrain: 'jalan' },
  { a: 'melati', b: 'cendrawasih', cost: 19, terrain: 'jalan' },
  { a: 'melati', b: 'pinus', cost: 24, terrain: 'jalan' },
  { a: 'cendrawasih', b: 'pinus', cost: 14, terrain: 'pintas' },
  { a: 'cendrawasih', b: 'emas', cost: 18, terrain: 'gunung' },
  { a: 'emas', b: 'perak', cost: 12, terrain: 'gunung' },
  { a: 'pinus', b: 'perak', cost: 26, terrain: 'gunung' },
  { a: 'pinus', b: 'kotamawar', cost: 24, terrain: 'jalan' },
  { a: 'biru', b: 'kotamawar', cost: 33, terrain: 'macet' },
  { a: 'biru', b: 'teh', cost: 22, terrain: 'jalan' },
  { a: 'sawah', b: 'teh', cost: 28, terrain: 'rusak' },
  { a: 'teh', b: 'kotamawar', cost: 18, terrain: 'jalan' },
  { a: 'teh', b: 'selatan', cost: 14, terrain: 'jalan' },
  { a: 'kotamawar', b: 'selatan', cost: 17, terrain: 'macet' },
  { a: 'kotamawar', b: 'legenda', cost: 13, terrain: 'jalan' },
  { a: 'perak', b: 'legenda', cost: 14, terrain: 'gunung' }
];

const TERRAIN_INFO = {
  jalan:  { mult: 1.0,  label: 'Jalan Mulus',   color: '#c79a6b' },
  rusak:  { mult: 1.5,  label: 'Jalan Rusak',   color: '#8d6a44' },
  pintas: { mult: 0.8,  label: 'Jalan Pintas',  color: '#a8e85f' },
  macet:  { mult: 1.3,  label: 'Macet',         color: '#ff5b6e' },
  gunung: { mult: 1.6,  label: 'Pegunungan',    color: '#9e8b7a' },
  sungai: { mult: 1.4,  label: 'Sungai',        color: '#4ab8e6' }
};

function getCity(id) { return CITIES.find(c => c.id === id); }