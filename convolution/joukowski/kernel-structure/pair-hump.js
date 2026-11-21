/* Display the finite Hardy integral as angular profiles and two local gauges
 * attached to the same Bernstein ellipse. All arithmetic is binary64. */
(() => {
  'use strict';
  const TAU = 2 * Math.PI;
  const cyan = '#69dae7', gold = '#ffce78', lilac = '#c5a3e9', ink = '#e9e0f1', grid = '#675776';
  let host, onTheta, state, observer, commonScale = false;
  let lastPacket = '', lastPair = '', full, selected;

  const fmt = value => value === 0 ? '0' : Number(value.toPrecision(5)).toString().replace(/-/g,'−');
  const $ = selector => host.querySelector(selector);

  // If G(t)=Σ b_m cos(mt), multiply it by W(t)=a−cos(2t)/2.
  // Reflection of a negative cosine index also covers the m=0 and m=2 edges.
  function weightedSeries(coefficients, a) {
    const result = Array(coefficients.length + 2).fill(0);
    coefficients.forEach((b,m) => {
      result[m] += a*b;
      result[m+2] -= .25*b;
      result[Math.abs(m-2)] -= .25*b;
    });
    return result;
  }
  function seriesValue(coefficients, t) {
    return coefficients.reduce((v,b,m) => v + b*Math.cos(m*t), 0);
  }
  function sweptMean(coefficients, degrees) {
    if (degrees===360) return coefficients[0];
    if (degrees===0) return 0;
    const t=degrees*TAU/360;
    return coefficients.reduce((v,b,m) => v + b*(m ? Math.sin(m*t)/m : t),0)/TAU;
  }
  function buildProfile(coefficients, a) {
    const b = weightedSeries(coefficients,a);
    const samples = Array.from({length:513},(_,i) => seriesValue(b,TAU*i/512));
    const peak = Math.max(...samples.map(Math.abs));
    return {b,samples,peak};
  }
  function prepareProfiles() {
    const {n,rho,row,col,terms} = state;
    const key = [n,rho,terms.length].join('/');
    const a = (rho*rho+rho**-2)/4;
    if (key!==lastPacket) {
      const b = Array(terms.at(-1).k-terms[0].k+1).fill(0);
      terms.forEach((v,i) => {
        b[0] += v.amplitude*v.amplitude;
        for (let j=i+1;j<terms.length;j++) b[terms[j].k-v.k] += 2*v.amplitude*terms[j].amplitude;
      });
      full = buildProfile(b,a);
      lastPacket=key;
    }
    const pairKey = [key,row,col].join('/');
    if (pairKey!==lastPair) {
      const u=terms[row], v=terms[col], delta=Math.abs(v.k-u.k);
      const b=Array(delta+1).fill(0);
      b[delta] = (row===col ? 1 : 2)*u.amplitude*v.amplitude;
      selected=buildProfile(b,a);
      lastPair=pairKey;
    }
  }
  function el(svg,name,attrs,content) {
    const node=document.createElementNS('http://www.w3.org/2000/svg',name);
    for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
    if (content!==undefined) node.textContent=content;
    svg.append(node);
    return node;
  }
  function path(svg,pts,attrs,close=false) {
    const d='M'+pts.map(([x,y])=>x.toFixed(2)+','+y.toFixed(2)).join('L')+(close?'Z':'');
    return el(svg,'path',{d,fill:'none',...attrs});
  }
  function line(svg,x1,y1,x2,y2,stroke,other={}) {
    return el(svg,'line',{x1,y1,x2,y2,stroke,...other});
  }
  function label(svg,x,y,msg,anchor='start',color=ink) {
    return el(svg,'text',{x,y,'text-anchor':anchor,fill:color,'font-size':12},msg);
  }
  function canvas(selector,width,height) {
    const svg=$(selector);
    svg.replaceChildren();
    svg.setAttribute('viewBox','0 0 '+width+' '+height);
    return svg;
  }
  function drawEllipse(width, localFull, localPair, t, isMean, fullScale, pairScale) {
    const a=(state.rho+1/state.rho)/2, b=(state.rho-1/state.rho)/2;
    const margin=Math.max(31,Math.min(52,width*.12)), room=margin-7;
    const height=Math.max(158,Math.min(290,(width-2*margin)*b/a + 2*margin));
    const svg=canvas('[data-hump-ellipse]',width,height);
    const rx=Math.min(width/2-margin,(height/2-margin)*a/b);
    const ry=rx*b/a, cx=width/2,cy=height/2;
    const boundary=angle=>[cx+rx*Math.cos(angle),cy-ry*Math.sin(angle)];
    const normal=angle=>{
      const x=Math.cos(angle)/rx, y=-Math.sin(angle)/ry, length=Math.hypot(x,y);
      return [x/length,y/length];
    };
    const shifted=(angle,d)=>{
      const p=boundary(angle), u=normal(angle);
      return [p[0]+d*u[0],p[1]+d*u[1]];
    };
    line(svg,cx-rx-12,cy,cx+rx+12,cy,grid,{'stroke-dasharray':'2 5'});
    line(svg,cx,cy-ry-10,cx,cy+ry+10,grid,{'stroke-dasharray':'2 5'});
    el(svg,'ellipse',{cx,cy,rx,ry,stroke:lilac,'stroke-width':2,fill:'none'});
    line(svg,cx-rx/a,cy,cx+rx/a,cy,'#fa7f91',{'stroke-width':2});
    // Each Gaussian is a local glyph. Its centre height encodes the reading;
    // the angular trace below carries the actual unwindowed integrand.
    function hump(value,peak,spread,color,opacity) {
      const d=room*value/peak;
      const arcWidth=Math.min(.65,spread/Math.hypot(rx*Math.sin(t),ry*Math.cos(t)));
      const base=[], ridge=[];
      for(let i=0;i<=42;i++) {
        const s=i/21-1, angle=t+arcWidth*s;
        const shape=(Math.exp(-4*s*s)-Math.exp(-4))/(1-Math.exp(-4));
        base.push(boundary(angle));ridge.push(shifted(angle,d*shape));
      }
      path(svg,[...base,...ridge.slice().reverse()],{fill:color,'fill-opacity':opacity},true);
      path(svg,ridge,{stroke:color,'stroke-width':2.6});
      const tip=shifted(t,d);
      el(svg,'circle',{cx:tip[0],cy:tip[1],r:2.4,fill:color});
    }
    hump(isMean?full.b[0]:localFull,fullScale,36,cyan,.26);
    hump(isMean?selected.b[0]:localPair,pairScale,20,gold,.34);
    const [x,y]=boundary(t);
    el(svg,'circle',{cx:x,cy:y,r:3.3,fill:'#292033',stroke:lilac,'stroke-width':1.5});
    label(svg,7,height-5,'Drag to change θ');
    label(svg,width-7,height-5,'—  [−1, 1]','end','#fa7f91');
    function pointAngle(x,y) {
      if (Math.hypot((x-cx)/rx,(y-cy)/ry)<.12) return;
      return (Math.atan2((cy-y)/ry,(x-cx)/rx)*360/TAU+360)%360;
    }
    svg.humpAngle=pointAngle;
  }

  function drawTrace(width,t,localFull,localPair,fullScale,pairScale) {
    const height=138, svg=canvas('[data-hump-trace]',width,height);
    const left=12,right=width-12,top=12,bottom=106;
    const xAt=index=>left+(right-left)*index;
    const signed=state.row!==state.col;
    const zero=signed?(top+bottom)/2:bottom;
    const extent=zero-top, yAt=(v,scale)=>zero-.92*extent*v/scale;
    const pos=t/TAU, xx=xAt(pos);
    line(svg,left,zero,right,zero,grid,{'stroke-width':1.5});
    function draw(profile,scale,local,color) {
      const coords=profile.samples.map((v,i)=>[xAt(i/512),yAt(v,scale)]);
      const sweep=coords.slice(0,1+Math.floor(pos*512));
      sweep.push([xx,yAt(local,scale)]);
      path(svg,[[left,zero],...sweep,[xx,zero]],{fill:color,'fill-opacity':.12,stroke:'none'},true);
      path(svg,coords,{stroke:color,'stroke-width':2});
      line(svg,left,yAt(profile.b[0],scale),right,yAt(profile.b[0],scale),color,{'stroke-dasharray':'5 5',opacity:.65});
      el(svg,'circle',{cx:xx,cy:yAt(local,scale),r:3.1,fill:color});
    }
    line(svg,xx,top,xx,bottom,'#d7cfdb',{'stroke-dasharray':'2 4',opacity:.7});
    draw(full,fullScale,localFull,cyan);
    draw(selected,pairScale,localPair,gold);
    label(svg,left,128,'0°'); label(svg,xAt(.5),128,'180°','middle');label(svg,right,128,'360°','end');
    svg.humpAngle=(x,y)=>360*Math.max(0,Math.min(1,(x-left)/(right-left)));
  }

  function render() {
    if (!state || !host || !host.getClientRects().length) return;
    const {terms,row,col,theta,rho}=state, u=terms[row], v=terms[col];
    if (!u || !v) return;
    prepareProfiles();
    const isMean=state.meanMode===true || state.meanMode==='mean';
    const t=theta*TAU/360, W=(rho*rho+rho**-2)/4-.5*Math.cos(2*t);
    const localFull=window.CoefficientMath.abs2(window.CoefficientMath.evaluateTerms(terms,t))*W;
    const localPair=u.amplitude*v.amplitude*W*(row===col?1:2)*Math.cos((v.k-u.k)*t);
    const width=Math.max(175,$('[data-hump-ellipse]').clientWidth);
    // In a common-scale comparison a single paired contribution can exceed
    // the locally cancelled total. Fit both profiles to one reference peak.
    const commonPeak=Math.max(full.peak,selected.peak);
    const fullScale=commonScale?commonPeak:full.peak;
    const pairScale=commonScale?commonPeak:selected.peak;
    drawEllipse(width,localFull,localPair,t,isMean,fullScale,pairScale);
    drawTrace(width,t,localFull,localPair,fullScale,pairScale);
    const grouped=row!==col;
    const values=[localFull,localPair,full.b[0],selected.b[0],sweptMean(full.b,theta),sweptMean(selected.b,theta)];
    host.querySelectorAll('[data-hump-number]').forEach((n,i)=>{n.textContent=fmt(values[i]);});
    $('[data-hump-heading]').textContent=isMean?'Full-turn means mounted at the probe':'Local densities at the moving point';
    $('[data-hump-pair]').textContent=grouped?'Modes '+u.k+' and '+v.k+' · both orders':'Mode '+u.k+' · diagonal';
    $('[data-hump-full-now]').textContent=fmt(isMean?full.b[0]:localFull);
    $('[data-hump-pair-now]').textContent=fmt(isMean?selected.b[0]:localPair);
    $('[data-hump-mean-caption]').textContent=isMean && selected.b[0]===0
      ? 'The gold hump is flat. The positive and negative parts of its angular profile below cancel over one turn.'
      : isMean
        ? 'Peak heights show the full-turn means. Moving the point carries those heights around the ellipse.'
        : 'Peak heights follow the local integrands. A negative pair bends inward and a positive pair outward.';
    $('[data-hump-scales]').textContent=commonScale
      ? 'Common height scale · reference '+fmt(commonPeak)
      : 'Separate height scales · total '+fmt(full.peak)+' · selected '+fmt(pairScale);
    $('[data-hump-order]').textContent=grouped
      ? 'The gold curve adds the selected entry and its conjugate transpose. Their imaginary parts cancel, leaving twice the real part.'
      : 'The gold diagonal contribution is counted once. Its density is the squared coefficient times the squared boundary speed.';
    $('[data-hump-theta]').textContent=theta+'°';
    host.querySelectorAll('[data-hump-scale]').forEach(n=>n.setAttribute('aria-pressed',String((n.dataset.humpScale==='common')===commonScale)));
  }

  function mount(node,setAngle) {
    if (observer) observer.disconnect();
    host=node;onTheta=setAngle;state=null;commonScale=false;lastPacket='';lastPair='';
    host.innerHTML=String.raw`
      <h4 style="margin:.25rem 0">Energy on the Bernstein ellipse</h4>
      <strong data-hump-heading style="font-size:.93rem"></strong>
      <div style="display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:.88rem;margin:.4rem 0">
        <span style="color:#69dae7">● Full packet ≈ <b data-hump-full-now></b></span>
        <span style="color:#ffce78">● <span data-hump-pair></span> ≈ <b data-hump-pair-now></b></span>
      </div>
      <svg data-hump-ellipse role="slider" tabindex="0" aria-label="Ellipse probe angle" aria-valuemin="0" aria-valuemax="360" style="width:100%;display:block;touch-action:none;cursor:crosshair"></svg>
      <p class="kw-disc-note" data-hump-mean-caption></p>
      <svg data-hump-trace role="img" aria-label="Full and selected angular densities, with full-turn means dashed" style="width:100%;display:block;touch-action:none;cursor:crosshair"></svg>
      <p class="kw-disc-note">Solid curves give the actual angular profiles. Dashed lines mark their means. Shading accumulates from 0° to the probe. Only the peak height of each ellipse hump encodes its value.</p>
      <div class="kw-controls" aria-label="Choose vertical scales" role="group">
        <button type="button" data-hump-scale="fit">Fit each series</button><button type="button" data-hump-scale="common">Common scale</button>
      </div><output class="kw-disc-note" data-hump-scales></output>
      <table style="width:100%;table-layout:fixed;text-align:right;overflow-wrap:anywhere;font-variant-numeric:tabular-nums;font-size:clamp(.75rem,2vw,.9rem);margin-top:.5rem">
        <thead><tr><th scope="col" style="text-align:left">Reading</th><th scope="col" style="color:#69dae7;text-align:right">Full packet</th><th scope="col" style="color:#ffce78;text-align:right">Selected</th></tr></thead>
        <tbody><tr><th scope="row" style="text-align:left">At <span data-hump-theta></span></th><td data-hump-number></td><td data-hump-number></td></tr>
        <tr><th scope="row" style="text-align:left">Full-turn mean</th><td data-hump-number></td><td data-hump-number></td></tr>
        <tr><th scope="row" style="text-align:left">Swept integral</th><td data-hump-number></td><td data-hump-number></td></tr></tbody></table>
      <p class="math-static kw-disc-note">Both integrals use \(d\theta/(2\pi)\). The swept integral reaches the full-turn mean at \(360^\circ\).</p>
      <p class="kw-disc-note" data-hump-order></p>`;
    for(const svg of host.querySelectorAll('svg')) {
      let pointer;
      function change(e) {
        if (!svg.humpAngle || !svg.getScreenCTM()) return;
        const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
        const degrees=svg.humpAngle(p.x,p.y);
        if (Number.isFinite(degrees)) onTheta(Math.round(degrees));
      }
      svg.addEventListener('pointerdown',e=>{
        if(e.button!==0)return;
        pointer=e.pointerId;svg.setPointerCapture(pointer);change(e);
      });
      svg.addEventListener('pointermove',e=>{if(pointer===e.pointerId)change(e);});
      svg.addEventListener('lostpointercapture',()=>{pointer=undefined;});
    }
    $('[data-hump-ellipse]').addEventListener('keydown',event=>{
      if (!state) return;
      const step=event.shiftKey?10:1;
      const next={Home:0,End:360,ArrowLeft:state.theta-step,ArrowRight:state.theta+step,
        ArrowDown:state.theta-step,ArrowUp:state.theta+step}[event.key];
      if(Number.isFinite(next)){event.preventDefault();onTheta(Math.max(0,Math.min(360,next)));}
    });
    for(const btn of host.querySelectorAll('[data-hump-scale]')) btn.addEventListener('click',()=>{
      commonScale=btn.dataset.humpScale==='common';render();
    });
    let lastWidth=0;
    observer=new ResizeObserver(()=>{
      if(host.clientWidth!==lastWidth){lastWidth=host.clientWidth;render();}
    });
    observer.observe(host);
  }
  function update(next) {
    state=next;
    if(host) $('[data-hump-ellipse]').setAttribute('aria-valuenow',next.theta);
    render();
  }
  window.KernelPairHump=Object.freeze({mount,update});
})();
