import {measureLiftLabel,drawLiftLabel} from './lift-canvas-label.mjs?v=103';
import {drawCanvasGap} from './output-gap-segment.mjs?v=103';
import {outputGap} from './output-gap.mjs?v=103';
import {TOY} from './step-one.mjs?v=103';
import {resolvent,reciprocalCircles,BOUNDS} from './step-three.mjs?v=103';
import {CENTER,DELTA} from './step-five-math.mjs?v=103';
import {frame} from './step-ten-math.mjs?v=103';
import {ETA} from './gate-two-math.mjs?v=103';
import {output3d,matrixRay,matrixPoint,MATRIX_N,radialSection} from './story-3d-math.mjs?v=103';
// Presentation-only night palette. Geometric maps and all certificate values are unchanged.
export const PALETTE={certificate:'#9b83ff',image:'#1e90ff',structure:'#c5adff',finite:'#ff1493',operator:'#00ff00',actual:'#ff526f',box:'#ff1493',ref:'#b9bdd0',vector:'#00ffff',protected:'#d3d3d3',background:'#100b1e',label:'#ffffff',leader:'#f0edf8',clearance:'#ffc46b'};
const sphere=(r,n)=>n.map(x=>x*r),ellipsoid=(a,n)=>n.map((x,i)=>x*a[i]);
export function drawStory3D(canvas,id,state){
 // The larger explorer gets a hold-to-read gap key; miniature navigation tiles stay buttons.
 if(!canvas.closest('button')){
  const key=[6,8].includes(id)?String(id):'',old=canvas.nextElementSibling;
  if(old?.classList.contains('output-gap-help')&&old.dataset.sceneGap!==key)old.remove();
  if(key&&!canvas.nextElementSibling?.classList.contains('output-gap-help')){
   canvas.insertAdjacentHTML('afterend',id===8?outputGap(String.raw`y^{B_{\mathrm{lift}}}`,String.raw`\underline s_{\Gamma,2}^{H}`):outputGap());
   canvas.nextElementSibling.dataset.sceneGap=key;
  }
 }

 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 const W=rect.width,H=rect.height,dpr=Math.min(devicePixelRatio||1,2),ctx=canvas.getContext('2d');if(canvas.width!==Math.round(W*dpr))canvas.width=Math.round(W*dpr);if(canvas.height!==Math.round(H*dpr))canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=PALETTE.background;ctx.fillRect(0,0,W,H);
 const P=PALETTE,font=Math.max(14,Math.min(24,W*.034)),yaw=state.yaw??-.45,pitch=state.pitch??.27,zoom=state.zoom??1;
 let gapEnds=null,gapText='';
 let fitScale=null,range=1,centre=[W/2,H*.49],surfaces=[],paths=[],points=[],labels=[];
 const rotate=p=>{const x=Math.cos(yaw)*p[0]+Math.sin(yaw)*p[2],z=-Math.sin(yaw)*p[0]+Math.cos(yaw)*p[2];return[x,Math.cos(pitch)*p[1]-Math.sin(pitch)*z,Math.sin(pitch)*p[1]+Math.cos(pitch)*z];};
 const project=p=>{const q=rotate(p),s=(fitScale??Math.min(W*.42,H*.39)/range)*zoom;return[centre[0]+s*q[0],centre[1]-s*q[1],q[2]];};
 const path=(pts,color,dash=false,width=1.5)=>paths.push({pts,color,dash,width});
 const point=(p,text,color=P.actual)=>points.push({p,text,color});
 const circle=(c,r,color,plane=0,dash=false)=>path(Array.from({length:81},(_,j)=>{const t=j*Math.PI/40,p=[...c];p[0]+=r*Math.cos(t);p[plane===0?1:2]+=r*Math.sin(t);return p;}),color,dash,2);
 // Only certified protected interiors are filled; all other surfaces remain wireframes.
 const surface=(fn,color,opacity=0,dash=false,protectedInterior=false)=>surfaces.push({fn,color,opacity:protectedInterior?.28:0,dash,fillColor:PALETTE.protected});
 const axes=(r,names=['Re','Im',''])=>{for(let i=0;i<3;i++)if(names[i]){const p=[0,0,0];p[i]=r;path([p.map(x=>-x),p],i===0?P.image:P.ref,false,1);paths.at(-1).axis=true;labels.push({p,text:names[i],color:i===0?P.image:P.ref});}};
 let metrics='';
 if(id===1){
  range=.53;centre=[W*.56,H*.48];const transform=p=>{const dx=p.x-TOY.c.x,dy=p.y-TOY.c.y,d=Math.hypot(dx,dy),k=state.scaled&&d>.16?.28/d:1;return[dx*k,dy*k,0];};range=state.scaled?.34:.65;
  axes(range*.9);circle([0,0,0],DELTA,P.structure);const z={x:CENTER.re+DELTA*Math.cos(state.theta),y:CENTER.im+DELTA*Math.sin(state.theta)},zp=transform(z);
  TOY.eigenvalues.forEach((t,i)=>{const p=transform(t);point(p,i?'t₂₂ · outside':'t₁₁ · inside',P.structure);path([p,zp],i?P.operator:P.image,true);});point(zp,'z(θ)');point([0,0,0],'c',P.ref);labels.push({p:[DELTA*.7,DELTA*.7,0],text:'Γ',color:P.structure});
  metrics=`z ≈ ${z.x.toFixed(6)} + ${z.y.toFixed(6)}i · complex plane, viewed in 3D`;
 }
 if(id===2){
  range=2.1;const rr=resolvent(state.theta*180/Math.PI);[0,1].forEach(j=>{const x=j?1.05:-1.05,r=j?BOUNDS.d:BOUNDS.a,rc=reciprocalCircles[j],k=.82/r;circle([x,0,0],.82,P.certificate,0,true);circle([x+rc.c.x*k,rc.c.y*k,0],rc.r*k,P.structure);path([[x-.95,0,0],[x+.95,0,0]],P.ref);point([x+rr.w[j].x*k,rr.w[j].y*k,0],j?'w₂':'w₁');labels.push({p:[x,-1.12,0],text:j?'disk radius 1/d̲₂':'disk radius 1/d̲₁',color:P.certificate});});metrics='Reciprocal complex planes · independent scales · uniform enclosure radii';
 }
 if(id===3||id===4){
  const b=id===3?.0392113527:.03921135;range=id===3?b*3.05:b*1.6;
  if(id===3){surface(n=>ellipsoid([b*2.7,b*1.3,b*1.3],n),P.image);surface(n=>sphere(b,n),P.certificate,.13,false,true);axes(b*3,['output 1','output 2','output 3']);metrics='Containment schematic · κ₂(Q₂°) ≤ 1 + 10⁻¹⁵ · bound stays fixed';}
  else {const radii=state.scaled?[b*1.35,b*1.15,b]:[.0392113527,.0392113526999997,b];surface(n=>sphere(radii[0],n),P.structure,.018);surface(n=>sphere(radii[1],n),P.finite,.025);surface(n=>sphere(radii[2],n),P.certificate,.11,false,true);path([[0,0,0],[b,0,0]],P.certificate,false,3);labels.push({p:[0,-b*1.55,0],text:'allowance first · rounding second',color:P.structure});metrics=state.scaled?'Separated radial schematic: 3×10⁻¹⁶ allowance; 2.6999997×10⁻⁹ rounding':'True radii overlap · no contour dependence';}
 }
 if(id===5){
  range=ETA*1.65;surface(n=>matrixRay(n,false),P.structure,.04);surface(n=>matrixRay(n,true),P.box,.07);axes(ETA*1.3,['x','y','q']);const n=MATRIX_N;path([[n,0,0],[0,.75*n,0],[-n,0,0],[0,-.75*n,0],[n,0,0]],P.finite,false,3);path([[0,0,0],[n,0,0]],P.actual,false,2.5);point([n,0,0],'Aᴴ',P.actual);point([0,0,0],'A°',P.image);
  const mp=state.matrix??[n,0,0],m=matrixPoint(mp);point(mp,'C(x,y,q)',m.inside?P.certificate:m.withinNorm?P.finite:P.actual);metrics=`‖C − A°‖₂ ≈ ${m.norm.toFixed(8)} · ${m.inside?'all entry constraints hold':m.withinNorm?'norm allowance holds; entry box violated':'outside the certified norm allowance'}`;
 }
 if([6,8,9].includes(id)){
  const s=output3d(id,state);range=Math.max(...s.displayAxes)*1.18;
  surface(n=>ellipsoid(s.displayAxes,n),P.image,id===8?.04:.025);
  if(!state.scaled&&id!==9)surface(n=>radialSection(s.K,n),P.structure,id===8?0:.018,id===8?[6,4]:false);
  surface(n=>sphere(s.bound,n),P.certificate,id===8?.07:.2,id===8?[4,4]:false,true);const colour=id===8?P.operator:P.finite;
  if(s.allowance){surface(n=>sphere(s.allowance,n).map((v,i)=>v+s.displayCentre[i]),colour,.13);const len=Math.hypot(...s.displayCentre),nearest=s.displayCentre.map(v=>v*(1-s.allowance/len));path([[0,0,0],nearest],colour,false,2);point(nearest,'gap',colour);}
  if(id!==9){const len=Math.hypot(...s.displayCentre),dir=s.displayCentre.map(x=>x/len);gapEnds=[dir.map(x=>x*s.bound),dir.map(x=>x*(len-s.allowance))];gapText=id===8?'‖y^{B_{lift}}‖₂ − s̲Γ,₂ᴴ ≥ 0':'‖y°‖₂ − a∘ ≥ 0';}
  path([[0,0,0],s.displayCentre],P.vector,[3,2],1.5);point(s.displayCentre,id===9?'y(v)':id===8?'y^{B_{lift}}':'y°',P.image);
  if(id!==9){point(s.displayProjection,'projected y',P.actual);}
  axes(range*.95,['u max','u min',id===8?'added':'i u min']);point([0,0,0],'0',P.ref);path([[0,0,0],[-s.bound,0,0]],P.certificate,[3,2],2);point([-s.bound,0,0],state.schurCertificateOnly?'Schur radius ρ(t)':'certified radius',P.certificate);
  metrics=`${state.schurCertificateOnly?'Schur-inherited radius ρ(t)':'certified radius'} ${s.bound.toFixed(9)} · unit input ‖x‖ ≈ ${s.inputNorm.toFixed(5)} · ‖y‖ ≈ ${s.actualNorm.toFixed(7)} · out-of-plane ≈ ${s.omitted.toExponential(2)}`;
  if(id===9)metrics='Fixed z* · selected output length ≈ '+s.actualNorm.toFixed(7)+' · shortest radius a* ≈ 0.0433674471';
 }
 if(id===7){const f=frame(state.theta),b=.029445725,a=state.scaled?f.axes.map(x=>Math.min(x,3*b)):f.axes;range=Math.max(...a)*1.2;surface(n=>ellipsoid(a,n),P.image,.025);surface(n=>sphere(b,n),P.certificate,.18,false,true);axes(range*.94,['σmax','σmin','|z|']);point([0,0,0],'0',P.ref);metrics=`resolved σmin ≈ ${f.axes[1].toFixed(7)} · |z| ≈ ${f.axes[2].toFixed(7)} · exact lift, no loss`;}
 // Fit the actual geometry to its measured canvas, keeping a single Euclidean scale.
 const cloud=[];for(const sf of surfaces)for(let i=0;i<=10;i++)for(let j=0;j<24;j++){const lat=-Math.PI/2+i*Math.PI/10,u=j*Math.PI/12;cloud.push(rotate(sf.fn([Math.cos(lat)*Math.cos(u),Math.sin(lat),Math.cos(lat)*Math.sin(u)])));}for(const p of paths)if(!p.axis)cloud.push(...p.pts.map(rotate));cloud.push(...points.map(p=>rotate(p.p)));if(cloud.length){const minx=Math.min(...cloud.map(p=>p[0])),maxx=Math.max(...cloud.map(p=>p[0])),miny=Math.min(...cloud.map(p=>p[1])),maxy=Math.max(...cloud.map(p=>p[1]));fitScale=Math.min((W-90)/(maxx-minx||1),(H-55)/(maxy-miny||1));centre=[W/2-fitScale*zoom*(maxx+minx)/2,H*.48+fitScale*zoom*(maxy+miny)/2];}
 // Protected interiors are depth-sorted gray tessellations; all surface edges are wireframes.
 const faces=[];for(const surf of surfaces){const rows=12,cols=24,grid=Array.from({length:rows+1},(_,i)=>Array.from({length:cols+1},(_,j)=>{const lat=-Math.PI/2+i*Math.PI/rows,u=j*2*Math.PI/cols;return surf.fn([Math.cos(lat)*Math.cos(u),Math.sin(lat),Math.cos(lat)*Math.sin(u)]);}));for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const pts=[grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j+1]].map(project);faces.push({pts,depth:pts.reduce((s,p)=>s+p[2],0)/4,...surf});}for(let i=2;i<rows;i+=2)path(grid[i],surf.color+'c7',surf.dash);for(let j=0;j<cols;j+=4)path(grid.map(row=>row[j]),surf.color+'a8',surf.dash);}
 faces.sort((a,b)=>a.depth-b.depth);for(const f of faces){ctx.beginPath();f.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.globalAlpha=f.opacity;ctx.fillStyle=f.fillColor;ctx.fill();}ctx.globalAlpha=1;
 for(const p of paths){ctx.beginPath();p.pts.map(project).forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.setLineDash(Array.isArray(p.dash)?p.dash:p.dash?[5,5]:[]);ctx.strokeStyle=p.color;ctx.lineWidth=p.width;ctx.stroke();}ctx.setLineDash([]);
 ctx.font=`${font}px system-ui`;const occupied=[];
 function place(text,xy,color){const tw=measureLiftLabel(ctx,text);let best=null;for(const dy of [-10,font+10,-font*1.8,font*2.5,-font*3,font*4])for(const dx of [12,-tw-12,30,-tw-30]){const tx=Math.max(6,Math.min(W-tw-6,xy[0]+dx)),ty=Math.max(font+5,Math.min(H-8,xy[1]+dy));const overlap=occupied.reduce((a,b)=>a+Math.max(0,Math.min(tx+tw+5,b.x+b.w)-Math.max(tx-5,b.x))*Math.max(0,Math.min(ty+5,b.y+5)-Math.max(ty-font-4,b.y-font-4)),0);const score=overlap*100+Math.hypot(tx-xy[0],ty-xy[1]);if(!best||score<best.score)best={tx,ty,score};}const{tx,ty}=best;occupied.push({x:tx-3,y:ty,w:tw+6});if(Math.hypot(tx-xy[0],ty-xy[1])>font*1.2){ctx.beginPath();ctx.moveTo(xy[0],xy[1]);ctx.lineTo(tx,ty-font*.3);ctx.strokeStyle=P.leader+'bf';ctx.lineWidth=1.5;ctx.setLineDash([1,4]);ctx.lineCap='round';ctx.stroke();ctx.setLineDash([]);ctx.lineCap='butt';}ctx.fillStyle='#100b1eed';ctx.fillRect(tx-3,ty-font,tw+6,font+5);ctx.textAlign='left';ctx.fillStyle=color;drawLiftLabel(ctx,text,tx,ty);}
 for(const p of points){const xy=project(p.p);ctx.beginPath();ctx.arc(xy[0],xy[1],Math.max(4,font*.25),0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();if(p.text)place(p.text,xy,p.color);}
 for(const l of labels)place(l.text,project(l.p),l.color);
 if(gapEnds&&!canvas.closest('button'))drawCanvasGap(ctx,project(gapEnds[0]),project(gapEnds[1]),gapText,W,H);
 if([6,8].includes(id)){
  const rows=[[P.image,id===8?'Blue: lifted output y^{B_{lift}} · uncertainty centre':'Blue: midpoint output y° · uncertainty centre'],[P.actual,'Red: 3D projection of perturbed output yₜ']];
  const fs=Math.min(14,Math.max(10,W/42));ctx.font=`${fs}px system-ui`;
  const boxW=Math.max(...rows.map(r=>ctx.measureText(r[1]).width))+32,x=W-boxW-10;
  ctx.fillStyle='#100b1ef2';ctx.fillRect(x,8,boxW,fs*3.4);
  rows.forEach(([colour,text],i)=>{const y=8+fs*(1.25+i*1.4);ctx.beginPath();ctx.arc(x+10,y-fs*.3,4,0,Math.PI*2);ctx.fillStyle=colour;ctx.fill();ctx.fillStyle=P.label;ctx.textAlign='left';drawLiftLabel(ctx,text,x+22,y);});
 }
 return metrics;
}
