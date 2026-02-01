/**
 * @file App entry point
 * - This file is the single entry point for the entire application.
 * - It imports the event listener setup and runs it once the DOM is ready.
 */

import { initializeEventListeners } from './events.js';
import { initGame } from './game-flow.js'; // Import initGame

// When the DOM is fully loaded, initialize all event listeners.
// This kicks off the entire application.
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initGame(); // Call initGame here
});