/* Gridder's cartoon capture sequence. All motion uses the supplied game clock. */
(function(root){
  'use strict';
  const durations=Object.freeze({bite:250,swell:2000,decay:650,scatter:900});
  const swellAt=durations.bite,decayAt=swellAt+durations.swell;
  const scatterAt=decayAt+durations.decay,total=scatterAt+durations.scatter;
  const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
  const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
  const smooth=p=>p*p*(3-2*p);
  const number=value=>String(Number(finite(value).toFixed(6)));
  const mix=(a,b,p)=>a+(b-a)*p;
  function colour(a,b,p){
    const channels=a.map((c,i)=>Math.round(mix(c,b[i],p)).toString(16).padStart(2,'0'));
    return '#'+channels.join('');
  }
  function fieldBox(field){
    field=field||{};
    return {l:finite(field.l),t:finite(field.t),pw:Math.max(0,finite(field.pw)),ph:Math.max(0,finite(field.ph))};
  }
  function face(fill,puffed){
    return `<circle class="gridder-capture-body" r="11" fill="${fill}" stroke="#342257" stroke-width="1.7"/>`+
      (puffed?'<path d="M-7-4 Q-6-8-1-8" fill="none" stroke="#a6b6ff" stroke-width="2.5" stroke-linecap="round" opacity=".75"/><path d="M-10 4 Q-16 0-15-4 M10 4 Q16 0 15-4" fill="none" stroke="#000080" stroke-width="2.2" stroke-linecap="round"/><path d="M-2 10 L0 14 2 10" fill="#000080" stroke="#342257" stroke-width="1"/>':'')+
      '<rect x="-7" y="-5" width="5" height="6" rx="1" fill="white"/><rect x="2" y="-5" width="5" height="6" rx="1" fill="white"/><circle cx="-4" cy="-2" r="1.6" fill="#17122b"/><circle cx="5" cy="-2" r="1.6" fill="#17122b"/>'+
      (puffed?'<ellipse cy="5.5" rx="2.6" ry="3.1" fill="#130e38" stroke="#bfc8ff" stroke-width=".8"/><path class="gridder-capture-tongue" d="M-.8 6 Q1 5.5 2.1 6.5 L3.9 10 Q3.6 12.1 1.5 11.1 L.1 8.6Z" fill="#ef1717" stroke="#a30707" stroke-width=".55"/><path d="M-8-7-3-6 M3-6 8-7" fill="none" stroke="#d5ddff" stroke-width="1.1"/>':'<ellipse cy="5.5" rx="2.1" ry="2.7" fill="#221331"/>');
  }
  function corpse(progress){
    const p=smooth(progress),fill=colour([0,0,128],[120,129,58],p);
    return `<g class="gridder-corpse" data-decay="${number(progress)}"><path class="gridder-capture-body" d="M-11-1 Q-12-11-2-11 Q9-13 11-4 L13 3 Q8 10 2 9 L-5 11 Q-12 8-11-1Z" fill="${fill}" stroke="#484331" stroke-width="1.8"/>`+
      `<g opacity="${number(.2+.8*p)}"><ellipse cx="-6.5" cy="3" rx="3.5" ry="2.6" fill="#70552c"/><path d="M4-10 9-7 7-3 3-5Z" fill="#8c923a"/><circle cx="7" cy="5" r="2.8" fill="#594628"/><circle cx="-8" cy="-5" r="1.8" fill="#a3a45c"/><circle cy="8" r="1.6" fill="#9f7e3b"/></g>`+
      '<path class="gridder-corpse-eyes" d="M-7-5-3-1 M-3-5-7-1 M3-5 7-1 M7-5 3-1" fill="none" stroke="#f2eccb" stroke-width="1.9" stroke-linecap="round"/><path d="M-4 5 Q0 2 4 5 M-2 3-2 5 M1 3 1 5" fill="none" stroke="#302c20" stroke-width="1.4" stroke-linecap="round"/>'+
      `<g opacity="${number(p)}" fill="none" stroke="#81874a" stroke-width="1.2" stroke-linecap="round"><path d="M-8-14 Q-11-17-8-20 M1-14 Q4-17 1-21 M8-13 Q11-16 8-18"/></g></g>`;
  }
  const shapes=[
    '<path d="M-5-2-1-5 4-3 5 2 1 5-4 3Z" fill="#858a40" stroke="#4b422b" stroke-width="1"/><circle cx="1" cy="1" r="1.8" fill="#68512c"/>',
    '<path d="M-4-4 2-5 5-1 3 4-3 5-5 1Z" fill="#705832" stroke="#423927" stroke-width="1"/><path d="M-2-2 2-1 0 2Z" fill="#b1a45b"/>',
    '<ellipse rx="4.8" ry="3.2" fill="#e6e7bc" stroke="#4b422b" stroke-width="1"/><path d="M-2-1.6 2 1.6 M2-1.6-2 1.6" stroke="#5c5136" stroke-width="1.2" stroke-linecap="round"/>',
    '<path d="M-5 0 Q-4-5 1-4 L5-1 3 4 Q-3 5-5 0Z" fill="#000080" stroke="#423927" stroke-width="1"/><circle cx="-1" cy="1" r="2" fill="#7c803d"/>'
  ];
  function create(random=Math.random){
    const sample=()=>clamp(finite(random(),.5),0,1-Number.EPSILON);
    // Stratified random destinations cover the board. Sampling never occurs in
    // advance/render, so neither frame subdivision nor resize changes a corpse.
    const pieces=Array.from({length:24},(_,index)=>({
      u:(index%6+sample())/6,v:(Math.floor(index/6)+sample())/4,
      size:.65+sample()*.55,shape:Math.floor(sample()*shapes.length),
      angle:sample()*360,spin:(sample()-.5)*720,arc:.6+sample()*.8,
      startX:(sample()-.5)*12,startY:(sample()-.5)*12
    }));
    let elapsed=0,remainder=0;
    function phase(){
      if(elapsed<swellAt)return {name:'bite',progress:elapsed/durations.bite,scale:1};
      if(elapsed<decayAt){const progress=(elapsed-swellAt)/durations.swell;return {name:'swell',progress,scale:1+2*smooth(progress)};}
      if(elapsed<scatterAt){const progress=(elapsed-decayAt)/durations.decay;return {name:'decay',progress,scale:3-1.65*smooth(progress)};}
      if(elapsed<total)return {name:'scatter',progress:(elapsed-scatterAt)/durations.scatter,scale:1};
      return {name:'end',progress:1,scale:1};
    }
    function advance(milliseconds){
      if(Number.isFinite(milliseconds)&&milliseconds>0&&elapsed<total){
        // Compensated addition avoids accumulating frame rounding in the clock.
        const step=milliseconds-remainder,next=elapsed+step;
        remainder=(next-elapsed)-step;elapsed=Math.min(total,next);
        for(const boundary of [swellAt,decayAt,scatterAt,total])if(Math.abs(elapsed-boundary)<1e-9){elapsed=boundary;remainder=0;break;}
      }
      return phase();
    }
    function fragments(x,y,field,progress){
      const travel=1-Math.pow(1-progress,3),lift=Math.sin(Math.PI*progress)*Math.min(52,field.ph*.18);
      return pieces.map((piece,index)=>{
        // A radius enclosing every rotated path and its stroke also handles a
        // board narrower than one fragment; all geometry stays inside the field.
        const radius=Math.min(8*piece.size,field.pw/2,field.ph/2),scale=radius/8;
        const lowX=field.l+radius,highX=field.l+field.pw-radius,lowY=field.t+radius,highY=field.t+field.ph-radius;
        const endX=mix(lowX,highX,piece.u),endY=mix(lowY,highY,piece.v);
        const startX=clamp(x+piece.startX,lowX,highX),startY=clamp(y+piece.startY,lowY,highY);
        const atX=clamp(mix(startX,endX,travel),lowX,highX),atY=clamp(mix(startY,endY,travel)-lift*piece.arc,lowY,highY);
        const angle=piece.angle+piece.spin*(1-progress);
        return `<g class="gridder-corpse-piece" data-index="${index}" data-shape="${piece.shape}" data-x="${number(atX)}" data-y="${number(atY)}" data-land-x="${number(endX)}" data-land-y="${number(endY)}" data-radius="${number(radius)}" transform="translate(${number(atX)},${number(atY)}) rotate(${number(angle)}) scale(${number(scale)})">${shapes[piece.shape]}</g>`;
      }).join('');
    }
    function render(x,y,field,settled=false){
      const state=phase(),box=fieldBox(field);
      x=finite(x,box.l+box.pw/2);y=finite(y,box.t+box.ph/2);
      let body='';
      if(state.name==='bite'){
        const shake=Math.sin(state.progress*Math.PI*6)*(1-state.progress)*1.3;
        body=`<g class="gridder-bite-face" transform="translate(${number(x+shake)},${number(y)})">${face('#ec9bc6',false)}<path class="gridder-bite-mark" d="M9-7 15-11 M11-1 18-1 M9 5 15 9" fill="none" stroke="#d49535" stroke-width="2" stroke-linecap="round"/></g>`;
      }else if(state.name==='swell'){
        body=`<g class="gridder-swell-face" transform="translate(${number(x)},${number(y)}) scale(${number(state.scale)})">${face('#000080',true)}</g>`;
      }else if(state.name==='decay'){
        body=`<g transform="translate(${number(x)},${number(y+state.progress*4)}) rotate(${number(state.progress*13)}) scale(${number(state.scale)},${number(state.scale*(1-.25*smooth(state.progress)))})">${corpse(state.progress)}</g>`;
      }else{
        if(state.name==='scatter'&&state.progress<.18)body=`<g opacity="${number(1-state.progress/.18)}" transform="translate(${number(x)},${number(y+4)}) rotate(13) scale(1.35,1.0125)">${corpse(1)}</g>`;
        body+=fragments(x,y,box,state.progress);
      }
      return `<g ${settled?'class="gridder-remains"':'id="gridder-capture"'} data-phase="${state.name}" data-elapsed="${number(elapsed)}" data-progress="${number(state.progress)}" data-scale="${number(state.scale)}" aria-label="Gridder ${state.name==='end'?'cartoon remains':state.name}" pointer-events="none">${body}</g>`;
    }
    return {get elapsed(){return elapsed;},advance,phase,done:()=>elapsed>=total,render,
      // Renderer-neutral copies retain the original, once-sampled trajectories.
      trajectories:()=>pieces.map(piece=>({...piece})),
      pieces:()=>pieces.map(({u,v,size,shape,angle})=>({u,v,size,shape,angle}))};
  }
  const api={durations,total,create,fragmentMarkup:shape=>shapes[clamp(Math.floor(finite(shape)),0,shapes.length-1)]};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderCapture=api;
})(typeof window!=='undefined'?window:globalThis);
