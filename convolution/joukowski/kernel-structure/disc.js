(() => {
  'use strict';
  const host = document.getElementById('kernel-disc');
  const root = document.getElementById('lesson-lab');
  const math = window.CoefficientMath;
  if (!host || !root || !math) return;

  const estimateTerms = 160;
  host.innerHTML = String.raw`
    <h3>Where can the infinite sum land?</h3>
    <p>The coloured arrows give the retained sum. The omitted arrows can move its endpoint by at most the radius of the shaded disc.</p>
    <div class="kw-controls">
      <button type="button" data-disc-align>Align arrows at 0°</button>
      <button type="button" data-disc-example>Load six-term example</button>
    </div>
    <div class="kw-controls" role="group" aria-label="Choose a view of the complex plane">
      <button type="button" data-disc-fit="both" aria-pressed="true">Overview + detail</button>
      <button type="button" data-disc-fit="all" aria-pressed="false">Fit all</button>
      <button type="button" data-disc-fit="disc" aria-pressed="false">Fit disc</button>
    </div>
    <div class="kw-grid" data-disc-planes>
      <section class="kw-card" data-disc-panel="all" aria-labelledby="kw-disc-overview">
        <h4 id="kw-disc-overview">Retained sum</h4>
        <svg class="kw-plot sk-chart" data-disc-plot="all" role="img" aria-label="Retained arrows added head to tail in the complex plane"></svg>
        <dl class="kw-readout kw-disc-values">
          <dt>White ring · Finite endpoint</dt><dd><output data-disc-value="endpoint"></output></dd>
          <dt>Independent quadrature</dt><dd><output data-disc-value="quadrature"></output></dd>
        </dl>
        <p class="kw-disc-note">The dashed line joins the origin to the finite endpoint. The violet boundary uses the calculated disc radius.</p>
      </section>
      <section class="kw-card" data-disc-panel="disc" aria-labelledby="kw-disc-detail">
        <h4 id="kw-disc-detail">Remainder disc at the endpoint</h4>
        <div class="kw-controls">
          <button type="button" data-disc-magnify aria-pressed="false">Magnify the offset</button>
        </div>
        <svg class="kw-plot sk-chart" data-disc-plot="disc" role="img" aria-label="Magnified remainder disc and estimated offset from the finite endpoint"></svg>
        <dl class="kw-readout kw-disc-values">
          <dt>Green diamond · Estimated offset</dt><dd><output data-disc-value="offset"></output></dd>
          <dt>Offset as a share of the radius</dt><dd><output data-disc-value="ratio"></output></dd>
          <dt>Disc radius</dt><dd><output data-disc-value="radius"></output></dd>
          <dt>First omitted exponent</dt><dd><output data-disc-value="omitted"></output></dd>
        </dl>
        <p class="kw-disc-note" data-disc-view-note></p>
        <p class="kw-disc-note">The white ring marks the finite endpoint at zero offset. The diamond estimates the displacement by summing the first ${estimateTerms} omitted terms.</p>
      </section>
    </div>
    <section class="kw-card" aria-labelledby="kw-disc-compare-title">
      <h4 id="kw-disc-compare-title">Two sources of slack in the bound</h4>
      <svg class="kw-plot sk-chart" data-disc-comparison role="img" aria-label="Magnitude comparisons on the same scale"></svg>
      <p class="kw-readout">Maximum bracket width <output data-disc-value="bracketWidth"></output></p>
      <div class="math-static">
        <p>Alignment at \(\theta=0\) closes the gap between \(|Q_{n,L}|\) and the sum of retained lengths \(S_L\). Replacing each \(\sigma_{n,k}\) by \(2\) accounts for the next gap.</p>
        <div class="lesson-formula">\[\begin{aligned}S_L &\le \max_\theta |Q_n(\Gamma_\varrho(\theta))|\\ &\le S_L+B_L.\end{aligned}\]</div>
        <p>All infinite-series terms point in the same direction at \(\theta=0\), so the full sum of their lengths attains the maximum. The bracket width is the analytic tail bound \(B_L\).</p>
      </div>
    </section>
    <div id="kd-history"></div>
  `;

  const panels = [...host.querySelectorAll('[data-disc-panel]')];
  const planes = host.querySelector('[data-disc-planes]');
  const comparison = host.querySelector('[data-disc-comparison]');
  const viewNote = host.querySelector('[data-disc-view-note]');
  const magnifyButton = host.querySelector('[data-disc-magnify]');
  const labels = Object.fromEntries(Array.from(host.querySelectorAll('[data-disc-value]'), node => [node.dataset.discValue, node]));
  const fitButtons = host.querySelectorAll('[data-disc-fit]');
  const colors = {
    axis: 'var(--muted-foreground)', frame: 'var(--border)',
    sum: 'var(--foreground)', background: 'var(--background)',
    disc: 'var(--degree)', integral: 'var(--pair)', lengths: 'var(--gold)',
    modulus: 'var(--positive)'
  };
  const series = index => `var(--viz-series-${index % 6 + 1})`;
  const fmt = value => Number(value.toPrecision(5)).toString().replaceAll('-', '−');
  const complex = ({re, im}) => `${fmt(re)} ${im < 0 ? '−' : '+'} ${fmt(Math.abs(im))}i`;
  const approx = value => `≈ ${fmt(value)}`;
  const tone = index => [colors.modulus, colors.lengths, colors.disc, colors.integral][index];
  let fit = 'both';
  let magnified = false;
  let model = null;

  function calculate({n, rho, theta, L, q}) {
    const terms = math.qTerms(n, rho, L + estimateTerms);
    const angle = theta * Math.PI / 180;
    const vertices = [math.C(0)];
    const arrows = terms.slice(0, L).map(({k, amplitude}) => math.polar(amplitude, -k * angle));
    let lengths = 0;
    for (let index = 0; index < L; ++index) {
      vertices.push(math.add(vertices.at(-1), arrows[index]));
      lengths += terms[index].amplitude;
    }
    const endpoint = vertices.at(-1);
    const offset = math.evaluateTerms(terms.slice(L), angle);
    const quadrature = math.Qintegral(n, math.gamma(rho, angle), 256);
    const radius = math.kernelRemainder(n, rho, L);
    const envelope = math.kernelRemainder(n, rho, 0);
    const offsets = Array(L + 1);
    offsets[L] = math.C(0);
    for (let index = L - 1; index >= 0; --index) {
      // Sum backward from the endpoint to retain small relative coordinates.
      offsets[index] = math.sub(offsets[index + 1], math.scale(arrows[index], 1 / radius));
    }
    return {vertices, offsets, endpoint, offset, quadrature, radius, envelope, lengths, q, omitted: n + 1 + 2 * L};
  }

  function resetSvg(element, width, height) {
    const svg = d3.select(element);
    svg.selectAll('*').remove();
    return svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);
  }

  function drawDisc(plot, local) {
    const {vertices, offsets, endpoint, offset, radius, q} = model;
    const width = Math.max(190, plot.clientWidth);
    const height = Math.max(255, Math.min(440, Math.round(width * 0.78)));
    const frame = {left: local ? 53 : 69, top: 32, right: width - 17, bottom: height - 48};
    const points = local ? offsets : vertices;
    const center = local ? math.C(0) : endpoint;
    const offsetInRadii = math.scale(offset, 1 / radius);
    const span = local && magnified ? Math.max(2.5 * math.abs(offsetInRadii), 1e-6) : 1;
    const discSize = local ? 1 : radius;
    const corners = [
      math.add(center, math.C(-discSize, -discSize)),
      math.add(center, math.C(discSize, discSize))
    ];
    const [minRe, maxRe] = local ? [-span, span] : d3.extent([...vertices, ...corners], p => p.re);
    const [minIm, maxIm] = local ? [-span, span] : d3.extent([...vertices, ...corners], p => p.im);
    const scale = 0.85 * Math.min((frame.right - frame.left) / (maxRe - minRe),
                                 (frame.bottom - frame.top) / (maxIm - minIm));
    const cx = (frame.left + frame.right) / 2, cy = (frame.top + frame.bottom) / 2;
    const midRe = (minRe + maxRe) / 2, midIm = (minIm + maxIm) / 2;
    const x = re => cx + (re - midRe) * scale;
    const y = im => cy - (im - midIm) * scale;
    const xValues = d3.ticks(midRe + (frame.left - cx) / scale,
                            midRe + (frame.right - cx) / scale, width < 400 ? 2 : 4);
    const yValues = d3.ticks(midIm - (frame.bottom - cy) / scale,
                            midIm - (frame.top - cy) / scale, 4);
    const tickFormat = value => Math.abs(value) >= 1e-3 || value === 0
      ? Number(value.toPrecision(3)).toString().replaceAll('-', '−')
      : value.toExponential(1).replace('.0e', 'e').replaceAll('-', '−');
    const svg = resetSvg(plot, width, height);
    svg.append('title').text(local
      ? 'The exact displacement is in the violet disc. The green diamond is the omitted-series estimate.'
      : 'The white ring marks the endpoint of the retained arrow chain.');
    svg.append('rect').attr('x', frame.left).attr('y', frame.top).attr('width', frame.right - frame.left)
      .attr('height', frame.bottom - frame.top).attr('fill', 'none').attr('stroke', colors.frame);
    xValues.forEach(value => {
      const at = x(value);
      svg.append('line').attr('x1', at).attr('x2', at).attr('y1', frame.top).attr('y2', frame.bottom)
        .attr('stroke', value === 0 ? colors.axis : colors.frame);
      svg.append('text').attr('x', at).attr('y', frame.bottom + 17).attr('text-anchor', 'middle').text(tickFormat(value));
    });
    yValues.forEach(value => {
      const at = y(value);
      svg.append('line').attr('x1', frame.left).attr('x2', frame.right).attr('y1', at).attr('y2', at)
        .attr('stroke', value === 0 ? colors.axis : colors.frame);
      svg.append('text').attr('x', frame.left - 6).attr('y', at + 4).attr('text-anchor', 'end').text(tickFormat(value));
    });
    svg.append('text').attr('x', frame.left).attr('y', 16).text(local ? 'Im offset / radius' : 'Imaginary part');
    svg.append('text').attr('x', frame.right).attr('y', height - 8).attr('text-anchor', 'end')
      .text(local ? 'Re offset / radius' : 'Real part');

    const defs = svg.append('defs');
    const clip = local ? 'kw-remainder-detail-clip' : 'kw-remainder-overview-clip';
    defs.append('clipPath').attr('id', clip).append('rect')
      .attr('x', frame.left).attr('y', frame.top).attr('width', frame.right - frame.left).attr('height', frame.bottom - frame.top);
    const marks = svg.append('g').attr('clip-path', `url(#${clip})`);
    marks.append('circle').attr('data-remainder-disc', '').attr('cx', x(center.re)).attr('cy', y(center.im))
      .attr('r', discSize * scale).attr('fill', colors.disc).attr('fill-opacity', .22).attr('stroke', colors.disc).attr('stroke-width', 1.6);
    if (!local) {
      marks.append('line').attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(endpoint.re)).attr('y2', y(endpoint.im))
        .attr('stroke', colors.sum).attr('stroke-width', 1.25).attr('stroke-dasharray', '5 4');
      marks.append('circle').attr('cx', x(0)).attr('cy', y(0)).attr('r', 2.5).attr('fill', colors.sum);
    }
    for (let index = 0; index < points.length - 1; ++index) {
      const start = points[index], end = points[index + 1];
      const extent = Math.hypot(x(start.re) - x(end.re), y(start.im) - y(end.im));
      if (extent < .5) continue;
      const arrowSize = Math.min(9, extent * .75);
      const marker = `${clip}-arrow-${index}`;
      defs.append('marker').attr('id', marker).attr('viewBox', '0 -4 8 8').attr('refX', 8).attr('refY', 0)
        .attr('markerUnits', 'userSpaceOnUse').attr('markerWidth', arrowSize).attr('markerHeight', arrowSize)
        .attr('orient', 'auto').append('path').attr('d', 'M0,-4L8,0L0,4Z').attr('fill', series(index));
      marks.append('line').attr('data-disc-arrow', index).attr('x1', x(start.re)).attr('y1', y(start.im))
        .attr('x2', x(end.re)).attr('y2', y(end.im)).attr('stroke', series(index))
        .attr('stroke-width', index === q ? 3.3 : 2).attr('marker-end', `url(#${marker})`);
    }
    marks.append('circle').attr('data-disc-endpoint', '').attr('cx', x(center.re)).attr('cy', y(center.im))
      .attr('r', 5).attr('fill', 'none').attr('stroke', colors.sum).attr('stroke-width', 1.5);
    if (local) {
      const endX = x(offsetInRadii.re), endY = y(offsetInRadii.im), size = 5;
      marks.append('line').attr('x1', x(0)).attr('y1', y(0)).attr('x2', endX).attr('y2', endY)
        .attr('stroke', colors.integral).attr('stroke-width', 1.5);
      marks.append('path').attr('data-disc-offset', '').attr('d', `M${endX},${endY - size}l${size},${size}l${-size},${size}l${-size},${-size}Z`)
        .attr('fill', colors.integral).attr('stroke', colors.background).attr('stroke-width', .8);
      viewNote.textContent = magnified
        ? 'The axes are still measured in disc radii. Choose Show full disc to see the boundary.'
        : 'One unit on either axis equals one disc radius. Only the end of the retained chain may be visible here.';
    }
  }

  function drawComparison() {
    const {endpoint, lengths, radius, envelope} = model;
    const width = Math.max(190, comparison.clientWidth);
    const compact = width < 450;
    const spacing = compact ? 54 : 43;
    const height = 4 * spacing + 28;
    const svg = resetSvg(comparison, width, height);
    const left = 6, right = width - 12, x = value => left + value / envelope * (right - left);
    const rows = [
      ['Finite modulus', 0, math.abs(endpoint)],
      ['Sum of retained lengths', 0, lengths],
      ['Finite bound using 2', 0, envelope - radius],
      ['Infinite maximum bracket', lengths, lengths + radius]
    ];
    const readings = rows.map(([, start, end]) => {
      if (start === 0) return approx(end);
      return fmt(start) === fmt(end) ? `Lower edge ≈ ${fmt(start)}` : `≈ [${fmt(start)}, ${fmt(end)}]`;
    });
    svg.attr('aria-label', [...rows.map(([name], i) => `${name} ${readings[i]}`), `Maximum bracket width ${approx(radius)}`, `Full geometric bound ${approx(envelope)}`].join('. '));
    rows.forEach(([name, start, end], index) => {
      const y = 17 + spacing * index;
      const trackY = y + (compact ? 24 : 12);
      svg.append('text').attr('x', left).attr('y', y).text(name);
      svg.append('text').attr('x', right).attr('y', y + (compact ? 14 : 0))
        .attr('text-anchor', 'end').attr('data-disc-measure', index).text(readings[index]);
      svg.append('line').attr('x1', left).attr('x2', right).attr('y1', trackY).attr('y2', trackY)
        .attr('stroke', colors.frame).attr('stroke-width', 1.2);
      svg.append('line').attr('x1', x(start)).attr('x2', x(end)).attr('y1', trackY).attr('y2', trackY)
        .attr('stroke', tone(index)).attr('stroke-width', 5);
      svg.append('circle').attr('cx', x(end)).attr('cy', trackY).attr('r', 3.5).attr('fill', tone(index));
      if (start > 0) svg.append('circle').attr('cx', x(start)).attr('cy', trackY).attr('r', 3.5).attr('fill', tone(index));
    });
    svg.append('text').attr('x', left).attr('y', height - 8).text('0');
    svg.append('text').attr('x', right).attr('y', height - 8).attr('text-anchor', 'end').text(`Full bound ${approx(envelope)}`);
  }

  function writeReadouts() {
    const {endpoint, quadrature, offset, radius, omitted} = model;
    labels.endpoint.value = `≈ ${complex(endpoint)}`;
    labels.quadrature.value = `≈ ${complex(quadrature)}`;
    labels.offset.value = `≈ ${complex(offset)}`;
    labels.ratio.value = approx(100 * math.abs(offset) / radius) + '%';
    labels.radius.value = approx(radius);
    labels.bracketWidth.value = approx(radius);
    labels.omitted.value = `−${omitted} (k = ${omitted})`;
  }

  function drawPlanes() {
    planes.classList.toggle('kw-disc-single', fit !== 'both');
    for (const panel of panels) {
      const local = panel.dataset.discPanel === 'disc';
      panel.hidden = fit !== 'both' && panel.dataset.discPanel !== fit;
      if (!panel.hidden && model) drawDisc(panel.querySelector('svg'), local);
    }
  }

  function requestState(partial) {
    root.dispatchEvent(new CustomEvent('kernel:set', {detail: partial}));
  }
  host.querySelector('[data-disc-align]').addEventListener('click', () => requestState({theta: 0}));
  host.querySelector('[data-disc-example]').addEventListener('click', () => requestState({n: 3, rho: 1.5, theta: 28, L: 6, q: 0}));
  fitButtons.forEach(button => button.addEventListener('click', () => {
    fit = button.dataset.discFit;
    magnified = false;
    magnifyButton.setAttribute('aria-pressed', 'false');
    magnifyButton.textContent = 'Magnify the offset';
    fitButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    drawPlanes();
  }));
  magnifyButton.addEventListener('click', () => {
    magnified = !magnified;
    magnifyButton.setAttribute('aria-pressed', String(magnified));
    magnifyButton.textContent = magnified ? 'Show full disc' : 'Magnify the offset';
    drawPlanes();
  });
  root.addEventListener('kernel:update', event => {
    if (!host.getClientRects().length) return;
    model = calculate(event.detail);
    drawPlanes();
    drawComparison();
    writeReadouts();
  });
  let lastWidth = 0;
  new ResizeObserver(() => {
    if (!model || !host.getClientRects().length || lastWidth === host.clientWidth) return;
    lastWidth = host.clientWidth;
    drawPlanes();
    drawComparison();
  }).observe(host);
})();
