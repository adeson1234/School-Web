import './check-menu.js';

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amount');
  const fromSelect = document.getElementById('from-currency');
  const toSelect = document.getElementById('to-currency');
  const resultDisplay = document.getElementById('converted-result');
  const convertBtn = document.getElementById('convert-btn');
  const symbolSpan = document.querySelector('.currency-symbol');

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    IQD: 'د.ع'
  };

  fromSelect.addEventListener('change', () => {
    symbolSpan.textContent = currencySymbols[fromSelect.value];
  });

  async function convertCurrency() {
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < 0) {
      resultDisplay.textContent = 'Enter a valid amount';
      return;
    }

    const from = fromSelect.value;
    const to = toSelect.value;

    if (from === to) {
      resultDisplay.textContent = `${amount} ${currencySymbols[to]}`;
      return;
    }

    resultDisplay.textContent = 'Fetching live price...';

    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await response.json();

      if (data && data.rates && data.rates[to]) {
        const rate = data.rates[to];
        const convertedAmount = amount * rate;

        const formattedResult = to === 'IQD'
          ? Math.round(convertedAmount).toLocaleString()
          : convertedAmount.toFixed(2);

        resultDisplay.textContent = `${formattedResult} ${currencySymbols[to]}`;
      } else {
        resultDisplay.textContent = 'Error getting rate';
      }
    } catch (error) {
      console.error('Internet error:', error);
      resultDisplay.textContent = 'No internet connection';
    }
  }

  convertBtn.addEventListener('click', convertCurrency);

  amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      convertCurrency();
    }
  });
});