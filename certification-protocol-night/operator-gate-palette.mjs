// Gate provenance: pink is the already-consumed matrix allowance; greens are
// reserved for the independent operator allowance and bounds; raspberry pink marks perturbed images. Formula parts use their geometric role; other text stays indigo.
export const OPERATOR_GATE_PALETTE=Object.freeze({
 text:'#f4f0fa',vector:'#00ffff',unit:'#b8c4d8',image:'#1e90ff',bound:'#9b83ff',
 matrixError:'#ff1493',error:'#00ff00',safety:'#9b83ff',outer:'#ff8132',
 perturbed:'#d69a76',clearance:'#ffc46b',tint:'#152a19',fill:'#d3d3d3'
});

// Darker matching hues are for formulas only, never opacity on text.
export const OPERATOR_GATE_TEXT_PALETTE=Object.freeze({...OPERATOR_GATE_PALETTE,vector:"#00ffff",image:"#60b2ff",matrixError:"#ff79c5",outer:"#ffb47f",actual:"#ff5268"});
