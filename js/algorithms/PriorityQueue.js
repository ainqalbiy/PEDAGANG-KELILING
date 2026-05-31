/* Simple min-heap priority queue keyed by `priority` */
class PriorityQueue {
  constructor() { this.heap = []; }
  size() { return this.heap.length; }
  isEmpty() { return this.heap.length === 0; }
  push(item, priority) {
    this.heap.push({ item, priority });
    this._up(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) { this.heap[0] = last; this._down(0); }
    return top.item;
  }
  toArray() { return this.heap.map(e => e.item); }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p].priority > this.heap[i].priority) {
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
      } else break;
    }
  }
  _down(i) {
    const n = this.heap.length;
    while (true) {
      let s = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].priority < this.heap[s].priority) s = l;
      if (r < n && this.heap[r].priority < this.heap[s].priority) s = r;
      if (s !== i) {
        [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
        i = s;
      } else break;
    }
  }
}