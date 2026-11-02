/* Expand the playable card while retaining its controls and game state. */
(() => {
  'use strict';
  const card = document.getElementById('gridder-game-area');
  const button = document.getElementById('gridder-fullscreen');
  if (!card || !button) return;
  let fallback = false, changing = false, inerted = [];
  const coarse = matchMedia('(pointer: coarse)');
  const shortLandscape = matchMedia('(orientation: landscape) and (max-height: 600px)');
  // Measuring env() on a real element resolves safe-area insets to CSS pixels.
  const safeProbe = document.createElement('div');
  safeProbe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.append(safeProbe);

  function updateArena(expanded) {
    const active = coarse.matches && (expanded || shortLandscape.matches);
    const wasActive = card.classList.contains('is-touch-arena');
    card.classList.toggle('is-touch-arena', active);
    let marginsChanged = false;
    if (active) {
      const safe = getComputedStyle(safeProbe);
      const insets = {
        top: parseFloat(safe.paddingTop) || 0, right: parseFloat(safe.paddingRight) || 0,
        bottom: parseFloat(safe.paddingBottom) || 0, left: parseFloat(safe.paddingLeft) || 0
      };
      const landscapeControls = matchMedia('(orientation: landscape) and (min-width: 480px)').matches;
      for (const [side, base] of Object.entries({left: 48, right: landscapeControls ? 68 : 24, top: 70, bottom: landscapeControls ? 100 : 146})) {
        for (const [name, value] of [[`--gridder-safe-${side}`, insets[side]], [`--gridder-arena-${side}`, base + insets[side]]]) {
          const px = `${value}px`;
          if (card.style.getPropertyValue(name) !== px) {
            card.style.setProperty(name, px);
            marginsChanged = true;
          }
        }
      }
    } else if (wasActive) {
      for (const side of ['top', 'right', 'bottom', 'left']) {
        card.style.removeProperty(`--gridder-safe-${side}`);
        card.style.removeProperty(`--gridder-arena-${side}`);
      }
    }
    if (active !== wasActive) {
      window.dispatchEvent(new CustomEvent('gridder-arena-change', {detail:{active}}));
      if (active && !expanded) requestAnimationFrame(() => {
        if (card.classList.contains('is-touch-arena') && !card.classList.contains('is-fullscreen')) {
          card.scrollIntoView({block: 'start', behavior: 'instant'});
        }
      });
    }
    // The canvas listens for resize. No second event is sent when values settle.
    if (active !== wasActive || marginsChanged) window.dispatchEvent(new Event('resize'));
  }

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
    updateArena(expanded);
    if (expanded !== wasExpanded) window.dispatchEvent(new CustomEvent('gridder-fullscreen-change', {detail:{active:expanded}}));
  }
  card.querySelector('.arena-more')?.addEventListener('click', () => {
    const controller = window.gridderController;
    if (controller?.snapshot()?.playing) {
      controller.pause();
      document.getElementById('gridder-feedback').textContent = 'Paused while you read the instructions. Choose Start game to resume.';
    }
  });
  document.addEventListener('fullscreenchange', update);
  window.addEventListener('resize', () => updateArena(fallback || document.fullscreenElement === card));
  window.visualViewport?.addEventListener('resize', update);
  coarse.addEventListener('change', update);
  shortLandscape.addEventListener('change', update);
  update();
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
