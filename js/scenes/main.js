/* main.js - Game bootstrap & main loop */
(function () {
  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Register scenes
  Scenes.register('menu',     MainMenu);
  Scenes.register('map',      MapScene);
  Scenes.register('delivery', DeliveryScene);
  Scenes.register('learning', LearningScene);

  // Init UI modules
  Dialog.init();
  Notify.init();
  Modal.init();

  // Canvas input
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width  / r.width;
    const sy = canvas.height / r.height;
    Scenes.onClick((e.clientX - r.left) * sx, (e.clientY - r.top) * sy);
  });
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width  / r.width;
    const sy = canvas.height / r.height;
    Scenes.onMouseMove((e.clientX - r.left) * sx, (e.clientY - r.top) * sy);
  });

  // Keyboard - prevent default scroll on game keys
  const GAME_KEYS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' ']);
  document.addEventListener('keydown', e => {
    if (GAME_KEYS.has(e.key)) e.preventDefault();
    Scenes.onKey(e.key);
  });

  // Splash loading
  const splashBar = document.getElementById('splash-bar');
  const splash    = document.getElementById('splash');
  let loadPct = 0;
  const loadInterval = setInterval(() => {
    loadPct += Math.random() * 18 + 8;
    splashBar.style.width = Math.min(loadPct, 100) + '%';
    if (loadPct >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
          Scenes.switch('map', { state: SaveSystem.load() });
        }, 600);
      }, 200);
    }
  }, 80);

  // Main loop
  let last = 0;
  function loop(ts) {
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Scenes.update(dt);
    Scenes.render(ctx);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
