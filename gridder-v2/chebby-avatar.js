/* Original Chebby head pixels with six articulated canvas legs.
   Gameplay transforms and eye reactions use the pause-aware game clock. */
(function(root){
'use strict';
let serial=0;
function create(scene){
 const key='gridder-chebby-head-'+(++serial),texture=scene.textures.createCanvas(key,256,208);
 const context=texture.getContext(),image=scene.add.image(0,0,key).setDepth(24.1).setOrigin(124/256,128/208).setVisible(false);
 let info={ready:false,visible:false,mood:'happy',frame:null};
 const makeLayer=()=>{const canvas=document.createElement('canvas');canvas.width=192;canvas.height=208;return {canvas,context:canvas.getContext('2d',{willReadFrequently:true})};};
 const sourceLayer=makeLayer(),layers=[makeLayer(),makeLayer(),makeLayer()];
 let sourceIdentity=null,sourceRevision=null,layerEyes=null,layerColour=null,rawPixels=null,tintedPixels=null,lastPixels=null,lastLegs=[];
 const stats={uploads:0,compositions:0,sourceReads:0,layerBuilds:0};
 const multiply=(colour,tint)=>{let result=0;for(const shift of [16,8,0])result|=Math.round((colour>>shift&255)*(tint>>shift&255)/255)<<shift;return '#'+result.toString(16).padStart(6,'0');};
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
   if(index===2)c.ellipse(84,88,43,35,0,0,Math.PI*2);
   else if(index===0){c.moveTo(0,18);c.lineTo(59,18);c.lineTo(59,100);c.lineTo(46,126);c.lineTo(0,130);c.closePath();}
   else{c.moveTo(105,10);c.lineTo(171,10);c.lineTo(171,110);c.lineTo(124,112);c.lineTo(107,86);c.closePath();}
   c.clip();
   if(index!==2){c.beginPath();c.rect(0,0,192,208);c.ellipse(84,88,43,35,0,0,Math.PI*2);c.clip('evenodd');}
   c.drawImage(sourceLayer.canvas,0,0);c.restore();
  });
  layerColour=colour;stats.layerBuilds++;return true;
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
  // Mirrored fans need the same rotation sign for opposite outer-tip motion.
  const swing=Math.sin(gaitPhase)*.22*amplitude,gillAngles=[swing,swing];
  info.walking=walking;info.heading=state.heading||0;info.direction=state.direction?[...state.direction]:[0,0];info.bridging=!!state.bridging;
  info.gaitAmplitude=amplitude;info.settling=!!state.settling;info.gaitPhase=gaitPhase;info.gillAngles=[...gillAngles];
  const colour=state.tint??(state.mood==='fear'?0xe1dcff:state.mood==='pushing'?0xffbfdc:0xffffff);
  const revision=source.revision??JSON.stringify(source.pose??{});
  const eyes=root.GridderBoardEyes.describe(state,source.pose);info.eyes=eyes;
  const layersChanged=prepareLayers(source,revision,colour,eyes);
  // Position, heading and board zoom are Image transforms, not texture changes.
  const pixelKey=JSON.stringify([amplitude?gaitPhase:0,amplitude,colour,revision,eyes.key]);
  if(layersChanged||pixelKey!==lastPixels){
  stats.compositions++;
  context.clearRect(0,0,256,208);context.save();context.translate(40,40);
  const legs=[];
  // Six independently bent crab legs; alternating stance and lifted recovery.
  context.lineCap='round';context.lineJoin='round';
  for(const side of [-1,1])for(let index=0;index<3;index++){
   const phase=gaitPhase+index*1.7+(side>0?Math.PI:0);
   const stride=Math.sin(phase)*12*amplitude,lift=(1+Math.cos(phase))*4.5*amplitude;
   const start=[84+side*30,77+index*13];
   const knee=[84+side*(58.5+Math.cos(phase)*4*amplitude),67.25+index*19.75+stride*.45];
   const tip=[84+side*78,77.75+index*22+stride-lift];
   legs.push({side,index,phase,root:start,knee,tip});
   const path=()=>{context.beginPath();context.moveTo(...start);context.quadraticCurveTo(84+side*46.5,start[1]-9,...knee);context.quadraticCurveTo(knee[0]+side*11.25,knee[1]+2.25,...tip);};
   path();context.strokeStyle=multiply(0x412347,colour);context.lineWidth=6.75;context.stroke();
   path();context.strokeStyle=multiply(index===1?0xf99dd7:0xbfa0fa,colour);context.lineWidth=4.5;context.stroke();
   path();context.strokeStyle=multiply(0xa3fff0,colour);context.lineWidth=1.3;context.stroke();
  }
  lastLegs=legs;
  // Reuse cached, masked original artwork: only these transforms vary in gait.
  for(let side=0;side<2;side++){
   context.save();const pivotX=side?119:50,pivotY=86;
   context.translate(pivotX,pivotY);context.rotate(gillAngles[side]);context.scale(1-.1*amplitude,1);context.translate(-pivotX,-pivotY);
   context.drawImage(layers[side].canvas,0,0);context.restore();
  }
  context.drawImage(layers[2].canvas,0,0);context.restore();
  texture.refresh();stats.uploads++;lastPixels=pixelKey;
  }
  info.legs=lastLegs;info.performance={...stats};
  const bob=Math.sin(gaitPhase*2)*.4*state.scaleY*amplitude;
  // Stops and pause are upright, including fear/relief: no idle body wobble.
  image.setPosition(state.x,state.y+bob).setScale(.25*state.scaleX,.25*state.scaleY).setAngle(state.capture?state.angle:info.heading).setAlpha(state.alpha??1);
  image.setTint(0xffffff);info.tint=colour;
  info.x=image.x;info.y=image.y;info.angle=image.angle;info.scaleX=image.scaleX;info.scaleY=image.scaleY;
 }
 return {image,available,render,animationState(){return {walking:!!info.walking,settling:!!info.settling};},get diagnostics(){return {...info,captureMouth:info.captureMouth?{...info.captureMouth}:null,legs:info.legs?.map(leg=>({...leg,root:[...leg.root],knee:[...leg.knee],tip:[...leg.tip]}))||[],direction:info.direction?[...info.direction]:[0,0],gillAngles:info.gillAngles?[...info.gillAngles]:[0,0],pose:info.pose?{...info.pose}:null,sourceCrop:info.sourceCrop?{...info.sourceCrop}:null};},destroy(){image.destroy();scene.textures.remove(key);for(const layer of [sourceLayer,...layers]){layer.canvas.width=0;layer.canvas.height=0;}rawPixels=null;tintedPixels=null;}};
}
root.GridderChebbyAvatar={create};
})(window);
