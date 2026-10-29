/* Shared MathJax typesetter for the static pages and live mathematical scenes.
   Legacy labels are translated into TeX, never handed to a normal text font.
   Native semantic MathML goes through the same MathJax SVG output processor. */
const symbols={'α':'\\alpha','β':'\\beta','γ':'\\gamma','δ':'\\delta','ε':'\\varepsilon','η':'\\eta','θ':'\\theta','κ':'\\kappa','λ':'\\lambda','ξ':'\\xi','π':'\\pi','ρ':'\\rho','σ':'\\sigma','φ':'\\varphi','Γ':'\\Gamma','Π':'\\Pi','ℂ':'\\mathbb{C}','ℝ':'\\mathbb{R}','𝔹':'\\mathbb{B}','ℒ':'\\mathcal{L}','∞':'\\infty','∘':'\\circ','∗':'\\ast','♯':'\\sharp','≤':'\\le','≥':'\\ge','≠':'\\ne','≈':'\\approx','≅':'\\cong','∼':'\\sim','∈':'\\in','∉':'\\notin','⊆':'\\subseteq','⊕':'\\oplus','×':'\\times','±':'\\pm','→':'\\to','⇄':'\\longleftrightarrow','∂':'\\partial','−':'-','·':'\\cdot','‖':'\\Vert'};
const subchars='₀₁₂₃₄₅₆₇₈₉ⱼᵣₜ',subascii='0123456789jrt',supchars='⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀˣ',supascii='0123456789-+Tx';
const specials=[['s̲Γroute','\\underline{s}_{\\Gamma}^{\\mathrm{route}}'],['s̲Γsur','\\underline{s}_{\\Gamma}^{\\mathrm{sur}}'],['s̲Γ','\\underline{s}_{\\Gamma}'],['sΓ','s_{\\Gamma}'],['M̄sur','\\overline{M}^{\\mathrm{sur}}'],['M̄T','\\overline{M}_{T}'],['ηSchur','\\eta_{\\mathrm{Schur}}'],['ηA','\\eta_A'],['RSchur','R_{\\mathrm{Schur}}'],['Qdemo','Q_{\\mathrm{demo}}'],['Xtoy','X_{\\mathrm{toy}}'],['Ltoy','\\mathcal{L}_{\\mathrm{toy}}'],['a∘','a_{\\circ}'],['a∗','a_{\\ast}'],['z∗','z_{\\ast}'],['U∗','U_{\\ast}'],['R∞','R_{\\infty}'],['B̄','\\overline{B}'],['ū','\\overline{u}'],['d̲','\\underline{d}'],['s̲','\\underline{s}'],['M̄','\\overline{M}'],['Re','\\operatorname{Re}'],['Im','\\operatorname{Im}']];
const upright=new Set(['Schur','sur','route','lift','toy','num','demo','min','max']);
const latexWords=new Set(['min','max','sin','cos','tan','diag','rank','conjugate','sqrt']);
export function toTex(source){
 source=source.replace(/ₘᵢₙ/g,'_{min}').replace(/ₘₐₓ/g,'_{max}').replace(/y∘/g,'y^{∘}').replace(/ε♯/g,'ε^{♯}').replace(/\u00a0/g,' ').replace(/([QTAS]₂[°∘])([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,'($1)$2').replace(/Q\*/g,'Q^{∗}').replace(/\)\*/g,')^{∗}').replace(/A₂,M/g,'A_{2,M}').replace(/([ATQS])₂[°∘]/g,'$1_{2}^{∘}').replace(/λ([12])/g,'λ_{$1}').replace(/([fxhqpr])([12])(?!\d)/g,'$1_{$2}').replace(/‖∞/g,'‖_{∞}');
 const tokens=[];let i=0;
 const group=(open,close)=>{let start=++i,depth=1;while(i<source.length&&depth){if(source[i]===open)depth++;if(source[i]===close)depth--;i++;}return source.slice(start,i-1);};
 while(i<source.length){let c=String.fromCodePoint(source.codePointAt(i));if(/\s/.test(c)){i++;continue;}
  const special=specials.find(([a])=>source.startsWith(a,i));if(special){tokens.push({v:special[1],atom:true});i+=special[0].length;continue;}
  if(source.startsWith('[[',i)){const m=/^\[\[([^\]]*)\],\s*\[([^\]]*)\]\]/.exec(source.slice(i));if(m){tokens.push({v:'\\begin{pmatrix}'+[m[1],m[2]].map(r=>r.split(',').map(toTex).join('&')).join('\\\\')+'\\end{pmatrix}',atom:true});i+=m[0].length;continue;}}
  if(c==='('||c==='['||c==='{'){const end=c==='('?')':c==='['?']':'}',body=toTex(group(c,end));tokens.push({v:c==='{'?'\\{'+body+'\\}':c+body+end,inner:body,atom:true});continue;}
  if(c==='_'||c==='^'){i++;let script;if(source[i]==='{'){const raw=group('{','}');script=upright.has(raw)?'\\mathrm{'+raw+'}':toTex(raw);}else{script=symbols[source[i]]||source[i]||'';i++;}const t=tokens.at(-1);if(t)t.v+=c+'{'+script+'}';else tokens.push({v:c+'{'+script+'}',atom:true});continue;}
  if(subchars.includes(c)||supchars.includes(c)){const sub=subchars.includes(c),chars=sub?subchars:supchars,ascii=sub?subascii:supascii;let s='';while(i<source.length&&chars.includes(source[i]))s+=ascii[chars.indexOf(source[i++])];if(tokens.length)tokens.at(-1).v+=(sub?'_':'^')+'{'+s.replace(/x/g,'\\times ')+'}';continue;}
  if(c==='°'){if(tokens.length)tokens.at(-1).v+='^{\\circ}';i++;continue;}
  if(c==='√'){tokens.push({v:'sqrt',prefix:true});i++;continue;}
  if(/\d/.test(c)||c==='.'&&/\d/.test(source[i+1]||'')){const m=/^\d*\.?\d+(?:[eE][+-]?\d+)?/.exec(source.slice(i));tokens.push({v:m[0],atom:true});i+=m[0].length;continue;}
  if(/[A-Za-z]/.test(c)){const word=/^[A-Za-z]+/.exec(source.slice(i))[0];if(latexWords.has(word)){tokens.push({v:word==='conjugate'?'bar':word==='sqrt'?'sqrt':'\\'+word,prefix:['conjugate','sqrt'].includes(word),atom:!['conjugate','sqrt'].includes(word)});i+=word.length;continue;}tokens.push({v:c,atom:true});i++;continue;}
  tokens.push({v:symbols[c]||c,atom:!!symbols[c]&&!/[≤≥≠≈≅∼∈∉⊆⊕×±→⇄−·‖]/.test(c)});i+=c.length;
 }
 for(let j=tokens.length-2;j>=0;j--)if(tokens[j].prefix&&tokens[j+1]?.atom){tokens.splice(j,2,{v:(tokens[j].v==='sqrt'?'\\sqrt':'\\overline')+'{'+(tokens[j+1].inner??tokens[j+1].v)+'}',atom:true});}
 for(let j=1;j<tokens.length-1;j++)if(tokens[j].v==='/'&&tokens[j-1].atom&&tokens[j+1].atom){tokens.splice(j-1,3,{v:'\\frac{'+(tokens[j-1].inner??tokens[j-1].v)+'}{'+(tokens[j+1].inner??tokens[j+1].v)+'}',atom:true});j=Math.max(0,j-2);}
 return tokens.map(t=>t.v).join(' ');
}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const math=tex=>`<span class="site-math" data-tex="${esc(tex)}"></span>`;
// Recognise mathematical runs without turning prose into math italic.
const token=/\\[A-Za-z]+(?:\{[^}]*\})?|\^[{][^}]*[}]|_[{][^}]*[}]|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|(?:s̲Γroute|s̲Γsur|M̄sur|ηSchur|RSchur|Qdemo|Xtoy|Ltoy|M̄T|ηA|sΓ)|[A-Za-z]+|[α-ωΓΠℂℝ𝔹ℒ∞∘∗♯][\u0300-\u036f]*|[₀-₉ⱼᵣₜ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀˣ°]|[+−\-*/=<>≤≥≠≈≅∼∈∉⊆⊕×±→⇄∂·‖|()[\]{},:;]|\s+|./gu;
const isSymbol=s=>[...s].length===1&&/[α-ωΓΠℂℝ𝔹ℒ∞∘∗♯]/u.test(s);
const varword=s=>s.length===1&&/[A-Za-z]/.test(s)||latexWords.has(s)||specials.some(([k])=>k===s)||['QTQ','AQ','QT','RQ','zI','RQ','Qdemo'].includes(s);
export function splitMath(text,force=false){
 if(force)return[{math:true,text,tex:toTex(text)}];
 const parts=[],ts=[...text.matchAll(token)].map(m=>({text:m[0],index:m.index}));let run='';
 function flush(){if(!run)return;let body=run;const leading=/^\s*/.exec(body)[0],trailing=/[\s,';':.]*$/.exec(body)[0];body=body.slice(leading.length,body.length-trailing.length);const marked=/[α-ωΓΠℂℝ𝔹ℒ₀-₉ⱼᵣₜ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀˣ°\u0300-\u036f=<>≤≥≠≈≅∼∈∉⊆⊕∞^_]/u.test(body)||/[\d].*[+−*/]|[+−].*\d/.test(body)||/^[A-Zb-z]$/.test(body);
  if(marked&&body){parts.push({math:false,text:leading},{math:true,text:body,tex:toTex(body)},{math:false,text:trailing});}else parts.push({math:false,text:run});run='';}
 for(const {text:s,index} of ts){const possessive=s==='s'&&/[’']/.test(text[index-1]||'');const article=s==='A'&&/^\s+[a-z]{2}/.test(text.slice(index+1));const okay=!possessive&&!article&&(s==='√'||s==='𝔹'||/^[ₘᵢₙₐₓ]$/.test(s)||/^\s+$/.test(s)||/^\d/.test(s)||varword(s)||isSymbol(s)||/^[_^]\{/.test(s)||/^[₀-₉ⱼᵣₜ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ᵀˣ°+−\-*/=<>≤≥≠≈≅∼∈∉⊆⊕×±→⇄∂·‖|()[\]{},:;]$/.test(s)||/^[\u0300-\u036f]$/.test(s));
  if(okay)run+=s;else{flush();parts.push({math:false,text:s});}}
 flush();return parts.filter(p=>p.text);
}
const ns='http://www.w3.org/2000/svg';
let MJ,observer,scheduled=false;const cache=new Map(),inflight=new Map();const skip='script,style,pre,code,textarea,input,select,option,mjx-container,.site-math,.mjx-label,.mathjax_ignore,.sidebar,.topbar,.step-kicker,.prep-operation-count,.prep-operation-head,.prep-tabs,.eyebrow,.sr-only';
function remember(key,node){if(cache.size>3000)cache.delete(cache.keys().next().value);cache.set(key,node);return node;}
async function compiled(tex,mml=false){const key=(mml?'m:':'t:')+tex;if(cache.has(key))return cache.get(key);if(inflight.has(key))return inflight.get(key);const p=(mml?MJ.mathml2svgPromise(tex,{display:false}):MJ.tex2svgPromise(tex,{display:false})).then(n=>{if(n.querySelector('[data-mml-node="merror"]'))throw Error('Invalid math: '+tex);return remember(key,n);}).finally(()=>inflight.delete(key));inflight.set(key,p);return p;}
function put(holder,tex,mml=false){holder.dataset.mathSource=tex;const key=(mml?'m:':'t:')+tex,apply=n=>{if(holder.isConnected&&holder.dataset.mathSource===tex){holder.replaceChildren(n.cloneNode(true));holder.setAttribute('role','img');holder.setAttribute('aria-label',holder.dataset.mathLabel||tex);}};if(cache.has(key))apply(cache.get(key));else compiled(tex,mml).then(apply).catch(e=>{holder.textContent=holder.dataset.mathLabel||tex;holder.dataset.mathError='true';console.error(e);});}
function htmlSource(el){let out='';for(const n of el.childNodes){if(n.nodeType===3)out+=n.textContent;else if(n.nodeType===1){if(n.tagName==='BR')out+='\n';else if(n.tagName==='SUB'||n.tagName==='SUP')out+=(n.tagName==='SUB'?'_':'^')+'{'+n.textContent+'}';else if(n.classList.contains('s2-under'))out+='d̲';else out+=htmlSource(n);}}return out;}
function replaceText(n,force=false){const parts=splitMath(n.textContent,force);if(!parts.some(p=>p.math))return;const f=document.createDocumentFragment();for(const p of parts){if(!p.math)f.append(document.createTextNode(p.text));else{const h=document.createElement('span');h.className='site-math';h.dataset.mathLabel=p.text;f.append(h);queueMicrotask(()=>put(h,p.tex));}}n.replaceWith(f);}
function convertLabel(el){if(el.closest('.site-math,.mjx-label'))return;const text=el.textContent.trim();if(!text)return;const parts=splitMath(text);const tex=el.dataset.svgTex||parts.map(p=>p.math?p.tex:'\\text{'+p.text.replace(/[{}%$&#_]/g,' ')+'}').join(' ');const size=parseFloat(getComputedStyle(el).fontSize)||13,fill=getComputedStyle(el).fill,anchor=el.getAttribute('text-anchor')||getComputedStyle(el).textAnchor||'start';const g=document.createElementNS(ns,'g');g.classList.add('mjx-label');g.style.pointerEvents='none';g.setAttribute('aria-label',text);g.style.color=fill;const x=Number(el.getAttribute('x')||0),y=Number(el.getAttribute('y')||0);g.setAttribute('transform',`${el.getAttribute('transform')||''} translate(${x},${y})`);el.after(g);el.style.visibility='hidden';
 const apply=n=>{if(!g.isConnected)return;const svg=n.querySelector('svg').cloneNode(true),vb=svg.getAttribute('viewBox').split(/\s+/).map(Number),scale=size/1000,width=vb[2]*scale,height=vb[3]*scale;svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('x',anchor==='middle'?-width/2:anchor==='end'?-width:0);svg.setAttribute('y',vb[1]*scale);svg.style.cssText='overflow:visible;max-height:none;width:'+width+'px;height:'+height+'px;display:block';g.replaceChildren(svg);};
 const key='t:'+tex;if(cache.has(key))apply(cache.get(key));else compiled(tex).then(apply).catch(e=>{g.remove();el.style.visibility='';console.error(e);});
 el.dataset.mathLabelDone='true';
}
function sweep(){scheduled=false;if(!MJ)return;observer.disconnect();
 try{
  document.querySelectorAll('math').forEach(el=>{if(el.closest('.site-math,mjx-container'))return;const h=document.createElement('span');h.className='site-math native-math';h.dataset.mathLabel=el.textContent;const source=el.outerHTML;el.replaceWith(h);put(h,source,true);});
  document.querySelectorAll('[data-tex]').forEach(el=>{if(!el.dataset.mathSource)put(el,el.dataset.tex);});
  document.querySelectorAll('svg text:not([data-math-label-done])').forEach(convertLabel);
  // Join inline HTML indices only when no interactive or live child is replaced.
  document.querySelectorAll('sub,sup,.s2-under').forEach(sub=>{const parent=sub.parentElement;if(!parent||parent.closest(skip)||parent.closest('svg,math'))return;
   if([...parent.children].every(c=>['SUB','SUP','BR'].includes(c.tagName)||c.classList.contains('s2-under'))){const lines=htmlSource(parent).split('\n');parent.replaceChildren(...lines.flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));}
  });
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walk.nextNode()){const n=walk.currentNode,p=n.parentElement;if(p&&!p.closest(skip+',svg,math')&&n.textContent.trim())nodes.push(n);}nodes.forEach(n=>replaceText(n,!!n.parentElement.closest('.matrix,.s3-mini-matrix,.prep-exact-matrix')));
 }finally{observer.observe(document.body,{childList:true,subtree:true,characterData:true});}
}
export function startMath(){observer=new MutationObserver(records=>{if(records.every(r=>r.target.nodeType===1&&r.target.closest?.(skip)||r.target.parentElement?.closest(skip)))return;if(!scheduled){scheduled=true;setTimeout(sweep,90);}});window.siteMathReady.then(m=>{MJ=m;sweep();document.documentElement.dataset.mathRenderer='MathJax 4.1.3';}).catch(e=>console.error('MathJax failed to load',e));}
