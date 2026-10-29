// Exact integer data in units of 1/1024. Floating functions are for display only.
export const DEN=1024, ETA=10/DEN;
export const MID=[[512,256],[384,-128],[64,128],[256,-64]];
export const ERROR=[[-3,4],[-4,3],[-3,-4],[-4,3]];
export const HALF=[[3,4],[4,3],[3,4],[4,3]];
export const HARDY=MID.map((v,i)=>v.map((x,j)=>x+ERROR[i][j]));
export const SHARP=[[3,4],[4,3],[3,4],[4,3]];
export const copy=a=>a.map(v=>[...v]);
const mul=([a,b],[c,d])=>[a*c-b*d,a*d+b*c];
export function normUnits(a){const tr=a.reduce((s,z)=>s+z[0]**2+z[1]**2,0),p=mul(a[0],a[3]),q=mul(a[1],a[2]),det=(p[0]-q[0])**2+(p[1]-q[1])**2;return Math.sqrt(Math.max(0,(tr+Math.sqrt(Math.max(0,tr*tr-4*det)))/2));}
export function bounds(a){const mod=a.map(z=>Math.hypot(...z)),rows=[mod[0]+mod[1],mod[2]+mod[3]],cols=[mod[0]+mod[2],mod[1]+mod[3]];return{mod,rows,cols,one:Math.max(...cols),inf:Math.max(...rows),norm:normUnits(a)};}
export function inBox(a){return a.every((v,i)=>v.every((x,j)=>Math.abs(x)<=HALF[i][j]+1e-12));}
export const NORM_E=Math.sqrt(80)/DEN;
// Three real Frobenius-orthogonal directions R, iJ, K of equal Frobenius length.
export const R=[-3,-4,-3,-4], J=[4,3,-4,3], K=[4,-3,4,-3];
export const sectionError=([x,y,z])=>R.map((r,i)=>[x*r+z*K[i],y*J[i]]);
export const boxPoint=([s,t,y])=>[(-9*s-16*t)/25,y,(12*s-12*t)/25];
export const TOY_POINT=[1,1,0];
export const BOX_VERTICES=[-1,1].flatMap(s=>[-1,1].flatMap(t=>[-1,1].map(y=>boxPoint([s,t,y]))));
export const BOX_EDGES=BOX_VERTICES.flatMap((p,i)=>[1,2,4].filter(bit=>(i&bit)===0).map(bit=>[i,i|bit]));
export const BOX_FACES=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];
export function ballBoundary(n){const d=normUnits(sectionError(n));return n.map(v=>10*v/d);}
export function sectionMesh(lat=22,lon=40){
 const grid=Array.from({length:lat+1},(_,j)=>Array.from({length:lon},(_,i)=>{const a=Math.PI*j/lat,b=2*Math.PI*i/lon;return ballBoundary([Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)]);}));
 const faces=[];for(let j=0;j<lat;j++)for(let i=0;i<lon;i++)faces.push([grid[j][i],grid[j][(i+1)%lon],grid[j+1][(i+1)%lon],grid[j+1][i]]);return faces;
}
