/* Bounded thunder and a bundled voice clip, borrowing Phaser's audio context. */
(function(root){
'use strict';
function create(options={},host=root){
 let context=null,buffer=null,unlocked=false,generation=0,lastStrike=null,source=null,gain=null,voiceSource=null,voiceGain=null,voiceBuffer=null,voiceLoad=null,suspended=true;
 let thunderCount=0,speechCount=0,reason='locked';
 const enabled=()=>options.enabled?!!options.enabled():true,blocked=()=>!!options.voiceBlocked?.();
 function stop(){
  generation++;
  suspended=true;
  if(source){const old=source;source=null;try{old.stop();}catch{}old.disconnect();}
  if(gain){gain.disconnect();gain=null;}
  if(voiceSource){const old=voiceSource;voiceSource=null;try{old.stop();}catch{}old.disconnect();}
  if(voiceGain){voiceGain.disconnect();voiceGain=null;}
  reason='stopped';
 }
 async function unlock(){
  const version=generation;
  context=host.gridderAudioManager?.context||null;
  if(!context){reason='no-shared-context';return false;}
  try{await context.resume();}catch{reason='resume-failed';return false;}
  // Cache once, but loading never schedules playback. A later fresh strike is
  // required, and a stopped unlock generation cannot become active again.
  if(!voiceLoad){const decoder=context;voiceLoad=(async()=>{
   try{const response=await host.fetch('audio/storm-hurry-up.wav');if(!response.ok)throw new Error('Voice asset unavailable');voiceBuffer=await decoder.decodeAudioData(await response.arrayBuffer());}catch{voiceBuffer=null;}
  })();}
  await voiceLoad;
  if(version!==generation)return false;
  unlocked=context.state==='running';reason=unlocked?'ready':'locked';return unlocked;
 }
 function rumble(){
  if(!buffer){
   const rate=context.sampleRate,length=Math.floor(rate*1.35);buffer=context.createBuffer(1,length,rate);
   const data=buffer.getChannelData(0);let seed=71631,low=0;
   for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.025*(noise-low);const t=i/rate,envelope=Math.min(1,t/.035)*Math.pow(1-i/length,1.7);data[i]=(low*1.8+Math.sin(t*2*Math.PI*43)*.08)*envelope;}
  }
  const node=context.createBufferSource(),bus=context.createGain();node.buffer=buffer;bus.gain.value=.4;
  node.connect(bus);bus.connect(host.gridderAudioManager?.destination||context.destination);source=node;gain=bus;
  node.onended=()=>{node.disconnect();bus.disconnect();if(source===node){source=null;gain=null;}};
  node.start();thunderCount++;
 }
 function say(){
  if(!voiceBuffer||blocked())return;
  const node=context.createBufferSource(),bus=context.createGain();node.buffer=voiceBuffer;node.playbackRate.value=.9;bus.gain.value=.8;
  node.connect(bus);bus.connect(host.gridderAudioManager?.destination||context.destination);voiceSource=node;voiceGain=bus;
  node.onended=()=>{node.disconnect();bus.disconnect();if(voiceSource===node){voiceSource=null;voiceGain=null;}};
  node.start();speechCount++;
 }
 function update(storm,{running=false}={}){
  const id=storm?.strikeId,fresh=id!=null&&id!==lastStrike;
  // Observe every id even while muted/paused/locked: never replay an old strike.
  if(id!=null)lastStrike=id;
  const allowed=!!(running&&storm?.enabled&&enabled()&&!blocked());
  if(!allowed){if(!suspended)stop();reason=blocked()?'voice':!enabled()?'muted':'paused';return;}
  suspended=false;
  if(!fresh||!(id>0)||!(storm.strikeAge>=0&&storm.strikeAge<400))return;
  if(!unlocked||context?.state!=='running'){reason='locked';return;}
  if(source){try{source.stop();}catch{}source.disconnect();gain?.disconnect();source=null;gain=null;}
  if(voiceSource){try{voiceSource.stop();}catch{}voiceSource.disconnect();voiceGain?.disconnect();voiceSource=null;voiceGain=null;}
  rumble();say();reason='strike';
 }
 function reset(){stop();lastStrike=null;reason='reset';}
 return {unlock,update,stop,reset,get diagnostics(){return {unlocked,lastStrike,generation,activeSources:(source?1:0)+(voiceSource?1:0),activeVoice:!!voiceSource,voiceReady:!!voiceBuffer,voiceDuration:voiceBuffer?.duration??null,speaking:!!voiceSource,started:!!voiceSource,thunderCount,speechCount,cachedBuffer:!!buffer,reason};}};
}
const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.GridderStormAudio=api;
})(typeof window==='undefined'?globalThis:window);
