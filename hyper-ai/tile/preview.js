(() => {
  const tile = document.querySelector('[data-hyper-ai-tile]');
  if (!tile) return;

  const video = tile.querySelector('video');
  const button = tile.querySelector('button');
  const sources = [
    { url: video.dataset.src, type: 'video/webm; codecs="vp9"' },
    { url: video.dataset.mp4, type: 'video/mp4' }
  ].filter(source => source.url && video.canPlayType(source.type));

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = !('IntersectionObserver' in window);
  let wantsMotion = true;

  function update() {
    const allowed = sources.length > 0 && !reducedMotion.matches;
    const onScreen = visible && !document.hidden;
    button.hidden = !allowed || !onScreen;

    if (!allowed || !onScreen || !wantsMotion) {
      video.pause();
      if (!allowed) video.hidden = true;
      return;
    }

    if (!video.hasAttribute('src')) video.src = sources[0].url;
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
  video.addEventListener('error', () => {
    video.hidden = true;
    sources.shift();
    video.removeAttribute('src');
    update();
  });
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
