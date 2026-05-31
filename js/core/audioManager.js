/* Web Audio API procedural sound effects + simple BGM */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmGain = null;
    this.bgmOsc = [];
    this.bgmInterval = null;
  }
  ensure() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { console.warn('AudioContext unavailable'); }
  }
  play(freq, dur = 0.08, type = 'square', vol = 0.08) {
    this.ensure();
    if (!this.ctx || this.muted) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime + dur);
  }
  click() { this.play(720, 0.05, 'square', 0.06); }
  type() { this.play(420, 0.03, 'square', 0.025); }
  step() { this.play(600, 0.04, 'triangle', 0.04); }
  scan() { this.play(880, 0.05, 'sine', 0.05); }
  open() { this.play(540, 0.06, 'square', 0.05); setTimeout(() => this.play(680, 0.06, 'square', 0.05), 60); }
  success() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.play(f, 0.12, 'square', 0.07), i * 80));
  }
  win() {
    // Fanfare kemenangan - lebih meriah
    const seq = [523, 659, 784, 1047, 784, 1047, 1319];
    seq.forEach((f, i) => setTimeout(() => this.play(f, 0.15, 'square', 0.09), i * 90));
  }
  lose() {
    // Melodi kalah - descending sad
    [392, 349, 311, 262].forEach((f, i) => setTimeout(() => this.play(f, 0.22, 'sawtooth', 0.07), i * 130));
  }
  fail() { this.play(220, 0.2, 'sawtooth', 0.08); }
  coin() { this.play(988, 0.06, 'square', 0.08); setTimeout(() => this.play(1318, 0.1, 'square', 0.08), 60); }
  walk() { this.play(330, 0.03, 'triangle', 0.03); }

  startBGM(theme = 'village') {
    this.ensure();
    if (!this.ctx || this.muted) return;
    this.stopBGM();
    const melodies = {
      village: [523, 587, 659, 587, 523, 440, 392, 440],
      market:  [659, 784, 880, 784, 659, 587, 523, 587],
      adventure: [392, 440, 523, 659, 523, 440, 392, 330]
    };
    const notes = melodies[theme] || melodies.village;
    let i = 0;
    this.bgmInterval = setInterval(() => {
      if (this.muted) return;
      this.play(notes[i % notes.length], 0.18, 'triangle', 0.025);
      this.play(notes[i % notes.length] / 2, 0.18, 'sine', 0.02);
      i++;
    }, 420);
  }
  stopBGM() {
    if (this.bgmInterval) { clearInterval(this.bgmInterval); this.bgmInterval = null; }
  }
  toggleMute() { this.muted = !this.muted; if (this.muted) this.stopBGM(); }
}

const AudioMgr = new AudioManager();
const Audio = AudioMgr;
