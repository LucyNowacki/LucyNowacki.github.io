/* Inspect each coefficient before the degree and parity filters select the tail. */
(() => {
  'use strict';

  const host = document.getElementById('kernel-filters');
  const root = document.getElementById('lesson-lab');
  const math = window.CoefficientMath;
  if (!host || !root || !math) return;

  host.innerHTML = String.raw`
    <h3>Which frequencies survive?</h3>
    <p class="math-static">Set \(F(t)=P_n(\cos t)\sin(kt)\). Its signed area on \([0,\pi]\) is the coefficient \(\sigma_{n,k}\). Try both kinds of zero, then the first surviving frequency.</p>
    <div class="kw-controls">
      <label for="kf-k">Frequency index <output id="kf-index" for="kf-k"></output>
        <input id="kf-k" type="range" min="0" max="32" step="1" value="4">
      </label>
      <div role="group" aria-label="Worked cases for degree three">
        <span>Try degree 3</span>
        <button type="button" data-kf-case="2">k = 2 · Degree</button>
        <button type="button" data-kf-case="5">k = 5 · Reflection</button>
        <button type="button" data-kf-case="4">k = 4 · Survival</button>
      </div>
    </div>
    <div class="kw-grid kf-area-grid" id="kf-signed-areas">
      <section class="kw-card">
        <h4>Signed area on the half-circle</h4>
        <p>Blue area counts positively and orange area counts negatively. Click the curve’s horizontal range to move the probe.</p>
        <svg class="kw-plot" data-kf-curve width="100%" role="img" aria-label="Signed integrand and its two reflected samples"></svg>
        <p class="kw-readout" data-kf-probes></p>
        <p data-kf-reflection></p><p data-kf-t-area class="kw-readout"></p>
      </section>
      <section class="kw-card">
        <h4>The same area on the real interval</h4>
        <p class="math-static">As \(t\) grows from \(0\) to \(T\), \(x=\cos t\) moves left from \(1\). For \(k\ge1\), the factor \(\sin t\) in \(\sin(kt)=\sin t\,U_{k-1}(x)\) supplies the change in width. Click the interval to move both cursors.</p>
        <svg class="kw-plot" data-kf-real-curve width="100%" role="img" aria-label="Signed Legendre and Chebyshev product with accumulated area from cos T to one"></svg>
        <div data-kf-cheb-eq class="lesson-formula math-static">\(\displaystyle \int_0^T P_n(\cos t)\sin(kt)\,dt=\int_{\cos T}^{1}P_n(x)U_{k-1}(x)\,dx.\)</div>
        <p data-kf-x-area class="kw-readout"></p>
        <div class="kw-controls"><button type="button" data-kf-sweep>Trace both areas</button><button type="button" data-kf-end>Complete the half-circle</button></div>
      </section>
      <section class="kw-card">
        <h4>Build the coefficient from cosine modes</h4>
        <p class="math-static">Group the frequencies \(m\) and \(-m\) of \(P_n(\cos t)\). Each bar gives the weighted integral of one cosine mode against \(\sin(kt)\).</p>
        <svg class="kw-plot" data-kf-bars width="100%" role="img" aria-label="Signed contributions of cosine modes to the coefficient"></svg>
        <p class="kw-readout" data-kf-outcome></p>
        <p data-kf-reason></p>
        <button type="button" data-kf-trace hidden></button>
        <small data-kf-later hidden>This frequency lies beyond the twelve arrows available in the rotating view.</small>
      </section>
    </div>
    <div class="math-static" data-kf-identity>
      <p>On the surviving ladder, both sine frequencies in the product-to-sum formula are positive and odd. Each cosine mode contributes a positive amount.</p>
      <div class="lesson-formula">\[\int_0^\pi \cos(mt)\sin(kt)\,dt
       =\frac{1}{k+m}+\frac{1}{k-m}=\frac{2k}{k^2-m^2}>0.\]</div>
    </div>
    <p><a href="#kernel-calculations">Follow the four worked calculations ↓</a></p>
    <details>
      <summary>Why does every coefficient have magnitude at most two?</summary>
      <div class="math-static"><p>For \(k\ge1\), the interval contains \(k\) half-waves of \(|\sin(kt)|\), each with area \(2/k\). Since \(|P_n(\cos t)|\le1\),</p>
      <div class="lesson-formula">\[|\sigma_{n,k}|\le \int_0^\pi |\sin(kt)|\,dt=2.\]</div>
      <p>Equality occurs at \(n=0,\ k=1\). For \(k=0\), the sine factor vanishes everywhere.</p></div>
    </details>`;

  const $ = (selector) => host.querySelector(selector);
  const slider = $('#kf-k');
  const curve = $('[data-kf-curve]');
  const bars = $('[data-kf-bars]');
  const ns = 'http://www.w3.org/2000/svg';
  const pos = 'var(--viz-series-1)', neg = 'var(--viz-series-2)';
  const ink = 'var(--foreground)', muted = 'var(--muted-foreground)', grid = 'var(--border)';
  const degrees = Math.PI / 180;
  let state = {n: 3, t: 54, L: 6};
  let k = Number(slider.value);
  let previous = '';
  let pointLayer;
  let chart, realChart, realLayer, sweepId=0;
  const realCurve = $('[data-kf-real-curve]');

  function svg(parent, tag, attrs, content) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    if (content !== undefined) node.textContent = content;
    parent.append(node);
    return node;
  }

  function line(parent, x1, y1, x2, y2, color, attrs = {}) {
    return svg(parent, 'line', {x1, y1, x2, y2, stroke: color, ...attrs});
  }

  function label(parent, x, y, content, anchor = 'start') {
    return svg(parent, 'text', {x, y, 'text-anchor': anchor, fill: muted, 'font-size': 13}, content);
  }

  function fmt(value) {
    return Math.abs(value) < 5e-12 ? '0' : Number(value.toPrecision(5)).toString().replace('-', '−');
  }

  function integralSamples(n, k, t) {
    if (k === 0 || t === 0 || t === Math.PI) return 0;
    return math.legendre(n, Math.cos(t)) * Math.sin(k * t);
  }

  function dimensions(target, height) {
    const width = Math.max(200, target.getBoundingClientRect().width);
    target.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    target.setAttribute('height', height);
    target.replaceChildren();
    return width;
  }

  function drawIntegrand() {
    const width = dimensions(curve, 194);
    const left = 30, right = width - 12;
    const x = t => left + (right - left) * t / Math.PI;
    const y = value => 89 - 70 * value;
    chart = {left, right, x, y};
    svg(curve, 'title', {}, 'Signed area of the integrand for n = ' + state.n + ', k = ' + k);
    const sampleCount = Math.max(240, 16 * (state.n + k));
    const samples = Array.from({length: sampleCount + 1}, (_, i) => {
      const t = Math.PI * i / sampleCount;
      return {x: x(t), f: integralSamples(state.n, k, t)};
    });
    const path = transform => samples.map(p => p.x.toFixed(2) + ',' + y(transform(p.f)).toFixed(2)).join(' L');
    for (const level of [-1, 0, 1]) {
      line(curve, left, y(level), right, y(level), grid, {'stroke-width': level === 0 ? 1.8 : 1});
      label(curve, left - 5, y(level) + 4, String(level), 'end');
    }
    for (const angle of [0, 90, 180]) {
      label(curve, x(angle * degrees), 182, angle + '°', angle === 0 ? 'start' : angle === 180 ? 'end' : 'middle');
    }
    svg(curve, 'path', {d: 'M' + path(v => v), stroke: ink, 'stroke-width': 1.7, fill: 'none'});
    pointLayer = svg(curve, 'g', {});
  }

  function showProbes() {
    const {x, y} = chart;
    const a = state.t * degrees;
    const b = Math.PI - a;
    const first = integralSamples(state.n, k, a);
    const second = integralSamples(state.n, k, b);
    pointLayer.replaceChildren();
    for (const [angle, value] of [[a, first], [b, second]]) {
      line(pointLayer, x(angle), 15, x(angle), 163, muted, {'stroke-dasharray': '3 4'});
    }
    svg(pointLayer, 'circle', {cx: x(b), cy: y(second), r: 7.5, stroke: ink, 'stroke-width': 2, fill: 'none'});
    svg(pointLayer, 'circle', {cx: x(a), cy: y(first), r: 4.3, stroke: 'var(--panel)', 'stroke-width': 1.5, fill: ink});
    $('[data-kf-probes]').textContent = '● F(' + fmt(state.t) + '°) ≈ ' + fmt(first) +
      '   ○ F(' + fmt(180 - state.t) + '°) ≈ ' + fmt(second);
  }

  function chebyshev(x) {
    if(k===0)return 0;
    let before=0,current=1;
    for(let j=1;j<k;j++) [before,current]=[current,2*x*current-before];
    return current;
  }
  function realDensity(x){return math.legendre(state.n,x)*chebyshev(x);}
  function drawReal() {
    const width=dimensions(realCurve,194),left=36,right=width-14,peak=Math.max(1,k);
    const x=w=>left+(right-left)*(1+w)/2, y=v=>89-68*v/peak;
    realChart={left,right,x,y};
    line(realCurve,left,y(0),right,y(0),grid);
    for(const v of [-peak,0,peak])label(realCurve,left-4,y(v)+4,String(v),'end');
    for(const v of [-1,0,1])label(realCurve,x(v),183,String(v),'middle');
    const pts=Array.from({length:501},(_,j)=>{
      const w=-Math.cos(Math.PI*j/500);return x(w)+','+y(realDensity(w));
    });
    svg(realCurve,'polyline',{points:pts.join(' '),fill:'none',stroke:muted,'stroke-width':2});
    realLayer=svg(realCurve,'g',{});
  }
  function showAreas(){
    const T=state.t*degrees,lower=Math.cos(T);
    const x=realChart.x,y=realChart.y;
    const N=Math.max(120,12*(state.n+k));
    const nodes=Array.from({length:N+1},(_,j)=>Math.cos(T*(1-j/N)));
    realLayer.replaceChildren();
    function fillHalf(layer,nodes,value,xx,yy,sign){
      const path=nodes.map(a=>xx(a)+','+yy(sign*Math.max(0,sign*value(a)))).join(' L');
      svg(layer,'path',{d:'M'+xx(nodes[0])+','+yy(0)+' L'+path+' L'+xx(nodes.at(-1))+','+yy(0)+' Z',
        fill:sign===1?pos:neg,'fill-opacity':.65});
    }
    const angles=Array.from({length:N+1},(_,j)=>T*j/N);
    const angleFill=svg(pointLayer,'g',{});pointLayer.prepend(angleFill);
    for(const sign of [1,-1]){
      fillHalf(realLayer,nodes,realDensity,x,y,sign);
      fillHalf(angleFill,angles,a=>integralSamples(state.n,k,a),chart.x,chart.y,sign);
    }
    line(realLayer,x(lower),16,x(lower),162,ink,{'stroke-dasharray':'3 3'});
    svg(realLayer,'circle',{cx:x(lower),cy:y(realDensity(lower)),r:4,fill:ink});
    const q=math.gaussLegendre(64);
    function integrate(lo,hi,fn){
      const mid=(lo+hi)/2,r=(hi-lo)/2;
      return r*q.nodes.reduce((v,a,i)=>v+q.weights[i]*fn(mid+r*a),0);
    }
    const tArea=integrate(0,T,a=>integralSamples(state.n,k,a));
    const xArea=integrate(lower,1,realDensity);
    $('[data-kf-cheb-eq]').hidden=k===0;
    $('[data-kf-t-area]').textContent='Accumulated from 0° to '+state.t+'° ≈ '+fmt(tArea);
    $('[data-kf-x-area]').textContent=k===0?'k = 0 gives a zero sine wave; the Chebyshev formula starts at k = 1.':
      'Accumulated from x = '+fmt(lower)+' to 1 ≈ '+fmt(xArea)+' · full coefficient '+fmt(math.sigma(state.n,k));
  }
  function endSweep(){
    cancelAnimationFrame(sweepId);sweepId=0;$('[data-kf-sweep]').textContent='Trace both areas';
    $('[data-kf-sweep]').setAttribute('aria-pressed','false');
  }
  $('[data-kf-end]').addEventListener('click',()=>{endSweep();root.dispatchEvent(new CustomEvent('kernel:set',{detail:{t:180}}));});
  $('[data-kf-sweep]').addEventListener('click',()=>{
    if(sweepId){endSweep();return;}
    const initial=state.t%180,start=performance.now();let previous=-1;
    $('[data-kf-sweep]').textContent='Pause sweep';$('[data-kf-sweep]').setAttribute('aria-pressed','true');
    function frame(now){
      if(host.hidden || document.hidden){endSweep();return;}
      const t=Math.min(180,initial+Math.floor((now-start)/55));
      if(t!==previous){root.dispatchEvent(new CustomEvent('kernel:set',{detail:{t}}));previous=t;}
      if(t===180)endSweep();else sweepId=requestAnimationFrame(frame);
    }
    sweepId=requestAnimationFrame(frame);
  });
  realCurve.addEventListener('click',event=>{
    const matrix=realCurve.getScreenCTM();if(!realChart || !matrix)return;
    endSweep();const local=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    const {left, right} = realChart;
    const edgeTolerance = 1 / Math.hypot(matrix.a, matrix.b);
    const x = local.x <= left + edgeTolerance ? -1
      : local.x >= right - edgeTolerance ? 1
      : 2 * (local.x - left) / (right - left) - 1;
    root.dispatchEvent(new CustomEvent('kernel:set',{detail:{t:Math.round(Math.acos(x)/degrees)}}));
  });
  root.querySelector('[data-input="t"]').addEventListener('input',endSweep);
  function cosineChannels(n, k) {
    // A cosine at m and at −m is identical. Combine its two positive weights once.
    const groups = [];
    for (let j = 0; j <= Math.floor(n / 2); j++) {
      const m = n - 2 * j;
      const weight = math.alpha(j) * math.alpha(n - j) * (m === 0 ? 1 : 2);
      // For equal parity, even sine frequencies (including zero) have zero integral.
      const integral = k === 0 || (k - m) % 2 === 0 ? 0 : 1 / (k + m) + 1 / (k - m);
      groups.push({m, value: weight * integral});
    }
    return groups;
  }

  function drawChannels() {
    const groups = cosineChannels(state.n, k);
    const height = 32 * groups.length + 56;
    const width = dimensions(bars, height);
    svg(bars, 'title', {}, 'Weighted integrals grouped by absolute cosine frequency');
    const left = 48, right = width - 65;
    const signed = groups.some(row => row.value < 0);
    const zero = signed ? (left + right) / 2 : left;
    const max = Math.max(...groups.map(row => Math.abs(row.value)), 1e-15);
    const scale = (right - zero) / max;
    line(bars, zero, 17, zero, height - 23, muted, {'stroke-width': 1.2});
    label(bars, zero, height - 6, '0', 'middle');
    groups.forEach(({m, value}, i) => {
      const y = 30 + 32 * i;
      label(bars, 2, y + 4, 'm = ' + m);
      line(bars, left, y, right, y, grid);
      if (value === 0) {
        svg(bars, 'circle', {cx: zero, cy: y, r: 3.5, fill: 'var(--panel)', stroke: ink});
      } else {
        const end = zero + value * scale;
        svg(bars, 'rect', {x: Math.min(zero, end), y: y - 5.5, width: Math.abs(end - zero), height: 11, rx: 2, fill: value > 0 ? pos : neg});
      }
      label(bars, width - 3, y + 4, (value > 0 ? '+' : '') + fmt(value), 'end');
    });
  }

  function explain() {
    const {n} = state;
    const sameParity = (n - k) % 2 === 0;
    const first = n + 1;
    const survives = k > n && !sameParity;
    let reason;
    if (k === 0) reason = 'At k = 0 the sine factor vanishes identically.';
    else if (k <= n) {
      reason = 'The Chebyshev factor has degree ' + (k - 1) + ', below n = ' + n +
        '. Legendre orthogonality forces the total signed area to vanish.';
      if (n === 3 && k === 2) reason += ' Here P₃(x)U₁(x) = 5x⁴ − 3x². Its integral is 2 − 2 = 0.';
    } else if (sameParity) {
      reason = 'The degree test admits k = ' + k + '. Reflection pairs every lobe with the opposite signed area, so each cosine-mode integral vanishes.';
    } else {
      reason = 'Every |m| is less than k = ' + k + '. Both k + m and k − m are positive odd integers, so all the weighted pieces add.';
      if (n === 3 && k === 4) reason += ' The |m| = 3 and |m| = 1 pieces are exactly 5/7 and 1/5, giving 32/35.';
    }
    $('[data-kf-reason]').textContent = reason;
    $('[data-kf-reflection]').textContent = k === 0 ? 'Both samples vanish at every angle.' :
      sameParity ? 'Reflection reverses the sign. The two marked samples cancel in the integral.' :
      'Reflection preserves the sign. The two samples reinforce wherever the integrand is nonzero.';
    $('[data-kf-outcome]').textContent = survives
      ? 'Survives · σ ≈ ' + fmt(math.sigma(n, k)) + ' · ladder position q = ' + ((k - first) / 2)
      : 'Exact zero · σ = 0';
    const q = (k - first) / 2;
    const fits = q < Number(root.querySelector('[data-input="L"]').max);
    const trace = $('[data-kf-trace]');
    trace.hidden = !survives || !fits;
    trace.textContent = 'Follow k = ' + k + ' into the arrow sum →';
    $('[data-kf-later]').hidden = !survives || fits;
    $('[data-kf-identity]').hidden = !survives;
    $('#kf-index').value = 'k = ' + k;
    for (const button of host.querySelectorAll('[data-kf-case]')) {
      button.setAttribute('aria-pressed', String(n === 3 && k === Number(button.dataset.kfCase)));
    }
  }

  function update() {
    if (host.closest('[hidden]') || host.getClientRects().length === 0) return;
    const revision = [state.n, k, Math.round(curve.getBoundingClientRect().width), Math.round(bars.getBoundingClientRect().width)].join('/');
    if (revision !== previous) {
      drawIntegrand();drawReal();
      drawChannels();
      explain();
      previous = revision;
    }
    showProbes();showAreas();
  }

  slider.addEventListener('input', () => { k = Number(slider.value); update(); });
  for (const button of host.querySelectorAll('[data-kf-case]')) {
    button.addEventListener('click', () => {
      k = Number(button.dataset.kfCase);
      slider.value = k;
      root.dispatchEvent(new CustomEvent('kernel:set', {detail: {n: 3}}));
      update();
    });
  }
  $('[data-kf-trace]').addEventListener('click', () => {
    const q = (k - state.n - 1) / 2;
    root.dispatchEvent(new CustomEvent('kernel:set', {detail: {q, L: Math.max(state.L, q + 1)}}));
    root.querySelector('[aria-controls="kernel-chain"]').click();
  });
  root.addEventListener('kernel:frequency', event => {
    k = event.detail.k;
    slider.value = k;
    update();
  });
  curve.addEventListener('click', event => {
    endSweep();
    const matrix = curve.getScreenCTM();
    if (!chart || !matrix) return;
    const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const t = Math.round(180 * Math.max(0, Math.min(1, (local.x - chart.left) / (chart.right - chart.left))));
    root.dispatchEvent(new CustomEvent('kernel:set', {detail: {t}}));
  });
  root.addEventListener('kernel:update', event => {
    state = event.detail;
    update();
  });
  new ResizeObserver(update).observe(host);
})();
