// Floating-point geometry only. The rigorous endpoint interval is a supplied certificate.
export const c=(re=0,im=0)=>({re,im});
export const add=(a,b)=>c(a.re+b.re,a.im+b.im), sub=(a,b)=>c(a.re-b.re,a.im-b.im);
export const mul=(a,b)=>c(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
export const scale=(a,t)=>c(a.re*t,a.im*t), conj=a=>c(a.re,-a.im), abs=a=>Math.hypot(a.re,a.im);
export const div=(a,b)=>scale(mul(a,conj(b)),1/(b.re*b.re+b.im*b.im));
export const inner=(a,b)=>a.reduce((s,x,i)=>add(s,mul(conj(x),b[i])),c());
export const norm=v=>Math.hypot(...v.map(abs));
export const mv=(m,v)=>m.map(row=>row.reduce((s,x,i)=>add(s,mul(x,v[i])),c()));
export const adj=m=>m[0].map((_,j)=>m.map(row=>conj(row[j])));
export const mm=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((s,x,k)=>add(s,mul(x,b[k][j])),c())));
export const THETA_TEXT='2.6294058517935316', THETA=Number(THETA_TEXT), DELTA=1/16, CENTER=c(5/8,1/4);
export const Z=add(CENTER,c(DELTA*Math.cos(THETA),DELTA*Math.sin(THETA)));
export const A=[[c(.5,.25),c(.375,-.125)],[c(.0625,.125),c(.25,-.0625)]];
export const F=A.map((row,i)=>row.map((a,j)=>sub(i===j?Z:c(),a)));
export const H=mm(adj(F),F);
const trace=H[0][0].re+H[1][1].re;
export const SIGMA_MAX=Math.sqrt((trace+Math.hypot(H[0][0].re-H[1][1].re,2*abs(H[0][1])))/2);
export const A_STAR=abs(sub(mul(F[0][0],F[1][1]),mul(F[0][1],F[1][0])))/SIGMA_MAX;
export const A_CIRCLE=.03921135;
const raw=[c(1),div(c(A_STAR*A_STAR-H[0][0].re),H[0][1])];
export const VMIN=raw.map(v=>scale(v,1/norm(raw)));
export const VMAX=[scale(conj(VMIN[1]),-1),conj(VMIN[0])];
export const UMIN=mv(F,VMIN).map(v=>scale(v,1/A_STAR));
export const UMAX=mv(F,VMAX).map(v=>scale(v,1/SIGMA_MAX));
export const V=[[VMAX[0],VMIN[0]],[VMAX[1],VMIN[1]]];
export const U=[[UMAX[0],UMIN[0]],[UMAX[1],UMIN[1]]];
export const SIGMA=[[c(SIGMA_MAX),c()],[c(),c(A_STAR)]];
export function direction(degrees){
 const phi=degrees*Math.PI/180,xi=[c(Math.cos(phi)),c(Math.sin(phi))];
 const input=mv(V,xi),stretched=mv(SIGMA,xi),output=mv(U,stretched);
 return {xi,input,stretched,output,length:norm(output),squared:norm(output)**2};
}
export function diagnostics(){
 const product=mm(mm(U,SIGMA),adj(V));
 const error=(a,b)=>Math.hypot(...a.flatMap((row,i)=>row.map((x,j)=>abs(sub(x,b[i][j])))));
 const I=[[c(1),c()],[c(),c(1)]];
 return {factorization:error(F,product),VUnitary:error(mm(adj(V),V),I),UUnitary:error(mm(adj(U),U),I),minResidual:norm(mv(F,VMIN).map((x,i)=>sub(x,scale(UMIN[i],A_STAR))))};
}
