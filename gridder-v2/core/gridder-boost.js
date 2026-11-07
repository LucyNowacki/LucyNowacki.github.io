/* Five active seconds of Gridder-only speed and edge-path contact geometry. */
(function(root){
  'use strict';
  const durationMs=5000,multiplier=3,trailMs=450,EPS=1e-9;
  const copy=p=>({i:p.i,j:p.j}),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const distance=(a,b,pixels)=>Math.hypot((b.i-a.i)*pixels('x'),(b.j-a.j)*pixels('y'));
  function position(path,t){const u=path.end>path.start?clamp((t-path.start)/(path.end-path.start),0,1):0;return {i:path.from.i+(path.to.i-path.from.i)*u,j:path.from.j+(path.to.j-path.from.j)*u};}
  // Closed swept-circle intervals preserve exact pickup/contact/expiry order.
  // Every input piece is an actual edge traversal, never a corner chord.
  function contacts(player,enemy,pixels,radius,{movingOnly=false,ignoreEating=false}={}){
    const found=[];
    for(const a of player)for(const b of enemy){
      if(ignoreEating&&b.eating)continue;
      if(movingOnly&&distance(a.from,a.to,pixels)<=EPS)continue;
      const lo=Math.max(a.start,b.start),hi=Math.min(a.end,b.end);if(hi<lo-EPS)continue;
      const p=position(a,lo),q=position(a,hi),s=position(b,lo),v=position(b,hi);
      const x=(p.i-s.i)*pixels('x'),y=(p.j-s.j)*pixels('y'),dx=(q.i-p.i-v.i+s.i)*pixels('x'),dy=(q.j-p.j-v.j+s.j)*pixels('y');
      const aa=dx*dx+dy*dy,bb=2*(x*dx+y*dy),cc=x*x+y*y-radius*radius;
      let enter=0,exit=1;
      if(aa<=EPS){if(cc>EPS)continue;}
      else{const d=bb*bb-4*aa*cc;if(d<-EPS)continue;const r=Math.sqrt(Math.max(0,d));enter=Math.max(0,(-bb-r)/(2*aa));exit=Math.min(1,(-bb+r)/(2*aa));if(exit<enter-EPS)continue;}
      found.push({start:lo+(hi-lo)*clamp(enter,0,1),end:lo+(hi-lo)*clamp(exit,0,1)});
    }
    return found.sort((a,b)=>a.start-b.start||a.end-b.end);
  }
  // A tail sample follows the same retained polyline as the head. Split at
  // every bend and head-speed boundary, including initially unfolding tails.
  function bodyPaths(outline,headPaths,count,spacing,pixels){
    if(!headPaths.length)return [];
    let points=outline.map(copy).reverse();
    if(!points.length||points.some((p,n)=>n&&Math.abs(p.i-points[n-1].i)>EPS&&Math.abs(p.j-points[n-1].j)>EPS)||distance(points.at(-1),headPaths[0].from,pixels)>EPS)points=[copy(headPaths[0].from)];
    const lengths=[0];
    const add=p=>{const n=distance(points.at(-1),p,pixels);if(n>EPS){points.push(copy(p));lengths.push(lengths.at(-1)+n);}};
    const initial=points.reduce((sum,p,n)=>sum+(n?distance(points[n-1],p,pixels):0),0);
    // Rebuild cumulative distances for the retained tail before appending motion.
    lengths.length=1;for(let n=1;n<points.length;n++)lengths.push(lengths.at(-1)+distance(points[n-1],points[n],pixels));
    for(const h of headPaths)add(h.to);
    const at=s=>{s=clamp(s,0,lengths.at(-1));let n=1;while(n<lengths.length-1&&lengths[n]<s-EPS)n++;if(points.length===1)return copy(points[0]);const d=lengths[n]-lengths[n-1],u=d?(s-lengths[n-1])/d:0;return {i:points[n-1].i+(points[n].i-points[n-1].i)*u,j:points[n-1].j+(points[n].j-points[n-1].j)*u};};
    const result=Array.from({length:count},()=>[]);let travelled=0;
    for(const h of headPaths){
      const d=distance(h.from,h.to,pixels);
      for(let n=1;n<=count;n++){
        const a=initial+travelled-n*spacing,b=a+d,cuts=[0,1];
        if(d>EPS)for(const corner of lengths)if(corner>a+EPS&&corner<b-EPS)cuts.push((corner-a)/d);
        cuts.sort((x,y)=>x-y);
        for(let k=1;k<cuts.length;k++){const u=cuts[k-1],v=cuts[k];result[n-1].push({from:at(a+d*u),to:at(a+d*v),start:h.start+(h.end-h.start)*u,end:h.start+(h.end-h.start)*v});}
      }
      travelled+=d;
    }
    return result;
  }
  function create({clock=0,startedAt=null,endsAt=0}={}){
    clock=Math.max(0,clock);let trail=[];
    const activeAt=t=>Number.isFinite(startedAt)&&t>=startedAt&&t<endsAt;
    function advanceTo(at){clock=Math.max(clock,Number.isFinite(at)?at:clock);trail=trail.filter(p=>p.expiresAt>clock);return snapshot();}
    function collect(at=clock){advanceTo(at);startedAt=clock;endsAt=clock+durationMs;return snapshot();}
    function reset(){startedAt=null;endsAt=clock;trail=[];}
    function record(from,to,at,endAt){if(endAt>at&&distance(from,to,()=>1)>EPS)trail.push({from:copy(from),to:copy(to),at,endAt,expiresAt:endAt+trailMs});trail=trail.filter(p=>p.expiresAt>clock);}
    function snapshot(){return {active:activeAt(clock),remainingMs:Math.max(0,endsAt-clock),durationMs,multiplier,clock,startedAt,endsAt,trail:trail.map(p=>({...p,from:copy(p.from),to:copy(p.to)}))};}
    return {collect,reset,advance:ms=>advanceTo(clock+Math.max(0,ms)),advanceTo,activeAt,record,snapshot};
  }
  const api=Object.freeze({create,durationMs,multiplier,trailMs,contacts,bodyPaths,position});
  root.GridderBoost=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
