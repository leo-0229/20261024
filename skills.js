// Each row contains two job-specific options for every slot.
// Names and effects are selected together so descriptions match combat.
const jobSkillOptions = [
  [['베어내기','strike','연속 베기','flurry'],['검술 숙련','precision','빈틈 포착','critical'],['일섬','pierce','검풍','burst'],['검막','shield','받아치기','buff']],
  [['내려찍기','heavy','가로베기','strike'],['불굴의 의지','armor','전장의 경험','scaling'],['전장의 함성','guard','분쇄의 일격','burst'],['불굴','cleanse','전투 태세','buff']],
  [['마력탄','charge','불꽃 화살','scorch'],['마력 응축','charge','명상','regen'],['메테오','burn','마력 폭발','burst'],['마력 충전','charge','마나 장벽','shield']],
  [['단검 찌르기','pierce','급소 찌르기','heavy'],['급소 포착','critical','은밀한 움직임','evasion'],['그림자 처형','pierce','그림자 습격','evade'],['연막','evade','독의 손길','drain']],
  [['방패 밀치기','strike','방패 강타','heavy'],['중장갑','armor','굳건한 의지','regen'],['철벽 돌진','guard','방패 격돌','burst'],['긴급 방벽','shield','철벽 수비','cleanse']],
  [['기운 방출','charge','견제 사격','strike'],['사기 진작','scaling','침착한 판단','precision'],['승리의 행진','buff','수호의 울림','guard'],['긴급 보급','charge','격려','healCharge']],
  [['빛의 화살','strike','생명의 빛','siphon'],['치유의 손길','regen','평온한 마음','charge'],['대회복','heal','생명의 파동','buff'],['응급 치료','heal','보호의 축복','shield']],
  [['도끼 베기','heavy','난도질','flurry'],['들끓는 분노','rage','핏빛 갈증','critical'],['분노 폭발','guard','광란의 일격','burst'],['피의 방패','shield','격분','buff']],
  [['카드 던지기','wild','카드 연사','flurry'],['타고난 행운','luck','승부사의 배짱','rage'],['잭팟','jackpot','올인','burst'],['패 바꾸기','charge','행운의 주사위','random']],
  [['공 던지기','wild','기습 찌르기','pierce'],['곡예사의 몸놀림','evasion','짓궂은 장난','opener'],['대혼란','evade','마지막 공연','jackpot'],['깜짝 상자','random','눈속임','evade']],
  [['활쏘기','strike','두 발 사격','flurry'],['매의 눈','precision','사냥꾼의 감각','execute'],['화살비','burst','관통 화살','pierce'],['후퇴 기동','evade','집중 사격','buff']],
  [['성스러운 빛','strike','정화의 불꽃','scorch'],['신앙심','charge','축복받은 몸','regen'],['신의 심판','heal','정화의 심판','burn'],['성역','shield','치유의 기도','heal']],
  [['사역마의 발톱','flurry','영혼의 구슬','charge'],['굳건한 유대','scaling','영혼 교감','charge'],['군단 소환','burst','수호수 소환','guard'],['위치 교환','evade','계약의 보호','shield']],
  [['정권 지르기','strike','연속 발차기','flurry'],['단련된 신체','armor','유연한 몸놀림','evasion'],['진공파','pierce','연환격','burst'],['호흡 조절','healCharge','기합','buff']],
  [['창 찌르기','pierce','창 휘두르기','strike'],['선봉장의 기세','opener','창술 숙련','precision'],['유성 돌격','guard','회전 창격','burst'],['창벽','shield','전열 정비','healCharge']],
  [['단발 사격','heavy','연속 사격','flurry'],['침착한 조준','precision','빠른 손놀림','charge'],['집중 포화','burst','관통탄','pierce'],['전술 재정비','charge','구르기','evade']],
  [['산성 물약','scorch','화염병 투척','scorch'],['촉매 반응','burn','정밀 배합','critical'],['대폭발 실험','burn','연쇄 폭발','burst'],['비상 영약','random','회복 물약','heal']],
  [['가시 덩굴','pierce','나뭇잎 칼날','flurry'],['자연의 회복력','regen','야성의 감각','precision'],['고대 나무','heal','야수의 포효','buff'],['야수 변신','buff','나무껍질','shield']],
  [['곡도 베기','strike','권총 사격','heavy'],['약탈 본능','charge','끈질긴 추격','execute'],['함포 사격','burst','선상 난투','evade'],['럼주 한 모금','healCharge','화약 보충','charge']],
  [['뼈 화살','pierce','생명력 흡수','siphon'],['죽음의 기운','execute','저주의 흔적','burn'],['망자의 군세','burn','죽음의 손길','pierce'],['영혼 흡수','drain','뼈 갑옷','shield']]
];

const commonSkillOptions = {
  attack:['정밀 타격','pierce','빠른 공격','flurry','힘껏 치기','heavy','견제 공격','charge'],
  star:['강인한 체력','regen','위기 대처','armor','날카로운 감각','precision','끈기','scaling','승부욕','rage','행운의 가호','luck'],
  super:['전력 일격','burst','수호의 결의','guard','회심의 일격','pierce','전투의 함성','buff'],
  gadget:['응급 처치','heal','긴급 회피','evade','집중','charge','방어 태세','shield']
};

function selectHeroSkills(seed,classIndex) {
  const random=rng(seed^0x518AF32D),loadout={};
  ['attack','star','super','gadget'].forEach((key,index)=>{
    const shared=random()<.25;
    const pool=shared?commonSkillOptions[key]:jobSkillOptions[classIndex][index];
    const offset=Math.floor(random()*(pool.length/2))*2;
    loadout[key]={name:pool[offset],effect:pool[offset+1],scope:shared?'공용':'직업 전용'};
  });
  // A damage-over-time passive must have an attack that can apply it.
  if(loadout.star.effect==='burn'&&loadout.attack.effect!=='scorch'&&loadout.super.effect!=='burn'){
    const pool=jobSkillOptions[classIndex][2];
    loadout.super={name:pool[0],effect:pool[1],scope:'직업 전용'};
  }
  return loadout;
}

function buildSkillCatalog() {
  const entries=[],keys=['attack','star','super','gadget'];
  jobSkillOptions.forEach((slots,jobIndex)=>slots.forEach((pool,slot)=>{
    for(let i=0;i<pool.length;i+=2)entries.push({key:keys[slot],name:pool[i],effect:pool[i+1],scope:'직업 전용',jobIndex});
  }));
  keys.forEach(key=>{
    const pool=commonSkillOptions[key];
    for(let i=0;i<pool.length;i+=2)entries.push({key,name:pool[i],effect:pool[i+1],scope:'공용',jobIndex:null});
  });
  return entries;
}
