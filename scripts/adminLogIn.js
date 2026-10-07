import { CURRENT_VERSION } from "./version.js";

localStorage.setItem('app_version', CURRENT_VERSION);
export let adminArray = JSON.parse(localStorage.getItem('admin')) || [];

export function saveAdmin(enteredName) {
  if (!enteredName) {
    return;
  }

  if (adminArray.length > 0) {
    adminArray = [];
  }

  adminArray.push(enteredName.trim());
  localStorage.setItem('admin', JSON.stringify(adminArray));
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#logIn');

  if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.querySelector('.theLogName').value.trim();
      const password = document.querySelector('.theLogPass').value;

      try {
        const response = await fetch('/api/loginAdmin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          saveAdmin(username);
          window.location.href = '/adminPages/adminDashboard.html';
        } else {
          alert(`Login failed: ${data.error}`);
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Could not connect to the server.');
      }
    });
  }
});