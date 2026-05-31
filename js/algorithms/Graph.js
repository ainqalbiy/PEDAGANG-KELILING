/* Graph wrapper over CITIES/EDGES with effective costs (terrain multiplier). */
class Graph {
  constructor(cities, edges) {
    this.nodes = {};
    cities.forEach(c => { this.nodes[c.id] = { ...c, neighbors: [] }; });
    edges.forEach(e => {
      const mult = (TERRAIN_INFO[e.terrain] || { mult: 1 }).mult;
      const effective = Math.round(e.cost * mult);
      this.nodes[e.a].neighbors.push({ id: e.b, cost: effective, raw: e.cost, terrain: e.terrain });
      this.nodes[e.b].neighbors.push({ id: e.a, cost: effective, raw: e.cost, terrain: e.terrain });
    });
  }
  get(id) { return this.nodes[id]; }
  heuristic(aId, bId) {
    const a = this.nodes[aId], b = this.nodes[bId];
    // Euclidean distance in canvas px, scaled to match cost units (km)
    return Math.hypot(a.x - b.x, a.y - b.y) * 0.13;
  }
  ids() { return Object.keys(this.nodes); }
  reconstruct(cameFrom, goal) {
    const path = [goal];
    let cur = goal;
    while (cameFrom[cur]) { cur = cameFrom[cur]; path.unshift(cur); }
    return path;
  }
}