/* Navigation-only overview. It does not compute or change any certificate. */
const NS = 'http://www.w3.org/2000/svg';
function mountRoadmap() {
  const theme = document.querySelector('.cert-theme-switch');
  if (!theme || document.querySelector('#cert-roadmap')) return false;
  const tools = document.createElement('div');
  tools.className = 'cert-header-tools';
  theme.before(tools);
  const launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'cert-roadmap-launch';
  launch.textContent = 'RoadMap'; launch.setAttribute('aria-haspopup', 'dialog');
  launch.setAttribute('aria-controls', 'cert-roadmap');
  tools.append(launch, theme);
  const dialog = document.createElement('dialog');
  dialog.id = 'cert-roadmap'; dialog.className = 'mathjax_ignore';
  dialog.setAttribute('aria-labelledby', 'cert-roadmap-title');
  dialog.setAttribute('aria-describedby', 'cert-roadmap-intro');
  document.body.append(dialog);
  let observer, frame = 0, enteredFullscreen = false, oldOverflow = '';

  function destination(id, tab, origin) {
    const u = new URL('index.html', location.href);
    u.search = location.search;
    ['tab','origin','from','roadmap'].forEach(key => u.searchParams.delete(key));
    if (location.pathname.endsWith('story-4k.html')) u.searchParams.set('display','4k');
    if (id === 0) u.searchParams.delete('example'); // Shared Step 00 is outside the map-toy router.
    if (tab) u.searchParams.set('tab', tab);
    if (origin) u.searchParams.set('origin', origin);
    u.hash = typeof id === 'number' ? 'step-' + String(id).padStart(2,'0') : id;
    return u.href;
  }
  const formula = html => `<span class="rm-formula">${html}</span>`;
  function card(key, step, title, copy, equation, kind = '', extra = '') {
    const number = typeof step === 'number' ? String(step).padStart(2,'0') : step === 'preparation' ? 'P' : '✓';
    const target = key === 'result' ? 11 : step;
    const current = location.hash === '#step-' + number || location.hash === '#' + step;
    return `<article class="rm-node ${kind}" data-rm-node="${key}"><a class="rm-card" href="${destination(target)}"${current ? ' aria-current="step"' : ''}><span class="rm-card-top"><span class="rm-number">${number}</span><span class="rm-title">${title}</span><span aria-hidden="true" class="rm-open">↗</span></span><span class="rm-copy">${copy}</span>${equation ? formula(equation) : ''}</a>${extra}</article>`;
  }
  function render() {
    const selectedMap = new URL(location.href).searchParams.has('example');
    const originLinks = `<div class="rm-origin-links"><a href="${destination(0,'connections','toy')}">Prescribed default toy ↗</a><a href="${destination(0,'connections','map')}">Three map constructions ↗</a><a href="${destination(0,'matrix-origin')}">Map → operator → entries ↗</a></div>`;
    dialog.innerHTML = `<header class="rm-header"><div><p class="rm-kicker">THE WHOLE CERTIFICATION PROTOCOL · 00–13</p><h1 id="cert-roadmap-title">RoadMap <span>Keep the count. Control every replacement.</span></h1><p id="cert-roadmap-intro">Start with eigenvalues you can count. Keep the entire contour free of spectrum while moving from a simple matrix to the target operator.</p></div><div class="rm-actions"><button type="button" data-rm-fullscreen>Fullscreen</button><button type="button" data-rm-close autofocus aria-label="Close RoadMap">Close ×</button></div></header>
    <div class="rm-scroll"><div class="rm-content"><div class="rm-guide"><span><b>Read each column downwards, then follow the connecting arrow.</b> Click any card to open its lesson.</span><span class="rm-key"><i class="rm-solid"></i> Certificate route <i class="rm-dashed"></i> SVD explanation</span></div>
    <p class="rm-context">${selectedMap ? '<b>Selected map-derived finite toy.</b> Gates below refer to its frozen finite matrices and defined coupling. Step 00 opens the shared input lesson; this is not a certificate for the map’s transfer operator.' : '<b>Current default toy.</b> Its matrix entries are prescribed directly. The separate map-construction lessons show where real finite matrix entries come from.'}</p>
    <div class="rm-graph" aria-label="Certification flow diagram"><svg class="rm-edges" aria-hidden="true"><defs><marker id="rm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/></marker><marker id="rm-dash-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/></marker></defs><g data-rm-lines></g></svg>
    <section class="rm-phase"><h2><span>A</span> Prepare &amp; count</h2><p class="rm-phase-sub">Exact data before either gate</p>
    ${card('00',0,selectedMap ? 'Shared lesson: exact inputs' : 'Prepare the exact midpoint','An exact dyadic is an integer divided by a power of two. Keep the origin of the matrix and its enclosure explicit.','A<sup>∘</sup> exists before Gate 1 and Gate 2','rm-input',originLinks)}
    ${card('prep','preparation','Freeze & validate Schur data','A numerical copy proposes Q° and T°. Freeze them, prove Q° invertible and bound its conditioning.','S<sup>∘</sup> = Q<sup>∘</sup>T<sup>∘</sup>(Q<sup>∘</sup>)<sup>−1</sup>')}
    ${card('01',1,'Count inside the contour','Count the triangular diagonal entries inside U, with algebraic multiplicity. None may lie on Γ.','Γ = ∂U · starting count = 1 in the default toy')}
    <p class="rm-handoff">Carry the count and contour to B →</p></section>
    <section class="rm-phase"><h2><span>B</span> Reach the midpoint</h2><p class="rm-phase-sub">Whole-contour estimates → Gate 1</p>
    ${card('02',2,'Bound contour distances','Find lower bounds for |z − tᵢᵢ| that hold at every point z on Γ.','Distance from an eigenvalue to the whole contour')}
    ${card('03',3,'Control the triangular inverse','Reciprocal bounds and row/column recurrences enclose the resolvent uniformly.','‖(zI − T<sup>∘</sup>)<sup>−1</sup>‖ ≤ M<sub>T</sub> · all z ∈ Γ')}
    ${card('04',4,'Gate 1 · certify the midpoint','Transport through Q°, subtract the Schur residual allowance, then round the lower bound down.','S<sup>∘</sup> → A<sup>∘</sup> &nbsp; · &nbsp; a<sub>∘</sub> &gt; 0','rm-gate')}
    ${card('05',5,'SVD · a picture at one point','See the weakest input and its output at z*. This helps explain Step 08; it does not supply the uniform certificate.','a<sub>∘</sub> ≤ actual contour minimum ≤ a<sub>*</sub>','rm-diagnostic')}
    <p class="rm-handoff">Carry a<sub>∘</sub> from Gate 1 directly to C →</p></section>
    <section class="rm-phase"><h2><span>C</span> Enclose &amp; protect</h2><p class="rm-phase-sub">Matrix replacement → Gate 2</p>
    ${card('06',6,'Enclose every matrix entry','Reuse the same midpoint A°. Retained real and imaginary radii form the entry rectangles.','Target matrix A = A<sup>∘</sup> + E')}
    ${card('07',7,'Bound the matrix error','Combine entry bounds into one matrix norm allowance. Matrix space and output-vector space are different.','‖E‖ ≤ η<sub>A</sub>')}
    ${card('08',8,'Follow the output uncertainty','Along A° + tE, every unit input loses at most tηA from the inherited lower guarantee.','‖(zI − A<sup>∘</sup> − tE)x‖ ≥ a<sub>∘</sub> − tη<sub>A</sub>')}
    ${card('09',9,'Gate 2 · keep a common inner ball','Require a positive remaining margin for all z ∈ Γ and all unit inputs. The finite eigenvalue count is preserved.','s̲<sub>finite</sub> = a<sub>∘</sub> − η<sub>A</sub> &gt; 0','rm-gate rm-matrix-gate')}
    <p class="rm-handoff">Carry the certified finite target to D →</p></section>
    <section class="rm-phase"><h2><span>D</span> Lift &amp; transfer the count</h2><p class="rm-phase-sub">An exact lift, then a separate operator gate</p>
    ${card('10',10,'Lift into the ambient space','Add an orthogonal zero complement. Keep zero outside the closed contour interior so it adds no enclosed eigenvalues.','B<sub>lift</sub> = A ⊕ 0<br>s̲<sub>lift</sub> = min(s̲<sub>finite</sub>, dist(0, Γ))')}
    ${card('11',11,'Operator gate · reach the target','Use a separately established full-space error ε. A strict Neumann-series test keeps the contour in the resolvent set.','ε M̄<sub>Γ</sub>(B<sub>lift</sub>) &lt; 1','rm-gate rm-operator-gate')}
    ${card('result','result','The enclosed count survives','If every strict gate passes, the Riesz rank stays unchanged. The default toy ends with rank one, counting algebraic multiplicity.','rank Π<sub>Γ</sub>(target) = starting count','rm-result')}
    ${card('13',13,'Hardy space & the real-map bridge','For a real map, analytic, collocation and tail bounds must establish ε independently. The abstract Hardy toy alone does not certify that map.','Separate full-operator error input → Step 11','rm-analytic')}
    </section></div>
    <div class="rm-bottom"><a class="rm-overview" href="${destination(12)}"><span class="rm-number">12</span><span><strong>See the complete geometric story ↗</strong><span>Rotate the connected scenes and compare the spaces, bounds and homotopies.</span></span></a><div class="rm-budget"><b>Three different allowances</b><a href="${destination(4)}">η<sub>Schur</sub><span>surrogate → midpoint</span></a><a href="${destination(9)}">η<sub>A</sub><span>midpoint → finite target</span></a><a href="${destination(11)}">ε<span>lift → full target</span></a></div></div>
    <p class="rm-footnote"><b>A failed sufficient gate is inconclusive.</b> It does not prove that the count changed. The three worked map preparations stop at validated finite matrices; their downstream gates and full-operator bounds still need checking. <a href="${destination('assumptions')}">Read the assumptions ↗</a></p></div></div>`;
    dialog.querySelector('[data-rm-close]').addEventListener('click',close);
    const full = dialog.querySelector('[data-rm-fullscreen]');
    full.hidden = !document.fullscreenEnabled;
    full.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else { await document.documentElement.requestFullscreen(); enteredFullscreen = true; }
      } catch { full.textContent = 'Full-window view'; }
    });
    dialog.addEventListener('click', onLink, {once:false});
    updateFullscreenLabel();
  }
  function onLink(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.target.closest('a[href]')) close();
  }
  function updateFullscreenLabel() {
    const b = dialog.querySelector('[data-rm-fullscreen]');
    if (b) b.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
    schedule();
  }
  function draw() {
    if (!dialog.open) return;
    const graph = dialog.querySelector('.rm-graph'), base = graph.getBoundingClientRect();
    const svg = graph.querySelector('svg'), lines = svg.querySelector('[data-rm-lines]');
    svg.setAttribute('viewBox',`0 0 ${base.width} ${base.height}`);
    lines.replaceChildren();
    const box = id => {
      const r = graph.querySelector(`[data-rm-node="${id}"]`).getBoundingClientRect();
      return {l:r.left-base.left,r:r.right-base.left,t:r.top-base.top,b:r.bottom-base.top,cx:(r.left+r.right)/2-base.left,cy:(r.top+r.bottom)/2-base.top};
    };
    const links = [['00','prep'],['prep','01'],['02','03'],['03','04'],['04','05','diagnostic'],['06','07'],['07','08'],['08','09'],['10','11'],['11','result'],['01','02','cross'],['04','06','cross'],['09','10','cross'],['13','11','analytic']];
    for (const [from,to,kind=''] of links) {
      const a=box(from), b=box(to); let d;
      if (kind === 'analytic') {
        const x=a.r+12;
        d=`M ${a.r} ${a.cy} H ${x} V ${b.cy} H ${b.r+3}`;
      } else if (kind==='cross') {
        if (b.l>a.r) {
          const x=(a.r+b.l)/2;
          d=`M ${a.r} ${a.cy} H ${x} V ${b.cy} H ${b.l-3}`;
        } else {
          // At smaller widths the phase footers carry the connection in words.
          continue;
        }
      } else d=`M ${a.cx} ${a.b} V ${b.t-3}`;
      const p=document.createElementNS(NS,'path');p.setAttribute('d',d);
      p.setAttribute('class','rm-edge '+kind);
      p.setAttribute('marker-end',`url(#${kind==='diagnostic'?'rm-dash-arrow':'rm-arrow'})`);
      lines.append(p);
    }
  }
  function schedule() { cancelAnimationFrame(frame); frame=requestAnimationFrame(draw); }
  function close() { if (dialog.open) dialog.close(); }
  launch.addEventListener('click', () => {
    render(); oldOverflow=document.body.style.overflow; document.body.style.overflow='hidden';
    dialog.showModal();
    observer = new ResizeObserver(schedule); observer.observe(dialog.querySelector('.rm-graph'));
    schedule();
  });
  dialog.addEventListener('close', () => {
    observer?.disconnect(); cancelAnimationFrame(frame); document.body.style.overflow=oldOverflow;
    if (enteredFullscreen && document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    enteredFullscreen=false; launch.focus({preventScroll:true});
  });
  document.addEventListener('fullscreenchange',updateFullscreenLabel);
  return true;
}
if (!mountRoadmap()) {
  const pending = new MutationObserver(() => { if (mountRoadmap()) pending.disconnect(); });
  pending.observe(document.body,{childList:true,subtree:true});
}
