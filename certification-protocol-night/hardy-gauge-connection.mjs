import {math} from './math-render.mjs?v=103';
const tex=String.raw,m=math,eq=s=>`<div class="enc-equation">${m(s)}</div>`;
const gauges=[
 {name:'Ordinary Legendre',coordinate:'c',matrix:tex`\widehat L_N^{(M)}`,map:tex`v=S_Nc`,role:'Raw spectral plots',note:'The coefficient vector is c. Its Euclidean norm is not, in general, the Hardy norm of the polynomial.'},
 {name:'Scaled Legendre',coordinate:'y',matrix:tex`\widehat L_{N,M}^{(r)}=\mathsf D_{r,N}\widehat L_N^{(M)}\mathsf D_{r,N}^{-1}`,map:tex`y=\mathsf D_{r,N}c`,role:'Pure-r collocation bound',note:'Diagonal scaling changes the coordinate gauge. This is the intermediate representation used for the pure-r collocation estimate.'},
 {name:'Hardy-orthonormal packet',coordinate:'d',matrix:tex`A_{N,M}^{X}=\mathsf T_N(r)\widehat L_{N,M}^{(r)}\mathsf T_N(r)^{-1}`,map:tex`d=\mathsf T_N(r)y,\qquad\|S_Nc\|_X=\|d\|_2`,role:'Finite Hardy singular values and resolvent bounds',note:'Here the Euclidean norm of d equals the X norm of the trial polynomial. This is why the theorem-facing finite moat belongs to this matrix.'}
];
export function hardyGaugeCard(){return `<section class="enc-card hardy-gauge-card" data-hardy-gauge>
 <div class="enc-heading"><h2>Where the mathematical Hardy matrix comes from</h2><span class="enc-chip">Thesis connection</span></div>
 <p>In the thesis, a single collocated trial-space operator has three coordinate representations. Select a gauge to see the vector it acts on.</p>
 <div class="hardy-gauge-tabs" role="tablist" aria-label="Three coordinate gauges">${gauges.map((g,i)=>`<button role="tab" id="hardy-gauge-tab-${i}" aria-controls="hardy-gauge-panel-${i}" aria-selected="${i===2}" tabindex="${i===2?0:-1}" data-gauge="${i}"><b>${i+1}. ${g.name}</b><span>acts on ${m(g.coordinate)}</span></button>`).join('')}</div>
 ${gauges.map((g,i)=>`<div class="hardy-gauge-panel" role="tabpanel" id="hardy-gauge-panel-${i}" aria-labelledby="hardy-gauge-tab-${i}" ${i===2?'':'hidden'}>${eq(g.map)}${eq(g.matrix)}<p><strong>${g.role}.</strong> ${g.note}</p></div>`).join('')}
 <p><strong>Same eigenvalues; different norm geometry.</strong> Similarity preserves the spectrum, but does not generally preserve Euclidean singular values or resolvent norms.</p>
 <details><summary>The defining Hardy-gauge conjugation</summary>
 ${eq(tex`\mathsf A_N^X(B):=\mathsf T_N(r)\mathsf D_{r,N}B\mathsf D_{r,N}^{-1}\mathsf T_N(r)^{-1}`)}
 ${eq(tex`A_{N,M}^{X}:=\mathsf A_N^X(\widehat L_N^{(M)})`)}
 <p>Here ${m(tex`B\in\mathbb C^{N\times N}`)} is the argument of the coordinate map. It is unrelated to the lifted operator ${m(tex`B_{\mathrm{lift}}`)} in Step 10.</p>
 <p>${m(tex`A_{N,M}^{X}`)} is the exact mathematical matrix. It is not its interval enclosure and is not, by definition, the chosen exact-dyadic reference.</p>
 </details>
 <h3>How that definition connects to this toy</h3>
 ${eq(tex`A_{2,M}^{X}=A_2^\circ+E=\frac1{1024}\begin{pmatrix}509+260i&380-125i\\61+124i&252-61i\end{pmatrix}`)}
 <p>This explicit matrix <strong>plays the role of the Hardy-coordinate block</strong>, with Euclidean coordinates. No map, collocation data, or numerical ${m(tex`\mathsf D_{r,N},\mathsf T_N(r)`)} is supplied here, so this toy is not claimed to have been computed by that thesis conjugation. Its entries happen to be dyadic.</p>
 <div class="hardy-objects"><div><i class="hardy-dot midpoint"></i><strong>Reference ${m(tex`A_2^\circ`)}</strong><span>Fixed exact-dyadic midpoint; the matrix-space origin.</span></div><div><i class="hardy-dot chosen"></i><strong>Mathematical ${m(tex`A_{2,M}^{X}`)}</strong><span>Original fixed toy matrix; grey reference marker at its chosen corner.</span></div><div><i class="hardy-dot enclosure"></i><strong>Enclosure ${m(tex`\mathcal A`)}</strong><span>All exact matrices admitted by the entry rectangles.</span></div><div><i class="hardy-dot probe"></i><strong>Selected ${m(tex`\widetilde A_{2,M}^{X}`)}</strong><span>Coral matrix target with its full displacement arrow; the four entry vectors update together.</span></div></div>
 ${eq(tex`u=x/n,\quad v=y/n,\quad C=A_2^\circ+(u+iv)E,\quad \left.C\right|_{(u,v)=(1,0)}=A_{2,M}^{X}`)}
 <p class="enc-note">The slider variables ${m('u,v')} are matrix-error coordinates. They are different from the polynomial ${m('v=S_Nc')} and the Hardy input coordinates ${m('d')} above. Section sliders vary the selected displacement within the displayed affine space. Entry sliders vary all eight real coordinates of the matrix enclosure. The original toy matrix remains a reset reference.</p>
 <details><summary>Metric transport, collocation error and the exact lift</summary>
 ${eq(tex`\beta_{N,M}^{X,\mathrm{col}}=\|\mathsf T_N(r)\mathsf E_{N,M}^{(r)}\mathsf T_N(r)^{-1}\|_2\le\kappa_N^{X\leftrightarrow r}\|\mathsf E_{N,M}^{(r)}\|_2`)}
 ${eq(tex`\beta_{N,M}^{X,\mathrm{col}}\le\widehat\kappa_N^{X\leftrightarrow r}\widehat B_{N,M}^{\mathrm{mat,best}}`)}
 <p>The condition factor ${m(tex`\kappa_N^{X\leftrightarrow r}`)} measures worst-case metric transport. It is not an additional approximation error. The mixed leakage ${m(tex`\beta_N^{X,\mathrm{mix}}`)} is already measured in ${m(tex`X=H^2(E_r)`)} and receives no such factor. These analytical contributions are distinct from the finite entry-replacement allowance ${m(tex`\eta_A`)} illustrated here.</p>
 <p>The full orthogonal decomposition gives a unitary identification of the finite lift with ${m(tex`A_{N,M}^{X}\oplus0_{V_N^{\perp_X}}`)}. The complement supplies ${m(tex`|z|^{-1}`)} in the resolvent, so both the Hardy moat and the distance of the contour from zero matter:</p>
 ${eq(tex`\|(zI-\mathrm{lift})^{-1}\|=\max\{\|(zI-A_{N,M}^{X})^{-1}\|_2,|z|^{-1}\}`)}
 ${eq(tex`M_\Gamma(\mathrm{lift})\le\frac1{\min\{\underline s_{\Gamma,N}^{\mathrm H},d_{\Gamma,0}\}}`)}
 <p>Steps 10 and 11 illustrate this exact lift and the separate operator gate. The two finite replacement losses are not counted again as the operator-error allowance.</p>
 </details>
 <details><summary>Thesis source locators</summary><p>Definition “Hardy-gauge collocated block”, <code>legEDMD:def-Hardy-gauge-collocated-block-dist</code>, in <code>single_space_legendre_edmd_dist.tex</code>. Subsection “Three coordinate gauges”, <code>subsec:numerics-three-gauges-dist</code>, in <code>numerical_certification_transfer_dist.tex</code>.</p></details>
 </section>`;}
export function mountHardyGauge(root){
 const abort=new AbortController(),tabs=[...root.querySelectorAll('[data-gauge]')];
 function select(i,focus=false){tabs.forEach((b,k)=>{b.setAttribute('aria-selected',String(i===k));b.tabIndex=i===k?0:-1;root.querySelector(`#hardy-gauge-panel-${k}`).hidden=i!==k;});if(focus)tabs[i].focus();}
 root.addEventListener('click',e=>{const b=e.target.closest('[data-gauge]');if(b)select(+b.dataset.gauge);},{signal:abort.signal});
 root.addEventListener('keydown',e=>{const b=e.target.closest('[data-gauge]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();select(e.key==='Home'?0:e.key==='End'?2:(+b.dataset.gauge+(e.key==='ArrowRight'?1:2))%3,true);},{signal:abort.signal});
 return()=>abort.abort();
}
