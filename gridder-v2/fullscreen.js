/* Expand the playable card while retaining its controls and game state. */
(() => {
  'use strict';
  const card = document.getElementById('gridder-game-area');
  const button = document.getElementById('gridder-fullscreen');
  if (!card || !button) return;
  let fallback = false, changing = false, inerted = [];

  function setBackgroundInert(enabled) {
    if (enabled) {
      for (let child = card; child.parentElement; child = child.parentElement) {
        for (const sibling of child.parentElement.children) {
          if (sibling !== child && !sibling.hasAttribute('inert')) {
            sibling.setAttribute('inert', '');
            inerted.push(sibling);
          }
        }
        if (child.parentElement === document.body) break;
      }
    } else {
      for (const element of inerted) element.removeAttribute('inert');
      inerted = [];
    }
  }
  function setFallback(enabled) {
    if (fallback === enabled) return;
    fallback = enabled;
    setBackgroundInert(enabled);
  }
  function update() {
    const expanded = fallback || document.fullscreenElement === card;
    const wasExpanded = card.classList.contains('is-fullscreen');
    card.classList.toggle('is-fullscreen', expanded);
    document.documentElement.classList.toggle('gridder-fullscreen-open', expanded);
    button.textContent = expanded ? 'Exit full screen ⛶' : 'Full screen ⛶';
    button.setAttribute('aria-pressed', String(expanded));
    if (expanded !== wasExpanded) window.dispatchEvent(new CustomEvent('gridder-fullscreen-change', {detail:{active:expanded}}));
  }
  document.addEventListener('fullscreenchange', update);
  document.addEventListener('keydown', event => {
    if (fallback && event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      setFallback(false);
      update();
      button.focus({preventScroll: true});
    }
  }, true);
  button.addEventListener('click', async () => {
    if (changing) return;
    changing = true;
    try {
      if (fallback) {
        setFallback(false);
      } else if (document.fullscreenElement === card) {
        await document.exitFullscreen();
      } else if (card.requestFullscreen && document.fullscreenEnabled) {
        try { await card.requestFullscreen(); }
        catch (_) { setFallback(true); }
      } else {
        setFallback(true);
      }
    } finally {
      update();
      changing = false;
    }
  });
})();
