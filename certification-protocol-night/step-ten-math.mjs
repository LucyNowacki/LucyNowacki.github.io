// Numerical geometry illustrates the supplied exact direct-sum certificate.
import {A,CENTER,DELTA,THETA,c,add,sub,mul,div,scale,conj,abs,norm,mv,mm,adj} from './step-five-math.mjs?v=103';
import {E,ETA} from './gate-two-math.mjs?v=103';
export {THETA,ETA,CENTER,DELTA};
export const HARDY_BOUND=.029445725;
export const D_ZERO=(2*Math.sqrt(29)-1)/16;
export const HARDY=A.map((row,i)=>row.map((x,j)=>add(x,E[i][j])));
export const J=[[c(1),c()],[c(),c(1)],[c(),c()]];
export const B=mm(mm(J,HARDY),adj(J));
export function frame(theta,shifted=true){
 const z=add(CENTER,c(DELTA*Math.cos(theta),DELTA*Math.sin(theta)));
 const F=shifted?HARDY.map((row,i)=>row.map((x,j)=>sub(i===j?z:c(),x))):HARDY;
 const G=mm(adj(F),F),a=G[0][0].re,d=G[1][1].re,b=G[0][1];
 const hi=Math.sqrt((a+d+Math.hypot(a-d,2*abs(b)))/2);
 const lo=abs(sub(mul(F[0][0],F[1][1]),mul(F[0][1],F[1][0])))/hi;
 let raw=abs(b)>1e-16?[b,c(lo*lo-a)]:(a<=d?[c(1),c()]:[c(),c(1)]);
 let vmin=raw.map(x=>scale(x,1/norm(raw)));
 const phase=abs(vmin[0])>1e-15?scale(conj(vmin[0]),1/abs(vmin[0])):c(1);
 vmin=vmin.map(x=>mul(x,phase));
 const vmax=[scale(conj(vmin[1]),-1),conj(vmin[0])];
 const umin=mv(F,vmin).map(x=>scale(x,1/lo)),umax=mv(F,vmax).map(x=>scale(x,1/hi));
 return {theta,shifted,z,F,V:[[vmax[0],vmin[0]],[vmax[1],vmin[1]]],U:[[umax[0],umin[0]],[umax[1],umin[1]]],axes:[hi,lo,shifted?abs(z):0],bound:shifted?HARDY_BOUND:0};
}
export function liftState(theta,shifted,alpha,phi,beta){
 const f=frame(theta,shifted),rv=Math.cos(alpha),rw=Math.sin(alpha);
 const principal=[rv*Math.cos(phi),rv*Math.sin(phi),rw];
 const v=mv(f.V,principal.slice(0,2).map(x=>c(x))),w=c(rw*Math.cos(beta),rw*Math.sin(beta));
 const output=mv(f.F,v),extra=shifted?mul(f.z,w):c();
 return {...f,principal,v,w,output,extra,inputNorm:Math.hypot(norm(v),abs(w)),outputNorm:Math.hypot(norm(output),abs(extra)),point:principal.map((x,i)=>x*f.axes[i])};
}
