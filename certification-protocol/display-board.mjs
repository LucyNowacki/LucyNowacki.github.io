// Presentation-only layout: keep the native step nodes and their state/listeners.
export function mountCompactBoard(root,id,reading,companion){
 const native=[...root.children].find(x=>x!==reading&&x!==companion);
 const abort=new AbortController(),{signal}=abort;let pending=0,focus=null;
 root.classList.add('display-board');root.dataset.boardStep=id;
 const toolbar=document.createElement('div');toolbar.className='display-board-tools';
 toolbar.innerHTML='<strong>All panels · one view</strong><button data-board-fit>Fit all panels</button><label>Enlarge <select aria-label="Enlarge a geometry panel"><option value="">Choose a panel…</option></select></label><label><input type="checkbox" data-board-prose> Full explanations</label><button data-board-notes>Labels &amp; meaning</button><button data-board-3d>3D explorer</button><button data-board-full>⛶ Fullscreen</button><output data-board-fit-status class="mathjax_ignore"></output>';
 if(id===8){toolbar.querySelector('strong').textContent='Paired inputs · linked output scenes';toolbar.querySelector('[data-board-fit]').textContent='All scenes';}
 if(id===9){toolbar.querySelector('strong').textContent='Full-width image sections';toolbar.querySelector('[data-board-fit]').textContent='All scenes';}
 const area=document.createElement('div');area.className='display-board-area';
 const board=document.createElement('div');board.className='display-board-content';board.append(native);area.append(board);root.prepend(toolbar,area);
 reading.classList.add('display-board-overlay');reading.hidden=true;
 const close=document.createElement('button');close.className='display-overlay-close';close.textContent='Close labels ×';reading.prepend(close);
 const key=document.createElement('div');key.className='display-board-key';key.innerHTML='<b>Violet-blue</b> certified bound / protected ball · <b>Blue</b> base geometry · <b>Deeppink</b> finite allowance · <b>Gray</b> imaginary coordinate / operator allowance. Consult each local legend. <span>Drag points and sliders; select a panel to enlarge. Esc returns to the board.</span>';root.append(key);
 if(id===8)key.innerHTML=key.innerHTML.replace('<b>Violet-blue</b> certified bound / protected ball','<b>Gray</b> Schur-certified protected ball');
 if(id===11)key.innerHTML='Use each panel’s labelled colour key. Dashed circles show bounds; only protected inner balls are shaded. <span>Drag points and sliders; select a panel to enlarge. Esc returns to the board.</span>';
 companion.classList.add('display-board-overlay');companion.querySelector('summary').textContent='Close 3D explorer × · independent companion controls';
 // Step 7 reuses its actual interactive nodes, including all event listeners/state.
 const moved=[];
 if(id===7){
  companion.classList.add('matrix-linked-explorer');
  companion.innerHTML='<summary>Close 3D explorer × · one synchronized matrix</summary><p class="matrix-explorer-intro">Move any entry, the whole matrix vector, or a section coordinate. These are the same controls as the board. Deeppink: matrix enclosure <b>𝒜</b> through its labelled section or projection.</p><div class="matrix-explorer-layout"><div data-explorer-plot></div><div data-explorer-controls><div class="matrix-explorer-camera"></div></div></div>';
  const nodes=[native.querySelector('.linked-matrix-view'),native.querySelector('[data-matrix-diamond]'),native.querySelector('.linked-matrix-controls')];
  companion.addEventListener('toggle',()=>{
   if(companion.open){nodes.forEach((node,i)=>{const marker=document.createComment('Matrix panel position');node.before(marker);moved.push([node,marker]);companion.querySelector(i===0?'[data-explorer-plot]':'[data-explorer-controls]').append(node);});[...nodes[0].children].filter(n=>!n.matches('.enc-heading,.enc-actions,.enc-3d-stage,.enc-legend')).forEach(node=>{const marker=document.createComment('Scene control position');node.before(marker);moved.push([node,marker]);companion.querySelector('.matrix-explorer-camera').append(node);});}
   else restore();
   window.dispatchEvent(new Event('resize'));schedule();
  },{signal});
 }
 function restore(){moved.splice(0).forEach(([node,marker])=>marker.replaceWith(node));}
 const candidates=[...native.children].filter(n=>n.matches('section,[data-matrix-diamond],.s1-scene-grid,.s1-bottom-controls,.s2-plots,.s2-cases,.s3-ab'));
 const choices=toolbar.querySelector('select');
 candidates.forEach((n,i)=>{const title=n.querySelector('h2,h3,h4')?.textContent.trim()||'Geometry '+(i+1);n.dataset.boardPanel=i;const opt=document.createElement('option');opt.value=i;opt.textContent=title;choices.append(opt);n.setAttribute('data-panel-title',title);});
 function fit(){pending=0;if(!area.isConnected||!area.clientHeight||!native.getClientRects().length)return;
  // Reflow at the actual panel width, not the physical monitor resolution.
  root.dataset.boardLayout=area.clientWidth<1600?'flow':'overview';
  root.style.setProperty('--board-tools-height',toolbar.offsetHeight+'px');
  root.style.setProperty('--board-key-height',key.offsetHeight+'px');
  board.style.zoom='1';board.style.width='100%';
  if(focus){board.style.height='100%';toolbar.querySelector('[data-board-fit-status]').textContent='Enlarged panel · Esc to return';return;}
  board.style.height='auto';
  if(root.dataset.boardLayout==='flow'){
   toolbar.querySelector('[data-board-fit-status]').textContent='Panels fit this width · scroll down for all views';return;
  }
  if(id===8||id===9){toolbar.querySelector('[data-board-fit-status]').textContent='Full-width plots · scroll between scenes';return;}
  const h=board.scrollHeight,w=board.scrollWidth,scale=Math.min(1,area.clientHeight/Math.max(h,1),area.clientWidth/Math.max(w,1));
  // A reading-size floor must never push the rightmost panel out of view.
  const applied=Math.min(area.clientWidth/Math.max(w,1),Math.max(.72,scale));board.style.zoom=String(applied);board.style.width='100%';
  toolbar.querySelector('[data-board-fit-status]').textContent=scale<.72?'Compact board · slight vertical scroll available':`Fit ${Math.round(applied*100)}% · all panels`;
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(fit);}
 function unfocus(){if(focus)focus.classList.remove('display-panel-focus');focus=null;root.classList.remove('has-panel-focus');choices.value='';schedule();window.dispatchEvent(new Event('resize'));}
 toolbar.addEventListener('click',e=>{if(e.target.closest('[data-board-fit]')){unfocus();area.scrollTop=0;}if(e.target.closest('[data-board-notes]'))reading.hidden=!reading.hidden;if(e.target.closest('[data-board-3d]'))companion.open=!companion.open;if(e.target.closest('[data-board-full]')){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{toolbar.querySelector('[data-board-fit-status]').textContent='Use your browser fullscreen command';});}},{signal});
 choices.addEventListener('change',()=>{const index=choices.selectedIndex-1;unfocus();if(index>=0){focus=candidates[index];focus.classList.add('display-panel-focus');root.classList.add('has-panel-focus');choices.value=index;fit();window.dispatchEvent(new Event('resize'));}},{signal});
 toolbar.querySelector('[data-board-prose]').addEventListener('change',e=>{root.classList.toggle('show-full-prose',e.target.checked);schedule();},{signal});
 close.addEventListener('click',()=>reading.hidden=true,{signal});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){if(companion.open)companion.open=false;else if(!reading.hidden)reading.hidden=true;else unfocus();}},{signal});
 // Revealing hidden plots requires a redraw even when the outer viewport is unchanged.
 const ro=new ResizeObserver(schedule);ro.observe(area);const mo=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.tagName==='MJX-CONTAINER')))schedule();});mo.observe(native,{childList:true,subtree:true});
 window.addEventListener('resize',schedule,{signal});document.addEventListener('fullscreenchange',schedule,{signal});
 root.addEventListener('toggle',schedule,{signal,capture:true});root.addEventListener('click',schedule,{signal});document.fonts.ready.then(schedule);schedule();
 return()=>{restore();cancelAnimationFrame(pending);abort.abort();ro.disconnect();mo.disconnect();root.classList.remove('display-board','has-panel-focus','show-full-prose');delete root.dataset.boardStep;delete root.dataset.boardLayout;root.style.removeProperty('--board-tools-height');root.style.removeProperty('--board-key-height');};
}
