(function (root) {
  'use strict';
  const curves = {
    gaussian: {
      label:'y = exp(−x²)', tex:'e^{-x^2}', derivativeTex:'-2ae^{-a^2}', secondTex:'(4a^2-2)e^{-a^2}', quotientTex:'\\frac{e^{-(a+h)^2}-e^{-a^2}}{h}',
      value:x=>Math.exp(-x*x), derivative:x=>-2*x*Math.exp(-x*x), second:x=>(4*x*x-2)*Math.exp(-x*x),
      secant:(a,h)=>Math.abs(-2*a*h-h*h)<1?Math.exp(-a*a)*Math.expm1(-2*a*h-h*h)/h:(Math.exp(-((a+h)**2))-Math.exp(-a*a))/h,
      points:[{x:-Math.SQRT1_2,kind:'inflection'},{x:0,kind:'max'},{x:Math.SQRT1_2,kind:'inflection'}],
      range:[-3,3,-.4,1.4],position:[-2.5,2.5,.05],initial:.5,gap:.8,ytick:.5,
      note:'A bell-shaped hill. Its shoulders change the way it bends.',
      challenges:[[0,'Find the flat top.'],[-2/Math.E,'Find gradient −0.7358 (approximately).'],[2/Math.E,'Find gradient 0.7358 (approximately).']]
    },
    quartic: {
      label:'y = x⁴ − 2x²',tex:'x^4-2x^2',derivativeTex:'4a^3-4a',secondTex:'12a^2-4',quotientTex:'4a^3+6a^2h+4ah^2+h^3-4a-2h',
      value:x=>x**4-2*x*x,derivative:x=>4*x**3-4*x,second:x=>12*x*x-4,
      secant:(a,h)=>4*a**3+6*a*a*h+4*a*h*h+h**3-4*a-2*h,
      points:[{x:-1,kind:'min'},{x:-1/Math.sqrt(3),kind:'inflection'},{x:0,kind:'max'},{x:1/Math.sqrt(3),kind:'inflection'},{x:1,kind:'min'}],
      range:[-1.8,1.8,-2,5],position:[-1.5,1.5,.05],initial:.5,gap:.3,ytick:1,
      note:'A W-shaped curve: two valleys, a central hill and two changes of bending.',
      challenges:[[0,'Find a flat tangent.'],[-1.5,'Where is the gradient −1.5?'],[1.5,'Where is the gradient 1.5?']]
    },
    rational: {
      label:'y = x / (1 + x²)',tex:'\\frac{x}{1+x^2}',derivativeTex:'\\frac{1-a^2}{(1+a^2)^2}',secondTex:'\\frac{2a(a^2-3)}{(1+a^2)^3}',quotientTex:'\\frac{1-a(a+h)}{(1+a^2)(1+(a+h)^2)}',
      value:x=>x/(1+x*x),derivative:x=>(1-x*x)/(1+x*x)**2,second:x=>2*x*(x*x-3)/(1+x*x)**3,
      secant:(a,h)=>(1-a*(a+h))/((1+a*a)*(1+(a+h)**2)),
      points:[{x:-Math.sqrt(3),kind:'inflection'},{x:-1,kind:'min'},{x:0,kind:'inflection'},{x:1,kind:'max'},{x:Math.sqrt(3),kind:'inflection'}],
      range:[-4,4,-.8,.8],position:[-3,3,.05],initial:.5,gap:.8,ytick:.25,
      note:'A flowing S-shaped curve whose tails return towards zero.',
      challenges:[[0,'Find a flat tangent.'],[1,'Where is the gradient 1?'],[-.12,'Where is the gradient −0.12?']]
    },
    quadratic: {
      label: 'y = x²', tex: 'x^2', derivativeTex: '2a', quotientTex: '2a+h',
      value: x => x*x, derivative: x => 2*x, secant: (a,h) => 2*a+h,
      second: () => 2, secondTex: '2', points: [{x:0,kind:'min'}],
      range: [-3.4,3.4,-1,11], position: [-2,2,.05], initial: 1, gap: 1.2, ytick: 2,
      note: 'A bowl-shaped curve. Can you find its lowest point?',
      challenges: [[0,'Where is the curve flat?'],[2,'Where is the gradient 2?'],[-2,'Where is the gradient −2?']]
    },
    sine: {
      label: 'y = sin(x)', tex: '\\sin x', derivativeTex: '\\cos a',
      quotientTex: '\\frac{\\sin(a+h)-\\sin a}{h}',
      value: Math.sin, derivative: Math.cos,
      secant: (a,h) => Math.cos(a+h/2)*(Math.sin(h/2)/(h/2)),
      second: x => -Math.sin(x), secondTex: '-\\sin a',
      points: [{x:-Math.PI,kind:'inflection'},{x:-Math.PI/2,kind:'min'},{x:0,kind:'inflection'},{x:Math.PI/2,kind:'max'},{x:Math.PI,kind:'inflection'}],
      range: [-4.5,4.5,-1.8,1.8], position: [-3.2,3.2,.01], initial: .6, gap: 1.2, ytick: .5,
      note: 'A repeating wave. Here x is measured in radians: π radians = 180°.',
      challenges: [[0,'Find an almost flat point.'],[1,'Find a gradient close to 1.'],[-1,'Find a gradient close to −1.']]
    },
    log: {
      label: 'y = ln(x)', tex: '\\ln x', derivativeTex: '\\frac{1}{a}',
      quotientTex: '\\frac{\\ln(a+h)-\\ln a}{h}',
      value: x => x>0?Math.log(x):NaN, derivative: x => x>0?1/x:NaN,
      secant: (a,h) => a>0 && a+h>0?Math.log1p(h/a)/h:NaN,
      second: x => x>0?-1/(x*x):NaN, secondTex: '-\\frac{1}{a^2}', points: [],
      range: [.08,4.3,-3,2], position: [.4,3,.05], initial: 1, gap: 1.2, ytick: 1,
      note: 'ln means natural logarithm. This curve only exists for x > 0, so both points stay to the right of zero.',
      challenges: [[1,'Where is the gradient 1?'],[2,'Where is the gradient 2?'],[.5,'Where is the gradient 0.5?']]
    },
    cubic: {
      label: 'y = x³ − 3x', tex: 'x^3-3x', derivativeTex: '3a^2-3',
      quotientTex: '3a^2+3ah+h^2-3',
      value: x => x*x*x-3*x, derivative: x => 3*x*x-3,
      secant: (a,h) => 3*a*a+3*a*h+h*h-3,
      second: x => 6*x, secondTex: '6a', points: [{x:-1,kind:'max'},{x:0,kind:'inflection'},{x:1,kind:'min'}],
      range: [-2.4,2.4,-7,7], position: [-1.5,1.5,.05], initial: .5, gap: .8, ytick: 2,
      note: 'A curve with two turning points. Watch the gradient change sign.',
      challenges: [[0,'Find either flat point.'],[-3,'Where is the gradient −3?'],[3.75,'Where is the gradient 3.75?']]
    }
  };
  const maths = {
    curves,
    value: (step,x,key='quadratic') => step===1?2*x+1:curves[key].value(x),
    derivative: (step,x,key='quadratic') => step===1?2:curves[key].derivative(x),
    secondDerivative: (step,x,key='quadratic') => step===1?0:curves[key].second(x),
    secant: (step,a,h,key='quadratic') => h===0?null:step===1?2:curves[key].secant(a,h),
    maxGap: (key,a,side) => key==='log' && side<0?Math.min(curves[key].gap,.9*a):curves[key].gap,
    pointsInRange: (key,min,max) => {
      if(key!=='sine')return curves[key].points.filter(p=>p.x>=min&&p.x<=max);
      const points=[];
      for(let k=Math.ceil(min/(Math.PI/2));k<=Math.floor(max/(Math.PI/2));k++)points.push({x:k*Math.PI/2,kind:k%2===0?'inflection':((k%4+4)%4===1?'max':'min')});
      return points;
    },
    sliderBounds: (step,key,xmin,xmax) => {
      const min=step>1&&key==='log'?Math.max(xmin,Math.max(1e-12,(xmax-xmin)*1e-8)):xmin;
      return {min,max:xmax,disabled:min>=xmax};
    },
    format: x => Math.abs(x)<.000005?'0':Number(x.toFixed(4)).toString().replace('-','−')
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = maths;
  else root.derivativeMath = maths;
})(typeof window !== 'undefined' ? window : globalThis);
