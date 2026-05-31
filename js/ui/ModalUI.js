/* Modal UI - shop, academy, achievements, comparison */
const Modal = {
  el: null, titleEl: null, bodyEl: null, closeEl: null,
  init() {
    this.el = document.getElementById('modal-overlay');
    this.titleEl = document.getElementById('modal-title');
    this.bodyEl = document.getElementById('modal-body');
    this.closeEl = document.getElementById('modal-close');
    this.closeEl.onclick = () => this.hide();
    this.el.addEventListener('click', (e) => { if (e.target === this.el) this.hide(); });
  },
  show(title, html) {
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = html;
    this.el.classList.remove('hidden');
    Audio.open();
  },
  hide() { this.el.classList.add('hidden'); },

  showShop(state, onChange) {
    let html = '<h3 class="section-h">Toko Kendaraan</h3>';
    html += '<p>Pilih kendaraan untuk meningkatkan kecepatan & kapasitas.</p>';
    html += '<div class="grid-2">';
    VEHICLES.forEach(v => {
      const owned = state.ownedVehicles.includes(v.id);
      const equipped = state.vehicleId === v.id;
      const canBuy = !owned && state.money >= v.cost && state.level >= v.level;
      const locked = state.level < v.level;
      html += `<div class="card ${locked ? 'lock' : ''}">
        <div class="card-title">${v.icon} ${v.name} ${equipped ? '<span class="tag ok">DIPAKAI</span>' : ''}</div>
        <div>${v.desc}</div>
        <div class="card-row"><span>Kecepatan</span><b>${v.speed.toFixed(1)}x</b></div>
        <div class="card-row"><span>Kapasitas</span><b>${v.cap.toFixed(1)}x</b></div>
        <div class="card-row"><span>Biaya Operasi</span><b>${v.op}</b></div>
        <div class="card-row"><span>Harga</span><b>💰 ${H.format(v.cost)}</b></div>
        <div class="card-row"><span>Syarat</span><b>Lv ${v.level + 1}</b></div>
        <div style="margin-top:8px;">
          ${owned
            ? (equipped ? '<button class="pixel-btn small" disabled>Dipakai</button>' : `<button class="pixel-btn small primary" data-equip="${v.id}" data-testid="equip-${v.id}">Pakai</button>`)
            : (locked ? '<button class="pixel-btn small" disabled>Terkunci</button>' : `<button class="pixel-btn small ${canBuy ? 'primary' : ''}" ${canBuy ? '' : 'disabled'} data-buy="${v.id}" data-testid="buy-${v.id}">Beli</button>`)}
        </div>
      </div>`;
    });
    html += '</div>';
    this.show('Toko Kendaraan', html);
    this.bodyEl.querySelectorAll('[data-buy]').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-buy');
        const v = getVehicle(id);
        if (Economy.spend(state, v.cost)) {
          state.ownedVehicles.push(id);
          state.vehicleId = id;
          Audio.coin();
          Notify.show(`Berhasil membeli ${v.name}!`, 'ok');
          onChange && onChange();
          this.showShop(state, onChange);
        } else { Notify.show('Uang tidak cukup!', 'err'); }
      };
    });
    this.bodyEl.querySelectorAll('[data-equip]').forEach(b => {
      b.onclick = () => {
        state.vehicleId = b.getAttribute('data-equip');
        Audio.click();
        Notify.show(`Beralih ke ${getVehicle(state.vehicleId).name}`, 'ok');
        onChange && onChange();
        this.showShop(state, onChange);
      };
    });
  },

  showAchievements(state) {
    let html = '<h3 class="section-h">Prestasi</h3>';
    html += `<p>Diperoleh: <b>${state.achievements.length}</b> / ${ACHIEVEMENTS.length}</p>`;
    html += '<div class="grid-2">';
    ACHIEVEMENTS.forEach(a => {
      const got = state.achievements.includes(a.id);
      html += `<div class="card ${got ? '' : 'lock'}">
        <div class="card-title">${a.icon} ${a.name}</div>
        <div>${a.desc}</div>
        <div style="margin-top:6px;">${got ? '<span class="tag ok">DIPEROLEH</span>' : '<span class="tag">BELUM</span>'}</div>
      </div>`;
    });
    html += '</div>';
    this.show('Prestasi', html);
  },

  // Akademi: hanya muncul SETELAH pemain bermain (setelah ada analisis)
  showAcademy() {
    let html = `<h3 class="section-h">📚 Akademi Pedagang</h3>
    <p style="color:#ffaecf;">Materi ini tersedia setelah kamu menyelesaikan misi dan mendapatkan analisis perjalanan.</p>
    <div class="card">
      <div class="card-title">🗺️ Graf dan Jaringan Kota</div>
      <p>Peta kota di game ini sebenarnya adalah sebuah <b>graf</b> — jaringan simpul (kota) yang terhubung lewat jalur (jalan). Setiap jalan punya <b>biaya</b> yang mencerminkan kondisi medan.</p>
    </div>
    <div class="card">
      <div class="card-title">💡 Tiga Cara Komputer Menemukan Jalur</div>
      <p>Komputer punya strategi berbeda untuk menemukan jalur. Setiap strategi punya karakter dan hasil yang berbeda pula. Kamu bisa menemukan pola berpikir masing-masing lewat pengalamanmu bermain!</p>
    </div>
    <div class="card" style="border-color:#5fd66e;">
      <div class="card-title" style="color:#5fd66e;">🟢 Strategi A (A* Search)</div>
      <p>Menggabungkan biaya perjalanan nyata dengan estimasi jarak ke tujuan. Hasilnya: jalur yang efisien dan terarah.</p>
      <p style="color:#ffaecf;font-size:13px;">Karakter: Seimbang antara biaya dan arah.</p>
    </div>
    <div class="card" style="border-color:#4ab8e6;">
      <div class="card-title" style="color:#4ab8e6;">🔵 Strategi B (Dijkstra)</div>
      <p>Hanya mempertimbangkan biaya nyata perjalanan. Menjamin jalur termurah, tapi tidak peduli apakah sedang mendekat ke tujuan atau tidak.</p>
      <p style="color:#ffaecf;font-size:13px;">Karakter: Hemat biaya, tapi lebih lambat mencari.</p>
    </div>
    <div class="card" style="border-color:#ff8c42;">
      <div class="card-title" style="color:#ff8c42;">🟠 Strategi C (Greedy Best-First)</div>
      <p>Selalu memilih kota yang terlihat paling dekat ke tujuan. Cepat bergerak, tapi sering mengabaikan biaya total.</p>
      <p style="color:#ffaecf;font-size:13px;">Karakter: Langsung menuju tujuan, tidak selalu termurah.</p>
    </div>
    <div class="card">
      <div class="card-title">🧪 Kuis Refleksi</div>
      <div id="quiz-container"></div>
    </div>`;
    this.show('Akademi Pedagang', html);
    this.renderQuiz();
  },

  renderQuiz() {
    const questions = [
      { q: 'Strategi mana yang menjamin jalur termurah?', opts: ['Strategi C (selalu ke yang dekat)', 'Strategi A atau B (pertimbangkan biaya)', 'Tidak ada yang menjamin'], correct: 1 },
      { q: 'Apa yang dilakukan Strategi C (Greedy)?', opts: ['Menghitung total biaya semua rute', 'Selalu memilih kota paling dekat ke tujuan', 'Menggabungkan biaya dan estimasi jarak'], correct: 1 },
      { q: 'Bagaimana cara kerjamu saat memilih jalur?', opts: ['Selalu ke kota yang paling dekat ke tujuan', 'Selalu pilih jalan paling murah', 'Gabungan keduanya tergantung situasi'], correct: 2 }
    ];
    const q = H.choice(questions);
    const c = document.getElementById('quiz-container');
    if (!c) return;
    c.innerHTML = `<div class="quiz-q">${q.q}</div>`;
    q.opts.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.setAttribute('data-testid', 'quiz-opt-' + i);
      b.onclick = () => {
        if (i === q.correct) { b.classList.add('correct'); Audio.success(); Notify.show('Jawaban benar!', 'ok'); }
        else { b.classList.add('wrong'); Audio.fail(); Notify.show('Coba lagi!', 'warn'); }
        setTimeout(() => this.renderQuiz(), 1300);
      };
      c.appendChild(b);
    });
  },

  // Perbandingan algoritma — hanya muncul SETELAH misi selesai, gunakan data analisis
  showComparePost(state, analysisData) {
    if (!analysisData) {
      this.show('Analisis Perjalanan', '<p>Selesaikan dulu satu misi untuk melihat analisis perbandingan!</p>');
      return;
    }

    const d = analysisData;
    const algoColor = { astar: '#5fd66e', dijkstra: '#4ab8e6', greedy: '#ff8c42' };
    const algoNames = d.algoNames;

    const playerPathNames = d.playerPath.map(id => (CITIES.find(c=>c.id===id)||{name:id}).name).join(' → ');
    const optPathNames = (d.optimalPath||[]).map(id => (CITIES.find(c=>c.id===id)||{name:id}).name).join(' → ');

    let html = `<h3 class="section-h">📊 Analisis Perjalanan Terakhir</h3>
    <div class="card" style="border-color:#ffd966;">
      <div class="card-title">🧳 Jalur Pilihanmu</div>
      <p>${playerPathNames}</p>
      <div class="card-row"><span>Total Biaya</span><b>${d.playerCost}</b></div>
      <div class="card-row"><span>Pola Berpikir</span><b style="color:${algoColor[d.matchedAlgo]||'#ffd966'}">${algoNames[d.matchedAlgo]}</b></div>
    </div>
    <div class="card" style="border-color:#5fd66e;">
      <div class="card-title">🏆 Jalur Optimal</div>
      <p>${optPathNames}</p>
      <div class="card-row"><span>Total Biaya</span><b>${Math.round(d.optimalCost)}</b></div>
      <div class="card-row"><span>Algoritma</span><b style="color:${algoColor[d.optimalAlgo]||'#5fd66e'}">${algoNames[d.optimalAlgo]}</b></div>
      <div class="card-row"><span>Status</span><b style="color:${d.isOptimal ? '#5fd66e' : '#ff5b6e'}">${d.isOptimal ? '✅ Kamu sudah optimal!' : '⚠️ Ada jalur lebih hemat'}</b></div>
    </div>
    <h3 class="section-h" style="margin-top:12px;">Perbandingan Lengkap</h3>`;

    ['astar','dijkstra','greedy'].forEach(k => {
      const r = d.results[k];
      const isOpt = k === d.optimalAlgo;
      const isMatch = k === d.matchedAlgo;
      const pathNames = r.path ? r.path.map(id=>(CITIES.find(c=>c.id===id)||{name:id}).name).join(' → ') : 'Tidak ditemukan';
      html += `<div class="card" style="border-color:${algoColor[k]};" data-testid="compare-card-${k}">
        <div class="card-title" style="color:${algoColor[k]}">${algoNames[k]}
          ${isOpt ? ' <span class="tag ok">★ OPTIMAL</span>' : ''}
          ${isMatch && !isOpt ? ' <span class="tag">≈ Pola pikirmu</span>' : ''}
        </div>
        <p style="font-size:14px;">${pathNames}</p>
        <div class="card-row"><span>Total Biaya</span><b>${r.path ? Math.round(r.cost) : '-'}</b></div>
        <div class="card-row"><span>Node Diperiksa</span><b>${r.visited}</b></div>
      </div>`;
    });

    this.show('Analisis Perjalanan', html);
  },
};
