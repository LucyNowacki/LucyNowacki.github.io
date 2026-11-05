/* Copper Trails: an original layered tracker-style score for the roadmap.
 * No Giana Sisters recording, melody transcription or third-party samples. */
(function (root) {
  'use strict';
  const title = 'Copper Trails · original chiptune', bpm = 136, bars = 32;
  // Each melody bar totals four beats. The second half develops the theme
  // above a brighter relative-major harmony before returning to D minor.
  const themes = [
    [[74,.5],[77,.5],[81,.75],[79,.25],[77,.5],[76,.5],[74,1]],
    [[77,.75],[79,.25],[82,.5],[81,.5],[79,.5],[77,.5],[74,1]],
    [[81,1],[84,.5],[81,.5],[79,.75],[77,.25],[76,.5],[77,.5]],
    [[79,.5],[76,.5],[72,1],[74,.5],[76,.5],[79,1]],
    [[74,.25],[76,.25],[77,.5],[81,.5],[86,.5],[84,.5],[81,.5],[79,1]],
    [[82,.75],[81,.25],[77,.5],[74,.5],[77,.5],[79,.5],[81,1]],
    [[81,.5],[84,.5],[86,.75],[84,.25],[81,.5],[79,.5],[77,1]],
    [[76,.5],[79,.5],[81,.5],[79,.5],[76,.5],[73,.5],[74,1]],
    [[84,.75],[81,.25],[77,1],[79,.5],[81,.5],[84,1]],
    [[79,.5],[83,.5],[86,.5],[83,.5],[81,.75],[79,.25],[76,1]],
    [[81,.5],[77,.5],[74,.75],[77,.25],[81,1],[86,1]],
    [[82,1],[86,.5],[89,.5],[86,.75],[84,.25],[82,.5],[81,.5]],
    [[84,.5],[81,.5],[79,.5],[77,.5],[81,.75],[84,.25],[89,1]],
    [[86,.75],[83,.25],[79,.5],[76,.5],[79,.5],[83,.5],[86,1]],
    [[86,.5],[84,.5],[81,1],[79,.5],[77,.5],[76,1]],
    [[73,.5],[76,.5],[79,.5],[81,.5],[77,.5],[76,.5],[74,1]]
  ];
  const harmony = [
    [38,62,65,69],[34,58,62,65],[41,65,69,72],[36,60,64,67],
    [38,62,65,69],[34,58,62,65],[41,65,69,72],[33,61,64,69],
    [41,65,69,72],[36,60,64,67],[38,62,65,69],[34,58,62,65],
    [41,65,69,72],[36,60,64,67],[34,58,62,65],[33,61,64,69]
  ];
  const frequency = midi => 440 * Math.pow(2, (midi - 69) / 12);
  const layers = Object.freeze(['pulse lead', 'countermelody', 'chord pad', 'rising arpeggio', 'answering arpeggio', 'octave bass', 'kick', 'snare', 'hi-hat', 'stereo delay']);
  function compose(sampleRate = 22050) {
    if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 96000) throw new RangeError('Unsupported sample rate');
    const beat = 60 / bpm, duration = bars * 4 * beat, length = Math.round(duration * sampleRate);
    const left = new Float32Array(length), right = new Float32Array(length);
    const tau = 2 * Math.PI;
    function add(at, seconds, amp, pan, signal, attack=.004, release=.018) {
      const start = Math.round(at * sampleRate), count = Math.round(seconds * sampleRate);
      const lg = Math.sqrt((1-pan)/2), rg = Math.sqrt((1+pan)/2);
      for (let n=0;n<count;n++) {
        const t=n/sampleRate;
        const envelope=Math.max(0,Math.min(1,t/attack,(seconds-t)/release));
        const value=signal(t,n)*envelope*amp;
        const i=(start+n)%length;
        left[i]+=value*lg; right[i]+=value*rg;
      }
    }
    function note(at, beats, midi, kind, amp, pan, previousMidi=midi) {
      const f=frequency(midi), previous=frequency(previousMidi), seconds=beats*beat;
      // Harmonic-limited pulse voices avoid generating harmonics above Nyquist.
      // A short integrated pitch glide and delayed vibrato keep the lead lively.
      const harmonicLimit=Math.max(1,Math.floor((sampleRate*.44)/Math.max(f,previous)));
      add(at,seconds,amp,pan,(t)=>{
        const glide=kind==='lead' ? (previous-f)*.027*(1-Math.exp(-t/.027)) : 0;
        const vibrato=kind==='lead' ? .13*Math.sin(tau*5.2*t)*Math.min(1,Math.max(0,(t-.09)/.12)) : 0;
        const phase=tau*(f*t+glide)+vibrato;
        if(kind==='bass')return .78*Math.sin(phase)+(harmonicLimit>=2?.18*Math.sin(2*phase):0);
        if(kind==='pad')return (.82*Math.sin(phase)+(harmonicLimit>=2?.13*Math.sin(2*phase):0))*(.86+.14*Math.sin(tau*.7*t));
        if(kind==='arp')return (Math.sin(phase)+(harmonicLimit>=2?.24*Math.sin(2*phase):0)+(harmonicLimit>=3?.09*Math.sin(3*phase):0))*Math.exp(-t*8);
        if(kind==='counter')return (Math.sin(phase)+(harmonicLimit>=2?.22*Math.sin(2*phase):0)+(harmonicLimit>=3?.10*Math.sin(3*phase):0))*(.75+.25*Math.exp(-t*9));
        // Band-limited pulse approximation with a slightly hollow tracker tone.
        return (Math.sin(phase)+(harmonicLimit>=2?.33*Math.sin(2*phase):0)+(harmonicLimit>=3?.12*Math.sin(3*phase):0)+(harmonicLimit>=4?.06*Math.sin(4*phase):0))*(.78+.22*Math.exp(-t*15));
      }, kind==='pad'?.075:.004,kind==='pad'?.11:.018);
    }
    let noiseState=0x6c756379;
    function noise(){noiseState^=noiseState<<13;noiseState^=noiseState>>>17;noiseState^=noiseState<<5;return(noiseState>>>0)/2147483648-1;}
    function drum(at,kind,amp,pan=0) {
      const duration=kind==='kick'?.22:kind==='snare'?.15:.055;
      let phase=0,previous=0;
      add(at,duration,amp,pan,(t)=>{
        if(kind==='kick'){phase+=tau*(48+125*Math.exp(-t*34))/sampleRate;return (Math.sin(phase)+.12*Math.sin(2*phase))*Math.exp(-t*17);}
        const x=noise(),high=x-previous;previous=x;
        return kind==='snare'?(x*.58+Math.sin(tau*185*t)*.32+Math.sin(tau*310*t)*.10)*Math.exp(-t*24):high*.36*Math.exp(-t*58);
      });
    }
    let lastLead=74;
    for(let bar=0;bar<bars;bar++) {
      const section=bar<16?bar%8:8+bar%8, chord=harmony[section], origin=bar*4*beat;
      const bridge=bar>=24&&bar<28, variation=bar>=8&&bar<16;
      let position=0;
      for(const [midi,beats] of themes[section]){
        note(origin+position*beat,beats*.91,midi,'lead',bridge?.145:.19,-.18,lastLead);
        lastLead=midi; position+=beats;
      }
      // Contrasting sustained response; rests leave space around the lead.
      const counterPattern=bridge?[2,1,0,1]:[1,2,1,0];
      for(let step=0;step<4;step++) {
        if(step===0 && bar%2===0 && !bridge)continue;
        const pitch=chord[1+counterPattern[step]]+(step===3&&bar%4===3?12:0);
        note(origin+(step+.18)*beat,.68,pitch,'counter',bridge?.095:.072,.48);
      }
      for(let voice=1;voice<=3;voice++)note(origin,3.92,chord[voice]-12,'pad',bridge?.052:.039,voice===1?-.65:voice===3?.65:0);
      for(let step=0;step<8;step++) {
        const octave=(step%4===2||step%8===7)?12:0;
        note(origin+step*.5*beat,.40,chord[0]+octave,'bass',.19,.06);
      }
      const rise=[0,1,2,1], answer=[2,1,0,1];
      for(let step=0;step<16;step++) {
        note(origin+step*.25*beat,.20,chord[1+rise[step%4]]+12,'arp',bridge?.045:.067,-.48);
        if(step%2===1 && !bridge)note(origin+step*.25*beat,.19,chord[1+answer[step%4]],'arp',variation?.066:.05,.58);
      }
      for(let step=0;step<8;step++)drum(origin+step*.5*beat,'hat',step%2?.049:.031,step%2?.35:-.25);
      drum(origin,'kick',.32);drum(origin+2*beat,'kick',.30);
      if(!bridge && bar%2===1)drum(origin+2.75*beat,'kick',.16);
      drum(origin+beat,'snare',bridge?.12:.17,-.05);drum(origin+3*beat,'snare',bridge?.12:.17,.05);
      if(bar%4===3){drum(origin+3.5*beat,'snare',.10,-.18);drum(origin+3.75*beat,'snare',.09,.18);drum(origin+3.875*beat,'hat',.035,.3);}
    }
    // Gentle cross-channel feedback delay; bounded gain and post-mix saturation.
    const delay=Math.round(beat*.375*sampleRate);
    for(let i=delay;i<length;i++){
      const l=left[i-delay],r=right[i-delay];
      left[i]+=.14*r;right[i]+=.14*l;
    }
    let peak=0;
    for(let i=0;i<length;i++){
      left[i]=Math.tanh(left[i]*1.25)*.9;right[i]=Math.tanh(right[i]*1.25)*.9;
      peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
    }
    const scale=.82/Math.max(.82,peak), edge=Math.round(.006*sampleRate);
    for(let i=0;i<length;i++){
      const fade=Math.min(1,i/edge,(length-1-i)/edge);
      left[i]*=scale*fade;right[i]*=scale*fade;
    }
    return {left,right,sampleRate,duration:length/sampleRate,bpm,bars,title,layers};
  }
  function create(host=root) {
    let context,buffer,bus,source,offset=0,startedAt=0,generation=0;
    const available=()=>Boolean(host.gridderAudioManager?.context||host.AudioContext||host.webkitAudioContext);
    function pause() {
      generation++;
      if(!source)return;
      offset=(offset+Math.max(0,context.currentTime-startedAt))%buffer.duration;
      const previous=source;source=null;previous.onended=null;
      try{previous.stop();}catch{}
      previous.disconnect();
    }
    async function play() {
      if(source)return true;
      const token=++generation;
      try {
        if(!available())return false;
        if(!context){
          context=host.gridderAudioManager?.context||new(host.AudioContext||host.webkitAudioContext)();
          bus=context.createGain();bus.gain.value=.28;bus.connect(host.gridderAudioManager?.destination||context.destination);
        }
        // Call resume inside the click gesture, before score rendering.
        const resumed=context.resume();
        if(!buffer){const score=compose();buffer=context.createBuffer(2,score.left.length,score.sampleRate);buffer.getChannelData(0).set(score.left);buffer.getChannelData(1).set(score.right);}
        await resumed;
        if(token!==generation||host.document?.hidden||context.state!=='running')return false;
        host.gridderMusic?.pause();
        source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(bus);
        startedAt=context.currentTime;source.start(startedAt,offset);return true;
      }catch{pause();return false;}
    }
    host.addEventListener?.('pagehide',pause);
    host.document?.addEventListener?.('visibilitychange',()=>{if(host.document.hidden)pause();});
    return {play,pause,isPlaying:()=>Boolean(source),available,label:title};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={compose,create,title,bpm,bars,layers};
  else {root.GridderRoadmapAudio=create(root);root.dispatchEvent(new CustomEvent('gridder-roadmap-audio-ready'));}
})(typeof window!=='undefined'?window:globalThis);
