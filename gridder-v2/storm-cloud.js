/* A harmless, deterministic weather companion. The controller owns movement. */
(function(root){
  'use strict';
  const cycleMs=26000,firstStrikeMs=4000,strikeEveryMs=8000,shoutMs=1800,followMs=1100;
  const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
  const copy=p=>p?{i:p.i,j:p.j}:null;
  function create(board){
    if(!Number.isFinite(board?.nx)||!Number.isFinite(board?.ny)||board.nx<=0||board.ny<=0)
      throw new RangeError('The storm cloud needs a finite positive board.');
    const marginX=Math.min(.35,board.nx/4),marginY=Math.min(.35,board.ny/4);
    let clock=0,remainder=0,enabled=true,position={i:board.nx/2,j:board.ny-marginY};
    let strikeId=0,lastStrike=null,nextStrike=firstStrikeMs,boltTarget=null,boltOrigin=null;
    function bounded(point){
      return {i:clamp(Number.isFinite(point?.i)?point.i:board.nx/2,0,board.nx),
        j:clamp(Number.isFinite(point?.j)?point.j:board.ny/2,0,board.ny)};
    }
    function weather(){
      if(!enabled)return 'dry';
      const t=clock%cycleMs;
      return t>=6000&&t<11000?'rain':t>=16000&&t<22000?'snow':'dry';
    }
    function footprint(){
      return {i:position.i,j:Math.max(0,position.j-.9),rx:Math.min(1.25,board.nx/2),ry:Math.min(.9,board.ny/2)};
    }
    function snapshot(){
      const mode=weather(),age=lastStrike===null?Infinity:Math.max(0,clock-lastStrike);
      return {clock,enabled,position:copy(position),mode,strikeId,strikeAge:enabled?age:Infinity,
        boltTarget:copy(boltTarget),boltOrigin:copy(boltOrigin),shouting:enabled&&age<shoutMs,
        precipitation:mode==='dry'?0:1,slip:mode==='rain'?.2:mode==='snow'?.45:0,footprint:footprint()};
    }
    function advance(milliseconds,player,options={}){
      enabled=options.enabled!==false;
      if(!enabled){
        // Explicitly disabling weather also clears a currently visible flash;
        // re-enabling cannot replay a stale bolt or speech bubble.
        lastStrike=null;boltTarget=null;boltOrigin=null;return snapshot();
      }
      const duration=Number.isFinite(milliseconds)?Math.max(0,milliseconds):0;
      if(!duration)return snapshot();
      const ground=bounded(player),target={i:clamp(ground.i,marginX,board.nx-marginX),
        j:clamp(ground.j+.9,marginY,board.ny-marginY)};
      const step=duration-remainder,end=clock+step;remainder=(end-clock)-step;
      function follow(until){
        const weight=-Math.expm1(-(until-clock)/followMs);
        position={i:position.i+(target.i-position.i)*weight,j:position.j+(target.j-position.j)*weight};clock=until;
      }
      // Split only at deterministic lightning deadlines. There is no damage
      // callback, random source, wall clock, route edit or grid teleport here.
      while(nextStrike<=end){
        follow(nextStrike);lastStrike=clock;strikeId++;boltTarget=copy(ground);boltOrigin=copy(position);
        nextStrike+=strikeEveryMs;
      }
      follow(end);return snapshot();
    }
    function surfaceAt(player){
      const mode=weather();
      if(mode==='dry'||!Number.isFinite(player?.i)||!Number.isFinite(player?.j)
        ||player.i<0||player.i>board.nx||player.j<0||player.j>board.ny)return 'dry';
      const area=footprint(),distance=((player.i-area.i)/area.rx)**2+((player.j-area.j)/area.ry)**2;
      return distance<=1+1e-10?mode:'dry';
    }
    return {advance,snapshot,surfaceAt};
  }
  const api={create,cycleMs,firstStrikeMs,strikeEveryMs,shoutMs};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GridderStormCloud=api;
})(typeof window!=='undefined'?window:globalThis);
