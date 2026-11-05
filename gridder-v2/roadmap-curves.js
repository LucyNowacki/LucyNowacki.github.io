/* Finite, scaled previews of the same original graphs used by Gridder.
 * Coordinates are normalized to [0, 1], with y=0 at the top. */
(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.GridderRoadmapCurves = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function build(catalogue, G, key) {
    if (!catalogue?.maths?.curves || !Object.prototype.hasOwnProperty.call(catalogue.maths.curves, key)) throw new RangeError('Unknown preview function: ' + key);
    if (!G || typeof G.originalGraph !== 'function' || typeof G.board !== 'function') throw new TypeError('Preview requires the Gridder graph and board API');
    const M = catalogue.maths, curve = M.curves[key], graph = G.originalGraph(M, key);
    const board = G.board(M, key, 'guided');
    const window = { xmin: board.xmin, xmax: board.xmax, ymin: board.ymin, ymax: board.ymax };
    if (![window.xmin, window.xmax, window.ymin, window.ymax].every(Number.isFinite) || window.xmax <= window.xmin || window.ymax <= window.ymin) throw new RangeError('Preview requires a finite nonempty window');
    const normalize = (x, y) => {
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < window.xmin || x > window.xmax || y < window.ymin || y > window.ymax) return null;
      // Clamp only final roundoff; out-of-window samples were rejected above.
      return [Math.max(0, Math.min(1, (x - window.xmin) / (window.xmax - window.xmin))),
        Math.max(0, Math.min(1, (window.ymax - y) / (window.ymax - window.ymin)))];
    };
    const paths = [], points = [], finiteModel = graph.finiteModel === true;
    if (finiteModel) {
      // Keep each supplied segment independent: no connection is inferred
      // between finite pieces, particularly across jumps and omitted intervals.
      for (const segment of graph.segments || []) {
        const from = normalize(...segment.from), to = normalize(...segment.to);
        if (from && to) paths.push([from, to]);
        if (from && segment.openStart) points.push({ x: from[0], y: from[1], open: true });
        if (to && segment.openEnd) points.push({ x: to[0], y: to[1], open: true });
      }
      for (const point of graph.points || []) {
        const p = normalize(point.x, point.y);
        if (p) points.push({ x: p[0], y: p[1], open: point.open === true });
      }
    } else {
      let path = [];
      const flush = () => { if (path.length > 1) paths.push(path); path = []; };
      const [lo, hi] = graph.domain;
      for (let i = 0; i <= 96; i++) {
        const x = i === 96 ? hi : lo + (hi - lo) * i / 96;
        const p = normalize(x, graph.value(x));
        if (p) path.push(p); else flush();
      }
      flush();
    }
    const morphable = !finiteModel && paths.length === 1 && paths[0].length === 97;
    const notice = finiteModel ? 'Finite graph preview · ' + (curve.study.displayNote || 'Finite examples only.') : 'Scaled graph preview';
    return { key, label: curve.label, finiteModel, morphable, paths, points, notice, window };
  }
  return { build };
});
