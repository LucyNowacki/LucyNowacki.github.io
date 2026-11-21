/* Explicit same-tab navigation, with native links as the no-script fallback. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const lessons = [
    ['laurent','index.html','Laurent expansion','How the finite packet is formed'],
    ['real-line','real-line/index.html','Real-line stability','The neutral radius-one case'],
    ['ellipse-growth','ellipse-growth/index.html','Geometric growth','Radial weights on an ellipse'],
    ['contour-coefficients','contour-coefficients/index.html','Boundary coefficients','Recover a coefficient from a circuit'],
    ['kernel-structure','kernel-structure/index.html','Kernel frequencies','The surviving parity ladder'],
    ['hinf-coefficients','hinf-coefficients/index.html','Bounded analytic coefficients','From boundary size to decay'],
    ['hardy-coefficients','hardy-coefficients/index.html','Hardy coefficients and tails','From angular energy to truncation'],
    ['factorisation','factorisation/index.html','Factorisation and embeddings','Follow the function through three operations'],
    ['weighted-synthesis','weighted-synthesis/index.html','Weighted synthesis and tails','Split the coefficient budget'],
    ['hardy-to-uniform','hardy-to-uniform/index.html','Hardy to uniform','From angular energy to a pointwise ceiling'],
    ['uniform-to-hardy','uniform-to-hardy/index.html','Uniform to Hardy','From a ceiling to angular energy'],
    ['transfer-tails','transfer-tails/index.html','Two gaps and operator tails','Balance the input and output restrictions']
  ];
  for (const nav of document.querySelectorAll('[data-lesson-navigation]')) {
    nav.classList.add('thesis-switcher');
    nav.setAttribute('aria-label','Switch thesis lesson');
    // Every delivered page also contains static links for no-script navigation.
    if (nav.querySelectorAll('a').length !== lessons.length) {
      nav.replaceChildren(...lessons.map(([id,path,title,description], i) => {
      const a=document.createElement('a'),span=document.createElement('span'),small=document.createElement('small');
      a.href=new URL(path,base).href; span.textContent=`${i+1} · ${title}`;
      const current=nav.dataset.lesson===id;
      small.textContent=current?'Viewing this lesson':description;
      if(current)a.setAttribute('aria-current','page');
      a.append(span,small);return a;
      }));
    }
    // Do not rely on an embedded browser's default anchor navigation. Keyboard
    // Enter also dispatches click; modified clicks keep their native behaviour.
    nav.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || !nav.contains(link) || link.hasAttribute('download') ||
          (link.target && link.target !== '_self')) return;
      event.preventDefault();
      window.location.assign(link.href);
    }, true);
  }
})();
