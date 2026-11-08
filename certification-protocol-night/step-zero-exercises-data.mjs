/* Three independent practice models for the default Step 00 lesson.
   These data never replace the certification explorer's prescribed matrices.
   Mathematical sources checked: numerical_certification_transfer.tex,
   exact-dyadic Hardy-matrix replacement and the two finite homotopy gates. */
const tex = String.raw;
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const m = source => `<span class="site-math" data-tex="${esc(source)}"></span>`;
const eq = source => `<div class="s0x-equation">${m(source)}</div>`;
const matrix = (label, entries, note = '') => ({ label, entries, note });
const A1 = [['1/2', '1/4'], ['−1/8', '3/4']];
const M2 = [['1/2 + i/4', '1/4'], ['0', '3/4 − i/4']];
const H2 = [['(35+20i)/64', '1/4'], ['0', '3/4 − i/4']];
const E2 = [['(3+4i)/64', '0'], ['0', '0']];
const S3 = [['1/4', '0'], ['0', '3/4']];
const M3 = [['9/32', '0'], ['0', '25/32']];
const H3 = [['5/16', '0'], ['0', '3/4']];
const circle = { center: 1 / 4, radius: 1 / 8 };

export const STEP_ZERO_EXERCISES = [
  {
    id: 'exact-matrix',
    title: 'Build an exact dyadic matrix',
    summary: 'Fractions → binary digits → a matrix acting on a vector.',
    objective: 'See how exact entries identify a matrix, and why one calculation is not yet a certificate.',
    context: 'This is a separate 2 × 2 practice midpoint. Work with exact fractions on paper. The explorer’s default matrices stay unchanged.',
    setupHTML: `<p>A dyadic rational is an integer divided by a power of two. Negative numbers and zero are allowed. In a dyadic matrix, every real and imaginary coordinate has this form.</p>${eq(tex`A^{\circ}=\begin{bmatrix}\frac12&\frac14\\-\frac18&\frac34\end{bmatrix},\qquad x=\begin{bmatrix}\frac12\\\frac14\end{bmatrix}.`)}<p>All vectors in these exercises are columns. The input x here is a chosen vector, not a unit vector.</p>`,
    visual: { type: 'dyadic-grid', matrices: [matrix('Given practice midpoint A°', A1)], caption: 'Read each entry as an exact fraction. The negative sign belongs to the lower-left entry.' },
    steps: [
      {
        id: 'common-denominator', title: 'Put the entries on one binary grid',
        prompt: 'Find the smallest common denominator that is a power of two. Write A° as an integer matrix divided by that denominator.',
        hint: 'The denominators are 2, 4, 8, and 4. Rewrite each fraction in eighths, keeping the lower-left minus sign.',
        solution: [
          'The largest required denominator is 8 = 2³. Both 2 and 4 divide 8, so eighths form a grid containing every entry.',
          eq(tex`\frac12=\frac48,\quad\frac14=\frac28,\quad-\frac18=-\frac18,\quad\frac34=\frac68.`),
          eq(tex`A^{\circ}=\frac18\begin{bmatrix}4&2\\-1&6\end{bmatrix}.`),
          'The lower-left entry already has denominator 8 in lowest terms, so denominator 4 would not work. The integer matrix and denominator specify A° exactly, without decimal rounding.'
        ],
        visual: { type: 'dyadic-grid', denominator: 8, matrices: [matrix('A° = (1/8) × this integer matrix', [['4', '2'], ['−1', '6']])], caption: 'Every entry is an integer number of eighths.' }
      },
      {
        id: 'binary-fractions', title: 'Read each entry in binary',
        prompt: 'Write the four entries using three binary fractional places. Which of the weights 1/2, 1/4, and 1/8 are switched on?',
        hint: 'The first place after the binary point has weight 1/2, the second 1/4, and the third 1/8. Write a minus sign separately for a negative number. These are mathematical binary fractions, not full binary64 encodings.',
        solution: [
          eq(tex`\frac12=(0.100)_2,\qquad\frac14=(0.010)_2,`),
          eq(tex`-\frac18=-(0.001)_2,\qquad\frac34=(0.110)_2.`),
          'For 3/4, the first two places contribute 1/2 + 1/4. The final zero contributes no eighth. Trailing zeros do not change a binary fraction.',
          'These four values also fit binary64 exactly. That does not make every later floating-point computation exact. General arithmetic can round, and some dyadics require more precision or a larger exponent range than binary64 provides.'
        ],
        visual: { type: 'dyadic-grid', binaryRows: [{ label: '1/2', bits: '100' }, { label: '1/4', bits: '010' }, { label: '−1/8', bits: '001', negative: true }, { label: '3/4', bits: '110' }], caption: 'Column weights: 1/2, 1/4, 1/8. For −1/8 the sign is separate.' }
      },
      {
        id: 'matrix-vector', title: 'Multiply the matrix by the input',
        prompt: 'Compute y = A°x. Write out the two row-by-column calculations before simplifying.',
        hint: 'For the first output, multiply the first row of A° by the column x and add. Repeat with the second row. Use denominator 16 for the first sum and denominator 16 for the second sum.',
        solution: [
          eq(tex`y_1=\frac12\cdot\frac12+\frac14\cdot\frac14=\frac14+\frac1{16}=\frac5{16}.`),
          eq(tex`y_2=-\frac18\cdot\frac12+\frac34\cdot\frac14=-\frac1{16}+\frac3{16}=\frac18.`),
          eq(tex`y=A^{\circ}x=\begin{bmatrix}5/16\\1/8\end{bmatrix}.`),
          'Each output combines both entries in its row. Products and sums of dyadic rationals are still dyadic when evaluated exactly. Here the fractions are small enough that these particular products and sums are also exactly representable in binary64.'
        ],
        visual: { type: 'dyadic-grid', matrices: [matrix('A°', A1), matrix('Input x', [['1/2'], ['1/4']]), matrix('Output A°x', [['5/16'], ['1/8']])], caption: 'Match each output coordinate to one row-by-column calculation.' }
      },
      {
        id: 'one-vector-is-not-uniform', title: 'Connect the calculation to certification',
        prompt: 'Set z = 1. Compute (I − A°)x = x − y. Does a nonzero result for this single input prove that I − A° is invertible?',
        hint: 'Subtract corresponding coordinates. A square matrix is invertible only if it sends no nonzero vector to zero. One chosen vector cannot test every direction.',
        solution: [
          eq(tex`(I-A^{\circ})x=\begin{bmatrix}1/2-5/16\\1/4-1/8\end{bmatrix}=\begin{bmatrix}3/16\\1/8\end{bmatrix}.`),
          'This output is nonzero. It checks this particular input at this particular z only. For example, diag(1, 0) sends (1, 0) to a nonzero output but sends (0, 1) to zero, so it is not invertible.',
          'Certification instead seeks a positive lower bound on the output length for every unit input, uniformly over every z on the contour. This is why exact entries prepare the problem but do not certify it by themselves.',
          eq(tex`\|(zI-A^{\circ})u\|_2\ge a>0\quad\text{for every }z\in\Gamma\text{ and every }\|u\|_2=1.`)
        ],
        visual: { type: 'dyadic-grid', matrices: [matrix('Selected input x', [['1/2'], ['1/4']]), matrix('Selected shifted output (I − A°)x', [['3/16'], ['1/8']])], caption: 'One selected input gives one output. A uniform certificate must cover all unit directions and the whole contour.' }
      }
    ]
  },
  {
    id: 'entry-enclosure',
    title: 'Turn entry rectangles into a Gate 2 allowance',
    summary: 'Rectangle centres → exact midpoint → one error matrix → a bound for every allowed matrix.',
    objective: 'Distinguish the midpoint, a selected target, and the uncertainty surrounding all allowed targets.',
    context: 'This is a second, separate practice model. H plays the role of the finite Hardy target A₂,ᴍˣ. Its entries are dyadic here to keep the arithmetic short. A real certification target need not be dyadic.',
    setupHTML: `<p>Each complex entry lies in a rectangle. The horizontal interval bounds its real part, and the vertical interval bounds its imaginary part. Divide every endpoint in this table by 64.</p><table><thead><tr><th>Entry</th><th>Real numerator interval</th><th>Imaginary numerator interval</th></tr></thead><tbody><tr><td>(1, 1)</td><td>[29, 35]</td><td>[12, 20]</td></tr><tr><td>(1, 2)</td><td>[13, 19]</td><td>[−4, 4]</td></tr><tr><td>(2, 1)</td><td>[−3, 3]</td><td>[−4, 4]</td></tr><tr><td>(2, 2)</td><td>[45, 51]</td><td>[−20, −12]</td></tr></tbody></table><p>For comparison, use this one selected target inside the rectangles:</p>${eq(tex`H=\frac1{64}\begin{bmatrix}35+20i&16\\0&48-16i\end{bmatrix}.`)}<p>Assume a previous gate has already established the uniform midpoint guarantee <strong>a° = 1/4</strong> on a fixed contour Γ. This is supplied information for this exercise, not something inferred from the entry plot.</p>`,
    visual: { type: 'entry-box', bounds: { re: [29 / 64, 35 / 64], im: [12 / 64, 20 / 64] }, center: [1 / 2, 1 / 4], actual: [35 / 64, 20 / 64], halfWidths: [3 / 64, 4 / 64], revealCenter: false, revealActual: true, revealRadii: false, matrices: [matrix('Given selected target H', H2)], caption: 'The first entry’s rectangle in the complex plane. Red is the given selected target entry. Find the centre on paper.' },
    steps: [
      {
        id: 'midpoint', title: 'Find the exact dyadic midpoint matrix',
        prompt: 'Find the centre of all four rectangles. Combine each real centre and imaginary centre into a complex entry of A°.',
        hint: 'The centre of [l, r] is (l + r)/2. Average real endpoints and imaginary endpoints separately. For entry (1, 1), the real centre is (29 + 35)/(2 × 64).',
        solution: [
          'The real numerator centres are 32, 16, 0, and 48. The imaginary numerator centres are 16, 0, 0, and −16.',
          eq(tex`A^{\circ}=\frac1{64}\begin{bmatrix}32+16i&16\\0&48-16i\end{bmatrix}=\begin{bmatrix}\frac12+\frac i4&\frac14\\0&\frac34-\frac i4\end{bmatrix}.`),
          'All real and imaginary coordinates are dyadic. The midpoint is a single exact matrix. The rectangles are sets of possible entries around it. Choosing the midpoint does not eliminate the uncertainty.'
        ],
        visual: { type: 'entry-box', bounds: { re: [29 / 64, 35 / 64], im: [12 / 64, 20 / 64] }, center: [1 / 2, 1 / 4], actual: [35 / 64, 20 / 64], revealCenter: true, revealActual: true, revealRadii: false, matrices: [matrix('Exact midpoint A°', M2)], caption: 'Blue is the rectangle centre. Red is the selected target entry. They are different points.' }
      },
      {
        id: 'selected-error', title: 'Subtract entries to obtain the selected error',
        prompt: 'Compute E = H − A°. Which entries change, and what are their real and imaginary changes?',
        hint: 'Subtract entry by entry, without matrix multiplication. In the first entry, subtract (32 + 16i)/64 from (35 + 20i)/64. The other entries can be checked directly.',
        solution: [
          eq(tex`E_{11}=\frac{35+20i-(32+16i)}{64}=\frac{3+4i}{64}.`),
          eq(tex`E=H-A^{\circ}=\frac1{64}\begin{bmatrix}3+4i&0\\0&0\end{bmatrix},\qquad H=A^{\circ}+E.`),
          'Only the upper-left entry moves. In its complex plane the change is 3/64 horizontally and 4/64 vertically. The target sits on a corner of the allowed rectangle, which is included.',
          'This E describes the particular H supplied in the question. A Gate 2 enclosure allowance must cover every matrix in the entry rectangles, including other possible simultaneous changes.'
        ],
        visual: { type: 'entry-box', bounds: { re: [29 / 64, 35 / 64], im: [12 / 64, 20 / 64] }, center: [1 / 2, 1 / 4], actual: [35 / 64, 20 / 64], halfWidths: [3 / 64, 4 / 64], revealCenter: true, revealActual: true, revealRadii: true, matrices: [matrix('Selected error E', E2)], caption: 'The displacement has real component 3/64 and imaginary component 4/64. This is an entry error, not an output-vector error.' }
      },
      {
        id: 'row-column-bound', title: 'Cover every entry error with one matrix allowance',
        prompt: 'Every rectangle has real half-width 3/64 and imaginary half-width 4/64. First bound the complex magnitude of any entry error. Then find the largest row sum and largest column sum of those bounds, and calculate ηA.',
        hint: 'Use the right-triangle length √(3² + 4²)/64 for one entry. Make a 2 × 2 matrix B of these nonnegative bounds. Add each row, add each column, then use ηA = √(largest row sum × largest column sum). This bounds the largest output stretch of the error matrix.',
        solution: [
          eq(tex`|\widetilde E_{ij}|\le\sqrt{(3/64)^2+(4/64)^2}=\frac5{64},\qquad B=\frac1{64}\begin{bmatrix}5&5\\5&5\end{bmatrix}.`),
          'Here Ẽ denotes the error of any allowed target. Every row sum of B is 10/64, and every column sum is 10/64. Therefore both maxima equal 5/32.',
          eq(tex`\eta_\infty=\eta_1=\frac5{32},\qquad \eta_A=\sqrt{\eta_1\eta_\infty}=\frac5{32},\qquad\|\widetilde E\|_2\le\frac5{32}.`),
          'The bound means that, for every input v, the change in output has length at most (5/32) times the length of v. For a unit input, the allowed output error radius is 5/32.',
          eq(tex`\|\widetilde E v\|_2\le\eta_A\|v\|_2.`),
          'Our selected E has only one nonzero entry, so its actual operator norm is 5/64. The larger allowance 5/32 protects the entire entry box, not only this convenient selected example.'
        ],
        visual: { type: 'dyadic-grid', matrices: [matrix('Entry-magnitude bounds B', [['5/64', '5/64'], ['5/64', '5/64']], 'Each row and column sums to 5/32.')], caption: 'B contains nonnegative magnitudes. It is a bound matrix, not the signed or complex perturbation E.' }
      },
      {
        id: 'gate-two', title: 'Spend the allowance at Gate 2',
        prompt: 'The supplied midpoint bound is a° = 1/4. Does ηA pass the strict Gate 2 test? Compute the remaining guaranteed radius and explain whether it covers only the selected H or all the allowed targets.',
        hint: 'Gate 2 asks whether ηA < a°. Write 1/4 in thirty-seconds. Subtract the allowance from the midpoint guarantee. Use the reverse triangle inequality to see why the subtraction is valid.',
        solution: [
          eq(tex`\eta_A=\frac5{32}<\frac8{32}=a^{\circ},\qquad a^{\circ}-\eta_A=\frac3{32}>0.`),
          'For every z on the given contour and every unit input u, the midpoint output has length at least 1/4. Changing to an allowed target can reduce that length by at most 5/32.',
          eq(tex`\|(zI-(A^{\circ}+\widetilde E))u\|_2\ge\|(zI-A^{\circ})u\|_2-\|\widetilde E u\|_2\ge\frac3{32}.`),
          'Thus Gate 2 passes for every target inside the rectangles, including H. The guarantee also stays positive along every straight path A° + tẼ with 0 ≤ t ≤ 1. It is a guaranteed minimum output length for unit inputs, not the distance of one selected plotted point.',
          'This finite-matrix replacement step does not yet certify the full transfer operator. The later exact lift and independent operator gate have their own conditions.'
        ],
        visual: { type: 'gate-chain', stages: [{ label: 'Midpoint guarantee', radius: 1 / 4 }, { label: 'Subtract Gate 2 allowance 5/32', radius: 3 / 32 }], caption: 'Certified radius: 1/4 → 3/32. These are lower bounds, not claims that the actual shortest outputs attain them.' }
      }
    ]
  },
  {
    id: 'two-gates',
    title: 'Follow the same midpoint through two different gates',
    summary: 'Schur surrogate → midpoint → finite target, with a certificate on a whole circle.',
    objective: 'See which difference belongs to which gate, and why a zero lower bound means the test has stopped proving invertibility.',
    context: 'This third practice model uses diagonal matrices on ℂ² with the usual Euclidean norm. Diagonal entries are their eigenvalues. Take Q = I, so the Schur surrogate S equals the triangular starting matrix T and there is no similarity-conditioning loss.',
    setupHTML: `${eq(tex`S=\begin{bmatrix}1/4&0\\0&3/4\end{bmatrix},\quad A^{\circ}=\begin{bmatrix}9/32&0\\0&25/32\end{bmatrix},\quad H=\begin{bmatrix}5/16&0\\0&3/4\end{bmatrix}.`)}<p>The positively oriented contour Γ is the complete circle centred at 1/4 with radius 1/8. Its interior is the disk U.</p>${eq(tex`\Gamma=\{z\in\mathbb C:|z-1/4|=1/8\}.`)}<p>For a diagonal matrix, the smallest singular value of zI minus that matrix is the smaller of the two distances from z to its diagonal entries. A uniform contour guarantee uses the smallest such distance over the whole circle.</p>`,
    visual: { type: 'gate-chain', circle, matrices: [matrix('Given Schur surrogate S', S3), matrix('Given midpoint A°', M3), matrix('Given finite target H', H3)], stages: [{ label: 'S', eigenvalues: [1 / 4, 3 / 4] }], revealRadii: false, caption: 'The circle and the two eigenvalues of S are given. First find the smallest distance to this entire circle.' },
    steps: [
      {
        id: 'circle-moat', title: 'Find the starting guarantee on the whole circle',
        prompt: 'Find the smallest distance from Γ to each eigenvalue of S. Take the smaller distance as the starting guarantee. How many eigenvalues of S lie inside U?',
        hint: 'The first eigenvalue is the centre of the circle. The second is 1/2 away from that centre, outside the circle. For an outside point, its nearest distance to the circle is its distance to the centre minus the radius.',
        solution: [
          'The distance to the central eigenvalue 1/4 is exactly 1/8 at every point on Γ.',
          eq(tex`\min_{z\in\Gamma}|z-3/4|=|3/4-1/4|-1/8=1/2-1/8=3/8.`),
          eq(tex`s_\Gamma(S):=\min_{z\in\Gamma}\sigma_{\min}(zI-S)=\min\{1/8,3/8\}=1/8.`),
          'Exactly one eigenvalue, 1/4, lies inside U. The other eigenvalue, 3/4, is outside. This conclusion covers the full circle analytically, rather than checking a finite collection of plotted contour points.'
        ],
        visual: { type: 'gate-chain', circle, stages: [{ label: 'S: exact starting moat', eigenvalues: [1 / 4, 3 / 4], radius: 1 / 8 }], caption: 'One eigenvalue is at the centre. The nearest possible shifted output length for a unit input is uniformly 1/8.' }
      },
      {
        id: 'gate-one', title: 'Gate 1: compare the surrogate with the midpoint',
        prompt: 'Compute Δ1 = A° − S and its operator norm. Subtract that allowance from the starting guarantee. Does Gate 1 pass?',
        hint: 'Use thirty-seconds: 1/4 = 8/32 and 3/4 = 24/32. For a diagonal matrix, the operator norm is the larger absolute diagonal entry. Gate 1 uses A° − S, not H − A°.',
        solution: [
          eq(tex`\Delta_1=A^{\circ}-S=\begin{bmatrix}1/32&0\\0&1/32\end{bmatrix},\qquad\eta_{\mathrm{Schur}}=\|\Delta_1\|_2=1/32.`),
          eq(tex`1/32<1/8,\qquad a^{\circ}=1/8-1/32=3/32>0.`),
          'Gate 1 therefore transfers the starting certificate to the exact midpoint A°. For every point z on the circle and every unit input, the output length for zI − A° is at least 3/32.',
          'In this simplified example the frozen Schur coordinates are Q = I, and the residual A°Q − QT equals Δ1. In the main explorer Q is nontrivial, so its validated inverse and the residual bound also matter.'
        ],
        visual: { type: 'gate-chain', circle, matrices: [matrix('Gate 1 difference Δ1 = A° − S', [['1/32', '0'], ['0', '1/32']])], stages: [{ label: 'S', eigenvalues: [1 / 4, 3 / 4], radius: 1 / 8 }, { label: 'A° after Gate 1', eigenvalues: [9 / 32, 25 / 32], radius: 3 / 32 }], caption: 'The same midpoint A° receives Gate 1’s guarantee. Its loss is the surrogate discrepancy 1/32.' }
      },
      {
        id: 'gate-two-and-count', title: 'Gate 2: compare that midpoint with the target',
        prompt: 'Compute Δ2 = H − A°. Find its operator norm and the remaining guaranteed radius. Explain why the two gates preserve the count of one enclosed eigenvalue.',
        hint: 'Write H as diag(10/32, 24/32). Take the largest absolute diagonal change, then subtract it from the midpoint guarantee 3/32. Positive bounds must hold for every contour point throughout both straight-line paths.',
        solution: [
          eq(tex`\Delta_2=H-A^{\circ}=\begin{bmatrix}1/32&0\\0&-1/32\end{bmatrix},\qquad\eta_A=\|\Delta_2\|_2=1/32.`),
          eq(tex`1/32<3/32,\qquad s_\Gamma(H)\ge a^{\circ}-\eta_A=3/32-1/32=1/16>0.`),
          'Along S + tΔ1, the uniform bound is at least 1/8 − t/32. Along A° + tΔ2, it is at least 3/32 − t/32. Both remain positive for 0 ≤ t ≤ 1.',
          'Thus no eigenvalue crosses the contour during either continuous path. The finite target H has the same algebraic count, one, inside U. Here the final diagonal entries verify this directly: 5/16 is inside the disk, and 3/4 is outside.',
          'The two allowances happen to have the same numerical value, but they control different matrix differences. This proves a finite-matrix statement only. An operator conclusion would require the separate lift and operator gate.'
        ],
        visual: { type: 'gate-chain', circle, matrices: [matrix('Gate 2 difference Δ2 = H − A°', [['1/32', '0'], ['0', '−1/32']])], stages: [{ label: 'S', eigenvalues: [1 / 4, 3 / 4], radius: 1 / 8 }, { label: 'A°', eigenvalues: [9 / 32, 25 / 32], radius: 3 / 32 }, { label: 'H', eigenvalues: [5 / 16, 3 / 4], radius: 1 / 16 }], caption: 'Gate 1: S → A°. Gate 2: A° → H. The positive uniform guarantees preserve one enclosed eigenvalue.' }
      },
      {
        id: 'strict-threshold', title: 'Test what happens at the strict threshold',
        prompt: 'Keep A° and its guaranteed radius 3/32. Suppose a different Gate 2 error allowance is 3/32. Does the test pass? Does a zero remaining lower bound prove that every possible target is singular on Γ?',
        hint: 'Check the strict inequality ηA < a°. A zero lower bound says only that this estimate gives no positive separation. Test A° + diag(3/32, 0), and then A° + diag(−3/32, 0).',
        solution: [
          eq(tex`\eta_A=a^{\circ}=3/32,\qquad a^{\circ}-\eta_A=0.`),
          'The strict Gate 2 test does not pass. Zero is a lower bound, not a computed smallest singular value. It cannot decide invertibility for every target.',
          eq(tex`H_{\mathrm{bad}}=A^{\circ}+\operatorname{diag}(3/32,0)=\operatorname{diag}(3/8,25/32).`),
          'The first eigenvalue 3/8 is on Γ because |3/8 − 1/4| = 1/8. At z = 3/8 the matrix zI − Hbad is singular. The failure of strictness can therefore represent a real obstruction.',
          eq(tex`H_{\mathrm{good}}=A^{\circ}+\operatorname{diag}(-3/32,0)=\operatorname{diag}(3/16,25/32).`),
          'This target has the same error norm 3/32, yet both eigenvalues avoid Γ. The first is 1/16 away from the circle, and the second is 13/32 away. Its actual contour moat is 1/16 > 0.',
          'So a passed gate proves the stated guarantee. A failed bound is inconclusive: it may indicate a bad target, or merely an allowance too coarse to prove a good target safe.'
        ],
        visual: { type: 'gate-chain', circle, matrices: [matrix('Hbad: boundary eigenvalue', [['3/8', '0'], ['0', '25/32']]), matrix('Hgood: avoids the contour', [['3/16', '0'], ['0', '25/32']])], stages: [{ label: 'Hbad: actual moat 0', eigenvalues: [3 / 8, 25 / 32], radius: 0 }, { label: 'Hgood: actual moat 1/16', eigenvalues: [3 / 16, 25 / 32], radius: 1 / 16 }], caption: 'Both errors have norm 3/32. The zero transferred lower bound alone cannot distinguish these two targets.' }
      }
    ]
  }
];

// Exact fixtures for independent arithmetic checks. Numerator grids are row-major.
// These are practice-model inputs and answers, never the explorer's scientific data.
export const STEP_ZERO_EXERCISE_VALUES = {
  'exact-matrix': {
    midpoint: { denominator: 8, real: [[4, 2], [-1, 6]], imag: [[0, 0], [0, 0]] },
    input: { denominator: 4, real: [[2], [1]], imag: [[0], [0]] },
    output: { denominator: 16, real: [[5], [2]], imag: [[0], [0]] },
    z: [1, 1],
    shiftedOutput: { denominator: 16, real: [[3], [2]], imag: [[0], [0]] }
  },
  'entry-enclosure': {
    rectangleDenominator: 64,
    realIntervals: [[[29, 35], [13, 19]], [[-3, 3], [45, 51]]],
    imagIntervals: [[[12, 20], [-4, 4]], [[-4, 4], [-20, -12]]],
    midpoint: { denominator: 64, real: [[32, 16], [0, 48]], imag: [[16, 0], [0, -16]] },
    target: { denominator: 64, real: [[35, 16], [0, 48]], imag: [[20, 0], [0, -16]] },
    error: { denominator: 64, real: [[3, 0], [0, 0]], imag: [[4, 0], [0, 0]] },
    realHalfWidth: [3, 64], imagHalfWidth: [4, 64], entryMagnitudeBound: [5, 64],
    maximumRowSum: [5, 32], maximumColumnSum: [5, 32], gate2Allowance: [5, 32],
    selectedErrorNorm: [5, 64], suppliedMidpointGuarantee: [1, 4], remainingGuarantee: [3, 32]
  },
  'two-gates': {
    circleCenter: [1, 4], circleRadius: [1, 8],
    surrogate: { denominator: 32, real: [[8, 0], [0, 24]], imag: [[0, 0], [0, 0]] },
    midpoint: { denominator: 32, real: [[9, 0], [0, 25]], imag: [[0, 0], [0, 0]] },
    target: { denominator: 32, real: [[10, 0], [0, 24]], imag: [[0, 0], [0, 0]] },
    gate1Error: { denominator: 32, real: [[1, 0], [0, 1]], imag: [[0, 0], [0, 0]] },
    gate2Error: { denominator: 32, real: [[1, 0], [0, -1]], imag: [[0, 0], [0, 0]] },
    startingGuarantee: [1, 8], gate1Allowance: [1, 32], midpointGuarantee: [3, 32],
    gate2Allowance: [1, 32], targetGuarantee: [1, 16], initialCount: 1,
    thresholdAllowance: [3, 32], thresholdRemainingGuarantee: [0, 1],
    badTarget: { denominator: 32, real: [[12, 0], [0, 25]], imag: [[0, 0], [0, 0]] },
    goodTarget: { denominator: 32, real: [[6, 0], [0, 25]], imag: [[0, 0], [0, 0]] },
    badTargetActualMoat: [0, 1], goodTargetActualMoat: [1, 16]
  }
};
