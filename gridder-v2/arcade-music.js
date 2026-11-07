/* Synthesized music, never recordings. Score provenance is in audio/.
   One PCM loop and gain bus; compose() retains the original Boléro excerpt. */
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
 // Full source forms: tick units are twelfths of one quarter note.
 const THEME_B=[
  'Bb4/12~ Bb4/3 A4/3 G4/3 F4/3 Bb4/3 C5/3 A4/3 G4/3',
  'Bb4/6 A4/3 G4/3 Bb4/12 A4/3 Bb4/3 A4/3 G4/3~',
  'G4/12~ G4/3 F4/3 E4/3 D4/3 E4/12~',
  'E4/12 R/6 Bb4/6 C5/6 Db5/6~',
  'Db5/6 Db5/12 Db5/6 Db5/6 Db5/6',
  'Db5/4 Db5/4 Db5/4 Db5/6 C5/3 Bb4/3 Db5/6 C5/3 Bb4/3',
  'Db5/3 C5/3 Bb4/3 Ab4/3 G4/3 F4/3 E4/6~ E4/12~',
  'E4/24~ E4/6 R/6',
  'D4/18 E4/6 D4/3 E4/3 F4/6~',
  'F4/12 G4/6 Ab4/6 F4/4 G4/4 E4/4',
  'D4/3 E4/3 D4/3 C4/3~ C4/6 Bb3/6~ Bb3/12~',
  'Bb3/3 C4/3 Bb3/3 C4/3 D4/3 E4/3 D4/3 C4/3 D4/3 C4/3 Bb3/3 Ab3/3',
  'Bb3/3 Ab3/3 G3/6~ G3/6 F3/6~ F3/12~',
  'F3/12~ F3/3 G3/3 F3/3 Eb3/3~ Eb3/12~',
  'Eb3/12 F3/3 Eb3/3 F3/3 Db3/3~ Db3/12~',
  'Db3/12~ Db3/3 Db3/3 Eb3/3 Db3/3 F3/3 Eb3/3 Db3/3 C3/3~',
  'C3/12 R/24'
 ];
 // Source themeFinal: last four B bars are altered, followed by the eight-bar modulation.
 const FINAL_B_END=[
  'Bb4/3 Ab4/3 G4/6~ G4/24~',
  'G4/24 R/6 D5/6~',
  'D5/12~ D5/6 E5/6~ E5/12',
  'D5/3 E5/3 F5/6~ F5/12 G5/6 B5/6~',
  'B5/12~ B5/3 A5/3 G#5/3 F#5/3 G#5/3 A5/3 B5/3 C6/3',
  'B5/12~ B5/3 C6/3 D6/3 C6/3 B5/3 A5/3 G#5/3 F#5/3',
  'G#5/3 A5/3 B5/6~ B5/3 C6/3 D6/3 C6/3 B5/3 A5/3 G#5/3 F#5/3',
  'G#5/3 F#5/3 E5/6~ E5/12 D5/3 C5/3 D5/3 E5/3~',
  'E5/24 F5/3 G5/3 F5/3 E5/3~',
  'E5/24 D5/3 C5/3 D5/3 E5/3~',
  'E5/24 F#5/3 G#5/3 F#5/3 E5/3~',
  'E5/24 D5/3 E5/3 D5/3 C5/3~'
 ];
 // First melody of Chambers: A with both endings, followed by all sixteen B bars.
 const SZLA_BARS=[
  [[69,2],[74,1]],[[78,2],[76,1]],[[74,2],[73,1]],[[74,1],[73,1],[71,1]],
  [[69,2],[69,1]],[[66,2],[67,1]],[[69,6]],[],[[67,2],[67,1]],[[64,2],[66,1]],[[67,6]],[],
  [[69,2],[69,1]],[[66,2],[67,1]],[[69,6]],[],
  [[69,2],[69,1]],[[78,2],[76,1]],[[74,6]],[],
  [[78,1],[78,.5],[76,.5],[74,1]],[[78,1],[78,.5],[76,.5],[74,1]],[[78,1],[79,1.5],[78,.5]],[[76,3]],
  [[76,1],[76,.5],[74,.5],[73,1]],[[76,1],[76,.5],[74,.5],[73,1]],[[76,1],[78,1.5],[76,.5]],[[74,3]],
  [[78,1],[78,.5],[76,.5],[74,1]],[[78,1],[78,.5],[76,.5],[74,1]],[[78,1],[79,1.5],[78,.5]],[[76,2],[78,1]],
  [[79,1],[78,1],[76,1]],[[74,1],[73,1],[71,1]],[[69,1],[71,1],[73,1]],[[74,3]]
 ];
 const ROSE_BARS=[
  [[60,.5],[60,.5],[60,.5],[60,.5],[65,1],[63,1]],
  [[62,1],[63,.5],[62,.5],[60,1],[null,1]],
  [[67,.5],[67,.5],[67,.5],[67,.5],[72,1],[70,1]],
  [[68,1],[70,.5],[68,.5],[67,1],[null,1]],
  [[67,.75],[67,.25],[67,.5],[67,.5],[68,1.5],[67,.5]],
  [[65,.5],[63,.5],[62,.5],[63,.5],[65,1],[63,1]],
  [[62,1],[63,.5],[65,.5],[67,1],[null,1]],
  [[67,.75],[67,.25],[67,.5],[67,.5],[72,1.5],[70,.5]],
  [[68,.5],[67,.5],[65,.5],[63,.5],[65,1],[63,1]],
  [[62,1],[63,.5],[62,.5],[60,1],[null,1]]
 ];
 const TRACKS=Object.freeze([
  Object.freeze({id:'bolero',title:'Boléro',start:0,end:850,sections:['A','B','final modulation','coda']}),
  Object.freeze({id:'szla-dzieweczka',title:'Szła dzieweczka do laseczka',start:850,end:910,sections:['A first ending','A second ending','B']}),
  Object.freeze({id:'rozmarynie',title:'O mój rozmarynie',start:910,end:935,sections:['bars 1–4','bars 5–7','bars 8–10']})
 ]), CYCLE=935,CHUNK=4;
 function midiOf(name,octave,accidental){return (Number(octave)+1)*12+({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[name]??0)+(accidental==='#'?1:accidental==='b'?-1:0);}
 function notationEvents(bars,transpose=0){
  let tick=0,tied=false;const notes=[];
  for(const bar of bars){let barTicks=0;
   for(const token of bar.split(' ')){
    const match=/^([A-G]|R)([#b]?)(\d?)\/(\d+)([~!]?)$/.exec(token);
    if(!match)throw Error('Invalid note '+token);
    const [,name,acc,octave,n,mark]=match,duration=+n;barTicks+=duration;
    if(name!=='R'){
     const pitch=midiOf(name,octave,acc)+transpose;
     if(tied){if(notes.at(-1)?.midi!==pitch)throw Error('Invalid tie '+token);notes.at(-1).ticks+=duration;}
     else notes.push({tick,ticks:duration,midi:pitch,gate:mark==='!'?.72:.98});
    }else if(tied)throw Error('Tie to rest');
    tied=mark==='~';tick+=duration;
   }
   if(barTicks!==36)throw Error('Wrong bar duration '+barTicks+' in '+bar);
  }
  return notes;
 }
 function buildScore(){
  const events=[],names=['melody','harmony','bass','percussion'];
  function add(at,duration,midi,layer,volume,kind,pan=0){events.push({at,duration,midi,layer,volume,kind,pan});}
  const beat=60/72;
  function addBolero(bars,barStart,transpose=0,cutBars=bars.length){
   for(const n of notationEvents(bars.slice(0,cutBars),transpose)){
    const at=barStart*3*beat+n.tick/12*beat, duration=n.ticks/12*beat*n.gate;
    const swell=.70+.30*Math.min(1,at/850),pitch=n.midi;
    add(at,duration,pitch,'melody',.27*swell,'flute',.18);
    if(at>185)add(at,duration,pitch+7,'harmony',.045*swell,'warm',-.3);
    if(at>380)add(at,duration,pitch-12,'harmony',.05*swell,'reed',-.14);
   }
  }
  // 18 written presentations start at bars 5, 23, 41, ... .
  for(let n=0;n<17;n++)addBolero((Math.floor(n/2)%2===0)?THEME:THEME_B,4+n*18);
  const finalOpening=THEME_B.slice(0,12).map(bar=>bar.replace(/([A-G][#b]?)(\d)(?=\/)/g,(_,name,oct)=>name+(Number(oct)+1)));
  addBolero([...finalOpening,...FINAL_B_END],310);
  // Last six bars: ostinato figures and closing descending figure from flute part.
  const coda=[
   'E5/6 C6/2 C6/2 C6/2 C6/6 C6/2 C6/2 C6/2 B5/6 B5/6',
   'C6/6 C6/2 C6/2 C6/2 C6/6 C6/2 C6/2 C6/2 B5/2 B5/2 B5/2 B5/2 B5/2 B5/2',
   'C6/6 C6/2 C6/2 C6/2 C6/6 C6/2 C6/2 C6/2 B5/6 B5/6',
   'C6/6 C6/2 C6/2 C6/2 C6/6 C6/2 C6/2 C6/2 B5/2 B5/2 B5/2 B5/2 B5/2 B5/2',
   'R/6 F6/2 E6/2 Db6/2~ Db6/12~ Db6/2 C6/2 Bb5/2 Ab5/2 G5/2 F5/2',
   'E5/6 R/30'
  ];
  addBolero(coda,334);
  for(let bar=0;bar<340;bar++){
   const at=bar*3*beat,swell=.70+.30*bar/339;
   const roots=bar>=326&&bar<334?[40,47]:[36,43],root=roots[bar%2];
   add(at,.26,root,'bass',.12*swell,'pizz',-.25);
   add(at+beat,.18,root+12,'harmony',.042*swell,'pizz',.30);
   add(at+2*beat,.18,root+7,'harmony',.042*swell,'pizz',.30);
   let pos=0;for(const ticks of SNARE[bar%2]){add(at+pos/12*beat,.085,0,'percussion',.11*swell,'snare',-.1);pos+=ticks;}
  }
  const seq=[...SZLA_BARS.slice(0,16),...SZLA_BARS.slice(0,12),...SZLA_BARS.slice(16)];
  if(seq.length!==48)throw Error('Szła form');
  function folktune(bars,start,bpm,transpose,meter,kind){
   const unit=60/bpm;
   bars.forEach((notes,bar)=>{
    let position=0;
    for(const [pitch,length] of notes){if(pitch!==null){
     const at=start+(bar*meter+position)*unit,dur=length*unit*.98;
     add(at,dur,pitch+transpose,'melody',.27,kind,.12);
     add(at,dur,pitch+transpose-12,'harmony',.055,'warm',-.28);
    }position+=length;}
    // Empty bar follows a tied whole bar in this ABC transcription.
    if(position!==0&&position!==meter&&position!==2*meter)throw Error('Invalid folk bar '+bar);
    const at=start+bar*meter*unit,root=kind==='reed'?(bar%8===2||bar%8===3?43:38):([0,1,2,3,4,7].includes(bar)?38:45);
    add(at,.26,root,'bass',.10,'pizz',-.25);
    add(at+unit,.22,root+7,'harmony',.055,'pizz',.25);
    add(at,.055,0,'percussion',.030,'snare',0);
   });
  }
  folktune(seq,850,144,0,3,'reed');folktune(ROSE_BARS,910,96,14,4,'flute');
  events.sort((a,b)=>a.at-b.at);return {events,layers:names,tracks:TRACKS.map(t=>({...t}))};
 }
 let scoreCache=null;
 function completeArrangement(){return scoreCache||(scoreCache=buildScore());}
 // Render an arbitrary small contiguous window; phases and noise use absolute
 // sample positions so neighbouring buffers join without resetting any voice.
 function composeWindow(start=0,seconds=CHUNK,rate=RATE){
  rate=Math.round(clamp(rate,8000,48000));
  if(!Number.isFinite(start)||start<0||start>=CYCLE||!Number.isFinite(seconds)||seconds<=0||seconds>8||start+seconds>CYCLE+1e-8)throw RangeError('Window outside cycle or longer than eight seconds');
  const first=Math.round(start*rate),length=Math.round(seconds*rate),left=new Float32Array(length),right=new Float32Array(length);
  const begin=first/rate,end=(first+length)/rate,tau=Math.PI*2;
  for(const e of completeArrangement().events){
   if(e.at>=end)break;if(e.at+e.duration<=begin)continue;
   const lo=Math.max(0,Math.ceil((e.at-begin)*rate)),hi=Math.min(length,Math.ceil((e.at+e.duration-begin)*rate));
   const hz=e.midi?440*2**((e.midi-69)/12):0;
   for(let i=lo;i<hi;i++){
    const absolute=(first+i)/rate,t=absolute-e.at;
    const attack=Math.min(1,t/(e.kind==='snare'?.002:.012));
    const release=Math.min(1,(e.duration-t)/(e.kind==='snare'?.008:.025));
    let wave,decay=1;
    if(e.kind==='snare'){
     let n=(Math.imul(first+i+1,1664525)+1013904223)>>>0;n^=n>>>13;n=Math.imul(n,1274126177)>>>0;
     wave=(n/2147483648-1)*.8+Math.sin(tau*185*t)*.2;decay=Math.exp(-t*42);
    }else{
     const p=tau*hz*t;
     wave=e.kind==='reed'?.68*Math.sin(p)+.22*Math.sin(2*p)+.10*Math.sin(3*p):e.kind==='warm'?.7*Math.sin(p)+.2*Math.sin(2*p)+.1*Math.sin(4*p):.84*Math.sin(p)+.12*Math.sin(2*p)+.04*Math.sin(3*p);
     if(e.kind==='pizz')decay=Math.exp(-t*12);
    }
    const v=e.volume*attack*release*decay*wave;
    left[i]+=v*(1-e.pan*.35);right[i]+=v*(1+e.pan*.35);
   }
  }
  // Source boundaries and full-cycle seam fade; interior chunk edges do not.
  const trackEdges=[0,850,910,935];
  for(let i=0;i<length;i++){
   const t=(first+i)/rate;let gain=1;
   for(const edge of trackEdges){const d=Math.abs(t-edge);if(d<.02)gain=Math.min(gain,d/.02);}
   left[i]=Math.max(-.95,Math.min(.95,left[i]*gain));right[i]=Math.max(-.95,Math.min(.95,right[i]*gain));
  }
  return {left,right,sampleRate:rate,start:begin,duration:length/rate};
 }
 function create(options={},host=root){
  const enabled=typeof options.enabled==='function'?options.enabled:()=>options.enabled!==false;
  const volume=typeof options.volume==='function'?options.volume:()=>options.volume??.3;
  let context=null,bus=null,unlocked=false,desired=false,destroyed=false,generation=0;
  let offset=0,startedAt=0,base=0,nextTime=0,nextSample=0,starts=0,stops=0,reason='idle',lastVolume=-1;
  const scheduled=[];
  function gainValue(){return clamp(Number(volume()),0,1)*.22;}
  function setVolume(){if(!bus)return;const v=gainValue();if(v===lastVolume)return;lastVolume=v;
   if(typeof bus.gain.setTargetAtTime==='function')bus.gain.setTargetAtTime(v,context.currentTime,.025);else bus.gain.setValueAtTime(v,context.currentTime);}
  function position(){return scheduled.length?(base+Math.max(0,context.currentTime-startedAt))%CYCLE:offset;}
  function ensureAudio(){
   if(context)return true;const managed=host.gridderAudioManager,AudioContext=host.AudioContext||host.webkitAudioContext;
   if(!managed?.context&&!AudioContext)return false;
   context=managed?.context||new AudioContext();bus=context.createGain();bus.gain.setValueAtTime(0,context.currentTime);bus.connect(managed?.destination||context.destination);completeArrangement();setVolume();return true;
  }
  function pump(){
   if(!desired||!unlocked||destroyed||!enabled()||context.state!=='running')return;
   while(scheduled.length<2){
    if(nextTime!==null&&nextTime<context.currentTime){const skipped=Math.ceil((context.currentTime-nextTime)*RATE);nextSample=(nextSample+skipped)%(CYCLE*RATE);nextTime+=skipped/RATE;}
    const at=nextSample/RATE,track=TRACKS.find(t=>at>=t.start&&at<t.end),frames=Math.min(CHUNK*RATE,Math.round((track.end-at)*RATE));
    if(frames<=0)throw Error('Invalid playlist boundary');
    const block=composeWindow(at,frames/RATE,RATE),buffer=context.createBuffer(2,frames,RATE);
    buffer.getChannelData(0).set(block.left);buffer.getChannelData(1).set(block.right);
    if(nextTime===null){nextTime=context.currentTime+.03;startedAt=nextTime;}
    const node=context.createBufferSource(),token=generation,entry={node,buffer,when:nextTime,at,duration:frames/RATE};
    node.buffer=buffer;node.connect(bus);scheduled.push(entry);
    node.onended=()=>{const i=scheduled.indexOf(entry);if(i>=0)scheduled.splice(i,1);node.disconnect();if(token===generation&&desired)pump();};
    node.start(nextTime);starts++;nextTime+=frames/RATE;nextSample=(nextSample+frames)%(CYCLE*RATE);
   }
  }
  function detach(preserve){
   if(preserve)offset=position();else offset=0;
   for(const entry of scheduled.splice(0)){entry.node.onended=null;try{entry.node.stop();}catch{}entry.node.disconnect();stops++;}
  }
  function play(){
   if(destroyed||!desired||!enabled()||!unlocked||context?.state!=='running')return false;
   if(scheduled.length){reason='playing';return true;}
   base=offset;nextTime=null;nextSample=Math.round(offset*RATE)%(CYCLE*RATE);
   pump();reason='playing';setVolume();return true;
  }
  function unlock(){
   if(destroyed||!enabled())return Promise.resolve(false);const token=generation;
   try{if(!ensureAudio())return Promise.resolve(false);return Promise.resolve(context.resume()).then(()=>{
    if(destroyed||token!==generation||!enabled())return false;unlocked=context.state==='running';if(unlocked)play();return unlocked;
   }).catch(()=>false);}catch{return Promise.resolve(false);}
  }
  function start(){if(destroyed)return false;desired=true;reason=unlocked?'ready':'awaiting-gesture';if(!enabled()){pause('disabled');return false;}return play();}
  function pause(why='paused'){generation++;desired=false;detach(true);reason=why;}
  function stop(){generation++;desired=false;detach(false);reason='stopped';}
  function update(state={}){
   if(destroyed)return false;if(state.reset){stop();return false;}setVolume();
   const blocked=!enabled()?'disabled':state.hidden?'hidden':state.voice?'voice':!state.playing?'paused':null;
   if(blocked){if(desired||scheduled.length)pause(blocked);else reason=blocked;return false;}
   const active=start();if(active)pump();return active;
  }
  function destroy(){stop();destroyed=true;unlocked=false;bus?.disconnect();bus=null;reason='destroyed';}
  return {unlock,start,pause,stop,update,destroy,get diagnostics(){
   const p=position(),track=TRACKS.find(t=>p>=t.start&&p<t.end);
   return {title:TITLE,composer:COMPOSER,bpm:BPM,bars:340,meter:'3/4',playing:scheduled.length>0,desired,unlocked,reason,
    offset:p,tracks:TRACKS.map(t=>({...t})),currentTrack:track?.id??null,volume:gainValue(),starts,stops,
    activeSources:scheduled.length,queuedBuffers:scheduled.length,chunkSeconds:CHUNK,duration:CYCLE};
  }};
 }
 const api={create,compose,composeWindow,completeArrangement,arrangement};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GridderArcadeMusic=api;
})(typeof window!=='undefined'?window:globalThis);
