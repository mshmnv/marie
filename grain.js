(function () {
  const canvas = document.createElement('canvas');

  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '9998',
    opacity:       '0.04',
    mixBlendMode:  'overlay',
  });

  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Render at half resolution for performance, CSS scales it up
  const SCALE = 0.5;

  function resize() {
    canvas.width  = Math.floor(window.innerWidth  * SCALE);
    canvas.height = Math.floor(window.innerHeight * SCALE);
  }

  window.addEventListener('resize', resize);
  resize();

  let frame = 0;

  function tick() {
    // Redraw every other frame (~30fps grain) for performance
    if (frame % 2 === 0) {
      const w = canvas.width;
      const h = canvas.height;
      const img = ctx.createImageData(w, h);
      const d = img.data;

      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }

      ctx.putImageData(img, 0, 0);
    }

    frame++;
    requestAnimationFrame(tick);
  }

  tick();
})();
