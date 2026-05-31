/* Mission templates - generated dynamically each day */
const MISSION_TEMPLATES = [
  { item: 'Beras',          icon: '🌾', basePay: 80,  baseXp: 30, urgency: 'normal', minLevel: 0 },
  { item: 'Buah Mangga',    icon: '🥭', basePay: 110, baseXp: 35, urgency: 'normal', minLevel: 0 },
  { item: 'Ikan Segar',     icon: '🐟', basePay: 140, baseXp: 45, urgency: 'cepat',  minLevel: 0 },
  { item: 'Sayuran',        icon: '🥬', basePay: 90,  baseXp: 30, urgency: 'normal', minLevel: 0 },
  { item: 'Obat Herbal',    icon: '🌿', basePay: 180, baseXp: 55, urgency: 'darurat', minLevel: 1 },
  { item: 'Kain Sutra',     icon: '🧵', basePay: 220, baseXp: 60, urgency: 'normal', minLevel: 1 },
  { item: 'Teh Premium',    icon: '🍵', basePay: 200, baseXp: 60, urgency: 'normal', minLevel: 2 },
  { item: 'Emas Murni',     icon: '🪙', basePay: 400, baseXp: 100, urgency: 'darurat', minLevel: 2 },
  { item: 'Perhiasan Perak',icon: '💎', basePay: 380, baseXp: 95, urgency: 'normal', minLevel: 3 },
  { item: 'Artefak Langka', icon: '🏺', basePay: 550, baseXp: 140, urgency: 'darurat', minLevel: 3 }
];

const URGENCY_INFO = {
  normal:  { mult: 1.0, label: 'Normal',  color: '#5fd66e' },
  cepat:   { mult: 1.3, label: 'Cepat',   color: '#ffd966' },
  darurat: { mult: 1.6, label: 'Darurat', color: '#ff5b6e' }
};

function generateMissions(playerLevel, unlockedCityIds, count = 5) {
  const unlocked = unlockedCityIds || CITIES.filter(c => c.unlocked).map(c => c.id);
  const missions = [];
  for (let i = 0; i < count; i++) {
    const avail = MISSION_TEMPLATES.filter(t => t.minLevel <= playerLevel);
    const t = H.choice(avail);
    let from, to;
    do {
      from = H.choice(unlocked);
      to = H.choice(unlocked);
    } while (from === to);
    const um = URGENCY_INFO[t.urgency].mult;
    missions.push({
      id: 'm_' + Date.now() + '_' + i,
      item: t.item, icon: t.icon,
      from, to,
      pay: Math.round(t.basePay * um * (0.9 + Math.random() * 0.3)),
      xp: Math.round(t.baseXp * um),
      urgency: t.urgency
    });
  }
  return missions;
}