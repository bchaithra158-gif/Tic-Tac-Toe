/* ============================================================
   script.js  —  Tic Tac Toe Game Logic
   ============================================================

   Table of Contents
   -----------------
   1. Constants & State Variables
   2. DOM References
   3. Winning Combinations
   4. Initialise / Reset Board
   5. Handle Cell Click
   6. Update Status Message
   7. Check for a Winner
   8. Check for a Draw
   9. End Game (win or draw)
   10. Highlight Winning Cells
   11. Update Scoreboard
   12. Show / Hide Overlay Modal
   13. Restart Game (keep scores)
   14. Reset Scores
   15. Event Listeners
   ============================================================ */

/* ---- 1. Constants & State Variables ---- */

const PLAYER_X = 'X';    // Player X marker
const PLAYER_O = 'O';    // Player O marker

// gameState holds the current value of each of the 9 cells (null = empty)
let gameState = Array(9).fill(null);

// Which player's turn it currently is
let currentPlayer = PLAYER_X;

// Whether the game is still active (false when won or drawn)
let isGameActive = true;

// Scoreboard counters persisted across rounds
let scores = {
  X: 0,   // Player X wins
  O: 0,   // Player O wins
  draw: 0    // Draw count
};


/* ---- 2. DOM References ---- */

const cells = document.querySelectorAll('.cell');       // All 9 board cells
const statusBox = document.getElementById('status-box');    // Status bar
const statusMessage = document.getElementById('status-message');// Status text
const board = document.getElementById('board');         // Board container
const scoreX = document.getElementById('score-x');       // X score display
const scoreO = document.getElementById('score-o');       // O score display
const scoreDraw = document.getElementById('score-draw');    // Draw score display
const overlay = document.getElementById('overlay');       // Win/Draw modal overlay
const modalTitle = document.getElementById('modal-title');   // Modal heading
const modalSub = document.getElementById('modal-sub');     // Modal sub-text
const modalEmoji = document.getElementById('modal-emoji');   // Modal emoji
const restartBtn = document.getElementById('restart-btn');   // Restart button (below board)
const resetBtn = document.getElementById('reset-btn');     // Reset scores button
const modalRestartBtn = document.getElementById('modal-restart-btn'); // Modal play-again button


/* ---- 3. Winning Combinations ---- */
// Every possible line that earns a win: rows, columns, and diagonals

const WIN_COMBOS = [
  [0, 1, 2],  // Top row
  [3, 4, 5],  // Middle row
  [6, 7, 8],  // Bottom row
  [0, 3, 6],  // Left column
  [1, 4, 7],  // Middle column
  [2, 5, 8],  // Right column
  [0, 4, 8],  // Diagonal top-left → bottom-right
  [2, 4, 6],  // Diagonal top-right → bottom-left
];


/* ---- 4. Initialise / Reset Board ---- */

/**
 * Resets the board to its starting state.
 * Clears the gameState array, re-enables all cells,
 * removes visual classes, and starts with Player X.
 */
function initGame() {
  // Reset logical state
  gameState = Array(9).fill(null);
  currentPlayer = PLAYER_X;
  isGameActive = true;

  // Reset each cell visually
  cells.forEach(cell => {
    cell.textContent = '';           // Remove displayed mark
    cell.innerHTML = '';           // Clear any span wrappers
    cell.classList.remove('x', 'o', 'taken', 'winner');
    cell.removeAttribute('data-preview');
  });

  // Remove game-over class from board
  board.classList.remove('game-over');

  // Hide the overlay
  hideOverlay();

  // Update status message for the first player
  updateStatus();
}


/* ---- 5. Handle Cell Click ---- */

/**
 * Called whenever a player clicks (or presses Enter/Space on) a cell.
 * @param {number} index - The index (0–8) of the clicked cell.
 */
function handleCellClick(index) {
  // Ignore click if cell is already taken or game is over
  if (!isGameActive || gameState[index] !== null) return;

  // Record the move in the logical state
  gameState[index] = currentPlayer;

  // Update the cell visually (wrapped in a <span> for the pop-in animation)
  const cell = cells[index];
  cell.innerHTML = `<span class="mark">${currentPlayer}</span>`;
  cell.classList.add(currentPlayer.toLowerCase(), 'taken');
  cell.removeAttribute('data-preview');   // Remove hover preview

  // Check game result after this move
  const winCombo = getWinCombo();

  if (winCombo) {
    // --- Someone won ---
    endGame('win', winCombo);
  } else if (isDraw()) {
    // --- It's a draw ---
    endGame('draw', null);
  } else {
    // --- Game continues: switch turn ---
    currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    updateStatus();
    addHoverPreviews();  // Show preview mark for next player
  }
}


/* ---- 6. Update Status Message ---- */

/**
 * Updates the status bar text and colour class
 * to reflect whose turn it is or the game result.
 */
function updateStatus() {
  // Remove all state classes first
  statusBox.classList.remove('turn-x', 'turn-o', 'win-x', 'win-o', 'draw');

  if (currentPlayer === PLAYER_X) {
    statusMessage.textContent = "Player X's Turn";
    statusBox.classList.add('turn-x');
  } else {
    statusMessage.textContent = "Player O's Turn";
    statusBox.classList.add('turn-o');
  }
}


/* ---- 7. Check for a Winner ---- */

/**
 * Checks all WIN_COMBOS against the current gameState.
 * @returns {number[]|null} The winning combo array, or null if no winner yet.
 */
function getWinCombo() {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;

    // If all three cells in a combo belong to the same player → win
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      return combo;   // Return the winning combo for highlighting
    }
  }
  return null;        // No winner yet
}


/* ---- 8. Check for a Draw ---- */

/**
 * A draw occurs when all 9 cells are filled and there is no winner.
 * @returns {boolean} True if the game is a draw.
 */
function isDraw() {
  return gameState.every(cell => cell !== null);
}


/* ---- 9. End Game (win or draw) ---- */

/**
 * Handles the end-of-game logic: stops play, updates scores,
 * highlights winners, updates status, and shows the overlay.
 * @param {'win'|'draw'} result  - The game result.
 * @param {number[]|null} combo  - The winning cell indices (null for draw).
 */
function endGame(result, combo) {
  isGameActive = false;                    // Stop further moves
  board.classList.add('game-over');        // Prevent hover styles

  if (result === 'win') {
    const winner = currentPlayer;

    // Highlight the winning cells
    highlightWinners(combo);

    // Update status bar
    statusBox.classList.remove('turn-x', 'turn-o');
    statusBox.classList.add(winner === PLAYER_X ? 'win-x' : 'win-o');
    statusMessage.textContent = `Player ${winner} Wins! 🎉`;

    // Increment winner's score
    scores[winner]++;
    updateScoreboard(winner);

    // Show modal
    showOverlay(
      winner === PLAYER_X ? '🏆' : '🏆',
      `Player ${winner} Wins!`,
      winner === PLAYER_X
        ? '🔴 Excellent move, X!'
        : '🔵 Well played, O!'
    );

  } else {
    // Draw
    statusBox.classList.remove('turn-x', 'turn-o');
    statusBox.classList.add('draw');
    statusMessage.textContent = "It's a Draw! 🤝";

    scores.draw++;
    updateScoreboard('draw');

    showOverlay('🤝', "It's a Draw!", 'Great game — nobody wins this round!');
  }
}


/* ---- 10. Highlight Winning Cells ---- */

/**
 * Adds the 'winner' CSS class to all three winning cells,
 * triggering the glow + pulse animation defined in CSS.
 * @param {number[]} combo - Array of three winning cell indices.
 */
function highlightWinners(combo) {
  combo.forEach(index => {
    cells[index].classList.add('winner');
  });
}


/* ---- 11. Update Scoreboard ---- */

/**
 * Animates and updates the score display for the given outcome.
 * @param {'X'|'O'|'draw'} outcome
 */
function updateScoreboard(outcome) {
  let targetEl;

  if (outcome === PLAYER_X) targetEl = scoreX;
  else if (outcome === PLAYER_O) targetEl = scoreO;
  else targetEl = scoreDraw;

  // Trigger bump animation by toggling the class
  targetEl.classList.remove('score-bump');
  void targetEl.offsetWidth;              // Force reflow so animation restarts
  targetEl.classList.add('score-bump');

  // Update displayed number
  if (outcome === PLAYER_X) targetEl.textContent = scores.X;
  else if (outcome === PLAYER_O) targetEl.textContent = scores.O;
  else targetEl.textContent = scores.draw;
}


/* ---- 12. Show / Hide Overlay Modal ---- */

/**
 * Reveals the win/draw overlay with custom content.
 * @param {string} emoji
 * @param {string} title
 * @param {string} sub
 */
function showOverlay(emoji, title, sub) {
  modalEmoji.textContent = emoji;
  modalTitle.textContent = title;
  modalSub.textContent = sub;

  overlay.setAttribute('aria-hidden', 'false');

  // Small delay so the CSS transition plays after display change
  setTimeout(() => overlay.classList.add('visible'), 20);
}

/** Hides the overlay. */
function hideOverlay() {
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
}


/* ---- 13. Add Hover Previews ---- */

/**
 * Sets data-preview attribute on empty cells so CSS can display
 * a faint mark showing which player's symbol will be placed.
 */
function addHoverPreviews() {
  cells.forEach((cell, index) => {
    if (gameState[index] === null) {
      cell.setAttribute('data-preview', currentPlayer);
    } else {
      cell.removeAttribute('data-preview');
    }
  });
}


/* ---- 14. Reset Scores ---- */

/**
 * Resets win/draw counters to zero and restarts the board.
 */
function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  scoreX.textContent = '0';
  scoreO.textContent = '0';
  scoreDraw.textContent = '0';
  initGame();
}


/* ---- 15. Event Listeners ---- */

// Attach a click handler to every cell
cells.forEach(cell => {
  const index = parseInt(cell.getAttribute('data-index'), 10);

  // Mouse click
  cell.addEventListener('click', () => handleCellClick(index));

  // Keyboard accessibility: Enter or Space activates the cell
  cell.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(index);
    }
  });
});

// Restart button (below the board) — keeps scores
restartBtn.addEventListener('click', initGame);

// Reset scores button — clears everything
resetBtn.addEventListener('click', resetScores);

// Modal "Play Again" button — same as restart
modalRestartBtn.addEventListener('click', initGame);

// Close overlay by clicking the backdrop (outside the modal card)
overlay.addEventListener('click', e => {
  if (e.target === overlay) initGame();
});


/* ---- 16. Start the Game on Page Load ---- */
initGame();

