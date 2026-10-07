import './update.js';
import { checkAdmin, escapeHTML } from './export.js';
import { CURRENT_VERSION } from "./version.js";

localStorage.setItem('app_version', CURRENT_VERSION);
const adminName = await checkAdmin();

document.querySelector('.admin-Name')
  .innerHTML = `${escapeHTML(adminName)} Dashboard`;

export let userHelpArray = JSON.parse(localStorage.getItem('userHelp')) || [];

function saveUserHelp(enteredName) {
  if (!enteredName) {
    return;
  }

  if (userHelpArray.length > 0) {
    userHelpArray = [];
  }

  userHelpArray.push(enteredName.trim());
  localStorage.setItem('userHelp', JSON.stringify(userHelpArray));
}

const statusDiv = document.querySelector('#notif-status');

statusDiv.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    alert('Your browser doesnt have the built-in Notification feature enabled or supported');
    return;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      statusDiv.innerText = 'Notifications blocked! Enable them in browser settings.';
      statusDiv.style.background = '#dc2626';
      return;
    }

    const register = await navigator.serviceWorker.register('/sw.js');
    const res = await fetch('/api/push-key');
    const { publicKey } = await res.json();

    const existingSubscription = await register.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await fetch('/api/subscribe-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    statusDiv.innerText = 'Notifications Active';
    statusDiv.style.background = '#16a34a';
  } catch (err) {
    console.error('Subscription error:', err);
  }
}, { once: true });

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function loadDashboardData() {
  try {
    const resOrders = await fetch('/api/admin/orders');
    const orders = await resOrders.json();
    const ordersTable = document.getElementById('orders-table');

    if (orders.length === 0) {
      ordersTable.innerHTML = `<tr><td colspan="6">No orders found.</td></tr>`;
    } else {
      ordersTable.innerHTML = orders.map((o, i) => {
        const countNumber = i + 1;
        let cartDisplay = o.Cart;
        try {
          if (typeof cartDisplay === 'string') {
            const parsed = JSON.parse(cartDisplay);
            cartDisplay = typeof parsed === 'object' ? JSON.stringify(parsed) : parsed;
          }
        } catch(e) {}

        return `
          <tr>
            <td>${countNumber}</td>
            <td>${escapeHTML(o.Name)}</td>
            <td>${escapeHTML(o.Address)}</td>
            <td>${escapeHTML(o.Phone)}</td>
            <td><span class="cart-box">${escapeHTML(cartDisplay)}</span></td>
            <td>$${escapeHTML(o.Price)}</td>
          </tr>
        `;
      }).join('');
    }

    const resAdmins = await fetch('/api/admin/admins');
    const admins = await resAdmins.json();
    const adminsTable = document.getElementById('admins-table');

    if (admins.length === 0) {
      adminsTable.innerHTML = `<tr><td colspan="3">No registered users found.</td></tr>`;
    } else {
      adminsTable.innerHTML = admins.map((u, i) => {
        const countNumber = i + 1;

        return `
          <tr>
            <td>${countNumber}</td>
            <td>${escapeHTML(u.Name)}</td>
            <td><code>${escapeHTML(u.Email)}</code></td>
          </tr>
        `;
      }).join('');
    }

    const resUsers = await fetch('/api/admin/users');
    const users = await resUsers.json();
    const usersTable = document.getElementById('users-table');

    if (users.length === 0) {
      usersTable.innerHTML = `<tr><td colspan="4">No registered users found.</td></tr>`;
    } else {
      usersTable.innerHTML = users.map((u, i) => {
        const countNumber = i + 1;
        let userPassword = u.Password;

        return `
          <tr>
            <td>${countNumber}</td>
            <td>${escapeHTML(u.Name)}</td>
            <td><code>${escapeHTML(u.Email)}</code></td>
            <td><code>${escapeHTML(userPassword)}</code></td>
          </tr>
        `;
      }).join('');
    }

    const resHelps = await fetch('/api/admin/helps');
    const helps = await resHelps.json();
    const helpsTable = document.getElementById('helps-table');

    if (helps.length === 0) {
      helpsTable.innerHTML = `<tr><td colspan="5">No help messages found.</td></tr>`;
    } else {
      helpsTable.innerHTML = helps.map((h, i) => {
        const countNumber = i + 1;

        let text;

        if(h.Reply === 0) {
          text = `<button data-user-name = "${escapeHTML(h.Name)}" class="answerBtn">Answer</button>`;
        } else {
          text = 'Replied';
        }

        return `
          <tr>
            <td>${countNumber}</td>
            <td>${escapeHTML(h.Name)}</td>
            <td>${escapeHTML(h.Sentence)}</td>
            <td>${h.ReplyMsg ===  null ? 'No Reply' : escapeHTML(h.ReplyMsg)}</td>
            <td>${text}&nbsp;<button data-user-name = "${escapeHTML(h.Name)}" class="deleteBtn">Delete</button></td>
          </tr>
        `;
      }).join('');
    }

  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }

  document.querySelectorAll('.answerBtn')
    .forEach(elem => {
      elem.addEventListener('click', () => {
        const {userName} = elem.dataset;
        saveUserHelp(userName);

        window.location.href = '/adminPages/adminReply.html';
      });
    });

  document.querySelectorAll('.deleteBtn')
    .forEach(elem => {
      elem.addEventListener('click', async () => {
        const {userName} = elem.dataset;

        try {
          const response = await fetch('/api/delete-help', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Name: userName })
          });
          const data = await response.json();
        
          if (response.ok) {
            loadDashboardData();
          } else {
            alert('Failed to delete:' + data.error);
          }
        } catch (err) {
          console.log('Delete failed:'+ err);
          alert('Couldnt connect to server.')
        }
      });
    });
}

loadDashboardData();

setInterval(() => {
  loadDashboardData();
},12000);