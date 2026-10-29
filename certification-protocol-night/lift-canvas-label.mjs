// The story canvas uses the same lift indices as the HTML and SVG labels.
const token='y^{B_{lift}}';
function layout(ctx,text){
 const base=ctx.font,size=parseFloat(base.match(/[\d.]+(?=px)/)?.[0]||'14');
 const font=k=>base.replace(/[\d.]+px/,`${size*k}px`),parts=[];let width=0;
 function add(text,scale=1,dy=0){ctx.font=font(scale);const w=ctx.measureText(text).width;parts.push({text,font:ctx.font,x:width,dy:size*dy});width+=w;}
 const runs=text.split(token);runs.forEach((run,i)=>{if(i){add('y');add('B',.7,-.5);add('lift',.48,-.25);}add(run);});ctx.font=base;return {parts,width};
}
export function measureLiftLabel(ctx,text){return layout(ctx,text).width;}
export function drawLiftLabel(ctx,text,x,y){const {parts}=layout(ctx,text);ctx.save();for(const p of parts){ctx.font=p.font;ctx.fillText(p.text,x+p.x,y+p.dy);}ctx.restore();}
