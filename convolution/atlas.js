/* Two constructions of finite, zero-extended linear convolution. */
(()=>{
'use strict';
const M=ConvolutionMath,$=id=>document.getElementById(id),fmt=n=>Object.is(n,-0)?'0':String(Number(n.toPrecision(6)));
const colors={a:'#59cde6',b:'#98b4ff',p:'#acdf84',c:'#d7a6fb',selected:'#ffd06a'};
const copyColors=['#98b4ff','#ffbb75','#90dbb4','#d7a6fb','#ff95b7','#59cde6'];
const COPY_PAGE_SIZE=3;
const presets={
 rose:{a:Array.from({length:13},(_,i)=>.8**i),b:Array(6).fill(1),as:0,bs:0},
 academia:{a:[2,2,1],b:[3,3,3,3,3],as:0,bs:0},
 step_decay:{a:Array(21).fill(1),b:Array.from({length:21},(_,i)=>.8**i),as:0,bs:0},
 sine:{a:Array.from({length:31},(_,i)=>{const v=Math.cos(Math.PI*(i-5)/4);return Math.abs(v)<1e-12?0:v;}),b:Array.from({length:21},(_,i)=>.85**i),as:-5,bs:0},
 long:{a:[2,2,2,2,1,1,1,1],b:[.4,.3,.2,.1],as:0,bs:0},
 decay:{a:Array.from({length:5},(_,i)=>.8**i),b:Array.from({length:12},(_,i)=>.7**i),as:0,bs:0},
 walkthrough:{a:[1,2,1],b:[1,1,1],as:0,bs:0},
 pulse:{a:[1,2,1],b:[1,1],as:0,bs:0},
 average:{a:[0,3,0,3,0],b:[.5,.5],as:0,bs:0},
 signed:{a:[1,-1,2],b:[1,-1],as:-1,bs:0},
 impulse:{a:[1,2,-1],b:[2],as:0,bs:2},
 wireless:{a:[2,-1,1],b:[-1,1,2],as:0,bs:0}
};
let state,mode='slide',playing=false,timer=null,mathReady=false,drag=null,rangeModes={},cache=null;
let previousKernel=new Map(),lastMotion='',mathCache=new Map();
let originWindows={},overviewFrame=null,resampleBases={};
let mathPinned=false,windowDrag=null,windowResize=null,windowSizeBackup=null;
let mathTermPage=0,mathTermKey='',mathListKey='';
const phases=['Original','Flip','Slide','Multiply','Sum'];
const absMax=values=>values.reduce((max,v)=>Math.max(max,Math.abs(v)),0);
const amplitudeScale=values=>absMax(values)||1;
const responseHeight=base=>base*Number($('response-zoom').value);
function mathLine(id,tex,plain=tex){
 const el=$(id),key=(mathReady?'ready:':'raw:')+tex;
 el.setAttribute('aria-label',plain);
 if(mathCache.get(id)===key)return;
 mathCache.set(id,key);
 if(!mathReady){el.textContent=`\\(${tex}\\)`;return;}
 try{el.replaceChildren(MathJax.tex2svg(tex,{display:false}));}
 catch(error){el.textContent=plain;console.error('MathJax:',error);}
}
// Colour native MathJax fragments with CSS, using the same palette as the SVG
// stems. This needs no extra TeX extension or network-loaded colour package.
const piece=(kind,tex)=>({kind,tex});
function mathParts(id,parts,plain=parts.map(p=>p.tex).join('')){
 const el=$(id),key=(mathReady?'parts:':'raw-parts:')+JSON.stringify(parts);
 el.setAttribute('aria-label',plain);
 if(mathCache.get(id)===key)return;
 mathCache.set(id,key);el.replaceChildren();
 for(const {kind,tex} of parts){
  const span=document.createElement('span');span.className='math-piece '+(kind||'');
  if(!mathReady)span.textContent=`\\(${tex}\\)`;
  else try{span.append(MathJax.tex2svg(tex,{display:false}));}
  catch(error){span.textContent=tex;console.error('MathJax:',error);}
  el.append(span);
 }
}
function pairParts(t){return [piece('a',`a[${fmt(t.j)}]`),piece('', '\\cdot'),piece('b',`b[${fmt(t.otherIndex)}]`),piece('','='),piece('a',`(${fmt(t.a)})`),piece('','\\cdot'),piece('b',`(${fmt(t.b)})`),piece('','='),piece('p',`p_{${fmt(state.k)}}[${fmt(t.j)}]=${fmt(t.product)}`)];}
function pairPlain(t){return `Input a[${fmt(t.j)}] = ${fmt(t.a)} times kernel b[${fmt(t.otherIndex)}] = ${fmt(t.b)} gives product p[${fmt(t.j)}] = ${fmt(t.product)} at output k = ${fmt(state.k)}.`;}
function pairLocation(t){
 const missing=derived().bg.index.get(t.otherIndex)===undefined;
 if(mode==='overview')return `Cyan input at j = ${fmt(t.j)}; blue kernel at ℓ = ${fmt(t.otherIndex)}.${missing?' This kernel position has no sample, so b = 0.':''} Their product ${fmt(t.product)} is one contribution; the purple bar adds every product.`;
 if(mode==='copies')return `The copy for input j = ${fmt(t.j)} contributes ${fmt(t.product)} at k = ${fmt(state.k)}. Copy-row colours identify whole contributions; cyan and blue still identify the two factors.${inputValue(t.j)===0?' This zero input has no copy row.':''}`;
 const pos=state.stage===0?t.otherIndex:state.stage===1?-t.otherIndex:t.j;
 return `Cyan input at j = ${fmt(t.j)}; blue kernel sample b[${fmt(t.otherIndex)}] is drawn at ${state.stage===0?'ℓ':'j'} = ${fmt(pos)}.${missing?' There is no kernel sample at this position; b = 0.':''} ${state.stage<2?'Flip and Slide align the factors.':'The green product is drawn at the same j.'}`;
}
function outputProgress(){
 const d=derived(),final=d.conv.value(state.k);
 if(mode==='copies')return state.copyCount===d.indices.length?`Purple result c[${fmt(state.k)}] = ${fmt(final)}: every copy has been added.`:`The purple running sum S[${fmt(state.k)}] = ${fmt(state.copyValues[d.conv.index(state.k)]??0)} includes ${state.copyCount} copies. The hollow reference shows the complete result ${fmt(final)}.`;
 return `The purple bar at k = ${fmt(state.k)} has height ${fmt(final)}: it adds all green products. The gold ring identifies this output.`;
}

function renderPlotLinks(){
 const d=derived(),t=termsAt().find(t=>t.j===state.j)||termsAt()[0];
 mathParts('plot-pair',pairParts(t),pairPlain(t));
 const partial=mode==='copies'&&state.copyCount<d.indices.length;
 mathParts('plot-output',[piece('c',`${partial?'S':'c'}[${fmt(state.k)}]=${fmt(partial?(state.copyValues[d.conv.index(state.k)]??0):d.conv.value(state.k))}`)]);
 $('plot-link-note').textContent=pairLocation(t)+' '+outputProgress();
}
function renderExampleMath(){
 const d=derived(),preset=presets[$('preset').value];
 const unchanged=d.ag.values.join(',')===preset.a.join(',')&&d.bg.values.join(',')===preset.b.join(',')&&d.ag.step===(d.ag.values.length===1?0:1)&&d.bg.step===(d.bg.values.length===1?0:1);
 $('example-math-title').textContent=$('preset').selectedOptions[0].textContent+(unchanged?' · formulas':' · current edited formulas');
 $('example-note').textContent=$('preset').value==='rose'?'Rose-Hulman style example: a 13-sample exponential (decay 0.8) and a six-sample pulse. Slide the blue reversed pulse over the cyan exponential. The green products sum to the highlighted purple output. Both signals are finite.':$('preset').value==='step_decay'?'Finite 21-sample windows. For the unchanged example, c[n] = (1 − 0.8ⁿ⁺¹) / (1 − 0.8) for 0 ≤ n ≤ 20; it then falls as the windows stop overlapping. An infinite step and exponential would instead approach 5.':$('preset').value==='academia'?'Electrical Academia example: a = [2, 2, 1], b = [3, 3, 3, 3, 3], both starting at zero. The original result is [6, 12, 15, 15, 15, 9, 3]. The source flips the input; reversing the kernel gives the same convolution.':'';
 function expansion(symbol,positions,values){
  const nz=values.map((v,i)=>({v,x:positions[i]})).filter(t=>t.v!==0);
  if(nz.length>5)return `${symbol}[k]=\\sum_{i=0}^{${values.length-1}}${symbol}_i\\,\\delta_0(k-${symbol==='a'?'j_i':symbol==='b'?'\\ell_i':'\\kappa_i'})`;
  return `${symbol}[k]=`+(nz.map((t,i)=>`${t.v<0?'-':i?'+':''}${Math.abs(t.v)===1?'':fmt(Math.abs(t.v))+'\\,'}\\delta_0(k${t.x<0?'+':t.x>0?'-':''}${t.x===0?'':fmt(Math.abs(t.x))})`).join('')||'0');
 }
 const aTex=unchanged&&$('preset').value==='rose'?`a[${state.as}+i]=(0.8)^i,\\quad i=0,\\ldots,12`:unchanged&&$('preset').value==='step_decay'?`a[${state.as}+i]=1,\\quad i=0,\\ldots,20` :unchanged&&$('preset').value==='sine'?`a[${state.as}+i]=\\cos(\\pi(-5+i)/4),\\quad 0\\le i\\le30`:unchanged&&$('preset').value==='decay'?`a[k]=\\sum_{i=0}^{4}(0.8)^i\\,\\delta_0(k-(${state.as}+i))`:expansion('a',d.ag.positions,d.ag.values);
 const bTex=unchanged&&$('preset').value==='rose'?`b[${state.bs}+i]=1,\\quad i=0,\\ldots,5`:unchanged&&$('preset').value==='step_decay'?`b[${state.bs}+i]=(0.8)^i,\\quad i=0,\\ldots,20` :unchanged&&$('preset').value==='sine'?`b[${state.bs}+i]=(0.85)^i,\\quad 0\\le i\\le20`:unchanged&&$('preset').value==='decay'?`b[k]=\\sum_{i=0}^{11}(0.7)^i\\,\\delta_0(k-(${state.bs}+i))`:expansion('b',d.bg.positions,d.bg.values);
 mathParts('example-input',[piece('a',aTex)]);
 mathParts('example-kernel',[piece('b',bTex)]);
 const expanded=d.output.filter(t=>t.value!==0).length<=5;
 const cTex=unchanged&&$('preset').value==='rose'?`c[${state.as+state.bs}+n]=\\sum_{i=\\max(0,n-5)}^{\\min(n,12)}(0.8)^i,\\quad 0\\le n\\le17`:unchanged&&$('preset').value==='step_decay'?`c[${state.as+state.bs}+n]=\\sum_{r=\\max(0,n-20)}^{\\min(n,20)}(0.8)^r,\\quad 0\\le n\\le40`:unchanged&&$('preset').value==='decay'?`c[k]=\\sum_{i=0}^{4}\\sum_{r=0}^{11}(0.8)^i(0.7)^r\\,\\delta_0(k-(${state.as+state.bs}+i+r))`:expanded?expansion('c',d.output.map(t=>t.k),d.output.map(t=>t.value)):`c[k]=\\sum_{i=0}^{${d.ag.values.length-1}}\\sum_{r=0}^{${d.bg.values.length-1}}a_i b_r\\,\\delta_0(k-j_i-\\ell_r)`;
 mathParts('example-output',[piece('c',d.approx&&expanded?cTex.replace('c[k]=','c[k]\\approx'):cTex)],`Convolution result. ${cTex}${d.approx&&expanded?' Displayed decimal coefficients are rounded.':''}`);
}
function pause(){
 playing=false;clearTimeout(timer);timer=null;
 $('play').textContent='Play';$('play').setAttribute('aria-pressed','false');
}
function activeBounds(grid){
 const indices=grid.positions.filter((_,i)=>grid.values[i]!==0);
 return indices.length?[indices[0],indices[indices.length-1]]:[grid.start,grid.end];
}
function derived(){
 if(cache)return cache;
 const sourceA=M.grid(state.a,state.as,state.ae),sourceB=M.grid(state.b,state.bs,state.be);
 const prepared=M.commonGrid(sourceA,sourceB),{ag,bg,conv}=prepared,output=conv.output,lo=output[0].k,hi=output[output.length-1].k;
 const aBounds=activeBounds(ag),bBounds=activeBounds(bg),active=[aBounds[0]+bBounds[0],aBounds[1]+bBounds[1]];
 const indices=ag.positions.filter((_,i)=>ag.values[i]!==0),partial=output.map(()=>0);let copyEnvelope=0;
 for(const j of indices)copyEnvelope=Math.max(copyEnvelope,conv.addRow(ag.index.get(j),partial));
 return cache={...prepared,sourceA,sourceB,output,lo,hi,aBounds,bBounds,active,indices,copyEnvelope,scale:amplitudeScale(ag.values),kernelScale:amplitudeScale(bg.values),approx:!ag.values.concat(bg.values).every(v=>Number.isInteger(v*2)),outputScale:amplitudeScale(output.map(t=>t.value))};
}
const termsAt=()=>derived().conv.terms(state.k);
const inputValue=j=>derived().ag.values[derived().ag.index.get(j)]??0;
const sampleOrdinal=(kind,index)=>derived()[kind+'g'].index.get(index);

function countFormula(){const d=derived();return `N_c=N_a+N_b-1=${d.ag.values.length}+${d.bg.values.length}-1=${d.output.length}`;}
function countParts(){const d=derived();return [piece('c','N_c'),piece('','='),piece('a','N_a'),piece('','+'),piece('b','N_b'),piece('','-1='),piece('a',String(d.ag.values.length)),piece('','+'),piece('b',String(d.bg.values.length)),piece('','-1='),piece('c',String(d.output.length))];}

function phaseParts(){
 return [
  [piece('b','b[\\ell]')],
  [piece('b','r[j]=b[-j]')],
  [piece('b',`s_{${state.k}}[j]=r[j-(${state.k})]=b[${state.k}-j]`)],
  [piece('p',`p_{${state.k}}[j]`),piece('','='),piece('a','a[j]'),piece('b',`b[${state.k}-j]`)],
  [piece('c',`c[${state.k}]`),piece('','=\\sum_{j\\in J_a}'),piece('p',`p_{${state.k}}[j]`),piece('','='),piece('c',fmt(derived().conv.value(state.k)))]
 ][state.stage];
}
function copySumParts(){
 const d=derived(),added=d.indices.slice(0,state.copyCount),parts=[piece('c',state.copyCount===d.indices.length?'c[k]':'S[k]'),piece('','=')];
 if(!added.length)parts.push(piece('c','0'));
 else if(added.length>3)parts.push(piece('','\\sum_{\\text{added }j}'),piece('a','a[j]'),piece('b','b[k-j]'));
 else added.forEach((j,i)=>{if(i)parts.push(piece('','+'));parts.push(piece('copy-'+i%copyColors.length,`(${fmt(inputValue(j))})b[k-(${fmt(j)})]`));});
 return parts;
}
function resetConstruction(){
 cache=null;const d=derived();state.revealed=new Map();state.copyCount=0;state.copyValues=d.output.map(()=>0);state.copyPage=0;
 state.stage=3;state.j=state.as;previousKernel=new Map();lastMotion='';
}
function setPreset(){
 pause();const p=presets[$('preset').value];
 state={a:[...p.a],b:[...p.b],as:p.as,ae:p.as+p.a.length-1,bs:p.bs,be:p.bs+p.b.length-1,k:p.as+p.bs};
 resampleBases={a:M.grid(state.a,state.as,state.ae),b:M.grid(state.b,state.bs,state.be)};
 resetConstruction();selectPeak();syncFields();$('input-error').textContent='';$('edit-status').textContent='Valid edits update immediately.';render();
}
function selectPeak(){
 const d=derived(),peak=d.output.reduce((best,t)=>Math.abs(t.value)>Math.abs(best.value)?t:best,d.output[0]);
 state.k=peak.k;const terms=d.conv.terms(state.k);state.j=(terms.find(t=>t.product!==0)||terms[0]).j;
}
function syncRanges(){
 for(const kind of ['a','b']){
  const start=state[kind+'s'];$(kind+'-end').value=state[kind+'e'];
  $(kind+'-end').min=start;$(kind+'-end').removeAttribute('max');$(kind+'-count').value=state[kind].length;
 }
}
function syncFields(){
 rangeModes={};
 for(const kind of ['a','b']){$(kind+'-values').value=state[kind].join(', ');$(kind+'-start').value=state[kind+'s'];}
 syncRanges();anchorOriginControls();
}
const safeIndex=n=>Math.max(Number.MIN_SAFE_INTEGER,Math.min(Number.MAX_SAFE_INTEGER,n));
function anchorOriginControls(){
 const radius=Math.min(8,Math.max(1,Math.ceil((state.ae-state.as+state.be-state.bs)/4)));
 for(const kind of ['a','b']){
  const start=state[kind+'s'],other=state[(kind==='a'?'b':'a')+'s'],length=state.ae-state.as+state.be-state.bs;
  originWindows[kind]=[Math.max(safeIndex(start-radius),safeIndex(Number.MIN_SAFE_INTEGER-other)),Math.min(safeIndex(start+radius),safeIndex(Number.MAX_SAFE_INTEGER-other-length),safeIndex(Number.MAX_SAFE_INTEGER-(state[kind+'e']-start)))];
 }
 overviewFrame=null;
}
function overviewRange(){
 if(overviewFrame)return overviewFrame;
 const d=derived(),listed=$('view-range').value==='listed';
 const a=listed?[state.as,state.ae]:d.aBounds,b=listed?[state.bs,state.be]:d.bBounds;
 const aLo=originWindows.a[0]+(a[0]-state.as),aHi=originWindows.a[1]+(a[1]-state.as);
 const bLo=originWindows.b[0]+(b[0]-state.bs),bHi=originWindows.b[1]+(b[1]-state.bs);
 // Keep the coordinate frame fixed across the entire slider window, so a shift
 // translates all stems rather than following them with a moving viewport.
 return overviewFrame=[safeIndex(Math.min(aLo,bLo,aLo+bLo,state.k)-1),safeIndex(Math.max(aHi,bHi,aHi+bHi,state.k)+1)];
}
function shiftOrigin(kind,start){
 if(!Number.isSafeInteger(start))return;
 const delta=start-state[kind+'s'],end=state[kind+'e']+delta,as=kind==='a'?start:state.as,bs=kind==='b'?start:state.bs,ae=kind==='a'?end:state.ae,be=kind==='b'?end:state.be;
 if(![end,as+bs,ae+be].every(Number.isSafeInteger)){
  $('input-error').textContent='The shifted ranges and output indices must be safely representable integers.';return;
 }
 try{M.commonGrid(M.grid(state.a,as,ae),M.grid(state.b,bs,be));}
 catch(error){$('input-error').textContent=error.message;render();return;}
 pause();const k=state.k,jOrdinal=derived().ag.index.get(state.j)||0;state[kind+'s']=start;state[kind+'e']=end;const base=resampleBases[kind];resampleBases[kind]=M.grid(base.values,base.start+delta,base.end+delta);resetConstruction();
 state.k=scanPositions()[nearestOrdinal(scanPositions(),k)];state.j=derived().ag.positions[jOrdinal]??state.as;
 rangeModes={};$(kind+'-start').value=start;syncRanges();
 $('input-error').textContent='';$('edit-status').textContent='Whole sequence shifted; sample values and count are unchanged.';render();
}
function scanBounds(){
 const d=derived(),bounds=$('view-range').value==='listed'?[d.lo,d.hi]:d.active;
 // Optional boundary zeros are included only when the neighbouring index is safe.
 const step=d.conv.step;
 return [bounds[0]-step<Number.MIN_SAFE_INTEGER?bounds[0]:bounds[0]-step,bounds[1]+step>Number.MAX_SAFE_INTEGER?bounds[1]:bounds[1]+step];
}
function scanPositions(){const d=derived(),[lo,hi]=scanBounds();return [...new Set([lo,...d.output.filter(t=>t.k>=lo&&t.k<=hi).map(t=>t.k),hi])].sort((a,b)=>a-b);}
function domain(){
 const d=derived(),listed=$('view-range').value==='listed',a=listed?[state.as,state.ae]:d.aBounds,b=listed?[state.bs,state.be]:d.bBounds;
 const scan=scanBounds();
 const jLo=Math.min(a[0],b[0],-b[1],scan[0]-b[1],state.k-b[1]);
 const jHi=Math.max(a[1],b[1],-b[0],scan[1]-b[0],state.k-b[0]);
 const pad=safeIndex;
 return {j:[pad(jLo-1),pad(jHi+1)],k:[Math.min(scan[0],state.k),Math.max(scan[1],state.k)],a,b};
}
function makeAxis(width,top,height,lo,hi,scale,label){
 const left=58,right=width-26,zero=top+height*.51,span=height*.29;
 const x=j=>left+(j-lo)/Math.max(Number.EPSILON,hi-lo)*(right-left),y=v=>zero-v/scale*span;
 const short=n=>{const value=Object.is(n,-0)?0:Number(n.toPrecision(4)),text=String(value);return text.length>8?value.toExponential(2):text;};
 let html=`<line class="axis" x1="${left}" y1="${zero}" x2="${right}" y2="${zero}"/><path d="M${right-5},${zero-3}l5,3l-5,3" fill="none" stroke="#a794bb"/>`;
 for(const v of [-scale,scale])html+=`<line class="grid" x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}"/><text class="tick" x="${left-9}" y="${y(v)+3}" text-anchor="end"><title>${fmt(v)}</title>${short(v)}</text>`;
 const tickText=short,charWidth=Math.max(tickText(lo).length,tickText(hi).length)*6+12,slots=Math.max(2,Math.floor((right-left)/Math.max(44,charWidth))),target=Math.max(Number.EPSILON,(hi-lo)/slots),power=10**Math.floor(Math.log10(target)),step=[1,2,5,10].find(n=>n*power>=target)*power;
 let ticks=[];const first=Math.ceil(lo/step)*step;for(let i=0;i<=slots;i++){const j=first+i*step;if(j<=hi)ticks.push(j);}
 if(ticks.length<2)ticks=[lo,hi];
 for(const j of [...new Set(ticks)])html+=`<line class="axis" x1="${x(j)}" y1="${zero-3}" x2="${x(j)}" y2="${zero+3}"/><text class="tick" x="${x(j)}" y="${top+height-2}" text-anchor="middle"><title>${fmt(j)}</title>${tickText(j)}</text>`;
 html+=`<text class="tick" x="${right+12}" y="${zero+4}">${label}</text>`;
 return {x,y,zero,scale,span,html,top,height,left,right,lo,hi};
}
function heading(title,subtitle,y,color){
 return `<text class="row-title" x="14" y="${y}" style="fill:${color}">${title}</text><text class="row-subtitle" x="14" y="${y+15}">${subtitle}</text>`;
}
function visibleSamples(values,start,selected,end=start+values.length-1){
 const positions=Array.isArray(start)?start:values.map((_,i)=>values.length===1?start:start+(end-start)*i/(values.length-1));
 const nonzero=values.reduce((n,v)=>n+(v!==0),0),stride=Math.max(1,Math.ceil(nonzero/180));let seen=0;
 return values.map((value,i)=>({value,index:positions[i],i})).filter(t=>{
  if(values.length<=28||t.i===0||t.i===values.length-1||t.index===selected)return true;
  if(t.value!==0)return seen++%stride===0;
  return false;
 });
}
function stem(ax,j,v,color,options={}){
 if(j<ax.lo||j>ax.hi)return '';
 const spacing=options.kind?derived()[options.kind+'g'].step:options.pair?derived().ag.step:options.output?derived().conv.step:options.spacing??1;
 const x=ax.x(j),y=ax.y(v),label=options.label!==false&&(options.selected||(ax.right-ax.left)*Math.max(spacing,Number.EPSILON)/Math.max(Number.EPSILON,options.sampleSpan||1)>35);
 const attrs=options.kind?`data-kind="${options.kind}" data-index="${options.index}" tabindex="0" role="slider" aria-label="${options.kind}[${options.index}]" aria-valuemin="-4" aria-valuemax="4" aria-valuenow="${v}" aria-orientation="vertical" class="drag"`:
 options.output?`data-output="${j}" tabindex="0" role="button" aria-label="Inspect ${options.series||'c'}[${j}]${options.computed?' = '+fmt(v):' (uncomputed)'}" class="pick"`:
 options.pair?`data-pair="${j}" tabindex="0" role="button" aria-label="Inspect pair j = ${j}" class="pair"`:'';
 const r=options.selected?5:3.5,opacity=options.reference?'.45':'1';
 let html=`<g ${attrs} ${options.ell!==undefined?`data-ell="${options.ell}" data-position="${j}"`:''}${options.copyJ!==undefined?` data-copy-j="${options.copyJ}" data-position="${j}"`:''} opacity="${opacity}" data-value="${v}" data-axis-scale="${ax.scale}" data-axis-span="${ax.span}"${options.selected?' data-selected="true"':''}${options.pending?' data-preview="true"':''}${options.computed?' data-computed="true"':''}>`;
 if(!options.uncomputed)html+=`<line x1="${x}" y1="${ax.zero}" x2="${x}" y2="${y}" stroke="${color}" stroke-width="${options.selected?2.6:2}"${options.pending?' stroke-dasharray="4 3"':''}/>`;
 html+=`<circle cx="${x}" cy="${options.uncomputed?ax.zero:y}" r="${options.uncomputed?2:r}" fill="${options.reference||options.pending?'#261833':color}" stroke="${color}" stroke-width="${options.pending?1.8:1.4}"/>`;
 if(options.selected&&!options.reference)html+=`<circle class="selection-ring" cx="${x}" cy="${options.uncomputed?ax.zero:y}" r="${options.uncomputed?5:8}" fill="none" stroke="${colors.selected}" stroke-width="1.5" pointer-events="none"/>`;
 if(label&&!options.uncomputed&&!options.reference)html+=`<text class="value" x="${x}" y="${y+(v>=0?-12:18)}" text-anchor="middle" style="fill:${color}">${fmt(v)}</text>`;
 if(attrs)html+=`<circle cx="${x}" cy="${y}" r="12" fill="transparent"/>`;
 return html+'</g>';
}
function outputLayer(ax,copyMode=false){
 const d=derived(),show=$('show-reference').checked,range=[ax.lo,ax.hi];
 const candidates=d.output.filter(t=>t.k>=range[0]&&t.k<=range[1]);
 const stride=Math.max(1,Math.ceil(candidates.length/180));
 const visible=candidates.filter((t,i)=>candidates.length<=28||t.k===state.k||i===0||i===candidates.length-1||i%stride===0);
 let html='';
 if(copyMode&&show&&state.copyCount<d.indices.length)html+=visible.filter(t=>t.value!==0).map(t=>stem(ax,t.k,t.value,colors.c,{reference:true,label:false})).join('');
 for(const t of visible){
  const value=copyMode?(state.copyValues[d.conv.index(t.k)]??0):t.value;
  html+=stem(ax,t.k,value,colors.c,{output:true,computed:true,selected:t.k===state.k,label:visible.length<=28||t.k===state.k,sampleSpan:range[1]-range[0],series:copyMode&&state.copyCount<d.indices.length?'S':'c'});
 }
 for(const k of [range[0],range[1]]){
  if(k>=d.lo&&k<=d.hi)continue;
  html+=stem(ax,k,0,colors.c,{output:true,computed:true,selected:k===state.k,series:copyMode&&state.copyCount<d.indices.length?'S':'c'});
 }
 const selectedX=ax.x(state.k);
 html+=`<path d="M${selectedX-4},${ax.top+ax.height+3}l4,-5l4,5" fill="${colors.selected}"/><text class="tick" x="${selectedX}" y="${ax.top+ax.height+17}" text-anchor="middle" style="fill:${colors.selected}">k = ${fmt(state.k)}</text>`;
 return html;
}
function renderSlide(){
 const svg=$('slide-board'),width=Math.max(300,svg.clientWidth),dom=domain(),d=derived(),overlay=$('overlay-signals')?.checked??false;
 const aTop=overlay?50:35,aHeight=overlay?responseHeight(56):84,bTop=overlay?aTop:150,bHeight=overlay?aHeight:responseHeight(64),pTop=bTop+bHeight+38,pHeight=responseHeight(64),sumY=pTop+pHeight+18,outputTitleY=sumY+31,outputTop=outputTitleY+24,outputHeight=responseHeight(64);
 svg.setAttribute('viewBox',`0 0 ${width} ${outputTop+outputHeight+31}`);
 const sharedScale=Math.max(d.scale,d.kernelScale),aAx=makeAxis(width,aTop,aHeight,...dom.j,overlay?sharedScale:d.scale,'j');
 const bAx=overlay?aAx:makeAxis(width,bTop,bHeight,...dom.j,d.kernelScale,state.stage===0?'ℓ':'j');
 const terms=termsAt(),selected=terms.find(t=>t.j===state.j)||terms[0];state.j=selected.j;
 const productScale=absMax(d.ag.values)*absMax(d.bg.values)||1,nonzero=terms.filter(t=>t.product!==0);
 const pAx=makeAxis(width,pTop,pHeight,...dom.j,productScale,'j');
 const oAx=makeAxis(width,outputTop,outputHeight,...dom.k,d.outputScale,'k');
 let html=`<title>${overlay?'Overlaid fixed input and moving kernel':'Input and moving kernel on separate rows'}, aligned products and the complete convolution. Gold rings identify the selected samples.</title>`;
 svg.dataset.overlay=String(overlay);
 const bandX=aAx.x(state.j);
 html+=`<rect x="${bandX-9}" y="${aTop}" width="18" height="${pTop+pHeight-aTop}" fill="#74532d" opacity="${state.stage>=3?'.28':'.12'}"/>`;
 html+=overlay?`<text class="row-title" x="14" y="17" style="fill:${colors.a}">● a[j] · fixed input</text>`:heading('a[j] · input',d.resampled?'Common-grid samples · select a cyan stem':'Edit the cyan sample handles',17,colors.a);
 html+=aAx.html+`<g class="${overlay?'overlay-input':'signal-input'}" data-series="a">`;
 html+=visibleSamples(d.ag.values,d.ag.positions,state.j).filter(t=>t.index>=dom.j[0]&&t.index<=dom.j[1]).map(t=>stem(aAx,t.index,t.value,colors.a,{...(d.resampled?{pair:true}:{kind:'a',index:t.index}),selected:t.index===state.j,label:d.ag.values.length<=28||t.value!==0,sampleSpan:dom.j[1]-dom.j[0]})).join('')+'</g>';
 const bTitle=state.stage===0?'b[ℓ] · original kernel':state.stage===1?'b[−j] · reverse about zero':'b[k − j] · reversed, shifted kernel';
 html+=overlay?`<text class="row-title" x="14" y="33" style="fill:${colors.b}">○ ${state.stage===0?'b[j] · original kernel':state.stage===1?'b[−j] · flipped kernel':`b[${fmt(state.k)} − j] · moving kernel`}</text>`:heading(bTitle,state.stage===0?(d.resampled?'Common-grid kernel samples':'Edit the blue sample handles'):state.stage===1?'Every sample at ℓ moves to −ℓ':`Shift k = ${fmt(state.k)} · pair at the same j`,bTop-18,colors.b)+bAx.html;
 html+=`<g class="${overlay?'overlay-kernel':'signal-kernel'}" data-series="b">`;
 const kernelPositions=new Map(),kernelIndex=selected.otherIndex,shifted=d.conv.shiftedPositions(state.k);
 html+=visibleSamples(d.bg.values,d.bg.positions,kernelIndex).map(t=>{
  const j=state.stage===0?t.index:state.stage===1?-t.index:shifted[t.i];
  kernelPositions.set(t.index,j);
  if(j<dom.j[0]||j>dom.j[1])return '';
  return stem(bAx,j,t.value,colors.b,{...(d.resampled?{}:{kind:'b',index:t.index}),ell:t.index,selected:t.index===kernelIndex,label:d.bg.values.length<=28||t.value!==0,sampleSpan:dom.j[1]-dom.j[0]});
 }).join('')+'</g>';
 const productNote=nonzero.length?`${nonzero.length} nonzero ${nonzero.length===1?'product':'products'} · sum = ${fmt(d.conv.value(state.k))}`:`No nonzero overlap at k = ${fmt(state.k)} · sum = 0`;
 html+=heading('a[j] × b[k − j] · products',productNote+(state.stage<3?' · preview at the selected shift':''),pTop-18,colors.p)+pAx.html;
 {
  const visible=visibleSamples(terms.map(t=>t.product),d.ag.positions,state.j);
  html+=visible.filter(t=>t.index>=dom.j[0]&&t.index<=dom.j[1]).map(t=>stem(pAx,t.index,t.value,colors.p,{pair:true,pending:state.stage<3,selected:t.index===state.j,label:terms.length<=28||t.value!==0,sampleSpan:dom.j[1]-dom.j[0]})).join('');
  const paired=terms.filter(t=>t.a!==0&&t.b!==0||t.j===state.j).slice(0,18);
  for(const t of state.stage>=3&&!overlay?paired:[]){
   const x=aAx.x(t.j);if(x<aAx.left||x>aAx.right)continue;
   html+=`<line x1="${x}" y1="${aAx.zero+8}" x2="${x}" y2="${bAx.y(t.b)-7}" stroke="#9d8bab" stroke-dasharray="2 4"/><text x="${x}" y="${bAx.zero+25}" text-anchor="middle" fill="#acdf84" font-size="12">×</text>`;
  }
 }
 html+=`<text x="${width*.5}" y="${sumY}" text-anchor="middle" fill="#d7a6fb" font-size="10">Add the green products</text><text x="${width*.5}" y="${sumY+17}" text-anchor="middle" fill="#d7a6fb" font-size="18" font-family="serif">Σ</text><path d="M${width*.5},${sumY+20}v7l-3,-3m3,3l3,-3" fill="none" stroke="#d7a6fb"/>`;
 const outputNote=`<text class="row-subtitle selected-sum" x="14" y="${outputTitleY+15}"><tspan fill="${colors.p}">${nonzero.length} products → </tspan><tspan fill="${colors.c}">c[${fmt(state.k)}] = ${fmt(d.conv.value(state.k))}</tspan></text>`;
 html+=heading('c[k] · complete convolution','',outputTitleY,colors.c)+outputNote+oAx.html+outputLayer(oAx);
 svg.innerHTML=html;
 const motion=`${state.stage}:${state.k}`;
 if(motion!==lastMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  for(const node of svg.querySelectorAll('[data-ell]')){
   const ell=Number(node.dataset.ell),before=previousKernel.get(ell),after=kernelPositions.get(ell);
   if(before!==undefined&&after!==before){
    const delta=bAx.x(before)-bAx.x(after);
    node.animate([{transform:`translateX(${delta}px)`},{transform:'translateX(0px)'}],{duration:350,easing:'ease-in-out'});
   }
  }
 }
 previousKernel=kernelPositions;lastMotion=motion;
 const captions=[
  'Input and kernel in their original order. The lower rows preview the products and result at the selected shift.',
  'Reverse the kernel about zero: every sample at ℓ moves to −ℓ.',
  `Slide the entire reversed kernel to k = ${fmt(state.k)}. Its samples sit at j = k − ℓ.`,
  overlay?'Multiply cyan and blue samples at the same position on the top axis. The green products add to the highlighted purple output.':'Multiply vertically aligned samples. Their green products add to the highlighted purple output.',
  `The sum of the green products is c[${fmt(state.k)}] = ${fmt(d.conv.value(state.k))}. Move the kernel to explore another output.`
 ];
 const zeroNote=!nonzero.length&&state.stage>=2?' No nonzero samples overlap, so this output is zero.':'';
 $('phase-caption').textContent=captions[state.stage]+zeroNote;
 mathParts('phase-equation',phaseParts(),captions[state.stage]);
 for(const btn of document.querySelectorAll('[data-stage]'))btn.setAttribute('aria-pressed',String(Number(btn.dataset.stage)===state.stage));
 $('pair-value').hidden=state.stage<2;$('sum-equation').hidden=state.stage<2;
 mathParts('pair-value',pairParts(selected),pairPlain(selected));
 const final=terms.reduce((s,t)=>s+t.product,0),addends=nonzero.length<=10?(nonzero.map(t=>`(${fmt(t.product)})`).join('+')||'0'):`\\sum_{j\\in J_a}p_{${fmt(state.k)}}[j]`;
 mathParts('sum-equation',[piece('c',`c[${fmt(state.k)}]`),piece('','='),piece('p',addends),piece('',d.approx?'\\approx':'='),piece('c',fmt(final))],`c[${fmt(state.k)}] = ${fmt(final)}; zero products omitted from the written sum.`);
 if($('terms').closest('details').open)renderLedger(terms);
}
function renderLedger(terms=termsAt()){
 const pageSize=100,pages=Math.ceil(terms.length/pageSize);state.ledgerPage=Math.max(0,Math.min(pages-1,state.ledgerPage||0));
 const start=state.ledgerPage*pageSize,page=terms.slice(start,start+pageSize);
 $('ledger-page-label').textContent=`Terms ${start+1}–${start+page.length} of ${terms.length} · page ${state.ledgerPage+1}/${pages}`;
 $('ledger-prev').disabled=state.ledgerPage===0;$('ledger-next').disabled=state.ledgerPage===pages-1;
 $('terms').innerHTML=page.map(t=>`<tr class="${t.j===state.j?'selected':t.product===0?'zero':''}"><td>${t.j}</td><td>${t.otherIndex}</td><td>${fmt(t.a)}</td><td>${fmt(t.b)}</td><td>${fmt(t.product)}</td></tr>`).join('');
}
function renderCopies(){
 const d=derived(),svg=$('copies-board'),width=Math.max(300,svg.clientWidth),pageSize=COPY_PAGE_SIZE;
 const pages=Math.max(1,Math.ceil(d.indices.length/pageSize));
 state.copyPage=Math.max(0,Math.min(pages-1,state.copyPage));
 const start=state.copyPage*pageSize,indices=d.indices.slice(start,start+pageSize),rows=Math.max(1,indices.length),axisHeight=responseHeight(64),rowHeight=35+axisHeight,rowsTop=axisHeight+92,height=rowsTop+rows*rowHeight+10;
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 const scale=Math.max(absMax(d.output.map(t=>t.value)),d.copyEnvelope,absMax(d.ag.values)*absMax(d.bg.values))||1;
 const kDomain=domain().k;
 let html='<title>Add scaled, shifted kernels. Each coloured row contributes to the cumulative sum above.</title>';
 const ox=makeAxis(width,39,axisHeight,...kDomain,scale,'k');
 html+=heading(state.copyCount===d.indices.length?'c[k] · complete sum':'S[k] · cumulative sum',`${state.copyCount} / ${d.indices.length} nonzero input coefficients added · all pages included`,17,colors.c)+ox.html+outputLayer(ox,true);
 html+=`<text class="row-subtitle" x="14" y="${rowsTop-12}">Contributions below add to the result above</text>`;
 indices.forEach((j,row)=>{
  const ordinal=start+row,contribution=d.conv.row(d.ag.index.get(j)),copy={scale:inputValue(j),values:contribution.map(t=>t.value),positions:contribution.map(t=>t.k)},included=ordinal<state.copyCount,upNext=ordinal===state.copyCount,color=copyColors[ordinal%copyColors.length],ax=makeAxis(width,rowsTop+row*rowHeight+35,axisHeight,...kDomain,scale,'k');
  html+=heading(`a[${fmt(j)}] b[k − (${fmt(j)})]`,`Shift ${fmt(j)}, scale ${fmt(copy.scale)} · ${included?'added':upNext?'next copy':'waiting'}`,rowsTop+row*rowHeight+17,color)+ax.html;
  html+=visibleSamples(copy.values,copy.positions,state.k).filter(t=>t.index>=kDomain[0]&&t.index<=kDomain[1]).map(t=>stem(ax,t.index,t.value,color,{copyJ:j,pending:!included,spacing:d.bg.step,label:copy.values.length<=28||t.value!==0,selected:t.index===state.k&&j===state.j,sampleSpan:kDomain[1]-kDomain[0]})).join('');
 });
 if(!indices.length)html+=heading('All input coefficients are zero','There are no nonzero kernel copies to add.',rowsTop+25,colors.a);
 svg.innerHTML=html;
 $('copy-page-label').textContent=d.indices.length?`Copies ${start+1}–${start+indices.length} of ${d.indices.length} · page ${state.copyPage+1}/${pages}`:'0 nonzero copies';
 $('copy-prev').disabled=state.copyPage===0;$('copy-next').disabled=state.copyPage===pages-1;
 const remaining=d.indices.length-state.copyCount;
 $('copies-caption').textContent=!d.indices.length?'The input is all zeros, so no kernel copies are needed. The complete convolution is zero.':!d.bg.values.some(v=>v!==0)?'The kernel is all zeros, so every shifted copy and output is zero.':remaining?`${state.copyCount} of ${d.indices.length} kernel copies added. The first row is their running sum; dashed contributions are waiting. Use Add next copy, Play or Complete sum.`:'Every nonzero kernel copy has been added. The first row is the complete convolution.';
 $('copies-note').textContent=`All ${d.ag.values.length}${d.resampled?' common-grid':''} input samples are used. ${d.ag.values.length-d.indices.length} zero coefficients add nothing and are omitted. The cumulative sum includes every added copy across all pages.`;
 mathParts('copies-equation',copySumParts(),`Cumulative sequence after ${state.copyCount} nonzero input copies.`);
}
function renderOverview(){
 const d=derived(),svg=$('overview-board'),width=Math.max(300,svg.clientWidth),listed=$('view-range').value==='listed',range=overviewRange();
 const height=responseHeight(64),bTop=152,outputTitleY=bTop+height+21,outputTop=outputTitleY+20;
 svg.setAttribute('viewBox',`0 0 ${width} ${outputTop+height+30}`);
 const ax=makeAxis(width,35,84,...range,d.scale,'j'),bx=makeAxis(width,bTop,height,...range,d.kernelScale,'ℓ'),cx=makeAxis(width,outputTop,height,...range,d.outputScale,'k');
 let html='<title>Input, kernel and their complete discrete convolution on a common sampling grid.</title>';
 html+=heading('a[j] · input',`${d.ag.values.length}${d.resampled?' common-grid':''} samples · ${fmt(d.ag.start)} … ${fmt(d.ag.end)}`,18,colors.a)+ax.html;
 html+=visibleSamples(d.ag.values,d.ag.positions,state.j).map(t=>stem(ax,t.index,t.value,colors.a,{...(d.resampled?{pair:true}:{kind:'a',index:t.index}),selected:t.index===state.j,sampleSpan:range[1]-range[0]})).join('');
 html+=heading('b[ℓ] · kernel',`${d.bg.values.length}${d.resampled?' common-grid':''} samples · ${fmt(d.bg.start)} … ${fmt(d.bg.end)}`,bTop-18,colors.b)+bx.html;
 const selectedKernel=termsAt().find(t=>t.j===state.j)?.otherIndex;
 html+=visibleSamples(d.bg.values,d.bg.positions,selectedKernel).map(t=>stem(bx,t.index,t.value,colors.b,{...(d.resampled?{}:{kind:'b',index:t.index}),ell:t.index,selected:t.index===selectedKernel,sampleSpan:range[1]-range[0]})).join('');
 html+=heading('c[k] · complete convolution',`${d.output.length} output samples · ${fmt(d.lo)} … ${fmt(d.hi)}`,outputTitleY,colors.c)+cx.html;
 html+=visibleSamples(d.output.map(t=>t.value),d.output.map(t=>t.k),state.k).map(t=>stem(cx,t.index,t.value,colors.c,{output:true,computed:true,selected:t.index===state.k,sampleSpan:range[1]-range[0]})).join('');
 html+=`<text class="tick" x="${cx.x(state.k)}" y="${outputTop+height+18}" text-anchor="middle" style="fill:${colors.selected}">k = ${fmt(state.k)}</text>`;
 svg.innerHTML=html;
 mathParts('overview-equation',countParts());
 $('overview-note').textContent=`The full convolution is shown. Shifting an entire sequence translates its bars and the output by the same amount. ${listed?'The full sampled intervals are visible.':'The axes remain fixed while you use the shift sliders.'}${d.resampled?' Both sequences have been interpolated onto the displayed common grid.':''}${$('preset').value==='decay'?' Both decaying sequences are finite truncations, zero outside their intervals.':''}`;
}
function render(){
 const focused=document.activeElement,focus=focused?.dataset.kind?{kind:focused.dataset.kind,index:focused.dataset.index}:focused?.dataset.output?{output:focused.dataset.output}:focused?.dataset.pair?{pair:focused.dataset.pair}:null;
 const d=derived(),scan=scanBounds(),range=[Math.min(scan[0],state.k),Math.max(scan[1],state.k)];
 for(const kind of ['a','b']){
  const slider=$(kind+'-shift');slider.min=originWindows[kind][0];slider.max=originWindows[kind][1];slider.value=state[kind+'s'];slider.disabled=slider.min===slider.max;
  $(kind+'-shift-label').textContent=`Start = ${state[kind+'s']}`;slider.setAttribute('aria-valuetext',`Whole ${kind==='a'?'input':'kernel'} starts at ${state[kind+'s']}; all samples move together`);
 }
 $('j-label').textContent=`j = ${fmt(state.j)}`;$('pair-index').min=state.as;$('pair-index').max=state.ae;$('pair-index').value=state.j;
 $('input-index').min=0;$('input-index').max=d.ag.values.length-1;$('input-index').value=d.ag.index.get(state.j)||0;$('input-index').disabled=d.ag.values.length===1;
 $('input-index').setAttribute('aria-valuetext',`Input sample ${Number($('input-index').value)+1} of ${d.ag.values.length}, position j = ${fmt(state.j)}`);
 $('k-label').textContent=`k = ${fmt(state.k)}`;$('k-input').value=state.k;
 const shifts=scanPositions();$('output-index').min=0;$('output-index').max=shifts.length-1;$('output-index').value=nearestOrdinal(shifts,state.k);$('output-index').disabled=shifts.length===1;
 $('output-index').setAttribute('aria-valuetext',`Kernel shift k = ${fmt(state.k)}`);
 const plotSlider=$('slide-output-index');plotSlider.min=0;plotSlider.max=shifts.length-1;plotSlider.value=nearestOrdinal(shifts,state.k);plotSlider.disabled=shifts.length===1;plotSlider.setAttribute('aria-valuetext',`Kernel shift k = ${fmt(state.k)}`);$('slide-k-label').textContent=`k = ${fmt(state.k)}`;
 $('shift-note').textContent=mode==='slide'?'Moves every sample of the reversed kernel on the fixed j-axis.':'Selects output position k. Open Flip, slide & sum to see the reversed kernel move; this control keeps your current view.';
 $('support-label').textContent=`Listed output: ${fmt(d.lo)} … ${fmt(d.hi)} (${d.output.length} samples). Plot/play: ${fmt(scan[0])} … ${fmt(scan[1])}.`;
 $('view-note').textContent=`Viewing only; all ${d.ag.values.length} input and ${d.bg.values.length} kernel samples are used.`;
 $('response-zoom-label').textContent=`${$('response-zoom').value}×`;
 $('response-zoom').setAttribute('aria-valuetext',`${$('response-zoom').value} times the response bar height; values unchanged`);
 const nonzeroB=d.bg.values.filter(v=>v!==0).length,nonzeroOutput=d.output.filter(t=>t.value!==0).length;
 const zeroReason=!d.indices.length?' The input is all zeros, so every output is zero.':!nonzeroB?' The kernel is all zeros, so every output is zero.':'';
 $('data-summary').textContent=`Common spacing Δ = ${fmt(d.step)}. ${d.resampled?`Source → plotted samples: input ${state.a.length} → ${d.ag.values.length}, kernel ${state.b.length} → ${d.bg.values.length}. Linear interpolation aligns both grids. `:''}${d.ag.values.length} input + ${d.bg.values.length} kernel − 1 = ${d.output.length} output bars.${zeroReason}`;
 $('working-grid-note').textContent=d.resampled?'Plots and formulas use the common calculation grid. Edit amplitudes in Sample values; source counts and endpoints stay as entered.':'Source samples already share one spacing. You can drag their handles directly on the plots.';
 $('overview-panel').hidden=mode!=='overview';$('slide-panel').hidden=mode!=='slide';$('copies-panel').hidden=mode!=='copies';
 $('overview-tab').setAttribute('aria-selected',String(mode==='overview'));$('overview-tab').tabIndex=mode==='overview'?0:-1;
 $('slide-tab').setAttribute('aria-selected',String(mode==='slide'));$('copies-tab').setAttribute('aria-selected',String(mode==='copies'));
 $('slide-tab').tabIndex=mode==='slide'?0:-1;$('copies-tab').tabIndex=mode==='copies'?0:-1;
 for(const id of ['play','step','restart','complete','speed'])$(id).hidden=mode==='overview';
 $('complete').textContent='Complete sum';$('complete').hidden=mode!=='copies';
 $('complete').disabled=mode==='copies'?state.copyCount===d.indices.length:d.output.every(t=>state.revealed.has(t.k));
 $('speed').parentElement.hidden=mode==='overview';
 if(mode==='overview'){
  renderOverview();$('progress').textContent=`${d.ag.values.length} input + ${d.bg.values.length} kernel → ${d.output.length} output samples`;
 }else if(mode==='slide'){
  renderSlide();$('step').textContent=state.stage<2?'Next stage →':'Next shift →';
  $('progress').textContent=`${phases[state.stage]} · k = ${fmt(state.k)}`;
  $('step').disabled=state.stage>=2&&state.k>=scan[1];
 }else{
  renderCopies();$('step').textContent='Add next copy +';
  $('progress').textContent=`${state.copyCount} / ${d.indices.length} nonzero copies added`;
  $('step').disabled=state.copyCount===d.indices.length;
 }
 if(focus){
  const selector=focus.kind?`[data-kind="${focus.kind}"][data-index="${focus.index}"]`:focus.output?`[data-output="${focus.output}"]`:`[data-pair="${focus.pair}"]`;
  $(mode+'-board').querySelector(selector)?.focus({preventScroll:true});
 }
 renderPlotLinks();
 renderExampleMath();
 if(!$('math-window').hidden)renderMathWindow();
}
function renderMathTerms(terms){
 const key=`${state.k}:${state.as}:${state.ae}:${state.a.length}:${state.bs}:${state.be}:${state.b.length}`,size=6,pages=Math.ceil(terms.length/size);
 if(key!==mathTermKey){mathTermKey=key;mathTermPage=Math.floor((derived().ag.index.get(state.j)||0)/size);}
 mathTermPage=Math.max(0,Math.min(pages-1,mathTermPage));
 const start=mathTermPage*size,items=terms.slice(start,start+size),list=$('math-term-list');
 const focused=document.activeElement?.dataset.mathJ,signature=mode+':'+start+':'+terms.length+':'+JSON.stringify(items);
 if(signature!==mathListKey){
 mathListKey=signature;list.replaceChildren();
 items.forEach((t,i)=>{
  const button=document.createElement('button');button.type='button';button.dataset.mathJ=t.j;button.className='math-term';
  button.setAttribute('aria-pressed',String(t.j===state.j));button.setAttribute('aria-label',`Highlight product for j = ${fmt(t.j)}, kernel index ${fmt(t.otherIndex)}: ${fmt(t.a)} times ${fmt(t.b)} equals ${fmt(t.product)}`);
  const label=document.createElement('span');label.className='term-position';label.textContent=`j = ${fmt(t.j)} · ℓ = ${fmt(t.otherIndex)}`;
  const formula=document.createElement('span');formula.id=`math-term-${i}`;formula.className='math-line';button.append(label,formula);list.append(button);
  mathCache.delete(formula.id);
  const copyOrdinal=derived().indices.indexOf(t.j),productKind=mode==='copies'&&copyOrdinal>=0?'copy-'+copyOrdinal%copyColors.length:'p';
  mathParts(formula.id,[piece('a',`a[${fmt(t.j)}]`),piece('','\\cdot'),piece('b',`b[${fmt(t.otherIndex)}]`),piece('','='),piece('a',`(${fmt(t.a)})`),piece('','\\cdot'),piece('b',`(${fmt(t.b)})`),piece('','='),piece(productKind,fmt(t.product))],pairPlain(t));
 });
 }
 for(const button of list.querySelectorAll('[data-math-j]'))button.setAttribute('aria-pressed',String(Number(button.dataset.mathJ)===state.j));
 if(focused!==undefined)list.querySelector(`[data-math-j="${focused}"]`)?.focus({preventScroll:true});
 $('math-term-page').textContent=`Products ${start+1}–${start+items.length} of ${terms.length} (zeros included)`;
 $('math-term-prev').disabled=mathTermPage===0;$('math-term-next').disabled=mathTermPage===pages-1;
}
function renderMathWindow(){
 const d=derived(),terms=termsAt(),final=d.conv.value(state.k);
 const nonzero=terms.filter(t=>t.product!==0),pair=terms.find(t=>t.j===state.j)||terms[0];
 const vector=values=>values.length<=12?values.map(fmt).join(',\\,'):values.slice(0,5).map(fmt).join(',\\,')+',\\,\\ldots';
 mathParts('math-selected-pair',pairParts(pair),pairPlain(pair));
 $('math-selected-location').textContent=pairLocation(pair);
 $('math-progress-note').textContent=outputProgress();
 renderMathTerms(terms);
 $('math-context').textContent=mode==='overview'?`Full sequences · k = ${state.k} · j = ${pair.j}`:mode==='slide'?`Flip, slide & sum · ${phases[state.stage]} · k = ${state.k} · j = ${pair.j}`:`Add shifted kernels · ${state.copyCount}/${d.indices.length} nonzero copies added · k = ${state.k}`;
 $('math-window-status').textContent=mathPinned?'Pinned · stays open and follows the controls.':'Pin to keep this window open while using the controls.';
 $('math-input-summary').textContent=`Source input: ${state.a.length} samples in ${state.as} … ${state.ae}; source kernel: ${state.b.length} in ${state.bs} … ${state.be}. The plots and formulas below use ${d.ag.values.length} input and ${d.bg.values.length} kernel samples on a common grid, Δ = ${fmt(d.step)}. ${d.resampled?'Values are linearly interpolated from the source samples. ':''}Count keeps the endpoints fixed. Extending an interval repeats its boundary value. Values in long vectors are abbreviated.`;
 mathParts('math-inputs',[piece('a',`a=[${vector(d.ag.values)}]`),piece('','\\qquad'),piece('b',`b=[${vector(d.bg.values)}]`)]);
 const gridTex=(symbol,g)=>g.values.length===1?`${symbol}_0=${g.start}`:`${symbol}_i=${g.start}+i\\,\\frac{${g.span.toString()}}{${g.values.length-1}},\\quad i=0,\\ldots,${g.values.length-1}`;
 mathParts('math-grids',[piece('a',gridTex('j',d.ag)),piece('b',gridTex('\\ell',d.bg))]);
 mathParts('math-definition',[piece('c','c[k]'),piece('','=\\sum_{j\\in J_a}'),piece('a','a[j]'),piece('b','b[k-j]'),piece('',',\\quad k\\in J_a+J_b')]);
 if(mode==='overview'){
  $('math-operation-title').textContent='Sample counts · number of bars';
  mathParts('math-operation',countParts());
  $('math-operation-note').textContent=`Na = ${d.ag.values.length} input bars, Nb = ${d.bg.values.length} kernel bars, Nc = ${d.output.length} output bars. All use the same spacing Δ = ${fmt(d.step)}. The output runs from ${fmt(d.lo)} to ${fmt(d.hi)}. This is discrete linear convolution of the plotted samples: no spacing multiplier or amplitude normalization is applied. Increasing sampling density can increase the sum. It is not a continuous-convolution integral.`;
  mathParts('math-pair-detail',pairParts(pair),pairPlain(pair));
  $('math-pair-detail').hidden=false;
 }else if(mode==='slide'){
  $('math-operation-title').textContent=phases[state.stage];
  mathParts('math-operation',phaseParts());
  $('math-operation-note').textContent=[
   'The kernel is in its original order. The next step reverses it about zero.',
   'The values stay attached to their samples. Only their horizontal positions change.',
   `Shift the reversed kernel by ${state.k}. A kernel sample at ℓ meets the input at j = ${state.k} − ℓ.`,
   'The first three rows share the j-axis. Each aligned pair contributes one product.',
   'Adding products creates one output sample on the k-axis.'
  ][state.stage];
  mathParts('math-pair-detail',pairParts(pair),pairPlain(pair));
  $('math-pair-detail').hidden=state.stage<2;
 }else{
  $('math-operation-title').textContent='Scaled, shifted copies';
  mathParts('math-operation',copySumParts());
  $('math-operation-note').textContent='Each copy is the kernel shifted by an input index and scaled by that input value. Zero input coefficients add zero; they are omitted from the copy rows.';
  const partial=state.copyValues[d.conv.index(state.k)]??0;
  mathParts('math-pair-detail',[piece('c',`${state.copyCount===d.indices.length?'c':'S'}[${state.k}]=${fmt(partial)}`),piece('',`\\quad\\text{after }${state.copyCount}\\text{ nonzero copies}`)]);
  $('math-pair-detail').hidden=false;
 }
 const parts=[piece('c',`c[${fmt(state.k)}]`),piece('','=')];
 if(nonzero.length>16)parts.push(piece('','\\sum_{j\\in J_a}'),piece('a','a[j]'),piece('b',`b[${fmt(state.k)}-j]`));
 else if(!nonzero.length)parts.push(piece('p','0'));
 else nonzero.forEach((t,i)=>{if(i)parts.push(piece('','+'));parts.push(piece('a',`(${fmt(t.a)})`),piece('','\\cdot'),piece('b',`(${fmt(t.b)})`));});
 parts.push(piece('',d.approx?'\\approx':'='),piece('c',fmt(final)));
 mathParts('math-output-detail',parts,`Complete mathematical sum c[${state.k}] ${d.approx?'approximately':'='} ${fmt(final)}.`);
 const phaseNote=mode==='copies'&&state.copyCount<d.indices.length?'The cumulative plot shows S[k] until every copy is added. ':'';
 $('math-control-note').textContent=phaseNote+`Zero products are omitted from the written expansion. Response magnification: ${$('response-zoom').value}× (bar height only; sample values and sums are unchanged). Vertical axes fit their own amplitudes; shifted copies and their sum share one scale. Plot range: ${$('view-range').selectedOptions[0].textContent}. Copy reference: ${$('show-reference').checked?'on':'off'} (construction views). Pace: ${$('speed').selectedOptions[0].textContent}. Range and reference change the display; pace changes timing.${d.approx?' Decimal computations use floating point; displayed numbers have at most 6 significant digits.':''}`;
}
function closeMathWindow(){
 $('math-window').hidden=true;$('display-math').setAttribute('aria-expanded','false');
 $('display-math').focus({preventScroll:true});
}
$('display-math').addEventListener('click',()=>{
 if(!$('math-window').hidden){closeMathWindow();return;}
 $('math-window').hidden=false;$('display-math').setAttribute('aria-expanded','true');renderMathWindow();$('math-pin').focus({preventScroll:true});
});
$('math-pin').addEventListener('click',()=>{mathPinned=!mathPinned;$('math-pin').setAttribute('aria-pressed',String(mathPinned));$('math-pin').textContent=mathPinned?'Unpin':'Pin';renderMathWindow();});
$('math-term-list').addEventListener('click',e=>{
 const button=e.target.closest('[data-math-j]');if(!button)return;
 pause();state.j=Number(button.dataset.mathJ);state.ledgerPage=Math.floor((derived().ag.index.get(state.j)||0)/100);
 const ordinal=derived().indices.indexOf(state.j);if(mode==='copies'&&ordinal>=0)state.copyPage=Math.floor(ordinal/COPY_PAGE_SIZE);
 render();
});
$('math-term-prev').addEventListener('click',()=>{mathTermPage--;renderMathWindow();});
$('math-term-next').addEventListener('click',()=>{mathTermPage++;renderMathWindow();});
$('math-close').addEventListener('click',closeMathWindow);
document.addEventListener('pointerdown',e=>{if(!$('math-window').hidden&&!mathPinned&&!$('math-window').contains(e.target)&&!$('display-math').contains(e.target))closeMathWindow();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('math-window').hidden&&!mathPinned)closeMathWindow();});
function positionMathWindow(left,top){
 const el=$('math-window'),rect=el.getBoundingClientRect();
 el.style.left=`${Math.max(8,Math.min(innerWidth-rect.width-8,left))}px`;
 el.style.top=`${Math.max(8,Math.min(innerHeight-rect.height-8,top))}px`;
 el.style.right='auto';el.style.bottom='auto';
}
const mathHeader=$('math-window-header');
mathHeader.addEventListener('pointerdown',e=>{
 if(e.button!==0||e.target.closest('button')&&e.target.id!=='math-move')return;
 e.preventDefault();const rect=$('math-window').getBoundingClientRect();
 windowDrag={pointer:e.pointerId,x:e.clientX,y:e.clientY,left:rect.left,top:rect.top};mathHeader.setPointerCapture(e.pointerId);
});
mathHeader.addEventListener('pointermove',e=>{if(windowDrag&&windowDrag.pointer===e.pointerId)positionMathWindow(windowDrag.left+e.clientX-windowDrag.x,windowDrag.top+e.clientY-windowDrag.y);});
mathHeader.addEventListener('pointerup',e=>{if(mathHeader.hasPointerCapture(e.pointerId))mathHeader.releasePointerCapture(e.pointerId);windowDrag=null;});
mathHeader.addEventListener('pointercancel',()=>{windowDrag=null;});
$('math-move').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const rect=$('math-window').getBoundingClientRect();positionMathWindow(rect.left+(e.key==='ArrowLeft'?-20:e.key==='ArrowRight'?20:0),rect.top+(e.key==='ArrowUp'?-20:e.key==='ArrowDown'?20:0));}});
function setMathScale(value){
 const scale=Math.max(80,Math.min(200,Math.round(value/10)*10));
 document.documentElement.style.setProperty('--math-scale',String(scale/100));
 $('math-scale').value=scale;$('math-scale-label').value=scale+'%';
 $('math-scale').setAttribute('aria-valuetext',scale+' percent');
 $('math-smaller').disabled=scale===80;$('math-larger').disabled=scale===200;
}
$('math-scale').addEventListener('input',()=>setMathScale(Number($('math-scale').value)));
$('math-smaller').addEventListener('click',()=>setMathScale(Number($('math-scale').value)-10));
$('math-larger').addEventListener('click',()=>setMathScale(Number($('math-scale').value)+10));
function clearExpanded(){windowSizeBackup=null;$('math-expand').setAttribute('aria-pressed','false');$('math-expand').setAttribute('aria-label','Expand math window to fit screen');}
function resizeMathWindow(width,height,left,top){
 const el=$('math-window'),maxWidth=Math.max(1,innerWidth-left-8),maxHeight=Math.max(1,innerHeight-top-8);
 el.style.width=Math.max(Math.min(300,maxWidth),Math.min(maxWidth,width))+'px';
 el.style.height=Math.max(Math.min(200,maxHeight),Math.min(maxHeight,height))+'px';
 positionMathWindow(left,top);
}
$('math-expand').addEventListener('click',()=>{
 const el=$('math-window');
 if(windowSizeBackup){Object.assign(el.style,windowSizeBackup);clearExpanded();const rect=el.getBoundingClientRect();positionMathWindow(rect.left,rect.top);return;}
 windowSizeBackup=Object.fromEntries(['width','height','left','top','right','bottom'].map(key=>[key,el.style[key]]));
 el.style.width=Math.max(1,innerWidth-16)+'px';el.style.height=Math.max(1,innerHeight-16)+'px';positionMathWindow(8,8);
 $('math-expand').setAttribute('aria-pressed','true');$('math-expand').setAttribute('aria-label','Restore math window size');
});
$('math-size-reset').addEventListener('click',()=>{
 const el=$('math-window');clearExpanded();setMathScale(100);
 for(const key of ['width','height','left','top','right','bottom'])el.style[key]='';
});
const mathResize=$('math-resize');
function resizeFromEdges(start,dx,dy){
 const minWidth=Math.min(300,innerWidth-16),minHeight=Math.min(200,innerHeight-16);
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 let left=start.left,right=left+start.width,top=start.top,bottom=top+start.height;
 if(start.edge.includes('w'))left=clamp(left+dx,8,right-minWidth);
 if(start.edge.includes('e'))right=clamp(right+dx,left+minWidth,innerWidth-8);
 if(start.edge.includes('n'))top=clamp(top+dy,8,bottom-minHeight);
 if(start.edge.includes('s'))bottom=clamp(bottom+dy,top+minHeight,innerHeight-8);
 const el=$('math-window');el.style.width=(right-left)+'px';el.style.height=(bottom-top)+'px';positionMathWindow(left,top);
}
for(const handle of $('math-window').querySelectorAll('[data-resize-edge]')){
 handle.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;e.preventDefault();e.stopPropagation();clearExpanded();const rect=$('math-window').getBoundingClientRect();positionMathWindow(rect.left,rect.top);
  windowResize={pointer:e.pointerId,x:e.clientX,y:e.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height,edge:handle.dataset.resizeEdge};
  handle.setPointerCapture(e.pointerId);$('math-window').setAttribute('data-interacting','resize');
 });
 handle.addEventListener('pointermove',e=>{if(windowResize&&windowResize.pointer===e.pointerId)resizeFromEdges(windowResize,e.clientX-windowResize.x,e.clientY-windowResize.y);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(event,e=>{windowResize=null;$('math-window').removeAttribute('data-interacting');if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);});
}
mathHeader.addEventListener('dblclick',e=>{if(!e.target.closest('button'))$('math-expand').click();});
mathResize.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();clearExpanded();const rect=$('math-window').getBoundingClientRect(),step=e.shiftKey?50:10;
 resizeMathWindow(rect.width+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),rect.height+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0),rect.left,rect.top);
});
window.addEventListener('resize',()=>{
 const el=$('math-window');if(el.hidden)return;
 if(windowSizeBackup){el.style.width=Math.max(1,innerWidth-16)+'px';el.style.height=Math.max(1,innerHeight-16)+'px';positionMathWindow(8,8);}
 else{const rect=el.getBoundingClientRect();positionMathWindow(rect.left,rect.top);}
});
function selectStage(stage){
 pause();state.stage=stage;
 if(stage===4){const d=derived();state.revealed.set(state.k,d.conv.value(state.k));}
 render();
}
function advance(){
 const d=derived();
 if(mode==='copies'){
  if(state.copyCount>=d.indices.length){pause();return false;}
  const j=d.indices[state.copyCount];
  d.conv.addRow(d.ag.index.get(j),state.copyValues);
  state.copyCount++;state.copyPage=Math.floor((state.copyCount-1)/COPY_PAGE_SIZE);render();
  if(state.copyCount===d.indices.length){pause();return false;}return true;
 }
 const [,last]=scanBounds();
 if(state.stage<2)state.stage++;
 else if(state.k<last){state.k=scanPositions().find(k=>k>state.k)??last;state.stage=3;state.revealed.set(state.k,d.conv.value(state.k));}
 else{pause();return false;}
 if(state.stage===4)state.revealed.set(state.k,d.conv.value(state.k));
 render();
 if(state.stage>=2&&state.k>=last){pause();return false;}return true;
}
function schedule(){timer=setTimeout(()=>{if(playing&&advance())schedule();},Number($('speed').value));}
function restart(){
 pause();const d=derived();
 if(mode==='slide'){state.k=scanBounds()[0];state.stage=3;state.revealed.clear();previousKernel.clear();lastMotion='';}
 else{state.copyCount=0;state.copyPage=0;state.copyValues=d.output.map(()=>0);}
 render();
}
function setMode(next){pause();mode=next;render();}
for(const name of ['overview','slide','copies'])$(name+'-tab').addEventListener('click',()=>setMode(name));
for(const id of ['overview-tab','slide-tab','copies-tab'])$(id).addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const modes=['overview','slide','copies'],i=modes.indexOf(mode);setMode(e.key==='Home'?'overview':e.key==='End'?'copies':modes[(i+(e.key==='ArrowLeft'?2:1))%3]);$(mode+'-tab').focus();}});
for(const btn of document.querySelectorAll('[data-stage]'))btn.addEventListener('click',()=>selectStage(Number(btn.dataset.stage)));
$('step').addEventListener('click',()=>{pause();advance();});$('restart').addEventListener('click',restart);
$('complete').addEventListener('click',()=>{
 pause();const d=derived();
 if(mode==='copies'){state.copyCount=d.indices.length;state.copyValues=d.output.map(t=>t.value);}
 else if(mode==='slide'){state.revealed=new Map(d.output.map(t=>[t.k,t.value]));if(!state.revealed.has(state.k))state.revealed.set(state.k,0);state.stage=4;}
 render();
});
$('play').addEventListener('click',()=>{
 if(playing){pause();return;}
 if($('step').disabled)restart();
 if($('step').disabled)return;
 playing=true;$('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');schedule();
});
$('speed').addEventListener('change',()=>{if(playing){clearTimeout(timer);schedule();}if(!$('math-window').hidden)renderMathWindow();});
$('preset').addEventListener('change',setPreset);$('reset').addEventListener('click',setPreset);
$('show-reference').addEventListener('change',render);$('view-range').addEventListener('change',()=>{pause();previousKernel.clear();lastMotion='';overviewFrame=null;render();});
$('response-zoom').addEventListener('input',render);
$('copy-prev').addEventListener('click',()=>{state.copyPage--;render();});$('copy-next').addEventListener('click',()=>{state.copyPage++;render();});
function setK(k){
 if(!Number.isFinite(k)||Math.abs(k)>Number.MAX_SAFE_INTEGER)return;
 // All factor indices and plotted differences must remain safely representable.
 if([k-state.bs,k-state.be,k-state.as,k-state.ae].some(v=>Math.abs(v)>Number.MAX_SAFE_INTEGER))return;
 pause();const positions=scanPositions();state.k=positions[nearestOrdinal(positions,k)];state.stage=3;render();
}
$('output-index').addEventListener('input',()=>setK(scanPositions()[Number($('output-index').value)]));
 $('slide-output-index').addEventListener('input',()=>setK(scanPositions()[Number($('slide-output-index').value)]));
 $('overlay-signals').addEventListener('change',()=>{previousKernel.clear();lastMotion='';render();});
for(const kind of ['a','b'])$(kind+'-shift').addEventListener('input',()=>shiftOrigin(kind,Number($(kind+'-shift').value)));
function applyKInput(){
 const text=$('k-input').value,n=Number(text);
 if(!text.trim()||!Number.isFinite(n)||Math.abs(n)>Number.MAX_SAFE_INTEGER){$('input-error').textContent='Output position must be a finite representable number.';return;}
 $('input-error').textContent='';setK(n);
}
$('k-input').addEventListener('change',applyKInput);
$('k-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyKInput();}});
function nearestOrdinal(positions,n){let lo=0,hi=positions.length-1;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(positions[mid]<n)lo=mid+1;else hi=mid;}return lo&&Math.abs(positions[lo-1]-n)<Math.abs(positions[lo]-n)?lo-1:lo;}
function selectInput(n){if(Number.isFinite(n)){pause();const i=nearestOrdinal(derived().ag.positions,n);state.j=derived().ag.positions[i];state.ledgerPage=Math.floor(i/100);render();}}
$('pair-index').addEventListener('change',()=>{if($('pair-index').value.trim())selectInput(Number($('pair-index').value));});
$('input-index').addEventListener('input',()=>selectInput(derived().ag.positions[Number($('input-index').value)]));
$('terms').closest('details').addEventListener('toggle',()=>{if($('terms').closest('details').open)renderLedger();});
$('ledger-prev').addEventListener('click',()=>{state.ledgerPage--;renderLedger();});$('ledger-next').addEventListener('click',()=>{state.ledgerPage++;renderLedger();});
function applyFields(source=''){
 try{
  const next={},nextBases={...resampleBases};let resampled=false;
  for(const kind of ['a','b']){
   const integer=field=>{const text=$(kind+'-'+field).value,n=Number(text);if(!text.trim()||!Number.isSafeInteger(n))throw Error(`${field==='count'?'Sample count':field==='start'?'Start':'End'} must be an integer.`);return n;};
   const start=integer('start'),end=integer('end'),old=M.grid(state[kind],state[kind+'s'],state[kind+'e']),rangeMode=rangeModes[kind];
   let values=M.parse($(kind+'-values').value),count=values.length;
   if(rangeMode==='count'){
    count=integer('count');
    if(count<1||count>10000)throw Error('Sample count must be 1–10,000.');
    values=M.resampleGrid(rangeMode==='count'?(resampleBases[kind]||old):old,start,end,count).values;resampled=true;
   }else if(start!==old.start||end!==old.end){
    const spacing=old.step||1;
    count=start===end?1:Math.max(2,Math.round((end-start)/spacing)+1);
    if(!Number.isSafeInteger(count)||count>10000)throw Error('Extending this interval would exceed 10,000 samples. Choose a smaller interval.');
    values=M.resampleGrid(rangeMode==='count'?(resampleBases[kind]||old):old,start,end,count).values;resampled=true;
   }
   next[kind]=values;next[kind+'s']=start;next[kind+'e']=end;
   if(rangeMode!=='count'&&(start!==old.start||end!==old.end||values.join(',')!==old.values.join(',')))nextBases[kind]=M.grid(values,start,end);
  }
  M.commonGrid(M.grid(next.a,next.as,next.ae),M.grid(next.b,next.bs,next.be));
  $('input-error').textContent='';$('edit-status').textContent=resampled?'Resampled inside fixed endpoints; boundary values repeat outside the old interval.':'Plots match the current fields.';
  const changed=['as','ae','bs','be'].some(key=>next[key]!==state[key])||next.a.join(',')!==state.a.join(',')||next.b.join(',')!==state.b.join(',');
  if(changed){pause();Object.assign(state,next);resampleBases=nextBases;resetConstruction();selectPeak();anchorOriginControls();}
  rangeModes={};syncRanges();
  if(!source||resampled){$('a-values').value=next.a.join(', ');$('b-values').value=next.b.join(', ');}
  if(changed)render();return true;
 }catch(error){$('input-error').textContent=error.message;$('edit-status').textContent='Finish a valid edit to update the plots.';return false;}
}
$('sequence-form').addEventListener('submit',e=>{e.preventDefault();applyFields();});
for(const id of ['a-values','b-values','a-start','b-start','a-end','b-end','a-count','b-count']){
 const mark=()=>{const which=id.split('-')[1];if(['start','end','count'].includes(which))rangeModes[id[0]]=which;else if(which==='values')delete rangeModes[id[0]];};
 $(id).addEventListener('input',()=>{mark();if(id.endsWith('-values'))applyFields(id);else $('edit-status').textContent='Range edit pending; press Enter, Apply, or leave the field.';});
 $(id).addEventListener('change',()=>{mark();applyFields(id);});
}
function edit(kind,index,value){
 const ordinal=sampleOrdinal(kind,index);if(ordinal===undefined||derived().resampled)return;
 const next=Math.max(-4,Math.min(4,Math.round(value*10)/10)),old=state[kind][ordinal],other=kind==='a'?'b':'a';
 const count=state[kind].filter(v=>v!==0).length+(old===0&&next!==0?1:old!==0&&next===0?-1:0);
 if(count*state[other].filter(v=>v!==0).length>2000000){$('input-error').textContent='Use at most 2 million nonzero sample pairs; this edit would exceed the limit.';return;}
 pause();state[kind][ordinal]=next;resampleBases[kind]=M.grid([...state[kind]],state[kind+'s'],state[kind+'e']);
 const phase=state.stage,k=state.k,j=state.j;
 resetConstruction();state.stage=phase===4?3:phase;state.k=k;state.j=j;
 syncFields();$('input-error').textContent='';$('edit-status').textContent='Plots match the current fields.';render();
}
for(const editId of ['slide-board','overview-board']){const svg=$(editId);
svg.addEventListener('keydown',e=>{
 const t=e.target.closest('[data-kind]');
 if(t&&['ArrowUp','ArrowDown','Home','End'].includes(e.key)){
  e.preventDefault();const kind=t.dataset.kind,index=Number(t.dataset.index),v=state[kind][sampleOrdinal(kind,index)];
  edit(kind,index,e.key==='Home'?-4:e.key==='End'?4:v+(e.key==='ArrowUp'?.1:-.1));return;
 }
 const pair=e.target.closest('[data-pair]');if(pair&&['Enter',' '].includes(e.key)){e.preventDefault();state.j=Number(pair.dataset.pair);render();}
});
svg.addEventListener('pointerdown',e=>{
 const t=e.target.closest('[data-kind]');if(!t||e.button!==0)return;e.preventDefault();pause();
 const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse()),kind=t.dataset.kind,index=Number(t.dataset.index);
 drag={kind,index,svg,pointer:e.pointerId,startY:p.y,startValue:state[kind][sampleOrdinal(kind,index)],scale:Number(t.dataset.axisScale),span:Number(t.dataset.axisSpan)};
 svg.setPointerCapture(e.pointerId);t.focus();
});
svg.addEventListener('pointermove',e=>{
 if(!drag||drag.pointer!==e.pointerId)return;
 const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
 edit(drag.kind,drag.index,drag.startValue+(drag.startY-p.y)*drag.scale/drag.span);
});
svg.addEventListener('pointerup',e=>{if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);drag=null;});
svg.addEventListener('pointercancel',()=>{drag=null;});svg.addEventListener('lostpointercapture',()=>{drag=null;});
svg.addEventListener('click',e=>{const t=e.target.closest('[data-pair]');if(t){state.j=Number(t.dataset.pair);render();}});
}
for(const id of ['overview-board','slide-board','copies-board']){
 $(id).addEventListener('click',e=>{const t=e.target.closest('[data-output]');if(t)setK(Number(t.dataset.output));});
 $(id).addEventListener('keydown',e=>{
  const t=e.target.closest('[data-output]');if(!t||!['Enter',' ','ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();const [lo,hi]=scanBounds(),k=Number(t.dataset.output);
  const positions=scanPositions(),i=nearestOrdinal(positions,k);
  setK(e.key==='Home'?lo:e.key==='End'?hi:positions[Math.max(0,Math.min(positions.length-1,i+(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0)))]);
  $(id).querySelector(`[data-output="${state.k}"]`)?.focus({preventScroll:true});
 });
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{previousKernel.clear();lastMotion='';render();},100);});
setPreset();
MathJax.startup.promise.then(async()=>{
 await MathJax.typesetPromise([...document.querySelectorAll('.math-static')]);mathReady=true;render();
}).catch(error=>console.error('Convolution MathJax startup:',error));
})();
