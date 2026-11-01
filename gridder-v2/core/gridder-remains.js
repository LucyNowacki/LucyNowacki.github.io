/* Settled cartoon remains share geometry with rendering, walking and feeding. */
(function(root){
  'use strict';
  const Capture=typeof module!=='undefined'&&module.exports?require('./gridder-capture.js'):root.derivativeGridderCapture;
  const epsilon=1e-9,playerRadius=11,legReach=20;
  const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
  const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
  const number=value=>String(Number(finite(value).toFixed(6)));
  const node=value=>Math.abs(value-Math.round(value))<=epsilon;
  function create(board,options={}){
    const nx=Math.max(1,finite(board?.nx,1)),ny=Math.max(1,finite(board?.ny,1)),pieces=[];
    const playerFactor=Math.max(0,finite(options.playerScale,1));
    const displayScale=cellPixels=>options.referencePlotWidth>0?nx*cellPixels('x')/options.referencePlotWidth:1;
    const playerReach=cellPixels=>playerRadius*playerFactor*displayScale(cellPixels);
    let serial=0;
    function metrics(cellPixels){
      return {x:Math.max(0,finite(cellPixels('x'))),y:Math.max(0,finite(cellPixels('y')))};
    }
    function geometry(piece,cellPixels){
      const cell=metrics(cellPixels),width=nx*cell.x,height=ny*cell.y;
      const radius=Math.min(8*Math.max(0,finite(piece.size))*playerFactor*displayScale(cellPixels),width/2,height/2);
      const rx=cell.x?radius/cell.x:0,ry=cell.y?radius/cell.y:0;
      const i=piece.pushed?piece.pushed.i:rx+(nx-2*rx)*clamp(finite(piece.u,.5),0,1);
      const j=piece.pushed?piece.pushed.j:ry+(ny-2*ry)*(1-clamp(finite(piece.v,.5),0,1));
      return {i:clamp(i,piece.playerPush?0:rx,piece.playerPush?nx:nx-rx),j:clamp(j,piece.playerPush?0:ry,piece.playerPush?ny:ny-ry),radius};
    }
    function add(effect){
      const added=effect.pieces().map((descriptor,index)=>({
        id:`gridder-remain-${++serial}`,index,u:clamp(finite(descriptor.u,.5),0,1),v:clamp(finite(descriptor.v,.5),0,1),
        size:Math.max(0,finite(descriptor.size,1)),shape:Math.floor(finite(descriptor.shape)),angle:finite(descriptor.angle),
        claimedBy:null,playerPush:null,cleared:false,eaten:false
      }));
      pieces.push(...added);return added;
    }
    const live=piece=>pieces.includes(piece)&&!piece.eaten;
    function claim(piece,spider){
      if(!live(piece)||piece.cleared||piece.playerPush||piece.claimedBy!==null||spider==null)return false;
      piece.claimedBy=spider;return true;
    }
    function release(piece,spider){
      if(!live(piece)||piece.claimedBy!==spider||spider==null)return false;
      piece.claimedBy=null;return true;
    }
    function consume(piece,spider){
      if(!live(piece)||piece.claimedBy!==spider||spider==null)return false;
      piece.eaten=true;piece.claimedBy=null;pieces.splice(pieces.indexOf(piece),1);return true;
    }
    function path(from,to,cell){
      return {x:finite(from.i)*cell.x,y:finite(from.j)*cell.y,dx:(finite(to.i)-finite(from.i))*cell.x,dy:(finite(to.j)-finite(from.j))*cell.y};
    }
    function hit(line,g,cell,radius,escape=false){
      const x=line.x-g.i*cell.x,y=line.y-g.j*cell.y,a=line.dx*line.dx+line.dy*line.dy,c=x*x+y*y-radius*radius;
      const toward=x*line.dx+y*line.dy;
      if(c<=epsilon)return escape&&toward>=-epsilon?null:0;
      if(a<=epsilon)return null;
      const b=2*toward,discriminant=b*b-4*a*c;
      if(discriminant<-epsilon*Math.max(1,b*b,4*a*c))return null;
      const t=(-b-Math.sqrt(Math.max(0,discriminant)))/(2*a);
      return t>=-epsilon&&t<=1+epsilon?clamp(t,0,1):null;
    }
    function playerLimit(from,to,cellPixels){
      const cell=metrics(cellPixels),line=path(from,to,cell),di=to.i-from.i,dj=to.j-from.j;
      if(Math.abs(di)<=epsilon&&Math.abs(dj)<=epsilon)return {fraction:1,blocked:false,piece:null};
      if(Math.abs(di)>epsilon&&Math.abs(dj)>epsilon)return {fraction:0,blocked:true,piece:null};
      let fraction=1,obstacle=null;
      function consider(t,piece){if(t!==null&&(t<fraction-epsilon||!obstacle&&t<=fraction+epsilon)){fraction=clamp(t,0,1);obstacle=piece;}}
      for(const piece of pieces){
        if(piece.cleared||piece.playerPush||piece.claimedBy!==null)continue;
        const g=geometry(piece,cellPixels);
        const across=Math.abs(di)>epsilon?'j':'i',pitch=across==='j'?cell.y:cell.x;
        // Only remains physically touching this supporting grid line can
        // obstruct it. Nearby body contacts are movable, even inside a node box.
        if(Math.abs((g[across]-from[across])*pitch)>g.radius+epsilon)continue;
        // Let Gridder enter the edge and meet the actual obstacle. The
        // controller starts a push at this contact rather than gating a node.
        consider(hit(line,g,cell,g.radius+playerReach(cellPixels),true),piece);
      }
      return {fraction,blocked:obstacle!==null,piece:obstacle};
    }
    function findFood(from,to,cellPixels,scale=1){
      const cell=metrics(cellPixels),line=path(from,to,cell);
      let result=null;
      for(const piece of pieces){
        if(piece.cleared||piece.playerPush||piece.claimedBy!==null)continue;
        const g=geometry(piece,cellPixels),fraction=hit(line,g,cell,g.radius);
        if(fraction!==null&&(!result||fraction<result.fraction-epsilon))result={piece,fraction};
      }
      return result;
    }
    function sweep(from,to,cellPixels){
      const cell=metrics(cellPixels),line=path(from,to,cell);
      if(!cell.x||!cell.y||Math.abs(line.dx)>epsilon&&Math.abs(line.dy)>epsilon)return null;
      const stationary=Math.abs(line.dx)<=epsilon&&Math.abs(line.dy)<=epsilon;
      const horizontal=Math.abs(line.dx)>epsilon||stationary&&node(from.j);
      const across=horizontal?'j':'i',along=horizontal?'i':'j',pitch=horizontal?cell.y:cell.x,count=horizontal?ny:nx;
      return {cell,line,stationary,horizontal,across,along,pitch,count};
    }
    function movable(piece,from,cellPixels,route,reach){
      if(!live(piece)||piece.cleared||piece.playerPush||piece.claimedBy!==null)return null;
      const {cell,line,stationary,across,pitch}=route,g=geometry(piece,cellPixels);
      if(stationary&&node(from.i)&&node(from.j)&&
        (Math.abs((g.i-from.i)*cell.x)<=g.radius+epsilon||Math.abs((g.j-from.j)*cell.y)<=g.radius+epsilon))return null;
      // Keep food anywhere on this supporting line, including beyond a short
      // frame's swept distance, so a player or a spider cannot push it first.
      if(Math.abs((g[across]-from[across])*pitch)<=g.radius+epsilon)return null;
      const fraction=hit(line,g,cell,g.radius+reach);
      return fraction===null?null:{g,fraction};
    }
    function clearAside(piece,from,route,g,reach){
      const {horizontal,across,along,pitch,count}=route,edge=Math.round(from[across]);
      let sign=Math.sign(g[across]-edge)||1;
      if(edge<=0)sign=1;else if(edge>=count)sign=-1;
      const available=Math.max(0,pitch*(7/8)-g.radius);
      const padding=options.referencePlotWidth>0?nx*route.cell.x/options.referencePlotWidth:1;
      const distance=Math.min(available,Math.max(pitch/2,reach+g.radius+padding));
      const position={i:g.i,j:g.j};
      position[along]=clamp(Math.floor(g[along])+.5,.5,(horizontal?nx:ny)-.5);
      position[across]=clamp(edge+sign*(pitch?distance/pitch:.5),.125,count-.125);
      piece.pushed=position;piece.cleared=true;
    }
    function finishPlayerPush(push,cellPixels){
      const piece=push.piece,from={...piece.pushed};from[push.axis]=push.node;
      const to={...from};to[push.axis]+=push.sign;
      const route=sweep(from,to,cellPixels);
      if(route)clearAside(piece,from,route,geometry(piece,cellPixels),playerReach(cellPixels));
      piece.playerPush=null;push.done=true;
    }
    function beginPlayerPush(piece,from,to,cellPixels){
      const route=sweep(from,to,cellPixels);
      if(!route||route.stationary||!live(piece)||piece.cleared||piece.playerPush||piece.claimedBy!==null)return null;
      const g=geometry(piece,cellPixels);
      if(Math.abs((g[route.across]-from[route.across])*route.pitch)>g.radius+epsilon||hit(route.line,g,route.cell,g.radius+playerReach(cellPixels))===null)return null;
      const axis=route.along,sign=Math.sign(to[axis]-from[axis]);
      const next=sign>0?Math.ceil(g[axis]-epsilon):Math.floor(g[axis]+epsilon);
      const push={piece,axis,sign,node:clamp(next,0,axis==='i'?nx:ny),done:false};
      piece.pushed={i:g.i,j:g.j};piece.playerPush=push;
      if(Math.abs(push.node-g[axis])<=epsilon)finishPlayerPush(push,cellPixels);
      return push;
    }
    function playerPushDistance(push,cellPixels){
      if(!push||push.done||push.piece.playerPush!==push)return 0;
      return Math.max(0,(push.node-push.piece.pushed[push.axis])*push.sign)*metrics(cellPixels)[push.axis==='i'?'x':'y'];
    }
    function advancePlayerPush(push,distance,cellPixels){
      if(!push||push.done||push.piece.playerPush!==push)return false;
      const cell=metrics(cellPixels)[push.axis==='i'?'x':'y'];if(!cell)return false;
      const travel=Math.min(playerPushDistance(push,cellPixels),Math.max(0,finite(distance)));
      push.piece.pushed[push.axis]+=push.sign*travel/cell;
      if(playerPushDistance(push,cellPixels)<=epsilon)finishPlayerPush(push,cellPixels);
      return push.done;
    }
    function releasePlayerPush(push){
      if(!push||push.done||push.piece.playerPush!==push)return false;
      push.piece.playerPush=null;push.done=true;return true;
    }
    function playerSnag(from,to,cellPixels){
      const route=sweep(from,to,cellPixels);
      if(!route||route.stationary)return null;
      let result=null;
      for(const piece of pieces){
        const contact=movable(piece,from,cellPixels,route,playerReach(cellPixels));
        if(contact&&(!result||contact.fraction<result.fraction-epsilon))result={piece,fraction:contact.fraction};
      }
      return result;
    }
    function pushAside(piece,from,to,cellPixels,reach=playerReach(cellPixels)){
      const route=sweep(from,to,cellPixels);
      if(!route||route.stationary)return false;
      reach=Math.max(0,finite(reach,playerReach(cellPixels)));
      const contact=movable(piece,from,cellPixels,route,reach);
      if(!contact)return false;
      clearAside(piece,from,route,contact.g,reach);return true;
    }
    function brush(from,to,cellPixels,scale=1){
      const route=sweep(from,to,cellPixels),pushed=[];
      if(!route)return pushed;
      const reach=legReach*Math.max(0,finite(scale,1))*displayScale(cellPixels);
      for(const piece of pieces){
        const contact=movable(piece,from,cellPixels,route,reach);
        if(!contact)continue;
        clearAside(piece,from,route,contact.g,reach);pushed.push(piece);
      }
      return pushed;
    }
    function render(field){
      field=field||{};
      const l=finite(field.l),t=finite(field.t),pw=Math.max(0,finite(field.pw)),ph=Math.max(0,finite(field.ph)),cellPixels=axis=>axis==='x'?pw/nx:ph/ny;
      let out='<g class="gridder-remains" pointer-events="none" aria-label="Settled cartoon remains">';
      for(const piece of pieces){
        const g=geometry(piece,cellPixels),x=l+g.i*pw/nx,y=t+ph-g.j*ph/ny;
        out+=`<g class="gridder-corpse-piece" data-piece-id="${piece.id}" data-index="${piece.index}" data-shape="${piece.shape}" data-claimed="${piece.claimedBy!==null}" data-pushing="${Boolean(piece.playerPush)}" data-cleared="${piece.cleared}" data-i="${number(g.i)}" data-j="${number(g.j)}" data-x="${number(x)}" data-y="${number(y)}" data-radius="${number(g.radius)}" transform="translate(${number(x)},${number(y)}) rotate(${number(piece.angle)}) scale(${number(g.radius/8)})">${Capture.fragmentMarkup(piece.shape)}</g>`;
      }
      return out+'</g>';
    }
    return {pieces,add,geometry,render,playerLimit,playerSnag,pushAside,beginPlayerPush,playerPushDistance,advancePlayerPush,releasePlayerPush,findFood,claim,consume,release,brush};
  }
  const api={create,playerRadius,legReach};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderRemains=api;
})(typeof window!=='undefined'?window:globalThis);
