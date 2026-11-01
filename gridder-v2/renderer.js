/* Phaser board adapter. Mathematical targets are supplied by the independent
 * domain model; sampled line segments below are only their visible drawing. */
(function (root) {
  'use strict';
  const numericColour = colour => Number.parseInt(colour.replace('#', ''), 16);
  const targetColours = { derivative: 0xbc94ff, second: 0x76df00, inverse: 0x65d2d1, normal: 0xffa257 };
  const pointColours = { min: 0xff707f, max: 0x72d6a3, inflection: 0xfacc15 };
  const hotColour=colour=>{let result=0;for(const shift of [16,8,0])result|=Math.round((colour>>shift&255)*.25+255*.75)<<shift;return result;};
  const pointLabels = { min: 'minimum', max: 'maximum', inflection: 'inflection point' };

  // Liang–Barsky clipping prevents very steep normals from sending enormous
  // coordinates to the GPU. It doesn't classify mathematical target cells.
  function clipSegment(x0, y0, x1, y1, box) {
    if (![x0, y0, x1, y1].every(Number.isFinite)) return null;
    const dx = x1 - x0, dy = y1 - y0;
    let a = 0, z = 1;
    const p = [-dx, dx, -dy, dy], q = [x0 - box.l, box.l + box.pw - x0, y0 - box.t, box.t + box.ph - y0];
    for (let k = 0; k < 4; k++) {
      if (Math.abs(p[k]) < 1e-14) { if (q[k] < 0) return null; }
      else {
        const r = q[k] / p[k];
        if (p[k] < 0) a = Math.max(a, r); else z = Math.min(z, r);
        if (a > z) return null;
      }
    }
    return [x0 + a * dx, y0 + a * dy, x0 + z * dx, y0 + z * dy];
  }
  function line(g, x0, y0, x1, y1) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokePath(); }
  function dashed(g, x0, y0, x1, y1, dash = 6, gap = 4) {
    const length = Math.hypot(x1 - x0, y1 - y0);
    if (!length) return;
    for (let p = 0; p < length; p += dash + gap) {
      const a = p / length, z = Math.min(length, p + dash) / length;
      line(g, x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * z, y0 + (y1 - y0) * z);
    }
  }
  function create(scene) {
    const frame = scene.add.graphics().setDepth(-2);
    const background = scene.add.graphics().setDepth(-1);
    const fills = scene.add.graphics().setDepth(0);
    const feedback = scene.add.graphics().setDepth(.5);
    const grid = scene.add.graphics().setDepth(1);
    const hints = scene.add.graphics().setDepth(2);
    const original = scene.add.graphics().setDepth(3);
    const guides = scene.add.graphics().setDepth(4);
    const discovered = scene.add.graphics().setDepth(5);
    const travelling = scene.add.graphics().setDepth(5.5);
    const pointWaves = scene.add.graphics().setDepth(8.5);
    const painted = scene.add.graphics().setDepth(6);
    const nodes = scene.add.graphics().setDepth(7);
    const points = scene.add.graphics().setDepth(8);
    const discoveryArea = scene.make.graphics({ add: false });
    const revealMask = root.GridderRenderCapabilities.revealMask(scene, discovered, discoveryArea);
    const travellingMask=root.GridderRenderCapabilities.revealMask(scene,travelling,discoveryArea);
    const actors = root.GridderActors.create(scene);
    const liquid=root.GridderLiquidGaps?.create(scene);
    const leeches=root.GridderLeechActors?.create(scene);
    let labels = [], pointTexts = [], boardKey = '', targetKey = '', fillKey = '', hintKey = '', pointKey = '', routeKey = null, geometry;
    const counters = { renders: 0, boardRebuilds: 0, targetRebuilds: 0, routeRebuilds: 0 };
    let theme=root.GridderTheme.current(),lastGame=null,wasFading=false;
    const captureTimes=new Map();
    let pulseGame=null,pulseLastTime=null,pathKey='',pathSegments=[],pathLength=0,pointLocations=[],motionDirty=true,motionVisible=false;
    let sampleBuilds=0,motionDraws=0,highlightPositions=[];
    const discoveryPulse={phaseMs:0,alpha:1,running:false,hasDiscovered:false,curveVisible:false,pointCount:0,updates:0};
    function applyDiscoveryAlpha(alpha){discoveryPulse.alpha=alpha;discovered.setAlpha(alpha);points.setAlpha(alpha);}
    // Cache clipped curve segments once per target geometry; reveal-only changes
    // reuse samples. Animation never evaluates the mathematical function.
    function cacheDiscoveryPath(s){
      const q=s.levelGraph,key=boardKey+JSON.stringify([q?.kind,q?.vertical,q?.a,q?.domain]);
      if(pathKey===key)return;pathKey=key;pathSegments=[];pathLength=0;sampleBuilds++;
      if(!q)return;const g=geometry,b=s.game.board;
      let run=0,previous=null;
      const add=(a,z)=>{const c=clipSegment(...a,...z,g);if(!c)return;const length=Math.hypot(c[2]-c[0],c[3]-c[1]);if(length>1e-8){const prior=pathSegments[pathSegments.length-1];if(prior&&Math.hypot(prior.c[2]-c[0],prior.c[3]-c[1])>1e-5)run++;pathSegments.push({c,start:pathLength,end:pathLength+length,run});pathLength+=length;}};
      if(q.vertical)add([g.sx(q.a),g.t],[g.sx(q.a),g.t+g.ph]);
      else{
        const lo=Math.max(b.xmin,q.domain[0]),hi=Math.min(b.xmax,q.domain[1]);
        for(let k=0;k<=700&&hi>=lo;k++){
          const x=lo+(hi-lo)*k/700,y=q.value(x);
          if(!Number.isFinite(y)){previous=null;run++;continue;}
          const point=[g.sx(x),g.sy(y)];if(previous)add(previous,point);previous=point;
        }
      }
    }
    function pathPoint(distance){
      if(distance<0||distance>pathLength||!pathSegments.length)return null;
      let lo=0,hi=pathSegments.length-1;
      while(lo<hi){const mid=(lo+hi)>>1;if(pathSegments[mid].end<distance)lo=mid+1;else hi=mid;}
      const p=pathSegments[lo],t=(distance-p.start)/(p.end-p.start);
      return {x:p.c[0]+(p.c[2]-p.c[0])*t,y:p.c[1]+(p.c[3]-p.c[1])*t,run:p.run};
    }
    function drawDiscoveryMotion(){
      travelling.clear();pointWaves.clear();highlightPositions=[];motionDraws++;motionDirty=false;motionVisible=false;
      if(!discoveryPulse.hasDiscovered||root.GridderTheme.current().id!=='neon'||root.GridderTheme.reducedMotion())return;
      motionVisible=true;
      const phase=discoveryPulse.phaseMs/1800,colour=targetColours[discoveryPulse.kind]??0xffffff;
      const spacing=Math.max(80,pathLength/96),offset=(phase*2%1)*spacing;
      for(let distance=offset;distance<=pathLength;distance+=spacing){
        const head=pathPoint(distance);if(!head)continue;highlightPositions.push({x:head.x,y:head.y});
        let previous=null;
        for(let n=5;n>=0;n--){
          const point=pathPoint(distance-n*4);if(!point){previous=null;continue;}
          if(previous&&point.run===previous.run){
            for(const [width,alpha] of [[16,.14],[8,.45],[3,1]]){travelling.lineStyle(width,width===3?hotColour(colour):colour,alpha*(1-n/6));line(travelling,previous.x,previous.y,point.x,point.y);}
          }
          previous=point;
        }
        travelling.fillStyle(colour,.22).fillCircle(head.x,head.y,9);
        travelling.fillStyle(hotColour(colour),1).fillCircle(head.x,head.y,3.2);
        travelling.fillStyle(0xffffff,1).fillCircle(head.x,head.y,1.4);
      }
      for(const p of pointLocations)for(const offset of [0,.5]){
        const age=(phase+offset)%1,radius=7+age*18,alpha=(1-age)*.85;
        pointWaves.lineStyle(6,p.colour,alpha*.16).strokeCircle(p.x,p.y,radius);
        pointWaves.lineStyle(1.8,hotColour(p.colour),alpha).strokeCircle(p.x,p.y,radius);
      }
    }
    // Call after normal rendering each Phaser frame. Only small cached-path
    // overlays are redrawn; actors and fixed mathematical geometry stay cached.
    function animateDiscoveries(time,snapshot){
      if(!Number.isFinite(time)||!snapshot)return;
      const staticGlow=root.GridderTheme.current().id!=='neon'||root.GridderTheme.reducedMotion();
      const visible=typeof document==='undefined'||!document.hidden;
      const running=!!(snapshot.active&&visible&&(snapshot.playing||snapshot.game?.complete())&&discoveryPulse.hasDiscovered&&!staticGlow);
      let advanced=false;
      if(running&&discoveryPulse.running&&pulseLastTime!==null&&time>=pulseLastTime){
        advanced=time!==pulseLastTime;discoveryPulse.phaseMs=(discoveryPulse.phaseMs+time-pulseLastTime)%1800;
      }
      pulseLastTime=time;discoveryPulse.running=running;discoveryPulse.updates++;
      if(staticGlow||!discoveryPulse.hasDiscovered){applyDiscoveryAlpha(1);if(motionVisible||motionDirty){travelling.clear();pointWaves.clear();highlightPositions=[];motionDirty=false;motionVisible=false;}}
      else{
        if(running)applyDiscoveryAlpha(.5+.5*(.5+.5*Math.cos(discoveryPulse.phaseMs*Math.PI*2/1800)));
        if(advanced||motionDirty)drawDiscoveryMotion();
      }
    }
    function text(x, y, value, originX = .5, originY = .5, extra = {}) {
      return scene.add.text(x, y, value, { fontFamily: 'system-ui, sans-serif', fontSize: theme.ticks+'px', color: theme.ink, ...extra })
        .setOrigin(originX, originY).setDepth(9);
    }
    function geometryFor(s) {
      const b = s.game.board;
      // Use the exact same CSS-pixel layout as contact and movement. Backing
      // canvas dimensions can be rounded independently on fractional layouts.
      const g = { ...(s.layout || s.G.layout(b, scene.scale.width, scene.scale.height)) };
      scene.cameras.main.setOrigin(0, 0).setZoom(scene.scale.width / g.w, scene.scale.height / g.h);
      return Object.assign(g, {
        px: i => g.l + i * g.pw / b.nx, py: j => g.t + g.ph - j * g.ph / b.ny,
        sx: x => g.l + (x - b.xmin) / (b.xmax - b.xmin) * g.pw,
        sy: y => g.t + g.ph - (y - b.ymin) / (b.ymax - b.ymin) * g.ph
      });
    }
    function cell(g, key, ctx) {
      const [i, j] = key.split(',').map(Number);
      ctx.fillRect(g.px(i), g.py(j + 1), g.cellWidth, g.cellHeight);
    }
    function trace(ctx, value, domain, s, colour, width, isDashed = false, rainbow = false, alpha = 1) {
      const b = s.game.board, g = geometry;
      const lo = Math.max(b.xmin, domain[0]), hi = Math.min(b.xmax, domain[1]);
      if (lo > hi) return;
      const count = rainbow ? 240 : 700;
      let previous = null, distance = 0, end = null;
      // Canvas retains independent segments: its long-path rasterization can
      // change plot-edge pixels when a later masked target is drawn.
      const continuous=theme.id==='neon'&&scene.game.renderer.type===Phaser.WEBGL&&!isDashed&&!rainbow;
      ctx.lineStyle(width, colour, alpha);
      if(continuous)ctx.beginPath();
      for (let k = 0; k <= count; k++) {
        const x = k === count ? hi : lo + (hi - lo) * k / count, y = value(x);
        if (!Number.isFinite(y)) { previous = null; end = null; continue; }
        const current = [g.sx(x), g.sy(y)];
        if (previous) {
          const clipped = clipSegment(...previous, ...current, g);
          if (clipped) {
            if (rainbow) ctx.lineStyle(width, numericColour(s.P.colours[Math.min(255, Math.round((k - 1) / (count - 1) * 255))]), 1);
            if(continuous){
              const [x0,y0,x1,y1]=clipped;
              if(!end||Math.abs(end[0]-x0)>1e-7||Math.abs(end[1]-y0)>1e-7)ctx.moveTo(x0,y0);
              ctx.lineTo(x1,y1);end=[x1,y1];
            }
            else if (!isDashed) line(ctx, ...clipped);
            else {
              // A continuous dash phase across the sampled curve.
              const [x0, y0, x1, y1] = clipped, length = Math.hypot(x1 - x0, y1 - y0);
              let offset = 0;
              while (offset < length - 1e-9) {
                const phase = distance % 10, part = Math.min(length - offset, phase < 6 ? 6 - phase : 10 - phase);
                if (phase < 6 && length) line(ctx, x0 + (x1 - x0) * offset / length, y0 + (y1 - y0) * offset / length,
                  x0 + (x1 - x0) * (offset + part) / length, y0 + (y1 - y0) * (offset + part) / length);
                offset += part; distance += part;
              }
            }
          }
        }
        previous = current;
      }
      if(continuous)ctx.strokePath();
    }
    function rebuildBoard(s) {
      counters.boardRebuilds++;
      const b = s.game.board, g = geometry, c = s.M.curves[s.key];
      const holes=s.gaps?.pools||[];
      // Remove strokes, not cover them: the function and shoreline roads remain.
      function latticeLine(ctx,x0,y0,x1,y1){
        const horizontal=Math.abs(y1-y0)<1e-8;
        const fixed=horizontal?y0:x0,from=horizontal?Math.min(x0,x1):Math.min(y0,y1),to=horizontal?Math.max(x0,x1):Math.max(y0,y1);
        let spans=[[from,to]];
        const coordinate=horizontal?(g.t+g.ph-fixed)/g.cellHeight:(fixed-g.l)/g.cellWidth;
        const cuts=[];
        if(Math.abs(coordinate-Math.round(coordinate))<1e-7){
          for(const edge of s.gaps?.blockedEdges||[]){
            const [axis,ii,jj]=edge.split(':'),i=Number(ii),j=Number(jj);
            if(horizontal&&axis==='h'&&j===Math.round(coordinate))cuts.push([g.px(i),g.px(i+1)]);
            if(!horizontal&&axis==='v'&&i===Math.round(coordinate))cuts.push([g.py(j+1),g.py(j)]);
          }
        }else for(const p of holes){
          const cells=p.cells||Array.from({length:p.w*p.h},(_,n)=>({i:p.i+n%p.w,j:p.j+Math.floor(n/p.w)}));
          for(const c of cells){
            const left=g.px(c.i),right=g.px(c.i+1),top=g.py(c.j+1),bottom=g.py(c.j);
            if(horizontal?fixed>top&&fixed<bottom:fixed>left&&fixed<right)cuts.push(horizontal?[left,right]:[top,bottom]);
          }
        }
        for(const [a,z] of cuts){const next=[];
          for(const [lo,hi] of spans){if(z<=lo||a>=hi)next.push([lo,hi]);else{if(a>lo)next.push([lo,a]);if(z<hi)next.push([z,hi]);}}spans=next;
        }
        for(const [a,z] of spans)if(z>a)horizontal?line(ctx,a,fixed,z,fixed):line(ctx,fixed,a,fixed,z);
      }
      labels.forEach(label => label.destroy()); labels = [];
      grid.clear(); original.clear(); guides.clear(); nodes.clear(); fills.clear(); feedback.clear();
      frame.clear();
      background.clear().fillStyle(theme.surface, 1).fillRect(g.l, g.t, g.pw, g.ph);
      if(theme.id==='neon'){
        // Coloured under-strokes use the existing lattice coordinates. The
        // narrow core stays crisp; no canvas-wide blur or extra geometry.
        for(const [width,alpha] of [[8,.035],[5,.07],[3,.14]]){
          grid.lineStyle(width,theme.gridGlow,alpha);
          for(let i=1;i<b.nx;i++)latticeLine(grid,g.px(i),g.t,g.px(i),g.t+g.ph);
          for(let j=1;j<b.ny;j++)latticeLine(grid,g.l,g.py(j),g.l+g.pw,g.py(j));
        }
      }
      grid.lineStyle(theme.id==='neon'?1.1:1, theme.grid, theme.gridAlpha);
      for (let i = 0; i <= b.nx; i++) {
        latticeLine(grid, g.px(i), g.t, g.px(i), g.t + g.ph);
        const every = g.w < 500 ? 4 : g.w < 750 ? 2 : 1;
        if (i % every === 0 || i === b.nx) labels.push(text(g.px(i), g.t + g.ph + 18, s.M.format(b.xmin + i * b.dx)));
      }
      for (let j = 0; j <= b.ny; j++) {
        latticeLine(grid, g.l, g.py(j), g.l + g.pw, g.py(j));
        if (j % Math.max(1, Math.ceil(b.ny / (g.ph / 32))) === 0 || j === b.ny)
          labels.push(text(g.l - 9, g.py(j), s.M.format(b.ymin + j * b.dy), 1));
      }
      if(theme.id==='neon'){
        for(const [width,alpha] of [[12,.04],[7,.1],[4,.23]]){
          grid.lineStyle(width,theme.accent,alpha);
          if(b.xmin<=0&&b.xmax>=0)latticeLine(grid,g.sx(0),g.t,g.sx(0),g.t+g.ph);
          if(b.ymin<=0&&b.ymax>=0)latticeLine(grid,g.l,g.sy(0),g.l+g.pw,g.sy(0));
        }
      }
      grid.lineStyle(1.3, theme.axis, 1);
      if (b.xmin <= 0 && b.xmax >= 0) latticeLine(grid, g.sx(0), g.t, g.sx(0), g.t + g.ph);
      if (b.ymin <= 0 && b.ymax >= 0) latticeLine(grid, g.l, g.sy(0), g.l + g.pw, g.sy(0));
      const domain = s.levelGraph?.originalDomain || c.domain || (s.key === 'log' ? [.5, 4.5] : c.range.slice(0, 2));
      if(theme.id==='neon'){
        for(const [width,alpha] of [[38,.025],[30,.04],[23,.06],[17,.1],[11,.19],[7,.4]])
          trace(original,c.value,domain,s,theme.curveGlow,width,false,false,alpha);
        trace(original,c.value,domain,s,theme.curveCore,4.5);
        trace(original,c.value,domain,s,theme.curveRim,1.4);
      }else{
        trace(original,c.value,domain,s,0xb9a4ce,5);
        trace(original,c.value,domain,s,0x41414b,3.5,false,true);
      }
      guides.lineStyle(1.5, 0xc0adc9, 1);
      if (s.levelGraph?.kind === 'inverse') {
        const segment = clipSegment(g.sx(b.xmin), g.sy(b.xmin), g.sx(b.xmax), g.sy(b.xmax), g);
        if (segment) dashed(guides, ...segment, 3, 5);
      }
      if (s.levelGraph?.kind === 'normal') {
        const n = s.levelGraph;
        const segment = clipSegment(g.sx(b.xmin), g.sy(n.y + n.tangent * (b.xmin - n.a)),
          g.sx(b.xmax), g.sy(n.y + n.tangent * (b.xmax - n.a)), g);
        if (segment) dashed(guides, ...segment, 3, 5);
        guides.fillStyle(0x221331).fillCircle(g.sx(n.a), g.sy(n.y), 6);
        guides.lineStyle(2, 0xffffff).strokeCircle(g.sx(n.a), g.sy(n.y), 6);
        labels.push(text(g.sx(n.a) + 10, g.sy(n.y) - 12, 'A', 0, .5, { fontStyle: 'bold' }));
      }
      // Keep the plot border; node slow zones are model-only, without markers.
      nodes.lineStyle(1.2, theme.nodeStroke, .8).strokeRect(g.l, g.t, g.pw, g.ph);
      labels.push(text(g.l + g.pw / 2, g.t + g.ph + 39, 'x', .5, .5, { fontStyle: 'italic' }));
      labels.push(text(g.l - 36, g.t + g.ph / 2, 'y', .5, .5, { fontStyle: 'italic' }));
      fillKey = targetKey = hintKey = pointKey = '';
      routeKey = null;
    }
    function render(s) {
      if (!s?.game || !s.active) return;
      counters.renders++;
      if(pulseGame!==s.game){pulseGame=s.game;pulseLastTime=null;discoveryPulse.phaseMs=0;discoveryPulse.running=false;discoveryPulse.pointCount=0;motionDirty=true;travelling.clear();pointWaves.clear();highlightPositions=[];applyDiscoveryAlpha(1);}
      root.GridderTheme.setFunction(s.key);
      theme=root.GridderTheme.current();
      geometry = geometryFor(s);
      const b = s.game.board, g = geometry;
      const nextBoard = JSON.stringify([s.key, s.level, s.levelGraph?.a, b, g.w, g.h,theme.id,theme.paletteKey,s.gaps?.id,s.gaps?.pools]);
      if (nextBoard !== boardKey) { boardKey = nextBoard; rebuildBoard(s); }
      liquid?.render(s,g);
      const nextFill = [...s.game.filled].join('|');
      if(lastGame!==s.game){lastGame=s.game;captureTimes.clear();wasFading=false;}
      for(const key of s.game.filled)if(!captureTimes.has(key))captureTimes.set(key,s.chaseTime);
      if(s.playing&&!s.needsTick)for(const [key,time] of captureTimes)
        captureTimes.set(key,Math.min(time,s.chaseTime-220));
      // Idle practice has no future ticks: settle immediately. A paused active
      // effect retains its chaseTime phase and resumes with the shared clock.
      const effects=theme.id==='neon'&&!root.GridderTheme.reducedMotion()&&!s.game.complete()&&(s.needsTick||!s.playing);
      const fading=effects&&[...captureTimes.values()].some(t=>s.chaseTime-t<220);
      if (nextFill !== fillKey||fading||wasFading) {
        fillKey = nextFill; fills.clear();feedback.clear();
        for (const key of s.game.filled){
          const progress=effects?Math.max(0,Math.min(1,(s.chaseTime-captureTimes.get(key))/220)):1;
          fills.fillStyle(theme.fill,theme.fillAlpha*(.65+.35*progress));cell(g,key,fills);
          if(progress<1){
            const [i,j]=key.split(',').map(Number),x=g.px(i)+g.cellWidth*.5,y=g.py(j+1)+g.cellHeight*.5;
            // Deterministic, local and below the lattice. No gameplay randomness.
            feedback.fillStyle(theme.accent,(1-progress)*.45).fillCircle(x,y,1.5);
            feedback.lineStyle(1,theme.frame,(1-progress)*.3).strokeRect(g.px(i)+3,g.py(j+1)+3,g.cellWidth-6,g.cellHeight-6);
          }
        }
      }
      wasFading=fading;
      const nextHints = String(s.hints) + [...s.game.targets].join('|');
      if (nextHints !== hintKey) {
        hintKey = nextHints; hints.clear();
        if (s.hints) for (const key of s.game.targets) {
          const [i, j] = key.split(',').map(Number), x = g.px(i), y = g.py(j + 1);
          hints.fillStyle(0xec9bc6, .08).fillRect(x, y, g.cellWidth, g.cellHeight).lineStyle(1.5, 0xec9bc6, .9);
          dashed(hints, x, y, x + g.cellWidth, y, 4, 3); dashed(hints, x, y + g.cellHeight, x + g.cellWidth, y + g.cellHeight, 4, 3);
          dashed(hints, x, y, x, y + g.cellHeight, 4, 3); dashed(hints, x + g.cellWidth, y, x + g.cellWidth, y + g.cellHeight, 4, 3);
        }
      }
      const nextTarget = nextFill + String(s.game.complete()) + nextHints;
      if (nextTarget !== targetKey) {
        targetKey = nextTarget; counters.targetRebuilds++;
        discoveryArea.clear().fillStyle(0xffffff, 1);
        const clipComplete=theme.id==='neon'&&s.game.complete();
        // On completion reveal the whole plot, but keep the broader neon
        // halo contained at its edges. Partial play still reveals only cells.
        if(clipComplete)discoveryArea.fillRect(g.l,g.t,g.pw,g.ph);
        else for (const key of s.game.targets) if (s.game.filled.has(key)) cell(g, key, discoveryArea);
        discovered.clear();cacheDiscoveryPath(s);motionDirty=true;travelling.clear();highlightPositions=[];
        if (s.levelGraph) {
          const q = s.levelGraph;
          function drawTarget(width,alpha,colour=targetColours[q.kind],isDashed=true){
            discovered.lineStyle(width,colour,alpha);
            if(q.vertical){if(isDashed)dashed(discovered,g.sx(q.a),g.t,g.sx(q.a),g.t+g.ph,6,4);else line(discovered,g.sx(q.a),g.t,g.sx(q.a),g.t+g.ph);}
            else trace(discovered,q.value,q.domain,s,colour,width,isDashed,false,alpha);
          }
          // The entire target stroke, including its colour halo, shares the
          // existing reveal mask. Palette never reveals an undiscovered cell.
          if(theme.id==='neon'){
            for(const [width,alpha] of [[32,.045],[24,.075],[17,.14],[11,.25],[7,.45]])drawTarget(width,alpha,targetColours[q.kind],false);
            drawTarget(4.5,1);drawTarget(1.6,1,hotColour(targetColours[q.kind]));
          }else drawTarget(3.5,1);
        }
        revealMask.apply(s.game.complete()&&!clipComplete);travellingMask.apply(s.game.complete()&&!clipComplete);
      }
      // Speech, a centre pause, or settling legs can repaint the actors while
      // the route is unchanged. Compare its exact drawn content, including
      // partial intervals, before rebuilding all four neon stroke passes.
      let nextRoute='';
      for(const edge of s.game.edges)nextRoute+='e'+edge+';';
      for(const [edge,intervals] of s.walker.painted)if(!s.game.edges.has(edge)){
        nextRoute+='p'+edge+':';
        for(const [a,z] of intervals)nextRoute+=a+','+z+';';
      }
      if(nextRoute!==routeKey){
        routeKey=nextRoute;counters.routeRebuilds++;painted.clear();
        function edgeLine(edge, a = 0, z = 1) {
          const [axis, is, js] = edge.split(':'), i = Number(is), j = Number(js);
          line(painted, g.px(i + (axis === 'h' ? a : 0)), g.py(j + (axis === 'v' ? a : 0)),
            g.px(i + (axis === 'h' ? z : 0)), g.py(j + (axis === 'v' ? z : 0)));
        }
        function drawRoute(width,colour,alpha){
          painted.lineStyle(width,colour,alpha);
          for(const edge of s.game.edges)edgeLine(edge);
          for(const [edge,intervals] of s.walker.painted)if(!s.game.edges.has(edge))for(const [a,z] of intervals)edgeLine(edge,a,z);
        }
        if(theme.id==='neon'){drawRoute(18,theme.frame,.055);drawRoute(12,theme.frame,.12);drawRoute(7,theme.frame,.3);}
        drawRoute(4,theme.route,1);
      }
      const nextPoints = JSON.stringify(s.revealed);
      if (pointKey !== nextPoints) {
        pointKey = nextPoints; discoveryPulse.pointCount=0;pointLocations=[];motionDirty=true;pointWaves.clear();points.clear(); pointTexts.forEach(t => t.destroy()); pointTexts = [];
        const c = s.M.curves[s.key], domain = s.levelGraph?.originalDomain || c.domain || c.range.slice(0, 2);
        for (const p of s.revealed) if (p.x >= domain[0] && p.x <= domain[1]) {
          const x = g.sx(p.x), y = g.sy(c.value(p.x));
          discoveryPulse.pointCount++;pointLocations.push({x,y,colour:pointColours[p.kind]});
          if(theme.id==='neon'){
            for(const [radius,alpha] of [[22,.045],[17,.09],[13,.18],[10,.3]])points.fillStyle(pointColours[p.kind],alpha).fillCircle(x,y,radius);
            points.lineStyle(1.8,pointColours[p.kind],.9).strokeCircle(x,y,9);
          }
          points.fillStyle(pointColours[p.kind]).fillCircle(x, y, 6).lineStyle(1.5, 0xeee7f6).strokeCircle(x, y, 6);
          if(theme.id==='neon')points.fillStyle(hotColour(pointColours[p.kind]),1).fillCircle(x,y,2.5);
          pointTexts.push(text(x, y - 16, pointLabels[p.kind], .5, .5, { fontStyle: 'bold', backgroundColor: '#2b203fee', padding: { x: 3, y: 1 } }));
        }
      }
      discoveryPulse.kind=s.levelGraph?.kind??null;
      discoveryPulse.curveVisible=!!(s.levelGraph&&(s.game.complete()||[...s.game.targets].some(key=>s.game.filled.has(key))));
      discoveryPulse.hasDiscovered=discoveryPulse.curveVisible||discoveryPulse.pointCount>0;
      if(!discoveryPulse.hasDiscovered){discoveryPulse.phaseMs=0;discoveryPulse.running=false;pulseLastTime=null;travelling.clear();pointWaves.clear();highlightPositions=[];motionDirty=false;applyDiscoveryAlpha(1);}
      else if(theme.id!=='neon'||root.GridderTheme.reducedMotion())applyDiscoveryAlpha(1);
      actors.render(s, g);
      leeches?.render(s,g);
    }
    return {
      render, animateDiscoveries, animateLiquid:(time,snapshot)=>liquid?.animate(time,snapshot), geometry: () => geometry, animationState: () => actors.animationState(),
      metrics: () => ({ ...counters, leeches:leeches?.metrics()??null, liquid:liquid?.metrics()??null, discoveryPulse:{...discoveryPulse,sampleBuilds,motionDraws,pathLength,segmentCount:pathSegments.length,highlightPositions:highlightPositions.map(p=>({...p})),pointRingRadii:motionVisible&&pointLocations.length?[7+discoveryPulse.phaseMs/1800*18,7+((discoveryPulse.phaseMs/1800+.5)%1)*18]:[]}, displayObjects: scene.children.length, actors: actors.diagnostics }),
      invalidate() { boardKey = ''; },
      destroy() {
        liquid?.destroy();leeches?.destroy();actors.destroy(); labels.concat(pointTexts).forEach(t => t.destroy()); revealMask.destroy();travellingMask.destroy(); discoveryArea.destroy();
        [frame, background, fills, feedback, grid, hints, original, guides, discovered, travelling, pointWaves, painted, nodes, points].forEach(g => g.destroy());
      }
    };
  }
  const api = { create, clipSegment };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GridderRenderer = api;
})(typeof window !== 'undefined' ? window : globalThis);
