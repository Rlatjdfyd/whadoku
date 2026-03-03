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

  // 프로덕션(빌드) 환경에서만 서비스 워커를 등록합니다. (index.html에서 이동)
  if ('serviceWorker' in navigator && !import.meta.env.DEV) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered');
      }).catch((err) => {
        console.log('SW registration failed', err);
      });
    });
  }
});