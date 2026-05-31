/* Procedural pixel art generator. Draws to offscreen canvases. */
const Sprite = {
  cache: {},

  // Tiny pixel-paint helper
  px(ctx, x, y, c, s = 1) {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, s, s);
  },

  // Returns offscreen canvas for the given key, creating with generator fn if absent
  get(key, w, h, gen) {
    if (this.cache[key]) return this.cache[key];
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    gen(ctx, w, h);
    this.cache[key] = c;
    return c;
  },

  // 16x20 chibi player sprite, 4 directions x 2 frames (32x80 sheet per direction)
  player(dir = 0, frame = 0) {
    const key = `player_${dir}_${frame}`;
    return this.get(key, 16, 20, (ctx) => {
      const skin = '#ffd6a8';
      const hair = '#5a3a22';
      const body = '#ff8c42';   // orange merchant vest
      const pants = '#3a2a52';
      const shoe = '#1a1325';
      const cap = '#ffd966';
      // Hat / cap
      this.px(ctx, 5, 1, cap, 6);
      this.px(ctx, 4, 2, cap, 8);
      // Face
      this.px(ctx, 5, 4, skin, 6);
      this.px(ctx, 4, 5, skin, 8);
      this.px(ctx, 4, 6, skin, 8);
      // hair sides
      this.px(ctx, 4, 4, hair, 1);
      this.px(ctx, 11, 4, hair, 1);
      // Eyes (depending on direction)
      const eyeC = '#2d1b3d';
      if (dir === 0) { // down
        this.px(ctx, 6, 6, eyeC, 1); this.px(ctx, 9, 6, eyeC, 1);
      } else if (dir === 1) { // up - no eyes (back of head)
        this.px(ctx, 5, 5, hair, 6);
      } else if (dir === 2) { // left
        this.px(ctx, 5, 6, eyeC, 1);
      } else { // right
        this.px(ctx, 10, 6, eyeC, 1);
      }
      // Body
      this.px(ctx, 4, 9, body, 8);
      this.px(ctx, 5, 10, body, 6);
      this.px(ctx, 5, 11, body, 6);
      this.px(ctx, 5, 12, body, 6);
      // bag (yellow strap)
      this.px(ctx, 4, 10, cap, 1); this.px(ctx, 11, 10, cap, 1);
      // pants
      this.px(ctx, 5, 14, pants, 2);
      this.px(ctx, 9, 14, pants, 2);
      this.px(ctx, 5, 15, pants, 2);
      this.px(ctx, 9, 15, pants, 2);
      // shoes - alternate frames slight offset for walking
      const off = frame === 1 ? 1 : 0;
      this.px(ctx, 5, 17 + (frame === 0 ? 0 : -off), shoe, 2);
      this.px(ctx, 9, 17 + (frame === 1 ? 0 : -off), shoe, 2);
    });
  },

  // Tree pine, 24x32
  tree() {
    return this.get('tree', 24, 32, (ctx) => {
      const trunk = '#6b4423', d = '#1f5e3a', m = '#3e8c3e', l = '#6dd06d';
      // trunk
      this.px(ctx, 10, 24, trunk, 4); this.px(ctx, 10, 28, trunk, 4);
      // canopy layers
      for (let i = 0; i < 4; i++) {
        const w = 18 - i * 3;
        const x = (24 - w) / 2;
        const y = i * 5 + 1;
        ctx.fillStyle = d; ctx.fillRect(x, y, w, 6);
        ctx.fillStyle = m; ctx.fillRect(x + 1, y, w - 2, 4);
        ctx.fillStyle = l; ctx.fillRect(x + 3, y + 1, 2, 2);
      }
    });
  },

  // Bush 16x12
  bush() {
    return this.get('bush', 16, 12, (ctx) => {
      const d = '#3e8c3e', m = '#6dd06d', l = '#a8e85f';
      ctx.fillStyle = d; ctx.fillRect(1, 3, 14, 8);
      ctx.fillStyle = m; ctx.fillRect(2, 4, 12, 6);
      ctx.fillStyle = l; ctx.fillRect(4, 5, 2, 2);
      ctx.fillStyle = l; ctx.fillRect(9, 6, 2, 2);
    });
  },

  // House 32x32 - color varies by type ('village', 'town', 'port', 'mine', 'farm')
  house(type = 'village') {
    return this.get('house_' + type, 36, 36, (ctx) => {
      const palettes = {
        village: { wall: '#ffd6a8', roof: '#c64242', door: '#6b4423', window: '#9ec8e0' },
        town:    { wall: '#ffaecf', roof: '#a784e0', door: '#3a2a52', window: '#fff4d6' },
        port:    { wall: '#9ec8e0', roof: '#2e7fbd', door: '#3a2a52', window: '#ffd966' },
        mine:    { wall: '#9e8b7a', roof: '#4a3a2a', door: '#1a1325', window: '#ffae00' },
        farm:    { wall: '#f0d68c', roof: '#8d6a44', door: '#6b4423', window: '#ffd966' },
        market:  { wall: '#fff4d6', roof: '#ff8c42', door: '#5a3a22', window: '#ffd966' },
        capital: { wall: '#fff4d6', roof: '#ffd966', door: '#a784e0', window: '#a784e0' }
      };
      const p = palettes[type] || palettes.village;
      // roof
      ctx.fillStyle = p.roof;
      for (let y = 0; y < 12; y++) {
        const inset = 11 - y;
        ctx.fillRect(inset, y, 36 - inset * 2, 1);
      }
      // roof highlight
      ctx.fillStyle = H.hexToRgba(p.roof, 0.6);
      ctx.fillRect(8, 11, 20, 1);
      // walls
      ctx.fillStyle = p.wall;
      ctx.fillRect(4, 12, 28, 22);
      // wall shading
      ctx.fillStyle = H.hexToRgba('#000000', 0.18);
      ctx.fillRect(4, 12, 2, 22);
      // door
      ctx.fillStyle = p.door;
      ctx.fillRect(15, 22, 6, 12);
      ctx.fillStyle = '#ffd966';
      ctx.fillRect(19, 28, 1, 1); // knob
      // windows
      ctx.fillStyle = p.window;
      ctx.fillRect(7, 16, 5, 5);
      ctx.fillRect(24, 16, 5, 5);
      // window cross
      ctx.fillStyle = '#3a2a52';
      ctx.fillRect(9, 16, 1, 5);
      ctx.fillRect(7, 18, 5, 1);
      ctx.fillRect(26, 16, 1, 5);
      ctx.fillRect(24, 18, 5, 1);
      // ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(2, 34, 32, 2);
    });
  },

  // Cloud
  cloud() {
    return this.get('cloud', 48, 18, (ctx) => {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(6, 6, 36, 8);
      ctx.fillRect(10, 3, 12, 4);
      ctx.fillRect(24, 4, 14, 4);
      ctx.fillRect(4, 9, 40, 5);
    });
  },

  // Bird flying (animated by frame)
  bird(frame = 0) {
    return this.get('bird_' + frame, 10, 6, (ctx) => {
      ctx.fillStyle = '#3a2a52';
      if (frame === 0) {
        ctx.fillRect(0, 3, 4, 1);
        ctx.fillRect(4, 2, 2, 1);
        ctx.fillRect(6, 3, 4, 1);
      } else {
        ctx.fillRect(0, 2, 4, 1);
        ctx.fillRect(4, 3, 2, 1);
        ctx.fillRect(6, 2, 4, 1);
      }
    });
  },

  // NPC sprite (different colors)
  npc(color = '#ffaecf') {
    return this.get('npc_' + color, 16, 20, (ctx) => {
      const skin = '#ffd6a8', hair = '#3a2a52', shoe = '#1a1325';
      this.px(ctx, 4, 2, hair, 8);
      this.px(ctx, 4, 5, skin, 8);
      ctx.fillStyle = '#2d1b3d';
      ctx.fillRect(6, 7, 1, 1); ctx.fillRect(9, 7, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(4, 9, 8, 6);
      ctx.fillStyle = '#3a2a52';
      ctx.fillRect(5, 15, 2, 2); ctx.fillRect(9, 15, 2, 2);
      ctx.fillStyle = shoe;
      ctx.fillRect(5, 17, 2, 1); ctx.fillRect(9, 17, 2, 1);
    });
  },

  // Vehicle icons (used in UI)
  vehicleIcon(type) {
    const sizes = { walk: 14, bike: 18, cart: 22, horse: 22, ship: 26, truck: 26 };
    const s = sizes[type] || 18;
    return this.get('veh_' + type, s, s, (ctx) => {
      if (type === 'walk') {
        ctx.fillStyle = '#ff8c42';
        ctx.fillRect(5, 2, 4, 4);
        ctx.fillRect(4, 6, 6, 5);
        ctx.fillRect(4, 11, 2, 3);
        ctx.fillRect(8, 11, 2, 3);
      } else if (type === 'bike') {
        ctx.strokeStyle = '#2d1b3d'; ctx.fillStyle = '#a784e0';
        ctx.beginPath(); ctx.arc(5, 13, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(13, 13, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.fillRect(5, 9, 8, 2);
      } else if (type === 'cart') {
        ctx.fillStyle = '#8d6a44'; ctx.fillRect(2, 8, 18, 7);
        ctx.fillStyle = '#3a2a52';
        ctx.beginPath(); ctx.arc(6, 17, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 17, 3, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'horse') {
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(2, 8, 14, 7);
        ctx.fillRect(14, 5, 5, 6);
        ctx.fillStyle = '#3a2a52';
        ctx.fillRect(3, 15, 2, 5); ctx.fillRect(13, 15, 2, 5);
      } else if (type === 'ship') {
        ctx.fillStyle = '#fff4d6'; ctx.fillRect(13, 4, 2, 12);
        ctx.fillStyle = '#ff8c42'; ctx.fillRect(15, 5, 7, 8);
        ctx.fillStyle = '#8d6a44';
        ctx.beginPath(); ctx.moveTo(2, 16); ctx.lineTo(24, 16); ctx.lineTo(22, 22); ctx.lineTo(4, 22); ctx.closePath(); ctx.fill();
      } else if (type === 'truck') {
        ctx.fillStyle = '#ff5b6e'; ctx.fillRect(2, 8, 14, 8);
        ctx.fillStyle = '#9ec8e0'; ctx.fillRect(15, 10, 7, 6);
        ctx.fillStyle = '#3a2a52';
        ctx.beginPath(); ctx.arc(6, 18, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(18, 18, 3, 0, Math.PI * 2); ctx.fill();
      }
    });
  }
};