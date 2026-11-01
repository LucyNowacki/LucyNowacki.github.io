/* Deterministic, shape-constrained pool predators. No timers or rendering APIs. */
(function(root){
  'use strict';
  const EPS=1e-9,scanPeriod=40,warningMs=600,lungeMs=180,strikeMs=60,cooldownMs=2000,returnMs=300;
  const copy=p=>({i:p.i,j:p.j}),key=p=>`${p.i},${p.j}`,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>({i:a.i+(b.i-a.i)*t,j:a.j+(b.j-a.j)*t});
  function create(board,pools,options={}){
    let clock=0,nextScan=0,serial=0,captureLatched=false;
    const internal=new WeakMap();
    function cellsOf(pool){
      if(pool.cells)return pool.cells.map(copy);
      const cells=[];for(let j=pool.j;j<pool.j+pool.h;j++)for(let i=pool.i;i<pool.i+pool.w;i++)cells.push({i,j});return cells;
    }
    function prepare(pool,index,slot=0,count=1,kind='leech'){
      const cells=cellsOf(pool).sort((a,b)=>a.j-b.j||a.i-b.i),occupied=new Set(cells.map(key));
      if(!cells.length||cells.some(c=>!Number.isInteger(c.i)||!Number.isInteger(c.j)||c.i<0||c.j<0||c.i>=board.nx||c.j>=board.ny))
        throw new RangeError('A leech needs occupied cells inside the board.');
      const boundary=[];
      for(const c of cells)for(const [di,dj,a,b] of [
        [0,-1,{i:c.i,j:c.j},{i:c.i+1,j:c.j}],
        [1,0,{i:c.i+1,j:c.j},{i:c.i+1,j:c.j+1}],
        [0,1,{i:c.i+1,j:c.j+1},{i:c.i,j:c.j+1}],
        [-1,0,{i:c.i,j:c.j+1},{i:c.i,j:c.j}]
      ])if(!occupied.has(`${c.i+di},${c.j+dj}`))boundary.push({a,b,cell:c,inward:{di:-di,dj:-dj}});
      const seed=(pool.seed??index)>>>0,start=cells[(seed+Math.floor(slot*cells.length/count))%cells.length],visited=new Set(),tour=[];
      const steps=[[1,0],[0,1],[-1,0],[0,-1]],rotation=(seed+slot)%4,rotated=steps.slice(rotation).concat(steps.slice(0,rotation));
      function visit(cell){
        visited.add(key(cell));tour.push({i:cell.i+.5,j:cell.j+.5});
        for(const [di,dj] of rotated){
          const next={i:cell.i+di,j:cell.j+dj};
          if(!occupied.has(key(next))||visited.has(key(next)))continue;
          visit(next);tour.push({i:cell.i+.5,j:cell.j+.5});
        }
      }
      visit(start);if(visited.size!==cells.length)throw new RangeError('Leech pool cells must be connected by shared edges.');
      const leech={kind,id:kind==='shark'?`pool-shark-${index}`:`pool-leech-${index}${slot?`-${slot}`:''}`,poolId:pool.id||`pool-${seed}-${index}`,poolIndex:index,
        position:copy(tour[0]),heading:{di:1,dj:0},phase:'swim',phaseProgress:slot/count,clock:0,
        sizeScale:1,bloodMeals:0,target:null,shore:null};
      internal.set(leech,{pool,cells,occupied,boundary,tour,distance:0,speed:kind==='shark'?.44:.28+((seed+slot*2)%5)*.025,
        phaseOffset:1600*slot/count,firstAttackAt:slot*180,warningMs:kind==='shark'?900:warningMs,lungeMs:kind==='shark'?230:lungeMs,stainBase:0,
        phaseStart:0,phaseEnd:Infinity,home:copy(tour[0]),attackTo:null,returnFrom:null,
        captureSerial:0,fedSerial:0});
      return leech;
    }
    const leeches=(pools||[]).flatMap((pool,index)=>{
      const area=cellsOf(pool).length,count=Math.max(1,Math.min(3,Math.ceil(area/2)));
      return Array.from({length:count},(_,slot)=>prepare(pool,index,slot,count));
    });
    const poolBlood=(pools||[]).map((pool,poolIndex)=>({poolId:pool.id||`pool-${(pool.seed??poolIndex)>>>0}-${poolIndex}`,poolIndex,level:0,source:null,clock:0}));
    if(options.shark&&(pools||[]).length){
      let largest=0;for(let n=1;n<pools.length;n++)if(cellsOf(pools[n]).length>cellsOf(pools[largest]).length)largest=n;
      const count=Math.max(1,Math.min(3,Math.ceil(cellsOf(pools[largest]).length/2)));
      leeches.push(prepare(pools[largest],largest,count,count+1,'shark'));
    }
    function patrol(leech,milliseconds){
      const s=internal.get(leech),count=s.tour.length-1;
      if(count<=0)return;
      s.distance=(s.distance+milliseconds*s.speed/1000)%count;
      const at=Math.floor(s.distance),a=s.tour[at],b=s.tour[at+1];
      leech.position=mix(a,b,s.distance-at);leech.heading={di:b.i-a.i,dj:b.j-a.j};
    }
    function updateState(leech,delta,time){
      const s=internal.get(leech);
      if(leech.phase==='swim')patrol(leech,delta);
      else if(leech.phase==='cooldown'){
        const before=time-delta-s.phaseStart,after=time-s.phaseStart;
        if(before<returnMs&&s.returnFrom)leech.position=mix(s.returnFrom,s.home,clamp(after/returnMs,0,1));
        if(after>returnMs)patrol(leech,Math.min(delta,after-returnMs));
      }else if(leech.phase==='lunge')leech.position=mix(s.home,s.attackTo,clamp((time-s.phaseStart)/s.lungeMs,0,1));
      leech.clock=time;
      leech.phaseProgress=Number.isFinite(s.phaseEnd)?clamp((time-s.phaseStart)/(s.phaseEnd-s.phaseStart),0,1):((time+s.phaseOffset)%1600)/1600;
    }
    function cool(leech,duration=cooldownMs){
      const s=internal.get(leech);
      // home is the last point on the cell-centre patrol. Warning/lunge positions
      // and home share one occupied cell, so this return cannot cross a dry notch.
      s.returnFrom=copy(leech.position);s.phaseStart=clock;s.phaseEnd=clock+Math.max(returnMs,duration);
      leech.phase='cooldown';leech.phaseProgress=0;leech.target=null;leech.shore=null;
    }
    function resetCooldown(duration=cooldownMs){
      captureLatched=false;
      const safe=Number.isFinite(duration)?Math.max(0,duration):cooldownMs;
      for(const leech of leeches){
        const s=internal.get(leech);if(leech.phase==='swim'||leech.phase==='cooldown')s.home=copy(leech.position);
        cool(leech,safe);
      }
    }
    function onShore(point,shore){
      if(!point||!Number.isFinite(point.i)||!Number.isFinite(point.j))return false;
      const vertical=shore.a.i===shore.b.i,across=vertical?'i':'j',along=vertical?'j':'i';
      return Math.abs(point[across]-shore.a[across])<=EPS
        &&point[along]>=Math.min(shore.a[along],shore.b[along])-EPS
        &&point[along]<=Math.max(shore.a[along],shore.b[along])+EPS;
    }
    function spot(leech,player){
      const s=internal.get(leech);
      if(clock<s.firstAttackAt)return false;
      for(const edge of s.boundary){
        if(!onShore(player,edge))continue;
        const p=leech.position,c=edge.cell;
        if(p.i<c.i+EPS||p.i>c.i+1-EPS||p.j<c.j+EPS||p.j>c.j+1-EPS)continue;
        if(Math.hypot(p.i-player.i,p.j-player.j)>(leech.kind==='shark'?1.1:.85))continue;
        const vertical=edge.a.i===edge.b.i,along=vertical?'j':'i',target=copy(player);
        // Aim a little away from a corner, so both the head and its drag endpoint
        // belong to the actual shore-adjacent water cell.
        target[along]=clamp(target[along],Math.min(edge.a[along],edge.b[along])+.12,Math.max(edge.a[along],edge.b[along])-.12);
        s.home=copy(p);s.attackTo={i:target.i+edge.inward.di*.28,j:target.j+edge.inward.dj*.28};
        s.phaseStart=clock;s.phaseEnd=clock+s.warningMs;
        leech.phase='warning';leech.phaseProgress=0;leech.target=target;leech.shore={a:copy(edge.a),b:copy(edge.b)};
        leech.heading={di:target.i-p.i,dj:target.j-p.j};return true;
      }
      return false;
    }
    // Earliest intersection of an axis-aligned player sweep with the short,
    // warned section of THIS shore. Nearby parallel roads and notch interiors
    // never qualify merely because their screen-space distance is small.
    function sweptShore(a,b,leech,cellPixels){
      const shore=leech.shore,vertical=shore.a.i===shore.b.i,across=vertical?'i':'j',along=vertical?'j':'i';
      const radius=.20*Math.min(cellPixels('x'),cellPixels('y'))/cellPixels(vertical?'y':'x');
      const lo=Math.max(Math.min(shore.a[along],shore.b[along]),leech.target[along]-radius);
      const hi=Math.min(Math.max(shore.a[along],shore.b[along]),leech.target[along]+radius);
      const delta=b[across]-a[across],line=shore.a[across];
      if(Math.abs(delta)>EPS){
        const t=(line-a[across])/delta,p=mix(a,b,t);
        return t>=-EPS&&t<=1+EPS&&p[along]>=lo-EPS&&p[along]<=hi+EPS?clamp(t,0,1):null;
      }
      if(Math.abs(a[across]-line)>EPS)return null;
      const move=b[along]-a[along];
      if(Math.abs(move)<=EPS)return a[along]>=lo-EPS&&a[along]<=hi+EPS?0:null;
      const first=(lo-a[along])/move,last=(hi-a[along])/move,enter=Math.max(0,Math.min(first,last)),leave=Math.min(1,Math.max(first,last));
      return enter<=leave+EPS?clamp(enter,0,1):null;
    }
    function advance(milliseconds,player,cellPixels,options={}){
      // The controller owns the life/capture lifecycle. Until it releases this
      // shared latch, another leech cannot emit a second event for the same life.
      if(captureLatched)return null;
      const duration=Number.isFinite(milliseconds)?Math.max(0,milliseconds):0;
      const enabled=options.enabled!==false,canAttack=enabled&&options.canAttack!==false;
      if(!canAttack)for(const leech of leeches)if(leech.phase==='warning'||leech.phase==='lunge')cool(leech);
      if(!duration)return null;
      const start=clock,end=start+duration;
      const source=options.playerPath?.length?options.playerPath:[{from:player,to:player,start:0,end:1}];
      const paths=source.filter(p=>p.from&&p.to&&Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.end>=p.start)
        .map(p=>({...p,start:start+clamp(p.start,0,1)*duration,end:start+clamp(p.end,0,1)*duration}));
      const playerAt=time=>{
        const path=paths.find(p=>time>=p.start-EPS&&time<=p.end+EPS);
        return path?mix(path.from,path.to,path.end>path.start?clamp((time-path.start)/(path.end-path.start),0,1):0):player;
      };
      function contactBetween(a,b){
        let hit=null;
        for(const leech of leeches){
          if(leech.phase!=='lunge')continue;
          for(const path of paths){
            const lo=Math.max(a,path.start,internal.get(leech).phaseStart+strikeMs),hi=Math.min(b,path.end);if(hi<lo-EPS)continue;
            const position=time=>mix(path.from,path.to,path.end>path.start?clamp((time-path.start)/(path.end-path.start),0,1):0);
            const p=position(lo),q=position(hi),fraction=sweptShore(p,q,leech,cellPixels);
            if(fraction===null)continue;
            const time=lo+(hi-lo)*fraction;
            if(!hit||time<hit.time-EPS)hit={leech,time,from:mix(p,q,fraction)};
          }
        }
        return hit;
      }
      function escapeBetween(a,b){
        let escaped=null;
        for(const leech of leeches){
          if(leech.phase!=='warning'&&leech.phase!=='lunge')continue;
          for(const path of paths){
            const lo=Math.max(a,path.start),hi=Math.min(b,path.end);if(hi<lo-EPS)continue;
            const position=time=>mix(path.from,path.to,path.end>path.start?clamp((time-path.start)/(path.end-path.start),0,1):0);
            const p=position(lo),q=position(hi);
            let time=null;
            if(!onShore(p,leech.shore)||sweptShore(p,p,leech,cellPixels)===null)time=lo;
            else if(!onShore(q,leech.shore)||sweptShore(q,q,leech,cellPixels)===null){
              const reverse=sweptShore(q,p,leech,cellPixels);
              time=lo+(hi-lo)*(reverse===null?0:1-reverse);
            }
            if(time!==null&&(!escaped||time<escaped.time-EPS))escaped={leech,time};
          }
        }
        return escaped;
      }
      while(true){
        for(const leech of leeches){
          const s=internal.get(leech);if(clock<s.phaseEnd-EPS)continue;
          if(leech.phase==='warning'){
            // Escaping during the wind-up cancels this attack outright.
            if(!onShore(playerAt(clock),leech.shore)||sweptShore(playerAt(clock),playerAt(clock),leech,cellPixels)===null){cool(leech);continue;}
            leech.phase='lunge';s.phaseStart=clock;s.phaseEnd=clock+s.lungeMs;leech.phaseProgress=0;
          }else if(leech.phase==='lunge')cool(leech);
          else if(leech.phase==='cooldown'){leech.phase='swim';leech.phaseProgress=0;s.phaseStart=clock;s.phaseEnd=Infinity;s.returnFrom=null;}
        }
        if(clock>=nextScan-EPS){
          if(canAttack)for(const leech of leeches)if(leech.phase==='swim')spot(leech,playerAt(clock));
          nextScan=(Math.floor((clock+EPS)/scanPeriod)+1)*scanPeriod;
        }
        const until=Math.min(end,nextScan,...leeches.map(leech=>internal.get(leech).phaseEnd));
        const hit=canAttack?contactBetween(clock,until):null,escape=canAttack?escapeBetween(clock,until):null;
        const escaping=escape&&(!hit||escape.time<hit.time-EPS);
        const finish=escaping?escape.time:hit?hit.time:until,delta=finish-clock;
        for(const leech of leeches)updateState(leech,delta,finish);
        clock=finish;
        if(escaping){cool(escape.leech);continue;}
        if(hit){
          const {leech}=hit,s=internal.get(leech);leech.phase='feeding';leech.phaseProgress=0;leech.position=copy(s.attackTo);
          captureLatched=true;
          s.captureSerial=++serial;s.phaseStart=clock;s.phaseEnd=Infinity;s.stainBase=poolBlood[leech.poolIndex]?.level||0;
          return {id:leech.id,kind:leech.kind,poolId:leech.poolId,poolIndex:leech.poolIndex,pool:s.pool,
            from:copy(hit.from),to:copy(s.attackTo),shore:{a:copy(leech.shore.a),b:copy(leech.shore.b)},elapsed:clock-start,clock};
        }
        // Process a phase deadline at the frame endpoint before returning, so
        // 599+1 ms and one 600 ms call agree on the warning-to-lunge transition.
        if(clock>=end-EPS&&!leeches.some(leech=>internal.get(leech).phaseEnd<=clock+EPS))break;
      }
      return null;
    }
    function consumeBlood(id){
      const leech=leeches.find(l=>l.id===id);if(!leech)return false;
      const s=internal.get(leech);if(leech.phase!=='feeding'||!s.captureSerial||s.fedSerial===s.captureSerial)return false;
      s.fedSerial=s.captureSerial;leech.bloodMeals++;leech.sizeScale*=1.15;return true;
    }
    function stainBlood(id,progress,elapsed=0){
      const animal=leeches.find(l=>l.id===id);
      if(!animal||animal.kind!=='shark'||animal.phase!=='feeding'||!Number.isFinite(progress))return false;
      const state=internal.get(animal),blood=poolBlood[animal.poolIndex];if(!blood)return false;
      blood.level=Math.max(blood.level,Math.min(1,state.stainBase+.55*clamp(progress,0,1)));
      blood.source=copy(animal.position);blood.clock=Number.isFinite(elapsed)?Math.max(blood.clock,elapsed):blood.clock;
      return true;
    }
    const bloodSnapshot=()=>poolBlood.map(b=>({...b,source:b.source?copy(b.source):null}));
    const snapshot=()=>leeches.map(l=>({...l,position:copy(l.position),heading:{...l.heading},target:l.target?copy(l.target):null,
      shore:l.shore?{a:copy(l.shore.a),b:copy(l.shore.b)}:null}));
    return {leeches,advance,snapshot,bloodSnapshot,stainBlood,resetCooldown,consumeBlood,get clock(){return clock;}};
  }
  const api={create,warningMs,lungeMs,strikeMs,cooldownMs};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GridderPoolLeeches=api;
})(typeof window!=='undefined'?window:globalThis);
