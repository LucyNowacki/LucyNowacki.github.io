(()=>{'use strict';
const root=document.getElementById('lesson-lab'),$=id=>root.querySelector('#cj-'+id),M=window.CoefficientMath,T=2*Math.PI,C=M.C;
const colours=['var(--viz-series-1)','var(--viz-series-2)','var(--viz-series-3)'];
let state={mode:'coefficient',example:'square',n:2,r:1.6,t:90,x:.35},cache={},serial=0,queue=Promise.resolve();
const fmt=x=>Math.abs(x)<1e-10?'0':Number(x.toPrecision(6)).toString(),cf=z=>fmt(z.re)+(Math.abs(z.im)<1e-10?'':(z.im<0?' − ':' + ')+fmt(Math.abs(z.im))+'i');
const ring=(r,N=180)=>Array.from({length:N+1},(_,i)=>M.polar(r,T*i/N)),ellipse=r=>ring(1).map((_,i)=>M.gamma(r,T*i/180));
function plane(id,points){const s=d3.select($(id)),W=$(id).getBoundingClientRect().width,H=280,p={l:64,r:20,t:18,b:48};s.attr('viewBox',`0 0 ${W} ${H}`);s.selectAll('*').remove();
 const all=points.concat([C(0)]),xr=d3.extent(all,d=>d.re),yr=d3.extent(all,d=>d.im),dx=Math.max(.05,xr[1]-xr[0]),dy=Math.max(.05,yr[1]-yr[0]),scale=Math.min((W-p.l-p.r)/(dx*1.3),(H-p.t-p.b)/(dy*1.3)),cx=(xr[0]+xr[1])/2,cy=(yr[0]+yr[1])/2;
 const x=v=>(p.l+W-p.r)/2+(v-cx)*scale,y=v=>(p.t+H-p.b)/2-(v-cy)*scale;
 s.append('rect').attr('data-chart-frame','').attr('x',p.l).attr('y',p.t).attr('width',W-p.l-p.r).attr('height',H-p.t-p.b).attr('fill','none').attr('stroke','var(--border)');
 const xd=[cx-(W-p.l-p.r)/(2*scale),cx+(W-p.l-p.r)/(2*scale)],yd=[cy-(H-p.t-p.b)/(2*scale),cy+(H-p.t-p.b)/(2*scale)];
 s.append('g').attr('transform',`translate(0,${H-p.b})`).call(d3.axisBottom(d3.scaleLinear(xd,[p.l,W-p.r])).ticks(3).tickFormat(d3.format('.2~g')));
 s.append('g').attr('transform',`translate(${p.l},0)`).call(d3.axisLeft(d3.scaleLinear(yd,[H-p.b,p.t])).ticks(3).tickFormat(d3.format('.2~g')));
 s.selectAll('.domain,.tick line').attr('stroke','var(--border)');
 if(yd[0]<0&&yd[1]>0)s.append('line').attr('x1',p.l).attr('x2',W-p.r).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','var(--border)');
 if(xd[0]<0&&xd[1]>0)s.append('line').attr('x1',x(0)).attr('x2',x(0)).attr('y1',p.t).attr('y2',H-p.b).attr('stroke','var(--border)');
 s.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',W-p.r).attr('y',H-7).attr('text-anchor','end').text('Real part');
 s.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',6).attr('y',12).text('Imaginary part');
 return{path(a,c,width=2){s.append('path').attr('d',d3.line().x(d=>x(d.re)).y(d=>y(d.im))(a)).attr('fill','none').attr('stroke',c).attr('stroke-width',width)},dot(a,c,r=5){s.append('circle').attr('cx',x(a.re)).attr('cy',y(a.im)).attr('r',r).attr('fill',c)},diamond(a){s.append('path').attr('d',`M${x(a.re)},${y(a.im)-7}l7,7 -7,7 -7,-7Z`).attr('fill','none').attr('stroke','var(--foreground)').attr('stroke-width',2)},arrow(a,b,c){this.path([a,b],c,2);const ang=Math.atan2(y(b.im)-y(a.im),x(b.re)-x(a.re)),X=x(b.re),Y=y(b.im);s.append('path').attr('d',`M${X},${Y}L${X-8*Math.cos(ang-.4)},${Y-8*Math.sin(ang-.4)}L${X-8*Math.cos(ang+.4)},${Y-8*Math.sin(ang+.4)}Z`).attr('fill',c)}};
}
function data(){const key=[state.mode,state.example,state.n,state.r,state.x].join('|');if(cache.key===key)return cache;const N=1024,terms=M.qTerms(state.n,state.r,160),points=[C(0)],values=[];
 function density(t){const g=M.gamma(state.r,t),tan=M.tangent(state.r,t),f=M.example(state.example,g),factor=state.mode==='value'?M.div(C(1),M.sub(g,C(state.x))):M.evaluateTerms(terms,t),v=M.mul(M.mul(f,factor),tan);return M.scale(C(v.im,-v.re),state.mode==='value'?1:2*state.n+1)}
 for(let i=0;i<N;i++){const v=density(T*(i+.5)/N);values.push(v);points.push(M.add(points[i],M.scale(v,1/N)))}
 const target=state.mode==='value'?M.example(state.example,state.x).re:state.example==='square'?M.exactSquareCoefficient(state.n):M.coefficient(state.example,state.n);
 cache={key,N,points,values,target};return cache;
}
function draw(){const d=data(),t=state.t*T/360,z=M.polar(state.r,t),g=M.gamma(state.r,t),tan=M.tangent(state.r,t),target=C(d.target),idx=Math.min(d.N-1,Math.floor(state.t/360*d.N)),u=state.t/360*d.N-idx,current=M.add(d.points[idx],M.scale(d.values[idx],u/d.N));
 let p=plane('circle',ring(state.r));p.path(ring(state.r),'var(--border)',1);p.path(Array.from({length:100},(_,i)=>M.polar(state.r,t*i/99)),colours[0],3);p.arrow(C(0),z,colours[0]);p.dot(z,colours[0]);
 const end=M.add(g,M.scale(tan,.23/M.abs(tan))),ep=ellipse(state.r);p=plane('ellipse',ep.concat([end,C(-1),C(1)]));p.path(ep,'var(--border)',1);p.path(Array.from({length:100},(_,i)=>M.gamma(state.r,t*i/99)),colours[1],3);p.path([C(-1),C(1)],'var(--foreground)',2);p.arrow(g,end,colours[1]);p.dot(g,colours[1]);if(state.mode==='value')p.diamond(C(state.x));
 p=plane('sum',d.points.concat([target]));p.path(d.points,'var(--border)',1);p.path(d.points.slice(0,idx+1).concat([current]),colours[2],2.5);p.dot(C(0),'var(--foreground)',3);p.diamond(target);p.dot(current,colours[2]);
 $('partial').textContent=cf(current);$('full').textContent=cf(d.points[d.N]);$('target').textContent=fmt(d.target);$('target-label').textContent=state.mode==='value'?'f(x) · direct evaluation':state.example==='square'?'aₙ · exact polynomial answer':'aₙ · independent real quadrature';
 $('detail').textContent=`ϖ = ${cf(g)} · Γ′(θ) = ${cf(tan)} · full-circuit discrepancy ${Math.hypot(d.points[d.N].re-d.target,d.points[d.N].im).toExponential(1)}`;
}
function render(){for(const id of ['formula','definition'])window.MathJax?.typesetClear?.([$(id)]);$('mode').value=state.mode;$('example').value=state.example;$('n').value=state.n;$('r').value=state.r;$('t').value=state.t;$('x').value=state.x;$('rv').textContent=state.r.toFixed(2);$('tv').textContent=state.t+'°';$('xv').textContent=state.x.toFixed(2);$('x-label').hidden=state.mode!=='value';$('degree-label').hidden=state.mode==='value';
 $('formula').textContent=state.mode==='value'?'\\(F(\\theta)=\\frac1{2\\pi i}\\int_0^\\theta\\frac{f(\\Gamma_\\varrho(t))}{\\Gamma_\\varrho(t)-x}\\Gamma_\\varrho\'(t)\\,dt,\\quad F(2\\pi)=f(x).\\)':'\\(A_n(\\theta)=\\frac{2n+1}{2\\pi i}\\int_0^\\theta f(\\Gamma_\\varrho(t))Q_n(\\Gamma_\\varrho(t))\\Gamma_\\varrho\'(t)\\,dt.\\)';
 $('definition').textContent=state.mode==='value'?'\\(\\omega=\\operatorname{Jouk}(\\varrho e^{i\\theta}),\\qquad d\\omega=\\Gamma_\\varrho\'(\\theta)\\,d\\theta.\\)':'\\(\\begin{gathered}Q_n(\\omega)=\\frac12\\int_{-1}^1\\frac{P_n(x)}{\\omega-x}\\,dx,\\\\A_n(2\\pi)=a_n(f).\\end{gathered}\\)';
 draw();const ticket=++serial;queue=queue.catch(()=>{}).then(async()=>{await window.MathJax?.startup?.promise;if(ticket===serial)await window.MathJax?.typesetPromise?.([$('formula'),$('definition')])});
}
for(const id of ['mode','example','n','r','t','x'])$(id).addEventListener('input',()=>{state[id]=['mode','example'].includes(id)?$(id).value:+$(id).value;render()});
$('finish').addEventListener('click',()=>{state.t=360;render()});render();let lastWidth=root.clientWidth;new ResizeObserver(()=>{const width=root.clientWidth;if(Math.abs(width-lastWidth)<1)return;lastWidth=width;draw()}).observe(root);
})();
