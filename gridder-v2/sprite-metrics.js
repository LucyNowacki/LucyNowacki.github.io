/* Shared visual/contact units. At an 800px canvas the plot is 732px wide. */
(function(root){
 'use strict';
 const referencePlotWidth=732,playerScale=1.25;
 function scale(layout){
  if(!Number.isFinite(layout?.pw)||layout.pw<=0)return 1;
  // Arena cells stretch independently. Keep bodies round and fit their size
  // to the smaller equivalent of the original 3:2 cell geometry.
  const ratio=layout.stretch&&layout.cellWidth>0&&layout.cellHeight>0
   ?Math.min(1,layout.cellHeight*1.5/layout.cellWidth):1;
  return layout.pw*ratio/referencePlotWidth;
 }
 function collisionRadius(layout,enemyScale=1){
  return scale(layout)*(11*playerScale+7*enemyScale);
 }
 const api=Object.freeze({referencePlotWidth,playerScale,scale,collisionRadius});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.GridderSpriteMetrics=api;
})(typeof window!=='undefined'?window:globalThis);
