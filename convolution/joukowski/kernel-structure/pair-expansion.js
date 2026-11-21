/* Select a coefficient in either Fourier factor or in the averaged finite sum. */
(() => {
  'use strict';
  let host, onSelect, model, ladder = '', selection = '';
  function math(tex) {
    const span = document.createElement('span');
    span.dataset.pxTex = tex;
    span.textContent = tex;
    return span;
  }
  let ready = false;
  function renderTex() {
    if (!ready || !host) return;
    for (const span of host.querySelectorAll('[data-px-tex]')) {
      const svg = window.MathJax.tex2svg(span.dataset.pxTex, {display:false});
      span.replaceChildren(svg);
      delete span.dataset.pxTex;
    }
  }
  const find = key => host.querySelector('[data-px="'+key+'"]');
  function mount(element, select) {
    host = element;
    onSelect = select;
    model = null;
    ladder = selection = '';
    host.classList.add('px-expansion');
    host.innerHTML = String.raw`<style>
      .px-expansion {min-width:0;margin-block:1rem;color:var(--foreground);}
      .px-expansion h4 {margin:.5rem 0;}
      .px-expansion [data-px=packets], .px-expansion .px-selection {background:#21182d;padding:clamp(.5rem,1.3vw,1rem);border:1px solid var(--line);border-radius:7px;margin:.6rem 0;}
      .px-expansion .px-equation {display:flex;align-items:center;flex-wrap:wrap;gap:.2rem .3rem;line-height:1.65;min-width:0;}
      .px-expansion .px-label {font-size:.87rem;display:block;margin: .3rem 0;color:#d2c7dc;}
      .px-expansion .px-equation+.px-label {margin-top:.7rem;}
      .px-expansion .px-term {line-height:1.5;white-space:nowrap;min-height:32px;padding:.15rem .4rem;border:1px solid transparent;background:transparent;color:#e3d9ee;}
      .px-expansion .px-term:is(:hover,:focus-visible) {border-color:var(--line);background:#33233f;}
      .px-expansion .px-term[aria-pressed=true],.px-expansion .px-weight-on {color:var(--px-ink);border:1px solid var(--px-ink);background:#332b40;}
      .px-expansion .px-weight {display:inline-flex;padding:.12rem .4rem;border-radius:4px;align-items:center;min-height:27px;}
      .px-expansion [data-px=row] {--px-ink:#69dbee;}
      .px-expansion [data-px=col] {--px-ink:#dfa9ff;}
      .px-expansion [data-px=mean], .px-expansion [data-px=channels] {--px-ink:#b9e997;}
      .px-expansion .px-operator {color:var(--muted-foreground);}
      .px-expansion output {display:block;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;margin:.35rem 0;}
      .px-expansion .px-selection {border-inline-start:3px solid #b9e997;}
      .px-expansion mjx-assistive-mml {position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%);}
      .px-expansion [data-px=ordered-formula] {overflow-x:auto;overflow-y:hidden;padding:.25rem 0;}
      .px-expansion [data-px=reason] {margin:.45rem 0 0;}
      @media(max-width:550px){.px-expansion .px-equation{gap:.12rem;}.px-expansion .px-term{padding:.15rem .26rem;}.px-expansion mjx-container{font-size:90%!important;}}
    </style>
    <h4>From one cell to the integral</h4>
    <p>Choose a term in each factor. Their product picks one ordered cell of the matrix.</p>
    <div data-px="packets">
      <span class="px-label">Row · kernel</span><div class="px-equation" data-px="row"></div>
      <span class="px-label">Column · conjugate kernel</span><div class="px-equation" data-px="col"></div>
      <span class="px-label">Coefficient amplitudes</span>
      <div class="px-equation"><span data-px="row-def"></span><span data-px="row-amount"></span></div>
      <div class="px-equation" data-px="col-factors"><span data-px="col-def"></span><span data-px="col-amount"></span></div>
    </div>
    <div class="px-selection">
      <strong data-px="selected-name"></strong>
      <div data-px="ordered-formula"></div>
      <div class="px-equation" data-px="channels"></div>
      <output data-px="value"></output>
      <p data-px="reason"></p>
    </div>
    <h4>The full-turn average, term by term</h4>
    <div class="px-equation" data-px="mean"></div>
    <output data-px="sum"></output>`;
    host.onclick = e => {
      const button = e.target.closest('button[data-px-kind]');
      if (!button || !model || !host.contains(button)) return;
      const index = Number(button.dataset.pxI);
      switch (button.dataset.pxKind) {
        case 'row': onSelect(index,model.col); break;
        case 'col': onSelect(model.row,index); break;
        case 'diagonal': onSelect(index,index); break;
        case 'neighbour':
          if (model.row === index+1 && model.col === index) onSelect(index+1,index);
          else onSelect(index,index+1);
      }
    };
    const mj = window.MathJax;
    Promise.resolve(mj?.startup?.promise).then(() => {
      ready = typeof window.MathJax?.tex2svg === 'function';
      renderTex();
    });
  }
  function button(kind,i,tex,name) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'px-term';
    el.dataset.pxKind = kind;
    el.dataset.pxI = i;
    el.setAttribute('aria-label',name);
    el.append(math(tex));
    return el;
  }
  function sign(el,op) {
    const marker = document.createElement('span');
    marker.className = 'px-operator';
    marker.textContent = op;
    el.append(marker);
  }
  function phase(m) {
    if (m === 0) return '1';
    return 'e^{'+(m===1?'':m===-1?'-':m)+'i\\theta}';
  }
  function buildRows({n,terms}) {
    const rows = find('row'), cols = find('col'), average = find('mean');
    rows.replaceChildren(math('Q_{'+n+','+terms.length+'}='));
    cols.replaceChildren(math('\\overline{Q_{'+n+','+terms.length+'}}='));
    average.replaceChildren(math('\\big\\langle W |Q_{'+n+','+terms.length+'}|^2\\big\\rangle='));
    terms.forEach(({k},i) => {
      if (i) { sign(rows,'+'); sign(cols,'+'); sign(average,'+'); }
      rows.append(button('row',i,'c_{'+k+'}'+phase(-k),'Select row k = '+k));
      cols.append(button('col',i,'c_{'+k+'}'+phase(k),'Select column ℓ = '+k));
      average.append(button('diagonal',i,'a\\,c_{'+k+'}^{2}','Select diagonal entry '+k+', '+k));
    });
    for (let i=0;i+1<terms.length;i++) {
      const k=terms[i].k, l=terms[i+1].k;
      // Include the sign inside the chip so the negative contribution is highlighted.
      average.append(button('neighbour',i,'-\\tfrac12 c_{'+k+'}c_{'+l+'}',
        'Select neighbouring frequencies '+k+' and '+l));
    }
  }
  function classSelection({row,col}) {
    for (const el of host.querySelectorAll('button[data-px-kind]')) {
      const i=Number(el.dataset.pxI), kind=el.dataset.pxKind;
      const active=kind==='row'?i===row:kind==='col'?i===col:
        kind==='diagonal'?row===i && col===i:
        Math.abs(row-col)===1 && i===Math.min(row,col);
      el.setAttribute('aria-pressed',String(active));
    }
  }
  function buildProduct({n,terms,row,col}) {
    const k=terms[row].k, l=terms[col].k, d=l-k;
    const definition = j => math('c_{'+j+'}=\\sigma_{'+n+','+j+'}\\varrho^{-'+j+'}');
    find('row-def').replaceChildren(definition(k));
    find('col-factors').hidden = row===col;
    find('col-def').replaceChildren(definition(l));
    find('selected-name').textContent='Ordered cell ('+k+', '+l+')';
    const factor='c_{'+k+'}c_{'+l+'}';
    const selected='T_{'+k+','+l+'}(\\theta)='+factor+'\\,W(\\theta)'+(d===0?'':phase(d));
    find('ordered-formula').replaceChildren(math(selected));
    const channels=find('channels');
    channels.replaceChildren(math('='+factor+'\\big['));
    const pieces=[[d,'a'],[d+2,'-\\tfrac14'],[d-2,'-\\tfrac14']];
    for(const [frequency,prefactor] of pieces) {
      const span=math(prefactor+(frequency===0?'':phase(frequency)));
      span.className='px-weight'+(frequency===0?' px-weight-on':'');
      span.dataset.pxFrequency=frequency;
      channels.append(span);
    }
    channels.append(math('\\big]'));
    let reason;
    if (d===0) reason='The constant weight a survives. This diagonal cell supplies the highlighted square in the average.';
    else if (Math.abs(d)===2) reason='The constant term in brackets gives −¼ of the coefficient product. Its conjugate cell supplies another −¼, yielding the highlighted −½ term in the average.';
    else reason='The three frequencies '+pieces.map(([f])=>f).join(', ')+' all oscillate. This cell averages to zero, so it has no term in the averaged sum.';
    find('reason').textContent=reason;
  }
  const fmt = value => Number(value.toPrecision(5)).toString().replace(/-/g,'−');
  function update(next) {
    if (!host || !next.terms.length || !next.terms[next.row] || !next.terms[next.col]) return;
    model=next;
    const {n,rho,theta,terms,row,col}=next;
    const key = n+'/'+terms.length;
    const picked = key+'/'+row+'/'+col;
    if (key!==ladder) {buildRows(next);ladder=key;}
    if (picked!==selection) {
      classSelection(next);
      buildProduct(next);
      renderTex();
      selection=picked;
    }
    const r=terms[row], c=terms[col], d=c.k-r.k;
    const t=theta*Math.PI/180, a=(rho*rho+rho**-2)/4, w=a-.5*Math.cos(2*t);
    const p=r.amplitude*c.amplitude;
    const real=p*w*Math.cos(d*t), imag=p*w*Math.sin(d*t);
    const h=d===0?a:Math.abs(d)===2?-.25:0;
    const ordered=h*p;
    const mean=next.meanMode===true || next.meanMode==='mean';
    const re=Math.abs(Math.cos(d*t))<1e-14?0:real, im=Math.abs(Math.sin(d*t))<1e-14?0:imag;
    const instant=fmt(re)+(im<0?' − ':' + ')+fmt(Math.abs(im))+'i';
    const factors = term => '≈ '+fmt(term.sigma)+' × '+fmt(rho**-term.k)+' ≈ '+fmt(term.amplitude);
    find('row-amount').textContent=factors(r);
    find('col-amount').textContent=factors(c);
    find('value').textContent=mean
      ? 'Full-turn mean of this cell ≈ '+fmt(ordered)+(d===0?'':'   ·   Including its conjugate ≈ '+fmt(2*ordered))
      : 'At '+theta+'° this cell ≈ '+instant+(d===0?'':'   ·   Including its conjugate ≈ '+fmt(2*re));
    const diagonal=a*terms.reduce((s,v)=>s+v.amplitude**2,0);
    const neighbour=terms.slice(1).reduce((s,v,i)=>s-v.amplitude*terms[i].amplitude/2,0);
    find('sum').textContent='Diagonal total '+fmt(diagonal)+'   ·   Neighbour correction '+fmt(neighbour)+'   ·   Finite weighted mean ≈ '+fmt(diagonal+neighbour);
  }
  window.KernelPairExpansion={mount,update};
})();
