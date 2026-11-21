/* Linked lesson for legEDMD:subsec-ellipse-growth-legendre-modes. No thesis source is modified. */
(() => {
  'use strict';
  const M=window.EllipseGrowthMath, P=window.EllipseGrowthPlots, $=id=>document.getElementById(id), T=String.raw;
  const state={n:3,r:1.35,t:Math.PI/4,j:0,zoom:1,orthonormal:false};
  const fmt=x=>Math.abs(x)<1e-11?'0':Number(x.toPrecision(6)).toString();
  const complex=z=>`${fmt(z.re)} ${z.im<0?'−':'+'} ${fmt(Math.abs(z.im))}i`;
  let playing=false,frame=0,lastTime=0,mathKey='',mathRevision=0,resizeFrame=0;
  if(!M||!P){$('eg-error').hidden=false;$('eg-error').textContent='The local lesson scripts did not load. Reload this page to try again.';return;}
  function mathError(error){$('eg-error').hidden=false;$('eg-error').textContent='The diagrams are available, but formula rendering failed. Reload this page to try again.';console.error(error);}
  let mathQueue=Promise.resolve(window.MathJax?.startup?.promise).then(()=>{
    if(!window.MathJax?.typesetPromise)throw new Error('MathJax did not load');
    return window.MathJax.typesetPromise([...document.querySelectorAll('.math-static')]);
  }).catch(mathError);
  const explain=window.createMathWindow({title:'Intuitive/geometric explanation'});
  document.querySelectorAll('[data-explain]').forEach(button=>button.addEventListener('click',()=>{
    const template=$('eg-explain-'+button.dataset.explain);
    mathQueue=mathQueue.then(async()=>{window.MathJax.typesetClear([explain.body]);explain.setContent(template.innerHTML);explain.open();await window.MathJax.typesetPromise([explain.body]);}).catch(mathError);
  }));
  $('eg-n').innerHTML=Array.from({length:13},(_,n)=>`<option value="${n}">n = ${n}${n===0?' · constant':''}</option>`).join('');
  function controls(){
    $('eg-n').value=state.n;$('eg-r').value=state.r;$('eg-t').value=state.t*180/Math.PI;$('eg-zoom').value=state.zoom;$('eg-normal').checked=state.orthonormal;
    $('eg-r-value').value=`ϱ = ${fmt(state.r)}`;$('eg-t-value').value=`θ = ${fmt(Math.round(state.t*360/Math.PI)/2)}°`;$('eg-zoom-value').value=fmt(state.zoom)+'×';
    if(document.activeElement!==$('eg-r-number'))$('eg-r-number').value=state.r;
    if(document.activeElement!==$('eg-t-number'))$('eg-t-number').value=Math.round(state.t*360/Math.PI)/2;
    if($('eg-j').options.length!==state.n+1)$('eg-j').innerHTML=Array.from({length:state.n+1},(_,j)=>`<option value="${j}">j = ${j} · m = ${state.n-2*j}</option>`).join('');
    $('eg-j').value=state.j;
    $('eg-regime').textContent=state.r===1?'Radius-one reference: a degenerate interval, not a Hardy ellipse.':'A genuine Bernstein ellipse: ϱ > 1.';
  }
  function labelledValue(label,value){const span=document.createElement('span');const strong=document.createElement('strong');strong.textContent=value;span.append(label+' ',strong);return span;}
  function bar(label,segments,total,ceiling){
    const row=document.createElement('div');row.className='eg-bar-row';
    const head=document.createElement('div');head.className='eg-bar-label';const title=document.createElement('span'),value=document.createElement('strong');title.textContent=label;value.textContent=fmt(total);head.append(title,value);
    const track=document.createElement('div');track.className='eg-bar-track';track.setAttribute('role','img');track.setAttribute('aria-label',`${label}: ${fmt(total)}`);
    segments.forEach(({value,j,color})=>{const el=document.createElement('span');el.className='eg-bar-segment';el.style.width=`${100*value/ceiling}%`;el.style.background=color||P.termColor(j);el.title=j==null?fmt(value):`j = ${j}: ${fmt(value)}`;track.append(el);});row.append(head,track);return row;
  }
  function mathLabels(d){
    const key=[state.n,state.r,state.j,state.orthonormal].join(':');if(key===mathKey)return;mathKey=key;
    const revision=++mathRevision,v=d.terms[state.j],n=state.n,r=state.r,j=state.j,k=Math.abs(v.m),factor=d.normalization;
    const targets=[$('eg-selected-formula'),$('eg-expansion'),$('eg-pair-formula')];
    mathQueue=mathQueue.then(async()=>{
      if(revision!==mathRevision)return;
      window.MathJax.typesetClear(targets);
      const amplitude=state.orthonormal?T`\underbrace{\sqrt{\frac{${2*n+1}}2}}_{\kappa}\,`:'';
      targets[0].style.color=P.termColor(j);
      targets[0].innerHTML=T`\[v_{${j}}=${amplitude}\underbrace{${fmt(v.w)}\cdot ${r}^{${v.m}}}_{w_{${j}}\varrho^{m_{${j}}}}\underbrace{e^{i(${v.m})\theta}}_{\text{unit direction}}.\]`;
      const expansion=d.terms.map(v=>`<span style="color:${P.termColor(v.j)}">${T`\(${v.j?'+':''}\underbrace{${fmt(v.length)}e^{i(${v.m})\theta}}_{j=${v.j}}\)`}</span>`).join('');
      targets[1].innerHTML=expansion;
      const norm=state.orthonormal?T`\kappa\,`:'';
      targets[2].innerHTML=k===0?T`\[m=0:\quad ${norm}w_j\varrho^0=${norm}w_j\cosh(0)=${fmt(v.length)}.\]`:T`\[${norm}w(\varrho^{${k}}+\varrho^{-${k}})=2${norm}w\cosh(${k}s),\qquad w=${fmt(v.w)}.\]`;
      await window.MathJax.typesetPromise(targets);
    }).catch(mathError);
  }
  function render(){
    controls();const d=M.packet(state.n,state.r,state.t,state.orthonormal),v=d.terms[state.j];
    Object.assign($('eg-lab').dataset,{degree:state.n,radius:state.r,angle:state.t,selected:state.j,orthonormal:state.orthonormal});
    $('eg-input').textContent=`Γ = ${complex(d.gamma)} · semiaxes ${fmt(d.semiaxes.a)}, ${fmt(d.semiaxes.b)}`;
    const symbol=state.orthonormal?'P̃':'P';
    $('eg-output').textContent=`${symbol}${state.n}(Γ) = ${complex(d.sum)} · magnitude ${fmt(d.magnitude)}`;
    $('eg-output').dataset.magnitude=d.magnitude;
    $('eg-zoom-note').textContent=state.zoom>1?'Magnified view: some arrows or bound circles may lie outside the frame. Readouts retain the complete sum.':'View fitted to the sum of lengths S. The coarser circle B can extend outside the frame.';
    P.map($('eg-map-plot'),d,state);
    const chainPlot=$('eg-vectors-plot');
    const chain=P.vectors(chainPlot,d,state);
    const transform=chainPlot.getScreenCTM();
    const displayedScale=chain.scale * (transform ? Math.hypot(transform.a,transform.b) : 1);
    const magnification=P.detail($('eg-detail'),d,state,displayedScale);
    $('eg-detail-title').textContent=`Arrow j = ${v.j} · frequency ${v.m}`;
    $('eg-detail-title').style.color=P.termColor(v.j);
    $('eg-detail-scale').textContent=`${fmt(magnification)}× the diagram scale`;
    $('eg-detail-value').textContent=`Hollow tail → pointed tip · length ${fmt(v.length)} · angle ${fmt(v.phase*180/Math.PI)}°`;
    P.hardy($('eg-hardy-plot'),d,state);
    $('eg-selected-values').replaceChildren(labelledValue('Weight w =',fmt(v.w)),labelledValue('Radial factor =',fmt(v.radial)),labelledValue('Arrow length =',fmt(v.length)),labelledValue('Direction angle =',fmt(v.phase*180/Math.PI)+'°'),labelledValue('Contribution =',complex(v)));
    if(!playing){
      $('eg-legend').replaceChildren(...d.terms.map(v=>{const b=document.createElement('button');b.type='button';b.dataset.j=v.j;b.setAttribute('aria-pressed',String(v.j===state.j));b.setAttribute('aria-label',`Inspect term j ${v.j}, frequency ${v.m}`);b.innerHTML=`<span class="eg-swatch" style="--term:${P.termColor(v.j)}"></span>j = ${v.j} · m = ${v.m}`;return b;}));
      $('eg-term-table').innerHTML=d.terms.map(v=>`<tr><td><span class="eg-swatch" style="--term:${P.termColor(v.j)}"></span>j = ${v.j}</td><td>${v.m}</td><td>${fmt(v.w)}</td><td>${fmt(v.radial)}</td><td>${fmt(v.length)}</td><td>${fmt(v.phase*180/Math.PI)}°</td></tr>`).join('');
    }
    mathLabels(d);
    $('eg-bound-normalization').textContent=state.orthonormal?`Orthonormal display: lengths and both envelopes are multiplied by κ = ${fmt(d.normalization)}. Proof formulas use the base Pₙ.`:'Unnormalised Pₙ · every bar below uses the same horizontal scale.';
    const segments=key=>d.terms.map(v=>({j:v.j,value:v[key]}));
    $('eg-bound-bars').replaceChildren(bar('1 · Resultant magnitude', [{value:d.magnitude,color:'var(--ink)'}],d.magnitude,d.B),bar('2 · Sum of original lengths S',segments('length'),d.S,d.B),bar('3 · Paired average: same total S',segments('symmetricLength'),d.S,d.B),bar('4 · Replace each |m| by n: ceiling B',segments('coarseLength'),d.B,d.B));
    const gap1=Math.max(0,d.S-d.magnitude),gap2=Math.max(0,d.B-d.S);
    $('eg-bound-values').textContent=`${fmt(d.magnitude)} ≤ ${fmt(d.S)} = ${fmt(d.symmetricS)} ≤ ${fmt(d.B)}. Cancellation gap: ${fmt(gap1)}. Frequency gap: ${fmt(gap2)}.`;
    $('eg-bound-values').dataset.cancellationGap=gap1;$('eg-bound-values').dataset.frequencyGap=gap2;
    const partner=d.terms[state.n-state.j],pair=v.j===partner.j?[v]:[v,partner].sort((a,b)=>a.j-b.j),pairTotal=pair.reduce((sum,v)=>sum+v.length,0);
    $('eg-pair-bars').replaceChildren(bar(pair.length===1?'Central zero-frequency term':'Selected reciprocal pair · before averaging',pair.map(v=>({j:v.j,value:v.length})),pairTotal,pairTotal),bar('Same pair · after averaging',pair.map(v=>({j:v.j,value:v.symmetricLength})),pairTotal,pairTotal));
    $('eg-current-energy').textContent=fmt(d.magnitude*d.magnitude);$('eg-hardy-mean').textContent=fmt(d.h2Squared);$('eg-hardy-mean').dataset.value=d.h2Squared;$('eg-hardy-value').textContent=`${fmt(d.h2)} ≤ ${fmt(d.h2Bound)}`;
    const energyCeiling=d.h2LooseSquared;
    $('eg-hardy-bars').replaceChildren(bar('1 · Parseval: sum of squared lengths',segments('energy'),d.h2Squared,energyCeiling),bar('2 · Replace w² by w',segments('weightEnergyBound'),d.h2WeightBoundSquared,energyCeiling),bar('3 · Pair, then replace |m| by n',d.terms.map(v=>({j:v.j,value:d.normalization*d.normalization*v.w*Math.cosh(2*state.n*d.s)})),energyCeiling,energyCeiling));
    const residual=Math.hypot(d.sum.re-d.normalization*d.recurrence.re,d.sum.im-d.normalization*d.recurrence.im);
    $('eg-check').textContent=`Laurent sum versus independent Legendre recurrence: absolute difference ${residual.toExponential(2)}. Floating-point diagnostic; the inequalities above supply the proof.`;
  }
  function pause(){playing=false;cancelAnimationFrame(frame);lastTime=0;$('eg-play').textContent='▶ Play';$('eg-play').setAttribute('aria-pressed','false');for(const id of ['eg-selected-values','eg-bound-values'])$(id).setAttribute('aria-live','polite');}
  function setParameter(key,value){if(!Number.isFinite(value))return;pause();state[key]=value;state.j=Math.min(state.j,state.n);render();}
  $('eg-n').addEventListener('change',e=>setParameter('n',+e.target.value));
  $('eg-j').addEventListener('change',e=>setParameter('j',+e.target.value));
  $('eg-r').addEventListener('input',e=>setParameter('r',+e.target.value));
  $('eg-t').addEventListener('input',e=>setParameter('t',+e.target.value*Math.PI/180));
  $('eg-zoom').addEventListener('input',e=>setParameter('zoom',+e.target.value));
  for(const [id,key,min,max,convert]of [['eg-r-number','r',1,2.5,x=>x],['eg-t-number','t',0,360,x=>x*Math.PI/180]]){
    $(id).addEventListener('input',e=>{const x=e.target.valueAsNumber;if(Number.isFinite(x)&&x>=min&&x<=max)setParameter(key,convert(x));});
    $(id).addEventListener('change',e=>{let x=e.target.valueAsNumber;if(!Number.isFinite(x))x=key==='r'?state.r:state.t*180/Math.PI;x=Math.min(max,Math.max(min,x));setParameter(key,convert(x));e.target.value=x;});
  }
  $('eg-film-example').addEventListener('click',()=>{
    pause();
    Object.assign(state,{n:3,r:2,t:Math.PI/6,j:3,zoom:1,orthonormal:false});
    render();
  });
  $('eg-normal').addEventListener('change',e=>{pause();state.orthonormal=e.target.checked;render();});
  $('eg-unit').addEventListener('click',()=>setParameter('r',1));$('eg-align').addEventListener('click',()=>setParameter('t',0));
  $('eg-legend').addEventListener('click',e=>{const b=e.target.closest('[data-j]');if(b)setParameter('j',+b.dataset.j);});
  $('eg-play').addEventListener('click',()=>{
    if(playing){pause();render();return;}playing=true;lastTime=0;$('eg-play').textContent='Pause';$('eg-play').setAttribute('aria-pressed','true');for(const id of ['eg-selected-values','eg-bound-values'])$(id).setAttribute('aria-live','off');
    function tick(time){if(!playing)return;if(lastTime){state.t+=Math.min(.08,(time-lastTime)/1000)*Math.PI/8;if(state.t>=2*Math.PI){state.t=2*Math.PI;pause();render();return;}}lastTime=time;render();frame=requestAnimationFrame(tick);}if(state.t>=2*Math.PI)state.t=0;frame=requestAnimationFrame(tick);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(render);}).observe(document.querySelector('.eg-content'));
  render();
})();
