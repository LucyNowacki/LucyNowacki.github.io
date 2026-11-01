/* Active-time ecology. Chase owns movement, feeding, grid trails and contact. */
(function(root){
  'use strict';
  const arrivalInterval=60000,residency=180000,hatchDelay=10000,clutchCooldown=30000;
  const populationLimit=12,visitorLimit=3;
  const roster=root.GridderMonsterRoster||(typeof require==='function'?require('./monster-roster.js'):null);
  const copy=p=>({i:p.i,j:p.j});
  const nonnegative=n=>Number.isFinite(n)?Math.max(0,n):0;
  function create(chase,{familyId='algebraic',elapsedMs=0,arrivalIndex=0}={}){
    if(!roster)throw new Error('GridderMonsterRoster must load before creature ecology.');
    let clock=nonnegative(elapsedMs),index=Math.floor(nonnegative(arrivalIndex)),nextEgg=1,clutchIndex=0,lastEvent=null;
    let nextArrivalAt=(Math.floor(clock/arrivalInterval)+1)*arrivalInterval;
    const eggs=[],cooldowns=new Map();
    // The selected family supplies each new board's three permanent creatures.
    for(const s of chase.spiders)if(s.origin==='base'||!s.origin){
      s.origin='base';s.species=roster.get(familyId,s.kind);
    }
    const visitors=()=>chase.spiders.filter(s=>s.origin==='timed').sort((a,b)=>a.arrivedAt-b.arrivedAt||String(a.id).localeCompare(String(b.id)));
    const present=()=>new Set(chase.spiders.map(s=>roster.identity(s.species)));
    const reserved=()=>chase.spiders.filter(s=>s.origin!=='timed').length+eggs.reduce((sum,e)=>sum+e.count,0);
    const large=s=>s.kind==='centipede'&&(s.meals>=2||s.sizeScale>=1.3);
    function parentNode(s,cellPixels){
      const at=chase.position(s),near={i:Math.round(at.i),j:Math.round(at.j)};
      return chase.isLegalNode(near)?near:chase.findSpawnNode(at,cellPixels);
    }
    function emit(events,type,name,count){
      lastEvent={type,name,count,clock};events.push({...lastEvent});
    }
    function arrive(player,cellPixels,world,events,previouslyPresent){
      // Keep room for another absent species even after descendants have
      // retained the identity of a departed segmented visitor.
      while(visitors().length>=visitorLimit||present().size>=roster.all.length-1){
        const oldest=visitors()[0];if(!oldest)break;
        chase.remove(oldest,world);
      }
      const occupied=present();
      for(const id of previouslyPresent)occupied.add(id);
      const candidates=roster.all.filter(s=>!occupied.has(s.id));
      const species=candidates.length?roster.all.slice(index%roster.all.length).concat(roster.all.slice(0,index%roster.all.length))
        .find(s=>!occupied.has(s.id)):null;
      const at=chase.findSpawnNode(player,cellPixels,{border:true,far:true});
      index++;nextArrivalAt+=arrivalInterval;
      if(!species||!at)return;
      const s=chase.spawn({kind:species.kind,species,origin:'timed',position:at,arrivedAt:clock,retireAt:clock+residency});
      if(s)emit(events,'arrival',species.name,1);
    }
    function process(cellPixels,player,world,events){
      const previouslyPresent=present();
      for(const s of visitors())if(s.retireAt<=clock)chase.remove(s,world);
      // Capacity is reserved at laying time. A scheduled clutch always hatches
      // at its deadline, even if its parent has since left the board.
      for(let n=0;n<eggs.length;){
        const egg=eggs[n];if(egg.hatchAt>clock){n++;continue;}
        for(const species of egg.species){
          const s=chase.spawn({kind:'centipede',species,origin:'hatch',position:egg.position,parentId:egg.parentId,hatchedAt:clock});
          if(!s)throw new Error('A reserved clutch lost its legal grid node.');
        }
        eggs.splice(n,1);emit(events,'hatched',egg.name,egg.count);
      }
      if(nextArrivalAt<=clock)arrive(player,cellPixels,world,events,previouslyPresent);
      for(const s of chase.spiders){
        if(!large(s)||(cooldowns.get(s.id)??-Infinity)>clock)continue;
        const capacity=populationLimit-reserved();if(capacity<1)break;
        const at=parentNode(s,cellPixels);if(!at)continue;
        const count=Math.min(1+clutchIndex%2,capacity);
        const species=Array.from({length:count},(_,n)=>roster.hatchVariant(s.species,clutchIndex+n));
        const egg={id:`clutch-${nextEgg++}`,position:copy(at),laidAt:clock,hatchAt:clock+hatchDelay,count,parentId:s.id,
          name:s.species.name,species};
        eggs.push(egg);clutchIndex++;cooldowns.set(s.id,clock+clutchCooldown);
        emit(events,'laid',egg.name,count);
      }
      const alive=new Set(chase.spiders.map(s=>s.id));
      for(const id of cooldowns.keys())if(!alive.has(id))cooldowns.delete(id);
    }
    function advance(ms,player,cellPixels,world=null){
      const duration=nonnegative(ms),events=[];if(!duration)return events;
      const end=clock+duration;
      process(cellPixels,player,world,events);
      while(clock<end){
        let next=Math.min(end,nextArrivalAt);
        for(const egg of eggs)next=Math.min(next,egg.hatchAt);
        for(const s of visitors())if(s.retireAt>clock)next=Math.min(next,s.retireAt);
        if(reserved()<populationLimit)for(const s of chase.spiders){
          const deadline=cooldowns.get(s.id);
          if(large(s)&&deadline>clock)next=Math.min(next,deadline);
        }
        clock=next;process(cellPixels,player,world,events);
      }
      return events;
    }
    function snapshot(){
      return {clock,arrivalIndex:index,nextArrivalAt,
        eggs:eggs.map(e=>({...e,position:copy(e.position),species:e.species.slice(),progress:Math.max(0,Math.min(1,(clock-e.laidAt)/hatchDelay))})),
        lastEvent:lastEvent?{...lastEvent}:null};
    }
    return {advance,snapshot};
  }
  const api=Object.freeze({create,arrivalInterval,residency,hatchDelay,clutchCooldown,populationLimit,visitorLimit});
  root.GridderCreatureEcology=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
