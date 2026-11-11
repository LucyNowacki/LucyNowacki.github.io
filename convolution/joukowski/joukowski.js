/* Linked coefficient, Fourier and generating-series views. All calculations
   use the pure engine; SVG sampling is only for drawing the trajectories. */
(() => {
  'use strict';
  const M = window.JoukowskiMath, $ = id => document.getElementById(id);
  const C = { positive:'#65d6e8', negative:'#ffbd83', degree:'#d8acff', pair:'#c2e995', gold:'#ffd36f', muted:'#aa95bd' };
  const S = { n:3, j:1, r:1.3, t:40*Math.PI/180, mag:1, phi:0, rho:.55, N:8, tab:'lesson', playing:false, seriesZoom:1, seriesOrigin:false };
  const examples = { cubic:[3,1,1.3], quadratic:[2,0,1.3], linear:[1,0,1.4], constant:[0,0,1.3], higher:[6,1,1.2] };
  const tabs = ['lesson','together','lattice','geometry','series'];
  const cardHomes = [];
  const TAU = 2*Math.PI, T = String.raw;
  const fmt = (x,d=4) => Math.abs(x)<1e-11 ? '0' : Number(x.toPrecision(d)).toString();
  const signed = k => k>0 ? '+'+k : String(k);
  const complex = z => `${fmt(z.re,6)} ${z.im<0?'−':'+'} ${fmt(Math.abs(z.im),6)}i`;
  const amp = () => M.polar(S.mag,S.phi);
  const colour = k => k>0?C.positive:k<0?C.negative:C.degree;
  const gcd = (a,b) => b?gcd(b,a%b):a;
  function fraction(x,n,latex=false) { const d=4**n, v=Math.round(x*d), g=gcd(v,d); return d/g===1?String(v/g):latex?T`\frac{${v/g}}{${d/g}}`:`${v/g}/${d/g}`; }
  const tex = body => T`\(${body}\)`;
  const tint = (color,body) => T`{\color{${color}}${body}}`;
  let mathQueue = Promise.resolve(), popup, lesson, popupTopic=null, animation, lastTime=0, renderedMathKey='';
  function typeset(nodes) {
    mathQueue = mathQueue.catch(()=>{}).then(async()=>{
      if (!window.MathJax?.startup?.promise) return;
      await MathJax.startup.promise;
      await MathJax.typesetPromise(nodes.filter(Boolean));
    }).catch(error => { $('app-error').hidden=false; $('app-error').textContent='The diagrams are available, but some formulas could not be typeset. Reload to retry.'; console.error(error); });
  }
  function setMath(id,body) {
    const el=$(id); if(window.MathJax?.typesetClear) MathJax.typesetClear([el]);
    el.innerHTML=body; return el;
  }
  function text(x,y,label,attr='') { return `<text x="${x}" y="${y}" ${attr}>${label}</text>`; }
  function line(x,y,x2,y2,attr='') { return `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" ${attr}/>`; }
  function dot(x,y,r,color,attr='') { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${attr}/>`; }
  function plane(width,height,bound) {
    bound=Math.max(bound,.01); const cx=width/2,cy=height/2,scale=Math.min(width-102,height-82)/(2*bound);
    const X=x=>cx+x*scale,Y=y=>cy-y*scale;
    const tick=bound/2;
    let base='';
    for(const x of [-tick,tick]) base+=line(X(x),30,X(x),height-28,'class="grid"')+text(X(x),cy+18,fmt(x,3),'text-anchor="middle"');
    for(const y of [-tick,tick]) base+=line(40,Y(y),width-30,Y(y),'class="grid"')+text(cx-8,Y(y)-4,fmt(y,3),'text-anchor="end"');
    base+=line(38,cy,width-25,cy,'class="axis"')+line(cx,height-28,cx,24,'class="axis"')+text(width-22,cy-8,'Re','text-anchor="end"')+text(cx+9,25,'Im')+text(cx-7,cy+17,'0','text-anchor="end"');
    return {X,Y,scale,base,path:points=>points.map((z,i)=>(i?'L':'M')+X(z.re).toFixed(2)+','+Y(z.im).toFixed(2)).join(' ')};
  }
  function arrow(P,a,b,color,width=2,dashed=false) {
    const x=P.X(a.re),y=P.Y(a.im),xx=P.X(b.re),yy=P.Y(b.im),len=Math.hypot(xx-x,yy-y);
    if(len<1)return dot(xx,yy,3,color);
    const dx=(xx-x)/len,dy=(yy-y)/len,size=Math.min(8,len*.45);
    return line(x,y,xx,yy,`stroke="${color}" stroke-width="${width}" ${dashed?'stroke-dasharray="4 4"':''}`)+`<path d="M${xx},${yy} L${xx-size*dx+size*.45*dy},${yy-size*dy-size*.45*dx} L${xx-size*dx-size*.45*dy},${yy-size*dy+size*.45*dx} Z" fill="${color}"/>`;
  }
  function curve(P,points,color,extra='') {return `<path d="${P.path(points)}" fill="none" stroke="${color}" stroke-width="2" ${extra}/>`;}
  function ring(P,z,color=C.gold,r=7) { return dot(P.X(z.re),P.Y(z.im),r,'none',`stroke="${color}" stroke-width="2"`); }
  const zero={re:0,im:0};

  function renderLattice() {
    const size=Math.max(5,S.n+1), step=320/size, X=p=>64+p*step,Y=q=>360-q*step;
    const term=M.terms(S.n,S.r,S.t)[S.j], k=term.k;
    let out='';
    for(let p=0;p<=size;p++)out+=line(X(p),Y(0),X(p),Y(size),'class="grid"')+line(X(0),Y(p),X(size),Y(p),'class="grid"');
    out+=line(X(0),Y(0),X(size)+15,Y(0),'class="axis"')+line(X(0),Y(0)+5,X(0),Y(size)-12,'class="axis"');
    out+=text(X(size)+24,Y(0)+6,'p','class="plot-label"')+text(X(0)-8,Y(size)-18,'q','class="plot-label"');
    for(let m=0;m<=size;m++){out+=text(X(m),Y(0)+21,m,'text-anchor="middle"'); if(m)out+=text(X(0)-12,Y(m)+4,m,'text-anchor="end"');}
    // Frequency lines have slope +1. Highlight the selected p-q=k crossing.
    for(let f=-size;f<=size;f++) {
      if(f!==k && Math.abs(f-k)>2)continue;
      const p0=Math.max(f,0),q0=Math.max(-f,0),span=size-Math.abs(f);
      out+=line(X(p0),Y(q0),X(p0+span),Y(q0+span),`stroke="${C.pair}" stroke-width="${f===k?2:1}" stroke-opacity="${f===k?.9:.2}" stroke-dasharray="5 5"`);
    }
    out+=line(X(0),Y(S.n),X(S.n),Y(0),`stroke="${C.degree}" stroke-width="4" stroke-opacity=".8"`);
    for(let p=0;p<=size;p++)for(let q=0;q<=size;q++) {
      if(p+q>12)continue;
      const chosen=p===term.p&&q===term.q,on=p+q===S.n;
      out+=`<g class="point" role="button" tabindex="0" data-p="${p}" data-q="${q}" aria-label="p ${p}, q ${q}; degree ${p+q}, frequency ${p-q}" aria-pressed="${chosen}"><circle cx="${X(p)}" cy="${Y(q)}" r="${Math.max(11,step*.26)}" fill="transparent"/>`;
      out+=dot(X(p),Y(q),chosen?7:on?5:2.3,on?C.degree:'#806b91','class="point-head"');
      if(chosen)out+=dot(X(p),Y(q),12,'none',`stroke="${C.gold}" stroke-width="2.5"`);
      else if(S.tab==='together'&&p===term.q&&q===term.p)out+=dot(X(p),Y(q),10,'none',`stroke="${C.pair}" stroke-width="2" stroke-dasharray="3 3" data-reciprocal="true"`);
      out+='</g>';
    }
    out+=text(80,402,`p + q = ${S.n} selects u${sup(S.n)}; p − q = ${signed(k)} selects the frequency.`,`class="plot-label"`);
    $('lattice-plot').innerHTML=out;
    $('lattice-note').textContent=`${S.n+1} terms on this diagonal. Gold ring: (p, q) = (${term.p}, ${term.q}). Points with p + q ≤ 12 are selectable.`;
  }
  function sup(n){return String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');}
  function renderTable(terms) {
    $('term-rows').innerHTML=terms.map(v=>`<tr aria-selected="${v.j===S.j}"><td>${v.j}</td><td>(${v.p}, ${v.q})</td><td style="color:${colour(v.k)}">${signed(v.k)}</td><td>${fraction(v.weight,S.n)}</td><td><button type="button" data-j="${v.j}" aria-pressed="${v.j===S.j}" aria-label="Select term j ${v.j}, frequency ${v.k}">${v.j===S.j?'Selected':'Inspect'}</button></td></tr>`).join('');
  }
  function renderSpectrum(terms) {
    const compact=S.tab==='together',left=45,right=compact?545:965,base=167,n=Math.max(S.n,1),X=k=>left+(k+n+.5)/(2*n+1)*(right-left);
    const max=2*Math.max(...terms.map(v=>v.weight*v.radial)),Y=value=>base-115*value/max;
    $('spectrum-plot').setAttribute('viewBox',`0 0 ${compact?580:1000} 225`);
    let out=line(left,base,right,base,'class="axis"')+line(left,Y(max),right,Y(max),'class="grid"')+text(left-6,Y(max)+4,fmt(max,3),'text-anchor="end"');
    out+=text(left,21,compact?'Magnitude |Cⱼ| · fixed as t changes':'Coefficient magnitude |A αⱼ αₙ₋ⱼ rᵏ|','class="plot-label"');
    for(const v of terms) {
      const height=M.abs(v.coefficient),x=X(v.k),y=Y(height),color=colour(v.k),sel=v.j===S.j;
      out+=`<g class="point" role="button" tabindex="0" data-j="${v.j}" aria-label="Select frequency ${v.k}, coefficient magnitude ${fmt(height,6)}" aria-pressed="${sel}">`+line(x,base,x,y,`stroke="${color}" stroke-width="${sel?4:2.5}"`)+dot(x,y,5,color,'class="point-head"');
      if(sel)out+=dot(x,y,9,'none',`stroke="${C.gold}" stroke-width="2"`);
      else if(compact&&v.j===S.n-S.j)out+=dot(x,y,8,'none',`stroke="${C.pair}" stroke-width="2" stroke-dasharray="3 3" data-reciprocal="true"`);
      out+=text(x,base+23,signed(v.k),'text-anchor="middle"');
      if(S.n<=6||sel)out+=text(x,y-12,fmt(height,3),`text-anchor="middle" class="value-label" style="fill:${color}"`);
      out+='</g>';
    }
    out+=text(right,210,'Frequency k','text-anchor="end"');
    $('spectrum-plot').innerHTML=out;
    $('spectrum-count').textContent=`${S.n+1} frequencies · ${S.n%2?'odd':'even'} parity`;
  }
  function renderGeometry(terms,A) {
    const pair=M.pair(S.n,S.j,S.r,S.t,A),P=plane(500,420,Math.max(.1,2*pair.baseAxisA)*1.12);
    let out=P.base;
    if(!pair.constant) {
      const rp=pair.weight*S.r**pair.k*S.mag,rn=pair.weight*S.r**(-pair.k)*S.mag;
      out+=`<circle cx="${P.X(0)}" cy="${P.Y(0)}" r="${rp*P.scale}" fill="none" stroke="${C.positive}" stroke-dasharray="3 5" opacity=".5"/><circle cx="${P.X(0)}" cy="${P.Y(0)}" r="${rn*P.scale}" fill="none" stroke="${C.negative}" stroke-dasharray="3 5" opacity=".7"/>`;
      const path=Array.from({length:361},(_,i)=>M.pair(S.n,S.j,S.r,TAU*i/(360*pair.k),A).sum);
      out+=curve(P,path,C.pair,'stroke-opacity=".8"');
      out+=arrow(P,zero,pair.negative,C.negative,1.5,true)+arrow(P,zero,pair.positive,C.positive,2.5)+arrow(P,pair.positive,pair.sum,C.negative,2.5)+arrow(P,zero,pair.sum,C.pair,3);
      out+=dot(P.X(pair.positive.re),P.Y(pair.positive.im),4,C.positive)+dot(P.X(pair.negative.re),P.Y(pair.negative.im),4,C.negative);
    } else out+=arrow(P,zero,pair.sum,C.degree,3);
    out+=dot(P.X(pair.sum.re),P.Y(pair.sum.im),5,pair.constant?C.degree:C.pair)+ring(P,terms[S.j].value);
    $('pair-plot').innerHTML=out;
    $('pair-title').textContent=pair.constant?'The unpaired constant term':'The selected reciprocal pair';
    $('pair-frequency').textContent=pair.constant?'k = 0':`k = ±${pair.k}`;
    $('pair-value').textContent=`Selected contribution (gold): ${complex(terms[S.j].value)}. ${pair.constant?'Constant':'Pair sum'}: ${complex(pair.sum)}.`;
    $('pair-note').textContent=pair.constant?'For even n, the central term is counted once. It does not rotate.':`Semiaxes after multiplying by A: ${fmt(pair.axisA)} and ${fmt(pair.axisB)}. Rotation: ${fmt(S.phi*180/Math.PI)}°. ${S.mag===0?'A = 0 collapses the path to a point.':S.r===1?'At r = 1 the ellipse collapses to a segment.':`The pair traverses its ellipse ${pair.k} ${pair.k===1?'time':'times'} as t goes from 0° to 360°.`}`;
    const baseTerms=M.terms(S.n,S.r,0),bound=2*baseTerms.reduce((s,v)=>s+v.weight*v.radial,0)*1.12,Q=plane(500,420,bound);
    const trajectory=Array.from({length:481},(_,i)=>M.packet(S.n,S.r,i*TAU/480,A));
    let full=Q.base+curve(Q,trajectory,C.degree,'stroke-opacity=".6"'),sum=zero;
    for(const v of terms) { const next=M.add(sum,v.value); full+=arrow(Q,sum,next,v.j===S.j?C.gold:colour(v.k),v.j===S.j?3:1.6); sum=next; }
    full+=dot(Q.X(sum.re),Q.Y(sum.im),5,C.degree)+ring(Q,sum,C.degree,9);
    $('mode-plot').innerHTML=full;
    $('mode-value').textContent=`A P${subscript(S.n)}(Γᵣ(t)) = ${complex(sum)}`;
    $('mode-note').textContent=S.n===0?'A single constant point A.':S.n===1?'One reciprocal pair: the Joukowski ellipse, scaled and rotated by A.':S.n===2?'One reciprocal pair plus the constant A/4: an ellipse translated by A/4.':'This full trajectory combines several reciprocal pairs. It is generally not an ellipse.';
    const independent=M.mul(A,M.legendre(S.n,M.joukowski(S.r,S.t))),err=M.abs(M.sub(sum,independent));
    $('recurrence-check').textContent=`Independent recurrence check: |Laurent sum − A·Pₙ(ω)| = ${err.toExponential(2)}. Axes fit n and r; they stay fixed while t or A changes.`;
    renderMapping();
  }
  function subscript(n){return String(n).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');}
  function renderMapping() {
    const sc=72/S.r,z=M.polar(S.r,S.t),w=M.joukowski(S.r,S.t),cx1=150,cx2=480,cy=129;
    let out='';
    for(const cx of [cx1,cx2])out+=line(cx-95,cy,cx+95,cy,'class="axis"')+line(cx,cy+85,cx,cy-85,'class="axis"');
    out+=`<circle cx="${cx1}" cy="${cy}" r="72" fill="none" stroke="${C.positive}" stroke-width="2"/>`;
    out+=S.r===1?line(cx2-sc,cy,cx2+sc,cy,`stroke="${C.degree}" stroke-width="4" data-limiting-segment="true"`):`<ellipse cx="${cx2}" cy="${cy}" rx="${(S.r+1/S.r)*sc/2}" ry="${(S.r-1/S.r)*sc/2}" fill="none" stroke="${C.degree}" stroke-width="2"/>`;
    out+=line(cx1,cy,cx1+z.re*sc,cy-z.im*sc,`stroke="${C.positive}"`)+dot(cx1+z.re*sc,cy-z.im*sc,5,C.gold)+dot(cx2+w.re*sc,cy-w.im*sc,5,C.gold);
    out+=text(cx1,24,'z-plane','text-anchor="middle" class="plot-label"')+text(cx2,24,'ω-plane','text-anchor="middle" class="plot-label"')+text(315,131,'→','text-anchor="middle" style="font-size:30px;fill:#c2e995"');
    out+=text(cx1,235,`Radius ${fmt(S.r)}`,'text-anchor="middle"')+text(cx2,235,`Semiaxes ${fmt((S.r+1/S.r)/2)}, ${fmt((S.r-1/S.r)/2)}`,'text-anchor="middle"');
    $('mapping-plot').innerHTML=out;
    $('mapping-value').textContent=`z = ${complex(z)};   ω = ${complex(w)}`;
  }
  function renderSeries() {
    const u=S.rho/S.r,G=M.generating(S.r,S.t,u,S.N);
    $('rho-value').textContent=`r u = ${fmt(S.rho)}`;
    $('order-value').textContent=`N = ${S.N}`;
    $('u-value').textContent=`u = ${fmt(u,6)} < 1/r = ${fmt(1/S.r,6)}. The control adjusts u when r changes to keep r·u fixed.`;
    $('series-partial').textContent=complex(G.partial); $('series-exact').textContent=complex(G.exact);
    $('series-error').textContent=G.error.toExponential(3); $('series-bound').textContent=G.tailBound.toExponential(3);
    let sums=[zero],acc=zero;
    for(let m=0;m<=S.N;m++){acc=M.add(acc,M.scale(M.packet(m,S.r,S.t),u**m));sums.push(acc);}
    const points=sums.slice(1),included=S.seriesOrigin?[zero,...points,G.exact]:[...points,G.exact];
    const spread=Math.max(...included.map(z=>Math.max(Math.abs(z.re-G.exact.re),Math.abs(z.im-G.exact.im))));
    const radius=(spread>1e-12?spread*1.25:.1*Math.max(1,M.abs(G.exact)))/S.seriesZoom;
    const tickDigits=Math.min(15,Math.max(5,Math.ceil(Math.log10(Math.max(1,M.abs(G.exact))))-Math.floor(Math.log10(radius/2))+2));
    const scale=155/radius,cx=320,cy=210,X=x=>cx+(x-G.exact.re)*scale,Y=y=>cy-(y-G.exact.im)*scale;
    const P={X,Y,path:pts=>pts.map((z,i)=>(i?'L':'M')+X(z.re).toFixed(2)+','+Y(z.im).toFixed(2)).join(' ')};
    let out='<defs><clipPath id="series-clip"><rect x="70" y="40" width="495" height="330"/></clipPath></defs>';
    for(const offset of [-1,-.5,0,.5,1]){
      const x=G.exact.re+offset*radius,y=G.exact.im+offset*radius;
      out+=line(X(x),40,X(x),370,'class="grid"')+text(X(x),391,fmt(x,tickDigits),'text-anchor="middle"');
      out+=line(70,Y(y),565,Y(y),'class="grid"')+text(62,Y(y)+4,fmt(y,tickDigits),'text-anchor="end"');
    }
    if(X(0)>=70&&X(0)<=565)out+=line(X(0),40,X(0),370,'class="axis"');
    if(Y(0)>=40&&Y(0)<=370)out+=line(70,Y(0),565,Y(0),'class="axis"');
    out+=text(570,414,'Re','text-anchor="end"')+text(67,26,'Im')+text(320,23,`G₀ → G${subscript(S.N)} · green ring = exact G`,'text-anchor="middle" class="plot-label"');
    out+='<g clip-path="url(#series-clip)">'+curve(P,points,C.degree,'stroke-width="3"');
    points.forEach((v,i)=>{
      out+=dot(X(v.re),Y(v.im),i===S.N?6:4,C.degree,`data-partial="${i}"`);
      if(i===0||i===S.N)out+=text(X(v.re)+10,Y(v.im)+(i===0?-10:20),`G${subscript(i)}`,'class="value-label"');
    });
    if(S.seriesOrigin)out+=dot(X(0),Y(0),4,C.muted)+text(X(0)+9,Y(0)-8,'0');
    out+=ring(P,G.exact,C.pair,11)+'</g>';
    $('series-plot').innerHTML=out;
    $('series-zoom-value').textContent=`${fmt(S.seriesZoom)}×`;
    const outside=points.filter(v=>X(v.re)<70||X(v.re)>565||Y(v.im)<40||Y(v.im)>370).length;
    $('series-view-note').textContent=`${S.seriesOrigin?'Origin included in the fitted range.':'Focused on the partial sums, away from the origin when needed.'} Equal Re/Im scales; zoom centres on the exact value. ${outside?`${outside} partial-sum ${outside===1?'point is':'points are'} outside this zoom; use Fit partial sums to show all.`:'All partial sums are visible.'}`;
  }

  function buildFormulas(terms) {
    const v=terms[S.j],col=colour(v.k),weight=fraction(v.weight,S.n,true),pair=M.pair(S.n,S.j,S.r,S.t,amp());
    const nodes=[];
    nodes.push(setMath('selected-formula',tex(T`(p,q)=(${v.p},${v.q}),\quad ${tint(C.degree,T`p+q=${S.n}`)},\quad ${tint(col,T`p-q=${v.k}`)}`)+'<br>'+tex(T`\alpha_{${v.p}}\alpha_{${v.q}}z^{${v.k}}u^{${S.n}}\ \longmapsto\ ${tint(col,T`${weight}z^{${v.k}}`)}`)));
    const summands=terms.map(v=>tint(colour(v.k),T`${fraction(v.weight,S.n,true)}${v.k===0?'':T`r^{${v.k}}e^{${v.k}it}`}`)).join('+');
    nodes.push(setMath('packet-formula',tex(T`P_{${S.n}}(\Gamma_r(t))=${summands}`)));
    const pairFormula=pair.constant?tex(T`A\alpha_{${S.j}}^2=A\,${weight}\quad(k=0,\text{ counted once})`):tex(T`A\,${fraction(pair.weight,S.n,true)}\left[${tint(C.pair,T`(r^{${pair.k}}+r^{-${pair.k}})\cos(${pair.k}t)+i(r^{${pair.k}}-r^{-${pair.k}})\sin(${pair.k}t)`)}\right]`);
    nodes.push(setMath('pair-formula',pairFormula));
    if(popup?.isOpen()){
      if(window.MathJax?.typesetClear)MathJax.typesetClear([popup.body]);
      const scrollTop=popup.body.scrollTop;
      popup.setContent(popupTopic
        ? window.JoukowskiExplanations.content(popupTopic,{S,M,terms,tex,fraction,fmt,pairFormula})
        : popupContent(terms,pairFormula));
      popup.body.scrollTop=scrollTop;nodes.push(popup.body);
    }
    typeset(nodes);
  }
  function popupContent(terms,pairFormula){
    const v=terms[S.j],c=colour(v.k),w=fraction(v.weight,S.n,true);
    return `<p class="hint">Degree n = ${S.n} · selected j = ${S.j} · r = ${fmt(S.r)}. This panel follows the controls.</p>
    <h3>1. The selected lattice point</h3><div class="math-block">${tex(T`q=j=${v.q},\quad p=n-j=${v.p},\quad ${tint(C.degree,T`p+q=${S.n}`)},\quad ${tint(c,T`k=p-q=${v.k}`)}`)}</div>
    <p>The violet diagonal selects the power of u. The selected frequency gives the colour of the bar and rotating vector.</p>
    <h3>2. Coefficient versus rotating contribution</h3><div class="math-block">${tex(T`\underbrace{${tint(c,T`A\,${w}\,r^{${v.k}}`)}}_{\text{complex Fourier coefficient}}\;\underbrace{e^{${v.k}it}}_{\text{rotating phase}}`)}</div>
    <p class="numeric">Fourier coefficient: <span data-live="coefficient"></span><br>Contribution now: <span data-live="contribution"></span><br>Mode amplitude A: <span data-live="amplitude"></span></p>
    <h3>3. Add the whole diagonal</h3><div class="math-block">${tex(T`${tint(C.degree,T`A P_{${S.n}}(\Gamma_r(t))`)}=A\sum_{j=0}^{${S.n}}\alpha_j\alpha_{${S.n}-j}r^{${S.n}-2j}e^{i(${S.n}-2j)t}`)}</div><p class="numeric">Full mode now: <span data-live="mode"></span></p>
    <h3>4. The reciprocal pair</h3><div class="math-block">${pairFormula}</div><p>For k &gt; 0 the pair traces an ellipse, rotated by arg A and scaled by |A|. At r = 1 it becomes a segment; A = 0 gives a point. The k = 0 term occurs once.</p>
    <h3>5. Where the convolution comes from</h3><div class="math-block">${tex(T`\sum_{m\ge0}P_m(\omega)u^m=(1-2\omega u+u^2)^{-1/2}`)}</div><div class="math-block">${tex(T`1-2\omega u+u^2=(1-zu)-z^{-1}u(1-zu)=(1-zu)(1-z^{-1}u)`)}</div><div class="math-block">${tex(T`(1-zu)^{-1/2}(1-z^{-1}u)^{-1/2}=\sum_{p,q\ge0}\alpha_p\alpha_qz^{p-q}u^{p+q}`)}</div><p>For z ≠ 0 the expansions converge when |u| &lt; min(|z|, |z|⁻¹), with the branches equal to 1 at zero. Matching p + q = n gives the finite polynomial identity. u tracks degree, while z supplies geometry. A is a separate Legendre coefficient.</p>
    <h3>6. Binomial coefficients</h3><div class="math-block">${tex(T`\alpha_j=\frac{1}{j!}\left.\frac{d^j}{dv^j}(1-v)^{-1/2}\right|_{v=0}=\frac{\binom{2j}{j}}{4^j}`)}</div><div class="math-block">${tex(T`\alpha_0=1,\quad\alpha_{j+1}=\frac{2j+1}{2j+2}\alpha_j`)}</div><p>The ratio test gives absolute convergence for |v| &lt; 1. The Build the series view uses a degree-N (triangular) truncation, with tail bound (ru)ᴺ⁺¹/(1 − ru).</p>`;
  }
  function updatePopupLive(terms,A){
    if(!popup?.isOpen())return;
    const pair=M.pair(S.n,S.j,S.r,S.t,A);
    const values={coefficient:complex(terms[S.j].coefficient),contribution:complex(terms[S.j].value),amplitude:complex(A),mode:complex(M.packet(S.n,S.r,S.t,A)),
      angle:`${fmt(S.t*180/Math.PI,5)}°`,magnitude:fmt(M.abs(terms[S.j].coefficient),6),
      pairAxes:`${fmt(pair.axisA,5)} and ${fmt(pair.axisB,5)}`,pairSum:complex(pair.sum),
      z:complex(M.polar(S.r,S.t)),inverseZ:complex(M.polar(1/S.r,-S.t)),omega:complex(M.joukowski(S.r,S.t)),
      rho:fmt(S.rho),inverseRatio:fmt(S.rho/(S.r*S.r),6),u:fmt(S.rho/S.r,6),order:String(S.N)};
    if(popupTopic==='series'){
      const G=M.generating(S.r,S.t,S.rho/S.r,S.N);
      Object.assign(values,{partial:complex(G.partial),exact:complex(G.exact),error:G.error.toExponential(3),bound:G.tailBound.toExponential(3)});
    }
    popup.body.querySelectorAll('[data-live]').forEach(el=>el.textContent=values[el.dataset.live]??'');
  }
  function render(structural=true){
    const A=amp(),terms=M.terms(S.n,S.r,S.t,A),v=terms[S.j];
    $('degree-value').textContent=`n = ${S.n}`;$('term-value').textContent=`j = ${S.j}`;$('radius-value').textContent=fmt(S.r);
    $('angle-value').textContent=`t = ${fmt(S.t*180/Math.PI,5)}°`;$('amplitude-value').textContent=`|A| = ${fmt(S.mag)}`;$('phase-value').textContent=`φ = ${fmt(S.phi*180/Math.PI)}°`;
    if(structural){
      $('selection-status').textContent=`Degree ${S.n} · selected j = ${S.j} · (p, q) = (${v.p}, ${v.q}) · frequency ${S.tab==='lesson'?'m':'k'} = ${signed(v.k)}`;
      $('selected-degree').textContent=S.n;$('selected-frequency').textContent=signed(v.k);$('selected-frequency').style.color=colour(v.k);
      $('selected-weight').textContent=fraction(v.weight,S.n);$('selected-radial').textContent=fmt(v.radial,5);
      renderLattice();renderTable(terms);renderSpectrum(terms);
      const key=[S.n,S.j,S.r,S.mag,S.phi,popup?.isOpen(),popupTopic].join(',');
      if(key!==renderedMathKey){renderedMathKey=key;buildFormulas(terms);}
    }
    if(S.tab==='lesson')lesson?.render(S,structural);
    if(S.tab==='geometry'||S.tab==='together')renderGeometry(terms,A);
    if(S.tab==='together')renderTogether(terms);
    if(S.tab==='series')renderSeries();
    updatePopupLive(terms,A);
  }
  function syncControls(){
    $('degree').value=S.n;$('term').max=S.n;$('term').value=S.j;$('radius').value=S.r;$('angle').value=S.t*180/Math.PI;
    $('amplitude').value=S.mag;$('phase').value=S.phi*180/Math.PI;$('series-rho').value=S.rho;$('series-order').value=S.N;$('series-zoom').value=S.seriesZoom;$('series-origin').checked=S.seriesOrigin;
  }
  function renderTogether(terms){
    const v=terms[S.j],phase=M.polar(1,v.k*S.t);
    $('together-angle').value=S.t*180/Math.PI;
    $('together-angle-value').textContent=`${fmt(S.t*180/Math.PI,5)}°`;
    $('bridge-coefficient-label').textContent=`C${subscript(S.j)} = A α${subscript(S.j)} α${subscript(S.n-S.j)} r${supSigned(v.k)}`;
    $('bridge-phase-label').textContent=`Rotating phase eⁱ⁽${v.k}⁾ᵗ`;
    $('bridge-coefficient').textContent=complex(v.coefficient);
    $('bridge-coefficient').style.color=colour(v.k);
    $('bridge-phase').textContent=complex(phase);
    $('bridge-contribution').textContent=complex(v.value);
    $('together-partner').textContent=v.k===0?`j = ${S.j}, k = 0: one stationary term, counted once.`:`Selected j = ${S.j}, k = ${signed(v.k)} ↔ partner j = ${S.n-S.j}, k = ${signed(-v.k)}. Their two contributions make the green pair sum.`;
  }
  function supSigned(n){return (n<0?'⁻':'')+sup(Math.abs(n));}
  function setupTogether(){
    for(const [id,host] of [['lattice-card','together-lattice'],['pair-card','together-pair'],['spectrum-card','together-spectrum'],['mode-card','together-mode'],['term-card','together-details-grid'],['mapping-card','together-details-grid']]){
      const card=$(id),home=document.createComment(id+' home');card.before(home);cardHomes.push({card,home,host:$(host)});
    }
  }
  function setTab(name){
    S.tab=name;
    for(const {card,home,host} of cardHomes){if(name==='together')host.append(card);else home.after(card);}
    document.body.classList.toggle('together-view',name==='together');
    document.body.classList.toggle('lesson-view',name==='lesson');
    if(name==='lesson'&&popup?.isOpen())popup.close();
    for(const tab of tabs){const selected=tab===name;$('tab-'+tab).setAttribute('aria-selected',String(selected));$('tab-'+tab).tabIndex=selected?0:-1;$('panel-'+tab).hidden=!selected;}
    render();
  }
  function playbackLabel(){
    for(const id of ['play','together-play']){$(id).textContent=S.playing?'Ⅱ Pause':id==='play'?'▶ Play rotation':'▶ Play both views';$(id).setAttribute('aria-pressed',String(S.playing));}
  }
  function pause(){S.playing=false;cancelAnimationFrame(animation);playbackLabel();}
  function togglePlay(){if(S.playing){pause();return;}if(S.tab==='lattice')setTab('together');S.playing=true;lastTime=performance.now();playbackLabel();animation=requestAnimationFrame(frame);}
  function frame(now){if(!S.playing)return;if(now-lastTime>=32){const delta=Math.min((now-lastTime)/1000,.1);S.t=(S.t+delta*TAU/18)%TAU;lastTime=now;$('angle').value=S.t*180/Math.PI;render(false);}animation=requestAnimationFrame(frame);}
  function loadExample(){pause();const e=examples[$('example').value];Object.assign(S,{n:e[0],j:e[1],r:e[2],t:40*Math.PI/180,mag:1,phi:0,rho:.55,N:8,seriesZoom:1,seriesOrigin:false});syncControls();render();}
  function selectPoint(event){
    const el=event.target.closest('[data-p],[data-j]');if(!el)return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    event.preventDefault();
    if(el.dataset.p!==undefined){S.n=Number(el.dataset.p)+Number(el.dataset.q);S.j=Number(el.dataset.q);}else S.j=Number(el.dataset.j);
    syncControls();render();
    // Replaced SVG/table nodes retain a logical keyboard focus target.
    if(event.type==='keydown'){
      const host=event.currentTarget;
      const next=host.querySelector(el.dataset.p!==undefined?`[data-p="${el.dataset.p}"][data-q="${el.dataset.q}"]`:`[data-j="${S.j}"]`);next?.focus();
    }
  }
  try {
    if(!M)throw new Error('Mathematical engine unavailable');
    lesson=window.createLaurentLesson({host:$('laurent-lesson'),M,typeset,onChange:patch=>{
      pause();
      for(const key of ['n','j','r','t'])if(Number.isFinite(patch[key]))S[key]=patch[key];
      S.n=Math.max(0,Math.min(12,Math.round(S.n)));S.j=Math.max(0,Math.min(S.n,Math.round(S.j)));
      S.r=Math.max(1,Math.min(2.5,S.r));
      syncControls();render();
    }});
    popup=window.createMathWindow({title:'Math for this view'});
    popup.element.id='lesson-explanation-window';
    function openPopup(topic=null){
      popupTopic=topic;
      popup.element.querySelector('.jl-window-title').textContent=topic?'Intuitive/geometric explanation':'Math for this view';
      popup.open();popup.body.scrollTop=0;renderedMathKey='';render();
    }
    function openMath(){openPopup();}
    $('display-math').addEventListener('click',openMath);document.querySelectorAll('.math-open').forEach(el=>el.addEventListener('click',openMath));
    for(const [topic,[selector,title]] of Object.entries(window.JoukowskiExplanations.topics)){
      const card=document.querySelector(selector),button=document.createElement('button');
      button.type='button';button.className='explanation-open';button.dataset.explanation=topic;
      button.textContent='Intuitive/geometric explanation';
      button.setAttribute('aria-label',`Intuitive/geometric explanation: ${title}`);
      button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',popup.element.id);
      (card.querySelector('.card-heading')||card.querySelector('h3')||card.querySelector('summary')).after(button);
      button.addEventListener('click',()=>openPopup(topic));
    }
    for(const [id,fn] of Object.entries({degree:v=>{S.n=v;S.j=Math.min(S.j,v);$('term').max=v;$('term').value=S.j;},term:v=>S.j=v,radius:v=>S.r=v,angle:v=>{pause();S.t=v*Math.PI/180;},amplitude:v=>S.mag=v,phase:v=>S.phi=v*Math.PI/180,'series-rho':v=>S.rho=v,'series-order':v=>S.N=v,'series-zoom':v=>S.seriesZoom=v}))$(id).addEventListener('input',e=>{fn(Number(e.target.value));render(id!=='angle');});
    for(const id of ['lattice-plot','spectrum-plot','term-rows']){ $(id).addEventListener('click',selectPoint);if(id!=='term-rows')$(id).addEventListener('keydown',selectPoint); }
    for(const name of tabs)$('tab-'+name).addEventListener('click',()=>setTab(name));
    document.querySelector('.tabs').addEventListener('keydown',e=>{let i=tabs.indexOf(S.tab);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();setTab(tabs[i]);$('tab-'+tabs[i]).focus();});
    $('play').addEventListener('click',togglePlay);$('together-play').addEventListener('click',togglePlay);
    $('together-angle').addEventListener('input',e=>{pause();S.t=Number(e.target.value)*Math.PI/180;$('angle').value=e.target.value;render(false);});
    $('series-origin').addEventListener('change',e=>{S.seriesOrigin=e.target.checked;S.seriesZoom=1;$('series-zoom').value=1;renderSeries();});
    $('series-fit').addEventListener('click',()=>{S.seriesZoom=1;S.seriesOrigin=false;$('series-zoom').value=1;$('series-origin').checked=false;renderSeries();});
    $('zero-time').addEventListener('click',()=>{pause();S.t=0;syncControls();render(false);});
    $('example').addEventListener('change',loadExample);$('reset').addEventListener('click',loadExample);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
    window.addEventListener('pagehide',pause);
    setupTogether();syncControls();setTab(S.tab);typeset(Array.from(document.querySelectorAll('.math-static')));
  }catch(error){$('app-error').hidden=false;$('app-error').textContent='The lesson could not start. Please reload the page. '+error.message;console.error(error);}
})();
