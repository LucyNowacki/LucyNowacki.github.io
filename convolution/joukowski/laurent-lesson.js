/* Guided view of legEDMD:subsec-joukowski-legendre-laurent only.
 * Source: convergence_legendre_EDMD.tex, lemma-1-1 and its proof.
 * A is identically 1 here. Numerical checks are floating-point diagnostics.
 */
(() => {
  'use strict';
  const T = String.raw;
  const tex = value => T`\(${value}\)`;
  const display = value => T`\[${value}\]`;
  const fmt = (x, digits = 6) => Math.abs(x) < 1e-12 ? '0' : Number(x.toPrecision(digits)).toString();
  const signed = x => x > 0 ? `+${x}` : String(x);
  const complex = z => `${fmt(z.re)} ${z.im < -1e-12 ? '−' : '+'} ${fmt(Math.abs(z.im))}i`;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const fraction = (weight, n) => {
    const den = 4 ** n, num = Math.round(weight * den), g = gcd(num, den);
    return den / g === 1 ? String(num / g) : T`\frac{${num / g}}{${den / g}}`;
  };
  const colour = m => m > 0 ? 'var(--positive)' : m < 0 ? 'var(--negative)' : 'var(--degree)';
  const text = (x, y, label, extra = '') => `<text x="${x}" y="${y}" ${extra}>${label}</text>`;
  const line = (x, y, xx, yy, extra = '') => `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" ${extra}/>`;
  const dot = (x, y, radius, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" ${extra}/>`;

  window.createLaurentLesson = function createLaurentLesson({ host, M, typeset, onChange }) {
    if (!host || !M) throw new Error('The Laurent lesson needs its host and mathematics engine.');
    let activeStep = 0, lastState = null, mathKey = '', optionDegree = -1, swapped = false, resizeFrame = 0;
    let destroyed = false;
    const $ = id => host.querySelector(`#${id}`);
    const handlers = [];
    const listen = (el, event, handler) => { el.addEventListener(event, handler); handlers.push([el, event, handler]); };
    const labels = ['Circle to ellipse', 'Extract one degree', 'Read the finite packet', 'Swap the preimages'];

    host.innerHTML = `
      <nav class="ll-nav" aria-label="Steps in the Laurent expansion">
        ${labels.map((label, i) => `<button type="button" id="ll-step-button-${i}" data-ll-step="${i}" aria-controls="ll-step-${i}" aria-pressed="${i === 0}"><span class="ll-step-number">${i + 1}</span> ${label}</button>`).join('')}
      </nav>
      <div class="ll-toolbar">
        <label for="ll-term-select">Inspect term ${tex(T`j`)} <select id="ll-term-select"></select></label>
        <div class="ll-presets" aria-label="Example degrees">
          <span>Try a degree</span>
          <button type="button" data-ll-degree="0">0</button><button type="button" data-ll-degree="2">2</button><button type="button" data-ll-degree="3">3</button><button type="button" data-ll-degree="6">6</button>
        </div>
      </div>

      <section class="ll-step card" id="ll-step-0" aria-labelledby="ll-heading-0">
        <h3 id="ll-heading-0">1. Two circle points, one ellipse point</h3>
        <p>Move the angle: the segment joining the outer point to its reciprocal has a midpoint on the ellipse. That midpoint is the input at which the Legendre polynomial is evaluated.</p>
        <div class="ll-two">
          <figure class="ll-figure"><svg id="ll-circle-plot" role="img" aria-labelledby="ll-circle-title"></svg><figcaption>${tex(T`z=\varrho e^{it},\qquad z^{-1}=\varrho^{-1}e^{-it}`)}</figcaption></figure>
          <figure class="ll-figure"><svg id="ll-ellipse-plot" role="img" aria-labelledby="ll-ellipse-title"></svg><figcaption>${tex(T`\omega=\mathit{Jouk}(z)=\mathit{Jouk}(z^{-1})=\tfrac12(z+z^{-1})`)}</figcaption></figure>
        </div>
        <div class="legend"><span class="positive-key">Outer point</span><span class="negative-key">Reciprocal point</span><span class="selected-key">Their midpoint / ellipse input</span></div>
        <p class="numeric" id="ll-map-value"></p>
        <p class="hint" id="ll-map-note"></p>
        <details class="ll-proof"><summary>Why the circle becomes this ellipse</summary>
          <div class="math-block">${display(T`\mathit{Jouk}(\varrho e^{it})=\frac{\varrho+\varrho^{-1}}2\cos t+i\frac{\varrho-\varrho^{-1}}2\sin t`)}</div>
          <p>Both axes use the same scale. For ${tex(T`\varrho>1`)}, the two coefficients above are the semiaxes of the Bernstein ellipse. At ${tex(T`\varrho=1`)}, the image is the limiting segment ${tex(T`[-1,1]`)}. The identity ${tex(T`\mathit{Jouk}(z)=\mathit{Jouk}(z^{-1})`)} holds for every ${tex(T`z\ne0`)}. At ${tex(T`\omega=\pm1`)}, the two preimages coincide.</p>
        </details>
      </section>

      <section class="ll-step card" id="ll-step-1" aria-labelledby="ll-heading-1" hidden>
        <h3 id="ll-heading-1">2. A diagonal selects the generating degree</h3>
        <p>Multiplication adds the powers of ${tex(T`s`)} and subtracts the powers of ${tex(T`z`)}. Follow the highlighted diagonal to collect exactly one Legendre degree.</p>
        <div class="math-block ll-formula">${display(T`1-2\mathit{Jouk}(z)s+s^2=(1-sz)(1-sz^{-1})`)}</div>
        <div class="ll-two">
          <figure class="ll-figure"><svg id="ll-lattice-plot" role="img" aria-labelledby="ll-lattice-title"></svg><figcaption>Solid diagonal: fixed degree. Dashed line: selected frequency.</figcaption></figure>
          <div>
            <div class="math-block ll-formula">${display(T`\begin{aligned}(1-sz)^{-1/2}&=\sum_{p\ge0}\alpha_p s^p z^p,\\(1-sz^{-1})^{-1/2}&=\sum_{q\ge0}\alpha_q s^q z^{-q}.\end{aligned}`)}</div>
            <div class="math-block ll-formula" id="ll-selected-factor"></div>
            <p class="hint">We label the diagonal by ${tex(T`q=j`)} and ${tex(T`p=n-j`)}, so its frequency is ${tex(T`m=p-q=n-2j`)}. The thesis arrives at this ordering by reindexing its first coefficient sum.</p>
          </div>
        </div>
        <div class="math-block ll-formula" id="ll-extraction"></div>
        <details class="ll-proof"><summary>Convergence and the square-root branches in this derivation</summary>
          <p>Fix ${tex(T`z\ne0`)} and choose ${tex(T`|s|<\min\{|z|,|z|^{-1}\}`)}. Both binomial series then converge absolutely. Every square-root branch is analytic near ${tex(T`s=0`)} and equals ${tex(T`1`)} there.</p>
          <div class="math-block">${display(T`\begin{aligned}\sum_{n\ge0}P_n(\mathit{Jouk}(z))s^n&=(1-sz)^{-1/2}(1-sz^{-1})^{-1/2}\\&=\sum_{p,q\ge0}\alpha_p\alpha_q s^{p+q}z^{p-q}.\end{aligned}`)}</div>
          <p>Compare the coefficients of ${tex(T`s^n`)}. Only the ${tex(T`n+1`)} pairs with ${tex(T`p+q=n`)} contribute. The resulting Laurent identity is finite and valid for every ${tex(T`z\ne0`)}, so this restriction on ${tex(T`s`)} belongs to the derivation.</p>
        </details>
      </section>

      <section class="ll-step card" id="ll-step-2" aria-labelledby="ll-heading-2" hidden>
        <h3 id="ll-heading-2">3. One polynomial becomes a finite packet</h3>
        <p>The bar heights are the positive, symmetric structural weights. The radius and angle then turn each weight into a complex contribution.</p>
        <div class="ll-two">
          <figure class="ll-figure"><svg id="ll-weights-plot" role="img" aria-labelledby="ll-weights-title"></svg><figcaption id="ll-support-note"></figcaption></figure>
          <figure class="ll-figure"><svg id="ll-vectors-plot" role="img" aria-labelledby="ll-vectors-title"></svg><figcaption>Complex output plane: add the contributions head to tail. Gold selects one term; purple marks their total.</figcaption></figure>
        </div>
        <div class="ll-support" id="ll-support-controls" aria-label="Select a Laurent frequency"></div>
        <div class="math-block ll-formula">${display(T`\alpha_\ell=\binom{2\ell}{\ell}4^{-\ell},\qquad \alpha_{n,j}=\alpha_j\alpha_{n-j}=\alpha_{n,n-j}>0`)}</div>
        <div class="math-block ll-formula" id="ll-full-packet"></div>
        <div class="math-block ll-formula" id="ll-fourier-term"></div>
        <p class="numeric" id="ll-term-value"></p>
        <div class="ll-metrics">
          <div><span>Finite Laurent sum</span><strong class="numeric" id="ll-packet-value"></strong></div>
          <div><span>Independent Legendre recurrence</span><strong class="numeric" id="ll-recurrence-value"></strong></div>
        </div>
        <p class="check-note" id="ll-recurrence-note"></p>
        <details class="ll-proof"><summary>What the support tells us</summary>
          <div class="math-block">${display(T`P_n(\Gamma_\varrho(t))=\sum_{j=0}^n\alpha_{n,j}\varrho^{\,n-2j}e^{i(n-2j)t}`)}</div>
          <p>There are exactly ${tex(T`n+1`)} frequencies, all with the parity of ${tex(T`n`)}. An even degree has a single zero-frequency term. The sum is finite, so there is no boundary-convergence issue. Positivity refers to the weights, not the complex values of the terms. This basis-side parity alone asserts no parity blocks for a transfer matrix.</p>
        </details>
      </section>

      <section class="ll-step card" id="ll-step-3" aria-labelledby="ll-heading-3" hidden>
        <h3 id="ll-heading-3">4. Swap the preimage and reverse the packet</h3>
        <p>The same index can have a different radial contribution at the other preimage. The partner index supplies exactly the missing contribution, leaving the complete sum unchanged.</p>
        <div class="ll-toolbar"><button type="button" id="ll-swap" aria-pressed="false">Use reciprocal preimage</button><span class="ll-status" id="ll-active-preimage" aria-live="polite"></span></div>
        <figure class="ll-figure"><svg id="ll-reciprocal-plot" role="img" aria-labelledby="ll-reciprocal-title"></svg><figcaption>Two magnitudes at each bookkeeping index; a gold outline marks the inspected term.</figcaption></figure>
        <div class="legend"><span class="positive-key">At the outer preimage</span><span class="negative-key">At its reciprocal</span></div>
        <div class="math-block ll-formula" id="ll-reversal"></div>
        <p class="numeric" id="ll-radial-values"></p>
        <p class="hint" id="ll-reversal-note"></p>
        <div class="ll-metrics">
          <div><span>Sum at outer preimage</span><strong class="numeric" id="ll-outer-total"></strong></div>
          <div><span>Sum at reciprocal preimage</span><strong class="numeric" id="ll-inner-total"></strong></div>
        </div>
        <p class="check-note" id="ll-reversal-check"></p>
        <details class="ll-proof"><summary>The finite reindexing that proves equality</summary>
          <div class="math-block">${display(T`\begin{aligned}\sum_{j=0}^n\alpha_{n,j}(z^{-1})^{n-2j}&=\sum_{j=0}^n\alpha_{n,j}z^{2j-n}\\&=\sum_{j=0}^n\alpha_{n,j}z^{n-2j}=P_n(\mathit{Jouk}(z)).\end{aligned}`)}</div>
          <p>The second equality reindexes ${tex(T`j\mapsto n-j`)} and uses ${tex(T`\alpha_{n,j}=\alpha_{n,n-j}`)}. This applies for every ${tex(T`z\ne0`)}. When ${tex(T`n`)} is even, ${tex(T`j=n/2`)} is its own partner and is counted once.</p>
        </details>
      </section>
      <div class="ll-toolbar ll-footer-nav"><button type="button" id="ll-previous">Previous step</button><span id="ll-progress" aria-live="polite">Step 1 of 4</span><button type="button" id="ll-next">Next step</button></div>
    `;

    function putMath(id, value) {
      const el = $(id);
      if (window.MathJax?.typesetClear) window.MathJax.typesetClear([el]);
      el.innerHTML = display(value);
    }

    function putComplex(id, value) {
      const el = $(id);
      el.textContent = complex(value);
      el.dataset.real = String(value.re);
      el.dataset.imaginary = String(value.im);
    }

    function setSVG(id, width, height, title, body) {
      const svg = $(id), titleId = id.replace('-plot', '-title');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.innerHTML = `<title id="${titleId}">${title}</title>${body}`;
    }
    function widthOf(id, fallback = 420) {
      return Math.max(220, Math.round($(id).parentElement.getBoundingClientRect().width || fallback));
    }
    function plane(width, height, bound, tickSize = 1) {
      const cx = width / 2, cy = height / 2 + 5;
      const scale = Math.min(width - 78, height - 82) / (2 * bound);
      const X = x => cx + x * scale, Y = y => cy - y * scale;
      let base = line(20, cy, width - 15, cy, 'class="axis"') + line(cx, height - 28, cx, 26, 'class="axis"');
      base += text(width - 15, cy - 8, 'Re', 'text-anchor="end"') + text(cx + 8, 27, 'Im');
      for (const tick of [-tickSize, tickSize]) {
        if (Math.abs(tick) <= bound) base += line(X(tick), cy - 3, X(tick), cy + 3, 'class="axis"') + text(X(tick), cy + 18, fmt(tick, 3), 'text-anchor="middle"');
      }
      return { X, Y, scale, base };
    }

    function mapping(S) {
      const width = Math.min(widthOf('ll-circle-plot'), widthOf('ll-ellipse-plot'));
      const height = Math.max(245, Math.min(330, width));
      const P = plane(width, height, S.r * 1.14);
      const z = M.polar(S.r, S.t), inverse = M.polar(1 / S.r, -S.t), w = M.joukowski(S.r, S.t);
      let circle = P.base;
      circle += `<circle cx="${P.X(0)}" cy="${P.Y(0)}" r="${S.r * P.scale}" fill="none" stroke="var(--positive)" stroke-width="2"/>`;
      circle += `<circle cx="${P.X(0)}" cy="${P.Y(0)}" r="${P.scale / S.r}" fill="none" stroke="var(--negative)" stroke-width="2" stroke-dasharray="4 4"/>`;
      circle += line(P.X(z.re), P.Y(z.im), P.X(inverse.re), P.Y(inverse.im), 'stroke="var(--muted)" stroke-width="2" stroke-dasharray="5 4"');
      circle += line(P.X(0), P.Y(0), P.X(z.re), P.Y(z.im), 'stroke="var(--positive)" stroke-opacity=".5"');
      circle += dot(P.X(z.re), P.Y(z.im), 6, 'var(--positive)');
      circle += dot(P.X(inverse.re), P.Y(inverse.im), 5, 'var(--negative)');
      circle += dot(P.X(w.re), P.Y(w.im), 4, 'var(--gold)', 'stroke="var(--panel)" stroke-width="1.5"');
      circle += text(width / 2, 16, 'Circle variable z', 'text-anchor="middle" class="plot-label"');
      circle += text(width / 2, height - 7, `Radii ${fmt(S.r, 4)} and ${fmt(1 / S.r, 4)}`, 'text-anchor="middle"');
      setSVG('ll-circle-plot', width, height, `Two reciprocal points on circles of radii ${S.r} and ${1 / S.r}; their midpoint is Jouk(z).`, circle);
      let ellipse = P.base;
      if (S.r === 1) ellipse += line(P.X(-1), P.Y(0), P.X(1), P.Y(0), 'stroke="var(--degree)" stroke-width="4"');
      else ellipse += `<ellipse cx="${P.X(0)}" cy="${P.Y(0)}" rx="${(S.r + 1 / S.r) * P.scale / 2}" ry="${(S.r - 1 / S.r) * P.scale / 2}" fill="none" stroke="var(--degree)" stroke-width="2"/>`;
      ellipse += dot(P.X(w.re), P.Y(w.im), 6, 'var(--gold)');
      ellipse += text(width / 2, 16, 'Ellipse input ω', 'text-anchor="middle" class="plot-label"');
      ellipse += text(width / 2, height - 7, 'Same coordinate scale in both planes', 'text-anchor="middle"');
      setSVG('ll-ellipse-plot', width, height, `The common image is ${complex(w)} on the ellipse. Both planes use equal coordinate scales.`, ellipse);
      $('ll-map-value').textContent = `z = ${complex(z)} · reciprocal = ${complex(inverse)} · ω = ${complex(w)}`;
      $('ll-map-note').textContent = S.r === 1
        ? 'Radius one is the degenerate boundary case: the ellipse collapses to the segment [−1, 1].'
        : `Ellipse semiaxes: ${fmt((S.r + 1 / S.r) / 2)} and ${fmt((S.r - 1 / S.r) / 2)}. The gold point is ω, the input to Pₙ.`;
    }

    function lattice(S) {
      const width = widthOf('ll-lattice-plot'), height = Math.min(365, Math.max(270, width * .8));
      const count = Math.max(3, S.n), size = Math.min(width - 78, height - 75), dx = size / count;
      const X = p => (width - size) / 2 + p * dx, Y = q => height - 42 - q * dx;
      const p = S.n - S.j, q = S.j, m = p - q;
      let body = '';
      for (let a = 0; a <= count; a++) {
        body += line(X(a), Y(0), X(a), Y(count), 'class="grid"') + line(X(0), Y(a), X(count), Y(a), 'class="grid"');
        if (count <= 8 || a % 2 === 0) body += text(X(a), Y(0) + 20, a, 'text-anchor="middle"') + text(X(0) - 10, Y(a) + 4, a, 'text-anchor="end"');
      }
      const p0 = Math.max(m, 0), q0 = Math.max(-m, 0), span = count - Math.abs(m);
      body += line(X(p0), Y(q0), X(p0 + span), Y(q0 + span), 'stroke="var(--pair)" stroke-width="2" stroke-dasharray="5 4"');
      body += line(X(0), Y(S.n), X(S.n), Y(0), 'stroke="var(--degree)" stroke-width="3"');
      for (let a = 0; a <= count; a++) for (let b = 0; b <= count; b++) {
        body += dot(X(a), Y(b), a + b === S.n ? 4.5 : 2, a + b === S.n ? 'var(--degree)' : 'var(--line)');
      }
      body += dot(X(p), Y(q), 8, 'none', 'stroke="var(--gold)" stroke-width="2.5"');
      body += text(X(count) + 13, Y(0) + 4, 'p') + text(X(0) - 4, Y(count) - 13, 'q');
      body += text(width / 2, 17, `p + q = ${S.n} · p − q = ${signed(m)}`, 'text-anchor="middle" class="plot-label"');
      setSVG('ll-lattice-plot', width, height, `Degree ${S.n} selects the diagonal p plus q equals ${S.n}. Selected pair p ${p}, q ${q} has frequency ${m}.`, body);
    }

    function packetBars(S, terms) {
      const width = widthOf('ll-weights-plot', 760), height = 220, base = 168, left = 34, right = width - 22;
      const n = Math.max(1, S.n), X = m => left + (m + n + .5) / (2 * n + 1) * (right - left);
      const maximum = Math.max(...terms.map(v => v.weight)), Y = value => base - value / maximum * 112;
      let body = line(left, base, right, base, 'class="axis"');
      body += text(left, 19, 'Structural weight', 'class="plot-label"');
      body += text(right, height - 7, 'Frequency m', 'text-anchor="end"');
      for (let m = -S.n; m <= S.n; m++) body += line(X(m), base, X(m), base + 4, 'class="axis"');
      for (const v of terms) {
        const x = X(v.k), y = Y(v.weight), selected = v.j === S.j;
        body += line(x, base, x, y, `stroke="${colour(v.k)}" stroke-width="${Math.max(5, Math.min(17, (right - left) / (2 * n + 1) * .7))}"`);
        body += dot(x, y, 4, colour(v.k));
        if (selected) body += dot(x, y, 9, 'none', 'stroke="var(--gold)" stroke-width="2"');
        body += text(x, base + 22, signed(v.k), 'text-anchor="middle"');
        if (S.n <= 4 || selected) body += text(x, y - 15, fmt(v.weight, 4), 'text-anchor="middle" class="value-label"');
      }
      setSVG('ll-weights-plot', width, height, `${S.n + 1} positive weights, symmetric about frequency zero, supported on ${terms.map(v => v.k).join(', ')}.`, body);
      $('ll-support-note').textContent = `${S.n + 1} terms · ${S.n % 2 ? 'odd' : 'even'} frequencies · ${S.n % 2 ? 'no zero-frequency term' : 'zero frequency appears once'}. Bar heights stay fixed as the radius and angle change.`;
    }

    function vectorSum(S, terms) {
      const width = widthOf('ll-vectors-plot'), height = 270;
      // The triangle inequality bounds every intermediate head-to-tail sum.
      // This scale depends on n and radius, never on the moving angle.
      const radialSum = terms.reduce((total, v) => total + v.weight * v.radial, 0);
      const P = plane(width, height, radialSum * 1.15, radialSum / 2);
      let body = P.base + text(width / 2, 16, 'Complex output: finite sum', 'text-anchor="middle" class="plot-label"');
      let accumulated = { re: 0, im: 0 };
      for (const v of terms) {
        const next = M.add(accumulated, v.value), color = v.j === S.j ? 'var(--gold)' : colour(v.k);
        const x = P.X(accumulated.re), y = P.Y(accumulated.im), xx = P.X(next.re), yy = P.Y(next.im);
        const length = Math.hypot(xx - x, yy - y), stroke = v.j === S.j ? 3 : 1.8;
        if (length < 1) body += dot(xx, yy, v.j === S.j ? 3 : 1.5, color);
        else {
          const dx = (xx - x) / length, dy = (yy - y) / length, size = Math.min(7, length * .45);
          body += line(x, y, xx, yy, `stroke="${color}" stroke-width="${stroke}"`);
          body += `<path d="M${xx},${yy} L${xx - size * dx + size * .45 * dy},${yy - size * dy - size * .45 * dx} L${xx - size * dx - size * .45 * dy},${yy - size * dy + size * .45 * dx} Z" fill="${color}"/>`;
        }
        accumulated = next;
      }
      const total = M.packet(S.n, S.r, S.t);
      body += dot(P.X(0), P.Y(0), 3, 'var(--muted)');
      body += dot(P.X(total.re), P.Y(total.im), 6, 'var(--degree)', 'stroke="var(--panel)" stroke-width="1.5"');
      body += text(width / 2, height - 7, S.n === 0 ? 'One constant term, one endpoint' : 'Axes fixed while the angle moves', 'text-anchor="middle"');
      setSVG('ll-vectors-plot', width, height, `Head-to-tail sum of ${S.n + 1} complex contributions. Selected term j ${S.j} is gold; total ${complex(total)} is purple. Both axes have equal scale.`, body);
      $('ll-vectors-plot').dataset.bound = String(radialSum * 1.15);
    }

    function reciprocal(S, terms) {
      // M.terms deliberately accepts outer radii only. Evaluate the reciprocal
      // directly, with (1/r)^m and angle -t, instead of passing it to M.terms.
      const inverse = terms.map(v => M.scale(M.polar(S.r ** (-v.k), -v.k * S.t), v.weight));
      const outerSum = M.packet(S.n, S.r, S.t);
      const innerSum = inverse.reduce((sum, v) => M.add(sum, v), { re: 0, im: 0 });
      const width = widthOf('ll-reciprocal-plot', 760), height = 232, base = 178, left = 35, right = width - 22;
      const gap = (right - left) / terms.length, X = j => left + (j + .5) * gap;
      const maximum = Math.max(...terms.map(v => v.weight * Math.max(v.radial, 1 / v.radial)));
      const Y = x => base - 118 * x / maximum, thick = Math.min(12, gap * .25);
      let body = line(left, base, right, base, 'class="axis"');
      body += text(left, 18, 'Magnitude of each contribution', 'class="plot-label"');
      for (const v of terms) {
        const x = X(v.j), yOuter = Y(v.weight * v.radial), yInner = Y(v.weight / v.radial);
        body += line(x - thick * .65, base, x - thick * .65, yOuter, `stroke="var(--positive)" stroke-width="${thick}" stroke-opacity="${swapped ? '.45' : '1'}"`);
        body += line(x + thick * .65, base, x + thick * .65, yInner, `stroke="var(--negative)" stroke-width="${thick}" stroke-opacity="${swapped ? '1' : '.45'}"`);
        if (v.j === S.j) body += `<rect x="${x - thick * 1.3}" y="${Math.min(yOuter, yInner) - 6}" width="${thick * 2.6}" height="${base - Math.min(yOuter, yInner) + 8}" rx="3" fill="none" stroke="var(--gold)" stroke-width="2"/>`;
        body += text(x, base + 21, v.j, 'text-anchor="middle"');
      }
      body += text(right, height - 8, 'Bookkeeping index j', 'text-anchor="end"');
      setSVG('ll-reciprocal-plot', width, height, `At each index j, compare outer and reciprocal contribution magnitudes. The sequences reverse under j to ${S.n} minus j.`, body);
      const selected = terms[S.j], partner = terms[S.n - S.j];
      $('ll-active-preimage').textContent = swapped ? 'Active preimage: reciprocal (inside the unit circle)' : 'Active preimage: outer point';
      if (S.r === 1) $('ll-active-preimage').textContent = swapped ? 'Active preimage: reciprocal on the unit circle' : 'Active preimage: z on the unit circle';
      $('ll-swap').textContent = swapped ? 'Use outer preimage' : 'Use reciprocal preimage';
      $('ll-swap').setAttribute('aria-pressed', String(swapped));
      const value = swapped ? inverse[S.j] : selected.value;
      $('ll-radial-values').textContent = `At j = ${S.j}: outer magnitude ${fmt(selected.weight * selected.radial)}, reciprocal magnitude ${fmt(selected.weight / selected.radial)}. Active contribution = ${complex(value)}. Partner index = ${partner.j}.`;
      $('ll-reversal-note').textContent = selected.k === 0
        ? 'This is the zero-frequency term: its partner is itself. Its value stays fixed and it is counted once.'
        : S.r === 1
          ? 'At radius one, both radial magnitudes agree. The phases reverse, and the partner index restores the same contribution.'
          : 'These radial magnitudes differ at the same index. Reversing the index matches the entire complex contribution, including its phase.';
      putComplex('ll-outer-total', outerSum);
      putComplex('ll-inner-total', innerSum);
      $('ll-reversal-check').dataset.residual = String(M.abs(M.sub(outerSum, innerSum)));
      $('ll-reversal-check').textContent = `Floating-point difference between totals: ${M.abs(M.sub(outerSum, innerSum)).toExponential(2)}. Equality follows from the finite reindexing below.`;
    }

    function structuralMath(S, terms) {
      const term = terms[S.j], m = term.k, weight = fraction(term.weight, S.n);
      if (activeStep === 1) {
        putMath('ll-selected-factor', T`\begin{aligned}(p,q)&=(${term.p},${term.q}),\\p+q&=${S.n},\qquad m=p-q=${m},\\(\alpha_{${term.p}}s^{${term.p}}z^{${term.p}})(\alpha_{${term.q}}s^{${term.q}}z^{${-term.q}})&=${weight}s^{${S.n}}z^{${m}}.\end{aligned}`);
        putMath('ll-extraction', T`[s^{${S.n}}]\,(1-sz)^{-1/2}(1-sz^{-1})^{-1/2}=\sum_{j=0}^{${S.n}}\alpha_j\alpha_{${S.n}-j}z^{${S.n}-2j}=P_{${S.n}}(\mathit{Jouk}(z)).`);
      }
      if (activeStep === 2) {
        const parts = terms.map(v => {
          const f = fraction(v.weight, S.n);
          return v.k === 0 ? f : `${f === '1' ? '' : f}${v.k === 1 ? 'z' : T`z^{${v.k}}`}`;
        });
        const rows = [];
        for (let i = 0; i < parts.length; i += 3) rows.push(`${i === 0 ? T`P_{${S.n}}(\mathit{Jouk}(z))&=` : '&{}+'}${parts.slice(i, i + 3).join('+')}`);
        putMath('ll-full-packet', T`\begin{aligned}${rows.join(T`\\`)}\end{aligned}`);
        putMath('ll-fourier-term', T`\underbrace{\alpha_{${S.n},${S.j}}z^{${m}}}_{\text{selected term}}=\underbrace{${weight}\varrho^{${m}}}_{\text{radius-scaled coefficient}}\underbrace{e^{i(${m})t}}_{\text{phase}},\qquad z=\varrho e^{it}.`);
      }
      if (activeStep === 3) {
        putMath('ll-reversal', T`\begin{aligned}j=${S.j}&\longleftrightarrow n-j=${S.n - S.j},\\\alpha_{${S.n},${S.j}}(z^{-1})^{${m}}&=\alpha_{${S.n},${S.n - S.j}}z^{${-m}}.\end{aligned}`);
      }
      typeset([$(`ll-step-${activeStep}`)]);
    }

    function render(S, structural = false) {
      if (destroyed) return;
      // The lemma uses the ordinary Legendre mode. Other workspace views may
      // vary A, but this view intentionally does not inherit that scale.
      lastState = { n: S.n, j: S.j, r: S.r, t: S.t };
      Object.assign(host.dataset, {
        degree: String(S.n), termIndex: String(S.j), frequency: String(S.n - 2 * S.j),
        radius: String(S.r), angle: String(S.t), preimage: swapped ? 'reciprocal' : 'outer'
      });
      const terms = M.terms(S.n, S.r, S.t);
      if (optionDegree !== S.n) {
        $('ll-term-select').innerHTML = terms.map(v => `<option value="${v.j}">j = ${v.j} · m = ${signed(v.k)}</option>`).join('');
        $('ll-support-controls').innerHTML = terms.map(v => `<button class="ll-term-chip" type="button" data-ll-j="${v.j}" aria-label="Inspect j ${v.j}, frequency ${v.k}">m = ${signed(v.k)}</button>`).join('');
        optionDegree = S.n;
      }
      $('ll-term-select').value = String(S.j);
      host.querySelectorAll('[data-ll-degree]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.llDegree) === S.n)));
      host.querySelectorAll('[data-ll-j]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.llJ) === S.j)));
      const nextKey = `${activeStep}:${S.n}:${S.j}`;
      if (nextKey !== mathKey) { structuralMath(S, terms); mathKey = nextKey; }
      if (activeStep === 0) mapping(S);
      else if (activeStep === 1) lattice(S);
      else if (activeStep === 2) {
        packetBars(S, terms);
        vectorSum(S, terms);
        const packet = M.packet(S.n, S.r, S.t), recurrence = M.legendre(S.n, M.joukowski(S.r, S.t));
        const selected = terms[S.j];
        $('ll-term-value').textContent = `Selected term: ${complex(selected.value)} · radial multiplier: ${fmt(selected.radial)} · phase angle: ${fmt(selected.k * S.t * 180 / Math.PI, 5)}°.`;
        putComplex('ll-packet-value', packet);
        putComplex('ll-recurrence-value', recurrence);
        $('ll-recurrence-note').dataset.residual = String(M.abs(M.sub(packet, recurrence)));
        $('ll-recurrence-note').textContent = `Floating-point residual: ${M.abs(M.sub(packet, recurrence)).toExponential(2)}. This compares two numerical evaluations of the exact finite identity.`;
      } else reciprocal(S, terms);
    }

    function setStep(step) {
      activeStep = Math.max(0, Math.min(3, step));
      host.dataset.step = String(activeStep + 1);
      for (let i = 0; i < 4; i++) {
        $(`ll-step-${i}`).hidden = i !== activeStep;
        $(`ll-step-button-${i}`).setAttribute('aria-pressed', String(i === activeStep));
      }
      $('ll-previous').disabled = activeStep === 0;
      $('ll-next').disabled = activeStep === 3;
      $('ll-progress').textContent = `Step ${activeStep + 1} of 4`;
      if (lastState) render(lastState, true);
    }
    listen(host, 'click', event => {
      const button = event.target.closest('button');
      if (!button || !host.contains(button)) return;
      if (button.dataset.llStep !== undefined) setStep(Number(button.dataset.llStep));
      else if (button.dataset.llDegree !== undefined) onChange({ n: Number(button.dataset.llDegree), j: 0 });
      else if (button.dataset.llJ !== undefined) onChange({ j: Number(button.dataset.llJ) });
      else if (button.id === 'll-previous') setStep(activeStep - 1);
      else if (button.id === 'll-next') setStep(activeStep + 1);
      else if (button.id === 'll-swap') { swapped = !swapped; if (lastState) render(lastState, false); }
    });
    listen($('ll-term-select'), 'change', event => onChange({ j: Number(event.target.value) }));
    const resize = () => {
      if (resizeFrame || destroyed || !lastState || !host.getBoundingClientRect().width) return;
      resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; if (!destroyed && lastState) render(lastState, false); });
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(host); else listen(window, 'resize', resize);
    typeset([host.querySelector('.ll-toolbar')]);
    setStep(0);
    return {
      render,
      setStep,
      getStep: () => activeStep,
      destroy() {
        destroyed = true;
        observer?.disconnect();
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        handlers.forEach(([el, event, handler]) => el.removeEventListener(event, handler));
      }
    };
  };
})();
