import {F,U,V,A,A_STAR,A_CIRCLE,SIGMA_MAX,THETA,CENTER,DELTA,c,add,sub,scale,mul,div,abs,conj,mv,adj,mm,norm} from './step-five-math.mjs?v=103';
import {ERROR,DEN,ETA} from './enclosure-math.mjs?v=103';
export {ETA,A_STAR,A_CIRCLE,THETA};
export const E=[ERROR.slice(0,2),ERROR.slice(2)].map(row=>row.map(([a,b])=>c(a/DEN,b/DEN)));
export function contourFrame(theta=THETA){
 const z=add(CENTER,c(DELTA*Math.cos(theta),DELTA*Math.sin(theta)));
 if(Math.abs(theta-THETA)<1e-14)return{z,F,U,V,sigmaMax:SIGMA_MAX,sigmaMin:A_STAR,atStar:true};
 const G=A.map((row,i)=>row.map((a,j)=>sub(i===j?z:c(),a))),K=mm(adj(G),G),tr=K[0][0].re+K[1][1].re;
 const hi=Math.sqrt((tr+Math.hypot(K[0][0].re-K[1][1].re,2*abs(K[0][1])))/2),lo=abs(sub(mul(G[0][0],G[1][1]),mul(G[0][1],G[1][0])))/hi;
 const raw=[c(1),div(c(lo*lo-K[0][0].re),K[0][1])],vmin=raw.map(a=>scale(a,1/norm(raw))),vmax=[scale(conj(vmin[1]),-1),conj(vmin[0])],umin=mv(G,vmin).map(a=>scale(a,1/lo)),umax=mv(G,vmax).map(a=>scale(a,1/hi));
 return{z,F:G,U:[[umax[0],umin[0]],[umax[1],umin[1]]],V:[[vmax[0],vmin[0]],[vmax[1],vmin[1]]],sigmaMax:hi,sigmaMin:lo,atStar:false};
}
export function outputState(phi=90,t=1,theta=THETA){
 const frame=contourFrame(theta),angle=phi*Math.PI/180,xi=[c(Math.cos(angle)),c(Math.sin(angle))],input=mv(frame.V,xi),stretched=[scale(xi[0],frame.sigmaMax),scale(xi[1],frame.sigmaMin)],output=mv(frame.U,stretched),length=norm(output),ev=mv(E,input),y=output.map((a,i)=>sub(a,scale(ev[i],t))),coordinates=mv(adj(frame.U),y);
 return{frame,xi,input,stretched,output,length,ev,y,coordinates,p:coordinates.map(a=>a.re),outOfPlane:Math.hypot(...coordinates.map(a=>a.im)),actualLength:norm(y),displacement:t*norm(ev),radius:t*ETA,uniform:A_CIRCLE-t*ETA,gap:length-t*ETA};
}
// Actual central section of (F(z)-tE) unit ball in the current real U(z)-plane.
export function perturbedSection(t,theta=THETA){
 const frame=contourFrame(theta),G=frame.F.map((row,i)=>row.map((z,j)=>sub(z,scale(E[i][j],t)))),det=sub(mul(G[0][0],G[1][1]),mul(G[0][1],G[1][0]));
 const inverse=[[G[1][1],scale(G[0][1],-1)],[scale(G[1][0],-1),G[0][0]]].map(row=>row.map(z=>div(z,det)));
 const L=mm(inverse,frame.U),K=mm(adj(L),L),a=K[0][0].re,b=K[0][1].re,d=K[1][1].re,mid=(a+d)/2,h=Math.hypot((a-d)/2,b),angle=.5*Math.atan2(2*b,a-d);
 return{small:1/Math.sqrt(mid+h),large:1/Math.sqrt(mid-h),angle};
}
