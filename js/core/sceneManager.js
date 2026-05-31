/* Scene manager - holds the active scene and routes input/update/render */
class SceneManager {
  constructor() {
    this.current = null;
    this.scenes = {};
  }
  register(name, scene) { this.scenes[name] = scene; }
  switch(name, payload) {
    if (this.current && this.current.exit) this.current.exit();
    this.current = this.scenes[name];
    if (this.current && this.current.enter) this.current.enter(payload);
  }
  update(dt) { if (this.current && this.current.update) this.current.update(dt); }
  render(ctx) { if (this.current && this.current.render) this.current.render(ctx); }
  onClick(x, y) { if (this.current && this.current.onClick) this.current.onClick(x, y); }
  onMouseMove(x, y) { if (this.current && this.current.onMouseMove) this.current.onMouseMove(x, y); }
  onKey(key) { if (this.current && this.current.onKey) this.current.onKey(key); }
}

const Scenes = new SceneManager();