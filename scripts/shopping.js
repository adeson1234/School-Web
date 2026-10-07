import './check-menu.js';
import { products, formatCurrency, cart, saveToCart } from './export.js';

let productsHTML = '';

products.forEach(product => {
  productsHTML += `
    <div class="product-card">
      <img class="product-image" src="images/${product.image}-image.jpg" loading="lazy" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-price">$${formatCurrency(product.priceCents)}</div>
      <button class="add-to-cart-btn" data-product-id = "${product.id}">Add to cart</button>
    </div>
  `;
});

document.querySelector('.products')
  .innerHTML = productsHTML;


function addToCart(productId) {
  let matching;

  cart.forEach(cartItem => {
    if (productId === cartItem.productId) {
      matching = cartItem;
    }
  });

  if (matching) {
    matching.quantity += 1;
  } else {
    cart.push({
      productId : productId,
      quantity : 1,
      deliveryOptionId: '1'
    });
  }

  saveToCart();
}

function updateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach(cartItem => {
    cartQuantity += cartItem.quantity;
  });

  document.querySelector('.items-number')
    .innerHTML = cartQuantity;
}

updateCartQuantity();

document.querySelectorAll('.add-to-cart-btn')
  .forEach(button => {
    button.addEventListener('click', () => {
      const {productId} = button.dataset;
            
      addToCart(productId);
      updateCartQuantity()
    });
  });

document.querySelector('.cart-stuff')
  .addEventListener('click', () => {
    window.location.href = 'shoppingStuff/orders.html';
  });