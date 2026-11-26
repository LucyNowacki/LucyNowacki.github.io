/* Synchronous linked geometry for the angular Hardy estimate. */
(() => {
  'use strict';
  const M = window.CoefficientMath;
  const tau = M.TAU;
  const id = name => document.getElementById('het-' + name);
  const ink = {circle:'#66e5f4', outer:'#d4a1ff', input:'#5de5ef', kernel:'#fa8acf',
    target:'#ffd16e', interval:'#ff6678', text:'#f7edff', faint:'#866a97', guide:'#645475'};
  const fmt = x => x === 0 ? '0' : Math.abs(x) < 0.0001 || Math.abs(x) >= 10000 ? x.toExponential(3) : Number(x.toPrecision(5)).toString();
  const pt = (x, y) => [x, y];
  const polarPoint = (o, scale, z) => pt(o[0] + scale * z.re, o[1] - scale * z.im);
  function xy(z) {
    const eps = Math.max(Math.abs(z.re), Math.abs(z.im)) * 1e-14;
    const re = Math.abs(z.re) < eps ? 0 : z.re, im = Math.abs(z.im) < eps ? 0 : z.im;
    return fmt(re) + (im < 0 ? ' − ' : ' + ') + fmt(Math.abs(im)) + 'i';
  }
  function samples(start, end, count, fn) {
    return Array.from({length:count + 1}, (_, i) => fn(start + i * (end - start) / count));
  }
  function shape(points, stroke, width=2, fill='none', extra='') {
    const d = points.map(([x,y],i) => (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2)).join(' ');
    return '<path d="' + d + '" stroke="' + stroke + '" stroke-width="' + width + '" fill="' + fill + '" ' + extra + '/>';
  }
  function dot([x,y], colour, size=4.2) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + size + '" fill="' + colour + '" stroke="#180d25" stroke-width="1.6"/>';
  }
  function label([x,y], text, colour=ink.text, anchor='middle') {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" fill="' + colour + '">' + text + '</text>';
  }
  function arrow(p, q, colour) {
    const angle = Math.atan2(q[1]-p[1], q[0]-p[0]);
    const wing = side => [q[0]-7*Math.cos(angle + side*0.48), q[1]-7*Math.sin(angle + side*0.48)];
    return shape([p,q],colour,2.3) + shape([wing(-1),q,wing(1)],colour,2.3);
  }
  function directed(p, tangent, pixels, colour) {
    const scale = pixels/M.abs(tangent);
    return arrow(p,[p[0]+scale*tangent.re,p[1]-scale*tangent.im],colour);
  }
  function rim(o, scale, R, colour) {
    return shape(samples(0,tau,112,t=>polarPoint(o,scale,M.gamma(R,t))),colour,2.2);
  }
  function foci(o, scale) {
    const p=pt(o[0]-scale,o[1]), q=pt(o[0]+scale,o[1]);
    return shape([p,q],ink.interval,2.5)+dot(p,ink.interval,2.6)+dot(q,ink.interval,2.6);
  }
  function map(t,R) {
    const left=pt(96,106), right=pt(333,106), scale=71/R;
    const z=M.polar(R,t), w=M.gamma(R,t);
    const p=polarPoint(left,scale,z), q=polarPoint(right,scale,w);
    id('map').innerHTML=shape([p,q],ink.guide,1.6,'none','stroke-dasharray="4 5"') +
      shape(samples(0,tau,96,u=>polarPoint(left,scale,M.polar(R,u))),ink.circle) +
      rim(right,scale,R,ink.outer) + foci(right,scale) +
      shape([left,p],ink.faint,1.3) + shape([right,q],ink.faint,1.3) +
      directed(p,M.mul(M.C(0,1),z),20,ink.circle) + directed(q,M.tangent(R,t),20,ink.outer) +
      dot(p,ink.target) + dot(q,ink.target) + label([96,209],'|z| = '+fmt(R),ink.circle) +
      label([333,209],'Outer ellipse · R = '+fmt(R),ink.outer);
    id('map-values').textContent='z = '+xy(z)+'  →  ω = '+xy(w)+'. Equal coordinate scales. Arrows show direction.';
  }
  function kernelData(n,R,L) {
    const terms=M.qTerms(n,R,L);
    const lag = Array.from({length:L+1}, (_,d)=>terms.slice(d).reduce((v,c,i)=>v+c.amplitude*terms[i].amplitude,0));
    const a=(R**2+R**-2)/4;
    // Coefficient of exp(2idθ) after multiplication by the squared speed.
    const h=lag.map((v,d)=>a*v-0.25*((lag[Math.abs(d-1)]||0)+(lag[d+1]||0)));
    const value=t=>M.abs2(M.evaluateTerms(terms,t))*M.abs2(M.tangent(R,t));
    const arc=t=>t===tau?h[0]:(h[0]*t+h.slice(1).reduce((v,c,i)=>v+c*Math.sin(2*(i+1)*t)/(i+1),0))/tau;
    return {terms, mean:h[0],value,arc,peak:(a+0.5)*terms.reduce((v,c)=>v+c.amplitude,0)**2};
  }
  function inputData(R) {
    const a=(R**2+R**-2)/4, mean=M.norms('square',R).h2**2;
    return {mean,peak:(a+0.5)**2,value:t=>(a+0.5*Math.cos(2*t))**2,
      arc:t=>t===tau?mean:(t*mean+a*Math.sin(2*t)/2+Math.sin(4*t)/32)/tau};
  }
  function hump(t,R,data,colour) {
    const o=pt(220,109), length=43;
    const scale=Math.min(125/((R+1/R)/2),58/((R-1/R)/2));
    const foot=u=>polarPoint(o,scale,M.gamma(R,u));
    const ridge=u=>{
      const v=M.tangent(R,u), f=foot(u), h=length*data.value(u)/data.peak/M.abs(v);
      return [f[0]+h*v.im,f[1]+h*v.re];
    };
    const lo=t-0.49, hi=t+0.49, local=samples(lo,hi,54,ridge);
    id('hump').innerHTML=rim(o,scale,R,ink.outer)+foci(o,scale)+
      shape([...samples(hi,lo,54,foot),...local], 'none',0,colour,'fill-opacity=".20"')+
      shape(local,colour,2.4)+shape([foot(t),ridge(t)],colour,2.4)+dot(foot(t),ink.target)+dot(ridge(t),colour,3);
  }
  function profile(target,data,phase,colour,{pair=false,modulus=false}={}) {
    const w=pair||modulus?440:600, h=pair?194:modulus?210:136;
    const x0=87, x1=w-20, y0=18, y1=h-27;
    const x=t=>x0+(x1-x0)*t/tau;
    const y=v=>pair?(y0+y1)/2-v/data.peak*(y1-y0)/2:y1-v/data.peak*(y1-y0);
    const base=y(0), point=t=>pt(x(t),y(data.value(t)));
    const curve=samples(0,tau,Math.max(301,pair?240:440),point);
    const visited=samples(0,phase,Math.max(1,Math.ceil(curve.length*phase/tau)),point);
    target.innerHTML=shape([[x0,y0],[x0,y1],[x1,y1]],ink.guide,1)+
      (pair?shape([[x0,base],[x1,base]],ink.guide,1):'')+
      shape([[x0,base],...visited,[x(phase),base]],'none',0,colour,'fill-opacity=".16"')+
      shape([[x0,y(data.mean)],[x1,y(data.mean)]],ink.target,1.5,'none','stroke-dasharray="5 4"')+
      shape(curve,colour,2.15)+shape([[x(phase),base],point(phase)],ink.text,1.1)+dot(point(phase),ink.target)+
      label([x0,y1+19],'0')+label([x((tau)/2),y1+19],'π')+label([x1,y1+19],'2π')+
      label([x0-5,y0+4],fmt(data.peak),ink.faint,'end')+
      label([x0-5,base+4],'0',ink.faint,'end');
  }
  function tailDiagram(R,r,t,N) {
    const a=(R+1/R)/2, o=pt(220,112), scale=Math.min(148/a,73/((R-1/R)/2));
    const out=polarPoint(o,scale,M.gamma(R,t)), inner=polarPoint(o,scale,M.gamma(r,t));
    id('nested').innerHTML=rim(o,scale,R,ink.outer)+rim(o,scale,r,ink.target)+foci(o,scale)
      +shape([out,inner],ink.circle,2,'none','stroke-dasharray="3 3"')+dot(out,ink.outer)+dot(inner,ink.target)
      +label([118,220],'Outer ellipse · R = '+fmt(R),ink.outer)+label([313,220],'Target ellipse · r = '+fmt(r),ink.target);
    const w=M.gamma(r,t), p2=M.scale(M.sub(M.scale(M.mul(w,w),3),M.C(1)),0.5);
    const error=N<=2?2*M.abs(p2)/3:0;
    const semi=(r+1/r)/2, sup=N<=2?semi*semi-1/3:0;
    const H=M.norms('square',R).h2, e=M.tailBound(N,r,R,H);
    id('target-radii').textContent='Circle radii R = '+fmt(R)+' and r = '+fmt(r)+'. For error throughout E('+fmt(r)+'), q = r/R = '+fmt(r/R)+'.';
    id('target-error').textContent=N<=2?'Omitted polynomial (2/3)P₂. Error at the moving point = '+fmt(error)+'. Largest error throughout the inner ellipse = '+fmt(sup)+' at its real tips.':'Both nonzero terms are retained. The error at the moving point and throughout the inner ellipse is exactly zero.';
    id('target-envelope').textContent='For this f, outer Hardy norm ≈ '+fmt(H)+'. The infinite-tail bound throughout E('+fmt(r)+') is '+fmt(e)+'.';
  }
  function bounds(R,n,L,t) {
    const {h2,hinf}=M.norms('square',R), data={peak:hinf,mean:h2,value:u=>M.abs2(M.gamma(R,u))};
    profile(id('bound-plot'),data,t,ink.input,{modulus:true});
    id('bound-size').textContent='At this point |f| = '+fmt(data.value(t))+'. Peak = '+fmt(hinf)+'. Dashed line = Hardy root mean square '+fmt(h2)+'.';
    const density=M.contourDensity('square',n,R,t,L);
    id('bound-local').textContent='For the first '+L+' kernel terms, the complex contour contribution here is '+xy(density)+'. Its angular mean uses the oriented tangent. Cauchy–Schwarz bounds the complete contour mean using both full energies.';
    const c=M.constants(R), pref=(2*n+1)*R**-n, actual=M.exactSquareCoefficient(n);
    id('bound-result').textContent='Degree '+n+' on E('+fmt(R)+'). Exact |aₙ| = '+(n===2?'2/3':n===0?'1/3':fmt(actual))+'. Hardy ceiling ≈ '+fmt(pref*h2*c.C2)+'. Lesson 6 supremum ceiling ≈ '+fmt(pref*hinf*c.CinfApprox)+' (perimeter by quadrature).';
  }
  window.createHardyBoundaryLab = (root, update) => {
    let key='', kernel, matrixKey='', tableStart=0, i=0, j=1, stage='contour', layer='input';
    let angle=45, frame=0,startTime=0, startAngle=0;
    let current, savedView;
    function setPressed(group,attribute,value) {
      group.querySelectorAll('['+attribute+']').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute(attribute)===value)));
    }
    function matrix(state,t) {
      const {L,R,n}=state, terms=kernel.terms;
      i=Math.min(i,L-1);j=Math.min(j,L-1);
      tableStart=Math.min(tableStart,Math.max(0,L-5));
      const end=Math.min(tableStart+5,L), visible=terms.slice(tableStart,end);
      const newKey=[key,tableStart,i,j].join(':');
      if(matrixKey!==newKey){
        const head='<tr><th scope="col">k ∖ k′</th>'+visible.map(v=>'<th scope="col">'+v.k+'</th>').join('')+'</tr>';
        const rows=visible.map((row,ri)=>'<tr><th scope="row">'+row.k+'</th>'+visible.map((col,cj)=>{
          const a=tableStart+ri,b=tableStart+cj,delta=Math.abs(ri-cj),selected=a===i&&b===j;
          const symbol=delta===0?'+':delta===1?'−':'0';
          return '<td><button type="button" class="het-cell het-band-'+Math.min(2,delta)+'" aria-pressed="'+selected+'" aria-label="Row '+row.k+', column '+col.k+'" data-het-i="'+a+'" data-het-j="'+b+'">'+symbol+'</button></td>';
        }).join('')+'</tr>').join('');
        const nav=L>5?'<div class="het-switch"><button type="button" data-het-page="-1" '+(!tableStart?'disabled':'')+'>Earlier modes</button><button type="button" data-het-page="1" '+(end===L?'disabled':'')+'>Later modes</button></div>':'';
        const slot=id('matrix-slot'), focused=slot.contains(document.activeElement);
        slot.innerHTML='<table aria-label="Weighted angular mean of each ordered pair"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table>'+nav;
        if(focused)slot.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
        id('matrix-key').textContent='Rows and columns show angular frequencies. Positive diagonal · negative neighbours · zero elsewhere. Showing '+visible.length+' of '+L+' modes.';
        matrixKey=newKey;
      }
      const row=terms[i],col=terms[j],delta=col.k-row.k,prod=row.amplitude*col.amplitude;
      const a=(R**2+R**-2)/4, factor=delta===0?a:Math.abs(delta)===2?-.25:0;
      const W=u=>M.abs2(M.tangent(R,u));
      const real=u=>prod*W(u)*Math.cos(delta*u), imaginary=prod*W(t)*Math.sin(delta*t);
      const data={peak:(a+.5)*prod,mean:factor*prod,value:real};
      profile(id('pair-wave'),data,t,delta===0?ink.circle:ink.kernel,{pair:true});
      id('pair-caption').textContent='Row '+row.k+' × column '+col.k+' on the outer boundary';
      id('pair-coeff').textContent='Mode '+row.k+' has amplitude '+fmt(row.amplitude)+'. Mode '+col.k+' has amplitude '+fmt(col.amplitude)+'. Product = '+fmt(prod)+'. Frequency difference = '+delta+'.';
      id('pair-values').textContent='Complex contribution here ≈ '+xy(M.C(real(t),imaginary))+'. Dashed line = full-turn mean '+fmt(data.mean)+'. '+(delta===0?'This square contributes to D.':Math.abs(delta)===2?'Its reflected square supplies the other half of the neighbour correction.':'The moving wave averages to zero through a complete turn.');
    }
    function paint() {
      if(!current)return;
      const {view,R,r,n,L,N}=current, t=angle*Math.PI/180;
      id('theta').value=Math.round(angle);id('theta-value').value=Math.round(angle)+'°';
      if(view==='tail') {tailDiagram(R,r,t,N); return;}
      if(stage==='bound'){bounds(R,n,L,t); return;}
      if(key!==[n,R,L].join(':')){key=[n,R,L].join(':');kernel=kernelData(n,R,L);matrixKey=''}
      if(stage==='pairs'){matrix(current,t);return;}
      map(t,R);
      const input=layer==='input', info=input?inputData(R):kernel, color=input?ink.input:ink.kernel;
      hump(t,R,info,color);profile(id('profile'),info,t,color);
      id('hump-values').textContent=(input?'Quadratic f(ω) = ω². At this point |f|² = ':'Tangent-weighted finite kernel. At this point |Qₙ,ₗ Γ′|² = ')+fmt(info.value(t))+'. Tangent speed |Γ′| = '+fmt(M.abs(M.tangent(R,t)))+'.';
      id('arc-values').textContent='Collected over 0–'+Math.round(angle)+'° ≈ '+fmt(info.arc(t))+'. Full-turn '+(input?'input mean square':'finite kernel energy qₗ')+' ≈ '+fmt(info.mean)+'.';
    }
    function stop() {cancelAnimationFrame(frame);frame=0;id('play').textContent='Play one turn';id('play').setAttribute('aria-pressed','false');}
    function tick(time) {
      if(!startTime) startTime=time;
      angle=Math.min(360,startAngle+(time-startTime)*.026);
      paint();
      if(angle>=360){stop();return;}
      frame=requestAnimationFrame(tick);
    }
    function sync(state) {
      if(savedView!==state.view) {stop();savedView=state.view;}
      current=state;
      const energy=state.view==='energy';
      id('energy-tabs').hidden=!energy;
      for(const pane of ['contour','pairs','bound','target']) id(pane).hidden=!(energy?stage===pane:pane==='target');
      setPressed(id('energy-tabs'),'data-het-stage',stage);
      setPressed(id('contour'),'data-het-layer',layer);
      setPressed(id('target'),'data-het-count',String(state.N));
      paint();
    }
    root.addEventListener('click',e=>{
      const b=e.target.closest('button');
      if(!b) return;
      if(b.dataset.hetStage){stage=b.dataset.hetStage;sync(current);}
      else if(b.dataset.hetLayer){layer=b.dataset.hetLayer;sync(current);}
      else if(b.dataset.hetI!==undefined){i=Number(b.dataset.hetI);j=Number(b.dataset.hetJ);paint();}
      else if(b.dataset.hetPage){tableStart=Math.max(0,Math.min(current.L-5,tableStart+Number(b.dataset.hetPage)*4));i=tableStart;j=Math.min(i+1,current.L-1);paint();}
      else if(b.dataset.hetCount){update({N:Number(b.dataset.hetCount)});}
    });
    id('theta').addEventListener('input',()=>{stop();angle=Number(id('theta').value);paint();});
    id('play').addEventListener('click',()=>{
      if(frame){stop();return;}
      startAngle=angle>=360?0:angle;startTime=0;id('play').textContent='Pause';id('play').setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);
    });
    id('worked').addEventListener('click',()=>{stop();angle=45;tableStart=i=0;j=1;update({R:1.5,r:1.2,n:2,L:3,N:2});});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    function visitChapter(hash) {
      const chapters={'angular-energy':'contour','contour-pairing':'bound','three-diagonals':'pairs','projection-tail':'target'};
      const next=chapters[hash.slice(1)];
      if(!next)return;
      if(next!=='target')stage=next;
      update({view:next==='target'?'tail':'energy'});
      requestAnimationFrame(()=>id(next).scrollIntoView({block:'start'}));
    }
    return {sync,visitChapter};
  };
})();
