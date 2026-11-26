(() => {
  'use strict';
  const root = document.getElementById('hardy-energy-tail');
  const byId = id => document.getElementById(id);
  const input = {view: byId('het-view'), R: byId('het-R'), n: byId('het-n'), L: byId('het-L'), r: byId('het-r'), N: byId('het-N')};
  const svg = d3.select(byId('het-chart'));
  const defaults = {view: 'energy', R: 1.5, n: 2, L: 3, r: 1.2, N: 2};
  let state = {...defaults};
  const colours = {diagonal: 'var(--viz-series-1)', correction: 'var(--viz-series-2)', energy: 'var(--viz-series-3)', tail: 'var(--viz-series-1)'};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fmt = x => x === 0 ? '0' : (Math.abs(x)<0.001 || Math.abs(x)>=10000) ? x.toExponential(3) : d3.format('.5~g')(x);
  const clamp = (x,lo,hi) => Math.min(hi,Math.max(lo,x));
  const M=window.CoefficientMath;
  function C2(R) { return M.constants(R).C2; }
  function energy(n,R,L) {
    const e=M.qEnergy(n,R,L);
    return {D:e.diagonal,C:e.neighbour,q:e.approx,error:e.remainderBound,bound:e.upper};
  }
  function tail(N,ratio) { return M.tailSeries(N,ratio); }
  function restore(saved) {
    const candidate=saved?.hardyEnergyTail;
    if(!candidate || typeof candidate!=='object') return;
    for(const key of ['R','n','L','r','N']) if(Number.isFinite(candidate[key])) state[key]=candidate[key];
    if(candidate.view==='energy' || candidate.view==='tail') state.view=candidate.view;
    sanitize();
  }
  function sanitize() {
    state.R=clamp(state.R,1.15,2.5); state.n=Math.round(clamp(state.n,0,8));
    state.L=Math.round(clamp(state.L,1,160)); state.N=Math.round(clamp(state.N,1,25));
    state.r=clamp(state.r,1.01,Math.round((state.R-.01)*100)/100);
  }
  function persist() {
    try{localStorage.setItem('convolution-hardy-coefficients-v1',JSON.stringify({hardyEnergyTail:{...state}}));}catch(_){}
  }
  function sync() {
    input.r.max=(state.R-.01).toFixed(2);
    for(const key of Object.keys(input)) input[key].value=state[key];
    for(const key of ['R','r','n','L','N']) byId('het-'+key+'-value').value=(key==='R'||key==='r')?state[key].toFixed(2):state[key];
    const energyView=state.view==='energy';
    for(const suffix of ['controls','formulas','details']) {
      byId('het-energy-'+suffix).hidden=!energyView;
      byId('het-tail-'+suffix).hidden=energyView;
    }
  }
  function structural(W,H,desc) {
    svg.attr('viewBox',`0 0 ${W} ${H}`).attr('height',H);
    svg.selectAll('title').data([0]).join('title').attr('id','het-chart-title').text(state.view==='energy'?'Diagonal energy minus neighbour correction':'Geometric envelope of Legendre tail terms');
    svg.selectAll('desc').data([0]).join('desc').attr('id','het-chart-desc').text(desc);
  }
  function measureLabels() {
    const labels=[...byId('het-chart').querySelectorAll('.tick text,.het-value,.axis-title')];
    const boxes=labels.map(el=>({el,box:el.getBoundingClientRect()}));
    for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++) {
      const a=boxes[i],b=boxes[j];
      if(a.box.width && b.box.width && a.box.left<b.box.right+4 && a.box.right+4>b.box.left && a.box.top<b.box.bottom+4 && a.box.bottom+4>b.box.top) {
        if(b.el.classList.contains('het-value')) b.el.style.visibility='hidden';
      }
    }
  }
  const laboratory = window.createHardyBoundaryLab(root, changes => {
    Object.assign(state, changes);
    sanitize(); sync(); draw(true); persist();
  });
  let previousView=null;
  function draw(animate=false) {
    if(!window.d3) return;
    laboratory.sync(state);
    const W=Math.max(280,root.getBoundingClientRect().width), H=280;
    const changedView=previousView!==state.view;
    if(changedView) svg.selectAll('g,rect,line,path,text').remove();
    previousView=state.view;
    const duration=animate&&!changedView&&!reduced.matches?180:0;
    if(state.view==='energy') {
      const v=energy(state.n,state.R,state.L), left=90,right=24,top=16,bottom=51;
      structural(W,H,`First ${state.L} kernel terms: diagonal ${v.D}, subtract neighbour correction ${v.C}, remaining energy ${v.q}. Full energy has analytic upper bound ${v.bound}.`);
      const rows=[{key:'D',label:'Dₗ',value:v.D,colour:colours.diagonal},{key:'C',label:'− Cₗ',value:v.C,colour:colours.correction},{key:'q',label:'qₗ',value:v.q,colour:colours.energy}];
      const extent=d3.extent(rows,d=>d.value), x=d3.scaleLinear().domain([Math.min(0,extent[0]),Math.max(Number.MIN_VALUE,extent[1])*1.22]).range([left,W-right]);
      const y=d3.scaleBand().domain(rows.map(d=>d.key)).range([top,H-bottom]).padding(.44);
      svg.selectAll('rect[data-chart-frame]').data([0]).join('rect').attr('data-chart-frame','').attr('x',left).attr('y',top).attr('width',W-left-right).attr('height',H-bottom-top).attr('fill','none').attr('stroke','var(--border)');
      const bars=svg.selectAll('rect.het-bar').data(rows,d=>d.key).join('rect').attr('class','het-bar').attr('x',left).attr('y',d=>y(d.key)).attr('height',y.bandwidth()).attr('fill',d=>d.colour).attr('data-tooltip',d=>`${d.label} = ${fmt(d.value)}`);
      if(duration) bars.transition().duration(duration).attr('width',d=>x(d.value)-left); else bars.attr('width',d=>x(d.value)-left);
      svg.selectAll('text.het-row').data(rows,d=>d.key).join('text').attr('class','het-row').attr('x',left-14).attr('y',d=>y(d.key)+y.bandwidth()/2+4).attr('text-anchor','end').text(d=>d.label);
      svg.selectAll('text.het-value').data(rows,d=>d.key).join('text').attr('class','het-value').attr('x',W-right-7).attr('y',d=>y(d.key)-7).attr('text-anchor','end').style('visibility','visible').text(d=>fmt(d.value));
      svg.selectAll('g.het-x').data([0]).join('g').attr('class','het-x').attr('transform',`translate(0,${H-bottom})`).call(d3.axisBottom(x).ticks(W<400?3:4).tickFormat(d3.format('.2~g')));
      svg.selectAll('text.axis-title').data([{axis:'x',x:W-right,y:H-9,text:'Energy (squared norm)',anchor:'end'},{axis:'y',x:left-14,y:13,text:'Term',anchor:'end'}]).join('text').attr('class','axis-title').attr('data-axis',d=>d.axis).attr('x',d=>d.x).attr('y',d=>d.y).attr('text-anchor',d=>d.anchor).text(d=>d.text);
      byId('het-result').textContent=`Finite energy qₗ = ${fmt(v.D)} − ${fmt(v.C)} = ${fmt(v.q)}. Full upper bound = ${fmt(v.bound)}.`;
      byId('het-evidence').textContent=`L = ${state.L}: analytic |q − qₗ| ≤ ${fmt(v.error)}. Finite qₗ is an approximation; the truncation estimate excludes floating-point rounding.`;
    } else {
      const left=70,right=22,top=24,bottom=53, ratio=state.r/state.R, c=C2(state.R), end=Math.max(30,state.N+12);
      const data=d3.range(end+1).map(n=>({n,value:c*(2*n+1)*ratio**n,omitted:n>=state.N}));
      structural(W,H,`Unit Hardy norm envelope C2(R)(2n+1)(r/R)^n; degrees zero through ${state.N-1} retained. Infinite discarded envelope sum ${c*tail(state.N,ratio)}.`);
      const extent=d3.extent(data,d=>d.value), x=d3.scaleBand().domain(data.map(d=>d.n)).range([left,W-right]).padding(.2), y=d3.scaleLinear().domain([Math.min(0,extent[0]),extent[1]*1.15]).nice().range([H-bottom,top]);
      svg.selectAll('rect[data-chart-frame]').data([0]).join('rect').attr('data-chart-frame','').attr('x',left).attr('y',top).attr('width',W-left-right).attr('height',H-bottom-top).attr('fill','none').attr('stroke','var(--border)');
      const bars=svg.selectAll('rect.het-bar').data(data,d=>d.n).join('rect').attr('class','het-bar').attr('x',d=>x(d.n)).attr('width',x.bandwidth()).attr('fill',d=>d.omitted?colours.tail:'var(--muted-foreground)').attr('opacity',d=>d.omitted?1:.3).attr('data-tooltip',d=>`Degree ${d.n}: ${fmt(d.value)} — ${d.omitted?'discarded envelope':'retained'}`);
      if(duration) bars.transition().duration(duration).attr('y',d=>y(d.value)).attr('height',d=>H-bottom-y(d.value)); else bars.attr('y',d=>y(d.value)).attr('height',d=>H-bottom-y(d.value));
      const ticks=[0,state.N,end].filter((v,i,a)=>a.indexOf(v)===i);
      svg.selectAll('g.het-x').data([0]).join('g').attr('class','het-x').attr('transform',`translate(0,${H-bottom})`).call(d3.axisBottom(x).tickValues(ticks));
      svg.selectAll('g.het-y').data([0]).join('g').attr('class','het-y').attr('transform',`translate(${left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.2~g')));
      svg.selectAll('line.het-cut').data([0]).join('line').attr('class','het-cut').attr('x1',x(state.N)-x.step()*.1).attr('x2',x(state.N)-x.step()*.1).attr('y1',top).attr('y2',H-bottom).attr('stroke','var(--foreground)').attr('stroke-width',1);
      svg.selectAll('text.axis-title').data([{axis:'x',x:W-right,y:H-9,text:'Degree n',anchor:'end'},{axis:'y',x:left,y:13,text:'Envelope per degree',anchor:'start'}]).join('text').attr('class','axis-title').attr('data-axis',d=>d.axis).attr('x',d=>d.x).attr('y',d=>d.y).attr('text-anchor',d=>d.anchor).text(d=>d.text);
      byId('het-result').textContent=`r/R = ${ratio.toFixed(4)} · C₂(R) = ${fmt(c)} · Infinite tail envelope = ${fmt(c*tail(state.N,ratio))}.`;
      byId('het-evidence').textContent=`Muted: retained degrees. Coloured: discarded envelope, starting at N = ${state.N}. Bars stop at n = ${end}; the displayed tail value sums all n ≥ N analytically. Norm ||f||H² = 1.`;
    }
    requestAnimationFrame(measureLabels);
  }
  for(const [key,control] of Object.entries(input)) control.addEventListener(key==='view'?'change':'input',()=>{
    state[key]=key==='view'?control.value:Number(control.value); sanitize();sync();draw(true);persist();
  });
  root.querySelector('details').addEventListener('toggle',()=>typeset());
  let mathPending=false;
  function typeset() {
    if(mathPending || !window.MathJax?.typesetPromise) return;
    mathPending=true;
    window.MathJax.typesetPromise([root]).catch(()=>{}).finally(()=>{mathPending=false;});
  }
  try{restore(JSON.parse(localStorage.getItem('convolution-hardy-coefficients-v1')||'null'));}catch(_){}
  sync();draw();
  laboratory.visitChapter(location.hash);
  window.addEventListener('hashchange',()=>laboratory.visitChapter(location.hash));
  new ResizeObserver(()=>draw()).observe(root);
  if(window.MathJax?.startup?.promise) window.MathJax.startup.promise.then(typeset).catch(()=>{});else typeset();
})();
