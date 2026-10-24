(()=>{
  const panel=$('#catalog'),entries=buildSkillCatalog();
  const labels={attack:'기본 스킬',star:'패시브',super:'특수 스킬 I',gadget:'특수 스킬 II'};
  let tab='jobs',selectedJob=null,selectedSlot='attack';
  panel.innerHTML=`<header class="catalog-header"><div><h1>전체 도감</h1><p>직업 ${jobs.length}종 · 스킬 ${entries.length}종 · 무기 ${jobWeapons.flat().length}종</p></div></header>
    <div class="catalog-tabs" aria-label="도감 종류"><button data-catalog-tab="jobs">직업</button><button data-catalog-tab="skills">전체 스킬</button><button data-catalog-tab="stats">능력치</button><button data-catalog-tab="weapons">무기</button></div>
    <div class="catalog-filters"><label>검색<input id="catalogSearch" type="search" placeholder="이름 또는 효과 검색"></label><label>직업<select id="catalogJob"><option value="all">모든 직업</option><option value="common">공용</option>${jobs.map((job,i)=>`<option value="${i}">${job.name}</option>`).join('')}</select></label><label id="catalogTypeLabel">스킬 구분<select id="catalogType"><option value="all">모든 스킬</option>${Object.entries(labels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label></div>
    <section class="job-detail" id="jobDetail" hidden aria-label="직업 전용 스킬"></section><p class="catalog-count" id="catalogCount" role="status"></p><div class="catalog-grid" id="catalogGrid"></div>`;

  function description(entry){
    const loadout=selectHeroSkills(0,entry.jobIndex??0);
    loadout[entry.key]={name:entry.name,effect:entry.effect,scope:entry.scope};
    return skillDescription({loadout},entry.key);
  }
  function renderCatalog(){
    const isDetail=selectedJob!==null;
    panel.querySelector('.catalog-filters').hidden=isDetail;
    $('#jobDetail').hidden=!isDetail;
    $('#catalogCount').hidden=isDetail;
    $('#catalogGrid').hidden=isDetail;
    if(isDetail){
      panel.querySelectorAll('[data-catalog-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.catalogTab==='skills')));
      renderJobDetail();return;
    }
    const query=$('#catalogSearch').value.trim().normalize('NFC').toLowerCase(),job=$('#catalogJob').value,type=$('#catalogType').value;
    const matches=text=>!query||text.toLowerCase().includes(query);
    const jobMatch=index=>job==='all'||String(index)===job;
    let cards=[];
    panel.querySelectorAll('[data-catalog-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.catalogTab===tab)));
    $('#catalogTypeLabel').hidden=tab!=='skills';
    $('#catalogJob').parentElement.hidden=tab==='stats';
    if(tab==='jobs')cards=jobs.flatMap((item,index)=>{
      if(!jobMatch(index)||!matches(item.name+' '+jobWeapons[index].join(' ')))return [];
      return [`<article class="catalog-card job-entry">${avatar({classIndex:index,name:item.name,job:item})}<div><h2>${item.name}</h2><p class="catalog-weapon">${jobWeapons[index].join(' · ')}</p><button class="catalog-job-link" data-open-job="${index}">전용 스킬 보기</button></div></article>`];
    });
    if(tab==='skills')cards=entries.flatMap(entry=>{
      if(job==='common'&&entry.scope!=='공용')return [];
      if(job!=='all'&&job!=='common'&&entry.jobIndex!==Number(job)&&entry.scope!=='공용')return [];
      if(type!=='all'&&entry.key!==type)return [];
      const detail=description(entry),jobName=entry.jobIndex===null?'모든 직업':jobs[entry.jobIndex].name;
      if(!matches(entry.name+' '+detail+' '+jobName))return [];
      return [`<article class="catalog-card skill-entry ${entry.key}"><span class="catalog-badge">${labels[entry.key]} · ${entry.scope}</span><h2>${entry.name}</h2><p class="catalog-job-name">${jobName}</p><details><summary>효과·발동 조건 보기</summary><p>${detail}</p></details></article>`];
    });
    if(tab==='weapons')cards=jobs.flatMap((item,index)=>{
      if(!jobMatch(index))return [];
      return jobWeapons[index].filter(name=>matches(name+' '+item.name)).map(name=>`<article class="catalog-card"><span class="catalog-badge">${item.name} 전용</span><h2>${name}</h2></article>`);
    });
    if(tab==='stats'){
      const descriptions={
        HP:'최대 체력입니다. 0이 되면 전투 불능이 됩니다.',
        MP:'마력 능력치입니다. 전투력 산정에 반영되며, 현재 전투에서 소모하는 자원은 아닙니다.',
        ATK:'기본 공격과 특수 스킬의 피해 계산에 사용합니다.',
        CRIT:'치명타가 발생할 확률입니다. 패시브에 따라 추가 확률이 적용될 수 있습니다.',
        CRITDMG:'치명타 배율 수치입니다. 예를 들어 17.6이면 일반 피해의 1.76배를 줍니다.',
        DEF:'상대의 공격 피해를 줄입니다. 관통 기술은 방어력 일부를 무시합니다.',
        LUCK:'전투력 산정에 반영됩니다. 행운 계열 패시브를 가진 경우 치명타 확률도 증가합니다.',
        CHA:'카리스마 능력치로 전투력 산정에 영향을 줍니다.',
        ASPD:'초당 행동 횟수입니다. 1.00회/초는 1초마다, 0.50회/초는 2초마다 행동합니다. 특수 스킬 사용도 한 번의 행동으로 계산합니다.'
      };
      cards=Object.entries(statMeta).filter(([key,meta])=>matches(meta.name+' '+descriptions[key])).map(([key,meta])=>`<article class="catalog-card"><h2>${meta.name}</h2><p>${descriptions[key]}</p></article>`);
    }
    $('#catalogCount').textContent=`${cards.length}개 표시`;
    $('#catalogGrid').innerHTML=cards.join('')||'<p class="catalog-empty">검색 결과가 없습니다.</p>';
  }
  function renderJobDetail(){
    const job=jobs[selectedJob],skills=entries.filter(entry=>entry.jobIndex===selectedJob&&entry.key===selectedSlot);
    const usage={attack:'공격 속도에 따라 사용하는 기술',star:'전투 내내 적용되는 고유 효과',super:'공격으로 충전 · 100%에서 사용',gadget:'전투당 2회 · 사용 간격 자기 행동 3회'};
    $('#jobDetail').innerHTML=`<div class="job-detail-toolbar"><button type="button" data-job-back>← 직업 목록</button><label>직업 변경<select id="detailJobSelect">${jobs.map((item,index)=>`<option value="${index}"${index===selectedJob?' selected':''}>${item.name}</option>`).join('')}</select></label></div>
      <header class="job-detail-hero">${avatar({classIndex:selectedJob,name:job.name,job})}<div><span class="job-detail-eyebrow">직업 도감</span><h2>${job.name}</h2><div class="job-detail-weapons">${jobWeapons[selectedJob].map(name=>`<span>${name}</span>`).join('')}</div></div><div class="job-detail-total"><b>8</b><span>전용 기술</span></div></header>
      <div class="job-skill-tabs" aria-label="전용 스킬 종류">${Object.entries(labels).map(([key,label])=>`<button type="button" class="${key}" data-job-slot="${key}" aria-pressed="${key===selectedSlot}">${label}<span>2종</span></button>`).join('')}</div>
      <div class="job-skill-heading"><div><h3>${labels[selectedSlot]}</h3><p>${usage[selectedSlot]}</p></div><span>이름에 따라 전용 또는 공용 기술 결정</span></div>
      <div class="job-skill-options">${skills.map((entry,index)=>`<article class="job-skill-option ${selectedSlot}"><div class="job-option-heading"><span>전용 기술 ${index+1}</span><span>${job.name} 전용</span></div><h4>${entry.name}</h4><p>${description(entry)}</p></article>`).join('')}</div>
      <button type="button" class="job-common-link" data-job-common>이 직업이 사용할 수 있는 공용 기술 보기 →</button>`;
  }
  panel.addEventListener('click',event=>{
    const button=event.target.closest('[data-catalog-tab]');
    if(button){selectedJob=null;tab=button.dataset.catalogTab;if(tab!=='skills'&&$('#catalogJob').value==='common')$('#catalogJob').value='all';renderCatalog();}
    const jobButton=event.target.closest('[data-open-job]');
    if(jobButton){selectedJob=Number(jobButton.dataset.openJob);selectedSlot='attack';renderCatalog();$('#jobDetail').scrollIntoView({behavior:'smooth',block:'start'});}
    const slotButton=event.target.closest('[data-job-slot]');
    if(slotButton){selectedSlot=slotButton.dataset.jobSlot;renderJobDetail();$('#jobDetail').querySelector(`[data-job-slot="${selectedSlot}"]`).focus({preventScroll:true});}
    if(event.target.closest('[data-job-back]')){selectedJob=null;tab='jobs';$('#catalogJob').value='all';$('#catalogSearch').value='';renderCatalog();}
    if(event.target.closest('[data-job-common]')){selectedJob=null;tab='skills';$('#catalogJob').value='common';$('#catalogType').value=selectedSlot;$('#catalogSearch').value='';renderCatalog();}
  });
  panel.addEventListener('change',event=>{if(event.target.id==='detailJobSelect'){selectedJob=Number(event.target.value);renderJobDetail();}});
  $('#catalogSearch').addEventListener('input',renderCatalog);
  $('#catalogJob').addEventListener('change',renderCatalog);
  $('#catalogType').addEventListener('change',renderCatalog);
  renderCatalog();
})();
