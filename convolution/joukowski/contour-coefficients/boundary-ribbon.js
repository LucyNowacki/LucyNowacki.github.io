/* The same positively oriented path supplies the film example, planar view and height plot. */
(() => {
  'use strict';
  const M = window.CoefficientMath;
  const tau = 2 * Math.PI;
  function geometry(state) {
    const a = (state.r + 1 / state.r) / 2;
    const b = (state.r - 1 / state.r) / 2;
    const u = state.mode === 'value' ? state.u : 0;
    // In ellipse coordinates this bound keeps the entire final disk in the unit disk.
    const eps = Math.min(.25, .8 * b * (1 - Math.abs(state.x) / a)) * 10 ** state.e;
    const center = u * state.x;
    const A = (1 - u) * a + u * eps, B = (1 - u) * b + u * eps;
    return {
      a, b, A, B, center, eps, u,
      point: t => M.C(center + A * Math.cos(t), B * Math.sin(t)),
      difference: t => M.C((u - 1) * state.x + A * Math.cos(t), B * Math.sin(t)),
      tangent: t => M.C(-A * Math.sin(t), B * Math.cos(t)),
    };
  }
  function squareModes(g) {
    // H = c + p exp(iθ) + q exp(−iθ). Squaring collects these five angular modes.
    const p = (g.A + g.B) / 2, q = (g.A - g.B) / 2, c = g.center;
    return {'0': c * c + 2 * p * q, '1': 2 * c * p, '-1': 2 * c * q, '2': p * p, '-2': q * q};
  }

  const $ = id => document.getElementById('cj-' + id);
  const chart = d3.select($('ribbon'));
  const colors = {path:'#ffcf75', tangent:'#ff77bc', re:'#57ebf3', im:'#cca1ff', axis:'#b6a4c7', grid:'#614f71'};
  const fmt = x => Math.abs(x) < 1e-10 ? '0' : Number(x.toPrecision(4)).toString();
  const path = points => 'M' + points.map(p => p.join(',')).join('L');
  let lastState, lastData, frame = 0, previous = null, accumulatedPhase = 0;
  function render(state = lastState, data = lastData) {
    if (!state || !data) return;
    lastState = state; lastData = data;
    const g = data.g, t = state.t * tau / 360, view = $('ridge').value;
    const isWave = view === 'function', part = $('component').value;
    const selector = $('wave-mode').value, colored = colors[part];
    $('ribbon').parentElement.style.setProperty('--bc-height-color', colored);
    const phi = +$('phi').value * tau / 360, yaw = +$('yaw').value * tau / 360;
    const selectedMode = isWave && state.example === 'square' && selector !== 'all';
    const coeffs = squareModes(g);
    $('mode-field').hidden = !isWave || state.example !== 'square';
    $('wave-phase').hidden = !isWave;
    $('value-rate').hidden = isWave || state.mode !== 'value';
    $('coeff-rate').hidden = isWave || state.mode === 'value';
    $('mode-rate').hidden = !isWave || state.example !== 'square';
    const weightBox=$('wave-values');
    weightBox.hidden = !isWave || state.example !== 'square';
    if (!weightBox.hidden) {
      const weightData = [-2,-1,0,1,2].map(m=>[m,fmt(coeffs[m])]);
      d3.select(weightBox).selectAll('span').data(weightData).join('span')
        .classed('bc-selected-wave', d=>String(d[0])===selector)
        .text(d=>'b'+['₋₂','₋₁','₀','₁','₂'][d[0]+2]+' = '+d[1]);
    }
    $('phiv').textContent = $('phi').value + '°'; $('yawv').textContent = $('yaw').value + '°';
    function height(angle, value) {
      if (!isWave) return value[part] / tau;
      const wave = selectedMode ? M.polar(coeffs[selector], +selector * angle)
        : M.example(state.example, g.point(angle));
      return M.mul(wave, M.polar(1, -phi))[part];
    }
    const count = 128;
    const heights = Array.from({length: count}, (_, i) => height(tau * i / count, data.ridgeSamples[i]));
    const envelope = isWave
      ? (selectedMode ? Math.abs(coeffs[selector]) : data.functionMax)
      : data.densityMax / tau;
    const unit = 72 / (envelope || 1), aspect = Math.max(g.A, g.B), lateral = 157 / aspect;
    const co = Math.cos(yaw), si = Math.sin(yaw);
    function project(z, h = 0) {
      const x = z.re - g.center, y = z.im;
      return [285 + lateral * (co*x - si*y), 165 - lateral*.43*(si*x + co*y) - unit*h];
    }
    const join = (kind, cls, values) => chart.selectAll(kind + '.' + cls).data(values).join(kind).attr('class',cls);
    const points = heights.map((h,i) => {
      const z = g.point(tau*i/count);
      return {base:project(z), top:project(z,h), depth:si*(z.re-g.center)+co*z.im};
    });
    const ordered = points.map((p,i) => ({p, q:points[(i+1)%count], i})).filter(v=>v.i%2===0)
      .sort((a,b)=>b.p.depth-a.p.depth);
    join('path','ribbon-cell',ordered).attr('d',({p,i})=>{
      const q=points[(i+2)%count], mid=points[(i+1)%count];
      return path([p.base,mid.base,q.base,q.top,mid.top,p.top])+'Z';
    }).attr('fill',colored).attr('fill-opacity',({i})=>i/count*tau<=t ? .25 : .065)
      .attr('stroke',colored).attr('stroke-opacity',.32).attr('stroke-width',.75);
    const baseLine = points.map(v=>v.base), roof = points.map(v=>v.top);
    const here = g.point(t), h = height(t,data.density(t)), base = project(here), tip = project(here,h);
    const tan = g.tangent(t), arrow = project(M.add(here,M.scale(tan,.22)));
    join('path','ribbon-line',[
      [baseLine.concat([baseLine[0]]),colors.path,2], [roof.concat([roof[0]]),colored,3.4],
      [[base,tip],colored,2], [[base,arrow],colors.tangent,3],
    ]).attr('d',d=>path(d[0])).attr('stroke',d=>d[1]).attr('stroke-width',d=>d[2]).attr('fill','none');
    const angle = Math.atan2(arrow[1]-base[1],arrow[0]-base[0]);
    const size = Math.min(10, .55*Math.hypot(arrow[1]-base[1],arrow[0]-base[0]));
    const flank = d => [arrow[0]-size*Math.cos(angle+d),arrow[1]-size*Math.sin(angle+d)];
    join('path','ribbon-arrow',[0]).attr('d',path([flank(.46),arrow,flank(-.46)])+'Z').attr('fill',colors.tangent);
    join('circle','ribbon-dot',[[base,colors.path],[tip,colored]]).attr('cx',d=>d[0][0]).attr('cy',d=>d[0][1])
      .attr('r',4.3).attr('fill',d=>d[1]).attr('stroke','#1b1325').attr('stroke-width',1.5);
    const reference = envelope || 1;
    const scaleText = reference < .001 || reference >= 1e4 ? reference.toExponential(2) : fmt(reference);
    join('path','height-axis',[0]).attr('d','M94,93v144 M90,93h8 M90,165h8 M90,237h8')
      .attr('stroke',colors.grid).attr('fill','none');
    join('text','ribbon-tick',[[93,scaleText],[165,'0'],[237,'−'+scaleText]])
      .attr('x',85).attr('y',d=>d[0]+4).attr('text-anchor','end').attr('fill',colors.axis).text(d=>d[1]);
    join('text','ribbon-axis-name',[0]).attr('x',18).attr('y',64).attr('fill',colored).text('Height');
    $('height-value').textContent = 'θ = '+state.t+'°   ·   height '+fmt(h);
    if (isWave) {
      $('ridge-caption').textContent = selectedMode
        ? 'Mode '+selector+' has coefficient '+fmt(coeffs[selector])+'. The phase control turns the viewing axis. Each crest travels along the fixed contour.'
        : 'The ribbon shows '+(part==='re'?'Re':'Im')+'[e⁻ⁱᵠ f(H(θ))]. At φ = 0° the height is the chosen component of the boundary value.';
    } else {
      $('ridge-caption').textContent = 'Height is the '+(part==='re'?'real':'imaginary')+' part of the complex contribution per radian. Each angle step times its signed height contributes to that component of the partial integral.';
    }
  }
  function stopWave() {
    cancelAnimationFrame(frame); frame=0; previous=null;
    $('wave-play').setAttribute('aria-pressed','false'); $('wave-play').textContent='Move wave crests';
  }
  function animate(now) {
    if (previous === null) previous=now;
    if (now-previous >= 45) {
      accumulatedPhase=(accumulatedPhase+Math.min(now-previous,120)*.045)%360;
      $('phi').value=Math.round(accumulatedPhase); previous=now; render();
    }
    frame=requestAnimationFrame(animate);
  }
  for (const id of ['ridge','component','wave-mode','phi','yaw']) $(id).addEventListener('input',()=>{
    if(id==='ridge'||id==='phi') stopWave();
    render();
  });
  $('wave-play').addEventListener('click',()=>{
    if(frame) {stopWave();return;}
    accumulatedPhase=+$('phi').value;
    $('wave-play').textContent='Pause crests'; $('wave-play').setAttribute('aria-pressed','true');
    frame=requestAnimationFrame(animate);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopWave();});
  window.BoundaryRibbon={geometry, render};
})();
