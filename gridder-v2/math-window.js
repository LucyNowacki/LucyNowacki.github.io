/* The same live maths nodes move between the dock and a normal floating window. */
(function(){
'use strict';
const home=document.getElementById('math-home'),panel=home.querySelector('.gridder-mathematics'),bar=document.getElementById('math-titlebar'),pop=document.getElementById('math-pop'),pin=document.getElementById('math-pin'),expand=document.getElementById('math-expand');
const card=document.getElementById('gridder-game-area'),explainer=document.getElementById('math-explainer'),smaller=document.getElementById('math-smaller'),larger=document.getElementById('math-larger'),close=document.getElementById('math-close'),remember=document.getElementById('math-remember');
const moveButtons=['left','up','down','right'].map(dir=>document.getElementById('math-move-'+dir));
const placementKey='gridder-maths-window-placement';
let placement=null;
try{const value=JSON.parse(localStorage.getItem(placementKey));if(value&&['left','top','width','height'].every(key=>Number.isFinite(value[key]))&&value.width>0&&value.height>0)placement=value;}catch(_){}
let floating=false,pinned=false,drag=null,fullscreenSaved=null;
const placeholder=document.createElement('div');placeholder.className='math-placeholder';placeholder.textContent='Your mathematical mission is open in its floating window. ';
const dock=document.createElement('button');dock.textContent='Bring maths back';placeholder.append(dock);
function savePlacement(){
  if(!placement||!fullscreenSaved)return;
  const r=panel.getBoundingClientRect();placement={left:r.left,top:r.top,width:r.width,height:r.height};
  try{localStorage.setItem(placementKey,JSON.stringify(placement));}catch(_){}
}
function showPin(){const description=placement?'Stop remembering maths window position and size':'Remember maths window position and size';remember.textContent=placement?'Unpin':'Pin';remember.setAttribute('aria-pressed',String(Boolean(placement)));remember.setAttribute('aria-label',description);remember.title=description;}
function fitFullscreen(width,height,centre=false){
  if(!fullscreenSaved)return;
  const maxWidth=Math.max(1,innerWidth-24),maxHeight=Math.max(1,innerHeight-24);
  const minWidth=Math.min(280,maxWidth),minHeight=Math.min(210,maxHeight);
  const r=panel.getBoundingClientRect();
  width=Math.max(minWidth,Math.min(maxWidth,width));height=Math.max(minHeight,Math.min(maxHeight,height));
  panel.classList.remove('math-expanded');
  panel.style.width=width+'px';panel.style.height=height+'px';
  panel.style.left=Math.max(12,Math.min(innerWidth-width-12,centre?(innerWidth-width)/2:r.left))+'px';
  panel.style.top=Math.max(12,Math.min(innerHeight-height-12,centre?(innerHeight-height)/2:r.top))+'px';
  savePlacement();
}
function openFullscreenMath(){
  if(fullscreenSaved||!card.classList.contains('is-fullscreen'))return;
  const controller=window.gridderController,wasPlaying=controller?.snapshot()?.playing;
  controller?.pause();
  if(wasPlaying)document.getElementById('gridder-feedback').textContent='Paused for the maths explainer. Choose Start game to resume.';
  fullscreenSaved={floating,pinned,expanded:panel.classList.contains('math-expanded'),style:panel.style.cssText,inert:panel.hasAttribute('inert')};
  if(!floating)home.append(placeholder);
  card.append(panel);panel.removeAttribute('inert');
  floating=true;pinned=true;
  panel.classList.add('math-floating','math-pinned','math-fullscreen-window');panel.classList.remove('math-expanded');
  pop.hidden=pin.hidden=expand.hidden=true;smaller.hidden=larger.hidden=close.hidden=remember.hidden=false;moveButtons.forEach(button=>button.hidden=false);
  explainer.setAttribute('aria-expanded','true');
  if(placement){panel.style.left=placement.left+'px';panel.style.top=placement.top+'px';fitFullscreen(placement.width,placement.height);}
  else fitFullscreen(540,500,true);
  showPin();close.focus({preventScroll:true});
}
function closeFullscreenMath(restoreFocus=true){
  if(!fullscreenSaved)return;
  const previous=fullscreenSaved;fullscreenSaved=null;
  floating=previous.floating;pinned=previous.pinned;
  panel.classList.remove('math-fullscreen-window');
  panel.classList.toggle('math-floating',floating);panel.classList.toggle('math-pinned',pinned);panel.classList.toggle('math-expanded',previous.expanded);
  panel.style.cssText=previous.style;
  if(floating)document.body.append(panel);else{home.append(panel);placeholder.remove();}
  if(previous.inert&&card.classList.contains('is-fullscreen'))panel.setAttribute('inert','');
  pop.hidden=false;pin.hidden=expand.hidden=!floating;smaller.hidden=larger.hidden=close.hidden=remember.hidden=true;moveButtons.forEach(button=>button.hidden=true);
  explainer.setAttribute('aria-expanded','false');
  if(restoreFocus&&card.classList.contains('is-fullscreen'))explainer.focus({preventScroll:true});
}
explainer?.addEventListener('click',openFullscreenMath);
close?.addEventListener('click',()=>closeFullscreenMath());
smaller?.addEventListener('click',()=>{const r=panel.getBoundingClientRect();fitFullscreen(r.width-100,r.height-90);});
larger?.addEventListener('click',()=>{const r=panel.getBoundingClientRect();fitFullscreen(r.width+100,r.height+90);});
remember?.addEventListener('click',()=>{
  if(placement){placement=null;try{localStorage.removeItem(placementKey);}catch(_){}}
  else{placement={};savePlacement();}
  showPin();
});
for(const [dir,dx,dy] of [['left',-64,0],['up',0,-64],['down',0,64],['right',64,0]]){
  document.getElementById('math-move-'+dir)?.addEventListener('click',()=>{
    const r=panel.getBoundingClientRect();panel.style.left=(r.left+dx)+'px';panel.style.top=(r.top+dy)+'px';fitFullscreen(r.width,r.height);
  });
}
addEventListener('gridder-fullscreen-change',event=>{if(!event.detail.active)closeFullscreenMath(false);});
addEventListener('resize',()=>{if(fullscreenSaved){const r=panel.getBoundingClientRect();fitFullscreen(r.width,r.height);}});
function clampPosition(){if(!floating||panel.classList.contains('math-expanded'))return;const r=panel.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(innerWidth-Math.min(r.width,innerWidth-16)-8,r.left))+'px';panel.style.top=(Math.max(8,Math.min(innerHeight-70,r.top))+(pinned?0:scrollY))+'px';}
function toggle(){floating=!floating;pop.setAttribute('aria-pressed',String(floating));pop.textContent=floating?'Dock ↙':'Float ↗';pin.hidden=expand.hidden=!floating;if(floating){const r=panel.getBoundingClientRect();home.append(placeholder);document.body.append(panel);panel.classList.add('math-floating');panel.style.left=Math.max(8,Math.min(r.left,innerWidth-550))+'px';panel.style.top=(scrollY+Math.max(12,Math.min(r.top,innerHeight-100)))+'px';clampPosition();}else{home.append(panel);placeholder.remove();panel.classList.remove('math-floating','math-pinned','math-expanded');panel.style.cssText='';pinned=false;pin.setAttribute('aria-pressed','false');}pop.focus({preventScroll:true});}
pop.addEventListener('click',toggle);dock.addEventListener('click',toggle);
pin.addEventListener('click',()=>{const r=panel.getBoundingClientRect();pinned=!pinned;panel.classList.toggle('math-pinned',pinned);panel.style.top=(r.top+(pinned?0:scrollY))+'px';pin.setAttribute('aria-pressed',String(pinned));pin.textContent=pinned?'Unpin':'Pin';});
function maximize(){if(floating){panel.classList.toggle('math-expanded');expand.setAttribute('aria-pressed',String(panel.classList.contains('math-expanded')));}}
expand.addEventListener('click',maximize);bar.addEventListener('dblclick',e=>{if(!e.target.closest('button'))maximize();});
bar.addEventListener('pointerdown',e=>{if(!floating||e.target.closest('button')||panel.classList.contains('math-expanded'))return;const r=panel.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};bar.setPointerCapture(e.pointerId);e.preventDefault();});
bar.addEventListener('pointermove',e=>{if(!drag)return;panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,e.clientX-drag.x))+'px';panel.style.top=(Math.max(8,Math.min(innerHeight-65,e.clientY-drag.y))+(pinned?0:scrollY))+'px';});
for(const event of ['pointerup','pointercancel','lostpointercapture'])bar.addEventListener(event,()=>{drag=null;savePlacement();});
bar.tabIndex=0;bar.setAttribute('aria-label','Maths window title bar. In floating mode use arrow keys to move; Shift and arrows to resize.');
bar.addEventListener('keydown',e=>{if(!floating||e.target!==bar||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopPropagation();const dx=e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0,dy=e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0,r=panel.getBoundingClientRect();if(e.shiftKey){panel.style.width=Math.max(280,Math.min(innerWidth-16,r.width+dx))+'px';panel.style.height=Math.max(210,r.height+dy)+'px';}else{panel.style.left=r.left+dx+'px';panel.style.top=r.top+dy+(pinned?0:scrollY)+'px';}if(fullscreenSaved){const next=panel.getBoundingClientRect();fitFullscreen(next.width,next.height);}else clampPosition();});
// Native-style resizing from every edge and corner, in addition to CSS's grip.
let sizing=null;
function edges(e){const r=panel.getBoundingClientRect();return {l:e.clientX-r.left<7,r:r.right-e.clientX<7,t:e.clientY-r.top<7,b:r.bottom-e.clientY<7};}
panel.addEventListener('pointerdown',e=>{if(!floating||panel.classList.contains('math-expanded')||e.target.closest('button'))return;const side=edges(e);if(!Object.values(side).some(Boolean))return;const r=panel.getBoundingClientRect();sizing={side,x:e.clientX,y:e.clientY,left:r.left,top:r.top,width:r.width,height:r.height};drag=null;panel.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();},true);
panel.addEventListener('pointermove',e=>{if(!floating)return;if(!sizing){const q=edges(e);panel.style.cursor=q.l||q.r?(q.t||q.b?((q.l&&q.t)||(q.r&&q.b)?'nwse-resize':'nesw-resize'):'ew-resize'):q.t||q.b?'ns-resize':'';return;}const a=sizing,dx=e.clientX-a.x,dy=e.clientY-a.y,w=Math.max(280,Math.min(innerWidth-16,a.width+(a.side.r?dx:a.side.l?-dx:0))),h=Math.max(210,a.height+(a.side.b?dy:a.side.t?-dy:0));panel.style.width=w+'px';panel.style.height=h+'px';panel.style.left=(a.left+(a.side.l?a.width-w:0))+'px';panel.style.top=(a.top+(a.side.t?a.height-h:0)+(pinned?0:scrollY))+'px';if(fullscreenSaved)fitFullscreen(w,h);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])panel.addEventListener(event,()=>{sizing=null;savePlacement();});
addEventListener('resize',clampPosition);
})();
