import {fullQuantityLedger} from './quantity-ledger.mjs?v=103';
// Introductory pages use native MathML. All values are supplied toy inputs.
const row = s => '<mrow>'+s+'</mrow>';
const mi = s => '<mi>'+s+'</mi>';
const mn = s => '<mn>'+s+'</mn>';
const mo = s => '<mo>'+s+'</mo>';
const tx = s => '<mtext>'+s+'</mtext>';
const sub = (a,b) => '<msub>'+row(a)+row(b)+'</msub>';
const sup = (a,b) => '<msup>'+row(a)+row(b)+'</msup>';
const ss = (a,b,c) => '<msubsup>'+row(a)+row(b)+row(c)+'</msubsup>';
const frac = (a,b) => '<mfrac>'+row(a)+row(b)+'</mfrac>';
const und = a => '<munder accentunder="true">'+row(a)+'<mo>_</mo></munder>';
const math = s => '<math xmlns="http://www.w3.org/1998/Math/MathML">'+row(s)+'</math>';
const matrix = rows => '<mo stretchy="true">(</mo><mtable>'+rows.map(r=>'<mtr>'+r.map(c=>'<mtd>'+row(c)+'</mtd>').join('')+'</mtr>').join('')+'</mtable><mo stretchy="true">)</mo>';
const n = s => mn(String(s));
const eq=mo('='), plus=mo('+'), minus=mo('−'), le=mo('≤'), lt=mo('&lt;');
const A0=ss(mi('A'),n(2),mo('∘')), AH=ss(mi('A'),row(n(2)+mo(',')+mi('M')),mi('X'));
const T=ss(mi('T'),n(2),mo('∘')), Q=ss(mi('Q'),n(2),mo('∘')), S=ss(mi('S'),n(2),mo('∘'));
const ac=sub(mi('a'),mo('∘')), ast=sub(mi('a'),mo('∗')), etaA=sub(mi('η'),mi('A')), etaS=sub(mi('η'),tx('Schur'));
const sSur=ss(und(mi('s')),mi('Γ'),tx('sur')), sMid=ss(und(mi('s')),mi('Γ'),mo('∘'));
const sH=ss(und(mi('s')),mi('Γ')+mo(',')+n(2),mi('H')), sLift=ss(und(mi('s')),mi('Γ')+mo(',')+n(2),tx('lift'));
const epsilon=ss(mi('ε'),n(2)+mo(',')+mi('M'),mo('♯')), d0=sub(mi('d'),mi('Γ')+mo(',')+n(0));
const L=sub(mi('ℒ'),tx('toy')), B=sub(mi('B'),tx('lift')), sActual=sub(mi('s'),mi('Γ'))+mo('(')+A0+mo(')');
const norm = body => mo('‖')+body+sub(mo('‖'),n(2));
const rank = body => tx('rank')+sub(mi('Π'),mi('Γ'))+mo('(')+body+mo(')');
const squeeze=math(ac+le+sActual+le+ast);
const stageLink=(step,label='Open the related step')=>'<a class="text-link" href="#step-'+String(step).padStart(2,'0')+'">'+label+' <span aria-hidden="true">↗</span></a>';
export const protocolStages=[
 {name:'Frozen Schur data',kind:'Exact similarity',color:'purple',symbol:math(T+mo('∼')+S),value:math(sub(mi('m'),mi('T'))+mo('(')+mi('U')+mo(')')+eq+n(1)),step:1,
 detail:'Exactly one diagonal entry of the triangular matrix lies inside U. The invertible frozen matrix Q transports this eigenvalue count to the exact surrogate.',
 facts:[math(S+eq+Q+T+sup(row(mo('(')+Q+mo(')')),minus+n(1))),math(sSur+eq+n('0.0392113527'))]},
 {name:'Gate 1',kind:'Finite perturbation',color:'violet',symbol:math(etaS+lt+sSur),value:math(etaS+eq+n(3)+mo('×')+sup(n(10),minus+n(16))),step:4,
 detail:'The Schur residual allowance is smaller than the certified surrogate moat. Subtract this allowance, then round downward to retain a certified whole-contour midpoint bound.',
 facts:[math(ac+le+sSur+minus+etaS),math(ac+eq+n('0.03921135'))]},
 {name:'Midpoint matrix',kind:'Exact dyadic entries',color:'blue',symbol:math(A0),value:math(ac+eq+n('0.03921135')),step:4,
 detail:'The midpoint has a certified lower bound a∘ across the entire contour. Its actual contour minimum is unknown. The pointwise SVD value a∗ belongs to a separate diagnostic branch.',
 facts:[squeeze,math(rank(A0)+eq+n(1))]},
 {name:'Gate 2',kind:'Finite perturbation',color:'violet',symbol:math(etaA+lt+ac),value:math(etaA+eq+frac(n(5),n(512))),step:9,
 detail:'The entry enclosure gives an operator-norm allowance ηA. Every shifted unit-vector output remains at least a∘ − ηA away from zero, for every point of Γ.',
 facts:[math(norm(AH+minus+A0)+le+etaA),math(sH+eq+ac+minus+etaA)]},
 {name:'Hardy matrix',kind:'Mathematical finite matrix',color:'coral',symbol:math(AH+eq+A0+plus+mi('E')),value:math(sH+eq+n('0.029445725')),step:9,
 detail:'The mathematical Hardy matrix retains the initial eigenvalue count. The displayed moat is a certified lower bound, not an asserted value of the actual contour minimum.',
 facts:[math(sH+le+sub(mi('s'),mi('Γ'))+mo('(')+AH+mo(')')),math(rank(AH)+eq+n(1))]},
 {name:'Exact orthogonal lift',kind:'Structural identity',color:'blue',symbol:math(B+eq+AH+mo('⊕')+n(0)),value:math(sLift+eq+n('0.029445725')),step:10,
 detail:'Work on Xtoy = ℂ² ⊕ ℂ. The added zero eigenvalue lies outside the closure of U, so it does not change the enclosed count. The complementary shifted direction contributes |z|.',
 facts:[math(n(0)+mo('∉')+'<mover accent="true">'+mi('U')+'<mo>¯</mo></mover>'),math(d0+mo('≈')+n('0.610645600891813')),math(sLift+eq+mi('min')+mo('{')+sH+mo(',')+d0+mo('}'))]},
 {name:'Separate operator gate',kind:'Independent error allowance',color:'deeppink',symbol:math(frac(epsilon,sLift)+lt+n(1)),value:math(frac(n('0.01'),n('0.029445725'))+mo('≈')+n('0.3396078718')),step:11,
 detail:'The independent bound ε♯ controls the full toy operator against its finite lift. The displayed ratio bounds the small-gain product from above and is strictly below one.',
 facts:[math(norm(L+minus+B)+le+epsilon+eq+n('0.01')),math(epsilon+sub(mi('M'),mi('Γ'))+mo('(')+B+mo(')')+le+frac(epsilon,sLift)+lt+n(1))]},
 {name:'Toy exact operator',kind:'Abstract bounded operator',color:'ink',symbol:math(L+eq+B+plus+mi('D')),value:math(rank(L)+eq+n(1)),step:11,
 detail:'The contour remains in the resolvent set along B_{lift} + tD, for 0 ≤ t ≤ 1. The Riesz projection therefore retains rank one. No underlying Perron–Frobenius map is specified.',
 facts:[math(rank(L)+eq+rank(B)+eq+n(1)),math(sLift+minus+epsilon+eq+n('0.019445725'))]}
];
export function stageDetails(index=0){
 const s=protocolStages[index]||protocolStages[0];
 return '<div><p class="eyebrow">STAGE '+String(index+1).padStart(2,'0')+' · '+s.kind+'</p><h2>'+s.name+'</h2><p>'+s.detail+'</p>'+stageLink(s.step)+'</div><div class="stage-facts">'+s.facts.map(x=>'<div>'+x+'</div>').join('')+'</div>';
}
function pageHead(kicker,title,intro){return '<header class="intro-heading"><p class="eyebrow">'+kicker+'</p><h1>'+title+'</h1><p>'+intro+'</p></header>';}
function introFooter(previous,next,nextLabel){return '<footer class="intro-footer">'+(previous?'<a class="page-button" href="'+previous+'">← Certification Protocol</a>':'<span class="intro-footer-note">Foundations + preparation · Thirteen detailed pages</span>')+'<a class="page-button primary" href="'+next+'">'+nextLabel+' →</a></footer>';}
export function protocolPage(){
 return pageHead('THE COMPLETE ROUTE','Certification Protocol','From frozen Schur data to an abstract toy operator, through two finite gates and one separate operator gate.')+
 '<div class="overview-summary"><span class="overview-number">13<span>detailed steps</span></span><div>'+squeeze+'<p>The uniform certificate and the pointwise SVD diagnostic keep their separate roles.</p></div><a class="text-link" href="#assumptions">Read the assumptions ↗</a></div>'+
 '<div class="prep-overview-link"><div><strong>Before the main stages: prepare the Schur data</strong><br>A₂° fixed → numerical proposal → exact dyadics → validated defects → exact surrogate.</div><a class="text-link" href="#preparation">Explore preparation P1–P7 ↗</a></div>'+
 '<section class="protocol-board" aria-labelledby="protocol-diagram-title"><div class="board-heading"><div><h2 id="protocol-diagram-title">The certification chain</h2><p>A conceptual diagram using the agreed toy values. Select a stage to read its role.</p></div><div class="flow-controls"><button class="icon-button" data-flow-scroll="-1" aria-label="Scroll diagram left">←</button><button class="icon-button" data-flow-scroll="1" aria-label="Scroll diagram right">→</button></div></div>'+
 '<div class="protocol-scroll" tabindex="0" role="region" aria-label="Certification chain, horizontally scrollable"><ol class="protocol-flow">'+protocolStages.map((s,i)=>'<li class="flow-item"><button class="flow-node tone-'+s.color+'" data-protocol-stage="'+i+'" aria-pressed="'+(i===0)+'" aria-controls="protocol-detail"><span class="flow-top"><span class="flow-count">'+String(i+1).padStart(2,'0')+'</span><span>'+s.kind+'</span></span><strong>'+s.name+'</strong><span class="flow-symbol">'+s.symbol+'</span><span class="flow-value">'+s.value+'</span>'+(i===2?'<span class="branch-tag">Pointwise SVD branch below</span>':'')+'</button>'+(i<7?'<span class="flow-arrow" aria-hidden="true">→</span>':'')+'</li>').join('')+'</ol></div><p class="diagram-hint">Read left to right. Scroll to follow the entire chain.</p>'+
 '<div class="protocol-detail" id="protocol-detail" aria-live="polite">'+stageDetails(0)+'</div></section>'+
 '<section class="svd-branch" aria-labelledby="svd-branch-title"><div class="branch-source">'+math(A0)+'<span>Midpoint</span></div><span class="branch-connector" aria-hidden="true">╌╌→</span><div><p class="eyebrow">SEPARATE POINTWISE BRANCH</p><h2 id="svd-branch-title">SVD at the selected contour point</h2><div class="branch-equation">'+math(ast+mo('≈')+n('0.0433674471266311'))+'</div><p>This describes the actual ellipse at '+math(sub(mi('z'),mo('∗')))+'. It supplies the upper side of the squeeze, not a contour-wide lower bound.</p>'+stageLink(5,'Explore step 05')+'</div></section>'+
 '<div class="overview-bottom"><section><p class="eyebrow">THREE DIFFERENT PERTURBATIONS</p><div class="error-ledger"><div>'+math(etaS)+'<span>Surrogate → midpoint</span></div><div>'+math(etaA)+'<span>Midpoint → Hardy matrix</span></div><div>'+math(epsilon)+'<span>Finite lift → toy operator</span></div></div></section><aside><p class="eyebrow">EVIDENCE STATUS</p><p>The numerical certificates are supplied inputs. This diagram explains their use. It does not recompute or independently certify them.</p><p>The preparation and all 13 pages are available. Step 12 connects the geometries in one diagram. Step 13 explains the Chebyshev–Hardy bridge and realises the toy on the Hardy space.</p></aside></div>'+
 introFooter(null,'#assumptions','Assumptions for the Toy Example');
}
const frozen = `T = [
  [
    [0.61380835174852444,  0.25732258744926345],
    [0.2884656126610502,  -0.071246928724661249]
  ],
  [
    [0, 0],
    [0.13619164825147553, -0.069822587449263521]
  ]
]

Q = [
  [
    [-0.72161721575858517, -0.63437104723580673],
    [ 0.21092861603665183,  0.17986408003444165]
  ],
  [
    [-0.12396932552028611, -0.24793865104057225],
    [-0.44259056034037381, -0.85280222065131872]
  ]
]`;
export function assumptionsPage(){
 const AoEntries=[[frac(n(1),n(2))+plus+frac(n(1),n(4))+mi('i'),frac(n(3),n(8))+minus+frac(n(1),n(8))+mi('i')],[frac(n(1),n(16))+plus+frac(n(1),n(8))+mi('i'),frac(n(1),n(4))+minus+frac(n(1),n(16))+mi('i')]];
 const eEntries=[[minus+n(3)+plus+n(4)+mi('i'),minus+n(4)+plus+n(3)+mi('i')],[minus+n(3)+minus+n(4)+mi('i'),minus+n(4)+plus+n(3)+mi('i')]];
 const aEntries=[[n(509)+plus+n(260)+mi('i'),n(380)+minus+n(125)+mi('i')],[n(61)+plus+n(124)+mi('i'),n(252)+minus+n(61)+mi('i')]];
 const dEntries=[[n(0),n(0),n(1)],[n(0),n(0),n(0)],[n(1),n(0),n(0)]];
 return pageHead('SHARED FOUNDATIONS','Assumptions for the Toy Example','Definitions, fixed data, certificate inputs and visual conventions shared by all twelve steps.')+
 '<div class="care-grid"><section class="care-card"><span class="care-number">01</span><div><h2>Rectangles, not squares</h2><p>Entry rectangles have half-widths 3/1024 and 4/1024. The first column uses real/imaginary half-widths (3, 4)/1024; the second uses (4, 3)/1024. Preserve these proportions on equal axes.</p></div></section><section class="care-card"><span class="care-number">02</span><div><h2>Actual inradius and certified radius</h2><p>The SVD ellipse at '+math(sub(mi('F'),mo('∗'))+eq+sub(mi('z'),mo('∗'))+sub(mi('I'),n(2))+minus+A0)+' has actual inradius '+math(ast)+' in a principal section. The smaller '+math(ac)+' supplies a common guarantee across the contour.</p></div></section></div>'+
 '<section class="reference-section"><div class="section-heading"><span>01</span><h2>Notation and evidence</h2></div><div class="definition-panel">'+math(sub(mi('s'),mi('Γ'))+mo('(')+mi('C')+mo(')')+eq+sub(mi('min'),mi('z')+mo('∈')+mi('Γ'))+sub(mi('σ'),tx('min'))+mo('(')+mi('z')+mi('I')+minus+mi('C')+mo(')'))+'<div class="squeeze-large">'+squeeze+'</div><p>An underline always denotes a certified lower bound, not the actual minimum. Keep '+math(ast)+' as the sole pointwise minimum-singular-value diagnostic.</p></div><ul class="reference-bullets"><li>Treat the supplied numerical certificates as inputs. Floating-point animation illustrates them; it does not establish them.</li><li>Do not introduce a second optimized point for the Hardy matrix.</li><li>Plain '+math(mi('U'))+' is the spectral disk. '+math(sub(mi('U'),mo('∗')))+' denotes the SVD matrix of left singular vectors.</li><li>This is a private pedagogical example with an abstract bounded toy operator, not a specified Perron–Frobenius map.</li></ul></section>'+
 '<section class="reference-section"><div class="section-heading"><span>02</span><h2>Four different spaces</h2></div><div class="assumption-spaces">'+[
 ['Spectral plane',math(mi('z')+mo('∈')+mi('ℂ')+mo('≅')+sup(mi('ℝ'),n(2))),'Contour, disk and eigenvalues'],
 ['Matrix space',math(sup(mi('ℂ'),n(2)+mo('×')+n(2))+mo('≅')+sup(mi('ℝ'),n(8))),'Entry boxes and operator-norm uncertainty'],
 ['Finite input/output space',math(sup(mi('ℂ'),n(2))+mo('≅')+sup(mi('ℝ'),n(4))),'Unit-vector images and ellipsoids'],
 ['Lifted input/output space',math(sup(mi('ℂ'),n(3))+mo('≅')+sup(mi('ℝ'),n(6))),'The finite lift and the toy operator']
 ].map(([title,formula,copy])=>'<div><h3>'+title+'</h3>'+formula+'<p>'+copy+'</p></div>').join('')+'</div><p class="convention-note">Label each lower-dimensional picture as a section, projection or schematic. Use equal axis scales for genuine circles, ellipses and entry rectangles, with labelled zoom insets where needed.</p></section>'+
 '<section class="reference-section"><div class="section-heading"><span>03</span><h2>The contour and exact midpoint</h2></div><div class="math-surface">'+math(A0+eq+matrix(AoEntries))+'<div class="math-line">'+math(mi('c')+eq+frac(n(5),n(8))+plus+frac(n(1),n(4))+mi('i'))+math(mi('δ')+eq+frac(n(1),n(16)))+'</div><div class="math-line">'+math(mi('U')+eq+mo('{')+mi('z')+mo(':')+mo('|')+mi('z')+minus+mi('c')+mo('|')+lt+mi('δ')+mo('}'))+math(mi('Γ')+eq+mo('∂')+mi('U'))+'</div></div><p>Γ is positively oriented. The selected diagnostic point is '+math(sub(mi('z'),mo('∗'))+mo('≈')+n('0.570520320322476')+plus+n('0.280630287335158')+mi('i'))+'.</p></section>'+
 '<section class="reference-section"><div class="section-heading"><span>04</span><h2>Frozen Schur data</h2></div><p><a class="text-link" href="#preparation">How these exact inputs are constructed and validated ↗</a></p><p>Each pair below is <code>[real, imaginary]</code>. Parse the displayed numbers as binary64 values, then regard those frozen values as exact dyadic inputs.</p><details class="frozen-data" open><summary>Inspect T and Q</summary><pre><code>'+frozen+'</code></pre></details><div class="math-surface"><div>'+math(S+eq+Q+T+sup(row(mo('(')+Q+mo(')')),minus+n(1)))+'</div><div class="math-line">'+math(sub(mi('κ'),n(2))+mo('(')+Q+mo(')')+le+n(1)+plus+sup(n(10),minus+n(15)))+math(norm(A0+minus+S)+le+n(3)+mo('×')+sup(n(10),minus+n(16)))+'</div></div><p>Q is invertible and nearly unitary, not exactly unitary. Exactly one diagonal entry of T lies in U, giving '+math(sub(mi('m'),mi('T'))+mo('(')+mi('U')+mo(')')+eq+n(1))+'.</p></section>'+
 '<section class="reference-section"><div class="section-heading"><span>05</span><h2>The selected matrix perturbation</h2></div><div class="math-surface"><div>'+math(mi('E')+eq+frac(n(1),n(1024))+matrix(eEntries))+'</div><div>'+math(AH+eq+A0+plus+mi('E')+eq+frac(n(1),n(1024))+matrix(aEntries))+'</div></div><div class="allowance-comparison"><div><span>ENCLOSURE RADIUS</span>'+math(etaA+eq+frac(n(5),n(512))+eq+n('0.009765625'))+'</div><div><span>ACTUAL PERTURBATION NORM</span>'+math(norm(mi('E'))+eq+frac('<msqrt>'+n(5)+'</msqrt>',n(256))+mo('≈')+n('0.00873464053711'))+'</div></div><p>The norm of this selected perturbation is smaller than the conservative allowance from the entry enclosure.</p></section>'+
 '<section class="reference-section"><div class="section-heading"><span>06</span><h2>Actual moats and certified bounds</h2></div>'+fullQuantityLedger()+'</section>'+
 '<section class="reference-section"><div class="section-heading"><span>07</span><h2>The lift and separate operator perturbation</h2></div><div class="math-surface"><div class="math-line">'+math(sub(mi('X'),tx('toy'))+eq+sup(mi('ℂ'),n(2))+mo('⊕')+mi('ℂ'))+math(B+eq+AH+mo('⊕')+n(0))+'</div><div>'+math(mi('D')+eq+n('0.01')+matrix(dEntries))+'</div><div class="math-line">'+math(L+eq+B+plus+mi('D'))+math(norm(mi('D'))+eq+epsilon+eq+n('0.01'))+'</div></div><p>Zero lies outside the closure of U. The complementary block therefore adds no enclosed eigenvalue. The bound for D is independent of the finite matrix allowance '+math(etaA)+'.</p><p>'+math(sub(mi('M'),mi('Γ'))+mo('(')+B+mo(')')+eq+sub(mi('sup'),mi('z')+mo('∈')+mi('Γ'))+norm(sup(row(mo('(')+mi('z')+mi('I')+minus+B+mo(')')),minus+n(1)))+le+frac(n(1),sLift))+'</p></section>'+
 '<section class="reference-section"><div class="section-heading"><span>08</span><h2>Visual conventions</h2></div><p>Make the geometry the main content. Use equations as short labels or expandable explanations.</p><div class="colour-key">'+[
 ['blue','Dodger blue','Real coordinates and blue geometric accents'],['purple','Indigo','Primary structure, Schur data and spectral boundaries'],['gray','Deep gray','Imaginary coordinates, selected points and perturbation accents'],['grey','Dark grey','Reference geometry and secondary guides'],['background','Light background','The shared surface colour: #f0f2f5'],['red','Red','Boundary collisions, failed gates and critical states']
 ].map(([color,name,role])=>'<div><span class="colour-swatch swatch-'+color+'" aria-hidden="true"></span><div><strong>'+name+'</strong><span>'+role+'</span></div></div>').join('')+'</div><div class="palette-gradient-key" aria-label="Indigo to dodger blue to deep gray gradient"></div><p>The site-wide gradient runs from indigo at 0%, through dodger blue at 52%, to deep gray at 100%. Use ordered samples for related series. Matching tints and shades provide contrast, with red reserved for critical states. Colour is always accompanied by labels or geometry.</p><div class="convention-note"><strong>Forward and inverse image geometry</strong><p>The inverse image ellipsoid is enclosed by its outer norm-bound ball. The forward image ellipsoid contains the corresponding reciprocal-radius inner ball. Both consist of vectors in ℂ², not matrices.</p></div></section>'+
 introFooter('#protocol','#preparation','Prepare the Schur data');
}
