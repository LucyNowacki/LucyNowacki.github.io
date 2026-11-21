/* Shared static mathematics and the Atlas's mouse-resizable explanation window. */
(() => {
  'use strict';
  let queue = Promise.resolve(window.MathJax?.startup?.promise);
  const report = error => {
    console.error('Coefficient lesson formula rendering:', error);
    let alert = document.getElementById('coefficient-render-error');
    if (!alert) {
      alert = document.createElement('p'); alert.id = 'coefficient-render-error';
      alert.setAttribute('role', 'alert');
      document.querySelector('main').prepend(alert);
    }
    alert.textContent = 'Some formulas could not render. Reload this page to retry; the diagrams remain available.';
  };
  queue = queue.then(() => {
    if (!window.MathJax?.typesetPromise) throw new Error('Local MathJax did not load');
    return window.MathJax.typesetPromise([...document.querySelectorAll('.math-static')]);
  }).catch(report);
  const buttons = [...document.querySelectorAll('[data-explain]')];
  if (!buttons.length || !window.createMathWindow) return;
  const popup = window.createMathWindow({title:'Intuitive/geometric explanation'});
  for (const button of buttons) button.addEventListener('click', () => {
    const template = document.getElementById('explain-' + button.dataset.explain);
    if (!template) return;
    queue = queue.then(async () => {
      window.MathJax.typesetClear([popup.body]);
      popup.setContent(template.innerHTML); popup.open();
      await window.MathJax.typesetPromise([popup.body]);
      popup.body.scrollTo(0, 0);
    }).catch(report);
  });
})();
