fetch('data/pricing.json').then(r => r.json()).then(data => {
  const photoGrid = document.querySelector('[data-grid="photo"]');
  const faqSlot = document.querySelector('[data-faq]');
  const disc = data.discount || 0;

  // ── price helpers ────────────────────────────────────────────────
  function discountedPrice(rubStr) {
    const num = parseInt(rubStr.replace(/\D/g, ''));
    const sale = Math.round(num * (1 - disc) / 100) * 100;
    return rubStr.replace(/[\d\s ]*\d/, sale.toLocaleString('ru-RU'));
  }

  function priceHTML(card) {
    const unit = card.priceUnit ? `<span class="pricing-price-unit">${card.priceUnit}</span>` : '';
    if (!disc) return `<span class="pricing-price">${card.priceRub}${unit}</span>`;
    return `
      <span class="pricing-price">
        <span class="price-old">${card.priceRub}</span>
        <span class="price-sale">${discountedPrice(card.priceRub)}${unit}</span>
      </span>`;
  }

  // ── photo card ───────────────────────────────────────────────────
  function photoCardHTML(card) {
    const items = card.features.map(f => `<li>${f}</li>`).join('');
    const media = card.photo
      ? `<div class="pricing-card-media">
           <img src="${card.photo}" alt="${card.type}" loading="lazy">
         </div>`
      : '';
    return `
      <div class="pricing-card">
        <div class="pricing-card-inner">
          ${media}
          <div class="pricing-card-body">
            <div class="pricing-card-header">
              <span class="pricing-type">${card.type}</span>
              ${priceHTML(card)}
            </div>
            <ul class="pricing-list">${items}</ul>
          </div>
        </div>
      </div>`;
  }

  // ── render photo section ─────────────────────────────────────────
  (data.photo?.cards || []).forEach(c => {
    photoGrid.insertAdjacentHTML('beforeend', photoCardHTML(c));
  });

  // ── render FAQ ───────────────────────────────────────────────────
  (data.faq || []).forEach(item => {
    faqSlot.insertAdjacentHTML('beforeend', `
      <details class="faq-item">
        <summary class="faq-q">${item.q}</summary>
        <p class="faq-a">${item.a}</p>
      </details>`);
  });

  // ── footer note ──────────────────────────────────────────────────
  if (data.note) {
    const note = document.createElement('p');
    note.className = 'pricing-note';
    note.textContent = data.note;
    document.querySelector('.pricing-cta').insertAdjacentElement('afterend', note);
  }
});
