/* A target for the infinite scalar majorant, linked to the existing ellipse lab. */
(() => {
  'use strict';

  const activity = document.getElementById('tail-target');
  const lab = document.getElementById('hardy-app');
  const math = window.HardyMath;
  if (!activity || !lab || !math || lab.dataset.ready !== 'true') return;

  const tolerance = document.getElementById('tail-tolerance');
  const apply = document.getElementById('tail-apply');
  const comparisonButtons = [...activity.querySelectorAll('[data-target-radius]')];
  const radiusSlider = document.getElementById('hardy-r');
  const countSlider = document.getElementById('hardy-N');
  const cutoff = Number(countSlider.max);
  let requiredCount;
  let lastTarget;
  let lastExample;

  function minimumCount(q, target) {
    const tail = n => math.sums(q, n).T;
    if (tail(0) <= target) return 0;
    let below = 0;
    let above = 1;
    while (tail(above) > target) {
      below = above;
      above *= 2;
    }
    while (above - below > 1) {
      const middle = Math.floor((below + above) / 2);
      if (tail(middle) <= target) above = middle;
      else below = middle;
    }
    return above;
  }

  const format = number => Number(number.toPrecision(5)).toString();

  function renderTarget(state) {
    const target = Number(tolerance.value);
    const q = state.r / state.R;
    requiredCount = minimumCount(q, target);
    const counts = comparisonButtons.map(button =>
      minimumCount(Number(button.dataset.targetRadius) / state.R, target));
    const scale = Math.max(...counts, 1);

    comparisonButtons.forEach((button, index) => {
      button.querySelector('[data-count]').textContent = counts[index] + ' modes';
      button.querySelector('.tail-bar i').style.width = 100 * counts[index] / scale + '%';
      button.setAttribute('aria-pressed', String(Math.abs(Number(button.dataset.targetRadius) - state.r) < 1e-9));
    });
    document.getElementById('tail-current-radius').textContent =
      'Selected ellipse · r = ' + state.r.toFixed(2) + ' · q = ' + format(q);
    document.getElementById('tail-minimum').textContent =
      requiredCount + ' modes reach ' + format(target);
    const previousTail = requiredCount > 0 ? format(math.sums(q, requiredCount - 1).T) : null;
    const acceptedTail = format(math.sums(q, requiredCount).T);
    const preceding = previousTail === null ? '' :
      'At N = ' + (requiredCount - 1) + ' the tail is ' + previousTail + '. ';
    document.getElementById('tail-bracket').textContent =
      preceding + 'At N = ' + requiredCount + ' it falls to ' + acceptedTail + '.';
    apply.textContent = requiredCount > cutoff
      ? 'Compare with all ' + cutoff + ' example modes'
      : 'Try ' + requiredCount + ' modes in the example';
  }

  function update() {
    const state = JSON.parse(lab.dataset.state);
    const targetKey = [state.R, state.r, tolerance.value].join('/');
    if (targetKey !== lastTarget) {
      renderTarget(state);
      lastTarget = targetKey;
    }
    const model = JSON.parse(lab.dataset.model);
    const exampleKey = [state.N, model.parts.tail, model.bounds.tail].join('/');
    if (exampleKey === lastExample) return;
    document.getElementById('tail-example').textContent =
      'Example at N = ' + state.N + ' · sampled maximum of the residual ≈ ' +
      format(model.parts.tail) + ' · upper bound A × T ≈ ' + format(model.bounds.tail) + '.';
    lastExample = exampleKey;
  }

  function changeSlider(slider, value) {
    slider.value = value;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }

  comparisonButtons.forEach(button => button.addEventListener('click', () => {
    changeSlider(radiusSlider, button.dataset.targetRadius);
  }));
  tolerance.addEventListener('change', update);
  apply.addEventListener('click', () => {
    changeSlider(countSlider, Math.min(requiredCount, cutoff));
    lab.querySelector('[data-stage="2"]').click();
  });

  // Presets and animation also change the main lab. Read its final model once per update.
  new MutationObserver(update).observe(lab, { attributes: true, attributeFilter: ['data-model'] });
  activity.hidden = false;
  update();
})();
