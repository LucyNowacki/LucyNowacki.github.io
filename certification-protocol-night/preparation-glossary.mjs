import {binaryWorkedExample,mountBinaryWorkedExample} from './preparation-binary-example.mjs?v=103';
import {math} from './math-render.mjs?v=103';
const tex=String.raw;
const formula=t=>`<div class="prep-glossary-formula">${math(t)}</div>`;
const source=(href,label)=>`<a class="prep-definition-source" href="${href}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
export function preparationGlossary(){return `<section class="prep-section prep-glossary" aria-labelledby="prep-glossary-title">
 <p class="eyebrow">BEFORE THE SEVEN PREPARATORY OPERATIONS</p><h2 id="prep-glossary-title">Numbers, exact values and enclosures</h2>
 <p>Binary64 describes a storage format. Dyadic describes a kind of exact rational number. Arb and ACB describe how we store and calculate with rigorous enclosures.</p>
 <div class="prep-definition-grid">
 <article><h3>a · Binary64 (“bin64”) number</h3><p>An IEEE 754 binary floating-point value stored in 64 bits, often called <em>double precision</em>. The format uses one sign bit, eleven exponent bits and fifty-two fraction bits. Normal values have 53 significant binary bits, including the implicit leading bit.</p>
 <div class="prep-bit-key" aria-label="64 bits: 1 sign, 11 exponent, 52 fraction"><span>1 sign</span><span>11 exponent</span><span>52 fraction</span></div>
 <p><strong>Simple exact example:</strong></p>${formula(tex`0.625=\frac58=(0.101)_2`)}<p>This value is exactly representable. A finite binary64 value is one specific number; it carries no error interval by itself.</p>
 <details><summary>Why the displayed 0.1 is different</summary><p>With rounding to nearest, the stored binary64 value displayed as <code>0.1</code> is exactly</p>${formula(tex`\frac{3602879701896397}{2^{55}}\ne\frac1{10}.`)}<p>Freezing preserves that stored fraction. It does not turn it into the intended decimal fraction.</p>${source('https://docs.python.org/3/tutorial/floatingpoint.html','Python: the 0.1 example')}</details>
 ${source('https://docs.oracle.com/cd/E19059-01/stud.10/819-0499/ncg_math.html','IEEE double format: Oracle documentation')}</article>
 <article><h3>b · Dyadic number</h3><p>A rational number whose denominator can be a power of two:</p>${formula(tex`x=\frac{m}{2^k},\qquad m\in\mathbb Z,\quad k\in\mathbb Z_{\ge0}.`)}
 <p><strong>Examples:</strong></p>${formula(tex`\frac58=0.625,\qquad -\frac34=-0.75,\qquad 7=\frac7{2^0}.`)}<p>It has a terminating binary expansion. The fraction ${math(tex`1/10`)} is not dyadic.</p><p>Every finite binary64 value is dyadic. The converse fails because binary64 has limited precision and exponent range. For example, ${math(tex`1+2^{-60}`)} is dyadic but is not exactly representable in binary64.</p><p><strong>In our toy:</strong> freezing the real and imaginary binary64 components of each Schur entry produces two exact dyadic numbers.</p></article>
 <article><h3>c · ACB / <code>acb</code></h3><p>The complex-ball layer of FLINT. An <code>acb_t</code> value stores <strong>two Arb balls</strong>: one for the real part and one for the imaginary part, each with its own radius.</p>${formula(tex`[m_x\pm r_x]+i[m_y\pm r_y].`)}
 <p><strong>Simple example:</strong></p>${formula(tex`\left[\frac12\pm\frac1{16}\right]+i\left[\frac14\pm\frac18\right]`)}${formula(tex`=\left[\frac7{16},\frac9{16}\right]+i\left[\frac18,\frac38\right].`)}
 <p>This is a closed rectangle in the complex plane, with width ${math(tex`1/8`)} and height ${math(tex`1/4`)}. Here “complex ball” means this rectangular enclosure, not a Euclidean disk. If both radii are zero, it is one exact complex point.</p>
 ${source('https://github.com/flintlib/flint/blob/main/doc/source/acb.rst','FLINT: ACB definition')}</article>
 <article><h3>d · Arb / <code>arb</code></h3><p>FLINT’s real-ball arithmetic. An <code>arb_t</code> value has a midpoint ${math('m')} and a nonnegative radius ${math('r')}, representing the closed interval</p>${formula(tex`[m\pm r]=[m-r,m+r].`)}
 <p><strong>Simple example:</strong></p>${formula(tex`\left[\frac12\pm\frac1{16}\right]=\left[\frac7{16},\frac9{16}\right].`)}<p>The radius encloses possible error; it is not a statistical confidence level. Midpoint calculations use a chosen precision, and the arithmetic accounts for rounding so the result encloses the exact answer for the input balls.</p>${formula(tex`\left[\frac12\pm0\right]=\left\{\frac12\right\}.`)}<p>Zero radius means the value is exact. Exact inputs can still produce positive-radius outputs, for example when dividing to approximate ${math(tex`1/3`)}.</p>
 ${source('https://github.com/flintlib/flint/blob/main/doc/source/arb.rst','FLINT: Arb definition')}</article>
 </div>
 <div class="prep-enclosure-example"><div class="prep-enclosure-heading"><h3>Two real Arb balls make one complex ACB ball</h3><div class="prep-actions" aria-label="Example enclosure width"><button data-glossary-mode="width" aria-pressed="true">Enclosure with width</button><button data-glossary-mode="point" aria-pressed="false">Exact dyadic point</button></div></div>
 <p>ACB stores an ordered pair of Arb balls. The first bounds the real part; the second bounds the real coefficient of ${math('i')}.</p>
 <div class="prep-pair-rule"><span class="prep-component-real">${math('X')} · real Arb ball</span><b>+</b><span class="prep-component-imag">${math('iY')} · second Arb ball × ${math('i')}</span><b>=</b><strong>${math('Z')} · ACB</strong></div>
 <div class="prep-enclosure-views prep-arb-acb-pair">
 <article class="prep-arb-inputs"><h4>Arb · two real intervals</h4><p class="prep-pair-caption">Each interval is an Arb value.</p><div data-glossary-real></div><div class="prep-pair-controls"><label class="prep-component-real" for="prep-choice-x">Choose ${math(tex`x\in X`)}</label><input id="prep-choice-x" data-glossary-coordinate="x" type="range" min="0" max="100" value="50" step="1" aria-label="Choose real component x in Arb interval X"><label class="prep-component-imag" for="prep-choice-y">Choose ${math(tex`y\in Y`)}</label><input id="prep-choice-y" data-glossary-coordinate="y" type="range" min="0" max="100" value="50" step="1" aria-label="Choose imaginary coefficient y in Arb interval Y"></div></article>
 <article class="prep-acb-output"><h4>ACB · one rectangle</h4><p class="prep-pair-caption">Combine every ${math('x')} with every ${math('y')}.</p><div data-glossary-complex></div><p class="prep-pair-caption">Complex plane · equal axis scales.<br>The red point is your chosen ${math('x+iy')}.</p><div class="prep-chosen-value" data-glossary-value></div></article>
 </div>
 <div class="prep-pair-mapping"><p class="prep-component-real"><b>1 · Real part:</b> the blue Arb interval ${math('X')} becomes the rectangle’s horizontal extent.</p><p class="prep-component-imag"><b>2 · Imaginary part:</b> the gray Arb interval ${math('Y')} becomes the vertical extent after multiplication by ${math('i')}.</p></div>
 ${formula(tex`Z=X+iY=\{x+iy:x\in X,\ y\in Y\}.`)}
 <div class="prep-pair-ranges" data-glossary-ranges></div><p class="prep-example-status" data-glossary-status aria-live="polite"></p>
 <p class="prep-small">Example centre ${math(tex`\frac12+\frac14i`)}; nonzero radii ${math(tex`r_x=1/16`)} and ${math(tex`r_y=1/8`)}. These teaching values are separate from the Gate 2 entry bounds.</p></div>
 <h3>f · What is the difference between ACB and Arb?</h3>
 <div class="table-scroll"><table class="certificate-table"><thead><tr><th>Feature</th><th>Arb</th><th>ACB</th></tr></thead><tbody><tr><th>Values enclosed</th><td>Real numbers</td><td>Complex numbers</td></tr><tr><th>Stored components</th><td>One midpoint and one radius</td><td>Two Arb components: real and imaginary</td></tr><tr><th>Geometry</th><td>Closed interval on the real line</td><td>Closed rectangle in the complex plane</td></tr><tr><th>Exact point</th><td>The radius is zero</td><td>Both component radii are zero</td></tr></tbody></table></div>
 <p><strong>ACB is built from Arb.</strong> It extends the same enclosure approach to complex values.</p>
 <div class="prep-callout"><strong>Where this enters our preparation:</strong> P3 freezes the finite binary64 components of ${math(tex`T_2^\circ,Q_2^\circ`)} as exact dyadics. P5 embeds them in ACB with zero radii. P6 then uses validated arithmetic to enclose the defects. Freezing itself adds no uncertainty.</div>
 </section>${binaryWorkedExample()}`;}
export function mountGlossaryExample(root,signal){
 mountBinaryWorkedExample(root,signal);
 let exact=false;const choice={x:.5,y:.5};
 const fmt=n=>Number(n.toFixed(5)).toString();
 function draw(){
  const rx=exact?0:1/16,ry=exact?0:1/8;
  const x=.5+(2*choice.x-1)*rx,y=.25+(2*choice.y-1)*ry;
  const px=165+(x-.5)*640,py=150-(y-.25)*640;
  root.querySelectorAll('[data-glossary-mode]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.glossaryMode==='point')===exact)));
  root.querySelectorAll('[data-glossary-coordinate]').forEach(b=>{b.disabled=exact;b.setAttribute('aria-valuetext',fmt(b.dataset.glossaryCoordinate==='x'?x:y));});
  const interval=(component,cy,lo,hi,mid,col)=>{
   const selected=exact?150:75+choice[component]*150;
   return `<g class="glossary-${col}"><text x="22" y="${cy-52}" class="glossary-component-label">${component==='x'?'1 · X':'2 · Y'}</text><line x1="35" y1="${cy}" x2="270" y2="${cy}" class="glossary-baseline"/><line x1="${exact?150:75}" y1="${cy}" x2="${exact?150:225}" y2="${cy}" class="glossary-interval"/><circle cx="${exact?150:75}" cy="${cy}" r="4"/><circle cx="${exact?150:225}" cy="${cy}" r="4"/>${exact?`<text x="150" y="${cy+35}" text-anchor="middle">${mid}</text>`:`<text x="75" y="${cy+35}" text-anchor="middle">${lo}</text><text x="225" y="${cy+35}" text-anchor="middle">${hi}</text>`}<path d="M${selected} ${cy-19}v10" class="glossary-choice-tick"/><circle cx="${selected}" cy="${cy}" r="6" class="glossary-selected-component"/><text x="150" y="${cy+69}" text-anchor="middle">${component} = ${fmt(component==='x'?x:y)}</text></g>`;
  };
  root.querySelector('[data-glossary-real]').innerHTML=`<svg class="prep-enclosure-svg" viewBox="0 0 300 330" role="img" aria-label="${exact?'Two exact Arb points, X equals one half and Y equals one quarter':'Two separate real Arb intervals: X from seven sixteenths to nine sixteenths, Y from one eighth to three eighths'}">${interval('x',92,'7/16','9/16','1/2','x')}${interval('y',230,'1/8','3/8','1/4','y')}</svg>`;
  const left=165-rx*640,right=165+rx*640,top=150-ry*640,bottom=150+ry*640;
  root.querySelector('[data-glossary-complex]').innerHTML=`<svg class="prep-enclosure-svg" viewBox="0 0 300 330" role="img" aria-label="${exact?'The two zero-radius Arb values form the single ACB point one half plus one quarter i':'Blue horizontal interval X and gray vertical interval iY form a closed ACB rectangle; dashed guides identify the matching endpoints'}">
  <g class="glossary-x"><line x1="90" y1="275" x2="255" y2="275" class="glossary-baseline"/><line x1="${left}" y1="275" x2="${right}" y2="275" class="glossary-interval"/><path d="M${left} 275V${bottom}M${right} 275V${bottom}" class="glossary-projection"/>${exact?`<text x="165" y="300" text-anchor="middle">1/2</text>`:`<text x="${left}" y="300" text-anchor="middle">7/16</text><text x="${right}" y="300" text-anchor="middle">9/16</text>`}<text x="260" y="280">Re</text><text x="165" y="327" text-anchor="middle">1 · X</text></g>
  <g class="glossary-y"><line x1="40" y1="42" x2="40" y2="250" class="glossary-baseline"/><line x1="40" y1="${top}" x2="40" y2="${bottom}" class="glossary-interval"/><path d="M40 ${top}H${left}M40 ${bottom}H${left}" class="glossary-projection"/>${exact?`<text x="30" y="155" text-anchor="end">1/4</text>`:`<text x="30" y="${top+5}" text-anchor="end">3/8</text><text x="30" y="${bottom+5}" text-anchor="end">1/8</text>`}<text x="40" y="29" text-anchor="middle">Im</text><text x="165" y="29" text-anchor="middle">2 · iY</text></g>
  <rect x="${left}" y="${top}" width="${2*rx*640}" height="${2*ry*640}" class="glossary-rectangle"/>
  <path d="M${left} ${top}H${right}M${left} ${bottom}H${right}" class="glossary-x-edge"/><path d="M${left} ${top}V${bottom}M${right} ${top}V${bottom}" class="glossary-y-edge"/>
  <path d="M${px} 275V${py}" class="glossary-x-guide"/><path d="M40 ${py}H${px}" class="glossary-y-guide"/><circle cx="${px}" cy="275" r="4" class="glossary-real-point"/><circle cx="40" cy="${py}" r="4" class="glossary-imag-point"/><circle cx="${px}" cy="${py}" r="6" class="glossary-complex-point"/>
  </svg>`;
  root.querySelector('[data-glossary-value]').innerHTML=math(tex`z=${fmt(x)}+${fmt(y)}i`);
 }
 function explain(){
  root.querySelector('[data-glossary-ranges]').innerHTML=exact?`<span class="prep-component-real">${math(tex`X=\{1/2\}`)}</span><span class="prep-component-imag">${math(tex`Y=\{1/4\}`)}</span>`:`<span class="prep-component-real">${math(tex`X=[1/2\pm1/16]=[7/16,9/16]`)}</span><span class="prep-component-imag">${math(tex`Y=[1/4\pm1/8]=[1/8,3/8]`)}</span>`;
  root.querySelector('[data-glossary-status]').innerHTML=exact?`Both Arb radii are zero, so their ACB pair is the exact point ${math(tex`Z=\{1/2+i/4\}`)}. The visible dot is only a point marker.`:`Each pair of slider choices gives one point. All possible pairs fill the rectangle, including its boundary: width ${math(tex`2r_x=1/8`)}, height ${math(tex`2r_y=1/4`)}. The two number-line drawings on the left use separate scales; the complex plane on the right uses equal scales.`;
 }
 root.addEventListener('click',e=>{const b=e.target.closest('[data-glossary-mode]');if(b){exact=b.dataset.glossaryMode==='point';draw();explain();}},{signal});
 root.addEventListener('input',e=>{const axis=e.target.dataset.glossaryCoordinate;if(axis){choice[axis]=Number(e.target.value)/100;draw();}},{signal});
 draw();explain();
}
