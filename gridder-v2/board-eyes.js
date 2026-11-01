/* Board-only eye details. The shared mascot artwork is never modified. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const unit=v=>{const n=Math.hypot(...v);return n>1e-6?v.map(x=>x/n):[0,0];};
const round=(v,step)=>Math.round(v/step)*step;
function describe(state,pose={}){
 const attacked=state.mood==='draining'||state.mood==='decaying';
 const frightened=attacked||state.mood==='fear';
 const direction=state.direction||[0,0];
 let world=state.walking||state.bridging?unit([direction[0],-direction[1]]):[0,0];
 if(frightened&&state.threatDirection)world=unit(state.threatDirection);
 const angle=(state.capture?(state.angle||0):(state.heading||0))*Math.PI/180;
 const local=[Math.cos(angle)*world[0]+Math.sin(angle)*world[1],-Math.sin(angle)*world[0]+Math.cos(angle)*world[1]];
 const gaze=local.map(x=>round(x,1/16));
 // The capture clock freezes on pause, so the shocked pupil pulse does too.
 const pupilScale=attacked?round(.44+.02*Math.sin((state.clock||0)/120),.01):frightened?.48:.64;
 const blink=clamp(pose.blink||0,0,1);
 return {gaze,worldGaze:world,pupilScale,blink,emotion:attacked?'shocked':frightened?'frightened':'normal',
  key:JSON.stringify([gaze,pupilScale,blink])};
}
function paint(context,eyes){
 if(eyes.blink>.86)return;
 const box={x:46,y:69,w:76,h:45};
 const image=context.getImageData(box.x,box.y,box.w,box.h),source=new Uint8ClampedArray(image.data);
 const sample=(x,y,k)=>{
  const px=clamp(x-box.x,0,box.w-1.001),py=clamp(y-box.y,0,box.h-1.001);
  const ix=Math.floor(px),iy=Math.floor(py),fx=px-ix,fy=py-iy,i=(iy*box.w+ix)*4+k;
  return source[i]*(1-fx)*(1-fy)+source[i+4]*fx*(1-fy)+source[i+box.w*4]*(1-fx)*fy+source[i+box.w*4+4]*fx*fy;
 };
 const openness=Math.max(.12,1-.96*eyes.blink);
 for(const [cx,cy,rx,ry] of [[62,96,9.4,11.8],[107,87,9.4,12]]){
  const height=ry*openness,irisX=rx*eyes.pupilScale,irisY=height*eyes.pupilScale;
  const dx=eyes.gaze[0]*2.8,dy=eyes.gaze[1]*2.8*openness;
  for(let y=Math.floor(cy-height-1);y<=Math.ceil(cy+height+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){
   const edge=Math.hypot((x-cx)/rx,(y-cy)/height),mask=clamp((1-edge)*6,0,1);
   if(!mask)continue;
   const irisRadius=Math.hypot((x-cx-dx)/irisX,(y-cy-dy)/irisY);
   const iris=clamp((1-irisRadius)*8,0,1);
   const shade=1-.13*clamp(edge,0,1),i=((y-box.y)*box.w+x-box.x)*4;
   for(let k=0;k<3;k++){
    const white=[215,244,255][k]*shade;
    const pupil=sample(cx+(x-cx-dx)/eyes.pupilScale,cy+(y-cy-dy)/eyes.pupilScale,k);
    image.data[i+k]=source[i+k]*(1-mask)+(white*(1-iris)+pupil*iris)*mask;
   }
  }
 }
 context.putImageData(image,box.x,box.y);
}
root.GridderBoardEyes={describe,paint};
})(window);
