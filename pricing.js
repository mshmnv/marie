fetch('data/pricing.json').then(r => r.json()).then(data => {
  const grid = document.querySelector('.pricing-grid');
  const disc = data.discount || 0;

  function discountedPrice(rubStr) {
    const num = parseInt(rubStr.replace(/\D/g, ''));
    const sale = Math.round(num * (1 - disc) / 100) * 100;
    return sale.toLocaleString('ru-RU') + ' ₽';
  }

  function priceHTML(card) {
    if (!disc) return `<span class="pricing-price">${card.priceRub}</span>`;
    return `
      <span class="pricing-price">
        <span class="price-old">${card.priceRub}</span>
        <span class="price-sale">${discountedPrice(card.priceRub)}</span>
      </span>`;
  }

  function cardHTML(card) {
    const items = card.features.map(f => `<li>${f}</li>`).join('');
    const displayType = card.type === 'ВИДЕОПОРТРЕТ' ? 'ВИДЕО<br>ПОРТРЕТ' : card.type;
    return `
      <div class="pricing-card">
        <div class="pricing-card-header">
          <span class="pricing-type">${displayType}</span>
          ${priceHTML(card)}
        </div>
        <ul class="pricing-list">${items}</ul>
      </div>`;
  }

  const photoCards = data.cards.filter(c => c.type !== 'ВИДЕОПОРТРЕТ');
  const videoCard  = data.cards.find(c => c.type === 'ВИДЕОПОРТРЕТ');

  photoCards.forEach(c => grid.insertAdjacentHTML('beforeend', cardHTML(c)));

  if (data.addon) {
    const a = data.addon;
    const addonHTML = `
      <div class="pricing-addon">
        <span class="pricing-addon-label">${a.label}</span>
        <span class="pricing-addon-price">${a.priceRub} <span class="pricing-price-usd">${a.priceUsd}</span></span>
        <p class="pricing-addon-desc">${a.desc}</p>
      </div>`;
    grid.insertAdjacentHTML('afterend', addonHTML);
  }

  if (videoCard) {
    const addon = document.querySelector('.pricing-addon');
    const wrapper = document.createElement('div');
    wrapper.className = 'pricing-card-standalone';
    wrapper.innerHTML = cardHTML(videoCard);
    addon.insertAdjacentElement('afterend', wrapper);
  }

  if (data.note) {
    const note = document.createElement('p');
    note.className = 'pricing-note';
    note.textContent = data.note;
    document.querySelector('.pricing-cta').insertAdjacentElement('afterend', note);
  }
});
