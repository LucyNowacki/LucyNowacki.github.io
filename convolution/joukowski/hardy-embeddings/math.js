/* Hardy embeddings: finite polynomial illustrations of
 * convergence_legendre_EDMD_dist.tex, legEDMD:sec-two-embeddings-rows-dist.
 * Hardy means use angular measure dtheta/(2*pi), not arclength. P_N keeps
 * Legendre degrees n<N; it is not the Hardy-orthogonal projector P_N^X.
 * Parseval and positive-vertex maxima are exact identities evaluated in
 * binary64. Synthesis maxima and ellipse perimeters are numerical samples.
 * None of these floating-point calculations is a certified enclosure.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HardyMath = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TAU = 2 * Math.PI;
  const PROFILE_SAMPLES = 256;
  const SUP_SAMPLES = 4096;
  const MAX_DEGREE = 47;
  const KINDS = ['synthesis', 'j2', 'jinf', 'transfer'];
  const PARTS = ['full', 'prefix', 'tail'];
  const DEFAULTS = Object.freeze({
    synthesis: Object.freeze({ R: 2, r: 1.5, N: 8, angle: 40, amplitude: 1, family: 'packet', part: 'tail' }),
    j2: Object.freeze({ R: 2.2, r: 1.4, N: 4, angle: 135, amplitude: 1, family: 'packet', part: 'tail' }),
    jinf: Object.freeze({ R: 2.2, r: 1.4, N: 4, angle: 135, amplitude: 1, family: 'packet', part: 'full' }),
    transfer: Object.freeze({ rho: 2, image: 0.22, hardy: 0.465, N: 8, angle: 315, amplitude: 1, family: 'packet', part: 'full' })
  });
  const LIMITS = Object.freeze({
    R: [1.35, 3], r: [1.05, 2.92], radiusGap: 0.08,
    amplitude: [0, 2], angle: [0, 360], rho: [1.6, 3],
    image: [0.06, 0.7], hardy: [0.1, 0.9],
    synthesisN: [0, 48], embeddingN: [0, 9], transferN: [0, 48]
  });
  const alpha = [1];
  for (let j = 1; j <= MAX_DEGREE; j++) alpha.push(alpha[j - 1] * (2 * j - 1) / (2 * j));
  const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const magnitude = z => Math.hypot(z[0], z[1]);
  const multiply = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const scaleCoefficients = (c, scale) => c.map(z => [z[0] * scale, z[1] * scale]);

  function sanitize(kind, input) {
    if (!KINDS.includes(kind)) throw new RangeError('Unknown Hardy lesson: ' + kind);
    const raw = input && typeof input === 'object' ? input : {};
    const defaults = DEFAULTS[kind];
    const state = Object.assign({}, defaults);
    state.amplitude = clamp(finite(raw.amplitude, defaults.amplitude), 0, 2);
    state.angle = clamp(finite(raw.angle, defaults.angle), 0, 360);
    state.family = raw.family === 'constant' ? 'constant' : 'packet';
    state.part = PARTS.includes(raw.part) ? raw.part : defaults.part;
    state.N = Math.round(clamp(finite(raw.N, defaults.N), 0, kind === 'j2' || kind === 'jinf' ? 9 : 48));
    if (kind === 'transfer') {
      state.rho = clamp(finite(raw.rho, defaults.rho), 1.6, 3);
      state.image = clamp(finite(raw.image, defaults.image), 0.06, 0.7);
      state.hardy = clamp(finite(raw.hardy, defaults.hardy), 0.1, 0.9);
      // This lesson is explicitly the affine P_2 example, independently of
      // packet/constant and truncation selectors used by the other lessons.
      state.family = 'packet';
      state.part = 'full';
      const a0 = (axes(state.rho)[0] + 1) / 2;
      state.s0 = a0 + Math.sqrt(a0 * a0 - 1);
      state.s = state.s0 + state.image * (state.rho - state.s0);
      state.r = state.s + state.hardy * (state.rho - state.s);
      state.R = state.rho;
    } else {
      state.R = clamp(finite(raw.R, defaults.R), 1.35, 3);
      state.r = clamp(finite(raw.r, defaults.r), 1.05, state.R - 0.08);
    }
    return state;
  }

  function axes(radius) {
    if (!Number.isFinite(radius) || radius < 1) throw new RangeError('Ellipse radius must be finite and at least one.');
    return [(radius + 1 / radius) / 2, (radius - 1 / radius) / 2];
  }
  function gamma(radius, angle) {
    const a = axes(radius);
    return [a[0] * Math.cos(angle), a[1] * Math.sin(angle)];
  }
  function complexCoefficients(coefficients) {
    if (!Array.isArray(coefficients) || coefficients.length > MAX_DEGREE + 1) throw new RangeError('Expected at most 48 Legendre coefficients.');
    return coefficients.map(z => {
      const pair = typeof z === 'number' ? [z, 0] : Array.isArray(z) ? [z[0], z[1]] : [z && z.re, z && z.im];
      if (!pair.every(Number.isFinite)) throw new TypeError('Coefficients must be finite real numbers or complex pairs.');
      return pair;
    });
  }

  // Combine coincident Laurent frequencies before taking squared moduli.
  function packet(coefficients, radius) {
    axes(radius);
    const c = complexCoefficients(coefficients);
    const degree = Math.max(0, c.length - 1);
    const b = Array.from({ length: 2 * degree + 1 }, () => [0, 0]);
    c.forEach((z, n) => {
      for (let j = 0; j <= n; j++) {
        const k = n - 2 * j;
        const factor = alpha[j] * alpha[n - j] * radius ** k;
        b[k + degree][0] += z[0] * factor;
        b[k + degree][1] += z[1] * factor;
      }
    });
    return { radius, degree, offset: degree, coefficients: b, positive: c.every(z => z[0] >= 0 && z[1] === 0) };
  }
  function packetValue(p, angle) {
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    let x = Math.cos(-p.degree * angle), y = Math.sin(-p.degree * angle);
    let re = 0, im = 0;
    for (const z of p.coefficients) {
      re += z[0] * x - z[1] * y;
      im += z[0] * y + z[1] * x;
      const nextX = x * cosine - y * sine;
      y = x * sine + y * cosine;
      x = nextX;
    }
    return [re, im];
  }
  const energy = p => p.coefficients.reduce((total, z) => total + z[0] * z[0] + z[1] * z[1], 0);
  function supremum(p, samples) {
    if (p.positive) return p.coefficients.reduce((total, z) => total + z[0], 0);
    let maximum = 0;
    const count = samples || SUP_SAMPLES;
    for (let j = 0; j < count; j++) maximum = Math.max(maximum, magnitude(packetValue(p, TAU * j / count)));
    return maximum;
  }
  function evaluate(coefficients, z) {
    if (!Array.isArray(z) || !z.every(Number.isFinite) || z.length !== 2) throw new TypeError('Expected a finite complex point [re, im].');
    const c = complexCoefficients(coefficients);
    let previous = [1, 0], current = z.slice(), result = [0, 0];
    c.forEach((coefficient, n) => {
      const term = multiply(coefficient, n === 0 ? previous : current);
      result[0] += term[0]; result[1] += term[1];
      if (n >= 1) {
        const product = multiply(z, current);
        const next = [((2 * n + 1) * product[0] - n * previous[0]) / (n + 1), ((2 * n + 1) * product[1] - n * previous[1]) / (n + 1)];
        previous = current; current = next;
      }
    });
    return result;
  }
  function sums(q, N) {
    if (!Number.isFinite(q) || q < 0 || q >= 1 || !Number.isInteger(N) || N < 0) throw new RangeError('Scalar sums require 0<=q<1 and an integer N>=0.');
    let S = 0, power = 1;
    for (let n = 0; n < N; n++) { S += (2 * n + 1) * power; power *= q; }
    const gap = 1 - q;
    return { S, T: q ** N * ((2 * N + 1) / gap + 2 * q / gap ** 2), total: (1 + q) / gap ** 2 };
  }
  const perimeterCache = new Map();
  function perimeter(radius) {
    if (perimeterCache.has(radius)) return perimeterCache.get(radius);
    const [a, b] = axes(radius);
    let result = 0;
    for (let j = 0; j < 2048; j++) {
      const t = TAU * (j + 0.5) / 2048;
      result += Math.hypot(a * Math.sin(t), b * Math.cos(t));
    }
    result *= TAU / 2048;
    if (perimeterCache.size > 64) perimeterCache.clear();
    perimeterCache.set(radius, result);
    return result;
  }
  function constants(radius) {
    if (!Number.isFinite(radius) || radius <= 1) throw new RangeError('Hardy constants require radius >1.');
    const length = perimeter(radius);
    const Cinf = length / (Math.PI * (radius - 1 / radius));
    return {
      C2: Math.sqrt((radius ** 2 + radius ** -2) / (radius ** 2 - radius ** -2)),
      Cinf, CinfApprox: Cinf, CinfSafe: (radius + 1 / radius) / (radius - 1 / radius),
      perimeter: length, perimeterApprox: length, perimeterSamples: 2048, Jinf: 1
    };
  }
  function split(coefficients, N) {
    return {
      full: coefficients.map(z => z.slice()),
      prefix: coefficients.map((z, n) => n < N ? z.slice() : [0, 0]),
      tail: coefficients.map((z, n) => n >= N ? z.slice() : [0, 0])
    };
  }
  function gauge(key, label, radius, angle, isEnergy, coefficients, unitCoefficients, colorKey, knownSupremum) {
    const p = packet(coefficients, radius);
    const referencePacket = packet(unitCoefficients, radius);
    // The coefficient triangle sum is a convenient fixed reference for complex
    // phases; it is not presented as their actual supremum.
    const referenceMaximum = referencePacket.coefficients.reduce((total, z) => total + magnitude(z), 0);
    const norm = knownSupremum === undefined ? (!isEnergy ? supremum(p) : 0) : knownSupremum;
    const measure = t => { const v = magnitude(packetValue(p, t)); return isEnergy ? v * v : v; };
    return {
      key, label, radius, angle, energy: isEnergy, colorKey,
      local: measure(angle), whole: isEnergy ? energy(p) : norm,
      reference: Math.max(1e-12, isEnergy ? referenceMaximum ** 2 : referenceMaximum),
      profile: Array.from({ length: PROFILE_SAMPLES }, (_, j) => ({ angle: TAU * j / PROFILE_SAMPLES, value: measure(TAU * j / PROFILE_SAMPLES) })),
      wholeMethod: isEnergy ? 'Laurent Parseval mean' : p.positive ? 'exact positive-vertex maximum' : '4096-angle sampled maximum',
      units: isEnergy ? 'squared modulus' : 'modulus'
    };
  }
  function coefficientInfo(c, state, majorants) {
    return {
      coefficients: c.map(z => z.slice()), complexCoefficients: c.map(z => z.slice()),
      terms: c.map((z, n) => ({ n, re: z[0], im: z[1], magnitude: magnitude(z), retained: n < state.N, majorant: majorants[n], targetMajorant: majorants[n] * state.r ** n })),
      retained: { count: Math.min(state.N, c.length), available: c.length, maxDegree: c.length - 1, indices: c.map((_, n) => n).filter(n => n < state.N) }
    };
  }
  function computeEmbedding(kind, state) {
    const angle = state.angle * Math.PI / 180;
    const raw = Array.from({ length: 9 }, (_, n) => [state.family === 'constant' ? (n === 0 ? 1 : 0) : 0.45 ** n, 0]);
    const rawSource = packet(raw, state.R);
    const normalizer = kind === 'j2' ? Math.sqrt(energy(rawSource)) : supremum(rawSource);
    const unit = scaleCoefficients(raw, 1 / normalizer);
    const c = scaleCoefficients(unit, state.amplitude);
    const selected = split(c, state.N);
    const parts = {};
    for (const part of PARTS) {
      const p = packet(selected[part], state.r);
      parts[part] = kind === 'j2' ? supremum(p) : Math.sqrt(energy(p));
    }
    const q = state.r / state.R, scalar = sums(q, state.N), C = constants(state.R);
    const normBounds = multiplier => ({
      full: kind === 'jinf' ? state.amplitude : state.amplitude * multiplier * scalar.total,
      prefix: state.amplitude * multiplier * scalar.S,
      tail: state.amplitude * multiplier * scalar.T
    });
    const multiplier = kind === 'j2' ? C.C2 : C.Cinf;
    const outer = packet(c, state.R);
    const sourceNorm = kind === 'j2' ? Math.sqrt(energy(outer)) : supremum(outer);
    return Object.assign({
      kind, state, radii: { R: state.R, r: state.r }, sourceNorm, normalizer,
      ellipses: [{ key: 'source', radius: state.R, colorKey: 'source' }, { key: 'target', radius: state.r, colorKey: 'target' }],
      gauges: [
        gauge('source', 'Full input f', state.R, angle, kind === 'j2', c, unit, 'source'),
        gauge('target', state.part === 'full' ? 'Restricted f' : state.part === 'prefix' ? 'Retained P_N f' : 'Tail (I-P_N)f', state.r, angle - Math.PI / 2, kind === 'jinf', selected[state.part], unit, 'target', kind === 'j2' ? parts[state.part] : undefined)
      ],
      parts, bounds: normBounds(multiplier), safeBounds: normBounds(kind === 'j2' ? C.C2 : C.CinfSafe),
      ratios: { q }, scalar, constants: C, branches: [],
      targetNorm: kind === 'j2' ? 'H-infinity' : 'H2',
      numerical: { certified: false, normMethod: 'Laurent Parseval / positive-vertex identities', perimeterApproximate: true, boundConstantApproximate: kind === 'jinf' }
    }, coefficientInfo(c, state, c.map(z => magnitude(z))));
  }
  function computeSynthesis(state) {
    const angle = state.angle * Math.PI / 180;
    const unit = Array.from({ length: 48 }, (_, n) => {
      const size = state.family === 'constant' ? (n === 0 ? 1 : 0) : (2 * n + 1) * state.R ** -n;
      return [size * Math.cos(n * angle), -size * Math.sin(n * angle)];
    });
    const c = scaleCoefficients(unit, state.amplitude);
    const selected = split(c, state.N);
    const parts = {};
    for (const part of PARTS) parts[part] = supremum(packet(selected[part], state.r));
    const q = state.r / state.R, scalar = sums(q, state.N);
    const majorants = c.map((_, n) => state.amplitude * (2 * n + 1) * state.R ** -n);
    const finiteMajorants = {};
    for (const part of PARTS) finiteMajorants[part] = majorants.reduce((total, v, n) => total + ((part === 'full' || (part === 'prefix' ? n < state.N : n >= state.N)) ? v * state.r ** n : 0), 0);
    return Object.assign({
      kind: 'synthesis', state, radii: { R: state.R, r: state.r },
      sourceNorm: Math.sqrt(energy(packet(c, state.R))), normalizer: 1,
      ellipses: [{ key: 'source', radius: state.R, colorKey: 'source' }, { key: 'target', radius: state.r, colorKey: 'target' }],
      gauges: [
        gauge('source', 'Full polynomial f', state.R, angle, true, c, unit, 'source'),
        Object.assign(gauge('target', state.part === 'full' ? 'Restricted f' : state.part === 'prefix' ? 'Retained P_N f' : 'Tail (I-P_N)f', state.r, angle - Math.PI / 2, false, selected[state.part], unit, 'target', parts[state.part]), { wholeMethod: 'sampled maximum' })
      ],
      parts, bounds: { full: state.amplitude * scalar.total, prefix: state.amplitude * scalar.S, tail: state.amplitude * scalar.T }, finiteMajorants,
      ratios: { q }, scalar, constants: { coefficientMajorant: state.amplitude }, branches: [], targetNorm: 'H-infinity',
      numerical: { certified: false, normMethod: '4096-angle sampled target maxima', supremumSamples: SUP_SAMPLES, phaseChangesFunction: true }
    }, coefficientInfo(c, state, majorants));
  }
  function computeTransfer(state) {
    const angle = state.angle * Math.PI / 180;
    const unitF = [[0, 0], [0, 0], [1, 0]], unitH = scaleCoefficients(unitF, 0.25);
    const f = scaleCoefficients(unitF, state.amplitude), h = scaleCoefficients(unitH, state.amplitude);
    const outerAngle = angle + Math.PI / 2;
    const omega = gamma(state.rho, outerAngle);
    const qgap = state.s / state.r, qout = state.r / state.rho, qstar = Math.max(qgap, qout);
    const powers = { gap: qgap ** state.N, out: qout ** state.N, star: qstar ** state.N };
    const C = constants(state.r);
    const qSums = sums(qgap, state.N);
    return Object.assign({
      kind: 'transfer', state,
      radii: { R: state.rho, r: state.r, s: state.s, rho: state.rho, s0: state.s0 },
      sourceNorm: Math.sqrt(energy(packet(f, state.r))), normalizer: 1,
      ellipses: [{ key: 'image', radius: state.s, colorKey: 'image' }, { key: 'hardy', radius: state.r, colorKey: 'input' }, { key: 'response', radius: state.rho, colorKey: 'response' }],
      gauges: [
        gauge('input', 'f in X', state.r, angle, true, f, unitF, 'input'),
        gauge('image', 'g = J2 f', state.s, angle - 100 * Math.PI / 180, false, f, unitF, 'image'),
        gauge('response', 'h = L-tilde g', state.rho, outerAngle, false, h, unitH, 'response'),
        gauge('output', 'J-infinity h in X', state.r, angle + Math.PI, true, h, unitH, 'output')
      ],
      branches: [-1, 1].map(sign => ({ source: omega.slice(), target: [(omega[0] + sign) / 2, omega[1] / 2], sign })),
      parts: { full: Math.sqrt(energy(packet(h, state.r))), prefix: null, tail: null },
      bounds: { full: null, prefix: null, tail: null },
      ratios: { q: qgap, qgap, qout, qstar, qgapPower: powers.gap, qoutPower: powers.out, qstarPower: powers.star, inputFactor: powers.gap, outputFactor: powers.out, balancedRadius: Math.sqrt(state.s * state.rho), powers },
      powers, scalar: qSums, constants: Object.assign(C, { J2Bound: C.C2 * qSums.total, coreBound: 1 }),
      targetNorm: 'H2', numerical: { certified: false, normMethod: 'Laurent Parseval / positive-vertex identities', geometricPowersOnly: true }
    }, coefficientInfo(f, state, f.map(z => magnitude(z))));
  }
  function compute(kind, input) {
    const state = sanitize(kind, input);
    if (kind === 'synthesis') return computeSynthesis(state);
    if (kind === 'transfer') return computeTransfer(state);
    return computeEmbedding(kind, state);
  }
  function defaults(kind) {
    if (!KINDS.includes(kind)) throw new RangeError('Unknown Hardy lesson: ' + kind);
    return Object.assign({}, DEFAULTS[kind]);
  }

  return Object.freeze({ compute, sanitize, defaults, defaultStates: DEFAULTS, limits: LIMITS, axes, gamma, evaluate, packet, boundaryPacket: packet, packetValue, energy, supremum, sums, constants, perimeter, split, PROFILE_SAMPLES, SUP_SAMPLES });
});
