import { CURRENT_VERSION } from "./version.js";

localStorage.setItem('app_version', CURRENT_VERSION);

document.getElementById('adminRegisterForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/admin/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('pendingAdmin', JSON.stringify({ name, email, password }));

      window.location.href = '/adminPages/verify.html';
    } else {
      alert(data.error || 'Failed to send verification code.');
    }
  } catch (err) {
    alert('Network error. Please try again.');
  }
});