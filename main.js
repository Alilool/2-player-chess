const statusElement = document.getElementById("status");
const promotionMenu = document.getElementById("promotion-menu");
const promotionButtons = promotionMenu.querySelectorAll(".promo-btn");
const checkmateAudio = document.getElementById("checkmateAudio");
const moveAudio = document.getElementById("moveAudio");
const killAudio = document.getElementById("killAudio");
const resetButton = document.getElementById("reset");
const undoButton = document.getElementById("undo");
const notation = document.getElementById("notation");
const freeMove = document.getElementById("freeMove");
const flipBoard = document.getElementById("flipBoard");

const config = {
  draggable: true,
  position: "start",
  showNotation: false,
  dropOffBoard: "trash",
  onDrop: handleMove,
};

const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

const game = new Chess(); // Create a chess game instance
let board1 = ChessBoard("board", config);
let pendingMove = null; // Store move that needs promotion
let isFlipped = false; // Track if the board is flipped

document.addEventListener(
  "touchmove",
  function (event) {
    if (event.target.closest("#board")) {
      event.preventDefault(); // Prevent scrolling when touching the chessboard
    }
  },
  { passive: false }
);

notation.addEventListener("change", () => {
  config.showNotation = notation.checked; // Update config
  resetBoard();
  board1 = ChessBoard("board", config); // Reinitialize the board with the updated config
});

// Show the promotion menu and overlay
function showPromotionMenu() {
  promotionMenu.style.display = "block";
  overlay.style.display = "block"; // Show overlay
}

// Hide the promotion menu and overlay
function hidePromotionMenu() {
  promotionMenu.style.display = "none";
  overlay.style.display = "none"; // Hide overlay
}

function handleMove(source, target) {
  const piece = game.get(source);

  const move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (!freeMove.checked) {
    if (!move) {
      return "snapback";
    }
  }

  game.undo();

  if (freeMove.checked) {
    setTimeout(() => {
      const boardFen = board1.fen(); // Get the updated board position
      const fullFen = `${boardFen} w - - 0 1`; // Dummy values for turn, castling, etc.
      game.load(fullFen);
      updateStatus();
    }, 0); // Delay to let the board update first

    return;
  }

  if (piece.type === "p" && (target[1] === "1" || target[1] === "8")) {
    showPromotionMenu();
    pendingMove = { source, target };
    return "snapback";
  }

  makeMove(source, target);
}

function makeMove(source, target, promotion = "q") {
  const move = game.move({
    from: source,
    to: target,
    promotion: promotion, // Use selected promotion piece
  });

  if (move.captured && !game.in_check() && !game.in_checkmate()) {
    killAudio.play();
  } else if (game.in_check() || game.in_checkmate()) {
    checkmateAudio.play();
  } else {
    moveAudio.play();
  }

  if (flipBoard.checked) {
    // Flip board if needed
    if (game.turn() === "b" && !isFlipped) {
      board1.flip();
      isFlipped = true;
    } else if (game.turn() === "w" && isFlipped) {
      board1.flip();
      isFlipped = false;
    }
  }
  if (!freeMove.checked) {
    board1.position(game.fen()); // Update board
  }
  updateStatus();
}

// Handle promotion selection
promotionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (pendingMove) {
      makeMove(pendingMove.source, pendingMove.target, button.dataset.piece);
      pendingMove = null; // Clear stored move
    }
    hidePromotionMenu();
  });
});

function updateStatus() {
  if (game.in_checkmate()) {
    statusElement.innerHTML = `Checkmate! ${
      game.turn() === "w"
        ? "<span id='black'>Black</span>"
        : "span id='white'>White</span>"
    } wins!`;
  } else if (game.in_draw()) {
    statusElement.innerHTML = "It's a draw!";
  } else {
    statusElement.innerHTML = `<span class="color" id="${
      game.turn() === "w" ? "white" : "black"
    }">${game.turn() === "w" ? "White" : "Black"}</span> to move`;
  }
}

function resetBoard() {
  game.reset();
  if (game.turn() === "b" && !isFlipped) {
    board1.flip();
    isFlipped = true;
  } else if (game.turn() === "w" && isFlipped) {
    board1.flip();
    isFlipped = false;
  }
  board1.position(game.fen());
  updateStatus();
}
const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");
const closeSettingsBtn = document.getElementById("close-settings-btn");

settingsBtn.addEventListener("click", () => {
  settingsMenu.style.display = "block"; // Show the settings menu
  overlay.style.display = "block"; // Show the overlay
});

closeSettingsBtn.addEventListener("click", () => {
  settingsMenu.style.display = "none"; // Hide the settings menu
  overlay.style.display = "none"; // Hide the overlay
});

// If the overlay is clicked, also close the settings menu
overlay.addEventListener("click", () => {
  settingsMenu.style.display = "none";
  overlay.style.display = "none";
});

function undoMove() {
  game.undo();
  if (game.turn() === "b" && !isFlipped) {
    board1.flip();
    isFlipped = true;
  } else if (game.turn() === "w" && isFlipped) {
    board1.flip();
    isFlipped = false;
  }
  board1.position(game.fen());
  updateStatus();
}

undoButton.addEventListener("click", undoMove);
resetButton.addEventListener("click", resetBoard);

updateStatus();
