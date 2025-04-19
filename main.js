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
const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const returnYes = document.getElementById("yes");
const returnNo = document.getElementById("no");
const returnContainer = document.getElementById("returnLastGame");
const welcome = document.getElementById("welcome");
const start = document.getElementById("start");
const hideWelcome = document.getElementById("hideWelcome");
const sparePieces = document.getElementsByClassName("spare-pieces-7492f");
document.addEventListener("DOMContentLoaded", () => {
  let hideWelcomeCheck = false;
  if (localStorage.getItem("hideWelcome")) {
    hideWelcomeCheck = JSON.parse(localStorage.getItem("hideWelcome"));
  }

  if (!hideWelcomeCheck) {
    welcome.style.display = "block";
    overlay.style.display = "block";
  } else {
    if (
      localStorage.getItem("lastGame") &&
      localStorage.getItem("lastGame") !==
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    ) {
      returnContainer.style.display = "block";
      overlay.style.display = "block";
    }
  }
});

const config = {
  draggable: true,
  position: "start",
  showNotation: false,
  dropOffBoard: "trash",
  sparePieces: true,
  onDrop: handleMove,
};

freeMove.addEventListener("change", () => {
  console.log(freeMove.checked);
  sparePieces[0].style.display = freeMove.checked ? "block" : "none";
  sparePieces[1].style.display = freeMove.checked ? "block" : "none";
});

start.addEventListener("click", () => {
  welcome.style.display = "none";
  overlay.style.display = "none";
  if (
    localStorage.getItem("lastGame") &&
    localStorage.getItem("lastGame") !==
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    returnContainer.style.display = "block";
    overlay.style.display = "block";
  }
});
hideWelcome.addEventListener("change", () => {
  hideWelcomeCheck = hideWelcome.checked;
  localStorage.setItem("hideWelcome", JSON.stringify(hideWelcomeCheck));
});

const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

const game = new Chess(); // Create a chess game instance
let board1 = ChessBoard("board", config);
let pendingMove = null; // Store move that needs promotion
let isFlipped = false; // Track if the board is flipped
returnYes.addEventListener("click", () => {
  game.load(localStorage.getItem("lastGame"));
  board1.position(localStorage.getItem("lastGame"));
  updateStatus();
  returnContainer.style.display = "none";
  overlay.style.display = "none";
});

returnNo.addEventListener("click", () => {
  localStorage.removeItem("lastGame");
  returnContainer.style.display = "none";
  overlay.style.display = "none";
});

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
      localStorage.setItem("lastGame", fullFen);
      updateStatus();
    }, 0); // Delay to let the board update first

    return;
  }
  localStorage.setItem("lastGame", game.fen());

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

  localStorage.setItem("lastGame", game.fen());

  if (move.captured && !game.in_check() && !game.in_checkmate()) {
    killAudio.play();
  } else if (game.in_check() || game.in_checkmate()) {
    checkmateAudio.play();
  } else {
    moveAudio.play();
  }

  if (flipBoard.checked) {
    // Flip board if needed
    flipBoardFunc();
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
  if (game.in_check()) {
    statusElement.innerHTML = `<span class="color" id="${
      game.turn() === "w" ? "white" : "black"
    }">${game.turn() === "w" ? "White" : "Black"}</span> in check`;
  } else if (game.in_checkmate()) {
    statusElement.innerHTML = `Checkmate! ${
      game.turn() === "w"
        ? "<span id='black'>Black</span>"
        : "<span id='white'>White</span>"
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
  flipBoardFunc();
  board1.position(game.fen());
  localStorage.removeItem("lastGame");
  updateStatus();
}

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
  returnContainer.style.display = "none";
  welcome.style.display = "none";
});

function undoMove() {
  game.undo();
  flipBoardFunc();
  board1.position(game.fen());
  localStorage.setItem("lastGame", game.fen());
  updateStatus();
}

function flipBoardFunc() {
  if (flipBoard.checked) {
    if (game.turn() === "b" && !isFlipped) {
      board1.flip();
      isFlipped = true;
    } else if (game.turn() === "w" && isFlipped) {
      board1.flip();
      isFlipped = false;
    }
  }
}

undoButton.addEventListener("click", undoMove);
resetButton.addEventListener("click", resetBoard);

updateStatus();
