/* Harmless weather presentation. All positions are grid coordinates transformed
   by px/py; all animation derives from GridderStormCloud's supplied clock. */
(function(root){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function line(g,points,width,colour,alpha=1){g.lineStyle(width,colour,alpha);g.beginPath();points.forEach((p,n)=>n?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokePath();}
function create(scene){
 const weather=scene.add.graphics().setDepth(17),cloud=scene.add.graphics().setDepth(19);
 const label=scene.add.text(0,0,'Hurry up!!',{fontFamily:'system-ui, sans-serif',fontSize:'13px',fontStyle:'bold',color:'#fff3ff'}).setDepth(19.1).setOrigin(.5);
 weather.name='gridder-storm-weather';cloud.name='gridder-storm-cloud';label.name='gridder-storm-shout';
 let diagnostic={visible:false};
 function render(s,g){
  weather.clear();cloud.clear();label.setVisible(false);diagnostic={visible:false};
  const st=s.storm;if(!st||!st.enabled||s.spidersEnabled===false)return;
  const scale=root.GridderSpriteMetrics?.scale(g)??1,reduced=root.GridderTheme?.reducedMotion?.()||false,t=reduced?0:st.clock;
  const bounds={l:g.l??g.px(0),r:(g.l??0)+g.pw,t:g.t??0,b:(g.t??0)+g.ph};
  const x=clamp(g.px(st.position.i),bounds.l+28*scale,bounds.r-28*scale),y=clamp(g.py(st.position.j),bounds.t+18*scale,bounds.b-16*scale);
  const footprint=st.footprint,particles=[];
  if(st.mode!=='dry'&&footprint){
   const fx=g.px(footprint.i),fy=g.py(footprint.j),rx=footprint.rx*g.cellWidth,ry=footprint.ry*g.cellHeight;
   for(let n=0;n<24;n++){
    const phase=((t/(st.mode==='snow'?2200:700)+n*.6180339)%1+1)%1;
    const margin=st.mode==='snow'?2.5*scale:4.5*scale;
    const u=clamp(Math.sin(n*2.3999632297)*.82+(st.mode==='snow'?Math.sin(t/500+n)*.035:0),-.9,.9);
    const px=fx+u*Math.max(0,rx-margin),extent=Math.sqrt(Math.max(0,1-u*u))*Math.max(0,ry-margin);
    const low=Math.max(fy-extent,bounds.t+margin),high=Math.min(fy+extent,bounds.b-margin);
    if(px<bounds.l+margin||px>bounds.r-margin||high<low)continue;
    const py=low+phase*(high-low);
    particles.push({x:px,y:py});
    if(st.mode==='snow'){
     for(let a=0;a<3;a++){const angle=a*Math.PI/3,dx=Math.cos(angle)*2.3*scale,dy=Math.sin(angle)*2.3*scale;line(weather,[{x:px-dx,y:py-dy},{x:px+dx,y:py+dy}],.8*scale,0xe5fbff,.72);}
    }else line(weather,[{x:px+1.5*scale,y:py-4*scale},{x:px,y:py}],1.2*scale,0x69d6ff,.6);
   }
  }
  let bolt=[];
  if(st.strikeAge>=0&&st.strikeAge<380&&st.boltTarget){
   const target={x:g.px(st.boltTarget.i),y:g.py(st.boltTarget.j)},origin=st.boltOrigin?{x:g.px(st.boltOrigin.i),y:g.py(st.boltOrigin.j)}:{x,y};
   for(let n=0;n<=7;n++){const q=n/7,jitter=n===0||n===7?0:Math.sin(n*17+(st.strikeId||0)*9)*7*scale;bolt.push({x:origin.x+(target.x-origin.x)*q+jitter,y:origin.y+8*scale+(target.y-origin.y-8*scale)*q});}
   // A small, local bolt; reduced motion keeps one steady dim drawing, no flashes.
   const alpha=reduced?.45:.8*(1-st.strikeAge/500);
   line(weather,bolt,6*scale,0x9759ff,alpha*.25);line(weather,bolt,2.4*scale,0x8ffaff,alpha);line(weather,bolt,.8*scale,0xffffff,alpha);
  }
  cloud.fillStyle(0x9b66ff,.13);cloud.fillEllipse(x,y,60*scale,30*scale);
  for(const q of [[-17,2,10],[0,-5,14],[17,2,10],[0,5,15]]){
   cloud.fillStyle(st.mode==='snow'?0x7184ae:0x493568,1);cloud.fillCircle(x+q[0]*scale,y+q[1]*scale,q[2]*scale);
   cloud.lineStyle(1.1*scale,st.mode==='rain'?0x76dfff:0xd8a4ff,.9);cloud.strokeCircle(x+q[0]*scale,y+q[1]*scale,q[2]*scale);
  }
  cloud.fillStyle(0x51416e,1);cloud.fillEllipse(x,y+3*scale,43*scale,17*scale);
  for(const side of [-1,1]){
   cloud.fillStyle(0xf7edff,1);cloud.fillEllipse(x+side*7*scale,y+2*scale,5*scale,6*scale);
   cloud.fillStyle(0x191129,1);cloud.fillCircle(x+side*6.5*scale,y+3*scale,1.5*scale);
   line(cloud,[{x:x+side*3*scale,y:y-3*scale},{x:x+side*11*scale,y:y-6*scale}],2*scale,0x24152e);
  }
  line(cloud,[{x:x-5*scale,y:y+10*scale},{x,y:y+8*scale},{x:x+5*scale,y:y+10*scale}],1.6*scale,0xffb7e2);
  if(st.shouting){
   const ly=clamp(y-32*scale,bounds.t+12*scale,bounds.b-12*scale),lx=clamp(x,bounds.l+48*scale,bounds.r-48*scale);
   cloud.fillStyle(0x251832,.94);cloud.fillRoundedRect(lx-45*scale,ly-11*scale,90*scale,22*scale,7*scale);
   cloud.lineStyle(scale,0xd696ff,.9);cloud.strokeRoundedRect(lx-45*scale,ly-11*scale,90*scale,22*scale,7*scale);
   label.setPosition(lx,ly).setScale(scale).setVisible(true);
  }
  diagnostic={visible:true,clock:st.clock,mode:st.mode,position:{x,y},footprint,particles,bolt,shouting:!!st.shouting,slip:st.slip,reduced};
 }
 return {render,metrics:()=>({...diagnostic,resourceCount:3,depths:[17,19,19.1]}),destroy(){weather.destroy();cloud.destroy();label.destroy();diagnostic={visible:false};}};
}
root.GridderStormActors={create};
})(window);
