// Momentary derivation: no click-to-toggle state and no dismissal timer.
export function mountSchurHold(root) {
 const doc=root.ownerDocument,win=doc.defaultView,abort=new AbortController(),options={signal:abort.signal};
 const popup=doc.createElement('aside');popup.id='schur-derivation';popup.className='schur-derivation';popup.setAttribute('role','tooltip');popup.hidden=true;
 popup.innerHTML=`<h3>Why η<sub>Schur</sub> = 3 × 10⁻¹⁶ is sufficient</h3>
 <p>Write A = A₂°, Q = Q₂°, T = T₂° and S = QTQ⁻¹.</p>
 <ol><li><strong>Validated input bounds</strong><div class="schur-proof-line">δ<sub>Q</sub> := ‖Q*Q − I‖<sub>F</sub> &lt; g := 5 × 10⁻¹⁶<br>R := AQ − QT, &nbsp; ‖R‖<sub>F</sub> &lt; 2 × 10⁻¹⁶.</div></li>
 <li><strong>Control the inverse of Q</strong><div class="schur-proof-line">λ<sub>min</sub>(Q*Q) ≥ 1 − δ<sub>Q</sub> &gt; 1 − g &gt; 0,<br>so ‖Q⁻¹‖₂ ≤ 1/√(1 − g).</div></li>
 <li><strong>Transfer the residual to A − S</strong><div class="schur-proof-line">A − S = (AQ − QT)Q⁻¹ = RQ⁻¹,<br>‖A − S‖₂ ≤ ‖R‖<sub>F</sub> ‖Q⁻¹‖₂<br>&lt; (2 × 10⁻¹⁶)/√(1 − 5 × 10⁻¹⁶)<br>&lt; 3 × 10⁻¹⁶.</div></li></ol>
 <div class="schur-proof-result">Retain η<sub>Schur</sub> = 3 × 10⁻¹⁶.<br><span>This is an upper allowance, not the actual residual norm.</span></div><p class="schur-hold-note">Release the held button to close.</p>`;
 doc.body.append(popup);
 let anchor=null,mode=null,pointerId=null;
 const trigger=e=>e.target?.closest?.('[data-schur-hold]');
 function place(){if(!anchor)return;const a=anchor.getBoundingClientRect(),b=popup.getBoundingClientRect(),gap=12,pad=10;
  const x=Math.max(pad,Math.min(a.left,win.innerWidth-b.width-pad));
  const below=a.bottom+gap,above=a.top-b.height-gap;
  const y=below+b.height<=win.innerHeight-pad?below:above>=pad?above:Math.max(pad,Math.min(below,win.innerHeight-b.height-pad));
  popup.style.left=x+'px';popup.style.top=y+'px';
 }
 function hide(){const old=anchor,id=pointerId;anchor=null;mode=null;pointerId=null;popup.hidden=true;old?.setAttribute('aria-expanded','false');old?.removeAttribute('aria-describedby');if(id!==null&&old?.hasPointerCapture?.(id))old.releasePointerCapture(id);}
 function show(target,kind,id=null){hide();anchor=target;mode=kind;pointerId=id;popup.hidden=false;anchor.setAttribute('aria-expanded','true');anchor.setAttribute('aria-describedby',popup.id);place();}
 root.addEventListener('pointerdown',e=>{const t=trigger(e);if(e.button!==2||!t)return;e.preventDefault();show(t,'mouse',e.pointerId);try{t.setPointerCapture(e.pointerId);}catch{/* Window mouseup remains a fallback. */}},{...options,capture:true});
 // Covers a right-button press while another mouse button is already held.
 root.addEventListener('mousedown',e=>{const t=trigger(e);if(e.button===2&&t){e.preventDefault();if(!anchor)show(t,'mouse');}},options);
 root.addEventListener('contextmenu',e=>{if(trigger(e))e.preventDefault();},options);
 root.addEventListener('auxclick',e=>{if(e.button===2&&trigger(e))e.preventDefault();},options);
 win.addEventListener('mouseup',e=>{if(mode==='mouse'&&e.button===2)hide();},{...options,capture:true});
 win.addEventListener('pointerup',e=>{if(mode==='mouse'&&(e.button===2||!(e.buttons&2)))hide();},{...options,capture:true});
 win.addEventListener('pointermove',e=>{if(mode==='mouse'&&!(e.buttons&2))hide();},options);
 win.addEventListener('pointercancel',hide,options);
 root.addEventListener('lostpointercapture',e=>{if(mode==='mouse'&&e.pointerId===pointerId)hide();},options);
 // A momentary keyboard equivalent makes the same derivation accessible.
 root.addEventListener('keydown',e=>{const t=trigger(e);if(t&&(e.key===' '||e.key==='Enter')){e.preventDefault();if(!e.repeat)show(t,'keyboard');}if(e.key==='Escape')hide();},options);
 win.addEventListener('keyup',e=>{if(mode==='keyboard'&&(e.key===' '||e.key==='Enter'))hide();},{...options,capture:true});
 root.addEventListener('focusout',e=>{if(e.target===anchor)hide();},options);
 win.addEventListener('blur',hide,options);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)hide();},options);
 win.addEventListener('resize',place,options);
 win.addEventListener('scroll',place,{...options,capture:true});
 return{hide,destroy(){hide();abort.abort();popup.remove();}};
}
