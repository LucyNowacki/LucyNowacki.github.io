/* The Phaser scene owns the frame clock, canvas, keyboard and audio context.
 * Rules remain in core/ and controller.js, independent of rendering objects. */
(function () {
  'use strict';
  const host = document.getElementById('gridder-board');
  const feedback = document.getElementById('gridder-feedback');
  if (!window.Phaser) {
    feedback.textContent = 'The game engine could not load. Reload this page to try again.';
    return;
  }
  let view = null, latest = null, gaitTime = 0, updating = false, renderRequested = false;
  const card = host.closest('.board-card');
  const journey = document.getElementById('gridder-journey');
  const objectiveNames = { min: 'Minimum', max: 'Maximum', inflection: 'Inflection', derivative: 'Derivative', second: 'Second derivative', inverse: 'Inverse', normal: 'Normal' };
  let journeyKey = '';
  function showJourney(snapshot) {
    const key = `${snapshot.key}:${snapshot.level}:${snapshot.game.complete()}`;
    if (key === journeyKey) return;
    journeyKey = key;
    const steps = snapshot.quests.map((quest, index, all) => {
      const item = document.createElement('li');
      const peers = all.filter(q => q.kind === quest.kind);
      const number = peers.length > 1 ? ` ${peers.indexOf(quest) + 1}` : '';
      const done = index < snapshot.level || index === snapshot.level && snapshot.game.complete();
      item.textContent = `${done ? '✓ ' : ''}${index + 1} · ${objectiveNames[quest.kind]}${number}`;
      if (index === snapshot.level) item.setAttribute('aria-current', 'step');
      if (done) item.classList.add('level-done');
      return item;
    });
    journey.replaceChildren(...steps);
  }
  function compactLayout(snapshot = latest) {
    if (!snapshot?.game) return;
    const b = snapshot.game.board;
    const ratio = b.ny / b.nx * 2 / 3;
    if (card.classList.contains('is-fullscreen')) {
      const style = getComputedStyle(card);
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const occupiedSelectors = ['.board-heading', '#gridder-feedback'];
      if (style.display !== 'grid') occupiedSelectors.push('.play-dock');
      const occupied = occupiedSelectors.reduce((total, selector) => {
        const element = card.querySelector(selector), css = getComputedStyle(element);
        return total + element.getBoundingClientRect().height + parseFloat(css.marginTop) + parseFloat(css.marginBottom);
      }, 0);
      const available = Math.max(120, card.clientHeight - padding - occupied - 8);
      host.style.maxWidth = Math.max(200, 68 + (available - 66) / ratio) + 'px';
    } else {
      host.style.removeProperty('max-width');
    }
    const width = host.getBoundingClientRect().width;
    // The model reserves 68 horizontal and 66 vertical pixels around its grid.
    // Fit the canvas to the actual 3:2 cells instead of filling a tall viewport.
    const boardHeight = Math.max(120, 66 + (Math.max(200, width) - 68) * ratio);
    const boardValue = boardHeight.toFixed(3) + 'px';
    if (host.style.getPropertyValue('--gridder-board-height') !== boardValue) host.style.setProperty('--gridder-board-height', boardValue);
  }
  window.gridderView = { render(snapshot) {
    // The face asset may finish loading before the first game is initialized.
    if(!snapshot?.game)return;
    // Rules and speech may both dirty the view in one Phaser update.
    // Present their final state once, rather than uploading the avatar twice.
    if(updating){renderRequested=true;return;}
    snapshot = {...snapshot, gaitTime};
    const changed = !latest || latest.game !== snapshot.game;
    latest = snapshot;
    if (changed) compactLayout(snapshot);
    showJourney(snapshot);
    view?.render(snapshot);
  } };
  class GridderScene extends Phaser.Scene {
    constructor() { super('gridder'); }
    preload() { this.load.spritesheet('resurrection', 'assets/resurrection-angel-sprites.png', { frameWidth: 384, frameHeight: 512 }); }
    create() {
      const controller = window.gridderController;
      view = window.GridderRenderer.create(this);
      window.gridderAudioManager = { context: this.sound.context, destination: this.sound.destination };
      this.sound.pauseOnBlur = false; // Controller cancels and phase-aligns sound.
      this.input.keyboard.on('keydown', event => controller.keydown?.(event));
      this.input.keyboard.on('keyup', event => controller.keyup?.(event));
      this.scale.on('resize', () => {
        view.invalidate();
        const current = controller.snapshot();
        if (current.game) window.gridderView.render(current);
      });
      const themeChanged = () => { view.invalidate(); window.gridderView.render(controller.snapshot()); };
      window.addEventListener('gridder-theme-change', themeChanged);
      const resize = new ResizeObserver(() => {
        compactLayout();
        const box = host.getBoundingClientRect();
        const width = Math.max(200, Math.round(box.width)), height = Math.max(120, Math.round(box.height));
        if (this.scale.width !== width || this.scale.height !== height) this.scale.resize(width, height);
      });
      resize.observe(host);
      resize.observe(card);
      for (const child of card.children) if (child !== host) resize.observe(child);
      this.events.once('shutdown', () => { resize.disconnect(); window.removeEventListener('gridder-theme-change', themeChanged); controller.pause(); window.gridderMusic?.destroy(); window.GridderChebbyFace?.destroy(); view.destroy(); });
      this.game.canvas.setAttribute('aria-hidden', 'true');
      controller.setActive(true);
      host.dataset.renderer = this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas';
      host.dataset.engineVersion = Phaser.VERSION;
      host.dataset.ready = 'true';
      // Useful read-only diagnostics; no special test gameplay path.
      window.gridderApp = {
        game: this.game, scene: this,
        renderer: () => host.dataset.renderer,
        metrics: () => view.metrics(),
        geometry: () => view.geometry(),
        pause: () => controller.pause(),
        destroy: () => this.game.destroy(true)
      };
      window.refreshGridderMath?.();
    }
    update(time) {
      gaitTime = time;
      const controller=window.gridderController;
      controller.beginFrame?.();updating=true;renderRequested=false;
      try{
        controller.tick(time);
        controller.updateAudio?.();
        const current=controller.snapshot();
        const dirty=window.GridderChebbyFace?.update(performance.now(),current);
        const stopped=latest&&(latest.playing!==current.playing||latest.moving!==current.moving);
        const avatar=view?.animationState?.();
        const settle=avatar?.settling||(avatar?.walking&&(!current.moving||latest?.chaseTime!==current.chaseTime));
        updating=false;
        if(renderRequested||dirty||stopped||settle)window.gridderView.render(current);
        // Presentation clocks animate cached paths and water independently
        // of the fixed mathematical geometry and creature drawing.
        view?.animateDiscoveries?.(time,current);
        view?.animateLiquid?.(time,current);
      }finally{updating=false;controller.endFrame?.();}
    }
  }
  const box = host.getBoundingClientRect();
  new Phaser.Game({
    type: Phaser.AUTO, parent: host,
    width: Math.max(200, Math.round(box.width)), height: Math.max(120, Math.round(box.height)),
    backgroundColor: '#211a34', banner: false,
    render: { antialias: true, roundPixels: false, preserveDrawingBuffer: true },
    input: { keyboard: { capture: [] }, mouse: { preventDefaultWheel: false }, touch: { capture: false } },
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
    audio: { disableWebAudio: false }, fps: { target: 60 }, scene: GridderScene
  });
})();
