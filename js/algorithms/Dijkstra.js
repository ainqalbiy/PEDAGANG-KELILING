/* Dijkstra - shortest path by cost only */
class Dijkstra {
  static get NAME() { return 'Dijkstra'; }
  static get DESC() { return 'Eksplorasi berdasarkan biaya termurah (G). Menjamin jalur paling pendek, tapi memeriksa lebih banyak node.'; }

  static run(graph, startId, goalId) {
    const t0 = performance.now();
    const trace = [];
    const open = new PriorityQueue();
    const cameFrom = {};
    const dist = {};
    graph.ids().forEach(id => { dist[id] = Infinity; });
    dist[startId] = 0;
    open.push(startId, 0);
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
        g: dist[current], h: 0, f: dist[current],
        open: Array.from(inOpen), closed: Array.from(closed),
        msg: `Dijkstra mengambil node biaya terendah: ${graph.get(current).name} (G=${Math.round(dist[current])}).`
      });
      if (current === goalId) {
        const path = graph.reconstruct(cameFrom, goalId);
        trace.push({ type: 'done', path, msg: `Jalur termurah ditemukan. Biaya = ${Math.round(dist[goalId])}.` });
        return { algo: 'dijkstra', path, cost: dist[goalId], visited, trace, timeMs: performance.now() - t0 };
      }
      closed.add(current);
      for (const nb of graph.get(current).neighbors) {
        if (closed.has(nb.id)) continue;
        const alt = dist[current] + nb.cost;
        if (alt < dist[nb.id]) {
          dist[nb.id] = alt;
          cameFrom[nb.id] = current;
          open.push(nb.id, alt);
          inOpen.add(nb.id);
          trace.push({
            type: 'discover',
            current: nb.id, from: current,
            g: alt, h: 0, f: alt,
            open: Array.from(inOpen), closed: Array.from(closed),
            msg: `Update ${graph.get(nb.id).name}: G = ${Math.round(alt)}.`
          });
        }
      }
    }
    return { algo: 'dijkstra', path: null, cost: Infinity, visited, trace, timeMs: performance.now() - t0 };
  }
}