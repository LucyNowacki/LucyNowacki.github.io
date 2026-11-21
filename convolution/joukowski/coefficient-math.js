/* Source: convergence_legendre_EDMD.tex, lemmas legEDMD:lem-1-7 through 1-10.
 * Every computed value uses ordinary binary64 arithmetic, not interval arithmetic.
 * Truncated series, quadratures and their error estimates are labelled separately.
 * P_n is the classical Legendre polynomial, P_n(1)=1, not L2-normalized.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CoefficientMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var TAU = 2 * Math.PI;
  var DEFAULT_TERMS = 160;
  var quadratureCache = new Map();
  var constantsCache = new Map();
  var normsCache = new Map();
  var coefficientCache = new Map();
  var alphaCache = [1];
  function C(re, im) { return { re: re, im: im || 0 }; }
  function add(a, b) { return C(a.re + b.re, a.im + b.im); }
  function sub(a, b) { return C(a.re - b.re, a.im - b.im); }
  function mul(a, b) { return C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function scale(a, b) { return C(a.re * b, a.im * b); }
  function abs2(a) { return a.re * a.re + a.im * a.im; }
  function abs(a) { return Math.hypot(a.re, a.im); }
  function conj(a) { return C(a.re, -a.im); }
  function div(a, b) {
    var d = abs2(b);
    if (d === 0) throw new RangeError('Division by zero');
    return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
  }
  function polar(radius, theta) { return C(radius * Math.cos(theta), radius * Math.sin(theta)); }
  function cexp(a) { return polar(Math.exp(a.re), a.im); }
  function integer(n, name) {
    if (!Number.isInteger(n) || n < 0) throw new RangeError(name + ' must be a nonnegative integer');
  }
  function radius(r) {
    if (!(r > 1) || !Number.isFinite(r)) throw new RangeError('Ellipse radius must be finite and greater than 1');
  }
  function alpha(j) {
    integer(j, 'j');
    for (var k = alphaCache.length; k <= j; ++k) alphaCache.push(alphaCache[k - 1] * (2 * k - 1) / (2 * k));
    return alphaCache[j];
  }
  function legendre(n, x) {
    integer(n, 'n');
    if (n === 0) return 1;
    var p0 = 1, p1 = x;
    for (var j = 1; j < n; ++j) {
      var p2 = ((2 * j + 1) * x * p1 - j * p0) / (j + 1);
      p0 = p1; p1 = p2;
    }
    return p1;
  }
  // Full symmetric cosine packet: P_n(cos t)=sum_j alpha_j alpha_(n-j) cos((n-2j)t).
  function sigma(n, k) {
    integer(n, 'n'); integer(k, 'k');
    if (k <= n || (k - n) % 2 === 0) return 0;
    var result = 0;
    for (var j = 0; j <= n; ++j) {
      var m = n - 2 * j;
      result += alpha(j) * alpha(n - j) * (1 / (k + m) + 1 / (k - m));
    }
    return result;
  }
  function gamma(r, theta) {
    radius(r);
    return C((r + 1 / r) * Math.cos(theta) / 2, (r - 1 / r) * Math.sin(theta) / 2);
  }
  function tangent(r, theta) {
    radius(r);
    return C(-(r + 1 / r) * Math.sin(theta) / 2, (r - 1 / r) * Math.cos(theta) / 2);
  }
  function joukowski(z) { return scale(add(z, div(C(1), z)), 0.5); }
  function joukowskiPrime(z) { return scale(sub(C(1), div(C(1), mul(z, z))), 0.5); }
  function qTerms(n, r, L) {
    L = L === undefined ? DEFAULT_TERMS : L;
    integer(n, 'n'); integer(L, 'L'); radius(r);
    var terms = [];
    for (var ell = 0; ell < L; ++ell) {
      var k = n + 1 + 2 * ell;
      var s = sigma(n, k);
      terms.push({ k: k, sigma: s, amplitude: s * Math.pow(r, -k) });
    }
    return terms;
  }
  function evaluateTerms(terms, theta) {
    var re = 0, im = 0;
    for (var j = 0; j < terms.length; ++j) {
      var term = terms[j];
      re += term.amplitude * Math.cos(term.k * theta);
      im -= term.amplitude * Math.sin(term.k * theta);
    }
    return C(re, im);
  }
  function Qseries(n, r, theta, L) { return evaluateTerms(qTerms(n, r, L), theta); }
  function kernelRemainder(n, r, L) {
    L = L === undefined ? DEFAULT_TERMS : L;
    integer(n, 'n'); integer(L, 'L'); radius(r);
    return 2 * Math.pow(r, -(n + 1 + 2 * L)) / (1 - Math.pow(r, -2));
  }
  function gaussLegendre(order) {
    order = order === undefined ? 128 : order;
    integer(order, 'order');
    if (order < 1) throw new RangeError('Quadrature order must be positive');
    if (quadratureCache.has(order)) return quadratureCache.get(order);
    var nodes = new Array(order), weights = new Array(order);
    for (var i = 0; i < Math.ceil(order / 2); ++i) {
      var x = Math.cos(Math.PI * (i + 0.75) / (order + 0.5));
      var derivative;
      for (var iteration = 0; iteration < 50; ++iteration) {
        var pn = legendre(order, x), previous = legendre(order - 1, x);
        derivative = order * (x * pn - previous) / (x * x - 1);
        var step = pn / derivative;
        x -= step;
        if (Math.abs(step) < 2e-15) break;
      }
      derivative = order * (x * legendre(order, x) - legendre(order - 1, x)) / (x * x - 1);
      var w = 2 / ((1 - x * x) * derivative * derivative);
      nodes[i] = -x; nodes[order - i - 1] = x;
      weights[i] = w; weights[order - i - 1] = w;
    }
    var result = Object.freeze({ nodes: Object.freeze(nodes), weights: Object.freeze(weights) });
    quadratureCache.set(order, result);
    return result;
  }
  // Independent integral definition: avoids a logarithm branch and the Laurent construction.
  function Qintegral(n, omega, order) {
    integer(n, 'n');
    var quadrature = gaussLegendre(order === undefined ? 256 : order);
    var result = C(0);
    for (var j = 0; j < quadrature.nodes.length; ++j) {
      var x = quadrature.nodes[j];
      result = add(result, scale(div(C(1), sub(omega, C(x))), 0.5 * quadrature.weights[j] * legendre(n, x)));
    }
    return result;
  }
  function example(id, z) {
    if (typeof z === 'number') z = C(z);
    if (id === 'square') return mul(z, z);
    if (id === 'exp') return cexp(z);
    throw new RangeError('Example must be square or exp');
  }
  function coefficient(id, n, order) {
    integer(n, 'n');
    order = order === undefined ? 128 : order;
    var key = id + ':' + n + ':' + order;
    if (coefficientCache.has(key)) return coefficientCache.get(key);
    var quadrature = gaussLegendre(order);
    var sum = 0;
    for (var j = 0; j < quadrature.nodes.length; ++j) {
      var x = quadrature.nodes[j];
      sum += quadrature.weights[j] * example(id, x).re * legendre(n, x);
    }
    var result = (n + 0.5) * sum;
    coefficientCache.set(key, result);
    return result;
  }
  function exactSquareCoefficient(n) {
    integer(n, 'n');
    return n === 0 ? 1 / 3 : n === 2 ? 2 / 3 : 0;
  }
  function periodicMean(fn, points) {
    points = points === undefined ? 2048 : points;
    integer(points, 'points');
    if (points < 1) throw new RangeError('Sample count must be positive');
    var result = 0;
    for (var j = 0; j < points; ++j) result += fn(TAU * j / points);
    return result / points;
  }
  function norms(id, r) {
    radius(r);
    var key = id + ':' + r;
    if (normsCache.has(key)) return normsCache.get(key);
    var a = (r + 1 / r) / 2, result;
    if (id === 'square') {
      result = { hinf: a * a, h2: Math.sqrt(Math.pow(r, 4) + 4 + Math.pow(r, -4)) / 4,
        h2Approximate: false, h2Method: 'closed formula', hinfMethod: 'closed formula', samples: 0 };
    } else if (id === 'exp') {
      result = { hinf: Math.exp(a), h2: Math.sqrt(periodicMean(function (theta) { return Math.exp(2 * a * Math.cos(theta)); }, 2048)),
        h2Approximate: true, h2Method: '2048-point angular trapezoid', hinfMethod: 'closed formula', samples: 2048 };
    } else throw new RangeError('Example must be square or exp');
    result = Object.freeze(result);
    normsCache.set(key, result);
    return result;
  }
  function constants(r) {
    radius(r);
    if (constantsCache.has(r)) return constantsCache.get(r);
    var perimeter = TAU * periodicMean(function (theta) { return abs(tangent(r, theta)); }, 2048);
    var result = Object.freeze({ C2: Math.sqrt((r * r + 1 / (r * r)) / (r * r - 1 / (r * r))),
      CinfApprox: perimeter / (Math.PI * (r - 1 / r)),
      CinfSafe: (r + 1 / r) / (r - 1 / r), perimeterApprox: perimeter, perimeterSamples: 2048 });
    constantsCache.set(r, result);
    return result;
  }
  function qEnergy(n, r, L) {
    L = L === undefined ? DEFAULT_TERMS : L;
    var terms = qTerms(n, r, L), squares = 0, neighbours = 0;
    for (var j = 0; j < terms.length; ++j) {
      squares += terms[j].amplitude * terms[j].amplitude;
      if (j) neighbours += terms[j - 1].amplitude * terms[j].amplitude;
    }
    var diagonal = (r * r + 1 / (r * r)) * squares / 4;
    var neighbour = neighbours / 2;
    var approx = diagonal - neighbour;
    var tailSupBound = kernelRemainder(n, r, L);
    var weightedTail = (r + 1 / r) * tailSupBound / 2;
    // Exact-arithmetic estimate for the truncation error; floating-point evaluation is not outward rounded.
    var remainderBound = 2 * Math.sqrt(Math.max(0, approx)) * weightedTail + weightedTail * weightedTail;
    return { diagonal: diagonal, neighbour: neighbour, approx: approx,
      upper: Math.pow(constants(r).C2, 2) * Math.pow(r, -2 * n), remainderBound: remainderBound,
      tailSupBound: tailSupBound, terms: L, numerical: true };
  }
  // Mean over theta is a_n. The complex differential, including its orientation, is retained.
  function contourDensity(id, n, r, theta, L) {
    var product = mul(mul(example(id, gamma(r, theta)), Qseries(n, r, theta, L)), tangent(r, theta));
    return scale(C(product.im, -product.re), 2 * n + 1);
  }
  function contourCoefficient(id, n, r, points, L) {
    points = points === undefined ? 1024 : points;
    integer(points, 'points');
    if (!points) throw new RangeError('Sample count must be positive');
    var terms = qTerms(n, r, L), sum = C(0);
    for (var j = 0; j < points; ++j) {
      var theta = TAU * j / points;
      var product = mul(mul(example(id, gamma(r, theta)), evaluateTerms(terms, theta)), tangent(r, theta));
      sum = add(sum, scale(C(product.im, -product.re), 2 * n + 1));
    }
    return scale(sum, 1 / points);
  }
  function coefficientBounds(id, n, r, L) {
    var dataNorms = norms(id, r), c = constants(r), energy = qEnergy(n, r, L);
    var prefactor = (2 * n + 1) * Math.pow(r, -n);
    return { actualApprox: coefficient(id, n), actualExact: id === 'square' ? exactSquareCoefficient(n) : null,
      h2Envelope: prefactor * c.C2 * dataNorms.h2,
      hinfEnvelopeApprox: prefactor * c.CinfApprox * dataNorms.hinf,
      hinfEnvelopeSafe: prefactor * c.CinfSafe * dataNorms.hinf,
      cauchySchwarzApprox: (2 * n + 1) * dataNorms.h2 * Math.sqrt(Math.max(0, energy.approx)),
      norms: dataNorms, constants: c, qEnergy: energy };
  }
  function tailSeries(N, q) {
    integer(N, 'N');
    if (!(q >= 0 && q < 1)) throw new RangeError('Tail ratio must lie in [0,1)');
    return Math.pow(q, N) * ((2 * N + 1) / (1 - q) + 2 * q / ((1 - q) * (1 - q)));
  }
  function tailBound(N, rInner, R, norm, kind) {
    radius(rInner); radius(R);
    if (!(rInner < R)) throw new RangeError('Projection tail requires 1 < rInner < R');
    norm = norm === undefined ? 1 : norm;
    kind = kind === undefined ? 'h2' : kind;
    if (!(norm >= 0) || !Number.isFinite(norm)) throw new RangeError('Norm must be finite and nonnegative');
    if (kind !== 'h2' && kind !== 'hinf' && kind !== 'hinfSafe') throw new RangeError('Unknown norm kind');
    var c = constants(R);
    return (kind === 'h2' ? c.C2 : kind === 'hinf' ? c.CinfApprox : c.CinfSafe) * norm * tailSeries(N, rInner / R);
  }
  return Object.freeze({ TAU: TAU, DEFAULT_TERMS: DEFAULT_TERMS,
    C: C, add: add, sub: sub, mul: mul, div: div, scale: scale, abs: abs, abs2: abs2, conj: conj, cexp: cexp, polar: polar,
    alpha: alpha, legendre: legendre, sigma: sigma, gamma: gamma, tangent: tangent, joukowski: joukowski,
    joukowskiPrime: joukowskiPrime, qTerms: qTerms, evaluateTerms: evaluateTerms, Qseries: Qseries,
    kernelRemainder: kernelRemainder, gaussLegendre: gaussLegendre, Qintegral: Qintegral,
    example: example, coefficient: coefficient, exactSquareCoefficient: exactSquareCoefficient,
    periodicMean: periodicMean, norms: norms, constants: constants, qEnergy: qEnergy,
    contourDensity: contourDensity, contourCoefficient: contourCoefficient, coefficientBounds: coefficientBounds,
    tailSeries: tailSeries, tailBound: tailBound,
    evidence: 'Analytic identities and estimates from the cited thesis. Displayed values use binary64 arithmetic; quadrature and truncated-series results are not interval certificates.' });
});
