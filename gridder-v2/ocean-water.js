/* Deep-water backend: persistent procedural WebGL quads and a Canvas fallback.
   No animation loop: liquid-gaps supplies the deterministic presentation phase. */
(function(root){
'use strict';
let serial=0;
const fragmentSource=`precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uSeed;
uniform float uSeabedEnabled;
uniform float uRefraction;
uniform float uBloodLevel;
uniform float uBloodClock;
uniform vec2 uBloodSource;
uniform sampler2D uPoolMask;
varying vec2 outTexCoord;
float hash(vec2 p){vec3 p3=fract(p.xyx*.1031+uSeed*.000013);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
vec3 bed(vec2 p){
 float grain=noise(p*110.),dune=sin(p.x*34.+noise(p*5.)*5.)*.5+.5;
 vec3 sand=mix(vec3(.28,.43,.42),vec3(.62,.67,.49),.4+grain*.35+dune*.15);
 vec2 cell=floor(p*6.),f=fract(p*6.);float rock=0.,shade=0.,shadow=0.;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
  vec2 id=cell+vec2(float(x),float(y));float r=hash(id);
  vec2 centre=vec2(float(x),float(y))+.2+.6*vec2(hash(id+5.),hash(id+9.));
  vec2 delta=f-centre;float angle=r*6.28;
  vec2 d=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*delta;
  d*=vec2(1.,1.15+hash(id+3.)*.7);float radius=.14+.25*r;
  float shape=radius*(1.+.10*sin(atan(d.y,d.x)*3.+r*11.));
  float a=(1.-smoothstep(shape*.86,shape,length(d)))*step(.32,r);
  shadow=max(shadow,(1.-smoothstep(radius*.65,radius*1.3,length(delta-vec2(.06,.08))))*step(.32,r));
  float height=sqrt(max(0.,1.-dot(d,d)/(radius*radius)));
  rock=max(rock,a);shade=max(shade,a*clamp(.3+height*.5-dot(delta,vec2(1.,1.5)),.12,1.));
 }
 return mix(sand*(1.-shadow*.3),mix(vec3(.12,.22,.25),vec3(.65,.67,.55),shade),rock);
}
float caustics(vec2 p,float t){
 vec2 cell=floor(p),f=fract(p);float first=10.,second=10.;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
  vec2 offset=vec2(float(x),float(y)),id=cell+offset;
  vec2 centre=offset+.5+.28*sin(vec2(hash(id+17.),hash(id+31.))*6.283+t*.36);
  float d=length(f-centre);
  if(d<first){second=first;first=d;}else second=min(second,d);
 }
 return 1.-smoothstep(.015,.09,second-first);
}
void main(){
 vec2 uv=outTexCoord;float t=uTime;
 // CanvasTexture uploads have bottom-up sampler coordinates; procedural UVs remain top-down.
 // Clamp to texel centres: bilinear sampling must never wrap a wet opposite edge into a dry notch.
 vec2 maskUV=clamp(vec2(uv.x,1.0-uv.y),vec2(.5/512.),vec2(1.-.5/512.));
 vec4 poolMask=texture2D(uPoolMask,maskUV);if(poolMask.a<.001)discard;
 float edge=poolMask.r;
 float depth=smoothstep(.015,.14,edge);
 vec2 flow=vec2(sin(uv.y*15.+t*.63+uSeed*.001),cos(uv.x*13.-t*.47));
 vec2 centre=uv-vec2(.61,.53);float vortex=exp(-dot(centre,centre)*18.);
 flow+=vec2(-centre.y,centre.x)*vortex*3.*sin(t*.35+1.);
 vec2 ripple=flow*.012+vec2(sin(uv.x*29.+uv.y*17.+t),cos(uv.y*26.-uv.x*12.-t*.8))*.004;
 vec2 refracted=uv+ripple*(.25+depth*.75)*uRefraction+vec2(.015,.028)*depth;
 vec3 bottom=mix(vec3(.43,.55,.49),bed(refracted*vec2(uResolution.x/uResolution.y,1.)),uSeabedEnabled);
 // Selective absorption keeps the bottom visible through clear ocean-blue water.
 vec3 absorption=exp(-vec3(1.8,.65,.22)*(.35+depth*.55));
 vec3 colour=bottom*absorption+vec3(.008,.055,.17)*depth;
 float caustic=caustics(refracted*vec2(uResolution.x/uResolution.y,1.)*6.+flow*.18,t);
 colour+=vec3(.10,.23,.27)*caustic*(.3+.7*depth);
 // Recessed rocky walls, a shadowed north/west lip and a light lower ledge.
 float wall=1.-smoothstep(.025,.13,edge);
 colour=mix(colour,vec3(.018,.085,.18)+vec3(.035,.09,.13)*noise(uv*45.),wall*.78);
 colour*=.65+.35*smoothstep(.015,.09,min(uv.x,uv.y));
 colour+=vec3(.035,.15,.24)*(1.-smoothstep(.015,.045,min(1.-uv.x,1.-uv.y)));
 float reflection=pow(max(0.,sin(uv.x*9.+uv.y*7.+t*.35)),18.);
 colour+=vec3(.10,.19,.25)*reflection*.28;
 float rim=(1.-smoothstep(.005,.018,edge))*.24;
 colour+=vec3(.08,.35,.48)*rim;
 // Stain grows from the capture point; the existing pool mask confines it.
 float spread=.035+sqrt(clamp(uBloodLevel,0.,1.))*.75;
 float cloud=1.-smoothstep(spread*.3,spread,length((uv-uBloodSource)*vec2(uResolution.x/uResolution.y,1.)) + (noise(uv*18.+t*.07)-.5)*.09);
 float stain=cloud*clamp(uBloodLevel*2.5,0.,.72);
 vec3 blood=mix(vec3(.36,.018,.055),vec3(.57,.055,.13),.5+.5*sin(uBloodClock*.001+t*.25));
 colour=mix(colour,blood,stain);
 gl_FragColor=vec4(colour*poolMask.a,poolMask.a);
}
`;
function create(scene){
 const webgl=scene.sys.renderer.type===Phaser.WEBGL,items=[];let activeCount=0;
 let uploads=0,updates=0;
 const randomGenerator=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 function bedCanvas(seed){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;
  const c=canvas.getContext('2d'),rand=randomGenerator(seed||12345),pixels=c.createImageData(256,192);
  for(let y=0;y<192;y++)for(let x=0;x<256;x++){
   const noise=(rand()-.5)*22+Math.sin(x*.23+Math.sin(y*.07)*2)*6,i=(y*256+x)*4;
   pixels.data[i]=100+noise;pixels.data[i+1]=158+noise;pixels.data[i+2]=181+noise*.7;pixels.data[i+3]=255;
  }
  c.putImageData(pixels,0,0);
  for(let n=0;n<72;n++){
   const x=rand()*256,y=rand()*192,r=2+rand()*9;
   c.fillStyle='rgba(0,25,45,.28)';c.beginPath();c.ellipse(x+2,y+3,r*1.2,r*.7,0,0,Math.PI*2);c.fill();
   const shade=c.createRadialGradient(x-r*.35,y-r*.35,.1,x,y,r);shade.addColorStop(0,'#9eaea2');shade.addColorStop(.55,'#688b92');shade.addColorStop(1,'#345d76');
   c.fillStyle=shade;c.beginPath();c.ellipse(x,y,r,r*.7,rand(),0,Math.PI*2);c.fill();
  }
  return canvas;
 }
 function maskFor(item,pool){
  const size=512,ctx=item.mask.getContext(),pixels=ctx.createImageData(size,size),wall=item.wall.getContext('2d'),wallPixels=wall.createImageData(size,size);
  const cells=pool.cells||[{x:pool.x,y:pool.y,w:pool.w,h:pool.h}],edges=pool.boundary||[],inset=pool.inset||0,unit=Math.min(pool.w,pool.h);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const px=pool.x+(x+.5)/size*pool.w,py=pool.y+(y+.5)/size*pool.h;
   if(!cells.some(c=>px>=c.x&&px<=c.x+c.w&&py>=c.y&&py<=c.y+c.h))continue;
   let distance=Infinity;
   for(const edge of edges){const dx=edge.b.x-edge.a.x,dy=edge.b.y-edge.a.y,t=Math.max(0,Math.min(1,((px-edge.a.x)*dx+(py-edge.a.y)*dy)/(dx*dx+dy*dy)));distance=Math.min(distance,Math.hypot(px-edge.a.x-dx*t,py-edge.a.y-dy*t));}
   if(!edges.length)distance=Math.min(px-pool.x,pool.x+pool.w-px,py-pool.y,pool.y+pool.h-py);
   const aa=Math.max(pool.w,pool.h)/size,alpha=Math.max(0,Math.min(1,(distance-inset)/aa)),i=(y*size+x)*4;
   pixels.data[i]=Math.round(Math.min(1,distance/unit)*255);pixels.data[i+3]=Math.round(alpha*255);
   const depth=Math.max(0,Math.min(1,(distance-inset)/(unit*.13))),shade=(1-depth)*(1-depth);
   wallPixels.data[i]=2;wallPixels.data[i+1]=24;wallPixels.data[i+2]=54;wallPixels.data[i+3]=Math.round(shade*.8*alpha*255);
  }
  ctx.putImageData(pixels,0,0);item.mask.refresh();wall.putImageData(wallPixels,0,0);
 }
 function make(pool){
  const maskKey='gridder-ocean-mask-'+(++serial),mask=scene.textures.createCanvas(maskKey,512,512),wall=document.createElement('canvas');wall.width=512;wall.height=512;
  const shared={maskKey,mask,wall};maskFor(shared,pool);
  if(webgl){
   const object=scene.add.shader({name:'GridderDeepOcean_v4',fragmentSource,initialUniforms:{uTime:0,uResolution:[pool.w,pool.h],uSeed:pool.seed%65536,uSeabedEnabled:1,uRefraction:1,uBloodLevel:0,uBloodClock:0,uBloodSource:[.5,.5],uPoolMask:0}},pool.x+pool.w/2,pool.y+pool.h/2,pool.w,pool.h,[maskKey]).setDepth(.14);
   object.setTextureCoordinates(0,0,1,0,0,1,1,1);object.setName('gridder-ocean-shader');
   // Force native compilation once. A broken WebGL shader must not silently fall back.
   try{object.renderNode.programManager.getCurrentProgramSuite();}catch(error){remove({object,...shared});throw error;}
   return {object,pool,seed:pool.seed,...shared};
  }
  const key='gridder-ocean-'+(++serial),texture=scene.textures.createCanvas(key,256,192),object=scene.add.image(pool.x+pool.w/2,pool.y+pool.h/2,key).setDepth(.14).setName('gridder-ocean-canvas');
  object.setDisplaySize(pool.w,pool.h);
  return {object,pool,key,texture,context:texture.getContext(),bed:bedCanvas(pool.seed),seed:pool.seed,lastPaint:null,...shared};
 }
 function remove(item){
  if(webgl){
   // Phaser4.2.1 ShaderQuad owns a VBO/VAOs not released by Shader.destroy.
   // Programs and the generic index buffer are shared and must remain untouched.
   const node=item.object.renderNode,r=node?.renderer;
   if(r){
    r.glWrapper.updateVAO({vao:null});r.glWrapper.updateBindingsArrayBuffer({bindings:{arrayBuffer:null}});
    for(const vao of new Set(Object.values(node.programManager.programs).map(s=>s.vao).filter(Boolean))){const at=r.glVAOWrappers.indexOf(vao);if(at>=0)r.glVAOWrappers.splice(at,1);vao.destroy();}
    r.deleteBuffer(node.vertexBufferLayout.buffer);
   }
  }
  item.object.destroy();if(item.maskKey)scene.textures.remove(item.maskKey);if(item.wall){item.wall.width=0;item.wall.height=0;}if(item.key)scene.textures.remove(item.key);if(item.bed){item.bed.width=0;item.bed.height=0;}}
 function setPools(pools){
  activeCount=pools.length;items.forEach((item,index)=>item.object.setVisible(index<activeCount));
  pools.forEach((pool,index)=>{
   const fresh=!items[index];if(fresh)items[index]=make(pool);
   const item=items[index];if(!fresh)maskFor(item,pool);item.object.setVisible(true);item.pool=pool;item.object.setPosition(pool.x+pool.w/2,pool.y+pool.h/2);
   if(webgl){
    // Shader's ComputedSize does not recalculate its cached display origin.
    item.object.setSize(pool.w,pool.h).updateDisplayOrigin();
    item.object.setUniform('uResolution',[pool.w,pool.h]);item.object.setUniform('uSeed',pool.seed%65536);
   }
   else{item.object.setDisplaySize(pool.w,pool.h);if(item.seed!==pool.seed){item.bed.width=0;item.bed.height=0;item.bed=bedCanvas(pool.seed);}item.lastPaint=null;}
   item.seed=pool.seed;
  });
 }
 function canvasPaint(item,time,blood){
  // 25 Hz bounded fallback uploads; no redraw for repeated paused snapshots.
  const frame=Math.floor(time*25),paintKey=frame+':'+JSON.stringify(blood||null);if(item.lastPaint===paintKey)return;item.lastPaint=paintKey;
  const c=item.context,t=frame/25,seed=item.seed%997,w=256,h=192;
  c.clearRect(0,0,w,h);
  // Sample thin displaced strips of the immutable seabed: moving optical refraction.
  for(let y=0;y<h;y+=2){const dx=Math.sin(y*.075+t*.65+seed)*3+Math.sin(y*.13-t*.4)*1.5;c.drawImage(item.bed,8+dx,y,w-16,2,0,y,w,2);}
  const water=c.createLinearGradient(0,0,w,h);water.addColorStop(0,'rgba(0,35,98,.25)');water.addColorStop(.55,'rgba(0,46,123,.40)');water.addColorStop(1,'rgba(0,80,153,.24)');c.fillStyle=water;c.fillRect(0,0,w,h);
  // Caustics illuminate the bottom instead of drawing a surface road-like grid.
  c.save();c.globalCompositeOperation='screen';
  for(let n=0;n<8;n++){
   c.beginPath();for(let k=0;k<=28;k++){const x=k*w/28,y=(n+.5)*h/8+Math.sin(k*.48+t*.6+n)*5+Math.cos(k*.27-t*.4)*4;if(k)c.lineTo(x,y);else c.moveTo(x,y);}
   c.strokeStyle='rgba(115,227,251,.13)';c.lineWidth=2;c.stroke();
  }
  c.restore();
  c.drawImage(item.wall,0,0,w,h);
  if(blood?.level>0){const level=Math.max(0,Math.min(1,blood.level)),hue=Math.sin((Number(blood.clock)||0)*.001+t*.25),red=Math.round(145+22*hue),blue=Math.round(35+12*hue),x=(blood.source?.x??item.pool.x+item.pool.w/2)-item.pool.x,y=(blood.source?.y??item.pool.y+item.pool.h/2)-item.pool.y,cx=x/item.pool.w*w,cy=y/item.pool.h*h,r=(.035+Math.sqrt(level)*.75)*h,gradient=c.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,r));gradient.addColorStop(0,'rgba('+red+',12,'+blue+','+Math.min(.72,level*2.5)+')');gradient.addColorStop(.55,'rgba('+(red-20)+',12,'+(blue+5)+','+Math.min(.52,level*1.8)+')');gradient.addColorStop(1,'rgba(125,12,40,0)');c.fillStyle=gradient;c.fillRect(0,0,w,h);}
  c.save();c.globalCompositeOperation='destination-in';c.drawImage(item.mask.getSourceImage(),0,0,w,h);c.restore();
  item.texture.refresh();uploads++;
 }
 function paint(time,stains=[]){updates++;items.slice(0,activeCount).forEach((item,index)=>{const blood=stains.find(b=>b.poolIndex===index),level=Math.max(0,Math.min(1,Number(blood?.level)||0)),source=blood?.source; if(webgl){item.object.setUniform('uTime',time);item.object.setUniform('uBloodLevel',level);item.object.setUniform('uBloodClock',Number(blood?.clock)||0);item.object.setUniform('uBloodSource',source?[(source.x-item.pool.x)/item.pool.w,(source.y-item.pool.y)/item.pool.h]:[.5,.5]);}else canvasPaint(item,time,blood);});}
 return {setPools,paint,metrics:()=>({backend:webgl?'webgl-shader':'canvas-refraction',activeCount,resourceCount:items.length,shaderCount:webgl?items.length:0,textureCount:items.length*(webgl?1:2),maskCount:items.length,textureUploads:uploads,updates,compiled:webgl?items.map(item=>{const r=item.object.renderNode.renderer,programs=Object.values(item.object.renderNode.programManager.programs);return programs.length>0&&programs.every(s=>s.program&&!s.program.compiling&&!!s.program.webGLProgram&&r.gl.getProgramParameter(s.program.webGLProgram,r.gl.LINK_STATUS));}):null}),destroy(){while(items.length)remove(items.pop());}};
}
root.GridderOceanWater={create};
})(window);
