window.MathJax = {
  tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] },
  svg: { fontCache: 'local' },
  options: { enableMenu: false },
  startup: { typeset: false, pageReady() { return window.refreshGridderMath?.()||Promise.resolve(); } }
};
