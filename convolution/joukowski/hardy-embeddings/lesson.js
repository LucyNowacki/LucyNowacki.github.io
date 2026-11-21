/* Four staged lessons share one calculation model and one interactive renderer. */
(() => {
'use strict';
const root=document.getElementById('hardy-app');if(!root)return;
const M=window.HardyMath,V=window.HardyScenes,kind=root.dataset.kind,$=s=>root.querySelector(s),TAU=2*Math.PI;
if(!M||!V){root.insertAdjacentHTML('afterbegin','<p role="alert">The interactive lesson could not load. Reload this page to try again.</p>');return;}
const fmt=n=>Number.isFinite(n)?(Math.abs(n)<1e-13?'0':Number(n.toPrecision(5)).toString()):'—';
const colours={source:'var(--hardy-input)',target:'var(--hardy-image)',input:'var(--hardy-input)',image:'var(--hardy-image)',response:'var(--hardy-response)',output:'var(--hardy-output)'};
const texNames={source:'f',target:'F_N',input:'f',image:'g',response:'h',output:'h|_{E_r}'};
const embedding = kind === 'j2' || kind === 'jinf';
const titles={synthesis:'Weighted synthesis',j2:'Hardy to uniform',jinf:'Uniform to Hardy',transfer:'Two strict gaps'};
const story={
 synthesis:[
  ['A coefficient shrinks; its Legendre mode grows','The outer radius supplies decay. Reconstructing on the smaller ellipse spends part of that decay, leaving the ratio q. The spectrum below shows the remaining scalar budget.',String.raw`\(|c_n|\,r^n\le A(2n+1)(r/R)^n\)`],
  ['Keep degrees zero through N − 1','The retained polynomial uses exactly N Legendre coefficients. Move N to see terms pass between the retained part and the tail. The target light now measures the retained polynomial.',String.raw`\(\mathcal P_Nf=\sum_{n=0}^{N-1}a_n(f)P_n\)`],
  ['The omitted terms have a summable budget','The target light now measures the omitted polynomial. Its local value can cancel, while the positive scalar tail bounds all possible directions. In this finite example the actual residual is zero once all 48 terms are retained.',String.raw`\(\mathsf T_N(q)=q^N\left[\frac{2N+1}{1-q}+\frac{2q}{(1-q)^2}\right]\)`]
 ],
 j2:[
  ['Measure angular energy on the outer ellipse','The input is normalized in the Hardy norm. Equal angular intervals carry equal weight. Taller parts of the curve contribute more energy. The hump follows the local squared modulus, and its dashed cap shows the whole mean.',String.raw`\(\|f\|_{H^2(E_R)}^2=\frac1{2\pi}\int_0^{2\pi}|f(\Gamma_R(t))|^2\,dt\)`],
  ['The strict gap gives a pointwise ceiling','Restrict the same function to the smaller ellipse. Coefficient decay and mode growth combine to bound its supremum. The lighthouse follows local magnitude, while its guide is the whole supremum.',String.raw`\(\|\mathcal J_2^{R\to r}\|\le C_2(R)\,\mathsf S_\infty(r/R)\)`],
  ['Discard high degrees and watch the error shrink','Increase N to remove more degrees from the residual. Widening the ellipse gap makes q smaller and improves the tail estimate. The positive majorant is usually larger than this example’s actual error.',String.raw`\(\|\mathcal J_2^{R\to r}-\mathcal P_N\|\le C_2(R)\,\mathsf T_N(r/R)\)`]
 ],
 jinf:[
  ['Start with a uniform ceiling','The outer lighthouse shows the local modulus. Its dashed guide is the maximum over the whole outer boundary. The input polynomial is normalized so that its outer supremum equals A.',String.raw`\(|f(\Gamma_R(t))|\le\|f\|_{H^\infty(E_R)}\)`],
  ['Every inner energy sample lies below the ceiling squared','The inner hump now measures angular energy. Averaging values bounded by A squared gives an average at most A squared. A constant input makes this equality visible.',String.raw`\(\|\mathcal J_\infty^{R\to r}f\|_{H^2(E_r)}\le\|f\|_{H^\infty(E_R)},\qquad\|\mathcal J_\infty^{R\to r}\|=1\)`],
  ['Projection tails need the coefficient estimate','The norm-one restriction and the finite projection are different operators. Select the residual, increase N, and compare the actual target Hardy norm with the coefficient-based tail bound.',String.raw`\(\|\mathcal J_\infty^{R\to r}-\mathcal P_N\|\le C_\infty(R)\,\mathsf T_N(r/R)\)`]
 ],
 transfer:[
  ['Restrict the input to the branch-image ellipse','The input and output live on the same Hardy ellipse. The first restriction makes the function available as bounded analytic data on the smaller ellipse. These moving markers are linked probes of whole functions.',String.raw`\(H^2(E_r)\xrightarrow{\mathcal J_2^{r\to s}}H^\infty(E_s),\qquad q_{\rm gap}=s/r\)`],
  ['Follow the two solid inverse-branch arrows','At a response point on the outer ellipse, the operator samples two points inside the branch-image ellipse. Dashed arrows connect functions; solid arrows identify the actual evaluation points.',String.raw`\(h(\omega)=\frac12g\!\left(\frac{\omega-1}{2}\right)+\frac12g\!\left(\frac{\omega+1}{2}\right)\)`],
  ['Return to the Hardy ellipse and compare the two gaps','Moving the middle ellipse outward improves s/r but worsens r/ρ. The larger ratio gives slower geometric decay. The bars display only these geometric factors, without the prefactors in the full operator estimate.',String.raw`\(q_{\rm gap}=s/r,\qquad q_{\rm out}=r/\rho,\qquad q_*=\max\{q_{\rm gap},q_{\rm out}\}\)`]
 ]};
let state=M.defaults(kind),stage=0,focus='',model,frame=0,playing=false,saveTimer=0,resizeFrame=0,mathChain=Promise.resolve(),lastLive=0;
const storageKey='convolution-hardy-lessons-v1-'+kind;
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.version===1){state={...state,...saved.state};stage=Math.max(0,Math.min(2,Number(saved.stage)||0));focus=typeof saved.focus==='string'?saved.focus:'';}}catch{}
const svg=$('#hardy-scene'),profile=$('#hardy-profile');
function typeset(elements){if(!window.MathJax?.startup?.promise)return;mathChain=mathChain.catch(()=>{}).then(()=>window.MathJax.startup.promise).then(()=>window.MathJax.typesetPromise(elements)).catch(()=>{});}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(storageKey,JSON.stringify({version:1,state,stage,focus}));}catch{}},120);}
function text(id,value){const node=$(id);if(node)node.textContent=value;}
function setHTML(node,markup){if(window.MathJax?.typesetClear)window.MathJax.typesetClear([node]);node.innerHTML=markup;}
function control(key,label,min,max,step,hint=''){return `<div class="hardy-control"><label for="hardy-${key}">${label}<output data-out="${key}"></output></label><input type="range" id="hardy-${key}" data-control="${key}" min="${min}" max="${max}" step="${step}" aria-label="${label}">${hint?`<small>${hint}</small>`:''}</div>`;}
function setup(){
 const content=$('#hardy-controls'),scene=svg.parentElement;
 // The page source remains readable without JavaScript. Move its live slots into a shared responsive lab.
 const workspace=document.createElement('div');workspace.className='hardy-workspace';content.before(workspace);workspace.before($('#hardy-stage-copy'));workspace.append(content);
 const column=document.createElement('div');column.className='hardy-visual-column';workspace.append(column);column.append($('#hardy-legend'));
 const diagram=document.createElement('div');diagram.className='hardy-diagram-wrap';column.append(diagram);diagram.append(svg);
 const caption=document.createElement('div');caption.className='hardy-diagram-caption';caption.innerHTML='<span>Hump: local squared modulus</span><span>Light: local modulus</span><span>Dashed cap: whole mean or '+(kind==='synthesis'?'sampled maximum':'supremum')+'</span><span>Compressed gauges · schematic ellipse spacing</span>';diagram.append(caption);
 if (embedding) {
  diagram.id = 'boundary-diagram';
  diagram.setAttribute('role', 'region');
  diagram.setAttribute('aria-labelledby', 'boundary-diagram-title');
  const bar = document.createElement('div');
  bar.className = 'boundary-heading';
  bar.innerHTML = '<h3 id="boundary-diagram-title">Outer and inner boundaries</h3><button type="button" data-view-size aria-haspopup="dialog">Enlarge diagram</button>';
  diagram.prepend(bar, $('#hardy-legend'));
  caption.textContent = 'Heights are compressed and ellipse spacing is enlarged. Dashed caps mark the full-boundary mean energy or maximum modulus.';
 }
 if(kind==='transfer')caption.insertAdjacentHTML('beforeend','<span><i class="line-dash"></i>Function maps</span><span><i class="line-solid"></i>Inverse-branch point maps</span>');
 (embedding ? diagram : column).append($('#hardy-readings'));
 const profilePanel=document.createElement('div');profilePanel.className='hardy-profile-panel';profilePanel.innerHTML='<div class="hardy-profile-heading"><h3 id="hardy-profile-title">Boundary profile</h3><span>Click the profile to move the probe</span></div>';profilePanel.append(profile);profilePanel.insertAdjacentHTML('beforeend','<p class="hardy-profile-note" id="hardy-profile-note"></p>');column.append(profilePanel);
 if(scene!==root&&scene!==column&&scene.children.length===0)scene.remove();
 let html='<h3>Explore the mechanism</h3>';
 if(kind==='transfer'){
  html+=control('rho','Response radius ρ',1.6,3,.01)+control('image','Inner ellipse s',.06,.7,.005,'The range preserves strict inverse-branch containment.')+control('hardy','Hardy ellipse r',.1,.9,.005,'Moves between the inner and outer ellipses.')+control('N','Geometric exponent N',1,40,1);
 }else if(kind==='synthesis'){
  html+=control('r','Inner radius r',1.1,1.9,.02,'Outer radius R = 2; q = r/R.')+control('N','Retained modes N',0,48,1);
 }else{
  html+=control('R','Outer radius R',1.35,3,.05)+control('r','Inner radius r',1.05,2.12,.01)+control('N','Retained modes N',0,9,1);
  html+='<div class="hardy-control"><label for="hardy-family">Input polynomial</label><select id="hardy-family" data-control="family"><option value="packet">Nine Legendre terms</option><option value="constant">Constant input</option></select><small>Each input is normalized in the source norm.</small></div>';
 }
 html+=control('amplitude','Amplitude A',0,2,.05,kind==='synthesis'?'Multiplies the coefficient family.':'Scales magnitudes by A and energies by A².');
 html+=control('angle',kind==='synthesis'?'Phase and probe angle':'Input probe angle',0,360,1,kind==='synthesis'?'Phase changes this polynomial as well as the probe.':'Probe motion preserves whole norms for a fixed function.');
 html+='<div class="hardy-motion"><button type="button" data-action="play" aria-pressed="false">Move once around</button></div>';
 html+='<div class="hardy-presets">'+(kind==='transfer'?'<button type="button" data-action="balance">Balance the two gaps</button>':kind==='synthesis'?'<button type="button" data-action="all">Retain all 48 terms</button>':'<button type="button" data-action="constant">Try the constant</button><button type="button" data-action="packet">Restore nine terms</button>')+'</div>';
 content.innerHTML=html;
 const heading=$('.hardy-stages');if(heading)heading.setAttribute('aria-label','Steps in the explanation');
 root.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>chooseStage(Number(button.dataset.stage))));
 content.querySelectorAll('[data-control]').forEach(el=>{el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{stop();state[el.dataset.control]=el.tagName==='SELECT'?el.value:Number(el.value);update();save();});});
 content.querySelector('[data-action="play"]').addEventListener('click',play);
 content.querySelector('[data-action="balance"]')?.addEventListener('click',()=>{stop();const s=model.radii.s,rho=model.radii.rho;state.hardy=(Math.sqrt(s*rho)-s)/(rho-s);chooseStage(2);});
 content.querySelector('[data-action="all"]')?.addEventListener('click',()=>{state.N=48;chooseStage(2);});
 content.querySelector('[data-action="constant"]')?.addEventListener('click',()=>{state.family='constant';chooseStage(1);});
 content.querySelector('[data-action="packet"]')?.addEventListener('click',()=>{state.family='packet';update();save();});
 $('#hardy-legend').addEventListener('click',e=>{const b=e.target.closest('[data-focus]');if(b){focus=b.dataset.focus;update(false);save();}});
}
// Keep one live diagram, with the same controls and measurements in either view.
function arrangeBoundaryView() {
 const diagram = $('#boundary-diagram');
 const opener = diagram.querySelector('[data-view-size]');
 const controls = $('#hardy-controls');
 const motion = document.createElement('div');
 motion.className = 'boundary-motion';
 motion.append($('#hardy-angle').closest('.hardy-control'), controls.querySelector('.hardy-motion'));
 motion.querySelector('small').textContent = 'The inner probe follows the outer probe a quarter-turn behind so both markers stay visible.';
 diagram.insertBefore(motion, diagram.querySelector('.hardy-diagram-caption'));
 const settings = document.createElement('details');
 settings.className = 'boundary-settings';
 const compact = matchMedia('(max-width:850px)');
 settings.open = !compact.matches;
 compact.addEventListener('change', event => { settings.open = !event.matches; });
 const summary = document.createElement('summary');
 summary.textContent = 'Radii, polynomial and truncation';
 controls.before(settings);
 settings.append(summary, controls);
 controls.querySelector('h3').remove();
 const dialog = document.createElement('dialog');
 dialog.className = 'boundary-dialog';
 dialog.setAttribute('aria-labelledby', 'boundary-diagram-title');
 const slot = document.createComment('Inline boundary diagram');
 diagram.before(slot);
 root.append(dialog);
 opener.addEventListener('click', () => {
  if (dialog.open) { dialog.close(); return; }
  dialog.append(diagram);
  opener.textContent = 'Close enlarged view';
  dialog.showModal();
  opener.focus();
 });
 dialog.addEventListener('close', () => {
  slot.after(diagram);
  opener.textContent = 'Enlarge diagram';
  opener.focus({preventScroll:true});
 });
}
function chooseStage(next,saveState=true){stop();stage=Math.max(0,Math.min(2,next));state.part=stage===2?'tail':kind==='synthesis'&&stage===1?'prefix':'full';focus=kind==='transfer'?(stage===0?'input':stage===1?'response':'output'):(stage===0?'source':'target');
 root.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===stage)));
 const [title,copy,equation]=story[kind][stage];setHTML($('#hardy-stage-copy'),`<h2>${title}</h2><p>${copy}</p><div class="stage-equation">${equation}</div>`);typeset([$('#hardy-stage-copy')]);update();if(saveState)save();}
function gaugeLabel(g){if(g.key==='target'){const f=state.part==='tail'?String.raw`f-\mathcal P_Nf`:state.part==='prefix'?String.raw`\mathcal P_Nf`:'f';return `\\(${f}\\)`;}return `\\(${texNames[g.key]||'f'}\\)`;}
let legendKey='';
function boundaryTitle(g) {
 return g.key === 'source' ? 'Outer ellipse' : 'Inner ellipse';
}
function meterTitle(g) {
 return embedding ? boundaryTitle(g) + ' · ' + gaugeLabel(g) : gaugeLabel(g);
}
function buildLegend(){const key=model.gauges.map(g=>g.key).join(',')+'|'+state.part;if(key===legendKey)return;legendKey=key;
 setHTML($('#hardy-legend'),model.gauges.map(g=>`<button type="button" data-focus="${g.key}" aria-pressed="false" style="--meter-color:${colours[g.colorKey]||colours[g.key]||colours.source}"><i class="hardy-swatch"></i><span>${meterTitle(g)}<small>${g.energy?'Hardy energy hump':'Modulus lighthouse'}</small></span></button>`).join(''));typeset([$('#hardy-legend')]);
 setHTML($('#hardy-readings'),model.gauges.map(g=>`<div class="hardy-reading" style="--meter-color:${colours[g.colorKey]||colours[g.key]||colours.source}"><strong>${meterTitle(g)}</strong>${embedding ? '<span class="boundary-reading-angle" data-reading-angle="'+g.key+'"></span>' : ''}<dl><dt>${g.energy?'Local energy':'Local modulus'}</dt><dd data-local="${g.key}"></dd><dt>${g.energy?'Whole mean energy':kind==='synthesis'?'Sampled maximum':'Whole supremum'}</dt><dd data-whole="${g.key}"></dd></dl></div>`).join(''));typeset([$('#hardy-readings')]);}
function update(recalculate=true){
 if(recalculate){model=M.compute(kind,state);state={...model.state};}
 if(!model.gauges.some(g=>g.key===focus))focus=model.gauges[0].key;
 for(const el of root.querySelectorAll('[data-control]')){const key=el.dataset.control;if(el.value!==String(state[key]))el.value=state[key];const out=$(`[data-out="${key}"]`);if(out){let value=state[key];if(kind==='transfer'&&key==='image')value=model.radii.s;if(kind==='transfer'&&key==='hardy')value=model.radii.r;out.textContent=key==='angle'?Math.round(value)+'°':key==='N'?value:Number(value).toFixed(2);el.setAttribute('aria-valuetext',out.textContent);}}
 if((kind==='j2'||kind==='jinf')&&$('#hardy-r'))$('#hardy-r').max=(state.R-.08).toFixed(2);
 buildLegend();root.querySelectorAll('[data-focus]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.focus===focus)));
 for(const g of model.gauges){if (embedding) {
  const angle = ((Math.round(g.angle * 180 / Math.PI) % 360) + 360) % 360;
  text(`[data-reading-angle="${g.key}"]`, angle + '°');
 }
 text(`[data-local="${g.key}"]`,'≈ '+fmt(g.local));text(`[data-whole="${g.key}"]`,'≈ '+fmt(g.whole));}
 draw();renderResults();
 const g=model.gauges.find(x=>x.key===focus);text('#hardy-profile-title',g.energy?'Angular energy profile':'Boundary modulus profile');text('#hardy-profile-note',g.energy?'Equal angle intervals have equal weight. The dashed line is the whole mean energy; its square root is the Hardy norm.':kind==='synthesis'?'The dashed ceiling is the maximum over 4,096 angles, a numerical approximation to the supremum. The moving light shows one local magnitude.':'The dashed ceiling is the whole supremum. The moving light shows one local magnitude.');
 root.dataset.state=JSON.stringify({...state,stage,focus});root.dataset.model=JSON.stringify({parts:model.parts,bounds:model.bounds,ratios:model.ratios,scalar:model.scalar,radii:model.radii,sourceNorm:model.sourceNorm});root.dataset.gauges=JSON.stringify(model.gauges.map(({key,local,whole})=>({key,local,whole})));root.dataset.ready='true';
 if(!playing&&performance.now()-lastLive>300){text('#hardy-live',`${titles[kind]}. Step ${stage+1}. ${state.N} ${kind==='transfer'?'geometric exponent':'retained modes'}. Local ${g.energy?'energy':'modulus'} ${fmt(g.local)}. Whole ${g.energy?'mean':'supremum'} ${fmt(g.whole)}.`);lastLive=performance.now();}
}
function draw() {
 if (!model) return;
 const onAngle = degrees => {
  stop();
  state.angle = ((degrees % 360) + 360) % 360;
  update();
  save();
 };
 V.render(svg, model, {onAngle, focus, stage});
 const gauge = model.gauges.find(item => item.key === focus) || model.gauges[0];
 V.profile(profile, gauge, {onAngle, angle: gauge.angle, baseAngle: state.angle, colorKey: gauge.colorKey});
 profile.setAttribute('aria-label', (gauge.energy ? 'Angular energy profile' : 'Boundary modulus profile') + ' for ' + gauge.label);
 root.dispatchEvent(new CustomEvent('hardy:update', {detail: {model, gauge, state, stage, focus}}));
}
let resultReady=false;
function resultShell(){if(resultReady)return;resultReady=true;let html='';
 if(kind==='synthesis')html=String.raw`<div class="hardy-result-heading"><h2>Retained budget and infinite tail</h2><p>Exact scalar formulas · rounded values</p></div><div class="hardy-metrics"><div class="hardy-metric"><span>Retained \(\mathsf S_N(q)\)</span><strong data-result="S"></strong><small>Degrees \(0,\ldots,N-1\)</small></div><div class="hardy-metric"><span>Tail \(\mathsf T_N(q)\)</span><strong data-result="T"></strong><small>Degrees \(N,N+1,\ldots\)</small></div><div class="hardy-metric"><span>Total \(\mathsf S_\infty(q)\)</span><strong data-result="total"></strong><small>\(\mathsf S_N+\mathsf T_N\)</small></div></div><div class="hardy-budget-panel"><div class="hardy-budget-key"><span><i style="--meter-color:var(--hardy-input)"></i>Retained scalar terms</span><span><i style="--meter-color:var(--hardy-image)"></i>Omitted scalar terms</span></div><svg id="hardy-budget" role="img" aria-label="Scalar majorant terms by degree"></svg></div><p class="hardy-result-note" data-result="note"></p>`;
 else if(kind==='transfer')html=String.raw`<div class="hardy-result-heading"><h2>Which gap limits the geometric decay?</h2><p>Geometric factors only · no operator-error prefactors</p></div><div class="hardy-factors"><div class="hardy-factor" style="--meter-color:var(--hardy-image)"><div class="hardy-factor-head"><span>Input \(q_{\rm gap}=s/r\)</span><output data-result="qgap"></output></div><div class="track"><div class="bar" data-factor="input"></div></div><div class="hardy-factor-head"><span>\(q_{\rm gap}^N\)</span><strong data-result="inputPower"></strong></div><small>Restriction to the branch-image ellipse</small></div><div class="hardy-factor" style="--meter-color:var(--hardy-response)"><div class="hardy-factor-head"><span>Output \(q_{\rm out}=r/\rho\)</span><output data-result="qout"></output></div><div class="track"><div class="bar" data-factor="output"></div></div><div class="hardy-factor-head"><span>\(q_{\rm out}^N\)</span><strong data-result="outputPower"></strong></div><small>Return to the Hardy ellipse</small></div></div><p class="hardy-result-note" data-result="note"></p>`;
 else html=String.raw`<div class="hardy-result-heading"><h2>Example and theorem bound</h2><p data-result="normalization"></p></div><table class="hardy-results-table"><thead><tr><th>Target norm</th><th>Example ≈</th><th>Bound for this input ≈</th></tr></thead><tbody><tr data-row="full"><td>Full restriction</td><td data-actual="full"></td><td data-bound="full"></td></tr><tr data-row="prefix"><td>Retained polynomial</td><td data-actual="prefix"></td><td data-bound="prefix"></td></tr><tr data-row="tail"><td>Projection error</td><td data-actual="tail"></td><td data-bound="tail"></td></tr></tbody></table><p class="hardy-result-note" data-result="note"></p>`;
 setHTML($('#hardy-results'),html);typeset([$('#hardy-results')]);}
function renderResults(){resultShell();
 if(kind==='synthesis'){
  for(const key of['S','T','total'])text(`[data-result="${key}"]`,fmt(model.scalar[key]));
  text('[data-result="note"]',`q = ${fmt(model.ratios.q)}. Bars show (2n + 1)qⁿ before amplitude scaling. The example has 48 terms; the scalar tail extends to infinity.`);drawBudget();
 }else if(kind==='transfer'){
  const {qgap,qout}=model.ratios,ip=qgap**state.N,op=qout**state.N;for(const[k,v]of Object.entries({qgap,qout,inputPower:ip,outputPower:op}))text(`[data-result="${k}"]`,fmt(v));$('[data-factor="input"]').style.width=100*ip+'%';$('[data-factor="output"]').style.width=100*op+'%';
  const relative=Math.abs(qgap-qout)<1e-9?'The two ratios are balanced':qgap>qout?'The input gap gives slower geometric decay':'The output gap gives slower geometric decay';text('[data-result="note"]',`${relative}. q* = ${fmt(Math.max(qgap,qout))}. Changing N changes these factors, not the fixed example function.`);
 }else{
  for(const part of['full','prefix','tail']){text(`[data-actual="${part}"]`,fmt(model.parts[part]));text(`[data-bound="${part}"]`,fmt(model.bounds[part]));$(`[data-row="${part}"]`).dataset.active=String(state.part===part);}
  text('[data-result="normalization"]',`${kind==='j2'?'Source Hardy norm':'Source supremum'} = ${fmt(model.sourceNorm)} · q = ${fmt(model.ratios.q)}`);
  text('[data-result="note"]',kind==='j2'?'The target norm is the supremum. Shared Laurent frequencies are combined before computing the source Hardy norm. All displayed numbers use floating-point arithmetic.':'The target norm is the Hardy norm. The full restriction has operator norm one. The perimeter constant in the projection bounds is evaluated by 2,048-point quadrature.');
 }
}
function drawBudget(){const chart=$('#hardy-budget');if(!chart)return;const w=chart.getBoundingClientRect().width,h=230,left=48,right=w-16,top=30,bottom=188,q=model.ratios.q,values=Array.from({length:64},(_,n)=>(2*n+1)*q**n),max=Math.max(...values)*1.08,NS='http://www.w3.org/2000/svg';chart.setAttribute('viewBox',`0 0 ${w} ${h}`);chart.setAttribute('height',h);chart.replaceChildren();const add=(tag,a,label)=>{const e=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));if(label)e.textContent=label;chart.append(e);return e;};add('title',{},'The positive scalar terms split at degree N');for(let i=0;i<3;i++){const v=max*i/2,y=bottom-(bottom-top)*i/2;add('line',{x1:left,x2:right,y1:y,y2:y,stroke:'var(--line)','stroke-width':1});add('text',{x:left-7,y:y+4,'text-anchor':'end'},fmt(v));}const bw=(right-left)/64;values.forEach((v,n)=>{const height=v/max*(bottom-top);add('rect',{x:left+n*bw+.6,y:bottom-height,width:Math.max(.7,bw-1.2),height,fill:n<state.N?'var(--hardy-input)':'var(--hardy-image)'});});for(const n of[0,16,32,48,63])add('text',{x:left+(n+.5)*bw,y:bottom+20,'text-anchor':n===63?'end':'middle'},String(n));add('text',{x:left,y:17},'Scalar term');add('text',{x:right,y:225,'text-anchor':'end'},'Legendre degree n');}
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;playing=false;const b=$('[data-action="play"]');if(b){b.textContent='Move once around';b.setAttribute('aria-pressed','false');}}
function play(){if(playing){stop();save();return;}if(matchMedia('(prefers-reduced-motion: reduce)').matches){state.angle=(state.angle+45)%360;update();save();return;}playing=true;const button=$('[data-action="play"]');button.textContent='Pause';button.setAttribute('aria-pressed','true');const start=performance.now(),angle=state.angle;let last=0;const tick=now=>{const fraction=Math.min(1,(now-start)/14000);if(now-last>(kind==='synthesis'?110:50)||fraction===1){state.angle=(angle+360*fraction)%360;update();last=now;}if(fraction<1)frame=requestAnimationFrame(tick);else{stop();save();}};frame=requestAnimationFrame(tick);}
setup();
if (embedding) arrangeBoundaryView();
chooseStage(stage,false);
document.addEventListener('DOMContentLoaded', () => {
 const shortcut = document.querySelector('.hardy-experiment-link');
 if (!shortcut) return;
 const link = Array.from(shortcut.querySelectorAll('a')).find(a => a.hash === location.hash) || shortcut.querySelector('a');
 const target = document.getElementById(link.hash.slice(1));
 if (target && !target.hidden) {
  shortcut.hidden = false;
  if (location.hash === '#' + target.id) target.scrollIntoView();
 }
}, {once:true});
new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{draw();if(kind==='synthesis')drawBudget();});}).observe(svg.parentElement);
window.addEventListener('pagehide',()=>{stop();clearTimeout(saveTimer);try{localStorage.setItem(storageKey,JSON.stringify({version:1,state,stage,focus}));}catch{}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
if(window.MathJax?.startup?.promise)window.MathJax.startup.promise.then(()=>window.MathJax.typesetPromise()).then(()=>{root.dataset.mathReady='true';}).catch(()=>{root.dataset.mathReady='error';});
})();
