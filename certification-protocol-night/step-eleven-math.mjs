// Numerical sections illustrate the uniform certificate; they do not certify it.
import {c,add,sub,mul,div,scale,conj,abs,norm,mv,mm,adj} from './step-five-math.mjs?v=103';
import {B,frame,THETA,HARDY_BOUND} from './step-ten-math.mjs?v=103';
import {VALUES} from './certificate-values.mjs?v=103';
export {THETA,HARDY_BOUND};
export const EPS=Number(VALUES.operatorAllowance),FINAL_BOUND=Number(VALUES.toyOperatorBound),RESOLVENT_BOUND=Number(VALUES.liftedResolventNumerator)/Number(VALUES.liftedResolventDenominator);
export const D=[[c(),c(),c(EPS)],[c(),c(),c()],[c(EPS),c(),c()]];
export function inverse(M){
 const n=M.length,A=M.map((row,i)=>[...row.map(x=>({...x})),...Array.from({length:n},(_,j)=>c(i===j?1:0))]);
 for(let j=0;j<n;j++){
  let p=j;for(let k=j+1;k<n;k++)if(abs(A[k][j])>abs(A[p][j]))p=k;
  [A[p],A[j]]=[A[j],A[p]];const pivot=A[j][j];
  if(abs(pivot)<1e-15)throw Error('Singular section matrix');
  A[j]=A[j].map(x=>div(x,pivot));
  for(let k=0;k<n;k++)if(k!==j){const s=A[k][j];A[k]=A[k].map((x,i)=>sub(x,mul(s,A[j][i])));}
 }return A.map(row=>row.slice(n));
}
export function operatorState(theta=THETA,t=1,phi=0){
 const h=frame(theta),F0=B.map((row,i)=>row.map((x,j)=>sub(i===j?h.z:c(),x)));
 const Ft=F0.map((row,i)=>row.map((x,j)=>sub(x,scale(D[i][j],t))));
 // This real plane uses the complementary output and the resolved weak output.
 // It varies with theta but stays fixed throughout the t-homotopy at each theta.
 const W=[[c(),h.U[0][1]],[c(),h.U[1][1]],[c(1),c()]];
 const x=[scale(h.V[0][1],Math.cos(phi)),scale(h.V[1][1],Math.cos(phi)),scale(conj(h.z),Math.sin(phi)/abs(h.z))];
 const y0=mv(F0,x),y=mv(Ft,x),dx=mv(D,x),r=[abs(h.z)*Math.sin(phi),h.axes[1]*Math.cos(phi)];
 const p=mv(adj(W),y).map(x=>x.re),reconstructed=mv(W,p.map(x=>c(x)));
 const omitted=norm(y.map((x,i)=>sub(x,reconstructed[i])));
 const L=mm(inverse(Ft),W),G=mm(adj(L),L),K=[[G[0][0].re,G[0][1].re],[G[1][0].re,G[1][1].re]];
 const trace=K[0][0]+K[1][1],high=(trace+Math.hypot(K[0][0]-K[1][1],2*K[0][1]))/2,low=(K[0][0]*K[1][1]-K[0][1]*K[1][0])/high;
 const centreNorm=norm(y0),radius=t*EPS;
 return {theta,t,phi,z:h.z,F0,Ft,W,L,K,x,y0,y,dx,r,p,omitted,centreNorm,radius,displacement:t*norm(dx),outputNorm:norm(y),bound:HARDY_BOUND-radius,gap:centreNorm-radius,nearest:r.map(v=>v*(1-radius/centreNorm)),baseAxes:[abs(h.z),h.axes[1]],sectionAxes:[1/Math.sqrt(low),1/Math.sqrt(high)],gain:t*EPS*RESOLVENT_BOUND};
}
export function radialPoint(K,angle){const n=[Math.cos(angle),Math.sin(angle)],q=n[0]*(K[0][0]*n[0]+K[0][1]*n[1])+n[1]*(K[1][0]*n[0]+K[1][1]*n[1]);return n.map(x=>x/Math.sqrt(q));}
export function couplingState(angle,zero=false){const x=zero?[0,1,0]:[Math.cos(angle),0,Math.sin(angle)];return {x,dx:[EPS*x[2],0,EPS*x[0]],norm:zero?0:EPS};}
// Visibility schematic only: enlarged round allowances, compressed long axis.
// The actual perturbed section is intentionally reserved for the true-scale view.
export function visibilityState(s){
 const R=Math.max(...s.baseAxes),power=.5,f=a=>Math.pow(R,1-power)*Math.pow(a,power);
 const k=f(HARDY_BOUND)/HARDY_BOUND,baseAxes=s.baseAxes.map(f),L=baseAxes.map((a,i)=>a/s.baseAxes[i]);
 const r=s.r.map((x,i)=>x*L[i]),p=s.p.map((x,i)=>x*L[i]),radius=k*s.radius,bound=k*s.bound,centre=Math.hypot(...r);
 return {...s,baseAxes,sectionAxes:baseAxes,r,p,radius,bound,nearest:r.map(x=>x*(1-radius/centre)),visibilityFactor:k};
}
