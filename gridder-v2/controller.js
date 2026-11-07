/* Gridder 2 gameplay controller. Deterministic rules are retained from the
 * original derivative lesson; Phaser supplies presentation and frame ticks. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),catalogue=window.derivativeGridderCatalogue,M=catalogue?.maths||window.derivativeMath,G=window.derivativeGridderMath,P=window.derivativePalette,C=window.derivativeGridderChase,D=window.derivativeGridderCapture,R=window.derivativeGridderRemains;
  const labels={min:'minimum',max:'maximum',inflection:'inflection point',derivative:'first derivative',second:'second derivative',inverse:'inverse function',normal:'perpendicular normal line',exploration:'displayed function model',singularity:'singular locations',discontinuity:'discontinuities',nondifferentiable:'points without a derivative'};
  const startingLives=7;
  const roadmap=catalogue&&window.GridderFunctionRoadmap?.build(catalogue,G);
  const roadmapStorageKey='gridder-v2-roadmap-v1',completedFunctions=new Set();
  let roadmapCurrentKey=roadmap?.keys[0]||null;
  if(roadmap){
    try{
      const saved=JSON.parse(window.localStorage?.getItem(roadmapStorageKey)||'null');
      if(saved?.version===roadmap.version&&Array.isArray(saved.completedKeys)){
        if(typeof saved.currentKey==='string'&&roadmap.byKey[saved.currentKey])roadmapCurrentKey=saved.currentKey;
        for(const savedKey of saved.completedKeys)if(typeof savedKey==='string'&&roadmap.byKey[savedKey])completedFunctions.add(savedKey);
      }
    }catch{} // Private browsing, unavailable storage and malformed saves start safely.
  }
  function roadmapSnapshot(){
    const currentKey=roadmapCurrentKey||key,currentIndex=roadmap?roadmap.keys.indexOf(currentKey):-1;
    return {route:roadmap||null,currentKey,currentIndex,
      completedKeys:roadmap?roadmap.keys.filter(k=>completedFunctions.has(k)):[],
      nextKey:roadmap?.keys[currentIndex+1]||null,
      finished:Boolean(roadmap&&roadmap.keys.every(k=>completedFunctions.has(k)))};
  }
  function saveRoadmap(){
    if(!roadmap)return;
    try{window.localStorage?.setItem(roadmapStorageKey,JSON.stringify({version:roadmap.version,currentKey:roadmapCurrentKey,completedKeys:roadmapSnapshot().completedKeys}));}catch{}
  }
  function announceRoadmapChange(){
    const Event=window.CustomEvent;
    if(roadmap&&typeof Event==='function'&&typeof window.dispatchEvent==='function')window.dispatchEvent(new Event('gridder-roadmap-change',{detail:roadmapSnapshot()}));
  }
  function selectRoadmapKey(nextKey){
    if(!roadmap?.byKey[nextKey]||roadmapCurrentKey===nextKey)return;
    roadmapCurrentKey=nextKey;saveRoadmap();announceRoadmapChange();
  }
  const roadmapOpen=()=>Boolean(window.GridderRoadmapDemo?.isOpen());
  // The 280 px/s setting was tuned on a 1030px-wide plotted grid. Player
  // screen speed scales uniformly with the visual size on both axes.
  const referenceMovementPlotWidth=1030;
  const snagDuration=40,snagSpeed=.3;
  // Start a loaded page from its declared defaults, including restored form controls.
  for(const id of ['gridder-speed','gridder-resolution-vertical-in','gridder-resolution-horizontal-in','gridder-resolution-vertical-out','gridder-resolution-horizontal-out','gridder-centre-pause','gridder-music-volume']){
    const input=$(id);if(typeof input?.defaultValue==='string')input.value=input.defaultValue;
  }
  for(const id of ['gridder-spiders','gridder-sound','gridder-music']){
    const input=$(id);if(typeof input?.defaultChecked==='boolean')input.checked=input.defaultChecked;
  }
  const sound=window.derivativeGridderSound?.create(()=> $('gridder-sound').checked);
  const music=window.GridderArcadeMusic?.create({enabled:()=>$('gridder-music')?.checked===true,volume:()=>Number($('gridder-music-volume')?.value??30)/100},window);
  window.gridderMusic=music;
  let key='quadratic',difficulty='guided',quests=[],level=0,game=null,walker=null,active=false,playing=false,revealed=[],announced=false,held=null,frame=null,lastTime=null,command=null,capture=null,pending=[],turn=null,lastTravel=null,centreUntil=0,chase=null,lives=startingLives,chaseTime=0,safeUntil=0,resurrectionUntil=0,gameOver=false;
  const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
  const directionControls=[['left',directions.ArrowLeft],['right',directions.ArrowRight],['up',directions.ArrowUp],['down',directions.ArrowDown]].map(([name,direction])=>({button:$('gridder-'+name),direction}));
  const pointerHolds=new Map();
  const fireButton=$('gridder-fire'),firePointerHolds=new Map();
  let keyboardFireHeld=false,keyboardFireConsumed=false,keyboardActionDown=false,suppressFireClick=false,selectedWeapon='gun';
  const shiftHolds=new Set();
  let keyboardHold=null,inputOrder=0;
  let deathScene=null,deathAttacker=null,remains=null,captureSoundPhase=null,snagRemaining=0,playerPushes=[],pushAudible=false,walkAudible=false,levelGraph=null;
  let frameGeometry=null,geometryFrame=false,gaps=null,navigation=null,poolLeeches=null,leechWarningId=null,ecology=null,weapon=null,bombs=null,boost=null;
  let resurrectionStartedAt=0,resurrectionSoundSynced=false;
  function beginFrame(){geometryFrame=true;frameGeometry=null;}
  function endFrame(){geometryFrame=false;frameGeometry=null;}
  function boardLayout(){
    if(geometryFrame&&frameGeometry?.board===game.board)return frameGeometry.layout;
    const box=$('gridder-board').getBoundingClientRect(),card=$('gridder-game-area');
    let options;
    if(card?.classList?.contains('is-touch-arena')){
      const style=getComputedStyle(card),insets={};
      for(const side of ['left','right','top','bottom'])insets[side]=parseFloat(style.getPropertyValue('--gridder-arena-'+side))||0;
      options={stretch:true,insets,minCellAspect:.6,maxCellAspect:2.2};
      if(card.classList.contains('is-phone-fullscreen')){
        options.fitAxis=box.width>box.height?'height':'width';
        options.hideAxisLabels=true;
      }
    }
    const layout=G.layout(game.board,box.width,box.height,options);
    if(geometryFrame)frameGeometry={board:game.board,layout};
    return layout;
  }
  const familyId=()=>$('gridder-family')?.value||'algebraic';
  const enemyName=enemy=>enemy.species?.name?.toLowerCase()||window.GridderMonsterRoster?.get(familyId(),enemy.kind).name.toLowerCase()||(enemy.kind==='centipede'?'centipede':`${enemy.kind} spider`);
  const deathLabels={bite:'Bite',swell:'Swelling',decay:'Decaying',scatter:'Scattering'};
  const specialAttacks={
    fire:{action:'burns Gridder with fire; flames, charring and scattering follow',labels:{bite:'Burning',swell:'Flames',decay:'Charred aftermath',scatter:'Scattering'}},
    electric:{action:'shocks Gridder with electricity; aftershocks, scorching and scattering follow',labels:{bite:'Electric shock',swell:'Electric aftershocks',decay:'Scorched aftermath',scatter:'Scattering'}},
    'rotten-egg':{action:'pelts Gridder with rotten eggs; a foul aftermath and scattering follow',labels:{bite:'Rotten-egg impact',swell:'Covered in rotten egg',decay:'Foul aftermath',scatter:'Remains scattering'}}
  };
  function captureLabel(phase){
    return specialAttacks[deathAttacker?.attackType]?.labels[phase]||(deathAttacker?.attackOrgan==='tail'&&phase==='bite'?'Tail sting':deathLabels[phase]);
  }
  function populate(select,entries,value){select.innerHTML=entries.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');select.value=entries.some(e=>e[0]===value)?value:entries[0][0];}
  function chooseFamily(keepKey){
    const family=catalogue.families.find(f=>f.id===$('gridder-family').value)||catalogue.families[0];
    const existing=family.subfamilies.find(s=>s.keys.includes(keepKey));
    populate($('gridder-subfamily'),family.subfamilies.map(s=>[s.id,s.label]),existing?.id||$('gridder-subfamily').value);chooseSubfamily(keepKey);
  }
  function chooseSubfamily(keepKey){
    const family=catalogue.families.find(f=>f.id===$('gridder-family').value),sub=family.subfamilies.find(s=>s.id===$('gridder-subfamily').value);
    populate($('gridder-function'),sub.keys.map(k=>[k,M.curves[k].label]),keepKey||$('gridder-function').value);
    $('gridder-family-note').textContent=`${family.note} ${sub.note}`;
    const roster=window.GridderMonsterRoster?.list(family.id);
    const rosterNote=$('gridder-monster-roster');
    if(roster&&rosterNote)rosterNote.textContent=`Monsters: ${roster.map(creature=>creature.name).join(' · ')}`;
  }
  function selectFunction(nextKey){
    if(!catalogue){$('gridder-function').value=nextKey;restart();return;}
    const membership=catalogue.membership(nextKey);if(!membership)return;
    $('gridder-family').value=membership.family.id;$('gridder-subfamily').value=membership.subfamily.id;chooseFamily(nextKey);restart();
  }
  function continueRoadmap(){
    if(!roadmap)return;
    const currentKey=roadmapCurrentKey||roadmap.keys[0];
    if(!game||key!==currentKey)selectFunction(currentKey);
    else pause(); // Returning from the map retains this session's board and level.
  }
  if(catalogue){
    const initialKey=roadmapCurrentKey||'quadratic',membership=catalogue.membership(initialKey);
    populate($('gridder-family'),catalogue.families.map(f=>[f.id,f.label]),membership?.family.id||'algebraic');chooseFamily(initialKey);
  }
  else $('gridder-function').innerHTML=$('function-select').innerHTML;
  function clearMovement(){clearHeldInputs();held=null;command=null;capture=null;pending=[];turn=null;centreUntil=0;}
  function stopHold(){clearMovement();frame=null;lastTime=null;}
  function resurrecting(){return !gameOver&&chaseTime<resurrectionUntil;}
  function release(){held=null;}
  function pause(){playing=false;pushAudible=false;walkAudible=false;stopHold();clearFireInputs();shiftHolds.clear();sound?.stop();music?.pause();captureSoundPhase=null;resurrectionSoundSynced=false;$('gridder-normal-point').disabled=Boolean(deathScene||gameOver);$('gridder-start').textContent=canReplay()?'Play again':'Start game';$('gridder-start').setAttribute('aria-pressed','false');updateFireControl();updateBombControl();}
  function releasePlayerPushes(){for(const push of playerPushes)remains?.releasePlayerPush(push);playerPushes=[];pushAudible=false;}
  function beginPush(piece,from,to){
    const push=remains?.beginPlayerPush(piece,from,to,cellPixels);if(!push)return false;
    if(!push.done)playerPushes.push(push);
    else snagRemaining=snagDuration;
    $('gridder-feedback').textContent=push.done?'Pushed remains aside at the node.':'Pushing remains along the edge to the next node.';
    return true;
  }
  function syncGameSounds(){
    if(!canFire()||!weapon?.snapshot().ammo)clearFireInputs();
    const running=active&&playing&&!deathScene&&!resurrecting()&&!gameOver&&!game?.complete()&&$('gridder-sound').checked;
    // A released tap can finish between nodes with no further scheduled simulation frame in practice
    // mode. Stop here when movement ends or the last piece reaches its node.
    const pushing=pushAudible&&playerPushes.length>0&&Boolean(held||capture||command||pending.length);
    const walking=running&&walkAudible,intent=Boolean(held||capture||command||pending.length);
    if(walking&&!intent)sound?.step?.('gridder-walk');
    sound?.activity?.('walk','gridder-walk',walking&&intent);
    sound?.activity?.('push','gridder-push',running&&pushing);
    sound?.bulletFlight?.(running&&canFire()&&weapon.snapshot().bullets.length>0);
    for(const spider of chase?.spiders||[])sound?.activity?.('chew',spider.kind,running&&spidersEnabled()&&Boolean(spider.eating),(spider.eating?.elapsed||0)/1000);
  }
  function syncMusic(){
    music?.update({playing:active&&playing&&!gameOver&&!game?.complete()&&!deathScene&&chaseTime>=resurrectionUntil,hidden:document.hidden});
  }
  function syncCaptureSound(){
    if(!active||!playing||!deathScene||!$('gridder-sound').checked)return;
    const phase=deathScene.phase();if(phase.name==='end')return;
    if(phase.name!==captureSoundPhase){
      const duration=phase.name==='bite'&&deathAttacker?.kind==='leech'?deathAttacker.dragDuration:D.durations[phase.name];
      const started=sound?.capturePhase?.(phase.name,phase.progress,duration/1000,deathAttacker?.attackType);
      if(started!==false)captureSoundPhase=phase.name;
    }
  }
  function syncResurrectionSound(){
    if(!active||!playing||!resurrecting()||!$('gridder-sound').checked||resurrectionSoundSynced||!sound?.resurrection)return;
    const offset=Math.max(0,(chaseTime-resurrectionStartedAt)/1000);
    if(sound.resurrection(offset)!==false)resurrectionSoundSynced=true;
  }
  function unlockSound(){
    Promise.all([sound?.unlock(),music?.unlock()]).then(()=>{syncCaptureSound();syncResurrectionSound();syncGameSounds();syncMusic();});
  }
  const mathsText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function formula(){
    const c=M.curves[key];
    const node=$('gridder-formula'),rule=$('gridder-rule'),context=$('gridder-context'),mission=$('gridder-mission'),clue=$('gridder-mission-clue');
    const caseNodes=['gridder-case-formulas','gridder-case-method','gridder-case-meaning','gridder-case-domain'].map($),nodes=[node,rule,context,mission,clue,...caseNodes];window.MathJax?.typesetClear?.(nodes);
    // Dense-set definitions remain fully displayed in the maths panel; a
    // conventional function name keeps the small arena heading readable.
    const headingTex=key==='study_dirichlet'?'D(x)':key==='study_thomae'?'T(x)':c.tex;
    node.textContent=String.raw`\(f(x)=${headingTex}\)`;
    context.textContent=`${c.context||''} ${c.note||''}`.trim()||String.raw`Study \(f(x)=${c.tex}\) on the stated domain. Connect the formulas and reasoning below with the shapes you uncover on the grid.`;
    if(catalogue&&$('gridder-subfamily').value==='symmetry')context.textContent+=c.parity==='even'?String.raw` The original function is even: \(f(-x)=f(x)\). Its graph reflects in the y-axis.`:String.raw` The original function is odd: \(f(-x)=-f(x)\). Its graph has symmetry about the origin.`;
    if(catalogue&&$('gridder-subfamily').value==='periodic'&&c.period)context.textContent+=String.raw` The original function has period \(p\approx${M.format(c.period)}\): \(f(x+p)=f(x)\), wherever both sides are defined.`;
    const q=quests[level],kind=q?.kind,g=levelGraph;
    rule.textContent=q.graph?`${q.clue||q.displayNote} ${q.tex?String.raw`\(${q.tex}\)`:''}`.trim()
      :kind==='exploration'?c.study.displayNote
      :kind==='derivative'?String.raw`Your clue: \(f'(x)=${g.tex}\). Use this rule to predict its path.`
      :kind==='second'?String.raw`Differentiate twice: \(f''(x)=${g.tex}\). Positive means the function bends upwards; negative means it bends downwards.`
      :kind==='inverse'?String.raw`Chosen branch: \(${g.sourceTex}\). Swap coordinates to discover \(f^{-1}(x)=${g.tex}\). An inverse undoes the function; it is not the reciprocal \(1/f(x)\).`
      :kind==='normal'?String.raw`At \(a=${g.a}\), the tangent gradient is \(f'(a)\approx ${M.format(g.tangent).replaceAll('−','-')}\). Your normal: \(${g.tex}\). ${g.vertical?'A flat tangent has a vertical normal.':'Its gradient is the negative reciprocal of the tangent gradient.'}`
      :kind==='min'?String.raw`Look for a change from decreasing to increasing. At a smooth minimum, solve \(f'(a)=0\) and check the change of sign from − to +; at a corner, compare the two sides.`
      :kind==='max'?String.raw`Look for a change from increasing to decreasing. At a smooth maximum, solve \(f'(a)=0\) and check the change of sign from + to −; at a corner, compare the two sides.`
      :kind==='inflection'?String.raw`Find a change between upwards and downwards bending. Check that \(f''\) changes sign across the candidate; it may be undefined at the point, and \(f''(a)=0\) alone is not enough.`:'';
    const peers=quests.filter(item=>item.kind===kind&&item.point).sort((a,b)=>a.point.x-b.point.x);
    const number=q.point?peers.findIndex(item=>item.point.x===q.point.x)+1:0;
    const pointName=peers.length>1?`${labels[kind]} ${number} of ${peers.length}, counting from left to right`:labels[kind];
    mission.textContent=q.graph
      ? `${q.title}. Use the arrows to close loops around every rectangle touched by this level's target segments or filled dots. Completed rectangles reveal the targets. ${q.displayNote}`
      :kind==='exploration'
      ? `Explore the displayed function model. Use the arrows to close loops around every rectangle touched by its segments or filled dots. Hollow circles are excluded points. Finite samples and approximations are explained in Maths explainer.`
      :q.point
      ? `Find the ${pointName} on the coloured function. Use the arrows to close loops around every rectangle touching that point, including neighbouring rectangles at a grid edge or corner.`
      : `Discover the ${labels[kind]}. Use the arrows to close loops around every rectangle its graph crosses or touches. Completed target rectangles reveal the graph.`;
    clue.textContent=rule.textContent;
    const study=window.GridderCaseMaths.describe(M,key,q,g,game.board);
    $('gridder-case-title').textContent=study.title;
    caseNodes[0].innerHTML=study.formulas.map(tex=>`<p class="case-equation">\\[${mathsText(tex)}\\]</p>`).join('');
    caseNodes[1].innerHTML=study.method.map(step=>`<li>${mathsText(step)}</li>`).join('');
    caseNodes[2].textContent=study.meaning;
    caseNodes[3].textContent=study.domain;
    return window.MathJax?.typesetPromise?.(nodes).catch(console.error);
  }
  function newLevel(){
    releasePlayerPushes();stopHold();clearFireInputs();sound?.stop();music?.pause();walkAudible=false;lastTravel=null;announced=false;
    const ecologyCarry=ecology?.snapshot();
    const weaponCarry=weapon?.snapshot();
    const bombCarry=bombs?.snapshot();
    const bonuses=new Map(chase?.spiders.filter(s=>(s.origin||'base')==='base').map(s=>[s.baseSlot??s.kind,{sizeScale:s.sizeScale||1,speedScale:s.speedScale||1,meals:s.meals||0,bloodMeals:s.bloodMeals||0}])||[]);
    const q=quests[level],b=G.board(M,key,difficulty,q);levelGraph=G.graph(M,key,q);
    const targets=G.targets(M,key,b,q);
    gaps=window.GridderGaps.plan(M,G,key,b,q,{revealed,difficulty});
    const traversable=window.GridderGapNavigation.create(G,b,targets,gaps);
    game=traversable.game;walker=traversable.walker;navigation=traversable.navigation;
    const spriteOptions={...window.GridderSpriteMetrics,
      displayScale:window.GridderSpriteMetrics?()=>window.GridderSpriteMetrics.scale(boardLayout()):undefined,
      // Route choice uses the original cell proportions, independently of
      // arena projection. Contact and swept travel still use real pixels.
      routePixels:axis=>boardLayout().stretch?(axis==='x'?1:2/3):cellPixels(axis)};
    chase=C.create(b,difficulty,{...spriteOptions,familyId:familyId()},navigation);
    poolLeeches=window.GridderPoolLeeches.create(b,gaps.pools,{shark:true});leechWarningId=null;
    ecology=window.GridderCreatureEcology?.create(chase,{familyId:familyId(),elapsedMs:ecologyCarry?.clock||0,arrivalIndex:ecologyCarry?.arrivalIndex||0,poolLeeches,seed:key,encounterSeed:`${key}:${level}`,openingEncounter:level===0,featuredCrawler:level===1,randomState:ecologyCarry?.randomState})||null;
    weapon=window.GridderWeapons?.create(b,{ammo:weaponCarry?.ammo||0,eggsCollected:weaponCarry?.eggsCollected||0})||null;
    bombs=window.GridderBombs?.create(b,{count:bombCarry?.count||0})||null;
    boost=window.GridderBoost.create({clock:ecologyCarry?.clock||0});
    const rosterNote=$('gridder-monster-roster');
    if(rosterNote)rosterNote.textContent=`Monsters: ${chase.spiders.map(s=>s.species?.name||enemyName(s)).join(' · ')}`;
    chase.spiders.forEach(s=>{const slot=s.baseSlot??s.kind;if(bonuses.has(slot))Object.assign(s,bonuses.get(slot));});
    remains=R?.create(b,spriteOptions)??null;chaseTime=0;safeUntil=1000;resurrectionUntil=0;resurrectionStartedAt=0;resurrectionSoundSynced=false;gameOver=false;deathScene=null;deathAttacker=null;captureSoundPhase=null;snagRemaining=0;
    $('gridder-hints').checked=difficulty==='guided';
    $('gridder-next').disabled=true;$('gridder-next').textContent='Next level';$('gridder-solution').hidden=true;$('gridder-solution-prompt').hidden=false;
    $('gridder-solution').innerHTML='';
    $('gridder-level').textContent=`Level ${level+1} of ${quests.length} · ${q.title||(q.kind==='exploration'?'Explore this function':'Find the '+labels[q.kind])}`;
    $('gridder-task').textContent=q.graph
      ? `Outline every rectangle touched by this level's target segments or filled dots. Hollow circles are excluded. ${q.displayNote}`
      :q.kind==='exploration'
      ? 'Outline every rectangle touched by a displayed segment or filled dot. Hollow circles are excluded. This challenge covers the finite model described below.'
      :!q.point
      ? `Outline every rectangle the ${labels[q.kind]} passes through or touches—even at an edge or corner. Its graph appears inside completed target rectangles.`
      : `Outline every rectangle touching this ${labels[q.kind]} on the coloured function. If the point lies on a grid line or corner, complete every neighbouring rectangle. The point is revealed when all target rectangles are filled.`;
    const detail=q.graph?`${q.displayNote} `
      :q.kind==='exploration'?`${M.curves[key].study.displayNote} `
      :q.kind==='inverse'?'Only the stated one-to-one branch is coloured; the grey dashed line is y = x. '
      :q.kind==='normal'?'Point A and its grey tangent are shown. Discover the normal within the visible window. '
      :levelGraph?`The y-range fits both the function and its ${labels[q.kind]}. `:'';
    $('gridder-board-note').textContent=`${difficulty==='guided'?'Guided: target rectangles are outlined.':difficulty==='explorer'?'Explorer: more rectangles; turn on hints if needed.':'Challenge: the finest grid; targets are hidden until you request a hint.'} ${key==='log'&&q.kind!=='inverse'?'This board uses x ≥ 0.5, within the logarithm’s positive domain. ':''}${detail}The outer border is a playable grid edge.${gaps.pools.length?' Follow the pools’ shores. A flashing leech is preparing to lunge—move away before it drags you underwater!':''}`;
    const finiteColors={min:'Salmon',max:'Blue',derivative:'Purple',second:'Lime',singularity:'Orange',discontinuity:'Pink',nondifferentiable:'Amber'};
    $('gridder-target-legend').textContent=q.graph?`${finiteColors[q.kind]||'Turquoise'}: revealed targets · hollow circles: excluded points`:q.kind==='exploration'?'Turquoise: captured model · hollow circles: excluded points':levelGraph?`${q.kind==='second'?'Lime':q.kind==='inverse'?'Teal':q.kind==='normal'?'Orange':'Purple'} dashed curve: revealed ${labels[q.kind]}`:'Dashed curve: discover in later levels';
    $('gridder-normal-control').hidden=q.kind!=='normal';
    if(q.kind==='normal'){
      const input=$('gridder-normal-point');input.min=levelGraph.domain[0];input.max=levelGraph.domain[1];input.value=levelGraph.a;
      $('gridder-normal-point-value').textContent=M.format(levelGraph.a);
    }
    $('gridder-feedback').textContent=playing?'Use ← ↑ ↓ → to move Gridder.':'Choose Start game, then use ← ↑ ↓ →.';
    formula();
    render();if(playing&&spidersEnabled())ensureFrame();
  }
  function restart(){pause();music?.stop();selectedWeapon='gun';key=$('gridder-function').value;difficulty=$('gridder-difficulty').value;quests=G.levels(M,key);level=0;revealed=[];lives=startingLives;chase=null;ecology=null;weapon=null;bombs=null;newLevel();selectRoadmapKey(key);}
  function canReplay(){return gameOver||Boolean(game?.complete()&&level===quests.length-1);}
  function explain(){
    const q=quests[level],node=$('gridder-solution');
    window.MathJax?.typesetClear?.([node]);
    node.hidden=false;$('gridder-solution-prompt').hidden=true;
    if(q.point)node.innerHTML=window.derivativeWorked.render(key,q.point,M);
    else node.innerHTML=window.derivativeWorked.renderGraph(key,q,M,levelGraph);
    window.MathJax?.typesetPromise?.([node]).catch(console.error);
  }
  function announceCompletion(){
    if(game.complete()&&!announced){
      announced=true;stopHold();clearFireInputs();const q=quests[level];if(q.point)revealed.push(q.point);
      const finalLevel=level===quests.length-1,newCompletion=Boolean(roadmap&&finalLevel&&!completedFunctions.has(key));
      if(newCompletion){completedFunctions.add(key);saveRoadmap();}
      const progress=roadmapSnapshot(),nextFunction=Boolean(roadmap&&finalLevel&&progress.nextKey);
      const ending=!finalLevel?' Choose Next level when you are ready.'
        :!roadmap?' All levels complete—well done! Choose Play again for a new game.'
        :nextFunction?' Function complete! Read the worked solution, then choose Next function → when you are ready. Play again restarts this function.'
        :progress.finished?` Roadmap complete! All ${roadmap.keys.length} functions are complete. Read the worked solution or choose Play again.`
        :' Function complete! You reached the end of the roadmap. Read the worked solution, replay, or choose another function from the roadmap.';
      $('gridder-feedback').textContent=`Level complete! ${q.graph?q.title+'.':'You revealed the '+labels[q.kind]+'.'}${ending}`;
      $('gridder-next').disabled=finalLevel&&!nextFunction;
      $('gridder-next').textContent=nextFunction?'Next function →':roadmap&&finalLevel?(progress.finished?'Roadmap complete':'End of roadmap'):'Next level';
      explain();if(newCompletion)announceRoadmapChange();
    }
  }
  function cellPixels(axis){
    const geometry=boardLayout();
    return axis==='x'?geometry.cellWidth:geometry.cellHeight;
  }
  function ensureFrame(){if(frame===null){lastTime=null;frame=true;}}
  function move(direction){
    if(roadmapOpen()||!active||!playing||gameOver||deathScene||resurrecting()||game.complete())return;
    if(direction[0]&&!walker.atNode()){
      const vertical=walker.route(capture||command?.direction||lastTravel||direction);
      if(vertical.axis==='y'){
        // A brief horizontal request during vertical travel survives key release.
        turn=direction;capture=vertical.direction;command=null;pending=[];
        ensureFrame();return;
      }
    }
    pending.push(direction);ensureFrame();
  }
  function begin(direction){
    if(roadmapOpen()||!active||!playing||gameOver||deathScene||resurrecting()||game.complete())return;
    if(held&&(held[0]!==direction[0]||held[1]!==direction[1])&&!capture){
      command=null;pending=[];
    }
    held=direction;move(direction);
  }
  function spendSnagTime(milliseconds){
    snagRemaining=Math.max(0,snagRemaining-milliseconds);
    if(snagRemaining<1e-9)snagRemaining=0;
  }
  function animate(now){
    frame=null;if(!active||!playing)return;
    const activeWallElapsed=lastTime===null?0:Math.max(0,now-lastTime),movementBudget=Math.min(50,activeWallElapsed);
    let elapsed=movementBudget;lastTime=now;
    if(deathScene){
      deathScene.advance(elapsed);
      if(!deathAttacker.bloodConsumed&&deathScene.phase().name!=='bite'){
        if(deathAttacker.kind==='leech'||deathAttacker.kind==='shark')poolLeeches.consumeBlood(deathAttacker.leechId);
        else chase.consumeBlood(chase.spiders[deathAttacker.index]);
        deathAttacker.bloodConsumed=true;
      }
      if(deathAttacker.kind==='shark')poolLeeches.stainBlood(deathAttacker.leechId,Math.min(1,deathScene.elapsed/((deathAttacker.dragDuration||650)+D.durations.swell)),deathScene.elapsed);
      if(deathScene.done())finishCapture();
      else syncCaptureSound();
      render();
      if(playing&&!gameOver&&(deathScene||spidersEnabled()||chaseTime<resurrectionUntil))frame=true;
      else lastTime=null;
      return;
    }
    if(resurrecting()){
      // Angels use the shared game clock, but normal simulation waits behind
      // them. A crossing frame gives combat only the time after their deadline.
      const waiting=Math.min(elapsed,resurrectionUntil-chaseTime);
      chaseTime+=waiting;elapsed-=waiting;
      if(resurrecting()){
        syncResurrectionSound();syncGameSounds();syncMusic();announceCompletion();render();
        if(playing&&!gameOver&&!game.complete())frame=true;
        else lastTime=null;
        return;
      }
      // Inputs made during capture/resurrection cannot start a delayed move.
      // Keep playing authoritative: Pause/blur/hidden never reach this branch.
      clearMovement();clearFireInputs();
      $('gridder-feedback').textContent=`Back in play! ${lives} ${lives===1?'life':'lives'} left. Your marked areas are saved. You are safe for two seconds. Use ← ↑ ↓ → to move.`;
      syncMusic();render();
    }
    pushAudible=false;walkAudible=false;
    const activePlayElapsed=movementBudget?activeWallElapsed*elapsed/movementBudget:0;
    const boostStart=boost.snapshot(),wallPerMotion=elapsed?activePlayElapsed/elapsed:0;
    let plannedBoostEnd=boostStart.active?boostStart.endsAt:0;
    const boostEggs=spidersEnabled()?ecology?.snapshot().eggs.filter(e=>e.reward==='boost')||[]:[],plannedPickups=new Set();
    const collectRadius=(window.GridderSpriteMetrics?.scale(boardLayout())||boardLayout().pw/referenceMovementPlotWidth)*12;
    const before=walker.position(),beforeFilled=game.filled.size,playerPath=[],available=Math.min(elapsed,Math.max(0,now-centreUntil));
    const priorSnagTime=snagRemaining;
    let milliseconds=available,changed=false,used=elapsed-available;
    spendSnagTime(used);
    if(used&&elapsed)playerPath.push({from:before,to:before,start:0,end:used/elapsed});
    while(milliseconds>1e-9&&!game.complete()){
      if(!capture&&!command){
        const direction=pending.shift()||held;if(!direction)break;
        command={direction,remaining:1/16};
      }
      const direction=capture||command.direction,route=walker.route(direction),length=cellPixels(route.axis);
      if(route.blocked){
        releasePlayerPushes();stopHold();changed=true;
        $('gridder-feedback').textContent='Water ahead. Follow the grid around the shore.';
        break;
      }
      const pushAxis=route.axis==='x'?'i':'j',pushSign=route.direction[route.axis==='x'?0:1];
      playerPushes=playerPushes.filter(push=>{
        if(push.done)return false;
        if(push.axis===pushAxis&&push.sign===pushSign)return true;
        remains.releasePlayerPush(push);return false;
      });
      // Slow travel only inside the node boxes, on both entry and departure.
      // Split a frame at box boundaries so outside travel keeps the slider speed.
      const inBox=route.remaining>7/8+1e-9||route.remaining<=1/8+1e-9;
      const half=route.remaining>7/8+1e-9?'out':'in';
      const time=boostStart.clock+used*wallPerMotion;
      // Plan pickup/expiry boundaries before moving, then commit rewards in
      // chronological contact order below. Only Gridder's velocity is scaled.
      const start=walker.position();
      for(const egg of boostEggs)if(!plannedPickups.has(egg.id)&&time>=egg.laidAt&&time<=egg.hatchAt&&Math.hypot((start.i-egg.position.i)*cellPixels('x'),(start.j-egg.position.j)*cellPixels('y'))<=collectRadius+1e-9){plannedPickups.add(egg.id);plannedBoostEnd=time+window.GridderBoost.durationMs;}
      const boosted=spidersEnabled()&&time<plannedBoostEnd;
      const divisor=inBox?boxResolution(route.axis,half):1,velocity=playerSpeed()/divisor*(snagRemaining>0||playerPushes.length?snagSpeed:1)*(boosted?window.GridderBoost.multiplier:1);
      const boundary=route.remaining>7/8+1e-9?route.remaining-7/8:route.remaining>1/8+1e-9?route.remaining-1/8:route.remaining;
      const fraction=Math.min(capture?route.remaining:command.remaining,route.remaining,boundary);
      // End the movement slice at slowdown expiry as well as grid boundaries.
      const budget=Math.min(milliseconds,snagRemaining>0?snagRemaining:Infinity,boosted&&wallPerMotion?(plannedBoostEnd-time)/wallPerMotion:Infinity);
      let distance=Math.min(velocity*budget/1000,fraction*length);
      for(const push of playerPushes)distance=Math.min(distance,remains.playerPushDistance(push,cellPixels));
      const to={i:start.i+route.direction[0]*distance/cellPixels('x'),j:start.j+route.direction[1]*distance/cellPixels('y')};
      const barrier=remains?.playerLimit(start,to,cellPixels);let contact=barrier?.blocked;
      if(contact)distance*=Math.max(0,Math.min(1,barrier.fraction));
      if(contact&&distance<=1e-9){
        if(beginPush(barrier.piece,start,to)){changed=true;continue;}
        break;
      }
      const safeTo={i:start.i+route.direction[0]*distance/cellPixels('x'),j:start.j+route.direction[1]*distance/cellPixels('y')};
      let snag=remains?.playerSnag?.(start,safeTo,cellPixels);
      if(snag){
        const contactDistance=distance*Math.max(0,Math.min(1,snag.fraction));
        if(contactDistance<=1e-9){
          if(remains.pushAside(snag.piece,start,safeTo,cellPixels)){
            snagRemaining=snagDuration;changed=true;
            $('gridder-feedback').textContent='Pushed remains aside · 70% slower for 40 ms.';
            continue;
          }
          snag=null;
        }else{
          distance=contactDistance;contact=barrier?.blocked&&snag.fraction>=1-1e-9;
        }
      }
      // A swept pickup can occur between endpoints, including on a slow frame.
      // End this edge slice there so its remaining travel gets the new speed.
      let picked=null,pickupDistance=distance;
      const proposed={i:start.i+route.direction[0]*distance/cellPixels('x'),j:start.j+route.direction[1]*distance/cellPixels('y')},span=distance/velocity*1000*wallPerMotion;
      for(const egg of boostEggs)if(!plannedPickups.has(egg.id)&&span>0){
        const lo=Math.max(0,(egg.laidAt-time)/span),hi=Math.min(1,(egg.hatchAt-time)/span);if(hi<lo)continue;
        const path={from:start,to:proposed,start:0,end:1},hits=window.GridderBoost.contacts([path],[{from:egg.position,to:egg.position,start:lo,end:hi}],cellPixels,collectRadius);
        const hit=hits[0];if(hit&&hit.start*distance<pickupDistance-1e-9){picked=egg;pickupDistance=hit.start*distance;}
      }
      if(picked){distance=pickupDistance;contact=false;snag=null;}
      const from=walker.position(),duration=distance/velocity*1000;
      if(!walker.advance(direction,distance,cellPixels)){
        stopHold();$('gridder-feedback').textContent='You reached the border. Choose another direction.';break;
      }
      playerPath.push({from,to:walker.position(),start:elapsed?used/elapsed:0,end:elapsed?(used+duration)/elapsed:1,boosted});used+=duration;
      if(picked){plannedPickups.add(picked.id);plannedBoostEnd=boostStart.clock+used*wallPerMotion+window.GridderBoost.durationMs;}
      lastTravel=route.direction;weapon?.aim(lastTravel);changed=true;milliseconds-=duration;spendSnagTime(duration);
      if(playerPushes.length){
        pushAudible=true;
        for(const push of playerPushes)remains.advancePlayerPush(push,distance,cellPixels);
        playerPushes=playerPushes.filter(push=>!push.done);
      }
      if(snag&&remains.pushAside(snag.piece,start,safeTo,cellPixels)){
        snagRemaining=snagDuration;
        $('gridder-feedback').textContent='Pushed remains aside · 70% slower for 40 ms.';
      }
      if(!capture)command.remaining-=distance/length;
      if(contact){const position=walker.position();beginPush(barrier.piece,position,{i:position.i+route.direction[0]/16,j:position.j+route.direction[1]/16});}
      if(walker.atNode()){
        centreUntil=now+centrePause();capture=null;
        if(turn){pending.unshift(turn);turn=null;command=null;}
        if(command?.remaining<=1e-9)command=null;
        // Render the exact centre before departing through the outgoing half.
        break;
      }
      const approaching=walker.route(direction);
      if(approaching.remaining<=1/8+1e-9){capture=approaching.direction;command=null;}
      else if(command?.remaining<=1e-9)command=null;
    }
    const completed=game.filled.size-beforeFilled;if(completed>0)sound?.fill(completed);
    // Idle/centre time also counts while playing; Pause leaves this clock frozen.
    spendSnagTime(Math.max(0,elapsed-used));changed=changed||priorSnagTime!==snagRemaining;
    const after=walker.position();walkAudible=Math.hypot(after.i-before.i,after.j-before.j)>1e-9;
    if(used<elapsed||!playerPath.length)playerPath.push({from:after,to:after,start:elapsed?used/elapsed:0,end:1});
    const priorChaseTime=chaseTime;chaseTime+=elapsed;
    if(elapsed>0&&priorChaseTime<resurrectionUntil)changed=true;
    let landPaths=[],landCreatures=chase.spiders.slice(),waterAttack=null;
    const bodyBefore=landCreatures.map(s=>s.kind==='centipede'?chase.bodyPositions(s,cellPixels,undefined,true):null);
    if(spidersEnabled()&&!game.complete()){
      landPaths=chase.advance(after,enemySpeed,elapsed,cellPixels,remains);changed=changed||elapsed>0;
    }
    if(!game.complete()){
      waterAttack=poolLeeches.advance(elapsed,after,cellPixels,{enabled:spidersEnabled(),canAttack:priorChaseTime>=safeUntil,playerPath,playerSpeed:playerSpeed(),recordPaths:true});
    }
    const activeElapsed=Math.max(0,chaseTime-Math.max(priorChaseTime,resurrectionUntil));
    // Bomb fuses and ecology use full active-play time. Movement/collision and
    // gun rounds retain their 50 ms budget; an angel exit counts its fraction.
    if(!game.complete()&&spidersEnabled()&&(weapon||bombs)){
      const hadBullets=Boolean(weapon?.snapshot().bullets.length);
      const layout=boardLayout(),scale=window.GridderSpriteMetrics?.scale(layout)||layout.pw/referenceMovementPlotWidth;
      const targets=landCreatures.map((s,index)=>({id:s.id,creature:s,position:chase.position(s),paths:landPaths[index],radius:10*(s.sizeScale||1)*scale,alive:()=>chase.spiders.includes(s)}))
        .concat(poolLeeches.leeches.map(s=>({id:s.id,creature:s,aquatic:true,position:s.position,radius:(s.kind==='shark'?16:8)*(s.sizeScale||1)*scale,
          paths:poolLeeches.motionPaths(s),alive:()=>poolLeeches.leeches.includes(s)})));
      const hits=weapon?.advance(activeElapsed,cellPixels,targets,{speed:Math.max(playerSpeed()*2.5,1),firing:selectedWeapon==='gun'&&canFire()&&fireHeld(),sourceAt:t=>{
        const path=playerPath.find(p=>t>=p.start-1e-9&&t<=p.end+1e-9)||playerPath.at(-1),span=path.end-path.start;
        const u=span>0?Math.max(0,Math.min(1,(t-path.start)/span)):0,di=path.to.i-path.from.i,dj=path.to.j-path.from.j;
        return {position:{i:path.from.i+di*u,j:path.from.j+dj*u},direction:Math.abs(di)+Math.abs(dj)>1e-9?[Math.sign(di),Math.sign(dj)]:lastTravel||[0,1]};
      },onFire:()=>{sound?.shot?.();sound?.bulletFlight?.(true);changed=true;},hit:(target,at,damage)=>{
        target.creature.lastHitAt=at;
        return target.aquatic?poolLeeches.damage(target.creature,damage):chase.damage(target.creature,damage,remains);
      }})||[];
      for(const hit of hits)sound?.hit?.(hit.killed);
      if(hits.length){const hit=hits.at(-1);$('gridder-feedback').textContent=hit.killed?'Monster defeated.':'Hit! Fire again to defeat this monster.';}
      changed=changed||hadBullets||hits.length>0;
      if(bombs){
        const before=bombs.snapshot(),events=bombs.advance(activePlayElapsed,cellPixels,targets,{hit:(target,at,damage)=>{
          target.creature.lastHitAt=at;
          return target.aquatic?poolLeeches.damage(target.creature,damage):chase.damage(target.creature,damage,remains);
        }});
        for(const event of events){sound?.bombBlast?.();$('gridder-feedback').textContent=`Bomb exploded! ${event.hits.length} ${event.hits.length===1?'monster':'monsters'} hit.`;}
        changed=changed||Boolean(before.planted.length||before.blasts.length||events.length);
      }
    }
    // Pickups and contact use one active-wall timeline. A pickup at the
    // contact instant activates first; an earlier bite stops later rewards.
    // Projectiles have already removed their victims, preserving their priority.
    if(!game.complete()&&spidersEnabled()&&ecology&&activePlayElapsed>0){
      const B=window.GridderBoost,layout=boardLayout(),scale=window.GridderSpriteMetrics?.scale(layout)||layout.pw/referenceMovementPlotWidth;
      const contacts=[],checkpoints=[],windows=boostStart.active?[{start:boostStart.startedAt,end:boostStart.endsAt}]:[];
      const add=(creature,aquatic,paths,radius,normal=false)=>{
        for(const range of B.contacts(playerPath,paths,cellPixels,radius,{movingOnly:!normal,ignoreEating:normal})){
          contacts.push({creature,aquatic,normal,...range});checkpoints.push(range.start,range.end);
        }
      };
      for(let n=0;n<landCreatures.length;n++){
        const s=landCreatures[n],paths=landPaths[n]||[];
        const radius=window.GridderSpriteMetrics?.collisionRadius(layout,s.sizeScale||1)??(11+7*(s.sizeScale||1));
        add(s,false,paths,radius,true);add(s,false,paths,radius);
        if(bodyBefore[n]){
          const bodyScale=window.GridderSpriteMetrics?window.GridderSpriteMetrics.scale(layout):1;
          for(const body of B.bodyPaths(bodyBefore[n],paths,6+2*(s.meals||0),12*(s.sizeScale||1)*bodyScale,cellPixels))add(s,false,body,radius);
        }
      }
      for(const s of poolLeeches.leeches)add(s,true,poolLeeches.motionPaths(s),(12+(s.kind==='shark'?16:8)*(s.sizeScale||1))*scale);
      const grace=elapsed?Math.max(0,(safeUntil-priorChaseTime)/elapsed):Infinity;
      if(grace<=1)checkpoints.push(grace);
      const waterTime=waterAttack&&elapsed?waterAttack.elapsed/elapsed:Infinity;if(waterTime<=1)checkpoints.push(waterTime);
      const alive=c=>c.aquatic?poolLeeches.leeches.includes(c.creature):chase.spiders.includes(c.creature);
      const moving=t=>playerPath.some(p=>t>=p.start-1e-9&&t<=p.end+1e-9&&Math.hypot(p.to.i-p.from.i,p.to.j-p.from.j)>1e-9);
      const defeat=c=>{
        if(!alive(c))return;
        const hit=c.aquatic?poolLeeches.damage(c.creature,c.creature.hp):chase.damage(c.creature,c.creature.hp,remains);
        if(hit?.killed){sound?.hit?.(true);changed=true;$('gridder-feedback').textContent='Boost strike! Monster defeated.';}
      };
      const events=ecology.advance(activePlayElapsed,after,cellPixels,remains,{playerPath,collectRadius,onCollect:(egg,at)=>{
        if(egg.reward==='bomb')bombs?.collect();
        else if(egg.reward==='boost'){boost.collect(at);windows.push({start:at,end:at+B.durationMs});}
        else weapon?.collectEgg();
      },nextTime:(at,end)=>{
        let next=end;
        for(const t of checkpoints){const time=boostStart.clock+t*activePlayElapsed;if(time>at+1e-9)next=Math.min(next,time);}
        const expiry=boost.snapshot().endsAt;if(expiry>at+1e-9)next=Math.min(next,expiry);
        return next;
      },onTime:at=>{
        boost.advanceTo(at);const t=(at-boostStart.clock)/activePlayElapsed;
        if(boost.activeAt(at)){
          for(const c of contacts)if(!c.normal&&t>=c.start-1e-9&&t<=c.end+1e-9)defeat(c);
          if(waterAttack&&Math.abs(t-waterTime)<1e-9&&moving(t)){
            const creature=poolLeeches.leeches.find(s=>s.id===waterAttack.id);if(creature)defeat({creature,aquatic:true});
          }
        }
        const attacker=contacts.find(c=>c.normal&&alive(c)&&t>=grace-1e-9&&t>=c.start-1e-9&&t<=c.end+1e-9);
        if(attacker)caught(chase.spiders.indexOf(attacker.creature));
        else if(waterAttack&&t>=waterTime-1e-9&&poolLeeches.leeches.some(s=>s.id===waterAttack.id))caughtLeech(waterAttack);
        return !deathScene;
      }});
      if(!deathScene){
        for(const p of playerPath)for(const w of windows){
          const a=Math.max(boostStart.clock+p.start*activePlayElapsed,w.start),b=Math.min(boostStart.clock+p.end*activePlayElapsed,w.end,boost.snapshot().clock);
          if(b>a){const from=B.position(p,(a-boostStart.clock)/activePlayElapsed),to=B.position(p,(b-boostStart.clock)/activePlayElapsed);boost.record(from,to,a,b);}
        }
      }
      const event=events.at(-1);
      if(event&&!deathScene){
        const w=weapon?.snapshot();
        const messages={arrival:`A ${event.name||'new monster'} has entered the board!`,laid:`A ${event.name||'monster'} laid an egg — hatching in 10 seconds.`,hatched:`A young ${event.name||'monster'} hatched!`,collected:event.reward==='boost'?'Boost egg collected! Five seconds of triple speed — run over monsters!':event.reward==='bomb'?`Bomb egg collected! ${bombs?.snapshot().count||0} bombs stored. Shift selects bombs; Space or Plant sets one for a three-second fuse.`:`Egg collected! +3 bullets · ${w?.ammo||0} remaining. ${w?.automatic?'Machine gun unlocked! Hold Space or Fire in gun mode.':w?.damage===2?'Double-strength bullets unlocked! Press Space or Fire in gun mode.':'Press Space or Fire in gun mode.'}`};
        if(messages[event.type])$('gridder-feedback').textContent=messages[event.type];
      }
      changed=true;
    }
    if(!deathScene&&!game.complete()){
      const warning=poolLeeches.snapshot().find(l=>l.phase==='warning');
      if(warning&&warning.id!==leechWarningId)$('gridder-feedback').textContent=warning.kind==='shark'?'The shark is preparing to bite! Move away from the flashing shoreline.':'A leech is preparing to lunge! Move away from the flashing creature.';
      leechWarningId=warning?.id??null;
      if(spidersEnabled()&&elapsed>0&&gaps.pools.length)changed=true;
    }
    announceCompletion();syncGameSounds();if(changed)render();
    if(playing&&!gameOver&&!game.complete()&&(deathScene||spidersEnabled()||chaseTime<resurrectionUntil||snagRemaining>0||held||capture||command||pending.length))frame=true;
    else lastTime=null;
  }
  function spidersEnabled(){return $('gridder-spiders').checked;}
  function caught(index){
    if(deathScene||gameOver)return;
    lives--;boost?.reset();releasePlayerPushes();stopHold();clearFireInputs();resurrectionUntil=0;safeUntil=0;snagRemaining=0;
    const attacker=chase.spiders[index],species=attacker.species||window.GridderMonsterRoster?.get(familyId(),attacker.kind),tail=species?.shape==='scorpion';
    const speciesId=window.GridderMonsterRoster?.identity(species)||species?.rosterId||species?.id||null;
    const types={boruta:'fire','broom-witch':'electric','hen-leg-house':'rotten-egg'},attackType=types[speciesId]||types[species?.shape]||null;
    deathScene=D.create();deathAttacker={index,position:chase.position(attacker),bloodConsumed:false,attackOrgan:tail?'tail':'mouth',attackType,speciesId};
    captureSoundPhase=null;syncCaptureSound();
    $('gridder-feedback').textContent=specialAttacks[attackType]
      ?`Caught! The ${enemyName(attacker)} ${specialAttacks[attackType].action}. Your marked areas are saved.`
      :`Caught! The ${enemyName(attacker)} ${tail?'stings with its tail and drains':'drains'} Gridder; swelling, decay and scattering follow. Your marked areas are saved.`;
  }
  function caughtLeech(event){
    if(deathScene||gameOver||game.complete())return;
    lives--;boost?.reset();releasePlayerPushes();stopHold();clearFireInputs();resurrectionUntil=0;safeUntil=0;snagRemaining=0;leechWarningId=null;
    const base=D.create(),dragDuration=650;let elapsed=0;
    // Preserve the existing capture phases, giving the visible underwater drag
    // enough time without moving the grid walker or painting an illegal edge.
    deathScene={get elapsed(){return elapsed;},phase:base.phase,done:base.done,
      trajectories:base.trajectories,pieces:base.pieces,
      advance(ms){if(!Number.isFinite(ms)||ms<=0||base.done())return base.phase();
        elapsed=Math.min(D.total+dragDuration-D.durations.bite,elapsed+ms);
        const mapped=elapsed<dragDuration?elapsed/dragDuration*D.durations.bite:elapsed-dragDuration+D.durations.bite;
        return base.advance(Math.max(0,mapped-base.elapsed));}};
    deathAttacker={kind:event.kind||'leech',leechId:event.id,poolId:event.poolId,from:{...event.from},to:{...event.to},position:{...event.to},bloodConsumed:false,dragDuration};
    captureSoundPhase=null;syncCaptureSound();
    $('gridder-feedback').textContent=event.kind==='shark'?'Caught by the shark! It bites Gridder; blood spreads through this pool. Your marked areas are saved.':'Caught by a neon leech! It drags Gridder underwater and drains his blood. Your marked areas are saved.';
  }
  function finishCapture(){
    if(!['leech','shark'].includes(deathAttacker?.kind))remains?.add(deathScene);
    poolLeeches?.resetCooldown(2200);
    deathScene=null;deathAttacker=null;captureSoundPhase=null;
    resurrectionSoundSynced=sound?.killed(lives>0,{deathCue:false})!==false;
    if(lives<=0){
      gameOver=true;playing=false;$('gridder-start').textContent='Start game';$('gridder-start').setAttribute('aria-pressed','false');
      $('gridder-feedback').textContent="Game Over! Go to the ‘dunce’s stool!’ Choose Play again to try again.";
    }else{
      clearMovement();chase.respawn(walker.position(),cellPixels,remains);resurrectionStartedAt=chaseTime;resurrectionUntil=chaseTime+(sound?.resurrectionDuration?.()??3000);safeUntil=resurrectionUntil+2000;
      $('gridder-feedback').textContent=`Resurrection! ${lives} ${lives===1?'life':'lives'} left. Your marked areas are saved. Play continues automatically when the angels disappear; you will be safe for two seconds.`;
    }
  }
  $('gridder-spiders').addEventListener('change',()=>{
    if(!game)return;
    if(!spidersEnabled())clearFireInputs();
    if(!deathScene&&!resurrecting()){
      poolLeeches?.resetCooldown(1000);leechWarningId=null;
      if(!chase.spiders.some(s=>s.eating))chase.respawn(walker.position(),cellPixels,remains);
      safeUntil=chaseTime+1000;
    }
    if(playing&&(deathScene||spidersEnabled()||resurrecting()))ensureFrame();syncGameSounds();render();
  });
  $('gridder-sound').addEventListener('change',()=>{if(!$('gridder-sound').checked){sound?.stop();captureSoundPhase=null;resurrectionSoundSynced=false;}else if(playing)unlockSound();});
  $('gridder-music')?.addEventListener('change',()=>{
    if(!$('gridder-music').checked)music?.pause();
    else Promise.resolve(music?.unlock()).then(syncMusic);
  });
  function updateMusicVolume(){
    const input=$('gridder-music-volume');if(!input)return;
    const value=Math.max(0,Math.min(100,Number(input.value)||0));
    $('gridder-music-volume-value').textContent=value+'%';
    input.setAttribute('aria-valuetext',value+' percent');
  }
  $('gridder-music-volume')?.addEventListener('input',()=>{updateMusicVolume();syncMusic();});
  updateMusicVolume();
  function boxResolution(axis,half){
    const value=Number($('gridder-resolution-'+(axis==='y'?'vertical':'horizontal')+'-'+half).value);
    return Math.max(1,Math.min(8,Number.isFinite(value)?value:(axis==='y'&&half==='in'?2:1)));
  }
  for(const half of ['in','out'])for(const [name,axis] of [['vertical','y'],['horizontal','x']]){
    const id='gridder-resolution-'+name+'-'+half,input=$(id),output=$(id+'-value');
    const update=()=>{const value=boxResolution(axis,half);output.textContent=`${value}×`;input.setAttribute('aria-valuetext',`${value} times travel duration, ${name} half ${half}`);};
    input.addEventListener('input',update);update();
  }
  function centrePause(){
    const value=Number($('gridder-centre-pause').value);
    return Math.max(0,Math.min(500,Number.isFinite(value)?value:10));
  }
  function updateCentrePause(){const value=centrePause();$('gridder-centre-pause-value').textContent=`${value} ms`;$('gridder-centre-pause').setAttribute('aria-valuetext',`${value} milliseconds at the centre`);}
  $('gridder-centre-pause').addEventListener('input',updateCentrePause);updateCentrePause();
  function selectedSpeed(){return Math.max(40,Math.min(400,Number($('gridder-speed').value)||280));}
  function playerSpeed(){
    const layout=boardLayout(),metrics=window.GridderSpriteMetrics;
    // Use the same min-axis equivalent as round bodies/contact sizes in an
    // arena. Both directions receive this one CSS-pixel velocity; the axis
    // sliders still explicitly control entry/departure slowdown.
    const equivalentWidth=metrics?metrics.scale(layout)*metrics.referencePlotWidth
      :Math.min(layout.pw,layout.stretch?layout.cellHeight*1.5*game.board.nx:layout.pw);
    return selectedSpeed()*equivalentWidth/referenceMovementPlotWidth;
  }
  function enemySpeed(axis='x'){
    const layout=boardLayout();
    // Retain existing enemy pacing independently of the player's screen speed.
    const factor=layout.stretch&&axis==='y'
      ?layout.ph/(referenceMovementPlotWidth*game.board.ny/game.board.nx*2/3)
      :layout.pw/referenceMovementPlotWidth;
    return selectedSpeed()*factor;
  }
  function updateSpeed(){const value=selectedSpeed();$('gridder-speed-value').textContent=`${value} px/s`;$('gridder-speed').setAttribute('aria-valuetext',`${value} reference pixels per second, scaled with the board size`);}
  $('gridder-speed').addEventListener('input',updateSpeed);updateSpeed();
  // The Phaser scene owns the only browser frame loop. The pending flag retains
  // the original idle/first-frame behaviour, including the 50 ms elapsed cap.
  function tick(now){
    const ownGeometry=!geometryFrame;
    if(ownGeometry)beginFrame();
    try{if(frame!==null&&Number.isFinite(now))animate(now);}
    finally{if(ownGeometry)endFrame();}
  }
  function needsTick(){
    return Boolean(active&&playing&&!gameOver&&!game?.complete()&&
      (deathScene||spidersEnabled()||chaseTime<resurrectionUntil||snagRemaining>0||held||capture||command||pending.length));
  }
  function snapshot(){
    return {game,walker,chase,remains,deathScene,deathAttacker,levelGraph,quests,gaps,leeches:poolLeeches?.snapshot()||[],poolBlood:poolLeeches?.bloodSnapshot?.()||[],ecology:ecology?.snapshot()||null,weapon:weapon?.snapshot()||null,bombs:bombs?.snapshot()||null,boost:boost?.snapshot()||null,
      level,key,familyId:familyId(),M,G,P,active,playing,revealed,lives,chaseTime,safeUntil,
      resurrectionUntil,gameOver,lastTravel,playerPushes,snagRemaining,selectedWeapon,firing:Boolean(selectedWeapon==='gun'&&canFire()&&weapon?.snapshot().automatic&&fireHeld()),
      moving:Boolean(playing&&!deathScene&&!resurrecting()&&(held||capture||command||pending.length)),
      centreWaiting:Boolean(playing&&held&&walker?.atNode()&&centreUntil>(lastTime??centreUntil)),
      centrePauseMs:centrePause(),
      hints:$('gridder-hints').checked,spidersEnabled:spidersEnabled(),
      layout:game?boardLayout():null,
      framePending:frame!==null,needsTick:needsTick()};
  }
  function render(){
    if(!game||!active)return;
    window.gridderView?.render(snapshot());
    const b=game.board,pos=walker.position();
    const progress=`Target rectangles: ${game.progress()} / ${game.targets.size} · Filled: ${game.filled.size} · Moves: ${game.moves}`;
    const position=`Gridder: x = ${M.format(b.xmin+pos.i*b.dx)}, y = ${M.format(b.ymin+pos.j*b.dy)}`;
    if($('gridder-progress').textContent!==progress)$('gridder-progress').textContent=progress;
    if($('gridder-position').textContent!==position)$('gridder-position').textContent=position;
    const meals=chase.spiders.filter(s=>s.eating).map(s=>`${enemyName(s)} eating · ${Math.ceil((4000-s.eating.elapsed)/1000)} s`);
    const growth=chase.spiders.filter(s=>s.meals||s.bloodMeals).map(s=>`${enemyName(s)}: ${s.meals||0} remnant meals, ${s.bloodMeals||0} blood meals`);
    const leechWarning=poolLeeches.snapshot().some(l=>l.phase==='warning'||l.phase==='lunge');
    const gauge=`Lives: ${lives}`,status=gameOver?'Game over':deathScene?`Captured · ${['leech','shark'].includes(deathAttacker?.kind)?'Underwater · ':''}${captureLabel(deathScene.phase().name)}`:!spidersEnabled()?'Enemies off · Practice mode':[chaseTime<safeUntil?'Safe briefly':'',leechWarning?'Leech ready to strike!':'',...meals,...growth,ecology?`Next monster: ${Math.max(0,Math.ceil((ecology.snapshot().nextArrivalAt-ecology.snapshot().clock)/1000))} s`:''].filter(Boolean).join(' · ');
    if($('gridder-lives').textContent!==gauge)$('gridder-lives').textContent=gauge;
    if($('gridder-chase-status').textContent!==status)$('gridder-chase-status').textContent=status;
    const replay=canReplay();
    updateFireControl();updateBombControl();
    const boostStatus=$('gridder-boost-status'),boostState=boost?.snapshot();
    if(boostStatus){boostStatus.hidden=!boostState?.active;const text=boostState?.active?`⚡ ${Math.ceil(boostState.remainingMs/1000)} s`:'';if(boostStatus.textContent!==text)boostStatus.textContent=text;}
    $('gridder-start').disabled=game.complete()&&!replay;
    const startLabel=replay?'Play again':playing?'Pause game':'Start game';
    if($('gridder-start').textContent!==startLabel)$('gridder-start').textContent=startLabel;
    if(replay)$('gridder-start').setAttribute('aria-pressed','false');
    $('gridder-normal-point').disabled=Boolean(playing&&!game.complete()||deathScene||gameOver);
  }
  function canFire(){return Boolean(weapon&&active&&playing&&spidersEnabled()&&!roadmapOpen()&&!deathScene&&!gameOver&&!game?.complete()&&chaseTime>=resurrectionUntil);}
  function canPlant(){return Boolean(selectedWeapon==='bomb'&&bombs&&canFire()&&!window.GridderSettings?.isOpen());}
  function canSwitchWeapon(){return Boolean(active&&game&&!deathScene&&!resurrecting()&&!gameOver&&!window.GridderSettings?.isOpen()&&!roadmapOpen());}
  function selectWeapon(mode){
    if(!['gun','bomb'].includes(mode)||mode===selectedWeapon||!canSwitchWeapon())return false;
    // An in-progress Space press or pointer activation belongs to its old mode.
    // A fresh pointerdown clears suppression; keyup consumes old native Space.
    if(keyboardActionDown)keyboardFireConsumed=true;
    clearFireInputs();suppressFireClick=true;selectedWeapon=mode;syncGameSounds();render();return true;
  }
  function toggleWeapon(){return selectWeapon(selectedWeapon==='gun'?'bomb':'gun');}
  function updateBombControl(){
    const button=$('gridder-bomb'),count=bombs?.snapshot().count||0;
    if(button){button.textContent=selectedWeapon==='bomb'?'Bomb ⇄':'Gun ⇄';button.disabled=!canSwitchWeapon();button.setAttribute('aria-pressed',String(selectedWeapon==='bomb'));button.setAttribute('aria-label',`Weapon mode: ${selectedWeapon}. ${count} bombs stored. Switch to ${selectedWeapon==='gun'?'bomb':'gun'} with Shift or this button.`);button.title='Shift switches gun and bomb modes. Space or the action button uses the selected weapon.';}
  }
  function plantBomb(){
    if(!canPlant()||!bombs.plantBomb(walker.position()))return false;
    sound?.bombPlant?.();ensureFrame();render();return true;
  }
  function activateWeapon(){return selectedWeapon==='bomb'?plantBomb():fire();}
  $('gridder-bomb')?.addEventListener('click',()=>{if(toggleWeapon())$('gridder-board').focus({preventScroll:true});});
  $('gridder-bomb')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.repeat)e.preventDefault();});
  function updateFireControl(){
    const button=$('gridder-fire'),w=weapon?.snapshot(),ammo=w?.ammo||0,mode=w?.automatic?'Machine gun':w?.damage===2?'Double strength':'Fire';
    if(!button)return;
    button.setAttribute('data-weapon',selectedWeapon);
    if(selectedWeapon==='bomb'){
      const count=bombs?.snapshot().count||0;button.textContent=`Plant · ${count}`;button.disabled=!canPlant()||!count;
      button.setAttribute('aria-label',`Plant bomb. ${count} bombs stored. Sets a stationary bomb here for 3 active-play seconds. Press Shift to select the gun.`);button.title='Press Space or Plant once to set a bomb at Gridder’s position. Three-second active-play fuse; Gridder and painted areas are safe.';
    }else{button.textContent=`Fire · ${ammo}${w?.damage===2?' · 2×':''}`;button.disabled=!canFire()||!ammo;button.setAttribute('aria-label',`${mode}. ${ammo} bullets remaining. ${w?.eggsCollected||0} eggs collected. ${w?.damage||1} damage per bullet.`);button.title=w?.automatic?'Hold Space or Fire for 8 shots per second. Each shot uses one bullet.':'Press Space or Fire. Each normal egg adds 3 bullets; 2 normal eggs double damage and 3 unlock the machine gun.';}
  }
  function fireHeld(){return keyboardFireHeld||firePointerHolds.size>0;}
  function syncFirePressed(){fireButton?.classList?.toggle('is-pressed',fireHeld());}
  function clearFireInputs(){
    keyboardFireHeld=false;const pointers=[...firePointerHolds.entries()];firePointerHolds.clear();syncFirePressed();
    for(const [id,button] of pointers)if(button.hasPointerCapture?.(id))button.releasePointerCapture(id);
  }
  function fire(){
    if(selectedWeapon!=='gun'||!canFire()||!weapon.fire(walker.position(),lastTravel||[0,1]))return false;
    sound?.shot?.();
    sound?.bulletFlight?.(true);
    if(!weapon.snapshot().ammo)clearFireInputs();
    ensureFrame();render();return true;
  }
  fireButton?.addEventListener('click',e=>{
    if(e?.detail>0&&suppressFireClick){suppressFireClick=false;e.preventDefault();return;}
    if(activateWeapon())$('gridder-board').focus({preventScroll:true});
  });
  fireButton?.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(selectedWeapon==='bomb'){
      if(canPlant()&&bombs.snapshot().count)suppressFireClick=false;
      return;
    }
    if(!canFire()||!weapon.snapshot().ammo)return;
    // A canceled automatic press may have no matching click. A new semi-auto
    // press owns its native click, so discard that old suppression here.
    if(!weapon.snapshot().automatic){suppressFireClick=false;return;}
    e.preventDefault();suppressFireClick=true;firePointerHolds.set(e.pointerId,fireButton);fireButton.setPointerCapture?.(e.pointerId);syncFirePressed();
    fire();ensureFrame();
  });
  function finishFirePointer(e){
    const button=firePointerHolds.get(e.pointerId);if(!button)return;
    firePointerHolds.delete(e.pointerId);syncFirePressed();
    if(button.hasPointerCapture?.(e.pointerId))button.releasePointerCapture(e.pointerId);
  }
  for(const event of ['pointerup','pointercancel','lostpointercapture'])fireButton?.addEventListener(event,finishFirePointer);
  fireButton?.addEventListener('keydown',e=>{if(selectedWeapon==='bomb'&&e.key==='Enter'&&e.repeat)e.preventDefault();});
  $('gridder-start').addEventListener('click',()=>{
    if(roadmapOpen())return;
    if(canReplay())restart();
    if(playing){pause();$('gridder-feedback').textContent='Paused. Your marked path is saved.';return;}
    if(gameOver||game.complete())return;
    playing=true;$('gridder-normal-point').disabled=true;unlockSound();$('gridder-start').textContent='Pause game';$('gridder-start').setAttribute('aria-pressed','true');$('gridder-feedback').textContent=deathScene?'Capture animation resumed. Escape pauses.':resurrecting()?'Resurrection resumed. Play continues automatically when the angels disappear. Escape pauses.':'Use ← ↑ ↓ →. Escape pauses.';$('gridder-board').focus({preventScroll:true});if(deathScene||spidersEnabled()||chaseTime<resurrectionUntil||snagRemaining>0)ensureFrame();render();
  });
  $('gridder-next').addEventListener('click',()=>{
    if(roadmapOpen()||!game.complete())return;
    if(level===quests.length-1){const nextKey=roadmapSnapshot().nextKey;if(roadmap&&nextKey)selectFunction(nextKey);return;}
    level++;newLevel();
  });
  $('gridder-restart').addEventListener('click',restart);
  $('gridder-function').addEventListener('change',restart);$('gridder-difficulty').addEventListener('change',restart);
  if(catalogue){
    $('gridder-family').addEventListener('change',()=>{chooseFamily();restart();});
    $('gridder-subfamily').addEventListener('change',()=>{chooseSubfamily();restart();});
  }
  $('gridder-hints').addEventListener('change',render);
  $('gridder-normal-point').addEventListener('input',()=>{
    const q=quests[level];if(q?.kind!=='normal'||playing&&!game.complete()||deathScene||gameOver)return;
    const value=Number($('gridder-normal-point').value);if(!Number.isFinite(value))return;
    if(game.complete())pause();
    q.anchor=Math.max(levelGraph.domain[0],Math.min(levelGraph.domain[1],value));newLevel();
  });
  // Pointer adjustments return the arrows to the game. Keyboard users keep
  // native slider arrows until explicitly returning to the board with Enter.
  for(const id of ['gridder-speed','gridder-resolution-vertical-in','gridder-resolution-horizontal-in','gridder-resolution-vertical-out','gridder-resolution-horizontal-out','gridder-centre-pause','gridder-music-volume']){
    const input=$(id),returnToBoard=()=>{if(!window.GridderSettings?.isOpen())$('gridder-board').focus({preventScroll:true});};
    if(!input)continue;
    input.addEventListener('pointerup',returnToBoard);
    input.addEventListener('click',returnToBoard);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();returnToBoard();}});
  }
  function keydown(e){
    if(window.GridderSettings?.isOpen()||roadmapOpen()||!active||e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.target?.closest?.('input,select,textarea,[contenteditable="true"],#math-titlebar,.window-actions'))return;
    if(e.key==='Shift'||e.code==='ShiftLeft'||e.code==='ShiftRight'){
      e.preventDefault();e.stopPropagation();const code=e.code||'Shift',wasHeld=shiftHolds.size>0;shiftHolds.add(code);
      if(!e.repeat&&!wasHeld)toggleWeapon();return;
    }
    if(!playing)return;
    if(e.key==='Escape'){pause();$('gridder-feedback').textContent='Paused. Your marked path is saved.';return;}
    if(e.code==='Space'||e.key===' '){
      const button=e.target?.closest?.('button');
      if(button&&!directionControls.some(control=>control.button===button)&&button!==fireButton)return;
      keyboardActionDown=true;
      // Semi-automatic gun Fire keeps native button activation. Planting and
      // automatic gun Space are owned here; keyup cannot add a native click.
      if(button===fireButton&&selectedWeapon==='gun'&&!weapon?.snapshot().automatic)return;
      e.preventDefault();e.stopPropagation();keyboardFireConsumed=true;
      if(!e.repeat){
        if(selectedWeapon==='bomb')plantBomb();
        else if(canFire()&&weapon.snapshot().ammo){keyboardFireHeld=weapon.snapshot().automatic;syncFirePressed();fire();ensureFrame();}
      }return;
    }
    const d=directions[e.key];if(!d)return;
    e.preventDefault();e.stopPropagation();if(deathScene||resurrecting()||gameOver||game.complete())return;
    if(!e.repeat){keyboardHold={direction:d,order:++inputOrder};selectHeldInput();}
  }
  function keyup(e){
    if(e.key==='Shift'||e.code==='ShiftLeft'||e.code==='ShiftRight'){if(e.code)shiftHolds.delete(e.code);else shiftHolds.clear();}
    if(e.code==='Space'||e.key===' '){keyboardActionDown=false;keyboardFireHeld=false;syncFirePressed();if(keyboardFireConsumed){e.preventDefault?.();e.stopPropagation?.();keyboardFireConsumed=false;}}
    const d=directions[e.key];if(d&&keyboardHold?.direction===d){keyboardHold=null;selectHeldInput();}
  }
  // Phaser forwards keyboard input in the browser. Non-engine hosts can still
  // exercise the same controls without installing a second keyboard listener.
  if(!window.Phaser){document.addEventListener('keydown',keydown,true);document.addEventListener('keyup',keyup);}
  window.addEventListener('blur',pause);window.addEventListener('pagehide',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  function syncPressedDirections(){
    for(const control of directionControls)control.button.classList?.toggle('is-pressed',[...pointerHolds.values()].some(pointer=>pointer.control===control));
  }
  function clearHeldInputs(){
    const pointers=[...pointerHolds.entries()];pointerHolds.clear();keyboardHold=null;syncPressedDirections();
    for(const [id,pointer] of pointers)if(pointer.origin.hasPointerCapture?.(id))pointer.origin.releasePointerCapture(id);
  }
  function selectHeldInput(){
    let selected=keyboardHold;
    for(const pointer of pointerHolds.values())if(pointer.control&&(!selected||pointer.order>selected.order))selected={direction:pointer.control.direction,order:pointer.order};
    if(!selected){release();return;}
    const direction=selected.direction;
    if(!held||held[0]!==direction[0]||held[1]!==direction[1])begin(direction);
  }
  function finishPointer(e){
    const pointer=pointerHolds.get(e.pointerId);if(!pointer)return;
    pointerHolds.delete(e.pointerId);syncPressedDirections();selectHeldInput();
    if(pointer.origin.hasPointerCapture?.(e.pointerId))pointer.origin.releasePointerCapture(e.pointerId);
  }
  for(const control of directionControls){
    const {button,direction}=control;
    button.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      e.preventDefault();
      if(roadmapOpen()||!active||!playing||gameOver||deathScene||resurrecting()||game.complete())return;
      button.focus({preventScroll:true});button.setPointerCapture(e.pointerId);
      pointerHolds.set(e.pointerId,{origin:button,control,order:++inputOrder});syncPressedDirections();selectHeldInput();
    });
    // Capture keeps receiving events outside the original button. Hit-test the
    // current finger position so a continuous thumb slide can change arrows.
    button.addEventListener('pointermove',e=>{
      const pointer=pointerHolds.get(e.pointerId);if(!pointer)return;
      e.preventDefault();
      const hit=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('button');
      const next=directionControls.find(candidate=>candidate.button===hit)||null;
      if(pointer.control===next)return;
      pointer.control=next;pointer.order=++inputOrder;syncPressedDirections();selectHeldInput();
    });
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,finishPointer);
    button.addEventListener('click',e=>{if(e.detail===0)move(direction);});
  }
  window.gridderController={setActive(value){active=value;if(!value)pause();else{if(!game)restart();render();}},restart,selectFunction,roadmapSnapshot,continueRoadmap,tick,snapshot,pause,begin,release,move,fire,plantBomb,activateWeapon,selectWeapon,toggleWeapon,keydown,keyup,beginFrame,endFrame,updateAudio:syncMusic};
  window.derivativeGridder=window.gridderController;
  window.refreshGridderMath=()=>{if(!game)return Promise.resolve();return Promise.resolve(formula()).then(()=>{if(announced)explain();});};
  new ResizeObserver(()=>render()).observe($('gridder-board'));
})();
