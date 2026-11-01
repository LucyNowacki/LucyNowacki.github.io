/* Renderer-specific clipping stays outside mathematical/gameplay state.
 * Phaser 4.2.1: WebGL uses an object Mask filter; Canvas retains GeometryMask. */
(function(root){
  'use strict';
  function revealMask(scene,object,area){
    if(scene.game.renderer.type===Phaser.WEBGL){
      object.enableFilters();
      const filter=object.filters.external.addMask(area,false,scene.cameras.main);
      filter.autoUpdate=false;
      return {kind:'WebGL Mask filter',apply(complete){filter.active=!complete;filter.needsUpdate=!complete;},destroy(){}};
    }
    const mask=area.createGeometryMask();
    return {kind:'Canvas GeometryMask',apply(complete){if(complete)object.clearMask();else object.setMask(mask);},destroy(){mask.destroy();}};
  }
  root.GridderRenderCapabilities={revealMask};
})(window);
