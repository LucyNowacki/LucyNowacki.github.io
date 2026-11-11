/* Controller for the accepted next subsection only: real-line stability.
 * All curves are illustrations; the source proof is displayed in the page.
 */
(() => {
  'use strict';
  const M = window.JoukowskiMath, R = window.RealLineMath, P = window.RealLinePlots;
  const $ = id => document.getElementById(id), T = String.raw;
  const S = { n: 2, j: 0, t: Math.PI / 3, k: 3, showHull: true, step: 0 };
  const fmt = x => Math.abs(x) < 1e-12 ? '0' : Number(x.toPrecision(7)).toString();
  const fraction = w => w.denominator === 1 ? String(w.numerator) : T`\frac{${w.numerator}}{${w.denominator}}`;
  let playing = false, frame = 0, lastTime = 0, direction = 1, resizeFrame = 0;
  let termDegree = -1, mathKey = '', mathRevision = 0, angularKey = '', angularValues;
  if (!M || !R || !P) { $('rl-error').hidden = false; $('rl-error').textContent = 'The lesson could not load its local scripts. Reload this page to try again.'; return; }
  let mathQueue = Promise.resolve(window.MathJax?.startup?.promise).then(() => {
    if (!window.MathJax?.typesetPromise) throw new Error('MathJax did not load.');
    return window.MathJax.typesetPromise([...document.querySelectorAll('.math-static')]);
  }).catch(mathError);
  function mathError(error) {
    $('rl-error').hidden = false;
    $('rl-error').textContent = 'The diagrams are available, but formula rendering failed. Please reload the page.';
    console.error(error);
  }
  function mathematicalLabels() {
    const key = `${S.n}:${S.j}`;
    if (key === mathKey) return;
    mathKey = key;
    const revision = ++mathRevision, n = S.n, j = S.j, weights = R.weights(n), w = weights[j];
    mathQueue = mathQueue.then(async () => {
      if (revision !== mathRevision) return;
      const targets = [$('rl-selected-equation'), $('rl-weight-buttons')];
      window.MathJax.typesetClear(targets);
      targets[0].innerHTML = T`\[\alpha_{${n},${j}}e^{i(${w.m})t}=${fraction(w)}e^{i(${w.m})t}.\]`;
      targets[1].innerHTML = weights.map(v => `<button type="button" data-j="${v.j}" aria-pressed="${v.j === j}" aria-label="Inspect j ${v.j}, frequency ${v.m}"><span class="rl-weight-label">j = ${v.j} · m = ${v.m}</span><span>${T`\(${fraction(v)}\)`}</span></button>`).join('');
      await window.MathJax.typesetPromise(targets);
    }).catch(mathError);
  }
  $('rl-degree').innerHTML = Array.from({ length: 13 }, (_, n) => `<option value="${n}">n = ${n}${n === 0 ? ' · constant' : n === 1 ? ' · linear' : n === 2 ? ' · quadratic' : ''}</option>`).join('');
  function controls() {
    $('rl-degree').value = S.n;
    $('rl-angle').value = S.t * 180 / Math.PI;
    if (document.activeElement !== $('rl-angle-number')) $('rl-angle-number').value = Math.round(S.t * 360 / Math.PI) / 2;
    $('rl-angle-value').value = `t = ${fmt(Math.round(S.t * 360 / Math.PI) / 2)}°`;
    if (document.activeElement !== $('rl-frequency')) $('rl-frequency').value = S.k;
    $('rl-hull').checked = S.showHull;
    if (termDegree !== S.n) {
      $('rl-term').innerHTML = R.weights(S.n).map(v => `<option value="${v.j}">j = ${v.j} · m = ${v.m}</option>`).join('');
      termDegree = S.n;
    }
    $('rl-term').value = S.j;
    $('rl-angle-controls').hidden = false;
    $('rl-term-controls').hidden = S.step === 3;
    $('rl-k-controls').hidden = S.step !== 3;
  }
  function render() {
    controls();
    const e = R.evaluate(S.n, S.t), v = e.terms[S.j];
    Object.assign($('rl-lab').dataset, { degree: S.n, term: S.j, angle: S.t, k: S.k, step: S.step + 1 });
    $('rl-input').textContent = fmt(e.x);
    $('rl-output').textContent = fmt(e.value.re);
    $('rl-weight-sum').textContent = fmt(e.weightSum);
    $('rl-input').dataset.value = e.x;
    $('rl-output').dataset.value = e.value.re;
    $('rl-weight-sum').dataset.value = e.weightSum;
    $('rl-selected-value').textContent = `Selected contribution: ${fmt(v.value.re)} ${v.value.im < 0 ? '−' : '+'} ${fmt(Math.abs(v.value.im))}i. Weight ${fmt(v.weight)}; unit phase ${fmt(v.phase.re)} ${v.phase.im < 0 ? '−' : '+'} ${fmt(Math.abs(v.phase.im))}i.`;
    const residual = Math.hypot(e.value.re - e.recurrence.re, e.value.im - e.recurrence.im);
    $('rl-numerical-check').textContent = `Finite phase sum and independent Legendre recurrence differ by ${residual.toExponential(2)}. Floating-point diagnostic; the displayed proof gives the bound.`;
    $('rl-numerical-check').dataset.residual = residual;
    $('rl-equality-note').textContent = S.n === 0 ? 'For n = 0 the polynomial is constantly 1, so equality holds everywhere.' : S.t === 0 ? 'All phases coincide at 1. Their weighted mean is 1: the bound is attained.' : `Current value: |P${S.n}(cos t)| ≈ ${fmt(Math.abs(e.value.re))}. Align all phases at t = 0 to see the endpoint equality.`;
    mathematicalLabels();
    if (S.step < 3) {
      P.map($('rl-map-plot'), S, M);
      P.phases($('rl-phases-plot'), S, M);
      P.graph($('rl-graph-plot'), S, M);
    } else {
      const key = `${S.n}:${S.k}`;
      if (angularKey !== key) { angularValues = R.angular(S.n, S.k); angularKey = key; }
      P.angular($('rl-angular-plot'), S, M);
      $('rl-sigma').textContent = `≈ ${fmt(angularValues.sigma)}`;
      $('rl-sigma').dataset.value = angularValues.sigma;
      $('rl-absolute').textContent = `≈ ${fmt(angularValues.absoluteEstimate)}`;
      $('rl-absolute').dataset.value = angularValues.absoluteEstimate;
      $('rl-lobes').textContent = `${S.k} ${S.k === 1 ? 'lobe' : 'lobes'} × area 2/${S.k}`;
    }
  }
  function pause() {
    playing = false; cancelAnimationFrame(frame); lastTime = 0;
    $('rl-play').textContent = '▶ Play'; $('rl-play').setAttribute('aria-pressed', 'false');
    $('rl-live').setAttribute('aria-live', 'polite');
  }
  function chooseStep(step) {
    pause(); S.step = Math.max(0, Math.min(3, step));
    for (let i = 0; i < 4; i++) {
      $(`rl-step-${i}`).setAttribute('aria-pressed', String(i === S.step));
      $(`rl-explain-${i}`).hidden = i !== S.step;
    }
    $('rl-linked-plots').hidden = S.step === 3;
    $('rl-angular-panel').hidden = S.step !== 3;
    $('rl-live').hidden = S.step === 3;
    $('rl-weights-details').hidden = S.step === 3;
    $('rl-previous').disabled = S.step === 0;
    $('rl-next').disabled = S.step === 3;
    $('rl-progress').textContent = `Step ${S.step + 1} of 4`;
    render();
  }
  function setAngle(degrees) {
    pause(); if (!Number.isFinite(degrees)) return;
    S.t = Math.max(0, Math.min(180, degrees)) * Math.PI / 180; render();
  }
  $('rl-degree').addEventListener('change', event => { pause(); S.n = +event.target.value; S.j = Math.min(S.n, S.j); render(); });
  $('rl-angle').addEventListener('input', event => setAngle(+event.target.value));
  $('rl-angle-number').addEventListener('input', event => { const value = event.target.valueAsNumber; if (Number.isFinite(value) && value >= 0 && value <= 180) setAngle(value); });
  $('rl-angle-number').addEventListener('change', event => { setAngle(event.target.valueAsNumber); event.target.value = Math.round(S.t * 360 / Math.PI) / 2; });
  $('rl-term').addEventListener('change', event => { S.j = +event.target.value; render(); });
  $('rl-hull').addEventListener('change', event => { S.showHull = event.target.checked; render(); });
  $('rl-frequency').addEventListener('input', event => { const value = event.target.valueAsNumber; if (Number.isInteger(value) && value >= 1 && value <= 16) { S.k = value; render(); } });
  $('rl-frequency').addEventListener('change', event => { const value = event.target.valueAsNumber; if (Number.isFinite(value)) S.k = Math.max(1, Math.min(16, Math.round(value))); event.target.value = S.k; render(); });
  $('rl-weight-buttons').addEventListener('click', event => { const button = event.target.closest('button[data-j]'); if (!button) return; S.j = +button.dataset.j; render(); });
  $('rl-endpoint').addEventListener('click', () => setAngle(0));
  $('rl-midpoint').addEventListener('click', () => setAngle(90));
  document.querySelectorAll('.rl-steps button').forEach(button => button.addEventListener('click', () => chooseStep(+button.dataset.step)));
  $('rl-previous').addEventListener('click', () => chooseStep(S.step - 1));
  $('rl-next').addEventListener('click', () => chooseStep(S.step + 1));
  $('rl-reset').addEventListener('click', () => { Object.assign(S, { n: 2, j: 0, t: Math.PI / 3, k: 3, showHull: true }); chooseStep(0); });
  $('rl-play').addEventListener('click', () => {
    if (playing) { pause(); return; }
    playing = true; lastTime = 0;
    $('rl-play').textContent = 'Pause'; $('rl-play').setAttribute('aria-pressed', 'true');
    $('rl-live').setAttribute('aria-live', 'off');
    function tick(time) {
      if (!playing) return;
      if (lastTime) {
        S.t += direction * Math.min(.08, (time - lastTime) / 1000) * Math.PI / 12;
        if (S.t >= Math.PI) { S.t = Math.PI; direction = -1; }
        if (S.t <= 0) { S.t = 0; direction = 1; }
      }
      lastTime = time; render(); frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  new ResizeObserver(() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(render); }).observe($('rl-content') || document.querySelector('.rl-content'));
  render();
})();
