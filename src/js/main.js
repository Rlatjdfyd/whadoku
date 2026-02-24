/**
 * @file App entry point
 * - This file is the single entry point for the entire application.
 * - It imports the event listener setup and runs it once the DOM is ready.
 */

import { initializeEventListeners } from './events/index.js';
import { initGame } from './game-flow.js'; // Import initGame
import { loadJourneyProgress } from './state.js';

// When the DOM is fully loaded, initialize all event listeners.
// This kicks off the entire application.
document.addEventListener('DOMContentLoaded', () => {
  loadJourneyProgress(); // 여정 모드 진행 상태를 먼저 불러옵니다.
  initializeEventListeners();
  initGame(); // Call initGame here
});