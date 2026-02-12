// src/js/events/modalEvents.js

import {
  showHighScoreModal,
  hideHighScoreModal,
  updateRankModal,
  showRankModal,
  hideRankModal,
  showJokboRulesModal,
  hideJokboRulesModal,
  showTopicListModal,
  hideTopicListModal,
  displayPassagesForTopic,
  renderPaginatedPassages,
  showSavedPassagesListModal,
  hideSavedPassagesListModal,
  renderPaginatedSavedPassages,
} from '../ui.js';
import {
  jokboData,
  getRankImage,
  getRankRanges,
} from '../hanafuda.js';
import {
  gameState,
} from '../state.js';

// Helper functions (remain local or moved if shared)
function showInfoModal(infoModal) {
  infoModal.classList.remove('hidden');
}

function hideInfoModal(infoModal) {
  infoModal.classList.add('hidden');
}

export function initializeModalEventListeners(elements) {
  const {
    jokboRulesModal, jokboRulesCloseBtn, rankModal, rankCloseBtn, helpModal, helpCloseBtn,
    completionModal, completionCloseBtn, highScoreModal, highScoreCloseBtn, infoModal, infoCloseBtn,
    topicListModal, topicListCloseBtn, topicListUl, passageDisplayArea, collectionModal, collectionCloseBtn,
    collectionListContainer, collectionContentEl, // Added collectionContentEl here
  } = elements;

  // Jokbo Rules Modal
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

  // Rank Modal
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

  // Help Modal
  if (helpCloseBtn) {
    helpCloseBtn.addEventListener('click', () =>
      helpModal.classList.add('hidden')
    );
  }

  // Completion Modal
  if (completionCloseBtn) {
    completionCloseBtn.addEventListener('click', () =>
      completionModal.classList.add('hidden')
    );
  }

  // High Score Modal
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

  // Info Modal
  if (infoCloseBtn) {
    infoCloseBtn.addEventListener('click', () => hideInfoModal(infoModal));
  }
  if (infoModal) {
    infoModal.addEventListener('click', (event) => {
      if (event.target === infoModal) {
        hideInfoModal(infoModal);
      }
    });
  }

  // Collection Modal
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

  // Topic List Modal
  if (topicListCloseBtn) {
    topicListCloseBtn.addEventListener('click', () => {
      hideTopicListModal();
    });
  }
  if (topicListModal) {
    topicListModal.addEventListener('click', (event) => {
      if (event.target === topicListModal) {
        hideTopicListModal();
      }
    });
  }

  // Topic List items click listener
  if (topicListUl) {
    topicListUl.addEventListener('click', (e) => {
      const clickedTopicItem = e.target.closest('li[data-topic-value]');
      if (clickedTopicItem) {
        const topicValue = clickedTopicItem.dataset.topicValue;

        topicListUl.querySelectorAll('li').forEach(item => {
          item.classList.remove('selected');
        });
        clickedTopicItem.classList.add('selected');

        displayPassagesForTopic(topicValue);

        if (gameState.isSoundEnabled) {
          document.getElementById('click-sound').play();
        }
      }
    });
  }

  // Pagination controls click listener for topic list
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

  // Collection Modal Pagination Controls click listener
  if (collectionModal) {
    collectionModal.addEventListener('click', (e) => {
      const target = e.target;

      if (target.id === 'collection-pagination-prev') {
        if (gameState.collectionCurrentPage > 1) {
          gameState.collectionCurrentPage--;
          renderPaginatedSavedPassages(collectionContentEl);
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        }
      } else if (target.id === 'collection-pagination-next') {
        const totalPages = Math.ceil(gameState.currentViewedCollectionPassages.length / gameState.collectionPassagesPerPage);
        if (gameState.collectionCurrentPage < totalPages) {
          gameState.collectionCurrentPage++;
          renderPaginatedSavedPassages(collectionContentEl);
          if (gameState.isSoundEnabled) {
            document.getElementById('click-sound').play();
          }
        }
      }
    });
  }
}

export function handleEscapeKeyModals(elements) { // Accepts elements now
  const {
    event, topicListModal, collectionModal, rankModal, jokboRulesModal,
    completionModal, highScoreModal, helpModal, infoModal
  } = elements;

  if (event.key === 'Escape') {
    if (topicListModal && !topicListModal.classList.contains('hidden')) {
      hideTopicListModal();
    } else if (collectionModal && !collectionModal.classList.contains('hidden')) {
      hideSavedPassagesListModal();
    } else if (rankModal && !rankModal.classList.contains('hidden')) {
      hideRankModal();
    } else if (jokboRulesModal && !jokboRulesModal.classList.contains('hidden')) {
      hideJokboRulesModal();
    } else if (completionModal && !completionModal.classList.contains('hidden')) {
      completionModal.classList.add('hidden');
    } else if (highScoreModal && !highScoreModal.classList.contains('hidden')) {
      hideHighScoreModal();
    } else if (helpModal && !helpModal.classList.contains('hidden')) {
      helpModal.classList.add('hidden');
    } else if (infoModal && !infoModal.classList.contains('hidden')) {
      hideInfoModal(infoModal);
    }
  }
}