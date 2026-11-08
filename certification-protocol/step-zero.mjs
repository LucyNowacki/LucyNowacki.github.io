import { math } from './math-render.mjs?v=latex2';
import { DEN, MID, ERROR, HARDY, HALF } from './enclosure-math.mjs?v=103';
import { Q, T } from './step-four.mjs?v=103';
import { numberToBits, decodeBinary64, decimalEncoding, rationalText, exactDecimal, changeBit, reduceRational } from './dyadic-numbers.mjs';

const tex = String.raw;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const equation = source => `<div class="s0-equation">${math(source)}</div>`;
const rationalTex = ({numerator, denominator}) => denominator === 1n ? String(numerator) : tex`\frac{${numerator}}{${denominator}}`;
const matrixTex = {midpoint:tex`A_2^\circ`, error:'E', hardy:tex`A_{2,M}^{X}`, schurQ:tex`Q_2^\circ`, schurT:tex`T_2^\circ`};
const scalar = value => Object.is(value, -0) ? '−0' : String(value).replace('-', '−');
const pair = ([r, i]) => `${scalar(r)} ${i < 0 ? '−' : '+'} ${scalar(Math.abs(i))}i`;
const flatten = matrix => matrix.flat().map(z => [z.x, z.y]);
const numericTex = value => String(value).replace(/e([+-]?\d+)/i, (_, e) => tex`\times 10^{${Number(e)}}`);

export const STEP_ZERO_MATRICES = {
  midpoint: { label: 'A₂°', title: 'Exact dyadic midpoint', values: MID.map(v => v.map(x => x / DEN)), units: MID,
    description: 'The chosen reference matrix. Gate 1 certifies this exact matrix. Gate 2 then centres its entry rectangles here.', target: '04' },
  error: { label: 'E', title: 'Chosen toy perturbation', values: ERROR.map(v => v.map(x => x / DEN)), units: ERROR,
    description: 'The particular error chosen for this toy. Gate 2 protects every allowed error in the rectangles, not only this selected E.', target: '06' },
  hardy: { label: 'A₂,ᴍˣ', title: 'Chosen toy Hardy block', values: HARDY.map(v => v.map(x => x / DEN)), units: HARDY,
    description: 'The selected target equals A₂° + E. Its dyadic entries are a convenience of this toy. A real mathematical Hardy block need not be dyadic.', target: '06' },
  schurQ: { label: 'Q₂°', title: 'Frozen Schur coordinates', values: flatten(Q),
    description: 'These decimal source literals specify binary64 numbers, hence exact dyadics after freezing. Q₂° must be proved invertible. It is not assumed exactly unitary.', target: '04' },
  schurT: { label: 'T₂°', title: 'Frozen triangular matrix', values: flatten(T),
    description: 'This frozen dyadic matrix is exactly upper triangular. Its diagonal supplies the initial eigenvalue count. Its agreement with A₂° is checked through the Schur residual.', target: '01' }
};


export function stepZeroOriginsNotice(){
 const link=origin=>{const u=new URL(location.href);u.searchParams.set('tab','connections');u.searchParams.set('origin',origin);u.hash='step-00';return u.pathname+u.search+u.hash;};
 return `<section class="s0-card s0-origin-notice"><p class="s0-eyebrow">CHOOSE THE ORIGIN · BEFORE EITHER GATE</p><h2>Two versions: prescribed toy or construction from a map</h2><p><strong>Version 1:</strong> our current default A₂° has prescribed entries, chosen to teach the protocol. <strong>Version 2:</strong> three maps supply their own transfer entries, Hardy enclosures and dyadic midpoints. Gate 1 checks the matrix prepared by either route.</p><div class="s0-jump"><a href="${link('toy')}">Version 1 · Current default toy →</a><a href="${link('map')}">Version 2 · Three map constructions →</a></div></section>`;
}

export function stepZeroRealProtocol() {
  return `<section class="s0-card" data-step-zero-real-protocol><p class="s0-eyebrow">REAL PROTOCOL · CURRENT BLASCHKE CERTIFIER</p><h2>Extract an exact point from a validated matrix enclosure</h2>
    <p>This is the assembly route in the current Blaschke certification implementation. The mathematical target is the finite matrix in orthonormal Hardy coordinates. For this real Blaschke matrix, Arb constructs a real interval enclosure of each entry. The dyadic midpoint is extracted from that enclosure. General complex matrices use real and imaginary interval components.</p>
    <details><summary>Exactly which mathematical matrix is enclosed?</summary>
    <p>Choose the map’s inverse branches ${math(tex`\tau_b`)} and their transfer weights ${math(tex`\phi_b`)}, the retained dimension N, the Gauss rule of level M, and the Hardy gauge r. With the normalized Legendre basis ${math(tex`p_k`)}, the quadrature matrix is</p>
    ${equation(tex`\widehat L_{k\ell}=\sum_j w_jp_k(x_j)\sum_b\phi_b(x_j)p_\ell(\tau_b(x_j)),\qquad p_k=\sqrt{\frac{2k+1}{2}}P_k.`)}
    <p>Diagonal scaling changes to scaled Legendre coefficients. The connection matrix then changes to orthonormal Hardy coordinates:</p>
    ${equation(tex`D_r=\operatorname{diag}(1,r,\ldots,r^{N-1}),\qquad A_{N,M}^{X}=T_N(r)D_r\widehat L D_r^{-1}T_N(r)^{-1}.`)}
    <p>Here <strong>${math(tex`T_N(r)`)}</strong> is the basis-connection matrix, not the frozen triangular Schur matrix <strong>${math(tex`T_N^\circ`)}</strong>. Arb enclosures cover the nodes, weights, branches, connection inverse, and matrix products. The finite quadrature target and the full transfer operator are different objects.</p>
    </details>
    ${equation(tex`A_{N,M}^{X}\in\boldsymbol A,\qquad A_N^\circ=\operatorname{mid}(\boldsymbol A),\qquad \|A_{N,M}^{X}-A_N^\circ\|_2\le\eta_A`)}
    <ol class="s0-provenance"><li><strong>Mathematical target.</strong> The exact finite Hardy-coordinate matrix is the object to be enclosed.</li><li><strong>Validated enclosure.</strong> This real Blaschke implementation encloses the real entries with Arb intervals. For a general complex matrix, real and imaginary intervals enclose both components.</li><li><strong>Exact dyadic midpoint.</strong> The production code reads each Arb midpoint with <code>.mid().man_exp()</code>. Its integer mantissa and exponent specify <code>m × 2^k</code> exactly. The exponent k may be positive, zero, or negative. This extraction is not a conversion to binary64.</li><li><strong>Numerical proposal.</strong> A separate binary64 copy is used to propose Schur factors. Freeze those proposed factors as dyadics, then validate invertibility, conditioning, and the Schur residual against the exact midpoint.</li></ol>
    <p class="s0-note">The bit inspector above explains binary64 and the frozen toy entries. A high-precision Arb midpoint can require more than 53 significant binary digits. It remains an exact dyadic even when binary64 cannot store it exactly.</p>
    <div data-step-zero-provenance-detail><details><summary>Validation and source trail</summary>
    <p>The implementation bounds the Gram defect of the frozen Q°, proves it invertible, and checks the residual against the authoritative exact midpoint:</p>
    ${equation(tex`R=A_N^\circ Q_N^\circ-Q_N^\circ T_N^\circ,\qquad \|A_N^\circ-Q_N^\circ T_N^\circ(Q_N^\circ)^{-1}\|_2\le\|R\|_F\|(Q_N^\circ)^{-1}\|_2.`)}
    <p>The exact surrogate ${math(tex`Q^\circ T^\circ(Q^\circ)^{-1}`)} need not itself be dyadic. The enclosure allowance ${math(tex`\eta_A`)} bounds arithmetic enclosure error for the finite target. The final operator allowance bounds the separate difference between the lifted finite model and the full operator, including the relevant truncation and discretization error.</p>
    <p><strong>Current scientific source:</strong> <code>Final Deployment/Numerics/blaschke_deformation_spectral_certification.py</code>, functions <code>assemble_interval_hardy_matrix</code> and <code>_dyadic_midpoint_payload</code>. Schur validation: the associated contour-certification helper, <code>_exact_float</code> and <code>_validate_schur_similarity</code>. Thesis: <code>chapters/numerical_certification_transfer.tex</code>, Hardy-coordinate assembly, exact-dyadic midpoint, exact-binary Schur validation, and finite-to-operator transfer.</p>
    <p><strong>Default website data:</strong> <code>enclosure-math.mjs</code> defines the prescribed midpoint, error, and target. <code>step-four.mjs</code> supplies Q₂° and imports the frozen triangular data. The default teaching matrix has no map-specific quadrature provenance attached.</p>
    </details></div>
  </section>`;
}

export function stepZeroConnections() {
  return `<section class="s0-card" data-s0-gates><p class="s0-eyebrow">ONE MIDPOINT · DIFFERENT COMPARISONS</p><h2>Where each matrix enters the gates</h2>
  <div class="s0-gate-route"><article><a href="#step-01"><b>01–03</b> Triangular start</a>${equation(tex`T_2^\circ`)}<p>Count diagonal eigenvalues and bound its resolvent on the whole contour.</p></article>
  <article><a href="#step-04"><b>04 · Gate 1</b> Certify the midpoint</a>${equation(tex`S_2^\circ=Q_2^\circ T_2^\circ(Q_2^\circ)^{-1}\longrightarrow A_2^\circ`)}<p>Bound the discrepancy between the exact surrogate and the exact midpoint. The Schur residual is the allowance here.</p></article>
  <article><a href="#step-06"><b>06–09 · Gate 2</b> Protect the entry box</a>${equation(tex`A_2^\circ\longrightarrow A_{2,M}^{X}\in\boldsymbol A`)}<p>Use the same midpoint as the centre of the rectangles. The entry enclosure supplies the matrix allowance ${math(tex`\eta_A`)}.</p></article>
  <article><a href="#step-10"><b>10</b> Exact lift</a>${equation(tex`B_{\mathrm{lift}}=A_{2,M}^{X}\oplus0`)}<p>Add the complementary zero block. This is an exact construction with its own contour-distance check.</p></article>
  <article><a href="#step-11"><b>11 · Operator gate</b> Compare operators</a>${equation(tex`B_{\mathrm{lift}}\longrightarrow\mathcal L_{\mathrm{toy}}`)}<p>The operator allowance controls this final difference. It is separate from both the Schur residual and the entry-box allowance.</p></article></div>
  <p class="s0-note"><strong>Why the introduction belongs here:</strong> prepare and inspect A₂° before using it. <a href="#step-06">Step 06</a> keeps the entry rectangles and their error bounds, using the same matrix. Moving the explanation does not introduce a new midpoint or a new gate.</p>
  <a class="s0-next" href="#preparation">Inspect the detailed freeze-and-validation ledger →</a></section>`;
}

export function stepZeroArgument() {
  return `<div class="s0-root mathjax_ignore">${stepZeroOriginsNotice()}<section class="s0-card"><h2>Exact representation is the starting point</h2><p>A dyadic rational has the form ${math(tex`\frac{m}{2^k}`)}, with integer m and non-negative integer k. A complex dyadic number has dyadic real and imaginary parts. A dyadic matrix has such entries.</p>
  ${equation(tex`\frac58=(0.101)_2=\frac12+\frac18=0.625`)}
  <p>Every finite binary64 value is a dyadic, including subnormals and zero. The converse is false: binary64 has a finite exponent range and at most 53 significant binary digits for normal numbers. Infinity and NaN are special encodings, not dyadic numbers.</p>
  <p>Freezing a numerical value means treating its stored binary value as the exact datum thereafter. This does not make the preceding calculation exact. Validation bounds the residuals and enclosures needed to connect the frozen datum to the mathematical target.</p>
  ${equation(tex`\|A_2^\circ-Q_2^\circ T_2^\circ(Q_2^\circ)^{-1}\|_2\le\eta_{\mathrm{Schur}},\qquad \|A_{2,M}^{X}-A_2^\circ\|_2\le\eta_A`)}
  <p>These are distinct differences, so their allowances belong to different gates. Gate 1 protects the surrogate-to-midpoint homotopy. Gate 2 protects the midpoint-to-target homotopy. Dyadic representation lets an independent checker identify exact inputs, while strict uniform contour bounds supply certification.</p></section>${stepZeroConnections()}${stepZeroRealProtocol()}</div>`;
}

export function mountStepZero(root, { realProtocolHTML } = {}) {
  const abort = new AbortController(), { signal } = abort;
  let fractionBits = [1, 0, 1, 0, 0, 0], matrixKey = 'midpoint', entry = 0, component = 0;
  let bits = numberToBits(0.625), intendedText = '0.625', inspectorOrigin = 'Decimal input 0.625', selectedInput = false;
  root.innerHTML = `<div class="s0-root mathjax_ignore" data-step-zero>
  ${stepZeroOriginsNotice()}<section class="s0-card s0-lead"><p class="s0-eyebrow">00 · PREPARE THE EXACT INPUTS</p><h2>A dyadic number is an exact point</h2><p>Start with the numbers, then the matrix, then the certificate. The default toy uses a chosen 2 × 2 complex midpoint <strong>A₂°</strong>. Its real and imaginary coordinates are exact fractions with power-of-two denominators.</p><div class="s0-jump"><a href="#s0-fractions">Build a binary fraction</a><a href="#s0-inspector">Inspect 64 bits</a><a href="#s0-matrices">Explore the toy matrices</a><a href="#s0-provenance">Connect to the real protocol</a></div></section>
  <section class="s0-card" id="s0-fractions"><p class="s0-eyebrow">1 · THE IDEA</p><h2>Choose halves, quarters, eighths…</h2><p>Each binary fractional digit includes or excludes one power of 1/2. Toggle the six digits to build an exact point on a grid of spacing <strong>1/64</strong>.</p>
  <div class="s0-small-bits" role="group" aria-label="Six conceptual binary fractional digits"><strong>0.</strong>${fractionBits.map((v, i) => `<button type="button" data-s0-fraction="${i}" aria-pressed="${!!v}" aria-label="Include one over ${2 ** (i + 1)}"><b>${v}</b><span>${math(tex`\frac1{${2 ** (i + 1)}}`)}</span></button>`).join('')}<small>base 2</small></div>
  <div class="s0-ruler" aria-hidden="true"><div class="s0-ruler-grid"></div><span class="s0-ruler-marker" data-s0-ruler></span></div><div class="s0-ruler-labels"><span>0</span><span>½</span><span>1</span></div>
  <output class="s0-equation" data-s0-fraction-output aria-live="polite"></output><div class="s0-actions"><button type="button" data-s0-fraction-reset>Restore ${math(tex`0.101_2=\frac58`)}</button><button type="button" data-s0-fraction-inspect>Encode this value as binary64 ↓</button></div>
  <p class="s0-note">These six buttons illustrate a fractional expansion. They are <strong>not</strong> the six leading storage bits of a binary64 number.</p>
  <h3>Why computers use dyadics</h3><p>Binary hardware represents digits as bits. A finite binary expansion is an integer times a power of two, which makes stored values exactly recoverable. Ordinary floating-point operations can still round. Exact rational arithmetic or outward interval bounds are needed when checking a certificate.</p>
  </section>
  <section class="s0-card" id="s0-inspector"><p class="s0-eyebrow">2 · ENCODE AND DECODE BINARY64</p><h2>One sign, eleven exponent bits, fifty-two fraction bits</h2><p>Encode a decimal input, then toggle any stored bit to decode a new value. This is a separate experiment: the certified toy matrices below stay fixed.</p>
  <form class="s0-decimal-form" data-s0-form><label>Decimal input <input type="text" inputmode="decimal" data-s0-decimal value="0.625" spellcheck="false" aria-describedby="s0-input-help"></label><button type="submit">Encode → bits</button><p id="s0-input-help">Examples: 0.625, −0.125, 0.1, 1e-320. Use a minus sign (-) when typing.</p></form>
  <p class="s0-error" data-s0-error role="alert" hidden></p>
  <div class="s0-presets" role="group" aria-label="Binary64 presets"><button type="button" data-s0-preset="0.625">Exact 0.625</button><button type="button" data-s0-preset="0.1">Rounded 0.1</button><button type="button" data-s0-preset="-0">−0</button><button type="button" data-s0-special="subnormal">Smallest positive</button><button type="button" data-s0-special="infinity">+∞</button><button type="button" data-s0-special="nan">NaN</button></div>
  <p class="s0-origin" data-s0-origin></p>
  <div class="s0-bit-fields">${[['sign', 0, 1, 'Sign · 1 bit'], ['exponent', 1, 12, 'Exponent · 11 bits'], ['fraction', 12, 64, 'Fraction · 52 stored bits']].map(([name, start, end, label]) => `<fieldset class="s0-field s0-field-${name}"><legend>${label}</legend><div class="s0-bit-grid">${Array.from({ length: end - start }, (_, i) => `<button type="button" class="s0-bit" data-s0-bit="${start + i}" aria-label="Toggle ${name} bit ${i + 1}" aria-pressed="false">0</button>`).join('')}</div><output data-s0-field="${name}"></output></fieldset>`).join('')}</div>
  <p class="s0-bit-hint">Tab to a bit and press Space or Enter. Arrow keys move between stored bits. Bit order is most significant first.</p>
  <div class="s0-decode" aria-live="polite" aria-atomic="true"><div data-s0-classification></div><div class="s0-equation" data-s0-decode-formula></div><dl class="s0-values"><div><dt>Hexadecimal bit pattern</dt><dd><code data-s0-hex></code></dd></div><div><dt>Shortest decimal that round-trips</dt><dd><code data-s0-short></code></dd></div><div><dt>Exact stored dyadic</dt><dd data-s0-exact></dd></div></dl><details><summary>Full exact fraction and decimal expansion</summary><div class="s0-exact-expansion"><p><strong>Exact rational:</strong> <code data-s0-rational></code></p><p><strong>Exact decimal:</strong> <code data-s0-decimal-exact></code></p></div></details><div class="s0-rounding" data-s0-rounding></div></div>
  <details class="s0-encoding-help"><summary>Why the leading 1 is hidden, and what the special exponents mean</summary><p>For a normal value, the significand starts with 1, so only its 52 following fractional bits are stored. This gives 53 significant binary digits. Subnormals have no implicit leading 1.</p><div class="s0-encoding-table" tabindex="0" role="region" aria-label="Binary64 decoding table"><table><thead><tr><th>Exponent field ${math(tex`e`)}</th><th>Fraction integer ${math(tex`F`)}</th><th>Decoded meaning</th></tr></thead><tbody><tr><td>${math(tex`1\le e\le2046`)}</td><td>any</td><td>${math(tex`(-1)^s\left(1+\frac{F}{2^{52}}\right)2^{e-1023}`)}</td></tr><tr><td>0</td><td>${math(tex`F\ne0`)}</td><td>${math(tex`(-1)^s F\,2^{-1074}`)}</td></tr><tr><td>0</td><td>${math(tex`F=0`)}</td><td>${math(tex`+0\text{ or }-0`)}</td></tr><tr><td>2047</td><td>${math(tex`F=0`)}</td><td>${math(tex`+\infty\text{ or }-\infty`)}</td></tr><tr><td>2047</td><td>${math(tex`F\ne0`)}</td><td>${math(tex`\mathrm{NaN}`)}</td></tr></tbody></table></div></details>
  <p class="s0-note">Not every dyadic fits binary64: <strong>${math(tex`1+2^{-60}`)}</strong> is exactly dyadic, but binary64 rounds it to <strong>1</strong>. Exact dyadic certificate data can retain more bits than a binary64 diagnostic copy.</p>
  <p class="s0-source-links">Representation references: <a href="https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html" target="_blank" rel="noopener">binary64 field layout and special values</a>; <a href="https://docs.python.org/3/tutorial/floatingpoint.html" target="_blank" rel="noopener">binary fractions, exact ratios, and decimal display</a>.</p>
  </section>
  <section class="s0-card" id="s0-matrices"><p class="s0-eyebrow">3 · THE DEFAULT TOY, WITHOUT CHANGING ITS ENTRIES</p><h2>From one exact coordinate to a complex matrix</h2><p>The toy specifies the midpoint and a chosen perturbation using integer pairs divided by <strong>1024 = 2¹⁰</strong>. Each complex entry has a real coordinate and an imaginary coordinate. Select either coordinate to inspect its 64-bit encoding above.</p>
  ${equation(tex`A_{N,M}^{X}\in\mathcal A,\qquad A_N^\circ=\operatorname{mid}(\mathcal A).`)}<p class="s0-note">Here ${math(tex`\mathcal A`)} is the entry enclosure and ${math(tex`A_N^\circ`)} its exact midpoint. The prescribed default toy below has ${math(tex`N=2`)}.</p>
  <div class="s0-presets" role="group" aria-label="Matrix to inspect">${Object.entries(STEP_ZERO_MATRICES).map(([key, value]) => `<button type="button" data-s0-matrix="${key}" aria-pressed="${key === 'midpoint'}">${math(matrixTex[key])} · ${value.title}</button>`).join('')}</div>
  <div class="s0-matrix-layout"><div><h3 data-s0-matrix-title></h3><div class="s0-complex-matrix" data-s0-matrix-grid></div><p class="s0-matrix-source" data-s0-matrix-source></p></div><div class="s0-selected-entry"><h3 data-s0-entry-title></h3><div data-s0-entry-value class="s0-equation"></div><p data-s0-matrix-description></p><p class="s0-note" data-s0-selected-message></p><a href="#s0-inspector" data-s0-to-inspector>View the selected coordinate’s bits ↑</a><p><a data-s0-matrix-next></a></p></div></div>
  <details><summary>What the toy chooses, and what must still be checked</summary><p>${math(tex`A_2^\circ`)} and ${math("E")} are prescribed teaching data. Their exact integers do not come from running validated quadrature in this browser. The toy target ${math(tex`A_{2,M}^{X}=A_2^\circ+E`)} is also dyadic by construction. In the real protocol, the exact mathematical target is generally not dyadic.</p><p>The frozen ${math(tex`Q_2^\circ`)} and ${math(tex`T_2^\circ`)} are a separate numerical Schur proposal. Their dyadic representation does not guarantee an exact factorization. Gate 1 checks the discrepancy. Similarly, a midpoint alone is not an entry enclosure: Step 06 supplies rectangles around it.</p></details>
  </section>
  <div id="s0-provenance">${realProtocolHTML ?? stepZeroRealProtocol()}</div>${stepZeroConnections()}
  <section class="s0-card s0-ending"><h2>Ready for the contour</h2><p>The exact inputs have names and separate roles. The next step starts with T₂° and counts its diagonal entries inside the chosen contour.</p><a class="s0-next" href="#step-01">Continue to Step 01 · The spectral disk →</a></section>
  </div>`;
  const q = selector => root.querySelector(selector), qa = selector => [...root.querySelectorAll(selector)];
  function renderFraction() {
    const numerator = fractionBits.reduce((n, bit, i) => n + bit * 2 ** (5 - i), 0);
    const additions = fractionBits.flatMap((bit, i) => bit ? [tex`\frac1{${2 ** (i + 1)}}`] : []);
    qa('[data-s0-fraction]').forEach((button, i) => { button.setAttribute('aria-pressed', String(!!fractionBits[i])); button.querySelector('b').textContent = fractionBits[i]; });
    q('[data-s0-ruler]').style.left = `${numerator / 64 * 100}%`;
    q('[data-s0-fraction-output]').innerHTML = math(tex`0.${fractionBits.join('')}_2 = ${additions.join(' + ') || '0'} = \frac{${numerator}}{64} = ${rationalTex(reduceRational(BigInt(numerator), 64n))} = ${numerator / 64}`);
  }
  function renderInspector() {
    const decoded = decodeBinary64(bits);
    qa('[data-s0-bit]').forEach((button, i) => { button.textContent = bits[i]; button.setAttribute('aria-pressed', String(bits[i] === '1')); button.setAttribute('title', `Stored bit ${i}: ${bits[i]}`); });
    q('[data-s0-origin]').textContent = inspectorOrigin;
    q('[data-s0-field="sign"]').innerHTML = `${math(tex`s=${decoded.sign}`)} · ${decoded.sign ? 'negative' : 'positive'}`;
    q('[data-s0-field="exponent"]').innerHTML = math(tex`e=${decoded.exponentField}`);
    q('[data-s0-field="fraction"]').innerHTML = math(tex`F=${decoded.fractionInteger}`);
    q('[data-s0-hex]').textContent = `0x${decoded.hex}`;
    q('[data-s0-short]').textContent = scalar(decoded.value);
    const finite = decoded.rational !== null;
    const classes = { normal: 'Normal finite value · exact dyadic', subnormal: 'Subnormal finite value · exact dyadic', zero: `Signed zero · ${decoded.sign ? '−0' : '+0'} encodes the dyadic value 0`, infinity: 'Infinity · special encoding, not a dyadic number', NaN: 'NaN · special encoding, not a number' };
    q('[data-s0-classification]').textContent = classes[decoded.classification];
    q('[data-s0-decode-formula]').innerHTML = decoded.classification === 'normal'
      ? math(tex`(-1)^{${decoded.sign}}\left(1+\frac{${decoded.fractionInteger}}{2^{52}}\right)2^{${decoded.exponentField}-1023}`)
      : decoded.classification === 'subnormal' ? math(tex`(-1)^{${decoded.sign}}\cdot ${decoded.fractionInteger}\cdot 2^{-1074}`)
      : decoded.classification === 'zero' ? 'Zero significand · exponent field 0' : 'Exponent field 2047 · special meaning';
    q('[data-s0-exact]').innerHTML = finite ? decoded.rational.numerator === 0n ? '0' : decoded.denominatorPower
      ? math(tex`\frac{${decoded.rational.numerator}}{2^{${decoded.denominatorPower}}}`) : math(String(decoded.rational.numerator)) : 'Not a finite rational value';
    q('[data-s0-rational]').textContent = finite ? rationalText(decoded.rational) : 'Not applicable';
    q('[data-s0-decimal-exact]').textContent = finite ? exactDecimal(decoded.rational) : 'Not applicable';
    if (intendedText !== null) {
      const encoding = decimalEncoding(intendedText), same = encoding.error?.numerator === 0n;
      q('[data-s0-rounding]').innerHTML = !encoding.error ? '<strong>Overflow:</strong> this decimal input does not encode as a finite binary64 number.' : same
        ? `<strong>Exact encoding.</strong> The decimal input ${escape(intendedText)} equals the stored rational exactly.${Object.is(decoded.value, -0) ? ' The sign bit preserves negative zero.' : ''}`
        : `<strong>${decoded.rational.numerator === 0n ? 'Underflow to signed zero.' : 'Rounded encoding.'}</strong> The exact decimal input is ${math(rationalTex(encoding.intended))}.<br>Stored value − intended value = ${math(rationalTex(encoding.error))}.<br>${intendedText.trim() === '0.1' ? 'The short display “0.1” hides this nonzero error. The exact stored decimal is 0.1000000000000000055511151231257827021181583404541015625.' : 'The full expansion above is the stored value, before display rounding.'}`;
    } else q('[data-s0-rounding]').textContent = finite ? 'This value is decoded directly from the selected bits. There is no decimal-input rounding comparison for this bit pattern.' : 'Infinity and NaN cannot be used as finite certificate matrix entries.';
  }
  function encode(text, origin = `Decimal input ${text}`) {
    try { const encoded = decimalEncoding(text); bits = encoded.bits; intendedText = text; inspectorOrigin = origin; q('[data-s0-decimal]').value = text; q('[data-s0-error]').hidden = true; renderInspector(); return true; }
    catch (error) { q('[data-s0-error]').textContent = error.message; q('[data-s0-error]').hidden = false; return false; }
  }
  function renderMatrix() {
    const data = STEP_ZERO_MATRICES[matrixKey];
    qa('[data-s0-matrix]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.s0Matrix === matrixKey)));
    q('[data-s0-matrix-title]').innerHTML = `${math(matrixTex[matrixKey])} · ${data.title}`;
    q('[data-s0-matrix-grid]').innerHTML = data.values.map((value, i) => `<div class="s0-matrix-cell ${i === entry ? 'is-selected' : ''}"><small>Entry (${Math.floor(i / 2) + 1}, ${i % 2 + 1})</small><div class="s0-coordinate-buttons">${value.map((v, j) => `<button type="button" data-s0-coordinate="${i},${j}" aria-pressed="${selectedInput && i === entry && j === component}" aria-label="Inspect ${j ? 'imaginary' : 'real'} coordinate of ${data.label}, entry ${Math.floor(i / 2) + 1}, ${i % 2 + 1}"><span>${j ? 'Im' : 'Re'}</span><strong>${math(data.units ? tex`\frac{${data.units[i][j]}}{1024}` : numericTex(v))}</strong></button>`).join('')}</div></div>`).join('');
    q('[data-s0-matrix-source]').textContent = data.units ? 'Displayed integer numerators / 1024 · exact, with no decimal truncation.' : 'Displayed decimals round-trip to the frozen binary64 entries. Inspect a coordinate for its full exact dyadic value.';
    q('[data-s0-entry-title]').textContent = `Selected entry (${Math.floor(entry / 2) + 1}, ${entry % 2 + 1})`;
    q('[data-s0-entry-value]').innerHTML = math(data.units ? tex`\frac{${pair(data.units[entry]).replaceAll('−','-')}}{1024}` : pair(data.values[entry]).replaceAll('−','-'));
    q('[data-s0-matrix-description]').textContent = data.description;
    q('[data-s0-selected-message]').textContent = selectedInput ? `${component ? 'Imaginary' : 'Real'} coordinate loaded into the bit inspector. Changing bits there explores a separate number and leaves ${data.label} unchanged.` : 'Choose Re or Im in a matrix cell to load that coordinate into the bit inspector.';
    q('[data-s0-matrix-next]').href = `#step-${data.target}`;
    q('[data-s0-matrix-next]').textContent = `See this matrix in Step ${data.target} →`;
  }
  root.addEventListener('submit', event => { if (event.target.matches('[data-s0-form]')) { event.preventDefault(); selectedInput = false; encode(q('[data-s0-decimal]').value); renderMatrix(); } }, { signal });
  root.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-s0-fraction')) { const i = Number(button.dataset.s0Fraction); fractionBits[i] ^= 1; renderFraction(); }
    if (button.hasAttribute('data-s0-fraction-reset')) { fractionBits = [1, 0, 1, 0, 0, 0]; renderFraction(); }
    if (button.hasAttribute('data-s0-fraction-inspect')) { selectedInput = false; encode(String(fractionBits.reduce((v, bit, i) => v + bit * 2 ** (-i - 1), 0)), 'Value from the six-digit binary fraction'); renderMatrix(); q('[data-s0-decimal]').focus({ preventScroll: false }); }
    if (button.hasAttribute('data-s0-preset')) { selectedInput = false; encode(button.dataset.s0Preset); renderMatrix(); }
    if (button.hasAttribute('data-s0-special')) {
      const preset = button.dataset.s0Special;
      bits = preset === 'subnormal' ? '0'.repeat(63) + '1' : preset === 'infinity' ? '0' + '1'.repeat(11) + '0'.repeat(52) : '0' + '1'.repeat(12) + '0'.repeat(51);
      intendedText = null; selectedInput = false; inspectorOrigin = preset === 'subnormal' ? 'Smallest positive binary64 value: exact 2⁻¹⁰⁷⁴' : 'Special binary64 encoding'; q('[data-s0-error]').hidden = true; renderInspector(); renderMatrix();
    }
    if (button.hasAttribute('data-s0-bit')) { bits = changeBit(bits, Number(button.dataset.s0Bit)); intendedText = null; inspectorOrigin = 'Exploratory bit edit · toy matrices unchanged'; q('[data-s0-error]').hidden = true; renderInspector(); }
    if (button.hasAttribute('data-s0-matrix')) { matrixKey = button.dataset.s0Matrix; selectedInput = false; renderMatrix(); }
    if (button.hasAttribute('data-s0-coordinate')) {
      [entry, component] = button.dataset.s0Coordinate.split(',').map(Number);
      const data = STEP_ZERO_MATRICES[matrixKey], value = data.values[entry][component];
      bits = numberToBits(value); intendedText = null; selectedInput = true; inspectorOrigin = `${data.label} entry (${Math.floor(entry / 2) + 1}, ${entry % 2 + 1}) · ${component ? 'imaginary' : 'real'} coordinate · exact frozen value`;
      q('[data-s0-decimal]').value = scalar(value).replace('−', '-'); q('[data-s0-error]').hidden = true; renderInspector(); renderMatrix();
      q(`[data-s0-coordinate="${entry},${component}"]`).focus({ preventScroll: true });
    }
  }, { signal });
  root.addEventListener('keydown', event => {
    const button = event.target.closest('[data-s0-bit]'); if (!button) return;
    const i = Number(button.dataset.s0Bit), delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[event.key];
    if (delta !== undefined) { event.preventDefault(); q(`[data-s0-bit="${Math.max(0, Math.min(63, i + delta))}"]`).focus(); }
  }, { signal });
  // Internal lesson links must not replace the application's #step-00 route.
  root.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#s0-"]'); if (!link) return;
    const target = q(link.getAttribute('href')); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }
  }, { signal });
  renderFraction(); renderInspector(); renderMatrix();
  return () => abort.abort();
}
