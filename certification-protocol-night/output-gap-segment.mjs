import {math} from './math-render.mjs?v=103';
const tex=String.raw;let nextId=0;
export function gapSegmentMarkup(){return `<g data-gap-segment><path data-gap-bracket class="output-gap-bracket"/></g>`;}
export function gapBracket(a,b,offset=0){
 const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),u=length?[dx/length,dy/length]:[0,-1];let n=[-u[1],u[0]];if(n[0]<0)n=n.map(x=>-x);
 const p=[a[0]+offset*n[0],a[1]+offset*n[1]],q=[b[0]+offset*n[0],b[1]+offset*n[1]];
 return {p,q,n,length,path:`M${p[0]} ${p[1]}L${q[0]} ${q[1]}`};
}
export function updateGapSegment(svg,a,b,physicalGap){
 const g=svg.querySelector('[data-gap-segment]');if(!g)return;
 const clip=svg.querySelector('clipPath'),rect=clip?.querySelector('rect');let lo=0,hi=1;
 if(rect){const x=+rect.getAttribute('x'),y=+rect.getAttribute('y'),w=+rect.getAttribute('width'),h=+rect.getAttribute('height');const dx=b[0]-a[0],dy=b[1]-a[1];for(const [p,q] of [[-dx,a[0]-x],[dx,x+w-a[0]],[-dy,a[1]-y],[dy,y+h-a[1]]]){if(!p){if(q<0)hi=-1;}else if(p<0)lo=Math.max(lo,q/p);else hi=Math.min(hi,q/p);}g.querySelector('[data-gap-bracket]').setAttribute('clip-path',`url(#${clip.id})`);}
 g.style.display=lo<=hi?'':'none';const aa=a.map((v,i)=>v+lo*(b[i]-v)),bb=a.map((v,i)=>v+hi*(b[i]-v)),r=gapBracket(aa,bb);
 const width=+svg.getAttribute('viewBox').split(' ')[2],height=+svg.getAttribute('viewBox').split(' ')[3];
 g.dataset.physicalGap=String(physicalGap);g.dataset.start=a.join(',');g.dataset.end=b.join(',');
 g.querySelector('[data-gap-bracket]').setAttribute('d',gapBracket(a,b).path);
 const dialog=svg.parentElement.querySelector('.output-gap-help dialog');if(dialog){if(!dialog.id)dialog.id=`output-gap-segment-help-${++nextId}`;g.dataset.holdExplanation=dialog.id;}
}
export function drawCanvasGap(ctx,a,b,text,width,height){
 const r=gapBracket(a,b);ctx.save();ctx.strokeStyle='#ffc46b';ctx.lineWidth=4.2;ctx.lineCap='round';ctx.setLineDash([.5,7]);ctx.beginPath();ctx.moveTo(...r.p);ctx.lineTo(...r.q);ctx.stroke();ctx.setLineDash([]);
 ctx.restore();
}
