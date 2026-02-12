// src/js/events/index.js

/**
 * @file UI 이벤트 리스너 및 핸들러를 관리하는 파일
 */

import { initializeModalEventListeners, handleEscapeKeyModals } from './modalEvents.js';
import { initializeGameEventListeners } from './gameEvents.js';
import { initializeMainMenuEventListeners } from './mainMenuEvents.js';

export function initializeEventListeners() {
  // Common elements that might be needed across modules or as central orchestrators
  const mainMenuScreen = document.getElementById('main-menu-screen');
  const sudokuBoard = document.getElementById('sudoku-board');
  const scoreDisplay = document.getElementById('score-display');
  const hintContainer = document.getElementById('hint-container');
  const mainMenuBtn = document.getElementById('main-menu-btn');
  const setupContainer = document.getElementById('setup-container');

  // Modals - All modals and their close buttons
  const jokboRulesModal = document.getElementById('jokbo-rules-modal');
  const jokboRulesCloseBtn = document.getElementById('jokbo-rules-close-btn');
  const rankModal = document.getElementById('rank-modal');
  const rankCloseBtn = document.getElementById('rank-close-btn');
  const helpModal = document.getElementById('help-modal');
  const helpCloseBtn = document.getElementById('help-close-btn');
  const completionModal = document.getElementById('completion-modal');
  const completionCloseBtn = document.getElementById('completion-close-btn');
  const highScoreModal = document.getElementById('high-score-modal');
  const highScoreCloseBtn = document.getElementById('high-score-close-btn');
  const infoModal = document.getElementById('info-modal');
  const infoCloseBtn = document.getElementById('info-close-btn');
  const topicListModal = document.getElementById('topic-list-modal');
  const topicListCloseBtn = document.getElementById('topic-list-close-btn');
  const topicListUl = document.getElementById('topic-list');
  const passageDisplayArea = document.getElementById('passage-display-area');
  const collectionModal = document.getElementById('collection-modal');
  const collectionCloseBtn = document.getElementById('collection-close-btn');
  const collectionListContainer = document.getElementById('collection-list-container');
  const collectionContentEl = document.getElementById('collection-content');


  // Game elements
  const retryGameBtn = document.getElementById('retry-game-btn');
  const useHintBtn = document.getElementById('use-hint-btn');
  const miniPalette = document.getElementById('mini-palette');



  initializeModalEventListeners({
    jokboRulesModal, jokboRulesCloseBtn, rankModal, rankCloseBtn, helpModal, helpCloseBtn,
    completionModal, completionCloseBtn, highScoreModal, highScoreCloseBtn, infoModal, infoCloseBtn,
    topicListModal, topicListCloseBtn, topicListUl, passageDisplayArea, collectionModal, collectionCloseBtn,
    collectionListContainer, collectionContentEl, retryGameBtn,
  });

  initializeGameEventListeners({
    sudokuBoard, retryGameBtn, useHintBtn, miniPalette, scoreDisplay, hintContainer, mainMenuBtn, mainMenuScreen,
  });

  document.addEventListener('keydown', (event) => {
    handleEscapeKeyModals({
      event,
      topicListModal, collectionModal, rankModal, jokboRulesModal, completionModal, highScoreModal, helpModal, infoModal
    });
  });

  initializeMainMenuEventListeners({
    mainMenuScreen, sudokuBoard, scoreDisplay, hintContainer, mainMenuBtn, setupContainer,
    jokboRulesModal, jokboRulesCloseBtn, rankModal, rankCloseBtn, helpModal, helpCloseBtn,
    completionModal, completionCloseBtn, highScoreModal, highScoreCloseBtn, infoModal, infoCloseBtn,
    topicListModal, topicListCloseBtn, topicListUl, passageDisplayArea, collectionModal, collectionCloseBtn,
    collectionListContainer, collectionContentEl,
  });
}
