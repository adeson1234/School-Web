import './check-menu.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let velocityX = 0;
let velocityY = 0;
let foodX = 15;
let foodY = 15;
let score = 0;

setInterval(gameLoop, 1000 / 10);

window.addEventListener('keydown', changeDirection);

document.querySelector('#btn-up').addEventListener('click', () => {
  if (velocityY !== 1) {
    velocityX = 0; velocityY = -1;
  } else {
    return;
  }
});
document.querySelector('#btn-left').addEventListener('click', () => {
  if (velocityX !== 1) {
    velocityX = -1; velocityY = 0;
  } else {
    return;
  }
});
document.querySelector('#btn-down').addEventListener('click', () => {
  if (velocityY !== -1) {
    velocityX = 0; velocityY = 1;
  } else {
    return;
  }
});
document.querySelector('#btn-right').addEventListener('click', () => {
  if (velocityX !== -1) {
    velocityX = 1; velocityY = 0;
  } else {
    return;
  }
});

function changeDirection(event) {
  const key = event.key;
  if ((key === "ArrowUp" || key === "w") && velocityY !== 1) {
    velocityX = 0; velocityY = -1;
  } else if ((key === "ArrowDown" || key === "s") && velocityY !== -1) {
    velocityX = 0; velocityY = 1;
  } else if ((key === "ArrowLeft" || key === "a") && velocityX !== 1) {
    velocityX = -1; velocityY = 0;
  } else if ((key === "ArrowRight" || key === "d") && velocityX !== -1) {
    velocityX = 1; velocityY = 0;
  }
}

function gameLoop() {
  const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    resetGame();
    return;
  }

  if (velocityX !== 0 || velocityY !== 0) {
    for (let segment of snake) {
      if (head.x === segment.x && head.y === segment.y) {
        resetGame();
        return;
      }
    }
  }

  snake.unshift(head);

  if (head.x === foodX && head.y === foodY) {
    score++;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff4444";
  ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize -2, gridSize -2);

  ctx.fillStyle = "#44ff44";
  snake.forEach((segment) => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
}

function placeFood() {
  foodX = Math.floor(Math.random() * tileCount);
  foodY = Math.floor(Math.random() * tileCount);
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocityX = 0;
  velocityY = 0;
  score = 0;
  placeFood();
}