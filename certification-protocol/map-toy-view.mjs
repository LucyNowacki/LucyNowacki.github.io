import {renderThreeGeometry} from './three-geometry.mjs?v=three2';
import {mapToySingularValues} from './map-toy-math.mjs?v=maps1';
export {mapToySingularValues} from './map-toy-math.mjs?v=maps1';

// An empirical, finite-matrix companion. This module does not import any of
// the certification toy's matrices, contours, radii, or rank conclusions.
const TAU = 2 * Math.PI;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = value => !Number.isFinite(value) ? 'unavailable' : value === 0 ? '0' : Math.abs(value) < 1e-3 || Math.abs(value) >= 1e4 ? value.toExponential(3) : Number(value.toPrecision(5)).toString();
const complex = ([re, im]) => Math.abs(im) < 1e-12 ? fmt(re) : `${fmt(re)} ${im < 0 ? '−' : '+'} ${fmt(Math.abs(im))}i`;


function colours(root) {
  const style = getComputedStyle(root), dark = document.documentElement.dataset.certTheme === 'dark' || location.pathname.includes('certification-protocol-night');
  const read = (key, fallback) => style.getPropertyValue(key).trim() || fallback;
  return {ink: read('--ink', dark ? '#f4f0fa' : '#14243a'), muted: read('--muted', dark ? '#c7bdd7' : '#5f6d80'),
    line: read('--line', dark ? '#493c61' : '#dbe3ed'), paper: read('--paper', dark ? '#171127' : '#ffffff'),
    branches: dark ? ['#79bcff','#ff70bf','#bca7ff','#71dabb'] : ['#1871ba','#b72179','#7752b6','#167c66'],
    point: dark ? '#ffc46b' : '#a65300', spectrum: dark ? '#ff70bf' : '#bc2376'};
}

function prepare(canvas) {
  const {width, height} = canvas.getBoundingClientRect();
  if (width < 2 || height < 2) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(width * dpr)) canvas.width = Math.round(width * dpr);
  if (canvas.height !== Math.round(height * dpr)) canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.font = '13px "Segoe UI", sans-serif'; ctx.lineJoin = 'round';
  return {ctx, width, height};
}

function planarFrame(frame, palette, range, xLabel, yLabel) {
  const {ctx, width: W, height: H} = frame;
  const unit = Math.min((W - 78) / (2 * range[0]), (H - 62) / (2 * range[1]));
  const center = [W / 2 + 8, H / 2 - 3];
  const at = (x, y) => [center[0] + unit * x, center[1] - unit * y];
  const line = (a, b, colour, thickness = 1) => { ctx.strokeStyle = colour; ctx.lineWidth = thickness; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  for (const t of [-1, -.5, .5, 1]) {
    line(at(t, -range[1]), at(t, range[1]), palette.line);
    line(at(-range[0], t), at(range[0], t), palette.line);
  }
  line(at(-range[0], 0), at(range[0], 0), palette.muted, 1.2);
  line(at(0, -range[1]), at(0, range[1]), palette.muted, 1.2);
  ctx.fillStyle = palette.muted; ctx.textAlign = 'center';
  for (const t of [-1, 0, 1]) { const a = at(t, 0); ctx.fillText(String(t), a[0], a[1] + 18); }
  ctx.textAlign = 'right'; for (const t of [-1, 1]) { const a = at(0, t); ctx.fillText(String(t), a[0] - 8, a[1] + 4); }
  ctx.textAlign = 'center'; ctx.fillStyle = palette.ink; ctx.fillText(xLabel, W / 2, H - 5);
  ctx.textAlign = 'left'; ctx.fillText(yLabel, 10, 17);
  return {at, unit, center};
}

function dot(ctx, point, color, radius = 4) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(...point, radius, 0, TAU); ctx.fill();
}

function selectedSample(branch, x) {
  return branch.samples.reduce((best, sample) => !best || Math.abs(sample.x - x) < Math.abs(best.x - x) ? sample : best, null);
}

function drawBranches(canvas, map, x, palette) {
  const frame = prepare(canvas); if (!frame) return;
  const {ctx} = frame, {at} = planarFrame(frame, palette, [1.06, 1.06], 'y · point after the map', 'τᵦ(y) · inverse branch');
  ctx.setLineDash([4, 4]); ctx.strokeStyle = palette.muted; ctx.beginPath(); ctx.moveTo(...at(x, -1)); ctx.lineTo(...at(x, 1)); ctx.stroke(); ctx.setLineDash([]);
  map.branches.forEach((branch, index) => {
    ctx.strokeStyle = palette.branches[index % palette.branches.length]; ctx.lineWidth = 2;
    ctx.beginPath();
    for (const segment of branch.segments || [branch.samples]) {
      let previous = null;
      for (const sample of segment) {
        if (!Number.isFinite(sample.tau) || !Number.isFinite(sample.x)) { previous = null; continue; }
        const point = at(sample.x, sample.tau);
        if (!previous || Math.abs(sample.tau - previous.tau) > .4) ctx.moveTo(...point); else ctx.lineTo(...point);
        previous = sample;
      }
    }
    ctx.stroke();
    const sample = selectedSample(branch, x);
    if (sample) dot(ctx, at(sample.x, sample.tau), palette.branches[index % palette.branches.length], 5);
  });
}

function drawSpectrum(canvas, map, z, palette) {
  const frame = prepare(canvas); if (!frame) return null;
  const {ctx} = frame, projection = planarFrame(frame, palette, [1.35, 1.08], 'Re λ, Re z', 'Im λ, Im z');
  map.eigenvalues.forEach((lambda, index) => {
    const point = projection.at(...lambda); dot(ctx, point, palette.spectrum, 5);
    ctx.fillStyle = palette.spectrum; ctx.textAlign = 'center'; ctx.fillText(`λ${index + 1}`, point[0], point[1] - 13 - 15 * (index % 2));
  });
  const point = projection.at(...z); dot(ctx, point, palette.point, 6);
  ctx.strokeStyle = palette.point; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(...point, 10, 0, TAU); ctx.stroke();
  ctx.fillStyle = palette.point; ctx.textAlign = point[0] > frame.width - 95 ? 'right' : 'left';
  ctx.fillText('selected z', point[0] + (point[0] > frame.width - 95 ? -13 : 13), point[1] - 12);
  return projection;
}

function rotate(point, yaw, pitch) {
  const [x, y, z] = point, a = Math.cos(yaw), b = Math.sin(yaw), c = Math.cos(pitch), d = Math.sin(pitch);
  const X = a * x + b * z, Z = -b * x + a * z;
  return [X, c * y - d * Z, d * y + c * Z];
}

function drawResolvent(canvas, singular, state, palette) {
  const frame = prepare(canvas); if (!frame) return;
  const {ctx, width: W, height: H} = frame;
  if (singular.length !== 3 || singular[0] <= singular[2] * 1e-7) {
    canvas.dataset.renderer = 'unavailable'; ctx.fillStyle = palette.ink; ctx.textAlign = 'center';
    ctx.fillText('Too close to a numerical pole for this display.', W / 2, H / 2 - 10);
    ctx.fillText('Move z away from the spectrum.', W / 2, H / 2 + 14); return;
  }
  const axes = singular.map(s => 1 / s), range = axes[0] * 1.16;
  const center = [W / 2, H / 2], unit = Math.min(W * .42, H * .39) / range * state.zoom;
  const project = point => { const p = rotate(point, state.yaw, state.pitch); return [center[0] + unit * p[0], center[1] - unit * p[1]]; };
  const surface = direction => direction.map((v, i) => v * axes[i]);
  const paths = axes.map((axis, i) => ({pts: [-1.13, 1.13].map(sign => axes.map((_, j) => i === j ? sign * axis : 0)), color: palette.muted, width: 1.3, axis: true}));
  const points = axes.map((axis, i) => ({p: axes.map((_, j) => i === j ? axis : 0), color: palette.branches[i], radius: 4}));
  const rendered = renderThreeGeometry(canvas, {width: W, height: H, centre: center, range, yaw: state.yaw, pitch: state.pitch,
    zoom: state.zoom, palette: {background: palette.paper},
    surfaces: [{fn: surface, color: palette.branches[0], opacity: .07}], paths, points});
  if (!rendered) {
    // Preserve an honest wireframe fallback when WebGL is unavailable.
    ctx.strokeStyle = palette.branches[0]; ctx.lineWidth = 1.2;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      for (let k = 0; k <= 96; k++) { const angle = k * TAU / 96, d = [0, 0, 0]; d[ring] = Math.cos(angle); d[(ring + 1) % 3] = Math.sin(angle); const p = project(surface(d)); if (k) ctx.lineTo(...p); else ctx.moveTo(...p); }
      ctx.stroke();
    }
    for (const path of paths) { ctx.strokeStyle = path.color; ctx.beginPath(); ctx.moveTo(...project(path.pts[0])); ctx.lineTo(...project(path.pts[1])); ctx.stroke(); }
  }
  ctx.font = '13px "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = palette.ink;
  const labels = ['1 / σmin', '1 / σmid', '1 / σmax'];
  points.forEach((point, i) => { const p = project(point.p); const dx = p[0] - center[0], dy = p[1] - center[1], length = Math.hypot(dx, dy) || 1;
    const X = Math.max(46, Math.min(W - 46, p[0] + 24 * dx / length)); const Y = Math.max(20, Math.min(H - 14, p[1] + 24 * dy / length));
    ctx.fillText(labels[i], X, Y);
  });
}

function matrixMarkup(matrix) {
  return `<div class="map-toy-matrix-scroll" tabindex="0" aria-label="Three by three Legendre matrix"><table class="map-toy-matrix"><caption>A₃ · rows are output modes, columns are input modes</caption><thead><tr><th scope="col">mode</th>${[0, 1, 2].map(i => `<th scope="col">p${i}</th>`).join('')}</tr></thead><tbody>${matrix.map((row, i) => `<tr><th scope="row">p${i}</th>${row.map(value => `<td title="${escape(value)}">${value !== 0 && Math.abs(value) < 5e-13 ? '≈0' : fmt(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/** Mount one selected empirical map. The owner supplies the shared chooser.
 * Returns a cleanup function, matching the existing lesson's mount contract.
 */
export function mountMapToy(root, {map, immersive = false, provenance = null, numericalConvention = null} = {}) {
  if (!root || !map || map.matrix?.length !== 3) throw new Error('A map with its numerical 3×3 Legendre matrix is required.');
  const section = document.createElement('section'); section.className = `map-toy${immersive ? ' map-toy-immersive' : ''}`;
  section.dataset.mapId = map.id;
  const diagnostics = map.diagnostics || {};
  const statusText = map.spectrumStatus === 'known' ? 'Known comparison spectrum' : map.spectrumStatus === 'known_diagnostic' ? 'Comparison spectrum with a branch-cut caveat' : 'Reference-spectrum diagnostics';
  section.innerHTML = `<header class="map-toy-heading"><div><p class="eyebrow">EMPIRICAL MAP TOY · N = 3</p><h2>${escape(map.label)}</h2><p>Follow the map from its inverse branches to a small Legendre matrix, then explore the matrix’s numerical spectrum and resolvent.</p></div><span class="map-toy-badge">Numerical illustration</span></header>
    <div class="map-toy-boundary"><strong>This example has its own matrix.</strong> All displayed spectra and singular values are floating-point diagnostics. The norm is Euclidean in the L²-normalized Legendre coordinates. No whole-contour certificate or operator-rank conclusion is supplied.</div>
    ${map.branchCutCaution ? '<p class="map-toy-caution"><strong>Principal-argument branch cuts.</strong> These inverse branches have jumps. This coarse N = 3 example has visible quadrature sensitivity; read the diagnostics below before interpreting its spectrum.</p>' : ''}
    <div class="map-toy-grid">
      <section class="map-toy-card"><div class="map-toy-card-heading"><span>1</span><h3>Inverse branches</h3></div><p>Each coloured curve gives a preimage τᵦ(y). The weights φᵦ(y) describe how densities are transported.</p><canvas data-map-branches role="img" aria-label="Sampled inverse branch curves on minus one to one"></canvas><label class="map-toy-control">Point after the map, y <output data-map-y-output></output><input data-map-y type="range" min="-1" max="1" step=".01" value=".25"></label><div class="map-toy-branch-values" data-map-branch-values></div><p class="map-toy-formula">(Lf)(y) = Σᵦ φᵦ(y) f(τᵦ(y))</p></section>
      <section class="map-toy-card"><div class="map-toy-card-heading"><span>2</span><h3>Three Legendre modes</h3></div><p>The first three orthonormal polynomials on [−1, 1] give a small numerical transfer matrix.</p>${matrixMarkup(map.matrix)}<div class="map-toy-basis"><span>p₀(x) = 1 / √2</span><span>p₁(x) = √(3/2) x</span><span>p₂(x) = √(5/2) (3x² − 1) / 2</span></div><p class="map-toy-formula">(A₃)ᵢⱼ ≈ ∫₋₁¹ pᵢ(y) (Lpⱼ)(y) dy</p><p class="map-toy-small">Entries use the exported raw Gauss–Legendre assembly. The table rounds for reading; the geometry uses the stored entries.</p></section>
      <section class="map-toy-card"><div class="map-toy-card-heading"><span>3</span><h3>Numerical spectrum</h3></div><p>The pink points are the eigenvalues of this finite matrix. Move the amber point z to ask how large its inverse response is.</p><canvas data-map-spectrum tabindex="0" role="img" aria-label="Finite matrix eigenvalues in the complex plane. Click to select z; use the labelled real and imaginary sliders for keyboard control."></canvas><div class="map-toy-spectrum-values">${map.eigenvalues.map((value, i) => `<span>λ${i + 1} ≈ ${complex(value)}</span>`).join('')}</div><div class="map-toy-z-controls"><label class="map-toy-control">Re z <output data-map-re-output></output><input data-map-re type="range" min="-1.3" max="1.3" step=".005" value="1.1"></label><label class="map-toy-control">Im z <output data-map-im-output></output><input data-map-im type="range" min="-1" max="1" step=".005" value=".25"></label></div></section>
      <section class="map-toy-card"><div class="map-toy-card-heading"><span>4</span><h3>Resolvent response in 3D</h3></div><p>The inverse R₃(z) = (zI₃ − A₃)⁻¹ stretches a unit ball. Its largest semiaxis gives the pointwise inverse norm.</p><canvas data-map-resolvent tabindex="0" role="img" aria-label="Rotatable principal three-dimensional section of the complex resolvent ellipsoid. Drag or use arrow keys to rotate."></canvas><div class="map-toy-metrics" aria-live="polite"><div><span>σmin(zI₃ − A₃)</span><strong data-map-smin></strong></div><div><span>‖R₃(z)‖₂ = 1 / σmin</span><strong data-map-norm></strong></div></div><div class="map-toy-axis-values" data-map-axes></div><div class="map-toy-camera"><label class="map-toy-control">Camera zoom<input data-map-zoom type="range" min=".6" max="1.3" step=".02" value="1"></label><button type="button" data-map-reset>Reset camera</button></div><p class="map-toy-small">Drag or use arrow keys to rotate. This is a principal real 3D section of a 6D complex image, in singular-vector coordinates. The three axes retain their true ratios; each view fits them with one common scale.</p></section>
    </div>
    <details class="map-toy-details"><summary>Map formulas, numerical diagnostics and source</summary><h3>${escape(statusText)}</h3><p>${escape(map.spectrumNote || 'Only the numerical spectrum of the three-mode matrix is displayed here.')}</p><p class="map-toy-formula">${escape(map.formulaText || '')}</p><dl class="map-toy-formulas">${map.branches.map(branch => `<div><dt>Branch ${escape(branch.label)}</dt><dd>${escape(branch.orientation)}</dd></div>`).join('')}</dl><div class="map-toy-diagnostics"><div><span>Gram defect (Frobenius)</span><strong>${fmt(diagnostics.gramDefectFro)}</strong></div><div><span>Mass-preservation defect (L²)</span><strong>${fmt(diagnostics.massDefectL2)}</strong></div><div><span>M = 16 / 32 matrix difference</span><strong>${fmt(diagnostics.quadratureDifferenceFro)}</strong></div></div><p>${escape(diagnostics.note || '')}</p><p class="map-toy-small">N = 3, M = 32 Gauss–Legendre nodes, assembled at 60 decimal digits and displayed as binary64 numbers. ${escape(numericalConvention?.assembly || 'N = 3, M = 32 Gauss–Legendre nodes; comparison assembly at M = 16.')} ${escape(numericalConvention?.basis || '')}</p><p class="map-toy-small">Source: Numerics/maps_test.ipynb, empirical robustness appendix; mpmath_pf_raw.py. These are newly computed small examples, not a replay of the full experiment. ${map.appendixPage ? `Appendix figure/page reference: ${escape(map.appendixPage)}.` : ''}</p>${provenance ? '<p class="map-toy-small">The shared map-data record preserves the source digests and export settings.</p>' : ''}</details>`;
  root.replaceChildren(section);
  const q = selector => section.querySelector(selector), palette = colours(section), controller = new AbortController(), {signal} = controller;
  const state = {y: .25, z: [1.1, .25], yaw: -.52, pitch: .32, zoom: 1};
  let projection = null, drag = null, disposed = false;
  const branches = q('[data-map-branches]'), spectrum = q('[data-map-spectrum]'), resolvent = q('[data-map-resolvent]');
  function draw() {
    if (disposed) return;
    q('[data-map-y-output]').textContent = state.y.toFixed(2);
    q('[data-map-re-output]').textContent = state.z[0].toFixed(3); q('[data-map-im-output]').textContent = state.z[1].toFixed(3);
    q('[data-map-re]').value = state.z[0]; q('[data-map-im]').value = state.z[1];
    q('[data-map-branch-values]').innerHTML = map.branches.map((branch, i) => { const s = selectedSample(branch, state.y); return `<span style="--branch-color:${palette.branches[i % palette.branches.length]}"><b>${escape(branch.label)}</b> τ ≈ ${fmt(s?.tau)}, φ ≈ ${fmt(s?.phi)}</span>`; }).join('');
    const singular = mapToySingularValues(map.matrix, state.z), valid = singular.length === 3 && singular[0] > singular[2] * 1e-7;
    q('[data-map-smin]').textContent = singular.length ? '≈ ' + fmt(singular[0]) : 'unavailable';
    q('[data-map-norm]').textContent = valid ? '≈ ' + fmt(1 / singular[0]) : 'too near a pole';
    q('[data-map-axes]').textContent = valid ? `Three semiaxes ≈ ${singular.map(s => fmt(1 / s)).join(' · ')}` : 'No finite ellipsoid is drawn at a numerical pole.';
    section.dataset.selectedZ = state.z.join(','); section.dataset.sigmaMin = singular[0] ?? '';
    drawBranches(branches, map, state.y, palette); projection = drawSpectrum(spectrum, map, state.z, palette); drawResolvent(resolvent, singular, state, palette);
  }
  section.addEventListener('input', event => {
    const t = event.target;
    if (t.matches('[data-map-y]')) state.y = +t.value;
    if (t.matches('[data-map-re]')) state.z[0] = +t.value;
    if (t.matches('[data-map-im]')) state.z[1] = +t.value;
    if (t.matches('[data-map-zoom]')) state.zoom = +t.value;
    draw();
  }, {signal});
  q('[data-map-reset]').addEventListener('click', () => { state.yaw = -.52; state.pitch = .32; state.zoom = 1; q('[data-map-zoom]').value = 1; draw(); }, {signal});
  function chooseZ(event) {
    if (!projection) return;
    const rect = spectrum.getBoundingClientRect();
    state.z = [Math.max(-1.3, Math.min(1.3, (event.clientX - rect.left - projection.center[0]) / projection.unit)), Math.max(-1, Math.min(1, (projection.center[1] - event.clientY + rect.top) / projection.unit))]; draw();
  }
  spectrum.addEventListener('pointerdown', event => { spectrum.setPointerCapture(event.pointerId); chooseZ(event); }, {signal});
  spectrum.addEventListener('pointermove', event => { if (event.buttons === 1) chooseZ(event); }, {signal});
  resolvent.addEventListener('pointerdown', event => { drag = [event.clientX, event.clientY]; resolvent.setPointerCapture(event.pointerId); }, {signal});
  resolvent.addEventListener('pointermove', event => { if (!drag) return; state.yaw += (event.clientX - drag[0]) * .008; state.pitch = Math.max(-1.4, Math.min(1.4, state.pitch + (event.clientY - drag[1]) * .008)); drag = [event.clientX, event.clientY]; draw(); }, {signal});
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) resolvent.addEventListener(event, () => { drag = null; }, {signal});
  resolvent.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); if (event.key === 'ArrowLeft') state.yaw -= .12; if (event.key === 'ArrowRight') state.yaw += .12; if (event.key === 'ArrowUp') state.pitch = Math.max(-1.4, state.pitch - .1); if (event.key === 'ArrowDown') state.pitch = Math.min(1.4, state.pitch + .1); draw(); }, {signal});
  const observer = new ResizeObserver(draw); [branches, spectrum, resolvent].forEach(canvas => observer.observe(canvas));
  draw();
  return () => { disposed = true; controller.abort(); observer.disconnect(); };
}
