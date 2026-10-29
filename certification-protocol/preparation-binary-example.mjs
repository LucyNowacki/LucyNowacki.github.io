import {math} from './math-render.mjs?v=103';
const tex=String.raw;
const eq=t=>`<div class="prep-binary-equation">${math(t)}</div>`;
const bits='0011111111100011101001000101000101101001100110001011000011000010';
const fraction='0011101001000101000101101001100110001011000011000010';
const grouped=s=>s.match(/.{1,4}/g).map(g=>`<code>${g}</code>`).join('');
export function binaryWorkedExample(){return `<section class="prep-section prep-binary-example" aria-labelledby="prep-binary-title">
 <p class="eyebrow">WORKED EXAMPLE · ONE REAL COMPONENT OF THE FROZEN SCHUR DATA</p>
 <h2 id="prep-binary-title">From 0.61380835174852444 to an exact ACB point</h2>
 <p>Follow the real part of ${math(tex`(T_2^\circ)_{11}`)} from its displayed decimal to its stored bits, exact dyadic fraction and zero-radius enclosure.</p>
 <div class="prep-callout"><strong>Where this belongs:</strong> P2 produces the numerical Schur factors. P3 freezes their existing bits, and P5 embeds the resulting dyadics exactly. The decimal-to-binary conversion below reconstructs this one stored value; it is not a claim that the whole Schur computation performs only one rounding.</div>
 <ol class="prep-binary-steps">
 <li><h3><span>1</span> Read the decimal as binary64</h3>
 <p>Start with the decimal text <code>0.61380835174852444</code>. Parsing it as binary64, with rounding to nearest, ties to even, selects the following 64-bit value. This parsing is one rounding operation.</p>
 <div class="prep-binary-hex"><span>Stored hexadecimal pattern</span><code>0x3fe3a4516998b0c2</code></div>
 <p class="prep-small">Select a field to see what it contributes. Spaces group bits for readability; they are not part of the stored value.</p>
 <div class="prep-binary-fields" aria-label="The three binary64 fields">
 <button type="button" class="prep-bit-sign" data-binary-field="sign" aria-pressed="false"><strong>Sign · 1 bit</strong><span class="prep-bit-digits"><code>0</code></span></button>
 <button type="button" class="prep-bit-exponent" data-binary-field="exponent" aria-pressed="true"><strong>Exponent · 11 bits</strong><span class="prep-bit-digits"><code>01111111110</code></span></button>
 <button type="button" class="prep-bit-fraction" data-binary-field="fraction" aria-pressed="false"><strong>Fraction · 52 bits</strong><span class="prep-bit-digits">${grouped(fraction)}</span></button>
 </div>
 <div class="prep-bit-explanation" data-binary-explanation aria-live="polite"></div>
 <details class="prep-binary-details"><summary>See the complete 64-bit string</summary><code class="prep-binary-long">${bits}</code></details>
 </li>
 <li><h3><span>2</span> Decode the exponent</h3>
 <p>The stored exponent bits give ${math('E=1022')}. Subtract the binary64 bias:</p>
 ${eq(tex`e=E-1023=1022-1023=-1.`)}
 <p>This is a normal binary64 value, so its significand has an implicit leading ${math('1')}:</p>
 ${eq(tex`x_{\mathrm{bin64}}=(1.f)_2\,2^{-1}.`)}
 <p>Here ${math('f')} denotes the 52 fraction bits above.</p>
 </li>
 <li><h3><span>3</span> Decode the significand and reduce the fraction</h3>
 <p>The fraction field is the integer</p>${eq(tex`F=1025094501052610.`)}
 <p>Restore the implicit leading bit:</p>${eq(tex`M=2^{52}+F=5528694128423106.`)}
 ${eq(tex`x_{\mathrm{bin64}}=\frac{5528694128423106}{2^{52}}\,2^{-1}`)}
 ${eq(tex`=\frac{5528694128423106}{2^{53}}.`)}
 <p>The numerator is even. Cancel a factor of two:</p>
 ${eq(tex`x_{\mathrm{bin64}}=\frac{2764347064211553}{2^{52}}`)}
 ${eq(tex`=\frac{2764347064211553}{4503599627370496}.`)}
 <details class="prep-binary-details"><summary>Reproduce the exact ratio in Python</summary><pre><code>x = float("0.61380835174852444")
x.as_integer_ratio()
# (2764347064211553,
#  4503599627370496)</code></pre><p>The returned integers describe the stored float exactly.</p></details>
 </li>
 <li><h3><span>4</span> Separate the short display from the exact value</h3>
 <div class="prep-decimal-comparison"><div><h4>Short decimal display</h4><code class="prep-binary-long">0.61380835174852444</code></div><div><h4>Exact decimal expansion of the stored dyadic</h4><code class="prep-binary-long">0.6138083517485244389177978519001044332981109619140625</code></div></div>
 <p>The short display reads back to the same binary64 value. Taken as an exact decimal rational, however, it is slightly different from that stored value. The long expansion above is exactly the fraction from Step 3.</p>
 <div class="prep-binary-emphasis">Freezing keeps the stored dyadic value. It does not replace it by the decimal rational suggested by the short printed text.</div>
 </li>
 <li><h3><span>5</span> Use the common denominator in the frozen matrix</h3>
 <p>Our frozen ${math(tex`T_2^\circ`)} is displayed over the convenient common denominator ${math(tex`2^{56}`)}. Since ${math(tex`2^{56}=16\cdot2^{52}`)}, multiply numerator and denominator by ${math('16')}:</p>
 ${eq(tex`\frac{2764347064211553}{2^{52}}=\frac{16\cdot2764347064211553}{2^{56}}`)}
 ${eq(tex`=\frac{44229553027384848}{2^{56}}.`)}
 <p>The imaginary component is frozen in the same way:</p>
 ${eq(tex`\operatorname{Im}(T_2^\circ)_{11}=\frac{4635511635802059}{2^{54}}`)}
 ${eq(tex`=\frac{18542046543208236}{2^{56}}.`)}
 <p>Together they give exactly the displayed complex entry:</p>
 ${eq(tex`(T_2^\circ)_{11}=\frac{44229553027384848+18542046543208236\,i}{2^{56}}.`)}
 <p>Changing the denominator changes the representation only. It adds no approximation.</p>
 </li>
 <li><h3><span>6</span> Embed the integers as exact Arb/ACB inputs</h3>
 <p>For the real component, retain the exact integer pair</p>
 <div class="prep-binary-integers"><div><span>Numerator ${math('m')}</span><code>2764347064211553</code></div><div><span>Denominator ${math('n')}</span><code>4503599627370496 = 2⁵²</code></div></div>
 <p>Import the dyadic ${math(tex`m\,2^{-52}`)} exactly into Arb. Direct dyadic assignment preserves it; a precision-limited conversion must retain all significant bits. Here 53-bit precision suffices for both frozen components.</p>
 ${eq(tex`x_{\mathrm{Arb}}=[x\pm0]=[x,x].`)}
 <p>ACB stores this real Arb point together with the exact imaginary Arb point:</p>
 ${eq(tex`(T_2^\circ)_{11}\longmapsto[x,x]+i[y,y].`)}
 <div class="prep-binary-point-pair"><div class="prep-component-real"><b>Real Arb component</b>${math(tex`x=44229553027384848/2^{56}`)}<span>radius = 0</span></div><b aria-hidden="true">+</b><div class="prep-component-imag"><b>Imaginary Arb component</b>${math(tex`y=18542046543208236/2^{56}`)}<span>radius = 0, multiplied by ${math('i')}</span></div><b aria-hidden="true">=</b><div><b>One exact ACB point</b><span>Both component radii are zero.</span></div></div>
 <p>There is no second decimal-to-binary rounding step. Later arithmetic may produce positive-radius enclosures for computed defects.</p>
 <a class="prep-definition-source" href="https://github.com/flintlib/flint/blob/main/doc/source/arb.rst" target="_blank" rel="noopener noreferrer">FLINT: exact assignment and rounding ↗</a>
 </li>
 </ol>
 <div class="prep-binary-route" aria-label="The complete conversion route"><span>Decimal text<br><code>0.61380835174852444</code></span><b>→</b><span>Binary64 bits<br><code>0x3fe3a4516998b0c2</code><small>One rounding when parsing text</small></span><b>→</b><span>Exact dyadic<br>${math(tex`2764347064211553/2^{52}`)}</span><b>→</b><span>Common denominator<br>${math(tex`44229553027384848/2^{56}`)}</span><b>→</b><span>Exact Arb real component<br><small>Pair with the imaginary Arb component to form ACB</small></span></div>
 <div class="prep-callout"><strong>The key idea:</strong> once the numerical Schur computation has produced its bits, P3 freezes those bits as exact dyadic inputs. P5 preserves them exactly. P6 separately validates how well the frozen factors represent the midpoint matrix.</div>
 </section>`;}
export function mountBinaryWorkedExample(root,signal){
 const descriptions={
  sign:`<strong>Sign:</strong> the bit is <code>0</code>, so ${math(tex`(-1)^0=+1`)}. This component is positive.`,
  exponent:`<strong>Exponent:</strong> <code>01111111110</code> encodes ${math(tex`E=1022`)}. Remove the bias ${math('1023')} to obtain ${math(tex`e=-1`)}.`,
  fraction:`<strong>Fraction:</strong> the 52 bits encode ${math(tex`F=1025094501052610`)}. The leading ${math('1')} is implicit, so the full integer significand is ${math(tex`M=2^{52}+F`)}.`
 };
 const select=key=>{root.querySelectorAll('[data-binary-field]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.binaryField===key)));root.querySelector('[data-binary-explanation]').innerHTML=descriptions[key];};
 root.addEventListener('click',e=>{const b=e.target.closest('[data-binary-field]');if(b)select(b.dataset.binaryField);},{signal});select('exponent');
}
