import {drawCanvasGap} from './output-gap-segment.mjs?v=103';
import {outputGap} from './output-gap.mjs?v=103';
import {HALF,DEN,ETA} from './enclosure-math.mjs?v=103';
import {outputState} from './gate-two-math.mjs?v=103';
import {adj,mv,c,scale,UMAX,UMIN,SIGMA_MAX,A_STAR,A_CIRCLE} from './step-five-math.mjs?v=103';
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,t)=>a.map(x=>x*t),unit=a=>mul(a,1/Math.hypot(...a));
function hull2(points){
 const sorted=points.map((p,i)=>({x:p[0],y:p[1],i})).sort((a,b)=>a.x-b.x||a.y-b.y).filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)>1e-9);
 const turn=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),lo=[],hi=[];
 for(const p of sorted){while(lo.length>1&&turn(lo.at(-2),lo.at(-1),p)<=1e-10)lo.pop();lo.push(p);}
 for(const p of [...sorted].reverse()){while(hi.length>1&&turn(hi.at(-2),hi.at(-1),p)<=1e-10)hi.pop();hi.push(p);}
 return [...lo.slice(0,-1),...hi.slice(0,-1)].map(p=>p.i);
}
// All supporting facets of a 3D zonotope. Normalize by ETA before this
// calculation, so tolerances do not depend on the homotopy fraction t.
export function zonotopeFaces(generators){
 const normals=[];
 for(let i=0;i<generators.length;i++)for(let j=i+1;j<generators.length;j++){
  let n=cross(generators[i],generators[j]);if(Math.hypot(...n)<1e-10)continue;n=unit(n);let k=0;for(let l=1;l<3;l++)if(Math.abs(n[l])>Math.abs(n[k]))k=l;if(n[k]<0)n=mul(n,-1);
  if(!normals.some(m=>Math.abs(dot(n,m))>1-1e-9))normals.push(n);
 }
 return normals.flatMap(normal=>[-1,1].map(sign=>{
  const n=mul(normal,sign),base=[0,0,0],free=[];
  for(const g of generators){const d=dot(n,g);if(Math.abs(d)<1e-8)free.push(g);else for(let j=0;j<3;j++)base[j]+=Math.sign(d)*g[j];}
  const points=Array.from({length:2**free.length},(_,bits)=>free.reduce((p,g,j)=>add(p,mul(g,bits&(1<<j)?1:-1)),[...base]));
  const a=unit(cross(n,Math.abs(n[0])<.8?[1,0,0]:[0,1,0])),b=cross(n,a),ids=hull2(points.map(p=>[dot(p,a),dot(p,b)]));
  return{normal:n,support:generators.reduce((s,g)=>s+Math.abs(dot(n,g)),0),points:ids.map(i=>points[i])};
 })).filter(f=>f.points.length>=3);
}
export function outputEnclosure(phi=90,error){
 const state=outputState(phi,0),U=[[UMAX[0],UMIN[0]],[UMAX[1],UMIN[1]]],Ustar=adj(U);
 const generators=HALF.flatMap(([r,s],k)=>[r,s].map((h,kind)=>{
  const v=state.input[k%2],z=kind?c(-v.im,v.re):v,w=[c(),c()];w[Math.floor(k/2)]=scale(z,-h/DEN);
  const q=mv(Ustar,w);return[q[0].re,q[1].re,q[1].im,q[0].im];
 }));
 const delta=generators.reduce((a,g,k)=>add(a,mul(g,error[Math.floor(k/2)][k%2]/HALF[Math.floor(k/2)][k%2])),[0,0,0,0]);
 const centre=[SIGMA_MAX*Math.cos(phi*Math.PI/180),A_STAR*Math.sin(phi*Math.PI/180),0,0];
 const normalized=generators.map(g=>g.slice(0,3).map(x=>x/ETA));
 return{phi,input:state.input,centre,generators,delta,faces:zonotopeFaces(normalized),length:Math.hypot(...centre)};
}
const colors=['#1e90ff','#808080','#8059c6','#9d9d9d','#1463ad','#6d6d6d','#6755bc','#ff1493'];
const arrow=(ctx,a,b,color,width=2)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<.7)return;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();const k=Math.min(10,d*.5),ux=dx/d,uy=dy/d;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(b[0]-k*ux+k*.45*uy,b[1]-k*uy-k*.45*ux);ctx.lineTo(b[0]-k*ux-k*.45*uy,b[1]-k*uy+k*.45*ux);ctx.fill();};
export function mountOutputEnclosure(host,{onCameraChange=()=>{},onPhiChange=()=>{}}={}){
 const abort=new AbortController(),{signal}=abort;
 host.innerHTML=`<div class="output-single-view"><figure><figcaption class="mathjax_ignore">Output space ℂ² ≅ ℝ⁴ · midpoint image ellipse, protected-ball section and boundary-centred output uncertainty</figcaption><aside class="output-point-legend mathjax_ignore" aria-label="Output point legend"><span><i class="output-point-blue"></i><span><strong>Blue:</strong> midpoint output y° · uncertainty centre</span></span><span><i class="output-point-red"></i><span><strong>Red:</strong> 3D projection of selected perturbed output yₜ</span></span>${outputGap()}</aside><div class="output-scene-stage"><canvas data-output-overview tabindex="0" aria-label="Interactive full ellipse with moving boundary-centred output uncertainty enclosure"></canvas><aside class="output-fixed-legend mathjax_ignore" aria-label="Geometry legend"><strong>Shapes and radii</strong><div class="output-legend-grid"><div class="legend-protected"><b>Violet · protected ball section</b><span>A circular disk in this plane.</span><span>ρₜ = a∘ − tηA = <output data-legend-protected></output></span><span>Radius arrow: 0 → bₜ = −ρₜ umin.</span></div><div class="legend-midpoint"><b>Blue · midpoint image ellipse</b><span>Image of the real SVD unit circle under F°* = z*I₂ − A₂°. <span data-legend-proportions></span></span></div><div class="legend-midpoint"><b>Blue point · y° = F°*v(φ)</b><span>Midpoint output on the ellipse; centre of the uncertainty set.</span></div><div class="legend-entry"><b>Deeppink · entry-box image</b><span>3D projection of the output zonotope. <span data-legend-magnification></span></span></div><div class="legend-allowance"><b>Dashed ball · output allowance</b><span>Radius tηA = <output data-legend-allowance></output>.</span><span>Grey outline: the final set at t = 1.</span></div><div class="legend-actual"><b>Coral · selected output yₜ</b><span>Displacement −tΔv from y°.</span><span>Highlighted generators: <span data-legend-generators></span>.</span></div></div></aside></div><small class="mathjax_ignore" data-output-scale-note></small></figure></div><div class="output-shape-readouts mathjax_ignore"><span>Full selected displacement ‖tΔv‖₂ <b data-output-displacement></b></span><span>Enclosing radius tηA <b data-output-radius></b></span><span>Omitted output coordinate |Im qmax| <b data-output-omitted></b></span></div><p class="radius-key mathjax_ignore" data-output-shape-note></p>`;
 const canvas=host.querySelector('[data-output-overview]');
 let state,geometry,az=0,el=0,drag=null,lastPhi=null,lastError='',screenEllipse=[],centreScreen=[0,0];
 const camera=p=>{const x=Math.cos(az)*p[0]-Math.sin(az)*p[1],y=Math.sin(az)*p[0]+Math.cos(az)*p[1];return[x,Math.cos(el)*y-Math.sin(el)*p[2],Math.sin(el)*y+Math.cos(el)*p[2]];};
 function paint(){
  if(!geometry)return;
  const w=canvas.clientWidth||900,h=canvas.clientHeight||560,ratio=Math.min(2,devicePixelRatio||1);
  if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
  const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#100b1e';ctx.fillRect(0,0,w,h);
  const {t,phi,selected,scaled,detailFill=1}=state,gain=scaled?detailFill:1;
  // Visibility mode shortens only the ellipse's major semiaxis. The disk
  // and local uncertainty offsets retain isotropic scales. This is an
  // explicitly schematic composition, not a common linear coordinate map.
  const major=scaled?Math.min(SIGMA_MAX,2.8*A_STAR):SIGMA_MAX;
  const centrePosition=[geometry.centre[0]*major/SIGMA_MAX,geometry.centre[1],0];
  const transform=camera;
  const ellipse=Array.from({length:721},(_,i)=>[major*Math.cos(i*Math.PI/360),A_STAR*Math.sin(i*Math.PI/360),0]);
  const ext=ellipse.map(transform),bx=Math.max(...ext.map(p=>Math.abs(p[0])))+gain*ETA,by=Math.max(...ext.map(p=>Math.abs(p[1])))+gain*ETA;
  const legendWidth=w>=2400?host.querySelector('.output-fixed-legend').offsetWidth+40:0,plotWidth=w-legendWidth;
  const k=Math.min((plotWidth-150)/(2*bx),(h-155)/(2*by)),origin=[plotWidth/2,h/2+10];
  const plot=p=>{const q=transform(p);return[origin[0]+k*q[0],origin[1]-k*q[1],q[2]];};
  const centre=plot(centrePosition);centreScreen=centre;
  // Offsets are magnified only in visibility mode, always about moving y°.
  const offsetPlot=d=>{const q=scaled?camera(mul(d,gain)):transform(d);return[centre[0]+k*q[0],centre[1]-k*q[1],q[2]];};
  const localPhysicalPlot=d=>{const q=camera(d);return[centre[0]+k*q[0],centre[1]-k*q[1],q[2]];};
  const line=(points,stroke,width=1,fill=null,dash=[],project=plot)=>{ctx.beginPath();points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);};
  const dotAt=(p,color,r=5)=>{ctx.beginPath();ctx.arc(p[0],p[1],r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=1.5;ctx.stroke();};
  const text=(s,x,y,color='#f4f0fa',size=w>1600?19:14)=>{ctx.font=size+'px system-ui';const sw=ctx.measureText(s).width,tx=Math.max(10,Math.min(w-sw-10,x)),ty=Math.max(23,Math.min(h-12,y));ctx.strokeStyle='#100b1e';ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeText(s,tx,ty);ctx.fillStyle=color;ctx.fillText(s,tx,ty);};
  line(ellipse,'#1e90ff',3,'#1e90ff0a');
  screenEllipse=ellipse.map((p,i)=>({point:plot(p),phi:i/2}));
  const inner=A_CIRCLE-t*ETA,circle=Array.from({length:121},(_,i)=>[inner*Math.cos(i*Math.PI/60),inner*Math.sin(i*Math.PI/60),0]);
  line(circle,'#7754c4',2,'#7754c420');dotAt(origin,'#ddd0ff',5);text('0',origin[0]-19,origin[1]+24);
  // This marked endpoint lies exactly on the protected disk, in the fixed
  // -u_min direction. Its radius is the certified bound, not a singular value.
  const radiusEnd=plot([0,-inner,0]);
  ctx.setLineDash([3,2]);arrow(ctx,origin,centre,'#6b9ed2',1.5);ctx.setLineDash([]);
  // Phase marks are on the fixed ellipse and make travel visually explicit.
  for(const angle of [0,90,180,270]){const a=angle*Math.PI/180,p=plot([major*Math.cos(a),A_STAR*Math.sin(a),0]);dotAt(p,'#83b9ed',3);const dx=p[0]-origin[0],dy=p[1]-origin[1],n=Math.hypot(dx,dy)||1;text(angle+'°',p[0]+14*dx/n-8,p[1]+22*dy/n,'#3b77ab',14);}
  if(scaled&&gain>1&&t>0){
   for(const f of geometry.faces){const ps=f.points.map(p=>mul(p,t*ETA));line([...ps,ps[0]],'#b30062',1.2,null,[3,3],localPhysicalPlot);}
   const exact=localPhysicalPlot(mul(geometry.delta.slice(0,3),t));dotAt(exact,'#a55769',3);
  }
  const polys=geometry.faces.map(f=>f.points.map(p=>mul(p,t*ETA))).sort((a,b)=>a.reduce((s,p)=>s+offsetPlot(p)[2],0)/a.length-b.reduce((s,p)=>s+offsetPlot(p)[2],0)/b.length);
  if(t<.999)for(const f of geometry.faces){const ps=f.points.map(p=>mul(p,ETA));line([...ps,ps[0]],'#b8adbf',1,null,[5,5],offsetPlot);}
  if(t>0){
   for(let axis=0;axis<3;axis++){const ps=Array.from({length:73},(_,i)=>{const p=[0,0,0];p[(axis+1)%3]=t*ETA*Math.cos(i*Math.PI/36);p[(axis+2)%3]=t*ETA*Math.sin(i*Math.PI/36);return p;});line(ps,'#849dc9',1.3,null,[5,4],offsetPlot);}
   for(const p of polys)line([...p,p[0]],'#ff1493',1.7,'#ff149317',[],offsetPlot);
   geometry.generators.forEach((g,i)=>{const point=offsetPlot(mul(g.slice(0,3),t)),active=Math.floor(i/2)===selected;arrow(ctx,centre,point,active?colors[i]:'#a9a1b76a',active?2.5:1);});
  }
  const point=offsetPlot(mul(geometry.delta.slice(0,3),t)),endpoint=offsetPlot(geometry.delta.slice(0,3));
  if(t<.999){ctx.beginPath();ctx.arc(endpoint[0],endpoint[1],5,0,2*Math.PI);ctx.strokeStyle='#bd8895';ctx.stroke();}
  if(t>0)dotAt(point,'#d52d4c',5);dotAt(centre,'#1e90ff',8);
  // Mark geometric anchors after the uncertainty mesh, so no edge hides them.
  ctx.setLineDash([3,2]);arrow(ctx,origin,radiusEnd,'#7754c4',2);ctx.setLineDash([]);dotAt(radiusEnd,'#7754c4',6);dotAt(origin,'#ddd0ff',5);
  const rd=[radiusEnd[0]-origin[0],radiusEnd[1]-origin[1]],rl=Math.hypot(...rd)||1;
  ctx.strokeStyle='#7754c4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(radiusEnd[0]-8*rd[1]/rl,radiusEnd[1]+8*rd[0]/rl);ctx.lineTo(radiusEnd[0]+8*rd[1]/rl,radiusEnd[1]-8*rd[0]/rl);ctx.stroke();
  text('bₜ',radiusEnd[0]-25,radiusEnd[1]+23,'#67439d',16);
  if(gain===1){const len=Math.hypot(...centrePosition),dir=centrePosition.map(x=>x/len);drawCanvasGap(ctx,plot(dir.map(x=>x*inner)),plot(dir.map(x=>x*(len-t*ETA))),'‖y°‖₂ − a∘ ≥ 0',w,h);}
  dotAt(centre,'#1e90ff',8);
  text(`φ = ${phi.toFixed(1)}° · t = ${t.toFixed(3)}`,16,28,'#ddd0ff');
  text(scaled?`Visibility proportions · long ellipse axis ÷${(SIGMA_MAX/major).toFixed(1)} · round disk · enclosure ×${gain.toFixed(1)}`:'Physical scale · all objects share one metric',16,55,'#ff1493');
  text('Drag y° along the ellipse · drag background to rotate · ← / → move the centre',16,h-20,'#625474',w>1600?17:12);
  text(`tηA = ${(t*ETA).toFixed(8)} · ${t===0?'live set is {y°}':'grey dashed outline: endpoint t = 1'}`,16,h-47,'#ddd0ff',w>1600?17:12);
  canvas.dataset.phi=phi;canvas.dataset.t=t;canvas.dataset.centre=geometry.centre.slice(0,3).join(',');canvas.dataset.pixelsPerUnit=String(k);canvas.dataset.camera=[az,el].join(',');canvas.dataset.centrePixel=centre.slice(0,2).join(',');canvas.dataset.actualPixel=point.slice(0,2).join(',');canvas.dataset.ellipseResidual=String((geometry.centre[0]/SIGMA_MAX)**2+(geometry.centre[1]/A_STAR)**2-1);canvas.dataset.originPixel=origin.join(',');canvas.dataset.protectedRadius=String(inner);canvas.dataset.radiusEndpoint=[0,-inner,0].join(',');canvas.dataset.radiusEndpointPixel=radiusEnd.slice(0,2).join(',');canvas.dataset.diskRightPixel=plot([inner,0,0]).slice(0,2).join(',');
  canvas.dataset.majorAxisFactor=String(major/SIGMA_MAX);canvas.dataset.displayEllipseRatio=String(major/A_STAR);canvas.dataset.enclosureRadiusPixel=String(k*t*ETA*gain);canvas.dataset.displayCentre=centrePosition.join(',');
 }
 function draw(){if(!state)return;onCameraChange(az,el);paint();}
 function update(next){state=next;const key=JSON.stringify(state.error);if(lastPhi!==state.phi||lastError!==key){geometry=outputEnclosure(state.phi,state.error);lastPhi=state.phi;lastError=key;}
  host.querySelector('[data-legend-proportions]').textContent=state.scaled?'Long axis shortened for visibility; numerical values unchanged.':'True physical proportions.';
  host.querySelector('[data-legend-protected]').textContent=(A_CIRCLE-state.t*ETA).toFixed(9);
  host.querySelector('[data-legend-allowance]').textContent=(state.t*ETA).toFixed(9);
  host.querySelector('[data-legend-magnification]').textContent=state.scaled?'Local offsets ×'+state.detailFill.toFixed(1)+'.':'Physical scale.';
  host.querySelector('[data-legend-generators]').textContent=`g${Math.floor(state.selected/2)+1}${state.selected%2+1} Re / Im`;
  host.querySelector('[data-output-displacement]').textContent=(state.t*Math.hypot(...geometry.delta)).toFixed(12);
  host.querySelector('[data-output-radius]').textContent=(state.t*ETA).toFixed(12);
  host.querySelector('[data-output-omitted]').textContent=(state.t*Math.abs(geometry.delta[3])).toFixed(12);
  host.querySelector('[data-output-scale-note]').textContent=state.scaled?`Visibility proportions: the long blue semiaxis is shortened to give a 2.8:1 ellipse. The protected disk stays round face-on; local uncertainty offsets use equal scales (×${state.detailFill.toFixed(1)}). The whole enclosure follows y° on this schematic ellipse. Numerical values are unchanged. Turn off Visibility scaling to compare all objects in one physical metric.`:'Physical scale: one shared coordinate map for the complete ellipse, uncertainty set and protected disk. Numerical values are unchanged. The camera and scale stay fixed during both animations.';
  host.querySelector('[data-output-shape-note]').textContent=`${geometry.faces.length} projected facets. Boundary motion carries y° and the whole uncertainty enclosure along the ellipse, changing all eight generating segments. Homotopy changes t about that current centre. This is a 3D projection of a 4D output zonotope.`;draw();
 }
 const nearest=(x,y)=>screenEllipse.reduce((best,p)=>{const d=Math.hypot(p.point[0]-x,p.point[1]-y);return d<best.d?{d,phi:p.phi}:best;},{d:Infinity,phi:0});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=nearest(x,y);const centreHit=Math.hypot(x-centreScreen[0],y-centreScreen[1])<24;drag={kind:centreHit||n.d<18?'centre':'camera',x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);if(drag.kind==='centre')onPhiChange(n.phi);},{signal});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;if(drag.kind==='centre'){const r=canvas.getBoundingClientRect();onPhiChange(nearest(e.clientX-r.left,e.clientY-r.top).phi);}else{az+=(e.clientX-drag.x)*.005;el=Math.max(-1.3,Math.min(1.3,el+(e.clientY-drag.y)*.005));draw();}drag.x=e.clientX;drag.y=e.clientY;},{signal});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;},{signal});
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft'||e.key==='ArrowRight')onPhiChange((state.phi+(e.key==='ArrowRight'?2:-2)+360)%360);else{el=Math.max(-1.3,Math.min(1.3,el+(e.key==='ArrowDown'?.1:-.1)));draw();}},{signal});
 const observer=new ResizeObserver(draw);observer.observe(host);
 return{update,setCamera(a,e){az=a;el=e;draw();},reset(){az=0;el=0;draw();},dispose(){observer.disconnect();abort.abort();}};
}
