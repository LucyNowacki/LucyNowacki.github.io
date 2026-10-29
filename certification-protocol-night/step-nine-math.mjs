// Numerical illustrations only; the uniform bound is a supplied certificate.
import {A,U,CENTER,DELTA,THETA,A_CIRCLE,c,add,sub,scale,mul,div,mm,adj,mv,norm} from './step-five-math.mjs?v=103';
import {E,ETA} from './gate-two-math.mjs?v=103';
export {THETA,A_CIRCLE,ETA};
export function fixedSection(theta,t){
 const z=add(CENTER,c(DELTA*Math.cos(theta),DELTA*Math.sin(theta)));
 const F=A.map((row,i)=>row.map((a,j)=>sub(sub(i===j?z:c(),a),scale(E[i][j],t))));
 const det=sub(mul(F[0][0],F[1][1]),mul(F[0][1],F[1][0]));
 const inverse=[[F[1][1],scale(F[0][1],-1)],[scale(F[1][0],-1),F[0][0]]].map(row=>row.map(x=>div(x,det)));
 // U is the one fixed U_* from Step 5, for every theta and t.
 const L=mm(inverse,U),K=mm(adj(L),L),a=K[0][0].re,b=(K[0][1].re+K[1][0].re)/2,d=K[1][1].re;
 const hi=(a+d+Math.hypot(a-d,2*b))/2,lo=(a*d-b*b)/hi;
 return {theta,t,z,F,L,K:[[a,b],[b,d]],small:1/Math.sqrt(hi),large:1/Math.sqrt(lo),angle:.5*Math.atan2(2*b,a-d),bound:A_CIRCLE-t*ETA};
}
export function sectionPoint(section,angle){
 const x=section.small*Math.cos(angle),y=section.large*Math.sin(angle),a=section.angle;
 return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
}

export function boundaryState(theta,t,phi){
 const midpoint=fixedSection(theta,0),perturbed=fixedSection(theta,t),point=sectionPoint(midpoint,phi);
 const input=mv(midpoint.L,point.map(x=>c(x))),actual=mv(perturbed.F,input),coordinates=mv(adj(U),actual);
 return {midpoint,perturbed,point,input,inputLength:norm(input),length:Math.hypot(...point),projection:coordinates.map(x=>x.re),outOfPlane:Math.hypot(...coordinates.map(x=>x.im)),displacement:t*norm(mv(E,input))};
}
