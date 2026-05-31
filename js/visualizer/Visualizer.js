/* Visualizer - renders algorithm trace on the map canvas */
const Visualizer = {
  active: false,
  trace: [],
  step: 0,
  playing: false,
  intervalId: null,
  result: null,
  graph: null,
  fromId: null,
  toId: null,
  algoKey: 'astar',
  speedVal: 3,

  init() {
    this.panelEl   = document.getElementById('algo-panel');
    this.titleEl   = document.getElementById('algo-title');
    this.playBtn   = document.getElementById('algo-play');
    this.stepBtn   = document.getElementById('algo-step');
    this.pauseBtn  = document.getElementById('algo-pause');
    this.resetBtn  = document.getElementById('algo-reset');
    this.speedEl   = document.getElementById('algo-speed');
    this.speedLbl  = document.getElementById('speed-label');
    this.closeBtn  = document.getElementById('algo-close');
    this.eduEl     = document.getElementById('algo-edu');
    this.nameEl    = document.getElementById('algo-current-name');
    this.valG      = document.getElementById('val-g');
    this.valH      = document.getElementById('val-h');
    this.valF      = document.getElementById('val-f');
    this.statVisited  = document.getElementById('stat-visited');
    this.statOpen     = document.getElementById('stat-open');
    this.statClosed   = document.getElementById('stat-closed');
    this.statPathLen  = document.getElementById('stat-pathlen');
    this.statPathCost = document.getElementById('stat-pathcost');
    this.statTime     = document.getElementById('stat-time');

    this.playBtn.onclick  = () => { Audio.click(); this.play(); };
    this.stepBtn.onclick  = () => { Audio.click(); this.doStep(); };
    this.pauseBtn.onclick = () => { Audio.click(); this.pause(); };
    this.resetBtn.onclick = () => { Audio.click(); this.reset(); };
    this.closeBtn.onclick = () => { Audio.click(); this.hide(); };
    this.speedEl.oninput  = () => {
      this.speedVal = parseInt(this.speedEl.value);
      this.speedLbl.textContent = this.speedVal + 'x';
      if (this.playing) { this.pause(); this.play(); }
    };
  },

  start(algoKey, fromId, toId) {
    this.algoKey = algoKey;
    this.fromId  = fromId;
    this.toId    = toId;
    this.graph   = new Graph(CITIES, EDGES);
    const algo   = ALGOS[algoKey];
    this.result  = algo.run(this.graph, fromId, toId);
    this.trace   = this.result.trace;
    this.step    = 0;
    this.playing = false;
    this.clearInterval();

    this.titleEl.textContent = algo.NAME;
    this.panelEl.classList.remove('hidden');
    this.active  = true;
    this.updateStats({ open: [], closed: [] });
    this.eduEl.textContent = 'Tekan ▶ Mulai untuk menjalankan algoritma...';
    Audio.open();
  },

  show() { this.panelEl.classList.remove('hidden'); },
  hide() {
    this.panelEl.classList.add('hidden');
    this.pause();
    this.active = false;
  },

  play() {
    if (this.step >= this.trace.length) { this.reset(); }
    this.playing = true;
    const delay  = Math.max(40, 600 / this.speedVal);
    this.intervalId = setInterval(() => {
      if (!this.doStep()) this.pause();
    }, delay);
  },

  pause() {
    this.playing = false;
    this.clearInterval();
  },

  reset() {
    this.pause();
    this.step = 0;
    this.updateStats({ open: [], closed: [] });
    this.nameEl.textContent = '-';
    this.valG.textContent = '-'; this.valH.textContent = '-'; this.valF.textContent = '-';
    this.eduEl.textContent = 'Tekan ▶ Mulai untuk menjalankan algoritma...';
    this.statPathLen.textContent = '-'; this.statPathCost.textContent = '-';
    if (this.result) this.statTime.textContent = this.result.timeMs.toFixed(2) + 'ms';
  },

  doStep() {
    if (this.step >= this.trace.length) return false;
    const frame = this.trace[this.step++];
    this.applyFrame(frame);
    return this.step < this.trace.length;
  },

  applyFrame(frame) {
    this.eduEl.textContent = frame.msg || '';
    if (frame.type === 'examine' || frame.type === 'discover') {
      const node = this.graph.get(frame.current);
      this.nameEl.textContent  = node ? node.name : frame.current;
      this.valG.textContent    = frame.g !== undefined ? Math.round(frame.g) : '-';
      this.valH.textContent    = frame.h !== undefined ? Math.round(frame.h) : '-';
      this.valF.textContent    = frame.f !== undefined ? Math.round(frame.f) : '-';
      this.updateStats(frame);
      if (frame.type === 'examine') Audio.scan();
      else Audio.step();
    }
    if (frame.type === 'done') {
      const path = frame.path;
      this.statPathLen.textContent  = path ? path.length : '-';
      this.statPathCost.textContent = this.result ? Math.round(this.result.cost) : '-';
      this.statTime.textContent     = this.result ? this.result.timeMs.toFixed(2) + 'ms' : '-';
      Audio.success();
    }
  },

  updateStats(frame) {
    const visited = this.trace.slice(0, this.step).filter(f => f.type === 'examine').length;
    this.statVisited.textContent  = visited;
    this.statOpen.textContent     = (frame.open    || []).length;
    this.statClosed.textContent   = (frame.closed  || []).length;
  },

  clearInterval() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  },

  /* Called by MapScene each render frame - draws algo overlay on canvas */
  drawOverlay(ctx) {
    if (!this.active || !this.graph || this.step === 0) return;

    const frame = this.trace[Math.max(0, this.step - 1)];
    const colors = CONST.ALGO_COLORS;

    // Collect state at current step
    const open   = new Set(frame.open   || []);
    const closed = new Set(frame.closed || []);
    const path   = (frame.type === 'done' && frame.path) ? new Set(frame.path) : null;
    const cur    = frame.current;

    // Draw edge highlights for path
    if (path && this.result && this.result.path) {
      const p = this.result.path;
      ctx.save();
      ctx.strokeStyle = colors.path;
      ctx.lineWidth   = 6;
      ctx.setLineDash([]);
      for (let i = 0; i < p.length - 1; i++) {
        const a = this.graph.get(p[i]);
        const b = this.graph.get(p[i + 1]);
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw node state dots
    CITIES.forEach(city => {
      let color = colors.idle;
      if (path && path.has(city.id))    color = colors.path;
      else if (city.id === cur)         color = colors.current;
      else if (closed.has(city.id))     color = colors.closed;
      else if (open.has(city.id))       color = colors.open;
      if (city.id === this.fromId)      color = colors.start;
      if (city.id === this.toId)        color = colors.goal;

      ctx.save();
      ctx.beginPath();
      ctx.arc(city.x, city.y, 14, 0, Math.PI * 2);
      ctx.fillStyle   = color;
      ctx.strokeStyle = CONST.COLORS.textDark;
      ctx.lineWidth   = 3;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // G/H/F label for open/current nodes
      if ((open.has(city.id) || city.id === cur) && frame.type !== 'done') {
        const t = this.trace.slice(0, this.step).reverse()
          .find(f => f.current === city.id && f.g !== undefined);
        if (t) {
          ctx.save();
          ctx.font = '9px "Press Start 2P", monospace';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText('G' + Math.round(t.g), city.x, city.y - 18);
          ctx.restore();
        }
      }
    });
  }
};
