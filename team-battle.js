(()=>{
  const STORAGE_KEY='nameforge-roster-v1';
  const state={roster:loadRoster(),red:[],blue:[],fighting:false,speed:1};
  const arena=$('#arena');
  arena.innerHTML=`
    <div class="team-arena-head"><div class="section-label">TEAM BATTLE</div><h2>팀 결투장</h2></div>
    <section class="roster-panel">
      <div class="roster-title"><b>내 캐릭터</b><span><strong id="rosterCount">0</strong> / 9</span></div>
      <div class="roster-grid" id="rosterGrid"></div>
    </section>
    <section class="comparison-panel">
      <div class="roster-title"><b>능력치 비교</b><span>두 영웅을 차례로 선택</span></div>
      <div class="comparison-picker" id="comparisonPicker"></div>
      <div class="roster-preview" id="rosterPreview" aria-live="polite"><span>캐릭터를 터치하면 능력치가 표시됩니다.</span></div>
    </section>
    <section class="battle-roster-panel">
      <div class="roster-title"><b>가방에서 팀으로 가져오기</b><span>같은 영웅도 여러 번 배치 가능</span></div>
      <div class="battle-roster-picker" id="battleRosterPicker"></div>
    </section>
    <section class="team-builder">
      <div class="team-drop red-team" id="redTeam" data-team="red"><div class="team-label"><b>RED TEAM</b><span id="redCount">0명</span></div><div class="team-list" id="redList"></div><div class="drop-hint">캐릭터를 여기에 드래그</div></div>
      <div class="team-controls"><div class="team-vs">VS</div><button id="teamSpeed">×1 SPEED</button><button class="battle-btn" id="teamBattleBtn" disabled>전투 시작</button><button class="clear-teams" id="clearTeams">팀 비우기</button></div>
      <div class="team-drop blue-team" id="blueTeam" data-team="blue"><div class="team-label"><b>BLUE TEAM</b><span id="blueCount">0명</span></div><div class="team-list" id="blueList"></div><div class="drop-hint">캐릭터를 여기에 드래그</div></div>
    </section>
    <section class="team-battle-stage hidden" id="teamBattleStage"><div class="team-round" id="teamRound">남은 시간 60.0초</div><div class="battle-squads"><div id="redSquad" class="squad red-squad"></div><div id="blueSquad" class="squad blue-squad"></div></div><div class="battle-log-toolbar"><b>전투 로그</b><label><input type="checkbox" id="majorLogOnly" checked>주요 내역만 보기</label></div><div class="battle-log major-only" id="teamLog"></div></section>`;

  function loadRoster(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(saved))return Array(9).fill(null);return Array.from({length:9},(_,i)=>typeof saved[i]==='string'&&isAllowedHeroName(saved[i])?saved[i]:null)}catch{return Array(9).fill(null)}}
  function saveRoster(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.roster))}
  function storeHeroAt(name,index){
    if(!isAllowedHeroName(name)||!Number.isInteger(index)||index<0||index>=9||state.roster[index])return false;
    state.roster[index]=name;saveRoster();render();return true;
  }
  function heroFor(name){return makeHero(name)}
  function card(name,location='roster'){
    const hero=heroFor(name);
    return `<article class="roster-card" draggable="true" data-name="${escapeHtml(name)}" data-location="${location}">${avatar(hero)}<div class="roster-info"><b>${escapeHtml(name)}</b><span>${hero.job.name}</span><small>전투력 ${fmt(hero.power)} · 상위 ${hero.rankPercent.toFixed(1)}%</small></div>${location==='roster'?`<button class="delete-hero" data-delete="${escapeHtml(name)}" aria-label="${escapeHtml(name)} 삭제">×</button>`:''}</article>`;
  }
  function pickerCard(name,index){
    const hero=heroFor(name);
    return `<button type="button" class="comparison-pick" data-compare-pick="${escapeHtml(name)}"><span>${index+1}</span><b>${escapeHtml(name)}</b><small>${hero.job.name} · ${fmt(hero.power)}</small></button>`;
  }
  function battlePickerCard(name,index){
    const hero=heroFor(name);
    return `<article class="battle-pick"><div><span>${index+1}</span><b>${escapeHtml(name)}</b><small>${hero.job.name}</small></div><button type="button" class="red-assign" data-pick-team="red" data-pick-name="${escapeHtml(name)}">RED +</button><button type="button" class="blue-assign" data-pick-team="blue" data-pick-name="${escapeHtml(name)}">BLUE +</button></article>`;
  }
  function render(){
    const saved=state.roster.map((name,index)=>({name,index})).filter(item=>item.name);
    $('#rosterCount').textContent=state.roster.filter(Boolean).length;
    $('#rosterGrid').innerHTML=Array.from({length:9},(_,i)=>state.roster[i]?card(state.roster[i]):`<div class="empty-roster" data-slot="${i}"><span>${i+1}</span><small>여기에 저장</small></div>`).join('');
    $('#comparisonPicker').innerHTML=saved.length?saved.map(item=>pickerCard(item.name,item.index)).join(''):'<p class="picker-empty">가방에 저장된 영웅이 없습니다.</p>';
    $('#battleRosterPicker').innerHTML=saved.length?saved.map(item=>battlePickerCard(item.name,item.index)).join(''):'<p class="picker-empty">가방에 저장된 영웅이 없습니다.</p>';
    $('#redList').innerHTML=state.red.map(n=>card(n,'red')).join('');$('#blueList').innerHTML=state.blue.map(n=>card(n,'blue')).join('');
    $('#redCount').textContent=state.red.length+'명';$('#blueCount').textContent=state.blue.length+'명';
    $('#redTeam').classList.toggle('has-team',state.red.length>0);$('#blueTeam').classList.toggle('has-team',state.blue.length>0);
    $('#teamBattleBtn').disabled=state.red.length===0||state.blue.length===0||state.fighting;
    bindCards();
    ['red','blue'].forEach(team=>document.querySelectorAll(`#${team}List .roster-card`).forEach((el,index)=>{
      const remove=document.createElement('button');remove.type='button';remove.className='remove-team-member';remove.textContent='배치 해제';
      remove.onclick=e=>{e.stopPropagation();if(state.fighting)return;state[team].splice(index,1);render()};el.append(remove);
    }));
    document.querySelectorAll('.roster-card').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',el.dataset.name+' 능력치 보기');});
  }
  function bindCards(){document.querySelectorAll('.roster-card').forEach(el=>{el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',el.dataset.name);e.dataTransfer.effectAllowed='move';el.classList.add('dragging')});el.addEventListener('dragend',()=>el.classList.remove('dragging'));el.addEventListener('dblclick',()=>{const target=el.dataset.location==='red'?'blue':'red';assign(el.dataset.name,target)})});document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=e=>{e.stopPropagation();const n=b.dataset.delete;state.roster=state.roster.map(x=>x===n?null:x);state.red=state.red.filter(x=>x!==n);state.blue=state.blue.filter(x=>x!==n);saveRoster();render()});document.querySelectorAll('.empty-roster').forEach(slot=>{slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('drag-over')});slot.addEventListener('dragleave',()=>slot.classList.remove('drag-over'));slot.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();const name=e.dataTransfer.getData('text/plain');if(!isAllowedHeroName(name))return;state.roster=state.roster.map(x=>x===name?null:x);state.roster[Number(slot.dataset.slot)]=name;state.red=state.red.filter(x=>x!==name);state.blue=state.blue.filter(x=>x!==name);saveRoster();render();toast(`${Number(slot.dataset.slot)+1}번 칸에 저장했습니다.`)})})}
  document.querySelectorAll('.team-drop').forEach(zone=>{zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over')});zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag-over');assign(e.dataTransfer.getData('text/plain'),zone.dataset.team)})});
  $('#rosterGrid').addEventListener('dragover',e=>e.preventDefault());$('#rosterGrid').addEventListener('drop',e=>{e.preventDefault();const n=e.dataTransfer.getData('text/plain');state.red=state.red.filter(x=>x!==n);state.blue=state.blue.filter(x=>x!==n);render()});
  let comparisonBase=null,comparisonCurrent=null;
  function paintComparison(){
    const left=heroFor(comparisonBase),right=comparisonCurrent?heroFor(comparisonCurrent):null;
    $('#rosterPreview').innerHTML=comparisonMarkup(left,right,state.fighting);
    $('#resetComparison').onclick=()=>{comparisonBase=comparisonCurrent||comparisonBase;comparisonCurrent=null;paintComparison()};
    $('#swapComparison').onclick=()=>{if(!comparisonCurrent)return;[comparisonBase,comparisonCurrent]=[comparisonCurrent,comparisonBase];paintComparison()};
    document.querySelectorAll('.roster-card').forEach(el=>el.classList.toggle('selected-hero',el.dataset.name===comparisonBase||el.dataset.name===comparisonCurrent));
  }
  function showComparison(name){
    if(!comparisonBase)comparisonBase=name;else comparisonCurrent=name;
    paintComparison();
  }
  $('#rosterPreview').addEventListener('click',event=>{
    const button=event.target.closest('[data-compare-team]');
    if(button)assign(button.dataset.compareName,button.dataset.compareTeam);
  });
  $('#comparisonPicker').addEventListener('click',event=>{const button=event.target.closest('[data-compare-pick]');if(button)showComparison(button.dataset.comparePick)});
  $('#battleRosterPicker').addEventListener('click',event=>{const button=event.target.closest('[data-pick-team]');if(button)assign(button.dataset.pickName,button.dataset.pickTeam)});
  document.querySelector('main').addEventListener('click',e=>{if(e.target.closest('button'))return;const el=e.target.closest('.roster-card');if(el)showComparison(el.dataset.name)});
  document.querySelector('main').addEventListener('keydown',e=>{if(e.target!==e.target.closest('.roster-card'))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();showComparison(e.target.dataset.name)}});
  function assign(name,team){if(state.fighting||!state.roster.includes(name)||!['red','blue'].includes(team))return;state[team].push(name);render()}
  $('#clearTeams').onclick=()=>{state.red=[];state.blue=[];render()};
  $('#teamSpeed').onclick=()=>{const values=[.5,1,2,4],i=values.indexOf(state.speed);state.speed=values[(i+1)%values.length];$('#teamSpeed').textContent=`×${state.speed} SPEED`};
  const currentCard=$('#characterCard');currentCard.draggable=true;currentCard.addEventListener('dragstart',e=>{if(!heroA){e.preventDefault();return}e.dataTransfer.setData('text/plain',heroA.name);e.dataTransfer.effectAllowed='copy';currentCard.classList.add('dragging')});currentCard.addEventListener('dragend',()=>currentCard.classList.remove('dragging'));
  $('#teamBattleBtn').onclick=startTeamBattle;
  function makeUnit(name,side){return makeCombatUnit(heroFor(name),side)}
  function gaugeView(u){
    const percent=Math.min(100,Math.max(0,Math.floor(u.gauge)));
    const status=!u.alive?'전투 불능':percent===100?'사용 준비 완료':`충전 ${percent}%`;
    const effects=[u.shield>0?`보호막 ${u.shield}`:'',u.evades>0?`회피 ${u.evades}회`:'',u.buffs>0?`강화 ${u.buffs}회`:'',u.burn>0?`화상 ${u.burn}턴`:''].filter(Boolean).join(' · ');
    return `<div class="skill-charge${u.alive&&percent===100?' ready':''}"><div class="charge-label"><span>특수 스킬 I ${skillHelpButton(u.h,'super')}</span><strong>${status}</strong></div><div class="charge-skill-name">${u.h.job.skills.super}</div><div class="unit-gauge" role="progressbar" aria-label="특수 스킬 I 충전" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${status}"><i style="width:${percent}%"></i></div><div class="gadget-status">특수 스킬 II ${skillHelpButton(u.h,'gadget')}<strong>남은 ${u.uses} / 2회</strong></div><div class="charge-skill-name">${u.h.job.skills.gadget}</div>${effects?`<div class="combat-effects">${effects}</div>`:''}</div>`;
  }
  function unitView(u,i){return `<div class="battle-unit" id="${u.side}Unit${i}">${avatar(u.h)}<div><b>${escapeHtml(u.h.name)}</b><span>${u.h.job.name} · 공속 ${statValue('ASPD',u.h.stats.ASPD)}</span><div class="unit-hp"><i style="width:100%"></i></div><small>HP <strong>${u.hp}</strong> / ${u.max}</small>${gaugeView(u)}</div></div>`}
  function updateUnit(u,i){const el=$(`#${u.side}Unit${i}`);if(!el)return;el.classList.toggle('unit-ko',!u.alive);el.querySelector('.unit-hp i').style.width=Math.max(0,u.hp/u.max*100)+'%';el.querySelector('small').innerHTML=`HP <strong>${Math.max(0,Math.ceil(u.hp))}</strong> / ${u.max}`;el.querySelector('.skill-charge').outerHTML=gaugeView(u)}
  function teamLog(html,kind='result'){const el=$('#teamLog');el.insertAdjacentHTML('beforeend',`<div class="log-entry" data-kind="${kind}">${html}</div>`);el.scrollTop=el.scrollHeight}
  $('#majorLogOnly').onchange=()=>{const el=$('#teamLog');el.classList.toggle('major-only',$('#majorLogOnly').checked);el.scrollTop=el.scrollHeight;};
  async function startTeamBattle(){if(state.fighting||!state.red.length||!state.blue.length)return;$('.team-winner')?.remove();state.fighting=true;render();const red=state.red.map(n=>makeUnit(n,'red')),blue=state.blue.map(n=>makeUnit(n,'blue'));$('#teamBattleStage').classList.remove('hidden');$('#redSquad').innerHTML=red.map(unitView).join('');$('#blueSquad').innerHTML=blue.map(unitView).join('');$('#teamLog').innerHTML=`<div class="system-log">RED ${red.length}명 vs BLUE ${blue.length}명</div>`;$('#teamBattleStage').scrollIntoView({behavior:'smooth'});
    $('#teamRound').textContent='남은 시간 60.0초 / 60초';
    teamLog('공격 속도 기준으로 전투 시작','result');
    const timedBattle=createTimedBattle(red,blue);
    let lastFrame=performance.now();
    while(!timedBattle.done){
      const playbackSpeed=state.speed;
      await new Promise(resolve=>setTimeout(resolve,33));
      const now=performance.now();
      const events=advanceTimedBattle(timedBattle,(now-lastFrame)*playbackSpeed);
      lastFrame=now;
      $('#teamRound').textContent=`남은 시간 ${Math.max(0,(timedBattle.limitMs-timedBattle.elapsedMs)/1000).toFixed(1)}초 / 60초`;
      if(events.length){
        red.forEach(updateUnit);blue.forEach(updateUnit);
        events.forEach(event=>event.messages.forEach((message,index)=>teamLog(`<span class="${event.unit.side}-text">[${(event.timeMs/1000).toFixed(1)}초] ${escapeHtml(message)}</span>`,event.messages.kinds[index])));
      }
    }
    const winner=timedBattle.winner,draw=winner===null;
    const defeated=winner==='red'?blue:red;
    const resultDetail=draw?'60초 제한 종료':`${winner==='red'?'블루팀':'레드팀'}(${defeated.map(unit=>unit.h.name).join(', ')}) 전멸`;
    teamLog(draw?'<strong>60초 종료 — 무승부</strong>':`<strong>${winner.toUpperCase()} TEAM 승리</strong>`);
    $('#teamBattleStage').insertAdjacentHTML('beforeend',`<div class="winner team-winner"><div>${draw?'DRAW':'VICTORY'}<b>${draw?'무승부':winner.toUpperCase()+' TEAM'}</b><small>${escapeHtml(resultDetail)} · ${(timedBattle.elapsedMs/1000).toFixed(1)}초</small><button id="teamAgain">다시 전투</button></div></div>`);
    $('#teamAgain').onclick=()=>{$('.team-winner').remove();state.fighting=false;render();startTeamBattle()};
    state.fighting=false;render();
  }
  // The bag sits directly below creation, with click/touch saving as well as drag.
  const workspace=document.querySelector('.creation-workspace');
  workspace.append(document.querySelector('.roster-panel'),document.querySelector('.comparison-panel'));
  const saveButton=document.createElement('button');saveButton.type='button';saveButton.id='saveHeroButton';saveButton.textContent='가방에 저장';saveButton.className='primary';
  $('.next-actions').prepend(saveButton);
  const dialog=document.createElement('dialog');dialog.className='save-slot-dialog';
  dialog.innerHTML='<form method="dialog" class="slot-dialog-head"><b>저장할 칸 선택</b><button aria-label="닫기">닫기</button></form><div id="saveSlotGrid"></div>';
  document.body.append(dialog);
  saveButton.onclick=()=>{
    if(!heroA||!isAllowedHeroName(heroA.name))return;
    const name=heroA.name;$('#saveSlotGrid').replaceChildren();
    state.roster.forEach((occupant,index)=>{const button=document.createElement('button');button.type='button';button.disabled=!!occupant;button.textContent=`${index+1}번 · ${occupant||'빈 칸'}`;button.onclick=()=>{if(storeHeroAt(name,index)){dialog.close();toast(`${index+1}번 칸에 저장했습니다.`);setMobileView('bag')}};$('#saveSlotGrid').append(button)});
    dialog.showModal();
  };
  const mobileNav=document.createElement('nav');mobileNav.className='mobile-navigation';mobileNav.setAttribute('aria-label','게임 화면 선택');
  mobileNav.innerHTML='<button data-view="create">소환</button><button data-view="bag">가방</button><button data-view="compare">비교</button><button data-view="battle">결투</button><button data-view="catalog">도감</button>';
  document.querySelector('.topbar').after(mobileNav);
  function setMobileView(view){document.body.dataset.mobileView=view;$('#catalog').hidden=view!=='catalog';mobileNav.querySelectorAll('button').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.view===view))});}
  mobileNav.onclick=e=>{const button=e.target.closest('[data-view]');if(button){setMobileView(button.dataset.view);if(window.matchMedia('(min-width:761px)').matches&&button.dataset.view==='bag')$('.roster-panel').scrollIntoView({behavior:'smooth'});else if(window.matchMedia('(min-width:761px)').matches&&button.dataset.view==='compare')$('.comparison-panel').scrollIntoView({behavior:'smooth'});else if(window.matchMedia('(min-width:761px)').matches&&button.dataset.view==='battle')arena.scrollIntoView({behavior:'smooth'});else window.scrollTo({top:0,behavior:'smooth'})}};
  $('#toBattle').onclick=()=>{setMobileView('battle');arena.scrollIntoView({behavior:'smooth'})};
  setMobileView('create');
  saveRoster();
  render();
})();
