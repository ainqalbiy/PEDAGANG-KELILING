/* A* Search - returns step-by-step trace for visualizer */
class AStar {
  static get NAME() { return 'A* Search'; }
  static get DESC() { return 'Menggabungkan biaya nyata (G) dan estimasi (H) untuk efisiensi optimal.'; }

  static run(graph, startId, goalId) {
    const t0 = performance.now();
    const trace = [];
    const open = new PriorityQueue();
    const cameFrom = {};
    const gScore = {}; const fScore = {}; const hScore = {};
    graph.ids().forEach(id => { gScore[id] = Infinity; fScore[id] = Infinity; });
    gScore[startId] = 0;
    hScore[startId] = graph.heuristic(startId, goalId);
    fScore[startId] = hScore[startId];
    open.push(startId, fScore[startId]);
    const inOpen = new Set([startId]);
    const closed = new Set();
    let visited = 0;

    while (!open.isEmpty()) {
      const current = open.pop();
      inOpen.delete(current);
      visited++;
      trace.push({
        type: 'examine',
        current,
        g: gScore[current],
        h: hScore[current] !== undefined ? hScore[current] : graph.heuristic(current, goalId),
        f: fScore[current],
        open: Array.from(inOpen),
        closed: Array.from(closed),
        msg: `A* memeriksa ${graph.get(current).name}. F = G(${Math.round(gScore[current])}) + H(${Math.round(hScore[current] || 0)}) = ${Math.round(fScore[current])}.`
      });
      if (current === goalId) {
        const path = graph.reconstruct(cameFrom, goalId);
        trace.push({
          type: 'done',
          path,
          msg: `Jalur ditemukan! Panjang ${path.length} kota, biaya total ${Math.round(gScore[goalId])}.`
        });
        return { algo: 'astar', path, cost: gScore[goalId], visited, trace, timeMs: performance.now() - t0 };
      }
      closed.add(current);
      const node = graph.get(current);
      for (const nb of node.neighbors) {
        if (closed.has(nb.id)) continue;
        const tentG = gScore[current] + nb.cost;
        if (tentG < gScore[nb.id]) {
          cameFrom[nb.id] = current;
          gScore[nb.id] = tentG;
          hScore[nb.id] = graph.heuristic(nb.id, goalId);
          fScore[nb.id] = tentG + hScore[nb.id];
          if (!inOpen.has(nb.id)) {
            open.push(nb.id, fScore[nb.id]);
            inOpen.add(nb.id);
            trace.push({
              type: 'discover',
              current: nb.id,
              from: current,
              g: gScore[nb.id],
              h: hScore[nb.id],
              f: fScore[nb.id],
              open: Array.from(inOpen),
              closed: Array.from(closed),
              msg: `Tambah ${graph.get(nb.id).name} ke Open List dengan F = ${Math.round(fScore[nb.id])}.`
            });
          }
        }
      }
    }
    return { algo: 'astar', path: null, cost: Infinity, visited, trace, timeMs: performance.now() - t0 };
  }
}