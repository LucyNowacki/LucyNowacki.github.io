/* Finite Laurent packets for the ellipse-growth lesson.
 * Source: convergence_legendre_EDMD.tex,
 * legEDMD:subsec-ellipse-growth-legendre-modes and
 * legEDMD:def-hardy-spaces-ellipse (angular measure dtheta / (2*pi)).
 * Weights are exact dyadic numbers in this bounded degree range. Radial,
 * trigonometric and norm calculations are floating-point illustrations,
 * not certified enclosures. Radius one is the limiting real-line reference.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EllipseGrowthMath = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_DEGREE = 12;
  const MAX_RADIUS = 2.5;
  const TAU = 2 * Math.PI;

  function degree(n) {
    if (!Number.isInteger(n) || n < 0 || n > MAX_DEGREE) {
      throw new RangeError('Degree must be an integer from 0 to ' + MAX_DEGREE + '.');
    }
  }

  function radius(r) {
    if (!Number.isFinite(r) || r < 1 || r > MAX_RADIUS) {
      throw new RangeError('Radius must be finite and between 1 and ' + MAX_RADIUS + '.');
    }
  }

  function gcd(a, b) {
    while (b) { const remainder = a % b; a = b; b = remainder; }
    return a;
  }

  const central = [1];
  for (let j = 1; j <= MAX_DEGREE; j++) {
    central[j] = central[j - 1] * 2 * (2 * j - 1) / j;
  }

  function alpha(j) {
    degree(j);
    return central[j] / 4 ** j;
  }

  const rows = Array.from({ length: MAX_DEGREE + 1 }, (_, n) => {
    const denominator = 4 ** n;
    return Object.freeze(Array.from({ length: n + 1 }, (_, j) => {
      const numerator = central[j] * central[n - j];
      const divisor = gcd(numerator, denominator);
      return Object.freeze({
        j, m: n - 2 * j, w: numerator / denominator,
        numerator: numerator / divisor, denominator: denominator / divisor
      });
    }));
  });

  function weights(n) {
    degree(n);
    return rows[n];
  }

  function compensated(values) {
    let total = 0, correction = 0;
    for (const value of values) {
      const adjusted = value - correction;
      const next = total + adjusted;
      correction = (next - total) - adjusted;
      total = next;
    }
    return total;
  }

  // Independent three-term recurrence; no Laurent weights are used here.
  function legendreComplex(n, z) {
    degree(n);
    if (!z || !Number.isFinite(z.re) || !Number.isFinite(z.im)) {
      throw new RangeError('The polynomial argument needs finite real and imaginary parts.');
    }
    let previous = { re: 1, im: 0 };
    if (n === 0) return previous;
    let current = { re: z.re, im: z.im };
    for (let k = 1; k < n; k++) {
      const next = {
        re: ((2 * k + 1) * (z.re * current.re - z.im * current.im) - k * previous.re) / (k + 1),
        im: ((2 * k + 1) * (z.re * current.im + z.im * current.re) - k * previous.im) / (k + 1)
      };
      previous = current;
      current = next;
    }
    return current;
  }

  function packet(n, r, theta, orthonormal = false) {
    degree(n);
    radius(r);
    if (!Number.isFinite(theta)) throw new RangeError('Angle must be finite radians.');
    if (typeof orthonormal !== 'boolean') throw new TypeError('Orthonormal must be a boolean.');

    const s = Math.log(r);
    const normalization = orthonormal ? Math.sqrt((2 * n + 1) / 2) : 1;
    const normalizationSquared = normalization * normalization;
    const reducedTheta = theta % TAU;
    const terms = rows[n].map(term => {
      const radial = r ** term.m;
      const length = normalization * term.w * radial;
      const phase = term.m * reducedTheta;
      const direction = { re: Math.cos(phase), im: Math.sin(phase) };
      return {
        ...term, radial, length, phase, direction,
        re: length * direction.re, im: length * direction.im,
        symmetricLength: normalization * term.w * Math.cosh(term.m * s),
        coarseLength: normalization * term.w * Math.cosh(n * s),
        energy: length * length,
        weightEnergyBound: normalizationSquared * term.w * radial * radial
      };
    });
    // Prefixes are the head-to-tail vector-chain vertices.
    terms.forEach((term, j) => {
      term.partial = {
        re: compensated(terms.slice(0, j + 1).map(value => value.re)),
        im: compensated(terms.slice(0, j + 1).map(value => value.im))
      };
    });
    const sum = { ...terms[terms.length - 1].partial };
    const S = compensated(terms.map(term => term.length));
    const h2Squared = compensated(terms.map(term => term.energy));
    const semiaxes = { a: (r + 1 / r) / 2, b: (r - 1 / r) / 2 };
    const gamma = {
      re: semiaxes.a * Math.cos(reducedTheta),
      im: semiaxes.b * Math.sin(reducedTheta)
    };

    return {
      n, r, theta, reducedTheta, s, orthonormal, normalization, normalizationSquared,
      terms, sum, magnitude: Math.hypot(sum.re, sum.im),
      S, symmetricS: compensated(terms.map(term => term.symmetricLength)),
      B: normalization * Math.cosh(n * s),
      h2Squared, h2: Math.sqrt(h2Squared),
      // Parseval uses w_j^2. Dropping one factor w_j gives the next bound.
      h2WeightBoundSquared: compensated(terms.map(term => term.weightEnergyBound)),
      h2LooseSquared: normalizationSquared * Math.cosh(2 * n * s),
      h2Bound: normalization * Math.sqrt(Math.cosh(2 * n * s)),
      semiaxes, gamma, weightSum: compensated(terms.map(term => term.w)),
      recurrence: legendreComplex(n, gamma)
    };
  }

  return Object.freeze({ MAX_DEGREE, MAX_RADIUS, alpha, weights, packet, legendreComplex });
});
