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

  retryGameBtn.addEventListener('click', () => {
    if (gameState.isSoundEnabled) {
      document.getElementById('f5-sound').play();
    }
    startNewGame();
  });

  mainMenuBtn.addEventListener('click', () => { // Event listener for mainMenuBtn
    // Hide game elements
    scoreDisplay.classList.add('hidden');
    sudokuBoard.classList.add('hidden');
    hintContainer.classList.add('hidden');
    document.getElementById('jokbo-display-container').classList.add('hidden'); // Assuming this element is still valid
    // Show main menu
    mainMenuScreen.classList.remove('hidden');
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
