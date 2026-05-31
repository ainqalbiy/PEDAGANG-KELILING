/* Mission system - generation, completion */
const MissionSystem = {
  ensureMissions(state) {
    if (!state.missions || !Array.isArray(state.missions) || state.missions.length === 0) {
      state.missions = generateMissions(state.level, state.unlockedCities, 5);
    }
  },
  refresh(state) {
    state.missions = generateMissions(state.level, state.unlockedCities, 5);
    state.day = (state.day || 1) + 1;
  },
  complete(state, mission, result) {
    // result: {cost, algo, pathLen}
    const vehicle = getVehicle(state.vehicleId);
    const opCost = Math.round(result.cost * (vehicle.op || 0) * 0.05);
    const pay = Math.round(mission.pay * vehicle.cap) - opCost;
    Economy.addMoney(state, pay);
    Economy.addXP(state, mission.xp);
    state.missionsCompleted++;
    state.streak++;
    state.algoUsage[result.algo] = (state.algoUsage[result.algo] || 0) + 1;
    state.stats.totalDistance += Math.round(result.cost);
    state.currentCity = mission.to;
    // remove mission
    state.missions = state.missions.filter(m => m.id !== mission.id);
    return { netPay: Math.max(0, pay), opCost };
  }
};
