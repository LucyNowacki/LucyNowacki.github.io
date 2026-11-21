(function () {
  'use strict';

  const T = String.raw;
  const math = t => `\\(${t}\\)`;
  const ink = ['#7ddaff', '#9be6ba', '#cec0ff', '#ffd0ed'];
  const gold = '#ffd77c';
  const axisInk = '#9688a5';
  const termColour = j => ink[j] || `hsl(${(197 + 108 * j) % 360} 82% 77%)`;
  const fmt = x => Math.abs(x) < 1e-13 ? '0' : Number(x.toPrecision(4)).toString().replace('-', '−');
  const subscript = i => String(i).replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[digit]);
  const signedComplex = z => `${fmt(z.re)} ${z.im < 0 ? '−' : '+'} ${fmt(Math.abs(z.im))}i`;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  // The lesson supports n <= 12. All products shown as fractions are exact dyadics.
  function weightTex(weight, degree) {
    const d = 4 ** degree, a = Math.round(weight * d), g = gcd(a, d);
    return d === g ? String(a / g) : T`\frac{${a / g}}{${d / g}}`;
  }

  function power(k) {
    if (k === 0) return '';
    return k === 1 ? 'z' : `z^{${k}}`;
  }

  function monomial(term, n) {
    const w = weightTex(term.weight, n), z = power(term.k);
    return (w === '1' && z ? '' : w) + z;
  }

  function svgArrow(a, b, color, stroke) {
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    if (length < .01) return `<circle cx="${a.x}" cy="${a.y}" r="1" fill="${color}"/>`;
    const ex = dx / length, ey = dy / length;
    const tip = Math.min(10, length * .44), wing = tip * .46;
    const x = b.x - tip * ex, y = b.y - tip * ey;
    return `<path d="M${a.x},${a.y} L${x + ex},${y + ey}" stroke="${color}" stroke-width="${stroke}" fill="none"/>` +
      `<path d="M${b.x},${b.y} L${x - ey * wing},${y + ex * wing} L${x + ey * wing},${y - ex * wing} Z" fill="${color}"/>`;
  }

  function selectState(node, selected) {
    node.setAttribute('aria-pressed', String(selected));
  }

  function endpoint(point, colour) {
    return `<g pointer-events="none" fill="none"><circle cx="${point.x}" cy="${point.y}" r="5.8" stroke="#1b1125" stroke-width="3.9"/><circle cx="${point.x}" cy="${point.y}" r="5.8" stroke="${colour}" stroke-width="2"/><circle cx="${point.x}" cy="${point.y}" r="1.5" fill="#fffaff"/></g>`;
  }

  // Both panels use equal horizontal and vertical units. Only the viewport changes.
  function viewport(pts) {
    const xs = pts.map(z => z.re), ys = pts.map(z => z.im);
    const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
    const scale = Math.min(260 / Math.max(xmax - xmin, 1e-12), 128 / Math.max(ymax - ymin, 1e-12));
    const cx = (xmin + xmax) / 2, cy = (ymin + ymax) / 2;
    return { scale, cx, cy, project: z => ({ x: 160 + (z.re - cx) * scale, y: 83 - (z.im - cy) * scale }) };
  }

  function createTipView(panel, M) {
    panel.innerHTML = `
      <h4 tabindex="-1">Zoom in on the tip</h4>
      <div class="lc-view-tabs" role="group" aria-label="Choose the arrow series">
        <button type="button" data-series="packet" aria-pressed="true">Laurent packet</button>
        <button type="button" data-series="infinite" aria-pressed="false">Infinite series · 40 arrows</button>
      </div>
      <p class="lc-packet-note">The close-up follows the selected arrow. The open ring marks its tip.</p>
      <div class="lc-series-intro" hidden>
        <p>${math(T`\sum_{m=0}^{\infty}s^m P_m(J(z))=(1-2sJ(z)+s^2)^{-1/2}`)}</p>
        <p>Each arrow adds one Legendre degree. The fourth adds ${math(T`s^3P_3(J(z))`)}. At degree three, multiplying the four-arrow Laurent sum by ${math('s^3')} gives this single displacement.</p>
      </div>
      <div class="lc-series-controls" hidden>
        <label>Arrows added <output>40 / 40</output><input type="range" min="1" max="40" value="40" step="1" aria-label="Number of generating-series arrows added"></label>
        <button type="button" class="lc-run">Replay additions</button>
      </div>
      <div class="lc-tip-plots">
        <figure><figcaption>Whole chain</figcaption><svg viewBox="0 0 320 166" role="img" aria-label="Head-to-tail overview and the zoom window"></svg></figure>
        <figure><figcaption>Tip close-up <span class="lc-mag"></span></figcaption><svg viewBox="0 0 320 166" role="img" aria-label="Magnified arrows at the tip"></svg></figure>
      </div>
      <p class="lc-tip-key"><span class="lc-ring-key">◎</span> Current tip <span class="lc-limit-key" hidden><b>◇</b> Infinite sum</span><span class="lc-scope"></span></p>
      <p class="lc-converge" hidden></p>`;
    const find = s => panel.querySelector(s);
    const tabs = [...panel.querySelectorAll('[data-series]')], [whole, zoom] = panel.querySelectorAll('svg');
    const range = find('input'), run = find('.lc-run'), output = find('output');
    let mode = 'packet', state, sequence, sequenceKey, timer;
    const stop = () => {
      clearInterval(timer); timer = undefined;
      run.textContent = +range.value === 40 ? 'Replay additions' : 'Play additions';
    };
    const setMode = next => {
      stop();
      mode = next;
      for (const tab of tabs) selectState(tab, tab.dataset.series === mode);
      for (const selector of ['.lc-series-intro', '.lc-series-controls', '.lc-limit-key', '.lc-converge']) find(selector).hidden = mode !== 'infinite';
      find('.lc-packet-note').hidden = mode !== 'packet';
      paint();
    };
    for (const tab of tabs) tab.addEventListener('click', () => setMode(tab.dataset.series));
    range.addEventListener('input', () => { stop(); paint(); });
    run.addEventListener('click', () => {
      if (timer) { stop(); return; }
      if (+range.value === 40) range.value = 1;
      paint();
      run.textContent = 'Pause additions';
      timer = setInterval(() => {
        if (!panel.isConnected || !panel.getClientRects().length || document.hidden) { stop(); return; }
        range.value = +range.value + 1;
        paint();
        if (+range.value === 40) stop();
      }, 260);
    });

    function paint() {
      if (!state) return;
      const { points, j, r, t } = state;
      const infinite = mode === 'infinite';
      let path = points, limit;
      if (infinite) {
        const key = r + '/' + t;
        if (key !== sequenceKey) {
          const g = M.generating(r, t, .9 / r, 39);
          const partial = [{re: 0, im: 0}];
          for (const step of g.summands) partial.push(M.add(partial[partial.length - 1], step));
          sequence = { points: partial, limit: g.exact };
          sequenceKey = key;
        }
        path = sequence.points;
        limit = sequence.limit;
      }
      const count = infinite ? +range.value : j == null ? path.length - 1 : j + 1;
      const first = Math.max(0, count - (infinite ? 6 : 2));
      const overview = viewport(limit ? [...path, limit] : path);
      const nearTip = path.slice(first, count + 1);
      if (limit) nearTip.push(limit);
      const close = viewport(nearTip);
      const colour = i => infinite ? ink[i % ink.length] : termColour(i);
      const tipColour = colour(count - 1);
      const shown = infinite ? count : path.length - 1;
      function draw(view, from, to, detail) {
        const project = view.project;
        const vertices = path.slice(from, to + 1).map(project);
        let content = '';
        if (!detail) {
          const origin = project(path[0]);
          content += `<path d="M0,${origin.y} H320 M${origin.x},0 V166" stroke="#61506f" stroke-width=".85"/>`;
          // The dashed rectangle shows the exact extent of the magnified viewport.
          const corner = project({re: close.cx - 160 / close.scale, im: close.cy + 83 / close.scale});
          const ratio = overview.scale / close.scale;
          content += `<rect x="${corner.x}" y="${corner.y}" width="${320 * ratio}" height="${166 * ratio}" fill="#ceb8ff" fill-opacity=".055" stroke="#ceace0" stroke-dasharray="3 3"/>`;
        }
        for (let i = from; i < to; i++) {
          const active = i === count - 1;
          content += `<g data-arrow="${i}" opacity="${detail || active || infinite ? 1 : .75}">${svgArrow(vertices[i-from], vertices[i-from+1], colour(i), active ? 3.1 : 2.3)}</g>`;
        }
        const start = vertices[0];
        content += `<circle cx="${start.x}" cy="${start.y}" r="2.5" fill="#fff8ff"/>`;
        content += endpoint(project(path[count]), tipColour);
        if (limit) {
          const b = project(limit);
          content += `<path d="M${b.x},${b.y-8} l8,8 -8,8 -8,-8 Z" stroke="#21132f" stroke-width="4.3" fill="none"/><path d="M${b.x},${b.y-8} l8,8 -8,8 -8,-8 Z" fill="none" stroke="${gold}" stroke-width="1.8"/>`;
        }
        return content;
      }
      whole.innerHTML = draw(overview, 0, shown, false);
      zoom.innerHTML = draw(close, first, count, true);
      find('.lc-mag').textContent = `×${fmt(close.scale / overview.scale)}`;
      find('.lc-scope').textContent = first + 1 === count ? `Arrow ${count} in close-up` : `Arrows ${first + 1}–${count} in close-up`;
      if (infinite) {
        output.textContent = `${count} / 40`;
        const gap = M.abs(M.sub(path[count], limit));
        find('.lc-converge').textContent = `s = ${fmt(.9 / r)}, sρ = 0.9. Distance from the current tip to the infinite sum ≈ ${fmt(gap)}.`;
      }
    }
    return { update(next) { state = next; paint(); }, showInfinite() {
      setMode('infinite');
      tabs[1].focus({preventScroll: true});
      panel.scrollIntoView({block: 'start'});
    } };
  }

  window.createLaurentCorrespondence = function (root, { M, onSelect, typeset }) {
    root.classList.add('laurent-correspondence');
    root.innerHTML = `
      <h3>Match a matrix entry to its arrow</h3>
      <p class="lc-intro">Select a coloured cell, a term in the expansion or an arrow. The same index ${math('j')} follows it through all three views.</p>
      <div class="lc-expansion" role="group" aria-label="Terms of the Laurent expansion"></div>
      <div class="lc-plots">
        <figure class="lc-card"><figcaption>Coefficient matrix <span>${math(T`A_{q,p}=\alpha_p\alpha_q`)}</span></figcaption>
          <div class="lc-columns">Column p →</div><div class="lc-matrix-scroll"><div class="lc-matrix" role="group" aria-label="Coefficient matrix by row q and column p"></div></div>
          <p class="lc-note" data-matrix-note></p>
        </figure>
        <figure class="lc-card"><figcaption>Head-to-tail sum <span>${math(T`\operatorname{Re} v,\ \operatorname{Im} v`)}</span></figcaption>
          <svg class="lc-chain" viewBox="0 0 340 222" role="group" aria-label="Select a vector in the complex output plane"></svg>
          <p class="lc-note"><span class="lc-gold-line"></span>Gold joins the origin to the final tip.</p>
        </figure>
      </div>
      <div class="lc-readout">
        <div><strong class="lc-selection" aria-live="polite" aria-atomic="true"></strong><div class="lc-detail-math"></div><p class="lc-values"></p></div>
        <div class="lc-direction"><svg viewBox="0 0 108 84" aria-hidden="true"></svg><span>Unit direction</span></div>
      </div><section class="lc-tip-view" aria-label="Arrow tip magnifier"></section>`;
    const find = q => root.querySelector(q);
    const expansion = find('.lc-expansion'), matrix = find('.lc-matrix'), chain = find('.lc-chain');
    const detail = find('.lc-detail-math'), selection = find('.lc-selection');
    const direction = find('.lc-direction'), values = find('.lc-values');
    const tipView = createTipView(find('.lc-tip-view'), M);
    const coreMath = [find('.lc-intro'), find('.lc-series-intro'), ...root.querySelectorAll('figcaption')];
    let degree = -1, selectedKey = '', previousGeometry = '', terms = [], points = [];
    let inRoot = false;

    function writeMath(el, html) {
      if (window.MathJax?.typesetClear) window.MathJax.typesetClear([el]);
      el.innerHTML = html;
    }

    function buildDegree(n) {
      const chips = terms.map(v =>
        `<button type="button" data-pick="${v.j}" style="--ink:${termColour(v.j)}" aria-label="Select term v ${v.j}, p ${v.p}, q ${v.q}, exponent ${v.k}">
          <span class="lc-index">${math(`v_{${v.j}}`)}</span>${math(monomial(v, n))}</button>`);
      writeMath(expansion, `<span class="lc-left">${math(`P_{${n}}(J(z))=`)}</span>${chips.join('<span class="lc-plus" aria-hidden="true">+</span>')}`);
      const cells = ['<span class="lc-axis">q ↑</span>'];
      for (let p = 0; p <= n; p++) cells.push(`<span class="lc-axis">${p}</span>`);
      for (let q = n; q >= 0; q--) {
        cells.push(`<span class="lc-axis">${q}</span>`);
        for (let p = 0; p <= n; p++) {
          if (p + q === n) {
            const v = terms[q];
            const weight = n <= 5 ? `<span class="lc-cell-weight">${math(weightTex(v.weight, n))}</span>` : '';
            cells.push(`<button type="button" data-pick="${q}" data-p="${p}" data-q="${q}" style="--ink:${termColour(q)}" aria-label="Select matrix entry row q ${q}, column p ${p}, vector v ${q}">${weight}<span class="lc-cell-index">${math(`v_{${q}}`)}</span></button>`);
          } else {
            const off = n <= 3 ? math(weightTex(M.alpha(p) * M.alpha(q), p + q)) : '·';
            cells.push(`<span class="lc-other" aria-hidden="true">${off}</span>`);
          }
        }
      }
      matrix.style.setProperty('--size', n + 1);
      matrix.classList.toggle('lc-dense', n > 5);
      writeMath(matrix, cells.join(''));
      const note = find('[data-matrix-note]');
      writeMath(note, math(`p+q=${n}`) + ' selects the coloured cells. Each tagged coefficient supplies the arrow with the same index.');
      return [expansion, matrix, note];
    }

    function drawChain(n, j, total) {
      const hasArrowFocus = chain.contains(document.activeElement) && document.activeElement.dataset.pick !== undefined;
      const real = points.map(v => v.re), imag = points.map(v => v.im);
      const loX = Math.min(...real), hiX = Math.max(...real);
      const loY = Math.min(...imag), hiY = Math.max(...imag);
      const extent = Math.max(hiX - loX, hiY - loY, 1e-10);
      const scale = Math.min(243 / Math.max(hiX - loX, .23 * extent), 158 / Math.max(hiY - loY, .23 * extent));
      const screen = v => ({ x: 147 + (v.re - (hiX + loX) / 2) * scale, y: 108 - (v.im - (hiY + loY) / 2) * scale });
      const pts = points.map(screen), o = pts[0], tip = pts[pts.length - 1];
      let drawing = `<path d="M12,${o.y} H321 M${o.x},12 V204" stroke="${axisInk}" stroke-width=".85" opacity=".62"/>
        <text x="323" y="${o.y + 5}">Re</text><text x="${o.x + 4}" y="12">Im</text>`;
      // Paint the resultant underneath the individual displacements on the same axes.
      drawing += `<g data-resultant="true" opacity="${total ? 1 : .84}"><title>Resultant from zero to the full sum</title>${svgArrow(o, tip, gold, total ? 2.7 : 1.6)}</g>`;
      for (const v of terms) {
        const a = pts[v.j], b = pts[v.j + 1], isActive = v.j === j, ink = termColour(v.j);
        drawing += `<g role="button" tabindex="0" data-pick="${v.j}" aria-pressed="${isActive}" aria-label="Select arrow v ${v.j}, from partial sum ${v.j} to ${v.j + 1}"><title>v${v.j} · (p,q) = (${v.p},${v.q})</title>
          <path d="M${a.x},${a.y} L${b.x},${b.y}" stroke="transparent" stroke-width="14" stroke-linecap="round" fill="none" pointer-events="stroke"/>
          <g opacity="${j == null || isActive ? 1 : .82}" pointer-events="none">${svgArrow(a, b, ink, isActive ? 4.1 : 2.9)}</g></g>`;
      }
      // Concentric marks identify the tail and head even for a sub-pixel displacement.
      if (j != null) {
        const a = pts[j], b = pts[j + 1], ink = termColour(j);
        drawing += `<g pointer-events="none" stroke="${ink}" fill="none"><circle cx="${a.x}" cy="${a.y}" r="5" stroke-dasharray="2 2"/><circle cx="${b.x}" cy="${b.y}" r="7" stroke-width="1.9"/></g>`;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        let labelY = Math.max(22, Math.min(188, my - 18));
        if (Math.abs(labelY - o.y) < 13) labelY += labelY < 110 ? 21 : -21;
        drawing += `<g pointer-events="none"><path d="M${mx},${my} L279,${labelY} H290" stroke="${ink}" stroke-width="1" stroke-dasharray="3 3" fill="none"/><rect x="290" y="${labelY - 11}" width="34" height="22" rx="6" fill="#23182e" stroke="${ink}"/><text x="307" y="${labelY + 4}" text-anchor="middle" style="fill:${ink}">v${subscript(j)}</text></g>`;
      }
      drawing += `<circle cx="${o.x}" cy="${o.y}" r="2.7" fill="#fff8ff" pointer-events="none"/>${endpoint(tip, total ? gold : termColour(n))}`;
      chain.innerHTML = drawing;
      if (hasArrowFocus && j != null) chain.querySelector(`[data-pick="${j}"]`)?.focus({ preventScroll: true });
    }

    function render({ n, j, r, t, total = false }) {
      const geometry = `${n}:${r}:${t}`;
      const key = `${n}:${j}:${total}`;
      if (geometry === previousGeometry && selectedKey === key) return;
      const dirty = [];
      if (!inRoot) { dirty.push(...coreMath); inRoot = true; }
      if (geometry !== previousGeometry) {
        terms = M.terms(n, r, t);
        points = [{ re: 0, im: 0 }];
        for (const v of terms) points.push(M.add(points[points.length - 1], v.value));
      }
      if (degree !== n) { dirty.push(...buildDegree(n)); degree = n; }
      const v = j == null ? null : terms[j];
      if (selectedKey !== key) {
        for (const b of root.querySelectorAll('button[data-pick]')) selectState(b, Number(b.dataset.pick) === j);
        const ink = v ? termColour(j) : gold;
        root.style.setProperty('--lc-active', ink);
        selection.textContent = v ? `Column p = ${v.p}, row q = ${v.q}  ·  Arrow v${subscript(j)}` : total ? 'The gold resultant' : 'The whole diagonal';
        const product = v ? `A_{${v.q},${v.p}}=\\alpha_{${v.p}}\\alpha_{${v.q}}=${weightTex(v.weight, n)}` : '';
        const expression = v ? `v_{${j}}=[s^{${n}}]\\!\\left(A_{${v.q},${v.p}}s^{${n}}z^{${v.k}}\\right)=${monomial(v, n)}` : `P_{${n}}(J(z))=\\sum_{j=0}^{${n}}v_j`;
        const exponent = v ? `<span>${math(`k=p-q=${v.p}-${v.q}=${v.k}`)}</span>` : '';
        writeMath(detail, (product ? `<span>${math(product)}</span>` : '') + exponent + `<span>${math(expression)}</span>`);
        dirty.push(detail);
        direction.hidden = !v;
      }
      drawChain(n, j, total);
      tipView.update({ points, j, r, t });
      if (v) {
        const phi = v.k * t;
        const a = {x:54, y:42}, b = {x:54 + 33 * Math.cos(phi), y:42 - 33 * Math.sin(phi)};
        direction.querySelector('svg').innerHTML = `<path d="M10,42 H98 M54,4 V80" stroke="${axisInk}" opacity=".5"/>` + svgArrow(a, b, termColour(j), 3.6) + '<circle cx="54" cy="42" r="2.6" fill="#fff8ff"/>';
        values.textContent = `Length ${fmt(v.weight * v.radial)} · angle ${fmt(phi * 180 / Math.PI)}° · displacement ${signedComplex(v.value)}`;
      } else {
        values.textContent = total ? `From 0 to ${signedComplex(points[n + 1])} in the output plane.` : 'Each coloured cell supplies one displacement. Adding them head to tail gives the gold arrow.';
      }
      root.dataset.degree = String(n);
      root.dataset.selected = v ? String(j) : total ? 'sum' : 'all';
      previousGeometry = geometry;
      selectedKey = key;
      if (dirty.length) typeset(dirty);
    }

    function pick(e) {
      const el = e.target.closest('[data-pick]');
      if (!el || !root.contains(el)) return;
      if (e.type === 'keydown' && (el.tagName.toLowerCase() === 'button' || !['Enter', ' '].includes(e.key))) return;
      if (e.type === 'keydown') e.preventDefault();
      onSelect(Number(el.dataset.pick));
    }
    root.addEventListener('click', pick);
    root.addEventListener('keydown', pick);
    return { render, termColour, showInfinite: tipView.showInfinite };
  };
})();
