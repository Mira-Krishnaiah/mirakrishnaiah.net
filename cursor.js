/* ═══════════════════════════════════════════════════════════
   cursor.js — Custom dual cursor: dot + lagging ring
   ═══════════════════════════════════════════════════════════ */

(function () {
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');

  if (!dot || !ring) return;

  // Current exact mouse position
  let mx = 0, my = 0;
  // Lerped ring position
  let rx = 0, ry = 0;

  const LERP = 0.14;

  // Track mouse
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Hover detection via event delegation
  const HOVER_SELECTOR = 'a, button, input, [role="button"], .desk-item, .corkboard-note, .margin-note';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(HOVER_SELECTOR)) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(HOVER_SELECTOR)) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });

  // Animation loop for ring lerp
  function loop() {
    rx += (mx - rx) * LERP;
    ry += (my - ry) * LERP;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }

  // Seed ring at center so it doesn't fly in from (0,0)
  rx = window.innerWidth / 2;
  ry = window.innerHeight / 2;

  requestAnimationFrame(loop);
})();
