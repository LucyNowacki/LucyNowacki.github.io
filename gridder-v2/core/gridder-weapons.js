/* Cardinal projectiles and swept pixel-space impacts. No renderer or timers. */
(function(root){
  'use strict';
  const EPS=1e-9,capacity=3;
  const copy=p=>({i:p.i,j:p.j});
  const cardinal=d=>Array.isArray(d)&&d.length===2&&Number.isInteger(d[0])&&Number.isInteger(d[1])&&Math.abs(d[0])+Math.abs(d[1])===1;
  function sweep(from,to,a,b,cellPixels,radius){
    const x=(from.i-a.i)*cellPixels('x'),y=(from.j-a.j)*cellPixels('y');
    const dx=(to.i-from.i-b.i+a.i)*cellPixels('x'),dy=(to.j-from.j-b.j+a.j)*cellPixels('y');
    const c=x*x+y*y-radius*radius;if(c<=EPS)return 0;
    const aa=dx*dx+dy*dy;if(aa<=EPS)return null;
    const bb=2*(x*dx+y*dy),disc=bb*bb-4*aa*c;if(disc<0)return null;
    const t=(-bb-Math.sqrt(Math.max(0,disc)))/(2*aa);
    return t>=-EPS&&t<=1+EPS?Math.max(0,Math.min(1,t)):null;
  }
  function create(board,{ammo=0}={}){
    let remaining=Math.max(0,Math.min(capacity,Math.floor(ammo)||0)),serial=0,clock=0,direction=[0,1],lastShotAt=null,lastHit=null;
    const bullets=[];
    function aim(next){if(cardinal(next))direction=next.slice();}
    function refill(){remaining=capacity;return remaining;}
    function fire(position,next=direction){
      if(!remaining||!cardinal(next)||!Number.isFinite(position?.i)||!Number.isFinite(position?.j))return false;
      aim(next);remaining--;lastShotAt=clock;
      bullets.push({id:`bullet-${++serial}`,position:copy(position),direction:direction.slice()});return true;
    }
    const alive=t=>typeof t.alive==='function'?t.alive():t.hp===undefined||t.hp>0;
    function advance(milliseconds,cellPixels,targets=[],{speed=600,hit=()=>({killed:false})}={}){
      const ms=Number.isFinite(milliseconds)?Math.max(0,milliseconds):0;if(!ms)return [];
      const velocity=Number.isFinite(speed)?Math.max(0,speed):0,start=clock,events=[];
      const motions=bullets.map(b=>{
        const from=copy(b.position),axis=b.direction[0]?'x':'y',distance=velocity*ms/(1000*cellPixels(axis));
        let limit=1;
        for(const [coordinate,bound,component] of [['i',board.nx,b.direction[0]],['j',board.ny,b.direction[1]]])if(component&&distance>0)
          limit=Math.min(limit,Math.max(0,(component>0?bound-from[coordinate]:from[coordinate])/distance));
        return {bullet:b,from,limit,to:{i:from.i+b.direction[0]*distance,j:from.j+b.direction[1]*distance},done:false};
      });
      const mix=(a,b,t)=>({i:a.i+(b.i-a.i)*t,j:a.j+(b.j-a.j)*t});
      function firstHit(motion){
        let first=null;
        for(const target of targets){
          if(!alive(target))continue;
          const paths=target.paths?.length?target.paths:[{from:target.position,to:target.position,start:0,end:1}];
          for(const path of paths){
            const lo=Math.max(0,path.start),hi=Math.min(motion.limit,path.end);if(hi<lo-EPS||!path.from||!path.to)continue;
            const at=t=>mix(path.from,path.to,path.end>path.start?(t-path.start)/(path.end-path.start):0);
            const radius=Number.isFinite(target.radius)?Math.max(0,target.radius):12;
            const fraction=sweep(mix(motion.from,motion.to,lo),mix(motion.from,motion.to,hi),at(lo),at(hi),cellPixels,radius);
            if(fraction===null)continue;
            const time=lo+(hi-lo)*fraction;
            if(!first||time<first.time-EPS||Math.abs(time-first.time)<=EPS&&String(target.id)<String(first.target.id))first={target,time,motion};
          }
        }
        return first;
      }
      // Resolve impacts in time order across all bullets. Later shots can pass
      // through a body already removed by an earlier impact in this frame.
      while(true){
        let first=null;
        for(const motion of motions){
          if(motion.done)continue;
          const contact=firstHit(motion);
          if(contact&&(!first||contact.time<first.time-EPS))first=contact;
        }
        if(!first)break;
        const {target,time,motion}=first,at=start+time*ms,result=hit(target,at)||{};
        motion.done=true;
        lastHit={targetId:target.id,position:mix(motion.from,motion.to,time),killed:Boolean(result.killed),at};
        events.push({...lastHit,type:result.killed?'kill':'hit',hp:result.hp});
      }
      for(const motion of motions){
        if(motion.done||motion.limit<1-EPS){const index=bullets.indexOf(motion.bullet);if(index>=0)bullets.splice(index,1);}
        else motion.bullet.position=copy(motion.to);
      }
      clock+=ms;return events;
    }
    function snapshot(){return {ammo:remaining,direction:direction.slice(),clock,lastShotAt,lastHit:lastHit?{...lastHit,position:copy(lastHit.position)}:null,
      bullets:bullets.map(b=>({...b,position:copy(b.position),direction:b.direction.slice()}))};}
    return {aim,refill,fire,advance,snapshot};
  }
  const api={create,sweep,capacity};root.GridderWeapons=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
