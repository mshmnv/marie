fetch('data/pricing.json').then(r => r.json()).then(data => {
  const grid = document.querySelector('.pricing-grid');

  function cardHTML(card) {
    const classes = ['pricing-card', card.cardClass].filter(Boolean).join(' ');
    const items = card.features.map(f => `<li>${f}</li>`).join('');
    return `
      <div class="${classes}">
        <div class="pricing-card-header">
          <span class="pricing-type">${card.type}</span>
          <span class="pricing-price">${card.priceRub}<span class="pricing-price-usd">${card.priceUsd}</span></span>
        </div>
        <ul class="pricing-list">${items}</ul>
      </div>`;
  }

  function addonHTML(a) {
    const descLines = a.desc.split('\n').join('<br>');
    return `
      <div class="pricing-addon">
        <span class="pricing-addon-label">${a.label}</span>
        <span class="pricing-addon-price">${a.priceRub}<span class="pricing-price-usd">${a.priceUsd}</span></span>
        <p class="pricing-addon-desc">${descLines}</p>
      </div>`;
  }

  // Grid order: photo cards → addon → video card
  const photoCards = data.cards.filter(c => !c.cardClass);
  const videoCard  = data.cards.find(c => c.cardClass === 'pricing-card-video');

  photoCards.forEach(c => grid.insertAdjacentHTML('beforeend', cardHTML(c)));
  grid.insertAdjacentHTML('beforeend', addonHTML(data.addon));
  if (videoCard) grid.insertAdjacentHTML('beforeend', cardHTML(videoCard));
});
