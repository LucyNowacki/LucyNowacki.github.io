/* Shared native-SVG scenes for the four Hardy embedding lessons.
 * render(svg, model, {onAngle(degrees), focus: gauge.key, stage: 0|1|2})
 * profile(svg, gauge, {onAngle(degrees), angle: radians, baseAngle: degrees})
 *
 * Model values are authoritative. `whole` is a mean ENERGY for a Hardy
 * hump and a boundary supremum for a lighthouse; the renderer computes no
 * norms. Gauge height uses reference, never the current local reading or N.
 * profile is [{angle: radians, value: number}], in the gauge's actual units.
 * `baseAngle` preserves the shared input-angle offset when dragging a profile.
 * The common elliptic-coordinate display map enlarges gaps. Measurements and
 * branch data remain in the original complex coordinates.
 */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const TAU = 2 * Math.PI;
  const contexts = new WeakMap();
  let serial = 0;
  const colors = {
    input: 'var(--hardy-input, var(--viz-series-1, var(--pair)))',
    image: 'var(--hardy-image, var(--viz-series-2, var(--gold)))',
    response: 'var(--hardy-response, var(--viz-series-3, var(--degree)))',
    output: 'var(--hardy-output, var(--viz-series-5, var(--pair)))',
    ink: 'var(--ink, var(--foreground))',
    muted: 'var(--muted, var(--muted-foreground))',
    line: 'var(--line, var(--border))',
    background: 'var(--panel, var(--background))',
    interval: 'var(--hardy-interval, var(--red))'
  };
  const aliases = {source: 'input', target: 'image'};
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const wrap = angle => ((angle % TAU) + TAU) % TAU;
  const degrees = angle => wrap(angle) * 180 / Math.PI;
  const color = item => colors[aliases[item.colorKey || item.key] || item.colorKey || item.key] || colors.input;
  const guideName = gauge => gauge.energy ? 'Mean' : /sampled/i.test(gauge.wholeMethod || '') ? 'Sample max' : 'Sup';
  const format = value => {
    if (!Number.isFinite(value)) return '—';
    if (value === 0) return '0';
    if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) return value.toExponential(2);
    return Number(value.toPrecision(4)).toString();
  };

  function node(parent, tag, attributes = {}, text) {
    const element = parent.ownerDocument.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null) element.setAttribute(key, value);
    }
    if (text !== undefined) element.textContent = text;
    parent.appendChild(element);
    return element;
  }
  function path(parent, points, attributes = {}) {
    return node(parent, 'path', {
      d: points.map((point, i) => `${i ? 'L' : 'M'}${point[0]},${point[1]}`).join(' '),
      fill: 'none', ...attributes
    });
  }
  function line(parent, from, to, attributes = {}) {
    return node(parent, 'line', {x1: from[0], y1: from[1], x2: to[0], y2: to[1], ...attributes});
  }
  function circle(parent, at, radius, attributes = {}) {
    return node(parent, 'circle', {cx: at[0], cy: at[1], r: radius, ...attributes});
  }
  function label(parent, x, y, text, attributes = {}) {
    return node(parent, 'text', {
      x, y, fill: colors.ink, 'font-size': 13, 'font-weight': 400,
      'font-family': 'inherit', 'text-anchor': 'start', ...attributes
    }, text);
  }
  function marker(defs, id, fill) {
    const mark = node(defs, 'marker', {
      id, viewBox: '0 0 10 10', refX: 8, refY: 5,
      markerWidth: 8, markerHeight: 8, orient: 'auto', markerUnits: 'userSpaceOnUse'
    });
    node(mark, 'path', {d: 'M0,0 L10,5 L0,10 Z', fill});
    return `url(#${id})`;
  }
  function widthOf(svg) {
    return Math.max(120, finite(svg.getBoundingClientRect().width,
      finite(svg.clientWidth, finite(svg.parentElement?.getBoundingClientRect().width, 736))) || 736);
  }
  function size(svg, width, height) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', height);
    svg.setAttribute('width', '100%');
    svg.setAttribute('role', 'img');
    svg.style.display = 'block';
    svg.style.maxWidth = '100%';
    svg.style.touchAction = 'pan-y';
    svg.replaceChildren();
  }

  // Keep pointer capture and listeners on the SVG, which survives every redraw.
  function context(svg) {
    let ctx = contexts.get(svg);
    if (ctx) return ctx;
    ctx = {id: `hardy-scene-${++serial}`, svg, width: 0, drag: null};
    contexts.set(svg, ctx);
    const location = event => {
      const transform = svg.getScreenCTM?.();
      if (transform && svg.createSVGPoint) {
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const local = point.matrixTransform(transform.inverse());
        return [local.x, local.y];
      }
      const box = svg.getBoundingClientRect();
      return [(event.clientX - box.left) * ctx.width / Math.max(1, box.width),
        (event.clientY - box.top) * ctx.height / Math.max(1, box.height)];
    };
    const move = event => {
      if (!ctx.drag || event.pointerId !== ctx.drag.pointerId) return;
      const angle = ctx.drag.angleAt(location(event));
      if (Number.isFinite(angle)) ctx.options.onAngle?.(degrees(angle - ctx.drag.offset));
    };
    svg.addEventListener('pointerdown', event => {
      if ((event.button !== undefined && event.button !== 0) || !ctx.options?.onAngle || !ctx.pick) return;
      const picked = ctx.pick(location(event), event.target);
      if (!picked) return;
      ctx.drag = {...picked, pointerId: event.pointerId};
      if (svg.setPointerCapture) svg.setPointerCapture(event.pointerId);
      move(event);
      event.preventDefault();
    });
    svg.addEventListener('pointermove', move);
    const finish = event => {
      if (!ctx.drag || ctx.drag.pointerId !== event.pointerId) return;
      ctx.drag = null;
      if (svg.hasPointerCapture?.(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    };
    svg.addEventListener('pointerup', finish);
    svg.addEventListener('pointercancel', finish);
    svg.addEventListener('lostpointercapture', () => { ctx.drag = null; });
    if (typeof global.ResizeObserver === 'function') {
      ctx.observer = new global.ResizeObserver(() => {
        if (ctx.redraw && Math.abs(widthOf(svg) - ctx.width) > 0.5) ctx.redraw();
      });
      ctx.observer.observe(svg);
    }
    return ctx;
  }

  function geometry(width, ellipses, gauges, labelsVisible) {
    const small = width < 520;
    const radii = [...new Set([...ellipses, ...gauges].map(item => finite(item.radius, 1)).filter(r => r > 1))].sort((a, b) => a - b);
    if (!radii.length) radii.push(2);
    const n = radii.length;
    const displayKnots = n === 1 ? [14] : n === 2 ? [7.7, 14] : radii.map((r, i) => 6 + 8 * i / (n - 1));
    const xs = [0, ...radii.map(Math.log)];
    const ys = [0, ...displayKnots.map(Math.log)];
    function displayRadius(radius) {
      const x = Math.log(Math.max(1, radius));
      let i = 0;
      while (i < xs.length - 2 && x > xs[i + 1]) i++;
      return Math.exp(ys[i] + (ys[i + 1] - ys[i]) * (x - xs[i]) / (xs[i + 1] - xs[i]));
    }
    const topRows = labelsVisible ? Math.ceil(gauges.length / (small ? 2 : 4)) : 0;
    const top = topRows ? 10 + 23 * topRows : 0;
    const bottom = labelsVisible ? (small ? 46 : 30) : 0;
    const padding = small ? 49 : 82;
    const rx = Math.min(420, Math.max(20, (width - 2 * padding) / 2));
    const ry = Math.min(174, rx * (small ? 0.82 : 0.68));
    const extent = small ? 48 : 78;
    const height = top + 2 * (ry + extent) + bottom;
    const cx = width / 2, cy = top + ry + extent;
    const focal = rx / ((14 + 1 / 14) / 2);
    const vertical = ry / (focal * (14 - 1 / 14) / 2);
    function axes(radius) {
      const R = displayRadius(radius);
      return [focal * (R + 1 / R) / 2, vertical * focal * (R - 1 / R) / 2];
    }
    function at(radius, angle) {
      const ab = axes(radius);
      return [cx + ab[0] * Math.cos(angle), cy - ab[1] * Math.sin(angle)];
    }
    function point(z) {
      const [x, y] = z;
      if (Math.abs(y) < 1e-13 && Math.abs(x) <= 1 + 1e-13) return [cx + focal * x, cy];
      const a = Math.max(1, (Math.hypot(x - 1, y) + Math.hypot(x + 1, y)) / 2);
      const b = Math.sqrt(Math.max(0, a * a - 1));
      if (b < 1e-13) return [cx + focal * x, cy];
      return at(a + b, Math.atan2(y / b, x / a));
    }
    return {width, height, small, top, bottom, cx, cy, focal, axes, at, point, displayRadius, radii};
  }

  function drawGauge(layer, defs, gauge, geo, ctx, focus) {
    const key = String(gauge.key), ink = color(gauge), t = finite(gauge.angle);
    const active = focus === key;
    const ab = geo.axes(gauge.radius), foot = geo.at(gauge.radius, t);
    const tangent = [-ab[0] * Math.sin(t), -ab[1] * Math.cos(t)];
    const length = Math.hypot(...tangent), T = tangent.map(v => v / length);
    const normal = [-T[1], T[0]];
    const xy = (u, v) => [foot[0] + T[0] * u + normal[0] * v, foot[1] + T[1] * u + normal[1] * v];
    // Distance to the OTHER intersection along the inward unit normal.
    const chord = 2 * ((foot[0] - geo.cx) * normal[0] / ab[0] ** 2 + (foot[1] - geo.cy) * normal[1] / ab[1] ** 2)
      / (normal[0] ** 2 / ab[0] ** 2 + normal[1] ** 2 / ab[1] ** 2);
    const H = Math.min(geo.small ? 44 : 72, gauge.energy ? Infinity : 0.68 * Math.max(0, chord));
    const reference = Math.max(1e-300, finite(gauge.reference, 1));
    const scale = value => H * Math.sqrt(Math.max(0, finite(value)) / (Math.max(0, finite(value)) + reference / 4));
    const local = scale(gauge.local), whole = scale(gauge.whole);
    const group = node(layer, 'g', {
      'data-gauge': key, 'data-active-gauge': active, opacity: focus && !active ? 0.84 : 1,
      'data-local': gauge.local, 'data-whole': gauge.whole, 'data-reference': reference,
      'data-angle': t, 'data-radius': gauge.radius, 'data-height': local,
      'data-normal-chord': chord, 'data-energy': Boolean(gauge.energy)
    });
    const measure = gauge.energy ? 'energy' : 'modulus';
    node(group, 'title', {}, `${gauge.label || key}. Local ${measure} ${format(gauge.local)}. Whole-boundary ${guideName(gauge).toLowerCase()} ${format(gauge.whole)}. ${gauge.wholeMethod || ''}`);
    const guide = (parent, offset) => {
      const half = geo.small ? 13 : 18;
      const from = xy(-half, offset), to = xy(half, offset);
      line(parent, from, to, {stroke: colors.background, 'stroke-width': 5, 'stroke-dasharray': '4 3'});
      line(parent, from, to, {stroke: ink, 'stroke-width': 2.2, 'stroke-dasharray': '4 3', 'data-whole-guide': key});
    };
    if (gauge.energy) {
      const half = geo.small ? 24 : 43, base = [], ridge = [];
      for (let i = 0; i <= 48; i++) {
        const u = 2 * i / 48 - 1;
        const p = geo.at(gauge.radius, t + u * half / length);
        const lift = local * (Math.exp(-4.5 * u * u) - Math.exp(-4.5)) / (1 - Math.exp(-4.5));
        base.push(p); ridge.push([p[0] + normal[0] * lift, p[1] + normal[1] * lift]);
      }
      path(group, [...base, ...ridge.slice().reverse(), base[0]], {fill: ink, 'fill-opacity': active ? 0.32 : 0.22, 'data-glyph': 'hardy-hump'});
      path(group, ridge, {stroke: colors.background, 'stroke-width': 5.5, 'stroke-linejoin': 'round'});
      path(group, ridge, {stroke: ink, 'stroke-width': active ? 3 : 2.4, 'stroke-linejoin': 'round'});
      guide(group, whole);
      if (local >= 9) {
        line(group, foot, xy(0, local), {stroke: ink, 'stroke-width': 1.3, opacity: 0.78});
        circle(group, xy(0, local), active ? 3.5 : 2.6, {fill: ink, stroke: colors.background, 'stroke-width': 1.3});
      }
    } else {
      const clipID = `${ctx.id}-inside-${key.replace(/[^a-z0-9_-]/gi, '-')}`;
      const clip = node(defs, 'clipPath', {id: clipID});
      node(clip, 'ellipse', {cx: geo.cx, cy: geo.cy, rx: ab[0], ry: ab[1]});
      const inside = node(group, 'g', {'clip-path': `url(#${clipID})`, 'data-meter-interior': key});
      const half = (geo.small ? 9 : 12) * Math.min(1, local / 16);
      path(inside, [xy(-half, -local), xy(-half * 0.4, 0), xy(half * 0.4, 0), xy(half, -local), xy(-half, -local)],
        {fill: ink, 'fill-opacity': 0.3, stroke: ink, 'stroke-width': 1.8, 'data-glyph': 'lighthouse'});
      const depth = Math.min(local, 22), reach = (geo.small ? 23 : 36) * Math.min(1, local / 20);
      for (const sign of [-1, 1]) path(inside, [foot, xy(sign * reach, -depth * 0.3), xy(sign * reach, -depth), foot], {fill: ink, 'fill-opacity': active ? 0.32 : 0.22});
      guide(inside, -whole);
      line(inside, xy(0, -local), foot, {stroke: colors.background, 'stroke-width': 5.8});
      line(inside, xy(0, -local), foot, {stroke: ink, 'stroke-width': 3.1, 'data-stem': key, 'data-local-length': local});
    }
    if (active) circle(group, foot, 10, {fill: 'none', stroke: ink, 'stroke-width': 1.4, opacity: 0.76});
    circle(group, foot, active ? 5.3 : 4.5, {fill: active ? ink : colors.background,
      stroke: active ? colors.background : ink, 'stroke-width': 2.2, 'data-foot': key});
    return {key, foot, radius: gauge.radius, angle: t, local: gauge.local, whole: gauge.whole, height: local, normalChord: chord};
  }

  function operatorSpecs(model) {
    const get = key => (model.gauges || []).find(g => g.key === key);
    if (get('input') && get('image') && get('response') && get('output')) {
      return [
        {key: 'j2', label: 'J₂', from: get('input'), to: get('image'), color: colors.input},
        {key: 'core', label: 'L̃', from: get('image'), to: get('response'), color: colors.response},
        {key: 'jinf', label: 'J∞', from: get('response'), to: get('output'), color: colors.output}
      ];
    }
    if (get('source') && get('target')) {
      const embedding = model.kind === 'jinf' ? 'J∞' : 'J₂';
      const prefix = model.state?.part === 'prefix' ? 'Prefix → ' : model.state?.part === 'tail' ? 'Tail → ' : '';
      return [{key: model.kind === 'jinf' ? 'jinf' : 'j2', label: prefix + embedding,
        from: get('source'), to: get('target'), color: color(get('target'))}];
    }
    return [];
  }

  function render(svg, model, options = {}) {
    if (!svg || !model) return null;
    const ctx = context(svg), gauges = model.gauges || [], ellipses = model.ellipses || [];
    const geo = geometry(widthOf(svg), ellipses, gauges, options.labels !== false);
    ctx.options = options; ctx.model = model; ctx.width = geo.width; ctx.height = geo.height;
    ctx.redraw = () => render(svg, ctx.model, ctx.options);
    size(svg, geo.width, geo.height);
    svg.classList.add('hardy-scene');
    node(svg, 'title', {}, 'Linked boundary gauges on nested ellipses');
    const motion = model.numerical?.phaseChangesFunction ? 'In this synthesis example the angle also changes the polynomial coefficients, so whole norms may change.' : 'Moving the probe alone leaves whole norms fixed.';
    const branchDescription = model.branches?.length ? 'Solid arrows show affine inverse-branch images. ' : '';
    node(svg, 'desc', {}, `The ring marks the selected boundary probe. Hardy humps show local boundary energy. Inward lighthouses show local modulus. Gauge heights use a compressed scale and dashed guides mark the whole-boundary reference. Dashed arrows map functions. ${branchDescription}The red segment marks the interval from minus one to one. A shared display map opens up the gaps between ellipses. ${motion} Use the page angle slider for keyboard control.`);
    const defs = node(svg, 'defs');
    const boundaries = node(svg, 'g', {'data-layer': 'boundaries'});
    const focusedRadius = options.focus && gauges.find(g => g.key === options.focus)?.radius;
    for (const e of ellipses.slice().sort((a, b) => b.radius - a.radius)) {
      const ab = geo.axes(e.radius);
      const active = e.radius === focusedRadius;
      node(boundaries, 'ellipse', {cx: geo.cx, cy: geo.cy, rx: ab[0], ry: ab[1],
        fill: color(e), 'fill-opacity': active ? 0.065 : 0.028,
        stroke: color(e), 'stroke-width': active ? 2.4 : 1.55, 'stroke-opacity': active ? 0.91 : 0.72,
        'data-boundary': e.key, 'data-radius': e.radius, 'data-display-radius': geo.displayRadius(e.radius)});
    }
    const [axisX, axisY] = geo.axes(geo.radii.at(-1));
    const axes = node(svg, 'g', {'aria-hidden': 'true', 'pointer-events': 'none'});
    const axisStyle = {stroke: colors.line, 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: 0.62};
    line(axes, [geo.cx - axisX, geo.cy], [geo.cx + axisX, geo.cy], axisStyle);
    line(axes, [geo.cx, geo.cy - axisY], [geo.cx, geo.cy + axisY], axisStyle);
    const operatorLayer = node(svg, 'g', {'data-layer': 'operators'});
    const specs = operatorSpecs(model);
    specs.forEach((op, index) => {
      const start = geo.axes(op.from.radius), end = geo.axes(op.to.radius);
      const a = op.from.angle, delta = Math.atan2(Math.sin(op.to.angle - a), Math.cos(op.to.angle - a));
      const points = Array.from({length: 72}, (_, j) => {
        const u = 0.035 + 0.93 * j / 71;
        const t = a + delta * u + (op.key === 'core' ? 0.16 * Math.sin(Math.PI * u) : 0);
        const ab = start.map((value, k) => value + u * (end[k] - value));
        return [geo.cx + ab[0] * Math.cos(t), geo.cy - ab[1] * Math.sin(t)];
      });
      const focused = !options.focus || [op.from.key, op.to.key].includes(options.focus);
      const staged = !Number.isInteger(options.stage) || specs.length === 1 || options.stage === index;
      path(operatorLayer, points, {stroke: op.color, 'stroke-width': staged ? 2.1 : 1.6,
        opacity: focused && staged ? 0.95 : 0.64, 'stroke-dasharray': '7 5',
        'marker-end': marker(defs, `${ctx.id}-arrow-${op.key}`, op.color), 'data-operator': op.key});
    });
    const branchLayer = node(svg, 'g', {'data-layer': 'branches'}), branchData = [];
    const branchMarker = marker(defs, `${ctx.id}-branch-arrow`, colors.ink);
    for (const branch of model.branches || []) {
      const source = geo.point(branch.source), target = geo.point(branch.target);
      // The endpoints are the exact mapped complex values. The connecting
      // arrow indicates evaluation, not an orbit or a path in the source plane.
      const delta = target.map((v, i) => v - source[i]), length = Math.hypot(...delta);
      const side = branch.sign < 0 ? -1 : 1;
      const normal = length ? [-delta[1] / length, delta[0] / length] : [0, 0];
      const middle = source.map((v, i) => (v + target[i]) / 2 + normal[i] * side * (geo.small ? 7 : 14));
      const key = branch.sign < 0 ? 'minus' : 'plus';
      node(branchLayer, 'path', {d: `M${source[0]},${source[1]} Q${middle[0]},${middle[1]} ${target[0]},${target[1]}`,
        fill: 'none', stroke: colors.ink, 'stroke-width': 1.7, 'marker-end': branchMarker,
        'data-branch-arrow': key, 'data-source': JSON.stringify(branch.source), 'data-target': JSON.stringify(branch.target)});
      const attrs = {fill: colors.ink, 'data-branch-point': key, 'data-real': branch.target[0], 'data-imag': branch.target[1]};
      if (branch.sign < 0) circle(branchLayer, target, 4.5, attrs);
      else path(branchLayer, [[target[0], target[1] - 6], [target[0] + 6, target[1]], [target[0], target[1] + 6], [target[0] - 6, target[1]], [target[0], target[1] - 6]], attrs);
      node(branchLayer, 'title', {}, `τ${branch.sign < 0 ? '−' : '+'}(ω) = ${format(branch.target[0])} ${branch.target[1] < 0 ? '−' : '+'} ${format(Math.abs(branch.target[1]))}i`);
      branchData.push({...branch, displaySource: source, displayTarget: target});
    }
    const interval = node(svg, 'g', {'data-layer': 'interval'});
    line(interval, [geo.cx - geo.focal, geo.cy], [geo.cx + geo.focal, geo.cy], {stroke: colors.interval, 'stroke-width': 3.3, 'data-interval': '-1,1'});
    circle(interval, [geo.cx - geo.focal, geo.cy], 2.5, {fill: colors.interval});
    circle(interval, [geo.cx + geo.focal, geo.cy], 2.5, {fill: colors.interval});
    const meterLayer = node(svg, 'g', {'data-layer': 'gauges'});
    const focusGauge = gauges.find(g => g.key === options.focus) || gauges[0];
    const drawingOrder = [...gauges.filter(g => g !== focusGauge), ...(focusGauge ? [focusGauge] : [])];
    const meters = new Map(drawingOrder.map(g => [g, drawGauge(meterLayer, defs, g, geo, ctx, options.focus)]));
    const records = gauges.map(g => meters.get(g));
    const hits = node(svg, 'g', {'data-layer': 'hit-targets'});
    if (focusGauge && options.onAngle) {
      const ab = geo.axes(focusGauge.radius);
      node(hits, 'ellipse', {cx: geo.cx, cy: geo.cy, rx: ab[0], ry: ab[1], fill: 'none', stroke: 'transparent',
        'stroke-width': 24, 'pointer-events': 'stroke', 'data-gauge-ring': focusGauge.key, style: 'touch-action:none;cursor:crosshair'});
      for (const gauge of drawingOrder) {
        const record = meters.get(gauge);
        circle(hits, record.foot, 23, {fill: 'transparent', 'data-gauge-hit': record.key,
          'pointer-events': 'all', style: 'touch-action:none;cursor:grab'});
      }
    }
    if (options.labels !== false) {
      const gutter = node(svg, 'g', {'data-layer': 'external-labels', 'pointer-events': 'none'});
      const cols = Math.max(1, Math.min(gauges.length, geo.small ? 2 : 4)), colWidth = geo.width / cols;
      gauges.forEach((g, i) => {
        const x = (i % cols) * colWidth + 10, y = 24 + Math.floor(i / cols) * 23;
        const active = g.key === options.focus;
        line(gutter, [x, y - 4], [x + 13, y - 4], {stroke: color(g), 'stroke-width': active ? 3 : 2, 'stroke-linecap': 'round'});
        const name = {source: 'Outer', target: 'Inner', input: 'f', image: 'g', response: 'h', output: 'h'}[g.key] || g.key;
        const radius = {source: 'R', target: 'r', input: 'r', image: 's', response: 'ρ', output: 'r'}[g.key];
        const reading = radius ? `${radius} = ${format(g.radius)}` : format(g.radius);
        label(gutter, x + 18, y, `${name} · ${reading}`, {'data-gauge-label': g.key,
          style: `fill:${active ? color(g) : colors.ink};font-size:${geo.small ? 12 : 13}px`, 'font-weight': active ? 650 : 500});
      });
      const y = geo.height - (geo.small ? 28 : 10);
      const operators = specs.map(s => s.label).join(' · ');
      if (operators) label(gutter, 10, y, `⋯ ${operators}`, {'data-operator-label': 'true'});
      const right = model.branches?.length ? '● τ−   ◆ τ+   [−1, 1]' : '[−1, 1]';
      label(gutter, geo.width - 10, geo.small && model.branches?.length ? y + 20 : y, right,
        {'text-anchor': 'end', 'data-branch-label': 'true', style: model.branches?.length ? '' : `fill:${colors.interval}`});
    }
    ctx.pick = (point, target) => {
      const key = target?.getAttribute?.('data-gauge-hit') || target?.getAttribute?.('data-gauge-ring');
      let gauge = gauges.find(g => g.key === key);
      if (!gauge) {
        const nearest = records.map(record => ({record, d: Math.hypot(point[0] - record.foot[0], point[1] - record.foot[1])})).sort((a, b) => a.d - b.d)[0];
        if (nearest?.d <= 25) gauge = gauges.find(g => g.key === nearest.record.key);
        else if (focusGauge) {
          const ab = geo.axes(focusGauge.radius);
          const radial = Math.hypot((point[0] - geo.cx) / ab[0], (geo.cy - point[1]) / ab[1]);
          if (Math.abs(radial - 1) * Math.min(...ab) < 16) gauge = focusGauge;
        }
      }
      if (!gauge) return null;
      const ab = geo.axes(gauge.radius);
      return {offset: finite(gauge.angle) - finite(model.state?.angle, degrees(gauges[0]?.angle || 0)) * Math.PI / 180,
        angleAt: p => Math.atan2((geo.cy - p[1]) / ab[1], (p[0] - geo.cx) / ab[0])};
    };
    svg.dataset.gauges = JSON.stringify(records);
    svg.dataset.branches = JSON.stringify(branchData);
    svg.dataset.geometry = JSON.stringify({width: geo.width, height: geo.height, cx: geo.cx, cy: geo.cy, focal: geo.focal, radii: geo.radii});
    svg.dataset.ready = 'true';
    return {width: geo.width, height: geo.height, gauges: records, branches: branchData, geometry: geo};
  }

  function profile(svg, gauge, options = {}) {
    if (!svg || !gauge) return null;
    const ctx = context(svg), width = widthOf(svg), small = width < 520;
    const height = small ? 280 : 310;
    ctx.options = options; ctx.gauge = gauge; ctx.width = width; ctx.height = height;
    ctx.redraw = () => profile(svg, ctx.gauge, ctx.options);
    size(svg, width, height);
    svg.classList.add('hardy-profile');
    const ink = color(gauge), left = 68, right = Math.max(left + 30, width - 18), top = 65, bottom = height - 52;
    const source = typeof gauge.profile === 'function' ? Array.from({length: 257}, (_, i) => ({angle: TAU * i / 256, value: gauge.profile(TAU * i / 256)})) : gauge.profile || [];
    const data = source.map((p, i) => ({angle: finite(p.angle, i * TAU / Math.max(1, source.length)), value: finite(p.value, NaN)}))
      .filter(p => Number.isFinite(p.value) && p.angle >= 0 && p.angle <= TAU).sort((a, b) => a.angle - b.angle);
    if (data.length && data[0].angle === 0 && data[data.length - 1].angle < TAU - 1e-10) data.push({angle: TAU, value: data[0].value});
    const whole = Math.max(0, finite(gauge.whole));
    const ceiling = Number.isFinite(options.ceiling) ? options.ceiling : null;
    const maximum = Math.max(0, whole, ceiling || 0, ...data.map(p => p.value));
    const ymax = maximum > 0 ? maximum * 1.16 : 1;
    const x = angle => left + angle / TAU * (right - left);
    const y = value => bottom - value / ymax * (bottom - top);
    node(svg, 'title', {}, `${gauge.label || gauge.key}: ${gauge.energy ? 'boundary energy' : 'boundary modulus'} profile`);
    node(svg, 'desc', {}, `Actual values against boundary angle in degrees. The dashed guide is ${guideName(gauge)} ${format(whole)}, using ${gauge.wholeMethod || 'the supplied mathematical model'}. The cursor follows the linked probe. The vertical axis is linear; the diagram's compressed gauge heights are not used here. Use the page angle slider for keyboard control.`);
    label(svg, 8, 18, gauge.energy ? 'Boundary energy' : 'Boundary modulus', {'data-axis': 'y', class: 'axis-title'});
    label(svg, 8, 42, `${guideName(gauge)}: ${format(whole)}`, {'data-profile-guide-label': 'true'});
    label(svg, width - 8, 42, `Local: ${format(gauge.local)}`, {'text-anchor': 'end', 'data-profile-local-label': 'true'});
    const defs = node(svg, 'defs'), clipID = `${ctx.id}-profile-clip`;
    const clip = node(defs, 'clipPath', {id: clipID});
    node(clip, 'rect', {x: left, y: top, width: right - left, height: bottom - top});
    const plot = node(svg, 'g', {'clip-path': `url(#${clipID})`});
    for (let i = 0; i < 4; i++) {
      const value = (maximum || 1) * i / 3;
      const yy = y(value);
      line(plot, [left, yy], [right, yy], {stroke: colors.line, 'stroke-width': 1, opacity: 0.55});
      label(svg, left - 9, yy + 4, format(value), {'text-anchor': 'end', 'data-y-tick': value, 'font-size': 12});
    }
    node(svg, 'rect', {x: left, y: top, width: right - left, height: bottom - top, fill: 'none', stroke: colors.line, 'stroke-width': 1, 'data-chart-frame': 'true'});
    if (ceiling !== null) line(plot, [left, y(ceiling)], [right, y(ceiling)], {stroke: colors.muted, 'stroke-width': 1.4, 'stroke-dasharray': '2 4', 'data-profile-ceiling': ceiling});
    line(plot, [left, y(whole)], [right, y(whole)], {stroke: ink, 'stroke-width': 1.8, 'stroke-dasharray': '6 4', 'data-profile-guide': whole});
    path(plot, data.map(p => [x(p.angle), y(p.value)]), {stroke: ink, 'stroke-width': 2.4, 'data-profile-curve': gauge.key});
    const angle = wrap(finite(options.angle, gauge.angle));
    line(plot, [x(angle), top], [x(angle), bottom], {stroke: colors.ink, 'stroke-width': 1.2, opacity: 0.7, 'data-profile-cursor': angle});
    circle(plot, [x(angle), y(Math.max(0, finite(gauge.local)))], 4.5, {fill: ink, stroke: colors.background, 'stroke-width': 1.5, 'data-profile-point': gauge.key});
    const ticks = small ? [0, 180, 360] : [0, 90, 180, 270, 360];
    for (const tick of ticks) label(svg, x(tick * Math.PI / 180), bottom + 22, `${tick}°`, {'text-anchor': tick === 0 ? 'start' : tick === 360 ? 'end' : 'middle', 'data-x-tick': tick, 'font-size': 12});
    label(svg, (left + right) / 2, height - 8, 'Boundary angle θ (degrees)', {'text-anchor': 'middle', class: 'axis-title', 'data-axis': 'x'});
    if (options.onAngle) node(svg, 'rect', {x: left, y: top, width: right - left, height: bottom - top, fill: 'transparent',
      'data-profile-hit': 'true', style: 'touch-action:none;cursor:crosshair'});
    ctx.pick = point => {
      if (point[0] < left || point[0] > right || point[1] < top || point[1] > bottom) return null;
      const offset = Number.isFinite(options.angleOffset) ? options.angleOffset
        : finite(gauge.angle) - finite(options.baseAngle, degrees(gauge.angle)) * Math.PI / 180;
      return {offset, angleAt: p => clamp((p[0] - left) / (right - left), 0, 1) * TAU};
    };
    svg.dataset.profile = JSON.stringify({key: gauge.key, whole, local: gauge.local, angle, energy: Boolean(gauge.energy), samples: data.length, ceiling, ymax});
    svg.dataset.ready = 'true';
    return {width, height, whole, angle, ymax, sampleCount: data.length};
  }

  global.HardyScenes = Object.freeze({render, profile});
})(typeof window === 'undefined' ? globalThis : window);
