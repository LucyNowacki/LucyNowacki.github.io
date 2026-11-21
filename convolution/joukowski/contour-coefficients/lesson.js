(()=>{'use strict';
const root=document.getElementById('lesson-lab'),$=id=>root.querySelector('#cj-'+id),M=window.CoefficientMath,T=2*Math.PI,C=M.C;
const colours=['var(--viz-series-1)','var(--viz-series-2)','var(--viz-series-3)'];
let state={mode:'coefficient',example:'square',n:2,r:1.6,t:90,x:.35,u:0,e:0,fit:false},cache={},serial=0,queue=Promise.resolve();
const fmt=x=>Math.abs(x)<1e-10?'0':Number(x.toPrecision(6)).toString(),cf=z=>fmt(z.re)+(Math.abs(z.im)<1e-10?'':(z.im<0?' − ':' + ')+fmt(Math.abs(z.im))+'i');
const ring=(r,N=180)=>Array.from({length:N+1},(_,i)=>M.polar(r,T*i/N)),ellipse=r=>ring(1).map((_,i)=>M.gamma(r,T*i/180));
function plane(id,points,includeOrigin=true,realOffset=null){const s=d3.select($(id)),W=$(id).getBoundingClientRect().width,H=280,p={l:64,r:20,t:18,b:48};s.attr('viewBox',`0 0 ${W} ${H}`);s.selectAll('*').remove();
 const all=includeOrigin?points.concat([C(0)]):points,xr=d3.extent(all,d=>d.re),yr=d3.extent(all,d=>d.im),dx=Math.max(1e-10,xr[1]-xr[0]),dy=Math.max(1e-10,yr[1]-yr[0]),scale=Math.min((W-p.l-p.r)/(dx*1.3),(H-p.t-p.b)/(dy*1.3)),cx=(xr[0]+xr[1])/2,cy=(yr[0]+yr[1])/2;
 const x=v=>(p.l+W-p.r)/2+(v-cx)*scale,y=v=>(p.t+H-p.b)/2-(v-cy)*scale;
 s.append('rect').attr('data-chart-frame','').attr('x',p.l).attr('y',p.t).attr('width',W-p.l-p.r).attr('height',H-p.t-p.b).attr('fill','none').attr('stroke','var(--border)');
 const xd=[cx-(W-p.l-p.r)/(2*scale),cx+(W-p.l-p.r)/(2*scale)],yd=[cy-(H-p.t-p.b)/(2*scale),cy+(H-p.t-p.b)/(2*scale)];
 s.append('g').attr('transform',`translate(0,${H-p.b})`).call(d3.axisBottom(d3.scaleLinear(xd.map(v=>v-(realOffset??0)),[p.l,W-p.r])).ticks(3).tickFormat(d3.format('.3~g')));
 s.append('g').attr('transform',`translate(${p.l},0)`).call(d3.axisLeft(d3.scaleLinear(yd,[H-p.b,p.t])).ticks(3).tickFormat(d3.format('.2~g')));
 s.selectAll('.domain,.tick line').attr('stroke','var(--border)');
 if(yd[0]<0&&yd[1]>0)s.append('line').attr('x1',p.l).attr('x2',W-p.r).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','var(--border)');
 if(xd[0]<0&&xd[1]>0)s.append('line').attr('x1',x(0)).attr('x2',x(0)).attr('y1',p.t).attr('y2',H-p.b).attr('stroke','var(--border)');
 s.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',W-p.r).attr('y',H-7).attr('text-anchor','end').text(realOffset===null?'Real part':'Real offset from centre');
 s.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',6).attr('y',12).text('Imaginary part');
 return{path(a,c,width=2){s.append('path').attr('d',d3.line().x(d=>x(d.re)).y(d=>y(d.im))(a)).attr('fill','none').attr('stroke',c).attr('stroke-width',width)},dot(a,c,r=5){s.append('circle').attr('cx',x(a.re)).attr('cy',y(a.im)).attr('r',r).attr('fill',c)},diamond(a){s.append('path').attr('d',`M${x(a.re)},${y(a.im)-7}l7,7 -7,7 -7,-7Z`).attr('fill','none').attr('stroke','var(--foreground)').attr('stroke-width',2)},arrow(a,b,c){this.path([a,b],c,2);const ang=Math.atan2(y(b.im)-y(a.im),x(b.re)-x(a.re)),X=x(b.re),Y=y(b.im);s.append('path').attr('d',`M${X},${Y}L${X-8*Math.cos(ang-.4)},${Y-8*Math.sin(ang-.4)}L${X-8*Math.cos(ang+.4)},${Y-8*Math.sin(ang+.4)}Z`).attr('fill',c)}};
}
function data(){
 const key=[state.mode,state.example,state.n,state.r,state.x,state.u,state.e].join('|');
 if(cache.key===key)return cache;
 const N=1024,g=window.BoundaryRibbon.geometry(state),points=[C(0)],values=[];
 const terms=state.mode==='coefficient'?M.qTerms(state.n,state.r,160):null;
 function density(t){
   const f=M.example(state.example,g.point(t));
   const kernel=terms?M.evaluateTerms(terms,t):M.div(C(1),g.difference(t));
   const v=M.mul(M.mul(f,kernel),g.tangent(t));
   return M.scale(C(v.im,-v.re),terms?2*state.n+1:1);
 }
 for(let i=0;i<N;i++){
   const v=density(T*(i+.5)/N);
   values.push(v);points.push(M.add(points[i],M.scale(v,1/N)));
 }
 const ridgeSamples=Array.from({length:128},(_,i)=>density(T*i/128));
 const densityMax=Math.max(...ridgeSamples.map(M.abs));
 const functionMax=Math.max(...ridgeSamples.map((_,i)=>M.abs(M.example(state.example,g.point(T*i/128)))));
 const target=state.mode==='value'?M.example(state.example,state.x).re:state.example==='square'?M.exactSquareCoefficient(state.n):M.coefficient(state.example,state.n);
 cache={key,g,N,points,values,target,density,ridgeSamples,densityMax,functionMax};
 return cache;
}
function draw(){
 const d=data(),g=d.g,t=state.t*T/360,z=M.polar(state.r,t),w=g.point(t),tan=g.tangent(t);
 const idx=Math.min(d.N-1,Math.floor(state.t/360*d.N)),u=state.t/360*d.N-idx;
 const current=M.add(d.points[idx],M.scale(d.values[idx],u/d.N)),target=C(d.target);
 let p=plane('circle',ring(state.r));
 p.path(ring(state.r),'var(--border)',1);p.path(Array.from({length:100},(_,i)=>M.polar(state.r,t*i/99)),colours[0],3);
 p.arrow(C(0),z,colours[0]);p.dot(z,colours[0]);
 const loop=Array.from({length:241},(_,i)=>g.point(T*i/240));
 const end=M.add(w,M.scale(tan,.22)), focused=state.fit&&g.u>0;
 const domain=focused?[C(g.center-1.23*g.A,-1.23*g.B),C(g.center+1.23*g.A,1.23*g.B)]:
                      [C(-1.23*g.a,-1.23*g.b),C(1.23*g.a,1.23*g.b)];
 p=plane('ellipse',domain,!focused,focused?g.center:null);
 if(!focused && g.u>0)p.path(ellipse(state.r),'var(--border)',1);
 const lo=focused?Math.max(-1,g.center-1.2*g.A):-1,hi=focused?Math.min(1,g.center+1.2*g.A):1;
 if(hi>lo)p.path([C(lo),C(hi)],'#ff7189',2);
 p.path(loop,'#ae89bf',2);
 p.path(Array.from({length:151},(_,i)=>g.point(t*i/150)),'#ffcd77',3);
 p.arrow(w,end,'#ff77bc');p.dot(w,'#ffcd77',4);
 if(state.mode==='value')p.diamond(C(state.x));
 p=plane('sum',d.points.concat([target]));
 p.path(d.points,'var(--border)',1.5);p.path(d.points.slice(0,idx+1).concat([current]),colours[2],2.5);
 p.dot(C(0),'var(--foreground)',3);p.diamond(target);p.dot(current,colours[2]);
 $('partial').textContent=cf(current);$('full').textContent=cf(d.points[d.N]);$('target').textContent=fmt(d.target);
 $('target-label').textContent=state.mode==='value'?'f(x) · direct evaluation':state.example==='square'?'aₙ · exact polynomial answer':'aₙ · independent real quadrature';
 $('detail').textContent='ϖ = '+cf(w)+'   ·   tangent = '+cf(tan)+'   ·   speed = '+fmt(M.abs(tan))+'   ·   full-circuit discrepancy '+Math.hypot(d.points[d.N].re-d.target,d.points[d.N].im).toExponential(1);
 $('uv').textContent=Math.round(100*state.u)+'%';$('ev').textContent=fmt(g.eps);
 $('tv').textContent=state.t+'°';$('t').value=state.t;
 $('fit').setAttribute('aria-pressed',String(state.fit));$('fit').hidden=state.mode!=='value'||g.u===0;
 $('fit').textContent=state.fit?'Show entire ellipse':'Fit moving contour';
 $('origin').hidden=!focused; $('origin').textContent=focused?'Horizontal offsets are measured from Re = '+fmt(g.center)+'.':'';
 window.BoundaryRibbon.render(state,d);
 window.BoundaryProofLab?.draw(state);
}
let lastFormula='';
function render(){
 for(const id of ['mode','example','n','r','t','x','u','e'])$(id).value=state[id];
 $('rv').textContent=state.r.toFixed(2);$('xv').textContent=state.x.toFixed(2);
 const value=state.mode==='value';
 $('x-label').hidden=!value;$('degree-label').hidden=value;$('shape-controls').hidden=!value;$('slit-note').hidden=value;
 const which=value?(state.u>0?'deformed':'value'):'coefficient';
 if(which!==lastFormula){
   lastFormula=which;
   for(const id of ['formula','definition'])window.MathJax?.typesetClear?.([$(id)]);
   const H=which==='deformed'?'H_u':'\\Gamma_\\varrho';
   $('formula').textContent=value?
     '\\(F(\\theta)=\\frac1{2\\pi i}\\int_0^\\theta\\frac{f('+H+'(t))}{'+H+'(t)-x}'+H+"'(t)\\,dt,\\qquad F(2\\pi)=f(x).\\)":
     "\\(A_n(\\theta)=\\frac{2n+1}{2\\pi i}\\int_0^\\theta f(\\Gamma_\\varrho(t))Q_n(\\Gamma_\\varrho(t))\\Gamma_\\varrho'(t)\\,dt.\\)";
   $('definition').textContent=value?(which==='deformed'?
     "\\(H_u(t)=(1-u)\\Gamma_\\varrho(t)+u(x+\\varepsilon e^{it}),\\quad d\\varpi=H_u'(t)\\,dt.\\)":
     "\\(\\varpi=\\Gamma_\\varrho(t),\\qquad d\\varpi=\\Gamma_\\varrho'(t)\\,dt.\\)"):
     '\\(Q_n(\\varpi)=\\tfrac12\\int_{-1}^1\\frac{P_n(x)}{\\varpi-x}\\,dx,\\qquad A_n(2\\pi)=a_n(f).\\)';
   const ticket=++serial;
   queue=queue.catch(()=>{}).then(async()=>{await window.MathJax?.startup?.promise;if(ticket===serial)await window.MathJax?.typesetPromise?.([$('formula'),$('definition')])});
 }
 draw();
}
let animation=0,started=0,lastUpdate=0,morphing=false;
function stop(){
 cancelAnimationFrame(animation);animation=0;morphing=false;
 $('morph').textContent='Deform while orbiting';$('morph').setAttribute('aria-pressed','false');
 $('partial').closest('.viz-grid').setAttribute('aria-live','polite');
 $('play').textContent='Play circuit';$('play').setAttribute('aria-pressed','false');
}
function rotate(now){
 if(!started)started=now-state.t*40;
 if(now-lastUpdate>=55){
   state.t=Math.min(360,Math.round((now-started)/40));draw();lastUpdate=now;
 }
 if(state.t===360){stop();return;}
 animation=requestAnimationFrame(rotate);
}
$('play').addEventListener('click',()=>{
 if(animation){const wasMorphing=morphing;stop();if(!wasMorphing)return;}
 if(state.t===360)state.t=0;
 started=0; lastUpdate=0; $('partial').closest('.viz-grid').setAttribute('aria-live','off');
 $('play').textContent='Pause circuit';$('play').setAttribute('aria-pressed','true');
 animation=requestAnimationFrame(rotate);
});
$('morph').addEventListener('click',()=>{
 const wasMorphing=morphing;stop();if(wasMorphing)return;
 const initial=state.u>=1?0:state.u;
 const began=performance.now();
 state.fit=false; morphing=true; lastUpdate=0;
 $('morph').textContent='Pause deformation';$('morph').setAttribute('aria-pressed','true');
 $('partial').closest('.viz-grid').setAttribute('aria-live','off');
 function trace(now){
   const fraction=Math.min(1,(now-began)/11000);
   if(now-lastUpdate>65 || fraction===1) {
     state.u=initial+(1-initial)*fraction; state.t=Math.round(360*fraction);
     render(); lastUpdate=now;
   }
   if(fraction===1)stop();else animation=requestAnimationFrame(trace);
 }
 animation=requestAnimationFrame(trace);
});
for(const id of ['mode','example','n','r','t','x','u','e'])$(id).addEventListener('input',()=>{
 stop();state[id]=['mode','example'].includes(id)?$(id).value:+$(id).value;render();
});
$('fit').addEventListener('click',()=>{state.fit=!state.fit;draw()});
function filmExample() {
 stop();Object.assign(state,{mode:'value',example:'square',n:2,r:2,x:.5,u:0,e:0,t:0,fit:false});render();
}
$('demo').addEventListener('click',filmExample);
window.addEventListener('hashchange',()=>{if(['#bc-deformation','#bc-height'].includes(location.hash))filmExample()});
$('small').addEventListener('click',()=>{stop();state.u=1;state.fit=true;render()});
$('finish').addEventListener('click',()=>{stop();state.t=360;draw()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
if(['#bc-deformation','#bc-height'].includes(location.hash))filmExample();else render();
let lastWidth=root.clientWidth;
new ResizeObserver(()=>{const width=root.clientWidth;if(Math.abs(width-lastWidth)<1)return;lastWidth=width;draw()}).observe(root);
})();
