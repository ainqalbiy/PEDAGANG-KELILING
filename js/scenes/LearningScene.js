/* LearningScene - interactive algorithm learning overlay */
const LearningScene = {
  enter(payload) {
    // Open academy modal directly
    Modal.showAcademy();
    // Then go back to map
    setTimeout(() => { Scenes.switch('map', payload); }, 100);
  },
  exit() {},
  update() {},
  render(ctx) {
    ctx.fillStyle = '#0f0a1a';
    ctx.fillRect(0, 0, CONST.CANVAS_W, CONST.CANVAS_H);
  },
  onClick() {},
  onMouseMove() {}
};
