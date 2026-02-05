// src/js/events.js

/**
 * @file UI 이벤트 리스너 및 핸들러를 관리하는 파일
 */

import {
  updateJokboModal,
  showHighScoreModal,
  hideHighScoreModal,
  renderMiniPalette,
  showMiniPalette,
  hideMiniPalette,
  clearAllHighlights,
  highlightGuideCells,
  updateHintCount,
  updateRankModal, // Added
  showRankModal,   // Added
  hideRankModal,   // Added
  setPassageVisibility, // Added
} from './ui.js';
import {
  jokboData,
  getRankImage,
  getRankRanges,
} from './hanafuda.js';
import {
  gameState,
  getSoundEnabledState,
  toggleSound,
} from './state.js';
import {
  initGame,
  startNewGame,
  setCellValue,
  getUsedNumbersInBlock,
} from './game-flow.js';

export function initializeEventListeners() {
  const sudokuBoard = document.getElementById('sudoku-board');
  const retryGameBtn = document.getElementById('retry-game-btn');
  const mainMenuBtn = document.getElementById('main-menu-btn');
  // const difficultyButtons = document.querySelectorAll( // Removed
  //   '#main-controls button[data-difficulty]'
  // );
  // const jokboBtn = document.getElementById('jokbo-btn'); // Removed
  const jokboModal = document.getElementById('jokbo-modal');
  const jokboCloseBtn = document.getElementById('jokbo-close-btn');
  const rankModal = document.getElementById('rank-modal');
  const rankCloseBtn = document.getElementById('rank-close-btn');
  const useHintBtn = document.getElementById('use-hint-btn');
  const miniPalette = document.getElementById('mini-palette');
  const helpModal = document.getElementById('help-modal');
  const helpCloseBtn = document.getElementById('help-close-btn');
  const completionModal = document.getElementById('completion-modal');
  const completionCloseBtn = document.getElementById('completion-close-btn');
  const highScoreModal = document.getElementById('high-score-modal');
  const highScoreCloseBtn = document.getElementById('high-score-close-btn');
  const mainMenuScreen = document.getElementById('main-menu-screen');
  const setupContainer = document.getElementById('setup-container');
  const scoreDisplay = document.getElementById('score-display');
  const hintContainer = document.getElementById('hint-container');
  const infoModal = document.getElementById('info-modal');
  const infoCloseBtn = document.getElementById('info-close-btn');
  

  function showInfoModal() {
    infoModal.classList.remove('hidden');
  }

  function hideInfoModal() {
    infoModal.classList.add('hidden');
  }

  function showMainMenuSubmenu(
    targetElement,
    options,
    currentSelectedValue,
    menuType
  ) {
    miniPalette.innerHTML = '';
    miniPalette.classList.remove('hidden');

    options.forEach((option) => {
      const optionEl = document.createElement('div');
      optionEl.classList.add('mini-number');
      optionEl.textContent = option.label;
      optionEl.dataset.value = option.value;
      optionEl.dataset.menuType = menuType;
      if (option.value === currentSelectedValue) {
        optionEl.classList.add('selected');
      }
      miniPalette.appendChild(optionEl);
    });

    const cancelEl = document.createElement('div');
    cancelEl.classList.add('mini-number');
    cancelEl.textContent = '취소';
    cancelEl.dataset.value = 'cancel';
    miniPalette.appendChild(cancelEl);

    const targetRect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = targetRect.bottom + 5;
    let left = targetRect.left;

    if (left + miniPalette.offsetWidth > viewportWidth) {
      left = targetRect.right - miniPalette.offsetWidth;
    }
    if (top + miniPalette.offsetHeight > viewportHeight) {
      top = targetRect.top - miniPalette.offsetHeight - 5;
    }

    miniPalette.style.top = `${top + window.scrollY}px`;
    miniPalette.style.left = `${left + window.scrollX}px`;
    miniPalette.style.display = 'grid';
  }

  function handleCellClick(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const wasActiveCell = (gameState.activeCell.row === row && gameState.activeCell.col === col);
    const isFixed = cell.classList.contains('fixed');
    // Capture whether the *clicked cell* was highlighted BEFORE clearing all highlights
    const clickedCellWasHighlighted = cell.classList.contains('highlight-guide-glow'); 

    clearAllHighlights(); // Always clear all existing highlights
    clearActiveCellSelection(); // Always clear any previous active cell selection
    hideMiniPalette(); // Always hide palette first

    // If the clicked cell was:
    // 1. The active cell (non-fixed), clicked again to deselect
    // 2. Or a fixed cell that was already highlighted, clicked again to turn off its highlight
    // Then simply return, leaving everything cleared.
    if ( (wasActiveCell && !isFixed) || (clickedCellWasHighlighted && isFixed) ) {
        return; 
    }

    // If we reach here, it's a new selection, or re-highlighting a fixed cell that wasn't the active one.
    // Apply highlighting
    if (isFixed || gameState.board[row][col] !== 0) {
      highlightGuideCells(row, col, gameState.board[row][col]);
    }

        // If the cell is empty (0), make it the active cell and show the palette
        if (gameState.board[row][col] === 0) {
          selectNewCell(cell, row, col);
        }  }

  // handleDifficultyChange function removed

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
    if (!target || e.target.closest('[data-menu-type]')) return; // 메뉴 팔레트 클릭은 무시
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

  // --- Event Listeners ---

  sudokuBoard.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) handleCellClick(cell);
  });

  // difficultyButtons.forEach listener removed
  useHintBtn.addEventListener('click', handleUseHintClick);
  miniPalette.addEventListener('click', handlePaletteClick);

  retryGameBtn.addEventListener('click', () => { // newGameBtn changed to retryGameBtn
    if (gameState.isSoundEnabled) {
      document.getElementById('f5-sound').play();
    }
    startNewGame();
  });

  // jokboBtn listener removed
  jokboCloseBtn.addEventListener('click', () =>
    jokboModal.classList.add('hidden')
  );
  if (jokboModal) {
    jokboModal.addEventListener('click', (event) => {
      if (event.target === jokboModal) {
        jokboModal.classList.add('hidden');
      }
      event.stopPropagation();
    });
  }
  if (rankCloseBtn) {
    rankCloseBtn.addEventListener('click', () => {
      hideRankModal();
    });
  }
  if (rankModal) {
    rankModal.addEventListener('click', (event) => {
      if (event.target === rankModal) {
        hideRankModal();
      }
      event.stopPropagation();
    });
  }
  // helpBtn listener removed
  helpCloseBtn.addEventListener('click', () =>
    helpModal.classList.add('hidden')
  );

  mainMenuBtn.addEventListener('click', () => {
    // Hide game elements
    scoreDisplay.classList.add('hidden');
    sudokuBoard.classList.add('hidden');
    hintContainer.classList.add('hidden');
    document.getElementById('jokbo-display-container').classList.add('hidden');
    setPassageVisibility(false); // 상단 글귀 숨기기

    // Show main menu
    mainMenuScreen.classList.remove('hidden');
    // Clear any active cell selection
    clearActiveCellSelection();
    // Play sound if enabled
    if (gameState.isSoundEnabled) {
      document.getElementById('click-sound').play();
    }
  });

  if (completionCloseBtn) {
    completionCloseBtn.addEventListener('click', () =>
      completionModal.classList.add('hidden')
    );
  }

  if (highScoreCloseBtn) {
    highScoreCloseBtn.addEventListener('click', () => {
      hideHighScoreModal();
    });
  }

  if (highScoreModal) {
    highScoreModal.addEventListener('click', (event) => {
      if (event.target === highScoreModal) {
        hideHighScoreModal();
      }
    });
  }

  // --- Main Menu Event Listeners ---

  mainMenuScreen.addEventListener('click', (e) => {
    // New: Handle direct clicks on difficulty sub-cells
    const difficultyCell = e.target.closest('[data-difficulty-level]');
    if (difficultyCell) {
      const level = difficultyCell.dataset.difficultyLevel;
      gameState.difficulty = level;
      updateDifficultySelection();
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      return; // Stop further execution
    }

    // New: Handle direct clicks on theme sub-cells
    const themeCell = e.target.closest('[data-theme-value]');
    if (themeCell) {
      const theme = themeCell.dataset.themeValue;
      gameState.theme = theme;
      updateThemeSelection();
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      return; // Stop further execution
    }

    // New: Handle direct clicks on settings sub-cells
    const settingCell = e.target.closest('[data-setting-action]');
    if (settingCell) {
      const action = settingCell.dataset.settingAction;
      if (action === 'toggle_sound') {
        toggleSound(); // Toggle the sound state
        updateSoundToggleCell(); // Update the UI of the sound toggle cell
        if (gameState.isSoundEnabled) { // Play sound only if enabled
          document.getElementById('click-sound').play();
        }
      } else if (action === 'reset_data') {
        if (confirm('모든 게임 데이터(점수, 진행 상황)를 초기화하시겠습니까?')) {
          localStorage.clear();
          alert('모든 데이터가 초기화되었습니다. 게임을 다시 시작합니다.');
          location.reload();
        }
      }
      return;
    }

    // New: Handle direct clicks on info sub-cell
    const infoCell = e.target.closest('[data-info-action]');
    if (infoCell) {
      const action = infoCell.dataset.infoAction;
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play(); // Play sound for all info actions
      }
      if (action === 'show_ranking') {
        // Now opens the rank-modal instead of high-score-modal
        updateRankModal(getRankRanges(), getRankImage); // Pass rank data and image function
        showRankModal();
      } else if (action === 'show_info') {
        showInfoModal();
      } else if (action === 'show_jokbo') {
        updateJokboModal(gameState.theme, jokboData);
        jokboModal.classList.remove('hidden');
      }
      return;
    }

    // New: Handle direct clicks on start sub-cell
    const startCell = e.target.closest('[data-start-action]');
    if (startCell) {
      mainMenuScreen.classList.add('hidden');
      scoreDisplay.classList.remove('hidden');
      sudokuBoard.classList.remove('hidden');
      if (gameState.isSoundEnabled) {
        document.getElementById('f5-sound').play();
      }
      startNewGame();
      return;
    }

    // New: Handle direct clicks on exit sub-cell
    const exitCell = e.target.closest('[data-exit-action]');
    if (exitCell) {
      alert(
        '게임을 종료합니다. (실제 앱에서는 앱이 종료되거나 백그라운드로 이동합니다.)'
      );
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play(); // Add click sound
      }      return;
    }

    // New: Handle direct clicks on records sub-cell
    const recordsCell = e.target.closest('[data-records-action]');
    if (recordsCell) {
      showHighScoreModal(
        JSON.parse(localStorage.getItem('hanafuda-sudoku-scores') || '[]')
      );
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      return;
    }

    // New: Handle direct clicks on guide sub-cell
    const guideCell = e.target.closest('[data-guide-action]');
    if (guideCell) {
      helpModal.classList.remove('hidden');
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      return;
    }

    const menuItem = e.target.closest('.sudoku-block-menu-item');
    if (!menuItem) return;

    const menuId = menuItem.dataset.menuId;

    switch (menuId) {
      // case 'start': // Disabled
      //   mainMenuScreen.classList.add('hidden');
      //   setupContainer.classList.remove('hidden');
      //   scoreDisplay.classList.remove('hidden');
      //   sudokuBoard.classList.remove('hidden');
      //   hintContainer.classList.remove('hidden');
      //   document.getElementById('f5-sound').play();
      //   startNewGame();
      //   break;
      // case 'exit':
      //   alert(
      //     '게임을 종료합니다. (실제 앱에서는 앱이 종료되거나 백그라운드로 이동합니다.)'
      //   );
      //   break;
      // case 'records':
      //   showHighScoreModal(
      //     JSON.parse(localStorage.getItem('hanafuda-sudoku-scores') || '[]')
      //   );
      //   break;
      case 'guide':
        // helpModal.classList.remove('hidden');
        break;
      // case 'difficulty': // Disabled
      //   break;
      // case 'theme': // Disabled
      //   break;
      case 'settings':
        // const settingsOptions = [
        //   { label: '소리 켜기/끄기', value: 'toggle_sound' },
        //   { label: '데이터 초기화', value: 'reset_data' },
        // ];
        // showMainMenuSubmenu(menuItem, settingsOptions, null, 'settings');
        break;
      case 'info':
        // showInfoModal(); // Disabled
        break;
      default:
        console.log(`Menu item clicked: ${menuId}`);
        break;
    }
  });

  miniPalette.addEventListener('click', (e) => {
    // This listener now only handles the in-game number palette
    const paletteNumber = e.target.closest('[data-number]');
    if (paletteNumber && !paletteNumber.dataset.menuType) {
      handlePaletteClick(e);
      return;
    }

    // This handles clicks on the old submenu-style palette
    const optionEl = e.target.closest('.mini-number[data-menu-type]');
    if (!optionEl) return;

    const value = optionEl.dataset.value;

    if (value === 'cancel') {
      miniPalette.classList.add('hidden');
      miniPalette.style.display = 'none';
      return;
    }
  });

  if (infoCloseBtn) {
    infoCloseBtn.addEventListener('click', hideInfoModal);
  }

  if (infoModal) {
    infoModal.addEventListener('click', (event) => {
      if (event.target === infoModal) {
        hideInfoModal();
      }
    });
  }

  // --- Main Menu Block-Specific Setup ---

  function setupDifficultyBlock() {
    const difficultyBlock = document.querySelector('[data-menu-id="difficulty"]');
    const subCells = difficultyBlock.querySelectorAll('.menu-sub-cell');
    const difficultyOptions = [
      { label: '초급', value: 'easy' },
      { label: '중급', value: 'medium' },
      { label: '고급', value: 'hard' },
      { label: '랜덤', value: 'random' },
    ];

    // Place options in a plus-sign shape (indices 1, 3, 4, 5)
    const cellIndices = [3, 4, 5, 1]; // 초급, 중급, 고급, 랜덤 순서
    difficultyOptions.forEach((option, index) => {
      const cell = subCells[cellIndices[index]];
      if (cell) {
        cell.textContent = option.label;
        cell.dataset.difficultyLevel = option.value;
        cell.style.fontSize = '0.8rem'; // Adjust font size
        cell.style.color = '#00ff00';
        cell.style.backgroundImage = 'none'; // Remove default background
      }
    });

    updateDifficultySelection(); // Set initial selection
  }

  function updateDifficultySelection() {
    const difficultyBlock = document.querySelector('[data-menu-id="difficulty"]');
    const subCells = difficultyBlock.querySelectorAll('.menu-sub-cell');
    subCells.forEach(cell => {
      if (cell.dataset.difficultyLevel) {
        if (cell.dataset.difficultyLevel === gameState.difficulty) {
          cell.classList.add('selected'); // 'selected' class for styling
          cell.style.backgroundColor = '#00ff00'; // Example selection style
          cell.style.color = '#000000';
        } else {
          cell.classList.remove('selected');
          cell.style.backgroundColor = 'transparent';
          cell.style.color = '#00ff00';
        }
      }
    });
  }

  function setupThemeBlock() {
    const themeBlock = document.querySelector('[data-menu-id="theme"]');
    const subCells = themeBlock.querySelectorAll('.menu-sub-cell');
    const themeOptions = [
      { label: '테마', value: 'hwatu' },
    ];

    // Place the single option in the center cell (index 4)
    const cell = subCells[4];
    if (cell) {
      cell.textContent = themeOptions[0].label;
      cell.dataset.themeValue = themeOptions[0].value;
      cell.style.fontSize = '0.8rem';
      cell.style.color = '#00ff00';
      cell.style.backgroundImage = 'none';
    }

    updateThemeSelection();
  }

  function updateThemeSelection() {
    const themeBlock = document.querySelector('[data-menu-id="theme"]');
    const subCells = themeBlock.querySelectorAll('.menu-sub-cell');
    subCells.forEach(cell => {
      if (cell.dataset.themeValue) {
        if (cell.dataset.themeValue === gameState.theme) {
          cell.classList.add('selected');
          cell.style.backgroundColor = '#00ff00';
          cell.style.color = '#000000';
        } else {
          cell.classList.remove('selected');
          cell.style.backgroundColor = 'transparent';
          cell.style.color = '#00ff00';
        }
      }
    });
  }

  // Helper function to update the '소리' toggle cell's display
  function updateSoundToggleCell() {
    const settingsBlock = document.querySelector('[data-menu-id="settings"]');
    const subCells = settingsBlock.querySelectorAll('.menu-sub-cell');
    const soundCell = subCells[3]; // '소리' cell is at index 3 (first of the two options)

    if (soundCell) {
      const isSoundEnabled = getSoundEnabledState();
      soundCell.textContent = isSoundEnabled ? '소리' : '무음';
      soundCell.style.color = isSoundEnabled ? '#000000' : '#00ff00'; // Black text for ON, Green text for OFF
      soundCell.style.backgroundColor = isSoundEnabled ? '#00ff00' : 'transparent'; // Green background for ON, Transparent for OFF
    }
  }

  function setupSettingsBlock() {
    const settingsBlock = document.querySelector('[data-menu-id="settings"]');
    const subCells = settingsBlock.querySelectorAll('.menu-sub-cell');
    const settingsOptions = [
      { label: '소리', action: 'toggle_sound' },
      { label: '지움', action: 'reset_data' },
    ];

    // Place options in the middle row, leaving the center empty
    const cellIndices = [3, 5]; // '소리' at index 3, '지움' at index 5
    settingsOptions.forEach((option, index) => {
      const cell = subCells[cellIndices[index]];
      if (cell) {
        // Set basic attributes
        cell.dataset.settingAction = option.action;
        cell.style.fontSize = '0.8rem';
        cell.style.backgroundImage = 'none';

        // Apply specific styling and text for '소리'
        if (option.action === 'toggle_sound') {
          updateSoundToggleCell(); // Set initial state for sound
        } else {
          // Default styling for '지움'
          cell.textContent = option.label;
          cell.style.color = '#00ff00';
          cell.style.backgroundColor = 'transparent';
        }
      }
    });
  }

  function setupInfoBlock() {
    const infoBlock = document.querySelector('[data-menu-id="info"]');
    const subCells = infoBlock.querySelectorAll('.menu-sub-cell');

    const infoOptions = [
      { label: '랭크', action: 'show_ranking' }, // subCells[3]
      { label: '정보', action: 'show_info' },    // subCells[4]
      { label: '족보', action: 'show_jokbo' },    // subCells[5]
    ];

    infoOptions.forEach((option, index) => {
      const cell = subCells[index + 3]; // Using indices 3, 4, 5
      if (cell) {
        cell.textContent = option.label;
        cell.dataset.infoAction = option.action;
        cell.style.fontSize = '0.8rem';
        cell.style.color = '#00ff00';
        cell.style.backgroundImage = 'none';
        // Apply specific styling based on the action
        if (option.action === 'show_info') {
          cell.style.color = '#00ff00'; // Green text for '정보'
          cell.style.backgroundColor = 'transparent'; // No background for '정보'
        } else {
          cell.style.color = '#000000'; // Black text for '랭크' and '족보'
          cell.style.backgroundColor = '#00ff00'; // Green background for '랭크' and '족보'
        }
      }
    });
  }

  function setupStartBlock() {
    const startBlock = document.querySelector('[data-menu-id="start"]');
    const subCells = startBlock.querySelectorAll('.menu-sub-cell');

    const cell = subCells[4]; // Center cell
    if (cell) {
      cell.textContent = '시작';
      cell.dataset.startAction = 'start_game';
      cell.style.fontSize = '0.8rem';
      cell.style.color = '#000000'; // Make text black for contrast
      cell.style.backgroundColor = '#00ff00'; // Add background color
      cell.style.backgroundImage = 'none';
    }
  }

  function setupExitBlock() {
    const exitBlock = document.querySelector('[data-menu-id="exit"]');
    const subCells = exitBlock.querySelectorAll('.menu-sub-cell');

    const cell = subCells[4]; // Center cell
    if (cell) {
      cell.textContent = '종료';
      cell.dataset.exitAction = 'exit_game';
      cell.style.fontSize = '0.8rem';
      cell.style.color = '#00ff00';
      cell.style.backgroundImage = 'none';
    }
  }

  function setupRecordsBlock() {
    const recordsBlock = document.querySelector('[data-menu-id="records"]');
    const subCells = recordsBlock.querySelectorAll('.menu-sub-cell');

    const cell = subCells[4]; // Center cell
    if (cell) {
      cell.textContent = '기록';
      cell.dataset.recordsAction = 'show_records';
      cell.style.fontSize = '0.8rem';
      cell.style.color = '#00ff00';
      cell.style.backgroundImage = 'none';
    }
  }

  function setupGuideBlock() {
    const guideBlock = document.querySelector('[data-menu-id="guide"]');
    const subCells = guideBlock.querySelectorAll('.menu-sub-cell');

    const cell = subCells[4]; // Center cell
    if (cell) {
      cell.textContent = '안내';
      cell.dataset.guideAction = 'show_guide';
      cell.style.fontSize = '0.8rem';
      cell.style.color = '#00ff00';
      cell.style.backgroundImage = 'none';
    }
  }

  function setupLogoBlock() {
    const logoBlock = document.querySelector('[data-menu-id="logo"]');
    const subCells = logoBlock.querySelectorAll('.menu-sub-cell');

    const cellContent = [
      { text: '', style: '' }, // Index 0 (empty)
      { text: '수', style: 'font-weight: bold; color: #00ff00;' }, // Index 1
      { text: '', style: '' }, // Index 2 (empty)
      { text: '화', style: 'font-weight: bold; color: #00ff00;' }, // Index 3
      { text: '도', style: 'font-weight: bold; color: #00ff00;' }, // Index 4
      { text: '쿠', style: 'font-weight: bold; color: #00ff00;' }, // Index 5
      { text: '', style: '' }, // Index 6 (empty)
      { text: '쿠', style: 'font-weight: bold; color: #00ff00;' }, // Index 7
      { text: '', style: '' }, // Index 8 (empty)
    ];

    subCells.forEach((cell, index) => {
      const content = cellContent[index];
      if (content.text !== '') { // Apply styles if there's text
        cell.textContent = content.text;
        cell.style.cssText = content.style; // Apply inline styles
        cell.style.backgroundImage = 'none'; // Remove background for text cells
        cell.style.backgroundColor = 'transparent'; // Remove background color for text cells
        cell.style.display = 'flex'; // Ensure flex for centering text
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontSize = '1.5rem'; // Consistent font size
      } else { // Empty cells: let them inherit default pattern
        cell.textContent = '';
        cell.style.cssText = ''; // Clear any inline styles that might interfere
      }
    });
  }

  // New function to fill empty menu cells with random fruit images
  function fillEmptyMenuCells() {
    const fruitImages = [
      '1-1.png', '1-2.png', '1-3.png', '10-1.png', '10-2.png', '10-3.png',
      '11-1.png', '11-2.png', '11-3.png', '12-1.png', '12-2.png', '12-3.png', '12-4.png',
      '2-1.png', '2-2.png', '2-3.png', '3-1.png', '3-2.png', '3-3.png',
      '4-1.png', '4-2.png', '4-3.png', '5-1.png', '5-2.png', '5-3.png',
      '6-1.png', '6-2.png', '6-3.png', '7-1.png', '7-2.png', '7-3.png',
      '8-1.png', '8-2.png', '8-3.png', '9-1.png', '9-2.png', '9-3.png',
      'A.png', 'B.png', 'C.png', 'D.png', 'E.png', 'F.png', 'G.png', 'H.png', 'I.png'
    ];

    const allSubCells = document.querySelectorAll('#main-menu-screen .menu-sub-cell');

    allSubCells.forEach(cell => {
      if (cell.innerHTML.trim() === '') {
        const randomImage = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        const img = document.createElement('img');
        img.src = `/public/images/hwatu/${randomImage}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = '0.3'; // Make images subtle
        img.style.borderRadius = '4px';
        cell.appendChild(img);
      }
    });
  }

  setupDifficultyBlock();
  setupThemeBlock();
  setupSettingsBlock();
  setupInfoBlock();
  setupStartBlock();
  setupExitBlock();
  setupRecordsBlock();
  setupGuideBlock();
  setupLogoBlock();
  fillEmptyMenuCells(); // Call the new function
}
