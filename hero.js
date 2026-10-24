function hashName(str) {
  // Jenkins one-at-a-time mixing, using normalized Unicode code points.
  let hash = 0;
  for (const char of str.normalize('NFC')) {
    hash = (hash + char.codePointAt(0)) | 0;
    hash = (hash + (hash << 10)) | 0;
    hash ^= hash >>> 6;
  }
  hash = (hash + (hash << 3)) | 0;
  hash ^= hash >>> 11;
  hash = (hash + (hash << 15)) | 0;
  return hash >>> 0;
}

function rng(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function isAllowedHeroName(name) {
  const normalized = String(name || '').normalize('NFC').replace(/[\s\u200B-\u200D\uFEFF]/g, '');
  return normalized.length > 0 && String(name).trim().length <= 30 && !['길수', '경미'].some(part => normalized.includes(part));
}

function rollHeroStats(seed) {
  const random = rng(seed);
  const classIndex = jobDrawOrder[Math.floor(random() * jobDrawOrder.length)];
  const stats = {
    HP: Math.floor(1700 + random() * 1501), MP: Math.floor(70 + random() * 111),
    ATK: Math.floor(55 + random() * 96), CRIT: Math.floor(5 + random() * 36),
    CRITDMG: Number((13.5 + random() * 11.6).toFixed(1)), DEF: Math.floor(35 + random() * 91),
    LUCK: Math.floor(20 + random() * 81), CHA: Math.floor(20 + random() * 81)
  };
  const boosts = [
    ['ATK',14],['ATK',18],['MP',18],['CRIT',8],['DEF',18],['CHA',17],['MP',16],
    ['ATK',22],['LUCK',20],['CHA',18],['CRIT',9],['CHA',18],['MP',15],['CRIT',8],
    ['DEF',14],['CRITDMG',2.2],['LUCK',16],['MP',14],['LUCK',18],['CHA',16]
  ];
  const [key, amount] = boosts[classIndex];
  stats[key] += amount;
  if (key === 'CRITDMG') stats.CRITDMG = Number(stats.CRITDMG.toFixed(1));
  return {classIndex,stats};
}

function calculateHeroPower(seed,stats) {
  const score = stats.HP/30 + stats.MP + stats.ATK*1.8 + stats.CRIT*2 + stats.CRITDMG*4.5 + stats.DEF*1.4 + stats.LUCK + stats.CHA;
  const grade = score > 850 ? 'MYTHIC' : score > 720 ? 'LEGENDARY' : score > 590 ? 'EPIC' : 'RARE';
  const multiplier = { RARE:1, EPIC:1.1, LEGENDARY:1.22, MYTHIC:1.36 }[grade];
  return {grade,power:Math.floor(score*92*multiplier + seed%7000)};
}

const POWER_REFERENCE_SIZE=16384;
let referencePowers;
function powerPercentile(power) {
  if(!referencePowers){
    const random=rng(0x25F16A9B);
    referencePowers=Array.from({length:POWER_REFERENCE_SIZE},()=>{
      const seed=Math.floor(random()*4294967296);
      return calculateHeroPower(seed,rollHeroStats(seed).stats).power;
    }).sort((a,b)=>a-b);
  }
  // Lower bound: count reference heroes whose power is at least this value.
  let low=0,high=referencePowers.length;
  while(low<high){const mid=(low+high)>>>1;if(referencePowers[mid]<power)low=mid+1;else high=mid;}
  return Math.max(.1,Math.min(100,Number(((referencePowers.length-low)/referencePowers.length*100).toFixed(1))));
}

function makeHero(name) {
  name = String(name).trim();
  if (!isAllowedHeroName(name)) throw new Error('사용할 수 없는 이름입니다.');
  const seed = hashName(name);
  const {classIndex,stats}=rollHeroStats(seed);
  stats.ASPD=Number((.5+(hashName(name+':attack-speed')%81)/100).toFixed(2));
  const {power,grade}=calculateHeroPower(seed,stats);
  const loadout=selectHeroSkills(seed,classIndex);
  const job={name:jobs[classIndex].name,skills:Object.fromEntries(Object.entries(loadout).map(([key,skill])=>[key,skill.name]))};
  return {
    name, seed, classIndex, job, loadout, stats, grade, weapon:weaponForHero(seed,classIndex),
    power,rankPercent:powerPercentile(power)
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function fmt(value) { return value.toLocaleString('ko-KR'); }
function statValue(key, value) {
  if(key==='ASPD')return Number(value).toFixed(2)+'회/초';
  return key === 'CRITDMG' ? Number(value).toFixed(1) : String(value) + (key === 'CRIT' ? '%' : '');
}

function avatar(hero) {
  const col = hero.classIndex % 5, row = Math.floor(hero.classIndex / 5);
  return `<div class="character-sprite" role="img" aria-label="${escapeHtml(hero.name+' '+hero.job.name+' 캐릭터')}"><img src="./assets/character-sheet-v1.png" alt="" draggable="false" style="left:-${col*100}%;top:-${row*100}%"></div>`;
}
