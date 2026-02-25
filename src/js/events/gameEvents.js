// src/js/events/gameEvents.js

import {
  renderMiniPalette,
  showMiniPalette,
  hideMiniPalette,
  clearAllHighlights,
  highlightGuideCells,
  updateHintCount,
} from '../ui.js';
import {
  gameState,
} from '../state.js';
import {
  startNewGame,
  setCellValue,
  getUsedNumbersInBlock,
} from '../game-flow.js';
import {
  updateDifficultyBlockUI
} from './mainMenuEvents.js'; // Import the new function

// Helper functions for game events
function handleCellClick(cell, miniPalette) {
  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);
  const cellNumber = gameState.board[row][col];
  const isHighlighted = cell.classList.contains('highlight-guide-glow');

  const isCurrentActiveCell = gameState.activeCell.row === row && gameState.activeCell.col === col;
  const isMiniPaletteVisible = miniPalette && !miniPalette.classList.contains('hidden');

  if (isCurrentActiveCell && isMiniPaletteVisible) {
      hideMiniPalette();
      clearActiveCellSelection();
      return;
  }

  if (isHighlighted) {
    clearAllHighlights();
    clearActiveCellSelection();
    hideMiniPalette();
    return;
  }
  
  clearAllHighlights();
  clearActiveCellSelection();
  hideMiniPalette();

  if (cellNumber !== 0) {
    highlightGuideCells(row, col, cellNumber);
  } else {
    selectNewCell(cell, row, col);
  }
}

function handleUseHintClick() {
  if (gameState.hintCount <= 0 || gameState.activeCell.row === null) return;
  const { row, col } = gameState.activeCell;
  const cell = document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
  if (cell.classList.contains('fixed')) return;
  gameState.hintCount--;
  updateHintCount(gameState.hintCount);
  const correctNumber = gameState.solution[row][col];
  setCellValue(row, col, correctNumber);
  clearActiveCellSelection();
  hideMiniPalette();
}

function handlePaletteClick(e) {
  const target = e.target.closest('[data-number]');
  if (!target || e.target.closest('[data-menu-type]')) return;
  clearAllHighlights();
  if (target.classList.contains('disabled')) return;
  const num = parseInt(target.dataset.number);
  const { row, col } = gameState.activeCell;
  if (row === null) return;
  if (gameState.isSoundEnabled) {
    document.getElementById('click-sound').play();
  }
  setCellValue(row, col, num);
  clearActiveCellSelection();
  hideMiniPalette();
}

function selectNewCell(cell, row, col) {
  clearActiveCellSelection();
  gameState.activeCell = { row, col };
  cell.classList.add('user-selected');
  const usedNumbers = getUsedNumbersInBlock(row, col);
  renderMiniPalette('normal', { usedNumbers });
  showMiniPalette(cell);
}

function clearActiveCellSelection() {
  if (gameState.activeCell.row !== null) {
    const prevCell = document.querySelector(
      `.cell[data-row="${gameState.activeCell.row}"][data-col="${gameState.activeCell.col}"]`
    );
    if (prevCell) prevCell.classList.remove('user-selected');
  }
  gameState.activeCell = { row: null, col: null };
}

export function initializeGameEventListeners(elements) {
  const { sudokuBoard, retryGameBtn, useHintBtn, miniPalette, scoreDisplay, hintContainer, mainMenuBtn, mainMenuScreen } = elements;

  // --- Event Listeners ---
  sudokuBoard.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) handleCellClick(cell, miniPalette);
  });

  useHintBtn.addEventListener('click', handleUseHintClick);
  miniPalette.addEventListener('click', handlePaletteClick);

  const pauseModal = document.getElementById('pause-modal');
  const resumeBtn = document.getElementById('resume-game-btn');
  const quitBtn = document.getElementById('quit-to-main-btn');

  function togglePause(pauseState) {
    gameState.isPaused = pauseState;
    pauseModal.classList.toggle('hidden', !pauseState);
    // 게임 보드 위에 투명한 오버레이를 추가/제거하여 클릭 방지
    const boardOverlay = document.getElementById('board-overlay') || document.createElement('div');
    boardOverlay.id = 'board-overlay';
    if (pauseState) {
      sudokuBoard.appendChild(boardOverlay);
    } else {
      if (boardOverlay.parentNode) {
        boardOverlay.parentNode.removeChild(boardOverlay);
      }
    }
  }

  retryGameBtn.addEventListener('click', () => {
    if (gameState.isSoundEnabled) {
      document.getElementById('click-sound').play();
    }
    togglePause(true);
  });

  resumeBtn.addEventListener('click', () => {
    if (gameState.isSoundEnabled) {
      document.getElementById('click-sound').play();
    }
    togglePause(false);
  });

  quitBtn.addEventListener('click', () => {
    togglePause(false); // 먼저 일시정지 상태를 해제하고
    mainMenuBtn.click(); // 기존 메인메뉴 버튼 클릭 로직을 그대로 재활용
  });

  mainMenuBtn.addEventListener('click', () => { // Event listener for mainMenuBtn
    const stagePageNav = document.getElementById('stage-page-navigation'); // Get reference here
    // Hide game elements
    scoreDisplay.classList.add('hidden');
    sudokuBoard.classList.add('hidden');
    hintContainer.classList.add('hidden');
    document.getElementById('jokbo-display-container').classList.add('hidden'); // Assuming this element is still valid
    document.body.classList.remove('stage-map-mode'); // Remove stage map mode class
    if (stagePageNav) { // Ensure it exists before trying to hide
      stagePageNav.classList.add('hidden'); // Hide stage page navigation
    }
    // Show main menu
    mainMenuScreen.classList.remove('hidden');
    updateDifficultyBlockUI(); // Update difficulty block UI to reflect unlocked states
    // Clear any active cell selection
    clearActiveCellSelection();
    // Play sound if enabled
    if (gameState.isSoundEnabled) {
      document.getElementById('click-sound').play();
    }
  });

  miniPalette.addEventListener('click', (e) => {
    const paletteNumber = e.target.closest('[data-number]');
    if (paletteNumber && !paletteNumber.dataset.menuType) {
      handlePaletteClick(e);
      return;
    }

    const optionEl = e.target.closest('.mini-number[data-menu-type]');
    if (!optionEl) return;

    const value = optionEl.dataset.value;

    if (value === 'cancel') {
      miniPalette.classList.add('hidden');
      miniPalette.style.display = 'none';
      return;
    }
  });
}
