/* Adapted from the approved inline moving-meter diagram. Local state and local MathJax. */
(()=>{
'use strict';
const root=document.getElementById('hardy-moving-landscape'),$=q=>root.querySelector(q),$$=q=>[...root.querySelectorAll(q)];
const NS='http://www.w3.org/2000/svg',TAU=2*Math.PI,N=4096,r=1.85,rho=2,aa=(rho+1/rho+2)/4,s0=aa+Math.sqrt(aa*aa-1),s=s0+.3*(r-s0);
const C={r:'var(--viz-series-1)',s:'var(--viz-series-2)',rho:'var(--viz-series-3)',out:'var(--viz-series-5)',red:'var(--red)',fg:'var(--foreground)',muted:'var(--muted-foreground)',border:'var(--border)',bg:'var(--background)'};
const sketchAngle=135;
let state={n:2,angle:sketchAngle,amplitude:1.5,vary:true},data,svg,geo,dragging=false,frame=0,playing=false;
// Fixed offsets preserve the sketch's arrangement as the input probe moves.
function probeAngles(){const a=state.angle*Math.PI/180;return {a,b:a-Math.PI/2,c:a-7*Math.PI/36,d:a-Math.PI/4};}
const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
function P(n,z){if(n===0)return [1,0];let a=[1,0],b=z;for(let k=1;k<n;k++){const q=mul(z,b).map((v,i)=>((2*k+1)*v-k*a[i])/(k+1));a=b;b=q;}return b;}
function response(z){const a=P(state.n,[(z[0]-1)/2,z[1]/2]),b=P(state.n,[(z[0]+1)/2,z[1]/2]);return a.map((v,i)=>(v+b[i])/2);}
const gamma=(R,t)=>[(R+1/R)*Math.cos(t)/2,(R-1/R)*Math.sin(t)/2];
const abs=z=>Math.hypot(...z),fmt=v=>Math.abs(v)<1e-10?'0':Number(v.toPrecision(4)).toString();
function compute(){let ef=0,eh=0,ms=0,mo=0,pf=0,ph=0;for(let j=0;j<N;j++){const t=TAU*j/N,a=abs(P(state.n,gamma(r,t)))**2,b=abs(response(gamma(r,t)))**2;ef+=a/N;eh+=b/N;pf=Math.max(pf,a);ph=Math.max(ph,b);ms=Math.max(ms,abs(P(state.n,gamma(s,t))));mo=Math.max(mo,abs(response(gamma(rho,t))));}return {ef,eh,ms,mo,pf,ph};}
const amplitude=()=>state.amplitude*(state.vary?1+.35*Math.cos(2*state.angle*Math.PI/180):1);
function measures(){const t=probeAngles(),A=amplitude();return [
 {key:'a',letter:'A',name:'Input Hardy',R:r,t:t.a,energy:true,color:C.r,local:A*A*abs(P(state.n,gamma(r,t.a)))**2,global:A*A*data.ef,reference:data.pf},
 {key:'b',letter:'B',name:'Output Hardy',R:r,t:t.b,energy:true,color:C.out,local:A*A*abs(response(gamma(r,t.b)))**2,global:A*A*data.eh,reference:data.ph},
 {key:'c',letter:'C',name:'Inner sup',R:s,t:t.c,energy:false,color:C.s,local:A*abs(P(state.n,gamma(s,t.c))),global:A*data.ms,reference:data.ms},
 {key:'d',letter:'D',name:'Outer sup',R:rho,t:t.d,energy:false,color:C.rho,local:A*abs(response(gamma(rho,t.d))),global:A*data.mo,reference:data.mo}
 ];}
function node(tag,attrs={},parent=svg){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.appendChild(e);return e;}
function line(a,b,color,width=1,extra={}){return node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:color,'stroke-width':width,...extra});}
function path(points,attrs={}){return node('path',{d:points.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(' '),fill:'none',...attrs});}
function text(x,y,label,anchor='middle',extra={}){const n=node('text',{x,y,'text-anchor':anchor,...extra});n.textContent=label;return n;}
function circle(p,rad,fill,extra={}){return node('circle',{cx:p[0],cy:p[1],r:rad,fill,...extra});}
function displayRadius(R){
 const xs=[0,Math.log(s),Math.log(r),Math.log(rho)],ys=[0,Math.log(6),Math.log(10),Math.log(14)],x=Math.log(Math.max(1,R));
 let i=0;while(i<2&&x>xs[i+1])i++;
 return Math.exp(ys[i]+(ys[i+1]-ys[i])*(x-xs[i])/(xs[i+1]-xs[i]));
}
function displayPoint(z){
 const [x,y]=z;
 if(Math.abs(y)<1e-13&&Math.abs(x)<=1+1e-13)return[geo.cx+geo.focal*x,geo.cy];
 const a=Math.max(1,(Math.hypot(x-1,y)+Math.hypot(x+1,y))/2),b=Math.sqrt(Math.max(0,a*a-1));
 if(b<1e-13)return[geo.cx+geo.focal*x,geo.cy];
 const t=Math.atan2(y/b,x/a);return geo.at(a+b,t);
}
function operatorMaps(){
 const t=probeAngles(),defs=node('defs');
 for(const[key,color]of[['j2',C.r],['core',C.rho],['jinf',C.out]]){const m=node('marker',{id:'hm-arrow-'+key,viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:7,markerHeight:7,orient:'auto','markerUnits':'userSpaceOnUse'},defs);node('path',{d:'M0,0 L10,5 L0,10 Z',fill:color},m);}
 const mix=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u),polar=(axes,angle)=>[geo.cx+axes[0]*Math.cos(angle),geo.cy-axes[1]*Math.sin(angle)];
 const inner=geo.axes(s),middle=geo.axes(r),outer=geo.axes(rho);
 const specs=[
  {key:'j2',color:C.r,label:'J₂',at:u=>polar(mix(middle,inner,u),t.a+(t.c-t.a)*u)},
  {key:'core',color:C.rho,label:'L̃',at:u=>polar(mix(inner,outer,u),t.c+(t.d-t.c)*u+.16*Math.sin(Math.PI*u))},
  {key:'jinf',color:C.out,label:'J∞',at:u=>polar(mix(outer,middle,u),t.d+(t.b-t.d)*u)}
 ];
 for(const q of specs){const points=Array.from({length:75},(_,i)=>q.at(.03+.94*i/74));path(points,{stroke:q.color,'stroke-width':1.8,'stroke-dasharray':'6 5','stroke-opacity':.8,'marker-end':'url(#hm-arrow-'+q.key+')','data-operator':q.key});}
}
function branchMaps(){
 const theta=probeAngles().d,omega=gamma(rho,theta),start=geo.at(rho,theta),defs=node('defs'),marker=node('marker',{id:'hm-branch-arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:8,markerHeight:8,orient:'auto','markerUnits':'userSpaceOnUse'},defs);
 node('path',{d:'M0,0 L10,5 L0,10 Z',fill:C.fg},marker);
 const points=[];
 for(const[sign,key]of[[-1,'minus'],[1,'plus']]){
  const z=[(omega[0]+sign)/2,omega[1]/2],end=displayPoint(z),v=[end[0]-start[0],end[1]-start[1]],length=abs(v),T=v.map(x=>x/length),normal=[-T[1],T[0]],from=start.map((x,i)=>x+T[i]*7),to=end.map((x,i)=>x-T[i]*7),control=start.map((x,i)=>(x+end[i])/2+normal[i]*sign*(geo.small?8:16));
  node('path',{d:`M${from[0]},${from[1]} Q${control[0]},${control[1]} ${to[0]},${to[1]}`,fill:'none',stroke:C.fg,'stroke-width':1.8,'marker-end':'url(#hm-branch-arrow)','data-branch-arrow':key});
  const endpoint=sign<0?circle(end,4,C.fg):path([[end[0],end[1]-6],[end[0]+6,end[1]],[end[0],end[1]+6],[end[0]-6,end[1]],[end[0],end[1]-6]],{fill:C.fg});
  for(const[k,v]of Object.entries({'data-branch-point':key,'data-real':z[0],'data-imag':z[1]}))endpoint.setAttribute(k,v);
  circle(end,16,'transparent',{'data-tooltip':`τ${sign<0?'−':'+'}(ω) = ${fmt(z[0])} ${z[1]<0?'−':'+'} ${fmt(Math.abs(z[1]))}i`});
  const a=(s+1/s)/2,b=(s-1/s)/2;points.push({branch:sign,source:omega,target:z,innerEllipseLevel:(z[0]/a)**2+(z[1]/b)**2,display:end});
 }
 root.dataset.branchPoints=JSON.stringify(points);
}
function meter(m){
 const axes=geo.axes(m.R),foot=geo.at(m.R,m.t),tangent=[-axes[0]*Math.sin(m.t),-axes[1]*Math.cos(m.t)],len=abs(tangent),T=tangent.map(x=>x/len),normal=[-T[1],T[0]];
 // The same bounded scale serves the local reading and its whole-boundary guide.
 const normalChord=2*((foot[0]-geo.cx)*normal[0]/axes[0]**2+(foot[1]-geo.cy)*normal[1]/axes[1]**2)/(normal[0]**2/axes[0]**2+normal[1]**2/axes[1]**2);
 const H=Math.min(geo.small?42:72,m.energy?Infinity:.7*normalChord),half=geo.small?22:41,scale=v=>H*(-Math.expm1(-v/Math.max(m.reference,1e-15))),local=scale(m.local),full=scale(m.global);
 const xy=(u,v)=>[foot[0]+T[0]*u+normal[0]*v,foot[1]+T[1]*u+normal[1]*v];
 if(m.energy){
  const base=[],ridge=[];
  for(let j=0;j<=40;j++){const u=2*j/40-1,b=geo.at(m.R,m.t+u*half/len),lift=local*(Math.exp(-4.5*u*u)-Math.exp(-4.5))/(1-Math.exp(-4.5));base.push(b);ridge.push([b[0]+normal[0]*lift,b[1]+normal[1]*lift]);}
  path([...base,...ridge.slice().reverse(),base[0]],{fill:m.color,'fill-opacity':.2,'data-glyph':'hardy-hump','data-key':m.key});
  path(ridge,{stroke:m.color,'stroke-width':2.2});
 }else{
  // The light is the boundary evaluation point. The stem extends into the ellipse.
  const halfTower=(geo.small?7:10)*Math.min(1,local/14),reach=geo.small?19:30;
  const clip=node('clipPath',{id:'hm-inside-'+m.key},node('defs'));
  node('ellipse',{cx:geo.cx,cy:geo.cy,rx:axes[0],ry:axes[1]},clip);
  const group=node('g',{'clip-path':'url(#hm-inside-'+m.key+')','data-meter-interior':m.key});
  const mast=path([xy(-halfTower,-local),xy(-halfTower*.4,0),xy(halfTower*.4,0),xy(halfTower,-local),xy(-halfTower,-local)],{fill:m.color,'fill-opacity':.25,stroke:m.color,'stroke-width':2,'data-glyph':'lighthouse','data-key':m.key});group.appendChild(mast);
  // Inward beams stay inside the same ellipse and vanish with a zero reading.
  const beamDepth=Math.min(local,18),beamReach=reach*Math.min(1,local/18);
  for(const sign of[-1,1])group.appendChild(path([foot,xy(sign*beamReach,-beamDepth*.35),xy(sign*beamReach,-beamDepth),foot],{fill:m.color,'fill-opacity':.25}));
  group.appendChild(line(xy(-16,-full),xy(16,-full),m.color,1.7,{'stroke-dasharray':'4 3','data-guide':m.key}));
  const stem=line(xy(0,-local),foot,m.color,2.4,{'data-stem':m.key,'data-local-length':local});group.appendChild(stem);
 }
 if(m.energy)line(xy(-16,full),xy(16,full),m.color,1.7,{'stroke-dasharray':'4 3','data-guide':m.key});
 circle(foot,m.key==='a'?6:3,C.bg,{stroke:m.color,'stroke-width':m.key==='a'?2.5:1.5,'data-foot':m.key});
 if(m.key==='a')circle(foot,20,'transparent',{'data-drag-hit':'true'});

}
function draw(){
 const w=Math.max(280,$('#hm-scene').getBoundingClientRect().width),small=w<520,pad=small?18:80,rx=(w-2*pad)/2,focal=rx/((14+1/14)/2),vertical=small?.84:.69,axes=R=>{const D=displayRadius(R);return[focal*(D+1/D)/2,vertical*focal*(D-1/D)/2];},ry=axes(rho)[1],h=2*ry+2*(small?58:90),cx=w/2,cy=h/2;
 geo={w,h,cx,cy,focal,small,axes,at:(R,t)=>{const a=axes(R);return[cx+a[0]*Math.cos(t),cy-a[1]*Math.sin(t)];}};
 if(!svg){svg=document.createElementNS(NS,'svg');svg.classList.add('hm-diagram','cursor-interaction');svg.setAttribute('role','img');$('#hm-scene').appendChild(svg);svg.addEventListener('pointerdown',startDrag);svg.addEventListener('pointermove',moveDrag);svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);}
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('height',h);svg.replaceChildren();
 node('title').textContent='Two moving Hardy humps and two moving supremum lighthouses';
 node('desc').textContent='Three continuous nested ellipses with schematic enlarged gaps. Dashed arrows map functions f to g to h to h restricted to the middle ellipse. Two solid arrows start at the outer lighthouse light omega and point to the two inverse-branch images inside the inner ellipse. The red interval lies inside. A common elliptic-coordinate transformation is used for every boundary and point. Measurements use the actual ellipses.';
 for(const[R,c,key]of[[rho,C.rho,'rho'],[r,C.r,'r'],[s,C.s,'s']])node('ellipse',{cx,cy,rx:axes(R)[0],ry:axes(R)[1],fill:'none',stroke:c,'stroke-width':1.6,'data-boundary':key});
 operatorMaps();
 branchMaps();
 const halfInterval=focal;
 line([cx-halfInterval,cy],[cx+halfInterval,cy],C.red,3,{'data-interval':'-1,1'});circle([cx-halfInterval,cy],2.5,C.red);circle([cx+halfInterval,cy],2.5,C.red);text(cx-halfInterval,cy+18,'−1');text(cx+halfInterval,cy+18,'1');
 measures().forEach(meter);
 for(const e of svg.querySelectorAll('[data-tooltip]'))node('title',{},e).textContent=e.dataset.tooltip;
 svg.setAttribute('aria-label',`Input angle ${Math.round(state.angle)} degrees, degree ${state.n}, effective amplitude ${fmt(amplitude())}. Four moving measurement markers connected by three operator arrows.`);
}
function readouts(announce=false){
 $('#hm-angle').value=state.angle;$('#hm-degree').value=state.n;$('#hm-amplitude').value=state.amplitude;
 $('#hm-angle-out').textContent=Math.round(state.angle)+'°';$('#hm-degree-out').textContent=state.n;$('#hm-amplitude-out').textContent=fmt(state.amplitude);
 $('#hm-vary').checked=state.vary;$('#hm-family-status').textContent=state.vary?`Moving the point also changes f · effective amplitude = ${fmt(amplitude())}`:'Fixed input function · moving probes change local readings only.';
 const vals=measures();for(const m of vals){$('#hm-local-'+m.key).textContent=fmt(m.local);$('#hm-full-'+m.key).textContent=(m.energy?'Mean ≈ ':'Max ≈ ')+fmt(m.global);}
 root.dataset.angle=state.angle;root.dataset.degree=state.n;root.dataset.amplitude=state.amplitude;root.dataset.effectiveAmplitude=amplitude();root.dataset.vary=state.vary;root.dataset.values=JSON.stringify(vals.map(m=>({key:m.key,local:m.local,global:m.global})));
 const normSummary=`Hardy norms: input ≈ ${fmt(Math.sqrt(vals[0].global))}, output ≈ ${fmt(Math.sqrt(vals[1].global))}.`;
 $('#hm-status').textContent=normSummary;
 if(announce)$('#hm-announcement').textContent=normSummary;
}
function render(announce=false){draw();readouts(announce);}
function stop(){cancelAnimationFrame(frame);playing=false;$('#hm-play').textContent='Move once around';$('#hm-play').setAttribute('aria-pressed','false');}
function save(){try{localStorage.setItem('convolution-factorisation-v1',JSON.stringify({modelContent:{kind:'hardy-factorisation-moving-meters',version:2,...state}}));}catch{}}
function restore(raw){const p=raw?.modelContent||raw?.privateContent;if(!p||p.version!==2||p.kind!=='hardy-factorisation-moving-meters')return;state={angle:Number.isFinite(p.angle)?Math.max(0,Math.min(360,p.angle)):135,n:Number.isFinite(p.n)?Math.max(0,Math.min(6,Math.round(p.n))):2,amplitude:Number.isFinite(p.amplitude)?Math.max(0,Math.min(2,p.amplitude)):1,vary:p.vary!==false};}
function pointer(e){const b=svg.getBoundingClientRect();return[(e.clientX-b.left)*geo.w/b.width,(e.clientY-b.top)*geo.h/b.height];}
function angleAt(p){const a=geo.axes(r);return (Math.atan2((geo.cy-p[1])/a[1],(p[0]-geo.cx)/a[0])*180/Math.PI+360)%360;}
function startDrag(e){if(e.button!==0)return;const p=pointer(e),a=geo.axes(r),dx=(p[0]-geo.cx)/a[0],dy=(geo.cy-p[1])/a[1];if(Math.abs(Math.hypot(dx,dy)-1)>.24)return;stop();dragging=true;svg.setPointerCapture(e.pointerId);svg.style.touchAction='none';state.angle=angleAt(p);render();e.preventDefault();}
function moveDrag(e){if(dragging){state.angle=angleAt(pointer(e));render();}}
function endDrag(e){if(!dragging)return;dragging=false;svg.style.touchAction='pan-y';if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);readouts(true);save();}
for(const[id,key]of[['hm-angle','angle'],['hm-degree','n'],['hm-amplitude','amplitude']]){$('#'+id).addEventListener('input',e=>{stop();state[key]=+e.target.value;if(key==='n')data=compute();render();});$('#'+id).addEventListener('change',()=>{readouts(true);save();});}
$('#hm-vary').addEventListener('change',e=>{stop();state.vary=e.target.checked;render(true);save();});
$('#hm-arrange').addEventListener('click',()=>{stop();state.angle=sketchAngle;render(true);save();});
$('#hm-play').addEventListener('click',()=>{if(playing){stop();readouts(true);save();return;}if(matchMedia('(prefers-reduced-motion: reduce)').matches){state.angle=(state.angle+45)%360;render(true);save();return;}playing=true;$('#hm-play').textContent='Pause';$('#hm-play').setAttribute('aria-pressed','true');const start=performance.now(),from=state.angle;let last=0;function tick(now){const u=Math.min(1,(now-start)/12000);state.angle=(from+u*360)%360;if(now-last>35||u===1){render();last=now;}if(u<1)frame=requestAnimationFrame(tick);else{stop();readouts(true);save();}}frame=requestAnimationFrame(tick);});
try{restore(JSON.parse(localStorage.getItem('convolution-factorisation-v1')));}catch{}
window.addEventListener('pagehide',stop);
data=compute();render(true);new ResizeObserver(()=>draw()).observe($('#hm-scene'));root.dataset.ready='true';
Promise.resolve(window.MathJax?.startup?.promise).then(()=>window.MathJax.typesetPromise([...document.querySelectorAll('.math,.math-static')])).then(()=>{root.dataset.mathReady='true';draw();}).catch(()=>{root.dataset.mathReady='error';$('#hm-status').textContent='Formulas could not load. Reload the page to try again.';});
})();
