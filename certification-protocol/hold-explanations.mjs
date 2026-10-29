// Explanations are momentary: hold the right button, release to dismiss.
export function mountHoldExplanations(doc=document){
 const win=doc.defaultView,abort=new AbortController(),opts={signal:abort.signal};let active=null,anchor=null,mode=null;
 const trigger=e=>e.target?.closest?.('[data-hold-explanation]');
 function hide(){if(active?.open)active.close();anchor?.setAttribute('aria-expanded','false');active=null;anchor=null;mode=null;}
 function show(el,kind){hide();const target=el.dataset.holdExplanation,dialog=target?doc.getElementById(target):el.nextElementSibling;if(!dialog||dialog.tagName!=='DIALOG')return;anchor=el;active=dialog;mode=kind;dialog.show();el.setAttribute('aria-expanded','true');}
 doc.addEventListener('pointerdown',e=>{const el=trigger(e);if(el&&e.button===2){e.preventDefault();show(el,'mouse');}}, {...opts,capture:true});
 doc.addEventListener('mousedown',e=>{const el=trigger(e);if(el&&e.button===2){e.preventDefault();if(!active)show(el,'mouse');}},opts);
 doc.addEventListener('contextmenu',e=>{if(trigger(e))e.preventDefault();},opts);
 doc.addEventListener('auxclick',e=>{if(e.button===2&&trigger(e))e.preventDefault();},opts);
 win.addEventListener('pointerup',e=>{if(mode==='mouse'&&(e.button===2||!(e.buttons&2)))hide();},{...opts,capture:true});
 win.addEventListener('mouseup',e=>{if(mode==='mouse'&&e.button===2)hide();},{...opts,capture:true});
 win.addEventListener('pointermove',e=>{if(mode==='mouse'&&!(e.buttons&2))hide();},opts);
 win.addEventListener('pointercancel',hide,opts);win.addEventListener('blur',hide,opts);win.addEventListener('hashchange',hide,opts);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)hide();},opts);
 doc.addEventListener('keydown',e=>{const el=trigger(e);if(el&&['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)show(el,'keyboard');}if(e.key==='Escape')hide();},opts);
 win.addEventListener('keyup',e=>{if(mode==='keyboard'&&['Enter',' '].includes(e.key))hide();},opts);
 doc.addEventListener('focusout',e=>{if(e.target===anchor)hide();},opts);
 return()=>{hide();abort.abort();};
}
