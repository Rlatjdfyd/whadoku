import { gameState, setCurrentScore, resetScore } from './state.js';

/**
 * @file 스도쿠 게임의 핵심 로직을 담당하는 파일
 * - 스도쿠 보드 생성, 해결, 퍼즐 생성 등의 기능을 포함합니다.
 */

/**
 * 스도쿠 퍼즐의 난이도별 빈 칸 개수 설정
 * @type {{easy: number, medium: number, hard: number}}
 */
const difficulties = {
  easy: 50,
  medium: 40,
  hard: 35,
};

/**
 * 새로운 스도쿠 보드를 생성하고 해결된 상태로 반환합니다.
 * @returns {number[][]} 해결된 9x9 스도쿠 보드
 */
export function generateSudoku() {
  resetScore(); // 새 게임 시작 시 점수 초기화
  let newBoard = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));
  fillDiagonalBoxes(newBoard);
  solveSudoku(newBoard);
  return newBoard;
}

/**
 * 스도쿠 보드의 대각선 3x3 박스를 숫자로 채웁니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 */
function fillDiagonalBoxes(board) {
  for (let i = 0; i < 9; i = i + 3) {
    fillBox(board, i, i);
  }
}

/**
 * 3x3 박스 내부를 1부터 9까지의 숫자로 중복 없이 채웁니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number} row - 시작 행 인덱스
 * @param {number} col - 시작 열 인덱스
 */
function fillBox(board, row, col) {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
}

/**
 * 3x3 박스 내에 특정 숫자가 안전한지(중복되지 않는지) 확인합니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number} row - 시작 행 인덱스
 * @param {number} col - 시작 열 인덱스
 * @param {number} num - 확인할 숫자
 * @returns {boolean} 안전하면 true, 아니면 false
 */
function isSafeInBox(board, row, col, num) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[row + i][col + j] === num) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 스도쿠 퍼즐을 해결합니다. (백트래킹 알고리즘 사용)
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @returns {boolean} 해결 가능하면 true, 아니면 false
 */
function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            } else {
              board[row][col] = 0;
            }
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * 특정 위치에 숫자를 놓는 것이 안전한지 확인합니다. (행, 열, 3x3 박스)
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} num - 확인할 숫자
 * @returns {boolean} 안전하면 true, 아니면 false
 */
function isSafe(board, row, col, num) {
  return (
    isSafeInRow(board, row, num) &&
    isSafeInCol(board, col, num) &&
    isSafeInBox(board, row - (row % 3), col - (col % 3), num)
  );
}

/**
 * 특정 행에 숫자가 안전한지(중복되지 않는지) 확인합니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number} row - 행 인덱스
 * @param {number} num - 확인할 숫자
 * @returns {boolean} 안전하면 true, 아니면 false
 */
function isSafeInRow(board, row, num) {
  for (let col = 0; col < 9; col++) {
    if (board[row][col] === num) {
      return false;
    }
  }
  return true;
}

/**
 * 특정 열에 숫자가 안전한지(중복되지 않는지) 확인합니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number} col - 열 인덱스
 * @param {number} num - 확인할 숫자
 * @returns {boolean} 안전하면 true, 아니면 false
 */
function isSafeInCol(board, col, num) {
  for (let row = 0; row < 9; row++) {
    if (board[row][col] === num) {
      return false;
    }
  }
  return true;
}

/**
 * 해결된 스도쿠 보드에서 난이도에 따라 빈 칸을 만들어 퍼즐을 생성합니다.
 * @param {number[][]} board - 해결된 9x9 스도쿠 보드
 * @param {string} difficulty - 난이도 ('easy', 'medium', 'hard')
 * @returns {number[][]} 빈 칸이 있는 9x9 스도쿠 퍼즐
 */

export function createPuzzle(board, difficultyOrCluesCount) {
  let puzzle = JSON.parse(JSON.stringify(board));
  let cellsToKeep;

  if (typeof difficultyOrCluesCount === 'string') {
    // If it's a difficulty string, look up in difficulties map
    cellsToKeep = difficulties[difficultyOrCluesCount];
  } else if (typeof difficultyOrCluesCount === 'number') {
    // If it's a number, use it directly as cellsToKeep
    cellsToKeep = difficultyOrCluesCount;
  } else {
    // Default or error handling
    console.error("Invalid difficultyOrCluesCount provided to createPuzzle. Defaulting to medium.");
    cellsToKeep = difficulties['medium']; // Fallback
  }

  let cellsToRemove = 81 - cellsToKeep;
  while (cellsToRemove > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      cellsToRemove--;
    }
  }
  return puzzle;
}

/**
 * 스도쿠 보드가 모두 채워졌는지 확인합니다.
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @returns {boolean} 모두 채워졌으면 true, 아니면 false
 */
export function isBoardFull(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        return false;
      }
    }
  }
  return true;
}

// 이 함수는 이제 script.js로 이동하여 이벤트 위임을 통해 관리됩니다.
// game.js에서는 순수 게임 로직만 남겨둡니다.

/**
 * 현재 게임 상태를 로컬 스토리지에 저장합니다.
 */
export function saveGameState() {
  // isSoundEnabled는 게임 진행 상태가 아닌 앱 설정이므로, 저장에서 제외합니다.
  // 이렇게 하면 게임 상태를 불러올 때 사용자의 소리 설정을 덮어쓰지 않습니다.
  const { isSoundEnabled, ...stateToSave } = gameState;
  localStorage.setItem('savedGameState', JSON.stringify(stateToSave));
}

/**
 * 로컬 스토리지에서 게임 상태를 불러옵니다.
 * @returns {object|null} 저장된 게임 상태 객체 또는 null
 */
export function loadGameState() {
  const savedState = localStorage.getItem('savedGameState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return null;
}
