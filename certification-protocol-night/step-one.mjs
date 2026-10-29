export const TOY = Object.freeze({
 c:{x:.625,y:.25}, radius:1/16,
 eigenvalues:[
  {id:'t1',label:'t₁₁',x:.61380835174852444,y:.25732258744926345},
  {id:'t2',label:'t₂₂',x:.13619164825147553,y:-.069822587449263521}
 ]
});
export const distances = TOY.eigenvalues.map(p=>Math.hypot(p.x-TOY.c.x,p.y-TOY.c.y));
export function membership(d,r) { return Math.abs(d-r)<1e-12?'boundary':d<r?'inside':'outside'; }
export function camera(bounds,W=440,H=344){
 const area={left:48,top:27,width:370,height:272};
 const scale=Math.min(area.width/(bounds.xmax-bounds.xmin),area.height/(bounds.ymax-bounds.ymin));
 const cx=(bounds.xmin+bounds.xmax)/2,cy=(bounds.ymin+bounds.ymax)/2;
 const mx=area.left+area.width/2,my=area.top+area.height/2;
 return {W,H,area,scale,cx,cy,
  point:p=>({x:mx+(p.x-cx)*scale,y:my-(p.y-cy)*scale}),
  world:p=>({x:cx+(p.x-mx)/scale,y:cy-(p.y-my)/scale}),
  bounds:{xmin:cx-area.width/(2*scale),xmax:cx+area.width/(2*scale),ymin:cy-area.height/(2*scale),ymax:cy+area.height/(2*scale)}
 };
}
const defaults=()=>({explore:false,r:TOY.radius,theta:30,zoom:2,selected:'t1',hover:null,probe:null,grid:true,segments:true,labels:true,playing:false});
const fmt=(n,k=8)=>Number(n).toFixed(k);
const complex=p=>fmt(p.x,5)+(p.y<0?' − ':' + ')+fmt(Math.abs(p.y),5)+'i';
const circle=(x,y,r,attrs='')=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" '+attrs+'/>';
const line=(a,b,attrs='')=>'<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" '+attrs+'/>';
const text=(x,y,s,attrs='')=>'<text x="'+x+'" y="'+y+'" '+attrs+'>'+s+'</text>';
function niceStep(span){const raw=span/5,p=Math.pow(10,Math.floor(Math.log10(raw))),v=raw/p;return(v<=1?1:v<=2?2:v<=5?5:10)*p;}
function ticks(min,max,step){const out=[];for(let i=Math.ceil(min/step);i<=Math.floor(max/step);i++)out.push(i*step);return out;}
function viewMarkup(name,title,subtitle){
 return '<section class="s1-view s1-view-'+name+'"><div class="s1-view-head"><div><h3>'+title+'</h3><p>'+subtitle+'</p></div><span class="s1-view-tag">'+(name==='wide'?'CONTEXT':'CLOSE-UP')+'</span></div><div class="s1-svg-slot" data-slot="'+name+'"></div><p class="s1-view-foot" data-view-foot="'+name+'"></p></section>';
}
function matrixMarkup(){
 return '<aside class="s1-matrix-panel"><p class="eyebrow">FROZEN SCHUR MATRIX</p><h3>T<sub>2</sub><sup>∘</sup></h3><div class="s1-matrix-grid" aria-label="Upper triangular Schur matrix">'+
 '<button class="s1-matrix-cell diagonal" data-eigen="t1" title="For a triangular matrix, the diagonal entries are its eigenvalues." aria-label="Select t11, first diagonal eigenvalue"><span>t₁₁</span><b>0.61380835</b><small>+ 0.25732259i</small></button>'+
 '<button class="s1-matrix-cell off-diagonal" data-action="offdiag" title="This off-diagonal entry is not an eigenvalue."><span>t₁₂</span><b>0.28846561</b><small>− 0.07124693i</small></button>'+
 '<div class="s1-matrix-cell zero-cell" aria-label="Lower left entry zero">0</div>'+
 '<button class="s1-matrix-cell diagonal" data-eigen="t2" title="For a triangular matrix, the diagonal entries are its eigenvalues." aria-label="Select t22, second diagonal eigenvalue"><span>t₂₂</span><b>0.13619165</b><small>− 0.06982259i</small></button></div>'+
 '<p class="s1-matrix-help" data-matrix-help>For a triangular matrix, the diagonal entries are its eigenvalues.</p><p class="s1-link-hint">Hover, focus or select a diagonal cell to highlight its point in both views.</p>'+
 '<div class="s1-distance-cards">'+TOY.eigenvalues.map((e,i)=>'<button class="s1-distance-card" data-eigen="'+e.id+'"><span>'+e.label+' · <b data-membership="'+i+'"></b></span><strong>|'+e.label+' − c| ≈ '+fmt(distances[i])+'</strong><small data-comparison="'+i+'"></small></button>').join('')+'</div></aside>';
}
export function stepOneArgument(){
 return '<div class="s1-argument"><p class="eyebrow">THE FIXED TOY · r = δ = 1/16</p><h2>Count the Schur diagonal entries inside the disk</h2><p>For an upper triangular matrix, the characteristic polynomial is the product of its diagonal factors. Its diagonal entries are therefore its eigenvalues, counted with algebraic multiplicity.</p><div class="s1-proof-formula">det(λI − T₂∘) = (λ − t₁₁)(λ − t₂₂)</div><p>Our two diagonal entries are distinct. Compare their distances from the centre c = 5/8 + i/4 with the radius δ = 1/16:</p><div class="s1-proof-comparison"><div><strong>t₁₁ is inside U</strong><span>|t₁₁ − c| ≈ 0.01337435148 &lt; 0.0625</span></div><div><strong>t₂₂ is outside the closure of U</strong><span>|t₂₂ − c| ≈ 0.58414047299 &gt; 0.0625</span></div></div><p>Neither eigenvalue lies on Γ. Exactly one lies in the open disk U, so</p><div class="s1-proof-formula">m<sub>T</sub>(U) = rank Π<sub>Γ</sub>(T₂∘) = 1.</div><div class="note">These are distances to the centre c, not distances to Γ. The next step introduces the boundary distances used in the resolvent estimates. Radius exploration changes the contour and does not carry the later certification gates with it.</div></div>';
}
export function mountStepOne(root){
 let state=defaults(),raf=0,lastFrame=0,drag=null,ignorePlotClickUntil=0;const cams={};const abort=new AbortController();const signal=abort.signal;
 root.innerHTML='<div class="s1-root"><div class="s1-toolbar"><div class="s1-mode-switch" aria-label="Contour mode"><button data-action="fixed" aria-pressed="true">Fixed toy</button><button data-action="explore" aria-pressed="false">Explore radius</button></div><button class="s1-reset" data-action="reset">↺ Reset toy</button></div>'+
 '<div class="s1-fixed-reference">Fixed reference: c = 0.625 + 0.25i · δ = 0.0625 · one enclosed eigenvalue</div>'+
 '<div class="s1-count" role="status" aria-live="polite"><span class="s1-count-number" data-count></span><div><strong data-count-title></strong><span data-count-copy></span></div></div>'+
 '<div class="s1-explorer" hidden><div class="s1-range-head"><label for="s1-radius">Exploratory radius r</label><output id="s1-radius-value"></output></div><input id="s1-radius" type="range" min="0.005" max="0.70" step="any" value="0.0625"><div class="s1-presets"><button data-radius="t1">t₁₁ on Γᵣ</button><button data-radius="toy">Toy radius</button><button data-radius="t2">t₂₂ on Γᵣ</button><button data-radius="both">Both inside</button></div><p data-explore-warning></p></div>'+
 '<div class="s1-palette-key"><span class="s1-real-key">Real coordinate</span><span class="s1-imag-key">Imaginary coordinate</span><span class="s1-main-key">Schur eigenvalues</span><span class="s1-ref-key">References</span></div><div class="s1-display-controls"><label><input type="checkbox" data-toggle="segments" checked> Centre distances</label><label><input type="checkbox" data-toggle="labels" checked> Labels</label><label><input type="checkbox" data-toggle="grid" checked> Grid</label></div>'+
 '<div class="s1-scene-grid">'+viewMarkup('wide','The spectral plane','Origin, eigenvalues and the contour')+matrixMarkup()+viewMarkup('zoom','Inside the disk','Equal horizontal and vertical scales')+'<svg class="s1-cell-links" aria-hidden="true"></svg></div>'+
 '<div class="s1-bottom-controls"><section class="s1-tracer-control"><div class="s1-section-title"><h3>Travel along Γ</h3><button data-action="play" aria-label="Play counterclockwise contour motion">▶ Play</button></div><label for="s1-angle">Angle θ <output id="s1-angle-value">30°</output></label><input id="s1-angle" type="range" min="0" max="360" step="1" value="30"><p>Drag the gray point or use the slider. Increasing θ moves counterclockwise.</p><div class="s1-tracer-readout" data-tracer-readout></div><label class="s1-zoom-label" for="s1-zoom">Close-up magnification <output id="s1-zoom-value">2.0×</output></label><input id="s1-zoom" type="range" min="1" max="3" step="0.1" value="2"></section>'+
 '<section class="s1-probe-control"><h3>Inspect a test point</h3><p>Click either plot to place a crosshair. This point is not an eigenvalue and does not change the count.</p><div class="s1-presets"><button data-probe="centre">Centre</button><button data-probe="boundary">On contour</button><button data-probe="origin">Origin</button><button data-probe="clear">Clear</button></div><div class="s1-probe-readout" data-probe-readout aria-live="polite"></div></section></div>'+
 '<p class="s1-precision-note">The matrix entries and coordinates are rounded for display; the underlying frozen entries are exact dyadics. The frozen matrix stays unchanged. No later certification gate is applied to an exploratory contour.</p></div>';
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const setText=(selector,value)=>{const el=q(selector);if(el.textContent!==value)el.textContent=value;};
 let probeMarkup='';
 const setProbe=markup=>{if(probeMarkup!==markup){q('[data-probe-readout]').innerHTML=markup;probeMarkup=markup;}};
 const pointOnContour=()=>({x:TOY.c.x+state.r*Math.cos(state.theta*Math.PI/180),y:TOY.c.y+state.r*Math.sin(state.theta*Math.PI/180)});
 function drawView(name){
  const r=state.r,c=TOY.c,half=r*3.6/state.zoom;
  const bounds=name==='wide'?{xmin:Math.min(-.08,c.x-r-.08),xmax:Math.max(.80,c.x+r+.08),ymin:Math.min(-.19,c.y-r-.08),ymax:Math.max(.46,c.y+r+.08)}:{xmin:c.x-half,xmax:c.x+half,ymin:c.y-half,ymax:c.y+half};
  const cam=camera(bounds);cams[name]=cam;const a=cam.area,b=cam.bounds,C=cam.point(c),rp=r*cam.scale;
  const clip='s1-clip-'+name,arrow='s1-arrow-'+name,offarrow='s1-off-'+name;
  const px=cam.point({x:0,y:0}),xAxis=Math.max(a.top,Math.min(a.top+a.height,px.y)),yAxis=Math.max(a.left,Math.min(a.left+a.width,px.x));
  let svg='<svg class="s1-svg" data-view="'+name+'" viewBox="0 0 440 344" role="img" aria-label="'+(name==='wide'?'Wide spectral plane':'Magnified spectral disk')+'; select eigenvalue markers or click to inspect a point"><defs><clipPath id="'+clip+'"><rect x="'+a.left+'" y="'+a.top+'" width="'+a.width+'" height="'+a.height+'"/></clipPath><marker id="'+arrow+'" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--palette-main)"/></marker><marker id="'+offarrow+'" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--palette-main)"/></marker></defs><rect x="'+a.left+'" y="'+a.top+'" width="'+a.width+'" height="'+a.height+'" class="s1-plot-bg"/>';
  const step=niceStep(b.ymax-b.ymin),decimals=Math.max(0,-Math.floor(Math.log10(step)));
  for(const v of ticks(b.xmin,b.xmax,step)){const P=cam.point({x:v,y:0});if(state.grid)svg+=line({x:P.x,y:a.top},{x:P.x,y:a.top+a.height},'class="s1-gridline"');svg+=text(P.x,a.top+a.height+22,Math.abs(v)<step/100?'0':v.toFixed(decimals),'text-anchor="middle" class="s1-tick"');}
  for(const v of ticks(b.ymin,b.ymax,step)){const P=cam.point({x:0,y:v});if(state.grid)svg+=line({x:a.left,y:P.y},{x:a.left+a.width,y:P.y},'class="s1-gridline"');svg+=text(a.left-9,P.y+4,Math.abs(v)<step/100?'0':v.toFixed(decimals),'text-anchor="end" class="s1-tick"');}
  svg+=line({x:a.left,y:xAxis},{x:a.left+a.width,y:xAxis},'class="s1-axis s1-axis-real"')+line({x:yAxis,y:a.top},{x:yAxis,y:a.top+a.height},'class="s1-axis s1-axis-imag"');
  svg+=text(a.left+a.width,a.top+a.height+41,'Re z','text-anchor="end" class="s1-axis-title s1-axis-title-real"')+text(a.left,a.top-11,'Im z','class="s1-axis-title s1-axis-title-imag"');
  svg+='<g clip-path="url(#'+clip+')">'+circle(C.x,C.y,rp,'class="s1-disk"')+circle(C.x,C.y,rp,'class="s1-contour"');
  if(name==='wide'){
   const zoom=camera({xmin:c.x-half,xmax:c.x+half,ymin:c.y-half,ymax:c.y+half});
   const tl=cam.point({x:zoom.bounds.xmin,y:zoom.bounds.ymax}),br=cam.point({x:zoom.bounds.xmax,y:zoom.bounds.ymin});
   svg+='<rect x="'+tl.x+'" y="'+tl.y+'" width="'+(br.x-tl.x)+'" height="'+(br.y-tl.y)+'" class="s1-zoom-window"/>';
  }
  const radEnd=cam.point({x:c.x+r*Math.cos(-Math.PI/4),y:c.y+r*Math.sin(-Math.PI/4)});
  svg+=line(C,radEnd,'class="s1-radius-line"');
  if(state.labels)svg+=text((C.x+radEnd.x)/2+7,(C.y+radEnd.y)/2+15,state.explore?'r':'δ','class="s1-radius-label"');
  const arc=[];for(let theta=20;theta<=80;theta+=3){const P=cam.point({x:c.x+r*Math.cos(theta*Math.PI/180),y:c.y+r*Math.sin(theta*Math.PI/180)});arc.push(P.x+','+P.y);}
  svg+='<polyline points="'+arc.join(' ')+'" fill="none" stroke="var(--palette-main)" stroke-width="3" marker-end="url(#'+arrow+')"/>';
  const outside=[];
  TOY.eigenvalues.forEach((e,i)=>{
   const P=cam.point(e),visible=P.x>=a.left+5&&P.x<=a.left+a.width-5&&P.y>=a.top+5&&P.y<=a.top+a.height-5;
   if(state.segments)svg+=line(C,P,'class="s1-distance-line" data-eigen-link="'+e.id+'"');
   if(visible){
    svg+='<g data-eigen="'+e.id+'" class="s1-eigen-group" role="button" tabindex="0" aria-label="'+e.label+', '+membership(distances[i],r)+' the active disk"><title>'+e.label+' is a diagonal eigenvalue. Centre distance '+fmt(distances[i])+'.</title>'+circle(P.x,P.y,14,'class="s1-hit"')+circle(P.x,P.y,6,'class="s1-eigen-dot" data-dot="'+e.id+'"')+circle(P.x,P.y,11,'class="s1-eigen-halo"')+'</g>';
    if(state.labels){const dx=i===0?-13:10,dy=i===0?-16:22;svg+=text(P.x+dx,P.y+dy,e.label,'class="s1-eigen-label" text-anchor="'+(i===0?'end':'start')+'"');}
   }else{
    outside.push(e.label);const dx=P.x-C.x,dy=P.y-C.y,tx=dx>0?(a.left+a.width-12-C.x)/dx:(a.left+12-C.x)/dx,ty=dy>0?(a.top+a.height-12-C.y)/dy:(a.top+12-C.y)/dy,t=Math.min(tx,ty);
    const end={x:C.x+dx*t,y:C.y+dy*t};if(state.segments)svg+=line({x:end.x-dx*.012,y:end.y-dy*.012},end,'stroke="var(--palette-main)" stroke-width="2" marker-end="url(#'+offarrow+')"');
   }
  });
  if(name==='wide'&&state.labels&&state.segments){const e=cam.point(TOY.eigenvalues[1]);svg+=text((C.x+e.x)/2-9,(C.y+e.y)/2+23,'|t₂₂ − c| ≈ '+fmt(distances[1]),'text-anchor="middle" class="s1-length-label"');}
  if(px.x>=a.left&&px.x<=a.left+a.width&&px.y>=a.top&&px.y<=a.top+a.height)svg+=circle(px.x,px.y,3,'class="s1-origin"')+(state.labels?text(px.x+8,px.y-10,'0','class="s1-origin-label"'):'');
  svg+=line({x:C.x-5,y:C.y},{x:C.x+5,y:C.y},'class="s1-centre"')+line({x:C.x,y:C.y-5},{x:C.x,y:C.y+5},'class="s1-centre"');
  if(state.labels)svg+=text(C.x+11,C.y+16,'c','class="s1-centre-label"')+text(C.x+rp*.39,C.y-rp*.24,state.explore?'Uᵣ':'U','class="s1-region-label"')+text(C.x+rp*.75,C.y-rp*.72,state.explore?'Γᵣ':'Γ','class="s1-contour-label"');
  const tracer=cam.point(pointOnContour());
  svg+='<g data-tracer="true" role="button" tabindex="0" aria-label="Drag contour point; left and right arrows change its angle" class="s1-tracer-hit"><title>Drag this point along the contour, or use the angle slider.</title>'+circle(tracer.x,tracer.y,15,'class="s1-hit"')+circle(tracer.x,tracer.y,6,'class="s1-tracer"')+'</g>';
  if(state.probe){const P=cam.point(state.probe);svg+=line({x:P.x-7,y:P.y},{x:P.x+7,y:P.y},'class="s1-probe-mark"')+line({x:P.x,y:P.y-7},{x:P.x,y:P.y+7},'class="s1-probe-mark"')+(state.labels?text(P.x+10,P.y-9,'p','class="s1-probe-label"'):'');}
  svg+='</g></svg>';q('[data-slot="'+name+'"]').innerHTML=svg;
  q('[data-view-foot="'+name+'"]').textContent=name==='wide'?'Dashed grey rectangle: the close-up window.':outside.length?outside.join(' and ')+' outside this close-up'+(state.segments?'; the distance segment continues beyond the frame.':'.'):'Both eigenvalues are visible in this close-up.';
 }
 function drawLinks(){
  const scene=q('.s1-scene-grid'),overlay=q('.s1-cell-links'),box=scene.getBoundingClientRect();
  overlay.setAttribute('viewBox','0 0 '+box.width+' '+box.height);
  if(box.width<1050){overlay.innerHTML='';return;}
  overlay.innerHTML=TOY.eigenvalues.map(e=>{
   const cell=q('.s1-matrix-cell[data-eigen="'+e.id+'"]').getBoundingClientRect(),dot=q('[data-view="wide"] [data-dot="'+e.id+'"]')?.getBoundingClientRect();if(!dot)return'';
   const x1=cell.left-box.left,y1=cell.top+cell.height/2-box.top,x2=dot.left+dot.width/2-box.left,y2=dot.top+dot.height/2-box.top;
   return '<path d="M'+x1+' '+y1+' C'+(x1-25)+' '+y1+' '+(x2+50)+' '+y2+' '+x2+' '+y2+'" class="s1-matrix-link" data-eigen-link="'+e.id+'"/>';
  }).join('');
 }
 function highlight(){
  const active=state.hover||state.selected;
  qa('[data-eigen]').forEach(el=>{el.classList.toggle('is-highlighted',el.dataset.eigen===active);if(el.matches('button'))el.setAttribute('aria-pressed',String(el.dataset.eigen===state.selected));});
  qa('[data-eigen-link]').forEach(el=>el.classList.toggle('is-highlighted',el.dataset.eigenLink===active));
 }
 function readouts(){
  const statuses=distances.map(d=>membership(d,state.r)),count=statuses.filter(s=>s==='inside').length,boundary=statuses.includes('boundary');
  setText('[data-count]',boundary?'!':String(count));
  q('.s1-count').classList.toggle('is-exploration',state.explore);q('.s1-count').classList.toggle('is-boundary',boundary);
  setText('[data-count-title]',boundary?'Eigenvalue near Γᵣ at display precision: count unresolved':!state.explore?'One eigenvalue in U, counted with algebraic multiplicity.':count+' eigenvalue'+(count===1?'':'s')+' strictly inside the exploratory disk');
  setText('[data-count-copy]',boundary?count+' clearly inside; a near-boundary eigenvalue is unresolved at display precision. No invertibility claim is made for this exploratory contour.':state.explore?'Exploration only. The fixed toy and later certification gates remain separate.':'The Schur diagonal gives the count. The off-diagonal entry is not an extra eigenvalue.');
  TOY.eigenvalues.forEach((e,i)=>{q('[data-membership="'+i+'"]').textContent=statuses[i]==='boundary'?'near boundary':statuses[i];q('[data-comparison="'+i+'"]').textContent=fmt(distances[i])+' '+(statuses[i]==='inside'?'<':statuses[i]==='outside'?'>':'≈')+' '+fmt(state.r)+(state.explore?' = r':' = δ');});
  q('.s1-explorer').hidden=!state.explore;
  q('[data-action="fixed"]').setAttribute('aria-pressed',String(!state.explore));q('[data-action="explore"]').setAttribute('aria-pressed',String(state.explore));
  q('#s1-radius').value=state.r;q('#s1-radius-value').textContent=fmt(state.r);
  const zero=membership(Math.hypot(TOY.c.x,TOY.c.y),state.r);
  q('[data-explore-warning]').textContent=zero==='inside'?'Zero is now inside Uᵣ. The later zero-block lift count would change; later gates are not applied.':'Only the radius changes here. The centre and the frozen Schur matrix stay fixed; later gates are not applied.';
  q('#s1-angle').value=state.theta;q('#s1-angle-value').textContent=Math.round(state.theta)+'°';
  q('#s1-zoom').value=state.zoom;q('#s1-zoom-value').textContent=state.zoom.toFixed(1)+'×';
  q('[data-action="play"]').textContent=state.playing?'Ⅱ Pause':'▶ Play';q('[data-action="play"]').setAttribute('aria-label',state.playing?'Pause contour motion':'Play counterclockwise contour motion');
  q('[data-tracer-readout]').textContent='z(θ) = '+complex(pointOnContour())+' · |z(θ) − c| = '+fmt(state.r,5);
  if(!state.probe)setProbe('<span>No test point selected</span><small>Click a plot or choose a point above.</small>');
  else{const d=Math.hypot(state.probe.x-TOY.c.x,state.probe.y-TOY.c.y),m=membership(d,state.r),label=m==='boundary'?'on / near Γ at display precision':m==='inside'?'inside the open disk':'outside the closed disk';setProbe('<strong>p = '+complex(state.probe)+'</strong><span>|p − c| ≈ '+fmt(d)+' · '+label+'</span><small>Test point only — not an eigenvalue.</small>');}
 }
 function draw(){drawView('wide');drawView('zoom');readouts();drawLinks();highlight();}
 function stop(){state.playing=false;cancelAnimationFrame(raf);raf=0;lastFrame=0;if(root.isConnected){q('[data-action="play"]').textContent='▶ Play';q('[data-action="play"]').setAttribute('aria-label','Play counterclockwise contour motion');}}
 function playFrame(time){
  if(!state.playing)return;
  if(document.hidden||root.getClientRects().length===0){stop();return;}
  if(!lastFrame)lastFrame=time;
  const delta=time-lastFrame;
  if(delta>=45){state.theta=(state.theta+delta*.018)%360;lastFrame=time;draw();}
  raf=requestAnimationFrame(playFrame);
 }
 function reset(){stop();state=defaults();qa('[data-toggle]').forEach(el=>el.checked=state[el.dataset.toggle]);q('[data-matrix-help]').textContent='For a triangular matrix, the diagonal entries are its eigenvalues.';draw();}
 function coordinates(event,svg){const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());return cams[svg.dataset.view].world(point);}
 root.addEventListener('click',event=>{
  const eigen=event.target.closest('[data-eigen]');if(eigen){state.selected=eigen.dataset.eigen;state.hover=null;q('[data-matrix-help]').textContent='For a triangular matrix, the diagonal entries are its eigenvalues.';highlight();return;}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='fixed'||action==='reset'){reset();return;}
  if(action==='explore'){state.explore=true;draw();return;}
  if(action==='play'){if(state.playing)stop();else{state.playing=true;lastFrame=0;raf=requestAnimationFrame(playFrame);}readouts();return;}
  if(action==='offdiag'){q('[data-matrix-help]').textContent='t₁₂ is not an eigenvalue. It influences eigenvectors and resolvent geometry, which later steps study.';return;}
  const preset=event.target.closest('[data-radius]')?.dataset.radius;
  if(preset){state.r=preset==='t1'?distances[0]:preset==='t2'?distances[1]:preset==='both'?.65:TOY.radius;state.explore=true;draw();return;}
  const probe=event.target.closest('[data-probe]')?.dataset.probe;
  if(probe){state.probe=probe==='clear'?null:probe==='centre'?{...TOY.c}:probe==='origin'?{x:0,y:0}:pointOnContour();draw();return;}
  if(event.target.closest('[data-tracer]'))return;
  const svg=event.target.closest('.s1-svg');if(svg&&!drag&&performance.now()>ignorePlotClickUntil){const p=coordinates(event,svg),b=cams[svg.dataset.view].bounds;if(p.x>=b.xmin&&p.x<=b.xmax&&p.y>=b.ymin&&p.y<=b.ymax){state.probe=p;draw();}}
 },{signal});
 root.addEventListener('input',event=>{
  if(event.target.id==='s1-radius'){state.r=Number(event.target.value);state.explore=true;}
  if(event.target.id==='s1-angle'){stop();state.theta=Number(event.target.value);}
  if(event.target.id==='s1-zoom')state.zoom=Number(event.target.value);
  if(event.target.dataset.toggle)state[event.target.dataset.toggle]=event.target.checked;
  draw();
 },{signal});
 root.addEventListener('pointerover',event=>{const e=event.target.closest('[data-eigen]');if(e){state.hover=e.dataset.eigen;highlight();}},{signal});
 root.addEventListener('pointerout',event=>{const e=event.target.closest('[data-eigen]');if(e&&!e.contains(event.relatedTarget)){state.hover=null;highlight();}},{signal});
 root.addEventListener('focusin',event=>{const e=event.target.closest('[data-eigen]');if(e){state.hover=e.dataset.eigen;highlight();}},{signal});
 root.addEventListener('focusout',()=>{state.hover=null;highlight();},{signal});
 root.addEventListener('keydown',event=>{
  const e=event.target.closest('g[data-eigen]');if(e&&(event.key==='Enter'||event.key===' ')){event.preventDefault();state.selected=e.dataset.eigen;highlight();}
  if(event.target.closest('[data-tracer]')&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();stop();state.theta=(state.theta+(event.key==='ArrowRight'?5:-5)+360)%360;const view=event.target.closest('.s1-svg').dataset.view;draw();q('[data-view="'+view+'"] [data-tracer]').focus();}
 },{signal});
 root.addEventListener('pointerdown',event=>{if(event.target.closest('[data-tracer]')){event.preventDefault();stop();drag=event.target.closest('.s1-svg').dataset.view;}},{signal});
 window.addEventListener('pointermove',event=>{if(drag){const svg=q('[data-view="'+drag+'"]'),p=coordinates(event,svg);state.theta=(Math.atan2(p.y-TOY.c.y,p.x-TOY.c.x)*180/Math.PI+360)%360;draw();}},{signal});
 window.addEventListener('pointerup',()=>{if(drag)ignorePlotClickUntil=performance.now()+180;drag=null;},{signal});
 window.addEventListener('pointercancel',()=>{drag=null;},{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();readouts();}},{signal});
 const observer=new ResizeObserver(()=>{drawLinks();highlight();});observer.observe(q('.s1-scene-grid'));
 draw();
 return ()=>{stop();abort.abort();observer.disconnect();};
}

