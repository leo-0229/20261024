const $ = selector => document.querySelector(selector);
let heroA = makeHero('정하준');
let toastTimer;

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 1800);
}

function skillHelpButton(hero,key) {
  const labels={attack:'기본 스킬',star:'패시브',super:'특수 스킬 I',gadget:'특수 스킬 II'};
  return `<button type="button" class="skill-help" data-hero="${escapeHtml(hero.name)}" data-skill="${key}" aria-label="${labels[key]} ${hero.job.skills[key]} 상세 설명">?</button>`;
}
const skillDialog=document.createElement('dialog');
skillDialog.className='skill-detail-dialog';
skillDialog.innerHTML='<form method="dialog"><h2 id="skillDetailTitle"></h2><button aria-label="설명 닫기">닫기</button></form><p id="skillDetailText"></p>';
skillDialog.setAttribute('aria-labelledby','skillDetailTitle');
document.body.append(skillDialog);
document.addEventListener('click',event=>{
  const button=event.target.closest('.skill-help');if(!button)return;
  const key=button.dataset.skill;
  const hero=makeHero(button.dataset.hero);
  $('#skillDetailTitle').textContent=hero.job.skills[key];
  $('#skillDetailText').textContent=skillDescription(hero,key);
  skillDialog.showModal();
});

function renderHero(hero) {
  $('#displayName').textContent = hero.name;
  $('#className').textContent = hero.job.name;
  $('#weaponName').textContent = '무기 · '+hero.weapon;
  $('#rarity').textContent = gradeLabels[hero.grade];
  $('#rarity').dataset.grade = hero.grade;
  $('#power').textContent = fmt(hero.power);
  $('#percentile').textContent = hero.rankPercent.toFixed(1)+'%';
  $('.power-rank').title = `가상 영웅 ${fmt(POWER_REFERENCE_SIZE)}명의 전투력 분포와 비교한 추정 비율`;
  $('#fileNo').textContent = '#'+hero.seed.toString(16).toUpperCase().slice(0,6);
  $('#portrait').innerHTML = avatar(hero);
  $('#stats').innerHTML = Object.entries(hero.stats).map(([key,value]) => {
    const meta = statMeta[key];
    const width=key==='ASPD'?value/1.3*100:Math.min(value,100);
    return `<div class="stat-row" style="--stat-color:${meta.color}"><span class="stat-icon" aria-hidden="true">${meta.icon}</span><div class="stat-data"><div class="stat-top"><span>${meta.name}</span><b>${statValue(key,value)}</b></div><div class="bar"><i style="width:${width}%"></i></div></div></div>`;
  }).join('');
  const slots = [
    ['기본 스킬','attack','공격 속도에 따라 사용'], ['패시브','star','상시 발동'],
    ['특수 스킬 I','super','공격 충전 100%'], ['특수 스킬 II','gadget','전투당 2회 사용']
  ];
  $('.skill-box').innerHTML = slots.map(([label,key,detail]) => `<div class="arena-skill ${key}"><div class="skill-heading"><small>${label}</small>${skillHelpButton(hero,key)}</div><b>${hero.job.skills[key]}</b><span>${hero.loadout[key].scope} · ${detail}</span></div>`).join('');
}

$('#heroForm').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#heroName');
  if (!isAllowedHeroName(input.value)) { toast('사용할 수 없는 이름입니다.'); input.focus(); return; }
  heroA = makeHero(input.value);
  renderHero(heroA);
});
$('#regenerate').onclick = () => { $('#heroName').focus(); $('#heroName').select(); };
$('#copyBtn').onclick = async () => {
  const text = `${heroA.name} | ${heroA.job.name} | ${heroA.weapon} | ${gradeLabels[heroA.grade]} | 전투력 ${fmt(heroA.power)}`;
  try { await navigator.clipboard.writeText(text); toast('캐릭터 정보를 복사했습니다.'); }
  catch { toast('이 브라우저에서는 복사할 수 없습니다.'); }
};
$('#heroName').value = heroA.name;
renderHero(heroA);
