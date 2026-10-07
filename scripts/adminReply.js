import './update.js';
import { checkAdmin, checkHelp, escapeHTML } from './export.js';

const adminName = await checkAdmin();
const helpName = checkHelp();

document.querySelector('.userName')
  .innerHTML = `${escapeHTML(helpName)}`;

document.querySelector('.adminName')
  .innerHTML = `Admin(${escapeHTML(adminName)})`;

const answerForm = document.querySelector('.admin-reply-form');

answerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const Name = helpName;
  const Admin = adminName;
  const ReplyMsg = document.querySelector('.reply-input').value.trim();
  const Reply = 1;

  try {
    const response = await fetch('/api/answerHelpAdmin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name, Admin, ReplyMsg, Reply })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('userHelp', JSON.stringify([]));

      window.location.href = '/adminPages/adminDashboard.html';
    } else {
      alert(`The sending process has failed: ${data.error}`);
    }
  } catch (err) {
    console.error('Submit Error:', err);
    alert('Could not connect to the server.');
  }
});