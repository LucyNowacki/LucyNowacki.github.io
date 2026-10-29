import {ERROR,normUnits} from './enclosure-math.mjs?v=103';

// Numerators in units of 1/1024. E, iE and K are orthogonal for the
// real Frobenius product, all of length 10/1024. This is a real 3D section.
export const linkedError=([u,v,w])=>ERROR.map(([a,b],i)=>[
  u*a-v*b+(i===1?1:i===3?-1:0)*5*Math.SQRT2*w,u*b+v*a]);
export const linkedBoxGauge=([u,v,w])=>Math.max(
  Math.abs(u)+4*Math.abs(v)/3,(Math.abs(4*u+3*v)+5*Math.SQRT2*Math.abs(w))/4);
export const LINKED_TOY=[1,0,0];
export const LINKED_VERTICES=[[-1,0,0],[1,0,0],
  ...[-1,1].flatMap(s=>[-1,1].map(t=>[0,s*.75,t*7/(20*Math.SQRT2)])),
  ...[-1,1].flatMap(s=>[-1,1].map(t=>[s*9/25,-s*12/25,t*4/(5*Math.SQRT2)]))];
const normals=[...[-1,1].flatMap(s=>[-1,1].map(t=>[s,t*4/3,0,1])),
  ...[-1,1].flatMap(s=>[-1,1].map(t=>[s*4,s*3,t*5*Math.SQRT2,4]))];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const LINKED_FACES=normals.map(h=>{
  const n=h.slice(0,3),ids=LINKED_VERTICES.map((p,i)=>Math.abs(dot(n,p)-h[3])<1e-9?i:-1).filter(i=>i>=0);
  const c=[0,1,2].map(k=>ids.reduce((s,i)=>s+LINKED_VERTICES[i][k],0)/ids.length);
  const a=LINKED_VERTICES[ids[0]].map((x,k)=>x-c[k]),b=cross(n,a);
  const an=Math.hypot(...a),bn=Math.hypot(...b);
  return ids.sort((i,j)=>{
    const angle=k=>{const p=LINKED_VERTICES[k].map((x,l)=>x-c[l]);return Math.atan2(dot(p,b)/bn,dot(p,a)/an);};
    return angle(i)-angle(j);
  });
});
export const LINKED_EDGES=[...new Map(LINKED_FACES.flatMap(f=>f.map((i,k)=>{
  const edge=[i,f[(k+1)%f.length]].sort((a,b)=>a-b);return[edge.join(','),edge];
}))).values()];
export function linkedBoundary(n){const radius=10/normUnits(linkedError(n));return n.map(x=>x*radius);}
export function linkedMesh(lat=22,lon=40){
  const grid=Array.from({length:lat+1},(_,j)=>Array.from({length:lon},(_,i)=>{
    const a=Math.PI*j/lat,b=2*Math.PI*i/lon;
    return linkedBoundary([Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)]);
  }));
  return Array.from({length:lat},(_,j)=>Array.from({length:lon},(_,i)=>
    [grid[j][i],grid[j][(i+1)%lon],grid[j+1][(i+1)%lon],grid[j+1][i]])).flat();
}
