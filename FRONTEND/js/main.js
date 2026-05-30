// ══════════════════════════════════════
//   MAIN — entry point
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {

  // ── Init Canvas ──
  initCanvas();
  initInput();

  // ── Pixel cursor track ──
  document.addEventListener('mousemove', e => {
    document.documentElement.style.setProperty('--cx', e.clientX + 'px');
    document.documentElement.style.setProperty('--cy', e.clientY + 'px');
  });

  // ── Title screen sprite ──
  document.getElementById('title-sprite').textContent = '🧑‍🌾';

  // ── Loading sequence ──
  await runLoading();

  // ── Show title ──
  showScreen('screen-title');
});

// ══════════════════════════════════════
//   LOADING SEQUENCE
// ══════════════════════════════════════
async function runLoading() {
  // Buat loading screen sementara
  const loadEl = document.createElement('div');
  loadEl.style.cssText = `
    position: fixed; inset: 0;
    background: #101018;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 20px; z-index: 9999;
    font-family: 'Press Start 2P', monospace;
  `;

  const logo = document.createElement('div');
  logo.style.cssText = `font-size: 20px; color: #f8d030;
    text-shadow: 4px 4px 0 #8a6000; text-align: center; line-height: 1.8;`;
  logo.innerHTML = 'PEDAGANG<br>KELILING';

  const barWrap = document.createElement('div');
  barWrap.style.cssText = `
    width: 280px; height: 14px;
    background: #1a1a28; border: 2px solid #383848;
  `;

  const bar = document.createElement('div');
  bar.style.cssText = `
    height: 100%; width: 0%; background: #f8d030;
    transition: width 0.3s ease;
  `;

  const tip = document.createElement('div');
  tip.style.cssText = `font-size: 8px; color: #606080; letter-spacing: 0.08em;`;
  tip.textContent   = 'Memuat aset game...';

  barWrap.appendChild(bar);
  loadEl.appendChild(logo);
  loadEl.appendChild(barWrap);
  loadEl.appendChild(tip);
  document.body.appendChild(loadEl);

  const tips = [
    'Memuat peta pasar...',
    'Menyiapkan algoritma DP...',
    'Melatih AI rival...',
    'Menghitung kombinasi...',
    'Siap berdagang!',
  ];

  // Animasi loading bar
  for (let i = 0; i <= 100; i += 20) {
    bar.style.width = i + '%';
    tip.textContent = tips[Math.floor(i / 20)] || tips[tips.length - 1];
    await sleep(220);
  }

  await sleep(300);
  loadEl.style.transition = 'opacity 0.4s';
  loadEl.style.opacity    = '0';
  await sleep(400);
  loadEl.remove();
}

// ══════════════════════════════════════
//   INJECT CSS TAMBAHAN
//   (yang tidak ada di file CSS utama)
// ══════════════════════════════════════
(function injectExtraCSS() {
  const style = document.createElement('style');
  style.textContent = `

    /* ── DP Panel bars update ── */
    #dp-bars .dp-bar-row { margin-bottom: 7px; }

    /* ── DP panel di game screen ── */
    #dp-panel {
      position: fixed;
      bottom: 32px; left: 0; right: 0;
    }

    /* ── dp-detail-view hidden ── */
    #dp-detail-view { display: none; }
    #dp-detail-view:not(.hidden) { display: block; }

    /* ── Kalk table cell fill animation ── */
    @keyframes cellFill {
      from { background: rgba(248,208,48,0.5); }
      to   { background: rgba(248,208,48,0.12); }
    }
    .filling { animation: cellFill 0.35s ease forwards; }

    /* ── Trace step animation ── */
    .trace-step {
      animation: fadeInUp 0.25s ease forwards;
      opacity: 0;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Dialog box bawah layar tidak overlap game ── */
    #screen-game #dialog-box {
      bottom: 32px;
    }

    /* ── HUD bottom height ── */
    #hud-bottom { height: 32px; }

    /* ── Popup shop dynamic ── */
    #popup-shop-dynamic .popup-box {
      max-width: 680px;
    }

    /* ── Analysis item fill animation ── */
    .analysis-item.show {
      opacity: 1 !important;
      transform: translateX(0) !important;
    }

    /* ── Kalk announce ── */
    #kalk-announce {
      border-left: 3px solid var(--cyan);
      padding-left: 10px;
    }

    /* ── Countdown size tweak ── */
    #countdown-num { font-size: 80px; }

    /* ── Screen title background stars anim ── */
    @keyframes starFloat {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }

    /* ── Pixel cursor hide native ── */
    * { cursor: none !important; }

    /* ── Toast animation ── */
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.9); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    }
    .toast { animation: toastIn 0.22s ease; }

    /* ── DP panel dp-bars realtime ── */
    .dp-bar-fill.opt    { background: #f8d030; }
    .dp-bar-fill.player { background: #48d858; }
    .dp-bar-fill.both   { background: #48d858; }
    .dp-bar-fill.none   { background: #383848; }

    /* ── Kalk step text code ── */
    .kalk-step-text code {
      color: #f8d030; font-family: 'Press Start 2P', monospace;
      font-size: 8px; background: #0a0a12;
      padding: 1px 4px;
    }

    /* ── dp-visualizer bars id fix ── */
    #dp-bar-opt    { background: #f8d030 !important; }
    #dp-bar-player { background: #48d858 !important; }
    #dp-bar-ai     { background: #f03030 !important; }
  `;
  document.head.appendChild(style);
})();