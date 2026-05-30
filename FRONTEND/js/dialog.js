// ══════════════════════════════════════
//   DIALOG SYSTEM — Pokemon style
// ══════════════════════════════════════

const Dialog = (() => {
  let queue      = [];   // antrian pesan
  let typing     = false;
  let fullText   = '';
  let shownText  = '';
  let typeTimer  = null;
  let onDone     = null;
  let skipable   = true;

  const SPEED_NORMAL = 28; // ms per karakter
  const SPEED_FAST   = 8;

  // ── Elemen DOM ──
  const box      = () => document.getElementById('dialog-box');
  const portrait = () => document.getElementById('dialog-portrait');
  const speaker  = () => document.getElementById('dialog-speaker');
  const textEl   = () => document.getElementById('dialog-text');
  const cursor   = () => document.getElementById('dialog-cursor');
  const choices  = () => document.getElementById('dialog-choices');

  // ══════════════════════════════════════
  //   SHOW DIALOG
  // ══════════════════════════════════════
  function show(messages, options = {}) {
    // messages: string atau array string
    const msgs = Array.isArray(messages) ? messages : [messages];
    queue      = [...msgs];
    onDone     = options.onDone   || null;
    skipable   = options.skipable !== false;

    box().classList.remove('hidden');
    nextMessage();
  }

  function hide() {
    box().classList.add('hidden');
    clearTimeout(typeTimer);
    typing    = false;
    queue     = [];
    choices().classList.add('hidden');
    choices().innerHTML = '';
    if (onDone) { onDone(); onDone = null; }
  }

  function nextMessage() {
    if (queue.length === 0) {
      // Semua pesan selesai
      cursor().style.display = 'none';
      hide();
      return;
    }

    const msg = queue.shift();
    typeMessage(msg);
  }

  // ══════════════════════════════════════
  //   TYPEWRITER
  // ══════════════════════════════════════
  function typeMessage(text) {
    clearTimeout(typeTimer);
    fullText   = text;
    shownText  = '';
    typing     = true;
    cursor().style.display = 'none';
    textEl().innerHTML = '';

    let i = 0;
    function nextChar() {
      if (i >= text.length) {
        typing = false;
        cursor().style.display = 'block';
        return;
      }

      shownText += text[i];
      textEl().innerHTML = shownText + '<span style="opacity:0">.</span>';
      SFX.tick();
      i++;

      // Pause lebih panjang di tanda baca
      const ch    = text[i - 1];
      const delay = ch === '.' || ch === '!' || ch === '?' ? SPEED_NORMAL * 5
                  : ch === ',' ? SPEED_NORMAL * 2
                  : SPEED_NORMAL;
      typeTimer = setTimeout(nextChar, delay);
    }

    nextChar();
  }

  // ══════════════════════════════════════
  //   SKIP / NEXT (tekan E atau klik)
  // ══════════════════════════════════════
  function advance() {
    if (!box() || box().classList.contains('hidden')) return false;

    if (typing) {
      // Skip typewriter — tampilkan semua sekaligus
      clearTimeout(typeTimer);
      typing = false;
      textEl().innerHTML = fullText;
      cursor().style.display = 'block';
      return true;
    }

    // Cek apakah ada choices
    if (!choices().classList.contains('hidden')) return true;

    // Lanjut ke pesan berikutnya
    nextMessage();
    return true;
  }

  // ══════════════════════════════════════
  //   SET NPC PORTRAIT
  // ══════════════════════════════════════
  function setPortrait(emoji, name) {
    portrait().textContent = emoji || '🧑‍🌾';
    speaker().textContent  = name  || '';
  }

  // ══════════════════════════════════════
  //   SHOW CHOICES (pilihan jawaban)
  // ══════════════════════════════════════
  function showChoices(opts, callback) {
    // opts: array of { label, value }
    const el = choices();
    el.innerHTML = '';
    el.classList.remove('hidden');

    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = 'dialog-choice';
      btn.textContent = opt.label;
      btn.onclick     = () => {
        el.classList.add('hidden');
        el.innerHTML = '';
        if (callback) callback(opt.value);
      };
      el.appendChild(btn);
    });

    cursor().style.display = 'none';
  }

  // ══════════════════════════════════════
  //   DIALOG SEQUENCES (pre-built)
  // ══════════════════════════════════════

  // NPC sambutan toko
  function npcGreet(shop, onClose) {
    setPortrait(shop.npcEmoji, shop.npcName);
    const greets = [
      `Selamat datang di toko ${shop.label}! Pilih barang terbaikmu!`,
      `Hei pedagang muda! Ada barang bagus hari ini.`,
      `Modal terbatas? Pilih yang punya rasio profit tertinggi!`,
      `Jangan sampai AI rival lebih dulu dari kamu!`,
    ];
    const msg = greets[Math.floor(Math.random() * greets.length)];
    show([msg], { onDone: onClose });
  }

  // Respons setelah beli item
  function npcAfterBuy(item, comment, onClose) {
    setPortrait('🧑‍🌾', 'PEDAGANG');
    show([`"${comment}"`], { onDone: onClose });
  }

  // AI rival comment
  function aiComment(text) {
    setPortrait('🤖', 'AI RIVAL');
    show([text], { onDone: null, skipable: true });
    // Auto hide setelah 2.5 detik
    setTimeout(() => {
      if (!box().classList.contains('hidden')) hide();
    }, 2500);
  }

  // Pesan waktu habis
  function timeUp(onClose) {
    setPortrait('⏰', 'SISTEM');
    show(['WAKTU HABIS! Saatnya fase kalkulasi!'], { onDone: onClose });
  }

  // AI menang duluan
  function aiWon(onClose) {
    setPortrait('🤖', 'AI RIVAL');
    const taunts = [
      'Hahaha! Aku lebih cepat dari kamu!',
      'Greedy algorithm menang! Rasio tertinggi selalu aku ambil duluan!',
      'Terlambat, pedagang! Fase kalkulasi dimulai!',
    ];
    show([taunts[Math.floor(Math.random() * taunts.length)]], { onDone: onClose });
  }

  // Player menang duluan
  function playerWon(onClose) {
    setPortrait('🧑‍🌾', 'KAMU');
    show(['Selesai duluan! Saatnya lihat hasilnya!'], { onDone: onClose });
  }

  // Welcome message awal ronde
  function roundWelcome(mapDef, onClose) {
    setPortrait('📍', 'LOKASI');
    show([mapDef.welcomeMsg || `Selamat datang di ${mapDef.name}! Budget Rp ${mapDef.budget}.`], {
      onDone: onClose
    });
  }

  // ══════════════════════════════════════
  //   IS OPEN?
  // ══════════════════════════════════════
  function isOpen() {
    return !box().classList.contains('hidden');
  }

  // ══════════════════════════════════════
  //   KEYBOARD LISTENER
  // ══════════════════════════════════════
  document.addEventListener('keydown', e => {
    if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
      if (isOpen()) {
        e.preventDefault();
        advance();
      }
    }
  });

  return {
    show, hide, advance, isOpen,
    setPortrait, showChoices,
    npcGreet, npcAfterBuy, aiComment,
    timeUp, aiWon, playerWon, roundWelcome,
  };
})();