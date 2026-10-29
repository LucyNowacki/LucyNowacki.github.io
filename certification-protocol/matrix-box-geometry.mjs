import {ERROR,HALF,DEN} from './enclosure-math.mjs?v=103';
import {linkedError} from './linked-matrix-section.mjs?v=103';
export const copyError=d=>d.map(z=>[...z]);
export const clampEntryError=d=>d.map((z,i)=>z.map((v,j)=>Math.max(-HALF[i][j],Math.min(HALF[i][j],v))));
export function sectionCoordinates(d){return [
 d.reduce((s,[a,b],i)=>s+a*ERROR[i][0]+b*ERROR[i][1],0)/100,
 d.reduce((s,[a,b],i)=>s-a*ERROR[i][1]+b*ERROR[i][0],0)/100,
 (d[1][0]-d[3][0])*5*Math.SQRT2/100];}
export function sectionResidual(d,dim=3){const p=sectionCoordinates(d);if(dim===2)p[2]=0;const q=linkedError(p);return Math.hypot(...d.flatMap((z,i)=>z.map((v,j)=>v-q[i][j])))/DEN;}
export function diamondSelection(u,v){const gauge=Math.abs(u)+4*Math.abs(v)/3,f=Math.max(1,gauge);return linkedError([u/f,v/f,0]);}
export function boxPosition(d){const active=d.flatMap((z,i)=>z.map((v,j)=>Math.abs(Math.abs(v)-HALF[i][j])<1e-9)).filter(Boolean).length;return{active,dimension:8-active,kind:active===8?'vertex':active?'boundary':'interior'};}
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function hull(points){const a=points.map((p,i)=>({x:p[0],y:p[1],i})).sort((a,b)=>a.x-b.x||a.y-b.y),unique=a.filter((p,i)=>!i||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)>1e-10),turn=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const l=[],u=[];for(const p of unique){while(l.length>1&&turn(l.at(-2),l.at(-1),p)<=1e-10)l.pop();l.push(p);}for(const p of [...unique].reverse()){while(u.length>1&&turn(u.at(-2),u.at(-1),p)<=1e-10)u.pop();u.push(p);}return [...l.slice(0,-1),...u.slice(0,-1)].map(p=>p.i);}
// Orthogonal projections of the full 8D Cartesian box, not affine sections.
export const PROJECTED_VERTICES=[...new Map(Array.from({length:256},(_,bits)=>{const d=HALF.map((z,i)=>z.map((v,j)=>((bits&(1<<(2*i+j)))?1:-1)*v)),p=sectionCoordinates(d);return[p.map(v=>v.toFixed(12)).join(','),p];})).values()];
export const PROJECTED_HULL_2=hull(PROJECTED_VERTICES.map(p=>p.slice(0,2))).map(i=>PROJECTED_VERTICES[i]);
const generators=HALF.flatMap((z,i)=>z.map((v,j)=>{const d=ERROR.map(()=>[0,0]);d[i][j]=v;return sectionCoordinates(d);}));
const planes=new Map();for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const n=cross(generators[i],generators[j]),length=Math.hypot(...n);if(length<1e-10)continue;const a=n.map(v=>v/length),sign=a.find(v=>Math.abs(v)>1e-9)<0?-1:1,normal=a.map(v=>v*sign);planes.set(normal.map(v=>v.toFixed(9)).join(','),normal);}
export const PROJECTED_FACES=[...planes.values()].flatMap(normal=>[-1,1].map(sign=>{const n=normal.map(v=>sign*v),support=generators.reduce((s,g)=>s+Math.abs(dot(n,g)),0),ids=PROJECTED_VERTICES.flatMap((p,i)=>Math.abs(dot(p,n)-support)<1e-8?[i]:[]);const ref=Math.abs(n[0])<.8?[1,0,0]:[0,1,0],a=cross(n,ref),b=cross(n,a);return hull(ids.map(i=>[dot(PROJECTED_VERTICES[i],a),dot(PROJECTED_VERTICES[i],b)])).map(j=>ids[j]);}));
export const PROJECTED_EDGES=[...new Map(PROJECTED_FACES.flatMap(f=>f.map((i,k)=>{const e=[i,f[(k+1)%f.length]].sort((a,b)=>a-b);return[e.join(','),e];}))).values()];
