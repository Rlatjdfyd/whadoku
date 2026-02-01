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
  isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled')) ?? true, // Sound state
};

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
