/* Native Phaser vector actors. Grid indices become pixels only through geometry.px/py.
   px increases right; py decreases up. Collision radii remain in screen pixels. */
(function(root){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
// Pure presentation state: reference-distance phase, finite clock-driven envelopes.
function createGait(){
 let game=null,walker=null,clock=-1,position=null,direction=[0,0],moved=false,phase=0,sampleTime=0,lastMoveTime=-Infinity;
 let target=0,from=0,transitionTime=0,lastTime=-1;
 const smooth=p=>{p=clamp(p,0,1);return p*p*(3-2*p);};
 const amplitudeAt=time=>mix(from,target,smooth((time-transitionTime)/(target?120:160)));
 function update(s,pos,now,b){
  const time=Number.isFinite(s.gaitTime)?s.gaitTime:now;
  if(game!==s.game||walker!==s.walker||now<clock||time<lastTime){
   game=s.game;walker=s.walker;clock=-1;position=null;direction=[0,0];moved=false;phase=0;lastMoveTime=-Infinity;target=0;from=0;transitionTime=time;
  }
  const active=!!(s.playing&&!s.deathScene&&!s.gameOver&&!s.game?.complete?.());
  if(now!==clock){
   const dx=position?pos.i-position.i:0,dy=position?pos.j-position.j:0;
   moved=active&&Math.hypot(dx,dy)>1e-7;
   if(moved){
    lastMoveTime=time;
    const last=s.lastTravel;direction=last&&dx*last[0]+dy*last[1]>1e-7?[...last]:Math.abs(dx)>=Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
    const scale=root.GridderSpriteMetrics?.scale(b)??1;
    phase+=Math.hypot(dx*b.cellWidth,dy*b.cellHeight)/scale*Math.PI*2/120;
   }
   clock=now;position={i:pos.i,j:pos.j};sampleTime=time;
  }
  // Preserve a final actual displacement even when its input command just ended.
  const walking=!!(active&&moved&&(s.moving||time===sampleTime));
  const bridging=!!(!walking&&active&&s.moving&&s.centreWaiting&&s.centrePauseMs<=90&&time-lastMoveTime<=90);
  const gaitActive=walking||bridging;
  let amplitude=amplitudeAt(time);
  if(!active){target=0;from=0;transitionTime=time;amplitude=0;}
  else if(target!==Number(gaitActive)){from=amplitude;target=Number(gaitActive);transitionTime=time;}
  lastTime=time;
  const settling=bridging||Math.abs(amplitude-target)>1e-6;
  const facing=gaitActive?[...direction]:[0,0];
  return {walking,bridging,direction:facing,heading:gaitActive?(direction[0]>0?-90:direction[0]<0?90:direction[1]<0?0:180):0,gaitPhase:phase,gaitAmplitude:amplitude,settling};
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
 let resurrection={visible:false,frames:[],bounds:[]};
 const graphics=Object.freeze({player,spiders:Object.freeze(spiders.slice(0,2)),centipede,get enemies(){return spiders.slice();},blood:shield,pieces,angels,chebby:chebby?.image});
 const eggs=scene.add.graphics().setDepth(22.4),eggLabels=[];objects.push(eggs);
 const gait=createGait();
 function travelPose(s,pos,clock,b){return gait.update(s,pos,clock,b);}
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
 function centipedeBody(g,sp,s,b,at,angle,clock,drinking,bloodClock,jaw,scale,species){
  const variant=species?.shape,bodyColour=species?.body,accent=species?.accent,eye=species?.eye;
  const rad=-angle*Math.PI/180,c=Math.cos(rad),sn=Math.sin(rad);
  const body=s.chase.bodyPositions?.(sp,axis=>axis==='x'?b.cellWidth:b.cellHeight,scale)||[at];
  const toLocal=p=>{const dx=(b.px(p.i)-b.px(at.i))/scale,dy=(b.py(p.j)-b.py(at.j))/scale;return [dx*c-dy*sn,dx*sn+dy*c];};
  const local=body.map(toLocal);
  // Include every travelled corner: chords between spaced body rings cut across cells.
  const routeGrid=s.chase.bodyPositions?.(sp,axis=>axis==='x'?b.cellWidth:b.cellHeight,scale,true)||body,route=routeGrid.map(toLocal);
  diagnostic.centipede={points:body.map(p=>({i:p.i,j:p.j,x:b.px(p.i),y:b.py(p.j)})),spine:routeGrid.map(p=>({i:p.i,j:p.j,x:b.px(p.i),y:b.py(p.j)}))};
  if(route.length>1)line(g,route,bodyColour??0x38213f,variant==='wyrm'?8:10);
  for(let n=local.length-1;n>=1;n--){
   const q=local[n],front=local[n-1],dx=front[0]-q[0],dy=front[1]-q[1],len=Math.hypot(dx,dy)||1;
   const ux=len===1&&!dx&&!dy?0:dx/len,uy=len===1&&!dx&&!dy?-1:dy/len,vx=-uy,vy=ux;
   const point=(along,across)=>[q[0]+ux*along+vx*across,q[1]+uy*along+vy*across];
   const wave=Math.sin(clock/78-n*.85),radius=5.8;
   if(variant==='wyrm'){
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
  circle(g,0,0,7,bodyColour??0x482144,accent??0x8cf3d9);circle(g,0,-8,5,bodyColour??0x60314e,accent??0xb6ffd7);
  if(variant==='wyrm')for(const side of [-1,1])poly(g,[[side*3,-9],[side*8,-19],[side*7,-6]],accent,bodyColour);
  line(g,[[-3,-11],[-6,-16],[-9,-17+Math.sin(clock/95)]],accent??0x80ffdc,1.4);
  line(g,[[3,-11],[6,-16],[9,-17-Math.sin(clock/95)]],accent??0x80ffdc,1.4);
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
 function render(s,b){
  if(!s.walker||!s.chase)return;objects.forEach(o=>o.setVisible(true));pieces.clear();shield.clear();player.clear();overlay.clear();title.setVisible(false);subtitle.setVisible(false);angel.setVisible(false);angelPartner.setVisible(false);
  resurrection={visible:false,frames:[],bounds:[]};
  const boardScale=root.GridderSpriteMetrics?.scale(b)??1,playerFactor=boardScale*(root.GridderSpriteMetrics?.playerScale??1.25);
  const clock=s.chaseTime||0,reduced=root.GridderTheme?.reducedMotion?.()||false,pos=s.walker.position(),cell=axis=>axis==='x'?b.cellWidth:b.cellHeight;
  let x=b.px(pos.i),y=b.py(pos.j);
  const leechCapture=!!(s.deathScene&&['leech','shark'].includes(s.deathAttacker?.kind));
  if(leechCapture){
   const a=s.deathAttacker,t=clamp(s.deathScene.elapsed/(a.dragDuration||650),0,1),ease=t*t*(3-2*t);
   x=b.px(mix(a.from.i,a.to.i,ease));y=b.py(mix(a.from.j,a.to.j,ease));
  }
  for(const p of s.remains?.pieces||[]){if(p.eaten)continue;const g=s.remains.geometry(p,cell);fragment(pieces,b.px(g.i),b.py(g.j),g.radius,p.angle,p.shape);}
  const nearest=chooseEmotion(s,b,pos,clock),stage=s.deathScene?.phase(),bloodClock=s.deathScene?.elapsed||0;
  diagnostic.boardScale=boardScale;diagnostic.playerScale=playerFactor;
  diagnostic.captureKind=leechCapture?s.deathAttacker.kind:s.deathScene?'insect':null;
  diagnostic.victim={x,y};
  while(spiders.length<s.chase.spiders.length){const g=scene.add.graphics().setDepth(22.5);spiders.push(g);objects.push(g);}
  while(spiders.length>Math.max(3,s.chase.spiders.length)){const g=spiders.pop();objects.splice(objects.indexOf(g),1);g.destroy();}
  eggs.clear();const eggStates=s.ecology?.eggs||[];
  while(eggLabels.length<eggStates.length){const label=scene.add.text(0,0,'',{fontFamily:'system-ui, sans-serif',fontStyle:'bold',fontSize:'11px',color:'#fff3c4'}).setOrigin(.5).setDepth(23);eggLabels.push(label);objects.push(label);}
  while(eggLabels.length>eggStates.length){const label=eggLabels.pop();objects.splice(objects.indexOf(label),1);label.destroy();}
  eggStates.forEach((egg,index)=>{const ex=b.px(egg.position.i),ey=b.py(egg.position.j),progress=clamp(Number(egg.progress)||0,0,1),pulse=reduced?1:1+.12*Math.sin(clock/180),r=5*boardScale*pulse;eggs.fillStyle(0xffc86a,.9);eggs.fillEllipse(ex,ey,r*1.55,r*2);eggs.fillStyle(0xfff1b1,.95);eggs.fillCircle(ex-r*.2,ey-r*.3,r*.27);eggs.lineStyle(1.5*boardScale,0xff76c9,.9);eggs.beginPath();eggs.arc(ex,ey,9*boardScale,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);eggs.strokePath();const seconds=Math.max(0,Math.ceil((egg.hatchAt-(s.ecology?.clock||0))/1000));eggLabels[index].setPosition(ex,ey-15*boardScale).setText(Number.isFinite(seconds)?String(seconds):String(egg.count||''));});
  for(const g of spiders)g.setVisible(false);
  s.chase.spiders.forEach((sp,index)=>{
   const g=spiders[index];if(!g)return;g.clear();if(!s.spidersEnabled&&!s.deathScene)return;g.setVisible(true);
   const at=s.chase.position(sp);let xx=b.px(at.i),yy=b.py(at.j),angle=s.chase.heading(sp,pos),jaw=sp.eating?Math.sin(sp.eating.elapsed/70)*1.6:0;
   const attacker=!!(s.deathScene&&s.deathAttacker?.index===index),drinking=attacker&&(stage.name==='bite'||stage.name==='swell');
   const modelScale=sp.sizeScale||1,bloodGrowth=root.derivativeGridderChase?.bloodGrowth??1.15;
   let scale=modelScale;
   // The model awards blood once; the shared capture progress displays its inflation.
   // Re-rendering or pausing cannot advance this interpolation or mutate the model.
   if(attacker&&s.deathAttacker.bloodConsumed&&(stage.name==='bite'||stage.name==='swell')){
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
   g.setPosition(xx,yy).setAngle(angle).setScale(scale);
   const species=sp.species||root.GridderMonsterRoster?.get(s.familyId,sp.kind);
   let segments=1,legCount=8,attackTail=null;
   if(attacker&&species?.shape==='scorpion'){
    const distance=Math.hypot(x-xx,y-yy),tipY=-(distance-11*stage.scale*playerFactor)/scale;
    const p=stage.name==='bite'?clamp((stage.progress-.22)/.78,0,1):1,t=p*p*(3-2*p);
    const rest=[[0,5],[1,13],[6,18],[12,15],[13,7]],strike=[[0,5],[8,15],[20,-6],[12,tipY-9],[0,tipY]];
    attackTail=rest.map((q,n)=>[mix(q[0],strike[n][0],t),mix(q[1],strike[n][1],t)]);
   }
   if(sp.kind==='centipede'){segments=centipedeBody(g,sp,s,b,at,angle,clock+bloodClock,drinking,bloodClock,jaw,scale,species);legCount=Math.max(0,segments-1)*(species?.shape==='wyrm'?0:species?.shape==='millipede'?4:2);}
   else if(species)legCount=speciesBody(g,sp,clock+bloodClock,drinking,bloodClock,jaw,species,attackTail);
   else spiderBody(g,sp,clock+bloodClock,drinking,bloodClock,jaw);
   const rad=angle*Math.PI/180,mouth={x:xx+Math.sin(rad)*13*scale,y:yy-Math.cos(rad)*13*scale};
   const sway=Math.sin((clock+bloodClock)/170)*2.5,tailLocal=attackTail||(species?.shape==='scorpion'?[[0,5],[1,13],[6+sway,18],[12+sway,15],[13+sway,7]]:null);
   const tailWorld=tailLocal?.map(q=>({x:xx+(q[0]*Math.cos(rad)-q[1]*Math.sin(rad))*scale,y:yy+(q[0]*Math.sin(rad)+q[1]*Math.cos(rad))*scale}));
   const attackPoint=tailWorld?tailWorld[tailWorld.length-1]:mouth;
   if(drinking){if(!attackTail)suction(shield,{x:xx,y:yy},mouth,{x,y},stage.scale*playerFactor,bloodClock,sp.kind==='centipede'?20*scale:2*boardScale,boardScale);diagnostic.drinkingKinds.push(sp.kind);}
   if(sp.origin==='timed'){shield.lineStyle(1.4*boardScale,species?.accent??0xffe57a,.8);shield.strokeCircle(xx,yy,(15+(reduced?0:2*Math.sin(clock/220)))*scale);}
   diagnostic.creatures.push({origin:sp.origin||null,kind:sp.kind,speciesId:species?.id??sp.kind,speciesName:species?.name??sp.kind,shape:species?.shape??sp.kind,familyId:s.familyId??null,legCount,segments,scale,modelScale,eating:!!sp.eating,drinking,head:{x:xx,y:yy},mouth,angle,attackOrgan:species?.shape==='scorpion'?'tail':'mouth',attackPoint,tailPath:tailWorld||null});
  });
  player.setPosition(x,y).setScale(playerFactor).setAngle(0).setAlpha(1);
  if(s.spidersEnabled&&!s.deathScene&&!s.gameOver&&clock<s.safeUntil){shield.lineStyle(2*boardScale,0x65d2d1,.8);for(let i=0;i<12;i++){shield.beginPath();shield.arc(x,y,16*playerFactor,i*Math.PI/6,i*Math.PI/6+.3);shield.strokePath();}}
  if(s.deathScene){const phase=s.deathScene.phase(),p=phase.progress;
   if(leechCapture){
    const sinking=phase.name==='decay',gone=phase.name==='scatter'||phase.name==='end';
    const size=phase.name==='swell'?1-.15*p:sinking?.85*(1-.65*p):1;
    player.setScale(size*playerFactor).setAlpha(gone?0:sinking?1-p:1).setAngle(sinking?p*18:Math.sin(bloodClock/80)*2);
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
  const avatarTint=leechCapture?(stage.name==='bite'?tint(0xffffff,0xd6eeff,stage.progress):stage.name==='swell'?tint(0xd6eeff,0x8fc4e6,stage.progress):tint(0x8fc4e6,0x5797bf,stage.progress)):
   stage?.name==='swell'?tint(0x000080,0x403179,stage.progress*.65):stage?.name==='bite'?tint(0xffffff,0xc3a3e1,stage.progress*.7):stage?.name==='decay'?tint(0x403179,0x78813a,stage.progress):undefined;
  chebby?.render({visible:!s.gameOver&&stage?.name!=='scatter',x:player.x,y:player.y,scaleX:player.scaleX,scaleY:player.scaleY,angle:player.angle,alpha:player.alpha,clock,mood:emotion,capture:!!stage,tint:avatarTint,threatDirection:nearest?[b.px(nearest.at.i)-x,b.py(nearest.at.j)-y]:null,...travelPose(s,pos,clock,b)});
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
 return {render,animationState(){return chebby?.animationState()||{walking:false,settling:false};},get emotion(){return emotion;},get diagnostics(){return {...diagnostic,centipede:diagnostic.centipede?{points:diagnostic.centipede.points.map(p=>({...p})),spine:diagnostic.centipede.spine.map(p=>({...p}))}:null,chebby:chebby?.diagnostics||{ready:false,visible:false},resurrection:{...resurrection,frames:[...resurrection.frames],bounds:resurrection.bounds.map(b=>({...b}))},drinkingKinds:[...diagnostic.drinkingKinds],creatures:diagnostic.creatures.map(c=>({...c,head:{...c.head},mouth:{...c.mouth}}))};},get graphics(){return graphics;},destroy(){chebby?.destroy();objects.forEach(o=>o.destroy());}};
}
root.GridderActors={create,createGait};
})(window);
