/* Pure finite-sequence operations, with exact rational sample coordinates. */
(function(root){
  'use strict';
  const sample=(values,start,j)=>values[j-start]??0;
  const support=(a,as,b,bs)=>[as+bs,as+bs+a.length+b.length-2];
  function terms(a,as,b,bs,k){return a.map((value,i)=>{
    const j=as+i,other=sample(b,bs,k-j);
    return {j,otherIndex:k-j,a:value,b:other,product:value*other};
  });}
  function linear(a,as,b,bs){
    const lo=as+bs,output=Array.from({length:a.length+b.length-1},(_,i)=>({k:lo+i,value:0}));
    // Zero-filled ranges need no multiplication for their zero entries.
    const nonzeroB=b.map((value,i)=>({value,i})).filter(t=>t.value!==0);
    a.forEach((value,i)=>{if(value!==0)for(const t of nonzeroB)output[i+t.i].value+=value*t.value;});
    return output;
  }
  function parse(text){const parts=text.trim().split(/[\s,]+/);if(parts.length<1||parts.length>10000||parts.some(p=>!p))throw Error('Use 1–10,000 numbers, separated by commas or spaces.');
    const v=parts.map(Number);if(v.some(n=>!Number.isFinite(n)||n< -4||n>4))throw Error('Use finite real values from −4 to 4. Decimal values are allowed.');return v;}
  function resizeInterval(values,originalStart,start,end){
    if(!values.length||![originalStart,originalStart+values.length-1,start,end].every(Number.isSafeInteger))throw Error('Start and End indices must be safely representable integers.');
    if(end<start)throw Error('End index must be greater than or equal to Start index.');
    const count=end-start+1;
    if(!Number.isSafeInteger(count)||count>10000)throw Error('Up to 10,000 samples per sequence; choose a shorter interval.');
    // Endpoints resize the data interval. Surviving samples keep their indices;
    // newly added samples repeat the nearest boundary value, as chosen by Lucy.
    return Array.from({length:count},(_,i)=>{
      const offset=start+i-originalStart;
      return offset<0?values[0]:offset>=values.length?values[values.length-1]:values[offset];
    });
  }
  const nonzeroIndices=(values,start)=>values.flatMap((value,i)=>value===0?[]:[start+i]);
  function shiftedCopy(a,as,b,bs,j){
    const scale=sample(a,as,j);
    return {j,scale,start:j+bs,values:b.map(value=>scale*value)};
  }
  function sumCopies(a,as,b,bs,count){
    if(!Number.isInteger(count)||count<0)throw Error('Copy count must be a nonnegative integer.');
    const indices=nonzeroIndices(a,as).slice(0,count),selected=new Set(indices);
    return linear(a.map((value,i)=>selected.has(as+i)?value:0),as,b,bs);
  }
  const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){const r=a%b;a=b;b=r;}return a;};
  function grid(values,start,end){
    if(![start,end].every(Number.isSafeInteger))throw Error('Start and End must be safely representable integers.');
    if(end<start)throw Error('End must be greater than or equal to Start.');
    if(!values.length||values.length>10000)throw Error('Use 1–10,000 samples per sequence.');
    if((values.length===1)!==(start===end))throw Error('One sample requires Start = End; a nonzero interval requires at least two samples.');
    const den=BigInt(Math.max(1,values.length-1)),span=BigInt(end)-BigInt(start);
    const numerators=values.map((_,i)=>BigInt(start)*den+BigInt(i)*span);
    const positions=numerators.map((n,i)=>i===0?start:i===values.length-1?end:Number(n)/Number(den));
    if(positions.some((p,i)=>i&&p<=positions[i-1]))throw Error('These coordinates are too large for the requested spacing. Use a smaller coordinate or fewer samples.');
    const index=new Map(positions.map((p,i)=>[p,i]));
    return {values,start,end,den,span,numerators,positions,index,step:Number(span)/Number(den)};
  }
  function resampleGrid(old,start,end,count){
    const next=grid(Array(count).fill(0),start,end);
    // Interpolate inside the old interval; repeat its boundary values outside.
    next.values=next.numerators.map(n=>{
      const offset=n-BigInt(old.start)*next.den;
      if(offset<=0n)return old.values[0];
      if(offset>=old.span*next.den)return old.values[old.values.length-1];
      const numerator=offset*old.den,denominator=next.den*old.span,i=Number(numerator/denominator),remainder=numerator%denominator;
      if(remainder===0n)return old.values[i];
      const fraction=Number(remainder)/Number(denominator);
      return Number((old.values[i]*(1-fraction)+old.values[i+1]*fraction).toPrecision(14));
    });
    return next;
  }
  function convolveGrids(a,b){
    const den=a.den/gcd(a.den,b.den)*b.den;
    const at=a.numerators.map(n=>n*(den/a.den)),bt=b.numerators.map(n=>n*(den/b.den));
    const sameSpacing=a.span*b.den===b.span*a.den;
    const singleton=a.values.length===1||b.values.length===1;
    if(!sameSpacing&&!singleton&&a.values.length*b.values.length>2000000)throw Error('Unequal spacings allow up to 2 million listed sample pairs. Use fewer samples.');
    if(a.values.filter(v=>v!==0).length*b.values.filter(v=>v!==0).length>2000000)throw Error('Use at most 2 million nonzero sample pairs.');
    let ticks;
    if(sameSpacing||singleton){
      const step=a.span===0n?b.span*(den/b.den):a.span*(den/a.den);
      ticks=Array.from({length:a.values.length+b.values.length-1},(_,i)=>at[0]+bt[0]+BigInt(i)*step);
    }else{
      const distinct=new Set();
      for(const x of at)for(const y of bt){distinct.add(x+y);if(distinct.size>200000)throw Error('Use at most 200,000 distinct output positions in this interactive lesson.');}
      ticks=[...distinct].sort((x,y)=>x<y?-1:x>y?1:0);
    }
    const output=ticks.map((t,i)=>({k:i===0?a.start+b.start:i===ticks.length-1?a.end+b.end:Number(t)/Number(den),value:0}));
    if(output.some((p,i)=>i&&p.k<=output[i-1].k))throw Error('Output coordinates are too large for this spacing. Use smaller coordinates or fewer samples.');
    if(![a.start+b.start,a.end+b.end].every(Number.isSafeInteger))throw Error('Summed output endpoints must be safely representable integers.');
    const byTick=new Map(ticks.map((t,i)=>[t,i])),byPosition=new Map(output.map((t,i)=>[t.k,i])),aIndex=new Map(at.map((t,i)=>[t,i])),bIndex=new Map(bt.map((t,i)=>[t,i]));
    const nonzeroB=b.values.flatMap((value,l)=>value===0?[]:[{value,l}]);
    function row(i){return b.values.map((value,l)=>({k:output[byTick.get(at[i]+bt[l])].k,value:a.values[i]*value,index:byTick.get(at[i]+bt[l])}));}
    function addRow(i,partial){let peak=0;for(const t of nonzeroB){const n=byTick.get(at[i]+bt[t.l]);partial[n]+=a.values[i]*t.value;peak=Math.max(peak,Math.abs(partial[n]));}return peak;}
    const values=output.map(()=>0);a.values.forEach((value,i)=>{if(value!==0)addRow(i,values);});output.forEach((t,i)=>{t.value=values[i];});
    function termsAt(k){
      const ordinal=byPosition.get(k),tick=ordinal===undefined?null:ticks[ordinal];
      return a.values.map((value,i)=>{
        const l=tick===null?undefined:bIndex.get(tick-at[i]),other=l===undefined?0:b.values[l];
        return {i,j:a.positions[i],otherIndex:l===undefined?k-a.positions[i]:b.positions[l],a:value,b:other,product:value*other};
      });
    }
    const latticeNumerator=gcd(a.span*(den/a.den),b.span*(den/b.den));
    const step=latticeNumerator===0n?1:Number(latticeNumerator)/Number(den);
    function shiftedPositions(k){
      const ordinal=byPosition.get(k);if(ordinal===undefined)return b.positions.map(y=>k-y);
      return bt.map(t=>{const numerator=ticks[ordinal]-t,i=aIndex.get(numerator);return i===undefined?Number(numerator)/Number(den):a.positions[i];});
    }
    return {output,sameSpacing: sameSpacing||singleton,step,row,addRow,shiftedPositions,terms:termsAt,index:k=>byPosition.get(k),value:k=>output[byPosition.get(k)]?.value??0};
  }
  function commonGrid(a,b){
    // The editable grids describe piecewise-linear signals on their finite
    // intervals. Sample both on one endpoint-compatible working spacing before
    // applying the ordinary, unweighted discrete convolution sum. This is not
    // an integral approximation: no quadrature-spacing multiplier is applied.
    // Existing equal-spacing sequences and point impulses remain unchanged.
    const spans=gcd(a.span,b.span);
    let subdivisions=1n;
    if(spans!==0n){
      for(const source of [a,b])if(source.span!==0n){
        const numerator=spans*source.den;
        const needed=(numerator+source.span-1n)/source.span;
        if(needed>subdivisions)subdivisions=needed;
      }
    }
    const counts=[a,b].map(source=>spans===0n?1n:source.span/spans*subdivisions+1n);
    if(counts.some(count=>count>10000n))throw Error(`The shared sampling grid needs ${counts[0]} input and ${counts[1]} kernel samples. Use shorter intervals or fewer source samples (up to 10,000 working samples per sequence).`);
    const working=[a,b].map((source,i)=>Number(counts[i])===source.values.length?source:resampleGrid(source,source.start,source.end,Number(counts[i])));
    const [ag,bg]=working,conv=convolveGrids(ag,bg);
    return {ag,bg,conv,step:conv.step,sourceCounts:{a:a.values.length,b:b.values.length},workingCounts:{a:ag.values.length,b:bg.values.length},resampled:ag!==a||bg!==b};
  }
  const api={sample,support,terms,linear,parse,resizeInterval,nonzeroIndices,shiftedCopy,sumCopies,grid,resampleGrid,convolveGrids,commonGrid};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ConvolutionMath=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this);
