/* Ravel's Boléro: synthesized opening-theme arrangement, never a recording.
   Score provenance: audio/bolero-provenance.json. One PCM loop and gain bus. */
(function(root){
 'use strict';
 const clamp=(value,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(value)?value:lo));
 const BPM=72,BARS=24,RATE=22050,TITLE='Boléro · Ravel (synthesized arrangement)',COMPOSER='Maurice Ravel';
 // Twelve ticks per quarter: sixteenth=3, eighth=6, triplet-sixteenth=2.
 // Flute I, original bars 5–21. ~ ties the next note without reattack;
 // ! shortens portato/staccato articulation without changing its score time.
 // Nicolas Sceaux, common.ily themeA, CC0, commit e46e0da5b2518ac9c2521308351ce02c30a4b0da.
 const THEME=[
  'C5/12~ C5/6 B4/3 C5/3 D5/3 C5/3 B4/3 A4/3',
  'C5/6 C5/3 A4/3 C5/12~ C5/6 B4/3 C5/3',
  'A4/3 G4/3 E4/3 F4/3 G4/24~',
  'G4/3 F4/3 E4/3 D4/3 E4/3 F4/3 G4/3 A4/3 G4/12~',
  'G4/12~ G4/3 A4/3 B4/3 A4/3 G4/3 F4/3 E4/3 D4/3',
  'E4/3 D4/3 C4/6~ C4/6 C4/3 D4/3 E4/6! F4/6!',
  'D4/12 G4/24~',
  'G4/24~ G4/6 R/6',
  'D5/12~ D5/9 C5/3 B4/3 A4/3 B4/3 C5/3',
  'D5/3 C5/3 B4/6~ B4/3 C5/3 B4/3 A4/3 C5/3 B4/3 A4/3 F4/3~',
  'F4/6 F4/3! F4/3! F4/6! A4/6! C5/3 A4/3 B4/3 G4/3',
  'F4/6 F4/3! F4/3! F4/6! A4/6! B4/3 G4/3 A4/3 F4/3',
  'D4/6 D4/3 C4/3 D4/12~ D4/6 D4/3! D4/3!',
  'D4/6! F4/6! A4/3 F4/3 G4/3 E4/3 D4/6 D4/3 C4/3',
  'D4/12~ D4/6 D4/3 C4/3 D4/6 E4/3 F4/3',
  'G4/24~ G4/3 F4/3 E4/3 D4/3',
  'C4/6 R/30'
 ];
 const SNARE=[
  [6,2,2,2,6,2,2,2,6,6],
  [6,2,2,2,6,2,2,2,2,2,2,2,2,2]
 ];
 function arrangement(){
  const melody=[],snare=[],pitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  let tick=4*36,tied=false;
  for(const bar of THEME){
   for(const token of bar.split(' ')){
    const [,name,octave,units,mark]=/^([A-G]|R)(\d?)\/(\d+)([~!]?)$/.exec(token),ticks=Number(units);
    if(name!=='R'){
     const midi=(Number(octave)+1)*12+pitch[name];
     if(tied)melody.at(-1).beats+=ticks/12;
     else melody.push({beat:tick/12,beats:ticks/12,midi,gate:mark==='!'?.72:.98});
    }
    tied=mark==='~';tick+=ticks;
   }
  }
  for(let bar=0;bar<BARS;bar++){
   let position=0;
   for(const ticks of SNARE[bar%2]){
    snare.push({beat:bar*3+position/12,accent:ticks===6?1:.65});position+=ticks;
   }
  }
  return {title:TITLE,composer:COMPOSER,bpm:BPM,bars:BARS,meter:'3/4',introBars:4,
   ticksPerBeat:12,themeBars:THEME.slice(),snareBars:SNARE.map(bar=>bar.slice()),melody,snare};
 }
 function compose(rate=RATE){
  rate=Math.round(clamp(rate,8000,48000));
  const score=arrangement(),beat=60/BPM,duration=BARS*3*beat,length=Math.round(duration*rate);
  const left=new Float32Array(length),right=new Float32Array(length);
  const frequency=midi=>440*Math.pow(2,(midi-69)/12),tau=2*Math.PI;
  let seed=0x63e9d0;
  const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
  function put(index,value,pan=0){
   index%=length;left[index]+=value*(1-pan*.45);right[index]+=value*(1+pan*.45);
  }
  function note(at,seconds,midi,volume,kind,pan){
   const start=Math.round(at*rate),count=Math.round(seconds*rate),hz=frequency(midi);
   let phase=0;
   for(let i=0;i<count;i++){
    const t=i/rate,isFlute=kind==='flute';
    const vibrato=isFlute?1+.0018*Math.min(1,t/.3)*Math.sin(tau*4.8*t):1;
    phase+=tau*hz*vibrato/rate;
    const attack=Math.min(1,t/(isFlute?.012:.003)),release=Math.min(1,(seconds-t)/(isFlute?.018:.025));
    const envelope=attack*release*(isFlute?.96+.04*Math.sin(Math.PI*i/count):Math.exp(-t*14));
    // Airy flute harmonics over plucked strings, without the old chip arpeggio.
    const wave=isFlute?Math.sin(phase)*.84+Math.sin(phase*2)*.12+Math.sin(phase*3)*.035+noise()*.012:
      Math.sin(phase)*.72+Math.sin(phase*2)*.19+Math.sin(phase*3)*.09;
    put(start+i,wave*envelope*volume,pan);
   }
  }
  function snare(at,accent){
   const seconds=.085,start=Math.round(at*rate),count=Math.round(seconds*rate);
   let filtered=0;
   for(let i=0;i<count;i++){
    const t=i/rate,n=noise();filtered=filtered*.72+n*.28;
    const envelope=Math.min(1,t/.001)*Math.min(1,(seconds-t)/.008)*Math.exp(-t*48);
    const value=(n-filtered)*.046+Math.sin(tau*185*t)*.012;
    put(start+i,value*envelope*accent,-.22);
   }
  }
  // C/G pizzicato reduction from the opening cello and viola parts.
  // After the bar-21 cadence, three quiet bars provide an even turnaround.
  for(let bar=0;bar<BARS;bar++){
   const at=bar*3*beat;
   note(at,.29,48,.075,'pizz',-.15);note(at,.23,55,.026,'pizz',.25);
   note(at+beat,.23,55,.026,'pizz',.25);note(at+beat,.23,67,.018,'pizz',.25);
   note(at+2*beat,.28,43,.05,'pizz',-.15);note(at+2*beat,.25,55,.04,'pizz',-.15);
   if(bar%2)note(at+2.5*beat,.22,55,.035,'pizz',-.15);
  }
  for(const event of score.snare)snare(event.beat*beat,event.accent);
  for(const event of score.melody)note(event.beat*beat,event.beats*beat*event.gate,event.midi,.16,'flute',.12);
  let peak=0;for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
  const scale=.72/Math.max(peak,.001);
  for(let i=0;i<length;i++){left[i]*=scale;right[i]*=scale;}
  return {left,right,sampleRate:rate,duration:length/rate,bpm:BPM,bars:BARS,meter:'3/4',title:TITLE,composer:COMPOSER};
 }
 function create(options={},host=root){
  const enabled=typeof options.enabled==='function'?options.enabled:()=>options.enabled!==false;
  const volume=typeof options.volume==='function'?options.volume:()=>options.volume??.3;
  let context=null,bus=null,buffer=null,source=null,unlocked=false,desired=false,destroyed=false;
  let generation=0,offset=0,startedAt=0,starts=0,stops=0,reason='idle',lastVolume=-1;
  function gainValue(){return clamp(Number(volume()),0,1)*.22;}
  function setVolume(){
   if(!bus)return;
   const value=gainValue();if(value===lastVolume)return;
   lastVolume=value;
   if(typeof bus.gain.setTargetAtTime==='function')bus.gain.setTargetAtTime(value,context.currentTime,.025);
   else bus.gain.setValueAtTime(value,context.currentTime);
  }
  function ensureAudio(){
   if(context)return true;
   const managed=host.gridderAudioManager,AudioContext=host.AudioContext||host.webkitAudioContext;
   if(!managed?.context&&!AudioContext)return false;
   context=managed?.context||new AudioContext();
   bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);
   bus.connect(managed?.destination||context.destination);
   const score=compose(),made=context.createBuffer(2,score.left.length,score.sampleRate);
   made.getChannelData(0).set(score.left);made.getChannelData(1).set(score.right);
   buffer=made;setVolume();return true;
  }
  function detach(preserveOffset){
   const old=source;source=null;
   if(old){
    if(preserveOffset)offset=(offset+Math.max(0,context.currentTime-startedAt))%buffer.duration;
    old.onended=null;try{old.stop();}catch{}old.disconnect();stops++;
   }
   if(!preserveOffset)offset=0;
  }
  function play(){
   if(destroyed||!desired||!enabled()||!unlocked||context?.state!=='running')return false;
   if(source){reason='playing';return true;}
   source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(bus);
   const current=source;
   source.onended=()=>{if(source===current)source=null;current.disconnect();};
   startedAt=context.currentTime;source.start(startedAt,offset%buffer.duration);starts++;reason='playing';setVolume();
   return true;
  }
  function unlock(){
   if(destroyed||!enabled())return Promise.resolve(false);
   const token=generation;
   try{
    if(!ensureAudio())return Promise.resolve(false);
    return Promise.resolve(context.resume()).then(()=>{
     if(destroyed||token!==generation||!enabled())return false;
     unlocked=context.state==='running';
     if(unlocked)play();
     return unlocked;
    }).catch(()=>false);
   }catch{return Promise.resolve(false);}
  }
  function start(){
   if(destroyed)return false;
   desired=true;reason=unlocked?'ready':'awaiting-gesture';
   if(!enabled()){pause('disabled');return false;}
   return play();
  }
  function pause(why='paused'){
   generation++;desired=false;detach(true);reason=why;
  }
  function stop(){generation++;desired=false;detach(false);reason='stopped';}
  function update(state={}){
   if(destroyed)return false;
   if(state.reset){stop();return false;}
   setVolume();
   const blocked=!enabled()?'disabled':state.hidden?'hidden':state.voice?'voice':!state.playing?'paused':null;
   if(blocked){
    if(desired||source)pause(blocked);
    else reason=blocked;
    return false;
   }
   return start();
  }
  function destroy(){stop();destroyed=true;unlocked=false;bus?.disconnect();bus=null;buffer=null;reason='destroyed';}
  return {unlock,start,pause,stop,update,destroy,
   get diagnostics(){return {title:TITLE,composer:COMPOSER,bpm:BPM,bars:BARS,meter:'3/4',playing:!!source,desired,unlocked,reason,
    offset:source?(offset+Math.max(0,context.currentTime-startedAt))%buffer.duration:offset,
    volume:gainValue(),starts,stops,activeSources:Number(!!source),duration:buffer?.duration??0};}};
 }
 const api={create,compose,arrangement};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GridderArcadeMusic=api;
})(typeof window!=='undefined'?window:globalThis);
