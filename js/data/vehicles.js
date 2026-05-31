/* Vehicles - purchased via shop. Capacity is bonus pay multiplier. */
const VEHICLES = [
  { id: 'walk',  name: 'Jalan Kaki',     icon: '🚶', speed: 1.0, cost: 0,     cap: 1.0, op: 0,  level: 0, unlocked: true,  desc: 'Perlahan tapi gratis.' },
  { id: 'bike',  name: 'Sepeda',        icon: '🚲', speed: 1.6, cost: 250,   cap: 1.1, op: 2,  level: 0, unlocked: false, desc: 'Lebih cepat untuk kota dekat.' },
  { id: 'cart',  name: 'Gerobak',       icon: '🛒', speed: 1.4, cost: 600,   cap: 1.4, op: 5,  level: 1, unlocked: false, desc: 'Bawa lebih banyak barang.' },
  { id: 'horse', name: 'Kuda',          icon: '🐎', speed: 2.2, cost: 1400,  cap: 1.3, op: 12, level: 2, unlocked: false, desc: 'Cepat & lincah di pedesaan.' },
  { id: 'ship',  name: 'Kapal',         icon: '⛵', speed: 1.8, cost: 2800,  cap: 2.0, op: 25, level: 3, unlocked: false, desc: 'Mengarungi pesisir & sungai.' },
  { id: 'truck', name: 'Truk Mini',     icon: '🚚', speed: 2.6, cost: 5500,  cap: 2.5, op: 40, level: 4, unlocked: false, desc: 'Logistik kelas profesional.' }
];

function getVehicle(id) { return VEHICLES.find(v => v.id === id); }