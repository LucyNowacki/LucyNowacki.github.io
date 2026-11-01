/* Local game effects and bundled speech, unlocked by Start game. */
(function(root){
  'use strict';
  function create(enabled=()=>true,host=root){
    let context=null,loading=null,generation=0;
    const clips=new Map(),effects=new Map(),sources=new Set(),activities=new Map();
    const history={fills:0,lastFillCount:0,captures:0,lastCapture:null};
    const files={resurrection:'audio/resurrection-song.wav',gameover:'audio/dunces-stool-devil.wav'};
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
    function voice(name,delay){
      if(!ready())return;
      const token=generation,start=context.currentTime+delay;
      const play=()=>{
        if(token!==generation||!ready()||!clips.has(name))return;
        const source=context.createBufferSource(),gain=context.createGain();
        source.buffer=clips.get(name);gain.gain.setValueAtTime(1.15,context.currentTime);
        track(source,gain);source.start(Math.max(context.currentTime,start));
      };
      if(clips.has(name))play();else loading?.then(play);
    }
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
      const rate=context.sampleRate,buffer=context.createBuffer(1,Math.ceil(duration*rate),rate),samples=buffer.getChannelData(0);
      let seed=Array.from(name).reduce((value,char)=>value+char.charCodeAt(0),730),low=0,phase=0,peak=0;
      for(let i=0;i<samples.length;i++){
        const t=i/rate,u=t/duration;
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        const noise=seed/2147483648-1;low=low*.82+noise*.18;
        let value=0,frequency;
        if(name==='bite'){
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
        const envelope=Math.min(1,t/.004)*Math.min(1,(duration-t)/.025);
        samples[i]=value*envelope;peak=Math.max(peak,Math.abs(samples[i]));
      }
      // Leave room for browser resampling; this bus does not boost voice gain.
      const gain=.64/Math.max(peak,.001);
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
      if(!['push','chew','walk'].includes(name))return false;
      const existing=activities.get(key);
      if(!active||!ready()){
        if(existing){try{existing.stop();}catch{}existing.onended?.();}
        return false;
      }
      if(existing)return true;
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=effectBuffer(name,1);source.loop=true;
      gain.gain.setValueAtTime(name==='push'?.32:name==='walk'?.13:.24,context.currentTime);
      track(source,gain);const ended=source.onended;
      source.onended=()=>{if(activities.get(key)===source)activities.delete(key);ended?.();};
      activities.set(key,source);
      source.start(context.currentTime,Math.max(0,Number.isFinite(progress)?progress:0)%1);
      return true;
    }
    function capturePhase(name,progress=0,duration){
      const lengths={bite:.25,swell:2,decay:.65,scatter:.9};
      if(!ready()||!Object.hasOwn(lengths,name))return false;
      duration=Number.isFinite(duration)&&duration>0?duration:lengths[name];
      const offset=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))*duration;
      if(offset>=duration)return false;
      stop();
      history.captures++;history.lastCapture=name;
      const buffer=effectBuffer(name,duration);
      const source=context.createBufferSource(),gain=context.createGain(),time=context.currentTime;
      source.buffer=buffer;
      gain.gain.setValueAtTime(.001,time);
      gain.gain.exponentialRampToValueAtTime(.62,time+Math.min(.006,(duration-offset)/2));
      track(source,gain);source.start(time,offset);
      return true;
    }
    function bite(){stop();tone(330,65,0,.3,'sawtooth',.10);}
    function killed(resurrect,{deathCue=true}={}){
      stop();if(deathCue)tone(330,65,0,.3,'sawtooth',.10);
      if(resurrect){tone(440,880,.32,.18);voice('resurrection',0);}
      else voice('gameover',.4);
    }
    const resurrectionDuration=()=>((clips.get('resurrection')?.duration??2.8)+.15)*1000;
    return {unlock,fill,bite,capturePhase,activity,step,killed,stop,resurrectionDuration,
      get diagnostics(){return {...history,activeSources:sources.size,activities:[...activities.keys()],ready:ready()};}};
  }
  const api={create};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderSound=api;
})(typeof window!=='undefined'?window:globalThis);
