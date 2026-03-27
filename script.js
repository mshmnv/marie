// ── Film edge SVG filters ─────────────────────────────────────
(function () {
  const ns  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');
  svg.setAttribute('aria-hidden', 'true');

  const defs = document.createElementNS(ns, 'defs');

  for (let i = 0; i < 16; i++) {
    const filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', `fe-${i}`);
    filter.setAttribute('x', '-5%');
    filter.setAttribute('y', '-5%');
    filter.setAttribute('width', '110%');
    filter.setAttribute('height', '110%');

    const turb = document.createElementNS(ns, 'feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('baseFrequency', '0.03 0.035');
    turb.setAttribute('numOctaves', '4');
    turb.setAttribute('seed', String(i * 13 + 7));
    turb.setAttribute('result', 'noise');

    const disp = document.createElementNS(ns, 'feDisplacementMap');
    disp.setAttribute('in', 'SourceGraphic');
    disp.setAttribute('in2', 'noise');
    disp.setAttribute('scale', '9');
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'G');

    filter.appendChild(turb);
    filter.appendChild(disp);
    defs.appendChild(filter);
  }

  svg.appendChild(defs);
  document.body.insertBefore(svg, document.body.firstChild);
})();

// ── Photos загружаются из photos.json (обнови запуском: node scan.js) ──────
let photos = [];

const stampedPhotos = new Set(); // кресты убраны

// ── Torn paper images ─────────────────────────────────────────
const tornStrips = ['icons/torn-h1.jpg', 'icons/torn-h2.jpg'];
const tornNote   = 'icons/torn-note.jpg';

// ── Build gallery ─────────────────────────────────────────────
const grid = document.getElementById('gallery');

function buildGallery(photos, scatter) {
  const scatterMap = {};
  scatter.forEach(s => {
    if (!scatterMap[s.after]) scatterMap[s.after] = [];
    scatterMap[s.after].push(s);
  });

// Элементы перед первым фото (after: -1)
(scatterMap[-1] || []).forEach(s => {
  const el = document.createElement('div');
  renderScatter(s, el);
  grid.appendChild(el);
});

photos.forEach((src, i) => {
  // Photo card
  const card = document.createElement('div');
  card.className = 'photo-card';

  const inner = document.createElement('div');
  inner.className = 'photo-inner';

  const img = document.createElement('img');
  img.src = 'photos/' + src;
  img.alt = '';
  img.loading = 'lazy';
  img.addEventListener('error', () => card.style.display = 'none');
  inner.appendChild(img);

  // Red × stamp on selected photos
  if (stampedPhotos.has(i)) {
    const x = document.createElement('div');
    x.className = 'photo-x';
    if (i % 2 === 0) {
      x.style.top = 'auto'; x.style.bottom = '5%';
      x.style.left = 'auto'; x.style.right = '4%';
    }
    const xImg = document.createElement('img');
    xImg.src = 'icons/cross.png';
    xImg.alt = '';
    x.appendChild(xImg);
    inner.appendChild(x);
  }

  card.appendChild(inner);

  // Big photo?
  const isBig = src.includes('_big');
  if (isBig) card.classList.add('big');

  // Random rotation + nudge (big photos — меньше наклон)
  const rot   = (Math.random() * (isBig ? 4 : 10) - (isBig ? 2 : 5)).toFixed(2);
  const nudge = (Math.random() * (isBig ? 8 : 18) - (isBig ? 4 : 9)).toFixed(1);
  const scale = isBig ? 1.18 : 1;

  const applyTransform = () => { card.style.transform = `scale(${scale}) rotate(${rot}deg) translateX(${nudge}px)`; };
  const straighten     = () => { card.style.transform = `scale(${scale})`; };

  applyTransform();
  card.dataset.rot   = rot;
  card.dataset.nudge = nudge;

  card.addEventListener('mouseenter', straighten);
  card.addEventListener('mouseleave', applyTransform);
  card.addEventListener('click', () => openLightbox(i));

  grid.appendChild(card);

  // Scatter items after this photo
  (scatterMap[i] || []).forEach(s => {
    const el = document.createElement('div');
    renderScatter(s, el);
    grid.appendChild(el);
  });
});
} // end buildGallery

function renderScatter(s, el) {
    const tilt = (Math.random() * 10 - 5).toFixed(1);

    switch (s.type) {
      case 'word': {
        el.className = ['st-word', s.mod || ''].join(' ').trim();
        el.textContent = s.text;
        let blur;
        if (s.blur !== undefined) {
          blur = s.blur;
        } else {
          const r = Math.random();
          blur = r < 0.6
            ? (Math.random() * 1.5).toFixed(1)
            : r < 0.9
            ? (2 + Math.random() * 4).toFixed(1)
            : (7 + Math.random() * 6).toFixed(1);
        }
        if (parseFloat(blur) > 0.3) el.style.filter = `blur(${blur}px)`;
        break;
      }

      case 'phrase':
        el.className = ['st-phrase', s.mod || ''].join(' ').trim();
        el.textContent = '— ' + s.text;
        el.style.transform = `rotate(${tilt}deg)`;
        break;

      case 'illegible':
        el.className = 'st-illegible';
        el.textContent = s.text;
        el.style.transform = `rotate(${s.rot ?? -38}deg)`;
        // Extra randomness to feel handwritten
        el.style.marginLeft = (Math.random() * 30) + 'px';
        break;

      case 'hand':
        el.className = 'st-hand';
        el.textContent = s.text;
        el.style.transform = `rotate(${tilt}deg)`;
        break;

      case 'label':
        el.className = 'st-label';
        el.textContent = s.text;
        break;

      case 'quote':
        el.className = 'st-quote';
        el.textContent = s.text;
        break;

      case 'x': {
        el.className = 'st-x';
        el.style.transform = `rotate(${tilt}deg)`;
        const xImg = document.createElement('img');
        xImg.src = 'icons/cross.png';
        xImg.alt = '';
        el.appendChild(xImg);
        break;
      }

      case 'rule':
        el.className = 'st-rule';
        break;

      case 'blur-word':
        el.className = ['st-blur', s.mod || ''].join(' ').trim();
        el.textContent = s.text;
        break;

      case 'shot-img': {
        el.className = 'st-shot';
        el.style.transform = `rotate(${tilt}deg)`;
        const shotImg = document.createElement('img');
        shotImg.src = 'icons/shot.png';
        shotImg.alt = 'Shot';
        el.appendChild(shotImg);
        break;
      }

      case 'circled': {
        el.className = 'st-circled';
        el.style.transform = `rotate(${tilt}deg)`;
        const span = document.createElement('span');
        span.className = ['st-circled-text', s.mod || ''].join(' ').trim();
        span.textContent = s.text;
        const circleImg = document.createElement('img');
        circleImg.src = 'icons/cirle.png';
        circleImg.alt = '';
        circleImg.className = 'st-circle-img';
        el.appendChild(span);
        el.appendChild(circleImg);
        break;
      }

      case 'paper-break': {
        el.className = 'paper-break';
        const img = document.createElement('img');
        img.src = tornStrips[s.img ?? 0];
        img.alt = '';
        el.appendChild(img);
        if (s.text) {
          const label = document.createElement('span');
          label.className = 'paper-break-text';
          label.textContent = s.text;
          el.appendChild(label);
        }
        break;
      }

      case 'paper-note': {
        el.className = 'paper-note';
        el.style.transform = `rotate(${tilt}deg)`;
        const img = document.createElement('img');
        img.src = tornNote;
        img.alt = '';
        el.appendChild(img);
        if (s.text) {
          const txt = document.createElement('span');
          txt.className = 'paper-note-text';
          txt.textContent = s.text;
          el.appendChild(txt);
        }
        break;
      }
    }
} // end renderScatter

Promise.all([
  fetch('photos.json').then(r => r.json()),
  fetch('scatter.json').then(r => r.json()),
]).then(([list, scatter]) => {
  photos = list;
  buildGallery(photos, scatter);
});

// ── Lightbox ──────────────────────────────────────────────────
const lb      = document.getElementById('lightbox');
const lbImg   = document.getElementById('lb-img');
const lbClose = document.getElementById('lb-close');
const lbPrev  = document.getElementById('lb-prev');
const lbNext  = document.getElementById('lb-next');

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  lbImg.src = 'photos/' + photos[index];
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  lbImg.src = 'photos/' + photos[currentIndex];
}

function showNext() {
  currentIndex = (currentIndex + 1) % photos.length;
  lbImg.src = 'photos/' + photos[currentIndex];
}

lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
lbPrev.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
lbNext.addEventListener('click', e => { e.stopPropagation(); showNext(); });

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrev();
  if (e.key === 'ArrowRight') showNext();
});