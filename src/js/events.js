// src/js/events.js

/**
 * @file UI 이벤트 리스너 및 핸들러를 관리하는 파일
 */

import {
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
  showJokboRulesModal, // Added for new jokbo modal
  hideJokboRulesModal, // Added for new jokbo modal
  setPassageVisibility, // Added
  showTopicListModal, // Import showTopicListModal
  hideTopicListModal, // Import showTopicListModal
  displayPassagesForTopic, // Import displayPassagesForTopic
  renderPaginatedPassages, // Import renderPaginatedPassages
  showSavedPassagesListModal, // Import showSavedPassagesListModal
  hideSavedPassagesListModal, // Import hideSavedPassagesListModal
  renderPaginatedSavedPassages, // Import renderPaginatedSavedPassages
  THEME_OPTIONS_UI, // Import THEME_OPTIONS_UI
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

// 각 주제별 최대 글귀 수 (100% 달성 기준)
const MAX_PASSAGES_PER_TOPIC = 360;

export function initializeEventListeners() {
  const sudokuBoard = document.getElementById('sudoku-board');
  const retryGameBtn = document.getElementById('retry-game-btn');
  const mainMenuBtn = document.getElementById('main-menu-btn');
  // const difficultyButtons = document.querySelectorAll( // Removed
  //   '#main-controls button[data-difficulty]'
  // );
  // const jokboBtn = document.getElementById('jokbo-btn'); // Removed


  const jokboRulesModal = document.getElementById('jokbo-rules-modal'); // New Jokbo Rules Modal
  const jokboRulesCloseBtn = document.getElementById('jokbo-rules-close-btn'); // New Jokbo Rules Close Button

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
  const topicListModal = document.getElementById('topic-list-modal'); // Get the new modal
  const topicListCloseBtn = document.getElementById('topic-list-close-btn'); // Get the new close button
  const topicListUl = document.getElementById('topic-list'); // Get the topic list ul
  const passageDisplayArea = document.getElementById('passage-display-area'); // Get the passage display area
  const collectionModal = document.getElementById('collection-modal'); // New: Collection Modal
  const collectionCloseBtn = document.getElementById('collection-close-btn'); // New: Collection Close Button
  const collectionListContainer = document.getElementById('collection-list-container'); // New: Collection List Container
  

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
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    const cellNumber = gameState.board[row][col];
    const isHighlighted = cell.classList.contains('highlight-guide-glow');

    // 현재 활성화된 셀을 다시 클릭했고, 미니 팔레트가 열려있는 경우
    const isCurrentActiveCell = gameState.activeCell.row === row && gameState.activeCell.col === col;
    const isMiniPaletteVisible = !miniPalette.classList.contains('hidden'); // 'hidden' 클래스로 미니 팔레트의 가시성 판단

    if (isCurrentActiveCell && isMiniPaletteVisible) {
        hideMiniPalette();
        clearActiveCellSelection();
        return; // 팔레트를 닫고 함수 종료
    }

    // 1. 하이라이트 해제: 이미 하이라이트된 셀을 다시 클릭하면 모든 하이라이트를 끄고 종료.
    if (isHighlighted) {
      clearAllHighlights();
      clearActiveCellSelection();
      hideMiniPalette();
      return;
    }
    
    // 이전에 선택된 셀이나 하이라이트가 있었다면 모두 초기화.
    clearAllHighlights();
    clearActiveCellSelection();
    hideMiniPalette();

    // 2. 새로운 동작: 숫자가 있는 셀인가, 비어있는 셀인가?
    if (cellNumber !== 0) {
      // 숫자가 있는 셀: 하이라이트 활성화
      highlightGuideCells(row, col, cellNumber);
    } else {
      // 비어있는 셀: 미니 팔레트 표시
      selectNewCell(cell, row, col);
    }
  }

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


  if (jokboRulesCloseBtn) {
    jokboRulesCloseBtn.addEventListener('click', () => {
      hideJokboRulesModal();
    });
  }
  if (jokboRulesModal) {
    jokboRulesModal.addEventListener('click', (event) => {
      if (event.target === jokboRulesModal) {
        hideJokboRulesModal();
      }
      event.stopPropagation();
    });
  }

  if (jokboRulesCloseBtn) {
    jokboRulesCloseBtn.addEventListener('click', () => {
      hideJokboRulesModal();
    });
  }
  if (jokboRulesModal) {
    jokboRulesModal.addEventListener('click', (event) => {
      if (event.target === jokboRulesModal) {
        hideJokboRulesModal();
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

  // --- New Collection Modal Event Listeners ---
  if (collectionCloseBtn) {
    collectionCloseBtn.addEventListener('click', () => {
      hideSavedPassagesListModal();
    });
  }

  if (collectionModal) {
    collectionModal.addEventListener('click', (event) => {
      if (event.target === collectionModal) {
        hideSavedPassagesListModal();
      }
    });
  }

  // --- New Topic List Modal Event Listeners ---
  if (topicListCloseBtn) {
    topicListCloseBtn.addEventListener('click', () => {
      hideTopicListModal();
    });
  }

  if (topicListModal) {
    topicListModal.addEventListener('click', (event) => {
      if (event.target === topicListModal) { // Close if click is on the overlay
        hideTopicListModal();
      }
    });
  }

  // Global Escape key listener for modals (NEW)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!topicListModal.classList.contains('hidden')) {
        hideTopicListModal();
      } else if (!collectionModal.classList.contains('hidden')) { // New: Check collectionModal
        hideSavedPassagesListModal();
      } else if (!rankModal.classList.contains('hidden')) { // Check other modals to close them first
        hideRankModal();
      } else if (!jokboRulesModal.classList.contains('hidden')) {
        hideJokboRulesModal();
      } else if (!completionModal.classList.contains('hidden')) {
        completionModal.classList.add('hidden'); // Assuming it has a hidden class
      } else if (!highScoreModal.classList.contains('hidden')) {
        hideHighScoreModal();
      } else if (!helpModal.classList.contains('hidden')) {
        helpModal.classList.add('hidden'); // Assuming it has a hidden class
      } else if (!infoModal.classList.contains('hidden')) {
        hideInfoModal();
      }
    }
  });

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

    // New: Handle direct clicks on topic sub-cells (formerly theme)
    const topicCell = e.target.closest('[data-topic-value]');
    if (topicCell) {
      const topicValue = topicCell.dataset.topicValue;
      gameState.selectedPassageTopic = topicValue; // gameState.selectedPassageTopic에 저장
      updateTopicSelection(); // updateTopicSelection 호출
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      return; // Stop further execution
    }

    // New: Handle direct clicks on settings sub-cells
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
      } else if (action === 'exit_game') { // New: Handle '종료'
        alert(
          '게임을 종료합니다. (실제 앱에서는 앱이 종료되거나 백그라운드로 이동합니다.)'
        );
        if (gameState.isSoundEnabled) {
          document.getElementById('click-sound').play(); // Add click sound
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
        showJokboRulesModal(jokboData); // Call the new modal function
      } else if (action === 'show_records') { // New: Handle '기록'
        showHighScoreModal(
          JSON.parse(localStorage.getItem('hanafuda-sudoku-scores') || '[]')
        );
      } else if (action === 'show_guide') { // New: Handle '안내'
        helpModal.classList.remove('hidden');
      }
      return;
    }

    // New: Handle direct clicks on achievement sub-cell (기존 로직 제거 - setupAchievementBlock에서 개별 처리)
    // const achievementCell = e.target.closest('[data-menu-id="achievement"]');
    // if (achievementCell) {
    //   if (gameState.isSoundEnabled) {
    //     document.getElementById('click-sound').play();
    //   }
    //   showTopicListModal(); // Open the topic list modal
    //   return;
    // }


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

  // Topic List items click listener
  if (topicListUl) {
    topicListUl.addEventListener('click', (e) => {
      const clickedTopicItem = e.target.closest('li[data-topic-value]');
      if (clickedTopicItem) {
        const topicValue = clickedTopicItem.dataset.topicValue;

        // Update selected state in UI
        topicListUl.querySelectorAll('li').forEach(item => {
          item.classList.remove('selected');
        });
        clickedTopicItem.classList.add('selected');

        // Display passages for the selected topic
        displayPassagesForTopic(topicValue);

        if (gameState.isSoundEnabled) {
          document.getElementById('click-sound').play();
        }
      }
    });
  }
  
  // Pagination controls click listener
  if (passageDisplayArea) {
    passageDisplayArea.addEventListener('click', (e) => {
      const target = e.target;
      if (target.id === 'pagination-prev') {
        if (gameState.currentPage > 1) {
          gameState.currentPage--;
          renderPaginatedPassages();
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        }
      } else if (target.id === 'pagination-next') {
        const totalPages = Math.ceil(gameState.currentViewedPassages.length / gameState.passagesPerPage);
        if (gameState.currentPage < totalPages) {
          gameState.currentPage++;
          renderPaginatedPassages();
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        }
      }
    });
  }

  // New: Collection Modal Pagination Controls click listener
  if (collectionModal) { // 이벤트 위임 대상을 collectionModal로 변경
    collectionModal.addEventListener('click', (e) => {
      const target = e.target;
      if (target.id === 'collection-pagination-prev') {
        if (gameState.collectionCurrentPage > 1) {
          gameState.collectionCurrentPage--;
          renderPaginatedSavedPassages(gameState.currentViewedCollectionPassages); // 인자 전달
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        }
      } else if (target.id === 'collection-pagination-next') {
        const totalPages = Math.ceil(gameState.currentViewedCollectionPassages.length / gameState.collectionPassagesPerPage);
        if (gameState.collectionCurrentPage < totalPages) {
          gameState.collectionCurrentPage++;
          renderPaginatedSavedPassages(gameState.currentViewedCollectionPassages); // 인자 전달
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        }
      }
    });
  }


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
    
    // Set the central cell (subCells[4]) as the "단계" button with active styling
    const centerCell = subCells[4];
    if (centerCell) {
      centerCell.textContent = '단계';
      // centerCell.dataset.difficultyLevel = 'main_button'; // Removed as it's not a difficulty level
      centerCell.style.fontSize = '0.8rem';
      centerCell.style.fontWeight = 'bold';
      centerCell.style.color = '#000000'; // Active style text color
      centerCell.style.backgroundColor = '#00ff00'; // Active style background color
      centerCell.style.backgroundImage = 'none'; // Ensure no random image covers it
    }

    const difficultyOptions = [
      { label: '초급', value: 'easy' },
      { label: '중급', value: 'medium' },
      { label: '고급', value: 'hard' },
      { label: '랜덤', value: 'random' },
    ];

    // Place options in their specific cells: 초급(3), 중급(7), 고급(5), 랜덤(1)
    const cellIndices = [3, 7, 5, 1]; 
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

  const TOPIC_OPTIONS = [ // 글귀 주제 목록 (전역 변수로 이동)
    { label: '성찰', value: '1_성찰.json' },
    { label: '관계', value: '2_관계.json' },
    { label: '지혜', value: '3_지혜.json' },
    { label: '용기', value: '4_용기.json' },
    { label: '겸손', value: '5_겸손.json' },
    { label: '중용', value: '6_중용.json' },
    { label: '현재', value: '7_현재.json' },
    { label: '본질', value: '8_본질.json' },
  ];

  function setupTopicBlock() { // 함수명 변경
    const topicBlock = document.querySelector('[data-menu-id="topic"]'); // data-menu-id 변경
    if (!topicBlock) return; // 널 체크 추가

    const subCells = topicBlock.querySelectorAll('.menu-sub-cell');
    

    // 중앙 셀에 '주제' 텍스트 표시 및 클릭 이벤트 추가
    const centerCell = subCells[4];
    if (centerCell) {
        centerCell.textContent = '주제';
        centerCell.style.fontSize = '0.8rem'; // 폰트 크기 0.8rem으로 수정
        centerCell.style.fontWeight = 'bold';
        centerCell.style.color = '#000000'; // 활성화된 셀처럼 검은색 글자
        centerCell.style.backgroundColor = '#00ff00'; // 활성화된 셀처럼 녹색 배경
        centerCell.style.backgroundImage = 'none';

        // 중앙 '주제' 셀 클릭 이벤트 리스너 추가
        centerCell.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * TOPIC_OPTIONS.length); // TOPIC_OPTIONS 사용
            const randomTopic = TOPIC_OPTIONS[randomIndex].value;
            gameState.selectedPassageTopic = randomTopic; // 랜덤 주제 설정
            updateTopicSelection(); // UI 업데이트
            if (gameState.isSoundEnabled) {
                document.getElementById('click-sound').play();
            }
        });
    }

    // 주변 8개 셀에 주제 라벨과 data-topic-value 설정
    const cellIndices = [0, 1, 2, 3, 5, 6, 7, 8]; // 주변 8개 셀 인덱스
    TOPIC_OPTIONS.forEach((option, index) => {
      const cell = subCells[cellIndices[index]];
      if (cell) {
        cell.textContent = option.label;
        cell.dataset.topicValue = option.value; // data-topic-value 설정
        cell.style.fontSize = '0.75rem'; // 폰트 크기 조정
        cell.style.color = '#00ff00';
        cell.style.backgroundImage = 'none';
      }
    });

    updateTopicSelection(); // 초기 선택 상태 업데이트
  }

  function updateTopicSelection() { // 함수명 변경
    const topicBlock = document.querySelector('[data-menu-id="topic"]'); // data-menu-id 변경
    if (!topicBlock) return;

    const subCells = topicBlock.querySelectorAll('.menu-sub-cell');
    subCells.forEach(cell => {
      if (cell.dataset.topicValue) { // data-topic-value 속성 확인
        if (cell.dataset.topicValue === gameState.selectedPassageTopic) { // gameState.selectedPassageTopic 사용
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
      { label: '소리', action: 'toggle_sound', index: 3 }, // Mid-left
      { label: '지움', action: 'reset_data', index: 5 }, // Mid-right
      { label: '종료', action: 'exit_game', index: 7 }, // Bottom-center (8th cell)
      { label: '셋팅', action: 'show_settings_main', index: 4, isMain: true }, // Center, main button for block
    ];

    settingsOptions.forEach((option) => {
      const cell = subCells[option.index];
      if (cell) {
        cell.textContent = option.label;
        cell.dataset.settingAction = option.action;
        cell.style.fontSize = '0.8rem';
        cell.style.backgroundImage = 'none';

        if (option.isMain) { // Main '셋팅' button in the center
          cell.style.color = '#000000'; // Black text for active main button
          cell.style.backgroundColor = '#00ff00'; // Green background for active main button
          cell.style.fontWeight = 'bold';
          cell.classList.add('no-image-fill'); // Prevent image fill for main button
        } else { // Other options (소리, 지움, 종료)
          cell.style.color = '#00ff00'; // Green text for inactive options
          cell.style.backgroundColor = 'transparent'; // Transparent background for inactive options
        }

        // Apply specific styling for '소리' initial state, needs to be done after base styling
        if (option.action === 'toggle_sound') {
          updateSoundToggleCell(); // Set initial state for sound
        }
      }
    });
  }

  function setupInfoBlock() {
    const infoBlock = document.querySelector('[data-menu-id="info"]');
    const subCells = infoBlock.querySelectorAll('.menu-sub-cell');

    const consolidatedOptions = [
      { label: '기록', action: 'show_records', index: 1 }, // Top-center
      { label: '안내', action: 'show_guide', index: 3 }, // Mid-left
      { label: '정보', action: 'show_info', index: 4, isMain: true }, // Center, main button for block
      { label: '랭크', action: 'show_ranking', index: 5 }, // Mid-right
      { label: '족보', action: 'show_jokbo', index: 7 }, // Bottom-center
    ];

    consolidatedOptions.forEach((option) => {
      const cell = subCells[option.index];
      if (cell) {
        cell.textContent = option.label;
        cell.dataset.infoAction = option.action;
        cell.style.fontSize = '0.8rem';
        cell.style.backgroundImage = 'none';

        if (option.isMain) { // Main '정보' button in the center
          cell.style.color = '#000000'; // Black text for active main button
          cell.style.backgroundColor = '#00ff00'; // Green background for active main button
          cell.style.fontWeight = 'bold';
        } else { // Other options (기록, 안내, 랭크, 족보)
          cell.style.color = '#00ff00'; // Green text for inactive options
          cell.style.backgroundColor = 'transparent'; // Transparent background for inactive options
        }
      }
    });

    // Clear any remaining default image for the center cell if it's main and fillEmptyMenuCells would override
    const mainInfoCell = subCells[4];
    if (mainInfoCell && mainInfoCell.dataset.infoAction === 'show_info') {
      mainInfoCell.classList.add('no-image-fill'); // Add a class to prevent fillEmptyMenuCells from adding image
    }
  }

  function setupStartBlock() {
    const startBlock = document.querySelector('[data-menu-id="start"]');
    const subCells = startBlock.querySelectorAll('.menu-sub-cell');

    const cell = subCells[4]; // Center cell
    if (cell) {
      cell.textContent = '시작';
      cell.dataset.startAction = 'start_game';
      cell.style.fontSize = '0.8rem';
      cell.style.fontWeight = 'bold';
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

  function setupAchievementBlock() {
    const achievementBlock = document.querySelector('[data-menu-id="achievement"]');
    if (!achievementBlock) return;

    const subCells = achievementBlock.querySelectorAll('.menu-sub-cell');
    const centerCell = subCells[4]; // Center cell
    if (centerCell) {
      centerCell.textContent = '달성';
      centerCell.style.fontSize = '0.8rem';
      centerCell.style.fontWeight = 'bold';
      centerCell.style.color = '#000000'; // Black text for contrast
      centerCell.style.backgroundColor = '#00ff00'; // Green background for active main button
      centerCell.style.backgroundImage = 'none'; // Ensure no random image covers it
      centerCell.classList.add('no-image-fill'); // Prevent fillEmptyMenuCells from adding image

      centerCell.addEventListener('click', () => {
        showTopicListModal(); // 중앙 '달성' 버튼 클릭 시 주제 리스트 모달 표시
        if (gameState.isSoundEnabled) {
          document.getElementById('click-sound').play();
        }
      });
    }

    // 로컬 스토리지에서 저장된 글귀 목록 불러오기 (한 번만)
    const savedPassagesJSON = localStorage.getItem('completedPassages');
    const savedPassages = savedPassagesJSON ? JSON.parse(savedPassagesJSON) : [];

    // 주변 8개 셀에 주제 버튼 배치
    const surroundingCellIndices = [0, 1, 2, 3, 5, 6, 7, 8];
    THEME_OPTIONS_UI.forEach((option, index) => {
      const cellIndex = surroundingCellIndices[index];
      const cell = subCells[cellIndex];
      if (cell) {
        cell.textContent = option.label;
        cell.dataset.topicLabel = option.label; // 저장된 글귀 필터링을 위해 주제 라벨 저장
        cell.style.fontSize = '0.8rem';
        cell.style.fontWeight = 'normal'; // Changed to normal
        cell.style.color = '#00ff00';
        cell.style.backgroundImage = 'none';
        cell.classList.add('no-image-fill'); // 이미지 채우기 방지

        // --- 진행률 계산 및 배경 채우기 로직 ---
        const topicPassages = savedPassages.filter(p => p.topic === option.label);
        const currentCount = topicPassages.length;
        const percentage = Math.min(100, Math.round((currentCount / MAX_PASSAGES_PER_TOPIC) * 100)); // 100% 초과 방지
        
        // 배경색을 %에 따라 채웁니다. (아래에서 위로 채워지는 방식)
        if (percentage > 0) {
          cell.style.background = `linear-gradient(to top, rgba(0, 255, 0, 0.5) ${percentage}%, transparent ${percentage}%)`;
          cell.style.backgroundSize = 'cover'; // 배경이 잘 채워지도록
          cell.style.backgroundRepeat = 'no-repeat';
        } else {
          cell.style.background = 'transparent'; // 저장된 글귀가 없으면 투명
        }
        // 테두리는 제거

        // 이벤트 리스너 추가
        cell.addEventListener('click', () => {
          showSavedPassagesListModal(option.label); // 해당 주제의 저장된 글귀 목록 모달 표시
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        });
      }
    });
  }

  function setupLogoBlock() {
    const logoBlock = document.querySelector('[data-menu-id="logo"]');
    const subCells = logoBlock.querySelectorAll('.menu-sub-cell');

    const cellContent = [
      { text: '', style: '' }, // Index 0 (empty)
      { text: '수', style: 'font-weight: bold; color: #00ff00;' }, // Index 1
      { text: '', style: '' }, // Index 2 (empty)
      { text: '화', style: 'font-weight: bold; color: #00ff00;' }, // Index 3
      { text: '도', style: 'font-weight: bold; color: #000000; background-color: #00ff00;' }, // Index 4 (active style)
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
        cell.style.backgroundImage = 'none'; // Explicitly remove default background image
        cell.style.display = 'flex'; // Ensure flex for centering text
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontSize = '1.5rem'; // Consistent font size
        // Add no-image-fill for cells with text to prevent fillEmptyMenuCells from overwriting
        cell.classList.add('no-image-fill');
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
      // Skip cells that are already configured with text or have a specific class to prevent image fill
      if (cell.innerHTML.trim() === '' && !cell.classList.contains('no-image-fill')) {
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
  setupTopicBlock(); // setupThemeBlock -> setupTopicBlock
  setupSettingsBlock();
  setupInfoBlock();  
  setupStartBlock();
  setupAchievementBlock();
  setupLogoBlock();
  fillEmptyMenuCells(); // Call the new function
}