import './update.js';
import { checkUser, escapeHTML } from './export.js';

const lastName = await checkUser();

async function getAnswerInfo() {
  try {
    const res = await fetch('/api/answerHelp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName: lastName })
    });

    const data = await res.json();

    if (data.message === 'Nvm.') {
      alert('No active answer found. Returning to home page.');
      window.location.href = '/HOME.html';
      return null;
    } else if (data.error) {
      alert(`Error: ${data.error}`);
      window.location.href = '/HOME.html';
      return null;
    } else {
      return {
        Admin: data.user.Admin,
        ReplyMsg: data.user.ReplyMsg
      };
    }
  } catch (err) {
    console.error('Error in getAnswerInfo:', err);
    alert('Could not connect to the server.');
    setTimeout(() => {
      getAnswerInfo();
    }, 2000);
  }
}

const info = await getAnswerInfo();

if (info) {
  const adminTitle = document.querySelector('.admin-title');
  const answerText = document.querySelector('.answer-text');

  adminTitle.innerHTML = `Admin(${escapeHTML(info.Admin)})`;
  answerText.innerHTML = `${escapeHTML(info.ReplyMsg)}`;
}

const userForm = document.querySelector('.user-reply-form');
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const Name = lastName;
  const helpInput = document.querySelector('.reply-input');
  const helpText = helpInput.value.trim();
  const Reply = 0;

  try {
    const response = await fetch('/api/helpAgain', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: Name, helpText: helpText, Reply: Reply })
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = '/HOME.html';
    } else {
      alert(`The sending process has failed: ${data.error}`);
    }
  } catch (err) {
    console.error('Submit Error:', err);
    alert('Could not connect to the server.');
  }
});