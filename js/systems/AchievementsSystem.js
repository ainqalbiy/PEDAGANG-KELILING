/* Achievement system */
const AchievementSystem = {
  check(state) {
    const newly = [];
    const grant = (id) => {
      if (!state.achievements.includes(id)) {
        state.achievements.push(id);
        newly.push(ACHIEVEMENTS.find(a => a.id === id));
      }
    };
    if (state.missionsCompleted >= 1) grant('first_path');
    if (state.algoUsage.astar >= 10) grant('astar_master');
    if (state.algoUsage.dijkstra >= 10) grant('dijkstra_master');
    if (state.algoUsage.greedy >= 10) grant('greedy_master');
    if (state.missionsCompleted >= 10) grant('deliv_10');
    if (state.missionsCompleted >= 50) grant('deliv_50');
    if (state.missionsCompleted >= 100) grant('deliv_100');
    if (state.streak >= 10) grant('no_fail');
    if (state.unlockedCities.includes('legenda')) grant('capital');
    return newly;
  },
  grantOnce(state, id) {
    if (!state.achievements.includes(id)) state.achievements.push(id);
  }
};