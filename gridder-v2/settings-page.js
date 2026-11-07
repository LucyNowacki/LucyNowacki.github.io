/* A full-page settings view keeps the existing controls and game in memory. */
(() => {
  'use strict';
  const page = document.getElementById('gridder-settings-page');
  const quick = document.getElementById('gridder-quick-settings');
  const speed = quick?.querySelector('.gridder-speed-control');
  const speedSlot = document.getElementById('settings-speed-slot');
  const back = document.getElementById('gridder-settings-close');
  const buttons = ['gridder-settings-open', 'gridder-settings-game'].map(id => document.getElementById(id));
  if (!page || !speed || !speedSlot || !back) return;
  let opener = null, historyEntry = false, returning = false, title = document.title;
  let scroll = {left: 0, top: 0};

  function show(button, pushHistory = true) {
    if (page.open || returning) return;
    window.gridderController?.pause();
    opener = button || document.activeElement;
    scroll = {left: window.scrollX, top: window.scrollY};
    title = document.title;
    speedSlot.append(speed);
    document.documentElement.classList.add('gridder-settings-open');
    page.showModal();
    page.scrollTop = 0;
    document.title = 'Settings · Gridder 2';
    if (pushHistory) history.pushState({...history.state, gridderSettings: true}, '', '#settings');
    historyEntry = true;
    back.focus({preventScroll: true});
  }

  function hide(fromHistory = false) {
    if (!page.open) return;
    page.close();
    quick.append(speed);
    document.documentElement.classList.remove('gridder-settings-open');
    document.title = title;
    const menu = opener?.closest('details');
    if (menu) menu.open = true;
    opener?.focus({preventScroll: true});
    window.scrollTo({...scroll, behavior: 'instant'});
    if (!fromHistory && historyEntry && history.state?.gridderSettings) {
      returning = true;
      history.back();
    }
    historyEntry = false;
  }

  for (const button of buttons) button?.addEventListener('click', () => show(button));
  back.addEventListener('click', () => hide());
  page.addEventListener('cancel', event => {event.preventDefault(); hide();});
  // Capture Escape before the game or the fallback fullscreen listener.
  document.addEventListener('keydown', event => {
    if (page.open && event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); hide();
    }
  }, true);
  window.addEventListener('popstate', () => {
    returning = false;
    if (page.open) hide(true);
    else if (history.state?.gridderSettings && location.hash === '#settings') show(opener || buttons[0], false);
  });
  window.GridderSettings = {isOpen: () => page.open};
})();
