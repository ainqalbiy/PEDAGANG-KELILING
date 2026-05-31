/* Pokemon-style dialog box with typing effect & button choices */
const Dialog = {
  el: null, nameEl: null, textEl: null, btnEl: null, arrowEl: null,
  queue: [],
  typing: false,
  typeTimer: null,
  fullText: '',
  shown: 0,
  onDone: null,

  init() {
    this.el = document.getElementById('dialog-box');
    this.nameEl = document.getElementById('dialog-name');
    this.textEl = document.getElementById('dialog-text');
    this.btnEl = document.getElementById('dialog-buttons');
    this.arrowEl = document.getElementById('dialog-arrow');
    this.el.addEventListener('click', () => {
      if (this.typing) {
        // skip to end of typing
        clearInterval(this.typeTimer); this.typing = false;
        this.textEl.textContent = this.fullText;
        this.arrowEl.classList.remove('hidden');
      } else if (this.queue.length > 0) {
        this._show(this.queue.shift());
      } else if (!this.btnEl.children.length) {
        this.hide();
        if (this.onDone) { const cb = this.onDone; this.onDone = null; cb(); }
      }
    });
  },

  show(name, text, options = {}) {
    this.nameEl.textContent = name;
    this.onDone = options.onDone || null;
    const lines = Array.isArray(text) ? text : [text];
    this.queue = [...lines];
    this.el.classList.remove('hidden');
    this.btnEl.innerHTML = '';
    if (options.buttons) {
      this.queue = lines.slice(0, -1);
      this._show(lines[lines.length - 1], options.buttons);
    } else {
      this._show(this.queue.shift());
    }
  },

  _show(text, buttons) {
    this.fullText = text;
    this.textEl.textContent = '';
    this.btnEl.innerHTML = '';
    this.arrowEl.classList.add('hidden');
    this.shown = 0;
    this.typing = true;
    this.typeTimer = setInterval(() => {
      this.shown++;
      this.textEl.textContent = this.fullText.substring(0, this.shown);
      if (this.shown % 3 === 0) Audio.type();
      if (this.shown >= this.fullText.length) {
        clearInterval(this.typeTimer);
        this.typing = false;
        if (buttons) {
          buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = 'pixel-btn ' + (b.style || '');
            btn.textContent = b.label;
            btn.setAttribute('data-testid', b.testid || ('dialog-btn-' + b.label.toLowerCase().replace(/\s+/g, '-')));
            btn.onclick = (e) => {
              e.stopPropagation();
              Audio.click();
              this.hide();
              b.onClick && b.onClick();
            };
            this.btnEl.appendChild(btn);
          });
        } else {
          this.arrowEl.classList.remove('hidden');
        }
      }
    }, 28);
  },

  hide() {
    this.el.classList.add('hidden');
    this.queue = [];
    if (this.typeTimer) { clearInterval(this.typeTimer); this.typing = false; }
  },

  isOpen() { return !this.el.classList.contains('hidden'); }
};

/* Toast notification */
const Notify = {
  el: null, timer: null,
  init() { this.el = document.getElementById('notification'); },
  show(msg, type = 'ok', dur = 2400) {
    this.el.textContent = msg;
    this.el.className = 'notification ' + type;
    this.el.classList.remove('hidden');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.add('hidden'), dur);
  }
};