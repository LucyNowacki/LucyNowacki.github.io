/* Worked solutions use analytic roots; decimals are only display approximations. */
(function(root){
  'use strict';
  const raw=String.raw;
  const derivations={
    quadratic:{first:raw`f'(x)=2x`,second:raw`f''(x)=2`,rule:'Use the power rule: multiply by the power, then reduce the power by one.',stationary:raw`2x=0\quad\Rightarrow\quad x=0`,inflections:'There are no zeros of the second derivative.'},
    cubic:{first:raw`f'(x)=3x^2-3`,second:raw`f''(x)=6x`,rule:'Differentiate each term: x cubed gives 3x squared, and −3x gives −3.',stationary:raw`3x^2-3=0\Rightarrow x^2=1\Rightarrow x=\pm1`,inflections:raw`6x=0\Rightarrow x=0`,sign:'The sign of 6x is negative to the left of zero and positive to its right.'},
    quartic:{first:raw`f'(x)=4x^3-4x`,second:raw`f''(x)=12x^2-4`,rule:'Use the power rule on each term: x to the fourth gives 4x cubed; −2x squared gives −4x.',stationary:raw`4x^3-4x=4x(x-1)(x+1)=0\Rightarrow x=-1,\;0,\;1`,inflections:raw`12x^2-4=0\Rightarrow x^2=\frac13\Rightarrow x=\pm\frac1{\sqrt3}`,sign:raw`Since \(f''(x)=4(3x^2-1)\), it is positive outside \((-1/\sqrt3,1/\sqrt3)\) and negative inside. Each endpoint therefore changes the sign.`},
    sine:{first:raw`f'(x)=\cos x`,second:raw`f''(x)=-\sin x`,rule:'For angles in radians, the derivative of sine is cosine, and the derivative of cosine is minus sine. These are new calculus rules.',stationary:raw`\cos x=0\Rightarrow x=\frac\pi2+k\pi,\quad k\in\mathbb Z`,inflections:raw`-\sin x=0\Rightarrow x=k\pi,\quad k\in\mathbb Z`,sign:raw`Near \(x=k\pi\), write \(x=k\pi+t\). Then \(f''(x)=-(-1)^k\sin t\). For small positive and negative \(t\), the signs are opposite.`},
    gaussian:{first:raw`f'(x)=e^{-x^2}(-2x)=-2xe^{-x^2}`,second:raw`f''(x)=-2e^{-x^2}+4x^2e^{-x^2}=(4x^2-2)e^{-x^2}`,rule:'Use the chain rule for the exponential: differentiate the inside −x squared as well. Then use the product rule to differentiate −2x times the exponential.',stationary:raw`-2xe^{-x^2}=0\Rightarrow x=0\quad(e^{-x^2}>0)`,inflections:raw`(4x^2-2)e^{-x^2}=0\Rightarrow x^2=\frac12\Rightarrow x=\pm\frac1{\sqrt2}`,sign:raw`The exponential is always positive, so only \(4x^2-2\) controls the sign: negative between the two roots, positive outside. Each root changes the bending.`},
    rational:{first:raw`f'(x)=\frac{1(1+x^2)-x(2x)}{(1+x^2)^2}=\frac{1-x^2}{(1+x^2)^2}`,second:raw`f''(x)=\frac{-2x}{(1+x^2)^2}-\frac{4x(1-x^2)}{(1+x^2)^3}=\frac{2x(x^2-3)}{(1+x^2)^3}`,rule:'Use the quotient rule: bottom times derivative of top, minus top times derivative of bottom, all divided by bottom squared. Differentiate once more using the product and chain rules.',stationary:raw`\frac{1-x^2}{(1+x^2)^2}=0\Rightarrow 1-x^2=0\Rightarrow x=\pm1`,inflections:raw`2x(x^2-3)=0\Rightarrow x=-\sqrt3,\;0,\;\sqrt3`,sign:raw`The denominator \((1+x^2)^3\) is positive. In \(2x(x-\sqrt3)(x+\sqrt3)\), exactly one linear factor changes sign at each of the three distinct roots; the other factors remain nonzero.`}
  };
  const n=x=>Math.abs(x)<1e-9?'0':Number(x.toFixed(4)).toString();
  function exactX(key,p){
    if(p.exact)return p.exact;
    const sign=p.x<0?'-':'';
    if(key==='quartic'&&p.kind==='inflection')return sign+raw`\frac1{\sqrt3}`;
    if(key==='gaussian'&&p.kind==='inflection')return sign+raw`\frac1{\sqrt2}`;
    if(key==='rational'&&p.kind==='inflection'&&Math.abs(p.x)>.1)return sign+raw`\sqrt3`;
    if(key==='sine'){
      const k=Math.round(p.x/(Math.PI/2));if(k===0)return '0';
      if(k%2===0)return `${k/2===-1?'-':k/2===1?'':k/2}\\pi`;
      return raw`\frac{${k===-1?'-':k===1?'':k}\pi}{2}`;
    }
    return n(p.x);
  }
  function substitution(key,x,order,M){
    const z=raw`\left(${x}\right)`;
    const formula={
      quadratic:[raw`2\cdot${z}`,'2'],
      cubic:[raw`3${z}^2-3`,raw`6\cdot${z}`],
      quartic:[raw`4${z}^3-4${z}`,raw`12${z}^2-4`],
      sine:[raw`\cos ${z}`,raw`-\sin ${z}`],
      log:[raw`\frac1{${z}}`,raw`-\frac1{${z}^2}`],
      gaussian:[raw`-2${z}e^{-${z}^2}`,raw`(4${z}^2-2)e^{-${z}^2}`],
      rational:[raw`\frac{1-${z}^2}{(1+${z}^2)^2}`,raw`\frac{2${z}(${z}^2-3)}{(1+${z}^2)^3}`]
    };
    if(formula[key])return formula[key][order-1];
    const c=M?.curves[key],tex=order===1?c?.derivativeTex:c?.secondTex;
    return tex?.replace(/\\[A-Za-z]+|x/g,t=>t==='x'?z:t)||'';
  }
  function renderCataloguePoint(key,p,M){
    const c=M.curves[key],d=c.lesson,a=exactX(key,p),eq=tex=>raw`\[${tex}\]`,item=(title,body)=>`<li><h3>${title}</h3>${body}</li>`;
    const type=p.kind==='min'?'local minimum':p.kind==='max'?'local maximum':'inflection point';
    const delta=Math.min(.1,(p.x-c.range[0])/2,(c.range[1]-p.x)/2),left=p.x-delta,right=p.x+delta;
    let html=`<h2>Find this ${type}, step by step</h2><p>Original function: ${raw`\(f(x)=${c.tex}\)`}.</p><p>${c.context||''}</p><ol class="worked-steps">`;
    html+=item('Differentiate the function',`<p>${d.rule}</p>`+eq(d.first)+eq(d.second));
    html+=item(p.kind==='inflection'?'Find a possible change of bending':'Find a flat tangent',eq(raw`${p.kind==='inflection'?"f''":"f'"}(a)=0,\quad a=${a}`)+`<p>This is a candidate. Classify it using the signs around it.</p>`);
    if(p.kind==='inflection')html+=item('Check bending on both sides',eq(raw`f''(${n(left)})\approx${n(c.second(left))},\quad f''(${n(right)})\approx${n(c.second(right))}`)+`<p>The displayed derivative formulas give opposite signs to the left and right of this root; the decimal values illustrate that change. The original curve changes its bending. A zero alone is not enough.</p>`);
    else if(Math.abs(c.second(p.x))>1e-10)html+=item('Use the second derivative test',eq(raw`f''(${a})\approx${n(c.second(p.x))}${p.kind==='min'?'>0':'<0'}`)+`<p>At a stationary point, ${p.kind==='min'?'positive':'negative'} second derivative proves a local ${p.kind==='min'?'minimum':'maximum'}.</p>`);
    else html+=item('Use the first derivative sign test',eq(raw`f''(${a})=0`)+`<p>The second derivative test is inconclusive. Check the sign of the first derivative instead:</p>`+eq(raw`f'(${n(left)})\approx${n(c.derivative(left))},\quad f'(${n(right)})\approx${n(c.derivative(right))}`)+`<p>The branch formulas show decreasing on the left and increasing on the right, which proves this local minimum.</p>`);
    html+=item('Find the height',eq(raw`f(${a})\approx${n(c.value(p.x))}`)+eq(raw`A\approx(${n(p.x)},${n(c.value(p.x))})`)+`<p>Coordinate decimals are rounded; the exact candidate is stated above.</p>`);
    return html+'</ol>';
  }
  function render(key,p,M){
    const c=M.curves[key],d=derivations[key];if(!d)return c.lesson?renderCataloguePoint(key,p,M):'';
    const x=exactX(key,p),type=p.kind==='min'?'local minimum':p.kind==='max'?'local maximum':'inflection point';
    const z=raw`\left(${x}\right)`;
    const heights={quadratic:raw`${z}^2=0`,cubic:raw`${z}^3-3${z}=${n(c.value(p.x))}`,
      quartic:raw`${z}^4-2${z}^2=${p.kind==='inflection'?'-\\frac59':p.kind==='min'?'-1':'0'}`,
      sine:raw`\sin ${z}=${n(c.value(p.x))}`,
      gaussian:raw`e^{-${z}^2}=${p.kind==='max'?'1':'e^{-1/2}'}`,
      rational:raw`\frac{${z}}{1+${z}^2}=${p.x===0?'0':p.kind==='inflection'?(p.x<0?'-':'')+'\\frac{\\sqrt3}{4}':(p.x<0?'-':'')+'\\frac12'}`};
    const eq=tex=>raw`\[${tex}\]`;
    const item=(title,body)=>`<li><h3>${title}</h3>${body}</li>`;
    let result=`<h2>Find this ${type}, step by step</h2><p>Selected point on ${raw`\(f(x)=${c.tex}\)`}: ${raw`\(x=${x}\)`}. These steps explain how to find it, not just read it from the graph.</p><ol class="worked-steps">`;
    result+=item('Differentiate once',`<p>${d.rule}</p>`+eq(d.first));
    result+=item('Differentiate again',eq(d.second));
    result+=item(p.kind==='inflection'?'Find possible changes of bending':'Find the flat tangents',`<p>${p.kind==='inflection'?raw`Solve \(f''(x)=0\). These are candidates: zero alone is not proof of an inflection.`:raw`Solve \(f'(x)=0\). These are stationary points: their tangents are flat.`}</p>`+eq(p.kind==='inflection'?d.inflections:d.stationary)+`<p>Choose the candidate ${raw`\(a=${x}\)`} for this button.</p>`);
    if(p.kind==='inflection'){
      result+=item('Check the sign on both sides',`<p>${d.sign}</p>`+eq(raw`f''(${n(p.x-.1)})=${substitution(key,n(p.x-.1),2)}\approx ${n(c.second(p.x-.1))}`)+eq(raw`f''(${n(p.x+.1)})=${substitution(key,n(p.x+.1),2)}\approx ${n(c.second(p.x+.1))}`)+`<p>The decimal checks illustrate the algebraic sign change above. The second derivative has opposite signs on either side of this point, so the original curve changes its bending: this is an inflection point.</p>`);
    }else{
      result+=item('Classify the stationary point',eq(raw`f'\!\left(${x}\right)=${substitution(key,x,1)}=0`)+eq(raw`f''\!\left(${x}\right)=${substitution(key,x,2)}\approx ${n(c.second(p.x))}${p.kind==='min'?'>0':'<0'}`)+`<p>The tangent is flat and the second derivative is ${p.kind==='min'?'positive. The curve bends upwards, so this is a local minimum.':'negative. The curve bends downwards, so this is a local maximum.'}</p>`);
    }
    result+=item('Find its height and coordinates',`<p>Substitute this x-value into the original function, not into either derivative.</p>`+eq(raw`y=f\!\left(${x}\right)=${heights[key]}`)+eq(raw`(x,y)\approx\left(${n(p.x)},\,${n(c.value(p.x))}\right)`)+`<p>Decimal values are rounded. The exact x-value is shown above.</p>`);
    return result+'</ol>';
  }
  function renderGraph(key,q,M,target){
    const c=M.curves[key],d=derivations[key]||c.lesson||{first:raw`f'(x)=\frac1x`,second:raw`f''(x)=-\frac1{x^2}`,rule:'The derivative of natural logarithm is 1/x, for positive x.'};
    const eq=tex=>raw`\[${tex}\]`,item=(title,body)=>`<li><h3>${title}</h3>${body}</li>`;
    const toX=tex=>tex.replace(/\\(?:begin|end)\{[^}]+\}|\\[A-Za-z]+|a/g,t=>t==='a'?'x':t);
    let title='',body='';
    if(q.kind==='derivative'||q.kind==='second'){
      const second=q.kind==='second',order=second?2:1,symbol=second?"f''":"f'";
      title=second?'Find the second derivative':'Find the first derivative';
      body+=item('Differentiate the original function',`<p>${d.rule}</p>`+eq(d.first));
      if(second){
        const rules={quadratic:'Differentiate 2x once more: its derivative is the constant 2.',cubic:'Differentiate 3x² − 3: the power rule gives 6x; the constant disappears.',quartic:'Differentiate 4x³ − 4x term by term: 12x² − 4.',sine:'In radians, the derivative of cos(x) is −sin(x).',log:'Write 1/x as x to the power −1. The power rule gives −x to the power −2.',gaussian:'Differentiate −2x exp(−x²) with the product rule. The chain rule supplies another factor −2x when differentiating the exponential.',rational:'Differentiate (1 − x²)(1 + x²) to the power −2, using the product and chain rules, then combine the fractions.'};
        body+=item('Differentiate the first derivative',`<p>${rules[key]||d.secondRule}</p>`+eq(d.second));
      }
      const [lo,hi]=target.domain,examples=[lo,(lo+hi)/2,hi];
      body+=item('Calculate heights on the new graph',`<p>Use the ${second?'second':'first'} derivative as the height at each x. Decimals below are rounded.</p>`+examples.map(x=>eq(raw`${symbol}(${n(x)})=${substitution(key,n(x),order,M)}\approx ${n(target.value(x))}`)).join(''));
      body+=item('Interpret the graph',second?`<p>Positive f″ means the original function bends upwards; negative f″ means it bends downwards. This graph measures how the gradient changes. A zero alone does not prove an inflection: check the sign on both sides.</p>`:`<p>Positive f′ means the original function increases; negative f′ means it decreases. Zero means a flat tangent. This is the derivative graph, not a tangent line.</p>`);
    }else if(q.kind==='inverse'){
      title='Find the inverse function';
      body+=item('Choose a one-to-one branch',`<p>Every output must come from just one input. This level uses the coloured branch:</p>`+eq(raw`${target.sourceTex}`)+`<p>The restriction matters: a folded curve does not have a single inverse on its entire domain.</p>`);
      body+=item('Swap inputs and outputs',`<p>${target.steps}</p>`+eq(raw`y=f^{-1}(x)=${target.tex}`));
      body+=item('Check domain and range',`<p>The outputs of the chosen branch become the inputs of its inverse. For the displayed branch, endpoints are approximately:</p>`+eq(raw`\mathrm{Dom}(f^{-1})\approx[${n(target.domain[0])},${n(target.domain[1])}]`)+eq(raw`\mathrm{Range}(f^{-1})\approx[${n(target.originalDomain[0])},${n(target.originalDomain[1])}]`));
      const t=(target.originalDomain[0]+target.originalDomain[1])/2,x=c.value(t);
      body+=item('Verify by composition and reflection',eq(raw`f^{-1}(f(${n(t)}))\approx f^{-1}(${n(x)})\approx ${n(target.value(x))}`)+`<p>Each original point (t, f(t)) becomes (f(t), t). The inverse is the reflection of this branch in y = x. The notation f⁻¹ means inverse, not the reciprocal 1/f.</p>`);
    }else if(q.kind==='normal'){
      title='Find the perpendicular normal line';
      body+=item('Locate point A',eq(raw`a=${n(target.a)},\quad A=(a,f(a))\approx(${n(target.a)},${n(target.y)})`));
      body+=item('Find the tangent gradient',`<p>${d.rule}</p>`+eq(raw`f'(x)=${toX(c.derivativeTex)}`)+eq(raw`m_{\mathrm{t}}=f'(${n(target.a)})=${substitution(key,n(target.a),1,M)}\approx ${n(target.tangent)}`));
      body+=item('Turn through a right angle',eq(raw`(1,m_{\mathrm{t}})\cdot(-m_{\mathrm{t}},1)=-m_{\mathrm{t}}+m_{\mathrm{t}}=0`)+`<p>A zero dot product means these two directions are perpendicular.</p>`);
      if(target.vertical)body+=item('Use a vertical normal',`<p>The tangent is horizontal: its gradient is zero. Its normal is vertical, so it cannot be written as a finite-gradient function y = g(x). Do not divide by zero.</p>`+eq(raw`x=a=${n(target.a)}`));
      else body+=item('Use the negative reciprocal gradient',eq(raw`m_{\mathrm{n}}=-\frac1{m_{\mathrm{t}}}\approx ${n(target.slope)},\quad m_{\mathrm{t}}m_{\mathrm{n}}=-1`)+eq(raw`y-f(a)=-\frac{x-a}{f'(a)}`)+`<p>The normal passes through A and is perpendicular to its tangent. Discover its visible part on this board. Coordinate scales may differ, so use the gradients rather than the apparent screen angle.</p>`);
    }
    return `<h2>${title}, step by step</h2><p>Original function: ${raw`\(f(x)=${c.tex}\)`}.</p>${c.context?`<p>${c.context}</p>`:''}<ol class="worked-steps">${body}</ol><p>Every target rectangle touched by the new graph counts, including edges and corners.</p>`;
  }
  const api={render,renderGraph,exactX,substitution};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.derivativeWorked=api;
})(typeof window!=='undefined'?window:globalThis);
