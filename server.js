const express = require("express");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Game state
let players = {};
let food = {};

// Helper function to generate random food position
function generateFood() {
  return {
    x: Math.floor(Math.random() * 30), // Assuming 30x20 grid
    y: Math.floor(Math.random() * 20),
  };
}

// Listen for player connections
io.on("connection", (socket) => {
  console.log("A player connected: " + socket.id);

  // Add new player to the game state
  players[socket.id] = {
    snake: [{ x: 5, y: 5 }],
    direction: { x: 1, y: 0 },
    score: 0,
  };

  // Send the current game state to the new player
  socket.emit("init", { players, food });

  // Listen for player movement
  socket.on("move", (direction) => {
    if (players[socket.id]) {
      players[socket.id].direction = direction;
    }
  });

  // Listen for the player disconnecting
  socket.on("disconnect", () => {
    console.log("A player disconnected: " + socket.id);
    delete players[socket.id];
  });
});

// Game loop to update the game state
setInterval(() => {
  for (let playerId in players) {
    const player = players[playerId];

    // Update snake's head position based on direction
    const head = { ...player.snake[0] };
    head.x += player.direction.x;
    head.y += player.direction.y;

    // Add new head
    player.snake.unshift(head);

    // Check if the snake eats food
    if (head.x === food.x && head.y === food.y) {
      player.score += 10; // Increase score
      food = generateFood(); // Generate new food
    } else {
      // Remove the last part of the snake to simulate movement
      player.snake.pop();
    }
  }

  // Broadcast updated game state to all players
  io.emit("gameState", { players, food });
}, 100);

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
