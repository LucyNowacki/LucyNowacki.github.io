/* Gridder rules use closed rectangles: edge and corner contacts count. */
(function(root){
  'use strict';
  const epsilon=1e-10;
  function layout(b,width,height){
    const w=Math.max(200,width||800),h=Math.max(120,height||500);
    const availableWidth=w-68,availableHeight=h-66;
    // Displayed cells have width a and height 2a/3. Fit without stretching.
    const cellWidth=Math.min(availableWidth/b.nx,availableHeight/b.ny*1.5),cellHeight=cellWidth*2/3;
    const pw=cellWidth*b.nx,ph=cellHeight*b.ny;
    return {w,h,l:50+(availableWidth-pw)/2,t:24+(availableHeight-ph)/2,pw,ph,cellWidth,cellHeight};
  }
  const asQuest=q=>q===true?{kind:'derivative'}:typeof q==='string'?{kind:q}:q||{};
  const toX=tex=>tex.replace(/\\(?:begin|end)\{[^}]+\}|\\[A-Za-z]+|a/g,token=>token==='a'?'x':token);
  function inverseBranch(M,key){
    const c=M.curves[key],end=c.range[1];
    const choices={
      quadratic:{source:[0,end],sourceTex:`0\\le t\\le ${end}`,tex:'\\sqrt{x}',value:x=>Math.sqrt(Math.max(0,x)),steps:'Swap x and y in y = x²: x = y². On the nonnegative branch choose the nonnegative square root.'},
      quartic:{source:[1,end],sourceTex:`1\\le t\\le ${end}`,tex:'\\sqrt{1+\\sqrt{1+x}}',value:x=>Math.sqrt(1+Math.sqrt(Math.max(0,1+x))),steps:'Write x = (y² − 1)² − 1. On the branch y ≥ 1, take the positive root twice: y² − 1 = √(x + 1), then y = √(1 + √(x + 1)).'},
      gaussian:{source:[0,end],sourceTex:`0\\le t\\le ${end}`,tex:'\\sqrt{-\\ln x}',value:x=>Math.sqrt(Math.max(0,-Math.log(x))),steps:'Swap the coordinates: x = exp(−y²). Take natural logarithms: ln(x) = −y². On the nonnegative branch choose y = √(−ln(x)).'},
      rational:{source:[-1,1],sourceTex:'-1\\le t\\le 1',tex:'\\frac{2x}{1+\\sqrt{1-4x^2}}',value:x=>2*x/(1+Math.sqrt(Math.max(0,1-4*x*x))),steps:'Swap coordinates to get x = y/(1 + y²), so xy² − y + x = 0. Choose the root with −1 ≤ y ≤ 1. Rationalising gives 2x/(1 + √(1 − 4x²)), which also works at x = 0.'},
      sine:{source:[-Math.PI/2,Math.PI/2],sourceTex:'-\\frac{\\pi}{2}\\le t\\le\\frac{\\pi}{2}',tex:'\\arcsin x',value:x=>Math.asin(Math.max(-1,Math.min(1,x))),steps:'Restrict sine to −π/2 ≤ t ≤ π/2, where it increases from −1 to 1. Swap coordinates: x = sin(y), then y = arcsin(x), the angle in this interval.'},
      log:{source:[.5,4.5],sourceTex:'0.5\\le t\\le4.5',tex:'e^x',value:Math.exp,steps:'Swap coordinates in y = ln(x): x = ln(y). Exponentiate both sides: y = exp(x).'},
      cubic:{source:[1,end],sourceTex:`1\\le t\\le ${end}`,tex:`t\\text{ such that }t^3-3t=x,\\quad1\\le t\\le${end}`,steps:'Swap coordinates: x = y³ − 3y. On y ≥ 1 this expression increases, so there is one root on the chosen interval. The plotted inverse uses bisection on that interval; it is not the reciprocal 1/f(x).'}
    };
    const chosen=c.inverse===null?null:c.inverse||choices[key];if(!chosen)return null;
    const source=chosen.source,outputs=source.map(c.value),domain=[Math.min(...outputs),Math.max(...outputs)],increasing=outputs[1]>outputs[0];
    function value(x){
      if(x<domain[0]||x>domain[1])return NaN;
      if(chosen.value)return chosen.value(x);
      if(x===outputs[0])return source[0];if(x===outputs[1])return source[1];
      let lo=source[0],hi=source[1];for(let i=0;i<60;i++){const mid=(lo+hi)/2;if((c.value(mid)<x)===increasing)lo=mid;else hi=mid;}return (lo+hi)/2;
    }
    return {...chosen,domain,critical:[],value,originalDomain:source};
  }
  function graph(M,key,quest){
    const q=asQuest(quest),c=M.curves[key],domain=c.domain||(key==='log'?[.5,4.5]:c.range.slice(0,2));
    if(q.kind==='inverse'){const inverse=inverseBranch(M,key);return inverse?{kind:q.kind,...inverse}:null;}
    if(q.kind==='normal'){
      const a=Math.max(domain[0],Math.min(domain[1],Number.isFinite(q.anchor)?q.anchor:c.initial)),y=c.value(a),tangent=c.derivative(a),vertical=Math.abs(tangent)<1e-12;
      return {kind:q.kind,domain,critical:[],a,y,tangent,vertical,slope:vertical?null:-1/tangent,value:vertical?()=>NaN:x=>y-(x-a)/tangent,tex:vertical?'x=a':"y-f(a)=-\\frac{x-a}{f'(a)}"};
    }
    if(q.kind==='second'){
      const critical=c.secondCritical??{gaussian:[-Math.sqrt(1.5),0,Math.sqrt(1.5)],quartic:[0],rational:[-Math.SQRT2-1,1-Math.SQRT2,Math.SQRT2-1,Math.SQRT2+1],quadratic:[],log:[],cubic:[]}[key]
        ??M.pointsInRange(key,...domain).filter(p=>p.kind==='min'||p.kind==='max').map(p=>p.x);
      return {kind:q.kind,domain,critical,tex:toX(c.secondTex),value:c.second};
    }
    if(q.kind==='derivative')return {kind:q.kind,domain,critical:M.pointsInRange(key,...domain).filter(p=>p.kind==='inflection').map(p=>p.x),tex:toX(c.derivativeTex),value:c.derivative};
    return null;
  }
  function board(M,key,difficulty,quest=false){
    const curve=M.curves[key],n={guided:8,explorer:12,challenge:16}[difficulty]||8;
    const q=asQuest(quest),target=graph(M,key,q),inverse=q.kind==='inverse';
    const domain=inverse?target.originalDomain:curve.domain||(key==='log'?[.5,4.5]:curve.range.slice(0,2));
    const xmin=inverse?Math.min(domain[0],target.domain[0]):domain[0],xmax=inverse?Math.max(domain[1],target.domain[1]):domain[1];
    const points=M.pointsInRange(key,xmin,xmax);
    const candidates=[...domain,...points.map(p=>p.x).filter(x=>x>=domain[0]&&x<=domain[1])];
    const values=candidates.map(curve.value);
    if(target&&!inverse&&q.kind!=='normal')values.push(...[...target.domain,...target.critical.filter(x=>x>=target.domain[0]&&x<=target.domain[1])].map(target.value));
    if(inverse)values.push(...domain);
    let low=Math.min(inverse?Infinity:curve.range[2],...values),high=Math.max(inverse?-Infinity:curve.range[3],...values);
    const raw=(high-low)/n,power=10**Math.floor(Math.log10(raw));
    const dy=[1,2,2.5,5,10].find(v=>v*power>=raw)*power;
    // All four borders ARE grid edges. Leave a full row above/below extrema.
    const ymin=(Math.floor(low/dy)-1)*dy,ymax=(Math.ceil(high/dy)+1)*dy;
    return {xmin,xmax,ymin,ymax,nx:n,ny:Math.round((ymax-ymin)/dy),dx:(xmax-xmin)/n,dy};
  }
  const cellKey=(i,j)=>`${i},${j}`;
  function pointCells(b,x,y){
    const cells=new Set();
    for(let i=0;i<b.nx;i++)for(let j=0;j<b.ny;j++){
      const lo=b.xmin+i*b.dx,bot=b.ymin+j*b.dy;
      if(x>=lo-epsilon*b.dx&&x<=lo+b.dx+epsilon*b.dx&&y>=bot-epsilon*b.dy&&y<=bot+b.dy+epsilon*b.dy)cells.add(cellKey(i,j));
    }
    return cells;
  }
  function graphCells(b,target){
    const cells=new Set();
    if(!target)return cells;
    if(target.vertical){
      for(let i=0;i<b.nx;i++)if(target.a>=b.xmin+i*b.dx-epsilon*b.dx&&target.a<=b.xmin+(i+1)*b.dx+epsilon*b.dx)for(let j=0;j<b.ny;j++)cells.add(cellKey(i,j));
      return cells;
    }
    // Continuous graphs: endpoint values and all analytic critical points
    // give the whole image of each column, including tangencies and corners.
    for(let i=0;i<b.nx;i++){
      let lo=Math.max(b.xmin+i*b.dx,target.domain[0]),hi=Math.min(b.xmin+(i+1)*b.dx,target.domain[1]);
      if(lo>hi+epsilon*b.dx)continue;
      if(lo>hi){const endpoint=Math.max(target.domain[0],Math.min(target.domain[1],(lo+hi)/2));lo=hi=endpoint;}
      const values=[lo,hi,...target.critical.filter(x=>x>lo&&x<hi)].map(target.value).filter(Number.isFinite);
      if(!values.length)continue;
      const min=Math.min(...values),max=Math.max(...values);
      for(let j=0;j<b.ny;j++){
        const bot=b.ymin+j*b.dy,top=bot+b.dy;
        if(min<=top+epsilon*b.dy&&max>=bot-epsilon*b.dy)cells.add(cellKey(i,j));
      }
    }
    return cells;
  }
  function derivativeCells(M,key,b){return graphCells(b,graph(M,key,'derivative'));}
  function targets(M,key,b,quest){return quest.point?pointCells(b,quest.point.x,M.curves[key].value(quest.point.x)):graphCells(b,graph(M,key,quest));}
  const edgeKey=(a,b)=>a.i===b.i?`v:${a.i}:${Math.min(a.j,b.j)}`:`h:${Math.min(a.i,b.i)}:${a.j}`;
  const cellEdges=(i,j)=>[`h:${i}:${j}`,`h:${i}:${j+1}`,`v:${i}:${j}`,`v:${i+1}:${j}`];
  function enclosedCells(b,edges){
    // Flood from the outside through unmarked edges. Any cell unreachable
    // from the outside lies in a closed traced area, even in a multi-cell loop.
    const outside=new Set(),queue=[];
    const visit=(i,j)=>{const key=cellKey(i,j);if(!outside.has(key)){outside.add(key);queue.push([i,j]);}};
    for(let i=0;i<b.nx;i++){
      if(!edges.has(`h:${i}:0`))visit(i,0);
      if(!edges.has(`h:${i}:${b.ny}`))visit(i,b.ny-1);
    }
    for(let j=0;j<b.ny;j++){
      if(!edges.has(`v:0:${j}`))visit(0,j);
      if(!edges.has(`v:${b.nx}:${j}`))visit(b.nx-1,j);
    }
    for(let index=0;index<queue.length;index++){
      const [i,j]=queue[index];
      for(const [ni,nj,edge] of [[i-1,j,`v:${i}:${j}`],[i+1,j,`v:${i+1}:${j}`],[i,j-1,`h:${i}:${j}`],[i,j+1,`h:${i}:${j+1}`]]){
        if(ni>=0&&ni<b.nx&&nj>=0&&nj<b.ny&&!edges.has(edge))visit(ni,nj);
      }
    }
    const filled=new Set();for(let i=0;i<b.nx;i++)for(let j=0;j<b.ny;j++)if(!outside.has(cellKey(i,j)))filled.add(cellKey(i,j));
    return filled;
  }
  function create(b,targets){
    const state={board:b,targets:new Set(targets),edges:new Set(),filled:new Set(),position:{i:0,j:0},moves:0};
    state.move=(di,dj)=>{
      if(Math.abs(di)+Math.abs(dj)!==1)return false;
      const a=state.position,next={i:a.i+di,j:a.j+dj};
      if(next.i<0||next.i>b.nx||next.j<0||next.j>b.ny)return false;
      state.edges.add(edgeKey(a,next));state.position=next;state.moves++;
      state.filled=enclosedCells(b,state.edges);
      return true;
    };
    state.progress=()=>[...state.targets].filter(k=>state.filled.has(k)).length;
    state.complete=()=>state.targets.size>0&&state.progress()===state.targets.size;
    return state;
  }
  function levels(M,key){
    const c=M.curves[key],points=M.pointsInRange(key,...c.range.slice(0,2));
    const result=[];
    for(const kind of ['min','max','inflection'])for(const point of points.filter(p=>p.kind===kind))result.push({kind,point});
    result.push({kind:'derivative'});
    result.push({kind:'second'});if(c.inverse!==null)result.push({kind:'inverse'});result.push({kind:'normal',anchor:c.initial});
    return result;
  }
  function createWalker(game){
    let segment=null;
    const painted=new Map();
    const position=()=>segment?{i:game.position.i+segment.di*segment.progress,j:game.position.j+segment.dj*segment.progress}:{...game.position};
    function paint(s,a,b){
      const edge=edgeKey(game.position,{i:game.position.i+s.di,j:game.position.j+s.dj});
      if(s.di<0||s.dj<0){a=1-a;b=1-b;}
      const intervals=[...(painted.get(edge)||[]),[Math.min(a,b),Math.max(a,b)]].sort((x,y)=>x[0]-y[0]);
      const joined=[];
      for(const pair of intervals){const last=joined.at(-1);if(last&&pair[0]<=last[1]+epsilon)last[1]=Math.max(last[1],pair[1]);else joined.push([...pair]);}
      painted.set(edge,joined);
      if(joined.length===1&&joined[0][0]<=epsilon&&joined[0][1]>=1-epsilon)game.edges.add(edge);
    }
    function advance(direction,pixels,cellPixels){
      if(game.complete()||pixels<=0)return false;
      let changed=false;
      while(pixels>epsilon&&!game.complete()){
        if(!segment){
          const [di,dj]=direction,{i,j}=game.position,b=game.board;
          if(i+di<0||i+di>b.nx||j+dj<0||j+dj>b.ny)break;
          segment={di,dj,progress:0};
        }
        const s=segment,reverse=direction[0]===-s.di&&direction[1]===-s.dj;
        // A perpendicular request is buffered until the next intersection.
        const length=cellPixels(s.di?'x':'y'),remaining=(reverse?s.progress:1-s.progress)*length;
        const travel=Math.min(pixels,remaining),next=s.progress+(reverse?-1:1)*travel/length;
        paint(s,s.progress,next);s.progress=next;pixels-=travel;changed=changed||travel>0;
        if(!reverse&&s.progress>=1-epsilon){game.move(s.di,s.dj);segment=null;}
        else if(reverse&&s.progress<=epsilon)segment=null;
        game.filled=enclosedCells(game.board,game.edges);
      }
      return changed;
    }
    const axis=direction=>segment?(segment.di?'x':'y'):(direction[0]?'x':'y');
    function finishNearNode(direction){
      if(!segment)return 0;
      const reverse=direction[0]===-segment.di&&direction[1]===-segment.dj;
      const remaining=reverse?segment.progress:1-segment.progress;
      if(remaining<=epsilon||remaining>1/8+epsilon)return 0;
      return advance(direction,remaining*16,()=>16)?remaining:0;
    }
    function settleInNodeHole(){
      if(!segment)return 0;
      const s=segment;
      // Capture by geometry, not by the most recently requested direction.
      if(s.progress>epsilon&&s.progress<=1/8+epsilon){const distance=s.progress;return advance([-s.di,-s.dj],distance*16,()=>16)?distance:0;}
      if(1-s.progress>epsilon&&1-s.progress<=1/8+epsilon){const distance=1-s.progress;return advance([s.di,s.dj],distance*16,()=>16)?distance:0;}
      return 0;
    }
    const atNode=()=>segment===null;
    function route(direction){
      if(!segment)return {axis:direction[0]?'x':'y',direction,remaining:1};
      const s=segment,reverse=direction[0]===-s.di&&direction[1]===-s.dj;
      return {axis:s.di?'x':'y',direction:reverse?[-s.di,-s.dj]:[s.di,s.dj],remaining:reverse?s.progress:1-s.progress};
    }
    return {position,painted,advance,axis,finishNearNode,settleInNodeHole,atNode,route};
  }
  const api={board,layout,pointCells,derivativeCells,graph,graphCells,targets,inverseBranch,edgeKey,cellEdges,enclosedCells,create,createWalker,levels};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderMath=api;
})(typeof window!=='undefined'?window:globalThis);
