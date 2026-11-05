/* A presentation layer for the function journey. The route and progress come
 * from the catalogue/controller; the graph previews use the shared maths model. */
(function () {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let overlay, roadmap, stageIndex = 0, timer = null, cycling = !reducedMotion.matches;
  let open = false, inertBefore = [], audioRequest = 0;
  const controller = () => window.gridderController;
  const audio = () => window.GridderRoadmapAudio;
  const snapshot = () => controller()?.roadmapSnapshot?.() || {};
  const button = (label, className, handler) => {
    const el = document.createElement('button');
    el.type = 'button'; el.className = className; el.textContent = label;
    el.addEventListener('click', handler); return el;
  };
  function stopAudio() { audioRequest++; audio()?.pause?.(); updateAudio(); }
  function updateAudio() {
    if (!overlay) return;
    const el = $('.rd-music', overlay), note = $('.rd-music-note', overlay), a = audio();
    const available = Boolean(a?.available?.());
    el.disabled = !available;
    el.textContent = available && a.isPlaying?.() ? 'Pause music' : 'Play music';
    el.setAttribute('aria-pressed', String(Boolean(available && a.isPlaying?.())));
    note.textContent = available ? (a.label || 'Roadmap music') : 'Music not loaded';
  }
  const curveCache = new Map(), svgNS = 'http://www.w3.org/2000/svg';
  let curveKey = null, frame = null, transition = null;
  function curve(key) {
    if (!curveCache.has(key)) curveCache.set(key, window.GridderRoadmapCurves.build(window.derivativeGridderCatalogue, window.derivativeGridderMath, key));
    return curveCache.get(key);
  }
  // The geometry API supplies x,y in [0,1], with y increasing downwards.
  // Map it to the SVG's 330 by 200 chart rectangle, without changing game coordinates.
  const svgPoint = ([x,y]) => `${(35 + x*330).toFixed(2)},${(25 + y*200).toFixed(2)}`;
  const pathData = points => points.map((point,i) => `${i?'L':'M'}${svgPoint(point)}`).join(' ');
  function drawGroup(group, shape) {
    const children = [];
    for (const path of shape.paths) {
      if (!path.length) continue;
      const el = document.createElementNS(svgNS, 'path');
      el.setAttribute('class', 'rd-chart'); el.setAttribute('d', pathData(path)); children.push(el);
    }
    for (const point of shape.points) {
      const el = document.createElementNS(svgNS, 'circle');
      el.setAttribute('class', `rd-curve-point${point.open?' rd-point-open':''}`);
      el.setAttribute('cx', String(35 + point.x*330)); el.setAttribute('cy', String(25 + point.y*200));
      el.setAttribute('r', '4'); children.push(el);
    }
    group.replaceChildren(...children);
  }
  function caption(shape) {
    $('.rd-curve-caption', overlay).textContent = `${shape.label} · ${shape.notice} · Each function uses its own viewing window.`;
  }
  function selectCurve(key) {
    if (!key) return;
    const shape = curve(key), first = $('.rd-curve-a', overlay), second = $('.rd-curve-b', overlay);
    curveKey = key; drawGroup(first, shape); first.style.opacity = '1'; second.replaceChildren(); second.style.opacity = '0'; caption(shape);
    const index = roadmap.stages.findIndex(stage => stage.id === roadmap.byKey[key]?.stageId);
    if (index >= 0 && index !== stageIndex) showStage(index);
  }
  function settleTransition() {
    if (!transition) return;
    const key = transition.to.key; transition = null; selectCurve(key);
  }
  function schedule() {
    clearTimeout(timer); timer = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; settleTransition();
    if (open && cycling && !reducedMotion.matches && !document.hidden && curveKey) {
      timer = setTimeout(advanceCurve, 2800);
    }
    if (overlay) {
      const control = $('.rd-cycle', overlay);
      control.disabled = reducedMotion.matches;
      control.textContent = reducedMotion.matches ? 'Demo paused · reduced motion' : cycling ? 'Pause demo' : 'Play demo';
    }
  }
  function advanceCurve() {
    timer = null;
    if (!open || !cycling || reducedMotion.matches || document.hidden) return;
    const from = curve(curveKey), key = roadmap.keys[(roadmap.keys.indexOf(curveKey)+1)%roadmap.keys.length], to = curve(key);
    const morph = from.morphable && to.morphable && from.paths.length === 1 && to.paths.length === 1 && from.paths[0].length === to.paths[0].length;
    const a = $('.rd-curve-a', overlay), b = $('.rd-curve-b', overlay);
    drawGroup(a, from); a.style.opacity = '1'; drawGroup(b, to); b.style.opacity = '0';
    $('.rd-curve-caption', overlay).textContent = `${from.label} → ${to.label} · shape transition · Each function uses its own viewing window.`;
    transition = {from, to, kind: morph ? 'morph' : 'crossfade', start: null};
    function animate(now) {
      if (!transition || !open || !cycling || document.hidden || reducedMotion.matches) { schedule(); return; }
      if (transition.start === null) transition.start = now;
      const t = Math.min(1, (now-transition.start)/900), eased = t*t*(3-2*t);
      transition.progress = t;
      if (morph) {
        const path = from.paths[0].map((point,i) => [point[0]+(to.paths[0][i][0]-point[0])*eased, point[1]+(to.paths[0][i][1]-point[1])*eased]);
        a.firstElementChild.setAttribute('d', pathData(path));
      } else { a.style.opacity = String(1-eased); b.style.opacity = String(eased); }
      if (t >= 1) { frame = null; settleTransition(); schedule(); }
      else frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
  }
  function navigateStage(index) {
    cycling = false; schedule();
    showStage(index);
    selectCurve(roadmap.stages[stageIndex].keys[0]);
  }
  function showStage(index) {
    if (!roadmap?.stages.length) return;
    stageIndex = (index + roadmap.stages.length) % roadmap.stages.length;
    const stage = roadmap.stages[stageIndex];
    $('.rd-stage-count', overlay).textContent = `STAGE ${String(stageIndex + 1).padStart(2, '0')} / ${String(roadmap.stages.length).padStart(2, '0')}`;
    $('.rd-stage-title', overlay).textContent = stage.title;
    $('.rd-stage-description', overlay).textContent = stage.description;
    $('.rd-stage-size', overlay).textContent = `${stage.keys.length} functions to explore`;
    const progress = snapshot();
    const completed = new Set(progress.completedKeys || []);
    const route = $('.rd-route', overlay);
    if (!route.children.length) roadmap.stages.forEach((item, i) => {
      const el = button(String(i + 1), 'rd-route-node', () => {
        navigateStage(i);
      });
      route.append(el);
    });
    Array.from(route.children).forEach((el, i) => {
      const item = roadmap.stages[i], done = item.keys.filter(key => completed.has(key)).length;
      el.setAttribute('aria-label', `Stage ${i + 1}, ${item.title}, ${done} of ${item.keys.length} functions complete`);
      el.classList.toggle('rd-route-done', done === item.keys.length);
      if (i === stageIndex) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
    const examples = stage.keys.slice(0, 3).map(key => roadmap.byKey[key]?.label).filter(Boolean);
    $('.rd-stage-examples', overlay).textContent = `${stage.title}: ${examples.join('  ·  ')}${stage.keys.length > 3 ? `  ·  +${stage.keys.length - 3} more` : ''}`;
    const dots = $('.rd-stages', overlay);
    dots.replaceChildren(...roadmap.stages.map((item, i) => {
      const done = item.keys.filter(key => completed.has(key)).length;
      const el = button(`${String(i + 1).padStart(2, '0')}  ${item.title}`, 'rd-stage-tab', () => { navigateStage(i); $('.rd-stage-tab[aria-current]', overlay)?.focus(); });
      el.setAttribute('aria-label', `${item.title}, ${done} of ${item.keys.length} functions complete`);
      if (i === stageIndex) el.setAttribute('aria-current', 'true');
      return el;
    }));
    const list = $('.rd-list', overlay);
    const entries = stage.keys.map(key => roadmap.byKey[key]).filter(Boolean);
    list.replaceChildren(...entries.map(entry => {
      const el = button('', 'rd-entry', () => { controller()?.selectFunction?.(entry.key); close(); });
      const n = document.createElement('span'); n.className = 'rd-entry-number'; n.textContent = String(entry.number).padStart(3, '0');
      const title = document.createElement('span'); title.className = 'rd-entry-title'; title.textContent = entry.label;
      const detail = document.createElement('small'); detail.textContent = `${entry.families.map(f => f.label).join(' · ')} / ${entry.subfamilies.map(f => f.label).join(' · ')} · ${entry.levelCount} levels`;
      title.append(detail);
      const status = document.createElement('span'); status.className = 'rd-entry-status'; status.textContent = completed.has(entry.key) ? '✓ Complete' : entry.key === progress.currentKey ? 'Current' : 'Explore →';
      el.append(n, title, status); return el;
    }));
  }
  function updateProgress() {
    if (!overlay || !roadmap) return;
    const p = snapshot(), count = (p.completedKeys || []).length;
    $('.rd-scope', overlay).textContent = `${roadmap.stages.length} stages · ${roadmap.entries.length} functions · ${roadmap.entries.reduce((total, entry) => total + (entry.levelCount || 0), 0)} levels`;
    $('.rd-progress', overlay).textContent = `${count} / ${roadmap.entries.length} functions complete`;
    $('.rd-start', overlay).textContent = count || p.currentKey && p.currentKey !== roadmap.keys[0] ? 'Continue journey' : 'Start journey';
    showStage(stageIndex);
  }
  function close() {
    if (!open) return;
    open = false; schedule(); stopAudio(); controller()?.pause?.();
    overlay.hidden = true;
    inertBefore.forEach(([el, value]) => { el.inert = value; }); inertBefore = [];
    document.documentElement.classList.remove('rd-open');
    const start = document.getElementById('gridder-start');
    const menu = start?.closest('details:not([open])');
    if (menu) menu.open = true;
    start?.focus({preventScroll: true});
  }
  function show() {
    if (!overlay || !roadmap || open) return;
    controller()?.pause?.();
    inertBefore = Array.from(document.body.children).filter(el => el !== overlay).map(el => [el, el.inert]);
    inertBefore.forEach(([el]) => { el.inert = true; });
    document.documentElement.classList.add('rd-open');
    overlay.hidden = false; open = true;
    const current = snapshot().currentKey;
    const currentStage = roadmap.stages.findIndex(stage => stage.keys.includes(current));
    if (currentStage >= 0) stageIndex = currentStage;
    updateProgress(); selectCurve(roadmap.stages[stageIndex].keys[0]); updateAudio(); schedule();
    $('.rd-start', overlay).focus({preventScroll: true});
  }
  function init() {
    if (!window.GridderRoadmapCurves?.build || !window.GridderFunctionRoadmap?.build || !window.derivativeGridderCatalogue || !window.derivativeGridderMath || !controller()) return;
    roadmap = window.GridderFunctionRoadmap.build(window.derivativeGridderCatalogue, window.derivativeGridderMath);
    if (!roadmap?.stages?.length || !roadmap.entries?.length) return;
    overlay = document.createElement('section');
    overlay.className = 'rd-overlay'; overlay.hidden = true;
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'rd-title');
    overlay.innerHTML = `<div class="rd-sky" aria-hidden="true"><div class="rd-stars"></div><div class="rd-sun"></div><div class="rd-horizon"></div><div class="rd-grid"></div></div>
      <div class="rd-shell"><header class="rd-top"><span class="rd-brand">GRIDDER <b>2</b><small>THE MATHS ARCADE</small></span><button type="button" class="rd-skip">Skip intro <span aria-hidden="true">×</span></button></header>
      <main class="rd-main"><div class="rd-copy"><p class="rd-kicker">A JOURNEY THROUGH FUNCTIONS</p><h1 id="rd-title">Your next<br><em>discovery</em> awaits.</h1><p class="rd-intro">Trace a path, reveal the maths, and find your way through a universe of functions.</p><p class="rd-scope"></p><p class="rd-progress"></p><div class="rd-actions"><button type="button" class="rd-start">Start journey</button><button type="button" class="rd-explore" aria-expanded="false" aria-controls="rd-map">Explore roadmap</button></div><div class="rd-route-heading">THE JOURNEY <span>Choose a stage</span></div><nav class="rd-route" aria-label="Choose a roadmap stage"></nav><p class="rd-stage-examples"></p><div class="rd-sound"><button type="button" class="rd-music" aria-pressed="false">Play music</button><span class="rd-music-note">Music not loaded</span></div></div>
      <div class="rd-scene" aria-label="Current roadmap stage"><div class="rd-scene-head"><span class="rd-stage-count"></span><span class="rd-stage-size"></span></div><div class="rd-orbit" aria-hidden="true"><div class="rd-ring rd-ring-one"></div><div class="rd-ring rd-ring-two"></div><svg viewBox="0 0 400 250" focusable="false"><path class="rd-chart-grid" d="M 35 55 H 365 M 35 105 H 365 M 35 155 H 365 M 35 205 H 365 M 75 25 V 225 M 135 25 V 225 M 195 25 V 225 M 255 25 V 225 M 315 25 V 225"/><defs><clipPath id="rd-curve-clip"><rect x="35" y="25" width="330" height="200"/></clipPath></defs><g clip-path="url(#rd-curve-clip)"><g class="rd-curve-a"></g><g class="rd-curve-b"></g></g></svg><div class="rd-planet rd-planet-one"></div><div class="rd-planet rd-planet-two"></div></div><p class="rd-curve-caption"></p><div class="rd-stage-copy"><h2 class="rd-stage-title"></h2><p class="rd-stage-description"></p></div><div class="rd-scene-controls"><button type="button" class="rd-prev" aria-label="Previous stage">←</button><button type="button" class="rd-cycle">Pause demo</button><button type="button" class="rd-next" aria-label="Next stage">→</button></div></div></main>
      <section id="rd-map" class="rd-map" hidden aria-label="Explore the function roadmap"><div class="rd-map-heading"><div><p class="rd-kicker">CHOOSE YOUR DESTINATION</p><h2>Explore the roadmap</h2></div><p>Select a stage, then choose any function to play.</p></div><nav class="rd-stages" aria-label="Roadmap stages"></nav><div class="rd-list"></div></section>
      <footer class="rd-footer"><span>FOLLOW YOUR CURIOSITY</span><span>MATHEMATICS · EXPLORATION · PLAY</span></footer></div>`;
    document.body.append(overlay);
    $('.rd-skip', overlay).addEventListener('click', close);
    $('.rd-start', overlay).addEventListener('click', () => { controller()?.continueRoadmap?.(); close(); });
    $('.rd-explore', overlay).addEventListener('click', () => {
      const map = $('.rd-map', overlay); map.hidden = !map.hidden;
      $('.rd-explore', overlay).setAttribute('aria-expanded', String(!map.hidden));
      if (!map.hidden) { cycling = false; schedule(); map.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start'}); }
    });
    $('.rd-prev', overlay).addEventListener('click', () => navigateStage(stageIndex - 1));
    $('.rd-next', overlay).addEventListener('click', () => navigateStage(stageIndex + 1));
    $('.rd-cycle', overlay).addEventListener('click', () => { cycling = !cycling; if (reducedMotion.matches) cycling = false; schedule(); });
    $('.rd-music', overlay).addEventListener('click', async () => {
      const a = audio(); if (!a?.available?.()) return;
      if (a.isPlaying()) { stopAudio(); return; }
      const request = ++audioRequest;
      try { await a.play(); } catch (_) { /* the audio adapter reports availability */ }
      if (request !== audioRequest || !open || document.hidden) a.pause();
      updateAudio();
    });
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = Array.from(overlay.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => el.getClientRects().length);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    });
    document.getElementById('gridder-roadmap-open')?.addEventListener('click', show);
    window.addEventListener('gridder-roadmap-change', updateProgress);
    window.addEventListener('gridder-roadmap-audio-ready', updateAudio);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); schedule(); });
    window.addEventListener('pagehide', () => {
      stopAudio(); clearTimeout(timer); timer = null;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; settleTransition();
    });
    window.addEventListener('pageshow', () => { if (open) schedule(); });
    $('.rd-map', overlay).addEventListener('focusin', () => { if (cycling) { cycling = false; schedule(); } });
    reducedMotion.addEventListener?.('change', event => { if (event.matches) cycling = false; schedule(); });
    show();
  }
  window.GridderRoadmapDemo = { open: show, close, isOpen: () => open, previewState: () => ({key: curveKey, nextKey: transition?.to.key || (roadmap && curveKey ? roadmap.keys[(roadmap.keys.indexOf(curveKey)+1)%roadmap.keys.length] : null), transitioning: transition?.kind || null, progress: transition?.progress || 0, framePending: frame !== null, cycling}) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
})();
