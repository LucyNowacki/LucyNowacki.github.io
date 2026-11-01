/* Edge-constrained spiders and a trailing centipede, independent of painted grid. */
(function(root){
  'use strict';
  const epsilon=1e-9,bloodGrowth=1.15;
  const copy=p=>({i:p.i,j:p.j});
  function interpolate(path,t){
    const u=path.end>path.start?(t-path.start)/(path.end-path.start):0;
    return {i:path.from.i+(path.to.i-path.from.i)*u,j:path.from.j+(path.to.j-path.from.j)*u};
  }
  function collides(player,enemy,cellPixels,radius=18,fromTime=0){
    for(const a of player)for(const b of enemy){
      if(b.eating)continue;
      const start=Math.max(a.start,b.start,fromTime),end=Math.min(a.end,b.end);if(end<start)continue;
      const p0=interpolate(a,start),p1=interpolate(a,end),s0=interpolate(b,start),s1=interpolate(b,end);
      const x=(p0.i-s0.i)*cellPixels('x'),y=(p0.j-s0.j)*cellPixels('y');
      const dx=(p1.i-s1.i)*cellPixels('x')-x,dy=(p1.j-s1.j)*cellPixels('y')-y;
      const u=dx*dx+dy*dy?Math.max(0,Math.min(1,-(x*dx+y*dy)/(dx*dx+dy*dy))):0;
      if(Math.hypot(x+u*dx,y+u*dy)<=radius)return true;
    }
    return false;
  }
  function create(board,difficulty='guided',options={},navigation=null){
    const rates={guided:[.38,.34],explorer:[.48,.43],challenge:[.58,.52]}[difficulty]||[.38,.34];
    let nextId=1;
    const roster=()=>root.GridderMonsterRoster||(typeof require==='function'?require('../monster-roster.js'):null);
    const rateFor=kind=>kind==='black'?rates[0]:kind==='white'?rates[1]:rates[0]+.06;
    const spiders=[{kind:'black',i:board.nx,j:board.ny,segment:null,rate:rates[0]},{kind:'white',i:board.nx,j:0,segment:null,rate:rates[1]},
      {kind:'centipede',i:0,j:board.ny,segment:null,rate:rates[0]+.06}]
      .map(s=>Object.assign(s,{id:`creature-${nextId++}`,origin:'base',species:roster()?.get(options.familyId||'algebraic',s.kind)||null,
        sizeScale:1,speedScale:1,meals:0,bloodMeals:0,eating:null,lastBrush:null}));
    const position=s=>s.segment?{i:s.i+s.segment.di*s.segment.progress,j:s.j+s.segment.dj*s.segment.progress}:copy(s);
    const histories=new WeakMap();
    const bodyCount=s=>6+2*s.meals;
    const displayScale=cellPixels=>options.referencePlotWidth>0?board.nx*cellPixels('x')/options.referencePlotWidth:1;
    const spacing=(s,cellPixels)=>12*s.sizeScale*displayScale(cellPixels);
    const distance=(a,b,cellPixels)=>Math.hypot((a.i-b.i)*cellPixels('x'),(a.j-b.j)*cellPixels('y'));
    function resetHistory(s){if(s.kind==='centipede')histories.set(s,[position(s)]);}
    spiders.forEach(resetHistory);
    function isLegalNode(p){
      return Number.isInteger(p?.i)&&Number.isInteger(p?.j)&&p.i>=0&&p.i<=board.nx&&p.j>=0&&p.j<=board.ny
        &&!navigation?.isPoolInterior?.(p)&&(!navigation?.isEdgeOpen||navigation.isEdgeOpen(p,p));
    }
    function findSpawnNode(target,cellPixels,{border=false,far=false,offset=0}={}){
      const nodes=[];
      for(let j=0;j<=board.ny;j++)for(let i=0;i<=board.nx;i++){
        const p={i,j};if(isLegalNode(p)&&(!border||i===0||j===0||i===board.nx||j===board.ny))nodes.push(p);
      }
      const metric=p=>Math.hypot((p.i-target.i)*cellPixels('x'),(p.j-target.j)*cellPixels('y'));
      nodes.sort((a,b)=>(far?metric(b)-metric(a):metric(a)-metric(b))||a.j-b.j||a.i-b.i);
      return nodes.length?copy(nodes[Math.max(0,Math.floor(offset))%nodes.length]):null;
    }
    function spawn({kind='centipede',species=null,origin='hatch',position:at,...extras}={}){
      if(!['black','white','centipede'].includes(kind)||!isLegalNode(at))return null;
      const s={...extras,id:`creature-${nextId++}`,origin,kind,species:species||roster()?.get(options.familyId||'algebraic',kind)||null,
        ...copy(at),segment:null,facing:null,rate:rateFor(kind),sizeScale:1,speedScale:1,meals:0,bloodMeals:0,eating:null,lastBrush:null};
      spiders.push(s);resetHistory(s);return s;
    }
    function releaseMeal(s,world){
      const meal=s.eating,owner=meal?.world||world;
      if(meal&&owner?.release)owner.release(meal.piece,s);
      s.eating=null;
    }
    function remove(s,world=null){
      const index=spiders.indexOf(s);if(index<0)return false;
      releaseMeal(s,world);histories.delete(s);spiders.splice(index,1);return true;
    }
    function remember(s,from,to,cellPixels){
      if(s.kind!=='centipede'||distance(from,to,cellPixels)<=epsilon)return;
      let trail=histories.get(s);
      // A discontinuous relocation must never leave a diagonal ghost body.
      if(!trail||distance(trail[trail.length-1],from,cellPixels)>epsilon)trail=[copy(from)];
      const a=trail[trail.length-2],b=trail[trail.length-1];
      if(a&&((a.i===b.i&&b.i===to.i&&(b.j-a.j)*(to.j-b.j)>=0)
        ||(a.j===b.j&&b.j===to.j&&(b.i-a.i)*(to.i-b.i)>=0)))trail[trail.length-1]=copy(to);
      else trail.push(copy(to));
      // Keep only the visible body route plus two cells of growth/resize slack.
      // Collinear samples collapse, so allocation depends on turns, not frames.
      const limit=bodyCount(s)*spacing(s,cellPixels)+2*Math.max(cellPixels('x'),cellPixels('y'));
      let length=0;
      for(let n=trail.length-1;n>0;n--){
        const edge=distance(trail[n],trail[n-1],cellPixels);
        if(length+edge>limit){
          const u=(limit-length)/edge;
          trail=trail.slice(n-1);
          trail[0]={i:trail[1].i+(trail[0].i-trail[1].i)*u,j:trail[1].j+(trail[0].j-trail[1].j)*u};
          break;
        }
        length+=edge;
      }
      histories.set(s,trail);
    }
    // Pure grid-coordinate samples, head first; a newly spawned tail unfolds
    // along travelled edges. Tail samples are visual and never collision paths.
    function bodyPositions(s,cellPixels,visualScale=s.sizeScale*displayScale(cellPixels),includeCorners=false){
      const head=position(s);
      if(s.kind!=='centipede')return [head];
      const trail=histories.get(s)||[head],out=[head];
      let index=trail.length-1,at=head,left=0;
      for(let n=1;n<=bodyCount(s);n++){
        left+=12*visualScale;
        while(index>0){
          const to=trail[index-1],edge=distance(at,to,cellPixels);
          if(edge>left){
            const u=left/edge;at={i:at.i+(to.i-at.i)*u,j:at.j+(to.j-at.j)*u};left=0;break;
          }
          left-=edge;at=to;index--;
          if(includeCorners)out.push(copy(at));
        }
        out.push(copy(at));
      }
      return out;
    }
    function axesFor(s,target,cellPixels){
      if(s.kind!=='centipede')return s.kind==='black'?['i','j']:['j','i'];
      return Math.abs(target.i-s.i)*cellPixels('x')>=Math.abs(target.j-s.j)*cellPixels('y')?['i','j']:['j','i'];
    }
    function heading(s,target){
      const at=position(s),di=target.i-at.i,dj=target.j-at.j;
      let direction;
      // Look directly at Gridder on a shared row/column, including reversal.
      if(Math.abs(dj)<epsilon&&Math.abs(di)>epsilon)direction={di:Math.sign(di),dj:0};
      else if(Math.abs(di)<epsilon&&Math.abs(dj)>epsilon)direction={di:0,dj:Math.sign(dj)};
      else if(s.segment)direction=s.segment;
      else if(s.kind==='centipede'&&s.facing)direction=s.facing;
      else{
        const axes=s.kind==='black'?['i','j']:['j','i'];
        const axis=axes.find(a=>Math.abs(target[a]-at[a])>epsilon);
        direction=axis?{di:axis==='i'?Math.sign(di):0,dj:axis==='j'?Math.sign(dj):0}:s.facing||{di:0,dj:1};
      }
      // The SVG head starts above its body; positive j points upward.
      return Math.atan2(direction.di,direction.dj)*180/Math.PI;
    }
    function respawn(target,cellPixels,world=null){
      const corners=[{i:0,j:0},{i:board.nx,j:0},{i:0,j:board.ny},{i:board.nx,j:board.ny}];
      const distance=p=>Math.abs(p.i-target.i)*cellPixels('x')+Math.abs(p.j-target.j)*cellPixels('y');
      corners.sort((a,b)=>distance(b)-distance(a));
      spiders.forEach((s,index)=>{
        releaseMeal(s,world);
        const at=corners[index%corners.length],safe=isLegalNode(at)?at:findSpawnNode(target,cellPixels,{border:true,far:true,offset:index});
        if(!safe)return;
        s.i=safe.i;s.j=safe.j;s.segment=null;s.facing=null;s.lastBrush=null;
        resetHistory(s);
      });
    }
    function advance(target,speed,milliseconds,cellPixels,world=null){
      const duration=Number.isFinite(milliseconds)?Math.max(0,milliseconds):0,paths=spiders.map(()=>[]);
      // A rejected food claim must not repeatedly schedule a zero-time event.
      // New hatchlings may share a node and contact the same food object even
      // without liquid gaps. Only one can claim it; all others must move on.
      const rejectedFood=new WeakMap();
      let used=0;
      function finishEdge(s){
        if(s.segment?.progress>=1-epsilon){s.i+=s.segment.di;s.j+=s.segment.dj;s.segment=null;}
      }
      function finishMeal(s){
        const meal=s.eating;
        if(!meal||meal.elapsed<meal.duration-epsilon)return;
        meal.elapsed=meal.duration;
        if(meal.world.consume(meal.piece,s)){
          s.meals++;if(s.kind!=='centipede')s.sizeScale*=1.3;s.speedScale*=1.02;
        }
        s.eating=null;
      }
      function plan(s,remaining){
        if(s.eating)return {kind:'eating',time:Math.max(0,s.eating.duration-s.eating.elapsed)};
        finishEdge(s);
        if(!s.segment){
          const axes=axesFor(s,target,cellPixels);
          if(navigation?.hasGaps){
            const step=navigation.nextStep(s,target,cellPixels,axes);
            if(step){s.segment={...step,progress:0};s.facing={...step};}
          }else{
          // Reach the nearest target node before traversing its containing edge.
          // Otherwise a fractional preferred coordinate makes the spider reverse
          // forever on its current row/column, starving the other axis.
          const axis=axes.find(a=>Math.abs(Math.round(target[a])-s[a])>epsilon)
            ||axes.find(a=>Math.abs(target[a]-s[a])>epsilon);
          if(axis){
            const sign=Math.sign(target[axis]-s[axis]),di=axis==='i'?sign:0,dj=axis==='j'?sign:0;
            if(s.i+di>=0&&s.i+di<=board.nx&&s.j+dj>=0&&s.j+dj<=board.ny){
              s.segment={di,dj,progress:0};s.facing={di,dj};
            }
          }
          }
        }
        const from=position(s),velocity=speed*s.rate*s.speedScale;
        let next={kind:'idle',from,to:from,time:Infinity,velocity:0};
        if(s.segment&&velocity>0&&Number.isFinite(velocity)){
          const length=cellPixels(s.segment.di?'x':'y');
          if(length>0&&Number.isFinite(length)){
            const travel=Math.min(velocity*remaining/1000,(1-s.segment.progress)*length),time=travel*1000/velocity;
            const to={i:from.i+s.segment.di*travel/length,j:from.j+s.segment.dj*travel/length};
            next={kind:'moving',from,to,time,velocity,length};
          }
        }
        const contact=world?.findFood?.(from,next.to,cellPixels,s.sizeScale);
        if(contact&&Number.isFinite(contact.fraction)&&!rejectedFood?.get(s)?.has(contact.piece)){
          next.hit=contact.piece;next.time=next.kind==='moving'?next.time*Math.max(0,Math.min(1,contact.fraction)):0;
        }
        return next;
      }
      // Advance all pursuers to the next shared event. Claiming an entire
      // frame spider by spider would let a later arrival steal an earlier meal.
      while(used<duration){
        const remaining=duration-used,plans=spiders.map(s=>plan(s,remaining));
        const elapsed=Math.min(remaining,...plans.map(p=>p.time)),end=Math.min(duration,used+elapsed);
        spiders.forEach((s,index)=>{
          const next=plans[index],from=position(s),path={from,to:from,start:used/duration,end:end/duration};
          if(s.lastBrush)s.lastBrush.elapsed+=elapsed;
          if(next.kind==='eating'){
            s.eating.elapsed=Math.min(s.eating.duration,s.eating.elapsed+elapsed);path.eating=true;
          }else if(next.kind==='moving'&&elapsed>0){
            s.segment.progress=Math.min(1,s.segment.progress+next.velocity*elapsed/(1000*next.length));
            path.to=position(s);
          }
          if(elapsed>0)paths[index].push(path);
          if(next.kind!=='eating'&&world?.brush){
            const pieces=world.brush(from,path.to,cellPixels,s.sizeScale);
            if(pieces?.length)s.lastBrush={pieces,from,to:path.to,elapsed:0};
          }
          finishEdge(s);
          if(next.kind==='moving'&&elapsed>0)remember(s,from,position(s),cellPixels);
        });
        used=end;
        spiders.forEach((s,index)=>{
          const next=plans[index];
          if(next.hit&&Math.abs(next.time-elapsed)<=epsilon){
            if(world.claim(next.hit,s))s.eating={piece:next.hit,elapsed:0,duration:4000,world};
            else if(rejectedFood){
              if(!rejectedFood.has(s))rejectedFood.set(s,new Set());
              rejectedFood.get(s).add(next.hit);
            }
          }else if(next.kind==='eating')finishMeal(s);
        });
      }
      spiders.forEach((s,index)=>{
        if(!paths[index].length){const at=position(s),path={from:at,to:at,start:0,end:1};if(s.eating)path.eating=true;paths[index].push(path);}
      });
      return paths;
    }
    function consumeBlood(spider){
      if(!spiders.includes(spider))return false;
      spider.bloodMeals++;spider.sizeScale*=bloodGrowth;return true;
    }
    return {spiders,position,heading,bodyPositions,advance,respawn,consumeBlood,spawn,remove,isLegalNode,findSpawnNode};
  }
  const api={create,collides,bloodGrowth};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderChase=api;
})(typeof window!=='undefined'?window:globalThis);
