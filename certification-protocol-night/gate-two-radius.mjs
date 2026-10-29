import {math as m} from './math-render.mjs?v=103';
import {DEN,HALF,MID,ERROR,ETA,NORM_E,normUnits,copy} from './enclosure-math.mjs?v=103';
import {mountOutputEnclosure} from './output-zonotope.mjs?v=103';
import {VALUES} from './certificate-values.mjs?v=103';
const tex=String.raw,eq=s=>`<div class="radius-equation">${m(s)}</div>`;
const index=i=>`${Math.floor(i/2)+1}${i%2+1}`, A0=Number(VALUES.midpoint);
const fmt=(n,k=9)=>n.toFixed(k);
const groups={row0:[0,1],row1:[2,3],col0:[0,2],col1:[1,3],all:[0,1,2,3]};

function entryPlot(i){const [p,q]=HALF[i],cx=100,cy=90,k=12;return `<button class="radius-entry" data-radius-entry="${i}" aria-pressed="${i===0}" aria-label="Inspect entry ${index(i)} rectangle">
 <b>${m(tex`R_{${index(i)}}(t)`)}<br>${m(tex`t e_{${index(i)}}=5t/1024`)}</b>
 <svg viewBox="0 0 220 180" role="img" aria-label="Entry ${index(i)} rectangle, its growing circumscribed radius 5t over 1024, and moving error vector">
 <defs><marker id="radius-arrow-${i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d52d4c"/></marker></defs>
 <path d="M20 90H194 M100 168V12" stroke="#a9a9a9" fill="none"/>
 <rect x="${cx-p*k}" y="${cy-q*k}" width="${2*p*k}" height="${2*q*k}" fill="none" stroke="#a9a9a9" stroke-dasharray="3 3"/>
 <g data-entry-enclosure="${i}"><circle cx="100" cy="90" r="60" fill="#eee9ff" fill-opacity=".5" stroke="#4b0082" stroke-dasharray="4 3"/>
 <rect x="${cx-p*k}" y="${cy-q*k}" width="${2*p*k}" height="${2*q*k}" fill="#ff149325" stroke="#ff1493"/>
 <path d="M100 90H${cx+p*k}" stroke="#1e90ff" stroke-width="3"/><path d="M${cx+p*k} 90V${cy-q*k}" stroke="#808080" stroke-width="3"/>
 <path d="M100 90L${cx+p*k} ${cy-q*k}" stroke="#4b0082" stroke-width="2"/></g>
 <text data-math-label-done="true" data-entry-real-label="${i}" x="${cx+p*k/2}" y="108" text-anchor="middle" class="mathjax_ignore" fill="#075bb5">${p}t/1024</text><text data-math-label-done="true" data-entry-imag-label="${i}" x="${cx+p*k+5}" y="${cy-q*k/2}" class="mathjax_ignore" fill="#525252">${q}t/1024</text>
 <text data-math-label-done="true" data-entry-diagonal-label="${i}" x="92" y="20" text-anchor="end" class="mathjax_ignore" fill="#4b0082">5t/1024</text>
 <circle cx="${cx+ERROR[i][0]*k}" cy="${cy-ERROR[i][1]*k}" r="5" fill="white" stroke="#a9a9a9" stroke-dasharray="2 2"/>
 <line x1="100" y1="90" data-radius-vector="${i}" stroke="#d52d4c" stroke-width="2.5" marker-end="url(#radius-arrow-${i})"/><circle r="4" data-radius-tip="${i}" fill="#d52d4c"/><circle cx="100" cy="90" r="3" fill="#1e90ff"/>
 <text data-math-label-done="true" x="110" y="167" class="mathjax_ignore">offsets from midpoint</text></svg>
 <output class="mathjax_ignore" data-entry-modulus="${i}"></output></button>`;}

export function mountGateTwoRadius(root,{getMatrix=()=>copy(ERROR),setMatrix=()=>{}}={}){
 const abort=new AbortController(),{signal}=abort;let phi=90,scaled=true,detailFill=1,playMode='homotopy',swept=0;let error=copy(getMatrix()),selected=0,group='row0',t=1,playing=false,raf=0,last=0;
 root.innerHTML=`<div class="radius-root">
 <header class="radius-header"><div><h2>From the rectangles to the Gate-2 radius</h2><p>Certified entry rectangles ${m(tex`\boldsymbol A`)} → modulus bounds ${m(tex`(e_{ij})`)} → matrix allowance ${m(tex`\eta_A`)} → a protected Hardy moat.</p></div><span class="radius-badge">Uniform on the whole contour</span></header>
<div class="radius-homotopy-band output-motion-controls"><div><b>Move the uncertainty centre around the ellipse</b>
 ${eq(tex`v(\varphi)=v_{\max}\cos\varphi+v_{\min}\sin\varphi,\qquad y^\circ(\varphi)=F_*^\circ v(\varphi)`)}
 <label>Boundary position ${m(tex`\varphi`)} <output data-output-phi-value class="mathjax_ignore">90.0°</output><input type="range" data-output-phi min="0" max="360" step=".1" value="90" aria-label="Uncertainty centre boundary position"></label>
 <div class="radius-actions"><button data-radius-orbit>Play boundary position</button><button data-output-direction="90">Minimum direction</button><button data-output-direction="0">Maximum direction</button></div>
 <p>The exact midpoint matrix ${m(tex`A_2^\circ`)}, the spectral point ${m(tex`z_*`)} and entry box ${m(tex`\mathcal A`)} stay fixed during this sweep. Changing ${m(tex`\varphi`)} changes how that box acts on the unit input ${m('v')}.</p></div>
 <div><label class="radius-homotopy">Perturbation homotopy ${m('t')} <output data-radius-t-output class="mathjax_ignore"></output><input data-radius-t type="range" min="0" max="1" step="0.001" value="1" aria-label="Gate 2 matrix homotopy fraction"></label>
 <div class="radius-actions"><button data-radius-play>Play homotopy</button><button data-radius-t-at="0">Start t = 0</button><button data-radius-t-at="1">Gate 2 endpoint t = 1</button></div>
 ${eq(tex`A_t=A_2^\circ+t\Delta,\qquad y_t=(z_*I-A_t)v=y^\circ-t\Delta v`)}
 ${eq(tex`\mathcal Y_{\varphi,t}:=\{y^\circ(\varphi)-t\Delta v(\varphi):A_2^\circ+\Delta\in\mathcal A\}`)}
 <p>${m(tex`\varphi`)} moves the centre <strong>on the ellipse</strong> and changes the uncertainty shape. ${m('t')} scales that shape <strong>about its current centre</strong>. At ${m('t=0')}, it collapses to ${m(tex`y^\circ`)}. <strong>Play homotopy keeps the camera, centre and zoom fixed.</strong></p></div></div>
 <section class="radius-space output-full-width"><h3>From the fixed matrix box ${m(tex`\mathcal A`)} to the moving output enclosure ${m(tex`\mathcal Y_{\varphi,t}`)}</h3>
 <div class="output-camera-controls"><label>Camera azimuth <output class="mathjax_ignore" data-output-az-value></output><input type="range" data-output-az min="-180" max="180" step="1" value="0" aria-label="Output enclosure camera azimuth"></label><label>Camera elevation <output class="mathjax_ignore" data-output-el-value></output><input type="range" data-output-el min="-75" max="75" step="1" value="0" aria-label="Output enclosure camera elevation"></label><label><input type="checkbox" data-output-scaling checked> Visibility scaling</label><div class="radius-actions"><button data-radius-face-on>Face-on view</button><button data-radius-camera-reset>Reset camera</button></div></div>
 <div class="output-visibility-controls"><label>Enclosure visibility magnification <output data-output-size-value class="mathjax_ignore">×1.0</output><input type="range" data-output-size min="1" max="5" step=".1" value="1" aria-label="Enclosure visibility magnification"></label><span>The whole ellipse stays in view. φ moves the enclosure; t changes the perturbation. Neither animation changes the camera.</span></div>
 <div class="radius-actions output-generator-select"><b>Highlight an entry’s two generating segments:</b> ${[0,1,2,3].map(i=>`<button data-modulus-entry="${i}" aria-label="Highlight output generators for entry ${index(i)}">${m(tex`a_{${index(i)}}`)}</button>`).join('')}<span>Axes: Re qmax · blue; Re qmin · indigo; Im qmin · gray</span></div>
 <div data-output-enclosure></div>
 <div class="output-meaning"><p><b>Blue ellipse — midpoint image section.</b> Write ${m(tex`F_*^\circ=z_*I_2-A_2^\circ`)}. The blue curve is ${m(tex`F_*^\circ v(\varphi)`)} for the real SVD unit circle ${m(tex`v(\varphi)=v_{\max}\cos\varphi+v_{\min}\sin\varphi`)}. Its filled interior is the central section of the four-real-dimensional ellipsoid ${m(tex`F_*^\circ\overline B_2(0,1)`)} in ${m(tex`P=\operatorname{span}_{\mathbb R}\{u_{\max},u_{\min}\}`)}.</p>
 <p><b>Violet region — a ball section.</b> It is ${m(tex`\overline B_2(0,\rho_t)\cap P`)}, where ${m(tex`\rho_t=a_\circ-t\eta_A`)}. The radius arrow joins ${m('0')} to the exact endpoint ${m(tex`b_t=-\rho_t u_{\min}`)}. The full protected ball lies inside every perturbed solid image ellipsoid. Visibility scaling shortens only the long blue ellipse axis so the details occupy more of the panel. The protected disk remains round in the default face-on view. Rotating the camera can foreshorten it; <b>Face-on view</b> restores the circle. Turn off <b>Visibility scaling</b> for one physical scale across the whole scene.</p>
 <p><b>Blue point ${m(tex`y^\circ`)}</b>: centre of the uncertainty set, exactly on the blue midpoint ellipse. <b>Deeppink polytope (a projected zonotope, with optional local magnification)</b>: the projected image of the four entry-error rectangles under ${m(tex`\Delta\mapsto y^\circ-t\Delta v`)}. <b>Dashed blue ball</b>: the three-dimensional projection of the full output allowance ${m(tex`\overline B_2(y^\circ,t\eta_A)\subset\mathbb C^2`)}. <b>Coral arrow</b>: the complete selected displacement ${m(tex`-t\Delta v`)}. <b>Violet inner disk</b>: radius ${m(tex`a_\circ-t\eta_A`)}.</p>
 <p><b>Eight real coordinates become eight generating segments.</b> Each real/imaginary entry interval contributes ${m(tex`g_{ij}^{\mathrm{Re}}=-t r_{\mathrm{re},ij}v_j e_i`)} or ${m(tex`g_{ij}^{\mathrm{Im}}=-t r_{\mathrm{im},ij}i v_j e_i`)}. Adding these segments produces a <b>zonotope</b>. The highlighted pair belongs to the selected matrix entry.</p>
 ${eq(tex`\mathcal Y_{\varphi,t}=y^\circ+\sum_{i,j}([-g_{ij}^{\mathrm{Re}},g_{ij}^{\mathrm{Re}}]+[-g_{ij}^{\mathrm{Im}},g_{ij}^{\mathrm{Im}}])\subseteq\overline B_2(y^\circ,t\eta_A)`)}
 <p>The scene projects the four-real-dimensional output set into ${m(tex`(\operatorname{Re}q_{\max},\operatorname{Re}q_{\min},\operatorname{Im}q_{\min})`)} with ${m(tex`q=U_*^*y`)}. With visibility scaling off, every object uses the same physical scale. The enlarged uncertainty glyph uses equal local scales. This projection is <strong>not a central section</strong> of the uncertainty set. The blue ellipse represents the exact real singular-plane boundary. Its long axis is shortened only in the labelled visibility view.</p></div>
 <div class="output-certificate mathjax_ignore">Whole-contour protected radius a∘ − tηA: <strong data-output-protected></strong> &gt; 0 <span>Enclosed eigenvalue count: 1 throughout the homotopy</span></div>
 </section>
 <details class="radius-derivation"><summary>Explore the four entry rectangles and the full rectangle-to-radius derivation</summary>
 <div class="radius-grid">
 <section class="radius-card"><h3><span>1</span> Each rectangle gives a modulus bound</h3>
 <p>For the mathematical Hardy entry ${m(tex`a_{ij}=(A_{2,M}^{X})_{ij}`)}, put ${m(tex`a_{ij}^\circ=(A_2^\circ)_{ij}`)} and ${m(tex`E_{ij}=a_{ij}-a_{ij}^\circ`)}.</p>
 ${eq(tex`|E_{ij}|\le e_{ij}:=\sqrt{r_{\mathrm{re},ij}^2+r_{\mathrm{im},ij}^2}=\frac5{1024}`)}
 <p>The half-widths are ${m(tex`3/1024`)} and ${m(tex`4/1024`)}, in either order: the circumscribed disk has radius ${m(tex`\sqrt{3^2+4^2}/1024=5/1024`)}.</p>
 <div class="radius-entry-grid">${[0,1,2,3].map(entryPlot).join('')}</div>
 <p class="radius-key">Blue / gray legs: real / imaginary half-widths. Violet diagonal and disk: the current modulus allowance 5t/1024. Coral: the whole error vector tΔ. Dashed grey: the full rectangle at t = 1; grey ring: the original toy entry.</p>
 <div class="radius-controls"><b data-selected-entry-title>Explore entry (1, 1)</b><p>The exploratory target ${m(tex`\widetilde A_{2,M}^{X}=A_2^\circ+\Delta`)} is shared with the Geometry tab. Choose its endpoint at t = 1 with these controls; the homotopy displays Ãₜ = A₂° + tΔ.</p>
 ${['real','imaginary'].map((s,j)=>`<label>${s==='real'?'Real':'Imaginary'} error numerator <output data-radius-offset="${j}" class="mathjax_ignore"></output><input type="range" step="any" data-radius-offset-slider="${j}" aria-label="Radius derivation selected entry ${s} error numerator"></label>`).join('')}
 <div class="radius-actions"><button data-radius-preset="toy">Original Hardy matrix</button><button data-radius-preset="mid">Midpoint</button><button data-radius-preset="interior">Interior matrix</button></div><output class="radius-entry-value mathjax_ignore" data-radius-entry-value></output></div>
 <p>The endpoint target and the homotopy fraction are separate controls. The current rectangle has half-widths ${m(tex`t r_{\mathrm{re},ij}`)}, ${m(tex`t r_{\mathrm{im},ij}`)} and radius ${m(tex`t e_{ij}`)}. At ${m('t=0')}, all four rectangles collapse to their exact midpoint entries.</p></section>

 <section class="radius-card"><h3><span>2</span> Add the entry bounds by row and column</h3>
 <div class="radius-actions" role="group" aria-label="Inspect row or column sums">${[['row0','Row 1'],['row1','Row 2'],['col0','Column 1'],['col1','Column 2'],['all','All sums']].map(([key,label])=>`<button data-sum-group="${key}" aria-pressed="${key===group}">${label}</button>`).join('')}</div>
 <div class="radius-sum-matrix"><div class="radius-moduli">${[0,1,2,3].map(i=>`<button data-modulus-entry="${i}" aria-label="Select modulus bound e ${index(i)}">${m(tex`e_{${index(i)}}`)}<strong>5t/1024</strong><small data-live-entry-bound></small></button>`).join('')}</div><div class="radius-sum-bars">${[['row0','Row 1'],['row1','Row 2'],['col0','Column 1'],['col1','Column 2']].map(([key,label])=>`<button data-sum-group="${key}" class="radius-sum" aria-label="Inspect ${label} sum"><span>${label}</span><span class="radius-segments"><i>5t/1024</i><i>5t/1024</i></span><b>10t/1024</b></button>`).join('')}</div></div>
 <p class="mathjax_ignore radius-highlight" data-sum-explanation></p>
 ${eq(tex`\eta_\infty=\max_i\sum_j e_{ij}=\frac{10}{1024},\qquad\eta_1=\max_j\sum_i e_{ij}=\frac{10}{1024}`)}
 <p>At t = 1 the formulas above give the terminal bounds. During the homotopy, both row and column maxima equal tηA. Both rows and both columns tie. These are sums of the <b>enclosure bounds</b> ${m(tex`e_{ij}`)}, so they cover every matrix in ${m(tex`\mathcal A`)}.</p>
 <div class="radius-inclusion">${eq(tex`\boldsymbol A=(R_{ij}),\quad\mathcal A\cong R_{11}\times R_{12}\times R_{21}\times R_{22}`)}<p>Four complex rectangles give eight independent real coordinates. This Cartesian box is a set of matrices.</p></div>
 </section>

 <section class="radius-card"><h3><span>3</span> Convert the sums to an operator-norm radius</h3>
 ${eq(tex`\|E\|_2\le\sqrt{\|E\|_1\|E\|_\infty}\le\sqrt{\eta_1\eta_\infty}=\eta_A=\frac5{512}`)}
 <p>The first inequality is the matrix-norm inequality. The second uses the entrywise modulus bounds from the rectangles.</p>
 <div class="radius-norm-compare mathjax_ignore"><div><span>Growing enclosure allowance tηA</span><strong data-live-allowance></strong><div class="radius-meter"><i data-live-allowance-bar></i></div></div><div><span>Moving matrix error ‖tΔ‖₂ · numerical</span><strong data-selected-error-norm></strong><div class="radius-meter selected"><i data-selected-error-bar></i></div></div><div><span>Original toy path ‖tE‖₂ = t√5/256</span><strong data-live-toy-norm></strong><div class="radius-meter reference"><i data-live-toy-bar></i></div></div></div>
 <p class="radius-key">All bars use the same fixed scale: full width = ηA = ${VALUES.matrixAllowance}.</p>
 <p>The actual norm of our chosen error ${m(tex`E`)} is smaller. Certification retains the enclosure-derived allowance ${m(tex`\eta_A`)}. The moving norm readout is a diagnostic; it does not replace the certificate.</p>
 ${eq(tex`A_{2,M}^{X}\in\mathcal A\subseteq\{C:\|C-A_2^\circ\|_2\le\eta_A\}`)}

 <p><b>Space:</b> this norm ball contains matrices in ${m(tex`\mathbb C^{2\times2}\cong\mathbb R^8`)}. An output uncertainty ball contains vectors in ${m(tex`\mathbb C^2`)}. For a unit vector ${m('v')}, the link is ${m(tex`\|Ev\|_2\le\|E\|_2\le\eta_A`)}.</p>
 </section>

 <section class="radius-card radius-gate"><h3><span>4</span> Gate 2 keeps a positive contour-wide margin</h3>
 ${eq(tex`\eta_A=0.009765625<a_\circ=\underline s_\Gamma^\circ=0.03921135`)}
 <div class="radius-budget mathjax_ignore"><div class="radius-budget-title">Starting certified allowance a∘ = ${VALUES.midpoint}</div><div class="radius-budget-track"><span data-radius-protected></span><span data-radius-consumed></span></div><div class="radius-budget-labels"><span>Protected margin<br><b data-radius-margin></b></span><span>Permitted loss tηA<br><b data-radius-loss></b></span></div></div>
 <p class="radius-key">The two lengths add to the fixed starting allowance. This is a numerical-radius comparison, not a section of matrix or output space.</p>
 ${eq(tex`A_t=A_2^\circ+tE,\qquad\sigma_{\min}(zI-A_t)\ge a_\circ-t\eta_A>0`)}
 <p>For every ${m(tex`z\in\Gamma`)} and every unit input ${m('v')}, the reverse triangle inequality gives</p>
 ${eq(tex`\|(zI-A_t)v\|_2\ge\|(zI-A_2^\circ)v\|_2-t\|Ev\|_2\ge a_\circ-t\eta_A.`)}
 <p>The same bound holds for each exploratory target, using ${m(tex`\Delta=\widetilde A_{2,M}^{X}-A_2^\circ`)} in place of ${m('E')}.</p>
 <div class="radius-result">${eq(tex`\underline s_{\Gamma,2}^{H}=a_\circ-\eta_A=0.029445725>0`)}${eq(tex`s_\Gamma(A_{2,M}^{X})\ge\underline s_{\Gamma,2}^{H},\quad\operatorname{rank}\Pi_\Gamma(A_{2,M}^{X})=1`)}</div>
 <p>No eigenvalue can cross ${m(tex`\Gamma`)} along the homotopy because the shifted matrices remain invertible there. The midpoint’s enclosed count of one is therefore preserved.</p></section>
 </div></details><footer class="radius-footer">${m(tex`\boldsymbol A\longrightarrow A_2^\circ,(e_{ij})\longrightarrow\eta_A\longrightarrow\underline s_{\Gamma,2}^{H}`)}<span>All contour points · all unit inputs · every matrix in the enclosure</span></footer></div>`;
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const space=mountOutputEnclosure(q('[data-output-enclosure]'),{onPhiChange:angle=>{stop();phi=angle;draw();},onCameraChange:(az,el)=>{const a=((az*180/Math.PI+180)%360+360)%360-180;q('[data-output-az]').value=a;q('[data-output-el]').value=el*180/Math.PI;q('[data-output-az-value]').textContent=fmt(a,0)+'°';q('[data-output-el-value]').textContent=fmt(el*180/Math.PI,0)+'°';}});

 function draw(){
  const affected=groups[group];qa('[data-radius-entry]').forEach(el=>{const i=+el.dataset.radiusEntry;el.setAttribute('aria-pressed',String(i===selected));el.classList.toggle('sum-active',affected.includes(i));});
  qa('[data-modulus-entry]').forEach(el=>{const active=el.closest('.output-generator-select')?selected===+el.dataset.modulusEntry:affected.includes(+el.dataset.modulusEntry);el.classList.toggle('sum-active',active);el.setAttribute('aria-pressed',String(active));});
  qa('[data-sum-group]').forEach(el=>{el.setAttribute('aria-pressed',String(el.dataset.sumGroup===group));el.classList.toggle('sum-active',group==='all'||el.dataset.sumGroup===group);});
  q('[data-sum-explanation]').textContent=`At t = ${fmt(t,3)}: ${group==='all'?'every row and column':(group.startsWith('row')?'row ':'column ')+(Number(group.at(-1))+1)} has two bounds ${fmt(5*t/DEN,12)} + ${fmt(5*t/DEN,12)} = ${fmt(t*ETA,12)}. The row and column maxima are both tηA.`;
  qa('[data-live-entry-bound]').forEach(el=>el.textContent=fmt(5*t/DEN,12));
  qa('.radius-segments').forEach(el=>el.style.width=100*t+'%');
  error.forEach(([a,b],i)=>{const x=100+12*t*a,y=90-12*t*b;q(`[data-entry-enclosure="${i}"]`).setAttribute('transform',`translate(100 90) scale(${t}) translate(-100 -90)`);q(`[data-entry-enclosure="${i}"]`).style.display=t===0?'none':'';
   const [p,r]=HALF[i];q(`[data-entry-real-label="${i}"]`).setAttribute('x',100+6*p*t);q(`[data-entry-imag-label="${i}"]`).setAttribute('x',105+12*p*t);q(`[data-entry-imag-label="${i}"]`).setAttribute('y',90-6*r*t);q(`[data-entry-diagonal-label="${i}"]`).setAttribute('y',80-60*t);
   for(const name of ['real','imag','diagonal'])q(`[data-entry-${name}-label="${i}"]`).style.display=t===0?'none':'';const line=q(`[data-radius-vector="${i}"]`);line.setAttribute('x2',x);line.setAttribute('y2',y);line.style.display=t*Math.hypot(a,b)<1e-10?'none':'';const tip=q(`[data-radius-tip="${i}"]`);tip.setAttribute('cx',x);tip.setAttribute('cy',y);q(`[data-entry-modulus="${i}"]`).textContent=`|tΔ${index(i)}| ≈ ${fmt(t*Math.hypot(a,b)/DEN,12)} ≤ ${fmt(5*t/DEN,12)}`;});
  q('[data-selected-entry-title]').textContent=`Explore entry (${Math.floor(selected/2)+1}, ${selected%2+1})`;
  qa('[data-radius-offset-slider]').forEach(el=>{const j=+el.dataset.radiusOffsetSlider;el.min=-HALF[selected][j];el.max=HALF[selected][j];el.value=error[selected][j];q(`[data-radius-offset="${j}"]`).textContent=fmt(error[selected][j],4)+' / 1024';});
  const [re,im]=error[selected].map((x,j)=>t*x+MID[selected][j]);q('[data-radius-entry-value]').textContent=`Moving a${index(selected)}(t) ≈ (${fmt(re,4)} ${im<0?'−':'+'} ${fmt(Math.abs(im),4)}i) / 1024`;
  const norm=t*normUnits(error)/DEN;q('[data-selected-error-norm]').textContent=fmt(norm,12);q('[data-selected-error-bar]').style.width=Math.min(100,norm/ETA*100)+'%';
  space.update({error,phi,t,selected,scaled,detailFill});
  q('[data-output-size-value]').textContent='×'+detailFill.toFixed(1);
  q('[data-output-phi]').value=phi;q('[data-output-phi-value]').textContent=fmt(phi,1)+'°';
  q('[data-radius-orbit]').textContent=playing&&playMode==='boundary'?'Pause boundary position':'Play boundary position';
  q('[data-radius-orbit]').setAttribute('aria-pressed',String(playing&&playMode==='boundary'));
  q('[data-output-protected]').textContent=fmt(A0-t*ETA,12);
  q('[data-live-allowance]').textContent=fmt(t*ETA,12);q('[data-live-allowance-bar]').style.width=100*t+'%';q('[data-live-toy-norm]').textContent='≈ '+fmt(t*NORM_E,12);q('[data-live-toy-bar]').style.width=100*t*NORM_E/ETA+'%';
  const loss=t*ETA,remaining=A0-loss;q('[data-radius-t]').value=t;q('[data-radius-t-output]').textContent=fmt(t,3);q('[data-radius-protected]').style.width=100*remaining/A0+'%';q('[data-radius-consumed]').style.width=100*loss/A0+'%';q('[data-radius-margin]').textContent=fmt(remaining,12);q('[data-radius-loss]').textContent=fmt(loss,12);q('[data-radius-play]').textContent=playing&&playMode==='homotopy'?'Pause homotopy':'Play homotopy';q('[data-radius-play]').setAttribute('aria-pressed',String(playing&&playMode==='homotopy'));
 }
 function stop(){playing=false;cancelAnimationFrame(raf);last=0;}
 function frame(now){if(!playing)return;if(root.hidden||document.hidden){stop();draw();return;}const dt=Math.min(.06,(now-(last||now))/1000);last=now;if(playMode==='boundary'){const step=Math.min(360-swept,dt*30);swept+=step;phi=(phi+step)%360;if(swept>=360)stop();}else{t=Math.min(1,t+dt/6);if(t>=1)stop();}draw();if(playing)raf=requestAnimationFrame(frame);}

 function updateMatrix(d){error=copy(d);setMatrix(copy(d));draw();}
 root.addEventListener('input',e=>{const el=e.target;if(el.hasAttribute('data-output-size')){detailFill=Number(el.value);draw();}if(el.hasAttribute('data-output-scaling')){scaled=el.checked;draw();}if(el.hasAttribute('data-output-phi')){stop();phi=Number(el.value);draw();}if(el.hasAttribute('data-output-az')||el.hasAttribute('data-output-el')){space.setCamera(Number(q('[data-output-az]').value)*Math.PI/180,Number(q('[data-output-el]').value)*Math.PI/180);q('[data-output-az-value]').textContent=q('[data-output-az]').value+'°';q('[data-output-el-value]').textContent=q('[data-output-el]').value+'°';}if(el.hasAttribute('data-radius-offset-slider')){const d=copy(error),j=+el.dataset.radiusOffsetSlider;d[selected][j]=Math.max(-HALF[selected][j],Math.min(HALF[selected][j],Number(el.value)));updateMatrix(d);}if(el.hasAttribute('data-radius-t')){stop();t=Number(el.value);draw();}},{signal});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-radius-face-on'))space.setCamera(0,0);if(b.hasAttribute('data-radius-camera-reset')){space.reset();q('[data-output-az]').value=0;q('[data-output-el]').value=0;q('[data-output-az-value]').textContent='0°';q('[data-output-el-value]').textContent='0°';}if(b.hasAttribute('data-radius-entry')||b.hasAttribute('data-modulus-entry'))selected=Number(b.dataset.radiusEntry??b.dataset.modulusEntry);if(b.hasAttribute('data-sum-group'))group=b.dataset.sumGroup;if(b.hasAttribute('data-radius-preset'))updateMatrix(b.dataset.radiusPreset==='toy'?ERROR:b.dataset.radiusPreset==='mid'?ERROR.map(()=>[0,0]):ERROR.map(z=>z.map(x=>x*.35)));if(b.hasAttribute('data-radius-t-at')){stop();t=Number(b.dataset.radiusTAt);}if(b.hasAttribute('data-output-direction')){stop();phi=Number(b.dataset.outputDirection);}if(b.hasAttribute('data-radius-orbit')){const wasPlaying=playing&&playMode==='boundary';stop();if(!wasPlaying){playMode='boundary';swept=0;playing=true;raf=requestAnimationFrame(frame);}}if(b.hasAttribute('data-radius-play')){const wasPlaying=playing&&playMode==='homotopy';stop();if(!wasPlaying){playMode='homotopy';if(t>=1)t=0;playing=true;raf=requestAnimationFrame(frame);}}draw();},{signal});
 q('[data-output-az-value]').textContent='0°';q('[data-output-el-value]').textContent='0°';
 draw();const dispose=()=>{stop();space.dispose();abort.abort();};dispose.setError=d=>{error=copy(d);draw();};return dispose;
}
