import {saveAdmin} from './adminLogIn.js';

document.getElementById('verifyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const pendingAdmin = JSON.parse(sessionStorage.getItem('pendingAdmin'));

  if (!pendingAdmin) {
    alert('Registration session expired. Please register again.');
    window.location.href = '/adminPages/adminRegister.html';
    return;
  }

  const code = Array.from(document.querySelectorAll('.code-inputs input'))
                    .map(i => i.value)
                    .join('');

  try {
    const response = await fetch('/api/admin/complete-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        name: pendingAdmin.name,
        email: pendingAdmin.email,
        password: pendingAdmin.password
      })
    });

    const data = await response.json();

    if (response.ok) {
      saveAdmin(pendingAdmin.name);
      sessionStorage.removeItem('pendingAdmin');
      
      window.location.href = '/adminPages/adminDashboard.html';
    } else {
      alert(data.error || 'Invalid code.');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
});