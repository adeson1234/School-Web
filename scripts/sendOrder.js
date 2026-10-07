import './check-menu.js';
import { checkUser, formatCurrency, cart, escapeHTML } from './export.js';

const lastName = await checkUser();

document.querySelector('.username')
  .innerHTML = `<u>Username:</u> ${escapeHTML(lastName)}`;

const showPrice = JSON.parse(localStorage.getItem('total'));

document.querySelector('.totalPrice')
  .innerHTML = `$${formatCurrency(showPrice.totalCents)}`;

if(showPrice.totalCents === 0) {
  alert('Bradar your cart is empty.')
  window.location.href = '/SHOPPING.html';
}

const buyForm = document.querySelector('.buy-form');

buyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const addressIn = document.querySelector('.address').value.trim();
  const phoneIn = document.querySelector('.phone').value.trim();

  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: lastName,
        address: addressIn,
        phone: phoneIn,
        cart: cart,
        price: formatCurrency(showPrice.totalCents)
      })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem('cart');

      window.location.href = '/shoppingStuff/tracking.html';
    } else {
      alert(`Order failed to send: ${data.error}`);
    }
  } catch (err) {
    console.error('Order error:', err);
    alert('Could not send to admin.');
  }
});