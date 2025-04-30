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
const playWithAI = document.getElementById("PlayWithAI");
const difficultyMenu = document.getElementById("difficulty-menu");
const easy = document.getElementById("easy");
const medium = document.getElementById("medium");
const hard = document.getElementById("hard");
const resetMenu = document.getElementById("reset-menu");
const resetYes = document.getElementById("reset-yes");
const resetNo = document.getElementById("reset-no");
const winnerMenu = document.getElementById("winner-menu");
const playAgainBtn = document.getElementById("play-again-btn");
const closeBtn = document.getElementById("close-btn");
const winnerMessageContainer = document.getElementById(
  "winner-message-container"
);
const winnerMessage = document.getElementById("winner-message");
const winnerHeading = document.getElementById("winner-heading");
const copyFEN = document.getElementById("copy-fen-btn");
const copyFENMessage = document.getElementById("copy-fen");

const config = {
  draggable: true,
  position: "start",
  showNotation: false,
  dropOffBoard: "trash",
  sparePieces: true,
  onDrop: handleMove,
};

if (localStorage.getItem("isFlipped") === "true") {
  flipBoard.checked = true;
}
if (localStorage.getItem("notation") === "true") {
  notation.checked = true;
  config.showNotation = true;
}
if (localStorage.getItem("playWithAI") === "true") {
  playWithAI.checked = true;
}

const game = new Chess(); // Create a chess game instance
let board1 = ChessBoard("board", config);
let pendingMove = null; // Store move that needs promotion
let isFlipped = false; // Track if the board is flipped
let depth = playWithAI.checked ? localStorage.getItem("depth") : null;

function getBotMove() {
  fetch(
    `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(
      game.fen()
    )}&depth=${depth}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data && data.bestmove) {
        const bestMoveStr = data.bestmove;
        const parts = bestMoveStr.split(" ");
        const move = parts[1];

        const from = move.substring(0, 2);
        const to = move.substring(2, 4);
        makeMove(from, to);
        board1.position(game.fen());
      }
    });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

easy.addEventListener("click", () => {
  difficultyMenu.style.display = "none";
  overlay.style.display = "none";
  setDepth("easy");
});
medium.addEventListener("click", () => {
  difficultyMenu.style.display = "none";
  overlay.style.display = "none";
  setDepth("medium");
});
hard.addEventListener("click", () => {
  difficultyMenu.style.display = "none";
  overlay.style.display = "none";
  setDepth("hard");
});

function setDepth(difficulty) {
  if (difficulty === "easy") {
    depth = getRandomInt(4, 6); // Easy mode
    localStorage.setItem("depth", depth);
  } else if (difficulty === "medium") {
    depth = getRandomInt(9, 11); // Medium mode
    localStorage.setItem("depth", depth);
  } else if (difficulty === "hard") {
    depth = getRandomInt(14, 15); // Hard mode
    localStorage.setItem("depth", depth);
  }
  return depth;
}

playAgainBtn.addEventListener("click", () => {
  winnerMenu.style.display = "none";
  overlay.style.display = "none";
  resetBoard();
});

closeBtn.addEventListener("click", () => {
  winnerMenu.style.display = "none";
  overlay.style.display = "none";
});

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

undoButton.addEventListener("click", () => {
  if (playWithAI.checked) {
    undoMove();
    undoMove();
  } else {
    undoMove();
  }
});
resetButton.addEventListener("click", () => {
  if (
    game.fen() !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    resetMenu.style.display = "block";
    overlay.style.display = "block";
  }
});

resetYes.addEventListener("click", () => {
  resetMenu.style.display = "none";
  overlay.style.display = "none";
  resetBoard();
});
resetNo.addEventListener("click", () => {
  resetMenu.style.display = "none";
  overlay.style.display = "none";
});

playWithAI.addEventListener("change", () => {
  difficultyMenu.style.display = playWithAI.checked ? "block" : "none";
  settingsMenu.style.display = playWithAI.checked ? "none" : "block";
  localStorage.setItem("playWithAI", playWithAI.checked);
  resetBoard();
  board1 = ChessBoard("board", config); // Reinitialize the board with the updated config
  updateStatus();
});

freeMove.addEventListener("change", () => {
  sparePieces[0].style.display = freeMove.checked ? "block" : "none";
  sparePieces[1].style.display = freeMove.checked ? "block" : "none";
  document.querySelectorAll(".square-55d63").forEach((square) => {
    square.style.backgroundImage =
      "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))";
  });
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
  let hideWelcomeCheck = hideWelcome.checked;
  localStorage.setItem("hideWelcome", JSON.stringify(hideWelcomeCheck));
});
copyFEN.addEventListener("click", () => {
  navigator.clipboard.writeText(game.fen());
  copyFENMessage.style.display = "block";
  setTimeout(() => {
    copyFENMessage.style.display = "none";
  }, 3000);
});

const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

returnYes.addEventListener("click", () => {
  game.load(localStorage.getItem("lastGame"));
  board1.position(localStorage.getItem("lastGame"));
  if (localStorage.getItem("playWithAI") === "true") {
    playWithAI.checked = true;
    depth = localStorage.getItem("depth");
    console.log(depth);
    if (game.turn() === "b") {
      getBotMove();
    }
  }
  updateStatus();
  returnContainer.style.display = "none";
  overlay.style.display = "none";
});

returnNo.addEventListener("click", () => {
  localStorage.removeItem("lastGame");
  returnContainer.style.display = "none";
  overlay.style.display = "none";
});

flipBoard.addEventListener("change", () => {
  localStorage.setItem("flipBoard", flipBoard.checked);
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
  const currentFen = board1.fen(); // Get the current board position
  config.showNotation = notation.checked; // Update config
  localStorage.setItem("notation", notation.checked);
  board1 = ChessBoard("board", config); // Reinitialize the board with the updated config
  board1.position(currentFen);
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

  if (playWithAI.checked && game.turn() === "w" && !freeMove.checked) {
    return "snapback";
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
  if (move) {
    localStorage.setItem("lastGame", game.fen());
    document.querySelectorAll(".square-55d63").forEach((square) => {
      square.style.backgroundImage =
        "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))";
    });
    if (move.captured && !game.in_check() && !game.in_checkmate()) {
      killAudio.play();
    } else if (game.in_check() || game.in_checkmate()) {
      checkmateAudio.play();
    } else {
      moveAudio.play();
    }
  }

  if (flipBoard.checked) {
    // Flip board if needed
    flipBoardFunc();
    showLastMove(source, target);
  } else {
    showLastMove(target, source);
  }
  if (!freeMove.checked) {
    board1.position(game.fen()); // Update board
  }
  updateStatus();
  if (game.turn() === "b" && playWithAI.checked) {
    getBotMove();
  }
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

function showLastMove(source, target) {
  if (source && target) {
    document.getElementsByClassName(
      `square-${target}`
    )[0].style.backgroundImage =
      "linear-gradient(rgba(255, 255, 0, 0.3), rgba(255, 255, 0, 0.2)";

    document.getElementsByClassName(
      `square-${source}`
    )[0].style.backgroundImage =
      "linear-gradient(rgba(255, 255, 0, 0.3), rgba(255, 255, 0, 0.2))";
  }
}

function updateStatus() {
  sparePieces[0].style.display = freeMove.checked ? "block" : "none";
  sparePieces[1].style.display = freeMove.checked ? "block" : "none";
  if (game.in_check() && !game.in_checkmate()) {
    statusElement.innerHTML = `<span class="color" id="${
      game.turn() === "w" ? "white" : "black"
    }">${game.turn() === "w" ? "White" : "Black"}</span> in check`;
  } else if (game.in_check() && game.in_checkmate()) {
    statusElement.innerHTML = `Checkmate! <span class="color" id="${
      game.turn() === "w" ? "black" : "white"
    }">${game.turn() === "w" ? "Black" : "White"}</span> Wins!`;
    setTimeout(() => {
      showWinnerMenu(game.turn());
    }, 300);
  } else if (game.in_draw()) {
    statusElement.innerHTML = "It's a draw!";
    setTimeout(() => {
      showWinnerMenu("draw");
    }, 500);
  } else {
    if (playWithAI.checked && game.turn() === "b") {
      statusElement.innerHTML =
        '<span class="color" id="black">MindMate AI</span> is thinking...';
    } else {
      statusElement.innerHTML = `<span class="color" id="${
        game.turn() === "w" ? "white" : "black"
      }">${game.turn() === "w" ? "White" : "Black"}</span> to move`;
    }
  }
}

function showWinnerMenu(end) {
  if (end == "draw") {
    winnerHeading.innerHTML = "It's a draw!";
    winnerMessage.innerHTML = `<span class="color" style="font-size: 20px;">${
      game.in_stalemate() ? " Stalemate!" : "Insufficient material!"
    } </span>`;
    winnerMenu.style.display = "block";
    setTimeout(() => {
      overlay.style.display = "block";
    }, 0);
  } else {
    setTimeout(() => {
      console.log(end);
      winnerMessageContainer.style.backgroundColor = `${
        end === "w" ? "#2c2c2c" : "#d8d8d8"
      }`;
      winnerMessageContainer.style.color = `${
        end === "w" ? "#fff" : "#2c2c2c"
      }`;
    }, 0);

    winnerMessage.innerHTML = `Checkmate! <span class="color"
    }">${end === "w" ? "Black" : "White"}</span> wins!`;
    winnerMenu.style.display = "block";
    setTimeout(() => {
      overlay.style.display = "block";
    }, 0);
  }
}

function resetBoard() {
  document.querySelectorAll(".square-55d63").forEach((square) => {
    square.style.backgroundImage =
      "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))";
  });
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
  difficultyMenu.style.display = "none";
  resetMenu.style.display = "none";
  winnerMenu.style.display = "none";
  if (promotionMenu.style.display === "block") {
    overlay.style.display = "block";
  }
});

function undoMove() {
  document.querySelectorAll(".square-55d63").forEach((square) => {
    square.style.backgroundImage =
      "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))";
  });
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

updateStatus();
