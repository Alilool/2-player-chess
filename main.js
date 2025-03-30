const statusElement = document.getElementById("status");
const promotionMenu = document.getElementById("promotion-menu");
const promotionButtons = promotionMenu.querySelectorAll(".promo-btn");
const checkmateAudio = document.getElementById("checkmateAudio");
const moveAudio = document.getElementById("moveAudio");
const killAudio = document.getElementById("killAudio");
const resetButton = document.getElementById("reset");
const undoButton = document.getElementById("undo");
const notation = document.getElementById("notation");

const config = {
  draggable: true,
  position: "start",
  showNotation: false,
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

  // Check if the move is valid without making it permanent
  const move = game.move({
    from: source,
    to: target,
    promotion: "q", // Temporarily use queen to validate the move
  });

  // If the move is invalid, snap back
  if (!move) {
    return "snapback";
  }

  // Undo the temporary move so we can process it properly
  game.undo();

  // If it's a pawn promotion
  if (piece.type === "p" && (target[1] === "1" || target[1] === "8")) {
    showPromotionMenu();
    pendingMove = { source, target };
    return "snapback"; // Prevent move until promotion is selected
  }

  // If not a promotion, make the move normally
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
  // Flip board if needed
  if (game.turn() === "b" && !isFlipped) {
    board1.flip();
    isFlipped = true;
  } else if (game.turn() === "w" && isFlipped) {
    board1.flip();
    isFlipped = false;
  }

  board1.position(game.fen()); // Update board
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
