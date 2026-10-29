const root=document.querySelector('[data-night-post]'),video=root?.querySelector('video'),button=root?.querySelector('[data-night-video-toggle]');
if(video&&button){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,manual=false;
 function sync(){const playing=!video.paused;button.textContent=playing?'Pause':'Play';button.setAttribute('aria-label',`${playing?'Pause':'Play'} preview animation`);}
 function playback(){if(visible&&!manual&&!reduce.matches)video.play().catch(sync);else video.pause();}
 button.addEventListener('click',()=>{manual=!video.paused;playback();});
 video.addEventListener('play',sync);video.addEventListener('pause',sync);reduce.addEventListener('change',playback);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();}).observe(video);playback();sync();
}
