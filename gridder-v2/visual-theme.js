/* Presentation presets only. They never change the catalogue or simulation. */
(function(root){
  'use strict';
  const plain=Object.freeze({id:'plain',surface:0x211a34,grid:0x847097,gridAlpha:.5,axis:0xb09bbf,node:0x211a34,nodeStroke:0xb195ce,fill:0xec9bc6,fillAlpha:.30,route:0xd49aff,ink:'#c8b9dc',ticks:14});
  // Explicit function keys keep the identity stable when levels, difficulty,
  // catalogue order or the running game clock change. No level-based colours.
  const hues={
    quadratic:[306,184],gaussian:[266,326],quartic:[38,164],rational:[158,282],
    sine:[184,86],log:[26,200],cubic:[342,46],constant:[222,174],
    linear:[96,204],cube:[278,32],reciprocal:[204,324],square_root:[140,44],
    cube_root:[318,150],power_three_halves:[48,278],power_two_thirds:[174,354],
    exponential:[18,102],exponential_two:[252,156],log_two:[66,306],
    cosine:[232,52],tangent:[358,188],arcsine:[126,262],arccosine:[292,66],
    arctangent:[192,22],sinh:[330,210],cosh:[78,174],tanh:[150,30],
    piecewise_cubic:[244,338],piecewise_valley:[10,268],log_composite:[114,318],
    exp_sine:[284,192],circle_upper:[212,104],circle_lower:[54,234],
    vector_parabola:[162,54],vector_wave:[324,116]
  };
  function colour(h,s,l){
    s/=100;l/=100;
    const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};
    return (f(0)<<16)|(f(8)<<8)|f(4);
  }
  const hex=n=>'#'+n.toString(16).padStart(6,'0');
  const rgb=n=>[(n>>16)&255,(n>>8)&255,n&255].join(', ');
  const palettes=new Map();
  function forFunction(key){
    if(!palettes.has(key)){
      const [p,s]=hues[key]||hues.quadratic,frame=colour(p,100,63),accent=colour(s,100,66),highlight=colour(s,90,94);
      palettes.set(key,Object.freeze({id:'neon',paletteKey:key,
        surface:colour(p,58,6),grid:colour(p,94,58),gridAlpha:.58,axis:colour(s,95,73),
        node:colour(p,52,10),nodeStroke:colour(s,85,76),fill:colour(p,100,55),fillAlpha:.28,
        route:colour(p,100,86),ink:'#eaeaff',ticks:14,frame,accent,highlight,
        gridGlow:colour(p,100,56),curveGlow:colour(s,100,57),curveRim:highlight,curveCore:colour(s,100,72),
        css:Object.freeze({'primary':hex(frame),'primary-rgb':rgb(frame),'secondary':hex(accent),'secondary-rgb':rgb(accent),
          'highlight':hex(highlight),'highlight-rgb':rgb(highlight),'surface':hex(colour(p,48,9)),
          'panel':hex(colour(p,40,14)),'deep':hex(colour(p,52,5)),'muted':hex(colour(p,24,81)),'ink':'#faf9ff'})
      }));
    }
    return palettes.get(key);
  }
  const select=document.getElementById('gridder-visual-preset');
  let id=new URLSearchParams(location.search).get('visual')==='plain'?'plain':'neon';
  let functionKey='quadratic';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function apply(){
    const element=document.documentElement;
    element.dataset.visualPreset=id;element.dataset.functionPalette=functionKey;
    for(const [name,value] of Object.entries(forFunction(functionKey).css))element.style.setProperty('--neon-'+name,value);
    if(select)select.value=id;
  }
  function setFunction(key){if(key&&key!==functionKey){functionKey=key;apply();}}
  select?.addEventListener('change',()=>{id=select.value==='plain'?'plain':'neon';apply();root.dispatchEvent(new Event('gridder-theme-change'));});
  motion.addEventListener?.('change',()=>root.dispatchEvent(new Event('gridder-theme-change')));
  apply();
  root.GridderTheme={current:()=>id==='plain'?plain:forFunction(functionKey),forFunction,setFunction,reducedMotion:()=>motion.matches};
})(window);
