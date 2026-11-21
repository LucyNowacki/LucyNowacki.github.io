/* A single argument t drives the input, the oriented differential and its accumulated value. */
(() => {
  'use strict';
  const board = document.getElementById('bc-cauchy-steps');
  const el = key => document.getElementById('cs-' + key);
  const M = window.CoefficientMath;
  const {C, add, sub, mul, scale, div, abs, polar, TAU} = M;
  const zero = C(0), pole = C(.5), residue = C(.25);
  const paint = {grid:'#614d70', axes:'#ae9bb9', circle:'#63dce9', ellipse:'#d6a0ff', ink:'#ffcb70', pole:'#ffa2d2', tangent:'#65e4f0', rate:'#ff82c8', constant:'#74edbb'};
  const format = v => Math.abs(v) < 5e-9 ? '0' : Number(v.toPrecision(5)).toString();
  const complex = z => format(z.re) + (Math.abs(z.im) < 5e-9 ? '' : (z.im < 0 ? ' − ' : ' + ') + format(Math.abs(z.im)) + 'i');
  const pathSamples = (fn, t0, t1, n = 128) => Array.from({length:n+1}, (_,i) => fn(t0 + (t1-t0)*i/n));

  function shape(lambda) {
    return window.BoundaryRibbon.geometry({mode:'value',r:2,x:.5,u:1-lambda,e:0});
  }
  const circle = shape(0), ellipse = shape(1);
  function partial(g,t) {
    // Integrate w+x+x²/(w−x). Use the continuous argument starting at the right tip.
    const w = g.point(t), start = g.point(0), delta = sub(w,start), d = g.difference(t);
    const angle = Math.atan2(d.im,d.re);
    const wound = angle + TAU*Math.round((t-angle)/TAU);
    const log = C(Math.log(abs(d)/abs(g.difference(0))),wound);
    const primitive = add(mul(delta,add(pole,scale(add(start,w),.5))),scale(log,.25));
    return C(primitive.im/TAU,-primitive.re/TAU);
  }
  function factorAt(g,t) {
    const w = g.point(t);
    const F = div(mul(w,w),g.difference(t));
    return C(F.im/TAU,-F.re/TAU);
  }
  function modeSum(t) {
    // Exact primitives of the constant, the first mode, and the second mode on the circle.
    return [C(.25*t/TAU), ...[[1,.25],[2,.0625]].map(([k,b]) =>
      scale(C(Math.sin(k*t),1-Math.cos(k*t)),b/(k*TAU)))];
  }
  let step = 'pole', playing = 0, local = true, selectedMode = 'all';

  function chart(id, points, minimumSpan=.05) {
    const svg = d3.select(el(id));
    svg.selectAll('*').remove();
    const xmin = Math.min(...points.map(p=>p.re)), xmax = Math.max(...points.map(p=>p.re));
    const ymin = Math.min(...points.map(p=>p.im)), ymax = Math.max(...points.map(p=>p.im));
    const cx = (xmin+xmax)/2, cy = (ymin+ymax)/2;
    const px = Math.min(298/Math.max(minimumSpan,xmax-xmin),157/Math.max(minimumSpan,ymax-ymin));
    const x = v => 217 + (v-cx)*px, y = v => 124 - (v-cy)*px;
    const clip = 'cs-clip-' + id;
    svg.append('defs').append('clipPath').attr('id',clip).append('rect').attr('x',48).attr('y',16).attr('width',353).attr('height',199);
    const plot = svg.append('g').attr('clip-path','url(#'+clip+')');
    const line = d3.line().x(p=>x(p.re)).y(p=>y(p.im));
    const xs = d3.scaleLinear().domain([cx+(48-217)/px,cx+(401-217)/px]).range([48,401]);
    const ys = d3.scaleLinear().domain([cy+(124-215)/px,cy+(124-16)/px]).range([215,16]);
    svg.append('g').attr('class','cs-axis').attr('transform','translate(0,215)').call(d3.axisBottom(xs).ticks(4).tickFormat(d3.format('.3~g')));
    svg.append('g').attr('class','cs-axis').attr('transform','translate(48,0)').call(d3.axisLeft(ys).ticks(3).tickFormat(d3.format('.3~g')));
    function label(txt,xx,yy,anchor) {
      svg.append('text').attr('x',xx).attr('y',yy).attr('text-anchor',anchor).attr('fill',paint.axes).text(txt);
    }
    label('Re',396,254,'end');label('Im',12,17,'start');
    function path(points,color,width=2,dash) {
      plot.append('path').attr('d',line(points)).attr('fill','none').attr('stroke',color)
        .attr('stroke-width',width).attr('stroke-dasharray',dash || null).attr('stroke-linecap','round').attr('stroke-linejoin','round');
    }
    path([C(xs.domain()[0],0),C(xs.domain()[1],0)],paint.grid,1);
    path([C(0,ys.domain()[0]),C(0,ys.domain()[1])],paint.grid,1);
    function marker(p,color,type='point') {
      const a=x(p.re),b=y(p.im);
      if(type==='diamond'){
        plot.append('path').attr('d','M'+a+','+(b-8)+'l8,8 -8,8 -8,-8Z').attr('fill','none').attr('stroke',color).attr('stroke-width',2);
      } else {
        plot.append('circle').attr('cx',a).attr('cy',b).attr('r',type==='ring'?7:4.5)
          .attr('fill',type==='ring'?'none':color).attr('stroke',type==='ring'?color:'#211429').attr('stroke-width',2);
      }
    }
    function arrow(a,b,color) {
      const dx=x(b.re)-x(a.re),dy=y(b.im)-y(a.im),len=Math.hypot(dx,dy);
      if(len<1.1)return;
      path([a,b],color,3);
      const sx=dx/len,sy=dy/len,tip=Math.min(11,len*.48),bx=x(b.re)-sx*tip,by=y(b.im)-sy*tip;
      plot.append('path').attr('d','M'+x(b.re)+','+y(b.im)+'L'+(bx-sy*tip*.42)+','+(by+sx*tip*.42)+'L'+(bx+sy*tip*.42)+','+(by-sx*tip*.42)+'Z').attr('fill',color);
    }
    return {path,marker,arrow};
  }

  function results(items) {
    const entries = d3.select(el('results')).selectAll('div').data(items).join('div');
    entries.each(function(item) {
      const block=d3.select(this);
      block.selectAll('span').data([item[0]]).join('span').text(v=>v);
      block.selectAll('output').data([item[1]]).join('output').text(v=>v);
    });
  }
  function titles(left,right,leftNote,rightNote) {
    el('input-title').textContent=left; el('output-title').textContent=right;
    el('input-note').textContent=leftNote; el('output-note').textContent=rightNote;
  }
  function showPole(t) {
    const delta=.25*10**(+el('radius').value);
    const at = r => add(pole,polar(r,t)), sq = w => mul(w,w), w=at(delta);
    const approach = pathSamples(at,0,.25), squared = approach.map(sq);
    const left = chart('input',[C(.21,-.29),C(.79,.29)]);
    left.path(pathSamples(a=>add(pole,polar(.25,a)),0,TAU),paint.grid,1.5,'5 5');
    left.path(approach,paint.circle,2); left.arrow(at(.25),w,paint.circle);
    left.marker(pole,paint.pole,'ring'); left.marker(w,paint.ink);
    const right=chart('output', [C(.045,-.25),C(.585,.25)]);
    right.path(pathSamples(a=>sq(add(pole,polar(.25,a))),0,TAU),paint.grid,1.5,'5 5');
    right.path(squared,paint.ellipse,3);right.marker(residue,paint.constant,'diamond');right.marker(sq(w),paint.ink);
    titles('Approach the pole in the input plane','Watch the pole factor cancel',
      'Pink ring · pole x. Gold dot · ϖ. The thin ray shows the approach direction.',
      'Gold dot · (ϖ − x)F(ϖ). Green diamond · ¼. Change the distance and try a different angle.');
    results([['Distance |ϖ − x|',format(delta)],['F(ϖ)',complex(div(sq(w),sub(w,pole)))],['(ϖ − x)F(ϖ)',complex(sq(w))],['Limit as ϖ → x','¼']]);
    el('radius-val').textContent=format(delta);
  }
  function showLoop(g,t) {
    const left=chart('input',[C(-1.25,-.75),C(1.25,.75)]);
    left.path(pathSamples(circle.point,0,TAU),paint.circle,1.8,'4 4');
    left.path(pathSamples(ellipse.point,0,TAU),paint.ellipse,1.8,'7 4');
    left.path(pathSamples(g.point,0,TAU),paint.ink,2.5);
    left.path([circle.point(t),ellipse.point(t)],'#f2e4ff',2,'2 5');
    left.marker(circle.point(t),paint.circle);left.marker(ellipse.point(t),paint.ellipse);
    left.marker(pole,paint.pole,'ring');left.marker(g.point(t),paint.ink,'ring');
    const traces = [circle,ellipse,g].map(sh=>pathSamples(v=>partial(sh,v),0,TAU));
    const right=chart('output',traces.flat());
    right.path(traces[0],paint.circle,1.5,'4 4');right.path(traces[1],paint.ellipse,1.5,'7 4');
    right.path(traces[2],paint.grid,1.7);right.path(pathSamples(v=>partial(g,v),0,t),paint.ink,3);
    right.marker(residue,paint.constant,'diamond');right.marker(partial(g,t),paint.ink);
    titles('One angle on three contours','Different traces, one endpoint',
      'Cyan · small circle. Violet · original ellipse. Gold · blended loop. The pink ring marks x.',
      'The gold trace accumulates the integral on the selected loop. The diamond marks the result of a full turn.');
    results([['Circle point S(t)',complex(circle.point(t))],['Ellipse point Γ₂(t)',complex(ellipse.point(t))],
      ['Blended point C(t)',complex(g.point(t))],['A(t)',complex(partial(g,t))],['A(2π)','¼']]);
  }
  function showTangent(g,t) {
    const h=+el('h').value*Math.PI/180, w=g.point(t), A=partial(g,t),
      velocity=g.tangent(t), factor=factorAt(g,t), rate=mul(factor,velocity);
    const increment=scale(velocity,h), outputIncrement=scale(rate,h);
    const panels=[
      ['input',g.point,w,increment,paint.tangent],
      ['output',v=>partial(g,v),A,outputIncrement,paint.rate]
    ];
    for(const [id,fn,here,inc,color] of panels) {
      const arc=pathSamples(fn,t,t+h,32),all=pathSamples(fn,0,TAU,320);
      const tip=add(here,inc);
      const box=local?[...arc,tip,sub(here,scale(inc,.32)),add(tip,scale(inc,.32))]:all.concat(arc,[tip]);
      const view=chart(id,box,.00001);
      view.path(all,paint.grid,2);view.path(arc,paint.ink,4);
      view.arrow(here,tip,color);view.marker(here,color);view.marker(arc.at(-1),paint.ink,'ring');
    }
    titles('Input · the contour tangent','Output · the integral tangent',
      'Cyan · C′(t)h. The gold arc reaches the actual next contour point.',
      'Pink · A′(t)h. The gold arc reaches the actual next partial sum. Each plot labels its own complex scale.');
    results([['Input tangent C′(t)',complex(velocity)],['Multiplier F(C)/(2πi)',complex(factor)],
      ['Output tangent A′(t)',complex(rate)],['Tangent step A′(t)h',complex(outputIncrement)],
      ['Exact step A(t+h) − A(t)',complex(sub(partial(g,t+h),A))]]);
    el('h-val').textContent=el('h').value+'°';
  }
  function showSum(t) {
    const w=circle.point(t);
    const left=chart('input',[C(.2,-.3),C(.8,.3)]);
    left.path(pathSamples(circle.point,0,TAU),paint.grid,2);
    left.path(pathSamples(circle.point,0,t),paint.ink,3);left.arrow(pole,w,paint.ink);
    left.arrow(w,add(w,scale(circle.tangent(t),.38)),paint.tangent);left.marker(w,paint.ink);left.marker(pole,paint.pole,'ring');
    const trace=pathSamples(v=>partial(circle,v),0,TAU), pieces=modeSum(t);
    const tips=[zero]; for(const v of pieces)tips.push(add(tips.at(-1),v));
    const modeColors = [paint.constant,paint.circle,paint.ellipse];
    if (selectedMode === 'all') {
      const right=chart('output',trace.concat([C(0,-.04),C(.25,.12)]));
      right.path(trace,paint.grid,2);right.path(pathSamples(v=>partial(circle,v),0,t),paint.ink,2.5);
      modeColors.forEach((color,i)=>{
        right.arrow(tips[i],tips[i+1],color);
        right.marker(tips[i+1],color,'ring');
      });
      right.marker(residue,paint.constant,'diamond');right.marker(tips.at(-1),paint.ink);
      titles('Small circle · tangent and radius','Add the three integrated terms',
        'The cyan tangent is the gold radius turned through 90°. Dividing by the radius vector leaves i dt.',
        'Green · constant. Cyan · first harmonic. Violet · second harmonic. The gold tip is their sum.');
    } else {
      const k=Number(selectedMode), contribution=v=>modeSum(v)[k];
      const color=modeColors[k], pts=pathSamples(contribution,0,TAU,240), view=chart('output',pts,.00001);
      view.path(pts,paint.grid,2);view.path(pathSamples(contribution,0,t),color,3);
      view.marker(zero,paint.ellipse,'diamond');view.arrow(zero,contribution(t),color);
      view.marker(contribution(t),color);
      const label=['Constant','First harmonic','Second harmonic'][k];
      const note=['This term advances along the real axis. After 360° its displacement is ¼.',
        'One revolution per input turn. At 180° this term contributes i/(4π).',
        'Two revolutions per input turn. The first closes at 180° and the second at 360°.'][k];
      titles('Small circle · tangent and radius',label+' · accumulated contribution',
        'The cyan tangent and the gold radius advance together as the angle changes.',note);
    }
    results([['Constant contribution',complex(pieces[0])],['First harmonic',complex(pieces[1])],
             ['Second harmonic',complex(pieces[2])],['Accumulated A(T)',complex(tips.at(-1))]]);
  }
  function draw() {
    const t=Number(el('angle').value)*Math.PI/180, lambda=Number(el('blend').value);
    el('angle-val').textContent=el('angle').value+'°';
    el('blend-val').textContent=lambda.toFixed(2);
    if(step==='pole')showPole(t);
    if(step==='loop')showLoop(shape(lambda),t);
    if(step==='tangent')showTangent(shape(lambda),t);
    if(step==='sum')showSum(t);
  }
  function stop() {
    cancelAnimationFrame(playing); playing=0;
    el('play').textContent='Play a turn'; el('play').setAttribute('aria-pressed','false');
  }
  function setStep(name) {
    stop();step=name;
    for(const box of board.querySelectorAll('[data-pane]'))box.hidden=box.dataset.pane!==step;
    for(const btn of board.querySelectorAll('[data-step]'))btn.setAttribute('aria-pressed',String(btn.dataset.step===step));
    el('radius-line').hidden=step!=='pole';el('blend-line').hidden=!['loop','tangent'].includes(step);
    el('modes').hidden=step!=='sum';
    el('h-line').hidden=step!=='tangent';el('zoom').hidden=step!=='tangent';draw();
  }
  board.querySelectorAll('[data-step]').forEach(btn=>btn.addEventListener('click',()=>setStep(btn.dataset.step)));
  board.querySelectorAll('[data-angle]').forEach(btn=>btn.addEventListener('click',()=>{
    stop();el('angle').value=btn.dataset.angle;draw();
  }));
  board.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{
    selectedMode=btn.dataset.mode;
    for(const choice of board.querySelectorAll('[data-mode]'))choice.setAttribute('aria-pressed',String(choice===btn));
    draw();
  }));
  board.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{stop(); draw();}));
  el('zoom').addEventListener('click',()=>{
    local=!local;el('zoom').setAttribute('aria-pressed',String(local));el('zoom').textContent=local?'Show whole curves':'Magnify the local step';draw();
  });
  el('play').addEventListener('click',()=>{
    if(playing){stop();return;}
    const initial=+el('angle').value%360, start=performance.now();let last=-1;
    el('play').textContent='Pause turn';el('play').setAttribute('aria-pressed','true');
    function frame(now) {
      const angle=Math.min(360,initial+Math.floor((now-start)/45));
      if(angle!==last){el('angle').value=angle;draw();last=angle;}
      if(angle===360)stop();else playing=requestAnimationFrame(frame);
    }
    playing=requestAnimationFrame(frame);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  function fromAnchor() {
    const target=[...board.querySelectorAll('[data-step]')].find(btn=>'#'+btn.id===location.hash);
    if(target)setStep(target.dataset.step);
    else if(location.hash==='#bc-cauchy-steps')setStep('pole');
  }
  setStep('pole');fromAnchor();window.addEventListener('hashchange',fromAnchor);
})();
