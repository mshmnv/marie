fetch('data/pricing.json').then(r => r.json()).then(data => {
  const photoGrid = document.querySelector('[data-grid="photo"]');
  const faqSlot = document.querySelector('[data-faq]');
  const disc = data.discount || 0;
  let language = window.SiteI18n ? SiteI18n.getLanguage() : 'ru';

  if (window.SiteI18n) SiteI18n.onChange(nextLanguage => {
    language = nextLanguage;
    render();
  });

  // ── price helpers ────────────────────────────────────────────────
  function discountedPrice(rubStr) {
    const num = parseInt(rubStr.replace(/\D/g, ''));
    const sale = Math.round(num * (1 - disc) / 100) * 100;
    return rubStr.replace(/[\d\s ]*\d/, sale.toLocaleString('ru-RU'));
  }

  function translated(card) {
    return language === 'ru' ? card : (card.translations?.[language] || card);
  }

  function priceHTML(card) {
    const text = translated(card);
    const price = language === 'ru' ? card.priceRub : (text.priceEur || card.priceEur || card.priceRub);
    const unitValue = text.priceUnit ?? card.priceUnit;
    const unit = unitValue ? `<span class="pricing-price-unit">${unitValue}</span>` : '';
    if (!disc || language !== 'ru') return `<span class="pricing-price">${price}${unit}</span>`;
    return `
      <span class="pricing-price">
        <span class="price-old">${price}</span>
        <span class="price-sale">${discountedPrice(price)}${unit}</span>
      </span>`;
  }

  // ── photo card ───────────────────────────────────────────────────
  function photoCardHTML(card) {
    const text = translated(card);
    const items = text.features.map(f => `<li>${f}</li>`).join('');
    const media = card.photo
      ? `<div class="pricing-card-media">
           <img src="${card.photo}" alt="${text.type}" loading="lazy">
         </div>`
      : '';
    return `
      <div class="pricing-card">
        <div class="pricing-card-inner">
          ${media}
          <div class="pricing-card-body">
            <div class="pricing-card-header">
              <span class="pricing-type">${text.type}</span>
              ${priceHTML(card)}
            </div>
            <ul class="pricing-list">${items}</ul>
          </div>
        </div>
      </div>`;
  }

  function render() {
    photoGrid.innerHTML = '';
    faqSlot.innerHTML = '';
    document.querySelectorAll('[data-i18n="pricing.photoEng"]').forEach(el => {
      el.textContent = window.SiteI18n?.getPack()?.pricing?.photoEng || 'photo';
    });
    (data.photo?.cards || []).forEach(c => photoGrid.insertAdjacentHTML('beforeend', photoCardHTML(c)));
    (data.faq || []).forEach(item => {
      const text = translated(item);
      faqSlot.insertAdjacentHTML('beforeend', `
        <details class="faq-item">
          <summary class="faq-q">${text.q}</summary>
          <p class="faq-a">${text.a}</p>
        </details>`);
    });
    let note = document.querySelector('.pricing-note');
    const noteText = language === 'ru' ? data.note : (data.translations?.[language]?.note || data.note);
    if (noteText) {
      if (!note) {
        note = document.createElement('p');
        note.className = 'pricing-note';
        document.querySelector('.pricing-cta').insertAdjacentElement('afterend', note);
      }
      note.textContent = noteText;
    }
    if (window.bindPricingCursorHover) window.bindPricingCursorHover();
  }

  render();
});
