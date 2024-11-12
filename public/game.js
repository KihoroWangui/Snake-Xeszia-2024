const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const cellSize = 20; // Size of each grid cell
let gameState = { players: {}, food: {} };

// Draw the game state (the snakes and food)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the players' snakes
  for (let playerId in gameState.players) {
    const player = gameState.players[playerId];
    ctx.fillStyle = playerId === socket.id ? "green" : "blue"; // Different color for each player

    for (let i = 0; i < player.snake.length; i++) {
      const segment = player.snake[i];
      ctx.fillRect(
        segment.x * cellSize,
        segment.y * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  // Draw the food (nugget)
  ctx.fillStyle = "red"; // Food color
  ctx.fillRect(
    gameState.food.x * cellSize,
    gameState.food.y * cellSize,
    cellSize,
    cellSize
  );

  // Display the score
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${gameState.players[socket.id]?.score || 0}`, 10, 30);
}

// Listen for game state updates from the server
socket.on("gameState", (data) => {
  gameState = data;
  draw();
});

// Listen for the initial game state
socket.on("init", (data) => {
  gameState = data;
  draw();
});

// Handle key presses to move the snake
document.addEventListener("keydown", (event) => {
  let direction;
  if (event.key === "ArrowUp") {
    direction = { x: 0, y: -1 };
  } else if (event.key === "ArrowDown") {
    direction = { x: 0, y: 1 };
  } else if (event.key === "ArrowLeft") {
    direction = { x: -1, y: 0 };
  } else if (event.key === "ArrowRight") {
    direction = { x: 1, y: 0 };
  }

  if (direction) {
    socket.emit("move", direction);
  }
});
