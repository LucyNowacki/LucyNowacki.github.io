import {math} from './math-render.mjs?v=103';
import {VALUES} from './certificate-values.mjs?v=103';
const tex=String.raw,m=x=>math(x),eq=x=>`<div class="enc-equation">${m(x)}</div>`;
export function stepEightOptionalUpperBound(){return `<section class="enc-card g2-purpose" aria-label="Optional upper bound from a selected-point SVD">
 <div class="enc-heading"><h2>Optional upper bound · the selected-point SVD</h2><span class="enc-chip">Optional diagnostic · Gate 2 still uses the Schur lower certificate</span></div>
 <p>The selected-point singular value ${m(tex`a_\ast`)} supplies an <strong>optional upper bound</strong> on the midpoint whole-contour moat ${m(tex`s_\Gamma(A_2^\circ)`)}. This restores the two-minimisation explanation: SVD solves the unit-input problem at fixed ${m('z')}, and the outer minimum ranges over the contour. The Geometry and Argument tabs use only the <strong>uniform lower certificate inherited from the Schur argument</strong> for Gate 2.</p>
 <div class="g2-flow-route" aria-label="Logical order"><span>1 · Fix ${m('z')}, minimise over ${m('v')} <b>using SVD</b></span><b aria-hidden="true">→</b><span>2 · Minimise over ${m(tex`z\in\Gamma`)}, obtain the moat</span><b aria-hidden="true">→</b><span>3 · Carry its certified lower bound along ${m('t')}</span></div>
 <div class="g2-purpose-stages">
 <article><h3>1 · Fixed contour point: SVD finds the shortest output</h3>
 <p>Fix ${m(tex`z\in\Gamma`)} and form the shifted midpoint matrix ${m(tex`F^\circ(z)=zI_2-A_2^\circ`)}. Its singular value decomposition is</p>
 ${eq(tex`F^\circ(z)=U(z)\Sigma(z)V(z)^*`)}
 <p><strong>How the SVD is used:</strong> ${m(tex`V(z)^*`)} expresses a unit input in right-singular-vector coordinates, ${m(tex`\Sigma(z)=\operatorname{diag}(\sigma_{\max},\sigma_{\min})`)} stretches those coordinates, and ${m(tex`U(z)`)} places the output in its left-singular-vector frame. The two unitary maps preserve length.</p>
 ${eq(tex`\min_{\|v\|_2=1}\|F^\circ(z)v\|_2=\sigma_{\min}(F^\circ(z))`)}
 ${eq(tex`F^\circ(z)v_{\min}(z)=\sigma_{\min}(F^\circ(z))u_{\min}(z)`)}
 <p>The right singular vector ${m(tex`v_{\min}(z)`)} attains the minimum. The closest <strong>boundary</strong> output is on a shortest semiaxis of the output ellipsoid ${m(tex`F^\circ(z)\overline B_2(0,1)`)}. Its filled interior contains zero.</p>
 <details><summary>Why this minimises over all complex unit inputs</summary><p>Write ${m(tex`w=V(z)^*v=(w_1,w_2)`)}. Unitarity gives ${m(tex`|w_1|^2+|w_2|^2=1`)} and</p>
 ${eq(tex`\|F^\circ(z)v\|_2^2=\sigma_{\max}^2|w_1|^2+\sigma_{\min}^2|w_2|^2\ge\sigma_{\min}^2`)}
 <p>Equality holds at ${m(tex`w=(0,1)`)}. The input slider draws the real circle ${m(tex`v(\varphi)=\cos\varphi\,v_{\max}+\sin\varphi\,v_{\min}`)}, which includes this global minimiser at ${m(tex`\varphi=90^\circ`)}. It is a section of the complex unit sphere. The output ellipse is the matching real section of the full ellipsoid in ${m(tex`\mathbb C^2\cong\mathbb R^4`)}.</p></details>
 </article>
 <article><h3>2 · Whole contour: minimise the pointwise SVD value</h3>
 <p>Now vary ${m(tex`z\in\Gamma`)}. At each new point, the shifted matrix ${m(tex`F^\circ(z)`)} and its SVD change. The outer minimum defines the actual whole-contour moat:</p>
 ${eq(tex`s_\Gamma(A_2^\circ)=\min_{z\in\Gamma}\sigma_{\min}(F^\circ(z))`)}
 <p><strong>The exact contour minimum is not established here.</strong> The contour slider explores pointwise SVD values. Sampling them does not certify the outer minimum.</p>
 ${eq(tex`\underbrace{a_\circ}_{\text{uniform certificate}}\le s_\Gamma(A_2^\circ)\le\underbrace{a_\ast}_{\text{one-point SVD}}`)}
 <p>The preceding certified Schur route and Gate 1 provide ${m(tex`a_\circ=\underline s_\Gamma^\circ=${VALUES.midpoint}`)} everywhere on ${m(tex`\Gamma`)}. SVD at the diagnostic point ${m(tex`z_\ast`)} supplies the upper side:</p>
 ${eq(tex`a_\ast=\sigma_{\min}(F^\circ(z_\ast))\approx${VALUES.aStarApprox}`)}
 <p>For this toy, the supplied validated interval is</p>
 ${eq(tex`${VALUES.aStarLower}<a_\ast<${VALUES.aStarUpper}`)}
 <p>The interval encloses one selected-point singular value. An ordinary floating-point SVD does not itself certify these endpoints, and the interval’s lower endpoint is not a lower bound for the whole contour.</p>
 <p>The outer minimum is no larger than any one pointwise value. <strong>Gate 2 carries forward the certified lower bound ${m(tex`a_\circ`)}.</strong></p>
 </article>
 <article><h3>3 · Homotopy: change the matrix and preserve the bound</h3>
 ${eq(tex`A_t=A_2^\circ+tE,\qquad 0\le t\le1`)}
 <p>The fixed error matrix ${m(tex`E=A_{2,M}^{X}-A_2^\circ`)} obeys ${m(tex`\|E\|_2\le\eta_A=${VALUES.matrixAllowance}<a_\circ`)}. Homotopy changes the matrix from the midpoint ${m(tex`A_0=A_2^\circ`)} to the Hardy matrix ${m(tex`A_1=A_{2,M}^{X}`)}.</p>
 ${eq(tex`y_t=F^\circ(z)v-tEv=y^\circ-tEv`)}
 <p>For every contour point and every unit input, the uncertainty ball about the midpoint output ${m(tex`y^\circ`)} has radius ${m(tex`t\eta_A`)}. The reverse triangle inequality gives</p>
 ${eq(tex`\|(zI_2-A_t)v\|_2\ge a_\circ-t\eta_A`)}
 <p>Taking the same two minima therefore yields</p>
 ${eq(tex`s_\Gamma(A_t)\ge a_\circ-t\eta_A\ge${VALUES.hardy}>0`)}
 <p>At ${m('t=1')}, ${m(tex`\underline s_{\Gamma,2}^{H}=a_\circ-\eta_A=${VALUES.hardy}`)}. No shifted matrix becomes singular on ${m(tex`\Gamma`)} during the transition, so no eigenvalue crosses the contour.</p>
 ${eq(tex`\operatorname{rank}\Pi_\Gamma(A_t)=1\quad(0\le t\le1)`)}
 <p><strong>Homotopy is a parameter, not a third minimisation.</strong> The transfer uses the uniform bound and the error allowance. It does not require recomputing an SVD of every perturbed matrix ${m(tex`zI_2-A_t`)}.</p>
 </article></div>
 <p class="enc-note"><strong>What the optional upper bound adds:</strong> ${m(tex`a_\circ\le s_\Gamma(A_2^\circ)\le a_\ast`)} brackets the unknown midpoint moat. It does not replace ${m(tex`a_\circ`)} in the Gate 2 subtraction. The protected radius remains ${m(tex`a_\circ-t\eta_A`)}.</p>
 <p><a href="#step-05">Step 05 · Explore the selected-point SVD and its singular directions →</a></p>
 </section>`;}
