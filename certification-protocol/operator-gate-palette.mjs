// Gate provenance: pink is the already-consumed matrix allowance; greens are
// reserved for the independent operator allowance and bounds; raspberry pink marks perturbed images. Formula parts use their geometric role; other text stays indigo.
export const OPERATOR_GATE_PALETTE=Object.freeze({
 text:'#4b0082',vector:'#00b8ff',unit:'#64748b',image:'#1e90ff',bound:'#713bc5',
 matrixError:'#ff1493',error:'#008a16',safety:'#454545',outer:'#ff8132',
 perturbed:'#ad1457',clearance:'#996000',tint:'#d9ff85',fill:'#d3d3d3'
});

// Darker matching hues are for formulas only, never opacity on text.
export const OPERATOR_GATE_TEXT_PALETTE=Object.freeze({...OPERATOR_GATE_PALETTE,vector:"#007c9e",image:"#055be0",matrixError:"#c21875",outer:"#b54708",actual:"#c40000"});
