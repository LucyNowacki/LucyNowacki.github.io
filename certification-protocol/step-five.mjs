import {math} from './math-render.mjs?v=103';
import {A,F,H,Z,CENTER,DELTA,THETA,THETA_TEXT,A_STAR,A_CIRCLE,SIGMA_MAX,VMIN,VMAX,UMIN,UMAX,V,U,direction,diagnostics} from './step-five-math.mjs?v=103';
const tex=String.raw, m=s=>math(s), n=(x,d=7)=>Math.abs(x)<.5*10**(-d)?(0).toFixed(d):x.toFixed(d);
const complex=(z,d=7)=>`${n(z.re,d)}${z.im<0?'-':'+'}${n(Math.abs(z.im),d)}i`;
const matrix=(a,d=6)=>tex`\begin{pmatrix}${a.map(row=>row.map(z=>complex(z,d)).join('&')).join('\\\\')}\end{pmatrix}`;
const vector=(v,d=9)=>tex`\begin{pmatrix}${v.map(z=>complex(z,d)).join('\\\\')}\end{pmatrix}`;
const eq=s=>`<div class="s5-equation">${m(s)}</div>`;
const labels=['Choose the point','Form the shift','Find singular directions','Apply the three factors','Inspect the inradius','Close the squeeze'];
function spectral(){
 const k=1400,p=z=>[190+(z.re-CENTER.re)*k,170-(z.im-CENTER.im)*k], [x,y]=p(Z),r=DELTA*k;
 return `<svg viewBox="0 0 380 315" role="img" aria-label="Selected point z star on the contour, equal real and imaginary scales">
 <path d="M45 260H345 M70 290V35" class="s5-axis"/><text x="332" y="280">Re z</text><text x="55" y="28">Im z</text>
 ${[.55,.60,.65,.70].map(t=>`<line x1="${190+(t-CENTER.re)*k}" y1="260" x2="${190+(t-CENTER.re)*k}" y2="264" class="s5-axis"/><text x="${190+(t-CENTER.re)*k}" y="279" text-anchor="middle" class="s5-small">${t.toFixed(2)}</text>`).join('')}
 ${[.20,.25,.30].map(t=>`<line x1="66" y1="${170-(t-CENTER.im)*k}" x2="70" y2="${170-(t-CENTER.im)*k}" class="s5-axis"/><text x="60" y="${174-(t-CENTER.im)*k}" text-anchor="end" class="s5-small">${t.toFixed(2)}</text>`).join('')}
 <circle cx="190" cy="170" r="${r}" class="s5-spectral"/><text x="271" y="122">Γ</text><text x="221" y="148">U</text>
 <path d="M232 170 A42 42 0 0 0 ${190+42*Math.cos(THETA)} ${170-42*Math.sin(THETA)}" class="s5-angle" data-angle-arc/>
 <line x1="190" y1="170" x2="${x}" y2="${y}" class="s5-vector"/><line x1="190" y1="170" x2="290" y2="170" class="s5-reference"/>
 <circle cx="190" cy="170" r="3" class="s5-origin"/><text x="192" y="192">c</text><text x="147" y="156">δ</text>
 <circle cx="${x}" cy="${y}" r="6" class="s5-marker"/><text x="${x-22}" y="${y-14}">z∗</text><text x="193" y="111" data-angle-label>θ∗</text>
 <text x="70" y="307">Complex plane · equal scales</text></svg>`;
}
function geometry(id,a,b,{ball=0,range=1.23,labels=['',''],clip=false}={}){
 const k=108/range,rx=a*k,ry=b*k,r=ball*k;
 const basis=id==='input'?'v':(['output','full','close'].includes(id)?'u':'e');
 const horizontal=basis==='e'?'e_1':basis+'_{\\max}',vertical=basis==='e'?'e_2':basis+'_{\\min}';
 return `<svg viewBox="0 0 300 280" role="img" data-plane="${id}" data-k="${k}" data-a="${a}" data-b="${b}" aria-label="${(id==='output'||id==='full')?'Forward output ellipsoid section':id==='close'?'Magnified centre of output section':id==='sigma'?'Singular-value scaling ellipse':'Unit input circle in an orthonormal frame'}">
 <defs><clipPath id="s5-clip-${id}"><rect x="30" y="28" width="240" height="222"/></clipPath></defs>
 <g ${clip?`clip-path="url(#s5-clip-${id})"`:''}>
 <path d="M30 140H270 M150 250V30" class="s5-axis"/>
 <ellipse cx="150" cy="140" rx="${rx}" ry="${ry}" class="s5-ellipse ${id==='input'?'s5-input-ellipse':''}"/>
 ${ball?`<circle cx="150" cy="140" r="${r}" class="s5-inball" data-ball/><line x1="150" y1="140" x2="${150-r}" y2="140" class="s5-guaranteed-radius" data-ball/>`:''}
 <path d="M150 140H${150+rx}" class="s5-major" data-axes/><path d="M150 140V${140-ry}" class="s5-minor" data-axes/>
 <line x1="150" y1="140" x2="150" y2="${140-ry}" class="s5-vector" data-vector/>
 <circle cx="150" cy="140" r="2.7" class="s5-origin"/><circle cx="150" cy="${140-ry}" r="5" class="s5-marker" data-marker/>
 </g>
 <foreignObject x="218" y="251" width="75" height="28"><div xmlns="http://www.w3.org/1999/xhtml" class="s5-svg-math">${m(horizontal)}</div></foreignObject><foreignObject x="157" y="5" width="70" height="28"><div xmlns="http://www.w3.org/1999/xhtml" class="s5-svg-math">${m(vertical)}</div></foreignObject>
 </svg>`;
}
function rayleigh(){
 const hi=SIGMA_MAX**2,lo=A_STAR**2,points=Array.from({length:181},(_,i)=>{let t=i*2*Math.PI/180;return`${45+i*2},${180-(hi*Math.cos(t)**2+lo*Math.sin(t)**2)/hi*135}`;}).join(' ');
 return `<svg viewBox="0 0 460 230" role="img" aria-label="Squared output length for every unit direction in the singular-vector section" data-rayleigh>
 <path d="M45 25V180H425" class="s5-axis"/><polyline points="${points}" class="s5-curve" data-ray-path/>
 <line x1="45" x2="405" y1="${180-lo/hi*135}" y2="${180-lo/hi*135}" class="s5-reference" data-curve-floor/>
 <text x="36" y="50" text-anchor="end" data-curve-high>max</text><text x="36" y="188" text-anchor="end" data-curve-low>0</text>
 ${[0,90,180,270,360].map((d,i)=>`<text x="${45+i*90}" y="205" text-anchor="middle">${d}°</text>`).join('')}
 <text x="430" y="218">φ</text><circle r="5" class="s5-marker" data-ray-marker cx="135" cy="179.36"/></svg>`;
}
const inputControls=()=>`<label class="s5-range">Unit input direction ${m(tex`\varphi`)} <output data-phi>90.0°</output><input type="range" min="0" max="360" step="0.1" value="90" data-direction aria-label="Unit input direction"></label><div class="s5-actions"><button data-shortest>Shortest output</button><button data-longest>Longest output</button><button data-sweep aria-pressed="false">▶ Sweep unit directions</button><button data-reset>Reset scene</button></div>`;
function componentBars(id){return `<svg viewBox="0 0 340 158" role="img" aria-label="Four real coordinates of the ${id} vector, not an ellipsoid section">
 <path d="M170 15V145" class="s5-axis"/>
 ${['Re first','Im first','Re second','Im second'].map((s,i)=>`<text x="2" y="${29+i*33}" class="s5-small">${s}</text><rect x="170" y="${17+i*33}" width="0" height="15" rx="2" fill="${i%2?'var(--palette-imag)':'var(--palette-real)'}" data-bar="${id}-${i}"/>`).join('')}</svg>`;}
function entryPlot(index){
 const i=Math.floor(index/2),j=index%2,base=i===j?Z:{re:0,im:0},val=F[i][j],k=240,p=z=>({x:178+z.re*k,y:165-z.im*k}),b=p(base),f=p(val);
 return `<svg viewBox="0 0 400 300" role="img" aria-label="Complex subtraction for selected shifted-matrix entry, equal scales">
 <path d="M38 165H375 M178 285V25" class="s5-axis"/><text x="349" y="187">Re</text><text x="185" y="20">Im</text>
 <line x1="178" y1="165" x2="${b.x}" y2="${b.y}" class="s5-major"/><line x1="${b.x}" y1="${b.y}" x2="${f.x}" y2="${f.y}" class="s5-subtract"/>
 <line x1="178" y1="165" x2="${f.x}" y2="${f.y}" class="s5-vector"/>
 <circle cx="178" cy="165" r="3" class="s5-origin"/><circle cx="${b.x}" cy="${b.y}" r="4" class="s5-blue-dot"/><circle cx="${f.x}" cy="${f.y}" r="5" class="s5-marker"/>
 <text x="${b.x+8}" y="${b.y-12}">${i===j?'z∗':'0'}</text><text x="${f.x+9}" y="${f.y+22}">F${i+1}${j+1}</text><text x="42" y="298">Complex entry plane · equal scales</text></svg>`;
}
export function stepFiveArgument(){return `<div class="s5-argument"><h2>A selected-point SVD supplies the upper side</h2>
 <p>Define the angle by the exact decimal ${m(tex`\theta_\ast=2.6294058517935316`)} and then set ${m(tex`z_\ast=c+\delta e^{i\theta_\ast}`)}. This definition, rather than the rounded displayed coordinates, places the point on ${m(tex`\Gamma`)}.</p>
 ${eq(tex`F_\ast^\circ=z_\ast I_2-A_2^\circ,\qquad H_\ast=(F_\ast^\circ)^\ast F_\ast^\circ`)}
 <p>The Hermitian matrix ${m(tex`H_\ast`)} has orthonormal eigenvectors ${m(tex`v_{\max},v_{\min}`)} and positive eigenvalues ${m(tex`\lambda_{\max},\lambda_{\min}`)}. Set ${m(tex`\sigma_{\max}=\sqrt{\lambda_{\max}}`)} and ${m(tex`a_\ast=\sqrt{\lambda_{\min}}`)}. Define each left singular vector by ${m(tex`u_j=F_\ast^\circ v_j/\sigma_j`)}.</p>
 ${eq(tex`V_\ast=(v_{\max}\ v_{\min}),\quad U_\ast=(u_{\max}\ u_{\min}),\quad \Sigma_\ast=\operatorname{diag}(\sigma_{\max},a_\ast)`)}
 ${eq(tex`F_\ast^\circ=U_\ast\Sigma_\ast V_\ast^\ast,\qquad F_\ast^\circ v_{\min}=a_\ast u_{\min}`)}
 <p>The unitary factors preserve lengths. In the middle, ${m(tex`\Sigma_\ast`)} scales the two orthogonal axes by their singular values. Hence every unit input has output norm at least ${m(tex`a_\ast`)}, and ${m(tex`v_{\min}`)} attains that value.</p>
 ${eq(tex`\|F_\ast^\circ v(\varphi)\|_2^2=\sigma_{\max}^2\cos^2\varphi+a_\ast^2\sin^2\varphi`)}
 <p>The geometry shows genuine real two-dimensional central sections of the unit ball and its image in ${m(tex`\mathbb C^2\cong\mathbb R^4`)}. Coordinates are taken in the indicated orthonormal frames. The full complex statement also allows complex coefficients ${m(tex`\xi_1,\xi_2`)}, with ${m(tex`|\xi_1|^2+|\xi_2|^2=1`)}.</p>
 ${eq(tex`a_\circ\le\min_{z\in\Gamma}\sigma_{\min}(zI_2-A_2^\circ)\le\sigma_{\min}(z_\ast I_2-A_2^\circ)=a_\ast`)}
 <p>The left inequality comes from Step 4's whole-contour certificate. The right inequality follows by evaluating at a single admissible contour point. No global minimizer is asserted.</p>
 ${eq(tex`0.04336744712663<a_\ast<0.04336744712664`)}
 <p>This strict interval is the supplied interval certificate. Floating-point vectors and animation illustrate it; they do not establish it. In particular, its lower endpoint is not a lower bound for the whole-contour minimum.</p></div>`;}
export function mountStepFive(root){
 const abort=new AbortController(),{signal}=abort;
 let phi=90,entry=0,activeFactor=0,squared=true,playing=false,raf=0,last=0,drag=null;
 root.innerHTML=`<div class="s5-root">
 <div class="s5-summary"><div><span>All contour points · certified</span><strong>${m(tex`a_\circ=0.03921135`)}</strong></div><div><span>One selected point · SVD</span><strong>${m(tex`a_\ast\approx0.0433674471266311`)}</strong></div></div>
 <nav class="s5-jumps" aria-label="SVD construction">${labels.map((s,i)=>`<button data-jump="${i}"><b>${i+1}</b>${s}</button>`).join('')}</nav>
 <section class="s5-card" id="s5-part-0"><h2><span>1</span> Fix the contour point</h2><div class="s5-pair"><div>${spectral()}<button data-angle aria-pressed="true">Hide angle arc</button></div><div>
 <p>The angle fixes one point of the contour. It remains fixed while you explore input directions below.</p>
 ${eq(tex`\theta_\ast:=2.6294058517935316,\qquad z_\ast:=c+\delta e^{i\theta_\ast}`)}
 ${eq(tex`z_\ast\approx0.570520320322476+0.280630287335158i`)}
 <p>${m(tex`c=\frac58+\frac14i`)} and ${m(tex`\delta=\frac1{16}`)}. The defining exponential gives ${m(tex`|z_\ast-c|=\delta`)} exactly.</p>
 <p class="s5-note">Selecting the contour point and finding its shortest output direction are separate operations. This SVD does not establish that the selected point is a global minimizer.</p></div></div></section>
 <section class="s5-card" id="s5-part-1"><h2><span>2</span> Form the shifted midpoint matrix</h2>
 ${eq(tex`A_2^\circ=\begin{pmatrix}\frac12+\frac14i&\frac38-\frac18i\\\frac1{16}+\frac18i&\frac14-\frac1{16}i\end{pmatrix},\qquad F_\ast^\circ=z_\ast I_2-A_2^\circ`)}
 <p>Choose an entry. Blue starts at the diagonal shift (or zero); gray subtracts the midpoint entry; red is the resulting entry of ${m(tex`F_\ast^\circ`)}.</p>
 <div class="s5-pair"><div><div class="s5-entry-matrix" role="group" aria-label="Choose a shifted-matrix entry">${F.flat().map((v,k)=>`<button data-entry="${k}" aria-pressed="${k===0}"><span>(${Math.floor(k/2)+1}, ${k%2+1})</span>${m(complex(v,7))}</button>`).join('')}</div><div data-entry-rule></div><p class="s5-small">The diagonal receives ${m(tex`z_\ast`)}. Both off-diagonal entries change sign. All displayed decimal entries are approximations.</p></div><div data-entry-plot></div></div></section>
 <section class="s5-card" id="s5-part-2"><h2><span>3</span> Find the two singular directions</h2>
 <p>Build the Hermitian matrix ${m(tex`H_\ast=(F_\ast^\circ)^\ast F_\ast^\circ`)}. Its orthogonal eigenvectors are the right singular directions. Taking square roots of its eigenvalues gives the two stretching factors.</p>
 <details><summary>Inspect the Hermitian matrix and its eigenvectors</summary>${eq(tex`H_\ast\approx ${matrix(H,9)}`)}${eq(tex`H_\ast v_j=\lambda_j v_j,\qquad \|v_j\|_2=1,\quad v_{\max}^\ast v_{\min}=0`)}<div class="s5-pair"><div>${m(tex`v_{\min}\approx${vector(VMIN)}`)}</div><div>${m(tex`v_{\max}\approx${vector(VMAX)}`)}</div></div></details>
 <div class="s5-eigen-cards"><button data-longest aria-label="Choose the maximum singular direction"><span>Maximum direction</span>${m(tex`\lambda_{\max}\approx${n(SIGMA_MAX**2,12)}`)}<b>↓ square root</b>${m(tex`\sigma_{\max}\approx${n(SIGMA_MAX,12)}`)}</button><button data-shortest aria-label="Choose the minimum singular direction"><span>Minimum direction</span>${m(tex`\lambda_{\min}\approx${n(A_STAR**2,12)}`)}<b>↓ square root</b>${m(tex`a_\ast=\sqrt{\lambda_{\min}}\approx${n(A_STAR,12)}`)}</button></div>
 <div class="s5-pair"><div><p>${m(tex`v(\varphi)=\cos\varphi\,v_{\max}+\sin\varphi\,v_{\min}`)}</p>${inputControls()}<p>At 90° the unit input is ${m(tex`v_{\min}`)}. Its output is the shortest. At 0° the input is ${m(tex`v_{\max}`)} and the output is the longest.</p></div><div><div class="s5-actions"><button data-curve="squared" aria-pressed="true">Squared output length</button><button data-curve="length" aria-pressed="false">Take the square root</button></div>${rayleigh()}<div class="s5-readout"><span data-curve-caption>Squared output length</span><output data-curve-value></output></div><p class="s5-small">Sweep the direction to move along this exact-form curve at the same fixed ${m(tex`z_\ast`)}. This graph is over input directions, not contour points.</p></div></div></section>
 <section class="s5-card" id="s5-part-3"><h2><span>4</span> Follow the SVD, factor by factor</h2>
 ${eq(tex`v\ \xrightarrow{\ V_\ast^\ast\ }\ \xi\ \xrightarrow{\ \Sigma_\ast\ }\ \omega\ \xrightarrow{\ U_\ast\ }\ y=F_\ast^\circ v`)}
 <p>All four pictures share the input direction. Drag a red marker, use the slider, or select a factor below. Every red point is the vector produced at that stage.</p>
 <div class="s5-local">${inputControls()}</div>
 <div class="s5-factor-tabs" role="group" aria-label="SVD factor explanation"><button data-factor="0" aria-pressed="true">${m(tex`V_\ast^\ast`)} · express the input</button><button data-factor="1" aria-pressed="false">${m(tex`\Sigma_\ast`)} · scale the axes</button><button data-factor="2" aria-pressed="false">${m(tex`U_\ast`)} · reconstruct the output</button></div>
 <div class="s5-factor-note" data-factor-note></div>
 <div class="s5-chain">
 <article data-stage="input"><h3>Unit input ${m(tex`v`)}</h3>${geometry('input',1,1,{labels:['vₘₐₓ','vₘᵢₙ']})}<p>Input section in the ${m(tex`(v_{\max},v_{\min})`)} frame.</p><div class="s5-readout"><span>Length</span><output data-norm="input">1</output></div></article>
 <article data-stage="coordinates"><h3>After ${m(tex`V_\ast^\ast`)}</h3>${geometry('coordinates',1,1,{labels:['e₁','e₂']})}<p>${m(tex`\xi=(\cos\varphi,\sin\varphi)^T`)} in standard coordinates.</p><div class="s5-readout"><span>Length preserved</span><output data-norm="coordinates">1</output></div></article>
 <article data-stage="sigma"><h3>After ${m(tex`\Sigma_\ast`)}</h3>${geometry('sigma',SIGMA_MAX,A_STAR,{range:SIGMA_MAX*1.23,labels:['e₁','e₂']})}<p>Axes scaled by ${m(tex`\sigma_{\max}`)} and ${m(tex`a_\ast`)}.</p><div class="s5-readout"><span>New length</span><output data-norm="sigma"></output></div></article>
 <article data-stage="output"><h3>After ${m(tex`U_\ast`)}</h3>${geometry('output',SIGMA_MAX,A_STAR,{ball:A_CIRCLE,range:SIGMA_MAX*1.23,labels:['uₘₐₓ','uₘᵢₙ']})}<p>Output section in the ${m(tex`(u_{\max},u_{\min})`)} frame.</p><div class="s5-readout"><span>Length preserved</span><output data-norm="output"></output></div></article>
 </div>
 <p class="s5-note">These are real two-dimensional central sections in ${m(tex`\mathbb C^2\cong\mathbb R^4`)}. Each picture uses its own orthonormal frame and equal axis scales. The first two have the same scale; the last two have the same scale. The matching shapes at each unitary map mean length preservation, not that the complex coordinates stay unchanged.</p>
 <details open><summary>See how the original complex coordinates change</summary><div class="s5-pair"><div><h3>Input ${m(tex`v\in\mathbb C^2`)}</h3>${componentBars('input')}</div><div><h3>Output ${m(tex`y=F_\ast^\circ v\in\mathbb C^2`)}</h3>${componentBars('output')}</div></div>
 <div class="s5-table-wrap"><table><thead><tr><th>Stage</th><th>First component · Re / Im</th><th>Second component · Re / Im</th></tr></thead><tbody>${['input','xi','stretched','output'].map((id,i)=>`<tr><th>${m([tex`v`,tex`\xi=V_\ast^\ast v`,tex`\omega=\Sigma_\ast\xi`,tex`y=U_\ast\omega`][i])}</th><td><code data-component="${id}-0"></code></td><td><code data-component="${id}-1"></code></td></tr>`).join('')}</tbody></table></div><p class="s5-small">Blue bars: real parts. Gray bars: imaginary parts. Both bar charts use one scale. Bars show the four real coordinates, not an ellipsoid projection.</p></details>
 <details><summary>Inspect the complete SVD and the chosen phase convention</summary><p>The columns are ordered maximum, then minimum. A star in a matrix name marks the selected point; the raised ${m(tex`{}^\ast`)} means conjugate transpose. ${m(tex`U_\ast`)} is the left singular-vector matrix; plain ${m(tex`U`)} is still the spectral disk.</p>
 ${eq(tex`V_\ast\approx${matrix(V,8)}`)}${eq(tex`\Sigma_\ast=\operatorname{diag}(\sigma_{\max},a_\ast)`)}${eq(tex`U_\ast\approx${matrix(U,8)}`)}
 ${eq(tex`u_j=\frac{F_\ast^\circ v_j}{\sigma_j},\qquad U_\ast^\ast U_\ast=V_\ast^\ast V_\ast=I_2`)}
 <p>Choose the first component of ${m(tex`v_{\min}`)} positive and real. The same phase convention then determines ${m(tex`u_{\min}`)}. Changing the phase of a singular pair together leaves the SVD identity unchanged.</p>
 ${eq(tex`v_{\min}\approx${vector(VMIN,15)}`)}${eq(tex`u_{\min}\approx${vector(UMIN,15)}`)}
 <p class="s5-small">Displayed vectors and matrix products use floating-point arithmetic. Their small numerical residuals are consistency checks, not rigorous certificates.</p><code data-diagnostic></code></details>
 </section>
 <section class="s5-card" id="s5-part-4"><h2><span>5</span> Separate the actual inradius from the guarantee</h2>
 <div class="s5-actions"><button data-shortest>Place output at the inradius</button><button data-longest>Place output at the circumradius</button><button data-ball-toggle aria-pressed="true">Hide certified inner ball</button><button data-axis-toggle aria-pressed="true">Hide singular radii</button></div>
 <div class="s5-pair"><div><h3>Complete forward image section</h3>${geometry('full',SIGMA_MAX,A_STAR,{ball:A_CIRCLE,range:SIGMA_MAX*1.23,labels:['uₘₐₓ','uₘᵢₙ']})}<p>The solid ellipse is the section of ${m(tex`F_\ast^\circ\mathbb B`)}. Red is an output on its boundary for a unit input.</p><div class="s5-readout"><span>Selected output length</span><output data-norm="full"></output></div></div><div><h3>Magnified centre · separate close-up</h3>${geometry('close',SIGMA_MAX,A_STAR,{ball:A_CIRCLE,range:.064,labels:['uₘₐₓ','uₘᵢₙ'],clip:true})}<p>The ellipse continues beyond this inset. The complete ellipse is shown alongside. At the shortest direction, its boundary sits beyond the smaller violet circle.</p><p data-close-status class="s5-small"></p></div></div>
 <div class="s5-radius-key"><div><i class="s5-dot min"></i><b>Actual inradius at this point</b>${m(tex`a_\ast\approx0.0433674471266311`)}<span>Touches the ellipse at the shortest outputs.</span></div><div><i class="s5-dot max"></i><b>Actual circumradius at this point</b>${m(tex`\sigma_{\max}\approx0.632679630173651`)}<span>Reaches the longest outputs.</span></div><div><i class="s5-dot certified"></i><b>Certified common inner radius</b>${m(tex`a_\circ=0.03921135`)}<span>Valid for every contour point. Need not touch.</span></div></div>
 ${eq(tex`\overline B_{\mathbb C^2}(0,a_\circ)\subseteq\overline B_{\mathbb C^2}(0,a_\ast)\subseteq F_\ast^\circ\mathbb B`)}
 <p>${m(tex`\mathbb B=\{v\in\mathbb C^2:\|v\|_2\le1\}`)} is the closed unit ball. At the selected point, ${m(tex`a_\ast-a_\circ\approx0.0041560971266311`)} is a difference between two radii, not a matrix perturbation allowance.</p></section>
 <section class="s5-card" id="s5-part-5"><h2><span>6</span> Close the opening squeeze</h2>
 <p>The Schur route already protects the left side. Evaluating the same midpoint matrix at this one contour point supplies the right side.</p>
 ${eq(tex`\boxed{a_\circ\le s_\Gamma(A_2^\circ)\le a_\ast}`)}
 <div class="s5-squeeze"><div class="s5-squeeze-line"><span class="s5-left-end"></span><span class="s5-possible">Actual contour minimum lies somewhere in this interval</span><span class="s5-right-end"></span></div><div class="s5-end-labels"><span>${m(tex`a_\circ=0.03921135`)}<small>Uniform lower bound</small></span><span>${m(tex`a_\ast\approx0.0433674471266311`)}<small>Selected-point upper bound</small></span></div></div>
 <div class="s5-actions"><button data-squeeze="uniform" aria-pressed="true">Why the left bound?</button><button data-squeeze="point" aria-pressed="false">Why the right bound?</button><button data-squeeze="interval" aria-pressed="false">What the interval certifies</button></div><div data-squeeze-detail class="s5-factor-note"></div>
 <div class="s5-note"><b>One point, one diagnostic.</b> We do not assert that ${m(tex`z_\ast`)} is the exact global minimizer. The lower endpoint in the interval for ${m(tex`a_\ast`)} is not a lower bound for ${m(tex`s_\Gamma(A_2^\circ)`)}.</div>
 <p class="s5-evidence">Certificate inputs: ${m(tex`a_\circ=0.03921135`)} from the Schur route and the supplied strict interval ${m(tex`0.04336744712663<a_\ast<0.04336744712664`)}. Numerical animation illustrates the SVD; it does not perform interval certification.</p>
 </section></div>`;
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const factorNotes=[`<b>Express the input in its right singular-vector basis.</b> ${m(tex`\xi=V_\ast^\ast v`)} records the two coefficients. Because ${m(tex`V_\ast`)} is unitary, ${m(tex`\|\xi\|_2=\|v\|_2=1`)}. The physical complex components change, but the unit circle stays a circle.`, `<b>This is the only factor that changes lengths.</b> ${m(tex`\omega=(\sigma_{\max}\cos\varphi,\ a_\ast\sin\varphi)^T`)}. One axis stretches by ${m(tex`\sigma_{\max}`)}, the other by ${m(tex`a_\ast`)}. The circle becomes an ellipse.`, `<b>Reconstruct the output in the original vector space.</b> ${m(tex`y=U_\ast\omega=\sigma_{\max}\cos\varphi\,u_{\max}+a_\ast\sin\varphi\,u_{\min}`)}. The unitary factor preserves its length. The output chart uses the left singular-vector frame, so its ellipse has the same semiaxes.`];
 const squeezeNotes={uniform:`<b>Every contour point and every unit input.</b> Step 4 established ${m(tex`\|(zI_2-A_2^\circ)v\|_2\ge a_\circ`)} for all ${m(tex`z\in\Gamma`)} and ${m(tex`\|v\|_2=1`)}. Taking both minima retains the lower bound. <a href="#step-04">Return to Gate 1 →</a>`,point:`<b>A minimum cannot exceed one of the values being minimized.</b> ${m(tex`z_\ast\in\Gamma`)} is admissible, so ${m(tex`\min_{z\in\Gamma}\sigma_{\min}(zI_2-A_2^\circ)\le\sigma_{\min}(F_\ast^\circ)=a_\ast`)}. A near-minimizer is useful, but no optimization claim is needed.`,interval:`<b>The supplied interval concerns this one singular value.</b> ${eq(tex`0.04336744712663<a_\ast<0.04336744712664`)} It certifies the selected-point number. Together with the Schur certificate, it gives ${m(tex`0.03921135\le s_\Gamma(A_2^\circ)<0.04336744712664`)}. The interval is an input to this illustration.`};
 function factor(k){activeFactor=k;q('[data-factor-note]').innerHTML=factorNotes[k];qa('[data-factor]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.factor===k)));qa('[data-stage]').forEach((a,i)=>a.classList.toggle('is-active',i===k||i===k+1));}
 function selectEntry(k){entry=k;const i=Math.floor(k/2),j=k%2;q('[data-entry-plot]').innerHTML=entryPlot(k);q('[data-entry-rule]').innerHTML=eq(tex`(F_\ast^\circ)_{${i+1}${j+1}}=${i===j?tex`z_\ast`:'0'}-(A_2^\circ)_{${i+1}${j+1}}\approx${complex(F[i][j],9)}`);qa('[data-entry]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.entry===k)));}
 function draw(){
  const d=direction(phi),p=phi*Math.PI/180;
  qa('[data-direction]').forEach(el=>el.value=phi);qa('[data-phi]').forEach(el=>el.textContent=n(phi,1)+'°');
  qa('[data-plane]').forEach(svg=>{const k=+svg.dataset.k,a=+svg.dataset.a,b=+svg.dataset.b,x=150+k*a*Math.cos(p),y=140-k*b*Math.sin(p);svg.querySelector('[data-marker]').setAttribute('cx',x);svg.querySelector('[data-marker]').setAttribute('cy',y);const line=svg.querySelector('[data-vector]');line.setAttribute('x2',x);line.setAttribute('y2',y);});
  qa('[data-norm]').forEach(el=>el.textContent=el.dataset.norm==='input'||el.dataset.norm==='coordinates'?'1.000000000':n(d.length,9));
  qa('[data-component]').forEach(el=>{const [id,k]=el.dataset.component.split('-'),v=d[id][+k];el.textContent=`${n(v.re,8)} / ${n(v.im,8)}`;});
  ['input','output'].forEach(id=>{const values=d[id].flatMap(v=>[v.re,v.im]);values.forEach((v,i)=>{const bar=q(`[data-bar="${id}-${i}"]`);bar.setAttribute('x',v<0?170+v*125:170);bar.setAttribute('width',Math.abs(v)*125);});});
  const h=squared?SIGMA_MAX**2:SIGMA_MAX,val=squared?d.squared:d.length;
  const marker=q('[data-ray-marker]');marker.setAttribute('cx',45+phi);marker.setAttribute('cy',180-val/h*135);
  q('[data-curve-value]').textContent=n(val,12);q('[data-curve-caption]').textContent=squared?'Squared output length':'Output length';
  qa('[data-sweep]').forEach(b=>{b.textContent=playing?'Ⅱ Pause sweep':'▶ Sweep unit directions';b.setAttribute('aria-pressed',String(playing));});
  q('[data-close-status]').textContent=Math.abs(SIGMA_MAX*Math.cos(p))>.071?'The selected red output is beyond this close-up; find it on the complete ellipse.':'The selected output is visible in this close-up.';
  qa('[data-shortest]').forEach(b=>b.setAttribute('aria-pressed',String(Math.abs(phi-90)<.05)));
  qa('[data-longest]').forEach(b=>b.setAttribute('aria-pressed',String(Math.abs(phi)<.05)));
 }
 function setCurve(value){squared=value==='squared';const hi=squared?SIGMA_MAX**2:SIGMA_MAX;const points=Array.from({length:181},(_,i)=>`${45+i*2},${180-(squared?direction(i*2).squared:direction(i*2).length)/hi*135}`).join(' ');q('[data-ray-path]').setAttribute('points',points);const floor=180-(squared?A_STAR**2:A_STAR)/hi*135;q('[data-curve-floor]').setAttribute('y1',floor);q('[data-curve-floor]').setAttribute('y2',floor);qa('[data-curve]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.curve===value)));q('[data-rayleigh]').setAttribute('aria-label',(squared?'Squared output length':'Output length')+' at the selected contour point as input direction varies');draw();}
 function stop(){playing=false;cancelAnimationFrame(raf);last=0;}
 function frame(time){if(!playing)return;if(document.hidden||!root.getClientRects().length){stop();draw();return;}if(!last)last=time;if(time-last>65){phi=(phi+(time-last)*.028)%360;last=time;draw();}raf=requestAnimationFrame(frame);}
 root.addEventListener('input',e=>{if(e.target.hasAttribute('data-direction')){stop();phi=+e.target.value;draw();}},{signal});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-jump'))q(`#s5-part-${b.dataset.jump}`).scrollIntoView({behavior:'smooth',block:'start'});
  if(b.hasAttribute('data-entry'))selectEntry(+b.dataset.entry);
  if(b.hasAttribute('data-factor'))factor(+b.dataset.factor);
  if(b.hasAttribute('data-shortest')){stop();phi=90;}
  if(b.hasAttribute('data-longest')){stop();phi=0;}
  if(b.hasAttribute('data-sweep')){const was=playing;stop();if(!was){playing=true;raf=requestAnimationFrame(frame);}}
  if(b.hasAttribute('data-reset')){stop();phi=90;selectEntry(0);factor(0);setCurve('squared');qa('[data-ball],[data-axes],[data-angle-arc]').forEach(el=>el.style.display='');[['[data-ball-toggle]','Hide certified inner ball'],['[data-axis-toggle]','Hide singular radii'],['[data-angle]','Hide angle arc']].forEach(([sel,label])=>{q(sel).setAttribute('aria-pressed','true');q(sel).textContent=label;});}
  if(b.hasAttribute('data-curve'))setCurve(b.dataset.curve);
  if(b.hasAttribute('data-angle')){const show=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(show));b.textContent=show?'Hide angle arc':'Show angle arc';q('[data-angle-arc]').style.display=show?'':'none';}
  for(const [attr,selector,text] of [['data-ball-toggle','[data-ball]','certified inner ball'],['data-axis-toggle','[data-axes]','singular radii']])if(b.hasAttribute(attr)){const show=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(show));b.textContent=(show?'Hide ':'Show ')+text;qa(selector).forEach(el=>el.style.display=show?'':'none');}
  if(b.hasAttribute('data-squeeze')){q('[data-squeeze-detail]').innerHTML=squeezeNotes[b.dataset.squeeze];qa('[data-squeeze]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));}
  draw();
 },{signal});
 function pointer(e){if(!drag)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(drag.getScreenCTM().inverse());if(drag.hasAttribute('data-rayleigh'))phi=Math.max(0,Math.min(360,p.x-45));else{const a=+drag.dataset.a,b=+drag.dataset.b;phi=(Math.atan2((140-p.y)/b,(p.x-150)/a)*180/Math.PI+360)%360;}draw();}
 root.addEventListener('pointerdown',e=>{const svg=e.target.closest('[data-plane],[data-rayleigh]');if(!svg||e.button!==0)return;e.preventDefault();stop();drag=svg;svg.setPointerCapture(e.pointerId);pointer(e);},{signal});
 window.addEventListener('pointermove',pointer,{signal});window.addEventListener('pointerup',()=>drag=null,{signal});window.addEventListener('pointercancel',()=>drag=null,{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw();}},{signal});
 const checks=diagnostics();q('[data-diagnostic]').textContent=`Floating-point reconstruction residual: ${checks.factorization.toExponential(2)}. Unit-norm/orthogonality defects: V ${checks.VUnitary.toExponential(2)}, U ${checks.UUnitary.toExponential(2)}.`;
 selectEntry(0);factor(0);q('[data-squeeze-detail]').innerHTML=squeezeNotes.uniform;draw();return()=>{stop();abort.abort();};
}
