import {drawStory3D} from './story-3d-render.mjs?v=103';
import {MATRIX_N,matrixPoint} from './story-3d-math.mjs?v=103';
import {math} from './math-render.mjs?v=103';
import {VALUES as V} from './certificate-values.mjs?v=103';
import {THETA,CENTER,DELTA,A_STAR,SIGMA_MAX} from './step-five-math.mjs?v=103';
import {TOY} from './step-one.mjs?v=103';
import {resolvent,reciprocalCircles,BOUNDS} from './step-three.mjs?v=103';
import {contourFrame,perturbedSection,ETA} from './gate-two-math.mjs?v=103';
import {frame,D_ZERO} from './step-ten-math.mjs?v=103';
import {operatorState,radialPoint} from './step-eleven-math.mjs?v=103';
const tex=String.raw,m=math,eq=s=>`<div class="enc-equation">${m(s)}</div>`;
const C={purple:'#4b0082',blue:'#1e90ff',gray:'#6f6f6f',violet:'#4338ca',orange:'#ff1493',red:'#d83954',grey:'#a9a9a9'};
const N={sur:+V.surrogate,mid:+V.midpoint,hardy:+V.hardy,eps:+V.operatorAllowance};
export const STORY=[
 {id:1,title:'Spectral disk',matrix:tex`T_2^\circ`,status:'Exact triangular structure + certified separation',space:tex`\text{Spectral plane }\mathbb C`,step:1,
  formula:tex`\#\{t_{jj}\in U\}=1,\qquad\sigma(T_2^\circ)\cap\Gamma=\varnothing`,
  why:'The eigenvalues of the exactly triangular frozen matrix are its diagonal entries. One lies inside the contour and the other outside. The count includes algebraic multiplicity.',
  caption:'The spectral plane. The purple circle is Γ = ∂U; it is not an output ellipsoid. Visibility mode compresses the large exterior distance while preserving inside/outside placement.'},
 {id:2,title:'Distances → inverse enclosures',matrix:tex`(zI_2-T_2^\circ)^{-1}`,status:'Uniform on the whole contour',space:tex`\text{Reciprocal planes }\mathbb C`,step:3,
  formula:tex`|z-t_{jj}|\ge\underline d_j\ \Longrightarrow\ \|(zI_2-T_2^\circ)^{-1}\|_2\le\overline M_T=${V.triangularInverse}`,
  why:'Certified distances hold for every z on Γ. Reciprocal disks bound the diagonal inverse entries; the triangular recurrences bound the off-diagonal entry. The row and column norm bounds give the uniform 2-norm bound.',
  caption:'Two reciprocal image circles and their origin-centred certified disks. Each plane has its own scale. Red points correspond to the same z.'},
 {id:3,title:'Similarity → surrogate inball',matrix:tex`S_2^\circ=Q_2^\circ T_2^\circ(Q_2^\circ)^{-1}`,status:'Exact similarity + uniform conditioning bound',space:tex`\text{Output vector space }\mathbb C^2\cong\mathbb R^4`,step:4,
  formula:tex`\underline s_\Gamma^{\mathrm{sur}}=${V.surrogate}\le\frac1{(1+10^{-15})\overline M_T}`,
  why:'For the inverse map, an input passes through (Q₂°)⁻¹, the triangular inverse, and then Q₂°. Thus (zI−S₂°)⁻¹ = Q₂°(zI−T₂°)⁻¹(Q₂°)⁻¹. Frozen Q₂° is invertible and extremely close to unitary; it is not asserted exactly unitary. After conditioning, round the lower bound downward.',
  caption:'Certified inball schematic. The surrounding ellipse only illustrates containment; its axes are not numerical singular values of the surrogate.'},
 {id:4,title:'Gate 1 → exact midpoint',matrix:tex`A_2^\circ`,status:'Uniform perturbation bound, then downward rounding',space:tex`\text{Output radii in }\mathbb C^2`,step:4,
  formula:tex`${V.surrogate}-3\times10^{-16}=${V.midpointBeforeRounding}\ge a_\circ=\underline s_\Gamma^\circ=${V.midpoint}`,
  why:'First subtract ηSchur, which bounds ‖A₂°−S₂°‖₂. Then round down by 2.6999997 × 10⁻⁹ to the supplied a∘. That rounding loss is not a matrix perturbation. The strict first gate preserves the contour count.',
  caption:'At true scale these radii overlap. Visibility scaling separates three nested circles schematically: surrogate, after the Schur allowance, and the rounded midpoint certificate.'},
 {id:5,title:'Entry rectangles → matrix enclosure',matrix:tex`A_{2,M}^{X}=A_2^\circ+E`,status:'Exact entries + certified enclosure enlargement',space:tex`\text{Matrix space }\mathbb C^{2\times2}\cong\mathbb R^8`,step:7,
  formula:tex`A_{2,M}^{X}\in\mathcal A\subseteq\overline B_{\|\cdot\|_2}(A_2^\circ,\eta_A),\quad\eta_A=\frac5{512}`,
  why:'Each entry error lies in a rectangle with half-widths 3/1024 and 4/1024, hence has modulus at most 5/1024. Two-entry row and column sums give ηA = 5/512. In the real plane C(x,y)=A₂°+(x+iy)E/‖E‖₂, the exact box section is |x|+(4/3)|y| ≤ n, n=√5/256.',
  caption:'Four entry rectangles lead to one eight-real-coordinate matrix enclosure. The diamond and disk are actual sections in the E, iE plane. The full operator-norm ball is not claimed to be a Euclidean sphere.'},
 {id:6,title:'Gate 2 → protected Hardy inball',matrix:tex`A_{2,M}^{X}`,status:'Uniform on Γ, for every unit input',space:tex`\text{Output vector space }\mathbb C^2\cong\mathbb R^4`,step:9,
  formula:tex`\sigma_{\min}(zI_2-A_2^\circ-tE)\ge a_\circ-t\eta_A>0`,
  why:'The deeppink uncertainty disk is centred at the unperturbed boundary output y°. Reverse triangle inequality keeps all perturbed boundary outputs at least a∘−tηA away from zero. The filled perturbed image contains the origin and the certified ball. At t=1 the certified Hardy radius is 0.029445725. The fixed E is unchanged throughout the homotopy.',
  caption:'Blue: midpoint image section. Deeppink: uncertainty centred on its minor-axis boundary. Violet-blue: certified radius for the perturbed image. In true scale, the dashed purple curve is the actual perturbed central section in this same real output plane.'},
 {id:7,title:'Exact lift → one more direction',matrix:tex`B_{\mathrm{lift}}=A_{2,M}^{X}\oplus0`,status:'Exact orthogonal direct-sum identity',space:tex`\text{Lifted vector space }\mathbb C^3\cong\mathbb R^6`,step:10,
  formula:tex`\underline s_{\Gamma,2}^{\mathrm{lift}}=\min\{${V.hardy},d_{\Gamma,0}\}=${V.lift}`,
  why:'J is an isometric embedding; the full orthogonal decomposition gives the unitary identification. There is no approximation loss. After shifting, the zero block becomes multiplication by z. Since dΓ,0 ≈ 0.610645600891813 exceeds the Hardy allowance, the smaller resolved allowance determines the lifted inball. The extra eigenvalue zero is outside Ū.',
  caption:'A principal real 3D section of a 6D image ellipsoid, with semiaxes σmax, σmin and |z|. The added direction is not flat. The spectral inset places zero outside Ū.'},
 {id:8,title:'Operator gate → rank one',matrix:tex`\mathcal L_{\mathrm{toy}}=B_{\mathrm{lift}}+D`,status:'Separate uniform small-gain gate',space:tex`\text{Lifted vector space }\mathbb C^3\cong\mathbb R^6`,step:11,
  formula:tex`\varepsilon_{2,M}^{\sharp}M_\Gamma(B_{\mathrm{lift}})\le\frac{${V.operatorAllowance}}{${V.lift}}\approx${V.operatorGainApprox}<1`,
  why:'D couples the first resolved coordinate to the added coordinate and has norm 0.01. This independent allowance is compared with the already certified lifted radius. Earlier finite losses are not subtracted again. Along B_{lift}+tD the remaining radius is 0.029445725−0.01t, positive on all Γ. The Riesz rank stays one.',
  caption:'Gray: the new operator uncertainty, centred on a boundary output of the lift. Violet-blue: remaining protected radius. True scale includes the dashed perturbed central section. The endpoint is an abstract toy operator.'},
 {id:9,title:'SVD at the selected point',matrix:tex`F_\ast^\circ v_{\min}=a_\ast u_{\min}`,status:'Pointwise upper-side diagnostic only',space:tex`\text{Output vector space }\mathbb C^2\cong\mathbb R^4`,step:5,
  formula:tex`a_\circ\le s_\Gamma(A_2^\circ)\le a_\ast<${V.aStarUpper}`,
  why:'At the fixed z*, the shortest image radius is a*. Taking an infimum over the contour can only decrease this value. This supplies the upper side of the squeeze, not a uniform lower certificate and not proof that z* is an exact global minimiser.',
  caption:'A real singular-vector section at the fixed z*. The marked minor-axis boundary output has length a* ≈ 0.0433674471266311. This branch does not carry the uniform certificate.'}
];

function chain(){return eq(tex`T_2^\circ\overset{Q_2^\circ}{\sim}S_2^\circ\xrightarrow{\mathrm{Gate\ 1}}A_2^\circ\xrightarrow{\mathrm{Gate\ 2}}A_{2,M}^{X}\xrightarrow{\text{exact lift}}B_{\mathrm{lift}}\xrightarrow{\text{operator gate}}\mathcal L_{\mathrm{toy}}`);}
function matrixTable(){const rows=[
 [tex`T_2^\circ`,tex`s_\Gamma(T_2^\circ)`,tex`\underline s_\Gamma^{\mathrm{route}}(T_2^\circ)=\frac1{${V.triangularInverse}}\approx${V.triangularRouteApprox}`],
 [tex`S_2^\circ`,tex`s_\Gamma(S_2^\circ)`,tex`\underline s_\Gamma^{\mathrm{sur}}=${V.surrogate}`],
 [tex`A_2^\circ`,tex`a_\circ\le s_\Gamma(A_2^\circ)\le a_\ast`,tex`a_\circ=\underline s_\Gamma^\circ=${V.midpoint}`],
 [tex`A_{2,M}^{X}`,tex`s_{\Gamma,2}^{H}=s_\Gamma(A_{2,M}^{X})`,tex`\underline s_{\Gamma,2}^{H}=a_\circ-\eta_A=${V.hardy}`],
 [tex`B_{\mathrm{lift}}=A_{2,M}^{X}\oplus0`,tex`s_\Gamma(B_{\mathrm{lift}})=\min\{s_{\Gamma,2}^{H},d_{\Gamma,0}\}`,tex`\underline s_{\Gamma,2}^{\mathrm{lift}}=\underline s_{\Gamma,2}^{H}=${V.lift}`],
 [tex`\mathcal L_{\mathrm{toy}}=B_{\mathrm{lift}}+D`,tex`s_\Gamma(\mathcal L_{\mathrm{toy}})\ge${V.toyOperatorBound}`,tex`\underline s_\Gamma(\mathcal L_{\mathrm{toy}})=\underline s_{\Gamma,2}^{\mathrm{lift}}-\varepsilon_{2,M}^{\sharp}=${V.toyOperatorBound}`]
 ];return `<div class="story-table-wrap" tabindex="0" aria-label="Matrix quantities table"><table><thead><tr><th>Matrix or operator</th><th>Actual whole-contour moat</th><th>Certified lower bound used</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map((x,i)=>`<${i?'td':'th'}>${m(x)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></div><p>None of the actual contour minima above is assigned an established exact numerical value. In particular, ${m(tex`a_\ast`)} is a selected-point value.</p>`;}
function losses(){return `<div class="story-losses"><div><b>Gate 1 · surrogate → midpoint</b>${m(tex`\eta_{\mathrm{Schur}}=3\times10^{-16}`)}${m(tex`\|A_2^\circ-S_2^\circ\|_2\le\eta_{\mathrm{Schur}}`)}</div><div><b>Gate 2 · midpoint → Hardy matrix</b>${m(tex`\eta_A=${V.matrixAllowance}`)}${m(tex`\|A_{2,M}^{X}-A_2^\circ\|_2\le\eta_A`)}</div><div><b>Operator gate · lift → toy operator</b>${m(tex`\varepsilon_{2,M}^{\sharp}=${V.operatorAllowance}`)}${m(tex`\|\mathcal L_{\mathrm{toy}}-B_{\mathrm{lift}}\|_2\le\varepsilon_{2,M}^{\sharp}`)}</div></div><p><strong>The finite losses are already included in the Hardy bound.</strong> They are not added again to ${m(tex`\varepsilon_{2,M}^{\sharp}`)}. Downward rounding is separate from all three perturbations.</p>`;}
export function stepTwelveArgument(){return `<article class="enc-argument"><h2>Keep the quantities attached to their own matrices</h2>${chain()}${matrixTable()}<h3>Three perturbations, three different replacements</h3>${losses()}<h3>The two principal moat statements</h3>${eq(tex`${V.midpoint}=a_\circ=\underline s_\Gamma^\circ\le s_\Gamma(A_2^\circ)\le a_\ast<${V.aStarUpper}`)}${eq(tex`${V.hardy}=\underline s_{\Gamma,2}^{H}=\underline s_{\Gamma,2}^{\mathrm{lift}}\le s_\Gamma(B_{\mathrm{lift}})`)}<p>The certified lift uses ${m(tex`\underline s_{\Gamma,2}^{\mathrm{lift}}=\min\{\underline s_{\Gamma,2}^{H},d_{\Gamma,0}\}`)}. The actual identity remains ${m(tex`s_\Gamma(B_{\mathrm{lift}})=\min\{s_{\Gamma,2}^{H},d_{\Gamma,0}\}`)}. This transfer needs only lower bounds, independently of the optional pointwise diagnostic.</p><h3>Why the count survives</h3><p>At every gate the uniform remaining radius is positive. Every matrix along the corresponding homotopy is invertible on the entire contour. No eigenvalue can cross that contour, so the Riesz rank is unchanged. Similarity preserves the initial count; the exact lift adds only the eigenvalue zero, outside the closed spectral disk.</p>${eq(tex`\operatorname{rank}\Pi_\Gamma(\mathcal L_{\mathrm{toy}})=\operatorname{rank}\Pi_\Gamma(B_{\mathrm{lift}})=\operatorname{rank}\Pi_\Gamma(A_{2,M}^{X})=1`)}<h3>Connection to the thesis</h3><p>This follows the Distilled chapter’s <em>Schur count and Hardy-moat transport</em> corollary (two finite replacement gates, source line 1503, label <code>legEDMD:cor-Schur-count-and-Hardy-moat-transport-dist</code>) and its separate <em>Certified finite-to-exact contour rank</em> corollary (line 1614, label <code>legEDMD:cor-certified-finite-to-exact-contour-rank-dist</code>), in <code>numerical_certification_transfer_dist.tex</code>.</p><p>${m(tex`\mathcal L_{\mathrm{toy}}`)} is an abstract bounded toy operator. A Perron–Frobenius example for a specified map would require its own analytically derived operator-error bound.</p></article>`;}

// Canvas drawings use numerical sections for illustration, never to certify a minimum.
function drawPicture(canvas,id,state,large=false){
 const ctx=canvas.getContext('2d'),W=large?660:270,H=large?360:180,dpr=window.devicePixelRatio||1;
 if(canvas.width!==W*dpr)canvas.width=W*dpr;if(canvas.height!==H*dpr)canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
 const k=W/270;ctx.scale(k,k); // common miniature coordinate system: 270 x (180 or 147)
 const ht=H/k,cy=ht/2+4,theta=state.theta;
 function line(a,b,color=C.grey,width=1,dash=[]){ctx.beginPath();ctx.setLineDash(dash);ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([]);}
 function curve(points,color,fill=null,dash=[]){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.stroke();ctx.setLineDash([]);}
 function ellipse(x,y,a,b,color,fill=null,dash=[]){ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,a),Math.max(.01,b),0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.stroke();ctx.setLineDash([]);}
 function dot(x,y,color=C.red,r=3.5){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=1;ctx.stroke();}
 function label(s,x,y,color=C.purple,align='center',size=11){ctx.font=`${size}px system-ui`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);}
 function arrow(a,b,color=C.orange){line(a,b,color,1.8);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);line(b,[b[0]-6*Math.cos(t-.45),b[1]-6*Math.sin(t-.45)],color,1.8);line(b,[b[0]-6*Math.cos(t+.45),b[1]-6*Math.sin(t+.45)],color,1.8);}
 const scaled=state.scaled,thdeg=theta*180/Math.PI;
 if(id===1){
  const scale=scaled?600:220,pt=p=>{if(!scaled)return[30+p.x*scale,cy+42-p.y*scale];const dx=p.x-TOY.c.x,dy=p.y-TOY.c.y,d=Math.hypot(dx,dy),s=d?Math.min(scale,95/d):scale;return[166+dx*s,cy-10-dy*s];},z={x:CENTER.re+DELTA*Math.cos(theta),y:CENTER.im+DELTA*Math.sin(theta)},pc=pt(TOY.c);
  if(!scaled){line([25,cy+42],[240,cy+42],C.blue);line([30,ht-10],[30,12],C.gray);}
  ellipse(...pc,DELTA*scale,DELTA*scale,C.purple,'#4b008210');
  TOY.eigenvalues.forEach((p,i)=>{const q=pt(p);dot(...q,C.purple);label(i?'t₂₂ · outside':'t₁₁ · inside',q[0]+(i?6:-8),q[1]+(i?16:-19),C.purple,i?'left':'right');});
  dot(...pt(z));label('Γ',pc[0]+DELTA*scale+10,pc[1]-12);if(!scaled)label('Re',240,cy+56,C.blue);return;
 }
 if(id===2){
  const rr=resolvent(thdeg);
  [0,1].forEach((j)=>{const x=70+j*130,r=j?BOUNDS.d:BOUNDS.a,s=48/r;
   line([x-54,cy],[x+54,cy],C.grey);line([x,cy-55],[x,cy+55],C.grey);
   ellipse(x,cy,48,48,C.violet,'#4338ca0b',[4,3]);
   const rc=reciprocalCircles[j];ellipse(x+rc.c.x*s,cy-rc.c.y*s,rc.r*s,rc.r*s,C.purple);
   dot(x+rr.w[j].x*s,cy-rr.w[j].y*s);label('1 / (z − t'+(j?'₂₂':'₁₁')+')',x,cy-62);label(j?'radius 1 / d̲₂':'radius 1 / d̲₁',x,cy+66,C.violet);
  });return;
 }
 if(id===4){
  const r=ht*.34,rs=scaled?[r,r*.87,r*.7]:[r,r*(N.sur-3e-16)/N.sur,r*N.mid/N.sur];
  ellipse(135,cy,rs[0],rs[0],C.purple,'#4b008208');ellipse(135,cy,rs[1],rs[1],C.orange,null,[3,3]);ellipse(135,cy,rs[2],rs[2],C.violet,'#4338ca15');
  line([135,cy],[135+rs[2],cy],C.violet,2);dot(135,cy,C.purple,2);
  label(scaled?'Residual + rounding, separated':'Radii overlap at true scale',135,ht-5,C.purple);return;
 }
 if(id===5){
  const r=48,n=(Math.sqrt(5)/256)/ETA*r,x=193;
  [[49,cy-23,15,20], [98,cy-23,20,15],[49,cy+23,15,20],[98,cy+23,20,15]].forEach(([cx,y,a,b],i)=>{
   curve([[cx-a,y-b],[cx+a,y-b],[cx+a,y+b],[cx-a,y+b]],C.orange,'#ff149312');dot(cx,y,C.blue,2);dot(cx-a,y+(i===2?b:-b),C.red,2);
  });arrow([127,cy],[137,cy],C.grey);ellipse(x,cy,r,r,C.purple,'#4b008207');curve([[x+n,cy],[x,cy-.75*n],[x-n,cy],[x,cy+.75*n]],C.orange,'#ff149320');dot(x,cy,C.blue,2);arrow([x,cy],[x+n,cy],C.red);dot(x+n,cy);label('four rectangles',72,cy+61);label('ηA',x-37,cy-38);label('E',x+20,cy-8,C.red);return;
 }
 if(id===7){
  const f=frame(theta),raw=f.axes,b=N.hardy;
  const axes=scaled?raw.map(a=>Math.min(a,3*b)):raw;
  const size=Math.min(95,(ht-22)/1.7),s=size/Math.max(...axes),proj=p=>[125+s*(p[0]*.87+p[1]*.32),cy+s*(p[0]*.2-p[1]*.56-p[2]*.79)];
  for(let lat=-3;lat<=3;lat++){const v=lat*Math.PI/8,pts=[];for(let j=0;j<=80;j++){let u=j*Math.PI/40;pts.push(proj([axes[0]*Math.cos(v)*Math.cos(u),axes[1]*Math.cos(v)*Math.sin(u),axes[2]*Math.sin(v)]));}curve(pts,'#4b008246');}
  for(let j=0;j<6;j++){const u=j*Math.PI/6,pts=[];for(let l=0;l<=80;l++){let v=l*Math.PI/40;pts.push(proj([axes[0]*Math.cos(v)*Math.cos(u),axes[1]*Math.cos(v)*Math.sin(u),axes[2]*Math.sin(v)]));}curve(pts,'#4b008236');}
  // Three great circles of the same inner sphere in this principal section.
  for(let axis=0;axis<3;axis++){const pts=[];for(let l=0;l<=80;l++){let p=[0,0,0];p[axis]=b*Math.cos(l*Math.PI/40);p[(axis+1)%3]=b*Math.sin(l*Math.PI/40);pts.push(proj(p));}curve(pts,C.violet,'#4338ca10');}
  const a=proj([0,0,axes[2]]);line([125,cy],a,C.gray);label('|z|',a[0]+12,a[1]+9,C.gray);dot(125,cy,C.violet,2);
  ellipse(240,30,10,10,C.purple);dot(210,45,C.grey,2);line([210,45],[231,34],C.grey);label('0',205,55);label('Γ',254,30);return;
 }
 // Output-ball pictures. Visibility mode compresses only the long axis;
 // the minor radius and the round uncertainty/inner radii share one scale.
 const f=contourFrame(id===9?THETA:theta);
 let a=f.sigmaMax,b=f.sigmaMin,bound=N.mid,radius=0,op=null,section=null;
 if(id===3){a=N.sur*2.7;b=N.sur*1.3;bound=N.sur;}
 if(id===6){bound=N.mid-state.t*ETA;radius=state.t*ETA;section=perturbedSection(state.t,theta);}
 if(id===8){op=operatorState(theta,state.t,0);[a,b]=op.baseAxes;bound=op.bound;radius=op.radius;}
 if(id===9){a=SIGMA_MAX;b=A_STAR;bound=N.mid;}
 const da=scaled?Math.min(a,3*b):a,s=Math.min(112/da,(ht/2-17)/(b+radius)),x=135,y=cy+4;
 const map=p=>[x+p[0]*s,y-p[1]*s];
 ellipse(x,y,da*s,b*s,C.blue,'#1e90ff0d');
 if(!scaled&&id===6){const pts=[];for(let j=0;j<=160;j++){const u=j*Math.PI/80,xx=section.small*Math.cos(u),yy=section.large*Math.sin(u);pts.push(map([xx*Math.cos(section.angle)-yy*Math.sin(section.angle),xx*Math.sin(section.angle)+yy*Math.cos(section.angle)]));}curve(pts,C.purple,null,[4,3]);}
 if(!scaled&&op){curve(Array.from({length:161},(_,j)=>map(radialPoint(op.K,j*Math.PI/80))),C.purple,null,[4,3]);}
 ellipse(x,y,bound*s,bound*s,C.violet,'#4338ca1c');line([x,y],[x+bound*s,y],C.violet,1.8);
 dot(x,y,C.grey,2);
 if(radius){ellipse(x,y-b*s,radius*s,radius*s,id===8?C.gray:C.orange,id===8?'#6f6f6f12':'#ff149315',[4,2]);dot(x,y-b*s,C.blue,3);line([x,y],[x,y-(b-radius)*s],id===8?C.gray:C.orange,1.6);label('y°',x+radius*s+7,y-b*s+3,C.blue,'left');}
 if(id===9){dot(x,y-b*s);line([x,y],[x,y-b*s],C.red,1.8);label('a*',x+11,y-b*s/2,C.red,'left');}
 if(id===8)label('rank 1',230,ht-8,C.violet);
}

function readout(id,t){return ({1:'1 eigenvalue inside',2:'inverse norm ≤ '+V.triangularInverse,3:'certified radius '+V.surrogate,4:'a∘ = '+V.midpoint,5:'ηA = '+V.matrixAllowance,6:'certified radius '+(t===1?V.hardy:t===0?V.midpoint:'≈ '+(N.mid-t*ETA).toFixed(10)),7:'certified radius '+V.lift,8:'certified radius '+(t===1?V.toyOperatorBound:t===0?V.lift:'≈ '+(N.hardy-t*N.eps).toFixed(10)),9:'a* ≈ '+V.aStarApprox})[id];}

const captions3d={
 1:'The complex spectral plane remains two-dimensional. Rotate the camera to inspect this plane; no extra spectral dimension is introduced. Dashed segments link z to the two diagonal entries.',
 2:'The reciprocal images lie in complex planes, tilted here by the camera. The two origin-centred certified disks have separate scales and fixed radii.',
 3:'Three-dimensional containment schematic in a real slice of the four-real-dimensional output space. The surrogate shape illustrates the bound; its axes are not computed surrogate singular values.',
 4:'Three nested radius spheres separate the surrogate allowance, Schur subtraction, and downward rounding. The visible separation is schematic when visibility scaling is on.',
 5:'Actual real three-dimensional matrix section, with coordinates defined below. The violet surface is an operator-norm boundary, generally not a Euclidean sphere. The deeppink radial mesh approximates the entry-box polyhedron. The q=0 slice recovers the exact diamond. These coordinates are not Frobenius-orthogonal.',
 6:'Actual real 3D central sections in ℂ² ≅ ℝ⁴. The real frame follows the contour angle and stays fixed as the perturbation varies. Deeppink uncertainty is centred on the unperturbed boundary output y°. The coral point is the real projection of the actual perturbed output; its omitted component is reported below.',
 7:'Principal real 3D section of the 6D lifted image, with semiaxes σmax, σmin and |z|. The complement is stretched by |z| after shifting. The lift adds no approximation error.',
 8:'Actual real 3D central sections in ℂ³ ≅ ℝ⁶, in a real frame that follows the contour angle and stays fixed throughout the operator homotopy. Gray uncertainty is centred on a lifted boundary output. Coral marks the projected actual output, with the omitted component reported below.',
 9:'Real 3D section at fixed z*, with axes σmax, a*, a*. Changing the selected unit input changes its boundary output. The shortest output remains a*; this is a pointwise upper-side diagnostic.'
};
function playbackControls(){return `<div class="story-controls"><label>Contour ${m(tex`\theta`)} <output class="mathjax_ignore" data-story-angle></output><input type="range" min="0" max="360" step="0.1" data-story-angle-input aria-label="Shared contour angle"></label><label>Homotopy ${m(tex`t`)} · each gate separately <output class="mathjax_ignore" data-story-t></output><input type="range" min="0" max="1" step="0.01" value="1" data-story-t-input aria-label="Homotopy fraction for each gate"></label><div class="story-actions"><button data-story-play>▶ Play contour</button><button data-story-one>Play one turn</button><label>Speed <select data-story-speed aria-label="Contour playback speed"><option value="0.5">½×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label><button data-story-reset>Reset</button><label class="story-scale"><input type="checkbox" data-story-scale checked>Visibility scaling</label></div><div class="story-progress"><span data-story-progress></span></div><span class="story-play-status mathjax_ignore" data-story-play-status>Paused</span></div>`;}
function cameraControls(){return `<div class="story-camera-controls"><label>Input direction in this real section · polar angle <input type="range" min="0" max="180" step="1" value="90" data-story-phi aria-label="Input direction in this real section · polar angle"></label><label>Input direction in this real section · azimuth <input type="range" min="0" max="360" step="1" value="0" data-story-psi aria-label="Input direction in this real section · azimuth"></label><label>Camera zoom <input type="range" min="0.6" max="1.6" step="0.02" value="1" data-story-zoom aria-label="Camera zoom"></label><button data-story-camera-reset>Reset camera</button><button data-story-weak>Base weak direction</button><span>Drag a geometry to rotate · arrow keys rotate · + / − zoom · the numbers do not change with the camera</span></div>`;}
export function mountStepTwelve(root,{immersive=false}={}){
 const state={theta:THETA,t:1,scaled:true,playing:false,selected:null,immersive,yaw:-.45,pitch:.27,zoom:1,phi:Math.PI/2,psi:0,matrix:[MATRIX_N,0,0],speed:1,remaining:null},abort=new AbortController(),{signal}=abort;let raf=0,last=0,paintAt=0,drag=null,suppressClick=false;
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)],set=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text;};
 const mini=d=>`<button class="story-stage story-stage-${d.id}" data-story-stage="${d.id}" aria-haspopup="dialog" aria-label="Expand ${d.id===9?'SVD branch':`stage ${d.id}`}: ${d.title}"><span class="story-stage-title"><b>${d.id===9?'↳':d.id}</b>${d.title}</span><canvas data-story-canvas="${d.id}" aria-hidden="true" ${immersive?'tabindex="0"':''}></canvas><span class="story-matrix">${m(d.matrix)}</span><span class="story-value mathjax_ignore" data-story-value="${d.id}">${readout(d.id,1)}</span>${immersive?`<span class="story-evidence">${d.id===9?'Fixed z* · pointwise':d.id===7?'Exact direct sum':d.id===5?'Exact enclosure section':d.id===3||d.id===4?'Uniform certificate stays fixed':'All z on Γ'}</span><span class="story-stage-metric mathjax_ignore" data-story-metric="${d.id}"></span><span class="story-stage-hint">Drag to rotate · click to explore</span>`:''}</button>`;
 root.innerHTML=`<div class="enc-root story-root ${immersive?'story-immersive':''}"><section class="story-panel" aria-labelledby="story-title"><header class="story-header"><div><p class="eyebrow">${immersive?'4K EXPLORER · INTERACTIVE 3D SECTIONS':'ONE CONNECTED DIAGRAM · EIGHT GEOMETRIES'}</p><h2 id="story-title">Distances → inverse enclosures → protected inner balls → rank one</h2><p>${immersive?'Rotate the geometries. Follow the solid certificate route; the dashed SVD branch is pointwise.':'Follow the solid arrows. Click a miniature to enlarge it, or open the detailed 3D display.'}</p></div>${!immersive?'<a class="story-4k-link" href="./story-4k.html" target="_blank" rel="noopener">4K display ↗<small>Detailed interactive 3D · new window</small></a>':'<a class="story-4k-link" href="./#step-12" target="_blank" rel="noopener">Standard overview ↗</a>'}</header>
 <div class="story-persistent" aria-label="Endpoint certificates at t equals one"><div><small>Midpoint squeeze</small>${m(tex`a_\circ\le s_\Gamma(A_2^\circ)\le a_\ast`)}<span>${V.midpoint} ≤ actual moat ≤ a*</span></div><div><small>Hardy = lifted certificate</small>${m(tex`\underline s_{\Gamma,2}^{H}=\underline s_{\Gamma,2}^{\mathrm{lift}}`)}<strong>${V.hardy}</strong></div><div><small>Abstract toy endpoint · t = 1</small>${m(tex`\operatorname{rank}\Pi_\Gamma(\mathcal L_{\mathrm{toy}})=1`)}<span>Positive final radius ${V.toyOperatorBound}</span></div></div>
 ${playbackControls()}${immersive?cameraControls():''}<p class="story-scale-note" data-story-scale-note></p>
 <div class="story-map" aria-label="Connected certification diagram"><svg class="story-connectors" aria-hidden="true"><defs><marker id="story-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#4b0082"/></marker><marker id="story-branch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#9773b2"/></marker></defs><g fill="none" stroke="#4b0082" stroke-width="2" marker-end="url(#story-arrow)" data-story-connections></g><path data-story-branch-line fill="none" stroke="#9773b2" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#story-branch-arrow)"/></svg>
 ${STORY.filter(d=>d.id<9).map(mini).join('')}<div class="story-route-note"><strong>Solid arrows carry the uniform certificate.</strong><span>All ${m(tex`z\in\Gamma`)} · all unit inputs</span><span>Filled images contain zero and the violet-blue certified ball. Boundary outputs stay away from zero.</span>${immersive?`<div>${m(tex`\eta_{\mathrm{Schur}}=3\times10^{-16}`)} · surrogate → midpoint</div><div>${m(tex`\eta_A=${V.matrixAllowance}`)} · midpoint → Hardy</div><div>${m(tex`\varepsilon_{2,M}^{\sharp}=${V.operatorAllowance}`)} · lift → abstract toy</div>`:''}</div>
 <div class="story-branch">${mini(STORY[8])}<span class="story-branch-caption">Pointwise geometry and upper-side diagnostic. Attached to the midpoint; outside the uniform route.</span></div></div>
 <div class="story-legend"><span><i class="story-safe"></i>Violet-blue: certified inner ball</span><span><i class="story-blue"></i>Blue: base image / boundary output</span><span><i class="story-orange"></i>Deeppink: finite uncertainty / entry enclosure</span><span><i class="story-gray"></i>Gray: independent operator uncertainty</span><span>Coral: projection of actual output</span></div><p class="story-endpoint-note">The live gate drawings use the selected ${m(tex`t`)}. Persistent readouts give the completed certificates at ${m(tex`t=1`)}. Camera rotation changes no mathematical value. Numerical meshes illustrate the supplied proof.</p><details class="story-record"><summary>Keep every quantity attached to its matrix</summary>${chain()}${matrixTable()}${losses()}${immersive?'':'<button data-open-quantity-ledger>Full notation &amp; values</button>'}</details></section>
 <dialog class="story-dialog" aria-labelledby="story-detail-title"><div class="story-detail-top"><span data-story-detail-kind></span><button data-story-close aria-label="Close enlarged geometry">✕ Close</button></div><h2 id="story-detail-title"></h2><div data-story-detail-space></div>${playbackControls()}<canvas data-story-large role="img" ${immersive?'tabindex="0"':''}></canvas>${immersive?cameraControls():''}<div class="story-detail-control"><span class="mathjax_ignore" data-story-detail-value></span><span class="mathjax_ignore" data-story-detail-metric></span></div><div class="story-matrix-controls" hidden><h3>Explore the matrix enclosure</h3>${['x','y','q'].map((v,i)=>`<label>${v} / ηA <input type="range" min="-1.15" max="1.15" step="0.01" value="${i===0?MATRIX_N/ETA:0}" data-story-matrix="${i}" aria-label="Matrix coordinate ${v}"></label>`).join('')}<button data-story-matrix-preset="selected">Selected Hardy matrix</button><button data-story-matrix-preset="outside">Inside norm allowance, outside entry box</button><div data-story-entry-values class="mathjax_ignore"></div></div><p class="story-detail-caption" data-story-detail-caption></p><div data-story-extra-formula></div><div data-story-detail-formula></div><p data-story-detail-why></p><nav><button data-story-prev>← Previous geometry</button><a data-story-detail-link>Open the detailed step ↗</a><button data-story-next>Next geometry →</button></nav></dialog></div>`;
 const dialog=q('dialog');
 function connect(){
  const map=q('.story-map'),mr=map.getBoundingClientRect();
  const boxes=STORY.slice(0,8).map(d=>q(`[data-story-stage="${d.id}"]`).getBoundingClientRect());
  const canvases=STORY.slice(0,8).map(d=>q(`[data-story-canvas="${d.id}"]`).getBoundingClientRect());
  const pt=(x,y)=>[x-mr.left,y-mr.top],paths=[];
  const reflow=immersive&&getComputedStyle(map).gridTemplateColumns.split(' ').length<4;
  for(let i=0;i<7;i++){
   const a=boxes[i],b=boxes[i+1],ac=canvases[i],bc=canvases[i+1];
   const ay=ac.y+ac.height/2,by=bc.y+bc.height/2;
   if(Math.abs(a.top-b.top)<4){
    const forward=b.left>a.left,[x,y]=pt(forward?a.right:a.left,ay),[xx,yy]=pt(forward?b.left:b.right,by);
    paths.push(`M${x} ${y} L${xx} ${yy}`);
   }else if(reflow&&i!==3){
    const [x,y]=pt(a.x+a.width/2,a.bottom+5),[xx,yy]=pt(b.x+b.width/2,b.top-7),mid=(y+yy)/2;
    paths.push(`M${x} ${y} V${mid} H${xx} V${yy}`);
   }else{
    // The midpoint-to-enclosure route travels outside the separate SVD card.
    const [x,y]=pt(a.right,ay),edge=mr.width-6;
    if(reflow){
     const [xx,yy]=pt(b.x+b.width/2,b.top-7),bend=yy-12;
     paths.push(`M${x} ${y} H${edge} V${bend} H${xx} V${yy}`);
    }else{
     const [xx,yy]=pt(b.right,by);
     paths.push(`M${x} ${y} H${edge} V${yy} H${xx}`);
    }
   }
  }
  q('[data-story-connections]').innerHTML=paths.map(d=>`<path d="${d}"/>`).join('');
  const branch=q('.story-branch').getBoundingClientRect(),a=boxes[3];
  const [x,y]=pt(a.x+a.width*.55,a.bottom+2),[xx,yy]=pt(branch.x+branch.width*.72,branch.y-3);
  q('[data-story-branch-line]').setAttribute('d',`M${x} ${y} V${(y+yy)/2} H${xx} V${yy}`);
 }

 function paint(canvas,id,large=false){if(immersive){const key=JSON.stringify([state.scaled,state.yaw,state.pitch,state.zoom,canvas.clientWidth,canvas.clientHeight,[1,2,6,7,8].includes(id)?state.theta:0,[6,8].includes(id)?state.t:0,[6,8,9].includes(id)?[state.phi,state.psi]:0,id===5?state.matrix:0]);if(canvas.dataset.sceneKey!==key){canvas.dataset.sceneKey=key;canvas.dataset.metrics=drawStory3D(canvas,id,state)||'';}return canvas.dataset.metrics||'';}drawPicture(canvas,id,state,large);return '';}
 function draw(){
  qa('[data-story-canvas]').forEach(canvas=>{const id=+canvas.dataset.storyCanvas,metric=paint(canvas,id);set(q(`[data-story-metric="${id}"]`),metric);});qa('[data-story-value]').forEach(el=>set(el,readout(+el.dataset.storyValue,state.t)));
  qa('[data-story-angle]').forEach(el=>set(el,(state.theta*180/Math.PI).toFixed(1)+'°'));qa('[data-story-t]').forEach(el=>set(el,state.t.toFixed(2)));qa('[data-story-angle-input]').forEach(el=>el.value=state.theta*180/Math.PI);qa('[data-story-t-input]').forEach(el=>el.value=state.t);qa('[data-story-play]').forEach(el=>{set(el,state.playing?'Ⅱ Pause contour':'▶ Play contour');el.setAttribute('aria-pressed',String(state.playing));});qa('[data-story-progress]').forEach(el=>el.style.width=100*state.theta/(2*Math.PI)+'%');qa('[data-story-play-status]').forEach(el=>set(el,state.playing?(state.remaining===null?'Playing continuously':'Playing one turn')+' · '+state.speed+'×':'Paused · drag the angle slider or press Play'));
  set(q('[data-story-scale-note]'),state.scaled?'Visibility scaling ON · long output axes and distant spectral points are compressed; microscopic Gate 1 losses are separated schematically. Values are unchanged. Surrogate geometry is always a containment schematic.':'True-scale sections · axes within each numerical view use equal coordinate scales. Small balls and Gate 1 differences can be tiny. Surrogate geometry remains a containment schematic.');
  if(state.selected){if(immersive&&state.selected===5){const mp=matrixPoint(state.matrix);const values=mp.delta.flat().map((z,k)=>{const hr=(k%2?4:3)/1024,hi=(k%2?3:4)/1024,ok=Math.abs(z.re)<=hr+1e-14&&Math.abs(z.im)<=hi+1e-14;return 'δa'+(Math.floor(k/2)+1)+(k%2+1)+': '+z.re.toFixed(6)+(z.im<0?' − ':' + ')+Math.abs(z.im).toFixed(6)+'i · '+(ok?'inside rectangle':'rectangle violated');}).join(' | ');set(q('[data-story-entry-values]'),values);}set(q('[data-story-detail-metric]'),paint(q('[data-story-large]'),state.selected,true));set(q('[data-story-detail-value]'),readout(state.selected,state.t));set(q('[data-story-detail-caption]'),(immersive?captions3d[state.selected]:STORY[state.selected-1].caption)+(state.scaled&&[6,7,8,9].includes(state.selected)?' Visibility scaling compresses long axes: the base shape, its selected boundary centre and projected displacement use the same coordinate compression. Round uncertainty spheres are conservative display enclosures. The true perturbed surface is shown only with scaling off.':''));}
 }
 function select(id){const d=STORY[id-1];state.selected=id;set(q('#story-detail-title'),(id===9?'SVD branch':`Stage ${id}`)+' · '+d.title);set(q('[data-story-detail-kind]'),d.status);q('[data-story-detail-space]').innerHTML=m(d.space);q('[data-story-detail-formula]').innerHTML=eq(d.formula);q('[data-story-extra-formula]').innerHTML=!immersive?'':id===5?eq(tex`C(x,y,q)=A_2^\circ+(x+iy)H+qI_2,\qquad H=E/\|E\|_2`):[6,8].includes(id)?eq(id===6?tex`W=[u_{\max},u_{\min},iu_{\min}]`:tex`W=[(u_{\max},0),(u_{\min},0),e_3]`)+eq(tex`K=\operatorname{Re}[(F_t^{-1}W)^*(F_t^{-1}W)],\qquad r^\top Kr\le1`):'';set(q('[data-story-detail-why]'),d.why);q('[data-story-detail-link]').href=(immersive?'./':'')+'#step-'+String(d.step).padStart(2,'0');q('[data-story-large]').setAttribute('aria-label',d.title+'. '+(immersive?captions3d[id]:d.caption));q('[data-story-prev]').disabled=id===1;q('[data-story-next]').disabled=id>=8;q('[data-story-next]').textContent=id===8?'End of uniform route':'Next geometry →';q('.story-matrix-controls').hidden=!(immersive&&id===5);if(!dialog.open)dialog.showModal();draw();}
 function stop(){state.playing=false;state.remaining=null;cancelAnimationFrame(raf);raf=0;last=0;}
 function animate(now){if(!state.playing)return;if(!root.isConnected){stop();return;}if(document.hidden){last=0;raf=requestAnimationFrame(animate);return;}if(!last)last=now;const dt=Math.min((now-last)/1000,.15);last=now;let step=dt*Math.PI/12*state.speed;if(state.remaining!==null){step=Math.min(step,state.remaining);state.remaining-=step;}state.theta=(state.theta+step)%(2*Math.PI);if(now-paintAt>32){draw();paintAt=now;}if(state.remaining!==null&&state.remaining<=1e-10){stop();draw();return;}raf=requestAnimationFrame(animate);}
 function start(one=false){stop();state.playing=true;state.remaining=one?2*Math.PI:null;raf=requestAnimationFrame(animate);draw();}
 root.addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.preventDefault();return;}const b=e.target.closest('button');if(!b)return;if(b.dataset.storyStage)select(+b.dataset.storyStage);if(b.hasAttribute('data-story-close'))dialog.close();if(b.hasAttribute('data-story-next')&&state.selected<8)select(state.selected+1);if(b.hasAttribute('data-story-prev')&&state.selected>1)select(state.selected===9?4:state.selected-1);if(b.hasAttribute('data-story-play')){if(state.playing)stop();else start();}if(b.hasAttribute('data-story-one'))start(true);if(b.hasAttribute('data-story-reset')){stop();state.theta=THETA;state.t=1;}if(b.hasAttribute('data-story-camera-reset')){state.yaw=-.45;state.pitch=.27;state.zoom=1;qa('[data-story-zoom]').forEach(el=>el.value=1);}if(b.hasAttribute('data-story-weak')){state.phi=Math.PI/2;state.psi=0;qa('[data-story-phi]').forEach(el=>el.value=90);qa('[data-story-psi]').forEach(el=>el.value=0);}if(b.dataset.storyMatrixPreset){state.matrix=b.dataset.storyMatrixPreset==='selected'?[MATRIX_N,0,0]:[0,0,.9*ETA];qa('[data-story-matrix]').forEach(el=>el.value=state.matrix[+el.dataset.storyMatrix]/ETA);}draw();},{signal});
 root.addEventListener('input',e=>{const el=e.target;if(el.hasAttribute('data-story-angle-input')){stop();state.theta=+el.value*Math.PI/180;}if(el.hasAttribute('data-story-t-input'))state.t=+el.value;if(el.hasAttribute('data-story-scale')){state.scaled=el.checked;qa('[data-story-scale]').forEach(el=>el.checked=state.scaled);}if(el.hasAttribute('data-story-speed')){state.speed=+el.value;qa('[data-story-speed]').forEach(x=>x.value=el.value);}for(const key of ['phi','psi','zoom'])if(el.hasAttribute('data-story-'+key)){state[key]=+el.value*(key==='zoom'?1:Math.PI/180);qa('[data-story-'+key+']').forEach(x=>x.value=el.value);}if(el.dataset.storyMatrix!==undefined)state.matrix[+el.dataset.storyMatrix]=+el.value*ETA;draw();},{signal});
 if(immersive){root.addEventListener('pointerdown',e=>{const canvas=e.target.closest('canvas');if(!canvas)return;drag={canvas,x:e.clientX,y:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);},{signal});root.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;state.yaw+=dx*.007;state.pitch=Math.max(-1.3,Math.min(1.3,state.pitch+dy*.007));drag.x=e.clientX;drag.y=e.clientY;draw();},{signal});root.addEventListener('pointerup',()=>{if(drag?.moved)suppressClick=true;drag=null;},{signal});root.addEventListener('pointercancel',()=>drag=null,{signal});root.addEventListener('keydown',e=>{if(!e.target.matches('canvas'))return;const k=e.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(k))return;e.preventDefault();if(k==='ArrowLeft')state.yaw-=.12;if(k==='ArrowRight')state.yaw+=.12;if(k==='ArrowUp')state.pitch+=.1;if(k==='ArrowDown')state.pitch-=.1;if(k==='+')state.zoom=Math.min(1.6,state.zoom+.1);if(k==='-')state.zoom=Math.max(.6,state.zoom-.1);draw();},{signal});}
 dialog.addEventListener('close',()=>{state.selected=null;},{signal});const ro=new ResizeObserver(()=>{connect();draw();});ro.observe(q('.story-map'));qa('[data-story-canvas]').forEach(canvas=>ro.observe(canvas));ro.observe(q('[data-story-large]'));requestAnimationFrame(()=>{connect();draw();});
 return()=>{stop();dialog.close();abort.abort();ro.disconnect();};
}
