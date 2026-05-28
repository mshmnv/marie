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

// ── Photos загружаются из photos.json ──────
let photos = [];

// ── Build gallery ─────────────────────────────────────────────
const grid = document.getElementById('gallery');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      const video = e.target.querySelector('video[data-src]');
      if (video) {
        video.src = video.dataset.src;
        video.removeAttribute('data-src');
        video.play().catch(() => {});
      }
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

function buildGallery(photos) {
// Строка для main-фото (видео + первое фото в ряд)
const mainRow = document.createElement('div');
mainRow.className = 'gallery-main-row';
grid.appendChild(mainRow);

photos.forEach((photo, i) => {
  // Photo/video card
  const card = document.createElement('div');
  card.className = 'photo-card';

  const inner = document.createElement('div');
  inner.className = 'photo-inner';

  if (photo.type === 'video') {
    const video = document.createElement('video');
    video.dataset.src = photo.src;
    video.muted = true;
    video.loop = true;
    video.preload = 'none';
    video.setAttribute('playsinline', '');
    inner.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = 'photos/' + photo.src;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => card.style.display = 'none');
    inner.appendChild(img);
  }

  card.appendChild(inner);

  // Big photo?
  const isBig = !!photo.big;
  if (isBig) card.classList.add('big');

  // Random rotation + nudge (big photos — меньше наклон)
  const rot   = (Math.random() * (isBig ? 4 : 10) - (isBig ? 2 : 5)).toFixed(2);
  const nudge = (Math.random() * (isBig ? 8 : 18) - (isBig ? 4 : 9)).toFixed(1);
  const scale = 1;

  const applyTransform = () => { card.style.transform = `scale(${scale}) rotate(${rot}deg) translateX(${nudge}px)`; };
  const straighten     = () => { card.style.transform = `scale(${scale})`; };

  applyTransform();
  card.dataset.rot   = rot;
  card.dataset.nudge = nudge;

  card.addEventListener('mouseenter', straighten);
  card.addEventListener('mouseleave', applyTransform);
  card.addEventListener('click', () => openLightbox(i));

  observer.observe(card);
  if (photo.main) {
    mainRow.appendChild(card);
  } else {
    grid.appendChild(card);
  }
});
} // end buildGallery

fetch('data/photos.json')
  .then(r => r.json())
  .then(list => {
    photos = [...list.filter(p => p.main), ...list.filter(p => !p.main)];
    buildGallery(photos);
  });

// ── Lightbox ──────────────────────────────────────────────────
const lb       = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbVideo  = document.getElementById('lb-video');
const lbClose  = document.getElementById('lb-close');
const lbPrev   = document.getElementById('lb-prev');
const lbNext   = document.getElementById('lb-next');

let currentIndex = 0;

function updateLightbox(index) {
  const item = photos[index];
  if (item.type === 'video') {
    lbImg.style.display = 'none';
    lbVideo.style.display = 'block';
    lbVideo.src = `https://player.vimeo.com/video/${item.videoId}?autoplay=1&color=ffffff&title=0&byline=0&portrait=0`;
  } else {
    lbImg.style.display = 'block';
    lbVideo.style.display = 'none';
    lbVideo.src = '';
    lbImg.src = 'photos/' + item.src;
  }
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox(index);
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
  lbVideo.src = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  updateLightbox(currentIndex);
}

function showNext() {
  currentIndex = (currentIndex + 1) % photos.length;
  updateLightbox(currentIndex);
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

// Touch swipe for lightbox
let touchStartX = 0;
lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { if (diff > 0) showNext(); else showPrev(); }
});