/* Keep the desktop console inside the actual visible game window. */
(() => {
  'use strict';
  const panel=document.querySelector('.mission-column');
  if(!panel)return;
  const compactClue=matchMedia('(max-width: 600px)');
  const clue=document.querySelector('.mission-clue-details');
  const setClueLayout=()=>{if(clue)clue.open=!compactClue.matches;};
  setClueLayout();
  compactClue.addEventListener('change',setClueLayout);
  let pending=false;
  function fit(){
    pending=false;
    if(matchMedia('(max-width: 1100px)').matches){panel.style.removeProperty('--gridder-panel-height');return;}
    const top=Math.max(16,panel.getBoundingClientRect().top);
    const height=Math.max(0,Math.floor(innerHeight-top-16))+'px';
    if(panel.style.getPropertyValue('--gridder-panel-height')!==height)panel.style.setProperty('--gridder-panel-height',height);
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(fit);}}
  addEventListener('resize',schedule);
  addEventListener('scroll',schedule,{passive:true});
  if(typeof ResizeObserver!=='undefined'){
    const observer=new ResizeObserver(schedule);
    for(const node of document.querySelectorAll('.masthead,.level-journey'))observer.observe(node);
  }
  document.fonts?.ready.then(schedule);
  schedule();
})();
