/* Linked complex-plane tangents and angular means in Lesson 5. */
(() => {
  'use strict';
  const host = document.querySelector('#kernel-pullback');
  const root = document.querySelector('#lesson-lab');
  const m = window.CoefficientMath;
  if (!host || !root || !m) return;
  const cyan = '#66d8ec', gold = '#ffd279', green = '#bfeb99', violet = '#d7a9f9', grid = '#655775';
  const num = x => Number(x.toPrecision(5)).toString().replace('-', '−');
  const complex = v => num(Math.abs(v.re)<1e-13?0:v.re) + (v.im < -1e-13 ? ' − ' : ' + ') + num(Math.abs(v.im)<1e-13?0:Math.abs(v.im)) + 'i';
  const angle = degrees => degrees * Math.PI / 180;
  const out = (id, value) => { host.querySelector(id).textContent = value; };
  let state, profile = 'speed', inputVector = 'tangent';

  function plot(selector, width, height) {
    const svg = d3.select(selector).attr('viewBox', [0,0,width,height].join(' '));
    svg.selectAll('*').remove();
    return svg;
  }
  function segment(svg,x,y,u,v,color,thickness=1) {
    return svg.append('line').attr('x1',x).attr('y1',y).attr('x2',u).attr('y2',v)
      .attr('stroke',color).attr('stroke-width',thickness);
  }
  function pen(svg, x, y, label, anchor='start') {
    svg.append('text').attr('x',x).attr('y',y).attr('text-anchor',anchor)
      .attr('fill','#e4dcea').attr('font-size',13).text(label);
  }
  function tip(svg,x,y,dx,dy,color) {
    const length=Math.hypot(dx,dy);
    if (length<1e-7) return;
    const u=dx/length, v=dy/length, h=Math.min(9,length*.56), endX=x+dx, endY=y+dy;
    segment(svg,x,y,endX,endY,color,3);
    const vertices=[[endX,endY],[endX-h*u-h*.45*v,endY-h*v+h*.45*u],
      [endX-h*u+h*.45*v,endY-h*v-h*.45*u]];
    svg.append('polygon').attr('points',vertices.map(p=>p.join(',')).join(' ')).attr('fill',color);
  }
  function point(svg,x,y,color) {
    svg.append('circle').attr('cx',x).attr('cy',y).attr('r',4.8).attr('fill',color).attr('stroke','#23182f');
  }
  function plane(selector,a,b,p,tangent,isEllipse) {
    const svg=plot(selector,360,222), cx=180, cy=110, scale=89/state.rho;
    if (!isEllipse) {
      const radii = [scale/state.rho,scale,scale*state.rho];
      for (const [i,color] of [[0,'#f9ad86'],[1,cyan]]) {
        svg.append('path').attr('transform','translate('+cx+','+cy+')')
          .attr('d',d3.arc().innerRadius(radii[i]).outerRadius(radii[i+1]).startAngle(0).endAngle(2*Math.PI)())
          .attr('fill',color).attr('opacity',i===1?.17:.07);
      }
      for (const [r,color,dash] of [[radii[0],'#f9ad86','2 3'],[radii[1],'#beb4ca','5 4']]) {
        svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r',r).attr('fill','none')
          .attr('stroke',color).attr('stroke-dasharray',dash);
      }
      const inv=m.div(m.C(1),p);
      svg.append('circle').attr('cx',cx+scale*inv.re).attr('cy',cy-scale*inv.im).attr('r',4.2)
        .attr('fill','#21182b').attr('stroke','#f9ad86').attr('stroke-width',2);
    }
    segment(svg,12,cy,348,cy,grid); segment(svg,cx,9,cx,212,grid);
    pen(svg,346,cy-7,'Re','end'); pen(svg,cx+6,16,'Im');
    svg.append('ellipse').attr('cx',cx).attr('cy',cy).attr('rx',a*scale).attr('ry',b*scale)
      .attr('stroke',isEllipse?violet:cyan).attr('stroke-width',2.5).attr('fill','none');
    if (isEllipse) {
      segment(svg,cx-scale,cy,cx+scale,cy,'#ff7889',3);
      const top = cy-scale*b, right = cx+scale*a, guide=cy-6;
      segment(svg,cx,guide,right,guide,violet,2);segment(svg,right,guide-3,right,cy,violet);
      segment(svg,cx,cy,cx,top,green,2.5);
      pen(svg,cx+(right-cx)*.68,guide-5,'aρ','middle');
      pen(svg,cx-5,top-5,'bρ','end');
      pen(svg,cx-scale,cy+18,'−1','middle');pen(svg,cx+scale,cy+18,'1','middle');
    }
    const x=cx+scale*p.re, y=cy-scale*p.im;
    tip(svg,x,y,.45*scale*tangent.re,-.45*scale*tangent.im,gold);point(svg,x,y,green);
  }
  function wave(terms, theta, a) {
    const L=terms.length;
    const flat=terms.reduce((s,v)=>s+v.amplitude**2,0);
    const cross=terms.slice(1).reduce((s,v,i)=>s+.5*v.amplitude*terms[i].amplitude,0);
    const mean=profile==='speed'?a:profile==='flat'?flat:a*flat-cross;
    function height(t) {
      const speed=a-.5*Math.cos(2*t);
      if(profile==='speed') return speed;
      const energy=m.abs2(m.evaluateTerms(terms,t));
      return profile==='flat'?energy:energy*speed;
    }
    const svgNode=host.querySelector('.pb-wave');
    const w=Math.max(240,Math.min(1060,svgNode.clientWidth||620)), h=165;
    const svg=plot(svgNode,w,h);
    const samples=Array.from({length:513},(_,i)=>[i/512,height(i*Math.PI/256)]);
    const max=d3.max(samples,d=>d[1])*1.09, x=t=>12+(w-24)*t, y=v=>132-110*v/max;
    const color=profile==='speed'?gold:profile==='flat'?cyan:violet;
    segment(svg,12,132,w-12,132,grid);
    svg.append('path').attr('d',d3.line().x(v=>x(v[0])).y(v=>y(v[1]))(samples))
      .attr('fill','none').attr('stroke',color).attr('stroke-width',2.6);
    segment(svg,12,y(mean),w-12,y(mean),green,1.7).attr('stroke-dasharray','5 5');
    const val=height(theta);
    point(svg,x(state.theta/360),y(val),color);
    pen(svg,12,154,'0°');pen(svg,w/2,154,'180°','middle');pen(svg,w-12,154,'360°','end');
    out('#pb-wave-read',(profile==='speed'?'Squared speed':'Energy with '+L+' terms')+' at '+state.theta+'° ≈ '+num(val)+'   ·   Full-turn mean ≈ '+num(mean));
  }
  function drawMatrix(z,j) {
    const v = inputVector==='tangent' ? m.C(-z.im,z.re) : inputVector==='real' ? m.C(1,0) : m.C(0,1);
    const image = m.mul(j,v);
    const matrix = [j.re,-j.im,j.im,j.re];
    function writeColumn(id, values) {
      const cells=host.querySelector(id).children;
      values.forEach((value,i)=>{ cells[i].textContent = Number(value.toFixed(4)).toString().replace('-', '−'); });
    }
    writeColumn('#pm-J',matrix);writeColumn('#pm-in',[v.re,v.im]);writeColumn('#pm-out',[image.re,image.im]);
    const turn=Math.atan2(j.im,j.re)*180/Math.PI;
    out('#pm-rotation','Length ×'+num(m.abs(j))+'   ·   turn '+Number(turn.toFixed(2))+'°');
    host.querySelector('#pm-theta').value=state.theta;
    host.querySelector('#pm-deg').value=state.theta+'°';
    host.querySelector('#pm-tangent-eqn').hidden=inputVector!=='tangent';
    const svg=plot('#pm-vectors',260,172),cx=130,cy=86,scale=69/m.abs(v);
    segment(svg,15,cy,245,cy,grid);segment(svg,cx,10,cx,162,grid);
    pen(svg,245,cy-7,'Re','end');pen(svg,cx+5,16,'Im');
    // Use a short arc to mark the signed change in direction of this vector.
    const start=Math.atan2(v.im,v.re),phi=Math.atan2(j.im,j.re);
    const arcPoints=Array.from({length:17},(_,i)=>[cx+27*Math.cos(start+phi*i/16),cy-27*Math.sin(start+phi*i/16)]);
    svg.append('path').attr('d',d3.line()(arcPoints)).attr('stroke',gold).attr('fill','none').attr('stroke-width',2);
    tip(svg,cx,cy,scale*v.re,-scale*v.im,cyan);
    tip(svg,cx,cy,scale*image.re,-scale*image.im,violet);
    point(svg,cx,cy,green);
  }
  function draw() {
    if (!state || host.hidden) return;
    const {rho,n,L}=state, t=angle(state.theta);
    const z=m.polar(rho,t), omega=m.joukowski(z), j=m.joukowskiPrime(z);
    const tangent=m.tangent(rho,t), q=m.Qintegral(n,omega);
    plane('#pb-circle',rho,rho,z,m.C(-z.im,z.re),false);
    plane('#pb-ellipse',(rho+1/rho)/2,(rho-1/rho)/2,omega,tangent,true);
    out('#pb-z','z ≈ '+complex(z)+'   ·   Circle speed = '+num(rho));
    out('#pb-omega','ω ≈ '+complex(omega)+'   ·   Ellipse speed ≈ '+num(m.abs(tangent)));
    drawMatrix(z,j);
    out('#pb-axes','aρ ≈ '+num((rho+1/rho)/2)+'   ·   bρ ≈ '+num((rho-1/rho)/2));
    out('#pb-q','Shared kernel value ≈ '+complex(q)+' (quadrature)');
    out('#pb-j','Jacobian ≈ '+complex(j)+'   ·   Scale ×'+num(m.abs(j))+'   ·   Turn '+num(Math.atan2(j.im,j.re)*180/Math.PI)+'°');
    out('#pb-tilde','Kernel times Jacobian ≈ '+complex(m.mul(q,j)));
    wave(m.qTerms(n,rho,L),t,(rho**2+rho**-2)/4);
  }
  root.addEventListener('kernel:update', e=>{ state=e.detail; draw(); });
  for (const b of host.querySelectorAll('[data-pb-angle]')) b.addEventListener('click',()=>{
    root.dispatchEvent(new CustomEvent('kernel:set',{detail:{theta:Number(b.dataset.pbAngle)}}));
  });
  const profiles=host.querySelectorAll('[data-pb-profile]');
  for(const b of profiles) b.addEventListener('click',()=>{
    profile=b.dataset.pbProfile;
    for(const other of profiles) other.setAttribute('aria-pressed',String(other===b));
    draw();
  });
  host.querySelector('#pm-theta').addEventListener('input',event=>{
    root.dispatchEvent(new CustomEvent('kernel:set',{detail:{theta:Number(event.target.value)}}));
  });
  host.querySelector('#pm-example').addEventListener('click',()=>{
    root.dispatchEvent(new CustomEvent('kernel:set',{detail:{rho:2,theta:45}}));
  });
  const vectorButtons=host.querySelectorAll('[data-pm-input]');
  for (const button of vectorButtons) button.addEventListener('click',()=>{
    inputVector=button.dataset.pmInput;
    for (const other of vectorButtons) other.setAttribute('aria-pressed',String(other===button));
    draw();
  });
  for (const link of host.querySelectorAll('[data-pb-contour]')) link.addEventListener('click',()=>{
    root.querySelector('.kw-path [aria-controls="kernel-jacobian"]').click();
    root.querySelector('[data-jac-mode="'+link.dataset.pbContour+'"]').click();
    if (link.dataset.pbAverage) root.querySelector('[data-jac-average="'+link.dataset.pbAverage+'"]').click();
    if (link.dataset.pbContour==='shift') {
      root.querySelector('[data-jac-basis="value"]').click();
      const row=state.L>1 ? Math.max(1,state.q) : 0;
      root.querySelector('[data-jac-source-row="'+row+'"][data-jac-source-col="'+Math.max(0,row-1)+'"]')?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    }
    if (link.dataset.pbAverage==='point' && state.L>1) {
      const delta=state.q+1<state.L?2:-2;
      root.querySelector('[data-jac-delta="'+delta+'"]').click();
    }
    root.querySelector('[data-jac-panel="'+link.dataset.pbContour+'"]').scrollIntoView({block:'start'});
  });
  new ResizeObserver(draw).observe(host.querySelector('.pb-wave').parentElement);
})();
