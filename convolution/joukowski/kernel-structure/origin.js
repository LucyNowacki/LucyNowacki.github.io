/* The two independent angles in the exterior Cauchy-kernel expansion. */
(() => {
  const root = document.getElementById('lesson-lab');
  const host = document.getElementById('kernel-origin');
  const M = window.CoefficientMath;
  if (!root || !host || !M) return;
  host.innerHTML = String.raw`<h3>Why does the exterior circle give negative powers?</h3>
<div class="kw-controls" role="group" aria-label="Exterior construction"><button type="button" data-origin-mode="planes" aria-pressed="true">Map the two angles</button><button type="button" data-origin-mode="series" aria-pressed="false">Subtract two geometric series</button></div>
<div id="kw-plane-view">
<p class="math-static">Move \(t\) to choose a point \(x=\cos t\) on the integration interval. Move \(\theta\) to choose where \(Q_n\) is evaluated. The dashed segment on the right represents the denominator \(\omega-x\).</p>
<div class="kw-grid kw-maps"><section class="kw-card"><h4 class="math-static">Circle in the \(z\)-plane</h4><svg id="kw-z" class="kw-plot" role="img" aria-label="Circle and conjugate points"></svg><div class="kw-plane-readout"><span class="kw-key"><i style="--chip:var(--positive)"></i><span id="kw-zval"></span></span><span class="kw-key"><i style="--chip:var(--gold)"></i><span class="math-static">\(e^{it}\)</span></span><span class="kw-key"><i style="--chip:var(--degree)"></i><span class="math-static">\(e^{-it}\)</span></span></div></section>
<section class="kw-card"><h4 class="math-static">Image in the \(\omega\)-plane</h4><svg id="kw-omega" class="kw-plot" role="img" aria-label="Bernstein ellipse and integration interval"></svg><div class="kw-plane-readout"><span class="kw-key"><i style="--chip:var(--positive)"></i><span id="kw-wval"></span></span><span class="kw-key"><i style="--chip:var(--gold)"></i><span id="kw-xval"></span></span><span class="kw-key"><i style="--chip:#ff737e"></i>[−1, 1]</span></div></section></div>
<p class="math-static">\(\omega=\operatorname{Jouk}(z)=\tfrac12(z+z^{-1})\). Both unit-circle points \(e^{it}\) and \(e^{-it}\) map to \(x=\cos t\). The red interval is excluded from the domain of \(Q_n\).</p>
<div class="math-static lesson-formula">\[Q_n(\omega)=\tfrac12\int_{-1}^{1}\frac{P_n(x)}{\omega-x}\,dx=\tfrac12\int_0^\pi P_n(\cos t)\frac{\sin t}{\omega-\cos t}\,dt.\]</div></div>
<div id="kw-series-view" hidden><p class="math-static">Divide each unit phase by \(z\). The ratios \(u_\pm=e^{\pm it}/z\) have modulus \(1/\varrho&lt;1\), so their powers shrink. Follow each coloured path to its partial sum. The hollow rings are the closed-form limits \(u_\pm/(1-u_\pm)\).</p>
<div class="kw-grid"><section class="kw-card"><h4 class="math-static">Two partial sums in the complex plane</h4><svg class="kw-plot" id="kw-series" role="img" aria-label="Two partial sums and their geometric limits"></svg>
<div class="kw-plane-readout"><span class="kw-key"><i style="--chip:var(--gold)"></i>Positive integration phase</span><span class="kw-key"><i style="--chip:var(--degree)"></i>Negative integration phase</span></div></section>
<section class="kw-card"><h4 class="math-static">Subtract, then divide by \(2i\)</h4><label class="math-static" for="kw-series-depth">Geometric powers \(K\) <output id="kw-depth-out">4</output></label><input id="kw-series-depth" type="range" min="1" max="32" value="4"><p id="kw-ratio-read"></p><div class="math-static lesson-formula">\[\frac1{2i}\sum_{k=1}^{K}(u_+^k-u_-^k)=\sum_{k=1}^K z^{-k}\sin(kt).\]</div><output class="kw-readout" id="kw-geometric-read"></output></section></div>
<p class="math-static">As \(K\) grows, the sine sum converges to \(\sin t/[2(\omega-\cos t)]\). The geometric bound \(\sum_{k\ge1}\varrho^{-k}\) is uniform in \(t\), so we can integrate term by term. The coefficient of \(z^{-k}\) is precisely \(\int_0^\pi P_n(\cos t)\sin(kt)\,dt\).</p></div>`;
  const $ = selector => host.querySelector(selector);
  const rad = Math.PI / 180;
  const colors = {eval:'var(--positive)', plus:'var(--gold)', minus:'var(--degree)', cut:'#ff737e', axis:'var(--line)', text:'var(--ink)'};
  const num = x => Math.abs(x) < 5e-13 ? '0' : Number(x.toPrecision(4)).toString();
  const complex = z => num(z.re) + (z.im < -5e-13 ? ' − ' : ' + ') + num(Math.abs(z.im)) + 'i';
  const zero = M.C(0,0);
  let state, mode = 'planes';

  function plane(svg, points, description) {
    const w = Math.max(220, svg.getBoundingClientRect().width), h = 216;
    const extentX = d3.extent(points, p => p.re), extentY = d3.extent(points, p => p.im);
    const span = Math.max(.001,extentX[1]-extentX[0],extentY[1]-extentY[0]);
    const scale = Math.min((w-60)/Math.max(.12*span,extentX[1]-extentX[0]),(h-46)/Math.max(.12*span,extentY[1]-extentY[0]));
    const x = u => w/2 + (u-(extentX[0]+extentX[1])/2)*scale;
    const y = v => h/2 - (v-(extentY[0]+extentY[1])/2)*scale;
    const plot = d3.select(svg).attr('viewBox','0 0 '+w+' '+h).attr('height',h);
    plot.selectAll('*').remove();
    plot.append('title').text(description);
    function line(a,b,color,width=1,dash='') {
      plot.append('line').attr('x1',x(a.re)).attr('y1',y(a.im)).attr('x2',x(b.re)).attr('y2',y(b.im)).attr('stroke',color).attr('stroke-width',width).attr('stroke-dasharray',dash);
    }
    function ellipse(a,b,color,dash='') {
      plot.append('ellipse').attr('cx',x(0)).attr('cy',y(0)).attr('rx',a*scale).attr('ry',b*scale).attr('fill','none').attr('stroke',color).attr('stroke-width',2).attr('stroke-dasharray',dash);
    }
    function dot(p,color,r=4,hollow=false) {
      plot.append('circle').attr('cx',x(p.re)).attr('cy',y(p.im)).attr('r',r).attr('fill',hollow?'var(--panel)':color).attr('stroke',color).attr('stroke-width',2);
    }
    function path(ps,color) {
      plot.append('path').attr('d',d3.line().x(p=>x(p.re)).y(p=>y(p.im))(ps)).attr('stroke',color).attr('stroke-width',2.5).attr('fill','none');
    }
    plot.append('path').attr('d','M10 '+y(0)+'H'+(w-10)+' M'+x(0)+' 10V'+(h-10)).attr('stroke',colors.axis).attr('fill','none');
    plot.append('text').attr('x',w-8).attr('y',Math.min(h-5,Math.max(15,y(0)-6))).attr('text-anchor','end').text('Re');
    plot.append('text').attr('x',Math.min(w-20,Math.max(3,x(0)+5))).attr('y',13).text('Im');
    return {line,ellipse,dot,path};
  }

  function geometric(ratio,K) {
    let term=M.C(1,0);
    const sums=[zero];
    for (let k=1;k<=K;k++) {
      term=M.mul(term,ratio);
      sums.push(M.add(sums.at(-1),term));
    }
    return {sums,limit:M.div(ratio,M.sub(M.C(1,0),ratio))};
  }

  function render() {
    if (!state || host.hidden) return;
    const {rho,theta,t}=state;
    const z=M.polar(rho,theta*rad),omega=M.gamma(rho,theta*rad);
    const plus=M.polar(1,t*rad),minus=M.conj(plus),real=M.C(plus.re,0);
    const corners=[M.C(-rho,-rho),M.C(rho,rho)];
    if (mode==='planes') {
      const src=plane($('#kw-z'),corners,'Exterior circle with the evaluation point and two unit-circle poles');
      src.ellipse(rho,rho,colors.eval);
      src.ellipse(1,1,'var(--muted)','4 4');
      src.line(minus,plus,colors.plus,1.5,'3 4');
      src.line(zero,z,colors.eval,2);
      src.dot(plus,colors.plus); src.dot(minus,colors.minus,5,true); src.dot(z,colors.eval,5);
      const dst=plane($('#kw-omega'),corners,'Joukowski ellipse, integration point x and displacement from x to the boundary point');
      dst.ellipse((rho+1/rho)/2,(rho-1/rho)/2,colors.eval);
      dst.line(M.C(-1,0),M.C(1,0),colors.cut,3);
      dst.line(real,omega,colors.text,1.6,'4 4'); dst.dot(real,colors.plus); dst.dot(omega,colors.eval,5);
      $('#kw-zval').textContent='z ≈ '+complex(z);
      $('#kw-wval').textContent='ω ≈ '+complex(omega);
      $('#kw-xval').textContent='x ≈ '+num(real.re);
    } else {
      const K=Number($('#kw-series-depth').value);
      const pos=geometric(M.div(plus,z),K),neg=geometric(M.div(minus,z),K);
      const all=[...pos.sums,...neg.sums,pos.limit,neg.limit];
      const plot=plane($('#kw-series'),all,'Geometric partial sums for the positive and negative unit phases, with hollow markers for their limits');
      for(const [data,color] of [[pos,colors.plus],[neg,colors.minus]]){
        plot.path(data.sums,color); data.sums.slice(1).forEach(p=>plot.dot(p,color,2));
        plot.dot(data.limit,color,6,true);plot.dot(data.sums.at(-1),color,3);
      }
      plot.line(neg.sums.at(-1),pos.sums.at(-1),colors.text,1.6,'4 4');
      const approx=M.mul(M.sub(pos.sums.at(-1),neg.sums.at(-1)),M.C(0,-.5));
      const exact=M.div(M.C(Math.sin(t*rad)/2,0),M.sub(omega,real));
      $('#kw-depth-out').value=K;
      $('#kw-geometric-read').textContent='Finite sine sum ≈ '+complex(approx)+' · Closed form ≈ '+complex(exact);
      $('#kw-ratio-read').textContent='Each next power has '+num(1/rho)+' times the previous modulus.';
    }
  }
  host.querySelectorAll('[data-origin-mode]').forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.originMode;
    for(const item of host.querySelectorAll('[data-origin-mode]')) item.setAttribute('aria-pressed',String(item===button));
    $('#kw-plane-view').hidden=mode!=='planes'; $('#kw-series-view').hidden=mode!=='series'; render();
  }));
  $('#kw-series-depth').addEventListener('input',render);
  root.addEventListener('kernel:update',e=>{state=e.detail;render();});
})();

