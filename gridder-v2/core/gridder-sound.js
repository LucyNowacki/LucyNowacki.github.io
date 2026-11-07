/* Local game effects and bundled speech, unlocked by Start game. */
(function(root){
  'use strict';
  function create(enabled=()=>true,host=root){
    let context=null,loading=null,generation=0;
    const clips=new Map(),effects=new Map(),sources=new Set(),activities=new Map();
    const history={fills:0,lastFillCount:0,captures:0,lastCapture:null,lastAttackType:null,
      houseVoiceStarts:0,lastHouseVoiceOffset:null,witchVoiceStarts:0,lastWitchVoiceOffset:null,borutaVoiceStarts:0,lastBorutaVoiceOffset:null};
    const files={resurrection:'audio/resurrection-song.wav',gameover:'audio/dunces-stool-devil.wav',
      'house-rotten-egg':host.GridderHouseVoice?.dataUri||root.GridderHouseVoice?.dataUri||'audio/house-rotten-egg.wav',
      'witch-conversion':host.GridderAttackVoices?.witch?.dataUri||root.GridderAttackVoices?.witch?.dataUri||'audio/witch-conversion.wav',
      'boruta-laugh':host.GridderAttackVoices?.boruta?.dataUri||root.GridderAttackVoices?.boruta?.dataUri||'audio/boruta-laugh.wav'};
    function track(source,gain){
      sources.add(source);
      source.onended=()=>{sources.delete(source);source.disconnect();gain.disconnect();};
      source.connect(gain);gain.connect(host.gridderAudioManager?.destination||context.destination);
    }
    function stop(){
      generation++;
      for(const source of [...sources]){try{source.stop();}catch{}source.onended?.();}
      activities.clear();
    }
    function unlock(){
      if(!enabled())return Promise.resolve(false);
      try{
        const AudioContext=host.AudioContext||host.webkitAudioContext;
        if(!AudioContext)return Promise.resolve(false);
        // Phaser owns the AudioContext in the game. The injected host remains
        // usable by independent unit fixtures and browsers without Phaser audio.
        context??=host.gridderAudioManager?.context||new AudioContext();
        const resumed=context.resume();
        loading??=Promise.all(Object.entries(files).map(async([name,url])=>{
          try{
            const response=await host.fetch(url);if(!response.ok)return;
            clips.set(name,await context.decodeAudioData(await response.arrayBuffer()));
          }catch{} // Tone effects still work if a voice asset cannot be loaded.
        }));
        return Promise.all([resumed,loading]).then(()=>context.state==='running').catch(()=>false);
      }catch{return Promise.resolve(false);}
    }
    const ready=()=>enabled()&&context?.state==='running';
    function tone(frequency,endFrequency,start,duration,type='triangle',volume=.13){
      if(!ready())return;
      const oscillator=context.createOscillator(),gain=context.createGain(),time=context.currentTime+start;
      oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,time);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency,time+duration);
      gain.gain.setValueAtTime(.001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.01);
      gain.gain.exponentialRampToValueAtTime(.001,time+duration);
      track(oscillator,gain);oscillator.start(time);oscillator.stop(time+duration+.02);
    }
    function voice(name,delay,offset=0){
      if(!ready())return false;
      const token=generation,start=context.currentTime+delay;
      const play=()=>{
        if(token!==generation||!ready()||!clips.has(name))return false;
        const buffer=clips.get(name),seek=Math.max(0,Number.isFinite(offset)?offset:0);
        if(seek>=buffer.duration)return true; // The short visual tail has no speech left.
        const source=context.createBufferSource(),gain=context.createGain();
        source.buffer=buffer;gain.gain.setValueAtTime(1.15,context.currentTime);
        track(source,gain);source.start(Math.max(context.currentTime,start),seek);return true;
      };
      if(clips.has(name))return play();
      loading?.then(play);return false;
    }
    // The controller retries while angels remain visible if decoding is late;
    // never queue a full stale phrase to play after their phase has ended.
    function resurrection(offset=0){return ready()&&clips.has('resurrection')?voice('resurrection',0,offset):false;}
    function fill(count=1){
      if(!Number.isFinite(count)||count<=0||!ready())return;
      count=Math.max(1,Math.min(8,Math.floor(count)));history.fills++;history.lastFillCount=count;
      // One bounded consonant reward for the entire enclosure. Larger catches
      // overlap longer, brighter notes into a fuller C-major flourish.
      const multiple=count>1,notes=multiple?[659.25,783.99,1046.5,1318.51]:[523.25,659.25,783.99,1046.5];
      const duration=multiple?.24+Math.min(count,5)*.012:.16;
      notes.forEach((frequency,i)=>tone(frequency,frequency,i*(multiple?.055:.07),duration,'triangle',.13));
    }
    function effectBuffer(name,duration){
      const key=name+':'+duration;if(effects.has(key))return effects.get(key);
      const [attackType,attackPhase]=name.split(':');
      const rate=context.sampleRate,buffer=context.createBuffer(1,Math.ceil(duration*rate),rate),samples=buffer.getChannelData(0);
      let seed=Array.from(name).reduce((value,char)=>value+char.charCodeAt(0),730),low=0,phase=0,peak=0;
      // Cache a deterministic, irregular train of individual short discharges.
      // Each has its own strength, decay and falling high-frequency zap.
      const sparks=[];let sparkIndex=0,sparkSeed=(seed^0x62a9b31f)>>>0;
      const sparkRandom=()=>{sparkSeed=(Math.imul(sparkSeed,1664525)+1013904223)>>>0;return sparkSeed/4294967296;};
      if(attackType==='electric')for(let at=0;at<duration;){
        sparks.push({at,strength:.45+sparkRandom(),decay:95+sparkRandom()*190,pitch:1700+sparkRandom()*4400});
        at+=.024+.119*sparkRandom()**2;
      }
      for(let i=0;i<samples.length;i++){
        const t=i/rate,u=t/duration;
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        const noise=seed/2147483648-1;low=low*.82+noise*.18;
        let value=0,frequency;
        if(attackType==='fire'){
          // Ignition whoosh, sustained flame roar, then dying embers and ash.
          const sustain=attackPhase==='swell',fade=sustain?1:Math.exp(-u*(attackPhase==='bite'?2:4));
          const ignition=attackPhase==='bite'?Math.exp(-t*15):0;
          const crackle=Math.exp(-(t%.083)*95)*(.35+.65*Math.sin(2*Math.PI*3.1*t)**2);
          value=(low*(1.7+.4*Math.sin(2*Math.PI*8*t))+(noise-low)*(.2+.48*crackle))*fade
            +Math.sin(2*Math.PI*(85*t+32*t*t))*ignition*.35;
        }else if(attackType==='electric'){
          // Sharp sizzling cracks, overlapping zaps and quiet air between them.
          // The sustained phase keeps sparking; release phases die away.
          const fade=attackPhase==='swell'?1:Math.exp(-u*(attackPhase==='bite'?1.7:4.5));
          while(sparkIndex+1<sparks.length&&sparks[sparkIndex+1].at<=t)sparkIndex++;
          let discharge=0;
          for(let n=Math.max(0,sparkIndex-3);n<=sparkIndex;n++){
            const spark=sparks[n],age=t-spark.at;if(age<0||age>.095)continue;
            const crack=Math.min(1,age/.00025)*Math.exp(-age*spark.decay)*spark.strength;
            const zap=Math.sin(2*Math.PI*(spark.pitch*age-14000*age*age));
            discharge+=((noise-low)*1.85+noise*.4+zap*.24)*crack;
          }
          if(attackPhase==='scatter'){
            // Gridder's disappearance starts with an electrical pressure blast,
            // then a falling bass rumble and smaller dying discharge fragments.
            // This is one seekable phase buffer, so resume skips its first crack.
            frequency=38+125*Math.exp(-t*20);phase+=2*Math.PI*frequency/rate;
            const blast=(noise-low)*Math.exp(-t*72)*1.6;
            const rumble=(Math.sin(phase)+.36*Math.sin(phase*.51))*(1-Math.exp(-t*180))*Math.exp(-t*6.8);
            value=blast+rumble*.95+low*Math.exp(-t*10)*.65+discharge*fade*.28;
          }else value=(discharge+(noise-low)*(.018+.035*Math.sin(2*Math.PI*97*t)**2))*fade;
        }else if(attackType==='rotten-egg'){
          // Airy egg launch, wet shell-breaking splats, and foul bubbling drips.
          const launch=attackPhase==='bite',beat=attackPhase==='swell'?t%.55:t;
          const splat=Math.exp(-beat*25),shell=Math.exp(-beat*85);
          frequency=85+420*Math.exp(-beat*22);phase+=2*Math.PI*frequency/rate;
          value=launch?(noise-low)*Math.sin(Math.PI*u)*.45+Math.sin(phase)*Math.exp(-t*18)*.3:
            low*(.25+.9*splat)+(noise-low)*shell*.56+Math.sin(phase)*splat*.46;
          if(!launch&&attackPhase!=='swell')value*=Math.exp(-u*4);
        }else if(name==='bite'){
          // Two distinct tooth snaps, a short alarm chirp and a low catch thud.
          const snaps=Math.exp(-t*38)+(t>=.065?.8*Math.exp(-(t-.065)*45):0);
          frequency=175-115*u;phase+=2*Math.PI*frequency/rate;
          value=(noise-low)*snaps*.65+Math.sin(phase)*Math.exp(-t*11)*.42
            +Math.sin(2*Math.PI*(750*t-950*t*t))*Math.exp(-t*24)*.23;
        }else if(name==='swell'){
          // A repeated wet intake and descending glug make draining audible.
          const beat=t%.24,pump=Math.exp(-beat*17),intake=Math.sin(Math.PI*Math.min(1,beat/.19))**2;
          frequency=115+245*Math.exp(-beat*13)+24*Math.sin(2*Math.PI*6*t);phase+=2*Math.PI*frequency/rate;
          value=low*(.16+intake*.8)+(noise-low)*intake*.16
            +Math.sin(phase)*pump*.35+Math.sin(phase*.5)*(.08+pump*.12);
        }else if(name==='decay'){
          // Descending wet bubbles and a wobbling squelch.
          const bubbles=[0,.18,.37,.51].reduce((sum,start)=>sum+(t>=start?Math.exp(-(t-start)*28):0),0);
          frequency=230-170*u+25*Math.sin(2*Math.PI*12*t);phase+=2*Math.PI*frequency/rate;
          value=low*bubbles*.9+Math.sin(phase)*Math.sin(phase*.47)*bubbles*.45;
        }else if(name==='push'){
          // Rough stone scraping with a low rumble and granular friction.
          const grind=.55+.25*Math.sin(2*Math.PI*13*t)+.2*Math.sin(2*Math.PI*31*t);
          value=low*grind*.85+(noise-low)*(.18+.12*Math.sin(2*Math.PI*7*t)**2)+Math.sin(2*Math.PI*63*t)*.18;
        }else if(name==='chew'){
          // Repeated wet crunches, with small tooth clicks between chews.
          const pulse=Math.exp(-(t%.2)*32),click=Math.exp(-((t+.085)%.2)*75);
          value=low*pulse*.8+(noise-low)*(pulse*.45+click*.18)+Math.sin(2*Math.PI*92*t)*pulse*.3;
        }else if(name==='shot'){
          // A dry percussive crack followed by a low, rapidly falling thump.
          // These are noise and pitch-swept pressure, not a sustained note.
          frequency=62+145*Math.exp(-t*44);phase+=2*Math.PI*frequency/rate;
          const crack=(noise-low)*Math.exp(-t*65),body=Math.sin(phase)*Math.exp(-t*22);
          value=crack*.92+body*.67+low*Math.exp(-t*32)*.3;
        }else if(name==='bullet-flight'){
          // Quiet air hiss with smooth periodic energy, bounded at loop edges.
          const flutter=.65+.35*Math.sin(2*Math.PI*7*t)**2;
          value=(noise-low)*.22*flutter+low*.36*flutter;
        }else if(name==='impact'){
          // A compact crunchy impact, distinct from the gun's sharp report.
          frequency=130-55*u;phase+=2*Math.PI*frequency/rate;
          value=(noise-low)*Math.exp(-t*48)*.55+low*Math.exp(-t*20)*.75+Math.sin(phase)*Math.exp(-t*25)*.34;
        }else if(name==='explosion'){
          // A short impact leads into a heavier noisy burst and low rumble.
          frequency=80-36*u;phase+=2*Math.PI*frequency/rate;
          const burst=t<.025?1:Math.exp(-(t-.025)*10);
          value=(noise-low)*Math.exp(-t*45)*.44+low*burst*.94+Math.sin(phase)*Math.exp(-t*9)*.58;
        }else if(name==='bomb-plant'){
          // Weight landing on the grid, then a short arming click.
          const click=t>=.11?Math.exp(-(t-.11)*95):0;
          value=Math.sin(2*Math.PI*82*t)*Math.exp(-t*24)*.8
            +low*Math.exp(-t*35)*.35+(noise-low)*click*.55;
        }else if(name==='bomb-blast'){
          // Pressure crack, deep expanding boom, fire roar and metallic debris.
          frequency=31+105*Math.exp(-t*19);phase+=2*Math.PI*frequency/rate;
          const crack=(noise-low)*Math.exp(-t*40)*1.2;
          const boom=(Math.sin(phase)+.33*Math.sin(phase*.51))*Math.exp(-t*3.1);
          const fire=low*(1-Math.exp(-t*60))*Math.exp(-t*2.8)*1.7;
          let shrapnel=0;
          for(const [n,start] of [.075,.13,.24,.39,.57,.83,1.07].entries()){
            const age=t-start;if(age<0)continue;
            shrapnel+=(Math.sin(2*Math.PI*((1450+n*213)*age-290*age*age))*.22
              +(noise-low)*.3)*Math.exp(-age*(25+n*2));
          }
          const echoes=[.18,.35,.62].reduce((sum,start,n)=>sum+(t>=start?
            (low*.7+Math.sin(2*Math.PI*44*(t-start))*.28)*Math.exp(-(t-start)*7)/(n+2):0),0);
          value=crack+boom*.95+fire+shrapnel+echoes;
        }else if(name==='walk'){
          // Four soft alternating crab steps, with a little arcade tick.
          const step=Math.floor(t/.25),age=t%.25,pulse=Math.exp(-age*44),pitch=step%2?210:160;
          value=Math.sin(2*Math.PI*pitch*age)*pulse*.55
            +(noise-low)*Math.exp(-age*95)*.18
            +Math.sin(2*Math.PI*780*age)*Math.exp(-age*115)*.08;
        }else{
          // Balloon pop, bass burst, then smaller flying-debris crackles.
          frequency=125-88*u;phase+=2*Math.PI*frequency/rate;
          const debris=[.07,.15,.26,.40,.58].reduce((sum,start)=>sum+(t>=start?Math.exp(-(t-start)*75):0),0);
          value=noise*Math.exp(-t*8)*.65+Math.sin(phase)*Math.exp(-t*7)*.5+(noise-low)*debris*.32;
        }
        const attack=attackType==='electric'?.00035:name==='shot'?.0006:.004;
        const envelope=Math.min(1,t/attack)*Math.min(1,(duration-t)/.025);
        samples[i]=value*envelope;peak=Math.max(peak,Math.abs(samples[i]));
      }
      // Leave room for browser resampling; this bus does not boost voice gain.
      const gain=(name==='bomb-blast'?.82:.64)/Math.max(peak,.001);
      for(let i=0;i<samples.length;i++)samples[i]*=gain;
      effects.set(key,buffer);return buffer;
    }
    function step(key='gridder-walk'){
      // A tap can finish before a sustained walking activity ever starts.
      // Do not add another footfall to the final frame of an existing loop.
      if(!ready()||activities.has(key))return false;
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=effectBuffer('walk',.09);
      gain.gain.setValueAtTime(.13,context.currentTime);
      track(source,gain);source.start(context.currentTime);
      return true;
    }
    function activity(name,key,active,progress=0){
      if(!['push','chew','walk','bullet-flight'].includes(name))return false;
      const existing=activities.get(key);
      if(!active||!ready()){
        if(existing){try{existing.stop();}catch{}existing.onended?.();}
        return false;
      }
      if(existing)return true;
      const source=context.createBufferSource(),gain=context.createGain();
      const duration=name==='bullet-flight'?.32:1;
      source.buffer=effectBuffer(name,duration);source.loop=true;
      gain.gain.setValueAtTime(name==='push'?.32:name==='walk'?.13:name==='bullet-flight'?.08:.24,context.currentTime);
      track(source,gain);const ended=source.onended;
      source.onended=()=>{if(activities.get(key)===source)activities.delete(key);ended?.();};
      activities.set(key,source);
      source.start(context.currentTime,Math.max(0,Number.isFinite(progress)?progress:0)%duration);
      return true;
    }
    function oneShot(name,duration,volume){
      if(!ready())return false;
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=effectBuffer(name,duration);gain.gain.setValueAtTime(volume,context.currentTime);
      track(source,gain);source.start(context.currentTime);return true;
    }
    const shot=()=>oneShot('shot',.16,.72);
    const bombPlant=()=>oneShot('bomb-plant',.24,.35);
    const bombBlast=()=>oneShot('bomb-blast',1.6,.95);
    const bulletFlight=active=>activity('bullet-flight','bullet-flight',!!active);
    const hit=(killed=false)=>killed?oneShot('explosion',.36,.62):oneShot('impact',.13,.48);
    function capturePhase(name,progress=0,duration,attackType=null){
      const lengths={bite:.25,swell:2,decay:.65,scatter:.9};
      if(!ready()||!Object.hasOwn(lengths,name))return false;
      duration=Number.isFinite(duration)&&duration>0?duration:lengths[name];
      const offset=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))*duration;
      if(offset>=duration)return false;
      stop();
      const variant=['fire','electric','rotten-egg'].includes(attackType)?attackType:null;
      history.captures++;history.lastCapture=name;history.lastAttackType=variant;
      const buffer=effectBuffer(variant?`${variant}:${name}`:name,duration);
      const source=context.createBufferSource(),gain=context.createGain(),time=context.currentTime;
      source.buffer=buffer;
      gain.gain.setValueAtTime(.001,time);
      const witchSpeaking=variant==='electric'&&name!=='scatter'&&clips.has('witch-conversion');
      gain.gain.exponentialRampToValueAtTime(witchSpeaking?.4:.62,time+Math.min(.006,(duration-offset)/2));
      track(source,gain);source.start(time,offset);
      // The witch's three calls follow the full attack up to the explosion.
      // Other speech stays relative to the sustained phase.
      // Seek along with the effect on resume; never queue speech after a
      // late decode, stop or phase transition. Start's unlock loads the cache.
      const speaker=variant==='electric'&&name!=='scatter'?'witch':name==='swell'?({'rotten-egg':'house',fire:'boruta'}[variant]):null;
      const clipName={house:'house-rotten-egg',witch:'witch-conversion',boruta:'boruta-laugh'}[speaker],clip=clips.get(clipName);
      const voiceOffset=speaker==='witch'?({bite:0,swell:.25,decay:2.25}[name]+offset):offset;
      if(clip&&voiceOffset<clip.duration){
        const speech=context.createBufferSource(),speechGain=context.createGain();
        speech.buffer=clip;speechGain.gain.setValueAtTime(speaker==='witch'?1:.75,time);
        track(speech,speechGain);speech.start(time,voiceOffset);
        history[`${speaker}VoiceStarts`]++;history[`last${speaker[0].toUpperCase()+speaker.slice(1)}VoiceOffset`]=voiceOffset;
      }
      return true;
    }
    function bite(){stop();tone(330,65,0,.3,'sawtooth',.10);}
    function killed(resurrect,{deathCue=true}={}){
      stop();if(deathCue)tone(330,65,0,.3,'sawtooth',.10);
      if(resurrect){tone(440,880,.32,.18);return resurrection();}
      return voice('gameover',.4);
    }
    const resurrectionDuration=()=>((clips.get('resurrection')?.duration??2.8)+.15)*1000;
    return {unlock,fill,bite,capturePhase,activity,step,shot,bombPlant,bombBlast,bulletFlight,hit,killed,stop,resurrection,resurrectionDuration,
      get diagnostics(){return {...history,houseVoiceReady:clips.has('house-rotten-egg'),houseVoiceDuration:clips.get('house-rotten-egg')?.duration??0,
        witchVoiceReady:clips.has('witch-conversion'),witchVoiceDuration:clips.get('witch-conversion')?.duration??0,
        borutaVoiceReady:clips.has('boruta-laugh'),borutaVoiceDuration:clips.get('boruta-laugh')?.duration??0,
        activeSources:sources.size,activities:[...activities.keys()],ready:ready()};}};
  }
  const api={create};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderSound=api;
})(typeof window!=='undefined'?window:globalThis);
