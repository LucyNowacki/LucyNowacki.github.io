/* Gridder 2 gameplay controller. Deterministic rules are retained from the
 * original derivative lesson; Phaser supplies presentation and frame ticks. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),catalogue=window.derivativeGridderCatalogue,M=catalogue?.maths||window.derivativeMath,G=window.derivativeGridderMath,P=window.derivativePalette,C=window.derivativeGridderChase,D=window.derivativeGridderCapture,R=window.derivativeGridderRemains;
  const labels={min:'minimum',max:'maximum',inflection:'inflection point',derivative:'first derivative',second:'second derivative',inverse:'inverse function',normal:'perpendicular normal line'};
  const startingLives=7;
  // The 280 px/s setting was tuned on a 1030px-wide plotted grid. Scale
  // physical pixels with the plot so the same grid journey takes equal time.
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
  let keyboardHold=null,inputOrder=0;
  let deathScene=null,deathAttacker=null,remains=null,captureSoundPhase=null,snagRemaining=0,playerPushes=[],pushAudible=false,walkAudible=false,levelGraph=null;
  let frameGeometry=null,geometryFrame=false,gaps=null,navigation=null,poolLeeches=null,leechWarningId=null,ecology=null;
  function beginFrame(){geometryFrame=true;frameGeometry=null;}
  function endFrame(){geometryFrame=false;frameGeometry=null;}
  function boardLayout(){
    if(geometryFrame&&frameGeometry?.board===game.board)return frameGeometry.layout;
    const box=$('gridder-board').getBoundingClientRect(),layout=G.layout(game.board,box.width,box.height);
    if(geometryFrame)frameGeometry={board:game.board,layout};
    return layout;
  }
  const familyId=()=>$('gridder-family')?.value||'algebraic';
  const enemyName=enemy=>enemy.species?.name?.toLowerCase()||window.GridderMonsterRoster?.get(familyId(),enemy.kind).name.toLowerCase()||(enemy.kind==='centipede'?'centipede':`${enemy.kind} spider`);
  const deathLabels={bite:'Bite',swell:'Swelling',decay:'Decaying',scatter:'Scattering'};
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
  if(catalogue){populate($('gridder-family'),catalogue.families.map(f=>[f.id,f.label]),'algebraic');chooseFamily('quadratic');}
  else $('gridder-function').innerHTML=$('function-select').innerHTML;
  function stopHold(){clearHeldInputs();frame=null;held=null;lastTime=null;command=null;capture=null;pending=[];turn=null;centreUntil=0;}
  function release(){held=null;}
  function pause(){playing=false;pushAudible=false;walkAudible=false;stopHold();sound?.stop();music?.pause();captureSoundPhase=null;$('gridder-normal-point').disabled=Boolean(deathScene||gameOver);$('gridder-start').textContent='Start game';$('gridder-start').setAttribute('aria-pressed','false');}
  function releasePlayerPushes(){for(const push of playerPushes)remains?.releasePlayerPush(push);playerPushes=[];pushAudible=false;}
  function beginPush(piece,from,to){
    const push=remains?.beginPlayerPush(piece,from,to,cellPixels);if(!push)return false;
    if(!push.done)playerPushes.push(push);
    else snagRemaining=snagDuration;
    $('gridder-feedback').textContent=push.done?'Pushed remains aside at the node.':'Pushing remains along the edge to the next node.';
    return true;
  }
  function syncGameSounds(){
    const running=active&&playing&&!deathScene&&!gameOver&&!game?.complete()&&$('gridder-sound').checked;
    // A released tap can finish between nodes with no further scheduled simulation frame in practice
    // mode. Stop here when movement ends or the last piece reaches its node.
    const pushing=pushAudible&&playerPushes.length>0&&Boolean(held||capture||command||pending.length);
    const walking=running&&walkAudible,intent=Boolean(held||capture||command||pending.length);
    if(walking&&!intent)sound?.step?.('gridder-walk');
    sound?.activity?.('walk','gridder-walk',walking&&intent);
    sound?.activity?.('push','gridder-push',running&&pushing);
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
      const started=sound?.capturePhase?.(phase.name,phase.progress,duration/1000);
      if(started!==false)captureSoundPhase=phase.name;
    }
  }
  function unlockSound(){
    Promise.all([sound?.unlock(),music?.unlock()]).then(()=>{syncCaptureSound();syncGameSounds();syncMusic();});
  }
  const mathsText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function formula(){
    const c=M.curves[key];
    const node=$('gridder-formula'),rule=$('gridder-rule'),context=$('gridder-context'),mission=$('gridder-mission'),clue=$('gridder-mission-clue');
    const caseNodes=['gridder-case-formulas','gridder-case-method','gridder-case-meaning','gridder-case-domain'].map($),nodes=[node,rule,context,mission,clue,...caseNodes];window.MathJax?.typesetClear?.(nodes);
    node.textContent=String.raw`\(f(x)=${c.tex}\)`;
    context.textContent=`${c.context||''} ${c.note||''}`.trim()||String.raw`Study \(f(x)=${c.tex}\) on the stated domain. Connect the formulas and reasoning below with the shapes you uncover on the grid.`;
    if(catalogue&&$('gridder-subfamily').value==='symmetry')context.textContent+=c.parity==='even'?String.raw` The original function is even: \(f(-x)=f(x)\). Its graph reflects in the y-axis.`:String.raw` The original function is odd: \(f(-x)=-f(x)\). Its graph has symmetry about the origin.`;
    if(catalogue&&$('gridder-subfamily').value==='periodic')context.textContent+=String.raw` The original function has period \(${key==='tangent'?'\\pi':'2\\pi'}\): \(f(x+p)=f(x)\), wherever both sides are defined.`;
    const kind=quests[level]?.kind,g=levelGraph;
    rule.textContent=kind==='derivative'?String.raw`Your clue: \(f'(x)=${g.tex}\). Use this rule to predict its path.`
      :kind==='second'?String.raw`Differentiate twice: \(f''(x)=${g.tex}\). Positive means the function bends upwards; negative means it bends downwards.`
      :kind==='inverse'?String.raw`Chosen branch: \(${g.sourceTex}\). Swap coordinates to discover \(f^{-1}(x)=${g.tex}\). An inverse undoes the function; it is not the reciprocal \(1/f(x)\).`
      :kind==='normal'?String.raw`At \(a=${g.a}\), the tangent gradient is \(f'(a)\approx ${M.format(g.tangent).replaceAll('−','-')}\). Your normal: \(${g.tex}\). ${g.vertical?'A flat tangent has a vertical normal.':'Its gradient is the negative reciprocal of the tangent gradient.'}`
      :kind==='min'?String.raw`Look for a change from decreasing to increasing. At a smooth minimum, solve \(f'(a)=0\) and check the change of sign from − to +; at a corner, compare the two sides.`
      :kind==='max'?String.raw`Look for a change from increasing to decreasing. At a smooth maximum, solve \(f'(a)=0\) and check the change of sign from + to −; at a corner, compare the two sides.`
      :kind==='inflection'?String.raw`Find a change between upwards and downwards bending. Check that \(f''\) changes sign across the candidate; it may be undefined at the point, and \(f''(a)=0\) alone is not enough.`:'';
    const q=quests[level],peers=quests.filter(item=>item.kind===kind&&item.point).sort((a,b)=>a.point.x-b.point.x);
    const number=q.point?peers.findIndex(item=>item.point.x===q.point.x)+1:0;
    const pointName=peers.length>1?`${labels[kind]} ${number} of ${peers.length}, counting from left to right`:labels[kind];
    mission.textContent=q.point
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
    releasePlayerPushes();stopHold();sound?.stop();music?.stop();walkAudible=false;lastTravel=null;announced=false;
    const ecologyCarry=ecology?.snapshot();
    const bonuses=chase?.spiders.filter(s=>(s.origin||'base')==='base').map(s=>({sizeScale:s.sizeScale||1,speedScale:s.speedScale||1,meals:s.meals||0,bloodMeals:s.bloodMeals||0}));
    const q=quests[level],b=G.board(M,key,difficulty,q);levelGraph=G.graph(M,key,q);
    const targets=G.targets(M,key,b,q);
    gaps=window.GridderGaps.plan(M,G,key,b,q,{revealed,difficulty});
    const traversable=window.GridderGapNavigation.create(G,b,targets,gaps);
    game=traversable.game;walker=traversable.walker;navigation=traversable.navigation;
    const spriteOptions=window.GridderSpriteMetrics||{};
    chase=C.create(b,difficulty,{...spriteOptions,familyId:familyId()},navigation);
    poolLeeches=window.GridderPoolLeeches.create(b,gaps.pools,{shark:true});leechWarningId=null;
    ecology=window.GridderCreatureEcology?.create(chase,{familyId:familyId(),elapsedMs:ecologyCarry?.clock||0,arrivalIndex:ecologyCarry?.arrivalIndex||0})||null;
    chase.spiders.forEach((s,index)=>{if(bonuses?.[index])Object.assign(s,bonuses[index]);});
    remains=R?.create(b,spriteOptions)??null;chaseTime=0;safeUntil=1000;resurrectionUntil=0;gameOver=false;deathScene=null;deathAttacker=null;captureSoundPhase=null;snagRemaining=0;
    $('gridder-hints').checked=difficulty==='guided';
    $('gridder-next').disabled=true;$('gridder-solution').hidden=true;$('gridder-solution-prompt').hidden=false;
    $('gridder-solution').innerHTML='';
    $('gridder-level').textContent=`Level ${level+1} of ${quests.length} · Find the ${labels[q.kind]}`;
    $('gridder-task').textContent=!q.point
      ? `Outline every rectangle the ${labels[q.kind]} passes through or touches—even at an edge or corner. Its graph appears inside completed target rectangles.`
      : `Outline every rectangle touching this ${labels[q.kind]} on the coloured function. If the point lies on a grid line or corner, complete every neighbouring rectangle. The point is revealed when all target rectangles are filled.`;
    const detail=q.kind==='inverse'?'Only the stated one-to-one branch is coloured; the grey dashed line is y = x. '
      :q.kind==='normal'?'Point A and its grey tangent are shown. Discover the normal within the visible window. '
      :levelGraph?`The y-range fits both the function and its ${labels[q.kind]}. `:'';
    $('gridder-board-note').textContent=`${difficulty==='guided'?'Guided: target rectangles are outlined.':difficulty==='explorer'?'Explorer: more rectangles; turn on hints if needed.':'Challenge: the finest grid; targets are hidden until you request a hint.'} ${key==='log'&&q.kind!=='inverse'?'This board uses x ≥ 0.5, within the logarithm’s positive domain. ':''}${detail}The outer border is a playable grid edge.${gaps.pools.length?' Follow the pools’ shores. A flashing leech is preparing to lunge—move away before it drags you underwater!':''}`;
    $('gridder-target-legend').textContent=levelGraph?`${q.kind==='second'?'Lime':q.kind==='inverse'?'Teal':q.kind==='normal'?'Orange':'Purple'} dashed curve: revealed ${labels[q.kind]}`:'Dashed curve: discover in later levels';
    $('gridder-normal-control').hidden=q.kind!=='normal';
    if(q.kind==='normal'){
      const input=$('gridder-normal-point');input.min=levelGraph.domain[0];input.max=levelGraph.domain[1];input.value=levelGraph.a;
      $('gridder-normal-point-value').textContent=M.format(levelGraph.a);
    }
    $('gridder-feedback').textContent=playing?'Use ← ↑ ↓ → to move Gridder.':'Choose Start game, then use ← ↑ ↓ →.';
    formula();
    render();if(playing&&spidersEnabled())ensureFrame();
  }
  function restart(){pause();key=$('gridder-function').value;difficulty=$('gridder-difficulty').value;quests=G.levels(M,key);level=0;revealed=[];lives=startingLives;chase=null;ecology=null;newLevel();}
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
      announced=true;stopHold();const q=quests[level];if(q.point)revealed.push(q.point);
      $('gridder-feedback').textContent=`Level complete! You revealed the ${labels[q.kind]}.${level===quests.length-1?' All levels complete—well done!':' Choose Next level when you are ready.'}`;
      $('gridder-next').disabled=level===quests.length-1;explain();
    }
  }
  function cellPixels(axis){
    const geometry=boardLayout();
    return axis==='x'?geometry.cellWidth:geometry.cellHeight;
  }
  function ensureFrame(){if(frame===null){lastTime=null;frame=true;}}
  function move(direction){
    if(!active||!playing||gameOver||deathScene||game.complete())return;
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
    if(!active||!playing||gameOver||deathScene||game.complete())return;
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
    const elapsed=lastTime===null?0:Math.max(0,Math.min(50,now-lastTime));lastTime=now;
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
    pushAudible=false;walkAudible=false;
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
      const divisor=inBox?boxResolution(route.axis,half):1,velocity=speed()/divisor*(snagRemaining>0||playerPushes.length?snagSpeed:1);
      const boundary=route.remaining>7/8+1e-9?route.remaining-7/8:route.remaining>1/8+1e-9?route.remaining-1/8:route.remaining;
      const fraction=Math.min(capture?route.remaining:command.remaining,route.remaining,boundary);
      // End the movement slice at slowdown expiry as well as grid boundaries.
      const budget=Math.min(milliseconds,snagRemaining>0?snagRemaining:Infinity);
      let distance=Math.min(velocity*budget/1000,fraction*length);
      for(const push of playerPushes)distance=Math.min(distance,remains.playerPushDistance(push,cellPixels));
      const start=walker.position(),to={i:start.i+route.direction[0]*distance/cellPixels('x'),j:start.j+route.direction[1]*distance/cellPixels('y')};
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
      const from=walker.position(),duration=distance/velocity*1000;
      if(!walker.advance(direction,distance,cellPixels)){
        stopHold();$('gridder-feedback').textContent='You reached the border. Choose another direction.';break;
      }
      playerPath.push({from,to:walker.position(),start:elapsed?used/elapsed:0,end:elapsed?(used+duration)/elapsed:1});used+=duration;
      lastTravel=route.direction;changed=true;milliseconds-=duration;spendSnagTime(duration);
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
    if(spidersEnabled()&&!game.complete()){
      const paths=chase.advance(after,speed(),elapsed,cellPixels,remains);changed=changed||elapsed>0;
      if(elapsed>0&&chaseTime>=safeUntil){
        const layout=boardLayout();
        const attacker=paths.findIndex((path,index)=>C.collides(playerPath,path,cellPixels,window.GridderSpriteMetrics?.collisionRadius(layout,chase.spiders[index].sizeScale||1)??(11+7*(chase.spiders[index].sizeScale||1)),Math.max(0,(safeUntil-priorChaseTime)/elapsed)));
        if(attacker>=0)caught(attacker);
      }
    }
    if(!deathScene&&!game.complete()){
      const attack=poolLeeches.advance(elapsed,after,cellPixels,{enabled:spidersEnabled(),canAttack:priorChaseTime>=safeUntil,playerPath});
      const warning=poolLeeches.snapshot().find(l=>l.phase==='warning');
      if(attack)caughtLeech(attack);
      else if(warning&&warning.id!==leechWarningId)$('gridder-feedback').textContent=warning.kind==='shark'?'The shark is preparing to bite! Move away from the flashing shoreline.':'A leech is preparing to lunge! Move away from the flashing creature.';
      leechWarningId=warning?.id??null;
      if(spidersEnabled()&&elapsed>0&&gaps.pools.length)changed=true;
    }
    if(!deathScene&&!game.complete()&&spidersEnabled()&&ecology){
      const activeElapsed=Math.max(0,chaseTime-Math.max(priorChaseTime,resurrectionUntil));
      const events=ecology.advance(activeElapsed,after,cellPixels,remains);
      const event=events.at(-1);
      if(event){
        const messages={arrival:`A ${event.name||'new insect'} has entered the board!`,laid:`A large centipede laid ${event.count||1} egg${event.count===1?'':'s'} — hatching in 10 seconds.`,hatched:`${event.count||1} new centipede${event.count===1?'':'s'} hatched!`};
        if(messages[event.type])$('gridder-feedback').textContent=messages[event.type];changed=true;
      }
    }
    announceCompletion();syncGameSounds();if(changed)render();
    if(playing&&!gameOver&&!game.complete()&&(deathScene||spidersEnabled()||chaseTime<resurrectionUntil||snagRemaining>0||held||capture||command||pending.length))frame=true;
    else lastTime=null;
  }
  function spidersEnabled(){return $('gridder-spiders').checked;}
  function caught(index){
    if(deathScene||gameOver)return;
    lives--;releasePlayerPushes();stopHold();resurrectionUntil=0;safeUntil=0;snagRemaining=0;
    const tail=(chase.spiders[index].species||window.GridderMonsterRoster?.get(familyId(),chase.spiders[index].kind))?.shape==='scorpion';
    deathScene=D.create();deathAttacker={index,position:chase.position(chase.spiders[index]),bloodConsumed:false,attackOrgan:tail?'tail':'mouth'};
    captureSoundPhase=null;syncCaptureSound();
    $('gridder-feedback').textContent=`Caught! The ${enemyName(chase.spiders[index])} ${tail?'stings with its tail and drains':'drains'} Gridder; swelling, decay and scattering follow. Your marked areas are saved.`;
  }
  function caughtLeech(event){
    if(deathScene||gameOver||game.complete())return;
    lives--;releasePlayerPushes();stopHold();resurrectionUntil=0;safeUntil=0;snagRemaining=0;leechWarningId=null;
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
    sound?.killed(lives>0,{deathCue:false});
    if(lives<=0){
      gameOver=true;playing=false;$('gridder-start').textContent='Start game';$('gridder-start').setAttribute('aria-pressed','false');
      $('gridder-feedback').textContent="Game Over! Go to the ‘dunce’s stool!’ Choose Restart this function to try again.";
    }else{
      chase.respawn(walker.position(),cellPixels,remains);safeUntil=chaseTime+2000;resurrectionUntil=chaseTime+(sound?.resurrectionDuration?.()??3000);
      $('gridder-feedback').textContent=`Resurrection! ${lives} ${lives===1?'life':'lives'} left. Your marked areas are saved. You are safe for two seconds—keep moving.`;
    }
  }
  $('gridder-spiders').addEventListener('change',()=>{
    if(!game)return;
    if(!deathScene){
      poolLeeches?.resetCooldown(1000);leechWarningId=null;
      if(!chase.spiders.some(s=>s.eating))chase.respawn(walker.position(),cellPixels,remains);
      safeUntil=chaseTime+1000;
    }
    if(playing&&(deathScene||spidersEnabled()))ensureFrame();syncGameSounds();render();
  });
  $('gridder-sound').addEventListener('change',()=>{if(!$('gridder-sound').checked){sound?.stop();captureSoundPhase=null;}else if(playing)unlockSound();});
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
    return Math.max(0,Math.min(500,Number.isFinite(value)?value:20));
  }
  function updateCentrePause(){const value=centrePause();$('gridder-centre-pause-value').textContent=`${value} ms`;$('gridder-centre-pause').setAttribute('aria-valuetext',`${value} milliseconds at the centre`);}
  $('gridder-centre-pause').addEventListener('input',updateCentrePause);updateCentrePause();
  function selectedSpeed(){return Math.max(40,Math.min(400,Number($('gridder-speed').value)||280));}
  function speed(){return selectedSpeed()*boardLayout().pw/referenceMovementPlotWidth;}
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
    return {game,walker,chase,remains,deathScene,deathAttacker,levelGraph,quests,gaps,leeches:poolLeeches?.snapshot()||[],poolBlood:poolLeeches?.bloodSnapshot?.()||[],ecology:ecology?.snapshot()||null,
      level,key,familyId:familyId(),M,G,P,active,playing,revealed,lives,chaseTime,safeUntil,
      resurrectionUntil,gameOver,lastTravel,playerPushes,snagRemaining,
      moving:Boolean(playing&&!deathScene&&(held||capture||command||pending.length)),
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
    const gauge=`Lives: ${lives}`,status=gameOver?'Game over':deathScene?`Captured · ${['leech','shark'].includes(deathAttacker?.kind)?'Underwater · ':''}${deathAttacker?.attackOrgan==='tail'&&deathScene.phase().name==='bite'?'Tail sting':deathLabels[deathScene.phase().name]}`:!spidersEnabled()?'Enemies off · Practice mode':[chaseTime<safeUntil?'Safe briefly':'',leechWarning?'Leech ready to strike!':'',...meals,...growth,ecology?`Next insect: ${Math.max(0,Math.ceil((ecology.snapshot().nextArrivalAt-ecology.snapshot().clock)/1000))} s`:''].filter(Boolean).join(' · ');
    if($('gridder-lives').textContent!==gauge)$('gridder-lives').textContent=gauge;
    if($('gridder-chase-status').textContent!==status)$('gridder-chase-status').textContent=status;
    $('gridder-start').disabled=gameOver||game.complete();
    $('gridder-normal-point').disabled=Boolean(playing&&!game.complete()||deathScene||gameOver);
  }
  $('gridder-start').addEventListener('click',()=>{
    if(playing){pause();$('gridder-feedback').textContent='Paused. Your marked path is saved.';return;}
    if(gameOver||game.complete())return;
    playing=true;$('gridder-normal-point').disabled=true;unlockSound();$('gridder-start').textContent='Pause game';$('gridder-start').setAttribute('aria-pressed','true');$('gridder-feedback').textContent=deathScene?'Capture animation resumed. Escape pauses.':'Use ← ↑ ↓ →. Escape pauses.';$('gridder-board').focus({preventScroll:true});if(deathScene||spidersEnabled()||chaseTime<resurrectionUntil||snagRemaining>0)ensureFrame();
  });
  $('gridder-next').addEventListener('click',()=>{if(!game.complete()||level===quests.length-1)return;level++;newLevel();});
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
    const input=$(id),returnToBoard=()=>{$('gridder-board').focus({preventScroll:true});};
    if(!input)continue;
    input.addEventListener('pointerup',returnToBoard);
    input.addEventListener('click',returnToBoard);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();returnToBoard();}});
  }
  function keydown(e){
    if(!active||!playing||e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.target?.closest?.('input,select,textarea,[contenteditable="true"],#math-titlebar,.window-actions'))return;
    if(e.key==='Escape'){pause();$('gridder-feedback').textContent='Paused. Your marked path is saved.';return;}
    const d=directions[e.key];if(!d)return;
    e.preventDefault();e.stopPropagation();if(!e.repeat){keyboardHold={direction:d,order:++inputOrder};selectHeldInput();}
  }
  function keyup(e){const d=directions[e.key];if(d&&keyboardHold?.direction===d){keyboardHold=null;selectHeldInput();}}
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
      if(!active||!playing||gameOver||deathScene||game.complete())return;
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
  window.gridderController={setActive(value){active=value;if(!value)pause();else{if(!game)restart();render();}},restart,selectFunction,tick,snapshot,pause,begin,release,move,keydown,keyup,beginFrame,endFrame,updateAudio:syncMusic};
  window.derivativeGridder=window.gridderController;
  window.refreshGridderMath=()=>{if(!game)return Promise.resolve();return Promise.resolve(formula()).then(()=>{if(announced)explain();});};
  new ResizeObserver(()=>render()).observe($('gridder-board'));
})();
