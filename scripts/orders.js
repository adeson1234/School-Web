import './check-menu.js';
import { products, cart, formatCurrency, removeFromCart, updateDeliveryOption, saveToCart } from './export.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

const deliveryOptions = [{
  id: '1',
  deliveryDays: 7,
  priceCents: 0
}, {
  id: '2',
  deliveryDays: 1,
  priceCents: 999
}];

function getDeliveryOption(deliveryOptionId) {
  let deliveryOption;

  deliveryOptions.forEach(option => {
    if (option.id === deliveryOptionId) {
      deliveryOption = option;
    }
  });

  return deliveryOption || deliveryOptions[0];
}

function getProduct(productId) {
  let matchingProduct;

    products.forEach(product => {
      if (product.id === productId) {
        matchingProduct = product;
      }
    });

  return matchingProduct
}

function getCart(productId) {
  let matchingCart;

    cart.forEach(cartItem => {
      if (cartItem.productId === productId) {
        matchingCart = cartItem;
      }
    });

  return matchingCart;
}

function renderOrderSummery() {
  let cartSummaryHTML = '';

  cart.forEach(cartItem => {
    const {productId} = cartItem;

    const matchingProduct = getProduct(productId);

    cartSummaryHTML += `
      <div class="cart-item-card card-container-${productId}">
        <div class="product-image-container">
          <img class="product-image" src="/images/${matchingProduct.image}-image.jpg" alt="${matchingProduct.name}">
        </div>
        <div class="product-details">
          <div class="product-name">${matchingProduct.name}</div>
          <div class="product-price">$${formatCurrency(matchingProduct.priceCents)}</div>
          <div class="product-quantity">Quantity: 
            <button class="negative" data-product-id = "${matchingProduct.id}">-</button>
            <span class="quantity-count">${cartItem.quantity}</span>
            <button class="positive" data-product-id = "${matchingProduct.id}">+</button>
          </div>
          
          <div class="delivery-options-title">Choose a delivery option:</div>
          <div class="delivery-options">
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
          </div>

          <div class="item-actions">
            <div class="action-btn update-btn" data-product-id = "${matchingProduct.id}">Update</div>
            <div class="action-btn delete-btn" data-product-id = "${matchingProduct.id}">Delete</div>
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.show-order')
    .innerHTML = cartSummaryHTML;

  document.querySelectorAll('.negative')
    .forEach(elem => {
      elem.addEventListener('click', () => {
        const {productId} = elem.dataset;
        const matchingCart = getCart(productId)

        if(matchingCart.quantity === 1) {
          return;
        }

        matchingCart.quantity -= 1;

        renderOrderSummery();
      });
    });

  document.querySelectorAll('.positive')
    .forEach(elem => {
      elem.addEventListener('click', () => {
        const {productId} = elem.dataset;
        const matchingCart = getCart(productId)

        matchingCart.quantity += 1;

        renderOrderSummery();
      });
    });

  document.querySelectorAll('.update-btn')
    .forEach(elem => {
      elem.addEventListener('click', () => {
        saveToCart();
        
        renderPaymentSummery();
      });
    });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';
  
    deliveryOptions.forEach(deliveryOption => {
      const todaysDate = dayjs();
      const deliveryDate = todaysDate.add(
        deliveryOption.deliveryDays, 
        'days'
      );
      const displayDate = deliveryDate.format('dddd, MMMM D');
  
      const priceString = deliveryOption.priceCents === 0 ? 'Free' : `$${formatCurrency(deliveryOption.priceCents)}`;
  
      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
      
      html += `<div class="delivery-option" data-product-id ="${matchingProduct.id}"
                data-delivery-option-id = "${deliveryOption.id}">
                  <input ${isChecked ? 'checked' : ''}
                  type="radio" name="${matchingProduct.id}" class="delivery-radio">
                  <span class="delivery-details">
                    <span class="delivery-date">${displayDate}</span>
                    <span class="delivery-price">${priceString}</span>
                  </span>
              </div>`;
    });
  
    return html;
  }

  document.querySelectorAll('.delete-btn')
    .forEach(link => {
      link.addEventListener('click', () => {
        const {productId} = link.dataset;
        removeFromCart(productId);

        document.querySelector(`.card-container-${productId}`)
          .remove();

        renderPaymentSummery();
      });
    });

  document.querySelectorAll('.delivery-option')
  .forEach(element => {
    element.addEventListener('click', () => {
      const {productId, deliveryOptionId} = element.dataset
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummery();

      renderPaymentSummery();
    });
  });
}
renderOrderSummery();

function renderPaymentSummery() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach(cartItem => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product.priceCents * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;
  const saveTotal = {
    totalCents: totalCents
  }
  localStorage.setItem('total', JSON.stringify(saveTotal));

  const paymentSummeryHTML = `
    <section class="checkout-card">
      <h2 class="card-title">Order Summary</h2>
      
      <div class="summary-line">
        <span>Items Total</span>
        <span>$${formatCurrency(productPriceCents)}</span>
      </div>

      <div class="summary-line underline">
        <span>Delivery & Shipping</span>
        <span>$${formatCurrency(shippingPriceCents)}</span>
      </div>

      <div class="summary-line">
        <span>Subtotal (Items + Shipping)</span>
        <span>$${formatCurrency(totalBeforeTaxCents)}</span>
      </div>

      <div class="summary-line underline">
        <span>Estimated Tax (10%)</span>
        <span>$${formatCurrency(taxCents)}</span>
      </div>

      <div class="summary-line total-line">
        <span>Order Total</span>
        <span class="total-price">$${formatCurrency(totalCents)}</span>
      </div>

      <footer class="card-action">
        <button type="button" class="place-order-btn">
          <span>Buy All Now</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </footer>
    </section>
  `;

  document.querySelector('.payment-summery')
    .innerHTML = paymentSummeryHTML;

  document.querySelector('.place-order-btn')
    .addEventListener('click', () => {
      window.location.href= '/shoppingStuff/sendOrder.html';
    });
}
renderPaymentSummery();