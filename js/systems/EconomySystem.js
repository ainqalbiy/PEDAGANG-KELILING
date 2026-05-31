/* Economy & leveling */
const Economy = {
  addMoney(state, amount) { state.money += amount; state.stats.totalEarned += amount; },
  spend(state, amount) {
    if (state.money < amount) return false;
    state.money -= amount;
    return true;
  },
  addXP(state, amount) {
    state.xp += amount;
    while (state.level < CONST.LEVELS.length - 1 && state.xp >= CONST.LEVELS[state.level + 1].xpReq) {
      state.level++;
      // unlock new cities by level threshold
      if (state.level >= 1 && !state.unlockedCities.includes('teh')) state.unlockedCities.push('teh');
      if (state.level >= 2 && !state.unlockedCities.includes('kotamawar')) state.unlockedCities.push('kotamawar');
      if (state.level >= 2 && !state.unlockedCities.includes('emas')) state.unlockedCities.push('emas');
      if (state.level >= 3 && !state.unlockedCities.includes('perak')) state.unlockedCities.push('perak');
      if (state.level >= 3 && !state.unlockedCities.includes('selatan')) state.unlockedCities.push('selatan');
      if (state.level >= 4 && !state.unlockedCities.includes('legenda')) state.unlockedCities.push('legenda');
    }
  },
  levelName(state) { return CONST.LEVELS[state.level].name; }
};