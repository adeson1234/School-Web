import { dateStorage } from "./export.js";
import { CURRENT_VERSION } from "./version.js";

localStorage.setItem('app_version', CURRENT_VERSION);

function replacingEntry(formId) {
  const emptyThem = document.querySelectorAll('.empty');

  document.querySelectorAll('.userEntery')
    .forEach(form => {
      form.classList.remove('active');
    });

  emptyThem.forEach((empty) => {
    empty.value = '';
  });

  document.querySelector(`#${formId}`)
    .classList.add('active');

  if (document.title === 'LOG IN') {
    document.title = 'REGISTER';  
  } else {
    document.title = 'LOG IN';
  }
}

export let nameArray = JSON.parse(localStorage.getItem('name')) || [];

function saveName(enteredName) {
  if (!enteredName) {
    return;
  }

  if (nameArray.length > 0) {
    nameArray = [];
  }

  nameArray.push(enteredName.trim());
  localStorage.setItem('name', JSON.stringify(nameArray));
}

document.addEventListener('DOMContentLoaded', () => {

  const loginForm = document.querySelector('#logIn form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = loginForm.querySelector('.theLogName').value.trim();
      const password = loginForm.querySelector('input[name="password"]').value;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          saveName(username);
          localStorage.removeItem('cart');
          sessionStorage.clear();
          dateStorage();

          window.location.href = '/HOME.html';
        } else {
          alert(`Login failed: ${data.error}`);
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Could not connect to the server.');
      }
    });
  }

  const registerForm = document.querySelector('#register form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = registerForm.querySelector('.theRegName').value.trim();
      const email = registerForm.querySelector('input[name="email"]').value.trim();
      const password = registerForm.querySelector('input[name="password"]').value;

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
          saveName(username);
          localStorage.removeItem('cart');
          sessionStorage.clear();
          dateStorage();
          
          window.location.href = '/HOME.html';
        } else {
          alert(`Registration failed: ${data.error}`);
        }
      } catch (err) {
        console.error('Register error:', err);
        alert('Could not connect to the server.');
      }
    });
  }
});

Object.assign(window, {
  replacingEntry
});