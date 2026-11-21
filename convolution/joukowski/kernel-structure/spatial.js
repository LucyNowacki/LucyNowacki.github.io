/* Orthographic views of two complex planes and of the last truncation levels. */
(() => {
  'use strict';
  const lab = document.querySelector('#lesson-lab');
  const map = document.querySelector('#kp-space');
  const history = document.querySelector('#kd-history');
  const math = window.CoefficientMath;
  if (!lab || !map || !math) return;
  const cyan = '#65dfe5', lilac = '#d0abff', gold = '#ffd07c', rose = '#ff718a', mint = '#b9edb3';
  const pale = '#ded7ed', grid = '#8e88a1', peach = '#f9ad86';
  const rad = t => t * Math.PI / 180;
  const number = v => Number(v.toPrecision(4)).toString();
  const coordinate = z => number(Math.abs(z.re)<1e-13?0:z.re)+(z.im< -1e-13?' − ':' + ')+number(Math.abs(z.im)<1e-13?0:Math.abs(z.im))+'i';
  let state, mapMode = 'space', showStack = false;

  function cameraControls(initialTurn, initialTilt) {
    return '<div class="space-camera"><label>Rotate <output data-cam-read="yaw"></output><input type="range" data-camera="yaw" min="-180" max="180" value="'+initialTurn+'"></label>'+
      '<label>Tilt <output data-cam-read="tilt"></output><input type="range" data-camera="tilt" min="14" max="65" value="'+initialTilt+'"></label>'+
      '<button type="button" data-reset-camera>Reset view</button></div>';
  }
  map.innerHTML = String.raw`<section class="kw-card space-card"><h4>The coefficient contour and its reciprocal partner</h4>
    <div class="space-layout"><div class="space-stage"><svg class="space-scene" role="img" aria-label="An annulus with the outer coefficient contour and reciprocal circle above the image ellipse, with corresponding points and semiaxes"></svg>
    <div class="space-legend math-static"><span style="color:#65dfe5">● Coefficient contour \(|z|=\varrho\)</span><span style="color:#f9ad86">◌ Reciprocal circle \(|z|=1/\varrho\)</span><span style="color:#ded7ed">┄ Unit circle</span><span style="color:#ff718a">━ \([-1,1]\)</span></div></div>
    <div class="space-data"><h4>Circle and ellipse head-on</h4>
    <div class="kw-controls" role="group" aria-label="Tangent comparison"><button type="button" data-inset="curves" aria-pressed="true">Trace the curves</button><button type="button" data-inset="vectors" aria-pressed="false">Align tangent tails</button></div>
    <svg class="space-inset" style="height:auto;aspect-ratio:280/200" role="img" aria-label="Front-on drawing of the source circle and its corresponding ellipse"></svg>
    <div class="space-legend"><span style="color:#65dfe5">● Circle</span><span style="color:#d0abff">● Ellipse</span></div>
    <p data-inset-explanation></p><output data-map-points></output><output data-map-speeds></output><output data-map-scale></output></div></div>
    <div class="space-probe"><label>Move the point <output data-map-angle></output><input data-map-theta type="range" min="0" max="360" value="28"></label></div>
    <label class="math-static"><input type="checkbox" data-map-partner checked> Show the second preimage \(z^{-1}\)</label><output data-map-preimages></output>
    <div class="kw-grid"><article style="min-width:0"><h4>Which side supplies the coefficients?</h4><p class="math-static">The unit circle separates two sheets of the annulus \(\varrho^{-1}&lt;|z|&lt;\varrho\). The teal band shows the exterior sheet up to the chosen circle. The Laurent expansion of \(Q_n(J(z))\) in negative powers converges for every \(|z|>1\). The coefficient integral follows its solid outer rim \(z=\varrho e^{i\theta}\) counterclockwise. Its kernel terms have radial factor \(|z^{-k}|=\varrho^{-k}\), so increasing \(k\) damps them.</p><p class="math-static">The peach band is the reciprocal sheet. The point \(z^{-1}=\varrho^{-1}e^{-i\theta}\) runs clockwise around its rim and gives the same image \(J(z^{-1})=J(z)\). There the reciprocal coordinate gives the positive-power expansion. The unit circle itself maps onto the red interval.</p></article>
    <article style="min-width:0"><h4>What sets the ellipse’s width and height?</h4>
    <div class="math-static">\[\Gamma_\varrho(\theta)=a\cos\theta+i\,b\sin\theta.\]
     \[\begin{aligned}a&=\tfrac12(\varrho+\varrho^{-1}),\\ b&=\tfrac12(\varrho-\varrho^{-1}).\end{aligned}\]</div>
    <p class="math-static">The dashed radii on the ellipse reach its right-hand tip \(a\) and upper tip \(ib\). At \(\theta=0\) its speed is \(b\), and at \(\theta=\pi/2\) its speed is \(a\). Increase \(\varrho\) to watch the minor semiaxis open away from the interval.</p><output data-map-semiaxes></output></article></div>
    `+cameraControls(-12,29)+String.raw`<p class="kw-disc-note">Drag to turn the camera. The two planes share a coordinate scale. Height separates the planes. The two gold tangents are drawn at 0.45 of their coordinate lengths.</p></section>`;
  if (history) history.innerHTML = String.raw`<details class="kw-card space-card"><summary>Explore the last truncation discs in 3D</summary>
    <p class="math-static">Each horizontal slice is a complex plane. Increasing the retained count by one shifts its centre by the next arrow and multiplies its radius by \(\varrho^{-2}\). The highlighted top slice uses the current \(L\).</p>
    <div class="space-layout"><div class="space-stage"><svg class="space-scene" role="img" aria-label="Stacked remainder discs at successive retained counts"></svg></div>
      <div class="space-data"><h4>Disc radius by level</h4><div data-stack-rows></div>
      <p class="math-static">The in-plane coordinates are offsets from the current finite endpoint. All slices share one length scale. Height records how many terms have been retained.</p></div></div>`+
    cameraControls(-18,24)+String.raw`</details>`;

  function line(svg,p,q,color,width=1,dash) {
    const stroke=svg.append('path').attr('d','M'+p+'L'+q).attr('stroke',color).attr('stroke-width',width).attr('fill','none');
    if (dash) stroke.attr('stroke-dasharray',dash);
    return stroke;
  }
  function path(svg,pts,stroke,fill='none',width=1,opacity=1) {
    return svg.append('path').attr('d','M'+pts.join('L')+'Z').attr('stroke',stroke).attr('fill',fill)
      .attr('stroke-width',width).attr('opacity',opacity).attr('stroke-linejoin','round');
  }
  function text(svg,p,name,color,anchor='start') {
    svg.append('text').attr('x',p[0]).attr('y',p[1]).attr('text-anchor',anchor)
      .attr('fill',color).attr('font-size',14).text(name);
  }
  function mark(svg,p,color,r=4) {
    svg.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',r)
      .attr('fill',color).attr('stroke','#1c1525').attr('stroke-width',1.4);
  }
  function arrow(svg,from,to,color,thickness=3) {
    const dx=to[0]-from[0],dy=to[1]-from[1],len=Math.hypot(dx,dy);
    if (len<.01) return;
    const ux=dx/len,uy=dy/len,h=Math.min(11,len*.43),w=h*.48;
    line(svg,from,to,color,thickness);
    path(svg,[to,[to[0]-h*ux-w*uy,to[1]-h*uy+w*ux],[to[0]-h*ux+w*uy,to[1]-h*uy-w*ux]],color,color);
  }
  function ring(svg,P,a,b,z,stroke,fill='none',width=2.8,center=[0,0]) {
    const points=Array.from({length:144},(_,i)=>{
      const t=i*Math.PI/72;
      return P(center[0]+a*Math.cos(t),center[1]+b*Math.sin(t),z);
    });
    return path(svg,points,stroke,fill,width);
  }
  function makeScene(section,box,drawScene) {
    const svgNode=section.querySelector('.space-scene');
    const svg=d3.select(svgNode);
    const yaw=section.querySelector('[data-camera=yaw]'),tilt=section.querySelector('[data-camera=tilt]');
    let drag;
    function draw() {
      if (!state || !svgNode.getClientRects().length) return;
      const w=Math.max(180,svgNode.clientWidth), h=Math.max(288,Math.min(490,w*.78));
      svg.attr('viewBox','0 0 '+w+' '+h);svg.selectAll('*').remove();
      const u=rad(+yaw.value), v=rad(+tilt.value);
      // Use the circular orbit envelope, so the scale is stable while rotating.
      const scale=Math.min((w-34)/(2*box.radius),(h-44)/(2*box.radius*Math.sin(v)+box.gap*Math.cos(v)));
      const P=(x,y,z)=>[w/2+scale*(x*Math.cos(u)+y*Math.sin(u)),
        h/2-scale*((-x*Math.sin(u)+y*Math.cos(u))*Math.sin(v)+z*Math.cos(v))];
      section.querySelector('[data-cam-read=yaw]').value=yaw.value+'°';
      section.querySelector('[data-cam-read=tilt]').value=tilt.value+'°';
      drawScene(svg,P,scale,w,h);
    }
    for (const input of [yaw,tilt]) input.addEventListener('input',draw);
    section.querySelector('[data-reset-camera]').addEventListener('click',()=>{
      yaw.value=yaw.defaultValue; tilt.value=tilt.defaultValue; draw();
    });
    svgNode.addEventListener('pointerdown', e=>{
      if (e.button!==0) return;
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,u:+yaw.value,v:+tilt.value};svgNode.setPointerCapture(e.pointerId);
    });
    svgNode.addEventListener('pointermove',e=>{
      if (!drag || drag.id!==e.pointerId) return;
      const turns=drag.u+.65*(e.clientX-drag.x);
      yaw.value=Math.round(((turns+540)%360+360)%360-180);
      tilt.value=Math.round(drag.v-.35*(e.clientY-drag.y));draw();
    });
    svgNode.addEventListener('lostpointercapture',()=>{drag=null;});
    new ResizeObserver(draw).observe(svgNode.parentElement);
    return draw;
  }
  let insetView = 'curves';
  function tangentInset(z,omega,tangent) {
    const svg=d3.select(map.querySelector('.space-inset')).attr('viewBox','0 0 280 200');
    svg.selectAll('*').remove();
    const curveView=insetView==='curves', origin=[140,99], scale=(curveView?77:83)/state.rho;
    const at=(x,y)=>[origin[0]+scale*x,origin[1]-scale*y];
    line(svg,[10,99],[270,99],grid);line(svg,[140,6],[140,189],grid);
    text(svg,[269,92],'Re',pale,'end');text(svg,[147,16],'Im',pale);
    const circleTangent=math.C(-z.im,z.re);
    if (curveView) {
      const a=(state.rho+1/state.rho)/2,b=(state.rho-1/state.rho)/2;
      const trace=(major,minor,color)=>{
        ring(svg,at,major,minor,0,color,'none',1.1).attr('opacity',.55);
        const sweep=rad(state.theta),steps=Math.max(1,Math.ceil(state.theta/3));
        const points=Array.from({length:steps+1},(_,i)=>at(major*Math.cos(sweep*i/steps),minor*Math.sin(sweep*i/steps)));
        svg.append('path').attr('d','M'+points.join('L')).attr('stroke',color).attr('fill','none').attr('stroke-width',2.7);
      };
      trace(state.rho,state.rho,cyan);trace(a,b,lilac);
      const realTip=at(a,0), imagTip=at(0,b);
      line(svg,origin,realTip,pale,1.5,'4 4');line(svg,origin,imagTip,pale,1.5,'4 4');
      text(svg,[realTip[0]+3,realTip[1]+14],'a',pale);
      text(svg,[imagTip[0]-5,imagTip[1]-5],'ib',pale,'end');
      for (const [pos,vec,color] of [[z,circleTangent,cyan],[omega,tangent,lilac]]) {
        const p=at(pos.re,pos.im);
        arrow(svg,p,at(pos.re+.45*vec.re,pos.im+.45*vec.im),color);mark(svg,p,color,4.3);
      }
    } else {
      arrow(svg,origin,at(circleTangent.re,circleTangent.im),cyan,5);
      arrow(svg,origin,at(tangent.re,tangent.im),lilac,3);mark(svg,origin,pale,3);
    }
    map.querySelector('[data-inset-explanation]').textContent=curveView
      ? 'Move the point to trace both curves from their right tips. Each arrow begins at its own point. Both curves use the same real and imaginary axes.'
      : 'Both tangent vectors now start at zero. Compare the ellipse tangent’s length and direction with the circle tangent at the same angle.';
  }
  // A compound path leaves the inner sheet visible through the exterior annulus.
  function band(svg,P,outer,inner,height,color,opacity) {
    const circle=r=>Array.from({length:144},(_,i)=>P(r*Math.cos(i*Math.PI/72),r*Math.sin(i*Math.PI/72),height));
    svg.append('path').attr('d','M'+circle(outer).join('L')+'ZM'+circle(inner).join('L')+'Z')
      .attr('fill',color).attr('fill-opacity',opacity).attr('fill-rule','evenodd');
  }
  const drawMap=makeScene(map,{radius:1.42,gap:1.65},(svg,P,scale,w,h)=>{
    const {rho,theta}=state, t=rad(theta), top=.825, bottom=-top;
    const a=(1+rho**-2)/2,b=(1-rho**-2)/2;
    function layer(z,tint) {
      const R=.97;
      const corner=(x,y)=>P(x*R,y*R,z);
      path(svg,[corner(-1,-1),corner(1,-1),corner(1,1),corner(-1,1)],tint,tint,1,.10);
      for (const i of [-1,-.5,0,.5,1]) {
        const sw=i===0?1.45:.7;
        line(svg,corner(i,-1),corner(i,1),tint,sw).attr('opacity',i===0?.48:.19);
        line(svg,corner(-1,i),corner(1,i),tint,sw).attr('opacity',i===0?.48:.19);
      }
    }
    layer(bottom,lilac);ring(svg,P,a,b,bottom,lilac);
    line(svg,P(-1/rho,0,bottom),P(1/rho,0,bottom),rose,3);
    for (const sign of [-1,1]) mark(svg,P(sign/rho,0,bottom),rose,2.6);
    for(const [x,y] of [[a,0],[0,b]]) {
      line(svg,P(0,0,bottom),P(x,y,bottom),pale,2,'4 5');mark(svg,P(x,y,bottom),pale,2.8);
    }
    for(const phi of [0,Math.PI/2,Math.PI,3*Math.PI/2]) {
      line(svg,P(Math.cos(phi),Math.sin(phi),top),P(a*Math.cos(phi),b*Math.sin(phi),bottom),grid,1,'3 6').attr('opacity',.6);
    }
    layer(top,cyan);
    // Scene coordinates are divided by rho. Physical radii rho, 1 and 1/rho
    // therefore appear with display radii 1, 1/rho and 1/rho².
    const unit=1/rho, inner=unit*unit;
    band(svg,P,1,unit,top,cyan,.28);band(svg,P,unit,inner,top,peach,.15);
    ring(svg,P,1,1,top,cyan);
    ring(svg,P,unit,unit,top,pale,'none',1.5).attr('stroke-dasharray','5 4');
    ring(svg,P,inner,inner,top,peach,'none',1.8);

    if(w>525){
      text(svg,[15,P(0,0,top)[1]],'z-plane',cyan);
      text(svg,[15,P(0,0,bottom)[1]],'ω-plane',lilac);
      const o=[w-58,h-37],origin=P(0,0,0);
      for(const [x,y,name] of [[1,0,'Re'],[0,1,'Im']]){
        const proj=P(x,y,0), end=[o[0]+33*(proj[0]-origin[0])/scale,o[1]+33*(proj[1]-origin[1])/scale];
        arrow(svg,o,end,pale,1.5);text(svg,[end[0],end[1]-6],name,pale,'middle');
      }
    }
    const c=Math.cos(t),s=Math.sin(t), A=P(c,s,top), B=P(a*c,b*s,bottom);
    const partnerOn=map.querySelector('[data-map-partner]').checked;
    if (partnerOn) {
      const reciprocal=P(inner*c,-inner*s,top);
      line(svg,reciprocal,B,peach,1.65,'2 5');
      // With increasing theta the reciprocal angle decreases.
      arrow(svg,reciprocal,P(inner*(c-.45*s),-inner*(s+.45*c),top),peach,2);
      mark(svg,reciprocal,peach,4);
    }
    line(svg,A,B,mint,2,'5 5');
    arrow(svg,A,P(c-.45*s,s+.45*c,top),gold);
    arrow(svg,B,P(a*(c-.45*s),b*(s+.45*c),bottom),gold);
    mark(svg,A,cyan,5);mark(svg,B,lilac,5);
    const z=math.polar(rho,t), tangent=math.tangent(rho,t), j=math.joukowskiPrime(z);
    const omega=math.joukowski(z), partner=math.polar(unit,-t);
    tangentInset(z,omega,tangent);
    map.querySelector('[data-map-preimages]').value=partnerOn
      ? 'Outer radius '+number(rho)+'   ·   reciprocal radius '+number(unit)+'   ·   z⁻¹ ≈ '+coordinate(partner)
      : 'Outer radius '+number(rho)+'   ·   evaluation at z ≈ '+coordinate(z);
    map.querySelector('[data-map-semiaxes]').value='Real semiaxis a ≈ '+number(a*rho)+'   ·   imaginary semiaxis b ≈ '+number(b*rho);
    map.querySelector('[data-map-angle]').value=theta+'°'; map.querySelector('[data-map-theta]').value=theta;
    map.querySelector('[data-map-points]').value='z ≈ '+coordinate(z)+'   →   ω ≈ '+coordinate(math.joukowski(z));
    map.querySelector('[data-map-speeds]').value='Speed on circle '+number(rho)+'   ·   on ellipse '+number(math.abs(tangent));
    map.querySelector('[data-map-scale]').value='Tangent scale ×'+number(math.abs(j))+'   ·   turn '+number(Math.atan2(j.im,j.re)*180/Math.PI)+'°';
  });
  map.querySelector('[data-map-theta]').addEventListener('input',e=>{
    lab.dispatchEvent(new CustomEvent('kernel:set',{detail:{theta:+e.target.value}}));
  });
  map.querySelector('[data-map-partner]').addEventListener('change',drawMap);
  const insetViews=map.querySelectorAll('[data-inset]');
  for (const button of insetViews) button.addEventListener('click',()=>{
    insetView=button.dataset.inset;
    for(const other of insetViews) other.setAttribute('aria-pressed',String(other===button));
    drawMap();
  });
  const views=document.querySelectorAll('[data-geom-mode]');
  for(const btn of views) btn.addEventListener('click',()=>{
    mapMode=btn.dataset.geomMode;
    for(const other of views) other.setAttribute('aria-pressed',String(other===btn));
    map.hidden=mapMode!=='space'; document.querySelector('#kp-flat').hidden=!map.hidden;drawMap();
  });

  let drawStack;
  if (history) {
    const details=history.querySelector('details');
    const jump=document.createElement('button');
    jump.type='button';jump.textContent='View discs in 3D ↓';jump.setAttribute('aria-controls','kd-history');
    document.querySelector('[data-disc-example]').after(jump);
    jump.addEventListener('click',()=>{
      details.open=true;
      details.querySelector('summary').focus({preventScroll:true});
      details.scrollIntoView({block:'start'});
    });
    drawStack=makeScene(history,{radius:1.12,gap:1.9},(svg,P)=>{
      const {rho,n,L,theta}=state, first=Math.max(0,L-2), t=rad(theta);
      const terms=math.qTerms(n,rho,L);
      const levels=[];
      let offset=math.C(0);
      // Accumulate relative offsets directly to retain tiny last terms.
      for(let j=L;j>=first;j--) {
        levels.unshift({j,offset,radius:math.kernelRemainder(n,rho,j),z:.95-1.9*(L-j)/(L-first)});
        if(j>first) offset=math.sub(offset,math.polar(terms[j-1].amplitude,-terms[j-1].k*t));
      }
      const base=Math.max(...levels.map(v=>math.abs(v.offset)+v.radius));
      history.querySelector('[data-stack-rows]').replaceChildren();
      let prior;
      for(const v of levels) {
        const x=v.offset.re/base,y=v.offset.im/base,r=v.radius/base;
        const p=P(x,y,v.z), color=v.j===L?mint:lilac;
        line(svg,P(-1.01,0,v.z),P(1.01,0,v.z),grid,.85).attr('opacity',.6);
        line(svg,P(0,-1.01,v.z),P(0,1.01,v.z),grid,.85).attr('opacity',.6);
        ring(svg,P,r,r,v.z,color,v.j===L?'#b9edb32b':'#bc99ff17',2.3,[x,y]);
        if(prior) line(svg,prior,p,gold,1.6,'4 5');
        mark(svg,p,color,3.3);prior=p;
        text(svg,[10,P(0,0,v.z)[1]-6],'L = '+v.j,color);
        const row=document.createElement('p');row.textContent='L = '+v.j+'   ·   radius '+number(v.radius);
        row.style.color=color;history.querySelector('[data-stack-rows]').append(row);
      }
    });
    details.addEventListener('toggle',()=>{showStack=details.open;if(showStack)drawStack();});
  }
  lab.addEventListener('kernel:update',e=>{
    state=e.detail;
    if(mapMode==='space') drawMap();
    if(showStack && drawStack) drawStack();
  });
})();
