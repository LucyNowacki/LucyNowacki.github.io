/* Neon water creatures: supplied simulation clocks only, no timers or model writes. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
function sharkCapturePose(attacker,elapsed,layout){
 const duration=Math.max(121,attacker.dragDuration||650),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 const reach=smooth(elapsed/120),drag=smooth((elapsed-120)/(duration-120));
 const swallow=smooth((elapsed-1550)/850),chew=clamp((elapsed-650)/900,0,1);
 const bite=elapsed>=650&&elapsed<1550?.5+.5*Math.cos(chew*6*Math.PI):elapsed>=1550?1-swallow:1;
 const belly=elapsed>=2400&&elapsed<3200?Math.sin(Math.PI*(elapsed-2400)/800):0;
 const di=attacker.to.i-attacker.from.i,dj=attacker.to.j-attacker.from.j;
 let stepI=.35*di,stepJ=.35*dj;
 if(layout&&layout.cellWidth>0&&layout.cellHeight>0){
  const cw=layout.cellWidth,ch=layout.cellHeight,length=Math.hypot(di*cw,dj*ch),distance=26*(root.GridderSpriteMetrics?.scale(layout)??1);
  if(length>1e-9){stepI=di*distance/length;stepJ=dj*distance/length;}
 }
 const contact={i:mix(attacker.from.i,attacker.to.i,drag),j:mix(attacker.from.j,attacker.to.j,drag)};
 return {victim:{i:contact.i+stepI*swallow,j:contact.j+stepJ*swallow},mouth:contact,reach,drag,bite,swallow,belly,avatarScale:1-.55*swallow,visible:elapsed<2400};
}
function stroke(g,points,width,colour,alpha=1){g.lineStyle(width,colour,alpha);g.beginPath();points.forEach((p,n)=>n?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokePath();}
function create(scene){
 const bodies=scene.add.graphics().setDepth(22.7),effects=scene.add.graphics().setDepth(23.5),jaws=scene.add.graphics().setDepth(24.25);
 bodies.name='gridder-water-leeches';effects.name='gridder-leech-capture';jaws.name='gridder-shark-jaws';
 let entries=[];
 function render(s,g){
  bodies.clear();effects.clear();jaws.clear();entries=[];
  if(s.spidersEnabled===false)return;
  const scale=root.GridderSpriteMetrics?.scale(g)??1,reduced=root.GridderTheme?.reducedMotion?.()||false;
  const states=Array.isArray(s.leeches)?s.leeches:s.leeches?.leeches||[];
  for(const animal of states){
   const pool=s.gaps?.pools?.[animal.poolIndex];if(!pool)continue;
   const cells=pool.cells||Array.from({length:pool.w*pool.h},(_,n)=>({i:pool.i+n%pool.w,j:pool.j+Math.floor(n/pool.w)}));
   const occupied=new Set(cells.map(c=>c.i+','+c.j)),boundary=pool.boundary||cells.flatMap(c=>[
    !occupied.has(c.i+','+(c.j-1))&&{a:{i:c.i,j:c.j},b:{i:c.i+1,j:c.j}},
    !occupied.has((c.i+1)+','+c.j)&&{a:{i:c.i+1,j:c.j},b:{i:c.i+1,j:c.j+1}},
    !occupied.has(c.i+','+(c.j+1))&&{a:{i:c.i+1,j:c.j+1},b:{i:c.i,j:c.j+1}},
    !occupied.has((c.i-1)+','+c.j)&&{a:{i:c.i,j:c.j+1},b:{i:c.i,j:c.j}}
   ].filter(Boolean));
   const edges=boundary.map(e=>({ax:g.px(e.a.i),ay:g.py(e.a.j),bx:g.px(e.b.i),by:g.py(e.b.j)}));
   const wet=(x,y,r)=>{
    if(!cells.some(c=>x>=g.px(c.i)&&x<=g.px(c.i+1)&&y>=g.py(c.j+1)&&y<=g.py(c.j)))return false;
    return edges.every(e=>{const dx=e.bx-e.ax,dy=e.by-e.ay,t=clamp(((x-e.ax)*dx+(y-e.ay)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-e.ax-t*dx,y-e.ay-t*dy)>=r;});
   };
   const head={x:g.px(animal.position.i),y:g.py(animal.position.j)};
   const attacker=['leech','shark'].includes(s.deathAttacker?.kind)&&s.deathAttacker.leechId===animal.id&&s.deathScene;
   const stage=attacker?s.deathScene.phase():null,elapsed=attacker?s.deathScene.elapsed:0;
   const drinking=!!(attacker&&(stage.name==='bite'||stage.name==='swell'));
   let size=animal.sizeScale||1;
   if(drinking&&s.deathAttacker.bloodConsumed){const p=stage.name==='swell'?clamp(stage.progress,0,1):0;size=size/1.15*(1+.15*p*p*(3-2*p));}
   const radius=4.3*size*scale,clock=reduced?0:(attacker?elapsed:(animal.clock||0)),phase=clock/150;
   const di=animal.heading?.di??1,dj=animal.heading?.dj??0;
   let angle=Math.atan2(-dj*g.cellHeight,di*g.cellWidth),headOffset=0;
   if(attacker){
    const a=s.deathAttacker,tx=g.px(a.to.i),ty=g.py(a.to.j),inward=Math.atan2(ty-g.py(a.from.j),tx-g.px(a.from.i));
    // Presentation-only separation: model contact and Gridder's endpoint stay
    // untouched. Prefer inward, then nearby directions, shrinking if necessary.
    search:for(const length of [18,15,12,9,6])for(const turn of [0,.35,-.35,.7,-.7,Math.PI/2,-Math.PI/2]){
     const x=tx+Math.cos(inward+turn)*length*scale,y=ty+Math.sin(inward+turn)*length*scale;
     if(wet(x,y,radius+2.5*scale)){head.x=x;head.y=y;headOffset=length*scale;angle=Math.atan2(ty-y,tx-x);break search;}
    }
   }
   const ux=Math.cos(angle),uy=Math.sin(angle);
   if(animal.kind==='shark'){
    // Draw inside a safe disk wholly contained in the cell union. Scaling the
    // entire silhouette (including tail and fins) handles narrow pool notches.
    let q=scale*(animal.sizeScale||1),centre={...head},fit=false;
    const attackScale=scale*(animal.origin==='hatch'?size:1);
    const candidates=[head,...cells.map(c=>({x:g.px(c.i+.5),y:g.py(c.j+.5)}))];
    candidates.sort((a,b)=>Math.hypot(a.x-head.x,a.y-head.y)-Math.hypot(b.x-head.x,b.y-head.y));
    for(const factor of [1,.8,.6,.45,.3,.2,.1,.05]){for(const c of candidates)if(wet(c.x,c.y,34*q*factor+1)){centre={...c};q*=factor;fit=true;break;}if(fit)break;}
    if(!fit)continue;
    // Keep the established heading and reflected local basis so the mouth
    // and capture stream retain their exact screen-space endpoints.
    const upright=ux<0?-1:1;
    const wave=reduced?0:Math.sin(clock/150)*3,dorsalSway=reduced?0:Math.sin(clock/230+.8)*1.7;
    const pt=(x,y)=>({x:centre.x+(ux*x-uy*y*upright)*q,y:centre.y+(uy*x+ux*y*upright)*q});
    const polygon=(vertices,colour,alpha=1)=>{bodies.fillStyle(colour,alpha);bodies.beginPath();vertices.map(v=>pt(...v)).forEach((v,i)=>i?bodies.lineTo(v.x,v.y):bodies.moveTo(v.x,v.y));bodies.closePath();bodies.fillPath();};
    const capturePose=attacker?sharkCapturePose(s.deathAttacker,elapsed,g):null,belly=capturePose?.belly||0;
    // True dorsal view: +x is the snout, ±y are the two flanks. Both
    // pectoral fins and eyes are visible, with a slender fin on the spine.
    for(const side of [-1,1])polygon([[7,side*4],[1,side*7],[-8,side*17],[-13,side*18],[-10,side*13],[-8,side*6],[-2,side*4]],0x148ba8);
    // The rear peduncle bends sideways; the two caudal lobes follow its tip.
    polygon([[-18,wave*.55],[-24,wave*.9],[-29,wave-9],[-27,wave-2],[-27,wave+2],[-29,wave+9]],0x107d9c);
    polygon([[-20,wave*.65],[-16,-4+wave*.4],[-9,-7*(1+.35*belly)],[1,-8*(1+.35*belly)],[11,-6],[18,-3],[22,0],[18,3],[11,6],[1,8*(1+.35*belly)],[-9,7*(1+.35*belly)],[-16,4+wave*.4]],0x20b9cc);
    polygon([[-17,wave*.5],[-9,-3.8*(1+.35*belly)],[2,-5*(1+.35*belly)],[12,-3.7],[19,0],[12,3.7],[2,5*(1+.35*belly)],[-9,3.8*(1+.35*belly)]],0x64e4e4,.8);
    // A back fin seen from above: a dark centreline base and a flexing tip.
    polygon([[-10,0],[-5,-2.6],[-1,dorsalSway],[-5,2.6]],0x075776);
    polygon([[-8,0],[-5,-.9],[-2,dorsalSway*.65],[-5,.9]],0xa9f8ed,.75);
    if(!attacker)for(const side of [-1,1]){
     const eye=pt(13,side*3.5),glint=pt(13.4,side*3.3);
     bodies.fillStyle(0x07152b,1);bodies.fillCircle(eye.x,eye.y,1.45*q);
     bodies.fillStyle(0xeaffff,1);bodies.fillCircle(glint.x,glint.y,.45*q);
    }
    polygon([[16,-1],[20,0],[16,1]],0x183653);
    let mouth=pt(19,1),attack=null;
    if(attacker){
     // Shared model-space target: the avatar and jaw use the same current-frame
     // position. The wet body is still fitted independently to its safe disk.
     const pose=capturePose,target={x:g.px(pose.mouth.i),y:g.py(pose.mouth.j)},base=pt(14,0),natural=pt(21,0);
     const tip={x:mix(natural.x,target.x,pose.reach),y:mix(natural.y,target.y,pose.reach)};
     // Use the same projected shore normal as avatar clipping. Pool fitting
     // may relocate the body, but cannot rotate the mouth away from that plane.
     const dx=g.px(s.deathAttacker.from.i)-g.px(s.deathAttacker.to.i),dy=g.py(s.deathAttacker.from.j)-g.py(s.deathAttacker.to.j),len=Math.hypot(dx,dy),fx=len>.01?dx/len:ux,fy=len>.01?dy/len:uy,nx=-fy,ny=fx;
     const local=(along,across)=>({x:tip.x+fx*along+nx*across,y:tip.y+fy*along+ny*across});
     const draw=(points,colour)=>{jaws.fillStyle(colour,1);jaws.beginPath();points.forEach((p,n)=>n?jaws.lineTo(p.x,p.y):jaws.moveTo(p.x,p.y));jaws.closePath();jaws.fillPath();};
     // A frontal, three-quarter attack head: lateral x runs across the mouth,
     // longitudinal y runs from the upper snout toward the hinged mandible.
     // Both arches join at the two corners; only the lower jaw drops on a bite.
     const width=18*attackScale,upperHeight=13*attackScale,jawAngle=.24+1.08*pose.bite+.15*(1-pose.reach),lowerHeight=17*attackScale*Math.sin(jawAngle);
     const half=18, arch=(height,sign)=>Array.from({length:half+1},(_,i)=>{
      const x=-1+2*i/half,y=sign*height*Math.sqrt(Math.max(0,1-x*x));
      return local(y,x*width);
     });
     const upperArch=arch(upperHeight,-1),lowerArch=arch(lowerHeight,1),hinges=[upperArch[0],upperArch[half]];
     const upperOuter=arch(upperHeight+3.4*attackScale,-1),lowerOuter=arch(lowerHeight+4.7*attackScale,1);
     const upperTeeth=[],lowerTeeth=[],teeth=[];
     const paint=(layer,points,colour)=>{layer.fillStyle(colour,1);layer.beginPath();points.forEach((p,n)=>n?layer.lineTo(p.x,p.y):layer.moveTo(p.x,p.y));layer.closePath();layer.fillPath();};
     // The head and oral cavity sit behind the original avatar. The rims and
     // teeth sit in front so the mouth visibly bites and swallows the artwork.
     const headShape=[local(-23*attackScale,-18*attackScale),local(-29*attackScale,-12*attackScale),local(-32*attackScale,0),local(-29*attackScale,12*attackScale),local(-23*attackScale,18*attackScale),...lowerOuter.slice().reverse()];
     paint(bodies,headShape,0x638b8c);
     paint(bodies,[local(-21*attackScale,-15*attackScale),local(-27*attackScale,-9*attackScale),local(-29*attackScale,0),local(-27*attackScale,9*attackScale),local(-21*attackScale,15*attackScale),...upperOuter.slice().reverse()],0x94a9a2);
     paint(bodies,[...upperArch,...lowerArch.slice().reverse()],0x361520);
     // Pale lower jaw skin and pink gum form unbroken, rounded dental rims.
     const lowerSkin=arch(lowerHeight+8*attackScale,1);
     paint(jaws,[...lowerSkin,...lowerOuter.slice().reverse()],0xd5d3bd);
     paint(jaws,[...upperOuter,...upperArch.slice().reverse()],0xad5362);
     paint(jaws,[...lowerOuter,...lowerArch.slice().reverse()],0xb35f69);
     // Triangles have wide bases on the actual curved gum, with their tips
     // directed into the dark cavity rather than floating off straight prongs.
     const tooth=(fraction,upper)=>{
      const h=upper?upperHeight:lowerHeight,sign=upper?-1:1,x=fraction*width,delta=(upper?2.1:1.75)*attackScale;
      const yAt=v=>sign*h*Math.sqrt(Math.max(0,1-(v/width)*(v/width)));
      const a=local(yAt(x-delta),x-delta),b=local(yAt(x+delta),x+delta);
      const length=(upper?5.8:3.7)*(1-.22*Math.abs(fraction))*attackScale;
      const p=local(yAt(x)-sign*length,x*.94);
      const tri=[a,b,p];paint(jaws,tri,0xf4efdc);teeth.push(p);(upper?upperTeeth:lowerTeeth).push(tri);
     };
     for(const x of [-.75,-.5,-.25,0,.25,.5,.75])tooth(x,true);
     for(const x of [-.7,-.42,-.14,.14,.42,.7])tooth(x,false);
     for(const side of [-1,1]){const eye=local(-20*attackScale,side*16*attackScale);bodies.fillStyle(0x142832,1);bodies.fillCircle(eye.x,eye.y,1.65*attackScale);bodies.fillStyle(0xd9e8df,1);bodies.fillCircle(eye.x-fx*.4*attackScale,eye.y-fy*.4*attackScale,.45*attackScale);}
     mouth=tip;attack={phase:elapsed<120?'reach':elapsed<(s.deathAttacker.dragDuration||650)?'drag':elapsed<1550?'chew':elapsed<2400?'swallow':'belly',reach:pose.reach,drag:pose.drag,bite:pose.bite,swallow:pose.swallow,belly:pose.belly,bellyRegion:{centre:pt(-4,0),axis:pt(1,0),halfLength:8*q,halfWidth:8*(1+.35*belly)*q},jawHalfGap:lowerHeight,target,mouth,base,teeth,
      jawGeometry:{origin:tip,forward:{x:fx,y:fy},lateral:{x:nx,y:ny},upperArch,lowerArch,hinges,upperTeeth,lowerTeeth,jawAngle,opening:upperHeight+lowerHeight}};
    }
    const pulse=reduced?.8:.72+.28*Math.sin(clock/260);
    if(animal.phase==='warning'){effects.lineStyle(1.5*q,0xffe75a,.55+.4*pulse);effects.strokeCircle(centre.x,centre.y,26*q);}
    let victim=null;
    if(attacker){const pose=sharkCapturePose(s.deathAttacker,elapsed,g);victim={x:g.px(pose.victim.i),y:g.py(pose.victim.j)};
     if(drinking&&elapsed>=120&&elapsed<1550){for(let n=0;n<=20;n++){const f=n/20,x=mix(victim.x,mouth.x,f),y=mix(victim.y,mouth.y,f);if(wet(x,y,2*attackScale)){effects.fillStyle(0xff234b,.7);effects.fillCircle(x,y,1.6*attackScale);}}const f=reduced?.5:(elapsed/240)%1,x=mix(victim.x,mouth.x,f),y=mix(victim.y,mouth.y,f);if(wet(x,y,2*attackScale)){effects.fillStyle(0xffd1b8,1);effects.fillCircle(x,y,1.5*attackScale);}}
    }
    entries.push({id:animal.id,origin:animal.origin||null,kind:'shark',poolIndex:animal.poolIndex,phase:animal.phase,drinking,head:centre,headOffset,points:[centre,mouth],scale:q,modelScale:animal.sizeScale||1,clock,victim,
     orientation:{heading:angle,facing:upright,dorsalFin:pt(-1,dorsalSway),backbone:pt(-5,0)},
     anatomy:{view:'dorsal',snout:pt(22,0),eyes:[pt(13,-3.5),pt(13,3.5)],pectoralTips:[pt(-13,-18),pt(-13,18)],dorsalBase:pt(-5,0),dorsalTip:pt(-1,dorsalSway),tailJoint:pt(-20,wave*.65),tailBase:pt(-24,wave*.9),caudalTips:[pt(-29,wave-9),pt(-29,wave+9)]},
     motion:{tail:wave,dorsal:dorsalSway},attack});
    continue;
   }
   // Hatchlings retain their parent's silhouette but scale the whole leech,
   // including its tail and eyes, instead of shrinking just its body radius.
   const detailScale=scale*(animal.origin==='hatch'?size:1);
   const colour=[0x40ffdd,0xff4bdb,0xc7ff4b][animal.poolIndex%3],pulse=reduced?.8:.72+.28*Math.sin(clock/260);
   const points=[];
   for(let n=0;n<13;n++){
    const t=n/12,d=t*24*detailScale,wiggle=Math.sin(phase-t*7)*3.2*detailScale*Math.sin(t*Math.PI/2);
    let p={x:head.x-ux*d-uy*wiggle,y:head.y-uy*d+ux*wiggle};
    // Keep the entire tapered tail within its occupied cell union. No diagonal
    // shortcuts across a dry notch; points contract towards the last safe point.
    const r=radius*(1-.77*t)+2*detailScale;
    if(!wet(p.x,p.y,r)){const anchor=points[n-1]||head;for(let k=0;k<8&&!wet(p.x,p.y,r);k++)p={x:mix(p.x,anchor.x,.5),y:mix(p.y,anchor.y,.5)};}
    points.push(p);
   }
   for(let n=12;n>=0;n--){const p=points[n],r=radius*(1-.77*n/12);
    bodies.fillStyle(colour,.07+.06*pulse);bodies.fillCircle(p.x,p.y,r+2*detailScale);
    bodies.fillStyle(0x031b35,1);bodies.fillCircle(p.x,p.y,r+.8*detailScale);
    bodies.fillStyle(colour,.76+.2*pulse);bodies.fillCircle(p.x,p.y,r);
    bodies.fillStyle(0x103d55,.68);bodies.fillCircle(p.x-uy*r*.23,p.y+ux*r*.23,r*.65);
   }
   stroke(bodies,points,Math.max(.7,detailScale),0xd8ffff,.6);
   for(const side of [-1,1]){const ex=head.x+ux*1.5*detailScale-uy*side*2*detailScale,ey=head.y+uy*1.5*detailScale+ux*side*2*detailScale;bodies.fillStyle(0xe8ffff,1);bodies.fillCircle(ex,ey,1.4*detailScale);bodies.fillStyle(0x07101e,1);bodies.fillCircle(ex+ux*.5*detailScale,ey+uy*.5*detailScale,.7*detailScale);}
   if(animal.phase==='warning'){effects.lineStyle(1.5*detailScale,colour,.45+.35*pulse);effects.strokeCircle(head.x,head.y,(8+2*pulse)*detailScale);}
   if(drinking){
    stroke(bodies,points,3*detailScale,0xff083f,.5);stroke(bodies,points,1.2*detailScale,0xff234b,1);
    const flow=reduced?0:(elapsed/95)%12;for(let n=0;n<3;n++){const at=(flow+n*4)%12,k=Math.floor(at),p={x:mix(points[k].x,points[k+1].x,at-k),y:mix(points[k].y,points[k+1].y,at-k)};bodies.fillStyle(0xffd1b8,1);bodies.fillCircle(p.x,p.y,1.1*detailScale);}
   }
   let victim=null;
   if(attacker){
    const a=s.deathAttacker,t=clamp(elapsed/(a.dragDuration||650),0,1),ease=t*t*(3-2*t);victim={x:g.px(mix(a.from.i,a.to.i,ease)),y:g.py(mix(a.from.j,a.to.j,ease))};
    if(drinking){stroke(effects,[victim,head],4*detailScale,0xff083f,.3);stroke(effects,[victim,head],1.4*detailScale,0xff234b,.95);const flow=reduced?.5:(elapsed/240)%1;effects.fillStyle(0xffd1b8,1);effects.fillCircle(mix(victim.x,head.x,flow),mix(victim.y,head.y,flow),1.5*detailScale);}
    if(stage.name==='decay'){for(let n=0;n<6;n++){const q=(stage.progress+n/6)%1,a=n*2.4;effects.lineStyle(detailScale,0xb7ffff,.75*(1-q));effects.strokeCircle(victim.x+Math.cos(a)*7*detailScale,victim.y-q*19*detailScale,(1.5+q*2)*detailScale);}}
    if(t<1)for(let n=0;n<5;n++){const a=n*Math.PI*2/5+elapsed/450,r=(7+8*Math.sin(t*Math.PI))*detailScale;effects.fillStyle(0x9bffff,.75*(1-t));effects.fillCircle(victim.x+Math.cos(a)*r,victim.y+Math.sin(a)*r*.65,1.8*detailScale);}
   }
   entries.push({id:animal.id,origin:animal.origin||null,kind:animal.kind||'leech',poolIndex:animal.poolIndex,phase:animal.phase,drinking,head,headOffset,points,scale:size*scale,modelScale:animal.sizeScale||1,clock,victim});
  }
 }
 return {render,metrics:()=>({resourceCount:3,depths:[22.7,23.5,24.25],count:entries.length,leeches:entries.map(e=>({...e,head:{...e.head},points:e.points.map(p=>({...p}))}))}),destroy(){bodies.destroy();effects.destroy();jaws.destroy();entries=[];}};
}
root.GridderLeechActors={create,sharkCapturePose};
})(window);
