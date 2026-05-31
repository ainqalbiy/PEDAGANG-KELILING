/* DeliveryScene - animated delivery route playback */
const DeliveryScene = {
  state: null,
  path: [],
  pathIdx: 0,
  t: 0,
  speed: 120, // px/s
  mission: null,
  result: null,
  onDone: null,

  enter(payload) {
    this.state   = payload.state;
    this.path    = payload.path    || [];
    this.mission = payload.mission || null;
    this.result  = payload.result  || null;
    this.onDone  = payload.onDone  || null;
    this.pathIdx = 0;
    this.t       = 0;
    Audio.startBGM('adventure');
  },

  exit() {},

  update(dt) {
    if (this.pathIdx >= this.path.length - 1) {
      // Done
      setTimeout(() => {
        if (this.onDone) this.onDone();
        Scenes.switch('map', { state: this.state });
      }, 800);
      return;
    }
    const from = CITIES.find(c => c.id === this.path[this.pathIdx]);
    const to   = CITIES.find(c => c.id === this.path[this.pathIdx + 1]);
    if (!from || !to) { this.pathIdx++; return; }
    const dist = H.dist(from, to);
    this.t += this.speed * dt / dist;
    if (this.t >= 1) { this.t = 0; this.pathIdx++; Audio.step(); }
  },

  render(ctx) {
    // Clear
    ctx.fillStyle = '#b6e7ff';
    ctx.fillRect(0, 0, CONST.CANVAS_W, CONST.CANVAS_H);

    // Draw edges
    EDGES.forEach(e => {
      const a = CITIES.find(c => c.id === e.a), b = CITIES.find(c => c.id === e.b);
      if (!a || !b) return;
      const tinfo = TERRAIN_INFO[e.terrain] || { color: '#c79a6b' };
      ctx.save();
      ctx.strokeStyle = tinfo.color; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.restore();
    });

    // Highlight path
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = CITIES.find(c => c.id === this.path[i]);
      const b = CITIES.find(c => c.id === this.path[i + 1]);
      if (!a || !b) continue;
      ctx.save();
      ctx.strokeStyle = '#ffd966'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.restore();
    }

    // Cities
    CITIES.forEach(city => {
      ctx.save();
      const inPath = this.path.includes(city.id);
      ctx.beginPath(); ctx.arc(city.x, city.y, 12, 0, Math.PI * 2);
      ctx.fillStyle   = inPath ? CONST.COLORS.sand : '#888';
      ctx.strokeStyle = '#2d1b3d'; ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#fff4d6'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(26,19,37,0.9)'; ctx.lineWidth = 3;
      ctx.strokeText(city.name, city.x, city.y + 24);
      ctx.fillText(city.name, city.x, city.y + 24);
      ctx.restore();
    });

    // Animated player
    if (this.pathIdx < this.path.length - 1) {
      const from = CITIES.find(c => c.id === this.path[this.pathIdx]);
      const to   = CITIES.find(c => c.id === this.path[this.pathIdx + 1]);
      if (from && to) {
        const px = H.lerp(from.x, to.x, this.t);
        const py = H.lerp(from.y, to.y, this.t);
        const sp = Sprite.player(0, Math.floor(this.t * 6) % 2);
        ctx.drawImage(sp, px - 8, py - 28);
      }
    }

    // Info
    ctx.save();
    ctx.fillStyle = 'rgba(26,19,37,0.85)';
    ctx.fillRect(10, 10, 400, 50);
    ctx.strokeStyle = '#6e4ba0'; ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 400, 50);
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffd966';
    if (this.mission) ctx.fillText('Mengantarkan: ' + this.mission.icon + ' ' + this.mission.item, 20, 32);
    if (this.result)  ctx.fillText('Biaya: ' + Math.round(this.result.cost) + '  Node diperiksa: ' + this.result.visited, 20, 52);
    ctx.restore();
  },

  onClick() {},
  onMouseMove() {}
};
