/* A rotating angular window on the polynomial boundary trace in lessons 10 and 11. */
(function () {
  'use strict';

  const fullTurn = 2 * Math.PI;
  const degree = Math.PI / 180;
  const wrap = angle => (angle % fullTurn + fullTurn) % fullTurn;
  const format = number => Number(number.toPrecision(5)).toString();

  // The d-th coefficient of |F|² is the autocorrelation at frequency difference d.
  function energyHarmonics(packet) {
    const coefficients = packet.coefficients;
    return coefficients.map((_, difference) => {
      let real = 0, imaginary = 0;
      for (let k = difference; k < coefficients.length; k++) {
        const [a, b] = coefficients[k];
        const [c, d] = coefficients[k - difference];
        real += a * c + b * d;
        imaginary += b * c - a * d;
      }
      return [real, imaginary];
    });
  }

  function arcEnergy(harmonics, center, width) {
    const whole = harmonics[0][0];
    if (!width) return 0;
    if (width >= fullTurn) return whole;
    let result = whole * width / fullTurn;
    for (let d = 1; d < harmonics.length; d++) {
      const [real, imaginary] = harmonics[d];
      const valueAtCenter = real * Math.cos(d * center) - imaginary * Math.sin(d * center);
      result += 2 * Math.sin(d * width / 2) / (Math.PI * d) * valueAtCenter;
    }
    // At a zero, evaluation of the finite trigonometric sum can cancel to roundoff.
    return Math.max(0, Math.min(whole, result));
  }

  function samplePeak(packet, center, width, packetValue) {
    const start = center - width / 2;
    const end = center + width / 2;
    let angle = start;
    let value = Math.hypot(...packetValue(packet, angle));
    const include = candidate => {
      const magnitude = Math.hypot(...packetValue(packet, candidate));
      if (magnitude > value) {
        angle = candidate;
        value = magnitude;
      }
    };
    // Include the probe, both ends and every whole degree in the window.
    // This contains an exact maximizing vertex on a full turn for our positive packets.
    include(center);
    include(end);
    for (let i = Math.ceil(start / degree); i <= Math.floor(end / degree); i++) include(i * degree);
    return { value, angle: wrap(angle) };
  }

  function angularIntervals(center, width) {
    if (width >= fullTurn) return [[0, fullTurn]];
    const start = wrap(center - width / 2);
    const end = start + width;
    return end <= fullTurn ? [[start, end]] : [[start, fullTurn], [0, end - fullTurn]];
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { energyHarmonics, arcEnergy, samplePeak, angularIntervals };
    return;
  }

  const root = document.getElementById('hardy-app');
  const panel = document.getElementById('angular-window');
  if (!root || !panel || !window.HardyMath) return;

  const math = window.HardyMath;
  const scene = document.getElementById('hardy-scene');
  const profile = document.getElementById('hardy-profile');
  const widthSlider = document.getElementById('angular-window-width');
  const sizeOutput = document.getElementById('angular-window-size');
  const help = panel.querySelector('[data-arc-help]');
  const label = panel.querySelector('[data-arc-label]');
  const reading = panel.querySelector('[data-arc-value]');
  const comparison = panel.querySelector('[data-arc-comparison]');
  const summary = document.getElementById('angular-window-summary');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const storageKey = 'convolution-angular-window-' + root.dataset.kind;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null && Number.isInteger(+saved) && +saved >= 0 && +saved <= 360) widthSlider.value = saved;
  } catch {}
  let current, packet, harmonics, packetKey;

  function svgMark(tag, attributes) {
    const node = document.createElementNS(svgNamespace, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    node.setAttribute('data-arc-overlay', '');
    node.setAttribute('aria-hidden', 'true');
    node.setAttribute('pointer-events', 'none');
    return node;
  }

  function peakDiamond(cx, cy, color) {
    const d = `M ${cx} ${cy - 6} l 6 6 -6 6 -6 -6 Z`;
    return svgMark('path', { d, fill: 'var(--panel)', stroke: color, 'stroke-width': 2.5 });
  }

  function drawArc(gauge, center, width, color, peak) {
    const boundary = scene.querySelector('[data-boundary="' + gauge.key + '"]');
    if (!boundary) return;
    const { cx, cy, rx, ry } = boundary;
    const point = angle => [
      cx.baseVal.value + rx.baseVal.value * Math.cos(angle),
      cy.baseVal.value - ry.baseVal.value * Math.sin(angle)
    ];
    const start = center - width / 2, end = center + width / 2;
    const marks = svgMark('g', {});
    if (width > 0) {
      // Two half-arcs also close the boundary when the selected width is one turn.
      const arc = ' A ' + rx.baseVal.value + ' ' + ry.baseVal.value + ' 0 0 0 ';
      const d = 'M ' + point(start) + arc + point(center) + arc + point(end);
      marks.append(svgMark('path', { d, fill: 'none', stroke: color, 'stroke-width': 5.5, 'stroke-linecap': 'round' }));
    }
    if (width > 0 && width < fullTurn) {
      for (const angle of [start, end]) {
        const [cx, cy] = point(angle);
        marks.append(svgMark('circle', { cx, cy, r: 3.5, fill: 'var(--panel)', stroke: color, 'stroke-width': 2 }));
      }
    }
    if (peak) marks.append(peakDiamond(...point(peak.angle), color));
    boundary.after(marks);
  }

  function drawProfile(gauge, center, width, color, peak) {
    const frame = profile.querySelector('[data-chart-frame]');
    const curve = profile.querySelector('[data-profile-curve]');
    if (!frame || !curve) return;
    const left = frame.x.baseVal.value, top = frame.y.baseVal.value;
    const plotWidth = frame.width.baseVal.value, height = frame.height.baseVal.value;
    const x = angle => left + plotWidth * angle / fullTurn;
    const { ymax } = JSON.parse(profile.dataset.profile);
    const y = value => top + height * (1 - value / ymax);
    const plot = curve.parentElement;
    const intervals = angularIntervals(center, width);
    const edgeValue = angle => {
      const magnitude = Math.hypot(...math.packetValue(packet, angle));
      return gauge.energy ? magnitude * magnitude : magnitude;
    };
    for (const [start, end] of intervals) {
      if (end - start < 1e-12) continue;
      const points = [
        [x(start), y(edgeValue(start))],
        ...gauge.profile.filter(sample => sample.angle > start && sample.angle < end)
          .map(sample => [x(sample.angle), y(sample.value)]),
        [x(end), y(edgeValue(end))]
      ];
      const trace = 'M ' + points.join(' L ');
      if (gauge.energy) {
        const d = trace + ' L ' + x(end) + ' ' + (top + height) + ' H ' + x(start) + ' Z';
        plot.prepend(svgMark('path', { d, fill: color, 'fill-opacity': 0.3 }));
      } else {
        // Only the height matters for a modulus maximum. Carry that height across the window.
        plot.prepend(svgMark('rect', { x: x(start), y: top, width: x(end) - x(start), height, fill: color, 'fill-opacity': 0.075 }));
        curve.before(svgMark('line', { x1: x(start), x2: x(end), y1: y(peak.value), y2: y(peak.value),
          stroke: color, 'stroke-width': 1.5, 'stroke-dasharray': '2 4' }));
      }
      curve.after(svgMark('path', { d: trace, fill: 'none', stroke: color, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
    }
    if (peak) plot.append(peakDiamond(x(peak.angle), y(peak.value), color));
  }

  function update() {
    if (!current) return;
    const { model, gauge } = current;
    // The polynomial is independent of angle for both embedding lessons.
    const part = gauge.key === 'source' ? 'full' : model.state.part;
    const key = JSON.stringify([gauge.radius, part, part === 'full' ? 0 : model.state.N, model.coefficients]);
    if (packetKey !== key) {
      const coefficients = part === 'full' ? model.coefficients : math.split(model.coefficients, model.state.N)[part];
      packet = math.packet(coefficients, gauge.radius);
      harmonics = energyHarmonics(packet);
      packetKey = key;
    }
    const widthDegrees = Number(widthSlider.value), width = widthDegrees * degree;
    const center = wrap(gauge.angle);
    const color = gauge.key === 'source' ? 'var(--hardy-input)' : 'var(--hardy-image)';
    const peak = gauge.energy ? null : samplePeak(packet, center, width, math.packetValue);
    const value = gauge.energy ? arcEnergy(harmonics, center, width) : peak.value;
    const fraction = gauge.whole ? value / gauge.whole : null;
    for (const plot of [scene, profile]) {
      for (const mark of plot.querySelectorAll('[data-arc-overlay]')) mark.remove();
    }
    drawArc(gauge, center, width, color, peak);
    drawProfile(gauge, center, width, color, peak);

    panel.style.setProperty('--arc-color', color);
    sizeOutput.value = widthDegrees + '°';
    widthSlider.setAttribute('aria-valuetext', sizeOutput.value);
    for (const button of panel.querySelectorAll('[data-arc-focus]')) {
      button.setAttribute('aria-pressed', String(button.dataset.arcFocus === gauge.key));
      button.style.borderColor = button.dataset.arcFocus === gauge.key ? color : '';
    }
    const measuredFunction = gauge.key === 'source' ? 'full input' : part === 'tail' ? 'discarded tail' :
      part === 'prefix' ? 'retained modes' : 'restricted function';
    const location = (gauge.key === 'source' ? 'Outer' : 'Inner') + ' ellipse, ' + measuredFunction;
    help.textContent = gauge.energy
      ? 'The highlighted arc unfolds into the filled area below. Each angle carries equal weight in the mean.'
      : 'The diamonds mark the same sampled peak on the ellipse and on its profile. The dotted line carries that height across the window.';
    label.textContent = gauge.energy ? 'Energy contributed' : 'Largest sampled modulus';
    reading.value = '≈ ' + format(value);
    comparison.textContent = fraction === null ? 'Zero on the whole boundary' :
      format(100 * fraction) + '% of ' + (gauge.energy ? 'whole mean energy' : 'whole supremum') +
      ' (' + format(gauge.whole) + ')';
    const angleText = angle => format(wrap(angle) / degree) + '°';
    const start = center - width / 2, end = center + width / 2;
    const span = widthDegrees === 360 ? 'full turn' : widthDegrees === 0 ? 'single point' :
      angleText(start) + ' → ' + angleText(end) + (wrap(start) > wrap(end) ? ' across 0°' : '');
    summary.textContent = location + ' · ' + span + ' · centre ' + angleText(center) +
      (peak ? ' · sampled peak at ' + angleText(peak.angle) + ' (endpoints, centre and whole degrees sampled)' : '');
  }

  root.addEventListener('hardy:update', event => {
    const { gauge, model } = event.detail;
    if (!gauge || !model) return;
    current = { gauge, model };
    if (panel.hidden) {
      const profilePanel = profile.closest('.hardy-profile-panel');
      if (!profilePanel) return;
      profile.before(panel);
      panel.hidden = false;
    }
    update();
  });
  panel.addEventListener('click', event => {
    const focusButton = event.target.closest('[data-arc-focus]');
    if (focusButton) {
      root.querySelector('#hardy-legend [data-focus="' + focusButton.dataset.arcFocus + '"]')?.click();
      return;
    }
    const moveButton = event.target.closest('[data-arc-step]');
    if (moveButton && current) {
      const slider = root.querySelector('[data-control="angle"]');
      if (!slider) return;
      slider.value = (Number(slider.value) + Number(moveButton.dataset.arcStep) + 360) % 360;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  widthSlider.addEventListener('input', update);
  widthSlider.addEventListener('change', () => {
    try { localStorage.setItem(storageKey, widthSlider.value); } catch {}
  });
})();
