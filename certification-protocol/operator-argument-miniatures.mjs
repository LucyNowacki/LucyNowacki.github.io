import {math} from './math-render.mjs?v=103';
const tex=String.raw,m=math;
const text=(x,y,label,extra='')=>`<text data-math-label-done="true" x="${x}" y="${y}" ${extra}>${label}</text>`;
const figure=(title,label,svg,caption)=>`<figure class="res-mini"><h4>${title}</h4><svg viewBox="0 0 340 250" role="img" aria-label="${label}">${svg}</svg><figcaption>${caption}</figcaption></figure>`;
export function operatorArgumentMiniature(kind){
 if(kind==='norm')return figure('Three eigen-directions, one norm','Eigenvalues minus 0.01, zero and plus 0.01 on a signed number line. The two extreme eigenvalues have absolute value 0.01.',`
 <rect x="15" y="18" width="310" height="210" rx="8" fill="#f9f6fd" stroke="#dacde6"/><path d="M34 132H308M301 127L308 132L301 137" stroke="#808080" fill="none" stroke-width="2"/><path d="M55 122V142M170 122V142M285 122V142" stroke="#808080"/>
 <path d="M55 161V172H285V161M170 165V180" stroke="#808080" stroke-dasharray="3 2" fill="none"/><circle cx="55" cy="132" r="6" fill="#d83954"/><circle cx="170" cy="132" r="6" fill="#808080"/><circle cx="285" cy="132" r="6" fill="#d83954"/>
 <g font-family="system-ui" font-size="16" fill="#4b0082" text-anchor="middle">${text(55,75,'e₁ − e₃')}${text(170,75,'e₂')}${text(285,75,'e₁ + e₃')}${text(55,111,'−0.01')}${text(170,111,'0')}${text(285,111,'+0.01')}${text(170,205,'largest absolute value: 0.01')}</g>`,`${m(tex`D=D^*,\qquad\|D\|_2=\max|\lambda(D)|=0.01`)}<p>The first and third coordinates couple; ${m('e_2')} is uncoupled. The nonzero directions are normalized by ${m(tex`\sqrt2`)} in the proof.</p>`);
 if(kind==='gain'){
 const gain=400000/1177829,x=25+290*gain;
 return figure('The allowance stays below one','A normalized allowance bar: the certified small-gain upper bound consumes 33.96 percent and stays below the threshold one.',`
 <rect x="25" y="93" width="290" height="48" rx="5" fill="#e6e6fa" stroke="#808080"/><path d="M25 98Q25 93 30 93H${x}V141H30Q25 141 25 136Z" fill="#ff1493"/><path d="M${x} 78V151M315 76V151" stroke="#808080" stroke-width="2"/>
 <g font-family="system-ui" font-size="16" fill="#4b0082">${text(25,173,'0')}${text(315,173,'1','text-anchor="end"')}${text(x,64,'0.339607…','text-anchor="middle"')}${text(170,210,'33.96% of the certified allowance','text-anchor="middle"')}</g>`,`${m(tex`\varepsilon_{2,M}^{\sharp}M_\Gamma(B_{\mathrm{lift}})\le\frac{0.01}{0.029445725}<1`)}<p>Deeppink is the supplied upper bound on the consumed fraction. The actual small-gain product may be smaller.</p>`);
 }
 if(kind==='balls'){
 const R=.029445725,k=116/R,r=.01*k,s=(R-.01)*k,cx=100+116/Math.sqrt(2),cy=150-116/Math.sqrt(2),qx=100+s/Math.sqrt(2),qy=150-s/Math.sqrt(2);
 return figure('A positive safety radius remains','At t equals one, a deeppink uncertainty disk of radius 0.01 stays away from the origin. A gray radius marks the guaranteed safety radius 0.019445725.',`
 <path d="M12 150H326M100 236V12" fill="none" stroke="#b7bbc2"/><circle cx="100" cy="150" r="${s}" fill="#e6e6fa" stroke="#808080" stroke-width="1.8" stroke-dasharray="4 4"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ff1493" stroke-width="2"/>
 <path d="M100 150L${qx} ${qy}" stroke="#808080" stroke-width="3" stroke-dasharray="3 2"/><path d="M${qx} ${qy}L${cx} ${cy}" stroke="#ff1493" stroke-width="2" stroke-dasharray="3 2"/><circle cx="100" cy="150" r="3" fill="#555"/><circle cx="${cx}" cy="${cy}" r="4" fill="#1e90ff"/>
 <g font-family="system-ui" font-size="15" fill="#4b0082">${text(83,168,'0')}${text(221,66,'y^{B_{lift}}','fill="#1e90ff"')}${text(230,96,'radius 0.01','fill="#ff1493"')}${text(170,247,'t = 1 · limiting certificate comparison','text-anchor="middle"')}</g>`,`${m(tex`\|y_t\|_2\ge\underline s_{\Gamma,2}^{\mathrm{lift}}-t\varepsilon_{2,M}^{\sharp}>0`)}<p>Gray safety radius at ${m('t=1')}: <b>0.019445725</b>. The centre is drawn at the limiting certified distance; actual lifted outputs may lie farther away.</p>`);
 }
 return figure('Apply the right-hand factor first','Composition in order: first zI minus B_{lift} acts on x, then I minus t D R B_{lift} acts on the resulting output. Both factors stay invertible, preserving count one.',`
 <rect x="70" y="28" width="200" height="58" rx="7" fill="#f1f7ff" stroke="#c7d9f0"/><rect x="70" y="122" width="200" height="58" rx="7" fill="#f9f6fd" stroke="#dacde6"/><g stroke="#808080" stroke-width="2" fill="none"><path d="M170 5V26M166 19L170 26L174 19M170 87V119M166 112L170 119L174 112M170 182V207M166 200L170 207L174 200"/></g><rect x="25" y="214" width="290" height="32" rx="5" fill="#f1f7ff" stroke="#dacde6"/>
 <g font-family="system-ui" font-size="16" fill="#4b0082" text-anchor="middle">${text(170,53,'1. Apply zI₃ − B_{lift}')}${text(170,74,'x → lifted output')}${text(170,147,'2. Apply I₃ − tDR<tspan baseline-shift="sub" font-size="12">B_{lift}</tspan>(z)')}${text(170,169,'→ perturbed output')}${text(170,236,'No contour crossing · count stays 1')}</g>`,`${m(tex`zI_3-B_t=(I_3-tD(zI_3-B_{\mathrm{lift}})^{-1})(zI_3-B_{\mathrm{lift}})`)}<p>The small-gain estimate makes the second action invertible for every ${m(tex`z\in\Gamma`)} and ${m(tex`0\le t\le1`)}. The Riesz rank stays one.</p>`);
}
