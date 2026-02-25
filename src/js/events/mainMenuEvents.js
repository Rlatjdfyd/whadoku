// src/js/events/mainMenuEvents.js

import {
  setPassageVisibility,
  THEME_OPTIONS_UI,
  updateRankModal, // Added
  showRankModal,   // Added
  hideRankModal,   // Added
  showJokboRulesModal, // Added
  hideJokboRulesModal, // Added
  showHighScoreModal, // Added
  hideHighScoreModal, // Added
  showTopicListModal, // Added
  hideTopicListModal, // Added
  showSavedPassagesListModal, // Added
  hideSavedPassagesListModal, // Added
} from '../ui.js';
import {
  gameState,
  getSoundEnabledState,
  toggleSound,
  saveJourneyProgress,
} from '../state.js';
import {
  enterStageMode, // Used for the Start button
  startNewGame,
} from '../game-flow.js';
import {
  jokboData, // Added
  getRankImage, // Added
  getRankRanges, // Added
} from '../hanafuda.js';


// 각 주제별 최대 글귀 수 (100% 달성 기준)
const MAX_PASSAGES_PER_TOPIC = 360;

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

const unlockRequirements = {
  medium: 81, // 'easy' 여정 81단계 완료 시 'medium' 해제
  hard: 41,   // 'medium' 여정 81단계 완료 시 'hard' 해제
  random: 11, // 'hard' 여정 81단계 완료 시 'random' 해제
};

// UI Helper Functions (Moved here to ensure they are defined before usage by setup functions)
function updateDifficultySelection() {
  const difficultyBlock = document.querySelector('[data-menu-id="difficulty"]');
  const subCells = difficultyBlock.querySelectorAll('.menu-sub-cell');
  subCells.forEach(cell => {
    if (cell.dataset.difficultyLevel) {
      cell.classList.remove('difficulty-selected', 'difficulty-unselected'); // Remove existing state classes

      // 잠긴 레벨은 선택 스타일을 적용하지 않음 (locked 클래스는 updateDifficultyBlockUI에서 관리)
      if (cell.classList.contains('locked')) {
        // 잠긴 상태는 그대로 유지 (회색)
        return;
      }

      if (cell.dataset.difficultyLevel === gameState.difficulty) {
        cell.classList.add('difficulty-selected'); // 'selected' class for styling
      } else {
        cell.classList.add('difficulty-unselected');
      }
    }
  });
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
    centerCell.style.backgroundColor = '#ff9900'; // Active style background color
    centerCell.style.backgroundImage = 'none'; // Ensure no random image covers it

    // 중앙 '단계' 셀 클릭 이벤트 리스너 추가 (난이도 초기화)
    centerCell.addEventListener('click', () => {
        gameState.difficulty = 'easy'; // 난이도 초기화 (기본값)
        updateDifficultySelection(); // UI 업데이트
        saveJourneyProgress(); // 저장
        if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
        }
    });
  }
  updateDifficultyBlockUI(); // Call the new function to set up the surrounding difficulty cells
}

export function updateDifficultyBlockUI() {
  const difficultyBlock = document.querySelector('[data-menu-id="difficulty"]');
  const subCells = difficultyBlock.querySelectorAll('.menu-sub-cell');

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
      
      // Clear all existing difficulty state classes first
      cell.classList.remove('locked', 'difficulty-locked', 'difficulty-selected', 'difficulty-unselected');

      let isLocked = false;
      if (option.value === 'medium' && gameState.journeyProgress.easy <= unlockRequirements.medium) {
        isLocked = true;
      } else if (option.value === 'hard' && gameState.journeyProgress.medium <= unlockRequirements.hard) {
        isLocked = true;
      } else if (option.value === 'random' && gameState.journeyProgress.hard <= unlockRequirements.random) {
        isLocked = true;
      }

      if (isLocked) {
        cell.classList.add('locked', 'difficulty-locked'); // Add generic 'locked' and specific 'difficulty-locked'
      } else {
        // If not locked, check if it's the currently selected difficulty
        if (option.value === gameState.difficulty) {
          cell.classList.add('difficulty-selected');
        } else {
          cell.classList.add('difficulty-unselected');
        }
      }
    }
  });
}

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
      centerCell.style.backgroundColor = '#ff9900'; // 활성화된 셀처럼 녹색 배경
      centerCell.style.backgroundImage = 'none';

      // 중앙 '주제' 셀 클릭 이벤트 리스너 추가
      centerCell.addEventListener('click', () => {
          gameState.selectedPassageTopic = null; // 주제 선택 초기화
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
    }
  });

  updateTopicSelection(); // 초기 선택 상태 업데이트
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
        cell.style.backgroundColor = '#ff9900'; // Green background for active main button
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

function setupInfoBlock(elements) { // elements parameter added
  const { helpModal, infoModal, highScoreModal, jokboRulesModal, rankModal } = elements; // Destructure elements

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
        cell.style.backgroundColor = '#ff9900'; // Green background for active main button
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
    cell.style.backgroundColor = '#ff9900'; // Add background color
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
    centerCell.style.backgroundColor = '#ff9900'; // Green background for active main button
    centerCell.style.backgroundImage = 'none'; // Ensure no random image covers it
    centerCell.classList.add('no-image-fill'); // 이미지 채우기 방지


  }

  // 로컬 스토리지에서 저장된 글귀 목록 불러오기 (한 번만)
  const savedPassagesJSON = localStorage.getItem('completedPassages');
  const savedPassages = savedPassagesJSON ? JSON.parse(savedPassagesJSON) : [];

  // 주변 8개 셀에 주제 버튼 배치
  const surroundingCellIndices = [0, 1, 2, 3, 5, 6, 7, 8];
  THEME_OPTIONS_UI.forEach((option, index) => {
    const cell = subCells[surroundingCellIndices[index]]; // Fixed here
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
    { text: '도', style: 'font-weight: bold; color: #000000; background-color: #ff9900;' }, // Index 4 (active style)
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
      img.objectFit = 'cover';
      img.style.opacity = '0.3'; // Make images subtle
      img.style.borderRadius = '4px';

      // 셀의 배경에 card_back_patten4.png 패턴 적용
      cell.style.backgroundImage = 'url("public/images/btn/card_back_patten4.png")';
      cell.style.backgroundSize = '5px 5px';
      cell.style.backgroundRepeat = 'repeat';
      cell.appendChild(img);
    }
  });
}

export function initializeMainMenuEventListeners(elements) {
  const {
    mainMenuScreen, sudokuBoard, scoreDisplay, hintContainer, mainMenuBtn, setupContainer,
    jokboRulesModal, jokboRulesCloseBtn, rankModal, rankCloseBtn, helpModal, helpCloseBtn,
    completionModal, completionCloseBtn, highScoreModal, highScoreCloseBtn, infoModal, infoCloseBtn,
    topicListModal, topicListCloseBtn, topicListUl, passageDisplayArea, collectionModal, collectionCloseBtn,
    collectionListContainer, collectionContentEl, // Added collectionContentEl here
  } = elements;

  // --- Main Menu Event Listeners ---
  mainMenuScreen.addEventListener('click', (e) => {
    const difficultyCell = e.target.closest('[data-difficulty-level]');
    if (difficultyCell) {
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }

      const level = difficultyCell.dataset.difficultyLevel;
      const progress = gameState.journeyProgress;

      // Check if the difficulty is locked before allowing selection
      let isLocked = false;
      let alertMessage = '';

      if (level === 'medium' && progress.easy <= unlockRequirements.medium) {
        isLocked = true;
        alertMessage = `초급 ${unlockRequirements.medium} 스테이지를 모두 완료해야 열립니다.`;
      } else if (level === 'hard' && progress.medium <= unlockRequirements.hard) {
        isLocked = true;
        alertMessage = `중급 ${unlockRequirements.hard} 스테이지를 모두 완료해야 열립니다.`;
      } else if (level === 'random' && progress.hard <= unlockRequirements.random) {
        isLocked = true;
        alertMessage = `고급 ${unlockRequirements.random} 스테이지를 모두 완료해야 랜덤이 열립니다.`;
      }

      if (isLocked) {
        alert(alertMessage);
      } else {
        gameState.difficulty = level; // Only set difficulty, do not start game
        updateDifficultySelection();
        saveJourneyProgress(); // Save the newly selected difficulty
      }
      return;
    }

    const topicCell = e.target.closest('[data-topic-value]');
    if (topicCell) {
      const topicValue = topicCell.dataset.topicValue;
      gameState.selectedPassageTopic = topicValue;
      updateTopicSelection();
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      return;
    }

    const settingCell = e.target.closest('[data-setting-action]');
    if (settingCell) {
      const action = settingCell.dataset.settingAction;
      if (action === 'toggle_sound') {
        toggleSound();
        updateSoundToggleCell();
        if (gameState.isSoundEnabled) {
          document.getElementById('click-sound').play();
        }
      } else if (action === 'reset_data') {
        if (confirm('모든 게임 데이터(점수, 진행 상황)를 초기화하시겠습니까?')) {
          localStorage.clear();
          alert('모든 데이터가 초기화되었습니다. 게임을 다시 시작합니다.');
          location.reload();
        }
      } else if (action === 'exit_game') {
        if (confirm('게임을 종료하고 제작자의 블로그를 방문하시겠습니까?\n(모바일 앱은 홈 화면으로 나가서 종료해 주세요!)')) {
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
          window.location.href = 'https://blog.naver.com/lnogardl';
        }
      }
      return;
    }

    const infoCell = e.target.closest('[data-info-action]');
    if (infoCell) {
      const action = infoCell.dataset.infoAction;
      if (gameState.isSoundEnabled) {
        document.getElementById('click-sound').play();
      }
      if (action === 'show_ranking') {
        updateRankModal(getRankRanges(), getRankImage);
        showRankModal();
      } else if (action === 'show_info') {
        infoModal.classList.remove('hidden'); // Directly access infoModal
      } else if (action === 'show_jokbo') {
        showJokboRulesModal(jokboData);
      } else if (action === 'show_records') {
        showHighScoreModal(
          JSON.parse(localStorage.getItem('hanafuda-sudoku-scores') || '[]')
        );
      } else if (action === 'show_guide') {
        helpModal.classList.remove('hidden'); // Directly access helpModal
      }
      return;
    }

    const startCell = e.target.closest('[data-start-action]');
    if (startCell) {
      if (gameState.isSoundEnabled) {
        document.getElementById('f5-sound').play();
      }
      // Start button now leads to the stage map for the CURRENTLY SELECTED difficulty
      enterStageMode(gameState.difficulty); 
      return;
    }
  });

  // Main Menu Block-Specific Setup ---

  setupDifficultyBlock();
  updateDifficultyBlockUI(); // Call the new UI update function
  setupTopicBlock(); // setupThemeBlock -> setupTopicBlock
  setupSettingsBlock();
  setupInfoBlock(elements); // Pass elements to setupInfoBlock
  setupStartBlock();
  setupAchievementBlock();
  setupLogoBlock();
  fillEmptyMenuCells(); // Call the new function
}