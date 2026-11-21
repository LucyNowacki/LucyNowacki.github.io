/* The same finite Fourier products drive the matrix, boundary field and partial integrals. */
(() => {
  'use strict';
  const root = document.getElementById('kernel-circuit');
  const get = id => document.getElementById('kf-' + id);
  const M = window.CoefficientMath;
  const tau = 2*Math.PI, ms = [3,1,-1,-3];
  const weights = ms.map((_,j)=>M.alpha(j)*M.alpha(3-j));
  const colors = {ink:'#fcce77',cyan:'#68e1f4',pink:'#ff87cc',violet:'#d4adff',mint:'#8ce9bd',muted:'#665775',axis:'#b4a2c3'};
  const fmt = x => Math.abs(x)<1e-12?'0':Number(x.toPrecision(5)).toString();
  const number = z => fmt(z.re)+(Math.abs(z.im)<1e-10?'':(z.im<0?' − ':' + ')+fmt(Math.abs(z.im))+'i');
  const linear = d3.line().x(p=>p[0]).y(p=>p[1]);
  const samples = (fn,end=tau,n=180) => Array.from({length:n+1},(_,i)=>fn(end*i/n));
  const state = {kind:'contour',rho:1.5,L:3,theta:30,row:0,col:0,phi:0};
  let model, selectedPath, matrices, timer=0,phaseTimer=0;
  function harmonics(list) {
    const map = new Map();
    for (const [p,w] of list) map.set(p,(map.get(p)||0)+w);
    return [...map].filter(([,w])=>w!==0);
  }
  function field(series,t) {
    let re=0,im=0;
    for(const [p,w] of series){re+=w*Math.cos(p*t);im+=w*Math.sin(p*t);}
    return M.C(re,im);
  }
  function primitive(series,t) {
    let re=0,im=0;
    for(const [p,w] of series){
      if(p===0)re+=w*t;
      else {re+=w*Math.sin(p*t)/p; im+=2*w*Math.sin(p*t/2)**2/p;}
    }
    return M.C(re/tau,im/tau);
  }
  function mean(series){return series.reduce((v,[p,w])=>p===0?v+w:v,0);}
  function products(terms,kind) {
    const {rho}=state, d=(rho*rho+1/(rho*rho))/4;
    if(kind==='contour') return ms.map((m,j)=>terms.map(({k,sigma})=>{
      const b=3.5*weights[j]*sigma;
      return [[m-k+1,b*rho**(m-k+1)],[m-k-1,-b*rho**(m-k-1)]];
    }));
    return terms.map(a=>terms.map(b=>{
      const p=b.k-a.k, v=a.amplitude*b.amplitude;
      return [[p,d*v],[p+2,-v/4],[p-2,-v/4]];
    }));
  }
  function createModel() {
    const terms=M.qTerms(3,state.rho,state.L), cells=products(terms,state.kind);
    const total=harmonics(cells.flat(2));
    const reference = state.kind==='contour'?harmonics(products(M.qTerms(3,state.rho,80),'contour').flat(2)):null;
    const refTrace = reference?samples(t=>primitive(reference,t)):null;
    const trace=samples(t=>primitive(total,t)), maxSurface=Math.max(...samples(t=>Math.abs(field(total,t).re)));
    return {terms,cells,total,trace,reference,refTrace,maxSurface};
  }
  function svgPath(svg,points,color,width=2,dash=null) {
    svg.append('path').attr('d',linear(points)).attr('fill','none').attr('stroke',color)
      .attr('stroke-width',width).attr('stroke-dasharray',dash).attr('stroke-linejoin','round').attr('stroke-linecap','round');
  }
  function dot(svg,p,color,r=4,open=false) {
    svg.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',r)
      .attr('fill',open?'none':color).attr('stroke',open?color:'#201627').attr('stroke-width',1.8);
  }
  function arrow(svg,a,b,color) {
    svgPath(svg,[a,b],color,2.7);
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
    if(len<2)return;
    const ux=dx/len,uy=dy/len,h=Math.min(10,len*.55);
    const base=[b[0]-h*ux,b[1]-h*uy];
    svg.append('path').attr('d',linear([b,[base[0]-.4*h*uy,base[1]+.4*h*ux],[base[0]+.4*h*uy,base[1]-.4*h*ux]])+'Z').attr('fill',color);
  }
  function label(svg,p,value,anchor='start',color=colors.axis){
    svg.append('text').attr('x',p[0]).attr('y',p[1]).attr('text-anchor',anchor).attr('fill',color).text(value);
  }
  function drawEllipse(t,entry) {
    const svg=d3.select(get('ellipse'));svg.selectAll('*').remove();
    const {rho,col,phi}=state, term=model.terms[col], type=get('surface').value;
    const isWave=type==='wave', series=type==='entry'?entry:model.total;
    const bound=isWave?term.amplitude:type==='total'?model.maxSurface:selectedPath.maxSurface;
    const height=a=>isWave?term.amplitude*Math.cos(phi-term.k*a):field(series,a).re;
    const semiaxis=(rho+1/rho)/2;
    const project=(z,h=0)=>[199+151*z.re/semiaxis,145-75*z.im/semiaxis-(bound?49*h/bound:0)];
    const base=a=>project(M.gamma(rho,a)), tip=a=>project(M.gamma(rho,a),height(a));
    const contour=samples(base), ridge=samples(tip,tau,240);
    const color=isWave?colors.cyan:type==='entry'?colors.pink:colors.mint;
    svgPath(svg,[[48,145],[350,145]],colors.muted,1);
    svgPath(svg,[project(M.C(-1)),project(M.C(1))],'#ff7e96',2.5);
    svgPath(svg,contour,colors.violet,2);
    svg.append('path').attr('d',linear(ridge.concat([...contour].reverse()))+'Z')
      .attr('fill',color).attr('fill-opacity',.10);
    for(let i=0;i<48;i++)svgPath(svg,[base(i*tau/48),tip(i*tau/48)],color,1);
    svgPath(svg,ridge,color,2.4);
    svgPath(svg,samples(base,t,72),colors.ink,2.5);
    const w=M.gamma(rho,t),tan=M.tangent(rho,t);
    arrow(svg,project(w),project(M.add(w,M.scale(tan,.24))),colors.pink);
    svgPath(svg,[base(t),tip(t)],color,2.6);dot(svg,base(t),colors.ink,5);dot(svg,tip(t),color,4);
    svgPath(svg,[[29,145],[29,96]],colors.axis,1);
    label(svg,[10,84],fmt(bound));label(svg,[14,150],'0');
    label(svg,[199,242],'Re ω  ·  red segment [−1,1]','middle');
    get('wave-ctrl').hidden=!isWave;get('wave-math').hidden=!isWave;
    get('phase').textContent='φ = '+Math.round(phi*180/Math.PI)%360+'°';
    get('geometry-note').textContent=isWave?
      'k = '+term.k+'. Angle α runs around the ellipse. The viewing phase φ shifts the crests. The gold point and pink tangent follow the integration angle θ.':
      'Vertical height is the signed real part of '+(type==='entry'?'the selected product':'the retained integrand')+'. The labelled height scale applies throughout this circuit.';
  }
  function axes(svg,box,xDomain,yDomain){
    const x=d3.scaleLinear(xDomain,[box.left,box.right]),y=d3.scaleLinear(yDomain,[box.bottom,box.top]);
    svg.append('g').attr('class','kf-axis').attr('transform','translate(0,'+box.bottom+')').call(d3.axisBottom(x).ticks(4).tickFormat(d3.format('.3~g')));
    svg.append('g').attr('class','kf-axis').attr('transform','translate('+box.left+',0)').call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.3~g')));
    if(yDomain[0]<0&&yDomain[1]>0)svgPath(svg,[[box.left,y(0)],[box.right,y(0)]],colors.muted,1);
    return {x,y};
  }
  function drawTrace(t,entry) {
    const svg=d3.select(get('trace'));svg.selectAll('*').remove();
    const detail=get('trace-view').value==='entry';
    const curve=detail?entry:model.total, points=detail?selectedPath.trace:model.trace;
    const box={left:54,right:361,top:25,bottom:211};
    const realEnergy=!detail&&state.kind==='hardy';
    get('trace-title').textContent=realEnergy?'Accumulated Hardy energy':'Running integral in the complex plane';
    const z=primitive(curve,t);
    if(realEnergy){
      const max=mean(curve);
      const {x,y}=axes(svg,box,[0,360],[-max*.04,max*1.12]);
      const p=a=>[x(a*360/tau),y(primitive(curve,a).re)];
      svgPath(svg,samples(p),colors.muted);svgPath(svg,samples(p,t),colors.mint,3);
      dot(svg,p(tau),colors.mint,7,true);dot(svg,p(t),colors.ink,5);
      label(svg,[12,16],'Energy');label(svg,[358,249],'θ in degrees','end');
    }else{
      const compare=(!detail&&model.refTrace)?model.refTrace:[];
      const all=points.concat(compare), xs=d3.extent(all,v=>v.re),ys=d3.extent(all,v=>v.im);
      const cx=(xs[1]+xs[0])/2,cy=(ys[1]+ys[0])/2;
      const h=Math.max((xs[1]-xs[0])/307,(ys[1]-ys[0])/186,1e-12)*1.22;
      const {x,y}=axes(svg,box,[cx-153.5*h,cx+153.5*h],[cy-93*h,cy+93*h]);
      const xy=w=>[x(w.re),y(w.im)];
      if(compare.length)svgPath(svg,compare.map(xy),colors.cyan,2,'3 5');
      svgPath(svg,points.map(xy),colors.muted,2);
      svgPath(svg,samples(a=>xy(primitive(curve,a)),t,110),detail?colors.pink:colors.ink,3);
      dot(svg,xy(M.C(mean(curve))),colors.mint,7,true);dot(svg,xy(z),detail?colors.pink:colors.ink,4);
      label(svg,[14,16],'Im');label(svg,[358,249],'Re','end');
    }
    get('im-detail').hidden=realEnergy;
    if(!realEnergy && get('im-detail').open) {
      const inset=d3.select(get('im-plot'));inset.selectAll('*').remove();
      const peak=Math.max(...points.map(p=>Math.abs(p.im)), ...(detail?[]:model.refTrace.map(p=>Math.abs(p.im))));
      if(peak<1e-13) {
        label(inset,[190,72],'This entry accumulates on the real axis.','middle');
      } else {
        const mini={left:62,right:361,top:23,bottom:90};
        const {x,y}=axes(inset,mini,[0,360],[-peak*1.16,peak*1.16]);
        const path=values=>values.map((z,i)=>[x(i*360/(values.length-1)),y(z.im)]);
        if(!detail)svgPath(inset,path(model.refTrace),colors.cyan,1.5,'3 4');
        svgPath(inset,path(points),colors.muted,1.7);
        const p=v=>[x(v*360/tau),y(primitive(curve,v).im)];
        svgPath(inset,samples(p,t,80),detail?colors.pink:colors.ink,2.7);
        dot(inset,p(t),detail?colors.pink:colors.ink,4);
        label(inset,[14,15],'Im');label(inset,[358,124],'θ in degrees','end');
      }
    }
    get('trace-note').textContent=detail?'Pink traces the selected ordered matrix entry. The green ring marks its full-turn contribution. Both axes use equal units.':
      realEnergy?'The energy adds a nonnegative height at every angle. The green ring is the sum of the full-turn matrix entries.':
      'Gold traces the retained wave sum. The dotted cyan reference uses 80 waves for the full kernel. Both finish at a₃ = 1.';
  }
  function buildMatrix(){
    const table=document.createElement('table');
    table.setAttribute('aria-label',state.kind==='contour'?'Input power m by inverse kernel exponent k':'Kernel frequency k by conjugate frequency ℓ');
    const header=table.createTHead().insertRow();
    for(const title of [state.kind==='contour'?'m ∖ k':'k ∖ ℓ',...model.terms.map(v=>v.k)]) {
      const th=document.createElement('th');th.scope='col';th.textContent=title;header.append(th);
    }
    const body=table.createTBody();
    matrices=model.cells.map((row,i)=>{
      const tr=body.insertRow(),head=document.createElement('th');
      head.scope='row';head.textContent=state.kind==='contour'?ms[i]:model.terms[i].k;tr.append(head);
      return row.map((_,j)=>{
        const btn=document.createElement('button');btn.type='button';
        btn.dataset.row=i;btn.dataset.col=j;
        btn.addEventListener('click',()=>{
          state.row=i;state.col=j;prepareSelection();draw();
        });
        tr.insertCell().append(btn);return btn;
      });
    });
    get('matrix').replaceChildren(table);
  }
  function equations(entry){
    const contour=state.kind==='contour',m=ms[state.row],k=model.terms[state.col].k;
    const l=contour?null:model.terms[state.row].k;
    function monomial(p){return p===0?'1':p===1?'z':'z^{'+p+'}';}
    const expression=contour?
      '\\frac72 p_{'+m+'}\\sigma_{3,'+k+'}\\big('+monomial(m-k+1)+'-'+monomial(m-k-1)+'\\big)':
      'c_{'+l+'}c_{'+k+'}\\,e^{i('+String(k-l)+')\\theta}\\left(d-\\tfrac14e^{2i\\theta}-\\tfrac14e^{-2i\\theta}\\right)';
    get('selected-title').textContent=contour?'Input power m = '+m+' × kernel frequency k = '+k:
      'Ordered product k = '+l+' × conjugate frequency ℓ = '+k;
    const eq=get('equation');window.MathJax?.typesetClear?.([eq]);
    eq.textContent='\\('+expression+'\\)';
    const ticket=++mathVersion;
    mathQueue=mathQueue.catch(()=>{}).then(async()=>{
      await window.MathJax?.startup?.promise;
      if(ticket===mathVersion)await window.MathJax?.typesetPromise?.([eq]);
    });
  }
  let mathQueue=Promise.resolve(), mathVersion=0;
  function prepareSelection(){
    const cell=model.cells[state.row][state.col];
    selectedPath={trace:samples(a=>primitive(cell,a)),maxSurface:Math.max(...samples(a=>Math.abs(field(cell,a).re)))};
    equations(cell);
  }
  function rebuild(){
    model=createModel();
    state.col=Math.max(0,Math.min(state.col,state.L-1));
    state.row=Math.max(0,Math.min(state.row,model.cells.length-1));
    buildMatrix();prepareSelection();draw();
  }
  function readings(items) {
    const cards=d3.select(get('readings')).selectAll('div').data(items).join('div');
    cards.each(function([title,value]){
      const card=d3.select(this);
      card.selectAll('span').data([title]).join('span').text(v=>v);
      card.selectAll('output').data([value]).join('output').text(v=>v);
    });
  }
  function draw() {
    const t=state.theta*tau/360,contour=state.kind==='contour';
    const entry=model.cells[state.row][state.col],useMean=get('cell-view').value==='mean';
    get('angle-label').textContent=state.theta+'°';get('angle').value=state.theta;
    get('terms-label').textContent=state.L;get('radius-label').textContent=state.rho.toFixed(2);
    get('terms').value=state.L;get('radius').value=state.rho;
    get('contour-proof').hidden=!contour;get('hardy-proof').hidden=contour;
    get('matrix-title').textContent=contour?'Input power × kernel frequency':'Hardy frequency pairs';
    get('entries-note').textContent=useMean?
      (contour?'Only the cell with m = 3 and k = 4 has a nonzero full-turn mean.':'The diagonal is positive. Each neighbour contributes one negative ordered product.'):
      'Signed real contribution at the moving point, including coefficient amplitudes. Other cells can be active before averaging.';
    model.cells.forEach((row,i)=>row.forEach((series,j)=>{
      const val=useMean?mean(series):field(series,t).re,btn=matrices[i][j];
      btn.textContent=Math.abs(val)<1e-12?'0':Number(val.toPrecision(3)).toString();btn.title=fmt(val);btn.dataset.sign=val>1e-12?'plus':val< -1e-12?'minus':'zero';
      btn.setAttribute('aria-pressed',String(state.row===i&&state.col===j));
      btn.setAttribute('aria-label','Row '+(contour?ms[i]:model.terms[i].k)+', column '+model.terms[j].k+', '+btn.textContent);
    }));
    get('end-note').textContent=contour?
      'Full turn: only m − k + 1 = 0 with m = 3 and k = 4 survives. Its weight (7/2)(5/16)(32/35) = 1. Higher modes affect the partial trace.':
      'Full turn: non-neighbour pairs cancel. Summing both ordered neighbours gives −½ Σ cₖcₖ₊₂. Increasing L approaches the full tangent-weighted Hardy energy.';
    const angleValue=primitive(model.total,t);
    readings([['Selected entry here',number(field(entry,t))],['Selected entry accumulated',number(primitive(entry,t))],
              [contour?'Coefficient accumulated · L waves':'Energy accumulated · L waves',number(angleValue)],
              [contour?'Full-turn coefficient':'Full-turn energy · L waves',fmt(mean(model.total))]]);
    drawEllipse(t,entry);drawTrace(t,entry);
  }
  function stop(){
    cancelAnimationFrame(timer);timer=0;get('play').textContent='Play circuit';get('play').setAttribute('aria-pressed','false');
  }
  function stopWave(){
    cancelAnimationFrame(phaseTimer);phaseTimer=0;get('wave').textContent='Animate wave phase';get('wave').setAttribute('aria-pressed','false');
  }
  get('play').addEventListener('click',()=>{
    if(timer){stop();return;}
    const from=state.theta%360, start=performance.now();let last=-1;
    get('play').textContent='Pause circuit';get('play').setAttribute('aria-pressed','true');
    function frame(now){
      const angle=Math.min(360,from+Math.floor((now-start)/42));
      if(angle!==last){last=angle;state.theta=angle;draw();}
      if(angle===360)stop();else timer=requestAnimationFrame(frame);
    }
    timer=requestAnimationFrame(frame);
  });
  get('wave').addEventListener('click',()=>{
    if(phaseTimer){stopWave();return;}
    const initial=state.phi,start=performance.now();let last=0;
    get('wave').textContent='Pause wave phase';get('wave').setAttribute('aria-pressed','true');
    function frame(now){
      if(now-last>50){state.phi=(initial+(now-start)*.0013)%tau;last=now;drawEllipse(state.theta*tau/360,model.cells[state.row][state.col]);}
      phaseTimer=requestAnimationFrame(frame);
    }
    phaseTimer=requestAnimationFrame(frame);
  });
  get('im-detail').addEventListener('toggle',()=>{if(model)drawTrace(state.theta*tau/360,model.cells[state.row][state.col]);});
  get('full').addEventListener('click',()=>{stop();state.theta=360;draw();});
  get('angle').addEventListener('input',()=>{stop();state.theta=+get('angle').value;draw();});
  for(const [id,key] of [['terms','L'],['radius','rho']])get(id).addEventListener('input',()=>{
    stop();state[key]=+get(id).value;rebuild();
  });
  for(const id of ['surface','cell-view','trace-view'])get(id).addEventListener('change',()=>{
    if(id==='surface')stopWave();draw();
  });
  function setKind(kind){
    state.kind=kind;state.row=0;state.col=kind==='hardy'?Math.min(1,state.L-1):0;
    for(const b of root.querySelectorAll('[data-kf-kind]'))b.setAttribute('aria-pressed',String(b.dataset.kfKind===kind));
    rebuild();
  }
  root.querySelectorAll('[data-kf-kind]').forEach(btn=>btn.addEventListener('click',()=>setKind(btn.dataset.kfKind)));
  get('reset').addEventListener('click',()=>{
    stop();stopWave();Object.assign(state,{rho:1.5,L:3,theta:30,phi:0});get('surface').value='wave';
    get('trace-view').value='sum';get('cell-view').value='mean';setKind('contour');
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();stopWave();}});
  rebuild();
})();
