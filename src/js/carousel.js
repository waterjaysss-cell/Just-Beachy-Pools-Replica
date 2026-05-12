/* carousel.js — reviews carousel:
   - auto-advance every 6s
   - chevron prev/next + dot navigation
   - touch swipe (>50px)
   - pause on hover
*/
(() => {
  'use strict';

  const track   = document.getElementById('reviewsTrack');
  const dotsBox = document.getElementById('reviewsDots');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  if (!track || !dotsBox) return;

  const cards = Array.from(track.children);
  const totalCards = cards.length;
  let perView = 3;
  let pages = 0;
  let current = 0;
  let timer = null;
  const AUTO_MS = 6000;

  const calcPerView = () => {
    const w = window.innerWidth;
    if (w < 768)  return 1;
    if (w < 1023) return 2;
    return 3;
  };

  const buildDots = () => {
    dotsBox.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Page ${i + 1}`);
      if (i === current) b.classList.add('active');
      b.addEventListener('click', () => { go(i); restart(); });
      dotsBox.appendChild(b);
    }
  };

  const update = () => {
    const viewport = track.parentElement;
    const w = viewport.clientWidth;
    track.style.transform = `translateX(${-current * w}px)`;
    Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const go   = (i) => { current = ((i % pages) + pages) % pages; update(); };
  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  const layout = () => {
    perView = calcPerView();
    pages = Math.max(1, Math.ceil(totalCards / perView));
    if (current >= pages) current = 0;
    cards.forEach((c) => { c.style.flex = `0 0 calc(${100 / perView}% - ${(perView - 1) * 18 / perView}px)`; });
    buildDots();
    update();
  };

  const start   = () => { stop(); timer = setInterval(next, AUTO_MS); };
  const stop    = () => { if (timer) { clearInterval(timer); timer = null; } };
  const restart = () => { stop(); start(); };

  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });

  let touchStartX = 0;
  let touchDelta  = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchDelta = 0; stop(); }, { passive: true });
  track.addEventListener('touchmove',  (e) => { touchDelta = e.touches[0].clientX - touchStartX; }, { passive: true });
  track.addEventListener('touchend',   () => {
    if (Math.abs(touchDelta) > 50) (touchDelta < 0 ? next : prev)();
    start();
  });

  let resizeId = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(layout, 120);
  });

  layout();
  start();
})();
