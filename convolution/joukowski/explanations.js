/* Contextual reading guides. Numerical values come from the lesson's engine. */
(() => {
  'use strict';
  const topics = {
    lattice: ['#lattice-card', 'The coefficient lattice'],
    term: ['#term-card', 'One point → one summand'],
    spectrum: ['#spectrum-card', 'Fourier coefficients of one Legendre mode'],
    pair: ['#pair-card', 'The selected reciprocal pair'],
    mode: ['#mode-card', 'The complete mode'],
    mapping: ['#mapping-card > div', 'The underlying Joukowski map'],
    factor: ['.derivation .card:nth-child(1)', 'Factor the quadratic'],
    expand: ['.derivation .card:nth-child(2)', 'Expand each factor'],
    match: ['.derivation .card:nth-child(3)', 'Match the degree'],
    series: ['.convergence', 'Watch the generating series converge'],
    binomial: ['.proof', 'Where the coefficients αⱼ come from'],
    amplitude: ['.amplitude-note', 'Keep the amplitude separate from the shape']
  };
  const live = name => `<span data-live="${name}"></span>`;
  const key = (kind, words) => `<strong class="${kind}-key">${words}</strong>`;
  const T = String.raw;

  function content(topic, { S, M, terms, tex, fraction, fmt, pairFormula }) {
    const v = terms[S.j], w = fraction(v.weight, S.n, true);
    const equation = body => `<div class="math-block">${tex(body)}</div>`;
    const now = body => `<div class="explanation-now"><h4>With your current controls</h4>${body}</div>`;
    const tryIt = body => `<p class="explanation-try"><strong>Try this.</strong> ${body}</p>`;
    const selected = `<p>The ${key('selected', 'gold ring')} picks (p, q) = (${v.p}, ${v.q}): degree ${S.n}, frequency ${v.k > 0 ? '+' : ''}${v.k}.</p>`;
    const contribution = `<p>Coefficient Cⱼ = ${live('coefficient')}<br>At t = ${live('angle')}, Cⱼeⁱᵏᵗ = ${live('contribution')}</p>`;
    const guides = {
      lattice: () => `<p>Think of each dot as one way to choose a term from each of two power series. Moving right increases p; moving up increases q.</p>
        <p>The ${key('degree', 'violet diagonal')} collects all choices with the same total degree p + q = n. The ${key('pair', 'dashed frequency line')} collects choices with the same difference p − q = k.</p>
        ${equation(T`(z^p u^p)(z^{-q}u^q)=z^{p-q}u^{p+q}`)}
        <p>So one dot answers two questions at once: which Legendre degree receives this product, and how fast its complex vector rotates. Along a fixed violet diagonal, each step left and up reduces the frequency by 2.</p>
        ${now(selected + `<p>Swapping the coordinates gives (${v.q}, ${v.p}). ${v.k === 0 ? 'This is the same point: its frequency is zero.' : `It keeps degree ${S.n} and reverses the frequency to ${-v.k}. These two points form the reciprocal pair.`}</p>`)}
        ${tryIt('Select another dot on the violet diagonal. Follow its gold ring into the spectrum and its vector into the pair diagram in View together.')}`,
      term: () => `<p>A lattice dot becomes one rotating arrow. Build that arrow in three stages: give it a structural weight, stretch it radially, then apply the whole mode’s amplitude.</p>
        ${equation(T`C_j=A\alpha_j\alpha_{n-j}r^k,\qquad k=n-2j,\qquad T_j(t)=C_j e^{ikt}`)}
        <p>The positive real weight αⱼαₙ₋ⱼ depends on the polynomial degree and chosen term. The factor rᵏ distinguishes reciprocal frequencies. A may be complex, so it scales and rotates the coefficient. Finally eⁱᵏᵗ rotates that fixed coefficient as t changes.</p>
        ${now(selected + equation(T`C_{${S.j}}=A\,${w}\,r^{${v.k}}`) + contribution)}
        ${tryIt('Pin this explanation and move Angle. For k ≠ 0 and A ≠ 0, the contribution changes direction while its coefficient stays fixed; otherwise it stays still. Then change Magnitude or Phase to change the coefficient itself.')}`,
      spectrum: () => `<p>Each bar measures the length of one complex coefficient. Its horizontal position gives the signed rotation frequency; its height is always a nonnegative magnitude.</p>
        ${equation(T`\text{bar height}=|C_j|=|A|\alpha_j\alpha_{n-j}r^{n-2j},\qquad |e^{ikt}|=1`)}
        <p>${key('positive', 'Cyan')} means positive k, rotating anticlockwise as t increases. ${key('negative', 'Orange')} means negative k, rotating clockwise. A ${key('degree', 'violet')} k = 0 term is stationary. Negative frequency does not mean negative bar height.</p>
        <p>For r &gt; 1 and |A| &gt; 0, a positive-frequency bar is taller than its reciprocal partner: their height ratio is r²ᵏ for k &gt; 0 and |A| &gt; 0. At r = 1 the two heights agree. The bars alone do not show the coefficient phases.</p>
        ${now(selected + `<p>The selected height is ${live('magnitude')}.</p>` + contribution)}
        ${tryIt('Press Play in View together: the bars stay still while the arrows rotate. Change r to alter the balance between positive and negative frequencies.')}`,
      pair: () => v.k === 0 ? `<p>You selected the centre of an even-degree diagonal. Swapping p and q returns the same point, so there is only one contribution.</p>
        ${equation(T`k=0,\qquad e^{i0t}=1,\qquad T_{${S.j}}=A\alpha_{${S.j}}^2`)}
        <p>The plot shows a fixed point; it is not the sum of two copies. Its position changes with A, but not with t or r.</p>
        ${now(`<p>Constant contribution: ${live('contribution')}</p>`)}
        ${tryIt('Move Angle to confirm that the point stays still. Select a noncentral lattice point to see a pair of counter-rotating arrows.')}` : `<p>Imagine two clock hands sharing one centre. The ${key('positive', 'cyan hand')} turns anticlockwise and the ${key('negative', 'orange hand')} turns clockwise, at the same speed |k|. For r &gt; 1 and A ≠ 0 their lengths differ.</p>
        <p>To add them, slide the orange arrow to the tip of the cyan arrow without turning it. The ${key('pair', 'green arrow')} reaches their sum. Its endpoint follows an ellipse because, before rotation by A, the horizontal oscillations add and the vertical oscillations subtract.</p>
        <div class="math-block">${pairFormula}</div>
        <p>Before multiplication by A, the semiaxes are w(rᵏ + r⁻ᵏ) and w(rᵏ − r⁻ᵏ), where w = αⱼαₙ₋ⱼ and here k means the positive frequency |n − 2j|. Multiplication by A scales both axes by |A| and rotates the ellipse by arg A.</p>
        ${now(`<p>Frequencies ±${Math.abs(v.k)}; semiaxes ${live('pairAxes')}.<br>Selected arrow: ${live('contribution')}<br>Green sum: ${live('pairSum')}</p>`)}
        <p>The gold ring marks your selected arrow, which may be either partner. At r = 1 the ellipse becomes a segment. At A = 0 it collapses to the origin. For a nondegenerate ellipse the pair completes |k| circuits as t goes from 0° to 360°.</p>
        ${tryIt('Pin this window and press Play. Set Phase to 0 and then r to 1 to see the two vertical motions cancel.')}`,
      mode: () => `<p>Now join every Fourier arrow head-to-tail. Each arrow keeps its own length and rotation speed. The ${key('degree', 'purple endpoint')} is where the whole chain ends; the ${key('selected', 'gold arrow')} is the summand chosen in the lattice.</p>
        ${equation(T`A P_n(\Gamma_r(t))=\sum_{j=0}^{n}C_j e^{i(n-2j)t}`)}
        <p>The purple curve records this total as t makes a full turn. Several reciprocal pairs usually produce a more complicated curve than an ellipse. A stationary k = 0 term, when present, translates the sum.</p>
        ${now(`<p>There are ${S.n + 1} arrows in degree ${S.n}. Their endpoint is ${live('mode')}.</p><p>${S.n === 0 ? 'For n = 0 the entire mode is the constant A.' : S.n === 1 ? 'For n = 1 there is just one reciprocal pair, giving the scaled and rotated Joukowski ellipse.' : S.n === 2 ? 'For n = 2 there is one reciprocal pair plus A/4, giving an ellipse centred at A/4.' : 'This degree combines several reciprocal pairs.'}</p>`)}
        <p>At r = 1 all unscaled mode values are real; multiplying by A places the trajectory on a line. At A = 0 every arrow vanishes. The displayed recurrence residual is a numerical consistency check.</p>
        ${tryIt('Change the selected term: the highlighted arrow changes, but the total endpoint stays the same. Move Angle to move the entire chain.')}`,
      mapping: () => `<p>The two gold dots are the same parameter t viewed through two coordinate systems. The left dot travels on a circle. Averaging z and its reciprocal z⁻¹ sends it to the ellipse on the right.</p>
        ${equation(T`\omega=\tfrac12(z+z^{-1})=\tfrac12(r+r^{-1})\cos t+i\,\tfrac12(r-r^{-1})\sin t`)}
        <p>The reciprocal reverses the angle and changes the radius from r to 1/r. Horizontal motions add; vertical motions subtract. This gives ellipse semiaxes (r + r⁻¹)/2 and (r − r⁻¹)/2.</p>
        ${now(`<p>z = ${live('z')}<br>ω = ${live('omega')}<br>r = ${fmt(S.r)}, t = ${live('angle')}</p>`)}
        <p>ω is the point where Pₙ is evaluated. The complete-mode plot shows the resulting value A Pₙ(ω), in a different complex plane. Changing A affects that value plot, not this coordinate map.</p>
        ${tryIt('Set r = 1. The circle maps onto the segment [−1, 1], travelled in both directions as t runs around the circle.')}`,
      factor: () => `<p>The quadratic needs two numbers whose sum is 2ω and whose product is 1. The Joukowski map supplies exactly that reciprocal pair: z and z⁻¹.</p>
        ${equation(T`z+z^{-1}=2\omega,\quad zz^{-1}=1`)}
        ${equation(T`1-2\omega u+u^2=(1-zu)-z^{-1}u(1-zu)`)}
        ${equation(T`=(1-zu)(1-z^{-1}u)`)}
        <p>Geometrically, z = reⁱᵗ and z⁻¹ = r⁻¹e⁻ⁱᵗ rotate in opposite directions. Algebraically, they split one quadratic denominator into two linear factors that can each be expanded.</p>
        ${now(`<p>z = ${live('z')}<br>z⁻¹ = ${live('inverseZ')}</p>`)}
        ${tryIt('Move Angle. The reciprocal pair changes, while its product stays 1 and its average follows the Joukowski ellipse.')}`,
      expand: () => `<p>Think of each factor as a shelf of terms labelled by degree. The first shelf carries powers zᵖ; the second carries reciprocal powers z⁻ᑫ. Both use the same binomial weights α.</p>
        ${equation(T`(1-zu)^{-1/2}=\sum_{p\ge0}\alpha_p z^p u^p`)}
        ${equation(T`(1-z^{-1}u)^{-1/2}=\sum_{q\ge0}\alpha_q z^{-q}u^q`)}
        <p>Multiplying the shelves means taking every possible pair of terms. The pair (p, q) lands on the corresponding lattice dot, with total degree p + q and rotation frequency p − q.</p>
        ${now(`<p>|zu| = ${live('rho')}; |z⁻¹u| = ${live('inverseRatio')}. Both are below 1, so both binomial series converge absolutely. The branches are chosen to equal 1 at u = 0.</p>`)}
        ${tryIt('Increase Distance toward the convergence boundary. Terms generally decay more slowly. Keep u distinct from A: u weights generating degrees, whereas A scales a single Legendre mode.')}`,
      match: () => `<p>To find the coefficient of uⁿ, collect only pairs whose degree labels add to n. This is why a diagonal, rather than a row or column, is selected in the lattice.</p>
        ${equation(T`[u^n]\sum_{p,q\ge0}\alpha_p\alpha_q z^{p-q}u^{p+q}=\sum_{j=0}^n\alpha_j\alpha_{n-j}z^{n-2j}`)}
        <p>Writing q = j and p = n − j lists every point on that diagonal once. The sum p + q stays fixed while the difference p − q changes: one polynomial degree contains several Fourier frequencies.</p>
        ${now(selected + equation(T`[u^{${S.n}}]\bigl(\alpha_{${v.p}}\alpha_{${v.q}}z^{${v.k}}u^{${S.n}}\bigr)=${w}z^{${v.k}}`))}
        <p>This is convolution of the two coefficient sequences in the generating degree. It does not slide sampled values around the ellipse.</p>
        ${tryIt('Switch to Match coefficients and choose a new degree. Count n + 1 points and read the frequencies n, n − 2, …, −n.')}`,
      series: () => `<p>The ${key('degree', 'purple chain')} is a walk through successive approximations. Start at G₀ = 1. Each new edge adds one more degree’s contribution Pₘ(ω)uᵐ. The ${key('pair', 'green ring')} is the exact generating-function value.</p>
        ${equation(T`G_m-G_{m-1}=P_m(\Gamma_r(t))u^m\quad(m\ge1)`)}
        <p>The distance from the last purple point to the green ring is the absolute truncation error. Complex contributions can cancel or reinforce, so that distance need not shrink at every step. The chain may zigzag while converging.</p>
        ${now(`<p>N = ${live('order')}, u = ${live('u')}, ru = ${live('rho')}<br>Last point: ${live('partial')}<br>Target: ${live('exact')}<br>Distance: ${live('error')}<br>Tail bound: ${live('bound')}</p>`)}
        ${equation(T`|G-G_N|\le\frac{(ru)^{N+1}}{1-ru},\qquad 0\le u<1/r`)}
        <p>This bound controls the mathematical tail, not floating-point rounding. Increasing N extends the chain. Changing t moves the chain and its target together. A and the selected degree n do not enter this generating series; its truncation degree is N.</p>
        ${tryIt('Keep t and ru fixed and increase N. Use Fit partial sums to see the whole walk, then Plot zoom to inspect the endpoint. Zoom changes the view only; Re and Im keep equal scales.')}`,
      binomial: () => `<p>The αⱼ are the fixed Taylor weights of (1 − v)⁻¹ᐟ². They tell you how much of each power vʲ is needed near zero.</p>
        ${equation(T`(1-v)^{-1/2}=1+\tfrac12v+\tfrac38v^2+\tfrac5{16}v^3+\cdots`)}
        <p>Differentiating j times and evaluating at zero isolates the jth Taylor coefficient after division by j!. This gives a simple rule for generating the weights:</p>
        ${equation(T`\alpha_0=1,\qquad\alpha_{j+1}=\frac{2j+1}{2j+2}\alpha_j=\frac{\binom{2j+2}{j+1}}{4^{j+1}}`)}
        <p>Every step multiplies by a positive fraction below 1. The weights decrease, while the powers of v provide geometric decay when |v| &lt; 1. These weights are structural; they are not the chosen mode amplitude A.</p>
        ${now(equation(T`\alpha_{${v.q}}\alpha_{${v.p}}=${fraction(M.alpha(v.q),v.q,true)}\cdot${fraction(M.alpha(v.p),v.p,true)}=${w}`))}
        ${tryIt('Choose different lattice points to see how the two Taylor weights combine. Reciprocal partners have the same structural weight because the two factors are simply exchanged.')}`,
      amplitude: () => `<p>Think of Pₙ as a complete shape and A = aₙ(f) as its volume and orientation controls. Multiplying by |A| stretches the whole picture; multiplying by eⁱᵠ rotates it through φ.</p>
        ${equation(T`A P_n(\Gamma_r(t))=\sum_{j=0}^n\underbrace{A\alpha_j\alpha_{n-j}r^{n-2j}}_{C_j}\,e^{i(n-2j)t}`)}
        <p>Every Fourier component inside this mode receives the same A. The Joukowski substitution changes how the shape is represented; it does not change its Legendre coefficient.</p>
        ${now(`<p>A = ${live('amplitude')}<br>Selected Fourier coefficient: ${live('coefficient')}<br>Complete mode value: ${live('mode')}</p>`)}
        <p>For a full Legendre expansion, several degrees can contribute to the same Fourier frequency, so their coefficients add. Evaluating an infinite expansion on an ellipse also requires analytic extension and convergence there.</p>
        ${tryIt('Change Phase while holding t fixed: all arrows and the complete curve rotate, but the spectrum heights stay the same. Set Magnitude to zero to collapse the value plots to the origin.')}`
    };
    return `<article class="intuitive-explanation" data-explanation-topic="${topic}"><h3>${topics[topic][1]}</h3><p class="hint">Pin this window to read it alongside the plots. Values follow your controls.</p>${guides[topic]()}</article>`;
  }
  window.JoukowskiExplanations = Object.freeze({ topics, content });
})();
