import { STEP_ZERO_EXERCISES } from './step-zero-exercises-data.mjs?v=exercise1';

export { STEP_ZERO_EXERCISES };
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const progress = new Map();
const compiledMath = new Map();
let selectedExercise = 0;
let mountCount = 0;

// These worksheets deliberately typeset only explicit formula holders. In
// particular, future answers are never put into the DOM behind a CSS toggle.
function typesetMath(container) {
  const holders = [...container.querySelectorAll('[data-tex]:not([data-math-source])')];
  if (!holders.length) return;
  holders.forEach(holder => { holder.dataset.mathSource = holder.dataset.tex; });
  Promise.resolve(window.siteMathReady).then(async engine => {
    if (!engine?.tex2svgPromise) throw new Error('The mathematical typesetter is unavailable.');
    for (const holder of holders) {
      if (!holder.isConnected) continue;
      const source = holder.dataset.tex, display = holder.hasAttribute('data-tex-display');
      const key = `${display ? 'display:' : 'inline:'}${source}`;
      if (!compiledMath.has(key)) compiledMath.set(key, engine.tex2svgPromise(source, { display }));
      try {
        const node = await compiledMath.get(key);
        if (!holder.isConnected) continue;
        if (node.querySelector('[data-mml-node="merror"]')) throw new Error(`Invalid exercise formula: ${source}`);
        holder.replaceChildren(node.cloneNode(true));
        holder.setAttribute('role', 'img');
        holder.setAttribute('aria-label', holder.dataset.mathLabel || source);
      } catch (error) {
        holder.textContent = source; holder.dataset.mathError = 'true';
        console.error(error);
      }
    }
  }).catch(error => {
    holders.filter(holder => holder.isConnected).forEach(holder => { holder.textContent = holder.dataset.tex; holder.dataset.mathError = 'true'; });
    console.error(error);
  });
}

function matrixHTML(matrix) {
  const rows = matrix.entries || [];
  return `<figure class="s0x-matrix"><figcaption>${escape(matrix.label)}</figcaption><div class="s0x-matrix-scroll" tabindex="0" aria-label="Matrix ${escape(matrix.label)}"><table aria-label="${escape(matrix.label)} matrix"><tbody>${rows.map(row => `<tr>${row.map(entry => `<td>${escape(entry)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${matrix.note ? `<p>${escape(matrix.note)}</p>` : ''}</figure>`;
}

const svgText = (x, y, text, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}" data-math-label-done="true">${escape(text)}</text>`;
const numberLabel = n => {
  if (!Number.isFinite(n)) return String(n ?? '');
  for (let denominator = 1; denominator <= 1024; denominator *= 2) {
    if (Number.isInteger(n * denominator)) return denominator === 1 ? String(n) : `${n * denominator}/${denominator}`;
  }
  return String(Number(n.toFixed(5)));
};

function entryBoxSVG(visual) {
  const bounds = visual.bounds || {};
  const real = visual.realBounds || bounds.real || bounds.re || [29 / 64, 35 / 64];
  const imag = visual.imagBounds || bounds.imag || bounds.im || [12 / 64, 20 / 64];
  const center = visual.center || [(real[0] + real[1]) / 2, (imag[0] + imag[1]) / 2];
  // Equal units on both axes: the 3–4 component triangle retains its geometry.
  const scale = 1536, left = 105, bottom = 255;
  const x = value => left + (value - real[0]) * scale;
  const y = value => bottom - (value - imag[0]) * scale;
  const centerVisible = visual.revealCenter === true;
  const actualVisible = visual.revealActual === true && visual.actual;
  let drawing = `<path d="M55 285H335 M75 300V35" class="s0x-axis"/><rect x="${x(real[0])}" y="${y(imag[1])}" width="${scale * (real[1] - real[0])}" height="${scale * (imag[1] - imag[0])}" class="s0x-box"/>`;
  drawing += svgText(333, 313, 'Real part', 's0x-axis-label', 'end') + svgText(75, 23, 'Imaginary part', 's0x-axis-label', 'start');
  drawing += svgText(x(real[0]), 277, visual.realLabels?.[0] || '29/64') + svgText(x(real[1]), 277, visual.realLabels?.[1] || '35/64');
  drawing += svgText(95, y(imag[0]) + 5, visual.imagLabels?.[0] || '12/64', '', 'end') + svgText(95, y(imag[1]) + 5, visual.imagLabels?.[1] || '20/64', '', 'end');
  if (centerVisible) {
    drawing += `<path d="M${x(center[0])} ${bottom}V${y(center[1])}H${left}" class="s0x-pointer"/><circle cx="${x(center[0])}" cy="${y(center[1])}" r="6" class="s0x-midpoint"/>`;
    drawing += svgText(x(center[0]), y(center[1]) - 15, visual.centerLabel || 'Midpoint', 's0x-midpoint-label');
  }
  if (actualVisible) {
    drawing += `<circle cx="${x(visual.actual[0])}" cy="${y(visual.actual[1])}" r="6" class="s0x-actual"/>`;
    if (centerVisible) drawing += `<path d="M${x(center[0])} ${y(center[1])}L${x(visual.actual[0])} ${y(visual.actual[1])}" class="s0x-error-segment"/>`;
    drawing += svgText(x(visual.actual[0]), y(visual.actual[1]) - 15, visual.actualLabel || 'Allowed corner', 's0x-actual-label');
    if (centerVisible && visual.revealRadii && visual.halfWidths) {
      drawing += `<path d="M${x(center[0])} ${y(center[1])}H${x(visual.actual[0])}V${y(visual.actual[1])}" class="s0x-error-components"/>`;
      drawing += svgText((x(center[0]) + x(visual.actual[0])) / 2, y(center[1]) + 21, numberLabel(visual.halfWidths[0]), 's0x-error-label');
      drawing += svgText(x(visual.actual[0]) + 12, (y(center[1]) + y(visual.actual[1])) / 2, numberLabel(visual.halfWidths[1]), 's0x-error-label', 'start');
    }
  }
  return `<svg viewBox="0 0 370 330" class="s0x-diagram" role="img" aria-label="Real and imaginary entry bounds form a rectangle${centerVisible ? ', with its exact midpoint marked' : ''}."><title>One complex matrix entry</title>${drawing}</svg>`;
}

function dyadicSVG(visual) {
  if (visual.binaryRows?.length) return `<div class="s0x-binary-scroll" tabindex="0" aria-label="Binary fractional weights"><table class="s0x-binary-table"><caption>Three binary places, with the sign written separately</caption><thead><tr><th scope="col">Entry</th><th scope="col">Sign</th><th scope="col">1/2</th><th scope="col">1/4</th><th scope="col">1/8</th></tr></thead><tbody>${visual.binaryRows.map(row => `<tr><th scope="row">${escape(row.label)}</th><td>${row.negative ? '−' : '+'}</td>${[...row.bits].map(bit => `<td><span class="${bit === '1' ? 's0x-bit-on' : 's0x-bit-off'}">${escape(bit)}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (!visual.denominator) return '';
  const denominator = visual.denominator || 8;
  const divisions = Math.min(32, Math.max(2, denominator));
  const labels = visual.ticks || ['0', '1'];
  const ticks = Array.from({ length: divisions + 1 }, (_, i) => `<path d="M${35 + 310 * i / divisions} 35v${i === 0 || i === divisions ? 18 : 10}" class="s0x-tick"/>`).join('');
  const points = (visual.points || []).map(point => `<circle cx="${35 + 310 * point.value}" cy="35" r="5" class="s0x-midpoint"/>${svgText(35 + 310 * point.value, 24, point.label || numberLabel(point.value), 's0x-midpoint-label')}`).join('');
  return `<svg viewBox="0 0 380 90" class="s0x-diagram s0x-number-line" role="img" aria-label="The interval from zero to one divided into ${divisions} equal parts."><title>Equal binary subdivisions</title><path d="M35 35H345" class="s0x-axis"/>${ticks}${points}${svgText(35, 77, labels[0])}${svgText(345, 77, labels[1])}</svg>`;
}

function gateSVG(visual) {
  const stages = visual.stages || [];
  if (!stages.length) return '';
  if (stages.every(stage => !stage.eigenvalues?.length)) {
    const scale = Math.max(...stages.map(stage => stage.radius || 0), 1 / 256);
    return `<div class="s0x-gate-diagrams">${stages.map(stage => {
      const length = 170 * (stage.radius || 0) / scale;
      return `<figure><figcaption>${escape(stage.label)}</figcaption><svg viewBox="0 0 240 110" class="s0x-diagram" role="img" aria-label="Guaranteed radius ${escape(numberLabel(stage.radius))} shown as a length on the shared scale"><title>Guaranteed radii compared on the same scale</title><path d="M35 70H220 M35 28V76" class="s0x-axis"/><rect x="35" y="35" width="${length}" height="26" class="s0x-protected-ball"/>${svgText(35, 96, '0')}${svgText(35 + length, 27, numberLabel(stage.radius), 's0x-contour-label')}</svg><p class="s0x-radius">Guaranteed radius: <strong>${escape(numberLabel(stage.radius))}</strong></p></figure>`;
    }).join('')}</div><p class="s0x-caption">Both bars use the same scale.</p>`;
  }
  const contour = visual.circle || { center: 1 / 4, radius: 1 / 8 };
  const width = 300, height = 180;
  return `<div class="s0x-gate-diagrams">${stages.map(stage => {
    const xs = value => 45 + value * 280;
    const eigenvalues = stage.eigenvalues || [];
    const dots = eigenvalues.map((value, i) => `<circle cx="${xs(value)}" cy="85" r="5.5" class="${i ? 's0x-other-eigenvalue' : 's0x-midpoint'}"/>${svgText(xs(value), 148, stage.eigenvalueLabels?.[i] || numberLabel(value), '', 'middle')}`).join('');
    return `<figure><figcaption>${escape(stage.label)}</figcaption><svg viewBox="0 0 ${width} ${height}" class="s0x-diagram" role="img" aria-label="${escape(stage.label)} eigenvalues and the same circular contour"><title>${escape(stage.label)} and the fixed contour</title><path d="M20 85H280" class="s0x-axis"/><circle cx="${xs(contour.center)}" cy="85" r="${280 * contour.radius}" class="s0x-contour"/>${svgText(xs(contour.center), 29, 'Γ', 's0x-contour-label')}${dots}${svgText(279, 111, 'Re z', 's0x-axis-label', 'end')}</svg>${stage.radius !== undefined ? `<p class="s0x-radius">${stage.label.includes('actual moat') ? 'Actual contour moat' : 'Guaranteed radius'}: <strong>${escape(stage.radiusLabel || numberLabel(stage.radius))}</strong></p>` : ''}</figure>`;
  }).join('')}</div>`;
}

export function exerciseVisual(visual) {
  if (!visual) return '';
  const matrices = visual.matrices?.length ? `<div class="s0x-matrix-row">${visual.matrices.map(matrixHTML).join('')}</div>` : '';
  const drawing = visual.type === 'entry-box' ? entryBoxSVG(visual) : visual.type === 'dyadic-grid' ? dyadicSVG(visual) : visual.type === 'gate-chain' ? gateSVG(visual) : '';
  return `<div class="s0x-visual">${matrices}${drawing}${visual.caption ? `<p class="s0x-caption">${escape(visual.caption)}</p>` : ''}</div>`;
}

function stateFor(exercise) {
  if (!progress.has(exercise.id)) progress.set(exercise.id, { current: 0, revealed: -1 });
  return progress.get(exercise.id);
}

export function mountStepZeroExercises(root) {
  const abort = new AbortController(), { signal } = abort;
  const uid = `s0x-${++mountCount}`;
  let alive = true, restoreSelector = '[data-s0x-reveal]';
  const modal = document.createElement('dialog');
  modal.className = 's0x-dialog mathjax_ignore';
  modal.setAttribute('aria-labelledby', `${uid}-dialog-title`);
  modal.setAttribute('aria-describedby', `${uid}-dialog-description`);
  document.body.append(modal);
  const selected = () => STEP_ZERO_EXERCISES[selectedExercise];
  const announce = message => { const el = root.querySelector('[data-s0x-announcement]'); if (el) el.textContent = message; };
  function focusCurrent() { root.querySelector('[data-s0x-step-heading]')?.focus({ preventScroll: true }); }
  function render() {
    const exercise = selected(), state = stateFor(exercise), step = exercise.steps[state.current];
    root.innerHTML = `<div class="s0x-root mathjax_ignore"><header class="s0x-intro"><p class="s0x-eyebrow">STEP 00 · PAPER, PENCIL, THEN REVEAL</p><h2>Three small matrices. Three useful ideas.</h2><p>Work through one hint at a time. Write your answer on paper, then select <strong>Reveal</strong> to compare it with a detailed solution. Each popup collects the solutions you have revealed for that exercise.</p><p class="s0x-boundary">These are separate practice matrices. The default certification example stays unchanged.</p></header>
      <nav class="s0x-chooser" aria-label="Choose a dyadic matrix exercise">${STEP_ZERO_EXERCISES.map((item, index) => {
        const itemState = stateFor(item);
        return `<button type="button" data-s0x-exercise="${index}" aria-pressed="${index === selectedExercise}"><span class="s0x-exercise-number">0${index + 1}</span><span><strong>${escape(item.title)}</strong><span class="s0x-chooser-summary">${escape(item.summary)}</span><span class="s0x-progress-label">${Math.max(0, itemState.revealed + 1)} of ${item.steps.length} solutions revealed</span></span></button>`;
      }).join('')}</nav>
      <article class="s0x-workbook" aria-labelledby="${uid}-exercise-title"><header class="s0x-workbook-head"><div><p class="s0x-eyebrow">EXERCISE ${selectedExercise + 1} OF ${STEP_ZERO_EXERCISES.length}</p><h2 id="${uid}-exercise-title">${escape(exercise.title)}</h2>${exercise.objective ? `<p>${exercise.objective}</p>` : ''}</div><button type="button" data-s0x-reset ${state.revealed < 0 && state.current === 0 ? 'disabled' : ''} aria-label="Reset this exercise's progress">Reset exercise</button></header>
      <section class="s0x-givens" aria-label="Given matrices and setup">${exercise.context ? `<p>${exercise.context}</p>` : ''}${exercise.setupHTML || ''}${exerciseVisual(exercise.visual)}</section>
      <nav class="s0x-step-nav" aria-label="Exercise steps">${exercise.steps.map((item, index) => `<button type="button" data-s0x-step="${index}" ${index > state.revealed + 1 ? 'disabled' : ''} ${index === state.current ? 'aria-current="step"' : ''} aria-label="Step ${index + 1}: ${escape(item.title)}${index <= state.revealed ? ', solution revealed' : ', hint'}"><span>${index + 1}</span><span>${escape(item.title)}</span>${index <= state.revealed ? '<span class="s0x-check" aria-hidden="true">✓</span>' : ''}</button>`).join('')}</nav>
      <section class="s0x-current-step" aria-labelledby="${uid}-step-title"><p class="s0x-eyebrow">STEP ${state.current + 1} OF ${exercise.steps.length} · YOUR TURN</p><h3 id="${uid}-step-title" data-s0x-step-heading tabindex="-1">${escape(step.title)}</h3><div class="s0x-prompt">${step.prompt}</div><aside class="s0x-hint"><strong>Hint · what to do now</strong><div>${step.hint}</div></aside><p class="s0x-paper-note">Pause here and try this step on paper. There is no time limit.</p>
      <div class="s0x-actions"><button type="button" class="s0x-primary" data-s0x-reveal>${state.current <= state.revealed ? 'Reveal again' : 'Reveal'}</button>${state.current <= state.revealed && state.current < exercise.steps.length - 1 ? '<button type="button" data-s0x-next>Next hint →</button>' : ''}${state.revealed >= 0 ? '<button type="button" data-s0x-review>Review revealed solutions</button>' : ''}</div>
      ${state.revealed === exercise.steps.length - 1 ? '<p class="s0x-complete">All solutions for this exercise are available. Revisit any step, or choose the next exercise above.</p>' : '<p class="s0x-next-note">The following hint becomes available after you reveal this step. Its solution stays concealed until you choose Reveal.</p>'}</section></article><p class="s0x-sr-only" role="status" aria-live="polite" data-s0x-announcement></p></div>`;
    typesetMath(root);
  }
  function renderModal() {
    const exercise = selected(), state = stateFor(exercise);
    const revealedSteps = exercise.steps.slice(0, state.revealed + 1);
    modal.innerHTML = `<header class="s0x-dialog-head"><div><p class="s0x-eyebrow">EXERCISE ${selectedExercise + 1} · SOLUTIONS SO FAR</p><h2 id="${uid}-dialog-title">${escape(exercise.title)}</h2><p id="${uid}-dialog-description">${revealedSteps.length} of ${exercise.steps.length} solutions revealed. Compare each numbered calculation with your paper.</p></div><button type="button" class="s0x-close" data-s0x-close aria-label="Close solutions and return to the exercise" autofocus>Close ×</button></header>
      <div class="s0x-dialog-body"><ol class="s0x-solutions">${revealedSteps.map((step, index) => `<li data-s0x-solution="${index}" ${index === state.current ? 'class="is-current"' : ''}><h3><span>${index + 1}</span>${escape(step.title)}</h3><div class="s0x-solution-points">${(step.solution || []).map(point => `<div class="s0x-solution-point">${point}</div>`).join('')}</div>${exerciseVisual(step.visual)}</li>`).join('')}</ol><p class="s0x-comparison-note">A different route can still be correct. Compare the exact entries, signs, bounds, and conclusion—not only the wording.</p></div>
      <footer class="s0x-dialog-footer"><button type="button" data-s0x-close>Return to my working</button>${state.current < exercise.steps.length - 1 ? '<button type="button" class="s0x-primary" data-s0x-modal-next>Next hint →</button>' : '<span>Exercise complete · all steps remain available</span>'}</footer>`;
    typesetMath(modal);
  }
  function openSolutions(reveal, trigger) {
    const state = stateFor(selected());
    restoreSelector = trigger.hasAttribute('data-s0x-review') ? '[data-s0x-review]' : '[data-s0x-reveal]';
    if (reveal) { state.revealed = Math.max(state.revealed, state.current); render(); }
    renderModal();
    modal.showModal();
    modal.querySelector('[data-s0x-close]')?.focus({ preventScroll: true });
  }
  function nextHint() {
    const state = stateFor(selected());
    if (state.current >= selected().steps.length - 1 || state.current > state.revealed) return;
    state.current += 1;
    render();
    focusCurrent();
    announce(`Step ${state.current + 1}. Hint ready. The solution has not been revealed.`);
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-s0x-exercise')) {
      selectedExercise = Number(button.dataset.s0xExercise); render(); focusCurrent();
    } else if (button.hasAttribute('data-s0x-step')) {
      const index = Number(button.dataset.s0xStep), state = stateFor(selected());
      if (index <= state.revealed + 1) { state.current = index; render(); focusCurrent(); }
    } else if (button.hasAttribute('data-s0x-reset')) {
      progress.set(selected().id, { current: 0, revealed: -1 }); render(); focusCurrent(); announce('Exercise reset. All solutions are concealed again.');
    } else if (button.hasAttribute('data-s0x-reveal')) openSolutions(true, button);
    else if (button.hasAttribute('data-s0x-review')) openSolutions(false, button);
    else if (button.hasAttribute('data-s0x-next')) nextHint();
  }, { signal });
  modal.addEventListener('click', event => {
    if (event.target.closest('[data-s0x-close]')) modal.close();
    else if (event.target.closest('[data-s0x-modal-next]')) {
      restoreSelector = '[data-s0x-step-heading]'; modal.close(); nextHint();
    } else if (event.target === modal) {
      const box = modal.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
    }
  }, { signal });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey || !modal.open) return;
    // Some embedded browsers let native dialog traversal leave the top layer.
    // Cycle every Tab explicitly, including scrollable matrix regions, while
    // leaving Escape to the native dialog's cancel/close behaviour.
    const focusable = [...modal.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex]')]
      .filter(element => element.tabIndex >= 0 && !element.disabled && !element.closest('[inert], [hidden]') && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    if (!focusable.length) return;
    event.preventDefault();
    const current = focusable.indexOf(document.activeElement);
    const next = current < 0 ? (event.shiftKey ? focusable.length - 1 : 0)
      : (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
    focusable[next].focus();
  }, { signal });
  modal.addEventListener('close', () => {
    // Clear answer markup on close, retaining only the tiny progress record.
    modal.replaceChildren();
    if (alive) root.querySelector(restoreSelector)?.focus({ preventScroll: true });
  }, { signal });
  render();
  return () => { alive = false; abort.abort(); if (modal.open) modal.close(); modal.remove(); };
}
