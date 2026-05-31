/* MainMenu Scene */
const MainMenu = {
  enter() {
    Audio.startBGM('village');
    Dialog.show('Narator', [
      'Selamat datang di PEDAGANG KELILING!',
      'Jadilah pedagang yang bijak dan temukan jalur terbaik sendiri.',
      'Pilih misimu, jelajahi peta, dan antar barang ke kota tujuan!',
      'Setelah sampai, kamu akan tahu seberapa baik pilihanmu. 🗺️',
    ], {
      onDone: () => {
        Scenes.switch('map');
      }
    });
  },
  exit() {},
  update(dt) {},
  render(ctx) {
    // Gradient background
    const grd = ctx.createLinearGradient(0, 0, 0, CONST.CANVAS_H);
    grd.addColorStop(0, '#2a1f4d');
    grd.addColorStop(1, '#0f0a1a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, CONST.CANVAS_W, CONST.CANVAS_H);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const stars = [[80,40],[200,70],[400,30],[600,55],[750,20],[900,45],[150,120],[500,100],[850,90]];
    stars.forEach(([x,y]) => { ctx.fillRect(x,y,2,2); });

    // Title
    ctx.font = '36px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd966';
    ctx.shadowColor = '#ff5b6e';
    ctx.shadowBlur = 16;
    ctx.fillText('PEDAGANG KELILING', CONST.CANVAS_W / 2, 200);

    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffaecf';
    ctx.shadowBlur = 0;
    ctx.fillText('Pixel Art Trading Adventure', CONST.CANVAS_W / 2, 255);

    ctx.font = '14px "VT323", monospace';
    ctx.fillStyle = '#fff4d6';
    ctx.fillText('Klik untuk melanjutkan...', CONST.CANVAS_W / 2, 340);

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  },
  onClick() {
    // handled by dialog
  }
};
