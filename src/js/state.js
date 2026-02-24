// src/js/state.js

/**
 * @file 게임의 전역 상태를 관리하는 파일
 */

export const BOARD_SIZE = 9;

export const gameState = {
  board: [],
  solution: [],
  difficulty: 'medium',
  theme: 'hwatu',
  activeCell: { row: null, col: null },
  currentScore: 0,
  highScore: 0,
  penaltyScore: 0,
  lastAchievedJokbo: [],
  cellImageVariants: [],
  hintCount: 0,
  lastScoreTier: 0,
  isHintMode: false,
  dailyJokboCounts: {},
  achievedSpecialistBonuses: [],
  lastScoreResult: null, // lastScoreResult 추가
  isFiveSetBonusAchieved: false,
  bonusBlock: { row: -1, col: -1 },
  selectedPassageTopic: null, // 사용자가 선택한 글귀 주제 파일명 (예: '1_성찰.json')
  isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled')) ?? true, // Sound state
  passageTopics: [], // 명언 주제 목록을 저장할 배열
  currentViewedPassages: [], // 현재 모달에 표시 중인 글귀 전체 목록
  currentPage: 1, // 현재 페이지 번호
  passagesPerPage: 5, // 페이지당 글귀 수

  // Collection Modal Pagination States (컬렉션 모달 페이지네이션 상태)
  collectionCurrentPage: 1,
  collectionPassagesPerPage: 5, // 페이지당 글귀 수 (컬렉션 모달용)
  currentViewedCollectionPassages: [], // 현재 컬렉션 모달에 표시 중인 글귀 전체 목록 (페이지네이션용)
  collectionFilterTopicLabel: null, // 컬렉션 모달에 적용된 현재 필터 주제 라벨
  journeyProgress: null, // 여정 모드 진행 상태
  currentStage: null, // 현재 진행 중인 여정 스테이지
  currentJourneyPage: { easy: 1, medium: 1, hard: 1, random: 1 }, // 난이도별 현재 여정 페이지


};

/**
 * public/data/passages/ 폴더에서 명언 주제 이름을 로드합니다.
 * 파일 이름에서 숫자와 확장자를 제외한 부분 (예: "성찰", "관계")을 추출합니다.
 */
export async function loadPassageTopics() {
  const topics = [];
  const passageFiles = [
    '1_성찰.json', '2_관계.json', '3_지혜.json', '4_용기.json',
    '5_겸손.json', '6_중용.json', '7_현재.json', '8_본질.json'
  ];

  passageFiles.forEach(filename => {
    const topicId = filename.split('_')[0]; // e.g., '1'
    const topicName = filename.split('_')[1].replace('.json', ''); // e.g., '성찰'
    topics.push({ id: topicId, label: topicName, value: filename });
  });

  gameState.passageTopics = topics;
  console.log("Loaded passage topics:", gameState.passageTopics);
}

/**
 * 게임의 현재 점수를 업데이트하고 최고 점수와 비교하여 갱신합니다.
 * @param {number} newScore - 새로운 현재 점수
 */
export function setCurrentScore(newScore) {
  gameState.currentScore = newScore;
  if (newScore > gameState.highScore) {
    gameState.highScore = newScore;
    localStorage.setItem('sudokuHighScore', gameState.highScore.toString());
  }
}

/**
 * 현재 점수를 0으로 리셋합니다.
 */
export function resetScore() {
  gameState.currentScore = 0;
}

/**
 * 사운드 활성화 상태를 반환합니다.
 * @returns {boolean} 사운드 활성화 여부
 */
export function getSoundEnabledState() {
  return gameState.isSoundEnabled;
}

/**
 * 사운드 활성화 상태를 토글합니다.
 * @returns {boolean} 토글 후의 새로운 사운드 활성화 여부
 */
export function toggleSound() {
  gameState.isSoundEnabled = !gameState.isSoundEnabled;
  localStorage.setItem('isSoundEnabled', JSON.stringify(gameState.isSoundEnabled));
  return gameState.isSoundEnabled;
}

/**
 * 여정 모드 진행 상태를 불러옵니다. 없으면 새로 생성합니다.
 */
export function loadJourneyProgress() {
  const savedProgress = localStorage.getItem('whadokuJourneyProgress');
  if (savedProgress) {
    const parsedProgress = JSON.parse(savedProgress);
    gameState.journeyProgress = parsedProgress;
    // Ensure currentJourneyPage is also loaded or initialized
    gameState.currentJourneyPage = parsedProgress.currentJourneyPage || { easy: 1, medium: 1, hard: 1, random: 1 };
  } else {
    gameState.journeyProgress = {
      easy: 1,
      medium: 1,
      hard: 1,
      random: 1,
    };
    gameState.currentJourneyPage = { easy: 1, medium: 1, hard: 1, random: 1 };
    saveJourneyProgress(); // Save the initial state
  }
}

/**
 * 현재 여정 모드 진행 상태를 저장합니다.
 */
export function saveJourneyProgress() {
  if (gameState.journeyProgress) {
    // Save both journeyProgress and currentJourneyPage together
    localStorage.setItem('whadokuJourneyProgress', JSON.stringify({
      ...gameState.journeyProgress,
      currentJourneyPage: gameState.currentJourneyPage,
    }));
  }
}
