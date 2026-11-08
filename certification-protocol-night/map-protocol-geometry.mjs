import {renderThreeGeometry} from './three-geometry.mjs?v=three2';
import {mapToySingularValues} from './map-toy-math.mjs?v=maps1';

// Display arithmetic only. Uniform bounds and gate outcomes are supplied by
// the independently checked rational certificate, never by these drawings.
const C = (re = 0, im = 0) => ({re, im});
const add = (a, b) => C(a.re + b.re, a.im + b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const conj = a => C(a.re, -a.im);
const scale = (a, t) => C(a.re * t, a.im * t);
const abs = a => Math.hypot(a.re, a.im);
const divide = (a, b) => scale(mul(a, conj(b)), 1 / (b.re * b.re + b.im * b.im));
const vecNorm = v => Math.hypot(...v.map(abs));
const mv = (A, v) => A.map(row => row.reduce((s, a, j) => add(s, mul(a, v[j])), C()));
const mm = (A, B) => A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => add(s, mul(a, B[k][j])), C())));
const adj = A => A[0].map((_, j) => A.map(row => conj(row[j])));
const real = A => A.map(row => row.map(x => C(x)));
const interpolate = (A, B, t) => A.map((row, i) => row.map((a, j) => a + t * (B[i][j] - a)));
const shift = (A, z) => A.map((row, i) => row.map((a, j) => C((i === j ? z[0] : 0) - a, i === j ? z[1] : 0)));
const unit = (phi, psi) => [Math.cos(phi), Math.sin(phi) * Math.cos(psi), Math.sin(phi) * Math.sin(psi)];
const quadratic = (K, n) => n.reduce((sum, x, i) => sum + x * K[i].reduce((s, k, j) => s + k * n[j], 0), 0);
export const mapProtocolRadialSection = (K, n) => { const r = 1 / Math.sqrt(quadratic(K, n)); return n.map(x => x * r); };

export function mapProtocolInverse(matrix) {
  const n = matrix.length, A = matrix.map((row, i) => [...row.map(x => ({...x})), ...Array.from({length: n}, (_, j) => C(i === j ? 1 : 0))]);
  for (let j = 0; j < n; j++) {
    let pivot = j;
    for (let i = j + 1; i < n; i++) if (abs(A[i][j]) > abs(A[pivot][j])) pivot = i;
    [A[pivot], A[j]] = [A[j], A[pivot]];
    const p = A[j][j]; if (abs(p) < 1e-14) throw new Error('Numerically singular display matrix');
    A[j] = A[j].map(x => divide(x, p));
    for (let i = 0; i < n; i++) if (i !== j) { const a = A[i][j]; A[i] = A[i].map((x, k) => add(x, scale(mul(a, A[j][k]), -1))); }
  }
  return A.map(row => row.slice(n));
}

export function mapProtocolSection(matrix, z, indices, inverseImage = false) {
  const F = shift(matrix, z), W = matrix.map((_, i) => indices.map(j => C(i === j ? 1 : 0)));
  const L = mm(inverseImage ? F : mapProtocolInverse(F), W), K = mm(adj(L), L).map(row => row.map(x => x.re));
  return {F, W, K};
}

export function mapProtocolFrame(certificate, step, state) {
  const c = certificate, v = c.values, a = c.numeric, theta = state.theta, t = state.t;
  const z = [c.contour.center[0] + c.contour.radius * Math.cos(theta), c.contour.center[1] + c.contour.radius * Math.sin(theta)];
  let base = a.A0, target = a.A0, radius = v.midpoint, allowance = 0, uniform = true;
  if (step === 3) { base = target = a.T; radius = 1 / v.triangularInverse; }
  if (step === 4) { base = a.S; target = interpolate(a.S, a.A0, t); allowance = t * v.schurResidual; radius = v.surrogate - allowance; }
  if (step === 4 && state.midpointOnly) { base = target = a.A0; allowance = 0; radius = v.midpoint; }
  if ([8, 9].includes(step)) { base = a.A0; target = interpolate(a.A0, a.A1, t); allowance = t * v.matrixAllowance; radius = v.midpoint - allowance; }
  if (step === 10) { base = target = a.B; radius = v.lift; }
  if ([11, 13].includes(step)) { base = a.B; target = interpolate(a.B, a.L, t); allowance = t * v.operatorAllowance; radius = v.lift - allowance; }
  const indices = base.length === 4 ? [0, 1, 3] : [0, 1, 2], singular = mapToySingularValues(target, z);
  if (step <= 3) uniform = c.gates.schurInvertible && c.gates.triangularSeparation;
  else if (step <= 7) uniform = c.gates.schurInvertible && c.gates.triangularSeparation && c.gates.gate1;
  else if (step <= 9) uniform = c.gates.schurInvertible && c.gates.triangularSeparation && c.gates.gate1 && c.gates.gate2;
  else uniform = c.gates.schurInvertible && c.gates.triangularSeparation && c.gates.gate1 && c.gates.gate2 && c.gates.zeroOutside && (step === 10 || c.gates.operatorGate);
  const section = mapProtocolSection(target, z, indices), before = mapProtocolSection(base, z, indices);
  const direction = unit(state.phi, state.psi), centre = mapProtocolRadialSection(before.K, direction), y0 = mv(before.W, centre.map(x => C(x)));
  const input = mv(mapProtocolInverse(before.F), y0), output = mv(section.F, input);
  const projection = mv(adj(before.W), output).map(x => x.re), reconstructed = mv(before.W, projection.map(x => C(x)));
  const omitted = vecNorm(output.map((x, i) => add(x, scale(reconstructed[i], -1))));
  return {z, base, target, indices, singular, radius, allowance, uniform, K: section.K, K0: before.K, centre, projection, omitted,
    inputNorm: vecNorm(input), outputNorm: vecNorm(output), displacement: vecNorm(output.map((x, i) => add(x, scale(y0[i], -1))))};
}

function prepare(canvas) {
  const {width: W, height: H} = canvas.getBoundingClientRect(); if (W < 2 || H < 2) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(W * dpr)) canvas.width = Math.round(W * dpr);
  if (canvas.height !== Math.round(H * dpr)) canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.font = '13px "Segoe UI",sans-serif'; ctx.lineJoin = 'round'; return {ctx, W, H};
}
function dot(ctx, p, color, radius = 4) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(...p, radius, 0, 2 * Math.PI); ctx.fill(); }
function planar(frame, bounds, palette, labels = ['Re', 'Im']) {
  const {ctx, W, H} = frame, [xmin, xmax, ymin, ymax] = bounds, s = Math.min((W - 75) / (xmax - xmin), (H - 65) / (ymax - ymin));
  const at = (x, y) => [W / 2 + s * (x - (xmin + xmax) / 2), H / 2 - s * (y - (ymin + ymax) / 2)];
  ctx.strokeStyle = palette.line; ctx.lineWidth = 1;
  ctx.strokeRect(...at(xmin, ymax), s * (xmax - xmin), s * (ymax - ymin));
  for (let i = 1; i < 4; i++) { const x = xmin + (xmax - xmin) * i / 4, y = ymin + (ymax - ymin) * i / 4; ctx.beginPath(); ctx.moveTo(...at(x, ymin)); ctx.lineTo(...at(x, ymax)); ctx.moveTo(...at(xmin, y)); ctx.lineTo(...at(xmax, y)); ctx.stroke(); }
  ctx.strokeStyle = palette.axes; ctx.lineWidth = 2;
  if (xmin <= 0 && xmax >= 0) { ctx.beginPath(); ctx.moveTo(...at(0, ymin)); ctx.lineTo(...at(0, ymax)); ctx.stroke(); }
  if (ymin <= 0 && ymax >= 0) { ctx.beginPath(); ctx.moveTo(...at(xmin, 0)); ctx.lineTo(...at(xmax, 0)); ctx.stroke(); }
  ctx.fillStyle = palette.muted; ctx.textAlign = 'center';
  for (const x of [xmin, (xmin + xmax) / 2, xmax]) ctx.fillText(Number(x.toPrecision(3)), at(x, ymin)[0], at(x, ymin)[1] + 18);
  ctx.textAlign = 'right'; for (const y of [ymin, (ymin + ymax) / 2, ymax]) ctx.fillText(Number(y.toPrecision(3)), at(xmin, y)[0] - 6, at(xmin, y)[1] + 4);
  ctx.textAlign = 'right'; ctx.fillText(labels[0], W - 7, H - 5); ctx.textAlign = 'left'; ctx.fillText(labels[1], 8, 15); return {at, s};
}

function spectrum(canvas, c, state, palette, distances) {
  const f = prepare(canvas); if (!f) return;
  const eigen = c.numeric.T.map((row, i) => row[i]), center = c.contour.center, radius = c.contour.radius;
  const xmin = Math.min(...eigen, center[0] - radius, 0) - .12, xmax = Math.max(...eigen, center[0] + radius) + .12;
  const {at, s} = planar(f, [xmin, xmax, -.31, .31], palette), {ctx} = f;
  ctx.strokeStyle = palette.certificate; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(...at(...center), radius * s, 0, Math.PI * 2); ctx.stroke();
  const z = [center[0] + radius * Math.cos(state.theta), center[1] + radius * Math.sin(state.theta)];
  eigen.forEach((lambda, i) => { const p = at(lambda, 0); dot(ctx, p, palette.point, 5); ctx.fillStyle = palette.point; ctx.textAlign = 'center'; ctx.fillText(`t${i + 1}${i + 1}`, p[0], p[1] - 13 - 14 * (i % 2));
    if (distances) { ctx.strokeStyle = palette.axes; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...at(...z)); ctx.stroke(); ctx.setLineDash([]); }
  });
  dot(ctx, at(...center), palette.muted, 3); dot(ctx, at(...z), palette.axes, 5); ctx.fillStyle = palette.axes; ctx.textAlign = 'left'; ctx.fillText('z(θ)', at(...z)[0] + 8, at(...z)[1] - 8);
}

export function drawMapProtocolReciprocal(canvas, c, index, state, palette) {
  const f = prepare(canvas); if (!f) return;
  const lambda = c.numeric.T[index][index], R = 1 / c.values.diagonalDistances[index], {at, s} = planar(f, [-1.12 * R, 1.12 * R, -1.12 * R, 1.12 * R], palette), {ctx} = f;
  ctx.strokeStyle = palette.certificate; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(...at(0, 0), R * s, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  const value = theta => { const re = c.contour.center[0] + c.contour.radius * Math.cos(theta) - lambda, im = c.contour.center[1] + c.contour.radius * Math.sin(theta), d = re * re + im * im; return [re / d, -im / d]; };
  ctx.strokeStyle = palette.image; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 180; k++) { const p = at(...value(k * Math.PI / 90)); if (k) ctx.lineTo(...p); else ctx.moveTo(...p); } ctx.stroke(); dot(ctx, at(...value(state.theta)), palette.point, 5);
}

function rectangles(canvas, c, state, palette) {
  const f = prepare(canvas); if (!f) return; const {ctx, W, H} = f, cellW = W / 3, cellH = H / 3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const x = (j + .5) * cellW, y = (i + .5) * cellH + 5, hx = c.values.entryRealHalfWidths[i][j], hy = c.values.entryImagHalfWidths[i][j];
    // Each mini-panel is normalised by its own half-widths; this is explicitly
    // labelled and is not a shape or aspect-ratio claim about the rectangles.
    const rw = cellW * .34, rh = cellH * .24;
    ctx.strokeStyle = palette.uncertainty; ctx.lineWidth = 1.6; ctx.strokeRect(x - rw, y - rh, 2 * rw, 2 * rh);
    ctx.strokeStyle = palette.axes; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - rw, y); ctx.lineTo(x + rw, y); ctx.moveTo(x, y - rh); ctx.lineTo(x, y + rh); ctx.stroke();
    dot(ctx, [x, y], palette.image, 3); dot(ctx, [x + rw * state.t * c.numeric.E[i][j] / hx, y], palette.point, 4);
    ctx.fillStyle = palette.ink; ctx.textAlign = 'center'; ctx.fillText(`entry ${i + 1},${j + 1}`, x, y - rh - 9);
    ctx.fillStyle = palette.muted; ctx.font = '10px "Segoe UI",sans-serif'; ctx.fillText(`±${hx.toExponential(1)} · ±${hy.toExponential(1)}i`, x, y + rh + 14); ctx.font = '13px "Segoe UI",sans-serif';
  }
}
function rotate(p, yaw, pitch) { const [x, y, z] = p, X = x * Math.cos(yaw) + z * Math.sin(yaw), Z = -x * Math.sin(yaw) + z * Math.cos(yaw); return [X, y * Math.cos(pitch) - Z * Math.sin(pitch), y * Math.sin(pitch) + Z * Math.cos(pitch)]; }
function sampleRange(fn) { let r = 0; for (let j = 0; j <= 12; j++) for (let k = 0; k < 24; k++) r = Math.max(r, Math.hypot(...fn(unit(j * Math.PI / 12, k * Math.PI / 12)))); return r; }

export function drawMapProtocolGeometry(canvas, c, step, state, palette) {
  if ([1, 2].includes(step)) { spectrum(canvas, c, state, palette, step === 2); return null; }
  if (step === 6) { rectangles(canvas, c, state, palette); return null; }
  const prepared = prepare(canvas); if (!prepared) return null; const {ctx, W, H} = prepared;
  let frame, surfaces = [], paths = [], points = [], range, axisLabels, caption;
  if (step === 7) {
    const r = c.values.matrixAllowance, h = [c.values.entryRealHalfWidths[0][0], c.values.entryImagHalfWidths[0][0], c.values.entryRealHalfWidths[1][1]];
    const normBoundary = n => n.map(x => x * r / Math.max(Math.hypot(n[0], n[1]), Math.abs(n[2])));
    surfaces = [{fn: normBoundary, color: palette.certificate, opacity: 0}];
    const vertices = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x * h[0], y * h[1], z * h[2]])));
    vertices.forEach((p, i) => [1, 2, 4].filter(bit => !(i & bit)).forEach(bit => paths.push({pts: [p, vertices[i | bit]], color: palette.uncertainty, width: 2})));
    points = [{p: [state.t * c.numeric.E[0][0], 0, state.t * c.numeric.E[1][1]], color: palette.point, radius: 5}];
    range = r * 1.22; axisLabels = ['Re E₁₁', 'Im E₁₁', 'Re E₂₂']; caption = 'Real 3D matrix section';
  } else {
    try { frame = mapProtocolFrame(c, step, state); } catch { ctx.fillStyle = palette.ink; ctx.textAlign = 'center'; ctx.fillText('Numerical section unavailable at this point.', W / 2, H / 2); return null; }
    const {radius, allowance, uniform} = frame;
    let image = n => mapProtocolRadialSection(frame.K, n), base = n => mapProtocolRadialSection(frame.K0, n);
    axisLabels = frame.indices.map(i => `Re y${i + 1}`); caption = frame.indices.length && frame.base.length === 4 ? 'Real output section: coordinates 1, 2, 4' : 'Real output section: coordinates 1, 2, 3';
    if (step === 5 || (step === 3 && state.inverse)) {
      const axes = step === 3 ? frame.singular.map(s => 1 / s) : [...frame.singular].reverse(); image = base = n => n.map((x, i) => x * axes[i]);
      axisLabels = step === 3 ? ['1 / σmin', '1 / σmid', '1 / σmax'] : ['σmax', 'σmid', 'σmin']; caption = 'Principal real 3D section · singular coordinates';
      points.push({p: image(unit(state.phi, state.psi)), color: palette.point, radius: 5});
    }
    surfaces.push({fn: image, color: palette.image, opacity: 0});
    if (allowance > 0) surfaces.push({fn: base, color: palette.structure, dash: [5, 4], opacity: 0});
    if (uniform && radius > 0) {
      const protectedRadius = step === 3 && state.inverse ? c.values.triangularInverse : radius;
      const inner = !(step === 3 && state.inverse);
      surfaces.push({fn: n => n.map(x => x * protectedRadius), color: palette.protected, ...(inner ? {fillColor: palette.protected, opacity: .13, occludes: false} : {opacity: 0})});
      paths.push({pts: [[0, 0, 0], [protectedRadius, 0, 0]], color: palette.protected, width: 2.4});
    }
    if ([4, 8, 9, 11, 13].includes(step)) {
      surfaces.push({fn: n => n.map((x, i) => frame.centre[i] + x * allowance), color: palette.uncertainty, opacity: 0});
      points.push({p: frame.centre, color: palette.image, radius: 5}, {p: frame.projection, color: palette.point, radius: 4});
    }
    range = Math.max(sampleRange(image), sampleRange(base), uniform && radius > 0 ? radius : 0, Math.hypot(...frame.centre) + allowance, step === 3 && state.inverse ? c.values.triangularInverse : 0) * 1.18;
  }
  const axisLength = range * .88;
  for (let i = 0; i < 3; i++) paths.push({pts: [-1, 1].map(sign => [0, 1, 2].map(j => i === j ? sign * axisLength : 0)), color: palette.axes, width: 2, axis: true});
  const centre = [W / 2, H / 2], zoom = state.zoom, scaleFactor = Math.min(W * .42, H * .39) / range * zoom;
  const project = p => { const r = rotate(p, state.yaw, state.pitch); return [centre[0] + r[0] * scaleFactor, centre[1] - r[1] * scaleFactor]; };
  const rendered = renderThreeGeometry(canvas, {width: W, height: H, centre, range, yaw: state.yaw, pitch: state.pitch, zoom, surfaces, paths, points, palette: {background: palette.paper}});
  if (!rendered) {
    for (const surface of surfaces) { ctx.strokeStyle = surface.color; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k = 0; k <= 96; k++) { const n = [0, 0, 0], a = k * Math.PI / 48; n[i] = Math.cos(a); n[(i + 1) % 3] = Math.sin(a); const p = project(surface.fn(n)); if (k) ctx.lineTo(...p); else ctx.moveTo(...p); } ctx.stroke(); } }
    points.forEach(p => dot(ctx, project(p.p), p.color, p.radius));
  }
  ctx.fillStyle = palette.ink; ctx.font = '12px "Segoe UI",sans-serif'; ctx.textAlign = 'center';
  axisLabels.forEach((label, i) => { const p = project([0, 1, 2].map(j => j === i ? axisLength : 0)); ctx.fillText(label, Math.max(45, Math.min(W - 45, p[0])), Math.max(18, Math.min(H - 30, p[1] - 10))); });
  ctx.fillStyle = palette.muted; ctx.fillText(caption, W / 2, H - 8);
  return frame;
}
