/**
 * @file 화투 테마 관련 로직을 담당하는 파일
 * - 족보 데이터, 점수 계산, 족보 달성 확인 등의 기능을 포함합니다.
 */

/**
 * 랭크 구간 데이터 (점수 범위와 해당 랭크 번호)
 * @type {Array<object>}
 */
export const rankRanges = [
  { min: 0, max: 10000, rank: 1, name: '새싹꾼' },
  { min: 10001, max: 20000, rank: 2, name: '초보패' },
  { min: 20001, max: 30000, rank: 3, name: '피모음' },
  { min: 30001, max: 40000, rank: 4, name: '띠모음' },
  { min: 40001, max: 50000, rank: 5, name: '끗모음' },
  { min: 50001, max: 60000, rank: 6, name: '화투객' },
  { min: 60001, max: 70000, rank: 7, name: '매조패' },
  { min: 70001, max: 80000, rank: 8, name: '벚꽃패' },
  { min: 80001, max: 90000, rank: 9, name: '등나무' },
  { min: 90001, max: 100000, rank: 10, name: '홍단패' },
  { min: 100001, max: 110000, rank: 11, name: '청단패' },
  { min: 110001, max: 120000, rank: 12, name: '초단패' },
  { min: 120001, max: 130000, rank: 13, name: '고도리' },
  { min: 130001, max: 140000, rank: 14, name: '멍텅구' },
  { min: 140001, max: 150000, rank: 15, name: '피박사' },
  { min: 150001, max: 160000, rank: 16, name: '광박사' },
  { min: 160001, max: 170000, rank: 17, name: '쌍피꾼' },
  { min: 170001, max: 180000, rank: 18, name: '열끗패' },
  { min: 180001, max: 190000, rank: 19, name: '삼광패' },
  { min: 190001, max: 200000, rank: 20, name: '사광패' },
  { min: 200001, max: 210000, rank: 21, name: '오광패' },
  { min: 210001, max: 220000, rank: 22, name: '싹쓸이' },
  { min: 220001, max: 230000, rank: 23, name: '폭탄수' },
  { min: 230001, max: 240000, rank: 24, name: '따닥꾼' },
  { min: 240001, max: 250000, rank: 25, name: '쪽집게' },
  { min: 250001, max: 260000, rank: 26, name: '선잡이' },
  { min: 260001, max: 270000, rank: 27, name: '나가리' },
  { min: 270001, max: 280000, rank: 28, name: '화투도' },
  { min: 280001, max: 290000, rank: 29, name: '패왕군' },
  { min: 290001, max: 300000, rank: 30, name: '지존패' },
  { min: 300001, max: 310000, rank: 31, name: '명인수' },
  { min: 310001, max: 320000, rank: 32, name: '달인경' },
  { min: 320001, max: 330000, rank: 33, name: '신의손' },
  { min: 330001, max: 340000, rank: 34, name: '화투신' },
  { min: 340001, max: 350000, rank: 35, name: '전설패' },
  { min: 350001, max: 360000, rank: 36, name: '타짜왕' },
];

/**
 * 점수에 해당하는 랭크 이미지 경로를 반환합니다.
 * @param {number} score - 점수
 * @returns {string} 랭크 이미지 경로
 */
export function getRankImage(score) {
  for (const range of rankRanges) {
    if (score >= range.min && score <= range.max) {
      return `public/images/ranks/rank${range.rank}.png`;
    }
  }
  return 'public/images/ranks/rank1.png'; // 기본값 (점수가 어떤 범위에도 속하지 않을 경우)
}

/**
 * 점수에 해당하는 랭크 이름을 반환합니다.
 * @param {number} score - 점수
 * @returns {string} 랭크 이름
 */
export function getRankName(score) {
  for (const range of rankRanges) {
    if (score >= range.min && score <= range.max) {
      return range.name;
    }
  }
  return '미정'; // 기본값 (점수가 어떤 범위에도 속하지 않을 경우)
}

/**
 * 모든 랭크 구간 데이터를 반환합니다.
 * @returns {Array<object>} 랭크 구간 데이터 배열
 */
export function getRankRanges() {
  return rankRanges;
}

/**
 * 화투 족보 데이터
 * @type {Array<object>}
 */
export const jokboData = [
  {
    name: '3광',
    score: 10000,
    mainImage: '1-1.png',
    specialistThreshold: 10,
    specialistBonus: 0.3,
    specialistTitle: '✨ 삼광의 지배자',
    cards: [
      { num: 1, variant: 1 }, // 송학
      { num: 3, variant: 1 }, // 벚꽃에 장막
      { num: 8, variant: 1 }, // 공산의 보름달
    ],
  },
  {
    name: '고도리',
    score: 5000,
    mainImage: '2-1.png',
    specialistThreshold: 10,
    specialistBonus: 0.2,
    specialistTitle: '🕊️ 고도리 장인',
    cards: [
      { num: 2, variant: 1 }, // 매조
      { num: 4, variant: 1 }, // 두견이
      { num: 8, variant: 2 }, // 기러기
    ],
  },
  {
    name: '홍단',
    score: 3000,
    mainImage: '1-2.png',
    specialistThreshold: 10,
    specialistBonus: 0.1,
    specialistTitle: '🧧 홍단 전문가',
    cards: [
      { num: 1, variant: 2 }, // 송에 단
      { num: 2, variant: 2 }, // 매에 단
      { num: 3, variant: 2 }, // 벚꽃에 단
    ],
  },
  {
    name: '초단',
    score: 3000,
    mainImage: '4-2.png',
    specialistThreshold: 10,
    specialistBonus: 0.1,
    specialistTitle: '☘️ 초단 전문가',
    cards: [
      { num: 4, variant: 2 }, // 등나무에 단
      { num: 5, variant: 2 }, // 창포에 단
      { num: 7, variant: 2 }, // 싸리에
    ],
  },
  {
    name: '청단',
    score: 3000,
    mainImage: '6-2.png',
    specialistThreshold: 10,
    specialistBonus: 0.1,
    specialistTitle: '🦋 청단 전문가',
    cards: [
      { num: 6, variant: 2 }, // 목단에 나비
      { num: 9, variant: 2 }, // 국화에 술잔
      { num: 7, variant: 1 }, // 싸리에
    ],
  },
  {
    name: '피 5장',
    score: 1000,
    mainImage: '10-3.png',
    cards: 'pi', // 특수 처리: 피(variant 3) 5장 이상
    minCount: 5,
  },
  {
    name: '띠 5장',
    score: 1000,
    mainImage: '12-3.png',
    cards: 'tti', // 특수 처리: 띠(variant 2) 5장 이상
    minCount: 5,
  },
  {
    name: '끗',
    score: 1000,
    mainImage: '9-1.png',
    cards: [
      { num: 2, variant: 1 }, // 매조
      { num: 4, variant: 1 }, // 두견이
      { num: 5, variant: 1 }, // 창포에 다리
      { num: 6, variant: 1 }, // 목단에 나비
      { num: 8, variant: 2 }, // 기러기
      { num: 9, variant: 1 }, // 국화에 술잔
    ],
    minCount: 3, // 끗은 3장 이상
  },
];

/**
 * 현재 스도쿠 보드에 놓인 화투 패를 수집합니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number[][]} cellImageVariants - 셀별 이미지 variant 정보
 * @returns {Array<object>} 수집된 화투 패 정보 배열
 */
function collectHanafudaCards(board, cellImageVariants) {
  const cards = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) {
        cards.push({
          num: board[r][c],
          variant: cellImageVariants[r][c] || 1,
          row: r,
          col: c,
        });
      }
    }
  }
  return cards;
}

/**
 * 주어진 패 목록으로 족보 달성 여부를 확인합니다.
 * @param {Array<object>} cards - 확인할 화투 패 목록
 * @param {object} jokboEntry - 확인할 족보 데이터
 * @returns {number} 달성 횟수 또는 개수 (달성 못하면 0)
 */
function checkJokbo(cards, jokboEntry) {
  const jokboName = jokboEntry.name;
  let matchResult = 0;

  if (jokboEntry.cards === 'pi') {
    const piCount = cards.filter((card) => card.variant === 3).length;
    matchResult = piCount >= jokboEntry.minCount ? piCount : 0;
  } else if (jokboEntry.cards === 'tti') {
    // 8월 기러기(고도리패)는 띠 계산에서 제외
    const ttiCount = cards.filter(
      (card) => card.variant === 2 && !(card.num === 8 && card.variant === 2)
    ).length;
    matchResult = ttiCount >= jokboEntry.minCount ? ttiCount : 0;
  } else {
    const hasAllCards = jokboEntry.cards.every((targetCard) =>
      cards.some((card) => card.num === targetCard.num && card.variant === targetCard.variant)
    );
    if (jokboEntry.minCount) {
      // '끗' 족보
      const matchedSpecificCards = jokboEntry.cards.filter((targetCard) =>
        cards.some((card) => card.num === targetCard.num && card.variant === targetCard.variant)
      ).length;
      matchResult = matchedSpecificCards >= jokboEntry.minCount ? matchedSpecificCards : 0;
    } else {
      // '광', '단', '고도리' 등 정확한 조합
      matchResult = hasAllCards ? 1 : 0;
    }
  }

  if (jokboName === '청단' && matchResult > 0) {
    // 청단 족보 특별 처리
  }
  return matchResult;
}

/**
 * 주어진 패 목록에 대한 점수를 계산합니다.
 * @param {Array<object>} cards - 점수를 계산할 화투 패 목록
 * @returns {{totalScore: number, achievedJokbo: Array<object>}} 계산된 총 점수와 달성된 족보 목록
 */
function calculateScoreForCards(cards) {
  let totalScore = 0;
  const achievedJokbo = [];

  jokboData.forEach((jokbo) => {
    const matchResult = checkJokbo(cards, jokbo);
    if (matchResult > 0) {
      let score = jokbo.score;
      let contributingCards = []; // 이 족보를 달성하는 데 기여한 카드들

      if (jokbo.name === '피 5장') {
        score = jokbo.score + (matchResult - 5) * 200; // 5장 초과 시 장당 200점 추가
        contributingCards = cards.filter((card) => card.variant === 3);
      } else if (jokbo.name === '띠 5장') {
        score = jokbo.score + (matchResult - 5) * 200; // 5장 초과 시 장당 200점 추가
        contributingCards = cards.filter((card) => card.variant === 2);
      } else if (jokbo.name === '끗' && matchResult > 3) {
        score = jokbo.score + (matchResult - 3) * 300; // 3장 초과 시 장당 300점 추가
        contributingCards = jokbo.cards.filter((targetCard) =>
          cards.some((card) => card.num === targetCard.num && card.variant === targetCard.variant)
        );
      } else {
        // 3광, 고도리, 각종 단 등 정확한 조합
        contributingCards = jokbo.cards
          .map((targetCard) =>
            cards.find((card) => card.num === targetCard.num && card.variant === targetCard.variant)
          )
          .filter(Boolean); // filter(Boolean) removes any undefined if a card isn't found
      }

      totalScore += score;
      achievedJokbo.push({
        name: jokbo.name,
        score: score,
        count: matchResult,
        contributingCards: contributingCards, // 기여한 카드 정보 추가
      });
    }
  });
  return { totalScore, achievedJokbo };
}

/**
 * 전체 스도쿠 보드의 화투 점수를 계산합니다. (3x3 블록 단위 합산)
 * @param {string} currentTheme - 현재 테마
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number[][]} cellImageVariants - 셀별 이미지 variant 정보
 * @returns {{totalScore: number, achievedJokbo: Array<object>, detailedAchievedJokbos: Array<object>}} 최종 점수, 집계된 족보, 상세 족보 목록
 */
export function calculateScore(currentTheme, board, cellImageVariants) {
  if (currentTheme !== 'hwatu')
    return { totalScore: 0, achievedJokbo: [], detailedAchievedJokbos: [] };

  let finalTotalScore = 0;
  let blockTotalScore = 0;
  let rowTotalScore = 0;
  let colTotalScore = 0;

  let allAchievedJokbo = []; // UI 표시를 위한 집계된 족보
  let detailedAchievedJokbos = []; // 하이라이트 및 상세 추적을 위한 족보 (contributingCards 포함)

  const allCards = collectHanafudaCards(board, cellImageVariants);

  // 각 3x3 블록 순회하며 점수 계산
  for (let blockRow = 0; blockRow < 9; blockRow += 3) {
    for (let blockCol = 0; blockCol < 9; blockCol += 3) {
      const blockCards = allCards.filter(
        (card) =>
          card.row >= blockRow &&
          card.row < blockRow + 3 &&
          card.col >= blockCol &&
          card.col < blockCol + 3
      );

      if (blockCards.length > 0) {
        const blockResult = calculateScoreForCards(blockCards);
        finalTotalScore += blockResult.totalScore;
        blockTotalScore += blockResult.totalScore;

        // 상세 족보 목록에 추가 (블록 정보 포함)
        blockResult.achievedJokbo.forEach((jokbo) => {
          detailedAchievedJokbos.push({
            ...jokbo,
            type: 'block', // 족보 타입 추가
            index: `${blockRow}-${blockCol}`, // 블록 인덱스
          });
        });
      }
    }
  }

  // 각 행(row) 순회하며 점수 계산
  for (let r = 0; r < 9; r++) {
    const rowCards = allCards.filter((card) => card.row === r);
    if (rowCards.length > 0) {
      const rowResult = calculateScoreForCards(rowCards);
      finalTotalScore += rowResult.totalScore;
      rowTotalScore += rowResult.totalScore;
      rowResult.achievedJokbo.forEach((jokbo) => {
        detailedAchievedJokbos.push({
          ...jokbo,
          type: 'row', // 족보 타입 추가
          index: r, // 행 인덱스
        });
      });
    }
  }

  // 각 열(col) 순회하며 점수 계산
  for (let c = 0; c < 9; c++) {
    const colCards = allCards.filter((card) => card.col === c);
    if (colCards.length > 0) {
      const colResult = calculateScoreForCards(colCards);
      finalTotalScore += colResult.totalScore;
      colTotalScore += colResult.totalScore;
      colResult.achievedJokbo.forEach((jokbo) => {
        detailedAchievedJokbos.push({
          ...jokbo,
          type: 'col', // 족보 타입 추가
          index: c, // 열 인덱스
        });
      });
    }
  }

  // UI 표시를 위해 동일한 족보 합치기 (detailedAchievedJokbos 기반)
  const aggregatedJokboMap = new Map();
  detailedAchievedJokbos.forEach((jokbo) => {
    if (aggregatedJokboMap.has(jokbo.name)) {
      const existing = aggregatedJokboMap.get(jokbo.name);
      existing.score += jokbo.score;
      existing.count += jokbo.count;
      // contributingCards는 합치지 않음 (하이라이트는 detailedAchievedJokbos로 처리)
    } else {
      aggregatedJokboMap.set(jokbo.name, { ...jokbo });
    }
  });
  allAchievedJokbo = Array.from(aggregatedJokboMap.values());

  return {
    totalScore: finalTotalScore,
    blockScore: blockTotalScore, // 3x3 블록 점수 추가
    rowScore: rowTotalScore, // 행 족보 점수 추가
    colScore: colTotalScore, // 열 족보 점수 추가
    achievedJokbo: allAchievedJokbo, // UI 표시용
    detailedAchievedJokbos: detailedAchievedJokbos, // 하이라이트 및 상세 추적용
  };
}

/**
 * 최고 점수를 로컬 스토리지에 저장합니다.
 * @param {string} currentTheme - 현재 테마
 * @param {number} currentScore - 현재 점수
 * @param {string} currentDifficulty - 현재 난이도
 * @param {Array<object>} lastAchievedJokbo - 마지막으로 달성된 족보 목록
 */
export function saveHighScore(currentTheme, currentScore, currentDifficulty, lastAchievedJokbo) {
  if (currentTheme !== 'hwatu') return;

  const highScores = JSON.parse(localStorage.getItem('hanafuda-sudoku-scores') || '[]');
  const newRecord = {
    score: currentScore,
    difficulty: currentDifficulty,
    jokbo: lastAchievedJokbo.map((j) => j.name),
    date: new Date().toISOString().split('T')[0],
  };

  highScores.push(newRecord);
  highScores.sort((a, b) => b.score - a.score);
  highScores.splice(5); // 상위 5개만 저장

  localStorage.setItem('hanafuda-sudoku-scores', JSON.stringify(highScores));
}
