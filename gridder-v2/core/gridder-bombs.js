/* Stationary planted bombs and closed circular blasts on active-play time. */
(function(root){
  'use strict';
  const EPS=1e-9,fuseMs=3000,blastMs=1000,radiusCells=1.5,damage=3;
  const copy=p=>({i:p.i,j:p.j}),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create(board,{count=0}={}){
    let remaining=Number.isFinite(count)?clamp(Math.floor(count),0,Number.MAX_SAFE_INTEGER):0,clock=0,serial=0;
    const planted=[],blasts=[];
    function collect(){remaining=Math.min(Number.MAX_SAFE_INTEGER,remaining+1);return remaining;}
    function plantBomb(position){
      if(!remaining||!Number.isFinite(position?.i)||!Number.isFinite(position?.j)
        ||position.i<0||position.j<0||position.i>board.nx||position.j>board.ny)return false;
      remaining--;
      planted.push({id:`bomb-${++serial}`,position:copy(position),plantedAt:clock,explodeAt:clock+fuseMs});
      return true;
    }
    const alive=t=>typeof t.alive==='function'?t.alive():t.hp===undefined||t.hp>0;
    function targetAt(target,t){
      const path=target.paths?.find(p=>p.from&&p.to&&t>=p.start-EPS&&t<=p.end+EPS);
      if(!path)return target.position;
      const u=path.end>path.start?clamp((t-path.start)/(path.end-path.start),0,1):0;
      return {i:path.from.i+(path.to.i-path.from.i)*u,j:path.from.j+(path.to.j-path.from.j)*u};
    }
    function advance(milliseconds,cellPixels,targets=[],{hit=()=>({killed:false})}={}){
      const ms=Number.isFinite(milliseconds)?Math.max(0,milliseconds):0;if(!ms)return [];
      const end=clock+ms,radiusPx=radiusCells*Math.min(cellPixels('x'),cellPixels('y')),events=[];
      for(let n=0;n<planted.length;){
        const bomb=planted[n];if(bomb.explodeAt>end+EPS){n++;continue;}
        planted.splice(n,1);const at=bomb.explodeAt,hits=[];
        for(const target of targets){
          if(!alive(target))continue;
          const p=targetAt(target,clamp((at-clock)/ms,0,1));if(!p)continue;
          const distance=Math.hypot((p.i-bomb.position.i)*cellPixels('x'),(p.j-bomb.position.j)*cellPixels('y'));
          const bodyRadius=Number.isFinite(target.radius)?Math.max(0,target.radius):0;
          if(distance>radiusPx+bodyRadius+EPS)continue;
          const result=hit(target,at,damage)||{};hits.push({targetId:target.id,hp:result.hp,killed:Boolean(result.killed),damage,at});
        }
        const blast={id:bomb.id,position:copy(bomb.position),radiusPx,startedAt:at,durationMs:blastMs,damage};
        blasts.push(blast);events.push({...blast,type:'blast',at,hits});
      }
      clock=end;
      for(let n=blasts.length-1;n>=0;n--)if(clock-blasts[n].startedAt>=blastMs-EPS)blasts.splice(n,1);
      return events;
    }
    function snapshot(){
      return {count:remaining,clock,planted:planted.map(b=>({...b,position:copy(b.position),progress:clamp((clock-b.plantedAt)/fuseMs,0,1),remainingMs:Math.max(0,b.explodeAt-clock)})),
        blasts:blasts.map(b=>({...b,position:copy(b.position),ageMs:clock-b.startedAt}))};
    }
    return {collect,plantBomb,advance,snapshot};
  }
  const api={create,fuseMs,blastMs,radiusCells,damage};root.GridderBombs=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
