/* Greedy Best-First Search - uses only heuristic H */
class GreedyBestFirst {
  static get NAME() { return 'Greedy Best First'; }
  static get DESC() { return 'Hanya mempertimbangkan estimasi jarak ke tujuan (H). Sangat cepat, tapi tidak menjamin jalur termurah.'; }

  static run(graph, startId, goalId) {
    const t0 = performance.now();
    const trace = [];
    const open = new PriorityQueue();
    const cameFrom = {};
    const gScore = {}; const hScore = {};
    graph.ids().forEach(id => { gScore[id] = Infinity; });
    gScore[startId] = 0;
    hScore[startId] = graph.heuristic(startId, goalId);
    open.push(startId, hScore[startId]);
    const inOpen = new Set([startId]);
    const closed = new Set();
    let visited = 0;

    while (!open.isEmpty()) {
      const current = open.pop();
      if (closed.has(current)) continue;
      inOpen.delete(current);
      visited++;
      trace.push({
        type: 'examine',
        current,
        g: gScore[current],
        h: hScore[current] !== undefined ? hScore[current] : graph.heuristic(current, goalId),
        f: hScore[current] || 0,
        open: Array.from(inOpen), closed: Array.from(closed),
        msg: `Greedy memilih node terdekat ke tujuan: ${graph.get(current).name} (H=${Math.round(hScore[current])}).`
      });
      if (current === goalId) {
        const path = graph.reconstruct(cameFrom, goalId);
        trace.push({ type: 'done', path, msg: `Tujuan tercapai. Biaya jalur ${Math.round(gScore[goalId])} (mungkin tidak optimal).` });
        return { algo: 'greedy', path, cost: gScore[goalId], visited, trace, timeMs: performance.now() - t0 };
      }
      closed.add(current);
      for (const nb of graph.get(current).neighbors) {
        if (closed.has(nb.id) || inOpen.has(nb.id)) continue;
        cameFrom[nb.id] = current;
        gScore[nb.id] = gScore[current] + nb.cost;
        hScore[nb.id] = graph.heuristic(nb.id, goalId);
        open.push(nb.id, hScore[nb.id]);
        inOpen.add(nb.id);
        trace.push({
          type: 'discover',
          current: nb.id, from: current,
          g: gScore[nb.id], h: hScore[nb.id], f: hScore[nb.id],
          open: Array.from(inOpen), closed: Array.from(closed),
          msg: `Tambah ${graph.get(nb.id).name} dengan prioritas H=${Math.round(hScore[nb.id])}.`
        });
      }
    }
    return { algo: 'greedy', path: null, cost: Infinity, visited, trace, timeMs: performance.now() - t0 };
  }
}

const ALGOS = { astar: AStar, dijkstra: Dijkstra, greedy: GreedyBestFirst };