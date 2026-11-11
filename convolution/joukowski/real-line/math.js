/* Pure helpers for the radius-one real-line reference case.
 * Source: convergence_legendre_EDMD.tex, legEDMD:subsec-real-line-sup.
 * Dyadic weights are exact in this bounded degree range. Trigonometric values,
 * sigma, and quadrature results use ordinary floating-point arithmetic.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../joukowski-math.js'));
  } else {
    root.RealLineMath = factory(root.JoukowskiMath);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';
  if (!M || typeof M.legendre !== 'function') {
    throw new Error('Load joukowski-math.js before real-line/math.js.');
  }

  const MAX_DEGREE = 12;
  const MAX_FREQUENCY = 16;

  function degree(n) {
    if (!Number.isInteger(n) || n < 0 || n > MAX_DEGREE) {
      throw new RangeError('Degree must be an integer from 0 to ' + MAX_DEGREE + '.');
    }
  }

  function frequency(k) {
    if (!Number.isInteger(k) || k < 1 || k > MAX_FREQUENCY) {
      throw new RangeError('Frequency must be an integer from 1 to ' + MAX_FREQUENCY + '.');
    }
  }

  function gcd(a, b) {
    while (b) { const remainder = a % b; a = b; b = remainder; }
    return a;
  }

  // C(2j,j) is an exact safe integer for every j in the lesson's range.
  const central = [1];
  for (let j = 1; j <= MAX_DEGREE; j++) {
    central.push(central[j - 1] * 2 * (2 * j - 1) / j);
  }

  const rows = Array.from({ length: MAX_DEGREE + 1 }, (_, n) => {
    const commonDenominator = 4 ** n;
    return Object.freeze(Array.from({ length: n + 1 }, (_, j) => {
      const commonNumerator = central[j] * central[n - j];
      const divisor = gcd(commonNumerator, commonDenominator);
      return Object.freeze({
        j, m: n - 2 * j, weight: commonNumerator / commonDenominator,
        numerator: commonNumerator / divisor, denominator: commonDenominator / divisor
      });
    }));
  });

  function weights(n) {
    degree(n);
    return rows[n];
  }

  function evaluate(n, t) {
    degree(n);
    if (!Number.isFinite(t)) throw new RangeError('Angle must be finite radians.');
    const x = Math.cos(t), y = Math.sin(t);
    // Form integer powers from e^(it), avoiding overflow in m*t for large,
    // finite input angles. Negative powers are conjugates on the unit circle.
    const powers = [{ re: 1, im: 0 }];
    for (let m = 1; m <= n; m++) {
      const previous = powers[m - 1];
      powers.push({ re: previous.re * x - previous.im * y, im: previous.re * y + previous.im * x });
    }
    let re = 0, im = 0, reCorrection = 0, imCorrection = 0;
    const terms = rows[n].map(term => {
      const power = powers[Math.abs(term.m)];
      const phase = { re: power.re, im: term.m < 0 ? -power.im : power.im };
      const value = { re: term.weight * phase.re, im: term.weight * phase.im };
      const reStep = value.re - reCorrection, nextRe = re + reStep;
      reCorrection = (nextRe - re) - reStep;
      re = nextRe;
      const imStep = value.im - imCorrection, nextIm = im + imStep;
      imCorrection = (nextIm - im) - imStep;
      im = nextIm;
      return { ...term, phase, value, partial: { re, im } };
    });
    return {
      x, value: { re, im }, recurrence: M.legendre(n, { re: x, im: 0 }),
      weightSum: rows[n].reduce((total, term) => total + term.weight, 0), terms
    };
  }

  // Integral_0^pi sin(a*t) dt for integer a; negative odd a retain their sign.
  function sineIntegral(a) {
    return a === 0 || a % 2 === 0 ? 0 : 2 / a;
  }

  function sigma(n, k) {
    degree(n);
    frequency(k);
    let total = 0, correction = 0;
    for (const term of rows[n]) {
      const contribution = term.weight * (sineIntegral(k + term.m) + sineIntegral(k - term.m)) / 2;
      const step = contribution - correction, next = total + step;
      correction = (next - total) - step;
      total = next;
    }
    return total;
  }

  function angular(n, k) {
    degree(n);
    frequency(k);
    // Composite Simpson quadrature, split at the sine-lobe boundaries.
    // At least 8192 panels cover [0,pi]. The absolute value also has Legendre
    // zeros, so this is an approximation with no certified error enclosure.
    const panelsPerLobe = 2 * Math.ceil(4096 / k);
    const step = Math.PI / (k * panelsPerLobe);
    let integral = 0;
    const integrand = t => Math.abs(M.legendre(n, { re: Math.cos(t), im: 0 }).re * Math.sin(k * t));
    for (let lobe = 0; lobe < k; lobe++) {
      const left = lobe * Math.PI / k;
      let total = integrand(left) + integrand((lobe + 1) * Math.PI / k);
      for (let i = 1; i < panelsPerLobe; i++) {
        total += (i % 2 === 0 ? 2 : 4) * integrand(left + i * step);
      }
      integral += total * step / 3;
    }
    return { sigma: sigma(n, k), absoluteEstimate: integral, envelopeArea: 2, lobeArea: 2 / k, lobes: k };
  }

  return Object.freeze({ MAX_DEGREE, MAX_FREQUENCY, weights, evaluate, sigma, angular });
});
