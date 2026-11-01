/* Case-specific teaching text; no DOM, game-state mutation or target-coordinate lookup. */
(function(root){
 'use strict';
 const raw=String.raw;
 // The seven legacy curves predate catalogue.lesson. Their formula fields remain
 // authoritative; these rule descriptions follow core/worked.js and its log fallback.
 const legacyRules={
  quadratic:['Use the power rule: multiply by the power, then reduce the power by one.','Differentiate 2x once more: its derivative is the constant 2.'],
  cubic:['Differentiate each term: x cubed gives 3x squared, and −3x gives −3.','Differentiate 3x² − 3 with the power rule; the constant disappears.'],
  quartic:['Use the power rule on each term: x to the fourth gives 4x cubed; −2x squared gives −4x.','Differentiate 4x³ − 4x term by term.'],
  sine:['In radians, the derivative of sine is cosine.','In radians, the derivative of cosine is minus sine.'],
  log:['The derivative of the natural logarithm is 1/x, for positive x.','Write 1/x as x to the power −1 and apply the power rule.'],
  gaussian:['Use the chain rule for the exponential, including the derivative of the inside −x².','Differentiate −2x exp(−x²) using the product rule and the chain rule.'],
  rational:['Use the quotient rule: denominator times derivative of numerator, minus numerator times derivative of denominator, divided by denominator squared.','Differentiate (1 − x²)(1 + x²)⁻² using the product and chain rules, then combine the fractions.']
 };
 const toX=tex=>tex.replace(/\\(?:begin|end)\{[^}]+\}|\\[A-Za-z]+|a/g,token=>token==='a'?'x':token);
 const number=value=>Number(value.toPrecision(6)).toString();
 const interval=values=>`[${number(values[0])}, ${number(values[1])}]`;
 function realDomain(key,c){
  if(['log','log_two'].includes(key))return raw`Real domain: \(x>0\); logarithms are undefined at zero and at negative real inputs.`;
  if(key==='reciprocal')return raw`Real domain: \(x\ne0\). The two sides of zero are separate branches.`;
  if(['square_root','power_three_halves'].includes(key))return raw`Real domain: \(x\ge0\). ${c.note}`;
  if(['cube_root','power_two_thirds'].includes(key))return raw`Real domain: all real x, using the real cube root. The first derivative is not finite at zero.`;
  if(['arcsine','arccosine'].includes(key))return raw`Real domain: \(-1\le x\le1\). The derivative is finite only for \(-1<x<1\).`;
  if(key==='tangent')return raw`Real domain: \(x\ne\pi/2+k\pi\), \(k\in\mathbb Z\). The board uses the continuous branch between its nearest poles; angles are in radians.`;
  if(['circle_upper','circle_lower'].includes(key))return raw`Real domain of this semicircle: \(-2\le x\le2\). Its finite-gradient derivative requires \(-2<x<2\).`;
  // All other entries in the current catalogue have an everywhere-defined real
  // scalar formula. For future lessons, avoid inferring this from a display range.
  const allReal=['constant','linear','quadratic','cube','cubic','quartic','gaussian','rational','sine','cosine','exponential','exponential_two','arctangent','sinh','cosh','tanh','piecewise_cubic','piecewise_valley','log_composite','exp_sine','vector_parabola','vector_wave'];
  return allReal.includes(key)?'Real domain of the selected scalar function: all real x.':'Use the stated real domain of this function; exclude undefined or non-real values.';
 }
 function describe(M,key,quest,graph,board){
  const c=M?.curves?.[key];if(!c)throw new RangeError(`Unknown function: ${key}`);
  const kind=typeof quest==='string'?quest:quest?.kind;
  const names={min:'Find a local minimum',max:'Find a local maximum',inflection:'Find an inflection point',derivative:'Find the first derivative',second:'Find the second derivative',inverse:'Find the inverse on this branch',normal:'Find the normal at the selected point'};
  if(!names[kind])throw new RangeError(`Unknown mathematical case: ${kind}`);
  const lesson=c.lesson||{},fallback=legacyRules[key]||[];
  const first=lesson.first||raw`f'(x)=${toX(c.derivativeTex)}`;
  const second=lesson.second||raw`f''(x)=${toX(c.secondTex)}`;
  const rule=lesson.rule||fallback[0]||'Differentiate the stated scalar function on its domain.';
  const secondRule=lesson.secondRule||fallback[1]||rule;
  const pointCase=['min','max','inflection'].includes(kind);
  // A catalogue rule can continue with a solved classification at a named join.
  // Keep its differentiation instruction, but leave that answer for completion.
  const firstInstruction=pointCase?rule.split(/(?<=[.!?])\s+/)[0]:rule;
  const domain=Number.isFinite(board?.xmin)&&Number.isFinite(board?.xmax)?[board.xmin,board.xmax]:graph?.domain||c.domain||c.range.slice(0,2);
  const result={title:names[kind],formulas:[raw`f(x)=${c.tex}`,first],method:[],meaning:'',domain:`Displayed x-window: ${interval(domain)}. Use only points where the function and the required derivatives are defined. Decimal endpoints are rounded.`};
  if(pointCase){
   result.formulas.push(second);
   if(kind==='inflection'){
    result.method=[firstInstruction,raw`Differentiate again. Consider where \(f''\) is zero or undefined, while the original curve remains continuous.`,raw`Check for a change of concavity across the candidate: opposite signs of \(f''\) on the two sides establish a change where that derivative exists. Then use \(f\) to find the height.`];
    result.meaning=raw`An inflection is a change between upward and downward bending of the original curve. The condition \(f''(a)=0\) alone is not sufficient; \(f''\) may instead be undefined at the point. A discontinuity is not an inflection point.`;
   }else{
    const minimum=kind==='min';
    result.method=[firstInstruction,raw`For differentiable interior points, find candidates from \(f'(a)=0\). Also inspect corners where the derivative is undefined; use one-sided comparisons at domain endpoints.`,raw`For a ${minimum?'minimum':'maximum'}, check that the function changes from ${minimum?'decreasing to increasing':'increasing to decreasing'}: \(f'\) changes from ${minimum?'negative to positive':'positive to negative'} where it exists. At a corner, compare both sides directly. Then find the height using \(f\).`];
    result.meaning=raw`A local ${minimum?'minimum':'maximum'} compares nearby values of the original function. A zero first derivative alone is not sufficient. At a stationary point where the second derivative test applies, \(f''(a)${minimum?'>':'<'}0\) proves a local ${minimum?'minimum':'maximum'}; \(f''(a)=0\) leaves that test inconclusive.`;
   }
  }else if(kind==='derivative'){
   result.method=[rule,raw`Use \(f'(x)\), rather than \(f(x)\), as the new graph's height at each x.`,raw`Read positive heights as increasing \(f\), negative heights as decreasing \(f\), and zero as a horizontal tangent where the derivative exists.`];
   result.meaning=raw`The first derivative gives the tangent gradient of the original curve. Its graph is not one tangent line. A corner has no unique derivative there; a zero derivative alone does not prove a maximum or minimum.`;
  }else if(kind==='second'){
   result.formulas.push(second);
   result.method=[rule,secondRule,raw`Plot \(f''(x)\) as the height. Positive values mean \(f'\) increases and \(f\) bends upwards; negative values mean \(f'\) decreases and \(f\) bends downwards.`];
   result.meaning=raw`The second derivative measures how the gradient changes. An inflection requires a change of concavity: a zero alone is not enough, and the second derivative can be undefined at the candidate. Check the original function's continuity and the two sides.`;
  }else if(kind==='inverse'){
   if(!graph?.originalDomain||!graph?.domain||!graph?.sourceTex||!graph?.tex)throw new TypeError('An inverse case needs the current one-to-one branch graph.');
   result.formulas=[raw`f(x)=${c.tex}`,raw`f^{-1}(x)=${graph.tex}`,raw`(t,f(t))\longmapsto(f(t),t)`];
   result.method=[raw`Restrict the original function to the stated one-to-one branch: \(${graph.sourceTex}\). Each output must come from just one input.`,graph.steps||'Swap the input and output coordinates and solve on the stated branch.',raw`The branch's range becomes the inverse's domain. Reflect its points in \(y=x\), and check \(f^{-1}(f(t))=t\) on that branch.`];
   result.meaning=raw`An inverse undoes the chosen one-to-one function. The notation \(f^{-1}\) means inverse, not the reciprocal \(1/f\). Any vector or implicit example uses only its named scalar component or branch.`;
   result.domain=`Chosen original input interval: ${interval(graph.originalDomain)}. Inverse input interval: ${interval(graph.domain)}; its output interval is ${interval(graph.originalDomain)}. Decimal endpoints are rounded.`;
  }else if(kind==='normal'){
   if(!graph)throw new TypeError('A normal case needs the current anchor graph.');
   if(![graph.a,graph.y,graph.tangent].every(Number.isFinite)){
    result.method=[rule,'Check whether the selected point has a well-defined tangent before constructing its normal.','At a corner or a non-finite derivative, analyse the tangent separately; do not automatically apply a reciprocal-gradient formula.'];
    result.meaning='A normal is perpendicular to a well-defined tangent. A vertical tangent and a corner require separate analysis; neither should be treated as an ordinary finite-gradient case.';
   }else{
    const a=number(graph.a),y=number(graph.y),tangent=number(graph.tangent);
    result.method=[rule,raw`Use the live anchor \(a\approx${a}\): \(A=(a,f(a))\approx(${a},${y})\), with tangent gradient \(f'(a)\approx${tangent}\).`,graph.vertical||graph.tangent===0?raw`A horizontal tangent has a vertical normal: \(x=a\). Do not divide by zero.`:raw`Use the perpendicular gradient \(-1/f'(a)\) and pass the line through \(A\): \(y-f(a)=-(x-a)/f'(a)\).`];
    result.formulas.push(graph.vertical||graph.tangent===0?raw`x=a,\qquad a\approx${a}`:raw`y-f(a)=-\frac{x-a}{f'(a)},\qquad a\approx${a}`);
    result.meaning='The normal is perpendicular to the tangent at the selected point, and changes when you move that point. Coordinate scales may differ, so use mathematical gradients rather than the apparent screen angle.';
   }
  }
  result.domain=`${realDomain(key,c)} ${result.domain}${c.context?' '+c.context:''}`;
  return result;
 }
 const api={describe};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GridderCaseMaths=api;
})(typeof window!=='undefined'?window:globalThis);
