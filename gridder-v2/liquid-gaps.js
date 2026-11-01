/* Pool layout and deterministic presentation clock. Ocean rendering is isolated
   below the lattice/math in ocean-water.js; this module never changes topology. */
(function(root){
'use strict';
function create(scene){
 const ocean=root.GridderOceanWater.create(scene);
 let key='',game=null,pools=[],phaseMs=0,lastTime=null,running=false,dirty=true,hasStarted=false;
 let builds=0,paints=0,stains=[];
 function paint(){ocean.paint(phaseMs/1000,stains);paints++;dirty=false;}
 function render(s,g){
  const next=JSON.stringify([s.gaps?.id,s.gaps?.pools,g.l,g.t,g.pw,g.ph,g.cellWidth,g.cellHeight]);
  if(game!==s.game){game=s.game;phaseMs=0;lastTime=null;running=false;dirty=true;hasStarted=false;}
  const nextStains=(s.poolBlood||[]).map(b=>({poolIndex:b.poolIndex,level:b.level,clock:b.clock,source:b.source?{x:g.px(b.source.i),y:g.py(b.source.j)}:null}));
  if(JSON.stringify(nextStains)!==JSON.stringify(stains)){stains=nextStains;dirty=true;}
  if(next===key){if(dirty)paint();return;}key=next;builds++;
  pools=(s.gaps?.pools||[]).map(p=>{
   const inset=Math.min(2,g.cellWidth*.06,g.cellHeight*.06),cells=p.cells||Array.from({length:p.w*p.h},(_,n)=>({i:p.i+n%p.w,j:p.j+Math.floor(n/p.w)}));
   const boundary=p.boundary||[{a:{i:p.i,j:p.j},b:{i:p.i+p.w,j:p.j}},{a:{i:p.i+p.w,j:p.j},b:{i:p.i+p.w,j:p.j+p.h}},{a:{i:p.i+p.w,j:p.j+p.h},b:{i:p.i,j:p.j+p.h}},{a:{i:p.i,j:p.j+p.h},b:{i:p.i,j:p.j}}];
   return {i:p.i,j:p.j,shape:p.shape||'rectangle',seed:p.seed>>>0,inset,x:g.px(p.i)+inset,y:g.py(p.j+p.h)+inset,w:p.w*g.cellWidth-2*inset,h:p.h*g.cellHeight-2*inset,
    cells:cells.map(c=>({x:g.px(c.i),y:g.py(c.j+1),w:g.cellWidth,h:g.cellHeight})),boundary:boundary.map(e=>({a:{x:g.px(e.a.i),y:g.py(e.a.j)},b:{x:g.px(e.b.i),y:g.py(e.b.j)}}))};
  }).filter(p=>p.w>0&&p.h>0);
  ocean.setPools(pools);dirty=true;paint();
 }
 function animate(time,s){
  if(!Number.isFinite(time)||!s)return;
  const reduced=root.GridderTheme?.reducedMotion?.()||false,visible=typeof document==='undefined'||!document.hidden;
  if(s.playing)hasStarted=true;
  // Initial ambient motion; explicit unfinished-game pause stays frozen.
  const active=!!(s.active&&visible&&(!hasStarted||s.playing||s.game?.complete())&&pools.length&&!reduced);
  let advance=false;
  if(active&&running&&lastTime!==null&&time>=lastTime){advance=time!==lastTime;phaseMs+=time-lastTime;}
  lastTime=time;running=active;
  if(reduced&&phaseMs!==0){phaseMs=0;dirty=true;}
  if(advance||dirty)paint();
 }
 return {render,animate,metrics:()=>({phaseMs,running,poolCount:pools.length,builds,paints,pools:pools.map(p=>({...p})),...ocean.metrics()}),destroy(){ocean.destroy();pools=[];}};
}
root.GridderLiquidGaps={create};
})(window);
