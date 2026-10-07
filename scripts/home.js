import './update.js';
import { topMenu, checkUser, getDeviceLocation, getSimpleWeather, date, escapeHTML } from './export.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

const lastName = await checkUser();

document.querySelector('.theName')
  .innerHTML = `
    <div>
      Hello ${escapeHTML(lastName)}!!
    </div>
  `;

topMenu();

async function checkAnswer() {
  try {
    const res = await fetch('/api/answerHelp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName: lastName })
    });
    const data = await res.json();

    if(data.message === 'Answer received.') {
      window.location.href = '/homeStuff/answer.html';
    } else {
      console.log(data.message ? data.message : data.error);
    }
  } catch (err) {
    console.error('Error:' + err);
  }
}
checkAnswer();

setInterval(() => {
  checkAnswer();
},10000);

document.querySelector('.theDate')
  .innerHTML = `
    <div>
      You logged in at ${date.displayHour} on ${date.displayYear}
    </div>
  `;

async function main() {
  try {
    const { lat, lon } = await getDeviceLocation();
    console.log(`Device Coordinates: Lat ${lat}, Lon ${lon}`);

    const weather = await getSimpleWeather(lat, lon);

    document.querySelector('.tempBorder')
      .style.width = `${weather.place.length + weather.city.length + 14}ch`;

    document.querySelector('.theTemp')
      .innerHTML = `
        <div>
          <div>
            ${weather.temperature} °C
          </div>
          <div>
            ${weather.city} / ${weather.place}
          </div>
        </div>
      `;

  } catch (err) {
    console.error("Error:", err.message);
    setTimeout(() => {
      main();
    }, 2000);
  }
}
main();

const time = dayjs().format('H');

document.querySelectorAll('.text')
  .forEach( text => {
    text.classList.remove('active');
  });

if (time > 5 && time < 12) {
  document.querySelector('#morning-text')
    .classList.add('active');
} else if (time > 11 && time < 19) {
  document.querySelector('#midday-text')
    .classList.add('active');
} else if (time > 18 && time < 23) {
  document.querySelector('#evening-text')
    .classList.add('active');
} else {
  document.querySelector('#night-text')
    .classList.add('active');
}

const helpForm = document.querySelector('.center-form form');
if (helpForm) {
  helpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputText = document.querySelector('.help-input');
    const helpText = inputText.value.trim();

    try {
      const response = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name : lastName , helpText: helpText })
      });

      const data = await response.json();

      if (response.ok) {
        inputText.value = '';

        const secMsg = document.querySelector('.sent-msg');
        secMsg.innerHTML = '&nbsp;&nbsp;Sent successfully.';

        setTimeout(() => {
          secMsg.innerHTML = '';
        }, 4000);

      } else {
        alert(`Text failed to send: ${data.error}`);
      }
    } catch (err) {
      console.error('Error in sending :', err);
      alert('Could not send the text to the admin.');
    }
  });
}