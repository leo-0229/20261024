const attackDetails = {
  strike:'기본 피해로 공격합니다.',
  flurry:'짧은 연격으로 기본 피해의 1.08배를 줍니다. 연격 전체에 한 번의 치명타 판정을 적용합니다.',
  heavy:'힘을 실어 기본 피해의 1.22배를 줍니다.',
  pierce:'대상 방어력의 25%를 무시합니다.',
  charge:'기본 피해의 0.9배를 주고 충전량을 10%p 추가로 얻습니다.',
  scorch:'기본 피해의 0.85배를 주고 대상의 자기 행동 2회 동안 최대 HP의 1.5% 화상을 부여합니다.',
  siphon:'기본 피해의 0.9배를 주고 입힌 피해의 12%만큼 HP를 회복합니다.',
  wild:'기본 피해의 0.6~1.6배 중 무작위 배율로 공격합니다.'
};
const effectDetails = {
  shield:'최대 HP의 25%에 해당하는 보호막을 얻습니다. 보호막은 소진될 때까지 피해를 먼저 흡수합니다.',
  cleanse:'화상을 제거하고 최대 HP의 20% 보호막을 얻습니다.',
  charge:'특수 스킬 I 충전량을 40%p 추가합니다. 최대 100%까지 충전됩니다.',
  evade:'다음에 받는 공격 2회에 각각 65%의 회피 확률을 얻습니다.',
  heal:'최대 HP의 30%만큼 자신의 HP를 회복합니다. 최대 HP를 넘지 않습니다.',
  healCharge:'최대 HP의 18%를 회복하고 특수 스킬 I을 25%p 충전합니다.',
  buff:'다음 공격 2회의 피해가 25% 증가합니다.',
  random:'보호막 25%, HP 회복 30%, 충전 40%p 중 하나를 같은 확률로 얻습니다.',
  drain:'적 한 명에게 공격력의 100% 피해를 주고 실제 입힌 피해만큼 HP를 회복합니다. 방어력으로 피해가 감소합니다.'
};
const passiveDetails = {
  precision:'치명타 확률이 8%p 증가합니다.', rage:'자신의 HP가 35% 이하이면 공격 피해가 25% 증가합니다.',
  charge:'공격할 때 특수 스킬 I 충전량이 8%p 추가됩니다.', critical:'치명타 피해가 기존 배율의 1.2배가 됩니다.',
  armor:'받는 공격 피해가 15% 감소합니다.', scaling:'자기 행동마다 공격 피해가 2%씩 증가합니다. 최대 30%까지 증가합니다.',
  regen:'자기 행동 시작 시 최대 HP의 2%를 회복합니다.', luck:'행운 10당 치명타 확률이 1%p 증가합니다.',
  evasion:'받는 공격에 10%의 회피 확률이 적용됩니다.', opener:'첫 공격의 피해가 30% 증가합니다.',
  burn:'자신이 부여하는 기본 스킬 화상은 대상 최대 HP의 2%, 특수 스킬 I 화상은 4% 피해를 대상이 행동할 때마다 줍니다.',
  execute:'공격 대상의 HP가 30% 이하이면 공격 피해가 25% 증가합니다.'
};
const superDetails = {
  pierce:'기본 피해의 1.8배 공격. 대상 방어력을 40% 무시합니다.',
  guard:'기본 피해의 1.8배 공격 후, 최대 HP의 20% 보호막을 얻습니다.',
  burn:'기본 피해의 1.8배 공격 후 대상의 자기 행동 3회 동안 화상을 부여합니다. 화상은 대상 최대 HP의 3% 피해를 대상이 행동할 때마다 줍니다.',
  buff:'기본 피해의 1.8배 공격 후, 다음 공격 2회의 피해가 25% 증가합니다.',
  heal:'기본 피해의 1.8배 공격 후 최대 HP의 20%를 회복합니다.',
  jackpot:'기본 피해의 1.2~2.6배 중 무작위 배율로 공격합니다.',
  evade:'기본 피해의 1.8배 공격 후, 다음에 받는 공격 2회에 각각 65% 회피 확률을 얻습니다.',
  burst:'기본 피해의 2배로 대상 한 명을 공격합니다.'
};

function skillDescription(hero,key) {
  const gadget=hero.loadout.gadget.effect,passive=hero.loadout.star.effect,special=hero.loadout.super.effect;
  const scope=hero.loadout[key].scope+' 기술. ';
  if(key==='attack')return scope+attackDetails[hero.loadout.attack.effect]+' 공격력과 적 방어력으로 기본 피해를 계산하며 치명타가 적용됩니다. 행동으로 공격한 후 충전량이 28%p + 피해 90당 1%p 증가합니다. 탄약이나 MP를 소모하지 않습니다.';
  if(key==='star')return scope+'상시 효과: '+passiveDetails[passive];
  if(key==='super')return scope+'충전 100%일 때 사용하며 게이지를 0%로 소모합니다. '+superDetails[special]+' 치명타가 적용됩니다. HP가 45% 이하이면 사용 가능한 특수 스킬 II로 먼저 생존을 시도합니다.';
  return scope+'전투당 2회, 사용 간격 자기 행동 3회. 자기 HP 45% 이하에서 우선 사용합니다. 충전형 기술은 게이지 60% 이하에서, 회피·강화형은 자신의 세 번째 행동부터, 흡수형은 HP 70% 이하에서도 사용합니다. '+effectDetails[gadget]+' 이 행동에서는 기본 공격을 하지 않습니다.';
}

function orderBattleUnits(units) {
  return units.filter(unit=>unit.alive).sort((a,b)=>{
    const timeDifference=a.nextActionMs-b.nextActionMs;
    if(timeDifference!==0)return timeDifference;
    const speedDifference=b.h.stats.ASPD-a.h.stats.ASPD;
    if(speedDifference!==0)return speedDifference;
    return a.tieOrder-b.tieOrder;
  });
}

function makeCombatUnit(hero,side) {
  return {h:hero,side,hp:hero.stats.HP,max:hero.stats.HP,gauge:0,alive:true,uses:2,nextGadgetTurn:1,turn:0,shield:0,evades:0,buffs:0,burn:0,burnRate:.03,attacks:0,actionCount:0,nextActionMs:Math.round(1000/hero.stats.ASPD)};
}

function createTimedBattle(red,blue,limitMs=60000,random=Math.random) {
  const ties=[...red,...blue];
  for(let i=ties.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ties[i],ties[j]]=[ties[j],ties[i]];}
  ties.forEach((unit,index)=>{unit.tieOrder=index;});
  return {red,blue,limitMs,elapsedMs:0,done:false,winner:null,reason:''};
}

function advanceTimedBattle(battle,deltaMs,random=Math.random) {
  const events=[];
  if(battle.done)return events;
  const until=Math.min(battle.limitMs,battle.elapsedMs+Math.max(0,deltaMs));
  while(!battle.done){
    const redAlive=battle.red.some(unit=>unit.alive),blueAlive=battle.blue.some(unit=>unit.alive);
    if(!redAlive||!blueAlive){battle.done=true;battle.winner=redAlive?'red':blueAlive?'blue':null;battle.reason='전멸';break;}
    const unit=orderBattleUnits([...battle.red,...battle.blue])[0];
    if(unit.nextActionMs>=battle.limitMs||unit.nextActionMs>until)break;
    battle.elapsedMs=unit.nextActionMs;unit.actionCount++;
    const messages=combatAction(unit,unit.side==='red'?battle.blue:battle.red,unit.actionCount,random);
    events.push({unit,messages,timeMs:battle.elapsedMs});
    unit.nextActionMs+=Math.round(1000/unit.h.stats.ASPD);
  }
  if(!battle.done){battle.elapsedMs=until;if(until>=battle.limitMs){battle.done=true;battle.reason='시간 초과';}}
  return events;
}

function applyGadget(unit,type,target,random) {
  if(type==='random')type=['shield','heal','charge'][Math.min(2,Math.floor(random()*3))];
  if(type==='shield'||type==='cleanse'){unit.shield+=Math.floor(unit.max*(type==='shield'?.25:.2));if(type==='cleanse')unit.burn=0;}
  if(type==='heal'||type==='healCharge')unit.hp=Math.min(unit.max,unit.hp+Math.floor(unit.max*(type==='heal'?.3:.18)));
  if(type==='charge'||type==='healCharge')unit.gauge=Math.min(100,unit.gauge+(type==='charge'?40:25));
  if(type==='evade')unit.evades=2;
  if(type==='buff')unit.buffs=2;
  if(type==='drain'){
    const damage=Math.min(target.hp,Math.max(12,Math.floor(unit.h.stats.ATK-target.h.stats.DEF*.25)));
    target.hp-=damage;target.alive=target.hp>0;unit.hp=Math.min(unit.max,unit.hp+damage);
  }
  return type;
}

function combatAction(unit,enemies,round,random=Math.random) {
  const messages=[];messages.kinds=[];unit.turn=round;
  if(!unit.alive)return messages;
  if(unit.burn>0){const damage=Math.ceil(unit.max*unit.burnRate);unit.hp=Math.max(0,unit.hp-damage);unit.burn--;addCombatMessage(messages,'status',`${unit.h.name} 화상 ${damage} 피해`);unit.alive=unit.hp>0;if(!unit.alive){addCombatMessage(messages,'ko',`${unit.h.name} KO`);return messages;}}
  const gadget=unit.h.loadout.gadget.effect,passive=unit.h.loadout.star.effect,specialType=unit.h.loadout.super.effect;
  const attackType=unit.h.loadout.attack.effect;
  if(passive==='regen'){
    const heal=Math.min(unit.max-unit.hp,Math.floor(unit.max*.02));unit.hp+=heal;
    if(heal>0)logPassive(messages,unit,`HP ${heal} 회복`);
  }
  const target=enemies.filter(enemy=>enemy.alive).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];
  if(!target)return messages;
  const defensive=unit.hp/unit.max<=.45;
  const chargeReady=['charge','healCharge'].includes(gadget)&&unit.gauge<=60;
  const proactive=['buff','evade','random'].includes(gadget)&&round>=3;
  const drainReady=gadget==='drain'&&unit.hp/unit.max<=.7;
  // Fully charged skills take priority, except in a critical health emergency.
  if(unit.uses>0&&round>=unit.nextGadgetTurn&&(defensive||(unit.gauge<100&&(chargeReady||proactive||drainReady)))){
    unit.uses--;unit.nextGadgetTurn=round+3;
    const effect=applyGadget(unit,gadget,target,random);
    addCombatMessage(messages,'special',`${unit.h.name} · 특수 스킬 II [${unit.h.job.skills.gadget}] 사용 (남은 ${unit.uses}회) — ${effectDetails[effect]}`);
    if(!target.alive)addCombatMessage(messages,'ko',`${target.h.name} KO`);
    return messages;
  }
  const special=unit.gauge>=100;
  if(special)unit.gauge=0;
  const targetPassive=target.h.loadout.star.effect;
  const evadeChance=target.evades>0?.65:targetPassive==='evasion'?.1:0;
  if(target.evades>0)target.evades--;
  if(random()<evadeChance){
    if(targetPassive==='evasion'&&evadeChance===.1)logPassive(messages,target,'공격 회피');
    if(!special){unit.gauge=Math.min(100,unit.gauge+28+(passive==='charge'?8:0)+(attackType==='charge'?10:0));if(passive==='charge')logPassive(messages,unit,'충전량 8%p 추가');}
    unit.attacks++;addCombatMessage(messages,special?'special':'attack',`${unit.h.name} · ${special?'특수 스킬 I':'기본 스킬'} → ${target.h.name} 회피`);return messages;
  }
  const chance=unit.h.stats.CRIT+(passive==='precision'?8:passive==='luck'?unit.h.stats.LUCK/10:0);
  const criticalRoll=random()*100,critical=criticalRoll<chance;
  if(critical&&criticalRoll>=unit.h.stats.CRIT&&['precision','luck'].includes(passive))logPassive(messages,unit,'추가 치명타 확률 발동');
  const armor=target.h.stats.DEF*(special&&specialType==='pierce'?.6:!special&&attackType==='pierce'?.75:1);
  let damage=Math.max(12,unit.h.stats.ATK*2.15-armor*.62)*(.86+random()*.28);
  if(special)damage*=specialType==='jackpot'?1.2+random()*1.4:specialType==='burst'?2:1.8;
  if(!special)damage*=attackType==='heavy'?1.22:attackType==='flurry'?1.08:attackType==='charge'||attackType==='siphon'?.9:attackType==='scorch'?.85:attackType==='wild'?.6+random():1;
  if(critical){damage*=unit.h.stats.CRITDMG/10*(passive==='critical'?1.2:1);if(passive==='critical')logPassive(messages,unit,'치명타 피해 20% 강화');}
  if(passive==='rage'&&unit.hp/unit.max<=.35){damage*=1.25;logPassive(messages,unit,'위기 공격 피해 25% 증가');}
  if(passive==='scaling'){const bonus=Math.min(.3,(round-1)*.02);damage*=1+bonus;if(bonus>0)logPassive(messages,unit,`공격 피해 ${Math.round(bonus*100)}% 증가`);}
  if(passive==='opener'&&unit.attacks===0){damage*=1.3;logPassive(messages,unit,'첫 공격 피해 30% 증가');}
  if(passive==='execute'&&target.hp/target.max<=.3){damage*=1.25;logPassive(messages,unit,'마무리 피해 25% 증가');}
  if(unit.buffs>0){damage*=1.25;unit.buffs--;}
  if(targetPassive==='armor'){damage*=.85;logPassive(messages,target,'받는 피해 15% 감소');}
  damage=Math.max(1,Math.floor(damage));
  const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;
  target.hp=Math.max(0,target.hp-damage);target.alive=target.hp>0;unit.attacks++;
  if(!special){unit.gauge=Math.min(100,unit.gauge+28+Math.floor(damage/90)+(passive==='charge'?8:0)+(attackType==='charge'?10:0));if(passive==='charge')logPassive(messages,unit,'충전량 8%p 추가');}
  if(!special&&attackType==='scorch'&&target.alive){target.burn=2;target.burnRate=passive==='burn'?.02:.015;}
  if(!special&&attackType==='siphon')unit.hp=Math.min(unit.max,unit.hp+Math.floor(damage*.12));
  if(special){
    if(specialType==='guard')unit.shield+=Math.floor(unit.max*.2);
    if(specialType==='heal')unit.hp=Math.min(unit.max,unit.hp+Math.floor(unit.max*.2));
    if(specialType==='buff')unit.buffs=2;
    if(specialType==='evade')unit.evades=2;
    if(specialType==='burn'&&target.alive){target.burn=3;target.burnRate=passive==='burn'?.04:.03;}
  }
  if(passive==='burn'&&target.alive&&((!special&&attackType==='scorch')||(special&&specialType==='burn')))logPassive(messages,unit,'지속 피해 강화');
  addCombatMessage(messages,!target.alive?'ko':special?'special':critical?'critical':'attack',`${unit.h.name} · ${special?'특수 스킬 I ['+unit.h.job.skills.super+']':unit.h.job.skills.attack} → ${target.h.name} ${damage} 피해${critical?' (치명타)':''}${absorbed?' · 보호막 흡수 '+absorbed:''}${!target.alive?' · KO':''}`);
  return messages;
}

function addCombatMessage(messages,kind,text) {
  messages.push(text);messages.kinds.push(kind);
}
function logPassive(messages,unit,detail) {
  addCombatMessage(messages,'passive',`${unit.h.name} · 패시브 [${unit.h.job.skills.star}] 발동 — ${detail}`);
}
