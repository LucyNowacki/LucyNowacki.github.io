(() => {
  const root=document.getElementById('lesson-lab');
  const defaults={n:3,rho:1.5,theta:28,L:6,q:0,t:54};
  let state={...defaults}, renderId=0, mathQueue=Promise.resolve();
  let vectorZoom=1, focusSelected=false, fitSelected=false;
  let lengthScale='log', lensAtTail=true;
  const series=q=>`var(--viz-series-${q%6+1})`;
  const fmt=x=>x===0?'0':Number(x.toPrecision(4)).toString();
  const texNum=x=>fmt(x).replace(/e([+-]?\d+)/,'\\times10^{$1}');
  const complex=(x,y)=>`${fmt(x)} ${y<0?'−':'+'} ${fmt(Math.abs(y))}i`;
  const coefficient=window.CoefficientMath.sigma;
  function termsFor(s) {
    return Array.from({length:s.L},(_,q)=>{
      const k=s.n+1+2*q, sigma=coefficient(s.n,k), length=sigma*s.rho**(-k), angle=-k*s.theta*Math.PI/180;
      return {q,k,sigma,length,x:length*Math.cos(angle),y:length*Math.sin(angle)};
    });
  }
  function formula(node,tex) {node.textContent=`\\(${tex}\\)`;}
  function typeset(nodes) {
    const ticket=renderId;
    mathQueue=mathQueue.catch(()=>{}).then(async()=>{
      await window.MathJax?.startup?.promise;
      if(ticket!==renderId || !window.MathJax?.typesetPromise)return;
      window.MathJax.typesetClear(nodes);
      await window.MathJax.typesetPromise(nodes);
    });
  }
  function clear(svg,width,height,description) {
    svg.selectAll('*').remove();
    svg.attr('viewBox',`0 0 ${width} ${height}`).attr('height',height);
    svg.append('title').text(description);
  }
  function text(svg,x,y,value,anchor='middle',extra={}) {
    const node=svg.append('text').attr('x',x).attr('y',y).attr('text-anchor',anchor).text(value);
    for(const [key,value] of Object.entries(extra)) node.attr(key,value);
    return node;
  }
  function declutter(svg) {
    const boxes=[];
    svg.selectAll('.d3-axis .tick text').each(function(){
      const box=this.getBoundingClientRect();
      if(boxes.some(b=>box.left<b.right+4 && box.right>b.left-4 && box.top<b.bottom+4 && box.bottom>b.top-4)) this.parentNode.remove();
      else boxes.push(box);
    });
  }
  function spectrum(terms) {
    const node=root.querySelector('[data-plot="spectrum"]'), svg=d3.select(node);
    const width=Math.max(230,node.clientWidth), height=285;
    const left=56, right=width-18, top=35, bottom=height-67;
    const log=lengthScale==='log', zeroRow=log?bottom+20:bottom, last=terms.at(-1).k;
    clear(svg,width,height,'Magnitudes by frequency index. Exact zeros are open squares. Click a coloured frequency to inspect its arrow.');
    const x=d3.scaleLinear().domain([-.6,last+.6]).range([left+3,right-3]);
    const [lo,hi]=d3.extent(terms,d=>d.length);
    let y,ticks;
    if(log) {
      const firstPower=Math.floor(Math.log10(lo)), lastPower=Math.max(firstPower+1,Math.ceil(Math.log10(hi)));
      y=d3.scaleLog().domain([10**firstPower,10**lastPower]).range([bottom-4,top+4]);
      const stride=Math.max(1,Math.ceil((lastPower-firstPower)/4));
      ticks=d3.range(firstPower,lastPower+1,stride).map(i=>10**i);
    } else {
      y=d3.scaleLinear().domain([0,hi*1.12]).range([bottom,top+4]);
      ticks=y.ticks(3);
    }
    svg.append('rect').attr('class','frame').attr('x',left).attr('y',top).attr('width',right-left).attr('height',bottom-top);
    for(const v of ticks) {
      svg.append('line').attr('class','grid').attr('x1',left).attr('x2',right).attr('y1',y(v)).attr('y2',y(v));
      text(svg,left-6,y(v)+4,log?v.toExponential(0).replace('+',''):fmt(v),'end');
    }
    if(log) text(svg,left-6,zeroRow+4,'zero','end');
    const kTicks=[...new Set([0,state.n+1,last,...(width>=420?d3.ticks(0,last,4):[])])].sort((a,b)=>a-b);
    svg.append('g').attr('class','d3-axis').attr('transform',`translate(0,${zeroRow+7})`)
      .call(d3.axisBottom(x).tickValues(kTicks).tickFormat(d3.format('d')).tickSizeOuter(0));
    for(let k=0;k<=last;k++) {
      if(k<=state.n || (k-state.n)%2===0) {
        svg.append('rect').attr('x',x(k)-2.5).attr('y',zeroRow-2.5).attr('width',5).attr('height',5)
          .attr('fill','var(--background)').attr('stroke','var(--muted-foreground)').attr('data-zero-k',k);
      }
    }
    for(const term of terms) {
      const xx=x(term.k), yy=y(term.length), group=svg.append('g').style('cursor','pointer');
      group.append('line').attr('x1',xx).attr('x2',xx).attr('y1',bottom).attr('y2',yy).attr('stroke',series(term.q)).attr('stroke-width',2);
      group.append('circle').attr('cx',xx).attr('cy',yy).attr('r',4.5).attr('fill',series(term.q));
      if(term.q===state.q) group.append('circle').attr('cx',xx).attr('cy',yy).attr('r',8).attr('fill','none').attr('stroke','var(--foreground)').attr('stroke-width',1.5);
      group.append('circle').attr('cx',xx).attr('cy',yy).attr('r',10).attr('fill','transparent');
      group.append('title').text('k = '+term.k+' · length '+fmt(term.length));
      group.on('click',()=>selectTerm(term.q));
    }
    text(svg,left,18,log?'Length · logarithmic axis':'Length · linear axis','start',{'class':'axis-title','data-axis':'y'});
    text(svg,right,height-4,'Frequency index k','end',{'class':'axis-title','data-axis':'x'});
    declutter(svg);
  }
  function detailStart() {return lensAtTail ? Math.max(0,state.L-3) : state.q;}
  function selectTerm(q) {
    state.q=Math.max(0,Math.min(state.L-1,q));
    lensAtTail=false;
    draw();
  }
  function localChain(terms) {
    const start=detailStart(), part=terms.slice(start,start+3), first=part[0];
    const node=root.querySelector('[data-plot="local-chain"]'), svg=d3.select(node);
    const width=Math.max(210,node.clientWidth), height=300;
    clear(svg,width,height,'Magnified consecutive arrows. The local origin is the partial sum before the first arrow shown. The last shown endpoint is ringed.');
    const points=[{x:0,y:0}];
    for(const term of part) {
      const tail=points.at(-1);
      points.push({x:tail.x+term.x,y:tail.y+term.y});
    }
    const [xmin,xmax]=d3.extent(points,p=>p.x), [ymin,ymax]=d3.extent(points,p=>p.y);
    const scale=Math.min((width-52)/Math.max(xmax-xmin,first.length*.1), (height-97)/Math.max(ymax-ymin,first.length*.1));
    const x=v=>width/2+scale*(v-(xmin+xmax)/2);
    const y=v=>(height-32)/2-scale*(v-(ymin+ymax)/2);
    svg.attr('data-units-per-pixel',1/scale).attr('data-detail-k',first.k);
    svg.append('rect').attr('x',1).attr('y',1).attr('width',width-2).attr('height',height-40).attr('class','frame');
    for(const [x1,y1,x2,y2] of [[5,y(0),width-5,y(0)],[x(0),6,x(0),height-43]]) {
      svg.append('line').attr('class','axis-line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2);
    }
    part.forEach((term,i)=>{
      const a=points[i], b=points[i+1], xp=x(b.x), yp=y(b.y);
      const dx=term.x/term.length, dy=-term.y/term.length, h=Math.min(11,term.length*scale*.38);
      svg.append('line').attr('x1',x(a.x)).attr('y1',y(a.y)).attr('x2',xp).attr('y2',yp)
        .attr('data-detail-arrow',term.k).attr('stroke',series(term.q)).attr('stroke-width',3);
      const tip=[[xp,yp],[xp-h*dx-h*.48*dy,yp-h*dy+h*.48*dx],[xp-h*dx+h*.48*dy,yp-h*dy-h*.48*dx]];
      svg.append('polygon').attr('points',tip.map(p=>p.join(',')).join(' ')).attr('fill',series(term.q));
    });
    svg.append('circle').attr('cx',x(0)).attr('cy',y(0)).attr('r',4).attr('fill','var(--foreground)');
    const end=points.at(-1);
    svg.append('circle').attr('cx',x(end.x)).attr('cy',y(end.y)).attr('r',7).attr('fill','none').attr('stroke','var(--foreground)');
    const barLength=d3.tickStep(0,(width*.43)/scale,2);
    svg.append('line').attr('x1',10).attr('x2',10+barLength*scale).attr('y1',height-17).attr('y2',height-17).attr('stroke','var(--foreground)').attr('stroke-width',3);
    text(svg,18+barLength*scale,height-13,fmt(barLength)+' units','start');
    const kList=part.map(d=>d.k).join(', ');
    root.querySelector('#sk-lens-description').textContent='k = '+kList+' · The white dot is the tail of k = '+first.k+'. Real offsets run right and imaginary offsets run up.';
    root.querySelector('#sk-lens-values').replaceChildren(...part.map(term=>{
      const span=document.createElement('span');
      span.style.setProperty('--term-ink',series(term.q));
      span.textContent='k = '+term.k+' · '+fmt(term.length);
      return span;
    }));
    root.querySelector('#sk-lens-earlier').disabled=start===0;
    root.querySelector('#sk-lens-later').disabled=start===state.L-1;
    root.querySelector('#sk-lens-tail').setAttribute('aria-pressed',String(lensAtTail));
  }
  function vectors(terms) {
    const node=root.querySelector('[data-plot="vectors"]'),svg=d3.select(node),width=Math.max(230,node.clientWidth),height=350;
    clear(svg,width,height,'Coloured Laurent contributions are translated head to tail. A dashed line from zero to the final endpoint is the finite partial sum, not the infinite kernel.');
    const vertices=[{x:0,y:0}];
    for(const d of terms){const p=vertices.at(-1);vertices.push({x:p.x+d.x,y:p.y+d.y});}
    const totalLength=d3.sum(terms,d=>d.length),xe=d3.extent(vertices,p=>p.x),ye=d3.extent(vertices,p=>p.y);
    const frame={x:65,y:32,w:width-85,h:height-90};
    const floor=Math.max(totalLength*1e-12,Number.MIN_VALUE);
    const baseScale=Math.min(frame.w/Math.max(xe[1]-xe[0],floor),frame.h/Math.max(ye[1]-ye[0],floor))*.76;
    if(fitSelected){vectorZoom=Math.min(2**44,Math.max(1,.55*Math.min(frame.w,frame.h)/(terms[state.q].length*baseScale)));fitSelected=false;}
    const a=vertices[state.q],b=vertices[state.q+1];
    const center=focusSelected?{x:(a.x+b.x)/2,y:(a.y+b.y)/2}:{x:(xe[0]+xe[1])/2,y:(ye[0]+ye[1])/2};
    const scale=baseScale*vectorZoom,cx=frame.x+frame.w/2,cy=frame.y+frame.h/2;
    const x=v=>cx+scale*(v-center.x),y=v=>cy-scale*(v-center.y);
    const xd=[center.x-frame.w/(2*scale),center.x+frame.w/(2*scale)],yd=[center.y-frame.h/(2*scale),center.y+frame.h/(2*scale)];
    svg.attr('data-units-per-pixel',1/scale).attr('data-zoom',vectorZoom);
    svg.append('rect').attr('data-chart-frame','').attr('class','frame').attr('x',frame.x).attr('y',frame.y).attr('width',frame.w).attr('height',frame.h);
    if(yd[0]<=0&&yd[1]>=0)svg.append('line').attr('class','axis-line').attr('x1',frame.x).attr('x2',frame.x+frame.w).attr('y1',y(0)).attr('y2',y(0));
    if(xd[0]<=0&&xd[1]>=0)svg.append('line').attr('class','axis-line').attr('x1',x(0)).attr('x2',x(0)).attr('y1',frame.y).attr('y2',frame.y+frame.h);
    const tickFormat=v=>Number(v.toPrecision(3)).toString();
    const relative=focusSelected && vectorZoom>5;
    d3.ticks(xd[0]-(relative?center.x:0),xd[1]-(relative?center.x:0),width<400?2:4).forEach(tick=>{
      const v=tick+(relative?center.x:0);
      svg.append('line').attr('class','grid').attr('x1',x(v)).attr('x2',x(v)).attr('y1',frame.y).attr('y2',frame.y+frame.h);
      text(svg,x(v),frame.y+frame.h+22,tickFormat(tick));
    });
    d3.ticks(yd[0]-(relative?center.y:0),yd[1]-(relative?center.y:0),5).forEach(tick=>{
      const v=tick+(relative?center.y:0);
      svg.append('line').attr('class','grid').attr('x1',frame.x).attr('x2',frame.x+frame.w).attr('y1',y(v)).attr('y2',y(v));
      text(svg,frame.x-7,y(v)+4,tickFormat(tick),'end');
    });
    const defs=svg.append('defs');
    defs.append('clipPath').attr('id','sk-vector-clip').append('rect').attr('x',frame.x).attr('y',frame.y).attr('width',frame.w).attr('height',frame.h);
    const arrows=svg.append('g').attr('clip-path','url(#sk-vector-clip)');
    for(const d of terms){
      defs.append('marker').attr('id',`sk-arrow-${d.q}`).attr('viewBox','0 -4 9 8').attr('refX',8).attr('refY',0).attr('markerUnits','userSpaceOnUse').attr('markerWidth',11).attr('markerHeight',11).attr('orient','auto').append('path').attr('d','M0,-4L8,0L0,4Z').attr('fill',series(d.q));
      const start=vertices[d.q],end=vertices[d.q+1];
      arrows.append('line').attr('data-term-q',d.q).attr('x1',x(start.x)).attr('y1',y(start.y)).attr('x2',x(end.x)).attr('y2',y(end.y)).attr('stroke',series(d.q)).attr('stroke-width',d.q===state.q?4:2.5).attr('marker-end',`url(#sk-arrow-${d.q})`);
      arrows.append('circle').attr('cx',x(end.x)).attr('cy',y(end.y)).attr('r',d.q===state.q?5:3).attr('fill',series(d.q));
    }
    const end=vertices.at(-1);
    arrows.append('line').attr('x1',x(0)).attr('y1',y(0)).attr('x2',x(end.x)).attr('y2',y(end.y)).attr('stroke','var(--foreground)').attr('stroke-width',1.5).attr('stroke-dasharray','5 5');
    arrows.append('circle').attr('cx',x(end.x)).attr('cy',y(end.y)).attr('r',8).attr('stroke','var(--foreground)').attr('fill','none');
    arrows.append('circle').attr('cx',x(0)).attr('cy',y(0)).attr('r',4).attr('fill','var(--foreground)');
    text(svg,frame.x,18,relative?'Imaginary offset':'Imaginary part','start',{'class':'axis-title','data-axis':'y'});
    text(svg,width-18,height-10,relative?'Real offset':'Real part','end',{'class':'axis-title','data-axis':'x'});
    const inside=p=>x(p.x)>=frame.x&&x(p.x)<=frame.x+frame.w&&y(p.y)>=frame.y&&y(p.y)<=frame.y+frame.h;
    const outside=terms.filter(d=>!inside(vertices[d.q])||!inside(vertices[d.q+1])).length;
    root.querySelector('#sk-vector-zoom').value=Math.log2(vectorZoom);
    root.querySelector('#sk-vector-zoom-value').value=`${fmt(vectorZoom)}×`;
    root.querySelector('#sk-vector-view-note').textContent=`${focusSelected?'Centred on selected arrow k = '+terms[state.q].k+'.':'Entire arrow chain fitted to the plot.'} ${relative?'Axes give offsets from the selected arrow midpoint. ':''}Equal real/imaginary scales. ${outside?outside+' arrows extend outside this view; use Fit all arrows to restore the whole sum.':'All retained arrows and the origin are visible.'}`;
    return end;
  }
  const steps = [...root.querySelectorAll('.kw-path button')];
  const panels = steps.map(button => document.getElementById(button.getAttribute('aria-controls')));
  const parameters = [['rho','theta','t'], ['n','t'], ['n','rho','theta','L'], ['n','rho','theta','L'], ['n','rho','theta','L'], ['n','rho','theta','L']];
  function stepFromHash() {
    const target=document.getElementById(location.hash.slice(1));
    return panels.indexOf(target?.closest('.kw-panel'));
  }
  let step = Math.max(0, stepFromHash());
  function draw() {

    for(const input of root.querySelectorAll('[data-input]')) input.value=state[input.dataset.input];
    for(const value of root.querySelectorAll('[data-value]')) {
      const key=value.dataset.value; value.textContent=`${key==='rho'?'ρ = ':key==='theta'?'θ = ':key+' = '}${key==='rho'?state.rho.toFixed(2):state[key]}${key==='theta'||key==='t'?'°':''}`;
    }
    root.dispatchEvent(new CustomEvent('kernel:update', {detail:{...state}}));
    if (panels[step].id !== 'kernel-chain') return;
    const terms=termsFor(state), selected=terms[state.q];
    const chooser=root.querySelector('#sk-selected-k');
    chooser.replaceChildren(...terms.map(d=>{const o=document.createElement('option');o.value=d.q;o.textContent=`q = ${d.q}, k = ${d.k}`;return o;}));
    chooser.value=state.q;
    root.querySelector('.sk-structure').textContent=`Zeros: k ≤ ${state.n}, and ${state.n%2?'odd':'even'} k. Surviving ladder: ${state.n+1}, ${state.n+3}, ${state.n+5}, …; 0 ≤ σ ≤ 2.`;
    spectrum(terms); const end=vectors(terms); localChain(terms); const bound=2*state.rho**(-(state.n+1+2*state.L))/(1-state.rho**(-2));
    formula(root.querySelector('.sk-selected-term'),`\\underbrace{v_{${selected.k}}}_{\\text{selected arrow}}=\\underbrace{\\ell_{${selected.k}}}_{\\text{length}}\\,\\underbrace{e^{-i${selected.k}\\theta}}_{\\text{direction }-${selected.k}\\theta}`);
    formula(root.querySelector('.sk-selected-length'),`\\ell_{${selected.k}}=\\sigma_{${state.n},${selected.k}}\\varrho^{-${selected.k}}\\approx ${texNum(selected.sigma)}\\,(${state.rho.toFixed(2)})^{-${selected.k}}\\approx ${texNum(selected.length)}`);
    root.querySelector('.sk-result').textContent=`Finite sum Q${state.n},${state.L} ≈ ${complex(end.x,end.y)}.  Omitted-tail bound B${state.L} = ${fmt(bound)}.`;
    const id=++renderId;
    if(window.MathJax?.typesetPromise) requestAnimationFrame(()=>{if(id===renderId) typeset([root.querySelector('.sk-selected')]);});
  }
  function showStep(index, move=false) {
    step = index;
    const chapter = ['exterior-circle','frequency-filters','rotating-arrows','tail-disc','pullback-tangents','contour-weights'][step];
    const filmLink = root.querySelector('#kf-step-film');
    filmLink.href = '../../kernel-frequencies-film/' + chapter + '.html';
    filmLink.textContent = '▶ Watch ' + steps[step].textContent.split(' · ')[1];
    steps.forEach((button,i) => {
      button.setAttribute('aria-pressed', String(i === step));
      panels[i].hidden = i !== step;
    });
    root.querySelectorAll('.viz-controls [data-input]').forEach(input => {
      input.closest('label').hidden = !parameters[step].includes(input.dataset.input);
    });
    const previous = root.querySelector('[data-kw-prev]'), next = root.querySelector('[data-kw-next]');
    previous.disabled = step === 0;
    next.disabled = step === steps.length-1;
    previous.textContent = step === 0 ? '← Previous step' : '← ' + steps[step-1].textContent;
    next.textContent = next.disabled ? 'Last step' : steps[step+1].textContent + ' →';
    if (move) {
      history.replaceState(null, '', '#' + panels[step].id);
      steps[step].focus({preventScroll:true});
      root.scrollIntoView({block:'start'});
    }
    draw();
  }
  steps.forEach((button,i) => button.addEventListener('click',()=>showStep(i,true)));
  root.querySelector('[data-kw-prev]').addEventListener('click',()=>showStep(Math.max(0,step-1),true));
  root.querySelector('[data-kw-next]').addEventListener('click',()=>showStep(Math.min(steps.length-1,step+1),true));
  window.addEventListener('hashchange',()=>{
    const index = stepFromHash();
    if(index>=0) showStep(index);
  });
  root.addEventListener('kernel:set', event => {
    for (const [key,value] of Object.entries(event.detail)) {
      const input = root.querySelector('.viz-controls [data-input="'+key+'"]');
      if (input && Number.isFinite(value)) {
        input.value = value;
        state[key] = Number(input.value);
      }
    }
    if ('q' in event.detail) lensAtTail=false;
    state.q = Math.max(0, Math.min(state.L-1, event.detail.q ?? state.q));
    draw();
  });
  root.querySelectorAll('.viz-controls [data-input]').forEach(input=>input.addEventListener('input',()=>{
    state[input.dataset.input]=+input.value;state.q=Math.min(state.q,state.L-1);draw();
  }));
  root.querySelector('#sk-selected-k').addEventListener('change',event=>selectTerm(+event.target.value));
  for(const button of root.querySelectorAll('[data-sk-scale]')) button.addEventListener('click',()=>{
    lengthScale=button.dataset.skScale;
    for(const b of root.querySelectorAll('[data-sk-scale]')) b.setAttribute('aria-pressed',String(b===button));
    spectrum(termsFor(state));
  });
  root.querySelector('#sk-lens-earlier').addEventListener('click',()=>selectTerm(detailStart()-1));
  root.querySelector('#sk-lens-later').addEventListener('click',()=>selectTerm(detailStart()+1));
  root.querySelector('#sk-lens-tail').addEventListener('click',()=>{lensAtTail=true;draw();});
  root.querySelector('#sk-vector-zoom').addEventListener('input',event=>{vectorZoom=2**Number(event.target.value);focusSelected=true;vectors(termsFor(state));});
  root.querySelector('#sk-vector-fit').addEventListener('click',()=>{vectorZoom=1;focusSelected=false;vectors(termsFor(state));});
  root.querySelector('#sk-inspect-integral').addEventListener('click', () => {
    root.dispatchEvent(new CustomEvent('kernel:frequency', {detail: {k: state.n + 1 + 2 * state.q}}));
    showStep(panels.findIndex(panel => panel.id === 'kernel-filters'), true);
  });
  root.querySelector('#sk-vector-selected').addEventListener('click',()=>{focusSelected=true;fitSelected=true;vectors(termsFor(state));});
  window.MathJax?.startup?.promise?.then(()=>typeset([root.querySelector('.sk-selected')]));
  function openWorkedCalculation() {
    const target=document.getElementById(location.hash.slice(1));
    if(target?.matches('#kernel-calculations button[id^="kf-work-"]'))target.click();
  }
  window.addEventListener('DOMContentLoaded',openWorkedCalculation,{once:true});
  window.addEventListener('hashchange',openWorkedCalculation);
  showStep(step);
  let resize,lastWidth=root.clientWidth;
  new ResizeObserver(()=>{const width=root.clientWidth;if(Math.abs(width-lastWidth)<1)return;lastWidth=width;cancelAnimationFrame(resize);resize=requestAnimationFrame(draw);}).observe(root);
})();
