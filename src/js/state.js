// src/js/state.js

/**
 * @file 게임의 전역 상태를 관리하는 파일
 */

export const BOARD_SIZE = 9;

export const gameState = {
  board: [],
  solution: [],
  difficulty: 'easy',
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
  isPaused: false, // 게임 일시정지 상태
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
  currentJourneyPage: { easy: 1, medium: 1, hard: 1, random: 1, challenge: 1 }, // 난이도별 현재 여정 페이지
  bonusHintCell: { row: -1, col: -1 }, // 보너스 힌트 셀 좌표


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
  
  // 모든 모드의 기본값 정의
  const defaultProgress = { easy: 1, medium: 1, hard: 1, random: 1, challenge: 1 };
  const defaultPages = { easy: 1, medium: 1, hard: 1, random: 1, challenge: 1 };

  if (savedProgress) {
    try {
      const parsed = JSON.parse(savedProgress);
      
      // 1. 진행도(journeyProgress) 복구: 기존 데이터가 있으면 쓰고, 없으면 기본값(1) 사용
      gameState.journeyProgress = {};
      ['easy', 'medium', 'hard', 'random', 'challenge'].forEach(key => {
        const val = parsed[key];
        gameState.journeyProgress[key] = (typeof val === 'number' && !isNaN(val)) ? val : 1;
      });

      // 2. 현재 페이지(currentJourneyPage) 복구
      gameState.currentJourneyPage = {};
      const savedPages = parsed.currentJourneyPage || {};
      ['easy', 'medium', 'hard', 'random', 'challenge'].forEach(key => {
        const val = savedPages[key];
        gameState.currentJourneyPage[key] = (typeof val === 'number' && !isNaN(val)) ? val : 1;
      });

      // 3. 마지막 난이도 복구
      if (parsed.lastDifficulty) {
        gameState.difficulty = parsed.lastDifficulty;
      }
    } catch (e) {
      console.error("데이터 복구 실패, 초기화합니다.", e);
      gameState.journeyProgress = { ...defaultProgress };
      gameState.currentJourneyPage = { ...defaultPages };
    }
  } else {
    gameState.journeyProgress = { ...defaultProgress };
    gameState.currentJourneyPage = { ...defaultPages };
    saveJourneyProgress();
  }
}

/**
 * 현재 여정 모드 진행 상태를 저장합니다.
 */
export function saveJourneyProgress() {
  if (gameState.journeyProgress) {
    // Save journeyProgress, currentJourneyPage, and lastDifficulty together
    localStorage.setItem('whadokuJourneyProgress', JSON.stringify({
      ...gameState.journeyProgress,
      currentJourneyPage: gameState.currentJourneyPage,
      lastDifficulty: gameState.difficulty,
    }));
  }
}
