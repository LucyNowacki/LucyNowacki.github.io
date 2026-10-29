// Homepage preview only. The full explorer remains on its own post and route.
const tile=document.querySelector('[data-certification-tile]');
if(tile){
 const video=tile.querySelector('video'),toggle=tile.querySelector('[data-preview-toggle]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let manualPause=false,visible=false;
 video.muted=true;
 function update(){
  toggle.textContent=video.paused?'Play':'Pause';
  toggle.setAttribute('aria-label',`${video.paused?'Play':'Pause'} certification animation`);
  toggle.setAttribute('aria-pressed',String(!video.paused));
 }
 function playback(){
  if(visible&&!manualPause&&!reduced.matches)video.play().catch(update);
  else video.pause();
 }
 toggle.addEventListener('click',()=>{manualPause=!video.paused;playback();});
 video.addEventListener('play',update);video.addEventListener('pause',update);
 reduced.addEventListener('change',playback);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();},{threshold:.1}).observe(tile);
 update();
}
