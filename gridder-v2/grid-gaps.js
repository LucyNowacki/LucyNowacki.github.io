/* Deterministic liquid-pool planning on the existing mathematical grid.
 *
 * Mathematical protection uses G's closed-cell range envelopes, not rendered
 * samples. Its premise is the catalogue's named continuous finite branches and
 * complete analytic critical-point metadata. It is not a certifier for arbitrary
 * black-box functions, discontinuous branches, or floating-point interval bounds.
 */
(function(root){
 'use strict';
 const cell=(i,j)=>`${i},${j}`;
 function hash(text){
  let value=2166136261;
  for(let i=0;i<text.length;i++)value=Math.imul(value^text.charCodeAt(i),16777619);
  return value>>>0;
 }
 // Each template is edge-connected, hole-free and has a simple external
 // boundary. Rotations/reflections preserve those properties.
 const shapes=[
  ['square',[[0,0],[1,0],[0,1],[1,1]]],
  ['long',[[0,0],[1,0],[2,0],[3,0]]],
  ['short',[[0,0],[1,0],[2,0]]],
  ['wide',[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]],
  ['l',[[0,0],[0,1],[0,2],[1,0]]],
  ['t',[[0,0],[1,0],[2,0],[1,1]]],
  ['stepped',[[0,0],[1,0],[1,1],[2,1]]],
  ['corner',[[0,0],[1,0],[0,1]]],
  ['hook',[[0,0],[1,0],[2,0],[0,1],[0,2]]],
  ['cross',[[1,0],[0,1],[1,1],[2,1],[1,2]]],
  ['stair',[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]]],
  ['narrow',[[0,0],[1,0]]]
 ];
 const templates=[];
 for(const [shape,points]of shapes){
  const seen=new Set();
  for(let reflected=0;reflected<2;reflected++)for(let turn=0;turn<4;turn++){
   let cells=points.map(([x,y])=>{
    if(reflected)x=-x;
    for(let n=0;n<turn;n++)[x,y]=[-y,x];
    return {i:x,j:y};
   });
   const minI=Math.min(...cells.map(p=>p.i)),minJ=Math.min(...cells.map(p=>p.j));
   cells=cells.map(p=>({i:p.i-minI,j:p.j-minJ})).sort((a,b)=>a.j-b.j||a.i-b.i);
   const signature=JSON.stringify(cells);if(seen.has(signature))continue;seen.add(signature);
   const occupied=new Set(cells.map(p=>cell(p.i,p.j))),blocked=[],shore=[];
   for(const {i,j}of cells){
    if(occupied.has(cell(i+1,j)))blocked.push(['v',i+1,j]);
    if(occupied.has(cell(i,j+1)))blocked.push(['h',i,j+1]);
    // Counterclockwise external unit segments, water on their left.
    if(!occupied.has(cell(i,j-1)))shore.push({a:{i,j},b:{i:i+1,j}});
    if(!occupied.has(cell(i+1,j)))shore.push({a:{i:i+1,j},b:{i:i+1,j:j+1}});
    if(!occupied.has(cell(i,j+1)))shore.push({a:{i:i+1,j:j+1},b:{i,j:j+1}});
    if(!occupied.has(cell(i-1,j)))shore.push({a:{i,j:j+1},b:{i,j}});
   }
   const next=new Map(shore.map(e=>[cell(e.a.i,e.a.j),e])),boundary=[];
   let segment=shore[0];
   do{
    boundary.push(segment);segment=next.get(cell(segment.b.i,segment.b.j));
   }while(segment&&segment!==shore[0]&&boundary.length<=shore.length);
   if(segment!==shore[0]||boundary.length!==shore.length||next.size!==shore.length||shore.length>16)
    throw new Error('Pool template must have a simple closed boundary of at most16 unit segments');
   templates.push({shape,cells,blocked,boundary,w:Math.max(...cells.map(p=>p.i))+1,
    h:Math.max(...cells.map(p=>p.j))+1,variant:signature});
  }
 }
 function interiorNode(water,i,j){
  return water.has(cell(i-1,j-1))&&water.has(cell(i,j-1))&&water.has(cell(i-1,j))&&water.has(cell(i,j));
 }
 function connected(board,water,blocked){
  const seen=new Set(['0,0']),queue=[[0,0]];
  for(let at=0;at<queue.length;at++){
   const [i,j]=queue[at];
   for(const [x,y,e]of [[i-1,j,`h:${i-1}:${j}`],[i+1,j,`h:${i}:${j}`],
      [i,j-1,`v:${i}:${j-1}`],[i,j+1,`v:${i}:${j}`]]){
    const k=cell(x,y);
    if(x<0||x>board.nx||y<0||y>board.ny||blocked.has(e)||seen.has(k))continue;
    seen.add(k);queue.push([x,y]);
   }
  }
  let usable=0;
  for(let j=0;j<=board.ny;j++)for(let i=0;i<=board.nx;i++){
   if(interiorNode(water,i,j))continue;
   usable++;if(!seen.has(cell(i,j)))return {ok:false,reachable:seen.size,usable};
  }
  return {ok:true,reachable:seen.size,usable};
 }
 function plan(M,G,key,board,quest,options={}){
  const c=M?.curves?.[key],q=typeof quest==='string'?{kind:quest}:quest;
  if(!c||!q?.kind)throw new TypeError('A known function and objective are required');
  if(!Number.isInteger(board?.nx)||!Number.isInteger(board?.ny)||board.nx<1||board.ny<1||
    !['xmin','xmax','ymin','ymax','dx','dy'].every(k=>Number.isFinite(board[k]))||
    board.dx<=0||board.dy<=0)throw new RangeError('A finite positive rectangular grid is required');
  const difficulty=['guided','explorer','challenge'].includes(options.difficulty)?options.difficulty:'guided';
  const target=G.graph(M,key,q);
  const domain=target?.originalDomain||c.domain||(key==='log'?[.5,4.5]:c.range.slice(0,2));
  const critical=M.pointsInRange(key,...domain).map(p=>p.x);
  const original={value:c.value,domain,critical};
  function graphCells(graph,label){
   if(!graph)return new Set();
   if(!graph.vertical){
    // Reject unsupported nonfinite endpoints/critical values instead of allowing
    // graphCells' finite filtering to make a singular branch appear empty.
    const abscissae=[...graph.domain,...graph.critical];
    for(let i=0;i<=board.nx;i++){
     const x=board.xmin+i*board.dx;
     if(x>=graph.domain[0]&&x<=graph.domain[1])abscissae.push(x);
    }
    if(abscissae.some(x=>!Number.isFinite(x)||!Number.isFinite(graph.value(x))))
     throw new RangeError(`${label} needs a continuous finite branch with analytic critical points`);
   }
   return G.graphCells(board,graph);
  }
  const originalCells=graphCells(original,'Original function');
  const targetCells=q.point?G.pointCells(board,q.point.x,c.value(q.point.x)):graphCells(target,'Target');
  if(q.point&&(!Number.isFinite(q.point.x)||!Number.isFinite(c.value(q.point.x))))
   throw new RangeError('The objective point must be finite');
  const protection=new Set([...originalCells,...targetCells]);
  let revealedCount=0;
  for(const p of options.revealed||[]){
   if(!Number.isFinite(p.x)||!Number.isFinite(c.value(p.x)))
    throw new RangeError('Revealed points must have finite original-function coordinates');
   for(const k of G.pointCells(board,p.x,c.value(p.x)))protection.add(k);
   revealedCount++;
  }
  // Canonical order makes results independent of Set or revealed-point ordering.
  const protectedCells=new Set();
  for(let j=0;j<board.ny;j++)for(let i=0;i<board.nx;i++)if(protection.has(cell(i,j)))protectedCells.add(cell(i,j));
  const fingerprint=JSON.stringify([key,difficulty,q.kind,q.point?.x??null,target?.a??null,
   ['xmin','xmax','ymin','ymax','nx','ny','dx','dy'].map(k=>board[k]),[...protectedCells]]);
  const seed=hash(fingerprint),pools=[],cells=new Set(),blockedEdges=new Set();
  // Multi-source Chebyshev cell distance: no mathematical samples are used.
  const distance=new Map(),queue=[];
  for(const k of protectedCells){distance.set(k,0);queue.push(k.split(',').map(Number));}
  for(let at=0;at<queue.length;at++){
   const [i,j]=queue[at],d=distance.get(cell(i,j))+1;
   for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){
    const x=i+di,y=j+dj,k=cell(x,y);
    if(x<0||x>=board.nx||y<0||y>=board.ny||distance.has(k))continue;
    distance.set(k,d);queue.push([x,y]);
   }
  }
  const candidates={large:[],small:[]};
  for(const template of templates){
   const {w,h,shape}=template;
   // A complete dry cell separates each pool from the outside border.
   for(let j=1;j+h<=board.ny-1;j++)for(let i=1;i+w<=board.nx-1;i++){
    const occupied=template.cells.map(p=>({i:i+p.i,j:j+p.j})),keys=occupied.map(p=>cell(p.i,p.j));
    if(keys.some(k=>protectedCells.has(k)))continue;
    const p={i,j,w,h,shape,cells:occupied},clearance=Math.min(...keys.map(k=>distance.get(k)??Math.max(board.nx,board.ny)));
    const shore=Math.min(i,j,board.nx-i-w,board.ny-j-h);
    const centrality=1-Math.hypot((i+w/2-board.nx/2)/board.nx,(j+h/2-board.ny/2)/board.ny);
    const blocked=template.blocked.map(([axis,x,y])=>`${axis}:${i+x}:${j+y}`);
    candidates[shape==='narrow'?'small':'large'].push({...p,keys,blocked,clearance,shore,centrality,template,
      tie:hash(`${seed}:${i}:${j}:${shape}:${template.variant}`)});
   }
  }
  // Cellwise Chebyshev distance >=2 leaves a complete dry cell between pools;
  // concave bounding boxes may overlap without their actual water/shore doing so.
  const separated=(a,b)=>a.cells.every(p=>b.cells.every(q=>Math.max(Math.abs(p.i-q.i),Math.abs(p.j-q.j))>=2));
  const budget={guided:2,explorer:3,challenge:4}[difficulty]+hash(`count:${fingerprint}`)%3;
  let connectivityRejections=0;
  const selectedScores=[];
  while(pools.length<budget){
   const eligible=list=>list.filter(p=>pools.every(other=>separated(p,other)));
   let available=eligible(candidates.large),fallback=false;
   if(!available.length){available=eligible(candidates.small);fallback=true;}
   if(!available.length)break;
   function score(p){
    const spread=pools.length?Math.min(...pools.map(o=>Math.hypot(p.i+p.w/2-o.i-o.w/2,p.j+p.h/2-o.j-o.h/2))):0;
    // Local heuristic only. Internal-edge count is a detour-opportunity proxy,
    // not a claim to minimize or maximize global shortest-path distances.
    const diversity=pools.some(o=>o.shape===p.shape)?0:9;
    return diversity+6*Math.min(p.clearance,4)+2*Math.min(p.shore,3)+1.5*spread+p.centrality
     +.4*p.blocked.length+(p.tie%1024)/512;
   }
   available=available.map(p=>({p,score:score(p)})).sort((a,b)=>b.score-a.score||a.p.tie-b.p.tie||a.p.j-b.p.j||a.p.i-b.p.i);
   let chosen=null;
   for(const entry of available){
    const nextBlocked=new Set([...blockedEdges,...entry.p.blocked]);
    if(connected(board,new Set([...cells,...entry.p.keys]),nextBlocked).ok){chosen=entry;break;}
    connectivityRejections++;
   }
   if(!chosen)throw new Error('Separated hole-free pools unexpectedly disconnect the dry grid');
   const p=chosen.p;
   pools.push({i:p.i,j:p.j,w:p.w,h:p.h,shape:p.shape,
    seed:hash(`${seed}:${p.i}:${p.j}:${p.shape}:${p.template.variant}`),
    cells:p.cells.map(c=>({...c})),boundary:p.template.boundary.map(e=>({
     a:{i:p.i+e.a.i,j:p.j+e.a.j},b:{i:p.i+e.b.i,j:p.j+e.b.j}}))});
   for(const k of p.keys)cells.add(k);
   for(const e of p.blocked)blockedEdges.add(e);
   selectedScores.push({score:chosen.score,clearance:p.clearance,borderShore:p.shore,shape:p.shape,fallback});
  }
  const connectivity=connected(board,cells,blockedEdges);
  for(const k of targetCells){
   const [i,j]=k.split(',').map(Number);
   if(G.cellEdges(i,j).some(e=>blockedEdges.has(e)))throw new Error('Pool blocks a target-cell boundary');
  }
  return {id:`gaps-v2-${hash(fingerprint+JSON.stringify(pools)).toString(16).padStart(8,'0')}`,
   pools,cells,blockedEdges,protectedCells,diagnostics:{
    method:'Closed-cell analytic range envelopes; deterministic finite greedy connected polyomino selection.',
    assumptions:'Catalogue continuous finite named branches and complete analytic critical-point metadata; not interval certification for arbitrary functions.',
    originalDomain:[...domain],originalCritical:[...critical],originalCells:originalCells.size,
    targetCells:targetCells.size,protectedCells:protectedCells.size,revealedPoints:revealedCount,
    candidates:{shaped:candidates.large.length,fallback:candidates.small.length},budget,selectedScores,
    connectivity,connectivityRejections,emptyReason:pools.length?null:'No unprotected interior connected shape of at least2 cells with a one-cell border shore.',
    globalOptimal:false
   }};
 }
 const api={plan};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.GridderGaps=api;
})(typeof window!=='undefined'?window:globalThis);
