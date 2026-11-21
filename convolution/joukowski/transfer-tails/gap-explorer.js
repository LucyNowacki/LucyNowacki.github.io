/* The transfer lesson owns the radii and controls. This plot reads that
   model and sends pointer selections through its native radius slider. */
(() => {
  'use strict';

  const app = document.querySelector('#hardy-app[data-kind="transfer"]');
  const explorer = app?.querySelector('#gap-explorer');
  const radiusControl = app?.querySelector('#hardy-hardy');
  const resultHeading = app?.querySelector('#hardy-results .hardy-result-heading');
  if (!explorer || !radiusControl || !resultHeading || !app.dataset.model) return;

  const plot = explorer.querySelector('.gap-explorer-plot');
  const content = plot.querySelector('[data-gap-plot]');
  const outputs = {
    current: explorer.querySelector('[data-gap-current]'),
    balanced: explorer.querySelector('[data-gap-balanced]'),
    factor: explorer.querySelector('[data-gap-factor]'),
    balancedFactor: explorer.querySelector('[data-gap-balanced-factor]')
  };
  const namespace = 'http://www.w3.org/2000/svg';
  const limits = [Number(radiusControl.min), Number(radiusControl.max)];
  const sliderStep = Number(radiusControl.step);
  const inputColour = 'var(--hardy-image)';
  const outputColour = 'var(--hardy-response)';
  let drawKey = '';
  let xLimits;
  let activePointer;

  function add(tag, attributes, text) {
    const element = document.createElementNS(namespace, tag);
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    if (text !== undefined) element.textContent = text;
    content.append(element);
    return element;
  }

  function line(x1, y1, x2, y2, attributes) {
    add('line', { x1, y1, x2, y2, ...attributes });
  }

  function render() {
    const { radii, ratios } = JSON.parse(app.dataset.model);
    const { N } = JSON.parse(app.dataset.state);
    const { s, r, rho } = radii;
    const { balancedRadius, qgap, qout, qstar } = ratios;
    const width = Math.round(plot.getBoundingClientRect().width);
    if (width < 180) return;

    const key = [s, r, rho, N, width].join('/');
    if (drawKey === key) return;
    drawKey = key;

    const height = width < 450 ? 210 : 245;
    const left = 46;
    const right = width - 18;
    const top = 23;
    const bottom = height - 37;
    const minRatio = s / rho;
    const x = value => left + (right - left) * (value - s) / (rho - s);
    const y = ratio => bottom - (bottom - top) * (ratio - minRatio) / (1 - minRatio);
    xLimits = { left, right, width };
    plot.setAttribute('viewBox', `0 0 ${width} ${height}`);
    plot.setAttribute('height', height);
    content.replaceChildren();

    // The continuous curves span the open mathematical interval. The visible
    // edge bands mark the tighter limits of the demonstration's slider.
    for (const [start, end] of [[0, limits[0]], [limits[1], 1]]) {
      add('rect', {
        x: left + (right - left) * start,
        width: (right - left) * (end - start),
        y: top,
        height: bottom - top,
        fill: 'var(--raised)'
      });
    }
    for (const ratio of [minRatio, (1 + minRatio) / 2, 1]) {
      line(left, y(ratio), right, y(ratio), { stroke: 'var(--line)' });
      add('text', { x: left - 7, y: y(ratio) + 4, 'text-anchor': 'end' }, ratio.toFixed(3));
    }
    add('text', { x: left, y: 13 }, 'Ratio');
    add('text', { x: left, y: bottom + 18, 'text-anchor': 'middle' }, s.toFixed(3));
    add('text', { x: right, y: bottom + 18, 'text-anchor': 'middle' }, rho.toFixed(3));
    add('text', { x: (left + right) / 2, y: height - 6, 'text-anchor': 'middle' }, 'Hardy radius');

    function curve(ratioAt, attributes) {
      const points = Array.from({ length: 81 }, (_, index) => s + (rho - s) * index / 80);
      // Include the exact crossing as a vertex of the maximum curve.
      points.push(balancedRadius);
      points.sort((a, b) => a - b);
      const coordinates = points.map(radius => `${x(radius)},${y(ratioAt(radius))}`).join(' ');
      add('polyline', { points: coordinates, fill: 'none', ...attributes });
    }

    const inputRatio = radius => s / radius;
    const outputRatio = radius => radius / rho;
    curve(radius => Math.max(inputRatio(radius), outputRatio(radius)), {
      stroke: 'var(--line)', 'stroke-width': 8, 'stroke-linejoin': 'round', 'data-gap-curve': 'maximum'
    });
    curve(inputRatio, { stroke: inputColour, 'stroke-width': 2.5, 'data-gap-curve': 'input' });
    curve(outputRatio, {
      stroke: outputColour, 'stroke-width': 2.5, 'stroke-dasharray': '6 3', 'data-gap-curve': 'output'
    });

    const balanceX = x(balancedRadius);
    const balancedRatio = Math.sqrt(minRatio);
    const balanceY = y(balancedRatio);
    line(x(r), top, x(r), bottom, { stroke: 'var(--ink)', 'stroke-dasharray': '3 4', opacity: 0.65 });
    for (const [ratio, stroke] of [[qgap, inputColour], [qout, outputColour]]) {
      add('circle', { cx: x(r), cy: y(ratio), r: 5, stroke, 'stroke-width': 2, fill: 'var(--panel)' });
    }
    add('path', {
      d: `M${balanceX} ${balanceY - 6} l6 6 -6 6 -6 -6 z`,
      fill: 'var(--pair)',
      stroke: 'var(--panel)',
      'stroke-width': 1,
      'data-gap-marker': 'balance'
    });
    add('rect', {
      x: left, y: top, width: right - left, height: bottom - top,
      fill: 'transparent', 'data-gap-hit': ''
    });

    outputs.current.textContent = r.toFixed(5);
    outputs.balanced.textContent = balancedRadius.toFixed(5);
    outputs.factor.textContent = (qstar ** N).toPrecision(5);
    outputs.balancedFactor.textContent = (balancedRatio ** N).toPrecision(5);
  }

  function setRadius(event) {
    const bounds = plot.getBoundingClientRect();
    const position = (event.clientX - bounds.left) * xLimits.width / bounds.width;
    const fraction = (position - xLimits.left) / (xLimits.right - xLimits.left);
    const limited = Math.min(limits[1], Math.max(limits[0], fraction));
    const value = limits[0] + sliderStep * Math.round((limited - limits[0]) / sliderStep);
    const previous = radiusControl.value;
    radiusControl.value = value;
    if (radiusControl.value !== previous) {
      radiusControl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  plot.addEventListener('pointerdown', event => {
    if (!xLimits || !event.target.hasAttribute('data-gap-hit') || event.button !== 0 || activePointer !== undefined) return;
    activePointer = event.pointerId;
    plot.setPointerCapture(activePointer);
    setRadius(event);
  });
  plot.addEventListener('pointermove', event => {
    if (event.pointerId === activePointer) setRadius(event);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    plot.addEventListener(type, event => {
      if (event.pointerId === activePointer) activePointer = undefined;
    });
  }

  resultHeading.after(explorer);
  explorer.hidden = false;
  app.dataset.gapExplorerReady = 'true';
  new MutationObserver(render).observe(app, { attributes: true, attributeFilter: ['data-model'] });
  new ResizeObserver(render).observe(plot);
  render();
})();
