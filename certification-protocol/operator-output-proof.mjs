import {math} from './math-render.mjs?v=103';
const tex=String.raw,m=math,eq=s=>`<div class="enc-equation">${m(s)}</div>`;
const C={blue:'#1765bf',blueFill:'none',pink:'#ff1493',pinkFill:'none',gray:'#808080',grayFill:'#e6e6fa',grayOutline:'#808080',grayOutlineFill:'none'};
const text=(x,y,s,color='#4b0082',anchor='middle')=>`<text data-math-label-done="true" x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="system-ui" font-size="15">${s}</text>`;
const circle=(x,y,r,kind='blue',dash=false)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${C[kind+'Fill']}" stroke="${C[kind]}" stroke-width="2"${dash?' stroke-dasharray="4 4"':''}/>`;
const ellipse=(x,y,rx,ry,angle=0)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${angle} ${x} ${y})" fill="${C.blueFill}" stroke="${C.blue}" stroke-width="2"/>`;
const line=(x,y,u,v,color=C.gray,dash=true)=>`<path d="M${x} ${y}L${u} ${v}" fill="none" stroke="${color}" stroke-width="2"${dash?' stroke-dasharray="3 2"':''}/>`;
const dot=(x,y,color=C.gray)=>`<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="white" stroke-width="1.3"/>`;
const arrow=(x,y,u,v,color=C.gray)=>`${line(x,y,u,v,color,false)}<path d="M-6 -4L0 0L-6 4" transform="translate(${u} ${v}) rotate(${Math.atan2(v-y,u-x)*180/Math.PI})" fill="none" stroke="${color}" stroke-width="2"/>`;
const axes=(x,y)=>`<path d="M18 ${y}H382M${x} 220V22" fill="none" stroke="#b7bbc2" stroke-width="1"/>`;
const fig=(title,label,svg,caption)=>`<figure class="res-mini op-line-mini"><h4>${title}</h4><svg viewBox="0 0 400 250" role="img" aria-label="${label}">${svg}</svg><figcaption>${caption}</figcaption></figure>`;
const row=(id,body,visual)=>`<div class="op-proof-line" data-op-proof-line="${id}"><div>${body}</div>${visual}</div>`;
function miniature(kind){
 if(kind==='outputs')return fig('A boundary output moves by −tDx','A unit vector on a blue unit disk maps to a blue ellipse boundary. A red perturbed output lies in the deeppink uncertainty disk around the blue lifted output.',
 `${circle(61,132,33)}${line(61,132,61,99,C.blue)}${dot(61,99,'#1e90ff')}${text(61,190,'unit ball')}${text(43,96,'x')}${arrow(106,132,155,132)}${text(130,112,'zI₃ − B_{lift}')}${ellipse(277,139,92,57)}${circle(277,82,25,'pink')}${dot(277,82,'#1e90ff')}${arrow(277,82,291,96,C.pink)}${dot(291,96,'#d83954')}${text(267,49,'y^{B_{lift}}','#1e90ff')}${text(321,111,'yₜ','#d83954')}${text(335,70,'−tDx',C.pink)}${dot(277,139)}${text(267,157,'0')}${text(277,219,'lifted image ellipsoid',C.blue)}`,
 `<p>The same unit input gives ${m(String.raw`y^{B_{\mathrm{lift}}}`)} and ${m('y_t')}. The displacement ${m('-tDx')} fits within the deeppink radius ${m(tex`t\varepsilon_{2,M}^{\sharp}`)}.</p>`);
 if(kind==='uncertainty'){
 const R=78,r=R*.01/.029445725,rho=R-r,x=185,y=150;
 return fig('Uncertainty cannot reach the origin','A deeppink uncertainty disk is tangent to the gray safety disk in the limiting certificate configuration. A red output is inside the uncertainty disk.',
 `${axes(x,y)}${ellipse(x,y,164,R)}${circle(x,y,rho,'gray',true)}${circle(x,y-R,r,'pink')}${line(x,y,x,y-rho)}${line(x,y-R,x+r/Math.SQRT2,y-R-r/Math.SQRT2,C.pink)}${dot(x,y)}${dot(x,y-R,'#1e90ff')}${dot(x+10,y-R+12,'#d83954')}${text(x-14,y+20,'0')}${text(243,62,'tε♯',C.pink)}${text(224,100,'yₜ','#d83954')}${text(210,45,'y^{B_{lift}}','#1e90ff')}${text(139,139,'ρ(t)',C.gray)}${text(200,244,'ρ(t) = 0.029445725 − 0.01t',C.gray)}`,
 `<p>Limiting comparison at ${m('t=1')}: the centre is drawn at the certified minimum distance. Other allowed centres may lie farther from zero.</p>`);
 }
 if(kind==='inclusion')return fig('The gray ball is inside the filled image','A gray dashed safety disk sits entirely inside a larger blue filled image ellipse, illustrating the ball inclusion.',
 `${axes(200,125)}${ellipse(200,125,166,78)}${circle(200,125,51,'gray',true)}${line(200,125,149,125)}${dot(200,125)}${text(216,145,'0')}${text(164,116,'ρ(t)',C.gray)}${text(200,28,'Fθ,t B_{lift}̅₂(0, 1)',C.blue)}${text(200,228,'B_{lift}̅₂(0, ρ(t))  ⊆  filled image',C.gray)}`,
 `<p>The blue region is the <b>filled image</b>, including zero. Its boundary stays outside the gray ball. Schematic section with ${m(tex`\rho(t)=0.029445725-0.01t`)}.</p>`);
 if(kind==='uniform')return fig('One safety ball for the whole contour','Several illustrative blue endpoint ellipses share the same gray protected ball. The certificate holds for every contour point, not just illustrated ones.',
 `${ellipse(200,119,161,70,-9)}${ellipse(200,119,149,77,10)}${ellipse(200,119,161,86)}${circle(200,119,44,'gray',true)}${line(200,119,156,119)}${dot(200,119)}${text(214,139,'0')}${text(200,20,'t = 1 · every z ∈ Γ',C.blue)}${text(200,228,'guaranteed radius ≥ 0.019445725',C.gray)}`,
 `<p>The gray radius is a uniform lower bound. The ellipse family is illustrative; the actual contour minimum is not established.</p>`);
 if(kind==='inverse')return fig('Inverse image inside an enclosing ball','A blue unit disk maps under the inverse to an illustrative blue ellipse inside a gray enclosing ball with radius the reciprocal certificate.',
 `${circle(52,125,30)}${text(52,178,'unit ball')}${arrow(93,125,139,125)}${text(116,102,'(zI_3-B_{lift})^{-1}')}${circle(266,125,83,'grayOutline',true)}${ellipse(266,125,64,34,-20)}${line(266,125,349,125)}${dot(266,125)}${text(266,25,'radius ≤ 33.960787…',C.gray)}`,
 `${m(tex`(zI_3-B_{\mathrm{lift}})^{-1}\overline B_2(0,1)\subseteq\overline B_2(0,\overline{\mathfrak m}_{\Gamma,2}^{H})`)}<p>The gray enclosing radius is an upper bound on inverse stretching.</p>`);
 if(kind==='composition')return fig('Ball → lifted ellipsoid → perturbed ellipsoid','Three filled shapes in sequence illustrate the unit ball acted on first by zI minus B_{lift}, then by I minus t D R B_{lift}. The final image contains a gray safety ball.',
 `${circle(47,129,30)}${ellipse(195,129,52,55)}${ellipse(341,129,45,37,-15)}${circle(341,129,21,'gray',true)}${arrow(86,129,131,129)}${arrow(255,129,284,129)}${text(106,77,'zI₃ − B_{lift}',C.blue)}${text(270,77,'Qₜ',C.blue)}${text(47,198,'unit ball')}${text(195,211,'lifted image',C.blue)}${text(337,191,'final image',C.blue)}${text(200,26,'Qₜ = I₃ − tD(zI_3-B_{lift})^{-1}')}`,
 `<p>Read left to right: first ${m(String.raw`zI_3-B_{\mathrm{lift}}`)}, then ${m(tex`I_3-tD(zI_3-B_{\mathrm{lift}})^{-1}`)}. The product acts on the whole unit ball.</p>`);
 if(kind==='contraction'){
 const q=.01/.029445725,R=76,r=R*q,rho=R-r;
 return fig('A perturbation smaller than the unit radius','At the maximum allowed gain, a deeppink perturbation disk around a unit vector remains separated from zero by a gray disk of radius one minus q.',
 `${axes(164,145)}${circle(164,145,R,'blue',true)}${circle(164,145,rho,'gray',true)}${circle(164,145-R,r,'pink')}${line(164,145,164-rho,145)}${line(164,145-R,164+r,145-R,C.pink)}${dot(164,145)}${dot(164,145-R,'#1e90ff')}${dot(169,145-R+12,'#d83954')}${text(212,50,'unit y','#1e90ff')}${text(280,82,'q(t) < 1',C.pink)}${text(262,161,'1 − q(t) > 0',C.gray)}${text(200,242,'normalized radius · shown at t = 1')}`,
 `${m(tex`\overline B_2(0,1-q(t))\subseteq Q_t\overline B_2(0,1)`)}<p>${m(tex`q(t)=t\varepsilon_{2,M}^{\sharp}\overline{\mathfrak m}_{\Gamma,2}^{H}<1`)}. Every unit-output uncertainty ball avoids zero.</p>`);
 }
 return fig('Positive inballs prevent contour crossings','A contour containing one eigenvalue is shown beside an illustrative family of blue image ellipses sharing a gray positive-radius ball. No eigenvalue crosses the contour during the homotopy.',
 `<circle cx="68" cy="119" r="43" fill="none" stroke="#4b0082" stroke-width="2"/><path d="M53 130Q70 111 81 116" fill="none" stroke="#d83954" stroke-width="2"/><circle cx="53" cy="130" r="4" fill="white" stroke="#d83954" stroke-width="1.5"/>${dot(81,116,'#d83954')}${text(44,154,'t = 0')}${text(82,98,'t = 1')}${text(104,76,'Γ')}${text(68,197,'count = 1')}${arrow(127,119,169,119)}${ellipse(283,119,95,71)}${ellipse(283,119,86,61,13)}${circle(283,119,39,'gray',true)}${line(283,119,244,119)}${dot(283,119)}${text(283,215,'ρ(t) > 0',C.gray)}${text(200,27,'every z ∈ Γ · every 0 ≤ t ≤ 1')}`,
 `<p>The positive ball persists throughout the homotopy. Together with the initial rank one, contour invertibility preserves that count. The two markers show one eigenvalue at two times. Its motion is schematic.</p>`);
}
export function outputBallProof(){return `<section class="op-proof-lines"><h3>The same conclusion through output balls</h3><p class="op-proof-note">These schematic real sections illustrate the full-space ball statements and inclusions. The ellipse shapes are not computed singular values.</p>
${row('outputs',eq(tex`F_{\theta,t}:=z(\theta)I_3-(B_{\mathrm{lift}}+tD),\quad y^{B_{\mathrm{lift}}}=(zI_3-B_{\mathrm{lift}})x,\quad y_t=y^{B_{\mathrm{lift}}}-tDx,\quad\|x\|_2=1`),miniature('outputs'))}
${row('uncertainty',eq(tex`y_t\in\overline B_2(y^{B_{\mathrm{lift}}},t\varepsilon_{2,M}^{\sharp}),\qquad\|y_t\|_2\ge\|y^{B_{\mathrm{lift}}}\|_2-t\varepsilon_{2,M}^{\sharp}\ge0.029445725-0.01t`),miniature('uncertainty'))}
${row('inclusion',`<p>For every contour point and every unit input, the boundary output stays away from zero. The solid image ellipsoid contains the origin and the guaranteed inner ball:</p>${eq(tex`\overline B_2(0,0.029445725-0.01t)\subseteq F_{\theta,t}\overline B_2(0,1),\quad 0\le t\le1,\quad z(\theta)\in\Gamma`)}`,miniature('inclusion'))}
${row('uniform',eq(tex`s_\Gamma(\mathcal L_{\mathrm{toy}})\ge0.019445725`),miniature('uniform'))}</section>`;}
export function factorizationProof(){return `<section class="op-proof-lines"><h3>The factorization preserves the order</h3>
${row('inverse',`<p>Writing ${m(tex`(zI_3-B_{\mathrm{lift}})^{-1}=(zI_3-B_{\mathrm{lift}})^{-1}`)}, the lifted resolvent maps a unit ball into the uniform enclosing ball.</p>`,miniature('inverse'))}
${row('composition',eq(tex`zI_3-(B_{\mathrm{lift}}+tD)=(I_3-tD(zI_3-B_{\mathrm{lift}})^{-1})(zI_3-B_{\mathrm{lift}})`),miniature('composition'))}
${row('contraction',eq(tex`\|tD(zI_3-B_{\mathrm{lift}})^{-1}\|_2\le t\varepsilon_{2,M}^{\sharp}\overline{\mathfrak m}_{\Gamma,2}^{H}<1`),miniature('contraction'))}
${row('rank',`<p>The Neumann series makes the first factor invertible for every contour point and every homotopy parameter. There is no contour crossing, so the Riesz projection has constant rank:</p>${eq(tex`\operatorname{rank}\Pi_\Gamma(\mathcal L_{\mathrm{toy}})=\operatorname{rank}\Pi_\Gamma(B_{\mathrm{lift}})=1`)}`,miniature('rank'))}
<p>The endpoint is an abstract exact toy operator. No specified dynamical map or Perron–Frobenius identification is asserted.</p></section>`;}
