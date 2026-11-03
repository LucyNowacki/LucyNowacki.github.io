/* Chebby's original head and six original gill-tentacles. The fan pixels are
   cached and hinged at two source-art joints; no limbs are drawn on top. */
(function(root){
'use strict';
let serial=0;
const TAU=2*Math.PI;
// Coordinates refer to the original 192×208 face canvas. Each polygon
// partitions one pre-existing fan, and each source chain runs head→gill tip.
const tentacleSpecs=[
 {side:-1,index:0,root:[50,70],joint:[32,55],tip:[20,42],region:[[0,0],[70,0],[60,77],[0,61]]},
 {side:-1,index:1,root:[48,86],joint:[31,81],tip:[14,75],region:[[0,61],[60,77],[60,94],[0,92]]},
 {side:-1,index:2,root:[49,101],joint:[32,106],tip:[15,110],region:[[0,92],[60,94],[70,132],[0,132]]},
 {side:1,index:0,root:[118,67],joint:[122,48],tip:[126,29],region:[[98,0],[176,0],[176,43],[118,77],[98,73]]},
 {side:1,index:1,root:[122,80],joint:[137,68],tip:[151,55],region:[[118,77],[176,43],[176,82],[120,91]]},
 {side:1,index:2,root:[121,96],joint:[136,96],tip:[150,95],region:[[120,91],[176,82],[176,132],[100,132]]}
];
const rotate=(point,pivot,angle)=>{const c=Math.cos(angle),s=Math.sin(angle),x=point[0]-pivot[0],y=point[1]-pivot[1];return [pivot[0]+c*x-s*y,pivot[1]+s*x+c*y];};
function create(scene){
 const key='gridder-chebby-head-'+(++serial),texture=scene.textures.createCanvas(key,256,208);
 const context=texture.getContext(),image=scene.add.image(0,0,key).setDepth(24.1).setOrigin(124/256,128/208).setVisible(false);
 let info={ready:false,visible:false,mood:'happy',frame:null};
 const makeLayer=()=>{const canvas=document.createElement('canvas');canvas.width=192;canvas.height=208;return {canvas,context:canvas.getContext('2d',{willReadFrequently:true})};};
 const sourceLayer=makeLayer(),layers=[makeLayer(),makeLayer(),makeLayer()],branches=tentacleSpecs.map(()=>makeLayer());
 let sourceIdentity=null,sourceRevision=null,layerEyes=null,layerColour=null,rawPixels=null,tintedPixels=null,lastPixels=null,lastTentacles=[];
 const stats={uploads:0,compositions:0,sourceReads:0,layerBuilds:0};
 function polygon(c,points){c.beginPath();c.moveTo(...points[0]);for(const point of points.slice(1))c.lineTo(...point);c.closePath();}
 function prepareLayers(source,revision,colour,eyes){
  const changed=sourceIdentity!==source.canvas||sourceRevision!==revision||layerEyes!==eyes.key;
  if(changed){sourceIdentity=source.canvas;sourceRevision=revision;layerEyes=eyes.key;rawPixels=null;sourceLayer.context.clearRect(0,0,192,208);sourceLayer.context.drawImage(source.canvas,0,0,192,208);root.GridderBoardEyes.paint(sourceLayer.context,eyes);}
  if(!changed&&layerColour===colour)return false;
  // Read original pixels at most once per face revision, never per gait frame.
  if(colour!==0xffffff||rawPixels){
   if(!rawPixels){rawPixels=sourceLayer.context.getImageData(0,0,192,208);stats.sourceReads++;}
   if(!tintedPixels)tintedPixels=sourceLayer.context.createImageData(192,208);
   tintedPixels.data.set(rawPixels.data);
   const data=tintedPixels.data,red=(colour>>16&255)/255,green=(colour>>8&255)/255,blue=(colour&255)/255;
   for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;data[i]=Math.round(data[i]*red);data[i+1]=Math.round(data[i+1]*green);data[i+2]=Math.round(data[i+2]*blue);}
   sourceLayer.context.putImageData(tintedPixels,0,0);
  }
  layers.forEach((layer,index)=>{
   const c=layer.context;c.clearRect(0,0,192,208);c.save();c.beginPath();
   if(index===2)c.ellipse(84,88,43,35,0,0,TAU);
   else if(index===0){c.moveTo(0,18);c.lineTo(59,18);c.lineTo(59,100);c.lineTo(46,126);c.lineTo(0,130);c.closePath();}
   else{c.moveTo(105,10);c.lineTo(171,10);c.lineTo(171,110);c.lineTo(124,112);c.lineTo(107,86);c.closePath();}
   c.clip();
   if(index!==2){c.beginPath();c.rect(0,0,192,208);c.ellipse(84,88,43,35,0,0,TAU);c.clip('evenodd');}
   c.drawImage(sourceLayer.canvas,0,0);c.restore();
  });
  branches.forEach((layer,index)=>{
   const spec=tentacleSpecs[index],c=layer.context;c.clearRect(0,0,192,208);c.save();polygon(c,spec.region);c.clip();
   c.drawImage(layers[spec.side<0?0:1].canvas,0,0);c.restore();
  });
  layerColour=colour;stats.layerBuilds++;return true;
 }
 // Clip each original-art lobe at its joint along its own head-to-tip axis.
 // A small overlap covers antialiased seams when the two pieces articulate.
 function clipPiece(c,spec,distal){
  const dx=spec.tip[0]-spec.root[0],dy=spec.tip[1]-spec.root[1],length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length,nx=-uy,ny=ux;
  const split=(spec.joint[0]-spec.root[0])*ux+(spec.joint[1]-spec.root[1])*uy;
  const lo=distal?split-1.5:-300,hi=distal?300:split+1.5;
  const point=(along,across)=>[spec.root[0]+ux*along+nx*across,spec.root[1]+uy*along+ny*across];
  polygon(c,[point(lo,-300),point(hi,-300),point(hi,300),point(lo,300)]);c.clip();
 }
 function available(){const source=root.GridderChebbyFace;return !!(source?.ready&&source.canvas?.width&&source.canvas?.height);}
 function render(state){
  const liveSource=root.GridderChebbyFace,ready=available();
  const captureCanvas=state.capture&&(state.mood==='draining'||state.mood==='decaying')?liveSource?.captureCanvases?.[state.mood]:null;
  const source=captureCanvas?{canvas:captureCanvas,revision:'capture-'+state.mood,pose:{viseme:6,aperture:1,blink:state.mood==='decaying'?.48:0}}:liveSource;
  info={ready,visible:ready&&state.visible,mood:state.mood,frame:source?.pose?.frame??source?.pose?.viseme??null,pose:source?.pose?{...source.pose}:null,sourceCrop:{width:176,height:132,anchorX:84,anchorY:88,offsetX:40,offsetY:40},textureSize:{width:256,height:208}};
  info.captureExpression=captureCanvas?(state.mood==='draining'?'surprised':'decaying'):null;
  info.captureMouth=captureCanvas?{frame:6,aperture:1}:null;
  info.captureEyeScale=captureCanvas?(state.mood==='draining'?1.18:1-.96*.48):null;
  image.setVisible(info.visible);if(!info.visible)return;
  const walking=!!(state.walking&&!state.capture),gaitPhase=state.gaitPhase??0;
  const amplitude=state.capture?0:(state.gaitAmplitude??Number(walking));
  const headHeading=state.capture?(state.angle||0):(state.headHeading??state.heading??0),angle=headHeading*Math.PI/180;
  const worldDirection=state.bodyDirection?[state.bodyDirection[0],-state.bodyDirection[1]]:(state.screenDirection||[state.direction?.[0]||0,-(state.direction?.[1]||0)]);
  const direction=[Math.cos(angle)*worldDirection[0]+Math.sin(angle)*worldDirection[1],-Math.sin(angle)*worldDirection[0]+Math.cos(angle)*worldDirection[1]];
  const leanX=direction[0]*amplitude,leanY=direction[1]*amplitude;
  info.walking=walking;info.heading=state.heading||0;info.direction=state.direction?[...state.direction]:[0,0];info.bridging=!!state.bridging;
  info.gaitAmplitude=amplitude;info.settling=!!state.settling;info.gaitPhase=gaitPhase;
  info.headHeading=headHeading;info.bodyHeading=state.bodyHeading||0;info.rigDirection=[...direction];
  const colour=state.tint??(state.mood==='fear'?0xe1dcff:state.mood==='pushing'?0xffbfdc:0xffffff);
  const revision=source.revision??JSON.stringify(source.pose??{}),eyes=root.GridderBoardEyes.describe(state,source.pose);info.eyes=eyes;
  const layersChanged=prepareLayers(source,revision,colour,eyes);
  const pixelKey=JSON.stringify([amplitude?gaitPhase:0,amplitude,leanX,leanY,colour,revision,eyes.key]);
  if(layersChanged||pixelKey!==lastPixels){
   stats.compositions++;context.clearRect(0,0,256,208);context.save();context.translate(40,40);
   const tentacles=tentacleSpecs.map(spec=>{
    const tripod=(spec.index+(spec.side>0?1:0))%2,cycle=((gaitPhase/TAU+spec.index/6+tripod/2)%1+1)%1;
    const phase=cycle*TAU,hip=amplitude*(.095*Math.sin(phase)+direction[0]*.018+spec.side*direction[1]*.012),elbow=amplitude*.11*Math.sin(phase-.9);
    const joint=rotate(spec.joint,spec.root,hip),tip=rotate(rotate(spec.tip,spec.joint,elbow),spec.root,hip);
    return {side:spec.side,index:spec.index,tripod,cycle,sourceRoot:[...spec.root],sourceJoint:[...spec.joint],sourceTip:[...spec.tip],root:[...spec.root],joint,tip,hipAngle:hip,elbowAngle:elbow};
   });
   if(amplitude===0){context.drawImage(layers[0].canvas,0,0);context.drawImage(layers[1].canvas,0,0);}
   else tentacleSpecs.forEach((spec,index)=>{
    const part=tentacles[index],canvas=branches[index].canvas;
    context.save();context.translate(...spec.root);context.rotate(part.hipAngle);context.translate(-spec.root[0],-spec.root[1]);
    context.save();clipPiece(context,spec,false);context.drawImage(canvas,0,0);context.restore();
    context.save();context.translate(...spec.joint);context.rotate(part.elbowAngle);context.translate(-spec.joint[0],-spec.joint[1]);clipPiece(context,spec,true);context.drawImage(canvas,0,0);context.restore();
    context.restore();
   });
   context.save();context.translate(84+leanX*1.5,88+leanY*1.2);context.rotate(leanX*.035);context.translate(-84,-88);
   context.drawImage(layers[2].canvas,0,0);context.restore();context.restore();
   lastTentacles=tentacles;texture.refresh();stats.uploads++;lastPixels=pixelKey;
  }
  info.tentacles=lastTentacles;info.gillAngles=[lastTentacles[0]?.hipAngle||0,lastTentacles[3]?.hipAngle||0];info.performance={...stats};
  image.setPosition(state.x,state.y).setScale(.25*state.scaleX,.25*state.scaleY).setAngle(headHeading).setAlpha(state.alpha??1);
  image.setTint(0xffffff);info.tint=colour;info.x=image.x;info.y=image.y;info.angle=image.angle;info.scaleX=image.scaleX;info.scaleY=image.scaleY;
 }
 return {image,available,render,animationState(){return {walking:!!info.walking,settling:!!info.settling};},get diagnostics(){return {...info,captureMouth:info.captureMouth?{...info.captureMouth}:null,tentacles:info.tentacles?.map(t=>({...t,sourceRoot:[...t.sourceRoot],sourceJoint:[...t.sourceJoint],sourceTip:[...t.sourceTip],root:[...t.root],joint:[...t.joint],tip:[...t.tip]}))||[],direction:info.direction?[...info.direction]:[0,0],rigDirection:info.rigDirection?[...info.rigDirection]:[0,0],gillAngles:info.gillAngles?[...info.gillAngles]:[0,0],pose:info.pose?{...info.pose}:null,sourceCrop:info.sourceCrop?{...info.sourceCrop}:null};},destroy(){image.destroy();scene.textures.remove(key);for(const layer of [sourceLayer,...layers,...branches]){layer.canvas.width=0;layer.canvas.height=0;}rawPixels=null;tintedPixels=null;}};
}
root.GridderChebbyAvatar={create};
})(window);
