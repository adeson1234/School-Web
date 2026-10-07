import './check-menu.js';

let myMove = '';
let result = '';
let move = '';
const score = JSON.parse(sessionStorage.getItem('score')) || {
  win : 0,
  lose : 0,
  draw : 0
};

document.querySelector('.wins').innerHTML = `Wins: ${score.win}`;
document.querySelector('.loses').innerHTML = `Loses: ${score.lose}`;
document.querySelector('.draws').innerHTML = `Draws: ${score.draw}`;

document.querySelector('.rock')
  .addEventListener('click', () => {
    myMove = 'rock';
    compMove(myMove);
  });

document.querySelector('.paper')
  .addEventListener('click', () => {
    myMove = 'paper';
    compMove(myMove);
  });

document.querySelector('.scissor')
  .addEventListener('click', () => {
    myMove = 'scissor';
    compMove(myMove);
  }); 

document.querySelector('.resetScore')
  .addEventListener('click', () => {
    myMove = 'resetScore';
    compMove(myMove);
  });

let autoPlay = false;
let intervalId;

const auto = document.querySelector('.autoGame');

auto.addEventListener('click', () => {
    if (!autoPlay) {

      intervalId = setInterval(() => {
        const goodbad = Math.random();

        if (goodbad >= 0 && goodbad < 1/3) {
          myMove = 'rock';
        } else if (goodbad >= 1/3 && goodbad < 2/3) {
          myMove = 'paper';
        } else if (goodbad >= 2/3) {
          myMove = 'scissor';
        }
        compMove(myMove);
      }, 3000);

      auto.style.background = 'green';
    
      autoPlay = true;
    } else {
      clearInterval(intervalId);

      auto.style.background = 'rgb(8, 63, 54)';
      autoPlay = false;
    }
  });

function compMove(ahead) {
  myMove = ahead;

  const random = Math.random();

  if (myMove === 'rock') {
    if (random >= 0 && random < 1/3) {
      move = 'rock';
      result = 'You tied.';
      score.draw += 1;
    } else if (random >= 1/3 && random < 2/3) {
      move = 'paper';
      result = 'You lost.';
      score.lose += 1;
    } else if (random >= 2/3) {
      move = 'scissor';
      result = 'You won';
      score.win += 1;
    }
  } else if (myMove === 'paper') {
    if (random >= 0 && random < 1/3) {
      move = 'rock';
      result = 'You won.';
      score.win += 1;
    } else if (random >= 1/3 && random < 2/3) {
      move = 'paper';
      result = 'You tied.';
      score.draw += 1;
    } else if (random >= 2/3) {
      move = 'scissor';
      result = 'You lost.';
      score.lose += 1;
    }
    } else if (myMove === 'scissor') {
      if (random >= 0 && random < 1/3) {
        move = 'rock';
        result = 'You lost.';
        score.lose += 1;
      } else if (random >= 1/3 && random < 2/3) {
        move = 'paper';
        result = 'You won.';
        score.win += 1;
      } else if (random >= 2/3) {
        move = 'scissor';
        result = 'You tied.';
        score.draw += 1
      }
    } else {
      score.win = 0;
      score.lose = 0;
      score.draw = 0;
      result = null;
      sessionStorage.removeItem('score');
    }
  sessionStorage.setItem('score', JSON.stringify(score));
  document.querySelector('.wins').innerHTML = `Wins: ${score.win}`;
  document.querySelector('.loses').innerHTML = `Loses: ${score.lose}`;
  document.querySelector('.draws').innerHTML = `Draws: ${score.draw}`;

  document.querySelector('.yourMove').innerHTML = `<u>Your Move:</u> 
  ${!result || !myMove ? 'none' : `<img src="/images/${myMove}.png" alt="${myMove}" height="30vh">`}`;

  document.querySelector('.compMove').innerHTML = `<u>Computers Move:</u> 
  ${!result || !myMove ? 'none' : `<img src="/images/${move}.png" alt="${move}" height="30vh"></img>`}`;

  document.querySelector('.theResult').innerHTML = `${result || 'Pick A Move!!'}`;
}