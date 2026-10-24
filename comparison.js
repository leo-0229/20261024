function comparisonDifference(key,left,right) {
  const value=Number((left-right).toFixed(1));
  const amount=key==='CRITDMG'?Math.abs(value).toFixed(1):key==='ASPD'?Math.abs(left-right).toFixed(2):String(Math.abs(value));
  return {value:key==='ASPD'?Number((left-right).toFixed(2)):value,text:(left>right?'+':left<right?'−':'±')+amount+(key==='CRIT'?'%p':key==='ASPD'?'회/초':'')};
}

function comparisonMarkup(left,right,disabled=false) {
  function identity(hero,label){
    if(!hero)return `<div class="comparison-identity comparison-placeholder"><span>오른쪽 캐릭터</span><b>비교할 캐릭터를 터치하세요</b></div>`;
    return `<div class="comparison-identity">${avatar(hero)}<div><span>${label}</span><h3 title="${escapeHtml(hero.name)}">${escapeHtml(hero.name)}</h3><p>${hero.job.name} · ${fmt(hero.power)}</p></div></div>`;
  }
  const statCells=Object.entries(left.stats).map(([key,value])=>{
    const difference=right?comparisonDifference(key,value,right.stats[key]):null;
    return {left:`<div class="comparison-value"><span>${statMeta[key].name}</span><div><b>${statValue(key,value)}</b>${difference?`<strong class="stat-difference ${difference.value>0?'positive':difference.value<0?'negative':'equal'}">${difference.text}</strong>`:'<strong class="stat-difference equal">—</strong>'}</div></div>`,right:`<div class="comparison-value comparison-right"><span>${statMeta[key].name}</span><b>${right?statValue(key,right.stats[key]):'—'}</b></div>`};
  });
  let rows='';
  for(let index=0;index<statCells.length;index+=2){
    const pair=statCells.slice(index,index+2);
    rows+=`<div class="comparison-stat-pair">${pair.map(cell=>cell.left).join('')}</div><div class="comparison-stat-pair">${pair.map(cell=>cell.right).join('')}</div>`;
  }
  const labels={attack:'기본 스킬',star:'패시브',super:'특수 스킬 I',gadget:'특수 스킬 II'};
  const skills=Object.entries(labels).map(([key,label])=>[left,right].map(hero=>`<div class="comparison-skill"><div class="skill-heading"><span>${label}</span>${hero?skillHelpButton(hero,key):''}</div><b>${hero?hero.job.skills[key]:'—'}</b></div>`).join('')).join('');
  function actions(hero){return `<div class="comparison-actions">${hero?['red','blue'].map(team=>`<button type="button" class="${team}-assign" data-compare-team="${team}" data-compare-name="${escapeHtml(hero.name)}"${disabled?' disabled':''}>${team.toUpperCase()} 추가</button>`).join(''):''}</div>`;}
  return `<header><b>능력치 비교</b><div class="comparison-toolbar"><button type="button" id="swapComparison"${right?'':' disabled'}>좌우 바꾸기 ⇄</button><button type="button" id="resetComparison">비교 초기화</button></div></header><p class="comparison-label">왼쪽 − 오른쪽 · + 높음 / − 낮음</p><div class="comparison-grid">${identity(left,'왼쪽')}${identity(right,'오른쪽')}${rows}</div><details class="comparison-more"><summary>무기·스킬·팀 배치 펼치기</summary><div class="comparison-grid"><div class="comparison-equipment">${escapeHtml(left.weapon)}</div><div class="comparison-equipment">${right?escapeHtml(right.weapon):'—'}</div>${skills}${actions(left)}${actions(right)}</div></details>`;
}
