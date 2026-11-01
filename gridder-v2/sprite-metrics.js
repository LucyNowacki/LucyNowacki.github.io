/* Shared visual/contact units. At an 800px canvas the plot is 732px wide. */
(function(root){
 'use strict';
 const referencePlotWidth=732,playerScale=1.25;
 function scale(layout){
  return Number.isFinite(layout?.pw)&&layout.pw>0?layout.pw/referencePlotWidth:1;
 }
 function collisionRadius(layout,enemyScale=1){
  return scale(layout)*(11*playerScale+7*enemyScale);
 }
 const api=Object.freeze({referencePlotWidth,playerScale,scale,collisionRadius});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.GridderSpriteMetrics=api;
})(typeof window!=='undefined'?window:globalThis);
