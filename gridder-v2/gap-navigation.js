/* Optional liquid-gap topology. Original mathematical and capture rules stay in G. */
(function(root){
  'use strict';
  const epsilon=1e-9,key=p=>`${p.i},${p.j}`;
  const integer=n=>Math.abs(n-Math.round(n))<=epsilon;
  const directions=[[1,0],[-1,0],[0,1],[0,-1]];
  function create(G,board,targets,gaps={}){
    // Keep private copies: a renderer must not mutate the traversable graph.
    const blocked=new Set(gaps.blockedEdges||[]),cells=new Set(gaps.cells||[]);
    const pools=(gaps.pools||[]).map(p=>Object.freeze({...p,
      ...(p.cells?{cells:Object.freeze(p.cells.map(c=>Object.freeze({...c})))}:{}),
      ...(p.boundary?{boundary:Object.freeze(p.boundary.map(e=>Object.freeze({
        a:Object.freeze({...e.a}),b:Object.freeze({...e.b})})))}:{})}));
    const inside=p=>Number.isFinite(p?.i)&&Number.isFinite(p?.j)
      &&p.i>=-epsilon&&p.i<=board.nx+epsilon&&p.j>=-epsilon&&p.j<=board.ny+epsilon;
    function isEdgeOpen(a,b){
      if(!inside(a)||!inside(b))return false;
      const horizontal=Math.abs(a.j-b.j)<=epsilon,vertical=Math.abs(a.i-b.i)<=epsilon;
      if(!horizontal&&!vertical)return false;
      if(horizontal&&vertical){
        if(integer(a.i)&&integer(a.j))return directions.some(([di,dj])=>isEdgeOpen(a,{i:a.i+di,j:a.j+dj}));
        if(integer(a.j))return !blocked.has(`h:${Math.floor(a.i)}:${Math.round(a.j)}`);
        if(integer(a.i))return !blocked.has(`v:${Math.round(a.i)}:${Math.floor(a.j)}`);
        return false;
      }
      const axis=horizontal?'i':'j',cross=horizontal?'j':'i';
      if(!integer(a[cross]))return false;
      const lo=Math.min(a[axis],b[axis]),hi=Math.max(a[axis],b[axis]),line=Math.round(a[cross]);
      for(let n=Math.floor(lo+epsilon);n<Math.ceil(hi-epsilon);n++)
        if(blocked.has(horizontal?`h:${n}:${line}`:`v:${line}:${n}`))return false;
      return true;
    }
    const neighbours=new Map(),nodes=[];
    for(let j=0;j<=board.ny;j++)for(let i=0;i<=board.nx;i++){
      const node={i,j},adjacent=directions.map(([di,dj])=>({i:i+di,j:j+dj,di,dj})).filter(n=>isEdgeOpen(node,n));
      neighbours.set(key(node),adjacent);if(adjacent.length)nodes.push(node);
    }
    let cache=null;
    function targetAnchors(target,cellPixels){
      if(!inside(target))return [];
      if(integer(target.i)&&integer(target.j)){
        const p={i:Math.round(target.i),j:Math.round(target.j)};
        return neighbours.get(key(p))?.length?[{...p,distance:0}]:[];
      }
      let candidates=[];
      if(integer(target.j))candidates=[{i:Math.floor(target.i),j:Math.round(target.j)},{i:Math.ceil(target.i),j:Math.round(target.j)}];
      else if(integer(target.i))candidates=[{i:Math.round(target.i),j:Math.floor(target.j)},{i:Math.round(target.i),j:Math.ceil(target.j)}];
      return candidates.filter(p=>isEdgeOpen(p,target)).map(p=>({...p,distance:Math.abs(p.i-target.i)*cellPixels('x')+Math.abs(p.j-target.j)*cellPixels('y')}));
    }
    function distances(target,cellPixels){
      const x=cellPixels('x'),y=cellPixels('y'),signature=`${target.i},${target.j}|${x},${y}`;
      if(cache?.signature===signature)return cache;
      const anchors=targetAnchors(target,cellPixels),dist=new Map(nodes.map(p=>[key(p),Infinity]));
      const heap=[];
      function push(entry){
        heap.push(entry);let n=heap.length-1;
        while(n>0){const parent=(n-1)>>1;if(heap[parent].distance<=entry.distance)break;heap[n]=heap[parent];n=parent;}
        heap[n]=entry;
      }
      function pop(){
        const first=heap[0],last=heap.pop();if(!heap.length)return first;
        let n=0;
        while(2*n+1<heap.length){
          let child=2*n+1;if(child+1<heap.length&&heap[child+1].distance<heap[child].distance)child++;
          if(heap[child].distance>=last.distance)break;heap[n]=heap[child];n=child;
        }
        heap[n]=last;return first;
      }
      for(const anchor of anchors){dist.set(key(anchor),anchor.distance);push(anchor);}
      while(heap.length){
        const at=pop(),value=dist.get(key(at));if(at.distance>value+epsilon)continue;
        for(const next of neighbours.get(key(at))||[]){
          const distance=value+(next.di?x:y);
          if(distance+epsilon<(dist.get(key(next))??Infinity)){
            dist.set(key(next),distance);push({...next,distance});
          }
        }
      }
      cache={signature,anchors,dist};return cache;
    }
    function nextStep(from,target,cellPixels,axes=['i','j']){
      if(!integer(from.i)||!integer(from.j)||!inside(from)||!inside(target))return null;
      const x=cellPixels('x'),y=cellPixels('y');if(!(x>0&&y>0&&Number.isFinite(x)&&Number.isFinite(y)))return null;
      const at={i:Math.round(from.i),j:Math.round(from.j)};
      if(Math.abs(at.i-target.i)+Math.abs(at.j-target.j)<=epsilon)return null;
      const field=distances(target,cellPixels);
      // Once at either endpoint of Gridder's edge, traverse that edge. Rounding
      // the target independently on both axes can otherwise starve its true row.
      if(field.anchors.some(p=>key(p)===key(at))&&!field.anchors.some(p=>p.distance===0)){
        const di=Math.sign(target.i-at.i),dj=Math.sign(target.j-at.j);
        if(isEdgeOpen(at,{i:at.i+di,j:at.j+dj}))return {di,dj};
      }
      const preferences=[];
      for(const axis of axes){
        const sign=Math.sign(target[axis]-at[axis])||1;
        preferences.push(axis==='i'?[sign,0]:[0,sign],axis==='i'?[-sign,0]:[0,-sign]);
      }
      let best=null,bestDistance=Infinity;
      for(const [di,dj] of preferences){
        const next={i:at.i+di,j:at.j+dj};if(!isEdgeOpen(at,next))continue;
        const distance=(di?x:y)+(field.dist.get(key(next))??Infinity);
        if(distance+epsilon<bestDistance){bestDistance=distance;best={di,dj};}
      }
      return best;
    }
    const navigation=Object.freeze({
      hasGaps:blocked.size>0,id:gaps.id||'',isEdgeOpen,nextStep,
      get blockedEdges(){return new Set(blocked);},
      get cells(){return new Set(cells);},
      pools:Object.freeze(pools),
      isPoolCell:(i,j)=>cells.has(`${i},${j}`),
      isPoolInterior:p=>{
        if(!inside(p))return false;
        const xs=integer(p.i)?[Math.round(p.i)-1,Math.round(p.i)]:[Math.floor(p.i)];
        const ys=integer(p.j)?[Math.round(p.j)-1,Math.round(p.j)]:[Math.floor(p.j)];
        return xs.every(i=>ys.every(j=>cells.has(`${i},${j}`)));
      }
    });
    const game=G.create(board,targets);
    if(!blocked.size)return {game,walker:G.createWalker(game),navigation};
    if([...game.targets].some(cell=>cells.has(cell)))throw new Error('Liquid gaps must not overlap objective cells.');
    class DryCells extends Set{
      add(cell){if(!cells.has(cell))super.add(cell);return this;}
    }
    let filled=new DryCells(game.filled);
    Object.defineProperty(game,'filled',{enumerable:true,configurable:false,get:()=>filled,set:value=>{filled=new DryCells(value);}});
    const move=game.move;
    game.move=(di,dj)=>Math.abs(di)+Math.abs(dj)===1&&isEdgeOpen(game.position,{i:game.position.i+di,j:game.position.j+dj})?move(di,dj):false;
    const base=G.createWalker(game);
    function route(direction){
      const result=base.route(direction),next={i:game.position.i+direction[0],j:game.position.j+direction[1]};
      // Outside-board attempts retain the controller's established border path.
      if(base.atNode()&&inside(next)&&!isEdgeOpen(game.position,next))
        return {...result,remaining:0,blocked:true};
      return result;
    }
    function advance(direction,pixels,cellPixels){
      if(!direction||Math.abs(direction[0])+Math.abs(direction[1])!==1||!Number.isFinite(pixels)||pixels<=0)return false;
      let changed=false;
      // Slice at every node so even a very large frame cannot paint a removed
      // edge before discovering it is blocked. Existing partial-edge reversal
      // and buffered perpendicular turns remain delegated to the original G.
      while(pixels>epsilon&&!game.complete()){
        const next=route(direction),length=cellPixels(next.axis);
        if(next.blocked||!(length>0&&Number.isFinite(length)))break;
        const travel=Math.min(pixels,next.remaining*length);if(travel<=epsilon)break;
        if(!base.advance(direction,travel,cellPixels))break;
        changed=true;pixels-=travel;
      }
      return changed;
    }
    return {game,walker:{...base,route,advance},navigation};
  }
  const api={create};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GridderGapNavigation=api;
})(typeof window!=='undefined'?window:globalThis);
