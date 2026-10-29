import {mountGateOverview} from './step-eleven-overview.mjs?v=117';
import {mountStepThirteen,stepThirteenArgument} from './step-thirteen.mjs?v=103';
import {mountHoldExplanations} from './hold-explanations.mjs?v=103';
mountHoldExplanations();
import {stepEightOptionalUpperBound} from './step-eight-optional.mjs?v=103';
import {mountGateTwoRadius} from './gate-two-radius.mjs?v=103';
import {is4K,mountDisplay4K,displayURL} from './display-4k.mjs?v=118';
import {mountStepTwelve,stepTwelveArgument} from './step-twelve.mjs?v=103';
import {mountStepEleven,stepElevenArgument} from './step-eleven.mjs?v=117';
import {fullQuantityLedger,quantityContext} from './quantity-ledger.mjs?v=103';
import {mountStepTen,stepTenArgument} from './step-ten.mjs?v=103';
import {mountStepNine,stepNineArgument} from './step-nine.mjs?v=103';
import {mountStepEight,stepEightArgument} from './step-eight.mjs?v=103';
import {startMath} from './math-render.mjs?v=103';
import { mountPreparation } from './preparation.mjs?v=103';
import { mountStepSix, stepSixArgument } from './step-six.mjs?v=103';
import { mountStepSeven, stepSevenArgument } from './step-seven.mjs?v=103';
import { mountStepFive, stepFiveArgument } from './step-five.mjs?v=103';
import { mountStepFour, stepFourArgument } from './step-four.mjs?v=103';
import { mountStepThree, stepThreeArgument } from './step-three.mjs?v=103';
import { mountStepTwo, stepTwoArgument } from './step-two.mjs?v=103';
import { mountStepOne, stepOneArgument } from './step-one.mjs?v=103';
import { steps } from './steps.mjs?v=103';
import { protocolPage, assumptionsPage, protocolStages, stageDetails } from './intro-pages.mjs?v=103';
const $ = (selector) => document.querySelector(selector);
const sidebar = $('#sidebar');
const menu = $('#menu-toggle');
const scrim = $('#scrim');
const dialog = $('#reference-dialog');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const geometrySkeleton = $('#panel-geometry').innerHTML;
const argumentSkeleton = $('#panel-argument').innerHTML;
let unmountScene = null;
let unmountRadius = null;
let unmountDisplay = null;
let unmountGateOverview = null;
const displayLaunch=element('a','display-launch','4K display ↗');displayLaunch.target='_blank';displayLaunch.rel='noopener';
const headingActions=element('div','heading-actions');headingActions.append($('.status-badge'),displayLaunch);$('.workspace-heading').append(headingActions);
const displayNav=element('nav','display-nav');displayNav.setAttribute('aria-label','4K step navigation');displayNav.append(element('strong','','4K display'));for(let id=1;id<=steps.length;id++){const a=element('a','',String(id).padStart(2,'0'));a.href=displayURL(id);a.setAttribute('aria-label','4K step '+id);displayNav.append(a);}$('.topbar').prepend(displayNav);
let activeId = 1;
const requestedTab = new URLSearchParams(location.search).get('tab');
let activeTab = ['geometry','argument','gate2','connections','optional-upper','gate-diagram'].includes(requestedTab) ? requestedTab : 'geometry';
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function path(id) { return '#step-' + String(id).padStart(2, '0'); }
function closeMenu() {
  sidebar.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); scrim.hidden = true;
}
function selectTab(name, focus = false) {
  if(name==='gate-diagram'&&activeId!==11)name='geometry';
  if(name==='gate2'&&activeId!==7)name='geometry';
  if(name==='optional-upper'&&activeId!==8)name='geometry';
  activeTab = name;
  for (const tab of tabs) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    $('#' + tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  }
}
function makeLink(id, label) {
  const step = steps.find(s => s.id === id);
  const a = element('a','connection-link');
  a.href = path(id);
  a.append(element('span','connection-number',String(id).padStart(2,'0')),element('span','',label || step.title),element('span','connection-arrow','↗'));
  return a;
}
const introNav = element('div','intro-nav');
for (const [slug,title,symbol] of [['protocol','Certification Protocol','∮'],['assumptions','Assumptions for the Toy Example','≡'],['preparation','Freeze & validate Schur data','P']]) {
  const a = element('a','step-link intro-link');
  a.href = '#'+slug; a.dataset.page = slug;
  a.append(element('span','nav-number',symbol),element('span','nav-title',title));
  introNav.append(a);
}
$('#step-nav').append(introNav);
let lastGroup = '';
for (const step of steps) {
  if (step.group !== lastGroup) {
    $('#step-nav').append(element('p','nav-group',step.group)); lastGroup = step.group;
  }
  const a = element('a','step-link');
  a.href = path(step.id); a.dataset.stepId = String(step.id);
  a.append(element('span','nav-number',String(step.id).padStart(2,'0')),element('span','nav-title',step.title));
  const dot = element('span','nav-dot'); dot.setAttribute('aria-hidden','true'); a.append(dot);
  $('#step-nav').append(a);
}
$('#notation-list').innerHTML=fullQuantityLedger();

function render() {
  if(unmountGateOverview){unmountGateOverview();unmountGateOverview=null;}
  $('#panel-gate-diagram').replaceChildren();
  $('#tab-gate-diagram').hidden=true;
  if(unmountRadius){unmountRadius();unmountRadius=null;}
  $('#panel-gate2').replaceChildren();
  $('#tab-gate2').hidden=true;
  $('#tab-optional-upper').hidden=true;
  $('#panel-optional-upper').replaceChildren();
  if(unmountDisplay){unmountDisplay();unmountDisplay=null;}
  if (unmountScene) { unmountScene(); unmountScene = null; }
  $('#panel-geometry').innerHTML = geometrySkeleton;
  $('#panel-argument').innerHTML = argumentSkeleton;
  $('#step-page').classList.remove('step-one','step-two','step-three','step-four','step-five','step-six','step-seven','step-eight','step-nine','step-ten','step-eleven','step-twelve','step-thirteen');
  $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Planned';
  const introductory = location.hash === '#preparation' ? 'preparation' : location.hash === '#assumptions' ? 'assumptions' : (location.hash === '#protocol' || !location.hash ? 'protocol' : null);
  $('#intro-page').hidden = !introductory;
  $('#step-page').hidden = Boolean(introductory);
  for (const a of document.querySelectorAll('.step-link')) a.removeAttribute('aria-current');
  if (introductory) {
    activeId = null;
    if (!location.hash) history.replaceState(null,'','#protocol');
    $('#intro-page').innerHTML = introductory === 'protocol' ? protocolPage() : assumptionsPage();
    if (introductory === 'preparation') { unmountScene = mountPreparation($('#intro-page')); $('#intro-page .prep-placement')?.insertAdjacentHTML('afterend',quantityContext('preparation')); }
    const title = introductory === 'preparation' ? 'Preparation: freeze & validate Schur data' : introductory === 'protocol' ? 'Certification Protocol' : 'Assumptions for the Toy Example';
    document.title = title + ' · Lucy’s mathematical toy';
    document.querySelector('[data-page="'+introductory+'"]').setAttribute('aria-current','page');
    $('#route-announcement').textContent = title;
    closeMenu();
    window.scrollTo(0,0);
    return;
  }
  const match = /^#step-(\d{2})$/.exec(location.hash);
  const chosen = match ? Number(match[1]) : 1;
  activeId = chosen >= 1 && chosen <= steps.length ? chosen : 1;
  const step = steps[activeId-1];
  $('#tab-gate2').hidden=activeId!==7;
  $('#tab-gate-diagram').hidden=activeId!==11;
  $('#tab-optional-upper').hidden=activeId!==8;
  displayLaunch.href=is4K?'./#step-'+String(activeId).padStart(2,'0'):displayURL(activeId);displayLaunch.textContent=is4K?'Standard view ↗':'4K display ↗';
  [...displayNav.querySelectorAll('a')].forEach((a,i)=>{if(i+1===activeId)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  $('#quantity-context').innerHTML=activeId>=12?'':quantityContext(activeId);
  $('#quantity-context').hidden=!$('#quantity-context').firstElementChild;
  if (location.hash !== path(activeId)) history.replaceState(null,'',path(activeId));
  document.title = step.title + ' · Certification protocol';
  $('#step-kicker').textContent = 'STEP ' + String(activeId).padStart(2,'0') + ' / ' + steps.length + ' · ' + step.group;
  $('#step-title').textContent = step.title;
  $('#step-intro').textContent = step.intro;
  $('#space-label').textContent = step.space;
  $('#evidence-label').textContent = step.type;
  $('#canvas-label').textContent = step.scene;
  $('#empty-step').textContent = String(activeId).padStart(2,'0');
  $('#empty-title').textContent = step.scene;
  $('#canvas-space').textContent = 'Step ' + String(activeId).padStart(2,'0');
  $('#guardrail').textContent = step.guardrail;
  $('#argument-note').textContent = step.note;
  $('#connections-title').textContent = step.id === 5 ? 'The pointwise diagnostic branch' : 'What comes into this step';
  $('#connections-copy').textContent = step.connection;
  $('#planned-views').replaceChildren(...step.views.map((view,i) => {
    const li = element('li'); li.append(element('span','view-number',String(i+1).padStart(2,'0')),element('span','',view)); return li;
  }));
  const links = $('#connection-links'); links.replaceChildren();
  for (const [label,ids] of [['Related earlier steps',step.from],['Continue to',step.to]]) {
    if (!ids.length) continue;
    links.append(element('p','connection-label',label));
    ids.forEach(id => links.append(makeLink(id)));
  }
  for (const a of document.querySelectorAll('.step-link')) {
    if (Number(a.dataset.stepId) === activeId) a.setAttribute('aria-current','step');
    else a.removeAttribute('aria-current');
  }
  for (const [selector,id] of [['#previous-step',activeId-1],['#next-step',activeId+1]]) {
    const a = $(selector), valid = id >= 1 && id <= steps.length;
    a.classList.toggle('is-disabled',!valid);
    if (valid) { a.href = path(id); a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); }
    else { a.removeAttribute('href'); a.setAttribute('aria-disabled','true'); a.tabIndex = -1; }
  }
  $('#previous-step').textContent = activeId === 1 ? '← Preparation' : '← Previous step';
  if (activeId === 1) {
    const previous = $('#previous-step');
    previous.href = '#preparation';
    previous.classList.remove('is-disabled');
    previous.removeAttribute('aria-disabled');
    previous.removeAttribute('tabindex');
  }
  window.scrollTo(0,0);
  $('#step-position').textContent = 'Step ' + String(activeId).padStart(2,'0') + ' of ' + steps.length;
  $('#route-announcement').textContent = 'Step ' + activeId + ': ' + step.title + '. Visualization planned.';
  if (activeId === 1) {
    $('#step-page').classList.add('step-one');
    $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Interactive';
    unmountScene = mountStepOne($('#panel-geometry'));
    $('#panel-argument').innerHTML = stepOneArgument();
    $('#route-announcement').textContent = 'Step 1: interactive spectral disk.';
  }
  if (activeId === 2) {
    $('#step-page').classList.add('step-two');
    $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Interactive';
    unmountScene = mountStepTwo($('#panel-geometry'));
    $('#panel-argument').innerHTML = stepTwoArgument();
    $('#route-announcement').textContent = 'Step 2: interactive distances to the contour.';
  }
  if (activeId === 3) {
    $('#step-page').classList.add('step-three');
    $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Interactive';
    unmountScene = mountStepThree($('#panel-geometry'));
    $('#panel-argument').innerHTML = stepThreeArgument();
    $('#route-announcement').textContent = 'Step 3: interactive reciprocal circles and triangular recurrences.';
  }
  if (activeId === 4) {
    $('#step-page').classList.add('step-four');
    $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Interactive';
    unmountScene = mountStepFour($('#panel-geometry'));
    $('#panel-argument').innerHTML = stepFourArgument();
    $('#route-announcement').textContent = 'Step 4: interactive similarity transport and Gate 1.';
  }
  if (activeId === 5) {
    $('#step-page').classList.add('step-five');
    $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Interactive';
    unmountScene = mountStepFive($('#panel-geometry'));
    $('#panel-argument').innerHTML = stepFiveArgument();
    $('#route-announcement').textContent = 'Step 5: interactive SVD at the selected point.';
  }
  if (activeId === 6 || activeId === 7) {
    $('#step-page').classList.add(activeId === 6 ? 'step-six' : 'step-seven');
    $('.status-badge').innerHTML = '<span class="outline-dot" aria-hidden="true"></span>Interactive';
    unmountScene = activeId===6 ? mountStepSix($('#panel-geometry')) : mountStepSeven($('#panel-geometry'),{onMatrixChange:error=>unmountRadius?.setError(error)});
    if(activeId===7)unmountRadius=mountGateTwoRadius($('#panel-gate2'),{getMatrix:()=>unmountScene.getSelectedMatrix(),setMatrix:error=>unmountScene.setSelectedMatrix(error)});
    $('#panel-argument').innerHTML = (activeId === 6 ? stepSixArgument : stepSevenArgument)();
    $('#route-announcement').textContent = activeId === 6 ? 'Step 6: interactive dyadic entries and Arb rectangles.' : 'Step 7: rotatable 3D matrix operator-norm enclosure.';
  }
  if(activeId===8){$('#step-page').classList.add('step-eight');$('.status-badge').innerHTML='<span class="outline-dot" aria-hidden="true"></span>Interactive';unmountScene=mountStepEight($('#panel-geometry'));$('#panel-argument').innerHTML=stepEightArgument();$('#panel-optional-upper').innerHTML=stepEightOptionalUpperBound();$('#route-announcement').textContent='Step 8: interactive output uncertainty and Gate 2.';}
  if(activeId===9){$('#step-page').classList.add('step-nine');$('.status-badge').innerHTML='<span class="outline-dot" aria-hidden="true"></span>Interactive';unmountScene=mountStepNine($('#panel-geometry'));$('#panel-argument').innerHTML=stepNineArgument();$('#route-announcement').textContent='Step 9: common protected inner ball across the entire contour.';}
  if(activeId===10){$('#step-page').classList.add('step-ten');$('.status-badge').innerHTML='<span class="outline-dot" aria-hidden="true"></span>Interactive';unmountScene=mountStepTen($('#panel-geometry'));$('#panel-argument').innerHTML=stepTenArgument();$('#route-announcement').textContent='Step 10: exact direct-sum lift, with linked block actions and a rotatable three-dimensional image section.';}
  if(activeId===11){$('#step-page').classList.add('step-eleven');$('.status-badge').innerHTML='<span class="outline-dot" aria-hidden="true"></span>Interactive';unmountScene=mountStepEleven($('#panel-geometry'));$('#panel-argument').innerHTML=stepElevenArgument();unmountGateOverview=mountGateOverview($('#panel-gate-diagram'));$('#route-announcement').textContent='Step 11: separate operator perturbation, protected output balls and eigenvalue count one.';}
  if(activeId===12){$('#step-page').classList.add('step-twelve');$('.status-badge').innerHTML='<span class="outline-dot" aria-hidden="true"></span>Interactive';unmountScene=mountStepTwelve($('#panel-geometry'));$('#panel-argument').innerHTML=stepTwelveArgument();$('#route-announcement').textContent='Step 12: one connected geometric certification diagram with a separate SVD branch.';}
  if(activeId===13){$('#step-page').classList.add('step-thirteen');$('.status-badge').innerHTML='<span class="outline-dot" aria-hidden="true"></span>Thesis connection';unmountScene=mountStepThirteen($('#panel-geometry'));$('#panel-argument').innerHTML=stepThirteenArgument();$('#route-announcement').textContent='Step 13: the toy as a Hardy-space certification example.';}
  if(is4K&&activeId<12)unmountDisplay=mountDisplay4K($('#panel-geometry'),activeId);
  selectTab(activeTab);
  closeMenu();
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click',() => selectTab(tab.dataset.tab));
  tab.addEventListener('keydown',event => {
    const available=tabs.filter(t=>!t.hidden),current=available.indexOf(tab);let next;
    if (event.key === 'ArrowRight') next = (current+1)%available.length;
    if (event.key === 'ArrowLeft') next = (current+available.length-1)%available.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = available.length-1;
    if (next !== undefined) { event.preventDefault(); selectTab(available[next].dataset.tab,true); }
  });
});
menu.addEventListener('click',() => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  sidebar.classList.toggle('is-open',open); menu.setAttribute('aria-expanded',String(open)); scrim.hidden = !open;
});
scrim.addEventListener('click',closeMenu);
$('#reference-open').addEventListener('click',() => dialog.showModal());
document.addEventListener('click',event=>{if(event.target.closest('[data-open-quantity-ledger]'))dialog.showModal();if(event.target.closest('#reference-dialog a[href^="#"]'))dialog.close();});
$('#reference-close').addEventListener('click',() => dialog.close());
dialog.addEventListener('click',event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
document.addEventListener('keydown',event => { if (event.key === 'Escape') closeMenu(); });
$('#intro-page').addEventListener('click', event => {
  const stage = event.target.closest('[data-protocol-stage]');
  if (stage) {
    const index = Number(stage.dataset.protocolStage);
    if (Number.isInteger(index) && protocolStages[index]) {
      $('#protocol-detail').innerHTML = stageDetails(index);
      for (const button of document.querySelectorAll('[data-protocol-stage]')) button.setAttribute('aria-pressed',String(button === stage));
    }
  }
  const scroll = event.target.closest('[data-flow-scroll]');
  if (scroll) {
    const area = document.querySelector('.protocol-scroll');
    area.scrollBy({left:Number(scroll.dataset.flowScroll)*Math.max(248,area.clientWidth*0.75),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
});
$('.skip-link').addEventListener('click',event => { event.preventDefault(); $('#workspace').focus(); });
window.addEventListener('hashchange',render);
render();

startMath();
