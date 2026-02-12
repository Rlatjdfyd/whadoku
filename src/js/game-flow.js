// src/js/game-flow.js

/**
 * @file 게임의 핵심 진행 로직을 담당하는 파일
 */

import {
  updateScoreDisplay,
  updateRankDisplay,
  createBoard,
  renderCell,

  showPenaltyNotification,
  highlightJokboCards,
  updateHintCount,
  showCompletionModal,
  undimAllCells,
  clearAllHighlights,

  updateAchievedJokboDisplay,
  setPassageVisibility,
  displayRandomPassage,
  THEME_OPTIONS_UI, // Import THEME_OPTIONS_UI
} from './ui.js';
import {
  getRankName,
  getRankImage,
  jokboData,
  calculateScore,
  saveHighScore,
} from './hanafuda.js';
import {
  generateSudoku,
  createPuzzle,
  isBoardFull,
  loadGameState,
  saveGameState,
} from './game.js';
import {
  gameState,
  setCurrentScore,
  resetScore,
  BOARD_SIZE,
  loadPassageTopics, // Import loadPassageTopics
} from './state.js';

// --- Helper Functions ---

function loadDailyJokboCounts() {
  const stored = JSON.parse(
    localStorage.getItem('daily-jokbo-counts') || '{}'
  );

  // If there's no stored data, nothing to load, return empty.
  if (!stored.date) {
    return { totalCounts: {}, blockCounts: {} };
  }

  // --- Weekly Reset Logic (every Monday) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day

  // Find the date of the most recent Monday
  const dayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);
  // lastMonday now holds the date of the start of the current week (Monday).

  // Get the date when the counts were last saved
  const storedDate = new Date(stored.date);
  storedDate.setHours(0, 0, 0, 0); // Normalize for comparison

  // If the stored date is before the most recent Monday, reset the counts.
  if (storedDate < lastMonday) {
    return { totalCounts: {}, blockCounts: {} }; // Reset for the new week
  } else {
    // Otherwise, it's from the current week, so load the counts.
    return {
      totalCounts: stored.counts || {},
      blockCounts: stored.blockCounts || {},
    };
  }
}

function saveDailyJokboCounts() {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(
    'daily-jokbo-counts',
    JSON.stringify({
      date: today,
      counts: gameState.dailyJokboCounts,
      blockCounts: gameState.dailyBlockJokboCounts,
    })
  );
}

/**
 * 완료된 글귀를 로컬 스토리지에 저장합니다.
 * @param {string} topicLabel - 글귀의 주제 라벨 (예: '성찰')
 * @param {string} passageText - 글귀 내용
 */
function savePassageToLocalStorage(topicLabel, passageText) {
  // 기존 저장된 글귀 목록 불러오기
  const savedPassagesJSON = localStorage.getItem('completedPassages');
  let savedPassages = savedPassagesJSON ? JSON.parse(savedPassagesJSON) : [];

  // 새로운 글귀 객체 생성
  const newPassage = {
    topic: topicLabel,
    passage: passageText,
    timestamp: new Date().toISOString() // 저장 시점 추가 (옵션)
  };

  // --- 중복 확인 로직 추가 ---
  const isDuplicate = savedPassages.some(
    (p) => p.topic === newPassage.topic && p.passage === newPassage.passage
  );

  if (!isDuplicate) {
    savedPassages.push(newPassage);
    // 업데이트된 목록을 로컬 스토리지에 저장
    localStorage.setItem('completedPassages', JSON.stringify(savedPassages));
    console.log('글귀가 로컬 스토리지에 저장되었습니다:', newPassage);
  } else {
    console.log('이미 저장된 글귀입니다. 중복 저장하지 않습니다.');
    // 중복이라면, 기존 글귀의 timestamp만 업데이트하는 옵션도 있지만, 일단은 저장만 건너뜁니다.
    // localStorage.setItem('completedPassages', JSON.stringify(savedPassages)); // 이미 저장된 글귀가 있어도 저장해야 한다면 이 줄 주석 해제
  }
}

// --- Exported Game Flow Functions ---

export async function initGame() { // Made initGame async
  await loadPassageTopics(); // Call loadPassageTopics at the beginning of initGame

  const loadedState = loadGameState();

  if (loadedState) {
        Object.assign(gameState, loadedState);
        gameState.isFiveSetBonusAchieved = loadedState.isFiveSetBonusAchieved || false;

        // Ensure quoteChars and quoteLength are reset or handled if loaded state was from random mode
        if (loadedState.difficulty !== 'random') {
          delete gameState.quoteChars;
          delete gameState.quoteLength;
          delete gameState.quoteCellMap;
        }
      }

  const savedHighScore = localStorage.getItem('sudokuHighScore');

  if (savedHighScore) {
    gameState.highScore = parseInt(savedHighScore, 10);
  }

  updateScoreDisplay(
    gameState.currentScore,
    gameState.highScore,
    getRankName(gameState.currentScore),
    getRankName(gameState.highScore),
    getRankImage(gameState.currentScore),
    getRankImage(gameState.highScore)
  );

  const highScores = JSON.parse(
    localStorage.getItem('hanafuda-sudoku-scores') || '[]'
  );
  const maxScoreRecord = highScores.length > 0 ? highScores[0] : null;
  const maxScore = maxScoreRecord ? maxScoreRecord.score : 0;

  updateRankDisplay(maxScore, getRankImage(maxScore), getRankName(maxScore));
}

export async function startNewGame() { // Made async
  gameState.hintCount = 3; // 모든 새 게임은 3개의 힌트로 시작하도록 강제 설정
  // NEW LOGIC: ui.js의 displayRandomPassage를 호출하여 글귀를 화면에 표시하고,
  // 반환된 글귀 정보를 gameState.selectedPassage에 저장
  const selectedPassage = await displayRandomPassage(); // ui.js의 함수 호출
  if (selectedPassage) {
    gameState.selectedPassage = selectedPassage; // Store the selected passage in gameState
  } else {
    gameState.selectedPassage = { text: "", author: "" }; // 글귀 로드 실패 시 기본값 설정
  }
  
        // 상단 글귀는 랜덤 난이도에서만 표시
        setPassageVisibility(false);
  gameState.solution = generateSudoku();

  // Define valid difficulty levels for validation
  const validDifficultyLevels = ['easy', 'medium', 'hard', 'random'];

  // Ensure gameState.difficulty is a valid and known difficulty
  if (!validDifficultyLevels.includes(gameState.difficulty)) {

    gameState.difficulty = 'medium';
  }
  


  if (gameState.difficulty === 'random') {
    // Use the *already selected* passage for quoteChars
    const processedText = gameState.selectedPassage.text.replace(/\s/g, '');
    gameState.quoteChars = processedText.split(''); // Store characters
    gameState.quoteLength = gameState.quoteChars.length;

      // Ensure the number of empty cells is exactly quoteLength
      const cellsToKeep = 81 - gameState.quoteLength;
      gameState.board = createPuzzle(gameState.solution, cellsToKeep);
      
      // For random mode, hints might be confusing or not applicable


      // --- NEW LOGIC: Create quoteCellMap ---
      const emptyCells = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (gameState.board[r][c] === 0) {
            emptyCells.push({ row: r, col: c });
          }
        }
      }

      // Sort empty cells by their position to ensure correct quote character order
      emptyCells.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });

      gameState.quoteCellMap = new Map();
      emptyCells.forEach((cell, index) => {
        if (gameState.quoteChars[index]) {
          gameState.quoteCellMap.set(`${cell.row}-${cell.col}`, gameState.quoteChars[index]);
        }
      });
      // --- END NEW LOGIC ---
  } else {
    // For non-random difficulties, generate puzzle as usual
    gameState.board = createPuzzle(gameState.solution, gameState.difficulty);
    // Ensure quote specific states are cleared for non-random modes
    delete gameState.quoteChars;
    delete gameState.quoteLength;
    delete gameState.quoteCellMap;
  }

  gameState.cellImageVariants = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(null));
  
  createBoard(
    gameState.board,
    gameState.theme,
    gameState.cellImageVariants,
    undefined, 
    false, 
    gameState.difficulty === 'random' ? gameState.quoteCellMap : undefined // Pass quoteCellMap
  );

  resetScore();
  updateScoreDisplay(
    gameState.currentScore,
    gameState.highScore,
    getRankName(gameState.currentScore),
    getRankName(gameState.highScore),
    getRankImage(gameState.currentScore),
    getRankImage(gameState.highScore)
  );
  gameState.lastAchievedJokbo = [];
  gameState.penaltyScore = 0;
  // Hint count is set above for random, for others it remains 3 as defined in reset
  // gameState.hintCount = 3; 
  gameState.lastScoreTier = 0;
  gameState.isFiveSetBonusAchieved = false;
 
  gameState.isHintMode = false;
  updateHintCount(gameState.hintCount); // Ensure this is called AFTER setting hintCount correctly for each mode
  undimAllCells();
  clearAllHighlights();
  gameState.achievedSpecialistBonuses = [];
  const { totalCounts, blockCounts } = loadDailyJokboCounts();
  gameState.dailyJokboCounts = totalCounts;
  gameState.dailyBlockJokboCounts = blockCounts;
  updateAchievedJokboDisplay(
    gameState.dailyJokboCounts,
    gameState.dailyBlockJokboCounts,
    jokboData
  );
  saveGameState();
}

export function setCellValue(row, col, num) {
  if (gameState.board[row][col] === num) return;
  gameState.board[row][col] = num;
  if (gameState.cellImageVariants[row][col] === null) {
    gameState.cellImageVariants[row][col] = Math.floor(Math.random() * 3) + 1;
  }
  renderCell(row, col, num, gameState.theme, gameState.cellImageVariants);
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );

  if (gameState.solution[row][col] !== num) {
    if (gameState.isSoundEnabled) {
      document.getElementById('error-sound').play();
    }
    cell.classList.add('error');
    gameState.penaltyScore += 500;
    showPenaltyNotification(500);
    setTimeout(() => {
      cell.classList.remove('error');
      gameState.board[row][col] = 0;
      gameState.cellImageVariants[row][col] = null;
      renderCell(row, col, 0, gameState.theme, gameState.cellImageVariants);
      updateHanafudaScore();
    }, 500);
  } else {
    cell.classList.add('user-filled');
    updateHanafudaScore();
  }
  if (isBoardFull(gameState.board)) {
    checkSolution();
  }
  saveGameState();
}

export function checkSolution() {
  const isCorrect =
    JSON.stringify(gameState.board) === JSON.stringify(gameState.solution);
  if (isCorrect) {
    const jokboScore = gameState.lastScoreResult?.totalScore || 0;

    // 완성된 글귀를 로컬 스토리지에 저장 (게임 완료 시점)
    if (gameState.selectedPassage && gameState.selectedPassageTopic) {
      const foundTopicOption = THEME_OPTIONS_UI.find(
        (option) => option.value === gameState.selectedPassageTopic
      );
      const topicLabel = foundTopicOption ? foundTopicOption.label : '알 수 없는 주제'; // 폴백
      const passageText = gameState.selectedPassage.text;

      savePassageToLocalStorage(topicLabel, passageText);
    }


    setTimeout(() => {
      const scoreData = gameState.lastScoreResult || {
        blockScore: 0,
        rowScore: 0,
        colScore: 0,
        achievedJokbo: [],
        totalScore: 0,
      };

      const finalScoreValue = showCompletionModal(
        jokboScore,
        scoreData,
        null, // luckyBonusInfo
        gameState.difficulty,
        gameState.penaltyScore,
        gameState.achievedSpecialistBonuses,
        jokboData,
        null, // showFortuneFn (implicitly undefined before, now explicitly null)
        gameState.selectedPassage // Pass selectedPassage
      );

      setCurrentScore(finalScoreValue);
      saveHighScore(
        gameState.theme,
        finalScoreValue,
        gameState.difficulty,
        scoreData.achievedJokbo
      );

      const highScores = JSON.parse(
        localStorage.getItem('hanafuda-sudoku-scores') || '[]'
      );
      const maxScoreRecord = highScores.length > 0 ? highScores[0] : null;
      const maxScore = maxScoreRecord ? maxScoreRecord.score : 0;

      updateRankDisplay(maxScore, getRankImage(maxScore), getRankName(maxScore));
      updateScoreDisplay(
        gameState.currentScore,
        gameState.highScore,
        getRankName(gameState.currentScore),
        getRankName(gameState.highScore),
        getRankImage(gameState.currentScore),
        getRankImage(gameState.highScore)
      );
    }, 100);
  }
}

export function updateHanafudaScore() {
  const scoreResult = calculateScore(
    gameState.theme,
    gameState.board,
    gameState.cellImageVariants,
    gameState.bonusBlock
  );
  setCurrentScore(scoreResult.totalScore - gameState.penaltyScore);
  gameState.lastScoreResult = scoreResult;
  updateScoreDisplay(
    gameState.currentScore,
    gameState.highScore,
    getRankName(gameState.currentScore),
    getRankName(gameState.highScore),
    getRankImage(gameState.currentScore),
    getRankImage(gameState.highScore)
  );
  const highScores = JSON.parse(
    localStorage.getItem('hanafuda-sudoku-scores') || '[]'
  );
  const maxScoreRecord = highScores.length > 0 ? highScores[0] : null;
  const maxScore = maxScoreRecord ? maxScoreRecord.score : 0;
  updateRankDisplay(maxScore, getRankImage(maxScore), getRankName(maxScore));

  const newJokboDetailed = scoreResult.detailedAchievedJokbos.filter(
    (current) =>
      !gameState.lastAchievedJokbo.some(
        (last) =>
          last.name === current.name &&
          last.type === current.type &&
          last.index === current.index
      )
  );
  if (newJokboDetailed.length > 0) {
    if (gameState.isSoundEnabled) {

    }

    highlightJokboCards(
      gameState.theme,
      newJokboDetailed,
      gameState.board,
      gameState.cellImageVariants
    );

    newJokboDetailed.forEach((jokbo) => {
      gameState.dailyJokboCounts[jokbo.name] =
        (gameState.dailyJokboCounts[jokbo.name] || 0) + 1;
    });

    // 블록 족보만 따로 카운트합니다.
    newJokboDetailed.forEach((jokbo) => {
      if (jokbo.type === 'block') {
        gameState.dailyBlockJokboCounts[jokbo.name] =
          (gameState.dailyBlockJokboCounts[jokbo.name] || 0) + 1;
      }
    });

    saveDailyJokboCounts();

    jokboData.forEach((jokboEntry) => {
      if (jokboEntry.specialistThreshold && jokboEntry.specialistBonus) {
        const currentCount = gameState.dailyJokboCounts[jokboEntry.name] || 0;
        if (
          currentCount >= jokboEntry.specialistThreshold &&
          !gameState.achievedSpecialistBonuses.includes(jokboEntry.name)
        ) {
          gameState.achievedSpecialistBonuses.push(jokboEntry.name);
    
        }
      }
    });

    updateAchievedJokboDisplay(
      gameState.dailyJokboCounts,
      gameState.dailyBlockJokboCounts,
      jokboData
    );
    document.getElementById('jokbo-display-container').classList.remove('hidden');

    // 5x5 세트 완성 보너스 로직
    if (!gameState.isFiveSetBonusAchieved) {
      const targetJokbos = ['홍단', '청단', '초단', '고도리', '3광'];
      const allTargetsMet = targetJokbos.every(
        (jokboName) => (gameState.dailyBlockJokboCounts[jokboName] || 0) >= 5
      );

      if (allTargetsMet) {
        const bonusScore = 50000;
        setCurrentScore(gameState.currentScore + bonusScore);
        gameState.isFiveSetBonusAchieved = true;
        // 새로운 UI 함수 호출 (ui.js에 추가 예정)
      }
    }
  }
  gameState.lastAchievedJokbo = [...scoreResult.detailedAchievedJokbos];
}

export function getUsedNumbersInBlock(row, col) {
  const usedNumbers = new Set();
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const currentNum = gameState.board[startRow + r][startCol + c];
      if (currentNum !== 0) usedNumbers.add(currentNum);
    }
  }
  return Array.from(usedNumbers);
}