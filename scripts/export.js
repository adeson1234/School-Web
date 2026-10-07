import {nameArray} from './index.js';
import { adminArray } from './adminLogIn.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

export function topMenu() {
  const divButtons = document.querySelectorAll('.top-menu button');

  divButtons.forEach((element) => {
    element.addEventListener('click', () => {
      const activeButton = document.querySelectorAll('.active');

      activeButton.forEach((elem) => {
        elem.classList.remove('active');
      });
      element.classList.add('active');

      const page = document.querySelector('.active');
      window.location.href = `/${page.innerHTML}.html`;
    });
  });
}

export function entryDate() {
  const todaysDate = dayjs();
  const displayHour = todaysDate.format('h:mm A');
  const displayYear = todaysDate.format('YYYY/MM/DD');

  return {
    displayHour: displayHour,
    displayYear: displayYear
  };
}

export function dateStorage() {
  const date = entryDate();
  localStorage.setItem('entryDate', JSON.stringify(date));
}

export const date = JSON.parse(localStorage.getItem('entryDate'));

export async function checkUser() {
  const lastName = nameArray.at(-1);

  if (!lastName || !date) {
    alert('You should log in before entering this page.');
    window.location.href = '/index.html';
    return;
  }

  try {
    const res = await fetch('/api/checkUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName: lastName })
    });
    const data = await res.json();

    if(data.message === 'User not found.' || data.error) {
      alert('Hhhhhh funny, dont use the console to make fake accounts.');
      console.log(data.message ? data.message : data.error);

      window.location.href = '/index.html';
      return;
    }
  } catch (err) {
    alert('Couldnt connect to the server:' + err);
    setTimeout(() => {
      checkUser();
    },1000);
  }

  return lastName;
}

export async function checkAdmin() {
  const adminName = adminArray.at(-1);

  if (!adminName) {
    alert('You should log in before entering this page.');
    window.location.href = '/adminPages/adminLogIn.html';
    return;
  }

  try {
    const res = await fetch('/api/checkAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName: adminName })
    });
    const data = await res.json();

    if(data.message === 'User not found.' || data.error) {
      alert('Hhhhhh funny, dont use the console to make fake accounts.');
      console.log(data.message ? data.message : data.error);

      window.location.href = '/adminPages/adminLogIn.html';
      return;
    }
  } catch (err) {
    alert('Couldnt connect to the server:' + err);
    setTimeout(() => {
      checkAdmin();
    },1000);
  }

  return adminName;
}

export function checkHelp() {
  const userHelpArray = JSON.parse(localStorage.getItem('userHelp'))
  const helpName = userHelpArray.at(-1);

  if (!helpName) {
    alert('No one wants your help.');
    window.location.href = '/adminPages/adminDashboard.html';
  }

  return helpName;
}

export function getDeviceLocation() {

return new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error("Geolocation is not supported by this browser."));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
    },
    (error) => {
      reject(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});
}

export async function getSimpleWeather(lat, lon) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const temperature = weatherData.current_weather.temperature;

    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    const addr = geoData.address || {};
    const place =
      addr.suburb ||
      addr.village ||
      addr.town ||
      'unknown Location';

    const city = addr.city || 'Unknown';

    return { place, city, temperature, lat, lon };
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

export const products = [{
  id: 'halaLaptop',
  image: 'laptop',
  name: 'Gaming Laptop',
  priceCents: 25000
}, {
  id: 'halaHeadphone',
  image: 'headphone',
  name: 'Headphone',
  priceCents: 5010
}, {
  id: 'halaUsb',
  image: 'usbdrive',
  name: 'USB Drive',
  priceCents: 500
}, {
  id: 'halaTv',
  image: 'ledTv',
  name: 'LED TV',
  priceCents: 40000
}, {
  id: 'halaKeyboard',
  image: 'compKeyboard',
  name: 'Computer Keyboard',
  priceCents: 5699
}, {
  id: 'halaMouse',
  image: 'compMouse',
  name: 'Computer Mouse',
  priceCents: 1000
}, {
  id: 'halaPhone',
  image: 'phone',
  name: 'Smartphone',
  priceCents: 140000
}, {
  id: 'halaProjector',
  image: 'projector',
  name: 'Projector',
  priceCents: 9099
}, {
  id: 'halaGlass',
  image: 'smartGlass',
  name: 'Smart Glasses',
  priceCents: 300
}, {
  id: 'halaTrumpet',
  image: 'trumpet',
  name: 'Trumpet',
  priceCents: 1000
}, {
  id: 'halaGuitar',
  image: 'acousticGuitar',
  name: 'Acoustic Guitar',
  priceCents: 6767
}, {
  id: 'halaDj',
  image: 'djController',
  name: 'Party DJ',
  priceCents: 30000
}, {
  id: 'halaDrums',
  image: 'drums',
  name: 'Drums Kit',
  priceCents: 60000
}, {
  id: 'halaKorg',
  image: 'pa700',
  name: 'Korg Pa700',
  priceCents: 110000
}, {
  id: 'halaRefrigerator',
  image: 'refrigerator',
  name: 'Refrigerator',
  priceCents: 230000
}, {
  id: 'halaWasher',
  image: 'washingMachine',
  name: 'Washing Machine',
  priceCents: 20000
}, {
  id: 'halaMicrowave',
  image: 'microwave',
  name: 'Microwave',
  priceCents: 15000
}, {
  id: 'halaKoala',
  image: 'koala',
  name: 'Cool Koala',
  priceCents: 978
}, {
  id: 'halaCat',
  image: 'cat',
  name: 'Cute Cat',
  priceCents: 1299
}, {
  id: 'halaLion',
  image: 'lion',
  name: 'African Lion',
  priceCents: 2000
}, {
  id: 'halaPenguin',
  image: 'penguin',
  name: '3 Penguins',
  priceCents: 1300
}]

export function formatCurrency(priceCent) {
  return (Math.round(priceCent) / 100).toFixed(2);
}

export let cart = JSON.parse(localStorage.getItem('cart')) || [];

export function updateDeliveryOption(productId, deliveryOptionId) {
  let matching;

  cart.forEach(cartItem => {
    if (productId === cartItem.productId) {
      matching = cartItem;
    }
  });

  matching.deliveryOptionId = deliveryOptionId;

  saveToCart();
}

export function removeFromCart(productId) {
  const newCart = [];

  cart.forEach(cartItem => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }

    cart = newCart;
  });

  saveToCart();
}

export function saveToCart() {
  localStorage.setItem('cart', JSON.stringify(cart))
}

export function escapeHTML(str) {
  if (str === null || str === undefined) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}