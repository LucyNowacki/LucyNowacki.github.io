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
 const sub=(id,label,keys,note)=>({id,label,keys,note});
 const families=[
  {id:'algebraic',label:'Algebraic functions',note:'Built from polynomial equations, ratios and roots. Several examples also belong to the structural/behavioural groups.',subfamilies:[
   sub('polynomial','Polynomial functions',['constant','linear','quadratic','cube','cubic','quartic'],'Constant, linear, quadratic, cubic and quartic representatives.'),
   sub('rational','Rational functions',['reciprocal','rational'],'A ratio of polynomials; the domain excludes denominator zeros.'),
   sub('radical','Root (radical) functions',['square_root','cube_root'],'Roots are rational powers. Differentiation may require avoiding a root endpoint.'),
   sub('power','Power functions',['quadratic','cube','reciprocal','power_three_halves','power_two_thirds'],'These examples use integer or rational powers and are algebraic. General real powers need not be algebraic.')
  ]},
  {id:'transcendental',label:'Transcendental functions',note:'Exponential, logarithmic, circular and hyperbolic representatives, with their inverse relationships.',subfamilies:[
   sub('exponential','Exponential functions',['exponential','exponential_two','gaussian'],'The variable appears in an exponent. The Gaussian also illustrates composition.'),
   sub('logarithmic','Logarithmic functions',['log','log_two','log_composite'],'Logarithms undo exponentials; their arguments must be positive.'),
   sub('trigonometric','Trigonometric functions',['sine','cosine','tangent'],'Sine, cosine and tangent use radians. Tangent has poles.'),
   sub('inverse_trigonometric','Inverse trigonometric functions',['arcsine','arccosine','arctangent'],'Each inverse selects a principal one-to-one trigonometric branch.'),
   sub('hyperbolic','Hyperbolic functions',['sinh','cosh','tanh'],'Sinh, cosh and tanh come from combinations of exponentials.')
  ]},
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
