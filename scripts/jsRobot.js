const pupils = document.querySelectorAll('.pupil');

window.addEventListener('mousemove' , (e) => {
  pupils.forEach(pupil => {
    const rect = pupil.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;

    const daltaX = e.clientX - eyeX;
    const daltaY = e.clientY - eyeY;

    const angle = Math.atan2(daltaY, daltaX);

    const distance = Math.min(7, Math.hypot(daltaX, daltaY) / 10);

    const moveX = distance * Math.cos(angle);
    const moveY = distance * Math.sin(angle);

    pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});

const robotHead = document.querySelector('.robot-head');
const msg = document.querySelector('.msg');

let time = 1500;
let timerId = null;

robotHead.addEventListener('click', () => {
  clearTimeout(timerId);

  robotHead.classList.add('move');
  msg.classList.add('move');
  msg.style.visibility = 'visible';

  if (time !== 1500) {
    msg.classList.add('second');

    setTimeout(() => {
      msg.classList.remove('second');
    }, 500);
  }
  
  timerId = setTimeout(() => {
    robotHead.classList.remove('move');
    msg.classList.remove('move');
    msg.style.visibility = 'hidden';
    time = 1500;
  }, time);

  time += 500;
});