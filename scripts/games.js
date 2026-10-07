import './check-menu.js';

const games = [{
  image: 'rockPaperScissor',
  name: 'Rock,Paper And Scissor Game',
  urlName: 'rockPaperScissors'
}, {
  image: 'snake',
  name: 'Snake Game',
  urlName: 'snakeGame'
}, {
  image: 'cyberRunner',
  name: 'Cyber Runner Game',
  urlName: 'cyberRunner'
}];

let gameHTML = '';

games.forEach(game => {
  gameHTML += `
    <div class="game-card-item">
      <div class="game-card-thumb-wrapper">
        <img class="game-card-image" src="/images/${game.image}.jpg" alt="${game.name}">
      </div>
      <div class="game-card-details">
        <p class="game-card-title">${game.name}</p>
        <button class="game-card-btn" onClick="window.location.href = '/gamesStuff/${game.urlName}.html'">Play It</button>
      </div>
    </div>
  `;
});

document.querySelector('.games')
  .innerHTML = gameHTML;