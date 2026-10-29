// Semantic roles belong to complete geometric sets, not just to their operators.
// This presentation-only pass preserves every source symbol and inequality.
import {math} from './math-render.mjs?v=103';
import {OPERATOR_GATE_TEXT_PALETTE as C} from './operator-gate-palette.mjs?v=117';
const t=String.raw;
export const paint=(role,tex)=>`{\\color{${C[role]}}${tex}}`;
const bound=t`\underline{s}_{\Gamma,2}^{\mathrm{lift}}`,error=t`\varepsilon_{2,M}^{\sharp}`;
const shifted=t`(zI_3-B_{\mathrm{lift}})`,inverse=shifted+'^{-1}';
const factor=t`[I_3-tD(zI_3-B_{\mathrm{lift}})^{-1}]`;
const prefixes=[factor+'^{-1}',factor,'D',`x+${inverse}`,`x+ ${inverse}`,inverse,shifted,t`(zI_3-B_t)^{-1}`,t`(zI_3-B_t)`,t`F_t(z)^{-1}`,t`F_t(z)`,t`F_t^{-1}`,t`F_t`,t`R_t(z)`,t`Q_t^{-1}`,t`Q_t`,t`(zI_2-A_2^\circ)`];
function ballAt(source,start){
 const head=/^\\overline\s*B_2\s*(?:\\!\s*)?(?:\\left\s*)?\(/.exec(source.slice(start));if(!head)return null;
 let depth=1,braces=0,comma=-1,i=start+head[0].length;
 const begin=i;
 for(;i<source.length;i++){const c=source[i];if(c==='{')braces++;if(c==='}')braces--;if(c==='(')depth++;if(c===')'&&!--depth)break;if(c===','&&depth===1&&!braces)comma=i;}
 if(depth||comma<0)return null;
 const centre=source.slice(begin,comma).trim(),radius=source.slice(comma+1,i).replace(/\\right\s*$/,'').trim();
 let role;
 if(centre==='0'&&radius==='1')role='unit';
 else if(radius.includes('eta_A'))role='matrixError';
 else if(centre!=='0')role='error';
 else if(/\\frac(?:1|\{1\})\{1\+(?:q\(t\)|t\\varepsilon)/.test(radius))role='safety';
 else if(/^1\+t\\varepsilon/.test(radius))role='outer';
 else if(/\\rho\(t\)|1-q\(t\)|1\+q\(t\)|1-t\\varepsilon|underline.*-t\\varepsilon/.test(radius))role=/\\frac|\^-?\{?-1|1\+q/.test(radius)?'outer':'safety';
 else if(/varepsilon|r_x/.test(radius))role='error';
 else if(/underline|mathfrak/.test(radius))role='bound';
 return {end:i+1,role};
}
const entries=[];
const add=(role,...values)=>values.forEach(value=>entries.push([value,role]));
add('outer',t`(1-t\varepsilon_{2,M}^{\sharp}\overline{\mathfrak m}_{\Gamma,2}^{H})^{-1}`,t`1+q(t)`,t`\rho(t)^{-1}`,t`1/\rho(t)`,t`\frac1{\rho(t)}`,t`(\underline{s}_{\Gamma,2}^{\mathrm{lift}}-t\varepsilon_{2,M}^{\sharp})^{-1}`);
add('safety',t`(1+t\varepsilon_{2,M}^{\sharp}\overline{\mathfrak m}_{\Gamma,2}^{H})^{-1}`,t`\underline{s}_{\Gamma,2}^{\mathrm{lift}}-\varepsilon_{2,M}^{\sharp}`,t`\rho(t)`,t`\rho(1)`,t`1-g(t)`,t`1-q(t)`,t`1-t\varepsilon_{2,M}^{\sharp}\overline{\mathfrak m}_{\Gamma,2}^{H}`,`${bound}-t${error}`);
add('bound',t`\frac1{\underline{s}_{\Gamma,2}^{\mathrm{lift}}}`,t`\frac{1}{\underline{s}_{\Gamma,2}^{\mathrm{lift}}}`,`1/${bound}`,bound,t`\underline s_{\Gamma,2}^{\mathrm{lift}}`,t`\underline{s}_{\Gamma,2}^{H}`,t`\underline{s}_\Gamma^\circ`,t`\overline{\mathfrak m}_{\Gamma,2}^{H}`,t`\overline{\mathfrak{m}}_{\Gamma,2}^{H}`);
add('matrixError',t`\eta_A`);
add('error',`t${error}`,error,t`\|D\|_2`,t`tD`,t`r_x`);
add('vector',t`\|x\|_2=1`,t`\|y^{B_{\mathrm{lift}}}\|_2=1`);
add('image',t`(zI_2-A_{2,M}^{X})^{-1}`,t`(zI_2-A_{2,M}^{X})`,t`zI_2-A_{2,M}^{X}`,t`\sigma_{\min}(zI_3-B_{\mathrm{lift}})`,t`\sigma_{\min}((zI_3-B_{\mathrm{lift}}))`,t`\|(zI_3-B_{\mathrm{lift}})^{-1}\|_2`,inverse,shifted,t`zI_3-B_{\mathrm{lift}}`,t`y^{B_{\mathrm{lift}}}`,t`(zI_2-A_2^\circ)`);
add('perturbed',t`(zI_3-B_t)^{-1}`,t`(zI_3-B_t)`,t`zI_3-B_t`,t`\mathcal L_{\mathrm{toy}}`,t`F_t(z)^{-1}`,t`F_t(z)`,t`F_t^{-1}`);
entries.sort((a,b)=>b[0].length-a[0].length);
export function colorGateTex(source){
 if(source.includes('\\color{'))return source;
 let out='',i=0;
 while(i<source.length){
  // Protect literal prose, including a word that happens to contain a token.
  const text=/^\\(?:text|mathrm)\{[^{}]*\}/.exec(source.slice(i));if(text){out+=text[0];i+=text[0].length;continue;}
  let set=null;
  for(const prefix of prefixes){if(!source.startsWith(prefix,i))continue;let j=i+prefix.length;while(/\s/.test(source[j]||'')&&j<source.length)j++;const b=ballAt(source,j);if(!b?.role)continue;const role=prefix==='D'?'error':b.role==='error'||b.role==='matrixError'?b.role:prefix.startsWith(factor)?'perturbed':(prefix.includes('B_{\\mathrm{lift}}')||prefix.includes('A_2^\\circ'))?'image':'perturbed';set={end:b.end,role};break;}
  set??=ballAt(source,i);
  if(set?.role){out+=paint(set.role,source.slice(i,set.end));i=set.end;continue;}
  const match=entries.find(([s])=>source.startsWith(s,i));if(match){out+=paint(match[1],match[0]);i+=match[0].length;}else out+=source[i++];
 }
 return out;
}
export const gateMath=source=>math(colorGateTex(source));
