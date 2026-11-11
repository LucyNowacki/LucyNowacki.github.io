/* SVG illustrations of legEDMD:subsec-real-line-sup.
 * Geometry and sampled curves explain the identities and inequalities. They
 * are not a numerical certification of an interval or angular-integral bound.
 * All four renderers read S; no renderer changes controls or mathematical state.
 */
(() => {
  'use strict';
  const C = { positive: 'var(--positive)', negative: 'var(--negative)', degree: 'var(--degree)',
    gold: 'var(--gold)', pair: 'var(--pair)', muted: 'var(--muted)', line: 'var(--line)' };
  let serial = 0;
  const identities = new WeakMap();
  const fmt = (x, digits = 5) => Math.abs(x) < 1e-12 ? '0' : Number(x.toPrecision(digits)).toString();
  const line = (x, y, xx, yy, attrs = '') => `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" ${attrs}/>`;
  const dot = (x, y, r, fill, attrs = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attrs}/>`;
  const text = (x, y, value, attrs = '') => `<text x="${x}" y="${y}" fill="${C.muted}" font-family="system-ui,sans-serif" font-size="12" ${attrs}>${value}</text>`;
  const colour = m => m > 0 ? C.positive : m < 0 ? C.negative : C.degree;
  const path = (points, X, Y) => points.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(3)},${Y(p.y).toFixed(3)}`).join(' ');

  function frame(svg, type, S, title, description, heightRatio = .8) {
    const measured = svg.getBoundingClientRect().width || svg.parentElement?.getBoundingClientRect().width || 500;
    const width = Math.max(180, Math.round(measured));
    const height = Math.max(255, Math.min(410, Math.round(width * heightRatio)));
    let id = identities.get(svg);
    if (!id) { id = `real-line-plot-${++serial}`; identities.set(svg, id); }
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', `${id}-title ${id}-description`);
    Object.assign(svg.dataset, { renderer: type, degree: String(S.n), termIndex: String(S.j), angle: String(S.t) });
    return {
      width, height,
      draw(body) { svg.innerHTML = `<title id="${id}-title">${title}</title><desc id="${id}-description">${description}</desc>${body}`; }
    };
  }

  function unitPlane(F) {
    const cx = F.width / 2, cy = F.height / 2 + 1;
    const scale = Math.min(F.width - 76, F.height - 74) / 2;
    const X = x => cx + scale * x, Y = y => cy - scale * y;
    let axes = line(X(-1.15), cy, X(1.15), cy, `stroke="${C.muted}" stroke-opacity=".7"`);
    axes += line(cx, Y(-1.12), cx, Y(1.12), `stroke="${C.muted}" stroke-opacity=".7"`);
    axes += text(X(-1), cy + 19, '−1', 'text-anchor="middle"') + text(X(1), cy + 19, '1', 'text-anchor="middle"');
    axes += text(cx - 7, cy + 17, '0', 'text-anchor="end"');
    axes += text(X(1.13), cy - 9, 'Re', 'text-anchor="end"') + text(cx + 8, Y(1.06), 'Im');
    return { X, Y, scale, cx, cy, axes };
  }

  function rectangularPlane(F, xmin, xmax) {
    const left = 42, right = F.width - 21, top = 30, bottom = F.height - 40;
    const X = x => left + (x - xmin) / (xmax - xmin) * (right - left);
    const Y = y => bottom - (y + 1.15) / 2.3 * (bottom - top);
    let axes = line(left, Y(0), right, Y(0), `stroke="${C.muted}"`);
    axes += line(X(0), top, X(0), bottom, `stroke="${C.line}"`);
    for (const y of [-1, 1]) {
      axes += line(left, Y(y), right, Y(y), `stroke="${C.line}" stroke-dasharray="3 4"`);
      axes += text(left - 8, Y(y) + 4, y === -1 ? '−1' : '1', 'text-anchor="end"');
    }
    return { left, right, top, bottom, X, Y, axes };
  }

  function map(svg, S, M) {
    const x = Math.cos(S.t), upper = M.polar(1, S.t), lower = M.polar(1, -S.t);
    const F = frame(svg, 'map', S, 'The unit-circle trace gives the real input x',
      `The reciprocal points exp(it) and exp(-it) lie on the unit circle. Their connecting segment is vertical and its midpoint is x equals cos(t), currently ${fmt(x)}. Both axes use the same unit scale.`);
    const P = unitPlane(F);
    let body = `<circle data-role="unit-circle" cx="${P.cx}" cy="${P.cy}" r="${P.scale}" fill="none" stroke="${C.muted}" stroke-width="1.8"/>` + P.axes;
    body += line(P.X(-1), P.cy, P.X(1), P.cy, `data-role="real-interval" stroke="${C.pair}" stroke-width="3" stroke-opacity=".6"`);
    body += line(P.X(upper.re), P.Y(upper.im), P.X(lower.re), P.Y(lower.im), `data-role="reciprocal-segment" stroke="${C.muted}" stroke-width="2" stroke-dasharray="5 4"`);
    body += line(P.cx, P.cy, P.X(upper.re), P.Y(upper.im), `stroke="${C.positive}" stroke-opacity=".45"`);
    body += dot(P.X(upper.re), P.Y(upper.im), 6, C.positive, 'data-role="outer-point"');
    body += dot(P.X(lower.re), P.Y(lower.im), 6, C.negative, 'data-role="reciprocal-point"');
    body += dot(P.X(x), P.cy, 6, C.gold, 'data-role="input-midpoint" stroke="var(--panel)" stroke-width="1.5"');
    body += text(F.width / 2, 17, 'Input geometry: unit circle → real interval', 'text-anchor="middle"');
    body += text(F.width / 2, F.height - 8, `Input x = ${fmt(x)}`, 'text-anchor="middle"');
    F.draw(body);
    Object.assign(svg.dataset, { x: String(x), scaleX: String(P.scale), scaleY: String(P.scale), radius: '1' });
    return { x, width: F.width, height: F.height };
  }

  function convexHull(points) {
    // Repeated phases coincide at many exact angles. Removing those duplicates
    // makes the point and segment cases explicit rather than closing a polygon.
    const ordered = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    const unique = ordered.filter((p, i) => !i || Math.hypot(p.x - ordered[i - 1].x, p.y - ordered[i - 1].y) > 1e-10);
    if (unique.length <= 2) return unique;
    const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const half = values => {
      const result = [];
      for (const value of values) {
        while (result.length >= 2 && cross(result[result.length - 2], result[result.length - 1], value) <= 1e-12) result.pop();
        result.push(value);
      }
      return result;
    };
    const lower = half(unique), upper = half(unique.slice().reverse());
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  function phases(svg, S, M) {
    const terms = M.terms(S.n, 1, S.t);
    const points = terms.map(term => ({ x: Math.cos(term.k * S.t), y: Math.sin(term.k * S.t), term }));
    const mean = M.packet(S.n, 1, S.t), hull = convexHull(points);
    const F = frame(svg, 'phases', S, 'Unit phases and their convex weighted mean',
      `${S.n + 1} unit phase markers have weights alpha(n,j). Their weighted mean is P_n(cos(t)), currently ${fmt(mean.re)}, on the real line. Gold marks j ${S.j}; the dashed green ring marks its partner j ${S.n - S.j}. The hull is a ${hull.length === 1 ? 'point' : hull.length === 2 ? 'segment' : 'polygon'}.`);
    const P = unitPlane(F);
    let body = `<circle data-role="unit-disk" cx="${P.cx}" cy="${P.cy}" r="${P.scale}" fill="${C.degree}" fill-opacity=".04" stroke="${C.muted}" stroke-width="1.8"/>`;
    if (S.showHull !== false) {
      if (hull.length === 1) body += dot(P.X(hull[0].x), P.Y(hull[0].y), 8, C.pair, 'data-role="convex-hull" fill-opacity=".3"');
      else if (hull.length === 2) body += line(P.X(hull[0].x), P.Y(hull[0].y), P.X(hull[1].x), P.Y(hull[1].y), `data-role="convex-hull" stroke="${C.pair}" stroke-width="4" stroke-opacity=".45"`);
      else body += `<path data-role="convex-hull" d="${path(hull, P.X, P.Y)} Z" fill="${C.pair}" fill-opacity=".09" stroke="${C.pair}" stroke-width="1.5" stroke-opacity=".65"/>`;
    }
    body += P.axes;
    for (const point of points) {
      body += dot(P.X(point.x), P.Y(point.y), 4.5, colour(point.term.k), `data-role="unit-phase" data-j="${point.term.j}" data-frequency="${point.term.k}" data-weight="${point.term.weight}" data-real="${point.x}" data-imaginary="${point.y}"`);
    }
    const selected = points[S.j], partner = points[S.n - S.j];
    body += dot(P.X(partner.x), P.Y(partner.y), 12, 'none', `data-role="partner-phase" stroke="${C.pair}" stroke-width="2" stroke-dasharray="3 3"`);
    body += dot(P.X(selected.x), P.Y(selected.y), 8, 'none', `data-role="selected-phase" stroke="${C.gold}" stroke-width="2.5"`);
    body += dot(P.X(mean.re), P.Y(0), 6, C.degree, 'data-role="weighted-mean" stroke="var(--panel)" stroke-width="1.5"');
    body += text(F.width / 2, 17, 'Unit phases → weighted mean', 'text-anchor="middle"');
    body += text(F.width / 2, F.height - 8, `Weighted mean = ${fmt(mean.re)}`, 'text-anchor="middle"');
    F.draw(body);
    Object.assign(svg.dataset, {
      x: String(Math.cos(S.t)), meanReal: String(mean.re), meanImaginary: String(mean.im),
      hullVertices: String(hull.length), hullDimension: String(Math.min(2, hull.length - 1)),
      hullVisible: String(S.showHull !== false), selectedFrequency: String(selected.term.k),
      partnerIndex: String(S.n - S.j), scaleX: String(P.scale), scaleY: String(P.scale)
    });
    return { mean, hullVertices: hull.length, width: F.width, height: F.height };
  }

  function graph(svg, S, M) {
    const x = Math.cos(S.t), value = M.legendre(S.n, { re: x, im: 0 }).re;
    const F = frame(svg, 'graph', S, 'Legendre polynomial on the fixed real interval',
      `Degree ${S.n}, input x ${fmt(x)}, value ${fmt(value)}. The horizontal domain is minus one to one; the vertical domain is minus 1.15 to 1.15. Dashed bounds are minus one and one. The endpoint P_n(1) equals one.`, .65);
    const P = rectangularPlane(F, -1, 1), count = Math.max(360, S.n * 70);
    const points = Array.from({ length: count + 1 }, (_, i) => {
      const xx = -1 + 2 * i / count;
      return { x: xx, y: M.legendre(S.n, { re: xx, im: 0 }).re };
    });
    let body = P.axes;
    for (const y of [-1, 1]) body += line(P.left, P.Y(y), P.right, P.Y(y), `data-role="unit-bound" stroke="${C.pair}" stroke-width="1.5" stroke-dasharray="5 4" stroke-opacity=".8"`);
    for (const xx of [-1, 0, 1]) body += text(P.X(xx), P.bottom + 22, xx === -1 ? '−1' : xx, 'text-anchor="middle"');
    body += `<path data-role="legendre-curve" d="${path(points, P.X, P.Y)}" fill="none" stroke="${C.degree}" stroke-width="2.6"/>`;
    body += line(P.X(x), P.Y(0), P.X(x), P.Y(value), `stroke="${C.gold}" stroke-dasharray="3 4" stroke-opacity=".65"`);
    body += dot(P.X(1), P.Y(1), 5, C.pair, 'data-role="normalisation-endpoint" stroke="var(--panel)" stroke-width="1.5"');
    body += dot(P.X(x), P.Y(value), 6, C.degree, `data-role="selected-value" stroke="${C.gold}" stroke-width="2.5"`);
    body += text(P.left, 17, `Degree ${S.n} · fixed vertical scale`);
    body += text(P.right + 11, P.bottom + 23, 'x');
    body += text(P.right - 5, P.Y(1) - 9, '(1, 1)', 'text-anchor="end"');
    F.draw(body);
    Object.assign(svg.dataset, {
      x: String(x), value: String(value), xMin: '-1', xMax: '1', yMin: '-1.15', yMax: '1.15',
      plotLeft: String(P.left), plotRight: String(P.right), plotTop: String(P.top), plotBottom: String(P.bottom),
      samples: String(points.length)
    });
    return { x, value, width: F.width, height: F.height };
  }

  function angular(svg, S, M) {
    const k = S.k;
    const F = frame(svg, 'angular', S, 'The signed angular integrand and its absolute-sine envelope',
      `The purple curve is P_n(cos(t)) times sin(k t), with n ${S.n} and k ${k}. The dashed green envelopes are plus and minus absolute sin(k t). Cyan and orange fills mark positive and negative signed contributions. There are ${k} absolute-sine humps from zero to pi.`, .6);
    const P = rectangularPlane(F, 0, Math.PI), count = Math.max(640, k * 80, S.n * 60);
    const points = Array.from({ length: count + 1 }, (_, i) => {
      const t = Math.PI * i / count, sine = Math.sin(k * t);
      return { x: t, y: M.legendre(S.n, { re: Math.cos(t), im: 0 }).re * sine, envelope: Math.abs(sine) };
    });
    const area = sign => {
      const clipped = points.map(p => ({ x: p.x, y: sign > 0 ? Math.max(0, p.y) : Math.min(0, p.y) }));
      return `${path([{ x: 0, y: 0 }, ...clipped, { x: Math.PI, y: 0 }], P.X, P.Y)} Z`;
    };
    let body = `<path data-role="positive-area" d="${area(1)}" fill="${C.positive}" fill-opacity=".16"/>`;
    body += `<path data-role="negative-area" d="${area(-1)}" fill="${C.negative}" fill-opacity=".17"/>`;
    body += P.axes;
    for (const sign of [1, -1]) body += `<path data-role="sine-envelope" data-sign="${sign}" d="${path(points.map(p => ({ x: p.x, y: sign * p.envelope })), P.X, P.Y)}" fill="none" stroke="${C.pair}" stroke-width="1.7" stroke-dasharray="5 4"/>`;
    body += `<path data-role="signed-integrand" d="${path(points, P.X, P.Y)}" fill="none" stroke="${C.degree}" stroke-width="2.6"/>`;
    for (const [t, label] of [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π']]) body += text(P.X(t), P.bottom + 22, label, 'text-anchor="middle"');
    const t = Math.max(0, Math.min(Math.PI, S.t));
    const value = M.legendre(S.n, { re: Math.cos(t), im: 0 }).re * Math.sin(k * t);
    body += line(P.X(t), P.top, P.X(t), P.bottom, `data-role="angle-cursor" stroke="${C.gold}" stroke-opacity=".4" stroke-dasharray="3 4"`);
    body += dot(P.X(t), P.Y(value), 5, C.degree, `data-role="selected-integrand" stroke="${C.gold}" stroke-width="2"`);
    body += text(P.left, 17, `k = ${k} · ${k} ${k === 1 ? 'envelope hump' : 'envelope humps'}`);
    body += text(P.right + 10, P.bottom + 22, 't');
    F.draw(body);
    Object.assign(svg.dataset, {
      k: String(k), envelopeHumps: String(k), value: String(value), xMin: '0', xMax: String(Math.PI),
      yMin: '-1.15', yMax: '1.15', samples: String(points.length),
      plotLeft: String(P.left), plotRight: String(P.right), plotTop: String(P.top), plotBottom: String(P.bottom)
    });
    return { value, width: F.width, height: F.height };
  }

  window.RealLinePlots = Object.freeze({ map, phases, graph, angular });
})();
