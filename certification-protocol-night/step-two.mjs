import { math } from './math-render.mjs?v=103';
import { TOY } from './step-one.mjs?v=103';

export const LOWER_TEXT=['0.0491256485190172','0.5216404729873209'];
export const CASES=TOY.eigenvalues.map((e,i)=>{
 const dx=e.x-TOY.c.x,dy=e.y-TOY.c.y,rho=Math.hypot(dx,dy);
 return {...e,index:i,rho,d:Math.abs(rho-TOY.radius),lower:Number(LOWER_TEXT[i]),lowerText:LOWER_TEXT[i],
  p:{x:TOY.c.x+TOY.radius*dx/rho,y:TOY.c.y+TOY.radius*dy/rho},
  angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360};
});
export const pointAt=degrees=>({x:TOY.c.x+TOY.radius*Math.cos(degrees*Math.PI/180),y:TOY.c.y+TOY.radius*Math.sin(degrees*Math.PI/180)});
export function plotCamera(bounds){
 const area={x:57,y:30,w:515,h:360},scale=Math.min(area.w/(bounds.xmax-bounds.xmin),area.h/(bounds.ymax-bounds.ymin));
 const cx=(bounds.xmin+bounds.xmax)/2,cy=(bounds.ymin+bounds.ymax)/2;
 return {area,scale,point:p=>({x:area.x+area.w/2+(p.x-cx)*scale,y:area.y+area.h/2-(p.y-cy)*scale}),
  world:p=>({x:cx+(p.x-area.x-area.w/2)/scale,y:cy-(p.y-area.y-area.h/2)/scale}),
  bounds:{xmin:cx-area.w/(2*scale),xmax:cx+area.w/(2*scale),ymin:cy-area.h/(2*scale),ymax:cy+area.h/(2*scale)}};
}
const f=(x,n=8)=>Number(x).toFixed(n);
const complex=(p,n=8)=>f(p.x,n)+(p.y<0?' − ':' + ')+f(Math.abs(p.y),n)+'i';
const under=j=>'<span class="s2-under">d</span><sub>'+j+'</sub>';
const defaults=()=>({theta:0,snap:null,mode:'boundary',radii:'certified',show:[true,true],segments:true,construction:true,grid:true,playing:false});
const circle=(p,r,attrs='')=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+r+'" '+attrs+'/>';
const line=(a,b,attrs='')=>'<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" '+attrs+'/>';
const label=(p,s,attrs='')=>'<text x="'+p.x+'" y="'+p.y+'" '+attrs+'>'+s+'</text>';
const niceStep=span=>{const power=Math.pow(10,Math.floor(Math.log10(span/5))),v=span/5/power;return(v<=1?1:v<=2?2:v<=5?5:10)*power;};
const ticks=(min,max,step)=>{const out=[];for(let i=Math.ceil(min/step);i<=Math.floor(max/step);i++)out.push(i*step);return out;};

export function stepTwoArgument(){
 return '<div class="s2-argument"><p class="eyebrow">FROM A FIXED CIRCLE TO A UNIFORM BOUND</p><h2>The nearest-point construction works for every contour point</h2>'+
 '<p>Write ρ<sub>j</sub> = |t<sub>jj</sub> − c|. On Γ we have |z − c| = δ. The reverse triangle inequality gives</p>'+
 '<div class="s2-formula">|z − t<sub>jj</sub>| ≥ ||t<sub>jj</sub> − c| − |z − c|| = |ρ<sub>j</sub> − δ| = d<sub>j</sub>.</div>'+
 '<p>Equality is attained at p<sub>j</sub> = c + δ(t<sub>jj</sub> − c)/ρ<sub>j</sub>. Thus d<sub>j</sub> is the exact distance from t<sub>jj</sub> to the entire contour, rather than the distance to one sampled point.</p>'+
 '<div class="s2-proof-cases"><section><h3>Interior eigenvalue t₁₁</h3><p>ρ₁ &lt; δ, so d₁ = δ − ρ₁. The closed tangent disk centred at t₁₁ is contained in the closed spectral disk and touches Γ at p₁.</p><div class="s2-formula">ρ₁ + d₁ = δ</div></section><section><h3>Exterior eigenvalue t₂₂</h3><p>ρ₂ &gt; δ, so d₂ = ρ₂ − δ. Its open tangent disk is disjoint from the closed spectral disk; the two closed disks meet at p₂.</p><div class="s2-formula">δ + d₂ = ρ₂</div></section></div>'+
 '<h3>Certified disks use smaller radii</h3><p>The supplied bounds are '+under(1)+' = '+LOWER_TEXT[0]+' and '+under(2)+' = '+LOWER_TEXT[1]+'. They satisfy 0 &lt; '+under('j')+' ≤ d<sub>j</sub>, so</p>'+
 '<div class="s2-formula">|z − t<sub>jj</sub>| ≥ d<sub>j</sub> ≥ '+under('j')+' &gt; 0 &nbsp; for every z ∈ Γ.</div>'+
 '<p>The moving contour point never enters B(t<sub>jj</sub>, '+under('j')+'). These are open exclusion disks. Their certified boundaries are not asserted to touch Γ.</p>'+
 '<details class="s2-check"><summary>How the supplied decimal lower bounds were checked</summary><p>The frozen binary64 entries are treated as exact dyadic numbers. Exact rational comparisons give ρ₁² &lt; (δ − '+under(1)+')² and ρ₂² &gt; (δ + '+under(2)+')², with δ − '+under(1)+' &gt; 0. These comparisons verify both strict lower bounds without rounding a plotted distance.</p></details>'+
 '<h3>The connection to Step 3</h3><div class="s2-formula">1 / |z − t<sub>jj</sub>| ≤ 1 / '+under('j')+' &nbsp; for all z ∈ Γ.</div><p>This is the scalar denominator bound used by the triangular inverse recurrences. The animation illustrates the argument; it does not prove a bound by sampling.</p></div>';
}
export function mountStepTwo(root){
 let state=defaults(),raf=0,last=0,drag=null,ignoreClickUntil=0;const cams={};const abort=new AbortController(),signal=abort.signal;
 root.innerHTML='<div class="s2-root">'+
 '<div class="s2-top"><div class="s2-switch" aria-label="Distance meaning"><button data-mode="boundary" aria-pressed="true">Boundary distance dⱼ</button><button data-mode="centre" aria-pressed="false">Centre distance ρⱼ</button></div><button class="s2-reset" data-action="reset">↺ Reset scene</button></div>'+
 '<p class="s2-purpose" data-purpose></p>'+
 '<div class="s2-certificate"><strong data-conclusion>The moving contour point never enters either certified exclusion disk.</strong><span data-conclusion-formula>|z − t<sub>jj</sub>| ≥ d<sub>j</sub> ≥ '+under('j')+' &gt; 0 &nbsp; for every z ∈ Γ</span></div>'+
 '<div class="s2-motion"><div class="s2-angle-head"><label for="s2-angle">Contour angle θ</label><output id="s2-angle-value" aria-live="off"></output><button data-action="play" aria-label="Play contour motion">▶ Play</button></div><input id="s2-angle" type="range" min="0" max="360" step="any" value="0" aria-label="Contour angle in degrees"><div class="s2-motion-bottom"><span data-z></span><div class="s2-jump"><button data-jump="0">Go to nearest point p₁</button><button data-jump="1">Go to nearest point p₂</button></div></div></div>'+
 '<div class="s2-live-distances"><span class="case-0"><span data-live-label="0">|z − t₁₁| ≈ </span><b data-live="0"></b></span><span class="case-1"><span data-live-label="1">|z − t₂₂| ≈ </span><b data-live="1"></b></span></div>'+
 '<div class="s2-radius-controls"><div class="s2-switch" aria-label="Exclusion disk radii"><button data-radii="certified" aria-pressed="true">Certified exclusion disks</button><button data-radii="exact" aria-pressed="false">Exact tangent geometry</button></div><span class="s2-radius-status" data-radius-status></span></div>'+
 '<div class="s2-options"><label><input type="checkbox" data-show="0" checked> Disk at t₁₁</label><label><input type="checkbox" data-show="1" checked> Disk at t₂₂</label><label><input type="checkbox" data-toggle="segments" checked> Moving distance segments</label><label><input type="checkbox" data-toggle="construction" checked> Nearest-point construction</label><label><input type="checkbox" data-toggle="grid" checked> Grid</label></div>'+
 '<div class="s2-plots"><section class="s2-view"><div class="s2-view-title"><h3 data-wide-heading>Exclusion disks</h3><span>WIDE VIEW</span></div><div data-view-slot="wide"></div><p>Equal real and imaginary scales. Drag the red point along Γ. The dashed grey box locates the close-up.</p></section>'+
 '<section class="s2-view"><div class="s2-view-title"><h3>Near the spectral disk U</h3><span>LINKED CLOSE-UP</span></div><div data-view-slot="zoom"></div><p data-zoom-foot></p></section></div>'+
 '<div class="s2-legend"><span class="s2-key spectral">U: shaded spectral disk</span><span class="s2-key spectrum">Purple points: eigenvalues</span><span class="s2-key contour">Γ: spectral boundary</span><span class="s2-key disk-one" data-disk-key>Disk at t₁₁</span><span class="s2-key disk-two" data-disk-key>Disk at t₂₂</span><span class="s2-key moving">z(θ): moving point</span><span class="s2-key nearest">pⱼ: nearest points on Γ</span><span class="s2-key distances">Dashed segments: moving distances</span><span class="s2-key minimum">Solid segments: exact distances dⱼ</span><span class="s2-key centres" hidden>Solid segments: centre distances ρⱼ</span></div>'+
  '<p class="s2-scale-note" data-scale-note></p>'+
 '<div class="s2-reading"><h3>Three different objects</h3><p>The purple shading is the spectral disk '+math('U')+'. Its solid purple boundary is '+math('\\Gamma=\\partial U')+'. The purple points are the spectrum '+math('\\sigma(T_2^\\circ)=\\{t_{11},t_{22}\\}')+'.</p><div class="s2-hierarchy">'+math('t_{11}\\in\\sigma(T_2^\\circ)\\cap U,\\qquad \\sigma(T_2^\\circ)\\cap\\Gamma=\\varnothing')+'</div><p data-disk-explanation></p><p>The solid segment from '+math('t_{11}')+' to '+math('p_1\\in\\Gamma')+' has exact length '+math('d_1')+'. Its endpoint is defined by the contour, including when a smaller certified disk is shown.</p></div>'+
 '<div class="s2-cases">'+CASES.map((e,i)=>'<section class="s2-case case-'+i+'"><div class="s2-case-head"><h3>'+e.label+' · '+(i===0?'inside U':'outside the closure of U')+'</h3><button data-jump="'+i+'" aria-label="Visit nearest point p'+(i+1)+'">Locate p'+(i+1)+'</button></div><p class="s2-eigenvalue">'+e.label+' ≈ '+complex(e)+'</p><div class="s2-case-formula">'+(i===0?'d₁ = δ − ρ₁':'d₂ = ρ₂ − δ')+'</div><dl><div><dt>Centre distance ρ'+(i+1)+'</dt><dd>≈ '+f(e.rho)+'</dd></div><div><dt>Exact boundary distance d'+(i+1)+'</dt><dd>≈ '+(i===0?'0.049125648519017208':'0.521640472987320948')+'</dd></div><div class="s2-lower"><dt>Certified lower bound '+under(i+1)+'</dt><dd>'+e.lowerText+'</dd></div><div><dt>Current distance |z − '+e.label+'|</dt><dd><span data-current="'+i+'"></span><small class="s2-current-note" data-current-note="'+i+'"></small></dd></div></dl><div class="s2-distance-bar" aria-hidden="true"><span data-distance-bar="'+i+'"></span><i data-threshold="'+i+'"></i></div><p class="s2-bar-caption">Bar: current distance. Mark: certified lower bound. Scale is fixed for this eigenvalue.</p><p class="s2-nearest">p'+(i+1)+' ≈ '+complex(e.p)+'</p><p data-case-note="'+i+'"></p></section>').join('')+'</div>'+
 '<details class="s2-geometry-note"><summary>Why these two disks protect the entire contour</summary><p>For any z on Γ, the reverse triangle inequality gives |z − t<sub>jj</sub>| ≥ ||t<sub>jj</sub> − c| − δ|. The radial nearest point p<sub>j</sub> attains that minimum. The certified radius is a lower bound for it, so every point of Γ stays outside the open certified disk.</p><p>Here δ always means the radius of the spectral disk U 1/16. The exclusion radii are d<sub>1</sub>, d<sub>2</sub>, or their underlined lower bounds.</p></details>'+
 '<div class="s2-formula-strip"><span>c = 5/8 + i/4</span><span>δ = 1/16 = 0.0625</span><span>p<sub>j</sub> = c + δ(t<sub>jj</sub> − c) / |t<sub>jj</sub> − c|</span></div>'+
 '<p class="s2-evidence">The drawing uses floating-point coordinates. Certified constants are supplied inputs, checked separately with exact rational comparisons.</p></div>';
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const setText=(selector,value)=>{const el=q(selector);if(el.textContent!==value)el.textContent=value;};
 const movingPoint=()=>state.snap===null?pointAt(state.theta):CASES[state.snap].p;
 const surface=q('.s2-root'),motion=q('.s2-motion');
 for(const selector of ['.s2-radius-controls','.s2-live-distances','.s2-plots','.s2-legend','.s2-scale-note','.s2-reading'])surface.insertBefore(q(selector),motion);

 function drawView(name){
  const bounds=name==='wide'?{xmin:-.44,xmax:.77,ymin:-.65,ymax:.51}:{xmin:.525,xmax:.72,ymin:.17,ymax:.33};
  const cam=plotCamera(bounds);cams[name]=cam;const a=cam.area,b=cam.bounds,C=cam.point(TOY.c),Z=cam.point(movingPoint()),rr=TOY.radius*cam.scale;
  const nearIndex=state.snap??-1;
  const clip='s2-'+name+'-clip',arrow='s2-'+name+'-arrow';
  let s='<svg class="s2-svg" data-view="'+name+'" viewBox="0 0 600 450" role="img" aria-label="'+(name==='wide'?(state.mode==='centre'?'Wide view of centre distances':'Wide view of exclusion disks'):(state.mode==='centre'?'Close-up of centre distances':'Close-up of the contour and exclusion disk boundaries'))+'"><defs><clipPath id="'+clip+'"><rect x="'+a.x+'" y="'+a.y+'" width="'+a.w+'" height="'+a.h+'"/></clipPath><marker id="'+arrow+'" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--palette-main)"/></marker></defs><rect x="'+a.x+'" y="'+a.y+'" width="'+a.w+'" height="'+a.h+'" class="s2-plot-bg"/>';
  const step=niceStep(b.ymax-b.ymin),digits=Math.max(0,-Math.floor(Math.log10(step)));
  for(const x of ticks(b.xmin,b.xmax,step)){const p=cam.point({x,y:0});if(state.grid)s+=line({x:p.x,y:a.y},{x:p.x,y:a.y+a.h},'class="s2-grid"');s+=label({x:p.x,y:a.y+a.h+22},Math.abs(x)<step*.01?'0':x.toFixed(digits),'class="s2-tick" text-anchor="middle"');}
  for(const y of ticks(b.ymin,b.ymax,step)){const p=cam.point({x:0,y});if(state.grid)s+=line({x:a.x,y:p.y},{x:a.x+a.w,y:p.y},'class="s2-grid"');s+=label({x:a.x-10,y:p.y+5},Math.abs(y)<step*.01?'0':y.toFixed(digits),'class="s2-tick" text-anchor="end"');}
  const zero=cam.point({x:0,y:0});
  if(zero.y>=a.y&&zero.y<=a.y+a.h)s+=line({x:a.x,y:zero.y},{x:a.x+a.w,y:zero.y},'class="s2-real-axis"');
  if(zero.x>=a.x&&zero.x<=a.x+a.w)s+=line({x:zero.x,y:a.y},{x:zero.x,y:a.y+a.h},'class="s2-imag-axis"');
  s+=label({x:a.x+a.w,y:438},'Re z','text-anchor="end" class="s2-real-label"')+label({x:a.x,y:18},'Im z','class="s2-imag-label"');
  s+='<g clip-path="url(#'+clip+')">'+circle(C,rr,'class="s2-spectral-fill"');
  if(state.mode==='boundary')CASES.forEach((e,i)=>{if(state.show[i])s+=circle(cam.point(e),(state.radii==='exact'?e.d:e.lower)*cam.scale,'class="s2-exclusion exclusion-'+i+' '+state.radii+'"');});
  s+=circle(C,rr,'class="s2-spectral-line"');
  if(name==='wide'){const zoom=plotCamera({xmin:.525,xmax:.72,ymin:.17,ymax:.33}),tl=cam.point({x:zoom.bounds.xmin,y:zoom.bounds.ymax}),br=cam.point({x:zoom.bounds.xmax,y:zoom.bounds.ymin});s+='<rect x="'+tl.x+'" y="'+tl.y+'" width="'+(br.x-tl.x)+'" height="'+(br.y-tl.y)+'" class="s2-zoom-box"/>';}
  if(state.construction||state.mode==='centre'){
   const end=cam.point({x:TOY.c.x+TOY.radius*.7071067811865476,y:TOY.c.y-TOY.radius*.7071067811865476});
   s+=line(C,end,'class="s2-delta"')+(name==='zoom'?label({x:(C.x+end.x)/2+7,y:(C.y+end.y)/2+12},'δ','class="s2-small-label"'):'');
  }
  const arc=[];for(let theta=30;theta<=85;theta+=5){const p=cam.point(pointAt(theta));arc.push(p.x+','+p.y);}s+='<polyline points="'+arc.join(' ')+'" fill="none" stroke="var(--palette-main)" stroke-width="2.5" marker-end="url(#'+arrow+')"/>';
  CASES.forEach((e,i)=>{
   const P=cam.point(e),near=cam.point(e.p),j=i+1;
   if(state.mode==='centre'){
    s+=line(C,P,'class="s2-centre-distance case-stroke-'+i+'"');
    const mid={x:(C.x+P.x)/2,y:(C.y+P.y)/2};if(name==='wide'&&i===1)s+=label({x:mid.x,y:mid.y+21},'ρ₂ = |t₂₂ − c|','class="s2-small-label" text-anchor="middle"');
    if(name==='zoom'&&i===0)s+=label({x:P.x-10,y:P.y+23},'ρ₁','class="s2-small-label"');
   }else if(state.construction){
    s+=line(C,P,'class="s2-radial-reference"')+line(P,near,'class="s2-nearest-distance case-stroke-'+i+'"');
    if((name==='zoom'&&i===0)||(name==='wide'&&i===1)){
     const mid={x:(P.x+near.x)/2,y:(P.y+near.y)/2};
     s+=label({x:mid.x+(i===0?12:-10),y:mid.y-9},'d'+(i===0?'₁':'₂'),'class="s2-small-label"');
    }
   }
   if(state.segments&&state.mode==='boundary')s+=line(P,Z,'class="s2-moving-distance case-stroke-'+i+'"');
   const visible=P.x>a.x+5&&P.x<a.x+a.w-5&&P.y>a.y+5&&P.y<a.y+a.h-5;
   if(visible)s+=circle(P,5.8,'class="s2-eigen case-fill-'+i+'"')+label({x:P.x+(i===0?(name==='wide'?-15:9):-12),y:P.y+(i===0?(name==='wide'?-23:-13):24)},e.label,'class="s2-eigen-label" text-anchor="'+(i===0&&name!=='wide'?'start':'end')+'"');
   if(state.mode==='boundary'&&state.construction){
    s+='<g class="s2-nearest-point" data-nearest="'+i+'" tabindex="0" role="button" aria-label="Move contour point to p'+j+'"><title>Nearest point p'+j+' on the exact contour</title>'+circle(near,13,'class="s2-hit"')+'<path d="M'+near.x+' '+(near.y-5)+' L'+(near.x+5)+' '+near.y+' L'+near.x+' '+(near.y+5)+' L'+(near.x-5)+' '+near.y+' Z" class="s2-nearest-diamond"/></g>';
    if(name==='zoom'&&i!==nearIndex)s+=label({x:near.x-12,y:near.y+(i===0?-11:20)},'p'+(i===0?'₁':'₂'),'class="s2-nearest-label" text-anchor="end"');
   }
  });
  s+=line({x:C.x-5,y:C.y-5},{x:C.x+5,y:C.y+5},'class="s2-center-mark"')+line({x:C.x-5,y:C.y+5},{x:C.x+5,y:C.y-5},'class="s2-center-mark"')+label({x:C.x+11,y:C.y+(name==='wide'?30:18)},'c','class="s2-center-label"');
  if(name==='wide'&&zero.x>a.x&&zero.y>a.y&&zero.x<a.x+a.w&&zero.y<a.y+a.h)s+=circle(zero,2.8,'class="s2-origin"');
  s+=(name==='zoom'?label({x:C.x+rr*.55,y:C.y+rr*.40},'U','class="s2-U"'):'')+label({x:C.x+rr*.76,y:C.y-rr*.73-(name==='wide'?14:0)},'Γ','class="s2-Gamma"');
  s+='<g class="s2-drag" data-drag="true" role="button" tabindex="0" aria-label="Drag z along the contour; left and right arrows change the angle"><title>Drag z along Γ</title>'+circle(Z,16,'class="s2-hit"')+circle(Z,6.5,'class="s2-moving-point"')+'</g>';
  s+=label({x:Z.x+(nearIndex>=0?-11:12),y:Z.y-14},nearIndex>=0?'z = p'+(nearIndex===0?'₁':'₂'):'z(θ)','text-anchor="'+(nearIndex>=0?'end':'start')+'" class="s2-z-label"');
  if(name==='zoom'&&state.mode==='boundary'&&state.show[0]){
   const e=CASES[0],E=cam.point(e),r=(state.radii==='exact'?e.d:e.lower)*cam.scale;
   const anchor={x:E.x+r*.72,y:E.y-r*.694};
   s+=line({x:a.x+a.w-139,y:a.y+53},anchor,'class="s2-disk-leader"');
   s+=label({x:a.x+a.w-16,y:a.y+24},state.radii==='certified'?'B(t₁₁, d̲₁)':'B(t₁₁, d₁)','class="s2-disk-label" text-anchor="end"');
   s+=label({x:a.x+a.w-16,y:a.y+46},state.radii==='certified'?'certified exclusion disk':'exact tangent disk','class="s2-disk-caption" text-anchor="end"');
  }
  s+='</g></svg>';q('[data-view-slot="'+name+'"]').innerHTML=s;
 }
 function readouts(){
  const boundary=state.mode==='boundary',z=movingPoint();
  q('.s2-root').classList.toggle('is-exact',state.radii==='exact');
  q('.s2-key.nearest').hidden=!boundary||!state.construction;
  q('.s2-key.distances').hidden=!boundary||!state.segments;
  q('.s2-key.minimum').hidden=!boundary||!state.construction;
  q('.s2-key.centres').hidden=boundary;
  setText('[data-wide-heading]',boundary?'Exclusion disks':'Centre distances');
  setText('[data-zoom-foot]','The exterior eigenvalue t₂₂ lies beyond this frame.'+(boundary&&state.show[1]?' Its '+(state.radii==='certified'?'certified exclusion':'exact tangent')+' disk boundary is clipped to the close-up; p₂ is its nearest point on Γ.':'')+(boundary&&state.segments?' Its moving distance segment continues beyond the frame.':''));
  qa('[data-disk-key]').forEach((el,i)=>{el.hidden=!boundary||!state.show[i];el.textContent='B('+CASES[i].label+', '+(state.radii==='certified'?'d̲':'d')+(i===0?'₁':'₂')+'): '+(state.radii==='certified'?'certified exclusion disk':'exact tangent disk');});
  q('[data-disk-explanation]').innerHTML=boundary?(state.radii==='certified'?'The dashed blue circle bounds the open exclusion disk '+math('B(t_{11},\\underline d_1)')+'. It is a geometric aid for the bound '+math('|z-t_{11}|^{-1}\\le 1/\\underline d_1')+' on the entire contour; it is neither the spectral disk nor the spectrum. Its boundary is not claimed to be tangent.':'The blue circle bounds the open tangent disk '+math('B(t_{11},d_1)')+'. Its boundary touches the contour at '+math('p_1')+'. This exclusion disk is a geometric aid, distinct from the spectral disk and the spectrum.'):'Exclusion disks are hidden in centre-distance mode. The shaded spectral disk and the two eigenvalues retain their meaning.';
  qa('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
  qa('[data-radii]').forEach(b=>b.setAttribute('aria-pressed',String(boundary&&b.dataset.radii===state.radii)));
  setText('[data-conclusion]',boundary?(state.radii==='exact'?'The moving contour point stays outside the open tangent disks.':'The moving contour point never enters either certified exclusion disk.'):'One eigenvalue lies inside U; the other lies outside its closure.');
  q('[data-conclusion-formula]').innerHTML=boundary?(state.radii==='exact'?'|z − t<sub>jj</sub>| ≥ d<sub>j</sub> &gt; 0 &nbsp; for every z ∈ Γ':'|z − t<sub>jj</sub>| ≥ d<sub>j</sub> ≥ '+under('j')+' &gt; 0 &nbsp; for every z ∈ Γ'):'ρ₁ &lt; δ &lt; ρ₂ &nbsp; ⇒ &nbsp; t₁₁ ∈ U, &nbsp; t₂₂ ∉ U̅';
  qa('[data-show],[data-toggle="segments"],[data-toggle="construction"]').forEach(el=>el.closest('label').hidden=!boundary);
  qa('[data-show]').forEach(b=>{b.disabled=!boundary;b.checked=state.show[Number(b.dataset.show)];});
  q('[data-toggle="segments"]').disabled=!boundary;
  q('[data-toggle="construction"]').disabled=!boundary;
  qa('[data-toggle]').forEach(el=>el.checked=state[el.dataset.toggle]);
  setText('[data-purpose]',boundary?'Boundary distances protect every denominator z − tⱼⱼ, uniformly along Γ.':'Centre distances determine whether each eigenvalue is inside or outside U. The contour and eigenvalues stay fixed.');
  setText('[data-radius-status]',!boundary?'Centre distances are shown. Choose either disk view above to return to boundary distances.':state.radii==='exact'?'Exact radii dⱼ: tangent at pⱼ.':'Certified radii d̲ⱼ: lower bounds, without a tangency claim.');
  setText('[data-scale-note]',!boundary?'ρ₁ < δ < ρ₂ gives the Step 1 count: one eigenvalue inside U.':state.radii==='exact'?'Exact tangent disks are drawn from the geometric formula. Their open interiors contain no point of Γ.':'Certified and exact radii look identical at this scale. The certified radii are slightly smaller; no artificial visible gap is drawn.');
  q('#s2-angle').value=state.theta;setText('#s2-angle-value',f(state.theta,1)+'° · '+f(state.theta*Math.PI/180,3)+' rad');
  setText('[data-z]','z(θ) ≈ '+complex(z,6));
  q('[data-action="play"]').textContent=state.playing?'Ⅱ Pause':'▶ Play';q('[data-action="play"]').setAttribute('aria-label',state.playing?'Pause contour motion':'Play contour motion');
  CASES.forEach((e,i)=>{
   const distance=Math.hypot(z.x-e.x,z.y-e.y),max=e.rho+TOY.radius;
   setText('[data-current="'+i+'"]','≈ '+f(distance,12));
   setText('[data-current-note="'+i+'"]',state.snap===i?'At z = p'+(i+1)+', the exact distance is d'+(i+1)+'. The decimal display is rounded.':'Rounded display; the certified bound is stated separately.');
   setText('[data-live-label="'+i+'"]',boundary?'|z − '+e.label+'| ≈ ':'ρ'+(i===0?'₁':'₂')+' = |'+e.label+' − c| ≈ ');
   setText('[data-live="'+i+'"]',f(boundary?distance:e.rho,8));
   q('[data-distance-bar="'+i+'"]').style.width=Math.min(100,distance/max*100)+'%';
   q('[data-threshold="'+i+'"]').style.left=(e.lower/max*100)+'%';
   setText('[data-case-note="'+i+'"]',!boundary?(i===0?'ρ₁ < δ: this eigenvalue is inside U.':'ρ₂ > δ: this eigenvalue is outside the closure of U.'):state.radii==='exact'?(i===0?'The closed tangent disk fits in the closure of U and meets Γ at p₁.':'The exterior tangent disk and the closed spectral disk meet only at p₂.'):'The certified open disk excludes every point of Γ; its boundary is not asserted to be tangent.');
  });
 }
 function draw(){drawView('wide');drawView('zoom');readouts();}
 function stop(){state.playing=false;cancelAnimationFrame(raf);raf=0;last=0;if(root.isConnected){q('[data-action="play"]').textContent='▶ Play';q('[data-action="play"]').setAttribute('aria-label','Play contour motion');}}
 function frame(time){if(!state.playing)return;if(document.hidden||root.getClientRects().length===0){stop();return;}if(!last)last=time;const dt=time-last;if(dt>=45){state.theta=(state.theta+dt*.017)%360;last=time;draw();}raf=requestAnimationFrame(frame);}
 function jump(i){stop();state.mode='boundary';state.construction=true;state.snap=i;state.theta=CASES[i].angle;draw();}
 function position(event,svg){const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());return cams[svg.dataset.view].world(p);}
 root.addEventListener('click',event=>{
  if(performance.now()<ignoreClickUntil)return;
  const mode=event.target.closest('[data-mode]')?.dataset.mode;if(mode){state.mode=mode;draw();return;}
  const radii=event.target.closest('[data-radii]')?.dataset.radii;if(radii){state.mode='boundary';state.radii=radii;state.show=[true,true];draw();return;}
  const go=event.target.closest('[data-jump]')?.dataset.jump??event.target.closest('[data-nearest]')?.dataset.nearest;if(go!==undefined){jump(Number(go));return;}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='reset'){stop();state=defaults();qa('[data-toggle]').forEach(e=>e.checked=state[e.dataset.toggle]);draw();}
  if(action==='play'){if(state.playing)stop();else{state.snap=null;state.playing=true;last=0;raf=requestAnimationFrame(frame);}readouts();}
 },{signal});
 root.addEventListener('input',event=>{
  if(event.target.id==='s2-angle'){stop();state.snap=null;state.theta=Number(event.target.value);}
  if(event.target.dataset.toggle)state[event.target.dataset.toggle]=event.target.checked;
  if(event.target.dataset.show!==undefined)state.show[Number(event.target.dataset.show)]=event.target.checked;
  draw();
 },{signal});
 root.addEventListener('keydown',event=>{
  const near=event.target.closest('[data-nearest]');if(near&&(event.key==='Enter'||event.key===' ')){event.preventDefault();const view=near.closest('svg').dataset.view,i=Number(near.dataset.nearest);jump(i);q('[data-view="'+view+'"] [data-nearest="'+i+'"]').focus();}
  if(event.target.closest('[data-drag]')&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();stop();const view=event.target.closest('svg').dataset.view;state.snap=null;state.theta=(state.theta+(event.key==='ArrowRight'?5:-5)+360)%360;draw();q('[data-view="'+view+'"] [data-drag]').focus();}
 },{signal});
 root.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-drag]');if(handle){event.preventDefault();stop();state.snap=null;drag=handle.closest('svg').dataset.view;}},{signal});
 window.addEventListener('pointermove',event=>{if(drag){const p=position(event,q('[data-view="'+drag+'"]'));state.theta=(Math.atan2(p.y-TOY.c.y,p.x-TOY.c.x)*180/Math.PI+360)%360;draw();}},{signal});
 window.addEventListener('pointerup',()=>{if(drag)ignoreClickUntil=performance.now()+160;drag=null;},{signal});
 window.addEventListener('pointercancel',()=>{drag=null;},{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();readouts();}},{signal});
 draw();return()=>{stop();abort.abort();};
}

