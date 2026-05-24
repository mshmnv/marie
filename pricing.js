fetch('data/pricing.json').then(r => r.json()).then(data => {
  const photoGrid = document.querySelector('[data-grid="photo"]');
  const videoGrid = document.querySelector('[data-grid="video"]');
  const addonSlot = document.querySelector('[data-addon-slot]');
  const disc = data.discount || 0;

  // ── price helpers ────────────────────────────────────────────────
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

  // ── photo card (existing schema) ─────────────────────────────────
  function photoCardHTML(card) {
    const items = card.features.map(f => `<li>${f}</li>`).join('');
    return `
      <div class="pricing-card">
        <div class="pricing-card-header">
          <span class="pricing-type">${card.type}</span>
          ${priceHTML(card)}
        </div>
        <ul class="pricing-list">${items}</ul>
      </div>`;
  }

  // ── video card (extended schema: eng + typeSub + forWhom) ────────
  function videoCardHTML(card) {
    const items = card.features.map(f => `<li>${f}</li>`).join('');
    // Long single-word titles get split for narrow 3-col cards
    const displayType = card.type === 'ВИДЕОПОРТРЕТ' ? 'ВИДЕО<br>ПОРТРЕТ' : card.type;
    const sub = card.typeSub ? `<span class="pricing-type-sub">${card.typeSub}</span>` : '';
    const eng = card.eng ? `<span class="pricing-type-eng">${card.eng}</span>` : '';
    const forWhom = card.forWhom
      ? `<p class="pricing-forwhom"><span class="pricing-forwhom-tag">идеально</span>${card.forWhom}</p>`
      : '';
    return `
      <div class="pricing-card">
        <div class="pricing-card-header">
          <span class="pricing-type">
            ${displayType}
            ${sub}
            ${eng}
          </span>
          ${priceHTML(card)}
        </div>
        ${forWhom}
        <ul class="pricing-list">${items}</ul>
      </div>`;
  }

  // ── render photo section ─────────────────────────────────────────
  (data.photo?.cards || []).forEach(c => {
    photoGrid.insertAdjacentHTML('beforeend', photoCardHTML(c));
  });

  if (data.photo?.addon) {
    const a = data.photo.addon;
    addonSlot.insertAdjacentHTML('beforeend', `
      <div class="pricing-addon">
        <span class="pricing-addon-label">${a.label}</span>
        <span class="pricing-addon-price">${a.priceRub}</span>
        <p class="pricing-addon-desc">${a.desc}</p>
      </div>`);
  }

  // ── render video section ─────────────────────────────────────────
  (data.video?.cards || []).forEach(c => {
    videoGrid.insertAdjacentHTML('beforeend', videoCardHTML(c));
  });

  // ── footer note ──────────────────────────────────────────────────
  if (data.note) {
    const note = document.createElement('p');
    note.className = 'pricing-note';
    note.textContent = data.note;
    document.querySelector('.pricing-cta').insertAdjacentElement('afterend', note);
  }
});
