import {loadMapProtocolContext, protocolURL} from './map-protocol-context.mjs?v=maps2';
import {defaultToyURL} from './example-chooser.mjs?v=maps2';
import {mountMapProtocolStep,mountMapProtocolOverview,mapProtocolMetadata,mapProtocolArgument,
  mapProtocolPreparation,mapProtocolAssumptions,mapProtocolLedger} from './map-protocol-view.mjs?v=latex2';

const $ = selector => document.querySelector(selector);
const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected = new URL(location.href).searchParams.get('example');
const overview = !!$('#story-4k-root');
const host = overview ? $('#story-4k-root') : $('#workspace');
document.documentElement.classList.add('map-certification');
// Rational proof tables can contain very long integers. Typeset only explicit
// data-tex formulas; leave exact entries and live numerical readouts as text.
document.body.classList.add('mathjax_ignore');
let cleanup, context, activeTab = 'geometry';
const formulaCache=new Map();
let formulaQueue=Promise.resolve();
function typesetFormulas() {
  const holders=[...document.querySelectorAll('[data-tex]:not([data-map-typeset])')];
  holders.forEach(el=>el.dataset.mapTypeset='queued');
  formulaQueue=formulaQueue.then(async()=>{
    const mj=await window.siteMathReady;
    for(const el of holders) {
      if(!el.isConnected) continue;
      const tex=el.dataset.tex;
      let rendered=formulaCache.get(tex);
      if(!rendered) { rendered=await mj.tex2svgPromise(tex,{display:false}); formulaCache.set(tex,rendered); }
      if(el.isConnected) { el.replaceChildren(rendered.cloneNode(true)); el.setAttribute('role','img'); el.setAttribute('aria-label',tex); el.dataset.mapTypeset='ready'; }
    }
  }).catch(error=>{console.error('Map formula rendering failed',error);});
}
const stepHash = n => `#step-${String(n).padStart(2,'0')}`;
const scope = 'Exact map-derived finite toy · 3 resolved modes → 4 ambient coordinates. The original map’s transfer operator requires additional analytic and validated assembly bounds.';

function closeMenu() {
  $('#sidebar')?.classList.remove('open');
  if ($('#scrim')) $('#scrim').hidden = true;
  $('#menu-toggle')?.setAttribute('aria-expanded','false');
}
function selectTab(key) {
  activeTab = key;
  for (const button of document.querySelectorAll('.tabs [data-tab]')) {
    const on = button.dataset.tab === key;
    button.setAttribute('aria-selected', String(on)); button.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.hidden = !on;
  }
  window.dispatchEvent(new Event('resize'));
}
function installShell() {
  $('.sidebar-intro .eyebrow').textContent = 'MAP-DERIVED TOY';
  $('.sidebar-footer').innerHTML = '<div>13 certification steps<span>Exact finite toy and separate operator gate</span></div>';
  $('.topbar-label').textContent = context.map.label;
  const nav = $('#step-nav');
  nav.innerHTML = '<a class="step-link" href="#protocol">Protocol and map</a><a class="step-link" href="#preparation">Matrices and construction</a><a class="step-link" href="#assumptions">Assumptions and scope</a>';
  let group;
  for (let step=1; step<=13; step++) {
    const meta = mapProtocolMetadata(context, step);
    if (meta.group !== group) { group = meta.group; const h=document.createElement('p'); h.className='nav-group-title'; h.textContent=group||'Certification route'; nav.append(h); }
    const link=document.createElement('a'); link.className='step-link'; link.href=stepHash(step);
    link.innerHTML=`<span class="step-number">${String(step).padStart(2,'0')}</span><span>${escape(meta.title)}</span>`; nav.append(link);
  }
  const strip = document.createElement('nav'); strip.className='map-step-strip'; strip.setAttribute('aria-label','All certification steps');
  strip.innerHTML='<strong>Certification</strong>'+Array.from({length:13},(_,i)=>`<a href="${stepHash(i+1)}" aria-label="Step ${i+1}">${String(i+1).padStart(2,'0')}</a>`).join('');
  $('.example-chooser').after(strip);
  $('.workspace-grid').classList.add('map-workspace-grid');
  $('.details-rail').remove();
  $('.status-badge').textContent = context.certificate.status === 'pass' ? 'Finite toy · all gates pass' : 'Finite toy · inspect gates';
  $('.scope-note').textContent = scope;
  $('#reference-dialog .dialog-body').innerHTML = mapProtocolLedger(context);
  $('#reference-title').textContent = `${context.map.label} · exact toy data`;
  const overviewLink = document.createElement('a'); overviewLink.className='page-button'; overviewLink.textContent='Complete overview ↗';
  overviewLink.href = protocolURL(selected,12,true); $('.workspace-heading').append(overviewLink);
  const visibleTabs=['geometry','argument','connections'];
  for (const tab of document.querySelectorAll('.tabs [data-tab]')) {
    tab.hidden=!visibleTabs.includes(tab.dataset.tab);
    if (!tab.hidden) tab.addEventListener('click',()=>selectTab(tab.dataset.tab));
  }
  $('.tabs').addEventListener('keydown', event=>{
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const tabs=[...document.querySelectorAll('.tabs [data-tab]:not([hidden])')];
    let i=tabs.indexOf(document.activeElement); if(i<0) return;
    i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    event.preventDefault(); tabs[i].click(); tabs[i].focus();
  });
  $('#reference-open').addEventListener('click',()=>$('#reference-dialog').showModal());
  $('#reference-close').addEventListener('click',()=>$('#reference-dialog').close());
  $('#menu-toggle').addEventListener('click',()=>{
    const open=$('#sidebar').classList.toggle('open'); $('#scrim').hidden=!open;
    $('#menu-toggle').setAttribute('aria-expanded',String(open));
  });
  $('#scrim').addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
}
function render() {
  cleanup?.(); cleanup=undefined;
  const route=location.hash.slice(1)||'step-01';
  const intro=['protocol','preparation','assumptions'].includes(route);
  $('#intro-page').hidden=!intro; $('#step-page').hidden=intro;
  if (intro) {
    $('#intro-page').innerHTML = route==='preparation'?mapProtocolPreparation(context):route==='assumptions'?mapProtocolAssumptions(context):
      `<section class="map-protocol-intro"><p class="eyebrow">MAP-DERIVED CERTIFICATION TOY</p><h1>${escape(context.map.label)}</h1><p>${escape(context.map.formulaText)}</p><p>Follow the complete contour, Schur, matrix-enclosure, direct-sum and operator-gate process for this map’s own frozen matrices.</p><p>${scope}</p><a class="page-button primary" href="#step-01">Start the certification process →</a><p><a href="#preparation">Inspect the matrices and construction</a></p></section>`;
  } else {
    const parsed=/^step-(0[1-9]|1[0-3])$/.exec(route);
    const step=parsed?Number(parsed[1]):1;
    const meta=mapProtocolMetadata(context,step);
    $('#step-kicker').textContent=`STEP ${String(step).padStart(2,'0')} / 13 · ${context.map.label}`;
    $('#step-title').textContent=meta.title;
    $('#step-intro').textContent=meta.intro||'';
    $('#space-label').textContent=meta.space||'Map-derived finite toy';
    $('#evidence-label').textContent=step===5?'Pointwise numerical diagnostic':'Exact finite certificate';
    $('#panel-geometry').replaceChildren();
    $('#panel-argument').innerHTML=mapProtocolArgument(context,step);
    $('#panel-connections').innerHTML=`<h2>Place in the certification process</h2><p>${escape(meta.connection||meta.guardrail||'Follow the exact uniform certificate through the connected steps.')}</p><div class="map-connection-links">${step>1?`<a href="${stepHash(step-1)}">← Step ${step-1}</a>`:''}${step<13?`<a href="${stepHash(step+1)}">Step ${step+1} →</a>`:''}<a href="${protocolURL(selected,12,true)}">Complete overview</a></div><p>${scope}</p>`;
    cleanup=step===12?mountMapProtocolOverview($('#panel-geometry'),context,{immersive:false}):mountMapProtocolStep($('#panel-geometry'),context,step,{immersive:false});
    $('#previous-step').href=stepHash(Math.max(1,step-1)); $('#previous-step').hidden=step===1;
    $('#next-step').href=stepHash(Math.min(13,step+1)); $('#next-step').hidden=step===13;
    $('#step-position').textContent=`${step} of 13 · ${context.map.label}`;
    document.title=`${meta.title} · ${context.map.label}`;
    selectTab(activeTab);
  }
  for (const link of document.querySelectorAll('#step-nav a,.map-step-strip a')) {
    if (link.hash===`#${route}`) link.setAttribute('aria-current','step'); else link.removeAttribute('aria-current');
  }
  $('#route-announcement').textContent=intro?route:$('#step-title').textContent;
  typesetFormulas();
  closeMenu();
}
try {
  context=await loadMapProtocolContext(selected);
  if(overview) {
    for(const link of document.querySelectorAll('.story-all-steps>a')) {
      const n=Number(link.textContent); link.href=protocolURL(selected,n,n===12);
    }
    document.title=`Complete certification · ${context.map.label}`;
    cleanup=mountMapProtocolOverview(host,context,{immersive:true});
  } else { installShell(); render(); window.addEventListener('hashchange',render); }
  typesetFormulas();
} catch(error) {
  host.replaceChildren(); const section=document.createElement('section'); section.className='map-protocol-intro';
  const h=document.createElement('h1'); h.textContent='This map certification could not be loaded';
  const p=document.createElement('p'); p.textContent=error.message;
  const link=document.createElement('a'); link.href=defaultToyURL(); link.textContent='Open the original default toy';
  section.append(h,p,link); host.append(section); console.error(error);
} finally {
  document.documentElement.classList.remove('map-loading');
}
window.addEventListener('pagehide',()=>cleanup?.(),{once:true});
