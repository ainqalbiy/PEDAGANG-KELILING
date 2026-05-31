/* Save/Load via LocalStorage */
const SaveSystem = {
  KEY: 'pedagang_keliling_save_v1',
  defaultState() {
    return {
      money: 200,
      xp: 0,
      level: 0, // index in CONST.LEVELS
      currentCity: 'mawar',
      vehicleId: 'walk',
      ownedVehicles: ['walk'],
      unlockedCities: ['mawar', 'pasar', 'melati', 'anggrek', 'sawah', 'biru', 'pinus', 'cendrawasih'],
      missionsCompleted: 0,
      streak: 0,
      algoUsage: { astar: 0, dijkstra: 0, greedy: 0 },
      achievements: [],
      missions: null, // generated on first map load
      stats: { totalEarned: 200, totalDistance: 0 },
      seenIntro: false,
      day: 1
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultState();
      const data = JSON.parse(raw);
      return { ...this.defaultState(), ...data };
    } catch (e) { return this.defaultState(); }
  },
  save(state) {
    try { localStorage.setItem(this.KEY, JSON.stringify(state)); return true; }
    catch (e) { return false; }
  },
  reset() { localStorage.removeItem(this.KEY); }
};