const jobs = [
  {
    "name": "검사"
  },
  {
    "name": "전사"
  },
  {
    "name": "마법사"
  },
  {
    "name": "암살자"
  },
  {
    "name": "탱커"
  },
  {
    "name": "서포터"
  },
  {
    "name": "힐러"
  },
  {
    "name": "버서커"
  },
  {
    "name": "도박사"
  },
  {
    "name": "광대"
  },
  {
    "name": "궁수"
  },
  {
    "name": "사제"
  },
  {
    "name": "소환사"
  },
  {
    "name": "무도가"
  },
  {
    "name": "창기사"
  },
  {
    "name": "총잡이"
  },
  {
    "name": "연금술사"
  },
  {
    "name": "드루이드"
  },
  {
    "name": "해적"
  },
  {
    "name": "네크로맨서"
  }
];

const statMeta = {
  HP: { name: 'HP', icon: '♥', color: '#ff6272' },
  MP: { name: 'MP', icon: '●', color: '#38bfff' },
  ATK: { name: '공격력', icon: '⚔', color: '#ff8a4c' },
  CRIT: { name: '치명타 확률', icon: '◎', color: '#ffe04f' },
  CRITDMG: { name: '치명타 피해', icon: '✹', color: '#ff5e55' },
  DEF: { name: '방어력', icon: '⬡', color: '#63c9ff' },
  LUCK: { name: '행운', icon: '♣', color: '#63dc7b' },
  CHA: { name: '카리스마', icon: '♛', color: '#c17aff' },
  ASPD: { name: '공격 속도', icon: '»', color: '#58e8d4' }
};
const gradeLabels = { RARE: '레어', EPIC: '에픽', LEGENDARY: '레전더리', MYTHIC: '미스틱' };

// Shared draw order; independent of any character name.
const jobDrawOrder = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,19,18,17];

const jobWeapons = [
  ['청뢰검','룬 장검'], ['홍염 대검','전쟁 도끼'], ['별빛 지팡이','자수정 마도봉'],
  ['핏빛 쌍검','그림자 단검'], ['왕실 방패','철벽 방패'], ['숲의 하프','바람의 리라'],
  ['치유의 성봉','생명의 지팡이'], ['광전사의 도끼','혈월 전투도끼'], ['행운의 카드','금박 트럼프'],
  ['광대의 요술봉','축제의 곡예구'], ['초록깃 활','숲지기 장궁'], ['태양의 성봉','축복의 홀'],
  ['영혼의 마도서','계약의 서'], ['화염 권갑','홍련 주먹장갑'], ['서리 장창','빙하의 창'],
  ['황야의 쌍권총','은빛 리볼버'], ['연금 물약병','에메랄드 플라스크'], ['고목 지팡이','생명의 가지'],
  ['선장의 곡도','해적왕의 세이버'], ['해골 지팡이','망자의 마도봉']
];

function weaponForHero(seed,classIndex) {
  const choices=jobWeapons[classIndex];
  return choices[hashName(String(seed)+':weapon')%choices.length];
}

