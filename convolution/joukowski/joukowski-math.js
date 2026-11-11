/* Pure mathematics for coefficient matching under the Joukowski pull-back.
 * All complex numbers are {re, im}; alpha(n) = binom(2n,n)/4^n.
 * The packet sum is finite. Only generating() uses an infinite-series identity.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JoukowskiMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX_DEGREE = 100;
  const ONE = Object.freeze({ re: 1, im: 0 });
  const add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
  const sub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
  const mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  const scale = (a, s) => ({ re: a.re * s, im: a.im * s });
  const polar = (radius, angle) => ({ re: radius * Math.cos(angle), im: radius * Math.sin(angle) });
  const abs = a => Math.hypot(a.re, a.im);

  function finite(value, name) {
    if (!Number.isFinite(value)) throw new RangeError(name + ' must be finite.');
    return value;
  }
  function degree(n) {
    if (!Number.isInteger(n) || n < 0 || n > MAX_DEGREE) {
      throw new RangeError('Degree must be an integer from 0 to ' + MAX_DEGREE + '.');
    }
  }
  function complex(a, name) {
    if (!a || !Number.isFinite(a.re) || !Number.isFinite(a.im)) {
      throw new RangeError((name || 'Complex value') + ' must have finite re and im.');
    }
    return a;
  }
  function parameters(n, r, t, A) {
    degree(n);
    finite(r, 'Radius');
    if (r < 1) throw new RangeError('Radius must be at least 1.');
    finite(t, 'Angle');
    complex(A, 'Mode amplitude');
  }
  function checked(a) {
    return complex(a, 'Result (reduce the degree, radius, or amplitude)');
  }

  const alphas = [1];
  function alpha(n) {
    degree(n);
    for (let m = alphas.length; m <= n; m++) {
      alphas.push(alphas[m - 1] * (2 * m - 1) / (2 * m));
    }
    return alphas[n];
  }

  function terms(n, r, t, A = ONE) {
    parameters(n, r, t, A);
    return Array.from({ length: n + 1 }, (_, j) => {
      const p = n - j, q = j, k = p - q;
      const weight = alpha(j) * alpha(n - j);
      const radial = finite(r ** k, 'Radial multiplier');
      const coefficient = checked(scale(A, weight * radial));
      const value = checked(mul(coefficient, polar(1, k * t)));
      return { j, p, q, k, weight, radial, coefficient, value };
    });
  }

  function joukowski(r, t) {
    parameters(0, r, t, ONE);
    return checked({ re: ((r + 1 / r) / 2) * Math.cos(t), im: ((r - 1 / r) / 2) * Math.sin(t) });
  }

  // Independent three-term recurrence; does not use the Laurent expansion.
  function legendre(n, w) {
    degree(n);
    complex(w, 'Evaluation point');
    let previous = { re: 1, im: 0 };
    if (n === 0) return previous;
    let current = { re: w.re, im: w.im };
    for (let m = 1; m < n; m++) {
      const next = checked(scale(sub(scale(mul(w, current), 2 * m + 1), scale(previous, m)), 1 / (m + 1)));
      previous = current;
      current = next;
    }
    return current;
  }

  // Compensated summation limits rounding when the rotating terms cancel.
  function sum(values) {
    let re = 0, im = 0, reCorrection = 0, imCorrection = 0;
    for (const value of values) {
      const reStep = value.re - reCorrection, nextRe = re + reStep;
      reCorrection = (nextRe - re) - reStep;
      re = nextRe;
      const imStep = value.im - imCorrection, nextIm = im + imStep;
      imCorrection = (nextIm - im) - imStep;
      im = nextIm;
    }
    return checked({ re, im });
  }

  function packet(n, r, t, A = ONE) {
    return sum(terms(n, r, t, A).map(term => term.value));
  }

  function pair(n, j, r, t, A = ONE) {
    parameters(n, r, t, A);
    if (!Number.isInteger(j) || j < 0 || j > n) throw new RangeError('Pair index must be an integer from 0 to n.');
    const first = Math.min(j, n - j), second = n - first, k = n - 2 * first;
    const weight = alpha(first) * alpha(second), constant = k === 0;
    const positive = checked(mul(scale(A, weight * r ** k), polar(1, k * t)));
    const negative = constant ? { re: 0, im: 0 } : checked(mul(scale(A, weight * r ** -k), polar(1, -k * t)));
    // A complex amplitude rotates by arg(A) and multiplies both axes by |A|.
    // At k=0 there is a single fixed point, not a doubled reciprocal pair.
    const baseAxisA = constant ? weight : weight * (r ** k + r ** -k);
    const baseAxisB = constant ? 0 : weight * (r ** k - r ** -k);
    const axisA = finite(abs(A) * baseAxisA, 'Ellipse axis');
    const axisB = finite(abs(A) * baseAxisB, 'Ellipse axis');
    return {
      j: first, partnerJ: second, k, weight, positive, negative,
      sum: checked(add(positive, negative)), axisA, axisB, baseAxisA, baseAxisB,
      rotation: Math.atan2(A.im, A.re), constant
    };
  }

  function inverseSquareRoot(value) {
    // In generating(), both factors have positive real part because ur < 1.
    // Thus this is the analytic branch that equals 1 when u=0.
    return polar(1 / Math.sqrt(abs(value)), -Math.atan2(value.im, value.re) / 2);
  }

  function generating(r, t, u, N) {
    parameters(N, r, t, ONE);
    finite(u, 'Generating variable');
    if (u < 0 || u * r >= 1) throw new RangeError('Use 0 ≤ u < 1/r for the convergent generating series.');
    const z = polar(r, t), inverseZ = polar(1 / r, -t);
    const factorAExact = inverseSquareRoot(sub(ONE, scale(z, u)));
    const factorBExact = inverseSquareRoot(sub(ONE, scale(inverseZ, u)));
    const exact = checked(mul(factorAExact, factorBExact));
    const w = joukowski(r, t), summands = [], factorATerms = [], factorBTerms = [];
    let uPower = 1, aPower = { re: 1, im: 0 }, bPower = { re: 1, im: 0 };
    for (let m = 0; m <= N; m++) {
      summands.push(scale(legendre(m, w), uPower));
      factorATerms.push(scale(aPower, alpha(m)));
      factorBTerms.push(scale(bPower, alpha(m)));
      uPower *= u;
      aPower = mul(aPower, scale(z, u));
      bPower = mul(bPower, scale(inverseZ, u));
    }
    const partial = sum(summands), factorAPartial = sum(factorATerms), factorBPartial = sum(factorBTerms);
    const error = abs(sub(partial, exact)), ratio = r * u;
    return {
      partial, exact, error, relativeError: error / abs(exact),
      // sum_j alpha(j)alpha(m-j)=1 and r^(m-2j)≤r^m imply this bound.
      // It bounds the mathematical tail, not floating-point roundoff.
      tailBound: ratio ** (N + 1) / (1 - ratio),
      factorA: { partial: factorAPartial, exact: factorAExact },
      factorB: { partial: factorBPartial, exact: factorBExact },
      // This product includes degrees above N. It is not the degree-N partial.
      factorProduct: checked(mul(factorAPartial, factorBPartial)), summands
    };
  }

  return Object.freeze({ MAX_DEGREE, add, sub, mul, scale, polar, abs, alpha, terms, joukowski, legendre, packet, pair, generating });
});
