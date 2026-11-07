/* Native Phaser vector actors. Grid indices become pixels only through geometry.px/py.
   px increases right; py decreases up. Collision radii remain in screen pixels. */
(function(root){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
// Pure presentation state: reference-distance phase, finite gait/turn envelopes.
function createGait(){
 const stridePixels=56,quarterTurnMs=160;
 let game=null,walker=null,clock=-1,position=null,direction=[0,0],moved=false,distance=0,travel=[0,0],sampleTime=0,lastMoveTime=-Infinity;
 let target=0,from=0,transitionTime=0,lastTime=-1;
 let headingFrom=0,headingTo=0,headingTime=0,headingDuration=0;
 const smooth=p=>{p=clamp(p,0,1);return p*p*(3-2*p);};
 const amplitudeAt=time=>mix(from,target,smooth((time-transitionTime)/(target?120:160)));
 const headingAt=time=>headingDuration?mix(headingFrom,headingTo,smooth((time-headingTime)/headingDuration)):headingTo;
 const turnDelta=(a,b)=>((b-a+180)%360+360)%360-180;
 const facingAngle=dir=>dir[0]>0?-90:dir[0]<0?90:dir[1]>0?180:0;
 function update(s,pos,now,b){
  const time=Number.isFinite(s.gaitTime)?s.gaitTime:now;
  if(game!==s.game||walker!==s.walker||now<clock||time<lastTime){
   game=s.game;walker=s.walker;clock=-1;position=null;direction=[0,0];moved=false;distance=0;travel=[0,0];lastMoveTime=-Infinity;target=0;from=0;transitionTime=time;
   headingFrom=headingTo=0;headingTime=time;headingDuration=0;lastTime=time;
  }
  const active=!!(s.playing&&!s.deathScene&&!s.gameOver&&!s.game?.complete?.());
  const reducedMotion=!!s.reducedMotion||!!root.GridderTheme?.reducedMotion?.();
  // Hard pause/capture preserve the last presented facing rather than let a
  // presentation-time jump finish a turn while the simulation is frozen.
  let bodyHeading=headingAt(active?time:lastTime);
  if(!active){headingFrom=headingTo=bodyHeading;headingTime=time;headingDuration=0;}
  if(now!==clock){
   const dx=position?pos.i-position.i:0,dy=position?pos.j-position.j:0;
   moved=active&&Math.hypot(dx,dy)>1e-7;
   if(moved){
    lastMoveTime=time;
    const last=s.lastTravel;direction=last&&dx*last[0]+dy*last[1]>1e-7?[...last]:Math.abs(dx)>=Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
    const scale=root.GridderSpriteMetrics?.scale(b)??1;
    const rx=dx*b.cellWidth/scale,ry=-dy*b.cellHeight/scale;
    distance+=Math.hypot(rx,ry);travel[0]+=rx;travel[1]+=ry;
    const desired=facingAngle(direction),delta=turnDelta(headingTo,desired);
    if(Math.abs(delta)>1e-9){
     headingFrom=bodyHeading;headingTo=bodyHeading+turnDelta(bodyHeading,desired);headingTime=time;
     headingDuration=quarterTurnMs*Math.abs(headingTo-headingFrom)/90;
    }
   }
   clock=now;position={i:pos.i,j:pos.j};sampleTime=time;
  }
  if(reducedMotion){
   bodyHeading=direction.some(Boolean)?facingAngle(direction):bodyHeading;
   headingFrom=headingTo=bodyHeading;headingDuration=0;headingTime=time;
  }
  // Preserve a final actual displacement even when its input command just ended.
  const walking=!!(active&&moved&&(s.moving||time===sampleTime));
  const bridging=!!(!walking&&active&&s.moving&&s.centreWaiting&&s.centrePauseMs<=90&&time-lastMoveTime<=90);
  const gaitActive=walking||bridging;
  let amplitude=amplitudeAt(time);
  if(!active||reducedMotion){target=0;from=0;transitionTime=time;amplitude=0;}
  else if(target!==Number(gaitActive)){from=amplitude;target=Number(gaitActive);transitionTime=time;}
  lastTime=time;
  const turning=!!(active&&!reducedMotion&&headingDuration&&time-headingTime<headingDuration);
  const settling=!reducedMotion&&(bridging||Math.abs(amplitude-target)>1e-6||turning);
  const angle=bodyHeading*Math.PI/180;
  return {walking,bridging,direction:[...direction],screenDirection:[direction[0],-direction[1]],
   heading:gaitActive?facingAngle(direction):0,headHeading:gaitActive?facingAngle(direction):0,bodyHeading,bodyDirection:direction.some(Boolean)?[-Math.sin(angle),-Math.cos(angle)]:[0,0],
   targetBodyHeading:headingTo,turning,reducedMotion,gaitDistance:distance,gaitTravel:[...travel],stridePixels,
   gaitPhase:distance*Math.PI*2/stridePixels,gaitAmplitude:amplitude,settling};
 }
 return {update};
}
function create(scene){
 const pieces=scene.add.graphics(),spiders=[scene.add.graphics(),scene.add.graphics()],player=scene.add.graphics(),shield=scene.add.graphics(),overlay=scene.add.graphics();
 const angel=scene.add.image(0,0,'resurrection',0).setVisible(false);
 const title=scene.add.text(0,0,'',{fontFamily:'system-ui, sans-serif',fontStyle:'bold',fontSize:'38px',color:'#593196',align:'center'}).setOrigin(.5);
 const subtitle=scene.add.text(0,0,'',{fontFamily:'system-ui, sans-serif',fontSize:'18px',color:'#593196',align:'center'}).setOrigin(.5);
 const objects=[pieces,...spiders,shield,player,angel,overlay,title,subtitle];objects.forEach((o,i)=>o.setDepth(20+i));
 const centipede=scene.add.graphics().setDepth(22.5);spiders.push(centipede);objects.push(centipede);
 const angelPartner=scene.add.image(0,0,'resurrection',4).setDepth(25).setVisible(false);objects.push(angelPartner);
 const angels=Object.freeze([angel,angelPartner]);
 const chebby=root.GridderChebbyAvatar?.create(scene);
 const bombFX=scene.add.graphics().setDepth(23.2),bombLabels=[];objects.push(bombFX);
 const boostTrail=scene.add.graphics().setDepth(20.5),boostHalo=scene.add.graphics().setDepth(22.9);objects.push(boostTrail,boostHalo);
 const captureFX=scene.add.graphics().setDepth(24.15);objects.push(captureFX);
 let resurrection={visible:false,frames:[],bounds:[]};
 const graphics=Object.freeze({player,spiders:Object.freeze(spiders.slice(0,2)),centipede,get enemies(){return spiders.slice();},blood:shield,pieces,bombs:bombFX,angels,chebby:chebby?.image});
 const eggs=scene.add.graphics().setDepth(22.4),eggLabels=[];objects.push(eggs);
 // Separate persistent layers: shots are in board space, hand follows the head.
 const projectiles=scene.add.graphics().setDepth(23.1),weaponHand=scene.add.graphics().setDepth(24.2);objects.push(projectiles,weaponHand);
 const gait=createGait();
 function travelPose(s,pos,clock,b){const pose=gait.update(s,pos,clock,b);diagnostic.gait=pose;return pose;}
 let gameIdentity=null,lastEmotionClock=-1,lastEmotionPosition=null,afraid=false,reliefUntil=0,emotion='happy',movingPose=false;
 let diagnostic={emotion,nearKind:null,clearance:Infinity,reliefUntil:0,clock:0,capturePhase:null,drinkingKinds:[],creatures:[]};
 // Exclusive vascular colours, separate from the red fangs for pixel-level QA.
 const BLOOD={halo:0xff083f,core:0xff234b,light:0xff7984,bead:0xffd1b8};
 function line(g,pts,color=0x30213f,width=1.5,alpha=1){g.lineStyle(width,color,alpha);g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.strokePath();}
 function circle(g,x,y,r,color,stroke){g.fillStyle(color,1);g.fillCircle(x,y,r);if(stroke!==undefined){g.lineStyle(1.6,stroke,1);g.strokeCircle(x,y,r);}}
 function poly(g,pts,color,stroke){g.fillStyle(color,1);g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));g.closePath();g.fillPath();if(stroke!==undefined){g.lineStyle(.8,stroke,1);g.strokePath();}}
 function fragment(g,x,y,r,angle,shape){const a=angle*Math.PI/180,s=r/8,c=Math.cos(a),sn=Math.sin(a);const p=[[-5,-2],[-1,-5],[4,-3],[5,2],[1,5],[-4,3]].map(([u,v])=>[x+(u*c-v*sn)*s,y+(u*sn+v*c)*s]);poly(g,p,[0x858a40,0x705832,0xe6e7bc,0x000080][shape%4],0xbda477);circle(g,x,y,1.6*s,shape===2?0x5c5136:0xb1a45b);}
 function tint(a,b,p){return (Math.round(mix(a>>16&255,b>>16&255,p))<<16)|(Math.round(mix(a>>8&255,b>>8&255,p))<<8)|Math.round(mix(a&255,b&255,p));}
 function bloodLine(g,points,width=1.5,effectScale=1){
  line(g,points,BLOOD.halo,(width+4)*effectScale,.16);line(g,points,BLOOD.core,width*effectScale,1);line(g,points,BLOOD.light,.6*effectScale,.95);
 }
 function flowBead(g,x,y,r=1,effectScale=1){g.fillStyle(BLOOD.halo,.28);g.fillCircle(x,y,(r+1.4)*effectScale);circle(g,x,y,r*effectScale,BLOOD.bead);}
 function vascular(g,clock){
  bloodLine(g,[[0,-12],[0,-5],[0,1],[0,7]],1.8);
  const branches=[];
  for(const side of [-1,1])for(let n=0;n<3;n++){
   const y=-5+n*5,points=[[0,y],[side*2.7,y-1],[side*4.6,y-3]];
   bloodLine(g,points,1.1);branches.push(points);
   bloodLine(g,[[side*2.7,y-1],[side*4.6,y+.6]],.8);
  }
  for(let k=0;k<3;k++)flowBead(g,0,-12+((clock/430+k/3)%1)*19,.9);
  for(let n=0;n<branches.length;n++){
   const q=branches[n],t=(clock/530+n*.19)%1;
   flowBead(g,mix(q[0][0],q[2][0],t),mix(q[0][1],q[2][1],t),.65);
  }
 }
 function fangs(g,jaw){
  for(const side of [-1,1]){
   const fang=[[side*(4+jaw),-11],[side,-18],[side*(1+jaw),-11]];
   poly(g,fang,0xef1717,0xa30707);
   const tooth=[[.8,.1,.1],[.1,.8,.1],[.1,.1,.8]].map(weights=>[
    weights.reduce((sum,weight,index)=>sum+weight*fang[index][0],0),
    weights.reduce((sum,weight,index)=>sum+weight*fang[index][1],0)
   ]);
   poly(g,tooth,0xfff4d6);
  }
 }
 function chooseEmotion(s,b,pos,clock){
  const unit=root.GridderSpriteMetrics?.scale(b)??1;
  let nearest=null,clearance=Infinity;
  if(s.spidersEnabled)for(const sp of s.chase.spiders){
   if(sp.eating)continue;
   const at=s.chase.position(sp),d=Math.hypot(b.px(at.i)-b.px(pos.i),b.py(at.j)-b.py(pos.j))-((11*(root.GridderSpriteMetrics?.playerScale??1.25)+7*(sp.sizeScale||1))*(root.GridderSpriteMetrics?.scale(b)??1));
   if(d<clearance){clearance=d;nearest={kind:sp.kind,at};}
  }
  if(s.spidersEnabled)for(const leech of s.leeches||[]){
   const at=leech.position,d=Math.hypot(b.px(at.i)-b.px(pos.i),b.py(at.j)-b.py(pos.j))-18*unit;
   if(d<clearance){clearance=d;nearest={kind:leech.kind||'leech',at};}
  }
  if(!s.spidersEnabled){afraid=false;reliefUntil=0;}
  const fresh=gameIdentity!==s.game||clock<lastEmotionClock;
  if(fresh){gameIdentity=s.game;afraid=false;reliefUntil=0;lastEmotionPosition=null;lastEmotionClock=-1;}
  // Repeated paints of the same snapshot cannot advance expression history.
  if(clock!==lastEmotionClock||!lastEmotionPosition||pos.i!==lastEmotionPosition.i||pos.j!==lastEmotionPosition.j){
   if(!s.deathScene&&!s.gameOver){
    if(afraid&&clearance>=95*unit){afraid=false;reliefUntil=clock+1200;}
    else if(!afraid&&clearance<=60*unit){afraid=true;reliefUntil=0;}
   }
   lastEmotionClock=clock;lastEmotionPosition={i:pos.i,j:pos.j};
  }
  if(fresh||s.playing!==false)movingPose=!!s.moving;
  const phase=s.deathScene?.phase().name;
  emotion=s.gameOver?'game-over':phase?(phase==='bite'||phase==='swell'?'draining':phase==='decay'?'decaying':'scattering'):
   s.playerPushes?.length?'pushing':afraid?'fear':clock<reliefUntil?'relief':movingPose?'moving':'happy';
  diagnostic={emotion,nearKind:nearest?.kind||null,clearance,reliefUntil,clock,capturePhase:phase||null,drinkingKinds:[],creatures:[]};
  return nearest;
 }
 function face(g,fill,effort,puffed,clock,look=0,mood='happy',lookY=0){
  if(chebby?.available()){
   // Keep effort and fear sweat outside the original illustrated face.
   if(effort){const t=clock/140%1;for(const side of [-1,1])poly(g,[[side*12,-13+t*8],[side*15,-7+t*8],[side*11,-6+t*8]],0x40b6ef,0x187ead);}
   else if(mood==='fear'){const t=clock/260%1;poly(g,[[9,-8+t*4],[12,-3+t*4],[8,-3+t*4]],0x79dcff,0x3d91bd);}
   else if(mood==='relief'){const t=clock/400%1;line(g,[[9,4],[11+t*3,3],[13+t*3,4]],0xb2eee9,1.1,1-t*.6);}
   return;
  }
  circle(g,0,0,11,fill,0xbca2e5);
  g.fillStyle(0xffffff,.25);g.fillEllipse(-4,-7,5,2.5);g.fillStyle(0x261235,.15);g.fillEllipse(1,7,11,3);
  const bob=mood==='moving'?Math.sin(clock/75)*.8:0;
  const fear=mood==='fear',draining=mood==='draining',relieved=mood==='relief';
  if(relieved){
   line(g,[[-7,-2],[-5,-.5],[-2,-2]],0x221331,1.7);line(g,[[2,-2],[4,-.5],[7,-2]],0x221331,1.7);
  }else{
   g.fillStyle(0xffffff);g.fillRoundedRect(-7,-5+bob,5,fear?7.5:6,1);g.fillRoundedRect(2,-5+bob,5,fear?7.5:6,1);
   const pupil=fear?1.2:1.6,dx=clamp(look,-1.1,1.1),dy=clamp(lookY,-.8,.8);
   circle(g,-4.5+dx,-2+bob+dy,pupil,0x221331);circle(g,4.5+dx,-2+bob+dy,pupil,0x221331);
   if(draining){line(g,[[-7,-5],[-2,-3]],0x71366b,1.8);line(g,[[2,-3],[7,-5]],0x71366b,1.8);}
  }
  if(effort){
   line(g,[[-7,-7],[-2,-4]],0x3b153e,2);line(g,[[2,-4],[7,-7]],0x3b153e,2);
   g.fillStyle(0xffffff);g.fillRoundedRect(-4,4,8,3,1);line(g,[[0,4],[0,7]],0x221331,1);
   const t=clock/140%1;for(const side of [-1,1])poly(g,[[side*12,-13+t*8],[side*15,-7+t*8],[side*11,-6+t*8]],0x40b6ef,0x187ead);
  }else if(puffed){
   g.fillStyle(0x130e38);g.fillEllipse(0,5.5,5.2,6.2);poly(g,[[-.8,6],[2.1,6.5],[3.9,10],[2.5,12],[.1,8.6]],0xef1717,0xa30707);line(g,[[-7,-6],[-5,-8],[-1,-8]],0xa6b6ff,2);
  }else if(fear||draining){
   g.fillStyle(0x311536);g.fillEllipse(0,5.5,3.5,fear?5.5:4);
   line(g,[[-7,-7],[-3,-8]],0x3b153e,1.5);line(g,[[3,-8],[7,-7]],0x3b153e,1.5);
   if(fear){const t=clock/260%1;poly(g,[[9,-8+t*4],[12,-3+t*4],[8,-3+t*4]],0x79dcff,0x3d91bd);}
  }else if(relieved){
   g.fillStyle(0x301732);g.fillEllipse(0,5,8,4);g.fillStyle(0xffffff);g.fillRect(-3,3.5,6,1.5);
   const t=clock/400%1;line(g,[[9,4],[11+t*3,3],[13+t*3,4]],0xb2eee9,1.1,1-t*.6);
  }else{
   line(g,[[-4,5+bob*.4],[-1,7+bob*.4],[2,7+bob*.4],[4,5+bob*.4]],0x221331,1.5);
   if(mood==='moving'){g.fillStyle(0xf372ba,.6);g.fillEllipse(-7,3,3,2);g.fillEllipse(7,3,3,2);}
  }
 }
 function spiderBody(g,sp,clock,drinking,bloodClock,jaw,species){
  const body=species?.body??(sp.kind==='black'?0x16121b:0xffffff),eye=species?.eye??(sp.kind==='black'?0xffffff:0x16121b);
  const sweeping=sp.lastBrush&&sp.lastBrush.elapsed<350;
  for(const side of [-1,1])for(let leg=0;leg<4;leg++){
   const ph=clock/95+leg*Math.PI+(side===1?Math.PI:0)+(sp.kind==='white'?.8:0);
   const swing=Math.sin(ph)+(sweeping&&leg===1?Math.sin(sp.lastBrush.elapsed/350*Math.PI)*2:0),y=(leg-1.5)*4;
   const knee=[side*(10+Math.abs(swing)),y+(leg-1.5)*2+swing*2],tip=[side*(16+Math.cos(ph)),y+(leg-1.5)*4+swing*3];
   line(g,[[side*4,y],knee,tip],(species?.accent??0xb8a2c9),3.8);line(g,[[side*4,y],knee,tip],body,2.1);circle(g,...knee,.9,sp.kind==='black'?0x80708e:0xc8badb);
  }
  g.fillStyle(body);g.fillEllipse(0,0,14,18);g.lineStyle(1.5,(species?.accent??0xb8a2c9));g.strokeEllipse(0,0,14,18);circle(g,0,-8,5,body,(species?.accent??0xb8a2c9));
  g.fillStyle(sp.kind==='black'?0xb59be4:0x513269,sp.kind==='black'?.32:.16);g.fillEllipse(-2,-1,4.5,9);
  g.fillStyle(0xffffff,sp.kind==='black'?.6:.9);g.fillEllipse(-1,-11,3,1.5);
  // Raised abdomen bands and joints leave the black/white identity intact.
  for(const y of [-1,3,6])line(g,[[-4,y],[-1,y+1],[3,y]],sp.kind==='black'?0x574568:0xc1b0d1,.7,.7);
  if(drinking)vascular(g,bloodClock);
  circle(g,-2,-9,1.25,eye);circle(g,2,-9,1.25,eye);
  line(g,[[-4,-11],[-1,-10]],sp.kind==='black'?0xe1c9ff:0x382448,.9);line(g,[[1,-10],[4,-11]],sp.kind==='black'?0xe1c9ff:0x382448,.9);
  if(sp.eating){g.fillStyle(0x6e1616);g.fillEllipse(0,-12,5.6,3);}
  fangs(g,jaw);
 }
 function speciesBody(g,sp,clock,drinking,bloodClock,jaw,species,attackTail){
  if(species.shape==='spider'){spiderBody(g,sp,clock,drinking,bloodClock,jaw,species);return 8;}
  const {shape,body,accent,eye}=species,mantis=shape==='mantis',crab=shape==='crab',scorpion=shape==='scorpion';
  const pairs=mantis?2:(crab||scorpion?4:3),sweeping=sp.lastBrush&&sp.lastBrush.elapsed<350;
  // Distinct appendages share the supplied movement/feeding clock and growth transform.
  for(const side of [-1,1])for(let n=0;n<pairs;n++){
   const phase=clock/95+n*Math.PI+(side>0?Math.PI:0),swing=Math.sin(phase)+(sweeping&&n===1?Math.sin(sp.lastBrush.elapsed/350*Math.PI)*2:0);
   const y=(n-(pairs-1)/2)*4+(mantis?4:0),spread=crab?20:mantis?14:16;
   const knee=[side*(spread*.68+Math.abs(swing)),y-2+swing*2],tip=[side*(spread+Math.cos(phase)),y+4+swing*3];
   line(g,[[side*4,y],knee,tip],accent,3);line(g,[[side*4,y],knee,tip],body,1.7);circle(g,...knee,.8,eye);
  }
  if(scorpion&&!attackTail){
   const sway=Math.sin(clock/170)*2.5,tail=[[0,5],[1,13],[6+sway,18],[12+sway,15],[13+sway,7]];
   line(g,tail,accent,6);line(g,tail,body,3.5);
   for(const point of tail.slice(1))circle(g,...point,2.4,body,accent);
   poly(g,[[13+sway,7],[8+sway,3],[10+sway,10]],accent,body);
  }
  if(crab){
   poly(g,[[-10,-5],[-12,2],[-7,8],[7,8],[12,2],[10,-5],[0,-8]],body,accent);
   line(g,[[-8,-2],[0,2],[8,-2]],accent,1.2);
  }else if(mantis){
   poly(g,[[-3,-5],[-5,8],[0,13],[5,8],[3,-5]],body,accent);
   line(g,[[0,-5],[0,9]],accent,1.2);
  }else{
   g.fillStyle(body);g.fillEllipse(0,2,shape==='beetle'?18:15,20);g.lineStyle(1.6,accent);g.strokeEllipse(0,2,shape==='beetle'?18:15,20);
   if(shape==='beetle'){line(g,[[0,-7],[0,11]],accent,1.4);for(const side of [-1,1])line(g,[[side*2,-5],[side*6,0],[side*5,7]],eye,.8,.65);}
   if(shape==='thornbug')for(const side of [-1,1])for(let n=0;n<3;n++)poly(g,[[side*5,-4+n*5],[side*(11+(n===1?2:0)),-7+n*5],[side*7,1+n*5]],accent,body);
  }
  if(crab||scorpion)for(const side of [-1,1]){
   const clench=jaw+Math.sin(clock/150)*.5,knee=[side*12,-5],claw=[side*(crab?19:16),-10];
   line(g,[[side*6,-3],knee,claw],accent,4);line(g,[[side*6,-3],knee,claw],body,2);
   poly(g,[[claw[0]-side*4,-8],[claw[0]-side*(2+clench),-17],[claw[0]+side*3,-10]],body,accent);
   poly(g,[[claw[0]+side*3,-8],[claw[0]+side*(4+clench),-15],[claw[0]+side*5,-6]],accent,body);
  }
  if(mantis)for(const side of [-1,1]){
   const strike=Math.sin(clock/125)*1.7+jaw;
   line(g,[[side*3,-5],[side*(12+strike),-15],[side*9,-3]],accent,4);
   line(g,[[side*3,-5],[side*(12+strike),-15],[side*9,-3]],body,2);
   for(let n=0;n<3;n++)poly(g,[[side*(9+n),-5-n*3],[side*(6+n),-5-n*3],[side*(10+n),-8-n*3]],eye);
  }
  if(mantis)poly(g,[[-6,-11],[6,-11],[0,-4]],body,accent);
  else circle(g,0,-8,5,body,accent);
  if(shape==='beetle'||shape==='thornbug')for(const side of [-1,1]){
   line(g,[[side*3,-10],[side*6,-16],[side*9,-17+Math.sin(clock/130+side)]],accent,1.3);
   circle(g,side*9,-17+Math.sin(clock/130+side),1,eye);
  }
  g.fillStyle(eye,.3);g.fillEllipse(-2,-1,3,6);
  if(drinking)vascular(g,bloodClock);
  for(const side of [-1,1]){if(crab)line(g,[[side*3,-8],[side*5,-12]],accent,1.5);circle(g,side*(crab?5:2.4),crab?-12:-9,1.4,eye);}
  if(sp.eating){g.fillStyle(0x6e1616);g.fillEllipse(0,-12,5.6,3);}
  fangs(g,jaw);
  if(attackTail){
   line(g,attackTail,accent,6);line(g,attackTail,body,3.5);
   for(const q of attackTail.slice(1,-1))circle(g,...q,2.4,body,accent);
   const tip=attackTail[attackTail.length-1];poly(g,[[tip[0]-3,tip[1]+5],tip,[tip[0]+3,tip[1]+5]],eye,accent);
   if(drinking){const route=attackTail.slice().reverse();bloodLine(g,route,1.5);for(let n=0;n<route.length-1;n++){const t=(bloodClock/350+n*.21)%1;flowBead(g,mix(route[n][0],route[n+1][0],t),mix(route[n][1],route[n+1][1],t),.85);}}
  }
  return pairs*2+(mantis?2:0);
 }
 // World-anchored stance feet and distance-driven alternating tripod steps.
 // Phaser's rotation/scale is inverted to draw the solved limbs locally.
 const monsterGaits=new WeakMap();
 function spiderPose(sp,xx,yy,angle,scale,b,clock,reduced,trackX,trackY){
  const rad=angle*Math.PI/180,c=Math.cos(rad),sn=Math.sin(rad),world=q=>({x:xx+(q[0]*c-q[1]*sn)*scale,y:yy+(q[0]*sn+q[1]*c)*scale}),local=q=>[(q.x-xx)*c/scale+(q.y-yy)*sn/scale,-(q.x-xx)*sn/scale+(q.y-yy)*c/scale];
  let state=monsterGaits.get(sp),dx=state?trackX-state.x:0,dy=state?trackY-state.y:0,dist=Math.hypot(dx,dy);
  if(!state||clock<state.clock||state.w!==b.cellWidth||state.h!==b.cellHeight||dist>Math.max(b.cellWidth,b.cellHeight)*2||state.reduced!==reduced){state={x:trackX,y:trackY,w:b.cellWidth,h:b.cellHeight,clock,reduced,distance:0,legs:[]};monsterGaits.set(sp,state);dx=dy=dist=0;}
  if(!reduced)state.distance+=dist/Math.max(scale,.001);
  const phase=reduced?0:state.distance/30,limbs=[];
  for(let row=0;row<3;row++)for(const side of [-1,1]){
   const n=row*2+(side>0?1:0),legPhase=phase+((row+(side>0?1:0))%2)*.5,step=Math.floor(legPhase),lp=legPhase-step,swing=!reduced&&lp>=.62,root=[side*(5+row*.35),-7+row*7],base=[side*(27+row*1.2),-17+row*17];
   let leg=state.legs[n];if(!leg){const foot=world(base);leg=state.legs[n]={anchor:foot,from:foot,to:foot,swing:false,step};}
   // A slow frame can skip a whole swing. Replant at the new cycle rather
   // than keeping a stale foot until it is dragged by the reach limit.
   if(step>leg.step){leg.anchor=leg.swing&&step===leg.step+1?{...leg.to}:world(base);leg.swing=false;leg.step=step;}
   if(swing&&!leg.swing){leg.from={...leg.anchor};const ahead=dist>1e-6?{x:dx/dist*8*scale,y:dy/dist*8*scale}:{x:0,y:0},target=world(base);leg.to={x:target.x+ahead.x,y:target.y+ahead.y};}
   if(!swing&&leg.swing)leg.anchor={...leg.to};
   leg.swing=swing;let foot=leg.anchor,lift=0;
   if(swing){const t=clamp((lp-.62)/.38,0,1),e=t*t*(3-2*t);lift=Math.sin(Math.PI*t)*4*scale;foot={x:mix(leg.from.x,leg.to.x,e),y:mix(leg.from.y,leg.to.y,e)-lift};}
   let target=local(foot),vx=target[0]-root[0],vy=target[1]-root[1],d=Math.hypot(vx,vy),max=51.8;
   if(d>max){const clipped=max/d;target=[root[0]+vx*clipped,root[1]+vy*clipped];vx=target[0]-root[0];vy=target[1]-root[1];d=Math.hypot(vx,vy);if(!swing)leg.anchor=world(target);}
   const along=d/2,height=Math.sqrt(Math.max(0,26*26-along*along)),bend=side*(row===1?-1:1),joint=d<1e-9?[root[0],root[1]+26*bend]:[root[0]+vx/d*along-vy/d*height*bend,root[1]+vy/d*along+vx/d*height*bend];
   limbs.push({name:(side<0?'left-':'right-')+(row+1),root,joint,tip:target,phase:lp,step,stance:!swing,footLift:lift});
  }
  state.x=trackX;state.y=trackY;state.clock=clock;return {limbs,phase,distance:state.distance};
 }
 // Folklore rigs use travelled distance rather than wall time, so the same
 // paused or redrawn snapshot produces the same pose and projected offset.
 const folkloreGaits=new WeakMap(),folkloreIds=new Set(['broom-witch','hen-leg-house','boruta','sheet-ghost','wisp-ghost']);
 function folkloreMotion(sp,x,y,scale,b,clock,reduced){
  let st=folkloreGaits.get(sp),dx=st?x-st.x:0,dy=st?y-st.y:0,dist=Math.hypot(dx,dy);
  if(!st||clock<st.clock||st.w!==b.cellWidth||st.h!==b.cellHeight||dist>Math.max(b.cellWidth,b.cellHeight)*2||st.reduced!==reduced){st={x,y,w:b.cellWidth,h:b.cellHeight,clock,reduced,distance:0};folkloreGaits.set(sp,st);dx=dy=dist=0;}
  if(!reduced)st.distance+=dist/Math.max(.001,scale);
  st.x=x;st.y=y;st.clock=clock;const phase=reduced?0:st.distance/30,step=Math.floor(phase),fraction=phase-step;
  return {state:st,phase,distance:st.distance,step,fraction,dx,dy,dist};
 }
 // A fixed elevated camera projects yawed local ground coordinates and height.
 // The Graphics object still has the actor heading, so projected points are
 // counter-rotated before drawing; its world transform then restores the camera.
 function folkloreBody(g,species,motion,xx,yy,angle,scale,reduced,legacyPose=null){
  const k=species.archetype,{body,accent,eye}=species,p=motion.fraction,yaw=angle*Math.PI/180,cy=Math.cos(yaw),sy=Math.sin(yaw),az=Math.PI/6,ca=Math.cos(az),sa=Math.sin(az),elevation=.8,vertical=Math.sqrt(1-elevation*elevation),focal=140;
  const vertices=[],faces=[],limbs=[],toes=[],names=new Set();let broom=null;
  const project=q=>{const [x,y,z]=q,rx=x*cy-y*sy,ry=x*sy+y*cy,u=ca*rx-sa*ry,v=sa*rx+ca*ry,depth=-vertical*v-elevation*z,denom=focal+depth,factor=focal/denom;return {x:u*factor,y:(elevation*v-vertical*z)*factor,depth};};
  const drawPoint=q=>{const z=project(q);return [z.x*cy+z.y*sy,-z.x*sy+z.y*cy];};
  const screen=q=>{const z=project(q);return {x:xx+z.x*scale,y:yy+z.y*scale};};
  // Invert the same perspective map on the ground plane z=0.
  const ground=point=>{const sx=(point.x-xx)/scale,py=(point.y-yy)/scale,v=py*focal/(focal*elevation+py*vertical),u=sx*(focal-vertical*v)/focal,rx=ca*u+sa*v,ry=-sa*u+ca*v;return [rx*cy+ry*sy,-rx*sy+ry*cy,0];};
  const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0),length=v=>Math.sqrt(dot(v,v)),sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]);
  const vertex=(name,q)=>{if(!names.has(name)){names.add(name);const z=project(q);vertices.push({name,local:[...q],screen:screen(q),depth:z.depth});}return name;};
  const face=(name,points,color,alpha=1)=>{const refs=points.map((q,i)=>vertex(name+'-'+i,q)),depth=points.reduce((n,q)=>n+project(q).depth,0)/points.length;faces.push({name,vertices:refs,depth,points,color,alpha});};
  const line3=(points,color,width=1,alpha=1)=>line(g,points.map(drawPoint),color,width,alpha);
  const limb=(name,root,joint,tip,extra={})=>{line3([root,joint,tip],0x241c27,4);line3([root,joint,tip],accent,2);limbs.push({name,root:drawPoint(root),joint:drawPoint(joint),tip:drawPoint(tip),root3d:[...root],joint3d:[...joint],tip3d:[...tip],upperLength3d:length(sub(joint,root)),lowerLength3d:length(sub(tip,joint)),...extra});};
  // Ground shadow is a camera-projected disk, independent of the sprite yaw.
  const shadow=Array.from({length:16},(_,i)=>drawPoint([Math.cos(i*Math.PI/8)*12,Math.sin(i*Math.PI/8)*9,0]));g.fillStyle(0x101521,.25);g.beginPath();g.moveTo(...shadow[0]);shadow.slice(1).forEach(q=>g.lineTo(...q));g.closePath();g.fillPath();
  const box=(name,x0,x1,y0,y1,z0,z1,colors)=>{
   face(name+'-front',[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],colors[0]);
   face(name+'-back',[[x1,y1,z0],[x0,y1,z0],[x0,y1,z1],[x1,y1,z1]],colors[1]);
   face(name+'-left',[[x0,y1,z0],[x0,y0,z0],[x0,y0,z1],[x0,y1,z1]],colors[2]);
   face(name+'-right',[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],colors[3]);
   face(name+'-top',[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],colors[4]);
  };
  const rgba=(color,alpha,points)=>{g.fillStyle(color,alpha);g.beginPath();const q=points.map(drawPoint);g.moveTo(...q[0]);q.slice(1).forEach(v=>g.lineTo(...v));g.closePath();g.fillPath();};
  let hop=0;
  if(k==='hen-leg-house'){
   const swing=!reduced&&p>=.58;hop=swing?6*Math.sin((p-.58)/.42*Math.PI):0;
   const st=motion.state,step=motion.step,root=[0,0,13+hop],base=[0,6,0];let leg=st.leg;
   if(!leg){const at=screen(base);leg=st.leg={anchor:at,from:at,to:at,swing:false,step};}
   if(step>leg.step){leg.anchor=leg.swing&&step===leg.step+1?{...leg.to}:screen(base);leg.swing=false;leg.step=step;}
   if(swing&&!leg.swing){leg.from={...leg.anchor};const ahead=motion.dist?{x:motion.dx/motion.dist*5*scale,y:motion.dy/motion.dist*5*scale}:{x:0,y:0},target=screen(base);leg.to={x:target.x+ahead.x,y:target.y+ahead.y};}
   leg.swing=swing;let foot=leg.anchor,lift=0;if(swing){const t=(p-.58)/.42,e=t*t*(3-2*t);lift=Math.sin(Math.PI*t)*4;foot={x:mix(leg.from.x,leg.to.x,e),y:mix(leg.from.y,leg.to.y,e)};}
   let tip=ground(foot);tip[2]=lift;let v=sub(tip,root),d=length(v);if(d>35.8){const factor=35.8/d;tip=add(root,v.map(n=>n*factor));v=sub(tip,root);d=length(v);if(!swing)leg.anchor=screen(tip);}
   const h=Math.sqrt(Math.max(0,18*18-d*d/4)),horizontal=Math.hypot(v[0],v[1]),n=horizontal>1e-8?[-v[1]/horizontal,v[0]/horizontal,0]:[1,0,0],joint=add(add(root,v.map(t=>t/2)),n.map(t=>t*h));
   limb('hen-leg',root,joint,tip,{stance:!swing,step,phase:p,footLift:lift*scale});
   for(const side of [-1,0,1]){const end=add(tip,[side*4,side===0?6:4,0]);line3([tip,end],0xe7b65c,1.8);toes.push({from:drawPoint(tip),to:drawPoint(end),from3d:[...tip],to3d:end});}
   const z=hop;box('house',-9,9,-7,7,12+z,24+z,[0xa76b40,0x76482e,0x6a402a,0xc18953,0xc49a63]);
   // Gabled roof, both pitches and both triangular gables.
   face('roof-left',[[-10,-8,24+z],[0,-8,31+z],[0,8,31+z],[-10,8,24+z]],0x684143);
   face('roof-right',[[0,-8,31+z],[10,-8,24+z],[10,8,24+z],[0,8,31+z]],0x98605a);
   face('gable-front',[[-9,-7,24+z],[9,-7,24+z],[0,-7,30+z]],0x765037);
   face('gable-back',[[9,7,24+z],[-9,7,24+z],[0,7,30+z]],0x765037);
   // Windows are on all four wall faces so they rotate with the cabin.
   for(const side of [-1,1]){const x=side*9.03,y=side*7.03;face('window-side-'+side,[[x,-3,16+z],[x,2,16+z],[x,2,21+z],[x,-3,21+z]],0xffe28b);face('window-end-'+side,[[-3,y,16+z],[3,y,16+z],[3,y,21+z],[-3,y,21+z]],0xffe28b);}
   box('chimney',4,6,2,4,27+z,34+z,[0x63453c,0x63453c,0x50372e,0x8d6251,0xa47b67]);
  }else if(k==='broom-witch'){
   hop=reduced?3:3+1.5*Math.sin(p*Math.PI*2);const z=hop;
   // The long shaft, shaped straw bundle and binding are true 3D faces so
   // they keep their depth relationship to the rider at every heading.
   box('witch-broom-shaft',-1,1,-28,21,8+z,10+z,[0xb6844b,0x8f5b31,0x704524,0xd2a061,0xe0b976]);
   face('witch-straw-top',[[-3,17,11+z],[-7,31,9+z],[7,31,9+z],[3,17,11+z]],0xf7c85c);
   face('witch-straw-side',[[-3,17,8+z],[-7,31,6+z],[7,31,6+z],[3,17,8+z]],0xc98b30);
   face('witch-straw-end',[[-7,31,6+z],[7,31,6+z],[7,31,9+z],[-7,31,9+z]],0xf9d779);
   for(let n=-2;n<=2;n++){const x=n*2;face('witch-straw-rib-'+n,[[x*.45,18,11.1+z],[x-.45,30.5,9.1+z],[x+.45,30.5,9.1+z]],0xffe6a2);}
   box('witch-broom-binding',-3.5,3.5,17,19,8+z,11.5+z,[0x644236,0x644236,0x4b302a,0x815847,0x92634c]);
   const front=[0,-28,9+z],rear=[0,31,8+z];broom={from:drawPoint(front),to:drawPoint(rear),bristles:[drawPoint([-7,31,8+z]),drawPoint([7,31,8+z])],from3d:front,to3d:rear};
   // Bent knees straddle the shaft, with contrasting boots on each foot.
   for(const side of [-1,1]){const a=reduced?0:Math.sin(p*Math.PI*2+side*.5)*.3,root=[side*3,2,16+z],joint=[side*7,2+4*Math.cos(a),16+z+4*Math.sin(a)],tip=[side*7+side*3*Math.cos(a),2+4*Math.cos(a)+3*Math.sin(a),13+z+4*Math.sin(a)];limb(side<0?'left-knee':'right-knee',root,joint,tip,{stance:false,step:motion.step,phase:p,footLift:0});box('witch-boot-'+side,tip[0]-2,tip[0]+2,tip[1]-3,tip[1]+2,tip[2]-1.6,tip[2]+1.6,[0x221d30,0x292137,0x221d30,0x473552,0x65536d]);}
   // A flared skirt and leaning torso make the seated rider distinct from the hat.
   face('witch-skirt-top',[[-7,-1,15+z],[7,-1,15+z],[8,7,12+z],[-8,7,12+z]],0x9c5ea0);
   face('witch-skirt-back',[[8,7,12+z],[-8,7,12+z],[-6,7,10+z],[6,7,10+z]],0x513357);
   box('witch-torso',-4.5,4.5,-5,2,15+z,25+z,[0x6e4b79,0x493250,0x55395f,0x9b6a9e,0xb182b3]);
   // Arms bend down to the shaft. Segment faces and hand boxes sort with
   // the rest of the model; the diagnostic joints retain fixed 3D lengths.
   for(const side of [-1,1]){const shoulder=[side*4,-3,23+z],elbow=[side*6,-8,17+z],hand=[side*2,-13,10+z];limb(side<0?'left-arm':'right-arm',shoulder,elbow,hand,{stance:false,step:motion.step,phase:p,footLift:0});
    face('witch-sleeve-upper-'+side,[[shoulder[0]-1,shoulder[1],shoulder[2]],[shoulder[0]+1,shoulder[1],shoulder[2]],[elbow[0]+1,elbow[1],elbow[2]],[elbow[0]-1,elbow[1],elbow[2]]],0x9b6a9e);
    face('witch-sleeve-lower-'+side,[[elbow[0]-1,elbow[1],elbow[2]],[elbow[0]+1,elbow[1],elbow[2]],[hand[0]+1,hand[1],hand[2]],[hand[0]-1,hand[1],hand[2]]],0x795282);
    box('witch-hand-'+side,hand[0]-1.5,hand[0]+1.5,hand[1]-1.5,hand[1]+1.5,hand[2]-1.5,hand[2]+1.5,[0xf0cba6,0xd9b08e,0xcda080,0xf3d3b0,0xffdebc]);
   }
   // Hair at the back and sides, with a face and projecting pointed nose.
   box('witch-hair',-4.5,4.5,-1,5,24+z,33+z,[0x735139,0x4b3029,0x66412f,0x996b44,0xb48451]);
   box('witch-head',-4,4,-5,1,24+z,32+z,[0xe8c3a3,0xc99b83,0xc18e76,0xf3d2b0,0xf2d4b6]);
   for(const side of [-1,1]){const x=side*2;face('witch-eye-'+side,[[x-.7,-5.08,28+z],[x+.7,-5.08,28+z],[x+.7,-5.08,29.5+z],[x-.7,-5.08,29.5+z]],0x262332);}
   face('witch-nose-left',[[-1,-5,27+z],[1,-5,27+z],[0,-9,25.5+z]],0xd29a7e);face('witch-nose-right',[[1,-5,27+z],[1,-5,29+z],[0,-9,25.5+z]],0xf8d0ab);
   // Wide brim plus a slimmer, bent pointed cone, seen clearly from above.
   const brim=[[-8,-7,32+z],[8,-7,32+z],[8,7,32+z],[-8,7,32+z]],base=[[-4.5,-4,32.2+z],[4.5,-4,32.2+z],[4.5,4,32.2+z],[-4.5,4,32.2+z]],bend=[0,-2,39+z],tip=[0,-10,39+z];
   face('witch-brim',brim,0x36263f);for(let n=0;n<4;n++)face('witch-hat-cone-'+n,[base[n],base[(n+1)%4],bend],n%2?0x765181:0x503659);
   face('witch-hat-bent-left',[[0,-2,39+z],[-2,-2,36+z],[0,-10,39+z]],0x795686);face('witch-hat-bent-right',[[0,-2,39+z],[2,-2,36+z],tip],0x503659);
  }else if(k==='boruta'){
   // A nobleman's two-legged gait, in the same fixed overhead 3D camera.
   // Limbs are rigid two-link chains; the travel phase drives their angles.
   const stride=reduced?0:Math.sin(p*Math.PI*2),rot=(v,a)=>[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];
   for(const side of [-1,1]){
    const gait=side*stride,a=gait*.48,shin=gait*.24+Math.max(0,gait)*.45,hip=[side*3,0,14.5],knee=add(hip,rot([0,0,-7],a)),foot=add(knee,rot([0,0,-7],shin));
    limb(side<0?'left-leg':'right-leg',hip,knee,foot,{stance:false,step:motion.step,phase:p,footLift:Math.max(0,foot[2])*scale});
    box('boruta-boot-'+side,foot[0]-2.3,foot[0]+2.3,foot[1]-4,foot[1]+1.8,foot[2],foot[2]+3.4,[0x18191e,0x25232a,0x19191f,0x42312e,0x57443b]);
    face('boruta-cloven-'+side,[[foot[0],foot[1]-4.03,foot[2]],[foot[0]+.5,foot[1]-4.03,foot[2]],[foot[0]+.5,foot[1]-4.03,foot[2]+2],[foot[0],foot[1]-4.03,foot[2]+2]],0xb99a6e);
    const shoulder=[side*7,-.5,23],elbow=add(shoulder,rot([side*3,0,-5],-a*.55)),hand=add(elbow,rot([side*2,-2,-5],a*.35));
    limb(side<0?'left-arm':'right-arm',shoulder,elbow,hand,{stance:false,step:motion.step,phase:p,footLift:0});
    face('boruta-sleeve-upper-'+side,[[shoulder[0]-1.6,shoulder[1],shoulder[2]],[shoulder[0]+1.6,shoulder[1],shoulder[2]],[elbow[0]+1.4,elbow[1],elbow[2]],[elbow[0]-1.4,elbow[1],elbow[2]]],0xbd3532);
    face('boruta-sleeve-lower-'+side,[[elbow[0]-1.4,elbow[1],elbow[2]],[elbow[0]+1.4,elbow[1],elbow[2]],[hand[0]+1,hand[1],hand[2]],[hand[0]-1,hand[1],hand[2]]],0x8f2426);
    for(let claw=-1;claw<=1;claw++)face('boruta-claw-'+side+'-'+claw,[[hand[0]+claw,hand[1]-.6,hand[2]],[hand[0]+claw+.65,hand[1]-.6,hand[2]],[hand[0]+claw+.3,hand[1]-1.2,hand[2]-2]],0xf1ce96);
   }
   // Flowing red kontusz over a red żupan, and its broad golden sash.
   face('boruta-coat-front',[[-8,-5,9],[8,-5,9],[7,-5,24],[-7,-5,24]],0xb5262c);
   face('boruta-coat-back',[[8,5,9],[-8,5,9],[-7,5,24],[7,5,24]],0x721d24);
   face('boruta-coat-left',[[-8,5,9],[-8,-5,9],[-7,-5,24],[-7,5,24]],0x801e24);
   face('boruta-coat-right',[[8,-5,9],[8,5,9],[7,5,24],[7,-5,24]],0xd44235);
   face('boruta-coat-shoulders',[[-7,-5,24],[7,-5,24],[7,5,24],[-7,5,24]],0xe05a43);
   face('boruta-zupan',[[-2.3,-5.08,11],[2.3,-5.08,11],[2.3,-5.08,23],[-2.3,-5.08,23]],0x7f1d2a);
   for(let n=0;n<3;n++){const zz=19+n*1.3;face('boruta-button-'+n,[[.5,-5.12,zz],[1.3,-5.12,zz],[1.3,-5.12,zz+.7],[.5,-5.12,zz+.7]],0xffd978);}
   face('boruta-gold-sash',[[-8,-5.16,14],[8,-5.16,14],[8,-5.16,17],[-8,-5.16,17]],0xf1bf46);
   face('boruta-sash-side',[[8.04,-5,14],[8.04,5,14],[8.04,5,17],[8.04,-5,17]],0xd4992f);
   face('boruta-sash-end',[[5,-5.22,15],[7,-5.22,15],[8,-5.22,9],[6,-5.22,9]],0xffd868);
   // Expressive devil face with a prominent curled moustache and beard.
   box('boruta-head',-4.8,4.8,-4.2,4.2,24,33,[0xc57658,0x86503e,0x9e5945,0xe0926b,0xe8a980]);
   for(const side of [-1,1]){const x=side*2.5;face('boruta-eye-'+side,[[x-.8,-4.27,29],[x+.8,-4.27,29],[x+.8,-4.27,30.5],[x-.8,-4.27,30.5]],0x191820);face('boruta-brow-'+side,[[x-1.4,-4.3,31],[x+1.4,-4.3,31],[x+1.1,-4.3,31.8],[x-1.1,-4.3,31.8]],0x211a1c);}
   face('boruta-nose',[[-1,-4.25,28],[1,-4.25,28],[0,-7,26.5]],0xecae86);
   for(const side of [-1,1])face('boruta-moustache-'+side,[[0,-4.35,27],[side*2,-4.35,27.5],[side*4.5,-4.35,29],[side*4,-4.35,27],[side*2,-4.35,26],[0,-4.35,26]],0x17171d);
   face('boruta-beard',[[-2,-4.32,25],[2,-4.32,25],[1.3,-4.32,23],[0,-4.32,21.5],[-1.3,-4.32,23]],0x17171d);
   // Fur-trimmed rogatywka with four raised corners and curved black horns.
   box('boruta-fur-brim',-6,6,-5,5,33,35.5,[0x382f2b,0x201d1d,0x2d2523,0x5a4639,0x78604c]);
   const cap=[[-5.5,-4.5,35.5],[5.5,-4.5,35.5],[5.5,4.5,35.5],[-5.5,4.5,35.5]],crown=[0,0,39];
   for(let n=0;n<4;n++)face('boruta-cap-'+n,[cap[n],cap[(n+1)%4],crown],n%2?0xa3222d:0xd53c3c);
   for(const side of [-1,1]){const x=side*5.3;face('boruta-horn-base-'+side,[[x-side*1.4,-.8,34],[x+side*1.4,-.8,34],[side*10,-.8,39],[side*8,-.8,40]],0x17171b);face('boruta-horn-hook-'+side,[[side*8,-.8,40],[side*10,-.8,39],[side*10.4,-.8,43],[side*8,-.8,45],[side*7,-.8,44]],0x242328);face('boruta-horn-glint-'+side,[[side*9.3,-.82,39.4],[side*9.9,-.82,39.3],[side*10.1,-.82,42],[side*8,-.82,44]],0x79777c);}
   // A gently swinging spade-tipped tail and a single curved belt sabre.
   const tailX=stride*3,tail0=[3,5,12],tail1=[5+tailX,11,9],tail2=[4+tailX,16,12];
   face('boruta-tail-base',[[tail0[0]-1,tail0[1],tail0[2]],[tail0[0]+1,tail0[1],tail0[2]],[tail1[0]+1,tail1[1],tail1[2]],[tail1[0]-1,tail1[1],tail1[2]]],0x6d2427);
   face('boruta-tail-end',[[tail1[0]-1,tail1[1],tail1[2]],[tail1[0]+1,tail1[1],tail1[2]],[tail2[0]+1,tail2[1],tail2[2]],[tail2[0]-1,tail2[1],tail2[2]]],0xa7322e);
   face('boruta-tail-point',[[tail2[0]-2,tail2[1],tail2[2]],[tail2[0]+2,tail2[1],tail2[2]],[tail2[0],tail2[1]+4,tail2[2]+1]],0xd04a3e);
   face('boruta-sabre-blade',[[8.3,1,15],[8.3,3,14],[8.3,5,7],[8.3,8,4],[8.3,6,4.5],[8.3,3,7.5],[8.3,1.5,13.5]],0xc7d5d5);
   face('boruta-sabre-guard',[[7.9,-1,15],[8.7,-1,15],[8.7,4,15],[7.9,4,15]],0xf5cb69);
  }else{
   hop=reduced?3:3+1.5*Math.sin(p*Math.PI*2);const z=hop,wave=reduced?0:Math.sin(p*Math.PI*2)*.32;
   for(const side of [-1,1]){const root=[side*6,0,16+z],joint=[side*(6+5*Math.cos(wave)),0,16+z+5*Math.sin(wave)],tip=[joint[0]+side*5*Math.cos(wave),0,joint[2]-5*Math.sin(wave)];limb(side<0?'left-arm':'right-arm',root,joint,tip,{stance:false,step:motion.step,phase:p,footLift:0});}
   const bottom=k==='sheet-ghost'?3:6,tail=k==='sheet-ghost'?1:0;
   face('ghost-front',[[-7,-5,bottom+z],[-7,-5,19+z],[-4,-5,24+z],[4,-5,24+z],[7,-5,19+z],[7,-5,bottom+z],[3,-5,bottom+3+z],[0,-5,tail+z],[-3,-5,bottom+3+z]],body,.66);
   face('ghost-back',[[7,5,bottom+z],[7,5,19+z],[4,5,24+z],[-4,5,24+z],[-7,5,19+z],[-7,5,bottom+z],[0,5,tail+z]],accent,.48);
   face('ghost-left',[[-7,5,bottom+z],[-7,-5,bottom+z],[-7,-5,19+z],[-7,5,19+z]],accent,.5);face('ghost-right',[[7,-5,bottom+z],[7,5,bottom+z],[7,5,19+z],[7,-5,19+z]],body,.55);
   face('ghost-crown',[[-7,-5,19+z],[7,-5,19+z],[4,5,24+z],[-4,5,24+z]],0xe5fff4,.68);
   for(const side of [-1,1]){const x=side*2.5;face('ghost-eye-'+side,[[x-1,-5.1,16+z],[x+1,-5.1,16+z],[x+1,-5.1,19+z],[x-1,-5.1,19+z]],0x253840,.9);}
  }
  // Surface details share their parent's painter-depth group. Their geometric
  // depths are retained separately for inspection; nearer solid faces can
  // still cover the entire parent and its attached details.
  if(k==='boruta'){
   const groups=[['boruta-coat-front',['boruta-zupan','boruta-button-0','boruta-button-1','boruta-button-2','boruta-gold-sash','boruta-sash-end']],['boruta-coat-right',['boruta-sash-side']],['boruta-head-front',['boruta-eye--1','boruta-eye-1','boruta-brow--1','boruta-brow-1','boruta-nose','boruta-moustache--1','boruta-moustache-1','boruta-beard']],['boruta-horn-hook--1',['boruta-horn-glint--1']],['boruta-horn-hook-1',['boruta-horn-glint-1']]];
   for(const [parentName,children] of groups){const parent=faces.find(f=>f.name===parentName);if(!parent)continue;children.forEach((name,index)=>{const child=faces.find(f=>f.name===name);if(child){child.geometryDepth=child.depth;child.attachment=parentName;child.depth=parent.depth-(index+1)*1e-5;}});}
  }
  // Positive camera depth is farther from the camera, so paint descending.
  faces.sort((a,b)=>b.depth-a.depth);for(const f of faces)rgba(f.color,f.alpha,f.points);
  if(broom){
   // A pale painted plaque sits on the straw, using the broom's 3D projection.
   const onStraw=(x,y,lift=0)=>[x,y,11-(y-17)/7+hop+lift];
   const plaque=[onStraw(-13,18.5,.4),onStraw(13,18.5,.4),onStraw(13,30,.4),onStraw(-13,30,.4)];
   const inset=[onStraw(-12.5,19,.5),onStraw(12.5,19,.5),onStraw(12.5,29.5,.5),onStraw(-12.5,29.5,.5)];
   plaque.forEach((q,i)=>vertex('witch-broom-plaque-'+i,q));
   rgba(0x67452e,1,plaque);rgba(0xffedbf,1,inset);
   const letters=[[[0,0],[1,0]],[[.5,0],[.5,1]],[[1,0],[0,0],[0,1],[1,1]],[[0,.5],[.8,.5]],[[0,1],[0,0],[.7,0],[1,.25],[.7,.5],[0,.5]],[[.55,.5],[1,1]],[[0,1],[0,0],[1,0]],[[0,.5],[.8,.5]]];
   const glyph=[0,0,1,1,2,2,3,3],strokes=letters.map((stroke,i)=>stroke.map(([u,v])=>onStraw(-11.2+glyph[i]*5.7+u*3.8,20+v*8.5,.65)));
   for(const stroke of strokes)line3(stroke,0xb91928,1.05);
   broom.lettering={text:'TERF',color:0xb91928,plaque:plaque.map(drawPoint),strokes:strokes.map(stroke=>stroke.map(drawPoint))};
  }
  const projectedOffset=project([0,0,hop]);
  const mouth3d=k==='hen-leg-house'?[0,-7,19+hop]:k==='broom-witch'?[0,-9,25.5+hop]:k==='boruta'?[0,-7,26.5]:[0,-5,15+hop];
  return {type:k,phase:motion.phase,distance:motion.distance,step:motion.step,bodyOffset:{x:projectedOffset.x*scale,y:projectedOffset.y*scale},mouth3d,mouthScreen:screen(mouth3d),limbs,broom,toes,...(['broom-witch','boruta'].includes(k)?{shadow}:{}),
   projection:{kind:'perspective',camera:{azimuth:az,elevation:Math.asin(elevation),focal},vertices,faces:faces.map(({name,vertices,depth,geometryDepth,attachment})=>({name,vertices,depth,...(attachment?{geometryDepth,attachment}:{})}))}};
 }
 function novelBody(g,species,pose,drinking,bloodClock,jaw){
  const {archetype:k,body,accent,eye}=species,limbs=pose.limbs;
  for(const limb of limbs){const {root,joint,tip}=limb,side=root[0]<0?-1:1;
   line(g,[root,joint,tip],0x181824,5);line(g,[root,joint,tip],body,3);line(g,[root,joint],accent,1.1,.8);
   circle(g,...joint,1.7,0x302732,accent);if(k==='boruta')poly(g,[[tip[0]-2,tip[1]-1],[tip[0]+2,tip[1]-1],[tip[0]+side*3,tip[1]+2],[tip[0]-side*2,tip[1]+2]],0x221d25,accent);else{line(g,[tip,[tip[0]+side*3,tip[1]-2]],eye,1.3);line(g,[tip,[tip[0]+side*4,tip[1]+1]],eye,1.3);}
  }
  const ellipse=(x,y,w,h,c,stroke=accent)=>{g.fillStyle(c);g.fillEllipse(x,y,w,h);g.lineStyle(1,stroke);g.strokeEllipse(x,y,w,h);};
  const box=(x,y,w,h,c,stroke=accent)=>{g.fillStyle(c);g.fillRect(x,y,w,h);g.lineStyle(1,stroke);g.strokeRect(x,y,w,h);};
  const eyes=(y=-9,spacing=3)=>{for(const side of [-1,1]){circle(g,side*spacing,y,2.2,0x1c1827);circle(g,side*spacing,y,.7,eye);}};
  // Back silhouettes establish recognisable shapes even at board scale.
  if(k==='boruta'){line(g,[[5,8],[12,13],[17,10]],accent,2);poly(g,[[17,10],[21,8],[20,13]],accent);poly(g,[[-7,-9],[-15,-10],[-13,12],[-6,9],[0,12],[7,9],[14,12],[15,-10],[7,-9]],0x352832,accent);}
  if(k==='vampire'||k==='reaper')poly(g,[[-6,-8],[-14,-13],[-11,12],[0,9],[11,12],[14,-13],[6,-8]],body,accent);
  if(k==='bat'||k==='gargoyle'||k==='dragon')for(const side of [-1,1])poly(g,[[side*5,-4],[side*16,-13],[side*18,5],[side*13,1],[side*10,7],[side*7,3]],body,accent);
  if(k==='devil')line(g,[[7,5],[14,11],[17,3]],accent,2);
  if(k==='fish'||k==='shark-monster'||k==='mermaid')poly(g,[[-4,7],[0,13],[-7,19],[0,17],[7,19],[3,11],[4,7]],accent,body);
  if(k==='ghost')poly(g,[[-8,-8],[-10,11],[-6,14],[-3,10],[0,14],[3,10],[6,14],[10,11],[8,-8]],body,accent);
  else if(k==='slime')poly(g,[[-9,10],[-9,2],[-7,-5],[-3,-8],[3,-8],[7,-5],[9,2],[9,10],[5,13],[-5,13]],body,accent);
  else if(k==='skeleton'||k==='bone-knight'){
   line(g,[[2,-6],[-1,-2],[1,3],[-2,7],[1,11]],accent,2.3);
   line(g,[[-1,-2],[-7,-5],[-9,-2]],body,2);line(g,[[-1,-2],[7,-4],[9,-1]],body,2);
   line(g,[[1,2],[-7,0],[-8,3]],body,2);line(g,[[1,2],[7,1],[8,4]],body,2);
   line(g,[[-1,6],[-6,5],[-8,8]],body,2);line(g,[[-1,6],[5,5],[8,8]],body,2);
   line(g,[[-5,9],[1,12],[5,9]],body,2);
  }else if(k==='witch'||k==='scarecrow')poly(g,[[-5,-5],[-9,11],[9,11],[5,-5]],body,accent);
  else if(k==='robot'||k==='frankenstein')box(-8,-5,16,17,body);
  else if(k==='fish'||k==='shark-monster')ellipse(0,1,17,24,body);
  else if(k==='pumpkin-goblin'){
   ellipse(0,1,22,20,body);line(g,[[-5,-7],[-7,0],[-5,9]],accent,1.2);line(g,[[5,-7],[7,0],[5,9]],accent,1.2);line(g,[[0,-8],[0,10]],accent,1);
  }else if(k==='mushroom')box(-5,-2,10,14,0xe9dbc0,accent);
  else{const w=k==='ogre'?11:k==='owl'?9.5:8;poly(g,[[-w*.7,-7],[w*.35,-8],[w,-3],[w*.77,3],[w*.95,8],[w*.2,11],[-w*.5,8],[-w,4],[-w*.85,-2]],body,accent);}
  // Uneven silhouettes and recessed eyes keep each species legible at game scale.
  if(!['pumpkin-goblin','ghost','slime'].includes(k)){
   if(k==='robot'||k==='frankenstein')box(-7,-15,14,12,k==='frankenstein'?0x83b66d:body);
   else{const w=k==='alien'?9:k==='ogre'?7.5:6.5,h=k==='alien'?8.5:6;poly(g,[[-w*.9,-9-h*.4],[-w*.4,-9-h],[w*.25,-9-h*1.12],[w*.9,-9-h*.48],[w,-9+h*.3],[w*.36,-9+h],[-w*.42,-9+h*.75],[-w,-9+h*.25]],body,accent);}
  }
  if(k==='cyclops'){circle(g,0,-9,4.4,eye,accent);circle(g,0,-9,1.7,0x34465b);}
  else if(k==='ghost'||k==='slime'||k==='pumpkin-goblin')eyes(-3,4);
  else eyes();
  line(g,[[-3,-4],[-1,-5],[1,-3],[3,-4]],0x211b2b,1.2);line(g,[[-6,3],[-2,1],[1,4],[5,2]],accent,.8,.7);
  switch(k){
   case 'boruta':poly(g,[[-8,-14],[-6,-19],[6,-19],[8,-14]],0x30262d,accent);for(const side of [-1,1])poly(g,[[side*4,-18],[side*8,-24],[side*7,-15]],0xb1483b,eye);line(g,[[-5,-6],[-2,-5],[0,-6],[2,-5],[5,-6]],0x1c1720,2);line(g,[[-6,1],[6,5]],0xd6a45e,2);for(const y of [-1,2,5])circle(g,1,y,.7,eye);break;
   case 'skeleton':line(g,[[-4,-5],[4,-5]],0x7c725e,1.2);for(const x of [-2,0,2])line(g,[[x,-5],[x,-3]],0x7c725e,.7);break;
   case 'zombie':poly(g,[[-7,-14],[-4,-18],[-1,-14],[2,-17],[7,-14]],accent,body);line(g,[[-3,3],[0,4],[3,3]],eye,1);break;
   case 'vampire':poly(g,[[-7,-14],[0,-10],[7,-14],[5,-17],[0,-14],[-5,-17]],0x372340,accent);for(const x of [-2,2])poly(g,[[x-1,-5],[x+1,-5],[x,-2]],eye);break;
   case 'mummy':for(const y of [-13,-9,-5,0,5,9])line(g,[[-7,y],[6,y-2]],0xf6ebd0,1.6);eyes();break;
   case 'werewolf':case 'cat-monster':for(const side of [-1,1])poly(g,[[side*2,-14],[side*8,-20],[side*7,-9]],body,accent);if(k==='cat-monster')for(const side of [-1,1])line(g,[[side*4,-7],[side*10,-8]],eye,1);else{ellipse(0,-5,7,4,accent,body);circle(g,0,-6,1.2,eye);for(const side of [-1,1])poly(g,[[side*3,-3],[side*5,-3],[side*4,0]],eye);}break;
   case 'pumpkin-goblin':box(-1,-12,3,5,0x4f8e50);poly(g,[[-5,-3],[-2,-6],[-1,-3]],eye);poly(g,[[1,-3],[2,-6],[5,-3]],eye);line(g,[[-5,4],[-2,6],[1,4],[4,6],[6,4]],0x503c34,1.6);break;
   case 'witch':poly(g,[[-11,-14],[11,-14],[3,-17],[0,-26],[-4,-17]],0x332841,accent);line(g,[[-7,-16],[6,-16]],0xffce75,1.4);break;
   case 'devil':for(const side of [-1,1])poly(g,[[side*3,-14],[side*8,-21],[side*7,-13]],accent,body);poly(g,[[16,3],[20,2],[17,7]],accent);break;
   case 'bat':for(const side of [-1,1])poly(g,[[side*2,-14],[side*7,-20],[side*7,-11]],accent,body);break;
   case 'ghost':ellipse(0,3,3,4,0x49657b);break;
   case 'ogre':for(const side of [-1,1])circle(g,side*8,-9,3,body,accent);line(g,[[-4,1],[4,1]],eye,1);break;
   case 'cyclops':poly(g,[[-3,-14],[0,-21],[3,-14]],accent,body);break;
   case 'gargoyle':for(const side of [-1,1])poly(g,[[side*2,-14],[side*6,-21],[side*7,-12]],accent,body);line(g,[[-5,4],[0,0],[5,4]],eye,1);break;
   case 'troll':for(let n=-2;n<=2;n++)poly(g,[[n*3-2,-13],[n*3,-20-Math.abs(n%2)*2],[n*3+2,-13]],accent,body);break;
   case 'reaper':poly(g,[[-8,-7],[-7,-17],[0,-22],[7,-17],[8,-7],[5,-15],[-5,-15]],body,accent);line(g,[[13,15],[13,-17],[19,-19]],eye,1.5);break;
   case 'bone-knight':box(-7,-16,14,7,accent,body);line(g,[[-5,-11],[5,-11]],body,2);poly(g,[[0,-16],[2,-23],[5,-16]],0xf29675);break;
   case 'frankenstein':box(-7,-17,14,4,0x343547,accent);for(const side of [-1,1])circle(g,side*9,-9,2,eye);line(g,[[-4,-13],[-1,-12],[1,-14],[4,-13]],0x36463d,1);break;
   case 'pirate':poly(g,[[-9,-14],[-5,-19],[5,-19],[9,-14]],0x30273d,accent);circle(g,2,-9,2.3,0x332d40);line(g,[[-5,-12],[5,-7]],accent,1);break;
   case 'scarecrow':poly(g,[[-11,-14],[11,-14],[6,-16],[5,-20],[-5,-20],[-6,-16]],0xc3a164,body);for(const side of [-1,1])for(let n=0;n<3;n++)line(g,[[side*7,2+n*2],[side*12,1+n*2]],0xf5d78d,1);break;
   case 'alien':for(const side of [-1,1]){line(g,[[side*4,-15],[side*7,-21]],accent,1.5);circle(g,side*7,-21,1.8,eye);}break;
   case 'robot':line(g,[[0,-15],[0,-20]],accent,1.4);circle(g,0,-21,2,eye);box(-4,1,8,4,0x35485b,accent);break;
   case 'fish':for(const side of [-1,1])poly(g,[[side*7,-3],[side*14,1],[side*7,4]],accent,body);circle(g,0,4,2,eye);break;
   case 'shark-monster':poly(g,[[-4,1],[0,-4],[4,1]],accent,body);for(const side of [-1,1])poly(g,[[side*5,1],[side*13,5],[side*6,6]],accent,body);break;
   case 'slime':circle(g,-4,4,2,eye);circle(g,4,7,1.4,eye);break;
   case 'owl':for(const side of [-1,1])poly(g,[[side*2,-14],[side*8,-19],[side*7,-9]],body,accent);poly(g,[[-2,-6],[2,-6],[0,-2]],0xffce70);break;
   case 'mushroom':ellipse(0,-15,22,10,accent,body);for(const x of [-6,0,6])circle(g,x,-15,1.8,eye);break;
   case 'dragon':for(const side of [-1,1])poly(g,[[side*3,-14],[side*8,-20],[side*6,-12]],accent,body);ellipse(0,-5,8,4,body);break;
   case 'yeti':for(let n=-2;n<=2;n++)poly(g,[[n*3-2,-12],[n*3,-18-Math.abs(n%2)*2],[n*3+2,-12]],eye,accent);break;
   case 'mermaid':for(let n=0;n<3;n++)line(g,[[-3,5+n*3],[0,7+n*3],[3,5+n*3]],eye,1);break;
  }
  if(drinking){vascular(g,bloodClock);fangs(g,jaw);}
  return pose;
 }
 function centipedeBody(g,sp,s,b,at,angle,clock,drinking,bloodClock,jaw,scale,species,reduced=false,details=null){
  const variant=species?.shape,bodyColour=species?.body,accent=species?.accent,eye=species?.eye;
  const rad=-angle*Math.PI/180,c=Math.cos(rad),sn=Math.sin(rad);
  const body=s.chase.bodyPositions?.(sp,axis=>axis==='x'?b.cellWidth:b.cellHeight,scale)||[at];
  const toLocal=p=>{const dx=(b.px(p.i)-b.px(at.i))/scale,dy=(b.py(p.j)-b.py(at.j))/scale;return [dx*c-dy*sn,dx*sn+dy*c];};
  const local=body.map(toLocal);
  // Include every travelled corner: chords between spaced body rings cut across cells.
  const routeGrid=s.chase.bodyPositions?.(sp,axis=>axis==='x'?b.cellWidth:b.cellHeight,scale,true)||body,route=routeGrid.map(toLocal);
  diagnostic.centipede={points:body.map(p=>({i:p.i,j:p.j,x:b.px(p.i),y:b.py(p.j)})),spine:routeGrid.map(p=>({i:p.i,j:p.j,x:b.px(p.i),y:b.py(p.j)}))};
  const crawler=variant==='maga-crawler',toWorld=q=>({x:b.px(at.i)+(q[0]*c+q[1]*sn)*scale,y:b.py(at.j)+(-q[0]*sn+q[1]*c)*scale}),crawlerLegs=[],crawlerPlates=[],crawlerGlyphs=[];
  if(crawler&&details){details.segmentedLetters=[];details.segmentedLegs=[];}
  if(route.length>1)line(g,route,bodyColour??0x38213f,variant==='wyrm'?8:10);
  for(let n=local.length-1;n>=1;n--){
   const q=local[n],front=local[n-1],dx=front[0]-q[0],dy=front[1]-q[1],len=Math.hypot(dx,dy)||1;
   const ux=len===1&&!dx&&!dy?0:dx/len,uy=len===1&&!dx&&!dy?-1:dy/len,vx=-uy,vy=ux;
   const point=(along,across)=>[q[0]+ux*along+vx*across,q[1]+uy*along+vy*across];
   const wave=Math.sin(clock/78-n*.85),radius=5.8;
   if(crawler){
    for(const side of [-1,1]){
     const swing=reduced?0:Math.sin(clock/130-n*.9+side*.7),root=point(0,side*5),knee=point(-1+swing*2,side*10),tip=point(-4+swing*3,side*(14-Math.max(0,swing)*1.5));
     crawlerLegs.push(()=>{line(g,[root,knee,tip],0x111d2b,3.8);line(g,[root,knee,tip],accent??0xe4c899,1.5);circle(g,...knee,1.15,0x27384d,accent??0xe4c899);});
     details?.segmentedLegs.push({segment:n,side,root:toWorld(root),joint:toWorld(knee),tip:toWorld(tip)});
    }
    crawlerPlates.push(()=>{circle(g,...q,7.1,bodyColour??0x27384d,accent??0xe4c899);circle(g,...q,5.2,0xf6e8c8,0x906f55);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])circle(g,q[0]+Math.cos(a)*6.1,q[1]+Math.sin(a)*6.1,.65,accent??0xe4c899);});
    // Counter-rotate the glyph inside its round plate so it stays readable
    // in screen coordinates while the model trail turns through grid corners.
    const letter=['M','A','G','A'][(n-1)%4],glyphs={M:[[[-2.5,3],[-2.5,-3],[0,0],[2.5,-3],[2.5,3]]],A:[[[-2.5,3],[0,-3],[2.5,3]],[[-1.5,1],[1.5,1]]],G:[[[2,-2.5],[.8,-3],[-2,-2],[-2,2],[0,3],[2.5,2],[2.5,0],[.3,0]]]};
    const paths=(glyphs[letter]||[]).map(stroke=>stroke.map(([x,y])=>[q[0]+x*c-y*sn,q[1]+x*sn+y*c]));
    crawlerGlyphs.push(()=>{for(const stroke of paths)line(g,stroke,0xb91e30,1.3);});
    details?.segmentedLetters.push({index:n,letter,center:toWorld(q),color:0xb91e30,strokes:paths.map(path=>path.map(toWorld))});
   }else if(variant==='wyrm'){
    for(const side of [-1,1])poly(g,[point(3,side*3),point(-3,side*(10+wave)),point(-4,side*2)],accent,bodyColour);
    poly(g,[point(7,0),point(0,6),point(-7,0),point(0,-6)],bodyColour,accent);
    line(g,[point(3,0),point(-3,0)],eye,1);
   }else{
    const offsets=variant==='millipede'?[-2,2]:[0];
    for(const offset of offsets)for(const side of [-1,1]){
     const knee=point(offset-1+wave,side*(variant==='millipede'?7.5:9)),tip=point(offset-4+wave*2,side*(variant==='millipede'?10:13));
     line(g,[point(offset,side*3),knee,tip],accent??0x63e9d0,2.4);line(g,[point(offset,side*3),knee,tip],bodyColour??0x443057,1.1);
    }
    circle(g,...q,variant==='millipede'?6.5:radius,bodyColour??(n%2?0x55315c:0x372a51),accent??0x82e4d4);
    g.fillStyle(eye??0xa5ffdb,.28);g.fillEllipse(q[0]-1.6,q[1]-2,4,2);
    if(variant==='millipede')circle(g,...q,2.1,accent);
    else line(g,[point(-2,-3.7),point(-3,0),point(-2,3.7)],accent??0xbc75d5,1.2);
   }
  }
  if(crawler){for(const draw of crawlerLegs)draw();for(const draw of crawlerPlates)draw();for(const draw of crawlerGlyphs)draw();}
  if(crawler&&details){details.segmentedLetters.sort((a,b)=>a.index-b.index);details.segmentedLegs.sort((a,b)=>a.segment-b.segment||a.side-b.side);}
  // A continuous blood route follows the actual articulated trail, never a new clock.
  if(drinking&&local.length>1){
   bloodLine(g,[[0,-12],...route],1.8);
   for(let n=1;n<local.length;n++){
    const q=local[n];
    bloodLine(g,[[q[0]-3,q[1]-2],q,[q[0]+3,q[1]+2]],1);
   }
   for(let n=1;n<route.length;n++){
    const q=route[n],prev=route[n-1],t=((bloodClock/420-n*.17)%1+1)%1;
    flowBead(g,mix(prev[0],q[0],t),mix(prev[1],q[1],t),1);
   }
  }
  if(crawler){
   // One angular helmet distinguishes the head from the four round plates.
   poly(g,[[-7,-2],[-8,-9],[-5,-14],[0,-16],[5,-14],[8,-9],[7,-2],[0,1]],bodyColour??0x27384d,accent??0xe4c899);
   line(g,[[-5,-11],[0,-14],[5,-11]],accent??0xe4c899,1.4);
  }else{circle(g,0,0,7,bodyColour??0x482144,accent??0x8cf3d9);circle(g,0,-8,5,bodyColour??0x60314e,accent??0xb6ffd7);}
  if(variant==='wyrm')for(const side of [-1,1])poly(g,[[side*3,-9],[side*8,-19],[side*7,-6]],accent,bodyColour);
  line(g,[[-3,-11],[-6,-16],[-9,-17+(crawler&&reduced?0:Math.sin(clock/95))]],accent??0x80ffdc,1.4);
  line(g,[[3,-11],[6,-16],[9,-17-(crawler&&reduced?0:Math.sin(clock/95))]],accent??0x80ffdc,1.4);
  if(drinking)vascular(g,bloodClock);
  circle(g,-2,-9,1.5,eye??0xffe9a9);circle(g,2,-9,1.5,eye??0xffe9a9);
  line(g,[[-4,-11],[-1,-9.8]],0x3a0e2b,1.5);line(g,[[1,-9.8],[4,-11]],0x3a0e2b,1.5);
  if(sp.eating){g.fillStyle(0x6e1616);g.fillEllipse(0,-12,5.6,3);}
  fangs(g,jaw);
  return body.length;
 }
 function suction(g,head,mouth,target,scale,clock,bend=2,effectScale=1){
  const dx=head.x-target.x,dy=head.y-target.y,length=Math.hypot(dx,dy)||1;
  const source=[target.x+dx/length*10*scale,target.y+dy/length*10*scale];
  const end=[mouth.x,mouth.y],normal=[-(end[1]-source[1]),end[0]-source[0]],span=Math.hypot(...normal)||1;
  const middle=[mix(source[0],end[0],.5)+normal[0]/span*bend,mix(source[1],end[1],.5)+normal[1]/span*bend];
  bloodLine(g,[source,middle,end],2,effectScale);
  for(let k=0;k<3;k++){
   const t=(clock/390+k/3)%1,q=t<.5?t*2:(t-.5)*2,a=t<.5?source:middle,z=t<.5?middle:end;
   flowBead(g,mix(a[0],z[0],q),mix(a[1],z[1],q),1.1,effectScale);
  }
 }
 // Distinct, deterministic folklore attacks. All motion derives from the
 // existing capture clock, so pause/repaint never advances a particle.
 function folkloreAttack(g,type,source,target,phase,elapsed,scale,reduced,smokeScale=scale){
  const active=phase.name==='bite'||phase.name==='swell'||phase.name==='decay',fade=phase.name==='decay'?1-phase.progress:1;
  const effects={visible:active,opacity:active?fade:0,paths:[],particles:[],splats:[]},projectiles=[];
  if(type==='rotten-egg'){effects.impactOccurred=elapsed>=250;effects.cloudVisible=active&&elapsed>=250;}
  if(type==='fire'||type==='electric')effects.smoke={visible:active,anchor:{x:target.x,y:target.y-11*smokeScale},puffs:[],wisps:[]};
  if(!active)return {effects,projectiles};
  const dx=target.x-source.x,dy=target.y-source.y,distance=Math.hypot(dx,dy)||1,ux=dx/distance,uy=dy/distance,nx=-uy,ny=ux,impact={x:target.x-ux*9*scale,y:target.y-uy*9*scale},t=reduced?0:elapsed;
  if(type==='fire'){
   const middle={x:mix(source.x,impact.x,.55)+nx*(reduced?0:Math.sin(t/260)*2*scale),y:mix(source.y,impact.y,.55)+ny*(reduced?0:Math.sin(t/260)*2*scale)},path=[[source.x,source.y],[middle.x,middle.y],[impact.x,impact.y]];
   line(g,path,0xb83319,9*scale,.32*fade);line(g,path,0xff6d16,5*scale,.9*fade);line(g,path,0xffdc61,2*scale,.95*fade);effects.paths.push(path.map(q=>({x:q[0],y:q[1]})));
   for(let n=0;n<7;n++){const a=n*Math.PI*2/7,variation=reduced?0:Math.sin(t/240+n)*2,inner=11*scale,outer=(18+variation)*scale,pts=[[target.x+Math.cos(a-.22)*inner,target.y+Math.sin(a-.22)*inner],[target.x+Math.cos(a)*outer,target.y+Math.sin(a)*outer],[target.x+Math.cos(a+.22)*inner,target.y+Math.sin(a+.22)*inner]];g.fillStyle(n%2?0xffbd32:0xf04a1b,.72*fade);g.beginPath();g.moveTo(...pts[0]);g.lineTo(...pts[1]);g.lineTo(...pts[2]);g.closePath();g.fillPath();effects.particles.push({x:pts[1][0],y:pts[1][1],kind:'flame'});}
   for(let n=0;n<4;n++){const a=n*2.2+(reduced?0:t/900),r=(20+n*2)*scale,px=target.x+Math.cos(a)*r,py=target.y+Math.sin(a)*r;g.fillStyle(0xffd267,.85*fade);g.fillCircle(px,py,1.5*scale);effects.particles.push({x:px,y:py,kind:'ember'});}
  }else if(type==='electric'){
   // Work in board pixels: u follows hand-to-victim and the perpendicular n
   // spreads the contacts over Gridder. All variation uses capture time.
   effects.strands=[];effects.branches=[];
   const record=path=>path.map(([x,y])=>({x,y}));
   const plasma=(path,branch=false)=>{
    line(g,path,0x8c35e8,(branch?3.6:6)*scale,.16*fade);
    line(g,path,0xb963ff,(branch?1.8:3)*scale,.48*fade);
    line(g,path,branch?0xe9c9ff:0xf8eaff,(branch?.55:.85)*scale,.95*fade);
   };
   for(let strand=0;strand<4;strand++){
    const spread=[-7,-2.5,2.5,7][strand]*scale,contact={x:impact.x+nx*spread,y:impact.y+ny*spread},path=[];
    for(let n=0;n<=8;n++){
     const u=n/8,envelope=Math.sin(Math.PI*u),phase=strand*2.37+n*3.11;
     const jag=(Math.sin(phase+(reduced?0:t/(180+strand*31)))+0.45*Math.sin(phase*2.17-(reduced?0:t/(260+strand*23))))*3.3*scale*envelope;
     path.push([mix(source.x,contact.x,u)+nx*jag,mix(source.y,contact.y,u)+ny*jag]);
    }
    plasma(path);const points=record(path);effects.paths.push(points);effects.strands.push({points,contact:{...contact}});
    for(const n of [3,5]){
     const side=(strand+n)%2?1:-1,p=path[n],reach=(4+((strand+n)%3))*scale;
     const branch=[p,[p[0]+ux*3*scale+nx*side*reach*.65,p[1]+uy*3*scale+ny*side*reach*.65],[p[0]+ux*6*scale+nx*side*reach,p[1]+uy*6*scale+ny*side*reach]];
     plasma(branch,true);const points=record(branch);effects.paths.push(points);effects.branches.push({strand,fromIndex:n,points});
    }
   }
  }else{
   // Launch at 0, 550, 1100 and 1650 ms; each egg hits 250 ms later.
   for(let n=0;n<4;n++){const age=elapsed-n*550;if(age<0)continue;if(age<250){const u=reduced?.55:age/250,px=mix(source.x,target.x,u),py=mix(source.y,target.y,u)-(reduced?12:Math.sin(Math.PI*u)*22)*scale;g.fillStyle(0x3b392a,.95*fade);g.fillEllipse(px,py,12*scale,15*scale);g.fillStyle(0xf3e8c1,.98*fade);g.fillEllipse(px,py,10*scale,13*scale);g.fillStyle(0x718638,.95*fade);g.fillCircle(px+scale,py,2.1*scale);g.fillCircle(px-2*scale,py+3*scale,1.2*scale);projectiles.push({x:px,y:py,launchAt:n*550,impactAt:n*550+250,progress:u});}
    else if(age<900){const a=n*2.4,r=(5+n*2)*scale,px=target.x+Math.cos(a)*r,py=target.y+Math.sin(a)*r,splatFade=fade*clamp((900-age)/450,0,1);g.fillStyle(0x8ba63e,.72*splatFade);g.fillEllipse(px,py,12*scale,7*scale);g.fillStyle(0x535f22,.75*splatFade);g.fillCircle(px+3*scale,py-2*scale,2.3*scale);effects.splats.push({x:px,y:py,opacity:splatFade,impactAt:n*550+250});
     if(age<650)for(let piece=0;piece<3;piece++){const theta=a+piece*Math.PI*2/3,d=(5+(age-250)/100)*scale,sx=px+Math.cos(theta)*d,sy=py+Math.sin(theta)*d;g.fillStyle(0xf3e8c1,.9*splatFade);g.beginPath();g.moveTo(sx,sy-2*scale);g.lineTo(sx+2*scale,sy+scale);g.lineTo(sx-2*scale,sy+scale);g.closePath();g.fillPath();effects.particles.push({x:sx,y:sy,kind:'shell'});}}}
   if(elapsed>=250){g.fillStyle(0xb0b959,.18*fade);g.fillCircle(target.x+10*scale,target.y-10*scale,7*scale);g.fillCircle(target.x-8*scale,target.y-12*scale,5*scale);}
  }
  if(effects.smoke){
   // Smoke rises in screen coordinates from the head, leaving the face clear.
   // Its phase depends only on capture time; reduced motion is a fixed plume.
   const smoke=effects.smoke,color=type==='fire'?0x9c9297:0xc8bad4;
   for(let n=0;n<5;n++){
    const u=reduced?(n+1)/6:((elapsed/1500+n/5)%1),drift=Math.sin(u*5+n*2)*3*scale*u;
    const x=smoke.anchor.x+drift+(n%2?2:-2)*scale,y=smoke.anchor.y-(3+u*25)*scale,r=(2.2+u*2.6)*scale,alpha=(.12+.25*(1-u))*fade;
    g.fillStyle(color,alpha);g.fillCircle(x,y,r);smoke.puffs.push({x,y,radius:r,opacity:alpha});
   }
   for(let n=0;n<2;n++){
    const side=n?1:-1,wave=reduced?0:Math.sin(elapsed/500+n)*1.5;
    const points=[[smoke.anchor.x+side*2*scale,smoke.anchor.y],[smoke.anchor.x+(side*4+wave)*scale,smoke.anchor.y-8*scale],[smoke.anchor.x+(side*2-wave)*scale,smoke.anchor.y-16*scale],[smoke.anchor.x+(side*5+wave)*scale,smoke.anchor.y-23*scale]];
    line(g,points,color,1.5*scale,.5*fade);smoke.wisps.push(points.map(([x,y])=>({x,y})));
   }
  }
  return {effects,projectiles};
 }
 function render(s,b){
  if(!s.walker||!s.chase)return;objects.forEach(o=>o.setVisible(true));pieces.clear();shield.clear();player.clear();overlay.clear();projectiles.clear();weaponHand.clear();bombFX.clear();boostTrail.clear();boostHalo.clear();captureFX.clear();title.setVisible(false);subtitle.setVisible(false);angel.setVisible(false);angelPartner.setVisible(false);
  resurrection={visible:false,frames:[],bounds:[]};
  const boardScale=root.GridderSpriteMetrics?.scale(b)??1,playerFactor=boardScale*(root.GridderSpriteMetrics?.playerScale??1.25);
  const clock=s.chaseTime||0,reduced=root.GridderTheme?.reducedMotion?.()||false,pos=s.walker.position(),cell=axis=>axis==='x'?b.cellWidth:b.cellHeight;
  let x=b.px(pos.i),y=b.py(pos.j);
  const leechCapture=!!(s.deathScene&&['leech','shark'].includes(s.deathAttacker?.kind));
  let sharkCapture=null;
  if(leechCapture){
   const a=s.deathAttacker,t=clamp(s.deathScene.elapsed/(a.dragDuration||650),0,1),ease=t*t*(3-2*t);
   sharkCapture=a.kind==='shark'?root.GridderLeechActors?.sharkCapturePose?.(a,s.deathScene.elapsed,b):null;
   const victim=sharkCapture?.victim||{i:mix(a.from.i,a.to.i,ease),j:mix(a.from.j,a.to.j,ease)};
   x=b.px(victim.i);y=b.py(victim.j);
  }
  for(const p of s.remains?.pieces||[]){if(p.eaten)continue;const g=s.remains.geometry(p,cell);fragment(pieces,b.px(g.i),b.py(g.j),g.radius,p.angle,p.shape);}
  const nearest=chooseEmotion(s,b,pos,clock),stage=s.deathScene?.phase(),bloodClock=s.deathScene?.elapsed||0;
  const attackType=s.deathScene&&['fire','electric','rotten-egg'].includes(s.deathAttacker?.attackType)?s.deathAttacker.attackType:null;
  diagnostic.captureAttack=null;
  const boost=s.boost||{},trailVisuals=[];
  for(const segment of boost.trail||[]){
   if(!Number.isFinite(segment.from?.i)||!Number.isFinite(segment.from?.j)||!Number.isFinite(segment.to?.i)||!Number.isFinite(segment.to?.j))continue;
   const fade=clamp((Number(segment.expiresAt)-Number(boost.clock))/450,0,1);if(!Number.isFinite(fade)||fade<=0)continue;
   const from={x:b.px(segment.from.i),y:b.py(segment.from.j)},to={x:b.px(segment.to.i),y:b.py(segment.to.j)};
   line(boostTrail,[[from.x,from.y],[to.x,to.y]],0x35ffff,8*boardScale,.22*fade);line(boostTrail,[[from.x,from.y],[to.x,to.y]],0xb4ff5b,3*boardScale,.85*fade);line(boostTrail,[[from.x,from.y],[to.x,to.y]],0xe8fff1,1*boardScale,.9*fade);
   trailVisuals.push({from,to,fade});
  }
  if(boost.active){boostHalo.lineStyle(3*boardScale,0x58ffe1,reduced?.55:.8);boostHalo.strokeCircle(x,y,19*playerFactor);boostHalo.lineStyle(1.2*boardScale,0xc9ff70,.9);boostHalo.strokeCircle(x,y,22*playerFactor);}
  diagnostic.boost={active:!!boost.active,remainingMs:Number(boost.remainingMs)||0,trail:trailVisuals,halo:boost.active?{x,y,radius:19*playerFactor}:null};
  diagnostic.boardScale=boardScale;diagnostic.playerScale=playerFactor;
  diagnostic.captureKind=leechCapture?s.deathAttacker.kind:s.deathScene?'insect':null;
  diagnostic.victim={x,y};
  diagnostic.sharkCapture=sharkCapture;
  while(spiders.length<s.chase.spiders.length){const g=scene.add.graphics().setDepth(22.5);spiders.push(g);objects.push(g);}
  while(spiders.length>Math.max(3,s.chase.spiders.length)){const g=spiders.pop();objects.splice(objects.indexOf(g),1);g.destroy();}
  eggs.clear();const eggStates=s.ecology?.eggs||[];
  while(eggLabels.length<eggStates.length){const label=scene.add.text(0,0,'',{fontFamily:'system-ui, sans-serif',fontStyle:'bold',fontSize:'11px',color:'#fff3c4'}).setOrigin(.5).setDepth(23);eggLabels.push(label);objects.push(label);}
  while(eggLabels.length>eggStates.length){const label=eggLabels.pop();objects.splice(objects.indexOf(label),1);label.destroy();}
  eggStates.forEach((egg,index)=>{
   const ex=b.px(egg.position.i),ey=b.py(egg.position.j),progress=clamp(Number(egg.progress)||0,0,1),pulse=reduced?1:1+.12*Math.sin(clock/180),r=5*boardScale*pulse;
   const species=Array.isArray(egg.species)?egg.species[0]:egg.species,accent=species?.accent??(egg.kind==='shark'?0x80f1ee:egg.kind==='leech'?0x40ffdd:0xff76c9);
   const isBomb=egg.reward==='bomb',isBoost=egg.reward==='boost';
   eggs.fillStyle(isBoost?0x37dcd1:isBomb?0x58435e:0xffc86a,.95);eggs.fillEllipse(ex,ey,r*1.55,r*2);
   if(isBomb){circle(eggs,ex,ey+r*.5,r*.38,0x20273c,0xffdc85);line(eggs,[[ex,ey+r*.1],[ex+r*.25,ey-r*.25]],0xffdc85,1.3*boardScale);circle(eggs,ex+r*.3,ey-r*.35,1.3*boardScale,0xffa95c);}
   else if(isBoost)poly(eggs,[[ex+r*.05,ey-r*.7],[ex-r*.5,ey+r*.05],[ex-r*.07,ey+r*.05],[ex-r*.2,ey+r*.7],[ex+r*.52,ey-r*.12],[ex+r*.1,ey-r*.12]],0xd4ff58,0x2b796f);
   else{eggs.fillStyle(accent,.95);eggs.fillCircle(ex+r*.13,ey+r*.18,r*.32);}
   eggs.fillStyle(0xfff1b1,.98);eggs.fillCircle(ex-r*.2,ey-r*.3,r*.27);
   eggs.lineStyle(1.5*boardScale,isBoost?0xc6ff6a:accent,.95);eggs.beginPath();eggs.arc(ex,ey,9*boardScale,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);eggs.strokePath();
   const seconds=Math.max(0,Math.ceil((egg.hatchAt-(s.ecology?.clock||0))/1000));eggLabels[index].setPosition(ex,ey-15*boardScale).setText(Number.isFinite(seconds)?String(seconds):String(egg.count||''));
  });
  const bombState=s.bombs||{},bombVisuals=[],blastVisuals=[],planted=bombState.planted||[];
  while(bombLabels.length<planted.length){const label=scene.add.text(0,0,'',{fontFamily:'system-ui, sans-serif',fontStyle:'bold',fontSize:'14px',color:'#fff2bb',stroke:'#3c1720',strokeThickness:3}).setOrigin(.5).setDepth(23.5);bombLabels.push(label);objects.push(label);}
  while(bombLabels.length>planted.length){const label=bombLabels.pop();objects.splice(objects.indexOf(label),1);label.destroy();}
  planted.forEach((bomb,index)=>{
   const label=bombLabels[index];if(!Number.isFinite(bomb.position?.i)||!Number.isFinite(bomb.position?.j)){label.setVisible(false);return;}
   const bx=b.px(bomb.position.i),by=b.py(bomb.position.j),r=7*boardScale,remaining=Math.max(0,Number(bomb.remainingMs)||0),countdown=Math.max(1,Math.ceil(remaining/1000));
   bombFX.fillStyle(0x14151d,.35);bombFX.fillEllipse(bx,by+r*.8,17*boardScale,5*boardScale);
   bombFX.fillStyle(0x272731);bombFX.fillRoundedRect(bx-r*1.05,by-r*.65,r*2.1,r*1.3,2*boardScale);bombFX.lineStyle(1.3*boardScale,0xbbb09d);bombFX.strokeRoundedRect(bx-r*1.05,by-r*.65,r*2.1,r*1.3,2*boardScale);
   for(const offset of [-.45,0,.45]){bombFX.fillStyle(0x843d36);bombFX.fillRoundedRect(bx-r*.88,by+r*(offset-.16),r*1.76,r*.32,1*boardScale);}bombFX.fillStyle(0xaba090);bombFX.fillRect(bx-r*.16,by-r*.6,r*.32,r*1.2);
   line(bombFX,[[bx+r*.5,by-r*.65],[bx+r*.75,by-r*1.2]],0xb99d65,2*boardScale);circle(bombFX,bx+r*.77,by-r*1.27,2*boardScale,0xffa337);
   label.setVisible(true).setPosition(bx,by-16*boardScale).setText(String(countdown));bombVisuals.push({id:bomb.id,x:bx,y:by,remainingMs:remaining,countdown});
  });
  for(const blast of bombState.blasts||[]){
   if(!Number.isFinite(blast.position?.i)||!Number.isFinite(blast.position?.j)||!Number.isFinite(blast.radiusPx))continue;
   const bx=b.px(blast.position.i),by=b.py(blast.position.j),p=clamp((Number(blast.ageMs)||0)/Math.max(1,Number(blast.durationMs)||1000),0,1),radius=Math.max(0,blast.radiusPx),fire=Math.max(0,1-p*1.6),smoke=clamp(p*2,0,1)*(1-p),ring=reduced?.65:Math.min(1,p*2.1),shrapnel=[];
   bombFX.fillStyle(0xff6c18,(reduced?.20:.42)*fire);bombFX.fillCircle(bx,by,radius*(.28+.52*Math.min(1,p*3)));
   bombFX.fillStyle(0xffbf2f,(reduced?.28:.8)*fire);bombFX.fillCircle(bx,by,radius*(.15+.27*Math.min(1,p*4)));
   for(let n=0;n<8;n++){const a=n*Math.PI/4+(reduced?0:p*.6),reach=radius*(.32+.35*Math.min(1,p*3))*(n%2?.8:1),width=radius*.13;
    const pts=[[bx+Math.cos(a-.3)*width,by+Math.sin(a-.3)*width],[bx+Math.cos(a)*reach,by+Math.sin(a)*reach],[bx+Math.cos(a+.3)*width,by+Math.sin(a+.3)*width]];
    bombFX.fillStyle(n%2?0xff8b1b:0xffd04c,(reduced?.20:.72)*fire);bombFX.beginPath();bombFX.moveTo(...pts[0]);bombFX.lineTo(...pts[1]);bombFX.lineTo(...pts[2]);bombFX.closePath();bombFX.fillPath();
   }
   bombFX.lineStyle(Math.max(1,3*boardScale),0xffc37a,(reduced?.25:.65)*(1-p));bombFX.strokeCircle(bx,by,radius*ring);
   for(let n=0;n<12;n++){const a=n*Math.PI/6+.13,dist=radius*(.14+.83*ring),trail=radius*.13*(1-p),sx=bx+Math.cos(a)*dist,sy=by+Math.sin(a)*dist;line(bombFX,[[bx+Math.cos(a)*(dist-trail),by+Math.sin(a)*(dist-trail)],[sx,sy]],0xc3cbd1,Math.max(1,2*boardScale),(reduced?.25:.9)*(1-p));bombFX.fillStyle(0x707986,(reduced?.2:.85)*(1-p));bombFX.fillRect(sx-1.5*boardScale,sy-1.5*boardScale,3*boardScale,3*boardScale);shrapnel.push({x:sx,y:sy});}
   for(let n=0;n<6;n++){const a=n*Math.PI/3,dist=radius*(.15+.28*p);bombFX.fillStyle(0x55545b,(reduced?.12:.32)*smoke);bombFX.fillCircle(bx+Math.cos(a)*dist,by+Math.sin(a)*dist-radius*.18*p,radius*(.12+.12*p));}
   blastVisuals.push({id:blast.id,x:bx,y:by,radius,progress:p,fire,smoke,shrapnel});
  }
  diagnostic.bombs={planted:bombVisuals,blasts:blastVisuals};
  for(const g of spiders)g.setVisible(false);
  s.chase.spiders.forEach((sp,index)=>{
   const g=spiders[index];if(!g)return;g.clear();if(!s.spidersEnabled&&!s.deathScene)return;g.setVisible(true);
   const at=s.chase.position(sp);let xx=b.px(at.i),yy=b.py(at.j),angle=s.chase.heading(sp,pos),jaw=sp.eating?Math.sin(sp.eating.elapsed/70)*1.6:0;
   const attacker=!!(s.deathScene&&s.deathAttacker?.index===index),drinking=attacker&&!attackType&&(stage.name==='bite'||stage.name==='swell');
   const modelScale=sp.sizeScale||1,bloodGrowth=root.derivativeGridderChase?.bloodGrowth??1.15;
   let scale=modelScale;
   // The model awards blood once; the shared capture progress displays its inflation.
   // Re-rendering or pausing cannot advance this interpolation or mutate the model.
   if(attacker&&!attackType&&s.deathAttacker.bloodConsumed&&(stage.name==='bite'||stage.name==='swell')){
    const p=stage.name==='swell'?clamp(stage.progress,0,1):0,smooth=p*p*(3-2*p);
    scale=modelScale/bloodGrowth*(1+(bloodGrowth-1)*smooth);
   }
   scale*=boardScale;
   if(sp.eating&&s.remains){const food=s.remains.geometry(sp.eating.piece,cell);angle=Math.atan2(b.px(food.i)-xx,yy-b.py(food.j))*180/Math.PI;}
   if(attacker){
    const origin=s.deathAttacker.position,dx=b.px(origin.i)-x,dy=b.py(origin.j)-y,len=Math.hypot(dx,dy)||1;
    const ux=len===1&&!dx&&!dy?0:dx/len,uy=len===1&&!dx&&!dy?1:dy/len,reach=18*scale+11*stage.scale*playerFactor+4*boardScale,a=stage.name==='bite'?Math.sin(stage.progress*Math.PI/2):1;
    // The centipede stays anchored to its grid trail while its head faces the victim.
    if(sp.kind!=='centipede'){xx=mix(b.px(origin.i),x+ux*reach,a);yy=mix(b.py(origin.j),y+uy*reach,a);}
    angle=Math.atan2(x-xx,yy-y)*180/Math.PI;
    jaw=stage.name==='bite'?Math.sin(stage.progress*Math.PI)*2:stage.name==='swell'?Math.sin(bloodClock/95)*.75:0;
   }
   const species=sp.species||root.GridderMonsterRoster?.get(s.familyId,sp.kind);
   const trackX=xx,trackY=yy,previousGait=monsterGaits.get(sp),isFolklore=folkloreIds.has(species?.archetype);
   const folklore=isFolklore?folkloreMotion(sp,trackX,trackY,scale,b,clock,reduced):null;
   if(species?.archetype&&!isFolklore&&previousGait&&!reduced){
    const travel=Math.hypot(trackX-previousGait.x,trackY-previousGait.y),valid=clock>=previousGait.clock&&previousGait.w===b.cellWidth&&previousGait.h===b.cellHeight&&travel<=Math.max(b.cellWidth,b.cellHeight)*2&&!previousGait.reduced;
    const distance=valid?previousGait.distance+travel/Math.max(scale,.001):0,sway=Math.sin(distance/30*Math.PI*2)*.8*scale,rad=angle*Math.PI/180;
    xx+=Math.cos(rad)*sway;yy+=Math.sin(rad)*sway;
   }
   g.setPosition(xx,yy).setAngle(angle).setScale(scale);
   let segments=1,legCount=8,attackTail=null,articulation=null,specialRig=null;const creatureDetails={};
   if(attacker&&species?.shape==='scorpion'){
    const distance=Math.hypot(x-xx,y-yy),tipY=-(distance-11*stage.scale*playerFactor)/scale;
    const p=stage.name==='bite'?clamp((stage.progress-.22)/.78,0,1):1,t=p*p*(3-2*p);
    const rest=[[0,5],[1,13],[6,18],[12,15],[13,7]],strike=[[0,5],[8,15],[20,-6],[12,tipY-9],[0,tipY]];
    attackTail=rest.map((q,n)=>[mix(q[0],strike[n][0],t),mix(q[1],strike[n][1],t)]);
   }
   if(folklore){specialRig=folkloreBody(g,species,folklore,xx,yy,angle,scale,reduced);legCount=species.archetype==='boruta'?2:species.archetype==='hen-leg-house'?1:0;}
   else if(species?.archetype){const pose=spiderPose(sp,xx,yy,angle,scale,b,clock,reduced,trackX,trackY);novelBody(g,species,pose,drinking,bloodClock,jaw);legCount=pose.limbs.length;articulation=pose;}
   else if(sp.kind==='centipede'){segments=centipedeBody(g,sp,s,b,at,angle,clock+bloodClock,drinking,bloodClock,jaw,scale,species,reduced,creatureDetails);legCount=Math.max(0,segments-1)*(species?.shape==='wyrm'?0:species?.shape==='millipede'?4:2);}
   else if(species)legCount=speciesBody(g,sp,clock+bloodClock,drinking,bloodClock,jaw,species,attackTail);
   else spiderBody(g,sp,clock+bloodClock,drinking,bloodClock,jaw);
   if(['broom-witch','boruta'].includes(species?.archetype)&&specialRig){
    // Fit only the witch or Boruta projection into the actual canvas. The chase anchor,
    // movement phase and collision geometry remain at their grid-edge point.
    const rad=angle*Math.PI/180,c=Math.cos(rad),sn=Math.sin(rad),world=q=>({x:xx+(q[0]*c-q[1]*sn)*scale,y:yy+(q[0]*sn+q[1]*c)*scale});
    const points=specialRig.projection.vertices.map(v=>v.screen).concat(specialRig.limbs.flatMap(l=>[world(l.root),world(l.joint),world(l.tip)]),[specialRig.mouthScreen]);
    if(specialRig.broom)points.push(world(specialRig.broom.from),world(specialRig.broom.to),...specialRig.broom.bristles.map(world));
    if(specialRig.shadow)points.push(...specialRig.shadow.map(world));
    const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
    const width=Number.isFinite(b.w)?b.w:scene.scale.width,height=Number.isFinite(b.h)?b.h:scene.scale.height,margin=2+2*scale;
    const fit=(lo,hi,size)=>hi-lo<=Math.max(0,size-2*margin)?clamp(0,margin-lo,size-margin-hi):size/2-(lo+hi)/2;
    const dx=fit(minX,maxX,width),dy=fit(minY,maxY,height);xx+=dx;yy+=dy;g.setPosition(xx,yy);
    specialRig.mouthScreen={x:specialRig.mouthScreen.x+dx,y:specialRig.mouthScreen.y+dy};
    specialRig.projection.vertices=specialRig.projection.vertices.map(v=>({...v,screen:{x:v.screen.x+dx,y:v.screen.y+dy}}));
    specialRig.visualFit={x:dx,y:dy,presentationOffset:{x:dx,y:dy},anchor:{x:trackX,y:trackY},groundAnchor:{x:b.px(at.i),y:b.py(at.j)},bounds:{left:minX+dx,right:maxX+dx,top:minY+dy,bottom:maxY+dy},margin};
   }
   const rad=angle*Math.PI/180,mouth=specialRig?.mouthScreen||{x:xx+Math.sin(rad)*13*scale,y:yy-Math.cos(rad)*13*scale};
   // Phaser rotates local sprite (u,v) by angle, scales, then translates to
   // board CSS pixels. Return the same transform for every visible limb joint.
   if(articulation){const world=q=>({x:xx+(q[0]*Math.cos(rad)-q[1]*Math.sin(rad))*scale,y:yy+(q[0]*Math.sin(rad)+q[1]*Math.cos(rad))*scale});
    articulation={phase:articulation.phase,distance:articulation.distance,body:{x:xx,y:yy},limbs:articulation.limbs.map(l=>{const root=world(l.root),joint=world(l.joint),tip=world(l.tip);return {name:l.name,root,joint,tip,phase:l.phase,stance:l.stance,footLift:l.footLift,
     step:l.step,upperLength:Math.hypot(joint.x-root.x,joint.y-root.y),lowerLength:Math.hypot(tip.x-joint.x,tip.y-joint.y),
     upperAngle:Math.atan2(joint.y-root.y,joint.x-root.x),lowerAngle:Math.atan2(tip.y-joint.y,tip.x-joint.x)};})};}
   if(specialRig){const world=q=>({x:xx+(q[0]*Math.cos(rad)-q[1]*Math.sin(rad))*scale,y:yy+(q[0]*Math.sin(rad)+q[1]*Math.cos(rad))*scale});
    specialRig={...specialRig,bodyOffset:{x:specialRig.bodyOffset.x+xx-trackX,y:specialRig.bodyOffset.y+yy-trackY},body:{x:xx,y:yy},limbs:specialRig.limbs.map(l=>{const root=world(l.root),joint=world(l.joint),tip=world(l.tip);return {...l,root,joint,tip,upperLength:Math.hypot(joint.x-root.x,joint.y-root.y),lowerLength:Math.hypot(tip.x-joint.x,tip.y-joint.y)};}),broom:specialRig.broom?{...specialRig.broom,from:world(specialRig.broom.from),to:world(specialRig.broom.to),bristles:specialRig.broom.bristles.map(world),lettering:specialRig.broom.lettering?{...specialRig.broom.lettering,plaque:specialRig.broom.lettering.plaque.map(world),strokes:specialRig.broom.lettering.strokes.map(stroke=>stroke.map(world))}:null}:null,toes:specialRig.toes.map(t=>({...t,from:world(t.from),to:world(t.to)})),...(specialRig.shadow?{shadow:specialRig.shadow.map(world)}:{})};}
   const sway=Math.sin((clock+bloodClock)/170)*2.5,tailLocal=attackTail||(species?.shape==='scorpion'?[[0,5],[1,13],[6+sway,18],[12+sway,15],[13+sway,7]]:null);
   const tailWorld=tailLocal?.map(q=>({x:xx+(q[0]*Math.cos(rad)-q[1]*Math.sin(rad))*scale,y:yy+(q[0]*Math.sin(rad)+q[1]*Math.cos(rad))*scale}));
   const attackPoint=tailWorld?tailWorld[tailWorld.length-1]:mouth;
   if(drinking){if(!attackTail)suction(shield,{x:xx,y:yy},mouth,{x,y},stage.scale*playerFactor,bloodClock,sp.kind==='centipede'?20*scale:2*boardScale,boardScale);diagnostic.drinkingKinds.push(sp.kind);}
   if(attacker&&attackType){const hand=specialRig?.limbs.find(l=>l.name==='right-arm')?.tip,source=attackType==='electric'?(hand||specialRig?.broom?.from||mouth):mouth,sourceKind=attackType==='electric'?(hand?'hand':specialRig?.broom?'broom':'mouth'):attackType==='rotten-egg'?'house-front':'mouth',result=folkloreAttack(captureFX,attackType,source,{x,y},stage,bloodClock,boardScale,reduced,playerFactor);diagnostic.captureAttack={type:attackType,phase:stage.name,elapsed:bloodClock,source:{...source},target:{x,y},sourceKind,...result};}
   if(sp.origin==='timed'){shield.lineStyle(1.4*boardScale,species?.accent??0xffe57a,.8);shield.strokeCircle(xx,yy,(15+(reduced?0:2*Math.sin(clock/220)))*scale);}
   diagnostic.creatures.push({origin:sp.origin||null,kind:sp.kind,speciesId:species?.id??sp.kind,speciesName:species?.name??sp.kind,shape:species?.shape??sp.kind,familyId:s.familyId??null,legCount,segments,scale,modelScale,eating:!!sp.eating,drinking,attackType:attacker?attackType:null,head:{x:xx,y:yy},mouth,angle,articulation,specialRig,attackOrgan:species?.shape==='scorpion'?'tail':'mouth',attackPoint,tailPath:tailWorld||null,...creatureDetails});
  });
  player.setPosition(x,y).setScale(playerFactor).setAngle(0).setAlpha(1);
  if(s.spidersEnabled&&!s.deathScene&&!s.gameOver&&clock<s.safeUntil){shield.lineStyle(2*boardScale,0x65d2d1,.8);for(let i=0;i<12;i++){shield.beginPath();shield.arc(x,y,16*playerFactor,i*Math.PI/6,i*Math.PI/6+.3);shield.strokePath();}}
  if(s.deathScene){const phase=s.deathScene.phase(),p=phase.progress;
   if(attackType&&['bite','swell','decay'].includes(phase.name)){
    const tone=attackType==='fire'?0x8d4030:attackType==='electric'?0xe0c8ee:0xb0bd66,amount=attackType==='rotten-egg'&&bloodClock<250?0:phase.name==='decay'?.6:phase.name==='swell'?.38:.22;
    const shake=reduced?0:Math.sin(bloodClock/170)*1.3*playerFactor;player.setPosition(x+shake,y).setScale(playerFactor*(phase.name==='decay'?1-.12*p:1)).setAngle(reduced?0:Math.sin(bloodClock/220)*3);
    face(player,tint(0xec9bc6,tone,amount),false,false,reduced?0:bloodClock,0,'fear');
    if(attackType==='rotten-egg'&&diagnostic.captureAttack)diagnostic.captureAttack.reaction={impactOccurred:bloodClock>=250,tintApplied:amount>0,fill:tint(0xec9bc6,tone,amount)};
    if(attackType==='fire'){captureFX.fillStyle(0x2e2524,.72);for(const q of [[-7,4],[6,5],[8,-5]])captureFX.fillCircle(x+q[0]*playerFactor,y+q[1]*playerFactor,1.7*playerFactor);}
   }
   else if(leechCapture){
    const sinking=phase.name==='decay',gone=phase.name==='scatter'||phase.name==='end';
    const size=phase.name==='swell'?1-.15*p:sinking?.85*(1-.65*p):1;
    player.setScale(size*playerFactor).setAlpha(gone?0:sinking?1-p:1).setAngle(sinking?p*18:Math.sin(bloodClock/80)*2);
    if(sharkCapture){
     const pressure=1-sharkCapture.bite,size=sharkCapture.avatarScale*playerFactor;
     player.setScale(size*(1-.08*pressure),size*(1+.06*pressure)).setAlpha(sharkCapture.visible?1:0).setAngle(Math.sin(bloodClock/80)*2*(1-sharkCapture.swallow));
    }
    face(player,tint(0xec9bc6,0x518ab2,phase.name==='bite'?.2:phase.name==='swell'?.2+.5*p:.7),false,false,bloodClock,0,'draining');
   }
   else if(phase.name==='bite'){player.x=x+Math.sin(p*Math.PI*6)*(1-p)*1.3*playerFactor;face(player,tint(0xec9bc6,0xc3a3e1,p*.7),false,false,bloodClock,0,'draining');for(const [a,c] of [[[9,-7],[15,-11]],[[11,-1],[18,-1]],[[9,5],[15,9]]])line(player,[a,c],0xd49535,2);}
   else if(phase.name==='swell'){player.setScale(phase.scale*playerFactor);face(player,tint(0x000080,0x403179,p*.65),false,true,bloodClock,0,'draining');}
   else if(phase.name==='decay'){const smooth=p*p*(3-2*p),fill=(Math.round(120*smooth)<<16)|(Math.round(129*smooth)<<8)|Math.round(mix(128,58,smooth));player.setPosition(x,y+p*4*playerFactor).setAngle(p*13).setScale(phase.scale*playerFactor,phase.scale*(1-.25*smooth)*playerFactor);if(!chebby?.available()){circle(player,0,0,11,fill,0xc8b58b);circle(player,-6,3,3,0x70552c);circle(player,7,5,2.8,0x594628);for(const cx of [-5,5]){line(player,[[cx-2,-5],[cx+2,-1]],0xf2eccb,1.9);line(player,[[cx+2,-5],[cx-2,-1]],0xf2eccb,1.9);}line(player,[[-4,5],[0,3],[4,5]],0x302c20,1.4);}}
   else {const travel=1-Math.pow(1-p,3),lift=Math.sin(Math.PI*p)*Math.min(52*boardScale,b.ph*.18),descriptors=s.deathScene.trajectories?s.deathScene.trajectories():s.deathScene.pieces();for(const f of descriptors){const radius=Math.min(8*f.size*playerFactor,b.pw/2,b.ph/2),lx=b.l+radius,hx=b.l+b.pw-radius,ly=b.t+radius,hy=b.t+b.ph-radius,endX=mix(lx,hx,f.u),endY=mix(ly,hy,f.v),startX=clamp(x+(f.startX||0)*playerFactor,lx,hx),startY=clamp(y+(f.startY||0)*playerFactor,ly,hy),atX=clamp(mix(startX,endX,travel),lx,hx),atY=clamp(mix(startY,endY,travel)-lift*(f.arc||1),ly,hy);fragment(pieces,atX,atY,radius,f.angle+(f.spin||0)*(1-p),f.shape);}}
  }else if(!s.gameOver){
   const gaze=emotion==='fear'&&nearest?Math.sign(nearest.at.i-pos.i):(s.lastTravel?.[0]||0),gazeY=emotion==='fear'&&nearest?-Math.sign(nearest.at.j-pos.j):0;
   face(player,s.playerPushes?.length?0xe885b8:0xec9bc6,!!s.playerPushes?.length,false,clock,gaze,emotion,gazeY);
  }
  // Keep Chebby's surprised eyes and mouth readable through the blue water.
  const avatarTint=attackType?(attackType==='fire'?0xc47d67:attackType==='electric'?0xe9daff:bloodClock<250?0xffffff:0xd3df8e):leechCapture?(stage.name==='bite'?tint(0xffffff,0xd6eeff,stage.progress):stage.name==='swell'?tint(0xd6eeff,0x8fc4e6,stage.progress):tint(0x8fc4e6,0x5797bf,stage.progress)):
   stage?.name==='swell'?tint(0x000080,0x403179,stage.progress*.65):stage?.name==='bite'?tint(0xffffff,0xc3a3e1,stage.progress*.7):stage?.name==='decay'?tint(0x403179,0x78813a,stage.progress):undefined;
  if(attackType==='rotten-egg'&&diagnostic.captureAttack?.reaction)diagnostic.captureAttack.reaction.avatarTint=avatarTint;
  let swallowClip=null;
  if(sharkCapture?.swallow>0){
   const a=s.deathAttacker,dx=b.px(a.to.i)-b.px(a.from.i),dy=b.py(a.to.j)-b.py(a.from.j),length=Math.hypot(dx,dy),nx=length?dx/length:1,ny=length?dy/length:0;
   const mouth={x:b.px(sharkCapture.mouth.i),y:b.py(sharkCapture.mouth.j)},offset=32*boardScale*(1-sharkCapture.swallow);
   swallowClip={x:mouth.x+nx*offset,y:mouth.y+ny*offset,nx,ny};
  }
  const pose=travelPose(s,pos,clock,b),weapon=s.weapon||{},ammo=Math.max(0,Number(weapon.ammo)||0);
  const armed=ammo>0&&s.selectedWeapon!=='bomb'&&!s.deathScene&&!s.gameOver;
  const rawDirection=weapon.direction||s.lastTravel||[0,-1];
  const di=Math.sign(Number(rawDirection[0])||0),dj=Math.sign(Number(rawDirection[1])||0);
  const aim=di?[di,0]:dj?[0,dj]:[0,-1],heading=aim[0]>0?-90:aim[0]<0?90:aim[1]>0?180:0;
  // Grid j increases upward; SVG/Phaser y increases downward. The avatar's
  // natural face points down, so this same heading rotates face and handgun.
  if(armed){pose.headHeading=heading;pose.bodyHeading=heading;pose.bodyDirection=[...aim];}
  chebby?.render({visible:!s.gameOver&&stage?.name!=='scatter'&&sharkCapture?.visible!==false,x:player.x,y:player.y,scaleX:player.scaleX,scaleY:player.scaleY,angle:player.angle,alpha:player.alpha,clock,mood:attackType?'draining':emotion,capture:!!stage,tint:avatarTint,swallow:sharkCapture?.swallow||0,swallowClip,threatDirection:nearest?[b.px(nearest.at.i)-x,b.py(nearest.at.j)-y]:null,...pose});
  const bulletVisuals=[];
  for(const shot of weapon.bullets||[]){
   if(!Number.isFinite(shot.position?.i)||!Number.isFinite(shot.position?.j))continue;
   const bx=b.px(shot.position.i),by=b.py(shot.position.j),dx=Number(shot.direction?.[0])||0,dy=-(Number(shot.direction?.[1])||0),length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;
   const damage=Math.max(1,Number(shot.damage)||1),power=damage>1?1.35:1;
   line(projectiles,[[bx-ux*9*boardScale*power,by-uy*9*boardScale*power],[bx,by]],damage>1?0xff78da:0xffb05c,3.2*boardScale*power,.8);
   circle(projectiles,bx,by,2.8*boardScale*power,damage>1?0xfff0fb:0xffedaa,0x93527c);
   bulletVisuals.push({id:shot.id,x:bx,y:by,damage,direction:[dx/length,dy/length]});
  }
  const hit=weapon.lastHit,hitAge=Number(weapon.clock)-Number(hit?.at);
  if(hit&&Number.isFinite(hit.position?.i)&&Number.isFinite(hit.position?.j)&&hitAge>=0&&hitAge<180){
   const alpha=reduced?.75:1-hitAge/180;
   projectiles.lineStyle(2*boardScale,0xffeda9,alpha);projectiles.strokeCircle(b.px(hit.position.i),b.py(hit.position.j),(6+(reduced?0:5*hitAge/180))*boardScale);
  }
  let muzzle=null,grip=null,hands=[];
  if(armed){
   weaponHand.setPosition(x,y).setScale(playerFactor).setAngle(heading);
   // The gun is centered along the head's forward (+y) axis. Two short
   // sleeves and distinct gloves meet the grip symmetrically; neither moves
   // with the original tentacle gait.
   for(const side of [-1,1]){
    line(weaponHand,[[side*8,6],[side*8,12],[side*5,17]],0x443052,4.7);
    line(weaponHand,[[side*8,6],[side*8,12],[side*5,17]],0xc59ada,2.7);
   }
   weaponHand.fillStyle(0x292a40,1);weaponHand.fillRoundedRect(-4,12,8,16,1.8);
   weaponHand.fillStyle(0x92afbb,1);weaponHand.fillRoundedRect(-3,13,6,11,1);
   weaponHand.fillStyle(0x34495d,1);weaponHand.fillRect(-3.5,24,7,4);
   weaponHand.lineStyle(.8,0xffe9cf,1);weaponHand.strokeRect(-3.5,24,7,4);
   if(weapon.damage>1){weaponHand.fillStyle(0xff78da,1);weaponHand.fillRect(-3,20,6,2);}
   if(weapon.automatic){
    weaponHand.fillStyle(0xffcf67,1);weaponHand.fillRect(-3,23,6,1.6);
    weaponHand.fillStyle(0x34495d,1);weaponHand.fillRoundedRect(-6,19,3,7,.8);
   }
   for(const side of [-1,1])circle(weaponHand,side*5,17,3.2,0xffd5c3,0x805176);
   const rad=heading*Math.PI/180,c=Math.cos(rad),sn=Math.sin(rad);
   const world=(u,v)=>({x:x+(u*c-v*sn)*playerFactor,y:y+(u*sn+v*c)*playerFactor});
   muzzle=world(0,28);grip=world(0,17);hands=[world(-5,17),world(5,17)];
  }
  if(s.selectedWeapon==='bomb'&&!s.deathScene&&!s.gameOver){weaponHand.setPosition(x,y).setScale(playerFactor).setAngle(heading);for(const side of [-1,1]){line(weaponHand,[[side*8,6],[side*10,11],[side*9,14]],0x443052,4.7);line(weaponHand,[[side*8,6],[side*10,11],[side*9,14]],0xc59ada,2.7);circle(weaponHand,side*9,14,2.7,0xffd5c3,0x805176);}}
  diagnostic.weapon={visible:armed,selectedWeapon:s.selectedWeapon||'gun',ammo,eggsCollected:weapon.eggsCollected||0,damage:weapon.damage||1,automatic:!!weapon.automatic,heading:armed?heading:null,anchor:{x,y},muzzle,grip,hands,direction:armed?[...aim]:null,bullets:bulletVisuals};
  if(!s.gameOver&&clock<s.resurrectionUntil){
   // Native atlas frames: high / open / low / open. No Phaser timer or tween.
   const beat=Math.floor(clock/130)%4,frames=[beat,4+(beat+1)%4];
   const pad=Math.min(8,b.pw*.025),gap=Math.min(20,b.pw*.05),captionSize=Math.min(30,Math.max(14,b.pw*.06));
   const availableH=Math.max(1,b.ph-pad*2-captionSize-18),slotW=Math.max(1,(b.pw-pad*2-gap)/2);
   const hover=Math.min(4,availableH*.02),sway=Math.min(3,slotW*.02),bounds=[];
   angels.forEach((sprite,index)=>{
    sprite.setFrame(frames[index]);
    const frame=sprite.frame,ratio=(frame?.realWidth||frame?.width||1)/(frame?.realHeight||frame?.height||1);
    const height=Math.min(440,Math.max(1,availableH-hover*2),Math.max(1,slotW-sway*2)/ratio),width=height*ratio;
    const phase=clock/560+index*Math.PI,xx=b.l+pad+slotW/2+index*(slotW+gap)+Math.sin(phase*.7)*sway,yy=b.t+pad+availableH/2+Math.sin(phase)*hover;
    sprite.setPosition(xx,yy).setDisplaySize(width,height).setVisible(true);
    bounds.push({x:xx-width/2,y:yy-height/2,width,height});
   });
   const cx=b.l+b.pw/2,cy=b.t+pad+availableH+captionSize/2+6,captionW=Math.min(b.pw-pad*2,captionSize*9+16);
   overlay.fillStyle(0xffffff,.94);overlay.fillRoundedRect(cx-captionW/2,cy-captionSize/2-4,captionW,captionSize+8,8);
   title.setText('Resurrection!').setFontSize(captionSize).setPosition(cx,cy).setVisible(true);
   resurrection={visible:true,frames,bounds};
  }
  if(s.gameOver){const cx=b.l+b.pw/2,cy=b.t+b.ph/2,pw=Math.min(b.pw-12,560);overlay.fillStyle(0xffffff,.96);overlay.fillRoundedRect(cx-pw/2,cy-75,pw,150,12);overlay.lineStyle(2,0xdc2626);overlay.strokeRoundedRect(cx-pw/2,cy-75,pw,150,12);title.setText('Game Over!').setFontSize(Math.max(24,Math.min(60,b.pw*.10))).setPosition(cx,cy-10).setVisible(true);subtitle.setText('Go to the ‘dunce’s stool!’').setFontSize(Math.max(11,Math.min(20,b.pw/23))).setPosition(cx,cy+38).setVisible(true);}
 }
 return {render,animationState(){return chebby?.animationState()||{walking:false,settling:false};},get emotion(){return emotion;},get diagnostics(){return {...diagnostic,gait:diagnostic.gait?{...diagnostic.gait,direction:[...diagnostic.gait.direction],screenDirection:[...diagnostic.gait.screenDirection],bodyDirection:[...diagnostic.gait.bodyDirection],gaitTravel:[...diagnostic.gait.gaitTravel]}:null,centipede:diagnostic.centipede?{points:diagnostic.centipede.points.map(p=>({...p})),spine:diagnostic.centipede.spine.map(p=>({...p}))}:null,chebby:chebby?.diagnostics||{ready:false,visible:false},resurrection:{...resurrection,frames:[...resurrection.frames],bounds:resurrection.bounds.map(b=>({...b}))},drinkingKinds:[...diagnostic.drinkingKinds],creatures:diagnostic.creatures.map(c=>({...c,head:{...c.head},mouth:{...c.mouth}}))};},get graphics(){return graphics;},destroy(){chebby?.destroy();objects.forEach(o=>o.destroy());}};
}
root.GridderActors={create,createGait};
})(window);
