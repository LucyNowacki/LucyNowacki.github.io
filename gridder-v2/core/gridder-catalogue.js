/* Shared finite teaching catalogue; classifications overlap, with named scalar branches/components. */
(function(root){
 'use strict';
 const base=typeof module!=='undefined'&&module.exports?require('./math.js'):root.derivativeMath;
 const raw=String.raw,pi=Math.PI,ln2=Math.LN2;
 const curves={...base.curves};
 const point=(x,kind,exact)=>({x,kind,...(exact?{exact}:{})});
 function add(key,c){
  const [lo,hi]=c.domain,values=[lo,hi,...(c.points||[]).map(p=>p.x)].map(c.value);
  curves[key]={label:c.label,tex:c.tex,derivativeTex:c.first,secondTex:c.secondTex,value:c.value,derivative:c.derivative,second:c.second,
   range:[lo,hi,Math.min(...values)-.5,Math.max(...values)+.5],position:[lo,hi,.01],initial:c.initial??(lo+hi)/2,points:c.points||[],
   domain:c.domain,secondCritical:c.secondCritical||[],inverse:c.inverse,
   lesson:{first:raw`f'(x)=${c.first}`,second:raw`f''(x)=${c.secondTex}`,rule:c.rule,secondRule:c.secondRule||c.rule},
   context:c.context||'',note:c.note||'',...c};
 }
 const inverse=(source,tex,value,steps,sourceTex)=>({source,tex,value,steps,sourceTex:sourceTex||`${source[0]}\\le t\\le ${source[1]}`});
 const powerRule='Use the power rule: d(xⁿ)/dx = n xⁿ⁻¹. Differentiate once more with the same rule.';
 add('constant',{label:'Constant · 2',tex:'2',domain:[-3,3],value:()=>2,first:'0',derivative:()=>0,secondTex:'0',second:()=>0,inverse:null,initial:0,rule:'A constant does not change: both derivatives are zero.',note:'Every tangent is flat. There are no isolated turning points. A constant function is not one-to-one, so it has no inverse-function level.'});
 add('linear',{label:'Linear · 2x + 1',tex:'2x+1',domain:[-3,3],value:x=>2*x+1,first:'2',derivative:()=>2,secondTex:'0',second:()=>0,rule:'The derivative of mx + b is m; differentiating that constant gives zero.',inverse:inverse([-3,3],'\\frac{x-1}{2}',x=>(x-1)/2,'Swap x and y: x = 2y + 1. Subtract 1 and divide by 2.')});
 add('cube',{label:'Cubic power · x³',tex:'x^3',domain:[-2,2],value:x=>x**3,first:'3x^2',derivative:x=>3*x*x,secondTex:'6x',second:x=>6*x,points:[point(0,'inflection','0')],rule:powerRule,inverse:inverse([-2,2],'\\sqrt[3]{x}',Math.cbrt,'Swap the coordinates: x = y³, then take the real cube root.')});
 add('reciprocal',{label:'Reciprocal · 1/x',tex:'\\frac1x',domain:[.5,3.5],value:x=>1/x,first:'-\\frac1{x^2}',derivative:x=>-1/(x*x),secondTex:'\\frac2{x^3}',second:x=>2/x**3,rule:'Write 1/x as x⁻¹ and use the power rule twice.',note:'The full function excludes x = 0. This board uses its positive branch, 0.5 ≤ x ≤ 3.5.',inverse:inverse([.5,3.5],'\\frac1x',x=>1/x,'Swap x and y: x = 1/y, so y = 1/x. This function happens to equal its inverse on the corresponding intervals.')});
 function power(key,label,tex,p,inverseTex,inverseValue){
  const [coefficient,exponent,secondCoefficient,secondExponent]=p===.5?[raw`\frac12`,'-1/2',raw`-\frac14`,'-3/2']:p===1/3?[raw`\frac13`,'-2/3',raw`-\frac29`,'-5/3']:p===1.5?[raw`\frac32`,'1/2',raw`\frac34`,'-1/2']:[raw`\frac23`,'-1/3',raw`-\frac29`,'-4/3'];
  const note=p===.5?'The full square-root domain is x ≥ 0; its derivative is not finite at zero.':p===1/3?'The real cube root accepts negative inputs too; its derivative is not finite at zero.':p===1.5?'This real power uses x ≥ 0. Its first derivative exists at zero, but its second derivative is not finite there.':'Interpret x^(2/3) as the square of the real cube root, including negative inputs. Its derivative is not finite at zero.';
  add(key,{label,tex,domain:[.25,4],value:p===1/3?Math.cbrt:p===2/3?x=>Math.cbrt(x)**2:x=>x**p,first:`${coefficient}x^{${exponent}}`,derivative:p===1/3?x=>1/(3*Math.cbrt(x)**2):p===2/3?x=>2/(3*Math.cbrt(x)):x=>p*x**(p-1),secondTex:`${secondCoefficient}x^{${secondExponent}}`,second:p===1/3?x=>-2/(9*Math.cbrt(x)**5):p===2/3?x=>-2/(9*Math.cbrt(x)**4):x=>p*(p-1)*x**(p-2),rule:powerRule,note:note+' This board uses 0.25 ≤ x ≤ 4 so both derivatives remain finite.',inverse:inverse([.25,4],inverseTex,inverseValue,'Swap coordinates and raise both sides to the reciprocal power, on the positive branch.')});
 }
 power('square_root','Square root · √x','\\sqrt{x}',.5,'x^2',x=>x*x);
 power('cube_root','Cube root · ∛x','\\sqrt[3]{x}',1/3,'x^3',x=>x**3);
 power('power_three_halves','Fractional power · x^(3/2)','x^{3/2}',1.5,'x^{2/3}',x=>x**(2/3));
 power('power_two_thirds','Fractional power · x^(2/3)','x^{2/3}',2/3,'x^{3/2}',x=>x**1.5);
 add('exponential',{label:'Natural exponential · exp(x)',tex:'e^x',domain:[-2,2],value:Math.exp,first:'e^x',derivative:Math.exp,secondTex:'e^x',second:Math.exp,rule:'The derivative of eˣ is eˣ. Differentiating again gives the same function.',inverse:inverse([-2,2],'\\ln x',Math.log,'Swap coordinates: x = eʸ. Take natural logarithms to obtain y = ln(x).')});
 add('exponential_two',{label:'Base-two exponential · 2ˣ',tex:'2^x',domain:[-2,2],value:x=>2**x,first:'(\\ln2)2^x',derivative:x=>ln2*2**x,secondTex:'(\\ln2)^2 2^x',second:x=>ln2*ln2*2**x,rule:'Write 2ˣ = exp(x ln 2). The chain rule supplies a factor ln 2 on each differentiation.',inverse:inverse([-2,2],'\\frac{\\ln x}{\\ln2}',x=>Math.log(x)/ln2,'Swap coordinates: x = 2ʸ. Take logarithms and divide by ln 2.')});
 add('log_two',{label:'Base-two logarithm · log₂(x)',tex:'\\log_2 x',domain:[.5,4.5],value:x=>Math.log(x)/ln2,first:'\\frac1{x\\ln2}',derivative:x=>1/(x*ln2),secondTex:'-\\frac1{x^2\\ln2}',second:x=>-1/(x*x*ln2),rule:'Use log₂(x) = ln(x)/ln(2), then differentiate 1/x.',note:'A logarithm requires x > 0; this board uses 0.5 ≤ x ≤ 4.5.',inverse:inverse([.5,4.5],'2^x',x=>2**x,'Swap coordinates in x = log₂(y), then exponentiate with base 2.')});
 add('cosine',{label:'Cosine · cos(x)',tex:'\\cos x',domain:[-4.5,4.5],value:Math.cos,first:'-\\sin x',derivative:x=>-Math.sin(x),secondTex:'-\\cos x',second:x=>-Math.cos(x),points:[point(-pi,'min','-\\pi'),point(0,'max','0'),point(pi,'min','\\pi'),point(-pi/2,'inflection','-\\pi/2'),point(pi/2,'inflection','\\pi/2')],secondCritical:[-pi,0,pi],rule:'Angles are in radians. The derivative of cos(x) is −sin(x); differentiating again gives −cos(x).',inverse:inverse([0,pi],'\\arccos x',Math.acos,'Cosine decreases one-to-one on 0 ≤ t ≤ π. Its inverse is arccos(x), the angle in that interval.','0\\le t\\le\\pi')});
 add('tangent',{label:'Tangent · tan(x)',tex:'\\tan x',domain:[-1.1,1.1],value:Math.tan,first:'\\sec^2 x',derivative:x=>1/Math.cos(x)**2,secondTex:'2\\tan x\\sec^2 x',second:x=>2*Math.tan(x)/Math.cos(x)**2,points:[point(0,'inflection','0')],rule:'In radians, d(tan x)/dx = sec²x. Its derivative is 2 tan(x) sec²(x).',note:'The board lies inside (−π/2, π/2), avoiding tangent’s poles.',inverse:inverse([-1.1,1.1],'\\arctan x',Math.atan,'Restrict tangent between its nearest poles. Swap the coordinates and apply arctan, whose output is in (−π/2, π/2).')});
 add('arcsine',{label:'Arcsine · arcsin(x)',tex:'\\arcsin x',domain:[-.9,.9],value:Math.asin,first:'\\frac1{\\sqrt{1-x^2}}',derivative:x=>1/Math.sqrt(1-x*x),secondTex:'\\frac{x}{(1-x^2)^{3/2}}',second:x=>x/(1-x*x)**1.5,points:[point(0,'inflection','0')],rule:'Differentiate sin(y) = x implicitly: cos(y)y′ = 1. On the principal branch cos(y) = √(1 − x²). Differentiate using the chain rule.',note:'The full domain is [−1,1]. This board avoids ±1, where the finite-gradient derivative fails.',inverse:inverse([-.9,.9],'\\sin x',Math.sin,'Arcsin takes values in [−π/2, π/2]. Swapping its coordinates gives sine restricted to the corresponding interval.')});
 add('arccosine',{label:'Arccosine · arccos(x)',tex:'\\arccos x',domain:[-.9,.9],value:Math.acos,first:'-\\frac1{\\sqrt{1-x^2}}',derivative:x=>-1/Math.sqrt(1-x*x),secondTex:'-\\frac{x}{(1-x^2)^{3/2}}',second:x=>-x/(1-x*x)**1.5,points:[point(0,'inflection','0')],rule:'Differentiate cos(y) = x implicitly: −sin(y)y′ = 1. On 0 < y < π, sin(y) = √(1 − x²). Differentiate once more.',note:'The full domain is [−1,1]; this board avoids the infinite-gradient endpoints.',inverse:inverse([-.9,.9],'\\cos x',Math.cos,'Arccos takes values in [0,π]. Swap coordinates to get cosine on the corresponding angle interval.')});
 add('arctangent',{label:'Arctangent · arctan(x)',tex:'\\arctan x',domain:[-3,3],value:Math.atan,first:'\\frac1{1+x^2}',derivative:x=>1/(1+x*x),secondTex:'-\\frac{2x}{(1+x^2)^2}',second:x=>-2*x/(1+x*x)**2,secondCritical:[-1/Math.sqrt(3),1/Math.sqrt(3)],points:[point(0,'inflection','0')],rule:'Differentiate tan(y) = x: sec²(y)y′ = 1. Use sec²(y) = 1 + tan²(y), then differentiate 1/(1 + x²).',inverse:inverse([-3,3],'\\tan x',Math.tan,'Arctan has output between −π/2 and π/2. Its inverse is tangent on the corresponding angle interval.')});
 add('sinh',{label:'Hyperbolic sine · sinh(x)',tex:'\\sinh x',domain:[-2,2],value:Math.sinh,first:'\\cosh x',derivative:Math.cosh,secondTex:'\\sinh x',second:Math.sinh,points:[point(0,'inflection','0')],rule:'Use sinh(x) = (eˣ − e⁻ˣ)/2 and cosh(x) = (eˣ + e⁻ˣ)/2. Differentiation swaps sinh and cosh.',inverse:inverse([-2,2],'\\ln(x+\\sqrt{x^2+1})',Math.asinh,'Swap coordinates and solve the exponential quadratic to obtain the inverse hyperbolic sine.')});
 add('cosh',{label:'Hyperbolic cosine · cosh(x)',tex:'\\cosh x',domain:[-2,2],value:Math.cosh,first:'\\sinh x',derivative:Math.sinh,secondTex:'\\cosh x',second:Math.cosh,secondCritical:[0],points:[point(0,'min','0')],rule:'Use cosh(x) = (eˣ + e⁻ˣ)/2. Its first derivative is sinh(x), and its second is cosh(x).',inverse:inverse([0,2],'\\ln(x+\\sqrt{x^2-1})',Math.acosh,'Cosh is one-to-one on its nonnegative branch. Choose the positive root when solving its exponential quadratic.')});
 add('tanh',{label:'Hyperbolic tangent · tanh(x)',tex:'\\tanh x',domain:[-3,3],value:Math.tanh,first:'\\operatorname{sech}^2 x',derivative:x=>1/Math.cosh(x)**2,secondTex:'-2\\tanh x\\operatorname{sech}^2 x',second:x=>-2*Math.tanh(x)/Math.cosh(x)**2,secondCritical:[-Math.atanh(1/Math.sqrt(3)),Math.atanh(1/Math.sqrt(3))],points:[point(0,'inflection','0')],rule:'Use tanh(x) = sinh(x)/cosh(x). The quotient rule gives sech²(x); its derivative is −2 tanh(x) sech²(x).',inverse:inverse([-3,3],'\\frac12\\ln\\frac{1+x}{1-x}',Math.atanh,'Swap coordinates, express tanh with exponentials, and solve for e²ʸ. The inverse inputs lie in (−1,1).')});
 add('piecewise_cubic',{label:'Joined cubics · x³ / 2x³',tex:'\\begin{cases}x^3&x<0\\\\2x^3&x\\ge0\\end{cases}',domain:[-2,2],value:x=>x<0?x**3:2*x**3,first:'\\begin{cases}3x^2&x<0\\\\6x^2&x\\ge0\\end{cases}',derivative:x=>x<0?3*x*x:6*x*x,secondTex:'\\begin{cases}6x&x<0\\\\12x&x\\ge0\\end{cases}',second:x=>x<0?6*x:12*x,points:[point(0,'inflection','0')],rule:'Differentiate each branch separately. At x = 0, the value and first two derivatives agree from both sides, so the join is twice differentiable.',inverse:inverse([-2,2],'\\begin{cases}\\sqrt[3]{x}&x<0\\\\\\sqrt[3]{x/2}&x\\ge0\\end{cases}',x=>Math.cbrt(x<0?x:x/2),'Invert each output branch. Negative outputs use the cube root of x; nonnegative outputs use the cube root of x/2.')});
 add('piecewise_valley',{label:'Joined valley · x⁴ / x³',tex:'\\begin{cases}x^4&x<0\\\\x^3&x\\ge0\\end{cases}',domain:[-1.5,2],value:x=>x<0?x**4:x**3,first:'\\begin{cases}4x^3&x<0\\\\3x^2&x\\ge0\\end{cases}',derivative:x=>x<0?4*x**3:3*x*x,secondTex:'\\begin{cases}12x^2&x<0\\\\6x&x\\ge0\\end{cases}',second:x=>x<0?12*x*x:6*x,secondCritical:[0],points:[point(0,'min','0')],initial:.5,rule:'Differentiate each branch. At zero both first and second derivatives agree and equal zero. A minimum still exists: f′ is negative on the left and positive on the right.',inverse:inverse([0,2],'\\sqrt[3]{x}',Math.cbrt,'Choose the nonnegative cubic branch, then take the cube root. The whole joined valley is not one-to-one.')});
 add('log_composite',{label:'Logarithmic composite · ln(1 + x²)',tex:'\\ln(1+x^2)',domain:[-3,3],value:x=>Math.log1p(x*x),first:'\\frac{2x}{1+x^2}',derivative:x=>2*x/(1+x*x),secondTex:'\\frac{2(1-x^2)}{(1+x^2)^2}',second:x=>2*(1-x*x)/(1+x*x)**2,secondCritical:[-Math.sqrt(3),0,Math.sqrt(3)],points:[point(0,'min','0'),point(-1,'inflection','-1'),point(1,'inflection','1')],initial:.5,rule:'Apply the chain rule to ln(u) with u = 1 + x²: u′/u. Differentiate the resulting quotient once more.',inverse:inverse([0,3],'\\sqrt{e^x-1}',x=>Math.sqrt(Math.max(0,Math.expm1(x))),'On x ≥ 0, swap coordinates, exponentiate, subtract 1, and choose the nonnegative square root.')});
 const shoulder=Math.asin((Math.sqrt(5)-1)/2);
 add('exp_sine',{label:'Exponential composite · exp(sin x)',tex:'e^{\\sin x}',domain:[-pi,pi],value:x=>Math.exp(Math.sin(x)),first:'e^{\\sin x}\\cos x',derivative:x=>Math.exp(Math.sin(x))*Math.cos(x),secondTex:'e^{\\sin x}(\\cos^2 x-\\sin x)',second:x=>Math.exp(Math.sin(x))*(Math.cos(x)**2-Math.sin(x)),secondCritical:[-pi,-pi/2,0,pi/2,pi],points:[point(-pi/2,'min','-\\pi/2'),point(pi/2,'max','\\pi/2'),point(shoulder,'inflection','\\arcsin((\\sqrt5-1)/2)'),point(pi-shoulder,'inflection','\\pi-\\arcsin((\\sqrt5-1)/2)')],rule:'Apply the chain rule to exp(sin x), then the product rule. The second derivative is exp(sin x)(cos²x − sin x).',inverse:inverse([-pi/2,pi/2],'\\arcsin(\\ln x)',x=>Math.asin(Math.max(-1,Math.min(1,Math.log(x)))),'Choose −π/2 ≤ t ≤ π/2. Take ln of the output, then apply the principal arcsine.','-\\pi/2\\le t\\le\\pi/2')});
 for(const sign of [1,-1])add(sign===1?'circle_upper':'circle_lower',{label:`Circle · ${sign===1?'upper':'lower'} semicircle`,tex:`${sign===1?'':'-'}\\sqrt{4-x^2}`,domain:[-1.8,1.8],value:x=>sign*Math.sqrt(4-x*x),first:`${sign===1?'-':''}\\frac{x}{\\sqrt{4-x^2}}`,derivative:x=>-sign*x/Math.sqrt(4-x*x),secondTex:`${sign===1?'-':''}\\frac4{(4-x^2)^{3/2}}`,second:x=>-sign*4/(4-x*x)**1.5,secondCritical:[0],points:[point(0,sign===1?'max':'min','0')],initial:.5,rule:'Differentiate x² + y² = 4 implicitly: 2x + 2yy′ = 0, so y′ = −x/y. Choose the indicated semicircle and differentiate again.',context:raw`Full implicit equation: \(x^2+y^2=4\). The game uses the ${sign===1?'upper':'lower'} branch \(y=${sign===1?'':'-'}\sqrt{4-x^2}\).`,note:'The visible window avoids x = ±2, where the semicircle has vertical tangents.',inverse:inverse([0,1.8],'\\sqrt{4-x^2}',x=>Math.sqrt(Math.max(0,4-x*x)),'Choose the right-hand half of the indicated semicircle. Swap x and y in x² + y² = 4, and choose the nonnegative output root.')});
 function component(key,source,label,context){const c=curves[source];curves[key]={...c,label,lesson:c.lesson||{first:raw`f'(x)=${c.derivativeTex.replace(/\\[A-Za-z]+|a/g,t=>t==='a'?'x':t)}`,second:raw`f''(x)=${c.secondTex.replace(/\\[A-Za-z]+|a/g,t=>t==='a'?'x':t)}`,rule:source==='quadratic'?powerRule:'Use the sine and cosine differentiation rules in radians.',secondRule:source==='quadratic'?'The derivative of 2x is 2.':'The derivative of cos(x) is −sin(x).'},context,inverse:c.inverse|| (source==='quadratic'?inverse([0,3.4],'\\sqrt{x}',x=>Math.sqrt(x),'Choose the nonnegative component branch, then take the square root.'):inverse([-pi/2,pi/2],'\\arcsin x',Math.asin,'Choose the principal one-to-one sine component branch.','-\\pi/2\\le t\\le\\pi/2')),secondCritical:source==='quadratic'?[]:[-pi/2,pi/2]};}
 component('vector_parabola','quadratic','Vector · (t, t²), second component',raw`\(\mathbf r(t)=(t,t^2)\), \(\mathbf r'(t)=(1,2t)\), \(\mathbf r''(t)=(0,2)\). Here the scalar game plots the second component against t (shown as x). Derivative, inverse and normal levels concern that component, rather than the whole vector.`);
 component('vector_wave','sine','Vector · (cos t, sin t), second component',raw`\(\mathbf r(t)=(\cos t,\sin t)\), \(\mathbf r'(t)=(-\sin t,\cos t)\), \(\mathbf r''(t)=(-\cos t,-\sin t)\). Here the scalar game plots the second component against t (shown as x). This graph is not the parametric circle; derivative, inverse and normal levels concern the component.`);
 for(const key of ['vector_parabola','vector_wave']){
  curves[key].derivativeTex=curves[key].lesson.first.replace(/^f'\(x\)=/,'');
  curves[key].secondTex=curves[key].lesson.second.replace(/^f''\(x\)=/,'');
 }
 for(const key of ['quadratic','quartic','gaussian','cosine','cosh'])curves[key]={...curves[key],parity:'even'};
 for(const key of ['cube','cubic','rational','sine','sinh','tanh'])curves[key]={...curves[key],parity:'odd'};
 for(const key of ['sine','cosine','exp_sine'])curves[key]={...curves[key],period:2*pi};
 curves.tangent={...curves.tangent,period:pi};
 // Expanded examples: polynomial algebra supplies critical points by recursively
 // partitioning at derivative roots. Bisection is confined to monotone intervals;
 // coordinates are numerical approximations, not symbolic exact answers.
 const trim=p=>{p=p.slice();while(p.length>1&&Math.abs(p[p.length-1])<1e-12)p.pop();return p;};
 const plus=(a,b)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+(b[i]||0)));
 const scale=(a,k)=>trim(a.map(v=>v*k));
 const mul=(a,b)=>{const out=Array(a.length+b.length-1).fill(0);a.forEach((v,i)=>b.forEach((w,j)=>out[i+j]+=v*w));return trim(out);};
 const diff=a=>trim(a.length<2?[0]:a.slice(1).map((v,i)=>v*(i+1)));
 const evalP=(a,x)=>a.reduceRight((v,c)=>v*x+c,0);
 const fmtP=a=>{let out='';for(let i=a.length-1;i>=0;i--){const v=a[i];if(!v)continue;const abs=Math.abs(v),s=(out?(v<0?'-':'+'):(v<0?'-':''));out+=s+(i===0||abs!==1?String(abs):'')+(i?'x':'')+(i>1?`^{${i}}`:'');}return out||'0';};
 function polyRoots(poly,lo,hi){
  poly=trim(poly);const n=poly.length-1;if(!n)return [];
  if(n===1){const r=-poly[0]/poly[1];return r>lo+1e-10&&r<hi-1e-10?[r]:[];}
  const cuts=[lo,...polyRoots(diff(poly),lo,hi),hi],out=[];
  const tolerance=1e-9*Math.max(1,...poly.map(Math.abs))*Math.max(1,Math.abs(lo),Math.abs(hi))**n;
  for(let i=1;i<cuts.length-1;i++)if(Math.abs(evalP(poly,cuts[i]))<=tolerance)out.push(cuts[i]);
  for(let i=0;i<cuts.length-1;i++){
   let a=cuts[i],b=cuts[i+1],fa=evalP(poly,a),fb=evalP(poly,b);
   if(Math.abs(fa)<=tolerance||Math.abs(fb)<=tolerance||fa*fb>=0)continue;
   for(let k=0;k<65;k++){const m=(a+b)/2,fm=evalP(poly,m);if(fa*fm<=0){b=m;fb=fm;}else{a=m;fa=fm;}}
   out.push((a+b)/2);
  }
  return out.sort((a,b)=>a-b).filter((v,i,all)=>!i||Math.abs(v-all[i-1])>1e-7);
 }
 function classified(poly1,poly2,domain){
  const [lo,hi]=domain,spacing=(hi-lo)*1e-5,points=[];
  for(const x of polyRoots(poly1,lo,hi)){const l=evalP(poly1,x-spacing),r=evalP(poly1,x+spacing);if(l*r<0)points.push({x,kind:l<r?'min':'max',approximate:true});}
  for(const x of polyRoots(poly2,lo,hi)){const l=evalP(poly2,x-spacing),r=evalP(poly2,x+spacing);if(l*r<0)points.push({x,kind:'inflection',approximate:true});}
  return points.sort((a,b)=>a.x-b.x);
 }
 const expanded={polynomial:[],rational:[],exponential:[],logarithmic:[],trigonometric:[],hyperbolic:[]};
 function polynomialExample(id,p){const p1=diff(p),p2=diff(p1),p3=diff(p2),domain=[-1.7,1.7];
  add(id,{label:`Polynomial · ${fmtP(p)}`,criticalCoordinates:'numerical',tex:fmtP(p),domain,value:x=>evalP(p,x),first:fmtP(p1),derivative:x=>evalP(p1,x),secondTex:fmtP(p2),second:x=>evalP(p2,x),points:classified(p1,p2,domain),secondCritical:polyRoots(p3,...domain),inverse:null,initial:.4,rule:'Differentiate each polynomial term by the power rule. Critical coordinates shown are numerical approximations.'});expanded.polynomial.push(id);
 }
 const polynomialSpecs=[['poly_fifth',[0,0,0,0,0,1]],['poly_sixth',[0,0,0,0,0,0,1]],['poly_seventh',[0,0,0,0,0,0,0,1]],['poly_eighth',[0,0,0,0,0,0,0,0,1]],['poly_cubic_rise',[0,1,0,1]],['poly_cubic_turn',[0,-1,0,1]],['poly_double_well',[0,0,-1,0,1]],['poly_quartic_bowl',[0,0,1,0,1]],['poly_fifth_turn',[0,-1,0,0,0,1]],['poly_fifth_rise',[0,1,0,0,0,1]],['poly_asymmetric_valley',[0,0,0,1,1]],['poly_fifth_three_turn',[0,0,0,-1,0,1]],['poly_flat_s',[0,0,0,1,0,1]],['poly_sixth_well',[0,0,-1,0,0,0,1]],['poly_sixth_shoulder',[0,0,0,0,-1,0,1]],['poly_quartic_tilt',[0,-1,0,0,1]],['poly_cubic_asymmetric',[0,0,-1,1]],['poly_quintic_asymmetric',[0,0,-1,0,0,1]]];
 for(const [id,p] of polynomialSpecs)polynomialExample(id,p);
 function quotientExample(id,p,q){
  const domain=[-2,2],p1=diff(p),q1=diff(q),n1=plus(mul(p1,q),scale(mul(p,q1),-1));
  const n2=plus(mul(diff(n1),q),scale(mul(n1,q1),-2)),n3=plus(mul(diff(n2),q),scale(mul(n2,q1),-3));
  const pt=fmtP(p),qt=fmtP(q),t1=fmtP(n1),t2=fmtP(n2),val=x=>evalP(p,x)/evalP(q,x);
  add(id,{label:`Rational · (${pt})/(${qt})`,criticalCoordinates:'numerical',tex:`\\frac{${pt}}{${qt}}`,domain,value:val,first:`\\frac{${t1}}{(${qt})^2}`,derivative:x=>evalP(n1,x)/evalP(q,x)**2,secondTex:`\\frac{${t2}}{(${qt})^3}`,second:x=>evalP(n2,x)/evalP(q,x)**3,points:classified(n1,n2,domain),secondCritical:polyRoots(n3,...domain),inverse:null,initial:.4,rule:'Use the quotient rule, then differentiate the resulting quotient. On this board the denominator is strictly positive; critical coordinates are numerical approximations.'});expanded.rational.push(id);
 }
 const q2=[1,0,1],q4=[1,0,0,0,1],q2sq=[1,0,2,0,1];
 const rationalSpecs=[['rat_hill',[1],q2],['rat_saturation',[0,0,1],q2],['rat_hill_squared',[1],q2sq],['rat_odd_squared',[0,1],q2sq],['rat_peak_pair',[0,0,1],q2sq],['rat_cubic_ratio',[0,0,0,1],q2],['rat_tilted_hill',[1,1],q2],['rat_quartic_hill',[1],q4],['rat_quartic_odd',[0,1],q4],['rat_quartic_pair',[0,0,1],q4],['rat_mixed_even',[1,0,1],q4],['rat_skew_quartic',[1,1],q4]];
 for(const [id,p,q] of rationalSpecs)quotientExample(id,p,q);
 function exponentialExample(id,p){
  const domain=[-1.5,1.5],p1=diff(p),p2=diff(p1),p3=diff(p2),n2=plus(p2,mul(p1,p1)),n3=plus(plus(p3,scale(mul(p1,p2),3)),mul(mul(p1,p1),p1)),pt=fmtP(p),exp=x=>Math.exp(evalP(p,x));
  add(id,{label:`Exponential composite · exp(${pt})`,criticalCoordinates:'numerical',tex:`e^{${pt}}`,domain,value:exp,first:`(${fmtP(p1)})e^{${pt}}`,derivative:x=>evalP(p1,x)*exp(x),secondTex:`(${fmtP(n2)})e^{${pt}}`,second:x=>evalP(n2,x)*exp(x),points:classified(p1,n2,domain),secondCritical:polyRoots(n3,...domain),inverse:null,initial:.4,rule:'Apply the chain and product rules to exp(g(x)). Critical coordinates are numerical approximations.'});expanded.exponential.push(id);
 }
 const exponentialSpecs=[['exp_parabola',[0,0,1]],['exp_negative_quartic',[0,0,0,0,-1]],['exp_cubic',[0,0,0,1]],['exp_quartic',[0,0,0,0,1]],['exp_cubic_minus_x',[0,-1,0,1]],['exp_well',[0,0,-1,0,1]],['exp_quartic_bowl',[0,0,1,0,1]],['exp_cubic_rise',[0,1,0,1]]];
 for(const [id,p] of exponentialSpecs)exponentialExample(id,p);
 function logarithmExample(id,p){
  const domain=[-1.5,1.5],p1=diff(p),p2=diff(p1),p3=diff(p2),n2=plus(mul(p2,p),scale(mul(p1,p1),-1)),n3=plus(plus(mul(p3,mul(p,p)),scale(mul(mul(p2,p1),p),-3)),scale(mul(mul(p1,p1),p1),2)),pt=fmtP(p);
  add(id,{label:`Logarithmic composite · ln(${pt})`,criticalCoordinates:'numerical',tex:`\\ln(${pt})`,domain,value:x=>Math.log(evalP(p,x)),first:`\\frac{${fmtP(p1)}}{${pt}}`,derivative:x=>evalP(p1,x)/evalP(p,x),secondTex:`\\frac{${fmtP(n2)}}{(${pt})^2}`,second:x=>evalP(n2,x)/evalP(p,x)**2,points:classified(p1,n2,domain),secondCritical:polyRoots(n3,...domain),inverse:null,initial:.4,rule:'The logarithm argument is positive on this board. Apply the chain rule, followed by the quotient rule; critical coordinates are numerical approximations.'});expanded.logarithmic.push(id);
 }
 const logarithmSpecs=[['log_quartic',[1,0,0,0,1]],['log_sixth',[1,0,0,0,0,0,1]],['log_quartic_bowl',[1,0,1,0,1]],['log_cubic_positive',[2,1,0,1]],['log_shifted_bowl',[2,1,1]],['log_double_well',[2,0,-1,0,1]],['log_tilted_quartic',[2,1,0,0,1]],['log_even_sixth',[2,0,1,0,0,0,1]]];
 // log_cubic_positive needs a shorter positive interval than the common window;
 // use an everywhere-positive quartic instead.
 logarithmSpecs[3]=['log_skew_quartic',[2,1,0,1,1]];
 for(const [id,p] of logarithmSpecs)logarithmExample(id,p);
 for(const kind of ['sin','cos'])for(const frequency of [2,3]){
  const id=`wave_${kind}_${frequency}`,domain=[-pi,pi],sin=kind==='sin',value=x=>sin?Math.sin(frequency*x):Math.cos(frequency*x),derivative=x=>frequency*(sin?Math.cos(frequency*x):-Math.sin(frequency*x)),second=x=>-frequency*frequency*value(x),points=[],secondCritical=[];
  for(let k=-12;k<=12;k++){const x=k*pi/(2*frequency);if(x<=domain[0]+1e-9||x>=domain[1]-1e-9)continue;if(Math.abs(derivative(x))<1e-8){points.push({x,kind:second(x)<0?'max':'min',approximate:true});secondCritical.push(x);}if(Math.abs(second(x))<1e-8)points.push({x,kind:'inflection',approximate:true});}
  const tex=`\\${kind}(${frequency}x)`;add(id,{label:`Wave · ${kind}(${frequency}x)`,criticalCoordinates:'numerical',tex,domain,value,first:sin?`${frequency}\\cos(${frequency}x)`:`-${frequency}\\sin(${frequency}x)`,derivative,secondTex:`-${frequency*frequency}\\${kind}(${frequency}x)`,second,points,secondCritical,inverse:null,initial:.2,rule:'Use the trigonometric derivatives in radians and the chain rule; coordinates are numerical approximations.'});expanded.trigonometric.push(id);
 }
 // Two non-polynomial hyperbolic examples with explicit critical coordinates.
 add('hyperbolic_sech',{label:'Hyperbolic secant · sech(x)',criticalCoordinates:'numerical',tex:'\\operatorname{sech}x',domain:[-2,2],value:x=>1/Math.cosh(x),first:'-\\operatorname{sech}x\\tanh x',derivative:x=>-Math.tanh(x)/Math.cosh(x),secondTex:'\\operatorname{sech}x(2\\tanh^2x-1)',second:x=>(2*Math.tanh(x)**2-1)/Math.cosh(x),points:[{x:0,kind:'max'},...[-1,1].map(s=>({x:s*Math.atanh(1/Math.SQRT2),kind:'inflection',approximate:true}))],secondCritical:[-Math.atanh(Math.sqrt(5/6)),0,Math.atanh(Math.sqrt(5/6))],inverse:null,initial:.4,rule:'Differentiate sech(x) = 1/cosh(x), using the quotient and chain rules.'});expanded.hyperbolic.push('hyperbolic_sech');
 add('hyperbolic_asinh',{label:'Inverse hyperbolic sine · asinh(x)',criticalCoordinates:'numerical',tex:'\\operatorname{arsinh}x',domain:[-2,2],value:Math.asinh,first:'\\frac1{\\sqrt{1+x^2}}',derivative:x=>1/Math.sqrt(1+x*x),secondTex:'-\\frac{x}{(1+x^2)^{3/2}}',second:x=>-x/(1+x*x)**1.5,points:[point(0,'inflection','0')],secondCritical:[-1/Math.SQRT2,1/Math.SQRT2],inverse:null,initial:.4,rule:'Implicitly differentiate x = sinh(y), then use cosh²(y) = 1+sinh²(y).'});expanded.hyperbolic.push('hyperbolic_asinh');
 // Explicit finite depictions are exploration only: segments do not claim to
 // resolve an infinite graph. Closed dots are supplied separately where useful.
 const expandedStudy=[];
 const seg=(x1,y1,x2,y2,openStart=false,openEnd=false)=>({from:[x1,y1],to:[x2,y2],...(openStart?{openStart:true}:{}),...(openEnd?{openEnd:true}:{})});
 const dot=(x,y,label,extra={})=>({x,y,...(label?{label}:{}),...extra});
 function study(id,label,tex,domain,graph,meaning,applicability,displayNote){
  const coords=[...graph.points.map(p=>[p.x,p.y]),...graph.segments.flatMap(s=>[s.from,s.to])],ys=coords.map(p=>p[1]),lo=Math.min(...ys),hi=Math.max(...ys),margin=Math.max(.35,(hi-lo)*.12);
  curves[id]={label,tex,domain,range:[...domain,lo-margin,hi+margin],position:[...domain,.01],initial:(domain[0]+domain[1])/2,points:[],secondCritical:[],inverse:null,
   value:()=>NaN,derivative:()=>NaN,second:()=>NaN,derivativeTex:'\\text{exploration only}',secondTex:'\\text{exploration only}',
   study:{title:label,method:['Read the definition and identify the special points or intervals.','Compare the finite picture with the full mathematical function.',applicability],meaning,displayNote,graph:{...graph,finiteModel:true}},
   lesson:{first:'Exploration only',second:'Exploration only',rule:applicability,secondRule:applicability},note:displayNote};expandedStudy.push(id);
 }
 const two=[-2,2];
 study('study_absolute','Absolute value · |x|','|x|',two,{segments:[seg(-2,2,0,0),seg(0,0,2,2)],points:[dot(0,0,'corner')]},'The distance from x to zero is continuous, with a sharp corner at zero.','The derivative exists away from zero, but the one-sided slopes disagree at zero.','The two line segments show the function exactly on the displayed interval.');
 study('study_sign','Sign function · sgn(x)','\\operatorname{sgn}x',two,{segments:[seg(-2,-1,0,-1,false,true),seg(0,1,2,1,true,false)],points:[dot(0,0,'defined value')]},'The sign is −1 for negative x, 0 at x=0 and 1 for positive x.','The jump prevents a derivative at zero; away from zero the derivative is zero.','Open circles indicate values approached but not attained at the join.');
 study('study_heaviside','Unit step · H(x)','\\begin{cases}0&x<0\\\\1&x\\ge0\\end{cases}',two,{segments:[seg(-2,0,0,0,false,true),seg(0,1,2,1)],points:[dot(0,1,'defined value')]},'The function is zero for x<0 and one for x≥0.','The jump prevents a derivative at zero; away from zero the derivative is zero.','The endpoint at the jump is open below and filled above.');
 const floors=[],ceilings=[],fractions=[],floorDots=[],ceilDots=[],fractionDots=[];
 for(let k=-2;k<2;k++){floors.push(seg(k,k,k+1,k,false,true));floorDots.push(dot(k,k));ceilings.push(seg(k,k+1,k+1,k+1,true,false));ceilDots.push(dot(k+1,k+1));fractions.push(seg(k,0,k+1,1,false,true));fractionDots.push(dot(k,0));}
 floorDots.push(dot(2,2));ceilDots.push(dot(-2,-2));fractionDots.push(dot(2,0));
 study('study_floor','Floor · ⌊x⌋','\\lfloor x\\rfloor',two,{segments:floors,points:floorDots},'The floor is the greatest integer no larger than x.','The derivative is zero between integers and does not exist at integer jumps.','Open endpoints and filled points distinguish the value at each integer.');
 study('study_ceiling','Ceiling · ⌈x⌉','\\lceil x\\rceil',two,{segments:ceilings,points:ceilDots},'The ceiling is the least integer no smaller than x.','The derivative is zero between integers and does not exist at integer jumps.','Open endpoints and filled points distinguish the value at each integer.');
 study('study_fraction','Fractional part · x − ⌊x⌋','x-\\lfloor x\\rfloor',two,{segments:fractions,points:fractionDots},'The fractional part lies in [0,1); it resets to zero at each integer.','The derivative is one away from integers and does not exist at integer jumps.','Each ramp stops at an open endpoint; the next integer has value zero.');
 const nearest=[];for(let k=-4;k<4;k++){const a=k/2,b=(k+1)/2;nearest.push(seg(a,Math.abs(a-Math.round(a)),b,Math.abs(b-Math.round(b))));}
 study('study_nearest_integer','Distance to nearest integer','\\min_{n\\in\\mathbb Z}|x-n|',two,{segments:nearest,points:[]},'The graph records the distance from x to the nearest integer.','Its corners at integers and half-integers do not have derivatives; between them the slope is ±1.','These straight segments show the function exactly on the displayed interval.');
 const triangular=[];for(let k=-4;k<4;k++){const a=k/2,b=(k+1)/2,tri=x=>1-2*Math.abs(x-2*Math.floor((x+1)/2));triangular.push(seg(a,tri(a),b,tri(b)));}
 study('study_triangle_wave','Triangle wave · periodic','1-2|x-2\\lfloor(x+1)/2\\rfloor|',two,{segments:triangular,points:[]},'A continuous periodic wave rises and falls along straight lines.','Derivatives fail at the corners; each open straight segment has a constant slope.','The line segments show two periods exactly.');
 study('study_jump_line','Jump between two straight lines','\\begin{cases}x&x<0\\\\x+1&x\\ge0\\end{cases}',two,{segments:[seg(-2,-2,0,0,false,true),seg(0,1,2,3)],points:[dot(0,1,'defined value')]},'Two parallel lines meet a jump: the left limit is zero and the value at zero is one.','Each branch has derivative one; the function is not differentiable at the jump.','The open and filled markers distinguish the one-sided limit and defined value.');
 study('study_removable','Removable hole · (x²−1)/(x−1)','\\frac{x^2-1}{x-1}\\quad(x\\ne1)',two,{segments:[seg(-2,-1,1,2,false,true),seg(1,2,2,3,true,false)],points:[]},'For x≠1 the quotient equals x+1; the original expression is undefined at x=1.','The derivative is one on its domain; at the missing point there is no function value to differentiate.','The open circle at (1,2) marks the removable hole.');
 const pole=[];for(const [a,b] of [[-2,-.25],[.25,2]]){let prev=a;for(let k=1;k<=35;k++){const x=a+(b-a)*k/35;pole.push(seg(prev,1/prev,x,1/x));prev=x;}}
 study('study_pole','Reciprocal pole · 1/x, both sides','1/x\\quad(x\\ne0)',two,{segments:pole,points:[]},'The reciprocal is undefined at zero and grows without bound near it.','Its derivative is −1/x² on either side; there is no derivative at zero.','A finite polygonal approximation stops at ±0.25; the true branches continue without bound.');
 function sampled(fn,intervals,n){const segments=[];for(const [a,b] of intervals){let x=a;for(let k=1;k<=n;k++){const y=a+(b-a)*k/n;segments.push(seg(x,fn(x),y,fn(y)));x=y;}}return segments;}
 const sinc=x=>x===0?1:Math.sin(x)/x;
 study('study_sinc','Sinc · sin(x)/x with value at zero','\\begin{cases}\\sin x/x&x\\ne0\\\\1&x=0\\end{cases}',[-pi,pi],{segments:sampled(sinc,[[-pi,pi]],100),points:[dot(0,1,'continuous value')]},'Defining the zero value to be one fills the removable singularity and makes sinc continuous.','This filled function is differentiable at zero, with derivative zero; this level explores its graph.','The smooth curve is a finite polygonal approximation.');
 const osc1=x=>x*Math.sin(1/x),osc2=x=>x*x*Math.sin(1/x);
 study('study_x_sin_inverse','Oscillation · x sin(1/x)','\\begin{cases}x\\sin(1/x)&x\\ne0\\\\0&x=0\\end{cases}',[-1,1],{segments:sampled(osc1,[[-1,-.04],[.04,1]],100),points:[dot(0,0,'defined value')]},'The function is continuous at zero as the oscillation is trapped between −|x| and |x|.','The derivative at zero does not exist because sin(1/x) has no limit there.','Finite polygonal samples omit (−0.04,0.04) except the defined point; infinitely many oscillations remain unresolved.');
 study('study_x2_sin_inverse','Oscillation · x² sin(1/x)','\\begin{cases}x^2\\sin(1/x)&x\\ne0\\\\0&x=0\\end{cases}',[-1,1],{segments:sampled(osc2,[[-1,-.04],[.04,1]],100),points:[dot(0,0,'defined value')]},'The function is continuous at zero and its rapidly oscillating values are bounded by x².','The derivative at zero exists and equals zero, although the derivative is not continuous there.','Finite polygonal samples omit (−0.04,0.04) except the defined point; infinitely many oscillations remain unresolved.');
 const rationalPoints=[],irrationalPoints=[];for(let n=0;n<=24;n++)rationalPoints.push(dot(n/24,1,n===0?'0 rational':n===12?'1/2 rational':n===24?'1 rational':null,{sampleKind:'rational',numerator:n,denominator:24}));
 for(let n=0;n<24;n++)irrationalPoints.push(dot((n+Math.SQRT2/2)/24,0,n===0?'irrational samples':null,{sampleKind:'irrational',construction:`(${n}+√2/2)/24`}));
 study('study_dirichlet','Dirichlet · rational / irrational','\\begin{cases}1&x\\in\\mathbb Q\\\\0&x\\notin\\mathbb Q\\end{cases}',[0,1],{segments:[],points:[...rationalPoints,...irrationalPoints]},'The value is one at every rational and zero at every irrational. Both sets are dense, so the function is discontinuous everywhere.','A function differentiable at a point must be continuous there; this function has no derivative at any point.','Only constructed rational and irrational example points are shown; finite points cannot depict the two dense sets.');
 function gcd(a,b){while(b){const t=a%b;a=b;b=t;}return a;}
 const thomae=[];for(let q=1;q<=24;q++)for(let p=0;p<=q;p++)if(gcd(p,q)===1)thomae.push(dot(p/q,1/q,p===0?'0 = 0/1':p===1&&q===2?'1/2':p===q?'1 = 1/1':null,{sampleKind:'rational',numerator:p,denominator:q}));
 for(let n=0;n<24;n++)thomae.push(dot((n+Math.SQRT2/2)/24,0,n===0?'irrational samples':null,{sampleKind:'irrational',construction:`(${n}+√2/2)/24`}));
 study('study_thomae','Thomae · popcorn function','\\begin{cases}1/q&x=p/q\\in\\mathbb Q,\\ (p,q)=1,\\ q>0\\\\0&x\\notin\\mathbb Q\\end{cases}',[0,1],{segments:[],points:thomae},'A reduced rational p/q has height 1/q, while every irrational has height zero. The function is continuous at irrational points and discontinuous at rationals.','At each rational the jump in nearby values prevents a derivative; differentiability at irrational points requires further analysis.','The rational dots use reduced fractions with q≤24; isolated irrational samples mark the zero baseline.');

 // Follow-on study quests use explicit geometry: numeric callbacks remain NaN.
 // The elementary rational/irrational quotient argument is given below.
 const finite=(segments=[],points=[])=>({segments,points,finiteModel:true});
 const questSteps={
  min:['Identify the domain or comparison window in the definition.','Compare the attainable values there, including any defined endpoints.','Mark only points or intervals that actually attain the minimum.'],
  max:['Identify the domain or comparison window in the definition.','Compare the attainable values there, including any defined endpoints.','Mark only points or intervals that actually attain the maximum.'],
  derivative:['Separate the intervals on which the displayed branches apply.','Differentiate each branch and use limits for any separately defined point.','Exclude jumps, corners and holes from the first-derivative graph.'],
  second:['Separate the intervals where the first derivative is defined.','Differentiate each first-derivative branch and check any special limits.','Exclude points where the second derivative does not exist.'],
  singularity:['Find the input where the original expression fails to be defined.','Compare its one-sided limits and decide whether the failure is removable.','Mark the input with a vertical indicator, not a function value.'],
  discontinuity:['Find the input or input set being investigated.','Compare the function value with limits from both sides where relevant.','Mark the discontinuous inputs with vertical indicators.'],
  nondifferentiable:['Find the input or input set being investigated.','Compare difference quotients or one-sided slopes and continuity.','Mark inputs where no derivative exists with vertical indicators.']
 };
 const explanation={min:' Interpret the minimum on the comparison set named in the quest.',max:' Interpret the maximum on the comparison set named in the quest.',derivative:' The derivative describes the slope wherever the stated rule applies.',second:' The second derivative describes how the first derivative changes.',singularity:' A singularity marks a failure of the original expression to be defined.',discontinuity:' A discontinuity means the relevant limit and value fail to agree.',nondifferentiable:' A derivative exists only if the relevant difference quotients converge.'};
 const quest=(kind,title,tex,meaning,displayNote,graph,steps)=>({kind,title,tex,method:steps||questSteps[kind],meaning:meaning.length>40?meaning:meaning+explanation[kind],displayNote,graph});
 const subset=(points)=>finite([],points.map(([x,y])=>dot(x,y)));
 const xmarks=(xs,ylo=-1,yhi=1)=>finite(xs.map(x=>seg(x,ylo,x,yhi)),[]);
 const markerNote='Vertical markers identify x-coordinates only; their heights are not values of the function.';
 const horizontal=(intervals,y)=>finite(intervals.map(([a,b,openA,openB])=>seg(a,y,b,y,openA,openB)),[]);
 const branchLines=(intervals,ys)=>finite(intervals.map(([a,b,openA,openB],i)=>seg(a,ys[i],b,ys[i],openA,openB)),[]);
 const extrema=(kind,title,tex,meaning,points)=>quest(kind,title,tex,meaning,'Targets are actual function points in the displayed window.',subset(points));
 const vertical=(kind,title,tex,meaning,xs,note=markerNote)=>quest(kind,title,tex,meaning,note,xmarks(xs));
 const straightDerivative=(kind,tex,intervals,ys,meaning)=>quest(kind,kind==='second'?'Explore the second derivative':'Explore the first derivative',tex,meaning,'Open markers exclude the listed corners, jumps or missing points; the remaining straight pieces are exact on the displayed interval.',branchLines(intervals,ys));
 function setQuests(id,applicability,quests){curves[id].study.applicability=applicability;curves[id].study.quests=quests;}
 const bothSides=[[-2,0,false,true],[0,2,true,false]];
 const unitOpen=Array.from({length:4},(_,i)=>[-2+i,-1+i,true,true]);
 setQuests('study_absolute','The minimum and window maxima exist. First and second derivatives exclude the corner at zero.',[
  extrema('min','Minimum of |x|','f(0)=0','The minimum value is zero.',[[0,0]]),extrema('max','Window maxima of |x|','f(-2)=f(2)=2','On this closed window the largest value is two.',[[-2,2],[2,2]]),
  straightDerivative('derivative',"f'(x)=\\begin{cases}-1&x<0\\\\1&x>0\\end{cases}",bothSides,[-1,1],'The slopes differ on the two sides of the corner.'),
  straightDerivative('second',"f''(x)=0\\quad(x\\ne0)",bothSides,[0,0],'Away from zero the slope is constant.'),vertical('nondifferentiable','Corner at zero','x=0','The one-sided derivatives are −1 and 1.',[0])]);
 setQuests('study_sign','The extreme values are attained on intervals. The two derivative graphs exclude the jump.',[
  quest('min','Minimum of sign','f(x)=-1\\quad(x<0)','The minimum is −1 on the negative side.','The segment is the attained minimum on this window.',horizontal([[-2,0,false,true]],-1)),
  quest('max','Maximum of sign','f(x)=1\\quad(x>0)','The maximum is 1 on the positive side.','The segment is the attained maximum on this window.',horizontal([[0,2,true,false]],1)),
  straightDerivative('derivative',"f'(x)=0\\quad(x\\ne0)",bothSides,[0,0],'The sign function is locally constant off zero.'),straightDerivative('second',"f''(x)=0\\quad(x\\ne0)",bothSides,[0,0],'The first derivative is constant away from the jump.'),vertical('discontinuity','The sign jump','x=0','The left and right limits differ.',[0])]);
 setQuests('study_heaviside','The step has attained minimum and maximum intervals. The derivative levels exclude the jump.',[
  quest('min','Minimum of the step','f(x)=0\\quad(x<0)','The minimum value is zero on the negative side.','The target is the attained minimum interval.',horizontal([[-2,0,false,true]],0)),
  quest('max','Maximum of the step','f(x)=1\\quad(x\\ge0)','The maximum value is one, including x=0.','The target is the attained maximum interval.',horizontal([[0,2,false,false]],1)),
  straightDerivative('derivative',"f'(x)=0\\quad(x\\ne0)",bothSides,[0,0],'Each open branch is constant.'),straightDerivative('second',"f''(x)=0\\quad(x\\ne0)",bothSides,[0,0],'The first derivative is constant on each open branch.'),vertical('discontinuity','The step jump','x=0','The left limit is zero and the function value is one.',[0])]);
 const ints=[-2,-1,0,1,2];
 setQuests('study_floor','The displayed-window extrema are attained; the first and second derivatives exclude integer jumps.',[
  quest('min','Window minimum of floor','f(x)=-2\\quad(-2\\le x<-1)','The smallest window value is −2.','The right endpoint is excluded.',horizontal([[-2,-1,false,true]],-2)),extrema('max','Window maximum of floor','f(2)=2','On this closed window the value two is reached only at the right endpoint.',[[2,2]]),
  straightDerivative('derivative',"f'(x)=0\\quad(x\\notin\\mathbb Z)",unitOpen,[0,0,0,0],'Floor is locally constant between integers.'),straightDerivative('second',"f''(x)=0\\quad(x\\notin\\mathbb Z)",unitOpen,[0,0,0,0],'Its first derivative is locally constant between integers.'),vertical('discontinuity','Integer jumps of floor','x\\in\\mathbb Z','The function jumps at each integer.',ints)]);
 setQuests('study_ceiling','The displayed-window extrema are attained; the first and second derivatives exclude integer jumps.',[
  extrema('min','Window minimum of ceiling','f(-2)=-2','On this closed window the minimum is attained only at the left endpoint.',[[-2,-2]]),quest('max','Window maximum of ceiling','f(x)=2\\quad(1<x\\le2)','The largest window value is two.','The left endpoint is excluded.',horizontal([[1,2,true,false]],2)),
  straightDerivative('derivative',"f'(x)=0\\quad(x\\notin\\mathbb Z)",unitOpen,[0,0,0,0],'Ceiling is locally constant between integers.'),straightDerivative('second',"f''(x)=0\\quad(x\\notin\\mathbb Z)",unitOpen,[0,0,0,0],'Its first derivative is locally constant between integers.'),vertical('discontinuity','Integer jumps of ceiling','x\\in\\mathbb Z','The function jumps at each integer.',ints)]);
 setQuests('study_fraction','The minimum is attained at integers. There is no maximum: the supremum one is never reached. Derivative graphs exclude jumps.',[
  extrema('min','Minimum fractional part','f(n)=0\\quad(n\\in\\mathbb Z)','Every integer in the window attains the minimum zero.',ints.map(x=>[x,0])),
  straightDerivative('derivative',"f'(x)=1\\quad(x\\notin\\mathbb Z)",unitOpen,[1,1,1,1],'Between jumps the fractional part has slope one.'),straightDerivative('second',"f''(x)=0\\quad(x\\notin\\mathbb Z)",unitOpen,[0,0,0,0],'The slope is constant between integers.'),vertical('discontinuity','Fractional-part jumps','x\\in\\mathbb Z','At each integer the left limit is one while the value is zero.',ints)]);
 const halfs=[-2,-1.5,-1,-.5,0,.5,1,1.5,2],halfOpen=halfs.slice(0,-1).map((a,i)=>[a,halfs[i+1],true,true]);
 setQuests('study_nearest_integer','Minima occur at integers and maxima at half-integers; derivatives exclude both kinds of corner.',[
  extrema('min','Nearest-integer minima','f(n)=0\\quad(n\\in\\mathbb Z)','Every integer has distance zero.',ints.map(x=>[x,0])),extrema('max','Nearest-integer maxima','f(n+1/2)=1/2','Half-integers are farthest from their nearest integers.',[-1.5,-.5,.5,1.5].map(x=>[x,.5])),
  straightDerivative('derivative',"f'(x)=\\pm1\\quad(x\\notin\\tfrac12\\mathbb Z)",halfOpen,[1,-1,1,-1,1,-1,1,-1],'The sign alternates on successive half-unit intervals.'),straightDerivative('second',"f''(x)=0\\quad(x\\notin\\tfrac12\\mathbb Z)",halfOpen,Array(8).fill(0),'Each open branch is straight.'),vertical('nondifferentiable','Distance-graph corners','x\\in\\tfrac12\\mathbb Z','The slope changes at every integer and half-integer.',halfs)]);
 setQuests('study_triangle_wave','The plotted maxima and minima are attained; first and second derivatives exclude the corners.',[
  extrema('min','Triangle-wave minima','f(2n+1)=-1','The odd integers in the window are minima.',[[-1,-1],[1,-1]]),extrema('max','Triangle-wave maxima','f(2n)=1','The even integers in the window are maxima.',[[-2,1],[0,1],[2,1]]),
  straightDerivative('derivative',"f'(x)=\\pm2\\quad(x\\notin\\mathbb Z)",unitOpen,[-2,2,-2,2],'The slope alternates on successive unit intervals.'),straightDerivative('second',"f''(x)=0\\quad(x\\notin\\mathbb Z)",unitOpen,[0,0,0,0],'Each open branch is straight.'),vertical('nondifferentiable','Triangle-wave corners','x\\in\\mathbb Z','The slopes change at each integer.',ints)]);
 setQuests('study_jump_line','The window has attained endpoints as its extrema; derivatives exclude the jump.',[
  extrema('min','Window minimum','f(-2)=-2','The left window endpoint is the minimum.',[[-2,-2]]),extrema('max','Window maximum','f(2)=3','The right window endpoint is the maximum.',[[2,3]]),
  straightDerivative('derivative',"f'(x)=1\\quad(x\\ne0)",bothSides,[1,1],'Both straight branches have slope one.'),straightDerivative('second',"f''(x)=0\\quad(x\\ne0)",bothSides,[0,0],'The branch slopes are constant.'),vertical('discontinuity','The line jump','x=0','The function value is one but the left limit is zero.',[0])]);
 const holeSides=[[-2,1,false,true],[1,2,true,false]];
 setQuests('study_removable','The window extrema are attained at its endpoints. The quotient is undefined at one; its derivative levels exclude the hole.',[
  extrema('min','Window minimum','f(-2)=-1','The left endpoint attains the minimum.',[[-2,-1]]),extrema('max','Window maximum','f(2)=3','The right endpoint attains the maximum.',[[2,3]]),
  straightDerivative('derivative',"f'(x)=1\\quad(x\\ne1)",holeSides,[1,1],'After cancellation, the function is x+1 wherever it is defined.'),straightDerivative('second',"f''(x)=0\\quad(x\\ne1)",holeSides,[0,0],'The derivative is constant on the domain.'),vertical('singularity','Removable hole','x=1','The quotient is undefined at one, despite having limit two.',[1])]);
 function sampledQuest(kind,title,tex,fn,intervals,meaning,note,points=[]){return quest(kind,title,tex,meaning,note,finite(sampled(fn,intervals,100),points));}
 const truncated=[[-2,-.5],[.5,2]];
 setQuests('study_pole','There is no finite global minimum or maximum across the pole. Derivative curves are shown only on two bounded subintervals.',[
  sampledQuest('derivative','Reciprocal first derivative',"f'(x)=-1/x^2\\quad(x\\ne0)",x=>-1/(x*x),truncated,'Differentiate x⁻¹ on each side of zero.','A polygonal sample stops at ±0.5; both true branches continue toward the pole.'),
  sampledQuest('second','Reciprocal second derivative',"f''(x)=2/x^3\\quad(x\\ne0)",x=>2/x**3,truncated,'Differentiate −x⁻² on each side.','A polygonal sample stops at ±0.5; both true branches continue without bound.'),vertical('singularity','Reciprocal pole','x=0','The function is undefined and unbounded near zero.',[0])]);
 const sincD=x=>Math.abs(x)<1e-4?-x/3+x**3/30:(x*Math.cos(x)-Math.sin(x))/(x*x);
 const sincDD=x=>Math.abs(x)<1e-4?-1/3+x*x/10:-Math.sin(x)/x-2*Math.cos(x)/(x*x)+2*Math.sin(x)/(x*x*x);
 setQuests('study_sinc','The displayed window has attained minima and a maximum. Both derivatives extend through zero; their curves are finite polygonal samples.',[
  extrema('min','Sinc window minima','f(-\\pi)=f(\\pi)=0','Sinc is nonnegative in the window and zero at both endpoints.',[[-pi,0],[pi,0]]),extrema('max','Sinc window maximum','f(0)=1','The continuous value one is its maximum on this window.',[[0,1]]),
  sampledQuest('derivative','Sinc first derivative',"f'(x)=\\frac{x\\cos x-\\sin x}{x^2}\\ (x\\ne0),\\quad f'(0)=0",sincD,[[-pi,pi]],'The first derivative has a removable expression at zero, whose limit is zero.','The displayed derivative is a polygonal approximation, including the defined limit.'),
  sampledQuest('second','Sinc second derivative',"f''(x)=-\\frac{\\sin x}{x}-\\frac{2\\cos x}{x^2}+\\frac{2\\sin x}{x^3}\\ (x\\ne0),\\quad f''(0)=-\\frac13",sincDD,[[-pi,pi]],'A series expansion or differentiation shows the limit at zero is −1/3.','The displayed derivative is a polygonal approximation, including the defined limit.')]);
 const oscIntervals=[[-1,-.2],[.2,1]];
 const oscD=x=>Math.sin(1/x)-Math.cos(1/x)/x,oscDD=x=>-Math.sin(1/x)/x**3;
 // On (kπ,kπ+π/2), tan(u)-u increases from negative to positive.
 // Bounded bisection therefore isolates one stationary point per interval.
 const oscExtrema={min:[],max:[]};
 for(let k=1;k<=7;k++){
  let a=k*pi,b=(k+.5)*pi-1e-8;
  for(let i=0;i<65;i++){const m=(a+b)/2;if(Math.tan(m)-m>0)b=m;else a=m;}
  const x=1/((a+b)/2),kind=oscDD(x)>0?'min':'max';
  for(const signed of [-x,x])oscExtrema[kind].push(dot(signed,osc1(signed),null,{approximate:true}));
 }
 setQuests('study_x_sin_inverse','The first and second derivative curves omit the oscillatory region near zero. Extrema show a finite local subset; infinitely many more accumulate at zero.',[
  quest('min','Sample local minima','\\tan(1/x)=1/x\\quad(0.04\\le |x|<1)','These are selected local minima, obtained from the stationary equation and classified by the sign of the second derivative.','Numerical roots are approximate; only the finite subset with |x|≥0.04 is shown, with infinitely many more near zero.',finite([],oscExtrema.min),['Differentiate x sin(1/x) away from zero.','Put u=1/x and isolate roots of tan(u)=u between kπ and kπ+π/2.','Classify each sampled stationary point with the second derivative.']),
  quest('max','Sample local maxima','\\tan(1/x)=1/x\\quad(0.04\\le |x|<1)','These are selected interior local maxima, obtained from the stationary equation and classified by the sign of the second derivative.','Numerical roots are approximate; only the finite subset with |x|≥0.04 is shown, with infinitely many more near zero.',finite([],oscExtrema.max),['Differentiate x sin(1/x) away from zero.','Put u=1/x and isolate roots of tan(u)=u between kπ and kπ+π/2.','Classify each sampled stationary point with the second derivative.']),
  sampledQuest('derivative','First derivative away from zero',"f'(x)=\\sin(1/x)-\\cos(1/x)/x\\quad(x\\ne0)",oscD,oscIntervals,'Use the product and chain rules for nonzero x.','Polygonal samples stop at ±0.2 and do not resolve the infinitely many oscillations near zero.'),
  sampledQuest('second','Second derivative away from zero',"f''(x)=-\\sin(1/x)/x^3\\quad(x\\ne0)",oscDD,oscIntervals,'Differentiate the nonzero branch once more.','Polygonal samples stop at ±0.2 and do not resolve the infinitely many oscillations near zero.'),vertical('nondifferentiable','Differentiability at zero','x=0','The difference quotient at zero is sin(1/x), which has no limit.',[0])]);
 const osc2D=x=>2*x*Math.sin(1/x)-Math.cos(1/x),osc2DD=x=>2*Math.sin(1/x)-2*Math.cos(1/x)/x-Math.sin(1/x)/x**2;
 setQuests('study_x2_sin_inverse','The window extrema occur at its endpoints. The first derivative exists but is discontinuous at zero, where the second derivative fails; finite samples omit unresolved oscillations.',[
  quest('min','Window minimum of oscillation','f(-1)=-\\sin(1)','The minimum on the displayed interval [-1,1] occurs at its left endpoint.','The target is the true window minimum; infinitely many smaller-scale local extrema are not enumerated.',subset([[-1,-Math.sin(1)]]),['Use |x² sin(1/x)| ≤ x² to bound the middle interval |x|≤1/2.','On [1/2,1], put u=1/x. For 1≤u<π/2 use tan(u)>u; for π/2≤u≤2 use cos(u)≤0. The derivative is positive throughout.','Compare the endpoint and use odd symmetry to obtain the minimum.']),
  quest('max','Window maximum of oscillation','f(1)=\\sin(1)','The maximum on the displayed interval [-1,1] occurs at its right endpoint.','The target is the true window maximum; infinitely many smaller-scale local extrema are not enumerated.',subset([[1,Math.sin(1)]]),['Use |x² sin(1/x)| ≤ x² to bound the middle interval |x|≤1/2.','On [1/2,1], put u=1/x. For 1≤u<π/2 use tan(u)>u; for π/2≤u≤2 use cos(u)≤0. The derivative is positive throughout.','Compare the endpoint and use odd symmetry to obtain the maximum.']),
  sampledQuest('derivative','First derivative with its zero value',"f'(x)=2x\\sin(1/x)-\\cos(1/x)\\ (x\\ne0),\\quad f'(0)=0",osc2D,oscIntervals,'The difference quotient at zero tends to zero. Away from zero use the product rule.','Polygonal branches stop at ±0.2; the isolated point is the true value of the derivative at zero.',[dot(0,0)]),
  sampledQuest('second','Second derivative away from zero',"f''(x)=2\\sin(1/x)-2\\cos(1/x)/x-\\sin(1/x)/x^2\\quad(x\\ne0)",osc2DD,oscIntervals,'The derivative itself is discontinuous at zero, so it cannot have a derivative there.','Polygonal samples stop at ±0.2 and do not resolve the infinitely many oscillations near zero.'),
  vertical('discontinuity','Discontinuity of the first derivative',"f'\\text{ is discontinuous at }x=0",'The first derivative oscillates between values approaching −1 and 1 while its value at zero is 0.',[0])]);
 const dirRat=rationalPoints.filter(p=>p.sampleKind==='rational'),dirIrr=irrationalPoints;
 const ratSubset=dirRat.filter((_,i)=>i%4===0).map(p=>p.x),irrSubset=dirIrr.filter((_,i)=>i%4===0).map(p=>p.x);
 setQuests('study_dirichlet','The global minimum and maximum are both attained densely. No first or second derivative exists; all dense sets are represented only by finite constructed samples.',[
  quest('min','Dirichlet minimum','f(x)=0\\quad(x\\notin\\mathbb Q)','Every irrational attains the minimum zero.','Only constructed irrational examples are shown; the true set is dense.',finite([],dirIrr)),
  quest('max','Dirichlet maximum','f(x)=1\\quad(x\\in\\mathbb Q)','Every rational attains the maximum one.','Only constructed rational examples are shown; the true set is dense.',finite([],dirRat)),
  vertical('discontinuity','Everywhere discontinuous','x\\in\\mathbb R','Rational and irrational sequences approach every real input but give different values.',[...ratSubset,...irrSubset],'Finite vertical markers sample rational and irrational inputs; every real input is a discontinuity. Marker heights are not function values.'),
  vertical('nondifferentiable','Nowhere differentiable','x\\in\\mathbb R','Differentiability implies continuity, which fails at every input.',[...ratSubset,...irrSubset],'Finite vertical markers sample an everywhere nondifferentiable function. Marker heights are not function values.')]);
 const thRat=thomae.filter(p=>p.sampleKind==='rational'),thIrr=thomae.filter(p=>p.sampleKind==='irrational');
 const thSamples=thRat.filter(p=>p.denominator<=6).map(p=>p.x);
 setQuests('study_thomae','The global minimum occurs at every irrational, and the maximum at the endpoints of this window. No first or second derivative exists; finite samples cannot depict dense sets.',[
  quest('min','Thomae minimum','f(x)=0\\quad(x\\notin\\mathbb Q)','Every irrational attains the minimum zero.','Only constructed irrational samples are shown; all irrationals have this value.',finite([],thIrr)),
  extrema('max','Thomae window maxima','f(0)=f(1)=1','The two integers in [0,1] attain the maximum one.',[[0,1],[1,1]]),
  vertical('discontinuity','Rational discontinuities','x\\in\\mathbb Q','At every rational p/q the function value is 1/q while irrational inputs arbitrarily close have value zero.',thSamples,'Finite markers use reduced rational examples with denominator at most 6; every rational is a discontinuity. Marker heights are not function values.'),
  quest('nondifferentiable','Thomae is nowhere differentiable','x\\in\\mathbb R','At rational inputs discontinuity rules out a derivative. At irrational inputs, rational approximants and irrational inputs give incompatible difference quotients.','Finite markers sample inputs of an everywhere nondifferentiable function; marker heights are not function values.',xmarks([...thSamples,...irrSubset]),['At a rational input use the failure of continuity.','At an irrational x take pₙ/n = floor(nx)/n; after reduction its denominator is at most n, so f(pₙ/n) ≥ 1/n.','These rational difference quotients have magnitude greater than one, while nearby irrational quotients equal zero; no derivative exists.'])]);
 // Explain the result using the difference-quotient argument below.
 curves.study_thomae.study.method[2]='The function is nowhere differentiable: at rationals it is discontinuous; at irrationals rational and irrational difference quotients disagree.';

 const sub=(id,label,keys,note)=>({id,label,keys,note});
 const families=[
  {id:'algebraic',label:'Algebraic functions',note:'Built from polynomial equations, ratios and roots. Several examples also belong to the structural/behavioural groups.',subfamilies:[
   sub('polynomial','Polynomial functions',['constant','linear','quadratic','cube','cubic','quartic',...expanded.polynomial],'Constant, linear and polynomial examples through degree eight, including several different turning-point shapes.'),
   sub('rational','Rational functions',['reciprocal','rational',...expanded.rational],'A ratio of polynomials; the domain excludes denominator zeros.'),
   sub('radical','Root (radical) functions',['square_root','cube_root'],'Roots are rational powers. Differentiation may require avoiding a root endpoint.'),
   sub('power','Power functions',['quadratic','cube','reciprocal','power_three_halves','power_two_thirds'],'These examples use integer or rational powers and are algebraic. General real powers need not be algebraic.')
  ]},
  {id:'transcendental',label:'Transcendental functions',note:'Exponential, logarithmic, circular and hyperbolic representatives, with their inverse relationships.',subfamilies:[
   sub('exponential','Exponential functions',['exponential','exponential_two','gaussian',...expanded.exponential],'The variable appears in an exponent. The Gaussian also illustrates composition.'),
   sub('logarithmic','Logarithmic functions',['log','log_two','log_composite',...expanded.logarithmic],'Logarithms undo exponentials; their arguments must be positive.'),
   sub('trigonometric','Trigonometric functions',['sine','cosine','tangent',...expanded.trigonometric],'Sine, cosine and tangent use radians. Tangent has poles.'),
   sub('inverse_trigonometric','Inverse trigonometric functions',['arcsine','arccosine','arctangent'],'Each inverse selects a principal one-to-one trigonometric branch.'),
   sub('hyperbolic','Hyperbolic functions',['sinh','cosh','tanh',...expanded.hyperbolic],'Sinh, cosh and tanh come from combinations of exponentials.')
  ]},
  {id:'exploration',label:'Discontinuities and special functions',note:'Explicit finite pictures of functions that need careful treatment of domains, discontinuities or infinite detail.',subfamilies:[sub('special','Explore special examples',expandedStudy,'Each entry begins with exploration and offers further levels where mathematically supported; finite pictures cannot show every feature.')]},
  {id:'structural',label:'Structural and behavioural types',note:'These are overlapping descriptions: an algebraic or transcendental function can also be piecewise, even, odd or periodic.',subfamilies:[
   sub('piecewise','Piecewise-defined functions',['piecewise_cubic','piecewise_valley'],'Different formulas on different intervals. These representatives join with two continuous derivatives, suitable for the calculus game.'),
   sub('composite','Composite functions',['gaussian','log_composite','exp_sine'],'One function is applied inside another: the derivative uses the chain rule.'),
   sub('implicit','Implicit functions',['circle_upper','circle_lower','quadratic'],'A relation F(x,y)=0 can have several y-values. The game names a single branch; y − x² = 0 is the parabola representative.'),
   sub('symmetry','Even and odd functions',['quadratic','quartic','gaussian','cosine','cosh','cube','cubic','rational','sine','sinh','tanh'],'Even: f(−x)=f(x). Odd: f(−x)=−f(x). These properties overlap the other families.'),
   sub('periodic','Periodic functions',['sine','cosine','tangent','exp_sine'],'Sine, cosine and exp(sin x) have period 2π; tangent has period π, wherever it is defined.'),
   sub('vector','Vector-valued functions',['vector_parabola','vector_wave'],'The full function returns a vector. The 2D grid game names the scalar component it plots and explains the vector derivatives beside it.')
  ]}
 ];
 // Supply the lesson API from this catalogue, rather than the closures over
 // the original seven curves. New representatives use finite teaching windows.
 function variable(tex,from,to){return tex.replace(/\\(?:begin|end|text|operatorname)\{[^}]*\}|\\[A-Za-z]+|[ax]/g,token=>token===from?to:token);}
 function formula(key,order,name='x'){
  const c=curves[key],tex=order===1?c.derivativeTex:c.secondTex;
  return variable(tex,c.lesson?'x':'a',name);
 }
 for(const c of Object.values(curves)){
  c.gap??=Math.min(1.2,(c.position[1]-c.position[0])/4);
  c.quotientTex??=raw`\frac{f(a+h)-f(a)}{h}`;
  c.secant??=((a,h)=>Math.abs(h)<1e-7*Math.max(1,Math.abs(a))?c.derivative(a+h/2):(c.value(a+h)-c.value(a))/h);
  c.challenges??=[c.initial,c.position[0]+(c.position[1]-c.position[0])/4,c.position[0]+3*(c.position[1]-c.position[0])/4]
   .map(x=>c.derivative(x)).filter((v,i,all)=>Number.isFinite(v)&&all.findIndex(w=>Math.abs(v-w)<1e-8)===i)
   .map(v=>[v,`Find a gradient close to ${base.format(v)}.`]);
 }
 function evaluate(step,x,key,method){const c=curves[key];return step===1?method==='value'?2*x+1:method==='derivative'?2:0:c.domain&&(x<c.domain[0]||x>c.domain[1])?NaN:c[method](x);}
 const maths={...base,curves,
  value:(step,x,key='quadratic')=>evaluate(step,x,key,'value'),
  derivative:(step,x,key='quadratic')=>evaluate(step,x,key,'derivative'),
  secondDerivative:(step,x,key='quadratic')=>evaluate(step,x,key,'second'),
  secant:(step,a,h,key='quadratic')=>h===0?null:step===1?2:curves[key].secant(a,h),
  maxGap:(key,a,side)=>{const c=curves[key];return c.domain?Math.max(0,Math.min(c.gap,side<0?a-c.domain[0]:c.domain[1]-a)):key==='log'&&side<0?Math.min(c.gap,.9*a):c.gap;},
  sliderBounds:(step,key,lo,hi)=>{const domain=step>1?curves[key].domain:null;if(!domain)return base.sliderBounds(step,key,lo,hi);const min=Math.max(lo,domain[0]),max=Math.min(hi,domain[1]);return {min,max,disabled:min>=max};},
  pointsInRange:(key,lo,hi)=>key==='sine'||key==='vector_wave'?base.pointsInRange('sine',lo,hi):curves[key].points.filter(p=>p.x>=lo&&p.x<=hi).sort((a,b)=>a.x-b.x)
 };
 function membership(key){for(const family of families)for(const subfamily of family.subfamilies)if(subfamily.keys.includes(key))return {family,subfamily};return null;}
 const api={families,maths,membership,variable,formula};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeGridderCatalogue=api;
})(typeof window!=='undefined'?window:globalThis);
