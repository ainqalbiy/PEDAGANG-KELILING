// ========== WEB AUDIO ENGINE ========== //
const SFX = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Tone primitif ──
  function playTone(freq, type, duration, volume = 0.3, startTime = 0) {
    const c = getCtx();
    const t = c.currentTime + startTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  function playNote(freq, duration, delay = 0, vol = 0.25) {
    playTone(freq, 'square', duration, vol, delay);
  }

  // ── SOUND EFFECTS ──

  // Koin pickup — blip naik
  function coin() {
    if (muted) return;
    playNote(523, 0.08, 0.00);
    playNote(659, 0.08, 0.08);
    playNote(784, 0.12, 0.16);
  }

  // Beli item — jingle 3 nada ceria
  function buy() {
    if (muted) return;
    playNote(523, 0.1, 0.00);
    playNote(659, 0.1, 0.10);
    playNote(784, 0.1, 0.20);
    playNote(1047,0.2, 0.30);
  }

  // Zelda chest jingle — item ditemukan
  function chest() {
    if (muted) return;
    const notes = [392, 494, 587, 784];
    notes.forEach((f, i) => playNote(f, 0.15, i * 0.12));
    playNote(784, 0.5, notes.length * 0.12);
  }

  // Menang ronde — fanfare
  function win() {
    if (muted) return;
    const melody = [523,659,784,659,784,1047];
    melody.forEach((f, i) => playNote(f, 0.15, i * 0.13, 0.3));
  }

  // Kalah ronde — nada turun dramatis
  function lose() {
    if (muted) return;
    playTone(400, 'sawtooth', 0.2, 0.25, 0.0);
    playTone(300, 'sawtooth', 0.2, 0.25, 0.2);
    playTone(200, 'sawtooth', 0.4, 0.3,  0.4);
  }

  // Timer warning — beep cepat
  function timerWarn() {
    if (muted) return;
    playNote(880, 0.06, 0.0, 0.2);
  }

  // Klik typewriter — tick kecil
  function tick() {
    if (muted) return;
    const c = getCtx();
    const buffer = c.createBuffer(1, c.sampleRate * 0.02, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = c.createBufferSource();
    const gain = c.createGain();
    src.buffer = buffer;
    gain.gain.value = 0.08;
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
  }

  // DP tabel sel terisi — tick ringan
  function dpTick() {
    if (muted) return;
    playTone(1200, 'sine', 0.04, 0.04);
  }

  // DP traceback highlight — nada tegas
  function dpTrace() {
    if (muted) return;
    playNote(659, 0.08, 0, 0.15);
    playNote(784, 0.1,  0.08, 0.15);
  }

  // Screen shake accompany — low thud
  function thud() {
    if (muted) return;
    playTone(60, 'sine', 0.15, 0.5);
  }

  // AI ambil item — nada sumbang
  function aiPickup() {
    if (muted) return;
    playTone(220, 'sawtooth', 0.12, 0.2);
    playTone(180, 'sawtooth', 0.1,  0.15, 0.12);
  }

  // Cursor move / confirm
  function confirm() {
    if (muted) return;
    playNote(784, 0.08, 0, 0.2);
    playNote(1047,0.1,  0.08, 0.2);
  }

  // Cancel / tutup popup
  function cancel() {
    if (muted) return;
    playNote(440, 0.08, 0, 0.15);
    playNote(330, 0.1,  0.08, 0.15);
  }

  // Toggle mute
  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function isMuted() { return muted; }

  return {
    coin, buy, chest, win, lose,
    timerWarn, tick, dpTick, dpTrace,
    thud, aiPickup, confirm, cancel,
    toggleMute, isMuted,
  };
})();