import {outputGap} from './output-gap.mjs?v=103';
import {math} from './math-render.mjs?v=103';
const tex=String.raw;
export function outputPointLegend(frame='U(z)',blue='Midpoint output',symbol=tex`y^\circ`,diamond=false,showGap=true){
 return `<aside class="output-point-legend" aria-label="Output point legend"><span><i class="output-point-blue"></i><span><strong>Blue:</strong> ${blue} ${math(symbol)} · uncertainty centre</span></span><span><i class="output-point-red${diamond?' diamond':''}"></i><span><strong>Red:</strong> projected perturbed output ${math(tex`y_t`)} <small>(coordinates ${math(tex`\operatorname{Re}(${frame}^{\ast}y_t)`)})</small></span></span>${showGap?outputGap(symbol,symbol===tex`y^{B_{\mathrm{lift}}}`?tex`\underline s_{\Gamma,2}^{\mathrm{lift}}`:tex`a_\circ`):''}</aside>`;
}
