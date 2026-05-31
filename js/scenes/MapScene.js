/* MapScene - PEDAGANG KELILING
   Pemain bermain sebagai pedagang tanpa mengetahui algoritma.
   Analisis algoritma HANYA muncul SETELAH misi selesai.
*/
const MapScene = {
  state: null,
  hoverCity: null,
  selectedMission: null,
  particles: [],
  confetti: [],
  clouds: [{x:80,y:40,spd:0.12},{x:300,y:25,spd:0.08},{x:600,y:50,spd:0.10},{x:800,y:30,spd:0.14}],
  birds: [{x:100,y:80,spd:0.6,frame:0,t:0},{x:400,y:60,spd:0.8,frame:1,t:0.5}],
  animT: 0,

  // === PLAYER STATE ===
  player: {
    cityId: 'mawar',
    frame: 0,
    frameT: 0,
    dir: 0,
    moving: false,
    movingFrom: null,
    movingTo: null,
    moveProg: 0,
    moveSpeed: 2.5,
    x: 0, y: 0,
    idle: false,
    idleT: 0,
    happy: false,   // animasi senang setelah menang
    happyT: 0,
    sad: false,     // animasi sedih setelah kalah
    sadT: 0,
  },

  // === JOURNEY TRACKING ===
  journey: {
    active: false,
    path: [],
    totalCost: 0,
    startTime: 0,
    stepCount: 0,
  },

  // === PANEL PASCA MISI ===
  postGame: {
    phase: 'none',   // 'none' | 'route' | 'strategy' | 'recommend' | 'result'
    visible: false,
    data: null,
    pageT: 0,        // timer animasi
    winLose: null,   // 'win' | 'lose'
  },

  // === NPC DATA ===
  npcs: [
    { id: 'kepala', name: 'Kepala Desa', cityId: 'mawar', icon: '👴', color: '#a784e0',
      dialogs: [
        ['Hai, pedagang! Temukan jalur terbaikmu sendiri!','Pikirkan biaya dan jarak. Kamu yang memutuskan!'],
        ['Sudah lelah? Coba rute yang berbeda setiap kali!'],
      ],
      dialogIdx: 0,
    },
    { id: 'pedagang_tua', name: 'Pedagang Tua', cityId: 'pasar', icon: '🧓', color: '#ffd966',
      dialogs: [
        ['Perhatikan kondisi jalan! Jalan rusak biayanya lebih mahal.','Jalan pintas bisa menghemat waktu dan biaya.'],
        ['Aku selalu mempertimbangkan total biaya perjalanan.','Kadang memutar sedikit lebih hemat!'],
      ],
      dialogIdx: 0,
    },
    { id: 'petani', name: 'Petani Sawah', cityId: 'sawah', icon: '👨‍🌾', color: '#5fd66e',
      dialogs: [
        ['Hati-hati melewati jalan rusak! Biayanya lebih mahal.','Tapi kalau tidak ada pilihan lain, ya lewat saja...'],
        ['Perhatikan angka di setiap jalan — itu biaya perjalanannya!'],
      ],
      dialogIdx: 0,
    },
    { id: 'nelayan', name: 'Nelayan', cityId: 'biru', icon: '🎣', color: '#4ab8e6',
      dialogs: [
        ['Di sini banyak jalur menuju kota-kota timur.','Pilihlah dengan bijak!'],
        ['Pengalaman adalah guru terbaik. Coba berbagai rute!'],
      ],
      dialogIdx: 0,
    },
  ],

  enter(payload) {
    this.state = payload && payload.state ? payload.state : SaveSystem.load();
    MissionSystem.ensureMissions(this.state);
    this.updateHUD();
    Audio.startBGM('village');
    Visualizer.init();

    this.player.cityId = this.state.currentCity || 'mawar';
    const city = CITIES.find(c => c.id === this.player.cityId);
    if (city) { this.player.x = city.x; this.player.y = city.y; }

    this._resetJourney();
    this.postGame = { phase: 'none', visible: false, data: null, pageT: 0, winLose: null };
    this.confetti = [];

    if (!this.state.seenIntro) {
      this.state.seenIntro = true;
      setTimeout(() => {
        Dialog.show('Kepala Desa', [
          'Selamat datang, pedagang baru!',
          'Gunakan WASD atau tombol panah untuk bergerak antar kota.',
          'Pilih misi dari panel bawah, lalu antar barang ke kota tujuan!',
          'Gunakan pikiranmu untuk menemukan jalur terbaik. Selamat berpetualang! 🗺️',
        ]);
      }, 600);
    }

    document.getElementById('btn-shop').onclick       = () => { Audio.click(); Modal.showShop(this.state, () => { this.updateHUD(); SaveSystem.save(this.state); }); };
    document.getElementById('btn-academy').onclick    = () => { Audio.click(); Modal.showAcademy(); };
    document.getElementById('btn-compare').onclick    = () => { Audio.click(); this._showCompareModal(); };
    document.getElementById('btn-achievements').onclick = () => { Audio.click(); Modal.showAchievements(this.state); };
    document.getElementById('btn-save').onclick       = () => { Audio.click(); SaveSystem.save(this.state); Notify.show('Game tersimpan!', 'ok'); };
  },

  exit() {
    document.getElementById('btn-shop').onclick = null;
    document.getElementById('btn-academy').onclick = null;
    document.getElementById('btn-compare').onclick = null;
    document.getElementById('btn-achievements').onclick = null;
    document.getElementById('btn-save').onclick = null;
  },

  // Tombol Banding hanya muncul SETELAH ada history analisis
  _showCompareModal() {
    if (!this.postGame.data && !this.state.lastAnalysis) {
      Notify.show('Selesaikan dulu satu misi untuk melihat analisis!', 'warn', 2000);
      return;
    }
    Modal.showComparePost(this.state, this.postGame.data || this.state.lastAnalysis);
  },

  updateHUD() {
    const s = this.state;
    document.getElementById('hud-money-value').textContent = '💰 ' + H.format(s.money);
    document.getElementById('hud-level-value').textContent = Economy.levelName(s);
    document.getElementById('hud-xp-value').textContent    = s.xp + ' XP';
    const v = getVehicle(s.vehicleId);
    document.getElementById('hud-vehicle-value').textContent = v ? v.icon + ' ' + v.name : '';
    document.getElementById('hud').querySelector('[data-testid="hud-money"]').style.display='flex';
  },

  _resetJourney() {
    const startId = this.player.cityId;
    this.journey = {
      active: false,
      path: [startId],
      totalCost: 0,
      startTime: 0,
      stepCount: 0,
    };
  },

  // ===================== KEY HANDLER =====================
  _handleKey(key) {
    if (Dialog.isOpen()) return;
    if (this.postGame.visible) {
      if (key === 'Enter' || key === ' ') this._advancePostGame();
      return;
    }
    if (this.player.moving) return;

    const dirs = {
      ArrowUp: 1, ArrowDown: 0, ArrowLeft: 2, ArrowRight: 3,
      w: 1, s: 0, a: 2, d: 3,
      W: 1, S: 0, A: 2, D: 3,
    };
    if (!(key in dirs)) return;

    const dir = dirs[key];
    this.player.dir = dir;

    const cur = CITIES.find(c => c.id === this.player.cityId);
    if (!cur) return;

    const neighbors = this._getNeighbors(this.player.cityId);
    let best = null, bestScore = Infinity;

    const dirVec = [[0,1],[0,-1],[-1,0],[1,0]][dir];
    neighbors.forEach(nb => {
      const nc = CITIES.find(c => c.id === nb.id);
      if (!nc) return;
      if (!this.state.unlockedCities.includes(nc.id)) return;
      const dx = nc.x - cur.x, dy = nc.y - cur.y;
      const dist = Math.hypot(dx, dy);
      const udx = dx / dist, udy = dy / dist;
      const dot = udx * dirVec[0] + udy * dirVec[1];
      if (dot < 0.2) return;
      const score = (1 - dot) * 1000 + dist;
      if (score < bestScore) { bestScore = score; best = nb; }
    });

    if (best) {
      this._movePlayerTo(best.id, best.cost);
    } else {
      Notify.show('Tidak ada jalan ke arah itu!', 'warn', 1200);
    }
  },

  _getNeighbors(cityId) {
    const neighbors = [];
    EDGES.forEach(e => {
      const mult = (TERRAIN_INFO[e.terrain] || { mult: 1 }).mult;
      const cost = Math.round(e.cost * mult);
      if (e.a === cityId) neighbors.push({ id: e.b, cost, terrain: e.terrain });
      if (e.b === cityId) neighbors.push({ id: e.a, cost, terrain: e.terrain });
    });
    return neighbors;
  },

  _movePlayerTo(targetId, cost) {
    Audio.click();
    this.player.moving = true;
    this.player.movingFrom = this.player.cityId;
    this.player.movingTo = targetId;
    this.player.moveProg = 0;

    if (this.journey.active) {
      this.journey.path.push(targetId);
      this.journey.totalCost += cost;
      this.journey.stepCount++;
    }

    const edge = EDGES.find(e =>
      (e.a === this.player.cityId && e.b === targetId) ||
      (e.b === this.player.cityId && e.a === targetId)
    );
    if (edge) {
      const tinfo = TERRAIN_INFO[edge.terrain];
      if (tinfo && edge.terrain !== 'jalan') {
        Notify.show(tinfo.label + ' (×' + tinfo.mult + ')', 'ok', 1000);
      }
    }

    const npc = this.npcs.find(n => n.cityId === targetId);
    const arrivedCb = () => {
      this.player.cityId = targetId;
      this.player.movingFrom = null;
      this.player.movingTo = null;
      this.player.moving = false;
      this.state.currentCity = targetId;
      this.spawnParticles(this.player.x, this.player.y, '#fff4d6', 5);

      if (this.selectedMission && !this.journey.active && targetId === this.selectedMission.from) {
        const toCity = CITIES.find(c => c.id === this.selectedMission.to);
        setTimeout(() => {
          Dialog.show('📦 Ambil Barang!', [
            this.selectedMission.icon + ' ' + this.selectedMission.item + ' siap diambil!',
            'Sekarang antar ke: ' + (toCity ? toCity.name : this.selectedMission.to),
            'Gunakan WASD / Arrow Keys untuk bergerak.',
            'Temukan jalur terbaik menuju tujuan! 🚀',
          ], { onDone: () => this._startJourney() });
        }, 100);
        return;
      }

      if (this.selectedMission && this.journey.active && targetId === this.selectedMission.to) {
        this._completeMission();
        return;
      }

      if (npc && !Dialog.isOpen()) {
        setTimeout(() => {
          const lines = npc.dialogs[npc.dialogIdx % npc.dialogs.length];
          npc.dialogIdx++;
          Dialog.show(npc.name, lines);
        }, 200);
      }
    };
    this._moveAnimCallback = arrivedCb;
  },

  // ===================== MISSION SELECTION & START =====================
  _selectMission(mission) {
    if (this.journey.active) {
      Notify.show('Selesaikan misi yang sedang berjalan dulu!', 'warn');
      return;
    }
    if (this.selectedMission && this.selectedMission.id === mission.id) {
      this.selectedMission = null;
      this._resetJourney();
      return;
    }
    this.selectedMission = mission;
    Audio.click();

    const fromCity = CITIES.find(c => c.id === mission.from);
    const toCity   = CITIES.find(c => c.id === mission.to);

    if (this.player.cityId !== mission.from) {
      Dialog.show('Misi Baru!', [
        mission.icon + ' ' + mission.item,
        'Ambil barang di: ' + (fromCity ? fromCity.name : mission.from),
        'Antar ke: ' + (toCity ? toCity.name : mission.to),
        'Pergi ke ' + (fromCity ? fromCity.name : mission.from) + ' dulu untuk mengambil barang!',
      ]);
      this._resetJourney();
    } else {
      Dialog.show('Misi Dimulai!', [
        mission.icon + ' ' + mission.item,
        'Antar ke: ' + (toCity ? toCity.name : mission.to),
        'Gunakan WASD atau Arrow Keys untuk bergerak.',
        'Temukan jalurmu sendiri! Selamat berpetualang! 🚀',
      ], { onDone: () => this._startJourney() });
    }

    Notify.show('Misi: ' + mission.icon + ' ke ' + (toCity ? toCity.name : mission.to), 'ok', 2500);
  },

  _startJourney() {
    if (!this.selectedMission) return;
    this.journey.active = true;
    this.journey.path = [this.player.cityId];
    this.journey.totalCost = 0;
    this.journey.stepCount = 0;
    this.journey.startTime = Date.now();
    const dest = (CITIES.find(c=>c.id===this.selectedMission.to)||{name:this.selectedMission.to}).name;
    Notify.show('Perjalanan dimulai! Menuju ' + dest, 'ok', 2000);
  },

  // ===================== MISSION COMPLETE & ANALYSIS =====================
  _completeMission() {
    const m = this.selectedMission;
    const journey = this.journey;
    const elapsedSec = Math.round((Date.now() - journey.startTime) / 1000);

    // Jalankan semua algoritma untuk perbandingan (tersembunyi dari pemain)
    const graph = new Graph(CITIES, EDGES);
    const results = {
      astar:    AStar.run(graph, m.from, m.to),
      dijkstra: Dijkstra.run(graph, m.from, m.to),
      greedy:   GreedyBestFirst.run(graph, m.from, m.to),
    };

    // Cari jalur optimal (biaya terendah)
    let optimalAlgo = 'dijkstra', optimalCost = Infinity;
    Object.entries(results).forEach(([key, r]) => {
      if (r.path && r.cost < optimalCost) { optimalCost = r.cost; optimalAlgo = key; }
    });
    const optimalResult = results[optimalAlgo];

    // Bandingkan jalur pemain dengan setiap algoritma
    const playerPathStr = journey.path.join(',');
    let matchedAlgo = null;
    let bestSimilarity = -1;

    // Cari kecocokan jalur
    Object.entries(results).forEach(([key, r]) => {
      if (r.path && r.path.join(',') === playerPathStr) matchedAlgo = key;
    });

    // Jika tidak ada kecocokan tepat, analisis pola berpikir pemain
    if (!matchedAlgo) {
      matchedAlgo = this._analyzeMindset(journey.path, results, m.to);
    }

    const playerCost = journey.totalCost;
    const costDiff = playerCost - optimalCost;
    const isOptimal = costDiff <= 2;
    const isNearOptimal = costDiff <= Math.round(optimalCost * 0.15); // selisih ≤15%

    // Ekonomi
    const { netPay, opCost } = MissionSystem.complete(this.state, m, {
      cost: playerCost,
      algo: optimalAlgo,
      pathLen: journey.path.length
    });
    const newAch = AchievementSystem.check(this.state);

    let bonusXp = 0, bonusPay = 0;
    if (isOptimal) {
      bonusXp = Math.round(m.xp * 0.5);
      bonusPay = Math.round(netPay * 0.3);
      Economy.addMoney(this.state, bonusPay);
      Economy.addXP(this.state, bonusXp);
    }

    SaveSystem.save(this.state);
    this.updateHUD();
    Audio.coin();
    this.spawnParticles(this.player.x, this.player.y, '#ffd966', 16);

    const algoNames = { astar: 'A* Search', dijkstra: 'Dijkstra', greedy: 'Greedy Best-First' };

    // Deskripsi pola berpikir pemain (tanpa menyebut nama algoritma dulu)
    const mindsetDesc = this._getMindsetDescription(matchedAlgo, journey.path, results, m.to);

    const analysisData = {
      playerPath: journey.path,
      playerCost,
      playerSteps: journey.path.length,
      elapsedSec,
      isOptimal,
      isNearOptimal,
      costDiff,
      matchedAlgo,
      optimalAlgo,
      optimalPath: optimalResult.path,
      optimalCost,
      results,
      algoNames,
      netPay, opCost, bonusXp, bonusPay,
      missionIcon: m.icon, missionItem: m.item,
      newAch,
      mindsetDesc,
    };

    this.state.lastAnalysis = analysisData;
    this._lastMissionFrom = m.from;
    this._lastMissionTo   = m.to;

    this.selectedMission = null;
    this._resetJourney();

    // Tentukan menang/kalah
    let winLose;
    if (isOptimal) {
      winLose = 'win';
    } else if (costDiff > optimalCost * 0.3) {
      winLose = 'lose';
    } else {
      winLose = 'win'; // near-optimal tetap menang
    }

    // Tampilkan dialog selesai dulu, lalu panel analisis
    const completionLines = isOptimal
      ? ['🎉 Kamu berhasil mengantarkan ' + m.icon + ' ' + m.item + '!',
         '💰 Pendapatan: +' + netPay,
         'Perjalananmu sudah sangat efisien! Lihat analisisnya...',]
      : ['📦 Barang ' + m.icon + ' ' + m.item + ' berhasil diantar!',
         '💰 Pendapatan: +' + netPay,
         'Apakah jalurmu sudah optimal? Mari kita lihat analisisnya...'];

    if (newAch.length > 0) completionLines.push('🏆 Prestasi: ' + newAch.map(a=>a.icon+' '+a.name).join(', '));

    Dialog.show(isOptimal ? '✅ Misi Selesai!' : '✅ Misi Selesai!', completionLines, {
      onDone: () => {
        this.postGame = {
          phase: 'route',
          visible: true,
          data: analysisData,
          pageT: 0,
          winLose,
        };
      }
    });
  },

  // Analisis pola berpikir pemain berdasarkan jalur yang dipilih
  _analyzeMindset(playerPath, results, goalId) {
    if (playerPath.length < 2) return 'dijkstra';

    const goalCity = CITIES.find(c => c.id === goalId);
    if (!goalCity) return 'dijkstra';

    // Hitung apakah pemain cenderung menuju goal langsung (greedy) atau pertimbangkan biaya (dijkstra/astar)
    let greedyScore = 0;
    let costAwareScore = 0;

    for (let i = 0; i < playerPath.length - 1; i++) {
      const curCity = CITIES.find(c => c.id === playerPath[i]);
      const nextCity = CITIES.find(c => c.id === playerPath[i + 1]);
      if (!curCity || !nextCity) continue;

      const distToGoalBefore = H.dist(curCity, goalCity);
      const distToGoalAfter  = H.dist(nextCity, goalCity);

      // Apakah langkah ini mendekat ke goal?
      if (distToGoalAfter < distToGoalBefore) greedyScore++;

      // Apakah langkah ini memilih edge dengan biaya rendah?
      const neighbors = this._getNeighbors(playerPath[i]);
      const chosenEdge = neighbors.find(n => n.id === playerPath[i+1]);
      const avgCost = neighbors.reduce((s, n) => s + n.cost, 0) / neighbors.length;
      if (chosenEdge && chosenEdge.cost <= avgCost) costAwareScore++;
    }

    const total = playerPath.length - 1;
    if (total === 0) return 'dijkstra';

    const greedyRatio    = greedyScore / total;
    const costAwareRatio = costAwareScore / total;

    if (greedyRatio > 0.8 && costAwareRatio < 0.5) return 'greedy';
    if (costAwareRatio > 0.7 && greedyRatio > 0.6) return 'astar';
    return 'dijkstra';
  },

  _getMindsetDescription(algoKey, playerPath, results, goalId) {
    const goalCity = CITIES.find(c => c.id === goalId);
    const desc = {
      astar: [
        'Mempertimbangkan biaya perjalanan nyata.',
        'Sekaligus mengarah menuju tujuan.',
        'Menyeimbangkan efisiensi dan arah.',
      ],
      dijkstra: [
        'Fokus pada minimasi total biaya.',
        'Tidak terburu-buru memilih jalan terdekat.',
        'Mengevaluasi semua pilihan secara sistematis.',
      ],
      greedy: [
        'Selalu memilih kota yang terlihat paling dekat ke tujuan.',
        'Bergerak langsung tanpa terlalu memikirkan biaya total.',
        'Mengutamakan kemajuan nyata menuju tujuan.',
      ],
    };
    return desc[algoKey] || desc['dijkstra'];
  },

  // ===================== POST-GAME PANEL NAVIGATION =====================
  _advancePostGame() {
    const phases = ['route', 'strategy', 'recommend', 'result'];
    const cur = phases.indexOf(this.postGame.phase);
    if (cur < phases.length - 1) {
      this.postGame.phase = phases[cur + 1];
      this.postGame.pageT = 0;
      Audio.click();

      // Trigger efek saat result
      if (this.postGame.phase === 'result') {
        if (this.postGame.winLose === 'win') {
          Audio.win();
          this.player.happy = true;
          this.player.happyT = 0;
          this._spawnConfetti();
        } else {
          Audio.lose();
          this.player.sad = true;
          this.player.sadT = 0;
        }
      }
    } else {
      // Tutup panel
      this.postGame.visible = false;
      this.postGame.phase = 'none';
      this.player.happy = false;
      this.player.sad = false;
      this.confetti = [];
    }
  },

  _spawnConfetti() {
    this.confetti = [];
    const colors = ['#ffd966','#ff5b6e','#5fd66e','#4ab8e6','#a784e0','#ff8c42'];
    for (let i = 0; i < 60; i++) {
      this.confetti.push({
        x: Math.random() * 960,
        y: -10 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 120,
        vy: 60 + Math.random() * 120,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 8,
        life: 2.5 + Math.random() * 1.5,
        maxLife: 4,
      });
    }
  },

  // ===================== UPDATE =====================
  update(dt) {
    this.animT += dt;
    this.clouds.forEach(c => { c.x += c.spd * dt * 60; if (c.x > CONST.CANVAS_W + 60) c.x = -60; });
    this.birds.forEach(b => { b.x += b.spd * dt * 60; b.t += dt; b.frame = Math.floor(b.t * 4) % 2; if (b.x > CONST.CANVAS_W + 20) b.x = -20; });

    if (this.postGame.visible) this.postGame.pageT += dt;

    // Player animation
    const p = this.player;
    p.frameT += dt;
    if (p.moving) {
      if (p.frameT > 0.12) { p.frameT = 0; p.frame = 1 - p.frame; }
    } else {
      p.frame = 0;
      p.idleT += dt;
    }
    if (p.happy) { p.happyT += dt; if (p.happyT > 3) p.happy = false; }
    if (p.sad) { p.sadT += dt; if (p.sadT > 3) p.sad = false; }

    // Player movement interpolation
    if (p.moving && p.movingFrom && p.movingTo) {
      p.moveProg += dt * p.moveSpeed;
      if (p.moveProg >= 1) {
        p.moveProg = 1;
        const toCity = CITIES.find(c => c.id === p.movingTo);
        if (toCity) { p.x = toCity.x; p.y = toCity.y; }
        if (this._moveAnimCallback) { const cb = this._moveAnimCallback; this._moveAnimCallback = null; cb(); }
      } else {
        const from = CITIES.find(c => c.id === p.movingFrom);
        const to   = CITIES.find(c => c.id === p.movingTo);
        if (from && to) {
          const ease = p.moveProg < 0.5
            ? 2 * p.moveProg * p.moveProg
            : -1 + (4 - 2 * p.moveProg) * p.moveProg;
          p.x = from.x + (to.x - from.x) * ease;
          p.y = from.y + (to.y - from.y) * ease;
          const dx = to.x - from.x, dy = to.y - from.y;
          if (Math.abs(dx) > Math.abs(dy)) p.dir = dx > 0 ? 3 : 2;
          else p.dir = dy > 0 ? 0 : 1;
        }
      }
    } else if (!p.moving) {
      const city = CITIES.find(c => c.id === p.cityId);
      if (city) { p.x = city.x; p.y = city.y; }
    }

    // Particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; p.life -= dt; });

    // Confetti
    this.confetti = this.confetti.filter(c => c.life > 0);
    this.confetti.forEach(c => {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.rotSpd * dt;
      c.vy += 30 * dt; // gravity
      c.life -= dt;
    });
  },

  spawnParticles(x, y, color = '#ffd966', n = 8) {
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n;
      this.particles.push({ x, y, vx: Math.cos(angle) * H.rand(40,90), vy: Math.sin(angle) * H.rand(40,90) - 60, color, life: 0.7, r: H.randi(3,6) });
    }
  },

  // ===================== RENDER =====================
  render(ctx) {
    this._drawBackground(ctx);
    this._drawEdges(ctx);
    this._drawJourneyPath(ctx);
    this._drawCities(ctx);
    this._drawNPCs(ctx);
    this._drawPlayer(ctx);
    this._drawParticles(ctx);
    if (!this.postGame.visible) {
      this._drawMissionPanel(ctx);
      this._drawJourneyHUD(ctx);
    }
    if (this.postGame.visible) this._drawPostGamePanel(ctx);
    this._drawConfetti(ctx);
  },

  _drawBackground(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, '#b6e7ff'); sky.addColorStop(1, '#e8f7ff');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CONST.CANVAS_W, 260);
    const gnd = ctx.createLinearGradient(0, 260, 0, CONST.CANVAS_H);
    gnd.addColorStop(0, CONST.COLORS.grass); gnd.addColorStop(1, CONST.COLORS.grassDark);
    ctx.fillStyle = gnd; ctx.fillRect(0, 260, CONST.CANVAS_W, CONST.CANVAS_H - 260);
    ctx.fillStyle = CONST.COLORS.grassDarker;
    [[100,280,40,10],[250,350,60,12],[500,400,50,10],[720,310,45,10],[850,450,55,12]].forEach(([x,y,w,h]) => {
      ctx.beginPath(); ctx.ellipse(x,y,w,h,0,0,Math.PI*2); ctx.fill();
    });
    this.clouds.forEach(c => {
      const sp = Sprite.cloud(); ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(sp, c.x-24, c.y-9); ctx.restore();
    });
    this.birds.forEach(b => { ctx.drawImage(Sprite.bird(b.frame), b.x-5, b.y-3); });
    [[60,270],[120,280],[700,270],[760,280],[860,265]].forEach(([x,y]) => { ctx.drawImage(Sprite.tree(), x-12, y-28); });
  },

  _drawEdges(ctx) {
    EDGES.forEach(e => {
      const a = CITIES.find(c => c.id === e.a), b = CITIES.find(c => c.id === e.b);
      if (!a || !b) return;
      const aUnlocked = this.state.unlockedCities.includes(e.a);
      const bUnlocked = this.state.unlockedCities.includes(e.b);
      const tinfo = TERRAIN_INFO[e.terrain] || { color: '#c79a6b' };
      ctx.save();
      ctx.strokeStyle = (aUnlocked && bUnlocked) ? tinfo.color : 'rgba(100,100,100,0.35)';
      ctx.lineWidth   = (aUnlocked && bUnlocked) ? 5 : 3;
      if (!aUnlocked || !bUnlocked) ctx.setLineDash([6,6]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([]);
      if (aUnlocked && bUnlocked) {
        const mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
        const eff = Math.round(e.cost * (TERRAIN_INFO[e.terrain]||{mult:1}).mult);
        ctx.fillStyle = 'rgba(26,19,37,0.75)'; ctx.fillRect(mx-14,my-9,28,14);
        ctx.font = '10px "Press Start 2P",monospace'; ctx.fillStyle = tinfo.color;
        ctx.textAlign = 'center'; ctx.fillText(eff, mx, my+3);
      }
      ctx.restore();
    });
  },

  _drawJourneyPath(ctx) {
    const path = this.journey.path;
    if (path.length < 2) return;
    ctx.save();
    ctx.strokeStyle = '#ffd966';
    ctx.lineWidth = 4;
    ctx.setLineDash([8,4]);
    ctx.shadowColor = '#ffd966';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const city = CITIES.find(c => c.id === path[i]);
      if (!city) continue;
      if (i === 0) ctx.moveTo(city.x, city.y);
      else ctx.lineTo(city.x, city.y);
    }
    if (this.player.moving) ctx.lineTo(this.player.x, this.player.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  _drawCities(ctx) {
    const curCity    = this.player.cityId;
    const missionTo  = this.selectedMission ? this.selectedMission.to   : null;
    const missionFrom = this.selectedMission ? this.selectedMission.from : null;

    CITIES.forEach(city => {
      const unlocked = this.state.unlockedCities.includes(city.id);
      const isCurrent = city.id === curCity;
      const isTarget  = city.id === missionTo;
      const isOrigin  = city.id === missionFrom;
      const isHover   = city.id === this.hoverCity;
      const isInPath  = this.journey.path.includes(city.id);

      ctx.save();
      if (!unlocked) ctx.globalAlpha = 0.4;
      ctx.drawImage(Sprite.house(city.type), city.x-18, city.y-32);
      ctx.restore();

      const r = isCurrent ? 16 : (isHover ? 14 : 12);
      ctx.save();
      if (isTarget) {
        const pulse = 0.7 + Math.sin(this.animT * 4) * 0.3;
        ctx.globalAlpha = pulse;
      }
      ctx.beginPath(); ctx.arc(city.x, city.y, r, 0, Math.PI*2);
      if (!unlocked)      ctx.fillStyle = '#555';
      else if (isCurrent) ctx.fillStyle = CONST.ALGO_COLORS.start;
      else if (isTarget)  ctx.fillStyle = CONST.ALGO_COLORS.goal;
      else if (isOrigin)  ctx.fillStyle = CONST.COLORS.warm;
      else if (isInPath && this.journey.active) ctx.fillStyle = '#ffa040';
      else if (isHover)   ctx.fillStyle = CONST.COLORS.cream;
      else                ctx.fillStyle = CONST.COLORS.sand;
      ctx.strokeStyle = isCurrent ? '#2d1b3d' : (isTarget ? '#a784e0' : '#2d1b3d');
      ctx.lineWidth = isCurrent ? 4 : 2;
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = '10px "Press Start 2P",monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = unlocked ? '#fff4d6' : 'rgba(255,244,214,0.35)';
      ctx.strokeStyle = 'rgba(26,19,37,0.9)'; ctx.lineWidth = 4;
      ctx.strokeText(city.name, city.x, city.y+24); ctx.fillText(city.name, city.x, city.y+24);
      ctx.restore();

      if (!unlocked) {
        ctx.save(); ctx.font = '14px monospace'; ctx.textAlign = 'center';
        ctx.fillText('🔒', city.x, city.y-2); ctx.restore();
      }

      if (isTarget) {
        const bounce = Math.sin(this.animT * 4) * 5;
        ctx.save(); ctx.font = '20px monospace'; ctx.textAlign = 'center';
        ctx.fillText('🎯', city.x, city.y - 44 + bounce); ctx.restore();
      }
    });
  },

  _drawNPCs(ctx) {
    this.npcs.forEach(npc => {
      const city = CITIES.find(c => c.id === npc.cityId);
      if (!city || !this.state.unlockedCities.includes(city.id)) return;
      const bopY = Math.sin(this.animT * 2 + npc.cityId.length) * 2;
      ctx.save();
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(npc.icon, city.x + 26, city.y - 30 + bopY);
      ctx.font = '7px "Press Start 2P",monospace';
      ctx.fillStyle = npc.color;
      ctx.fillText('!', city.x + 26, city.y - 40 + bopY);
      ctx.restore();
    });
  },

  _drawPlayer(ctx) {
    const p = this.player;
    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 8, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Animasi senang: bounce
    let oy = 0;
    if (p.happy) {
      oy = -Math.abs(Math.sin(p.happyT * 8)) * 10;
    }
    // Animasi sedih: drooping
    if (p.sad) {
      oy = Math.sin(p.sadT * 3) * 2;
    }

    const sp = Sprite.player(p.dir, p.frame);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sp, p.x - 12, p.y - 36 + oy, 24, 30);
    ctx.restore();

    // Ekspresi di atas kepala
    if (p.happy) {
      ctx.save();
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('😄', p.x, p.y - 50 + oy);
      ctx.restore();
    }
    if (p.sad) {
      ctx.save();
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('😞', p.x, p.y - 50 + oy);
      ctx.restore();
    }

    // Jejak kaki
    if (p.moving && Math.random() < 0.3) {
      this.particles.push({
        x: p.x + (Math.random()-0.5)*6,
        y: p.y + 2,
        vx: (Math.random()-0.5)*20,
        vy: Math.random()*-15,
        color: '#c79a6b',
        life: 0.3,
        r: 2
      });
    }
  },

  _drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save(); ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color; ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); ctx.restore();
    });
  },

  _drawConfetti(ctx) {
    this.confetti.forEach(c => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life / 1.5);
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size * 0.6);
      ctx.restore();
    });
  },

  _drawMissionPanel(ctx) {
    const px = 10, py = CONST.CANVAS_H - 185, pw = 340, ph = 175;
    ctx.save();
    ctx.fillStyle = 'rgba(26,19,37,0.92)'; ctx.strokeStyle = '#6e4ba0'; ctx.lineWidth = 3;
    ctx.fillRect(px,py,pw,ph); ctx.strokeRect(px,py,pw,ph);

    ctx.font = '9px "Press Start 2P",monospace'; ctx.fillStyle = '#ffd966';
    ctx.fillText('MISI TERSEDIA', px+10, py+16);

    ctx.font = '8px "Press Start 2P",monospace'; ctx.fillStyle = '#a784e0';
    ctx.fillText('WASD / ← ↑ ↓ → untuk bergerak', px+10, py+28);

    const missions = this.state.missions || [];
    missions.slice(0, 4).forEach((m, i) => {
      const my = py + 36 + i * 34;
      const selected = this.selectedMission && this.selectedMission.id === m.id;
      ctx.fillStyle = selected ? 'rgba(255,217,102,0.25)' : 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = selected ? '#ffd966' : '#3a2a52'; ctx.lineWidth = 2;
      ctx.fillRect(px+6, my, pw-12, 30); ctx.strokeRect(px+6, my, pw-12, 30);
      const urg = URGENCY_INFO[m.urgency] || { color: '#5fd66e' };
      ctx.fillStyle = urg.color; ctx.fillRect(px+6, my, 4, 30);
      ctx.font = '11px "VT323",monospace'; ctx.fillStyle = '#fff4d6';
      ctx.fillText(m.icon + ' ' + m.item, px+16, my+12);
      const fromName = (CITIES.find(c=>c.id===m.from)||{name:m.from}).name;
      const toName   = (CITIES.find(c=>c.id===m.to)||{name:m.to}).name;
      ctx.font = '10px "VT323",monospace'; ctx.fillStyle = '#ffaecf';
      ctx.fillText(fromName + ' → ' + toName, px+16, my+23);
      ctx.font = '9px "Press Start 2P",monospace'; ctx.fillStyle = '#ffd966';
      ctx.fillText('💰'+m.pay, px+pw-70, my+18);
    });

    if (missions.length === 0) {
      ctx.font = '11px "VT323",monospace'; ctx.fillStyle = '#ffaecf';
      ctx.fillText('Semua misi selesai! Tekan BARU', px+10, py+80);
    }

    ctx.fillStyle = '#3a2a52'; ctx.strokeStyle = '#6e4ba0'; ctx.lineWidth = 2;
    ctx.fillRect(px+6, py+ph-28, 90, 22); ctx.strokeRect(px+6, py+ph-28, 90, 22);
    ctx.font = '8px "Press Start 2P",monospace'; ctx.fillStyle = '#ffd966';
    ctx.fillText('🔄 BARU', px+14, py+ph-12);

    ctx.font = '10px "VT323",monospace'; ctx.fillStyle = '#ffaecf';
    ctx.fillText('Hari ke-'+(this.state.day||1)+'  Selesai: '+this.state.missionsCompleted, px+110, py+ph-14);
    ctx.restore();
  },

  _drawJourneyHUD(ctx) {
    if (!this.journey.active && !this.selectedMission) return;
    const jx = 360, jy = 8, jw = 240, jh = 36;
    ctx.save();
    ctx.fillStyle = 'rgba(26,19,37,0.9)'; ctx.strokeStyle = '#ffd966'; ctx.lineWidth = 2;
    ctx.fillRect(jx, jy, jw, jh); ctx.strokeRect(jx, jy, jw, jh);

    if (this.selectedMission) {
      const m = this.selectedMission;
      const toCity = CITIES.find(c => c.id === m.to);
      ctx.font = '8px "Press Start 2P",monospace'; ctx.fillStyle = '#ffd966';
      ctx.textAlign = 'center';
      ctx.fillText(m.icon + ' → ' + (toCity ? toCity.name : m.to), jx + jw/2, jy + 13);
      ctx.font = '9px "VT323",monospace'; ctx.fillStyle = '#ffaecf';
      ctx.fillText('Biaya: ' + this.journey.totalCost + '  Langkah: ' + (this.journey.path.length-1), jx + jw/2, jy + 28);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  },

  // ===================== POST-GAME PANEL (3 TAHAP + RESULT) =====================
  _drawPostGamePanel(ctx) {
    const d = this.postGame.data;
    if (!d) return;

    // Dim background
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CONST.CANVAS_W, CONST.CANVAS_H);

    switch (this.postGame.phase) {
      case 'route':     this._drawPhaseRoute(ctx, d);     break;
      case 'strategy':  this._drawPhaseStrategy(ctx, d);  break;
      case 'recommend': this._drawPhaseRecommend(ctx, d); break;
      case 'result':    this._drawPhaseResult(ctx, d);    break;
    }

    ctx.restore();
  },

  _panelBase(ctx, pw, ph, borderColor) {
    const px = (CONST.CANVAS_W - pw) / 2;
    const py = (CONST.CANVAS_H - ph) / 2;
    ctx.fillStyle = '#100c1e';
    ctx.strokeStyle = borderColor || '#6e4ba0';
    ctx.lineWidth = 3;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeRect(px, py, pw, ph);

    // Hint lanjut
    const hint = 'ENTER / Klik untuk lanjut';
    ctx.font = '7px "Press Start 2P",monospace';
    ctx.fillStyle = 'rgba(167,132,224,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(hint, CONST.CANVAS_W/2, py + ph - 8);
    ctx.textAlign = 'left';

    return { px, py };
  },

  // Tahap 1: Jalur yang Dipilih Pemain
  _drawPhaseRoute(ctx, d) {
    const pw = 520, ph = 340;
    const { px, py } = this._panelBase(ctx, pw, ph, '#ffd966');

    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P",monospace';
    ctx.fillStyle = '#ffd966';
    ctx.fillText('HASIL PERJALANAN', CONST.CANVAS_W/2, py + 24);

    ctx.font = '9px "Press Start 2P",monospace';
    ctx.fillStyle = '#a784e0';
    ctx.fillText('Rute yang Kamu Pilih:', CONST.CANVAS_W/2, py + 50);

    // Gambar jalur pemain sebagai rantai kota
    const names = d.playerPath.map(id => (CITIES.find(c=>c.id===id)||{name:id}).name);
    let y = py + 72;
    names.forEach((name, i) => {
      ctx.font = '11px "VT323",monospace';
      ctx.fillStyle = i === 0 ? '#5fd66e' : (i === names.length - 1 ? '#ff5b6e' : '#fff4d6');
      ctx.fillText(name, CONST.CANVAS_W/2, y);
      if (i < names.length - 1) {
        ctx.fillStyle = '#a784e0';
        ctx.font = '14px monospace';
        ctx.fillText('↓', CONST.CANVAS_W/2, y + 14);
        y += 26;
      } else {
        y += 16;
      }
    });

    y += 14;
    ctx.fillStyle = 'rgba(26,19,37,0.7)';
    ctx.fillRect(px + 40, y, pw - 80, 50);
    ctx.strokeStyle = '#3a2a52'; ctx.lineWidth = 1;
    ctx.strokeRect(px + 40, y, pw - 80, 50);

    ctx.font = '10px "VT323",monospace'; ctx.fillStyle = '#ffd966';
    ctx.fillText('Total Biaya   : ' + d.playerCost, CONST.CANVAS_W/2, y + 16);
    ctx.fillText('Jumlah Kota   : ' + d.playerSteps, CONST.CANVAS_W/2, y + 30);
    ctx.fillText('Waktu Tempuh  : ' + d.elapsedSec + ' detik', CONST.CANVAS_W/2, y + 44);

    ctx.textAlign = 'left';
  },

  // Tahap 2: Analisis Cara Berpikir Pemain
  _drawPhaseStrategy(ctx, d) {
    const pw = 520, ph = 340;
    const { px, py } = this._panelBase(ctx, pw, ph, '#a784e0');

    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P",monospace';
    ctx.fillStyle = '#a784e0';
    ctx.fillText('ANALISIS STRATEGI', CONST.CANVAS_W/2, py + 24);

    ctx.font = '10px "VT323",monospace';
    ctx.fillStyle = '#fff4d6';
    ctx.fillText('Berdasarkan jalur yang kamu pilih,', CONST.CANVAS_W/2, py + 50);
    ctx.fillText('cara berpikirmu paling mirip dengan:', CONST.CANVAS_W/2, py + 64);

    // Nama algoritma — baru diungkap di sini
    const algoColor = { astar: '#5fd66e', dijkstra: '#4ab8e6', greedy: '#ff8c42' };
    ctx.font = '14px "Press Start 2P",monospace';
    ctx.fillStyle = algoColor[d.matchedAlgo] || '#ffd966';
    ctx.fillText(d.algoNames[d.matchedAlgo], CONST.CANVAS_W/2, py + 96);

    // Gambar kotak highlight
    const boxW = 340, boxH = 10 + d.mindsetDesc.length * 22 + 10;
    const boxX = CONST.CANVAS_W/2 - boxW/2;
    const boxY = py + 108;
    ctx.fillStyle = 'rgba(26,19,37,0.7)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = algoColor[d.matchedAlgo] || '#ffd966';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.font = '9px "Press Start 2P",monospace';
    ctx.fillStyle = '#ffaecf';
    ctx.fillText('Karena:', CONST.CANVAS_W/2, boxY + 18);

    d.mindsetDesc.forEach((line, i) => {
      ctx.font = '11px "VT323",monospace';
      ctx.fillStyle = '#fff4d6';
      ctx.fillText('• ' + line, CONST.CANVAS_W/2, boxY + 36 + i * 22);
    });

    // Pesan motivasi
    const y2 = boxY + boxH + 20;
    ctx.font = '10px "VT323",monospace';
    ctx.fillStyle = '#ffd966';
    ctx.fillText('"Oh, ternyata aku berpikir seperti ' + d.algoNames[d.matchedAlgo] + '!"', CONST.CANVAS_W/2, y2);

    ctx.textAlign = 'left';
  },

  // Tahap 3: Rekomendasi Jalur Terbaik
  _drawPhaseRecommend(ctx, d) {
    const pw = 520, ph = 340;
    const { px, py } = this._panelBase(ctx, pw, ph, '#5fd66e');

    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P",monospace';
    ctx.fillStyle = '#5fd66e';
    ctx.fillText('REKOMENDASI SISTEM', CONST.CANVAS_W/2, py + 24);

    if (d.isOptimal) {
      // Pemain sudah optimal
      ctx.font = '16px monospace';
      ctx.fillText('🌟', CONST.CANVAS_W/2, py + 70);
      ctx.font = '11px "Press Start 2P",monospace';
      ctx.fillStyle = '#ffd966';
      ctx.fillText('Selamat!', CONST.CANVAS_W/2, py + 100);
      ctx.font = '12px "VT323",monospace';
      ctx.fillStyle = '#5fd66e';
      ctx.fillText('Rute yang kamu pilih sudah merupakan', CONST.CANVAS_W/2, py + 124);
      ctx.fillText('rute paling optimal!', CONST.CANVAS_W/2, py + 140);
      ctx.font = '11px "VT323",monospace';
      ctx.fillStyle = '#a784e0';
      ctx.fillText('(Diverifikasi oleh ' + d.algoNames[d.optimalAlgo] + ')', CONST.CANVAS_W/2, py + 162);
    } else {
      ctx.font = '10px "VT323",monospace';
      ctx.fillStyle = '#fff4d6';
      ctx.fillText('Untuk pengiriman ini, jalur optimal adalah:', CONST.CANVAS_W/2, py + 50);

      const optNames = (d.optimalPath||[]).map(id => (CITIES.find(c=>c.id===id)||{name:id}).name);
      let y = py + 72;
      optNames.forEach((name, i) => {
        ctx.font = '11px "VT323",monospace';
        ctx.fillStyle = i === 0 ? '#5fd66e' : (i === optNames.length - 1 ? '#ff5b6e' : '#fff4d6');
        ctx.fillText(name, CONST.CANVAS_W/2, y);
        if (i < optNames.length - 1) {
          ctx.fillStyle = '#5fd66e';
          ctx.font = '14px monospace';
          ctx.fillText('↓', CONST.CANVAS_W/2, y + 14);
          y += 26;
        } else {
          y += 16;
        }
      });

      y += 14;
      ctx.font = '9px "VT323",monospace';
      ctx.fillStyle = '#a784e0';
      ctx.fillText('Dihasilkan oleh: ' + d.algoNames[d.optimalAlgo], CONST.CANVAS_W/2, y); y += 18;
      ctx.fillStyle = '#5fd66e';
      ctx.font = '10px "VT323",monospace';
      ctx.fillText('Total Biaya : ' + Math.round(d.optimalCost), CONST.CANVAS_W/2, y); y += 18;
      ctx.fillStyle = '#ffd966';
      ctx.fillText('Lebih hemat ' + Math.round(d.costDiff) + ' poin dari jalurmu!', CONST.CANVAS_W/2, y);
    }

    ctx.textAlign = 'left';
  },

  // Tahap 4: Hasil Akhir (Menang / Kalah)
  _drawPhaseResult(ctx, d) {
    const isWin = this.postGame.winLose === 'win';
    const pw = 560, ph = 380;
    const { px, py } = this._panelBase(ctx, pw, ph, isWin ? '#ffd966' : '#ff5b6e');

    ctx.textAlign = 'center';

    if (isWin) {
      // Menang
      const bounce = Math.sin(this.postGame.pageT * 5) * 4;
      ctx.font = '28px monospace';
      ctx.fillText('🏆', CONST.CANVAS_W/2, py + 50 + bounce);

      ctx.font = '14px "Press Start 2P",monospace';
      ctx.fillStyle = '#ffd966';
      ctx.fillText('MENANG!', CONST.CANVAS_W/2, py + 82 + bounce);

      ctx.font = '12px "VT323",monospace';
      ctx.fillStyle = '#fff4d6';
      if (d.isOptimal) {
        ctx.fillText('Kamu berhasil menemukan jalur terbaik!', CONST.CANVAS_W/2, py + 108);
      } else {
        ctx.fillText('Kamu memilih jalur yang cukup efisien!', CONST.CANVAS_W/2, py + 108);
      }

      // Box reward
      const bx = px + 80, by = py + 128, bw = pw - 160, bh = 70;
      ctx.fillStyle = 'rgba(255,217,102,0.15)';
      ctx.strokeStyle = '#ffd966'; ctx.lineWidth = 2;
      ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh);

      ctx.font = '10px "Press Start 2P",monospace'; ctx.fillStyle = '#5fd66e';
      ctx.fillText('Bonus:', CONST.CANVAS_W/2, by + 22);
      ctx.font = '12px "VT323",monospace'; ctx.fillStyle = '#ffd966';
      ctx.fillText('+' + (d.bonusXp || d.netPay/2 | 0) + ' XP', CONST.CANVAS_W/2, by + 42);
      ctx.fillText('+' + (d.bonusPay || d.netPay) + ' Koin', CONST.CANVAS_W/2, by + 58);

      // Tombol tutup
      const btnX = CONST.CANVAS_W/2 - 80, btnY = py + ph - 52, btnW = 160, btnH = 28;
      ctx.fillStyle = '#ffd966'; ctx.strokeStyle = '#1a1325'; ctx.lineWidth = 2;
      ctx.fillRect(btnX, btnY, btnW, btnH); ctx.strokeRect(btnX, btnY, btnW, btnH);
      ctx.font = '9px "Press Start 2P",monospace'; ctx.fillStyle = '#1a1325';
      ctx.fillText('▶ LANJUTKAN', CONST.CANVAS_W/2, btnY + 18);
      this._resultBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };

    } else {
      // Kalah
      ctx.font = '28px monospace';
      ctx.fillText('😞', CONST.CANVAS_W/2, py + 52);

      ctx.font = '14px "Press Start 2P",monospace';
      ctx.fillStyle = '#ff5b6e';
      ctx.fillText('KALAH', CONST.CANVAS_W/2, py + 84);

      ctx.font = '12px "VT323",monospace';
      ctx.fillStyle = '#fff4d6';
      ctx.fillText('Masih ada jalur yang lebih efisien.', CONST.CANVAS_W/2, py + 108);
      ctx.fillText('Coba pelajari kembali pola perjalananmu', CONST.CANVAS_W/2, py + 126);
      ctx.fillText('dan temukan rute terbaik!', CONST.CANVAS_W/2, py + 144);

      // Info selisih
      const bx = px + 80, by = py + 162, bw = pw - 160, bh = 50;
      ctx.fillStyle = 'rgba(255,91,110,0.12)';
      ctx.strokeStyle = '#ff5b6e'; ctx.lineWidth = 2;
      ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh);
      ctx.font = '11px "VT323",monospace'; ctx.fillStyle = '#ffd966';
      ctx.fillText('Biayamu: ' + d.playerCost + '  |  Optimal: ' + Math.round(d.optimalCost), CONST.CANVAS_W/2, by + 20);
      ctx.fillStyle = '#ff5b6e';
      ctx.fillText('Selisih: ' + Math.round(d.costDiff) + ' poin', CONST.CANVAS_W/2, by + 38);

      // Tombol coba lagi
      const btnX = CONST.CANVAS_W/2 - 90, btnY = py + ph - 52, btnW = 180, btnH = 28;
      ctx.fillStyle = '#ff5b6e'; ctx.strokeStyle = '#1a1325'; ctx.lineWidth = 2;
      ctx.fillRect(btnX, btnY, btnW, btnH); ctx.strokeRect(btnX, btnY, btnW, btnH);
      ctx.font = '9px "Press Start 2P",monospace'; ctx.fillStyle = '#fff';
      ctx.fillText('↺ COBA LAGI', CONST.CANVAS_W/2, btnY + 18);
      this._resultBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };
    }

    ctx.textAlign = 'left';
  },

  _wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    for (let w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line.trim(), x, y); y += lineH; line = '';
      }
      line += w + ' ';
    }
    if (line.trim()) ctx.fillText(line.trim(), x, y);
  },

  // ===================== INPUT =====================
  onClick(mx, my) {
    if (Dialog.isOpen()) return;

    // Post-game panel
    if (this.postGame.visible) {
      // Cek tombol result
      if (this.postGame.phase === 'result' && this._resultBtnRect) {
        const r = this._resultBtnRect;
        if (mx>=r.x && mx<=r.x+r.w && my>=r.y && my<=r.y+r.h) {
          Audio.click();
          this.postGame.visible = false;
          this.postGame.phase = 'none';
          this.player.happy = false;
          this.player.sad = false;
          this.confetti = [];
          return;
        }
      }
      this._advancePostGame();
      return;
    }

    if (!document.getElementById('modal-overlay').classList.contains('hidden')) return;

    const s = this.state;

    // Refresh missions button
    const px = 10, py = CONST.CANVAS_H - 185, ph = 175;
    if (mx >= px+6 && mx <= px+96 && my >= py+ph-28 && my <= py+ph-6) {
      if (this.journey.active) { Notify.show('Selesaikan misi dulu!','warn'); return; }
      Audio.click();
      MissionSystem.refresh(s);
      this.selectedMission = null;
      this._resetJourney();
      Notify.show('Misi baru tersedia!','ok');
      SaveSystem.save(s);
      return;
    }

    // Mission card click
    const mpx=10, mpy=CONST.CANVAS_H-185;
    if (mx>=mpx && mx<=mpx+340 && my>=mpy+34) {
      const missions = s.missions || [];
      const idx = Math.floor((my - mpy - 36) / 34);
      if (idx>=0 && idx<missions.length) {
        this._selectMission(missions[idx]);
        return;
      }
    }

    // City click
    const city = CITIES.find(c => H.pointInCircle(mx, my, c.x, c.y, 18));
    if (city) {
      Audio.click();
      if (!s.unlockedCities.includes(city.id)) {
        Notify.show(city.name + ' belum terbuka!','warn'); return;
      }
      const npc = this.npcs.find(n => n.cityId === city.id);
      if (npc && city.id === this.player.cityId) {
        const lines = npc.dialogs[npc.dialogIdx % npc.dialogs.length];
        npc.dialogIdx++;
        Dialog.show(npc.name, lines);
        return;
      }
      if (npc && city.id !== this.player.cityId) {
        Notify.show('Pergi ke ' + city.name + ' dulu!', 'warn', 1500);
        return;
      }
      const fromHere = (s.missions||[]).filter(m=>m.from===city.id||m.to===city.id);
      Dialog.show(city.name, [
        '📍 '+ city.name + ' (' + city.region + ')',
        fromHere.length > 0 ? 'Ada '+ fromHere.length +' misi terkait kota ini.' : 'Tidak ada misi terkait.',
        this.player.cityId === city.id ? 'Kamu sedang berada di sini.' : 'Gunakan WASD untuk bergerak ke sini.',
      ]);
    }
  },

  onMouseMove(mx, my) {
    const city = CITIES.find(c => H.pointInCircle(mx, my, c.x, c.y, 18));
    this.hoverCity = city ? city.id : null;
  },

  onKey(key) {
    this._handleKey(key);
  },
};
