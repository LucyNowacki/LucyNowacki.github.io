/* Interactive illustrations for the ellipse-growth lesson.
 * Public API: EllipseGrowthPlots.{termColor,map,vectors,hardy}.
 * Renderers accept (svgElement, EllipseGrowthMath.packet(...), state), where
 * state is {n,r,t,j,zoom,orthonormal}; t is radians and defaults to packet.theta.
 * They never change mathematical state. Curves are sampled illustrations;
 * the Hardy mean is taken from the exact finite coefficient-sum identity.
 */
(() => {
  'use strict';
  const PALETTE = ['#6BE5FA', '#7EF4C2', '#BA94FF', '#EB47BC', '#ff8fba',
    '#8db6ff', '#f3d46e', '#72e1bc', '#eea1f0', '#ffb7a1', '#c5d68c',
    '#9edee8', '#bfb6ff'];
  const C = { text: '#ece4f5', muted: '#c2afd2', grid: '#574164',
    sum: '#EDC16D', length: '#bce883', ceiling: '#d6abff', gold: '#ffd66c' };
  const NS = 'http://www.w3.org/2000/svg';
  let serial = 0;
  const ids = new WeakMap();
  const termColor = j => PALETTE[((Math.trunc(j) % PALETTE.length) + PALETTE.length) % PALETTE.length];
  const fmt = x => Math.abs(x) < 1e-12 ? '0' : Number(x.toPrecision(4)).toString();
  const escape = x => String(x).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const line = (x, y, xx, yy, attrs = '') => `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" ${attrs}/>`;
  const dot = (x, y, radius, fill, attrs = '') => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" ${attrs}/>`;
  const text = (x, y, value, attrs = '') => `<text x="${x}" y="${y}" fill="${C.muted}" font-family="system-ui,sans-serif" font-size="12" ${attrs}>${escape(value)}</text>`;
  const path = (points, X, Y) => points.map((p, i) => `${i ? 'L' : 'M'}${X(p.re).toFixed(3)},${Y(p.im).toFixed(3)}`).join(' ');
  const theta = (packet, state) => Number.isFinite(state.t) ? state.t : packet.theta;

  function frame(svg, type, packet, state, title, description, maxHeight = 390) {
    const width = Math.max(180, Math.round(svg.getBoundingClientRect().width || svg.parentElement?.getBoundingClientRect().width || 500));
    const height = Math.max(300, Math.min(maxHeight, Math.round(width * .78)));
    let id = ids.get(svg);
    if (!id) { id = `ellipse-growth-${++serial}`; ids.set(svg, id); }
    svg.setAttribute('xmlns', NS);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', `${id}-title ${id}-description`);
    Object.assign(svg.dataset, { renderer: type, degree: String(state.n), radius: String(state.r),
      termIndex: String(state.j), angle: String(theta(packet, state)) });
    return { id, width, height,
      draw(body) { svg.innerHTML = `<title id="${id}-title">${escape(title)}</title><desc id="${id}-description">${escape(description)}</desc>${body}`; }
    };
  }

  function plane(F, radius, zoom = 1) {
    const top = 32, bottom = F.height - 49, left = 47, right = F.width - 28;
    const cx = (left + right) / 2, cy = (top + bottom) / 2;
    const scale = Math.max(10, Math.min(right - left, bottom - top)) / (2 * radius) * zoom;
    const X = x => cx + scale * x, Y = y => cy - scale * y;
    const range = radius / zoom;
    const tick = range / 2;
    let axes = line(left, cy, right, cy, `stroke="${C.muted}" stroke-opacity=".7"`)
      + line(cx, top, cx, bottom, `stroke="${C.muted}" stroke-opacity=".7"`);
    for (const v of [-tick, tick]) {
      axes += line(X(v), top, X(v), bottom, `stroke="${C.grid}" stroke-opacity=".6"`);
      axes += line(left, Y(v), right, Y(v), `stroke="${C.grid}" stroke-opacity=".6"`);
      axes += text(X(v), cy + 18, fmt(v), 'text-anchor="middle"');
      axes += text(cx - 7, Y(v) - 6, fmt(v), 'text-anchor="end"');
    }
    axes += text(cx - 7, cy + 18, '0', 'text-anchor="end"');
    axes += text(right, cy - 9, 'Re', 'text-anchor="end"') + text(cx + 8, top + 4, 'Im');
    const clip = `${F.id}-clip`;
    const defs = `<defs><clipPath id="${clip}"><rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}"/></clipPath></defs>`;
    return { X, Y, cx, cy, scale, axes, defs, clip, top, bottom, left, right };
  }

  function arrow(x, y, xx, yy, colour, width = 2.5, attrs = '') {
    const dx = xx - x, dy = yy - y, length = Math.hypot(dx, dy);
    if (length < .02) return dot(xx, yy, width, colour, attrs);
    const ux = dx / length, uy = dy / length, head = Math.min(10, length * .36);
    const hx = xx - head * ux, hy = yy - head * uy;
    return `<g ${attrs}>${line(x,y,xx,yy,`stroke="${colour}" stroke-width="${width}" stroke-linecap="round"`)}<path d="M${xx},${yy} L${hx - head*.43*uy},${hy + head*.43*ux} L${hx + head*.43*uy},${hy - head*.43*ux} Z" fill="${colour}"/></g>`;
  }

  function map(svg, packet, state) {
    const a = packet.semiaxes.a, b = packet.semiaxes.b, g = packet.gamma;
    const F = frame(svg, 'map', packet, state, 'Input point on the Joukowski ellipse',
      `The angle theta selects Gamma rho(theta) on the input ellipse with semiaxes ${fmt(a)} and ${fmt(b)}. Its real and imaginary coordinates are ${fmt(g.re)} and ${fmt(g.im)}. Equal real and imaginary scales are used.`);
    const P = plane(F, Math.max(a, 1) * 1.22);
    let body = P.defs + P.axes;
    body += `<g clip-path="url(#${P.clip})">`;
    if (b < 1e-12) body += line(P.X(-a),P.cy,P.X(a),P.cy,`data-role="input-ellipse" stroke="${C.ceiling}" stroke-width="3"`);
    else body += `<ellipse data-role="input-ellipse" cx="${P.cx}" cy="${P.cy}" rx="${a*P.scale}" ry="${b*P.scale}" fill="none" stroke="${C.ceiling}" stroke-width="2.5"/>`;
    body += line(P.X(g.re),P.cy,P.X(g.re),P.Y(g.im),`stroke="${C.gold}" stroke-dasharray="4 4" stroke-opacity=".6"`);
    body += line(P.cx,P.Y(g.im),P.X(g.re),P.Y(g.im),`stroke="${C.gold}" stroke-dasharray="4 4" stroke-opacity=".6"`);
    for (const f of [-1,1]) body += dot(P.X(f),P.cy,3,C.muted,`data-role="focus" data-real="${f}"`);
    body += dot(P.X(g.re),P.Y(g.im),6,C.gold,'data-role="input-point" stroke="#261731" stroke-width="2"');
    body += '</g>' + text(F.width/2,17,'Input ellipse (ω-plane)','text-anchor="middle"');
    body += text(F.width/2,F.height-25,`Γ = ${fmt(g.re)} ${g.im < 0 ? '−' : '+'} ${fmt(Math.abs(g.im))}i`,'text-anchor="middle"');
    body += text(F.width/2,F.height-7,b < 1e-12 ? 'ρ = 1: the interval [−1, 1]' : 'Foci: ±1 · equal Re/Im scale','text-anchor="middle" font-size="11"');
    F.draw(body);
    Object.assign(svg.dataset,{scaleX:String(P.scale),scaleY:String(P.scale),inputReal:String(g.re),inputImaginary:String(g.im),semiaxisA:String(a),semiaxisB:String(b)});
    return {width:F.width,height:F.height,scale:P.scale};
  }

  function vectors(svg, packet, state) {
    const zoom = Math.max(1,Math.min(5,Number(state.zoom)||1));
    const selected = Math.max(0,Math.min(packet.terms.length-1,Math.trunc(state.j)||0));
    const F = frame(svg,'vectors',packet,state,'Legendre terms as coloured arrows added head to tail',
      `${packet.terms.length} arrows sum to the polynomial value. Term ${selected} is highlighted. The gold resultant has length ${fmt(packet.magnitude)}, the green circle has radius S ${fmt(packet.S)}, and the purple ceiling has radius B ${fmt(packet.B)}. Zoom ${zoom} uses equal real and imaginary scales. Parts outside the frame are clipped.` ,420);
    // Fitting to the sum of lengths keeps the actual packet legible even when
    // the coarser bound B is much larger. Zoom changes the view, never values.
    const radius = Math.max(packet.S,Number.MIN_VALUE)*1.15;
    const P = plane(F,radius,zoom);
    let body = P.defs + P.axes + `<g clip-path="url(#${P.clip})">`;
    body += `<circle data-role="coarse-circle" cx="${P.cx}" cy="${P.cy}" r="${packet.B*P.scale}" fill="none" stroke="${C.ceiling}" stroke-width="1.5" stroke-dasharray="2 6" opacity=".8"/>`;
    body += `<circle data-role="length-circle" cx="${P.cx}" cy="${P.cy}" r="${packet.S*P.scale}" fill="none" stroke="${C.length}" stroke-width="1.6" stroke-dasharray="6 5" opacity=".85"/>`;
    body += arrow(P.cx,P.cy,P.X(packet.sum.re),P.Y(packet.sum.im),C.sum,1.8,'data-role="resultant" opacity=".9"');
    const starts = []; let re=0,im=0;
    for(const term of packet.terms){
      starts.push({re,im}); const next={re:re+term.re,im:im+term.im};
      body += arrow(P.X(re),P.Y(im),P.X(next.re),P.Y(next.im),termColor(term.j),term.j===selected?4.5:2.8,
        `data-role="term-vector" data-j="${term.j}" data-real="${term.re}" data-imaginary="${term.im}" data-length="${term.length}"`);
      re=next.re;im=next.im;
    }
    body += dot(P.cx,P.cy,3,C.sum,'data-role="sum-start"');
    body += dot(P.X(packet.sum.re),P.Y(packet.sum.im),5.5,C.sum,'data-role="sum-endpoint" stroke="#261731" stroke-width="2"');
    const term=packet.terms[selected], start=starts[selected];
    body += dot(P.X(start.re+term.re),P.Y(start.im+term.im),8,'none',`data-role="selected-head" stroke="${termColor(selected)}" stroke-width="2"`);
    body += text(P.X(start.re+term.re*.5)+7,P.Y(start.im+term.im*.5)-8,`j=${selected}`,`style="fill:${termColor(selected)};paint-order:stroke;stroke:#24152e;stroke-width:3px" font-weight="700"`);
    body += '</g>';
    body += text(F.width/2,17,'Arrows → the Legendre value','text-anchor="middle"');
    body += text(F.width/2,F.height-25,`|sum| = ${fmt(packet.magnitude)} · S = ${fmt(packet.S)}`,'text-anchor="middle"');
    const boundOutside = packet.B > radius/zoom;
    const lengthsOutside = packet.S > radius/zoom;
    const note = lengthsOutside ? `Zoom ${fmt(zoom)}×: circles extend outside` : boundOutside ? `B = ${fmt(packet.B)}: circle extends outside` : `Purple ceiling B = ${fmt(packet.B)}`;
    body += text(F.width/2,F.height-7,note,'text-anchor="middle" font-size="11"');
    F.draw(body);
    Object.assign(svg.dataset,{scaleX:String(P.scale),scaleY:String(P.scale),zoom:String(zoom),sumReal:String(packet.sum.re),sumImaginary:String(packet.sum.im),magnitude:String(packet.magnitude),lengthSum:String(packet.S),ceiling:String(packet.B),ceilingClipped:String(boundOutside)});
    return {width:F.width,height:F.height,scale:P.scale,ceilingClipped:boundOutside};
  }

  // Centre the selected displacement independently of its position in the chain.
  // Use the same pixels per unit in x and y, including for almost vanishing terms.
  function detail(svg, packet, state, chainScale) {
    const v = packet.terms[state.j], colour = termColor(v.j);
    const width = Math.max(160, svg.clientWidth), height = 124;
    const size = Math.min(width - 42, height - 28);
    const scale = size / v.length;
    const dx = v.re * scale / 2, dy = v.im * scale / 2;
    const cx = width / 2, cy = height / 2;
    const x0 = cx - dx, y0 = cy + dy, x1 = cx + dx, y1 = cy - dy;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('aria-label', `Arrow j = ${v.j}. Hollow tail to pointed tip at ${fmt(v.phase * 180 / Math.PI)} degrees, length ${fmt(v.length)}.`);
    svg.innerHTML = line(10, y0, width - 10, y0, `stroke="${C.grid}" stroke-dasharray="3 5"`)
      + line(x0, 6, x0, height - 6, `stroke="${C.grid}" stroke-dasharray="3 5"`)
      + arrow(x0, y0, x1, y1, colour, 4)
      + dot(x0, y0, 4.5, '#24152e', `stroke="${colour}" stroke-width="2"`);
    return scale / chainScale;
  }

  function hardy(svg, packet, state) {
    const model=window.EllipseGrowthMath;
    const F=frame(svg,'hardy',packet,state,'Squared boundary magnitude and its angular mean',
      `The sampled curve is the squared modulus of the degree ${state.n} Legendre mode around the ellipse. The dashed green line is the angular mean ${fmt(packet.h2Squared)}, computed by summing squared Fourier coefficient lengths. The gold cursor shows the current angle.`,360);
    const left=60,right=F.width-20,top=38,bottom=F.height-45;
    const ymax=Math.max(packet.S*packet.S,packet.h2Squared,1e-300)*1.16;
    const X=t=>left+t/(2*Math.PI)*(right-left),Y=v=>bottom-v/ymax*(bottom-top);
    const samples=Math.max(256,state.n*48),points=[];
    for(let i=0;i<=samples;i++){
      const t=2*Math.PI*i/samples;
      const p=model.packet(state.n,state.r,t,Boolean(state.orthonormal));
      points.push({re:t,im:p.magnitude*p.magnitude});
    }
    let body='';
    for(const value of [0,ymax/2,ymax]){
      body+=line(left,Y(value),right,Y(value),`stroke="${C.grid}" stroke-dasharray="3 4"`);
      body+=text(left-7,Y(value)+4,fmt(value),'text-anchor="end"');
    }
    body+=line(left,top,left,bottom,`stroke="${C.muted}"`)+line(left,bottom,right,bottom,`stroke="${C.muted}"`);
    for(const [t,label] of [[0,'0'],[Math.PI/2,'π/2'],[Math.PI,'π'],[3*Math.PI/2,'3π/2'],[2*Math.PI,'2π']]) body+=text(X(t),bottom+20,label,'text-anchor="middle"');
    body+=`<path data-role="squared-magnitude-area" d="${path([{re:0,im:0},...points,{re:2*Math.PI,im:0}],X,Y)} Z" fill="${C.ceiling}" fill-opacity=".08"/>`;
    body+=`<path data-role="squared-magnitude-curve" d="${path(points,X,Y)}" fill="none" stroke="${C.ceiling}" stroke-width="2.5"/>`;
    body+=line(left,Y(packet.h2Squared),right,Y(packet.h2Squared),`data-role="hardy-mean" stroke="${C.length}" stroke-width="2" stroke-dasharray="6 4"`);
    const cursor=((theta(packet,state)%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
    body+=line(X(cursor),top,X(cursor),bottom,`data-role="angle-cursor" stroke="${C.gold}" stroke-opacity=".65" stroke-dasharray="3 4"`);
    body+=dot(X(cursor),Y(packet.magnitude*packet.magnitude),5,C.gold,'data-role="current-energy" stroke="#261731" stroke-width="1.5"');
    body+=text(F.width/2,17,'Squared magnitude (sampled)','text-anchor="middle"');
    body+=text(right,31,`Mean = ${fmt(packet.h2Squared)}`,`text-anchor="end" style="fill:${C.length}"`);
    body+=text(right,F.height-6,'Angle θ', 'text-anchor="end"');
    F.draw(body);
    Object.assign(svg.dataset,{samples:String(samples+1),angularMean:String(packet.h2Squared),currentEnergy:String(packet.magnitude*packet.magnitude),xMin:'0',xMax:String(2*Math.PI),yMin:'0',yMax:String(ymax)});
    return {width:F.width,height:F.height,samples:samples+1,angularMean:packet.h2Squared};
  }

  window.EllipseGrowthPlots=Object.freeze({termColor,map,vectors,detail,hardy});
})();
