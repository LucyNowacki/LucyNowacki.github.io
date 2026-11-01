/* Gridder's visual face only: gameplay expressions and a pause-aware blink. */
import {loadFacePainter} from './chebby/face-painter.mjs?v=20261020-surprised-bite';
const canvas=document.createElement('canvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let painter=null,destroyed=false,lastBlink=-1,lastRenderedRevision=-1;
const restingPose={viseme:0,previousViseme:0,blend:1,aperture:0,voiced:false,blink:0,emphasis:0,tilt:0};
const face=window.GridderChebbyFace={ready:false,canvas,pose:{...restingPose},revision:0,update,destroy};
function paint(blink){
 if(!face.ready||blink===lastBlink)return;
 lastBlink=blink;face.pose={...restingPose,blink};
 painter.draw(face.pose);face.revision++;
 window.dispatchEvent(new CustomEvent('gridder-chebby-face',{detail:face}));
}
function update(now,snapshot){
 if(destroyed||!face.ready)return false;
 const time=Number.isFinite(snapshot?.chaseTime)?snapshot.chaseTime:0;
 const phase=(time%4700-4400)/150;
 const blink=!reduced.matches&&phase>0&&phase<1?Math.sin(Math.PI*phase)**1.5:0;
 paint(blink);
 const dirty=face.revision!==lastRenderedRevision;lastRenderedRevision=face.revision;
 return dirty;
}
function destroy(){
 destroyed=true;face.ready=false;painter?.destroy();
}
window.addEventListener('pagehide',destroy,{once:true});
try{
 painter=await loadFacePainter(canvas,new URL('./assets/chebby-speech-atlas.webp',import.meta.url).href);
 if(destroyed)painter.destroy();
 else{
  face.captureCanvases=painter.captureCanvases;face.ready=true;paint(0);
  window.gridderView?.render(window.gridderController?.snapshot());
 }
}catch(error){console.error('Gridder face artwork could not load.',error);}
