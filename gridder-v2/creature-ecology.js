/* Active-time eggs, descendants and visitors; all motion remains in the models. */
(function(root){
  'use strict';
  const arrivalInterval=60000,residency=180000,hatchDelay=10000,layInterval=10000;
  const populationLimit=12,visitorLimit=3,EPS=1e-9;
  const roster=root.GridderMonsterRoster||(typeof require==='function'?require('./monster-roster.js'):null);
  const copy=p=>({i:p.i,j:p.j}),nonnegative=n=>Number.isFinite(n)?Math.max(0,n):0;
  function seedValue(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  function rewardFor(seed,laidAt){
    const ordinal=Math.round(laidAt/layInterval);if(ordinal<=1)return 'ammo';
    // Preserve the established bomb outcomes and random-stream draw count.
    if(seedValue(`${seed}:egg-reward:${ordinal}`)%4===0)return 'bomb';
    let n=seedValue(`${seed}:egg-boost:${ordinal}`);n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);n=(n^(n>>>16))>>>0;
    return n%4===0?'boost':'ammo';
  }
  function create(chase,{familyId='algebraic',elapsedMs=0,arrivalIndex=0,poolLeeches=null,seed=1,encounterSeed=seed,openingEncounter=false,featuredCrawler=false,random=null,randomState=null}={}){
    if(!roster)throw new Error('GridderMonsterRoster must load before creature ecology.');
    let clock=nonnegative(elapsedMs),index=Math.floor(nonnegative(arrivalIndex)),nextEgg=1,lastEvent=null;
    let state=Number.isInteger(randomState)?randomState>>>0:seedValue(seed);
    let nextArrivalAt=(Math.floor(clock/arrivalInterval)+1)*arrivalInterval,nextLayAt=(Math.floor(clock/layInterval)+1)*layInterval;
    const eggs=[];
    const draw=()=>{if(typeof random==='function'){const value=random();return Number.isFinite(value)?Math.max(0,Math.min(1-EPS,value)):0;}
      state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const surpriseKind=seedValue(`${encounterSeed}:base-kind`)%2?'white':'black';
    const surprises=(roster.additions||[]).filter(s=>s.kind===surpriseKind);
    // The two FNV suffixes share their low parity bit. Kind already uses it;
    // discard it here so an even-sized kind roster can reach every member.
    const surprise=surprises.length?surprises[(seedValue(`${encounterSeed}:base-species`)>>>1)%surprises.length]:null;
    const base=chase.spiders.filter(s=>s.origin==='base'||!s.origin);
    for(const s of base){s.origin='base';s.baseSlot??=s.kind;s.species=s.kind===surpriseKind&&surprise?surprise:roster.get(familyId,s.kind);}
    // Feature the four-section crawler in the existing third slot only.
    // Opening folklore takes precedence; later levels keep family centipedes.
    if(featuredCrawler&&!openingEncounter)base.find(s=>s.baseSlot==='centipede').species=roster.byId('maga-crawler');
    if(openingEncounter){
      base.find(s=>s.baseSlot==='black').species=roster.byId('broom-witch');
      base.find(s=>s.baseSlot==='white').species=roster.byId('hen-leg-house');
      const third=base.find(s=>s.baseSlot==='centipede');
      // Boruta is a real black-role actor, never an invisible centipede body.
      // Keep its originating slot for independent growth carry into Next.
      const boruta=chase.spawn({kind:'black',species:roster.byId('boruta'),origin:'base',position:chase.position(third),baseSlot:third.baseSlot});
      if(!boruta)throw new Error('The opening encounter needs a legal third base node.');
      chase.remove(third);
    }
    const water=()=>poolLeeches?.leeches||[];
    const visitors=()=>chase.spiders.filter(s=>s.origin==='timed').sort((a,b)=>a.arrivedAt-b.arrivedAt||String(a.id).localeCompare(String(b.id)));
    const present=()=>new Set(chase.spiders.map(s=>roster.identity(s.species)));
    const reserved=()=>chase.spiders.filter(s=>s.origin!=='timed').length+water().filter(s=>s.origin==='hatch').length+eggs.length;
    const descendants=()=>[...chase.spiders,...water()].filter(s=>s.origin==='hatch').sort((a,b)=>a.hatchedAt-b.hatchedAt||String(a.id).localeCompare(String(b.id)));
    function emit(events,type,name,count=1,extra={}){lastEvent={type,name,count,clock,...extra};events.push({...lastEvent});}
    function retire(s,world,events){
      if(!s)return false;
      const removed=chase.spiders.includes(s)?chase.remove(s,world):poolLeeches?.remove(s);
      if(removed)emit(events,'retired',s.species?.name||s.kind,1,{id:s.id});return removed;
    }
    function parentNode(s,cellPixels){
      if(water().includes(s)){
        const at=s.position,metric=p=>Math.hypot((p.i-at.i)*cellPixels('x'),(p.j-at.j)*cellPixels('y'));
        return poolLeeches.shoreNodes(s).filter(p=>chase.isLegalNode(p)).sort((a,b)=>metric(a)-metric(b)||a.j-b.j||a.i-b.i)[0]||null;
      }
      const at=chase.position(s),near={i:Math.round(at.i),j:Math.round(at.j)};
      return chase.isLegalNode(near)?near:chase.findSpawnNode(at,cellPixels);
    }
    function arrive(player,cellPixels,world,events,previouslyPresent){
      while(visitors().length>=visitorLimit||present().size>=roster.all.length-1){
        const oldest=visitors()[0]||descendants().find(s=>chase.spiders.includes(s));if(!oldest)break;
        retire(oldest,world,events);
      }
      const occupied=present();for(const id of previouslyPresent)occupied.add(id);
      const additions=roster.additions||[],added=new Set(additions.map(s=>s.id)),order=additions.concat(roster.all.filter(s=>!added.has(s.id)));
      const species=order.slice(index%order.length).concat(order.slice(0,index%order.length)).find(s=>!occupied.has(s.id));
      const at=chase.findSpawnNode(player,cellPixels,{border:true,far:true});index++;nextArrivalAt+=arrivalInterval;
      if(!species||!at)return;
      const s=chase.spawn({kind:species.kind,species,origin:'timed',position:at,arrivedAt:clock,retireAt:clock+residency});
      if(s)emit(events,'arrival',species.name);
    }
    // Earliest closed-disk pickup along the actual grid-edge player path.
    function pickupAt(egg,paths,cellPixels,radius,start,end,from=clock){
      let first=null;
      for(const path of paths){
        const a=start+path.start*(end-start),b=start+path.end*(end-start),lo=Math.max(a,from,egg.laidAt),hi=Math.min(b,end,egg.hatchAt);
        if(hi<lo-EPS)continue;
        const at=t=>{const u=b>a?(t-a)/(b-a):0;return {i:path.from.i+(path.to.i-path.from.i)*u,j:path.from.j+(path.to.j-path.from.j)*u};};
        const p=at(lo),q=at(hi),x=(p.i-egg.position.i)*cellPixels('x'),y=(p.j-egg.position.j)*cellPixels('y');
        const dx=(q.i-p.i)*cellPixels('x'),dy=(q.j-p.j)*cellPixels('y'),aa=dx*dx+dy*dy,c=x*x+y*y-radius*radius;
        let t=c<=EPS?0:null;
        if(t===null&&aa>EPS){const bb=2*(x*dx+y*dy),d=bb*bb-4*aa*c;if(d>=0){const root=(-bb-Math.sqrt(Math.max(0,d)))/(2*aa);if(root>=-EPS&&root<=1+EPS)t=Math.max(0,Math.min(1,root));}}
        if(t!==null){const time=lo+(hi-lo)*t;if(first===null||time<first)first=time;}
      }
      return first;
    }
    function collect(paths,cellPixels,radius=12){
      const found=[];
      for(let n=eggs.length-1;n>=0;n--)if(pickupAt(eggs[n],paths,cellPixels,radius,clock,clock+1)!==null)found.unshift(eggs.splice(n,1)[0]);
      return found.map(e=>({...e,position:copy(e.position),species:e.species.slice()}));
    }
    function advance(ms,player,cellPixels,world=null,options={}){
      const duration=nonnegative(ms),events=[];if(!duration)return events;
      const start=clock,end=clock+duration,paths=options.playerPath||[],radius=Number.isFinite(options.collectRadius)?Math.max(0,options.collectRadius):12;
      const collectDue=()=>{
        for(let n=0;n<eggs.length;){
          const egg=eggs[n],when=pickupAt(egg,paths,cellPixels,radius,start,end);
          if(when===null||when>clock+EPS){n++;continue;}
          eggs.splice(n,1);emit(events,'collected',egg.name,1,{id:egg.id,reward:egg.reward});options.onCollect?.(egg,clock);
        }
      };
      while(true){
        const previouslyPresent=present();
        collectDue(); // At a shared deadline, reaching the egg takes priority over hatching.
        for(const s of visitors())if(s.retireAt<=clock)retire(s,world,events);
        for(let n=0;n<eggs.length;){
          const egg=eggs[n];if(egg.hatchAt>clock+EPS){n++;continue;}
          const spec={kind:egg.kind,origin:'hatch',parentId:egg.parentId,hatchedAt:clock};
          const s=egg.aquatic?poolLeeches.spawn({...spec,poolIndex:egg.poolIndex}):chase.spawn({...spec,species:egg.species[0],position:egg.position});
          if(!s)throw new Error('A reserved egg lost its legal habitat.');
          eggs.splice(n,1);emit(events,'hatched',egg.name);
        }
        if(nextArrivalAt<=clock+EPS)arrive(player,cellPixels,world,events,previouslyPresent);
        if(nextLayAt<=clock+EPS){
          nextLayAt+=layInterval;
          while(reserved()>=populationLimit&&descendants().length)retire(descendants()[0],world,events);
          // Only creatures roaming the dry grid lay eggs; pool predators never do.
          const candidates=chase.spiders.filter(s=>s.hp!==0).map(s=>({s,at:parentNode(s,cellPixels)})).filter(c=>c.at);
          if(candidates.length&&reserved()<populationLimit){
            const {s,at}=candidates[Math.floor(draw()*candidates.length)],aquatic=water().includes(s);
            const species=s.species||{id:s.kind,kind:s.kind,name:s.kind==='shark'?'Shark':'Leech'};
            const egg={id:`egg-${nextEgg++}`,position:copy(at),laidAt:clock,hatchAt:clock+hatchDelay,count:1,parentId:s.id,reward:rewardFor(seed,clock),
              name:species.name,species:[species],kind:s.kind,aquatic,poolIndex:aquatic?s.poolIndex:null};
            eggs.push(egg);emit(events,'laid',egg.name,1,{parentId:s.id,kind:s.kind,reward:egg.reward});
          }
        }
        collectDue();
        // The controller resolves contact checkpoints after same-time pickups.
        // Returning false stops before any later pickup/hatch can be awarded.
        if(options.onTime?.(clock)===false)break;
        if(clock>=end-EPS)break;
        let next=Math.min(end,nextArrivalAt,nextLayAt);
        for(const egg of eggs){next=Math.min(next,egg.hatchAt);const when=pickupAt(egg,paths,cellPixels,radius,start,end);if(when!==null&&when>clock+EPS)next=Math.min(next,when);}
        for(const s of visitors())if(s.retireAt>clock)next=Math.min(next,s.retireAt);
        const checkpoint=options.nextTime?.(clock,end);if(Number.isFinite(checkpoint)&&checkpoint>clock+EPS)next=Math.min(next,checkpoint);
        clock=next;
      }
      return events;
    }
    function snapshot(){return {clock,arrivalIndex:index,nextArrivalAt,nextLayAt,randomState:state,
      eggs:eggs.map(e=>({...e,position:copy(e.position),species:e.species.slice(),progress:Math.max(0,Math.min(1,(clock-e.laidAt)/hatchDelay))})),
      lastEvent:lastEvent?{...lastEvent}:null};}
    return {advance,snapshot,collect};
  }
  const api=Object.freeze({create,arrivalInterval,residency,hatchDelay,layInterval,populationLimit,visitorLimit,rewardFor});
  root.GridderCreatureEcology=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
