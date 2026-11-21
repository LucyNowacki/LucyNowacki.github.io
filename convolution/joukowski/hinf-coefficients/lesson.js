(()=>{'use strict';const root=document.getElementById('bounded-analytic-coefficient-decay'),$=id=>root.querySelector('#hi-'+id),M=window.CoefficientMath,T=2*Math.PI;
const colors=['var(--viz-series-1)','var(--viz-series-2)','var(--viz-series-3)'],names=['Coefficient','Inner envelope','Outer limit'];
let state={r:1.8,fraction:.7,n:6,constant:'perimeter',visible:[true,true,true]},serial=0,queue=Promise.resolve();
const fmt=v=>v===0?'0':v<.0001?v.toExponential(3):Number(v.toPrecision(6)).toString(),a=r=>(r+1/r)/2,s=()=>1+state.fraction*(state.r-1);
const coefficients=Array.from({length:25},(_,n)=>(2*n+1)*M.Qseries(n,2.5+Math.sqrt(5.25),0,80).re);
function constant(r){return state.constant==='fallback'?(r+1/r)/(r-1/r):M.constants(r).CinfApprox;}
function datasets(){const R=state.r,S=s(),norm=1/(2.5-a(R)),cs=constant(S),cr=constant(R);return{R,S,norm,cs,cr,values:Array.from({length:25},(_,n)=>({n,v:[coefficients[n],(2*n+1)*cs*norm*S**(-n),(2*n+1)*cr*norm*R**(-n)]}))};}
function geometry(d){const el=$('geometry'),W=el.getBoundingClientRect().width,H=300,l=64,r=W-24,u=20,b=H-50,svg=d3.select(el).attr('viewBox',`0 0 ${W} ${H}`);svg.selectAll('*').remove();
 const e=R=>Array.from({length:181},(_,j)=>M.gamma(R,T*j/180)),outer=e(d.R),inner=e(d.S),pts=outer.concat([M.C(2.5),M.C(-1)]),xr=d3.extent(pts,p=>p.re),yr=d3.extent(pts,p=>p.im),sc=Math.min((r-l)/((xr[1]-xr[0])*1.25),(b-u)/(Math.max(.2,yr[1]-yr[0])*1.4)),cx=(xr[0]+xr[1])/2,cy=0,x=v=>(l+r)/2+(v-cx)*sc,y=v=>(u+b)/2-v*sc;
 svg.append('rect').attr('data-chart-frame','').attr('x',l).attr('y',u).attr('width',r-l).attr('height',b-u).attr('fill','none').attr('stroke','var(--border)');
 const xd=[cx-(r-l)/(2*sc),cx+(r-l)/(2*sc)],yd=[-(b-u)/(2*sc),(b-u)/(2*sc)];
 svg.append('g').attr('transform',`translate(0,${b})`).call(d3.axisBottom(d3.scaleLinear(xd,[l,r])).ticks(3));svg.append('g').attr('transform',`translate(${l},0)`).call(d3.axisLeft(d3.scaleLinear(yd,[b,u])).ticks(3));svg.selectAll('.domain,.tick line').attr('stroke','var(--border)');
 svg.append('line').attr('x1',x(-1)).attr('x2',x(1)).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','var(--foreground)').attr('stroke-width',3);
 for(const [arr,c,width]of[[outer,colors[2],2],[inner,colors[1],3]])svg.append('path').attr('d',d3.line().x(p=>x(p.re)).y(p=>y(p.im))(arr)).attr('stroke',c).attr('stroke-width',width).attr('fill','none');
 svg.append('path').attr('d',`M${x(2.5)-5},${y(0)-5}l10,10m-10,0l10,-10`).attr('stroke','var(--foreground)').attr('stroke-width',2);
 svg.append('text').attr('x',x(2.5)).attr('y',y(0)-12).attr('text-anchor','end').text('Pole 2.5');
 svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',r).attr('y',H-8).attr('text-anchor','end').text('Real part');svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',5).attr('y',12).text('Imaginary part');
}
function graph(d){const el=$('decay'),W=el.getBoundingClientRect().width,H=300,p={l:64,r:20,t:20,b:50},svg=d3.select(el).attr('viewBox',`0 0 ${W} ${H}`);svg.selectAll('*').remove();const ext=d3.extent(d.values.flatMap(p=>p.v)),x=d3.scaleLinear([-.4,24.4],[p.l,W-p.r]),y=d3.scaleLog([ext[0]/2,ext[1]*2],[H-p.b,p.t]);
 svg.append('rect').attr('data-chart-frame','').attr('x',p.l).attr('y',p.t).attr('width',W-p.l-p.r).attr('height',H-p.b-p.t).attr('fill','none').attr('stroke','var(--border)');
 svg.append('g').attr('transform',`translate(0,${H-p.b})`).call(d3.axisBottom(x).ticks(W<400?3:5).tickFormat(d3.format('d')));
 svg.append('g').attr('transform',`translate(${p.l},0)`).call(d3.axisLeft(y).tickValues([1e-16,1e-12,1e-8,1e-4,1,1e4].filter(v=>v>=y.domain()[0]&&v<=y.domain()[1])).tickFormat(v=>v===1?'1':`10^${Math.round(Math.log10(v))}`));svg.selectAll('.domain,.tick line').attr('stroke','var(--border)');
 svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',W-p.r).attr('y',H-7).attr('text-anchor','end').text('Legendre degree n');svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',5).attr('y',12).text('Magnitude · log scale');
 for(let j=0;j<3;j++)if(state.visible[j]){svg.append('path').attr('d',d3.line().x(p=>x(p.n)).y(p=>y(p.v[j]))(d.values)).attr('fill','none').attr('stroke',colors[j]).attr('stroke-width',j===0?2.5:2).attr('stroke-dasharray',j===2?'5 3':null);svg.append('circle').attr('cx',x(state.n)).attr('cy',y(d.values[state.n].v[j])).attr('r',5).attr('fill',colors[j]);}
 const guide=svg.append('line').attr('data-chart-hover-guide','').attr('y1',p.t).attr('y2',H-p.b).attr('stroke','var(--border)').attr('visibility','hidden'),markers=svg.append('g');
 function hover(event){const [px]=d3.pointer(event,el),v=Math.max(0,Math.min(24,x.invert(px))),i=Math.min(23,Math.floor(v)),f=v-i;guide.attr('x1',x(v)).attr('x2',x(v)).attr('visibility','visible');markers.selectAll('*').remove();let rows=[`Degree ${v.toFixed(1)} · line interpolation`];for(let j=0;j<3;j++)if(state.visible[j]){const val=Math.exp((1-f)*Math.log(d.values[i].v[j])+f*Math.log(d.values[i+1].v[j]));markers.append('circle').attr('data-chart-hover-marker','').attr('cx',x(v)).attr('cy',y(val)).attr('r',4).attr('fill',colors[j]);rows.push(`${names[j]}: ${fmt(val)}`)}const tip=$('tooltip'),rect=root.getBoundingClientRect();tip.hidden=false;tip.textContent=rows.join(' · ');tip.style.left=Math.max(0,Math.min(root.clientWidth-260,event.clientX-rect.left))+'px';tip.style.top=(event.clientY-rect.top+14)+'px';}
 svg.append('rect').attr('data-chart-hit','').attr('data-chart-hover-overlay','cross-series').attr('x',p.l).attr('y',p.t).attr('width',W-p.r-p.l).attr('height',H-p.b-p.t).attr('fill','transparent').on('pointermove',hover).on('pointerdown',hover).on('pointerleave',()=>{guide.attr('visibility','hidden');markers.selectAll('*').remove();$('tooltip').hidden=true});
}
function draw(){const d=datasets();geometry(d);graph(d);const v=d.values[state.n].v;$('coefficient').textContent=fmt(v[0]);$('inner').textContent=fmt(v[1]);$('outer').textContent=fmt(v[2]);$('detail').textContent=`s ${state.fraction===1?'↑ ϱ =':'='} ${Number(d.S.toFixed(4))} · Mϱ = ${fmt(d.norm)} · C(s) ${state.constant==='perimeter'?'≈':'≤'} ${fmt(d.cs)} · C(ϱ) ${state.constant==='perimeter'?'≈':'≤'} ${fmt(d.cr)}`;}
function render(){for(const id of['function','bound'])window.MathJax?.typesetClear?.([$(id)]);for(const key of['r','fraction','n','constant'])$(key).value=state[key];$('rv').textContent=state.r.toFixed(2);$('nv').textContent=state.n;$('sv').textContent=state.fraction===1?'limit s ↑ ϱ':`s = ${Number(s().toFixed(4))}`;
 $('function').textContent='\\(\\begin{gathered}f(\\omega)=\\frac1{2.5-\\omega},\\\\M_\\varrho=\\|f\\|_\\infty=\\frac1{2.5-\\frac12(\\varrho+\\varrho^{-1})}.\\end{gathered}\\)';
 $('bound').textContent=state.constant==='perimeter'?'\\(\\begin{gathered}|a_n(f)|\\le(2n+1)C_\\infty(s)M_\\varrho s^{-n},\\\\C_\\infty(s)=\\frac{|\\partial E_s|}{\\pi(s-s^{-1})},\\\\1<s<\\varrho,\\quad s\\uparrow\\varrho.\\end{gathered}\\)':'\\(\\begin{gathered}|a_n(f)|\\le(2n+1)\\frac{s+s^{-1}}{s-s^{-1}}M_\\varrho s^{-n},\\\\|\\partial E_s|\\le\\pi(s+s^{-1}),\\quad s\\uparrow\\varrho.\\end{gathered}\\)';
 $('legend').replaceChildren();names.forEach((name,j)=>{const b=document.createElement('button');b.type='button';b.className='hi-key cursor-interaction';b.setAttribute('aria-pressed',String(state.visible[j]));const sw=document.createElement('span');sw.className='hi-swatch';sw.style.background=colors[j];sw.style.opacity=state.visible[j]?'1':'.2';b.append(sw,document.createTextNode(name));b.addEventListener('click',()=>{state.visible[j]=!state.visible[j];render();save()});$('legend').append(b)});
 draw();const ticket=++serial;queue=queue.catch(()=>{}).then(async()=>{await window.MathJax?.startup?.promise;if(ticket===serial)await window.MathJax?.typesetPromise?.([$('function'),$('bound')])});}
function restore(raw){const a=raw?.modelContent||{};for(const[k,lo,hi]of[['r',1.2,3],['fraction',.05,1],['n',0,24]])if(Number.isFinite(+a[k]))state[k]=Math.min(hi,Math.max(lo,+a[k]));state.n=Math.round(state.n);if(['perimeter','fallback'].includes(a.constant))state.constant=a.constant;if(Array.isArray(raw?.privateContent?.visible)&&raw.privateContent.visible.length===3)state.visible=raw.privateContent.visible.map(Boolean);}
function save(){try{localStorage.setItem('convolution-hinf-coefficients-v1',JSON.stringify({modelContent:{r:state.r,fraction:state.fraction,n:state.n,constant:state.constant},privateContent:{visible:state.visible}}));}catch(_){}}
function filmExample(){
  Object.assign(state,{r:2.15,fraction:.47,n:10,constant:'perimeter',visible:[true,true,true]});
  render();save();
}
$('film-example').addEventListener('click',filmExample);
window.addEventListener('hashchange',()=>{if(location.hash==='#hi-film-example')filmExample()});
for(const id of ['r','fraction','n','constant'])$(id).addEventListener('input',()=>{state[id]=id==='constant'?$(id).value:+$(id).value;render();save()});try{restore(JSON.parse(localStorage.getItem('convolution-hinf-coefficients-v1')||'null'));}catch(_){};if(location.hash==='#hi-film-example')filmExample();else render();new ResizeObserver(draw).observe(root);
})();

(() => {
  const panel = document.getElementById('hi-reconstruction');
  const field = id => panel.querySelector('#hi-' + id);
  const radius = field('target-radius');
  const count = field('target-count');
  const guarantee = field('target-guarantee');
  const outerRadius = field('analytic-radius');
  const tolerance = 0.01;
  const semimajor = r => (r + 1 / r) / 2;
  const plot = d3.select(field('target-tail'));
  function ellipse(id, r) {
    const shape = field(id);
    shape.setAttribute('rx', 116 * semimajor(r));
    shape.setAttribute('ry', 58 * (r - 1 / r));
  }
  function logBound(n, q, constant) {
    // Logarithms keep a positive bound readable even below floating-point range.
    return Math.log10(constant) + n * Math.log10(q) +
      Math.log10((2 * n + 1) / (1 - q) + 2 * q / (1 - q) ** 2);
  }
  function firstSufficient(ceiling) {
    let lo = 0, hi = 1;
    while (ceiling(hi) >= Math.log10(tolerance)) hi *= 2;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (ceiling(mid) < Math.log10(tolerance)) hi = mid;
      else lo = mid;
    }
    return hi;
  }
  function formatBound(log) {
    if (log >= -3 && log < 4) return Number((10 ** log).toPrecision(4)).toString();
    const exponent = Math.floor(log);
    return (10 ** (log - exponent)).toFixed(2) + ' × 10^(' + exponent + ')';
  }
  function graph(n, q, maxN, ceiling) {
    plot.selectAll('*').remove();
    const label = (x, y, text, anchor = 'middle') =>
      plot.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).text(text);
    if (q === 1) {
      label(210, 115, 'At r = ρ the geometric tail diverges.');
      return;
    }
    const logMin = -5, logMax = Math.max(1, Math.ceil(ceiling(1)));
    const x = d3.scaleLinear([1, maxN], [60, 398]);
    const y = d3.scaleLinear([logMin, logMax], [182, 18]);
    const line = (x1,y1,x2,y2,color) => plot.append('line')
      .attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2).attr('stroke',color);
    for (const exponent of [logMax, 0, -2, logMin]) {
      line(x(1), y(exponent), x(maxN), y(exponent), exponent === -2 ? '#ffca62' : '#51405e')
        .attr('stroke-dasharray', exponent === -2 ? '6 4' : null);
      const tick = label(49, y(exponent) + 4, exponent === 0 ? '1' : '10', 'end');
      if (exponent !== 0) tick.append('tspan').attr('font-size', 10).attr('dy', -5).text(exponent);
    }
    label(x(1), 202, '1');
    label(x(maxN), 202, maxN, 'end');
    label(225, 221, 'Terms kept, N');
    const points = [];
    const samples = Math.min(300, maxN - 1);
    for (let i = 0; i <= samples; i++) {
      const k = 1 + (maxN - 1) * i / samples;
      const log = ceiling(k);
      if (log < logMin) {
        if (points.length) {
          const prev = points.at(-1);
          const cross = prev[0] + (k - prev[0]) * (logMin - prev[1]) / (log - prev[1]);
          points.push([cross,logMin]);
        }
        break;
      }
      points.push([k,log]);
    }
    plot.append('path').attr('d', d3.line().x(p => x(p[0])).y(p => y(p[1]))(points))
      .attr('fill', 'none').attr('stroke', '#70e9e4').attr('stroke-width', 3);
    line(x(n), y(logMax), x(n), y(logMin), '#f1dcef');
    if (x(n) > x(1) + 32 && x(n) < x(maxN) - 40) label(x(n), 202, n);
    const current = ceiling(n);
    if (current >= logMin) {
      plot.append('circle').attr('cx', x(n)).attr('cy', y(current)).attr('r', 5)
        .attr('fill', '#ffca62').attr('stroke','#24182f');
    }
  }
  function update() {
    const rho = Number(outerRadius.value);
    const r = Number(radius.value), n = Number(count.value), q = r / rho;
    const norm = 1 / (2.5 - semimajor(rho));
    const constant = norm * (rho + 1 / rho) / (rho - 1 / rho);
    const ceiling = k => logBound(k, q, constant);
    radius.max = rho;
    for (const option of outerRadius.options) option.disabled = Number(option.value) < r;
    for (const button of panel.querySelectorAll('[data-target-radius]')) {
      button.disabled = Number(button.dataset.targetRadius) > rho;
    }
    ellipse('domain-outer', rho);
    ellipse('domain-inner', r);
    field('domain-source-label').textContent = rho;
    field('domain-target-label').textContent = r;
    field('tail-target-label').textContent = r;
    field('target-plot').setAttribute('aria-label', 'Violet analytic ellipse with parameter ' + rho +
      ' and gold error domain with parameter ' + r);
    field('target-tail').setAttribute('aria-label', 'Uniform-error bound throughout the target ellipse with parameter ' +
      r + ', using the analytic ellipse with parameter ' + rho);
    field('target-rv').textContent = r.toFixed(3);
    field('target-nv').textContent = n;
    const target = q < 1 ? firstSufficient(ceiling) : null;
    count.max = Math.max(150, target || 0, n);
    guarantee.disabled = target === null;
    guarantee.value = target === null ? "" : String(target);
    graph(n, q, Number(count.max), ceiling);
    const ratio = Number(q.toFixed(5));
    field('target-report').textContent = target === null ?
      'The target and the outer analytic domain both have parameter ' + rho + '. Here q = 1, so summing the mode bounds gives no finite tail estimate.' :
      'Outer analytic radius ' + rho + ', target radius ' + r + ', q = ' + ratio + '. With ' + n + ' terms the uniform-error bound throughout this target is ' + formatBound(ceiling(n)) +
      '. The first count that guarantees error below 0.01 is N = ' + target + '.';
  }
  for (const button of panel.querySelectorAll('[data-target-radius]')) {
    button.addEventListener('click', () => { radius.value = button.dataset.targetRadius; update(); });
  }
  guarantee.addEventListener('click', () => {
    count.value = guarantee.value;
    update();
  });
  outerRadius.addEventListener('change', update);
  radius.addEventListener('input', update);
  count.addEventListener('input', update);
  update();
})();
