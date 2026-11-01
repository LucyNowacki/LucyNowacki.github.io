/* The portrait and board share Chebby's original composed face pixels. */
(function(){
'use strict';
const canvas=document.getElementById('gridder-mascot');if(!canvas)return;
const context=canvas.getContext('2d');if(!context)return;
let revision=-1,live=false;
function draw(source){
 context.clearRect(0,0,canvas.width,canvas.height);
 context.save();context.beginPath();
 context.ellipse(84,88,43,35,0,0,Math.PI*2);
 context.moveTo(0,18);context.lineTo(59,18);context.lineTo(59,100);context.lineTo(46,126);context.lineTo(0,130);context.closePath();
 context.moveTo(105,10);context.lineTo(171,10);context.lineTo(171,110);context.lineTo(124,112);context.lineTo(107,86);context.closePath();
 context.clip();context.drawImage(source,0,0,192,208,0,0,192,208);context.restore();
}
function refresh(){
 const face=window.GridderChebbyFace;if(!face?.ready||face.revision===revision)return;
 live=true;revision=face.revision;draw(face.canvas);canvas.dataset.faceRevision=String(revision);
}
window.addEventListener('gridder-chebby-face',refresh);
window.addEventListener('pagehide',()=>{window.removeEventListener('gridder-chebby-face',refresh);},{once:true});
refresh();
// Keep the original artwork while the richer painter loads or is unavailable.
const portrait=new Image();portrait.onload=()=>{if(!live)draw(portrait);};
portrait.src=new URL('assets/chebby-speech-atlas.webp',document.currentScript.src).href;
})();
