/* Neon water creatures: supplied simulation clocks only, no timers or model writes. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
function stroke(g,points,width,colour,alpha=1){g.lineStyle(width,colour,alpha);g.beginPath();points.forEach((p,n)=>n?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokePath();}
function create(scene){
 const bodies=scene.add.graphics().setDepth(22.7),effects=scene.add.graphics().setDepth(23.5);
 bodies.name='gridder-water-leeches';effects.name='gridder-leech-capture';
 let entries=[];
 function render(s,g){
  bodies.clear();effects.clear();entries=[];
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
    const candidates=[head,...cells.map(c=>({x:g.px(c.i+.5),y:g.py(c.j+.5)}))];
    candidates.sort((a,b)=>Math.hypot(a.x-head.x,a.y-head.y)-Math.hypot(b.x-head.x,b.y-head.y));
    for(const factor of [1,.8,.6,.45,.3,.2,.1,.05]){for(const c of candidates)if(wet(c.x,c.y,34*q*factor+1)){centre={...c};q*=factor;fit=true;break;}if(fit)break;}
    if(!fit)continue;
    // Mirror the local vertical axis when facing left. A 180-degree turn
    // must keep the dorsal fin above the back and the pale belly below it.
    const upright=ux<0?-1:1;
    const wave=reduced?0:Math.sin(clock/150)*3,pt=(x,y)=>({x:centre.x+(ux*x-uy*y*upright)*q,y:centre.y+(uy*x+ux*y*upright)*q});
    const polygon=(vertices,colour,alpha=1)=>{bodies.fillStyle(colour,alpha);bodies.beginPath();vertices.map(v=>pt(...v)).forEach((v,i)=>i?bodies.lineTo(v.x,v.y):bodies.moveTo(v.x,v.y));bodies.closePath();bodies.fillPath();};
    // Facing right in local coordinates, transformed through the screen-space
    // heading; model j increases upwards while screen y increases downwards.
    polygon([[-17,0],[-29,-10+wave],[-25,wave],[-29,10+wave]],0x157caa);
    polygon([[-9,-5],[-2,-17],[4,-7]],0x23c5de);
    polygon([[-5,5],[-10,14],[5,6]],0x087da1);
    polygon([[-20,0],[-16,-5],[-8,-8],[3,-8],[14,-5],[22,0],[14,5],[3,8],[-8,8],[-16,5]],0x21d5e4);
    polygon([[-17,1],[-8,4],[5,5],[17,2],[21,0],[14,5],[3,8],[-8,8],[-16,5]],0xb7fff0);
    polygon([[5,3],[12,2],[20,0],[13,5]],0x5b1636);
    for(let n=0;n<3;n++)polygon([[8+n*3,2],[10+n*3,2],[9+n*3,4]],0xffffff);
    const eye=pt(12,-3);bodies.fillStyle(0x07152b,1);bodies.fillCircle(eye.x,eye.y,1.6*q);bodies.fillStyle(0xffffff,1);bodies.fillCircle(eye.x+.3*q,eye.y-.4*q,.5*q);
    const mouth=pt(19,1),pulse=reduced?.8:.72+.28*Math.sin(clock/260);
    if(animal.phase==='warning'){effects.lineStyle(1.5*q,0xffe75a,.55+.4*pulse);effects.strokeCircle(centre.x,centre.y,26*q);}
    let victim=null;
    if(attacker){const a=s.deathAttacker,t=clamp(elapsed/(a.dragDuration||650),0,1),ease=t*t*(3-2*t);victim={x:g.px(mix(a.from.i,a.to.i,ease)),y:g.py(mix(a.from.j,a.to.j,ease))};
     if(drinking){for(let n=0;n<=20;n++){const f=n/20,x=mix(victim.x,mouth.x,f),y=mix(victim.y,mouth.y,f);if(wet(x,y,2*scale)){effects.fillStyle(0xff234b,.7);effects.fillCircle(x,y,1.6*scale);}}const f=reduced?.5:(elapsed/240)%1,x=mix(victim.x,mouth.x,f),y=mix(victim.y,mouth.y,f);if(wet(x,y,2*scale)){effects.fillStyle(0xffd1b8,1);effects.fillCircle(x,y,1.5*scale);}}
    }
    entries.push({id:animal.id,kind:'shark',poolIndex:animal.poolIndex,phase:animal.phase,drinking,head:centre,headOffset,points:[centre,mouth],scale:q,modelScale:animal.sizeScale||1,clock,victim,orientation:{heading:angle,facing:upright,dorsalFin:pt(-2,-17),backbone:pt(-2,0),belly:pt(-2,6)}});
    continue;
   }
   const colour=[0x40ffdd,0xff4bdb,0xc7ff4b][animal.poolIndex%3],pulse=reduced?.8:.72+.28*Math.sin(clock/260);
   const points=[];
   for(let n=0;n<13;n++){
    const t=n/12,d=t*24*scale,wiggle=Math.sin(phase-t*7)*3.2*scale*Math.sin(t*Math.PI/2);
    let p={x:head.x-ux*d-uy*wiggle,y:head.y-uy*d+ux*wiggle};
    // Keep the entire tapered tail within its occupied cell union. No diagonal
    // shortcuts across a dry notch; points contract towards the last safe point.
    const r=radius*(1-.77*t)+2*scale;
    if(!wet(p.x,p.y,r)){const anchor=points[n-1]||head;for(let k=0;k<8&&!wet(p.x,p.y,r);k++)p={x:mix(p.x,anchor.x,.5),y:mix(p.y,anchor.y,.5)};}
    points.push(p);
   }
   for(let n=12;n>=0;n--){const p=points[n],r=radius*(1-.77*n/12);
    bodies.fillStyle(colour,.07+.06*pulse);bodies.fillCircle(p.x,p.y,r+2*scale);
    bodies.fillStyle(0x031b35,1);bodies.fillCircle(p.x,p.y,r+.8*scale);
    bodies.fillStyle(colour,.76+.2*pulse);bodies.fillCircle(p.x,p.y,r);
    bodies.fillStyle(0x103d55,.68);bodies.fillCircle(p.x-uy*r*.23,p.y+ux*r*.23,r*.65);
   }
   stroke(bodies,points,Math.max(.7,scale),0xd8ffff,.6);
   for(const side of [-1,1]){const ex=head.x+ux*1.5*scale-uy*side*2*scale,ey=head.y+uy*1.5*scale+ux*side*2*scale;bodies.fillStyle(0xe8ffff,1);bodies.fillCircle(ex,ey,1.4*scale);bodies.fillStyle(0x07101e,1);bodies.fillCircle(ex+ux*.5*scale,ey+uy*.5*scale,.7*scale);}
   if(animal.phase==='warning'){effects.lineStyle(1.5*scale,colour,.45+.35*pulse);effects.strokeCircle(head.x,head.y,(8+2*pulse)*scale);}
   if(drinking){
    stroke(bodies,points,3*scale,0xff083f,.5);stroke(bodies,points,1.2*scale,0xff234b,1);
    const flow=reduced?0:(elapsed/95)%12;for(let n=0;n<3;n++){const at=(flow+n*4)%12,k=Math.floor(at),p={x:mix(points[k].x,points[k+1].x,at-k),y:mix(points[k].y,points[k+1].y,at-k)};bodies.fillStyle(0xffd1b8,1);bodies.fillCircle(p.x,p.y,1.1*scale);}
   }
   let victim=null;
   if(attacker){
    const a=s.deathAttacker,t=clamp(elapsed/(a.dragDuration||650),0,1),ease=t*t*(3-2*t);victim={x:g.px(mix(a.from.i,a.to.i,ease)),y:g.py(mix(a.from.j,a.to.j,ease))};
    if(drinking){stroke(effects,[victim,head],4*scale,0xff083f,.3);stroke(effects,[victim,head],1.4*scale,0xff234b,.95);const flow=reduced?.5:(elapsed/240)%1;effects.fillStyle(0xffd1b8,1);effects.fillCircle(mix(victim.x,head.x,flow),mix(victim.y,head.y,flow),1.5*scale);}
    if(stage.name==='decay'){for(let n=0;n<6;n++){const q=(stage.progress+n/6)%1,a=n*2.4;effects.lineStyle(scale,0xb7ffff,.75*(1-q));effects.strokeCircle(victim.x+Math.cos(a)*7*scale,victim.y-q*19*scale,(1.5+q*2)*scale);}}
    if(t<1)for(let n=0;n<5;n++){const a=n*Math.PI*2/5+elapsed/450,r=(7+8*Math.sin(t*Math.PI))*scale;effects.fillStyle(0x9bffff,.75*(1-t));effects.fillCircle(victim.x+Math.cos(a)*r,victim.y+Math.sin(a)*r*.65,1.8*scale);}
   }
   entries.push({id:animal.id,poolIndex:animal.poolIndex,phase:animal.phase,drinking,head,headOffset,points,scale:size*scale,modelScale:animal.sizeScale||1,clock,victim});
  }
 }
 return {render,metrics:()=>({resourceCount:2,depths:[22.7,23.5],count:entries.length,leeches:entries.map(e=>({...e,head:{...e.head},points:e.points.map(p=>({...p}))}))}),destroy(){bodies.destroy();effects.destroy();entries=[];}};
}
root.GridderLeechActors={create};
})(window);
