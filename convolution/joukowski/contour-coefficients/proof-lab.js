(() => {
  'use strict';

  const host = document.getElementById('bc-proof-lab');
  if (!host) return;
  const M = window.CoefficientMath;
  const { add, C, div, example, gamma, legendre, mul, scale, sub, tangent, TAU } = M;
  const ink = { positive: '#69e4f2', negative: '#f67bea', amber: '#ffd075', neutral: '#21162f' };
  const degrees = Math.PI / 180;
  const stages = [
    {
      title: 'Recover one real-line value',
      formula: String.raw`\(F_x(\theta)=\frac{f(\Gamma_\varrho(\theta))\Gamma_\varrho'(\theta)}{i(\Gamma_\varrho(\theta)-x)}\)`,
      explanation: 'Hold x fixed and follow both parts of the Cauchy density around the ellipse. Their full-turn mean recovers the real-line value.',
      axis: 'Ellipse angle θ', average: String.raw`\(\int_0^{2\pi} F_x(\theta)\,\frac{d\theta}{2\pi}\)`,
    },
    {
      title: 'Apply the Legendre weight',
      formula: String.raw`\(D_n(x)=(n+\tfrac12)f(x)P_n(x)\)`,
      explanation: 'The Cauchy formula replaces each angular average by f(x). Multiply by the Legendre weight and use signed area to combine those values along the interval.',
      axis: 'Real input x', average: String.raw`\(\int_{-1}^1 D_n(x)\,dx\)`,
    },
    {
      title: 'Collect the Cauchy kernels',
      formula: String.raw`\(K_{n,\theta}(x)=\frac{P_n(x)}{\Gamma_\varrho(\theta)-x}\)`,
      explanation: 'Hold θ fixed and integrate the kernel along the real interval to obtain twice Qₙ. Then sweep the ellipse with the outside factor shown below.',
      axis: 'Real input x', average: String.raw`\(\int_{-1}^1 K_{n,\theta}(x)\,dx=2Q_n(\Gamma_\varrho(\theta))\)`,
    },
  ];

  host.classList.add('bc-proof-lab');
  host.innerHTML = String.raw`
    <header>
      <h3>Follow the two integrations</h3>
      <p>Move the gold marker to inspect a real input and a boundary point on the original ellipse.</p>
    </header>
    <div class="bc-proof-stages" role="group" aria-label="Proof step">
      ${stages.map((s, i) => `<button type="button" data-proof-step="${i}" aria-pressed="${i === 0}">${i + 1} · ${s.title}</button>`).join('')}
    </div>
    <div class="bc-proof-probes">
      <label>Real input <output id="bc-slice-xv">0.50</output>
        <input id="bc-slice-x" type="range" min="-0.95" max="0.95" step="0.01" value="0.50">
      </label>
      <label>Ellipse angle <output id="bc-slice-tv">90°</output>
        <input id="bc-slice-t" type="range" min="0" max="360" step="1" value="90">
      </label>
    </div>
    <div class="bc-proof-panels">
      <section class="bc-proof-card">
        <div class="bc-proof-map-heading">
          <h4>Joint integrand</h4>
          <div class="bc-proof-parts" role="group" aria-label="Grid component">
            <button type="button" data-proof-part="re" aria-pressed="true">Real part</button>
            <button type="button" data-proof-part="im" aria-pressed="false">Imaginary part</button>
          </div>
        </div>
        <div class="bc-proof-formula">\(G_n(x,\theta)=(n+\tfrac12)P_n(x)F_x(\theta)\)</div>
        <svg class="bc-proof-grid" viewBox="0 0 525 290" role="img" aria-label="Signed joint integrand over the real interval and the ellipse angle"></svg>
        <div class="bc-proof-grid-key"><span>Negative</span><span class="bc-proof-gradient" aria-hidden="true"></span><span>Positive</span></div>
        <p class="bc-proof-readout" id="bc-grid-readout"></p>
      </section>
      <section class="bc-proof-card">
        ${stages.map((s, i) => `
          <div data-bc-proof-panel="${i}" ${i ? 'hidden' : ''}>
            <h4>${s.title}</h4>
            <p>${s.explanation}</p>
            <div class="bc-proof-formula">${s.formula}</div>
          </div>
        `).join('')}
        <svg class="bc-proof-slice" viewBox="0 0 525 230" role="img" aria-label="Current integration slice"></svg>
        <div class="bc-proof-slice-key"><span>Real part</span><span id="bc-proof-im-key">Imaginary part</span><span>Selected point</span></div>
        <div class="bc-proof-probe-value">
          <span id="bc-slice-value"></span>
          <svg class="bc-proof-mini" viewBox="0 0 138 66" role="img" aria-label="The selected x and omega on the interval and ellipse"></svg>
        </div>
        ${stages.map((s, i) => `
          <div class="bc-proof-result" data-bc-proof-result="${i}" ${i ? 'hidden' : ''}>
            <div class="bc-proof-formula">${s.average}</div>
            <output class="bc-proof-number"></output>
            <p class="bc-proof-identity"></p>
            ${i === 2 ? String.raw`<div class="bc-proof-formula">\(\frac{(n+\tfrac12)f(\omega)\Gamma_\varrho'(\theta)}{i}\cdot 2Q_n(\omega)\)</div>` : ''}
          </div>
        `).join('')}
      </section>
    </div>
    <div class="bc-proof-totals">
      <div><span>First around the ellipse</span><output id="bc-theta-first"></output><small>Sum each column, then combine columns.</small></div>
      <div><span>First along the interval</span><output id="bc-x-first"></output><small>Sum each row, then combine rows.</small></div>
      <div><span>Real-line coefficient</span><output id="bc-direct"></output><small id="bc-direct-source"></small></div>
    </div>
    <p class="bc-proof-method">Each cell integrates over its rectangle with measure <span data-proof-tex>\(dx\,d\theta/(2\pi)\)</span>. Colour gives the cell’s average signed density. Both routes sum the same complex cells. The ellipse stays a positive distance from the interval, so Fubini also applies to the exact integrals.</p>
  `;

  const get = id => host.querySelector('#bc-' + id);
  const currentStep = host.querySelectorAll('[data-bc-proof-panel]');
  const currentResult = host.querySelectorAll('[data-bc-proof-result]');
  const select = selector => d3.select(host.querySelector(selector));
  const grid = select('.bc-proof-grid');
  const slice = select('.bc-proof-slice');
  const mini = select('.bc-proof-mini');
  const count = 24;
  const quadrature = M.gaussLegendre(12);
  const geometry = { left: 65, right: 508, top: 13, bottom: 235 };
  const dx = 2 / count;
  const dθ = TAU / count;
  const cellMeasure = dx / count;
  let state = { example: 'square', n: 2, r: 2, t: 90, x: .5 };
  let stage = 0;
  let component = 're';
  let mesh, meshKey;

  function fmt(value, precision = 6) {
    return Math.abs(value) < 5e-11 ? '0' : Number(value.toPrecision(precision)).toString().replace('-', '−');
  }

  function cf(value) {
    if (Math.abs(value.im) < 5e-11) return fmt(value.re);
    if (Math.abs(value.re) < 5e-11) return fmt(value.im) + 'i';
    return `${fmt(value.re)} ${value.im < 0 ? '−' : '+'} ${fmt(Math.abs(value.im))}i`;
  }

  function timesMinusI(value) {
    return C(value.im, -value.re);
  }

  function contourAt(theta) {
    const omega = gamma(state.r, theta);
    return { omega, factor: timesMinusI(mul(example(state.example, omega), tangent(state.r, theta))) };
  }

  function angularDensity(point, x) {
    return div(point.factor, sub(point.omega, C(x)));
  }

  function weightedValue(x) {
    return (state.n + .5) * legendre(state.n, x) * example(state.example, x).re;
  }

  function kernel(point, x) {
    return div(C(legendre(state.n, x)), sub(point.omega, C(x)));
  }

  function integrateMesh() {
    const xQuadrature = Array.from({ length: count }, (_, col) => quadrature.nodes.map((z, k) => {
      const x = -1 + dx * (col + (1 + z) / 2);
      return { x, mass: (state.n + .5) * legendre(state.n, x) * dx * quadrature.weights[k] / 2 };
    }));
    const columns = Array.from({ length: count }, () => C(0));
    const rows = Array.from({ length: count }, () => C(0));
    const cells = [];
    for (let row = 0; row < count; row++) {
      const angles = quadrature.nodes.map((z, k) => {
        const point = contourAt(dθ * (row + (1 + z) / 2));
        point.factor = scale(point.factor, quadrature.weights[k] / (2 * count));
        return point;
      });
      for (let col = 0; col < count; col++) {
        let value = C(0);
        for (const point of angles) {
          for (const { x, mass } of xQuadrature[col]) {
            value = add(value, scale(angularDensity(point, x), mass));
          }
        }
        rows[row] = add(rows[row], value);
        columns[col] = add(columns[col], value);
        cells.push({ row, col, value, density: scale(value, 1 / cellMeasure) });
      }
    }
    return { cells, xFirst: rows.reduce(add, C(0)), thetaFirst: columns.reduce(add, C(0)) };
  }

  function addAxisText(svg, x, y, label, attrs = {}) {
    const text = svg.append('text').attr('x', x).attr('y', y).text(label);
    for (const [key, val] of Object.entries(attrs)) text.attr(key, val);
    return text;
  }

  const gridX = d3.scaleLinear([-1, 1], [geometry.left, geometry.right]);
  const gridY = d3.scaleLinear([0, 360], [geometry.bottom, geometry.top]);
  const gridLayer = grid.append('g');
  const verticalGuide = grid.append('path').attr('class', 'bc-proof-guide');
  const horizontalGuide = grid.append('path').attr('class', 'bc-proof-guide');
  const probe = grid.append('circle').attr('r', 5).attr('class', 'bc-proof-marker');
  grid.append('g').attr('class', 'bc-proof-axis')
    .attr('transform', `translate(0,${geometry.bottom})`).call(d3.axisBottom(gridX).ticks(4));
  grid.append('g').attr('class', 'bc-proof-axis')
    .attr('transform', `translate(${geometry.left},0)`).call(d3.axisLeft(gridY).tickValues([0, 90, 180, 270, 360]).tickFormat(v => v + '°'));
  addAxisText(grid, (geometry.left + geometry.right) / 2, 281, 'Real input x', { 'text-anchor': 'middle' });
  addAxisText(grid, 15, 124, 'Ellipse angle θ', { 'text-anchor': 'middle', transform: 'rotate(-90 15 124)' });

  function setProbe(id, value) {
    const input = document.getElementById('cj-' + id);
    const local = get('slice-' + id);
    local.value = value;
    if (input) {
      input.value = local.value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const updated = +(input?.value ?? local.value);
    if (state[id] !== updated) draw({ [id]: updated });
  }

  grid.on('click', event => {
    const [x, y] = d3.pointer(event);
    if (x >= geometry.left && x <= geometry.right && y >= geometry.top && y <= geometry.bottom) {
      setProbe('x', Math.min(.95, Math.max(-.95, gridX.invert(x))));
      setProbe('t', Math.round(gridY.invert(y)));
    }
  });

  function drawHeatmap() {
    const largest = Math.max(1e-14, d3.max(mesh.cells, d => Math.abs(d.density[component])));
    const positive = d3.interpolateRgb(ink.neutral, ink.positive);
    const negative = d3.interpolateRgb(ink.neutral, ink.negative);
    gridLayer.selectAll('rect').data(mesh.cells).join('rect')
      .attr('x', d => gridX(-1 + d.col * dx))
      .attr('y', d => gridY((d.row + 1) * 360 / count))
      .attr('width', (geometry.right - geometry.left) / count + .3)
      .attr('height', (geometry.bottom - geometry.top) / count + .3)
      .attr('fill', d => {
        const value = d.density[component];
        const strength = Math.sqrt(Math.abs(value) / largest);
        return (value >= 0 ? positive : negative)(strength);
      });
    get('theta-first').textContent = '≈ ' + cf(mesh.thetaFirst);
    get('x-first').textContent = '≈ ' + cf(mesh.xFirst);
    const exact = state.example === 'square';
    get('direct').textContent = exact ? ['⅓', '0', '⅔'][state.n] ?? '0' : '≈ ' + fmt(M.coefficient(state.example, state.n));
    get('direct-source').textContent = exact ? 'Exact polynomial coefficient.' : 'Independent real-line quadrature.';
  }

  function drawGridProbe() {
    const x = gridX(state.x), y = gridY(state.t);
    verticalGuide.attr('d', `M${x} ${geometry.top}V${geometry.bottom}`).attr('data-active', stage !== 2);
    horizontalGuide.attr('d', `M${geometry.left} ${y}H${geometry.right}`).attr('data-active', stage === 2);
    probe.attr('cx', x).attr('cy', y);
    const theta = state.t * degrees;
    const joint = scale(angularDensity(contourAt(theta), state.x), (state.n + .5) * legendre(state.n, state.x));
    get('grid-readout').textContent = `At the marker, ${component === 're' ? 'Re' : 'Im'} Gₙ ≈ ${fmt(joint[component])}`;
  }

  function drawMini(point) {
    const p = value => [69 + 28 * value.re, 33 - 28 * value.im];
    const outline = d3.line()(Array.from({ length: 90 }, (_, j) => p(gamma(state.r, TAU * j / 89))));
    mini.selectAll('path').data([outline, d3.line()([p(C(-1)), p(C(1))])]).join('path')
      .attr('d', d => d).attr('fill', 'none').attr('stroke', (_, index) => index ? '#ff7888' : '#ad89d5').attr('stroke-width', 1.5);
    mini.selectAll('circle').data([p(C(state.x)), p(point.omega)]).join('circle')
      .attr('cx', d => d[0]).attr('cy', d => d[1]).attr('r', 3.5)
      .attr('fill', (_, index) => index ? ink.amber : '#ff7888');
  }

  function drawSlice() {
    const theta = state.t * degrees;
    const point = contourAt(theta);
    const realOnly = stage === 1;
    const angular = stage === 0;
    const fn = angular ? t => angularDensity(contourAt(t), state.x)
      : realOnly ? x => C(weightedValue(x)) : x => kernel(point, x);
    const [min, max] = angular ? [0, TAU] : [-1, 1];
    const samples = Array.from({ length: 181 }, (_, i) => {
      const k = min + (max - min) * i / 180;
      return { k, value: fn(k) };
    });
    const high = Math.max(.001, 1.1 * d3.max(samples, d => Math.max(Math.abs(d.value.re), Math.abs(d.value.im))));
    const x = d3.scaleLinear([min, max], [70, 503]);
    const y = d3.scaleLinear([-high, high], [173, 12]);
    const sample = angular ? theta : state.x;
    const value = fn(sample);
    slice.selectAll('*').remove();
    slice.append('g').attr('class', 'bc-proof-axis').attr('transform', 'translate(70,0)')
      .call(d3.axisLeft(y).ticks(4).tickFormat(v => fmt(v, 3)));
    const axis = d3.axisBottom(x);
    if (angular) axis.tickValues([0, TAU / 4, TAU / 2, TAU * 3 / 4, TAU]).tickFormat((_, i) => i * 90 + '°');
    else axis.tickValues([-1, -.5, 0, .5, 1]);
    slice.append('g').attr('class', 'bc-proof-axis').attr('transform', 'translate(0,173)').call(axis);
    slice.append('path').attr('d', `M70 ${y(0)}H503`).attr('stroke', '#715e85');
    if (realOnly) {
      for (const sign of [1, -1]) {
        const area = d3.area().x(d => x(d.k)).y0(y(0))
          .y1(d => y(sign > 0 ? Math.max(0, d.value.re) : Math.min(0, d.value.re)));
        slice.append('path').attr('d', area(samples)).attr('fill', sign > 0 ? ink.positive : ink.negative).attr('opacity', '.34');
      }
    }
    for (const part of realOnly ? ['re'] : ['re', 'im']) {
      const colour = part === 're' ? ink.positive : ink.negative;
      const line = d3.line().x(d => x(d.k)).y(d => y(d.value[part]));
      slice.append('path').attr('d', line(samples)).attr('fill', 'none').attr('stroke', colour)
        .attr('stroke-width', 2.3).attr('stroke-dasharray', part === 'im' ? '5 3' : null);
      slice.append('circle').attr('cx', x(sample)).attr('cy', y(value[part])).attr('r', 4)
        .attr('fill', ink.amber).attr('stroke', colour).attr('stroke-width', 1.5);
    }
    addAxisText(slice, 284, 223, stages[stage].axis, { 'text-anchor': 'middle' });
    slice.attr('aria-label', stages[stage].title + '. ' + stages[stage].axis);
    get('proof-im-key').hidden = realOnly;
    get('slice-value').textContent = `x = ${fmt(state.x, 3)} · θ = ${state.t}° · Value ≈ ${cf(value)}`;
    drawMini(point);

    let average;
    let identity;
    if (angular) {
      const count = 512;
      average = C(0);
      for (let k = 0; k < count; k++) {
        average = add(average, scale(fn(TAU * (k + .5) / count), 1 / count));
      }
      identity = 'Direct evaluation f(x) = ' + fmt(example(state.example, state.x).re);
    } else if (realOnly) {
      average = C(M.coefficient(state.example, state.n));
      identity = 'Integrate the positive and negative areas with their signs.';
    } else {
      average = scale(M.Qintegral(state.n, point.omega), 2);
      const columnDensity = scale(mul(point.factor, average), state.n + .5);
      identity = 'After multiplying by the outside factor, the angular density is ≈ ' + cf(columnDensity) + '.';
    }
    currentResult[stage].querySelector('.bc-proof-number').textContent = '≈ ' + cf(average);
    currentResult[stage].querySelector('.bc-proof-identity').textContent = identity;
  }

  function draw(next) {
    state = { ...state, ...next };
    const key = [state.n, state.r, state.example].join('|');
    if (key !== meshKey) {
      mesh = integrateMesh();
      meshKey = key;
      drawHeatmap();
    }
    get('slice-x').value = state.x;
    get('slice-t').value = state.t;
    get('slice-xv').textContent = Number(state.x).toFixed(2);
    get('slice-tv').textContent = state.t + '°';
    drawGridProbe();
    drawSlice();
  }

  for (const id of ['x', 't']) {
    const input = get('slice-' + id);
    input.addEventListener('input', () => setProbe(id, input.value));
  }
  const stepButtons = host.querySelectorAll('[data-proof-step]');
  for (const button of stepButtons) button.addEventListener('click', () => {
    stage = +button.dataset.proofStep;
    stepButtons.forEach((node, i) => node.setAttribute('aria-pressed', i === stage));
    currentStep.forEach((panel, i) => { panel.hidden = i !== stage; });
    currentResult.forEach((panel, i) => { panel.hidden = i !== stage; });
    draw(state);
  });
  const partButtons = host.querySelectorAll('[data-proof-part]');
  for (const button of partButtons) button.addEventListener('click', () => {
    component = button.dataset.proofPart;
    partButtons.forEach(node => node.setAttribute('aria-pressed', node === button));
    drawHeatmap();
    drawGridProbe();
  });

  window.BoundaryProofLab = { draw };
  draw(state);
  window.MathJax?.startup?.promise?.then(() =>
    window.MathJax?.typesetPromise?.([...host.querySelectorAll('.bc-proof-formula, [data-proof-tex]')])
  ).catch(console.error);
})();
