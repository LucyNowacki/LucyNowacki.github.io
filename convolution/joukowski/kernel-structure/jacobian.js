/* Follow the two different derivatives that enter the contour and Hardy formulas. */
(() => {
  'use strict';

  const root = document.getElementById('lesson-lab');
  const math = window.CoefficientMath;
  if (!root || !math) return;
  let host = document.getElementById('kernel-jacobian');
  if (!host) {
    host = document.createElement('section');
    host.id = 'kernel-jacobian';
    host.hidden = true;
    root.append(host);
  }

  host.innerHTML = String.raw`
    <div class="kw-controls" role="group" aria-label="Choose a derivative experiment">
      <button type="button" data-jac-mode="shift" aria-pressed="true">Contour · shift the coefficients</button>
      <button type="button" data-jac-mode="pairs" aria-pressed="false">Hardy · pair the frequencies</button>
    </div>
    <div class="kw-card">
      <h3>Carry one boundary point into the weights</h3>
      <div class="kw-grid">
        <svg class="kw-plot" data-jac-map role="img" aria-label="The active outer circle maps to the ellipse, with matching boundary points and tangents"></svg>
        <div><label for="jac-physical-angle">Move the boundary point <output data-jac-angle-out></output></label>
          <input style="display:block;width:100%" id="jac-physical-angle" data-jac-angle type="range" min="0" max="360" step="1">
          <p class="math-static">The outer circle \(z=\varrho e^{i\theta}\) gives the contour used here. The faint inner circle has radius \(\varrho^{-1}\). Both map to the same ellipse under \(J\).</p>
          <output data-jac-live-derivative></output><p class="math-static" data-jac-map-shift>Contour multiplication uses the complex derivative \(J'(z)=\tfrac12-\tfrac12z^{-2}\). Its second summand turns twice clockwise per circuit.</p>
          <p class="math-static" data-jac-map-pairs hidden>The Hardy weight \(W(\theta)=|\Gamma'_\varrho(\theta)|^2=\varrho^2|J'(z)|^2\) enters every instantaneous entry. Turn the point to compare it with the full-turn mean.</p>
          <button type="button" data-jac-back>Inspect the pull-back geometry →</button>
        </div>
      </div>
    </div>
    <div class="kw-controls">
      <label for="jac-ladder-row">Inspect a frequency</label>
      <select id="jac-ladder-row"></select>
      <button type="button" data-jac-example>Try degree 3, frequency 6</button>
    </div>
    <section class="kw-card" data-jac-panel="shift">
      <h3>Subtract a copy shifted by two powers</h3>
      <p class="math-static">In the contour integral, \(d\omega=J'(z)\,dz\), with \(J'(z)=\tfrac12(1-z^{-2})\). Multiplying the kernel by \(z^{-2}\) moves its coefficient at \(k-2\) into position \(k\).</p>
      <div class="lesson-formula math-static">\[\widetilde Q_n(z)=Q_n(J(z))J'(z),\qquad
        \widetilde\sigma_{n,k}=\frac{\sigma_{n,k}-\sigma_{n,k-2}}2.\]</div>
      <div class="lesson-formula math-static">\[\begin{aligned}
      \widetilde Q_n(z)&=\tfrac12\sum_{q\ge0}\sigma_{n,k_q}z^{-k_q}\\
        &\quad-\tfrac12\sum_{q\ge0}\sigma_{n,k_q}z^{-(k_q+2)},\\
      k_q&=n+1+2q.
      \end{aligned}\]</div>
      <p class="math-static">The first copy retains every exponent. The second moves each exponent two places farther into the negative powers. The two copies occupy the same parity ladder, so their overlapping entries must be added with their signs.</p>
      <h4>Which inputs feed this output frequency?</h4>
      <label style="display:block;max-width:28rem">Boundary angle <output data-jac-angle-out></output><input style="width:100%;display:block" type="range" min="0" max="360" step="1" data-jac-angle></label>
      <div class="kw-controls" role="group" aria-label="Contour matrix basis"><button type="button" data-jac-basis="coeff" aria-pressed="true">Laurent coefficients</button><button type="button" data-jac-basis="value" aria-pressed="false">Evaluated terms at θ</button></div>
      <label for="jac-transfer-col">Inspect input column</label> <select id="jac-transfer-col"></select>
      <div class="kw-grid"><div><svg class="kw-plot" data-jac-transfer role="img" aria-label="Rows are output frequencies and columns are input frequencies of the contour multiplier"></svg></div>
      <div><p class="math-static">Row \(k\) receives column \(k\) directly (blue), and column \(k-2\) after a shift (gold). Select a square to inspect its multiplier.</p>
      <p class="math-static">In coefficient coordinates the entries are \(\tfrac12,-\tfrac12\). In evaluated-term coordinates the inputs already carry \(z^{-\ell}\). The incoming multiplier becomes \(-\tfrac12z^{-2}\), which supplies the missing two powers.</p>
      <output data-jac-transfer-value></output></div></div>
      <p class="math-static">Read the three bars at the selected power \(z^{-k}\). At the first rung the preceding coefficient is zero.</p>
      <svg class="kw-plot" data-jac-shift-chart role="img" aria-label="Signed contributions to the selected contour coefficient" width="100%"></svg>
      <p class="kw-readout" data-jac-shift-value></p>
      <p data-jac-shift-note></p>
      <h4>Which way do the contributions point?</h4>
      <p class="math-static">Keep the destination \(k\) fixed and move the circle angle. The blue arrow comes from the original \(k\) term. The gold arrow comes from \(k-2\). Multiplication by \(-z^{-2}\) scales that earlier half-term by \(\varrho^{-2}\) and turns it through \(\pi-2\theta\). When both are present, they oscillate at \(-k\), pointing in opposite directions.</p>
      <svg class="jac-direction" role="img" aria-label="Two opposite contributions and their resultant at the selected Laurent power"></svg>
      <p class="kw-readout" data-jac-direction-note></p>

      <p class="math-static">Each inspected coefficient is from the infinite expansion. If you multiply only the \(L\) retained terms by \(J'(z)\), their shifted copy adds one more power beyond the last displayed rung.</p>
      <p class="math-static">For \(n=3\), the leading coefficient is \(\tfrac12\sigma_{3,4}=\tfrac{16}{35}\).
        The next is \(\tfrac12(\tfrac{128}{315}-\tfrac{32}{35})=-\tfrac{16}{63}\).</p>
    </section>
    <section class="kw-card hp-lab" id="hardy-pair-lab" data-jac-panel="pairs" hidden>
      <div class="hp-title"><h3>Build the Hardy integral on the ellipse</h3><button type="button" id="kf-film-neighbour">Film example · pair (4, 6)</button><button type="button" data-hp-example>Try the seven-mode example</button></div>
      <p class="math-static">Each square multiplies one mode of \(Q_{n,L}\) by one conjugate mode and the squared boundary speed \(W=|\Gamma'_\varrho|^2\). Select a square to follow its contribution around the ellipse and into the sum below.</p>
      <div class="hp-equation math-static" aria-label="Hardy integral of the retained kernel">
        <span>\(\displaystyle I_L=\frac{1}{2\pi}\int_0^{2\pi}|Q_{n,L}(\theta)|^2 W(\theta)\,d\theta\)</span><span>\(=\)</span>
        <span data-hp-zone="diag">\(\displaystyle a\sum_k c_k^2\)</span>
        <span data-hp-zone="near">\(\displaystyle -\frac12\sum_k c_k c_{k+2}\)</span>
      </div>
      <div class="hp-probe">
        <label>Boundary angle <output data-jac-angle-out></output><input data-jac-angle type="range" min="0" max="360" step="1"></label>
        <div class="kw-controls" role="group" aria-label="Hardy matrix averaging">
          <button type="button" data-jac-average="mean" aria-pressed="true">Full-turn mean</button>
          <button type="button" data-jac-average="point" aria-pressed="false">At the moving point</button>
        </div>
      </div>
      <div class="hp-linked">
        <div class="hp-matrix-panel">
          <h4>Frequency pairs</h4>
          <p data-jac-reading-key></p>
          <div class="hp-grid-scroll"><table data-jac-pair-chart class="hp-matrix" aria-label="Real contributions by row and column frequency"></table></div>
          <div class="hp-matrix-key"><span>Selected entry</span><span>Conjugate partner</span></div>
          <div class="hp-product" aria-label="Selected row mode times conjugate column mode and the full-turn mean of this square">
            <span data-hp-factor="row"></span><span data-hp-factor="col"></span><span data-hp-factor="weight"></span>
            <span data-hp-factor="mean"></span>
          </div>
          <p class="hp-readout" data-jac-cell-value></p>
          <p class="hp-explain" data-hp-selection></p>
          <button type="button" class="hp-all-terms" data-hp-show-expansion>See this term in the full expansion ↓</button>
          <div class="hp-selects">
            <label>Row <select data-hp-row></select></label>
            <label>Column <select id="jac-pair-col"></select></label>
          </div>
          <div class="kw-controls hp-shortcuts" role="group" aria-label="Column frequency minus row frequency">
            <button type="button" data-jac-delta="-2">ℓ − k = −2</button>
            <button type="button" data-jac-delta="0">ℓ − k = 0</button>
            <button type="button" data-jac-delta="2">ℓ − k = +2</button>
            <button type="button" data-jac-delta="4">ℓ − k = +4</button>
          </div>
        </div>
        <div class="hp-hump-panel" data-hp-hump></div>
      </div>
      <div data-hp-expansion></div>
      <p class="hp-check" data-jac-total></p>
      <details class="hp-weight math-static"><summary>Why do only three diagonals survive?</summary>
        <p>Along \(z=\varrho e^{i\theta}\), the tangent is \(\Gamma'_\varrho(\theta)=izJ'(z)\). Its squared speed is \(W(\theta)=a-\tfrac14e^{2i\theta}-\tfrac14e^{-2i\theta}\), where \(a=(\varrho^2+\varrho^{-2})/4\). An entry contains the phase \(e^{i(\ell-k)\theta}\). Its mean keeps precisely the products with zero total frequency.</p>
        <p>The ladder starts at \(k=n+1\) and advances by two. The sums shown use the \(L\) retained modes. Absolute convergence on \(\varrho>1\) gives the corresponding identity for the infinite expansion.</p>
      </details>
    </section>`;

  const rowSelect = host.querySelector('#jac-ladder-row');
  const shifts = host.querySelector('[data-jac-shift-chart]');
  const pairs = host.querySelector('[data-jac-pair-chart]');
  const blue = 'var(--viz-series-1, #68cfff)';
  const gold = 'var(--viz-series-5, #ffd36f)';
  const ink = 'var(--foreground, #f4eef9)';
  const grid = 'var(--border, #735f82)';
  const panel = 'var(--background, #241a31)';
  const number = value => Number(value.toPrecision(6)).toString().replace('-', '−');
  let state = { n: 3, rho: 1.5, q: 0, L: 6, theta: 28 };
  let mode = location.hash === '#hardy-pair-lab' ? 'pairs' : 'shift';
  let difference = 0, choices = '';
  let averaging = 'mean', basis = 'coeff', transferCol = 0;
  const radians = () => state.theta * Math.PI / 180;
  const complex = z => number(z.re) + (z.im < 0 ? ' − ' : ' + ') + number(Math.abs(z.im)) + 'i';
  function phase(delta) {
    const v = math.polar(1, delta * radians());
    return math.C(Math.abs(v.re) < 1e-14 ? 0 : v.re, Math.abs(v.im) < 1e-14 ? 0 : v.im);
  }

  function mark(parent, tag, attrs, content) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
    if (content !== undefined) el.textContent = content;
    parent.append(el);
    return el;
  }
  function label(svg, x, y, text, anchor = 'start') {
    return mark(svg, 'text', { x, y, 'text-anchor': anchor, style: 'font-size:13px;fill:var(--foreground,#f4eef9)' }, text);
  }
  function prepare(svg, width, height, title) {
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', height);
    mark(svg, 'title', {}, title);
  }

  function drawShift(terms) {
    const q = state.q, k = terms[q].k;
    const original = terms[q].sigma / 2, shifted = q ? -terms[q - 1].sigma / 2 : 0;
    const result = original + shifted;
    const width = Math.max(250, Math.min(720, shifts.clientWidth || 620));
    prepare(shifts, width, 175, `Coefficient at k = ${k}: half the current coefficient plus the signed shifted coefficient.`);
    const zero = width / 2, bound = Math.max(original, -shifted);
    const scale = (width / 2 - 16) / bound;
    mark(shifts, 'line', { x1: zero, x2: zero, y1: 17, y2: 158, stroke: grid, 'stroke-width': 1.5 });
    const rows = [
      ['Original half', original, blue],
      ['Shifted copy, subtracted', shifted, gold],
      ['Result at k = ' + k, result, ink]
    ];
    rows.forEach(([name, value, color], i) => {
      const y = 26 + 48 * i, end = zero + value * scale;
      label(shifts, 12, y - 7, name);
      label(shifts, width - 12, y - 7, number(value), 'end');
      mark(shifts, 'line', { x1: 12, x2: width - 12, y1: y + 6, y2: y + 6, stroke: grid, opacity: .45 });
      if (value === 0) mark(shifts, 'circle', { cx: zero, cy: y + 6, r: 3, fill: color });
      else mark(shifts, 'rect', { x: Math.min(zero, end), y, width: Math.abs(end - zero), height: 12, fill: color, rx: 2 });
    });
    label(shifts, zero, 172, '0', 'middle');
    host.querySelector('[data-jac-shift-value]').textContent =
      `k = ${k}   ·   ½(${number(terms[q].sigma)} − ${number(q ? terms[q - 1].sigma : 0)}) ≈ ${number(result)}.`;
    host.querySelector('[data-jac-shift-note]').textContent = q === 0
      ? 'The first power receives only the original half. No earlier rung shifts into this position.'
      : `The coefficient from k = ${k - 2} moves one rung to the right. Here its subtraction leaves a negative coefficient.`;
  }

  function drawDirections(terms) {
    const svg = host.querySelector('.jac-direction');
    const {q, theta, rho} = state, {k, sigma} = terms[q];
    const half = .5 * sigma * rho ** -k;
    const incoming = q ? -.5 * terms[q-1].sigma * rho ** -k : 0;
    const values = [half, incoming, half + incoming];
    const radians = theta * Math.PI / 180, scale = 43 / Math.max(half, -incoming);
    prepare(svg, 330, 147, 'Arrows share one scale. The previous direction is shown by a dashed ray.');
    const names = ['Original half', 'Shifted half', 'Their sum'];
    const colors = [blue, gold, ink];
    values.forEach((v,i) => {
      const cx = 55 + 110*i, cy = 62, color=colors[i];
      mark(svg,'circle',{cx,cy,r:45,stroke:grid,fill:'none','stroke-width':.8});
      if (i===1 && q>0) mark(svg,'line',{x1:cx,y1:cy,x2:cx+43*Math.cos((k-2)*radians),
        y2:cy+43*Math.sin((k-2)*radians),stroke:gold,'stroke-dasharray':'3 3'});
      const dx = v*scale*Math.cos(k*radians), dy = v*scale*Math.sin(k*radians);
      mark(svg,'circle',{cx,cy,r:2.7,fill:color});
      if (v!==0) {
        const length=Math.hypot(dx,dy), ux=dx/length, uy=dy/length;
        const h=Math.min(8,length*.7), x=cx+dx, y=cy+dy;
        mark(svg,'line',{x1:cx,y1:cy,x2:x,y2:y,stroke:color,'stroke-width':2.6});
        mark(svg,'polygon',{points:[[x,y],[x-h*ux-h*.48*uy,y-h*uy+h*.48*ux],
          [x-h*ux+h*.48*uy,y-h*uy-h*.48*ux]].map(p=>p.join(',')).join(' '),fill:color});
      }
      label(svg,cx,127,names[i],'middle');
    });
    host.querySelector('[data-jac-direction-note]').textContent = q===0
      ? 'The middle dot has length zero. No earlier term reaches the first rung.'
      : 'Dashed gold ray: direction before the shift. Solid gold arrow: after the shift. At θ = '+theta+'° the turn is '+number(180-2*theta)+'° (mod 360°). The three arrows use one length scale.';
  }

  function drawLocator() {
    const svg=host.querySelector('[data-jac-map]'), width=360, scale=68/state.rho;
    const rho=state.rho, phi=radians(), z=math.polar(rho,phi), w=math.joukowski(z), derivative=math.joukowskiPrime(z);
    const tan=math.tangent(rho,phi);
    prepare(svg,width,180,'The boundary points have the same angular parameter. Gold arrows follow their local tangents.');
    const cy=89, left=83, right=275;
    function line(x1,y1,x2,y2,stroke,thickness) {mark(svg,'line',{x1,y1,x2,y2,stroke,'stroke-width':thickness});}
    for(const cx of [left,right]) {
      line(cx-75,cy,cx+75,cy,grid,1);line(cx,cy-72,cx,cy+72,grid,1);
    }
    mark(svg,'circle',{cx:left,cy,r:68,fill:'#34515e',stroke:blue,'stroke-width':2.2});
    mark(svg,'circle',{cx:left,cy,r:scale,fill:'#251d32',stroke:grid,'stroke-dasharray':'3 3'});
    mark(svg,'circle',{cx:left,cy,r:scale/rho,fill:'none',stroke:grid,'stroke-dasharray':'5 3'});
    mark(svg,'ellipse',{cx:right,cy,rx:scale*(rho+1/rho)/2,ry:scale*(rho-1/rho)/2,
      stroke:'#d6a9f7','stroke-width':2.3,fill:'none'});
    line(right-scale,cy,right+scale,cy,'#ff718a',2.3);
    function vector(cx,v,t,color) {
      const x=cx+v.re*scale,y=cy-v.im*scale,dx=.35*t.re*scale,dy=-.35*t.im*scale;
      const h=Math.min(6,Math.hypot(dx,dy)*.55),ux=dx/Math.hypot(dx,dy),uy=dy/Math.hypot(dx,dy);
      line(x,y,x+dx,y+dy,gold,2.6);
      mark(svg,'polygon',{points:[[x+dx,y+dy],[x+dx-h*ux-h*.45*uy,y+dy-h*uy+h*.45*ux],[x+dx-h*ux+h*.45*uy,y+dy-h*uy-h*.45*ux]].map(a=>a.join(',')).join(' '),fill:gold});
      mark(svg,'circle',{cx:x,cy:y,r:4.3,fill:color,stroke:panel});
    }
    vector(left,z,math.C(-z.im,z.re),blue);vector(right,w,tan,'#d6a9f7');
    label(svg,left,174,'Input circle','middle');label(svg,right,174,'Image ellipse','middle');label(svg,181,91,'J →','middle');
    host.querySelector('[data-jac-live-derivative]').textContent='J′(z) ≈ '+complex(derivative)+'   ·   W(θ) ≈ '+number(math.abs2(tan));
    host.querySelector('[data-jac-map-shift]').hidden=mode!=='shift';
    host.querySelector('[data-jac-map-pairs]').hidden=mode!=='pairs';
    host.querySelectorAll('[data-jac-angle]').forEach(el=>el.value=state.theta);
    host.querySelectorAll('[data-jac-angle-out]').forEach(el=>el.value=state.theta+'°');
  }

  function drawTransferMatrix(svg, terms, column, entry) {
    const L=terms.length, width=Math.max(236,Math.min(640,svg.clientWidth || 600));
    const size=Math.min(330,width-66,Math.max(135,36*L));
    const pitch=size/L, left=(width-size)/2+10, top=43;
    prepare(svg,width,top+size+15,'Contour shift from each input column to its output row');
    label(svg,left+size/2,16,'Input frequency ℓ','middle');
    label(svg,left-12,top-7,'k','middle');
    terms.forEach(({k},i)=>{
      if(pitch>=24 || i===state.q || i===column || i===0 || i===L-1){
        label(svg,left+(i+.5)*pitch,top-7,k,'middle');
        label(svg,left-8,top+(i+.5)*pitch+4,k,'end');
      }
      terms.forEach((term,j)=>{
        const z=entry(term.k-k), active=i===state.q && j===column;
        const cell=mark(svg,'rect',{x:left+j*pitch+1.4,y:top+i*pitch+1.4,width:pitch-2.8,height:pitch-2.8,rx:2,
          fill:j===i?blue:j===i-1?gold:panel,
          'fill-opacity':z.re===0?1:.34+.66*Math.min(1,Math.abs(z.re)/.5),
          stroke:active?ink:grid,'stroke-width':active?3:.7,
          'data-jac-source-row':i,'data-jac-source-col':j,style:'cursor:pointer'});
        mark(cell,'title',{},'k = '+k+', ℓ = '+term.k+' · '+complex(z));
        if(basis==='value' && pitch>=16 && math.abs(z)>0){
          const direction=math.scale(z,1/math.abs(z)),len=.31*pitch;
          const cx=left+(j+.5)*pitch, cy=top+(i+.5)*pitch;
          const dx=len*direction.re,dy=-len*direction.im;
          mark(svg,'line',{x1:cx,y1:cy,x2:cx+dx,y2:cy+dy,stroke:'#fff','stroke-width':1.8,'pointer-events':'none'});
          mark(svg,'circle',{cx:cx+dx,cy:cy+dy,r:1.7,fill:'#fff','pointer-events':'none'});
        }
      });
    });
  }

  function drawTransfer(terms) {
    const q=state.q, k=terms[q].k;
    const shifted=basis==='coeff'?math.C(-.5):math.scale(phase(-2),-.5/state.rho**2);
    const entry=delta=>delta===0?math.C(.5):delta===-2?shifted:math.C(0);
    transferCol=Math.min(terms.length-1,Math.max(0,transferCol));
    host.querySelector('#jac-transfer-col').value=transferCol;
    drawTransferMatrix(host.querySelector('[data-jac-transfer]'),terms,transferCol,entry);
    const source=terms[transferCol], multiplier=entry(source.k-k);
    const input=basis==='coeff'?math.C(source.sigma):math.scale(phase(-source.k),source.amplitude);
    host.querySelector('[data-jac-transfer-value]').textContent=
      'Row '+k+', column '+source.k+' · multiplier '+complex(multiplier)+' × input ('+complex(input)+') ≈ '+complex(math.mul(multiplier,input))+
      (basis==='coeff'?'. These Laurent matrix entries stay fixed as θ moves.':'. White pointers show the phase of each nonzero multiplier.');
    host.querySelectorAll('[data-jac-basis]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.jacBasis===basis)));
  }

  function selectPair(row, col) {
    difference = 2 * (col - row);
    send({ q: row });
  }

  function drawPairEntries(terms, column, entry) {
    const key = state.n + '/' + terms.length;
    if (pairs.dataset.ladder !== key) {
      pairs.dataset.ladder = key;
      pairs.replaceChildren();
      const head = pairs.createTHead().insertRow();
      for (const name of ['k ∖ ℓ', ...terms.map(term => term.k)]) {
        const label = document.createElement('th');
        label.scope = 'col'; label.textContent = name; head.append(label);
      }
      const body = pairs.createTBody();
      terms.forEach(({k}, i) => {
        const row = body.insertRow(), label = document.createElement('th');
        label.scope = 'row'; label.textContent = k; row.append(label);
        terms.forEach((term, j) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.jacRow = i; button.dataset.jacCol = j;
          row.insertCell().append(button);
        });
      });
    }
    const offsets = new Map();
    for (const button of pairs.querySelectorAll('button')) {
      const i = +button.dataset.jacRow, j = +button.dataset.jacCol;
      const u = terms[i], v = terms[j], delta = v.k - u.k;
      if (!offsets.has(delta)) offsets.set(delta, entry(delta).re);
      const value = offsets.get(delta) * u.amplitude * v.amplitude;
      const selected = i === state.q && j === column;
      button.dataset.sign = value > 0 ? 'plus' : value < 0 ? 'minus' : 'zero';
      button.classList.toggle('hp-partner', !selected && i === column && j === state.q);
      button.setAttribute('aria-pressed', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const compact = value !== 0 && Math.abs(value)<.01 ? value.toExponential(1) : Number(value.toPrecision(2)).toString();
      button.textContent = compact.replace(/-/g,'−');
      button.setAttribute('aria-label', 'Row '+u.k+', column '+v.k+', '+(averaging==='mean'?'angular mean ':'real part at '+state.theta+' degrees ')+number(value));
    }
    // Keep the active column in view when the grid is wider than its card.
    const scroll = pairs.parentElement, cell = pairs.rows[state.q+1].cells[column+1];
    const box = cell.getBoundingClientRect(), clip = scroll.getBoundingClientRect();
    if (box.right > clip.right) scroll.scrollLeft += box.right-clip.right+2;
    else if (box.left < clip.left+34) scroll.scrollLeft += box.left-clip.left-34;
  }

  let productKey = '';
  function drawSelectedProduct(k, ell) {
    const key = k+'/'+ell;
    if (key===productKey || typeof window.MathJax?.tex2svg!=='function') return;
    const product = 'c_{'+k+'}c_{'+ell+'}';
    const mean = k===ell ? 'a c_{'+k+'}^2' : Math.abs(k-ell)===2 ? '-\\tfrac14 '+product : '0';
    const factors = [
      'c_{'+k+'}e^{-'+k+'i\\theta}',
      'c_{'+ell+'}e^{+'+ell+'i\\theta}',
      'W(\\theta)',
      '\\xrightarrow{\\text{full turn}} '+mean
    ];
    host.querySelectorAll('[data-hp-factor]').forEach((node,i)=>{
      node.replaceChildren(window.MathJax.tex2svg(factors[i],{display:false}));
    });
    productKey=key;
  }

  function drawPairs(terms) {
    const L=terms.length, rho=state.rho, a=(rho**2+rho**-2)/4;
    const weight=math.abs2(math.tangent(rho,radians()));
    const entry=delta=>averaging==='point'?math.scale(phase(delta),weight):math.C(delta===0?a:Math.abs(delta)===2?-.25:0);
    const q=state.q, col=Math.max(0,Math.min(L-1,q+difference/2)), k=terms[q].k, ell=terms[col].k;
    difference=ell-k;
    drawPairEntries(terms,col,entry);
    drawSelectedProduct(k,ell);
    host.querySelector('#jac-pair-col').value=col;
    host.querySelector('[data-hp-row]').value=q;
    const z=entry(difference),contribution=math.scale(z,terms[q].amplitude*terms[col].amplitude);
    host.querySelector('[data-jac-cell-value]').textContent='k = '+k+', ℓ = '+ell+' · geometric factor ('+complex(z)+') × '+number(terms[q].amplitude)+' × '+number(terms[col].amplitude)+' ≈ '+complex(contribution);
    host.querySelector('[data-jac-reading-key]').textContent=averaging==='point'
      ? 'Each square shows the real part of one weighted product at '+state.theta+'°. Blue is positive and gold is negative.'
      : 'Each square shows the angular mean of one weighted product. Blue is positive, gold is negative, and 0 is an exact cancellation.';
    const band=difference===0?'diag':Math.abs(difference)===2?'near':'far';
    const selection=band==='diag'
      ? 'This square contributes a single squared mode to the first sum.'
      : band==='near'?'These two neighbours have conjugate phases. Their means combine into the highlighted term of the second sum.'
      : 'This pair and its transpose can change the local height. Both have zero mean, so neither appears in the integrated sum.';
    host.querySelector('[data-hp-selection]').textContent=selection;
    for (const span of host.querySelectorAll('[data-hp-zone]')) span.classList.toggle('hp-lit',span.dataset.hpZone===band);
    const snapshot={...state,terms,row:q,col,meanMode:averaging==='mean'};
    window.KernelPairHump.update(snapshot);
    window.KernelPairExpansion.update(snapshot);
    const diagonal=a*terms.reduce((s,v)=>s+v.amplitude**2,0);
    const neighbours=terms.slice(1).reduce((s,v,i)=>s+v.amplitude*terms[i].amplitude/2,0);
    const instant=weight*math.abs2(math.evaluateTerms(terms,radians()));
    host.querySelector('[data-jac-total]').textContent='All '+L+' × '+L+' entries at '+state.theta+'° sum to '+number(instant)+'. Full-turn mean ≈ '+number(diagonal)+' − '+number(neighbours)+' ≈ '+number(diagonal-neighbours)+'.';
    host.querySelectorAll('[data-jac-delta]').forEach(b=>{
      const offset=+b.dataset.jacDelta;
      b.setAttribute('aria-pressed',String(offset===difference));
      b.disabled=q+offset/2<0 || q+offset/2>=L;
    });
    host.querySelectorAll('[data-jac-average]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.jacAverage===averaging)));
  }

  function render() {
    if (host.hidden || !host.getClientRects().length) return;
    const terms = math.qTerms(state.n, state.rho, state.L);
    if (choices !== state.n + '/' + state.L) {
      choices = state.n + '/' + state.L;
      for (const select of [rowSelect,host.querySelector('[data-hp-row]')])
        select.replaceChildren(...terms.map(({k}, i) => new Option('k = ' + k, i)));
    }
    const columnSelect=host.querySelector('#jac-pair-col');
    if (columnSelect.dataset.choices!==choices) {
      columnSelect.dataset.choices=choices;
      for (const select of [columnSelect, host.querySelector('#jac-transfer-col')])
        select.replaceChildren(...terms.map(({k},i)=>new Option('ℓ = '+k,i)));
    }
    rowSelect.value = state.q;
    rowSelect.parentElement.hidden = mode === 'pairs';
    drawLocator();
    for (const btn of host.querySelectorAll('[data-jac-mode]')) btn.setAttribute('aria-pressed', String(btn.dataset.jacMode === mode));
    for (const pane of host.querySelectorAll('[data-jac-panel]')) pane.hidden = pane.dataset.jacPanel !== mode;
    if (mode === 'shift') { drawTransfer(terms); drawShift(terms); drawDirections(terms); }
    else drawPairs(terms);
  }

  function send(partial) {
    root.dispatchEvent(new CustomEvent('kernel:set', { detail: partial }));
  }
  root.addEventListener('kernel:update', event => {
    const next = event.detail;
    state = next;
    render();
  });
  window.KernelPairHump.mount(host.querySelector('[data-hp-hump]'),theta=>send({theta}));
  window.KernelPairExpansion.mount(host.querySelector('[data-hp-expansion]'),selectPair);
  host.querySelector('[data-hp-row]').addEventListener('change',e=>selectPair(+e.target.value,+host.querySelector('#jac-pair-col').value));
  pairs.addEventListener('keydown',event=>{
    const cell=event.target.closest('[data-jac-row]');
    if (!cell) return;
    let row=+cell.dataset.jacRow,col=+cell.dataset.jacCol;
    switch(event.key) {
      case 'ArrowUp': row--; break;
      case 'ArrowDown': row++; break;
      case 'ArrowLeft': col--; break;
      case 'ArrowRight': col++; break;
      case 'Home': col=0; break;
      case 'End': col=state.L-1; break;
      default: return;
    }
    event.preventDefault();
    row=Math.max(0,Math.min(state.L-1,row)); col=Math.max(0,Math.min(state.L-1,col));
    selectPair(row,col);
    pairs.rows[row+1].cells[col+1].firstElementChild.focus({preventScroll:true});
  });
  function filmPair(){
    mode='pairs';difference=2;averaging='mean';
    send({n:3,rho:1.5,L:3,theta:30,q:0});
  }
  host.querySelector('#kf-film-neighbour').addEventListener('click',filmPair);
  window.addEventListener('DOMContentLoaded',()=>{if(location.hash==='#kf-film-neighbour')filmPair();},{once:true});
  window.addEventListener('hashchange',()=>{
    if(location.hash==='#kf-film-neighbour')filmPair();
    if (location.hash==='#hardy-pair-lab') {mode='pairs';render();}
  });
  host.querySelectorAll('[data-jac-angle]').forEach(el=>el.addEventListener('input',()=>send({theta:Number(el.value)})));
  host.querySelector('#jac-transfer-col').addEventListener('change',e=>{
    transferCol=Number(e.target.value);render();
  });
  host.querySelector('#jac-pair-col').addEventListener('change',e=>{
    difference=2*(Number(e.target.value)-state.q);render();
  });
  rowSelect.addEventListener('change', () => send({ q: Number(rowSelect.value) }));
  host.addEventListener('click', event => {
    const button = event.target.closest('button');
    const cell = event.target.closest('[data-jac-row]');
    const transfer=event.target.closest('[data-jac-source-row]');
    if (transfer) {
      transferCol=Number(transfer.dataset.jacSourceCol);send({q:Number(transfer.dataset.jacSourceRow)});
    } else if (button?.hasAttribute('data-jac-average')) {
      averaging=button.dataset.jacAverage;render();
    } else if (button?.hasAttribute('data-jac-basis')) {
      basis=button.dataset.jacBasis;render();
    } else if (button?.hasAttribute('data-jac-back')) {
      root.querySelector('.kw-path [aria-controls="kernel-pullback"]').click();
    } else if (cell) {
      selectPair(+cell.dataset.jacRow,+cell.dataset.jacCol);
    } else if (button?.hasAttribute('data-hp-show-expansion')) {
      const factor=host.querySelector('[data-px-kind=row][aria-pressed=true]');
      factor?.focus({preventScroll:true});
      host.querySelector('[data-hp-expansion]').scrollIntoView({block:'start'});
    } else if (button?.hasAttribute('data-hp-example')) {
      averaging='mean'; difference=0;
      send({n:6,rho:1.71,L:7,theta:197,q:3});
    } else if (button?.hasAttribute('data-jac-example')) {
      transferCol=0;
      send({ n: 3, q: 1, L: Math.max(2, state.L) });
    } else if (button?.hasAttribute('data-jac-mode')) {
      mode = button.dataset.jacMode;
      history.replaceState(null,'',mode==='pairs'?'#hardy-pair-lab':'#kernel-jacobian');
      render();
    } else if (button?.hasAttribute('data-jac-delta')) {
      difference = Number(button.dataset.jacDelta);
      render();
    }
  });
  let lastWidth = -1;
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width !== lastWidth) {
      lastWidth = entry.contentRect.width;
      render();
    }
  }).observe(host);
  window.MathJax?.startup?.promise?.then(render);
  render();
})();
