(() => {
  const tile = document.querySelector('[data-hyper-ai-tile]');
  if (!tile) return;

  const video = tile.querySelector('video');
  const button = tile.querySelector('button');
  if (!video.canPlayType('video/webm; codecs="vp9"')) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = !('IntersectionObserver' in window);
  let wantsMotion = true;
  let failed = false;

  function update() {
    const allowed = !failed && !reducedMotion.matches;
    const onScreen = visible && !document.hidden;
    button.hidden = !allowed || !onScreen;

    if (!allowed || !onScreen || !wantsMotion) {
      video.pause();
      if (!allowed) video.hidden = true;
      return;
    }

    if (!video.hasAttribute('src')) video.src = video.dataset.src;
    video.play().catch(error => {
      if (error.name === 'NotAllowedError') {
        wantsMotion = false;
        button.textContent = 'Play animation';
      }
    });
  }

  button.addEventListener('click', () => {
    wantsMotion = !wantsMotion;
    button.textContent = wantsMotion ? 'Pause animation' : 'Play animation';
    update();
  });
  video.addEventListener('playing', () => { video.hidden = false; });
  video.addEventListener('error', () => { failed = true; update(); });
  reducedMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      update();
    }).observe(tile);
  }
  update();
})();
