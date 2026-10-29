// Floating-point display geometry. All certificate values retain their supplied status.
import {c,add,sub,mul,scale,abs,norm,mv,mm,adj,THETA} from './step-five-math.mjs?v=103';
import {contourFrame,E,ETA} from './gate-two-math.mjs?v=103';
import {frame,B} from './step-ten-math.mjs?v=103';
import {inverse,D} from './step-eleven-math.mjs?v=103';
export const MATRIX_N=Math.sqrt(5)/256;
const H=E.map(row=>row.map(z=>scale(z,1/MATRIX_N)));
export const unit3=(phi,psi)=>[Math.cos(phi),Math.sin(phi)*Math.cos(psi),Math.sin(phi)*Math.sin(psi)];
export const radialEllipsoid=(axes,n)=>{const r=1/Math.sqrt(n.reduce((s,x,i)=>s+(x/axes[i])**2,0));return n.map(x=>x*r);};
export const radialSection=(K,n)=>{const q=n.reduce((s,x,i)=>s+x*K[i].reduce((t,k,j)=>t+k*n[j],0),0);return n.map(x=>x/Math.sqrt(q));};
export function matrixDelta([x,y,q]){return H.map((row,i)=>row.map((h,j)=>add(mul(c(x,y),h),c(i===j?q:0))));}
export function matrixNorm(M){const G=mm(adj(M),M),a=G[0][0].re,d=G[1][1].re;return Math.sqrt((a+d+Math.hypot(a-d,2*abs(G[0][1])))/2);}
export function matrixRay(n,box=false){const M=matrixDelta(n);let radius;if(box){radius=Infinity;M.flat().forEach((z,k)=>{const re=(k%2?4:3)/1024,im=(k%2?3:4)/1024;if(z.re)radius=Math.min(radius,re/Math.abs(z.re));if(z.im)radius=Math.min(radius,im/Math.abs(z.im));});}else radius=ETA/matrixNorm(M);return n.map(x=>x*radius);}
export function matrixPoint(point){const delta=matrixDelta(point);let inside=true;delta.flat().forEach((z,k)=>{if(Math.abs(z.re)>(k%2?4:3)/1024+1e-14||Math.abs(z.im)>(k%2?3:4)/1024+1e-14)inside=false;});return {delta,inside,norm:matrixNorm(delta),withinNorm:matrixNorm(delta)<=ETA+1e-14};}
export function output3d(id,state){
 const theta=id===9?THETA:state.theta,t=id===9?0:state.t,phi=state.phi??Math.PI/2,psi=state.psi??0;
 let F0,Ft,W,axes,allowance,bound;
 if(id===6||id===9){const f=contourFrame(theta);F0=f.F;Ft=F0.map((row,i)=>row.map((z,j)=>sub(z,scale(E[i][j],t))));W=f.U.map(row=>[row[0],row[1],mul(c(0,1),row[1])]);axes=[f.sigmaMax,f.sigmaMin,f.sigmaMin];allowance=t*ETA;bound=.03921135-allowance;}
 else {const f=frame(theta);F0=B.map((row,i)=>row.map((z,j)=>sub(i===j?f.z:c(),z)));Ft=F0.map((row,i)=>row.map((z,j)=>sub(z,scale(D[i][j],t))));W=[[f.U[0][0],f.U[0][1],c()],[f.U[1][0],f.U[1][1],c()],[c(),c(),c(1)]];axes=f.axes;allowance=t*.01;bound=.029445725-allowance;}
 const n=unit3(phi,psi),centre=n.map((x,i)=>x*axes[i]),input=mv(mm(inverse(F0),W),centre.map(x=>c(x))),actual=mv(Ft,input),projection=mv(adj(W),actual).map(x=>x.re),omitted=norm(actual.map((x,i)=>sub(x,mv(W,projection.map(x=>c(x)))[i])));
 const L=mm(inverse(Ft),W),K=mm(adj(L),L).map(row=>row.map(x=>x.re));
 const weak=Math.min(...axes),displayAxes=state.scaled?axes.map(a=>Math.min(a,3*weak)):axes,factors=displayAxes.map((a,i)=>a/axes[i]);
 return {axes,displayAxes,K,W,input,inputNorm:norm(input),centre,projection,omitted,allowance,bound,displayCentre:centre.map((x,i)=>x*factors[i]),displayProjection:projection.map((x,i)=>x*factors[i]),actualNorm:norm(actual),displacement:norm(mv(F0,input).map((x,i)=>sub(x,actual[i])))};
}
